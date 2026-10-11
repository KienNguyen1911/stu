import type { AccountCoordinator } from "./accountCoordinator.js";
import type { FlowDatabase } from "../infrastructure/db/database.js";
import type { FlowAdapterPort } from "../infrastructure/flow/flowAdapterPort.js";
import { calculateRequestHash } from "../domain/invariants.js";

export interface SubmitJobParams {
  projectId: string;
  idempotencyKey: string;
  prompt: string;
  model?: string;
  options?: Record<string, any>;
  inputAssetIds?: string[];
  pinnedBindingId?: string;
}

export class JobRunner {
  constructor(
    private readonly db: FlowDatabase,
    private readonly coordinator: AccountCoordinator,
    private readonly adapter: FlowAdapterPort,
  ) {}

  /**
   * Submits a new job intent with ACID transaction.
   * If an existing job with same idempotencyKey exists, returns it (idempotency).
   */
  public submitJob(params: SubmitJobParams): {
    jobId: string;
    created: boolean;
  } {
    const {
      projectId,
      idempotencyKey,
      prompt,
      model = "imagen-3",
      options = {},
      inputAssetIds = [],
      pinnedBindingId = null,
    } = params;

    const optionsJson = JSON.stringify(options);
    const requestHash = calculateRequestHash(
      prompt,
      model,
      optionsJson,
      inputAssetIds,
    );
    const now = new Date().toISOString();

    return this.db.transaction(() => {
      // Check existing idempotency
      const existing = this.db.db
        .prepare("SELECT id, request_hash FROM jobs WHERE idempotency_key = ?")
        .get(idempotencyKey) as
        | { id: string; request_hash: string }
        | undefined;

      if (existing) {
        if (existing.request_hash !== requestHash) {
          throw new Error(
            `Idempotency conflict: key '${idempotencyKey}' exists with a different request payload.`,
          );
        }
        return { jobId: existing.id, created: false };
      }

      const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      // Insert Job intent
      this.db.db
        .prepare(
          `INSERT INTO jobs (id, project_id, idempotency_key, request_hash, prompt, model, options_json, pinned_binding_id, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'queued', ?, ?)`,
        )
        .run(
          jobId,
          projectId,
          idempotencyKey,
          requestHash,
          prompt,
          model,
          optionsJson,
          pinnedBindingId,
          now,
          now,
        );

      // Insert ordered inputs
      for (let i = 0; i < inputAssetIds.length; i++) {
        this.db.db
          .prepare(
            "INSERT INTO job_inputs (job_id, position, asset_id) VALUES (?, ?, ?)",
          )
          .run(jobId, i, inputAssetIds[i]!);
      }

      return { jobId, created: true };
    });
  }

  /**
   * Executes a job through its assigned account binding.
   */
  public async executeJob(
    jobId: string,
    targetBinding?: {
      id: string;
      accountId: string;
      remoteProjectId: string;
      profilePath: string;
      sessionEpoch: number;
    },
  ): Promise<void> {
    const job = this.db.db
      .prepare("SELECT * FROM jobs WHERE id = ?")
      .get(jobId) as any;

    if (!job) {
      throw new Error(`Job not found: ${jobId}`);
    }

    let binding = targetBinding;
    if (!binding) {
      const row = this.db.db
        .prepare(
          `SELECT b.*, a.profile_path, a.session_epoch 
           FROM project_bindings b
           JOIN accounts a ON b.account_id = a.id
           WHERE b.project_id = ? AND b.archived_at IS NULL AND a.enabled = 1
           LIMIT 1`,
        )
        .get(job.project_id) as any;

      if (!row || !row.remote_project_id) {
        throw new Error(
          `No verified project binding found for project '${job.project_id}'. Please set up a binding first.`,
        );
      }

      binding = {
        id: row.id,
        accountId: row.account_id,
        remoteProjectId: row.remote_project_id,
        profilePath: row.profile_path,
        sessionEpoch: row.session_epoch,
      };
    }

    // Acquire exclusive lease for the account
    const lease = await this.coordinator.acquire(
      binding.accountId,
      `job-execute-${jobId}`,
    );

    const attemptId = `att-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    try {
      // 1. Create Attempt record and prepare inputs
      const inputs = this.db.db
        .prepare(
          `SELECT ji.position, ji.asset_id, a.content_hash, a.blob_key
           FROM job_inputs ji
           JOIN assets a ON ji.asset_id = a.id
           WHERE ji.job_id = ?
           ORDER BY ji.position ASC`,
        )
        .all(jobId) as Array<{
        position: number;
        asset_id: string;
        content_hash: string;
        blob_key: string;
      }>;

      const uploadAttempts: Array<{
        id: string;
        position: number;
        filePath: string;
      }> = [];
      const inputPaths: string[] = [];

      this.db.transaction(() => {
        this.db.db
          .prepare(
            `INSERT INTO job_attempts (id, job_id, attempt_number, binding_id, session_epoch, phase, created_at, updated_at)
             VALUES (?, ?, 1, ?, ?, 'preparing_inputs', ?, ?)`,
          )
          .run(attemptId, jobId, binding.id, binding.sessionEpoch, now, now);

        this.db.db
          .prepare(
            "UPDATE jobs SET status = 'running', updated_at = ? WHERE id = ?",
          )
          .run(now, jobId);

        for (const inp of inputs) {
          const filePath = this.adapter.blobStore.getBlobPath(inp.content_hash);
          inputPaths.push(filePath);
          const uplId = `upl-${Date.now()}-${inp.position}`;
          uploadAttempts.push({ id: uplId, position: inp.position, filePath });

          this.db.db
            .prepare(
              `INSERT INTO upload_attempts (id, asset_id, binding_id, session_epoch, filename_sent, operation_state, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)`,
            )
            .run(
              uplId,
              inp.asset_id,
              binding.id,
              binding.sessionEpoch,
              `input-${inp.position}.png`,
              now,
              now,
            );
        }
      });

      // 2. Record submit intent before remote call (SPEC.md safety invariant)
      const submitIntentAt = new Date().toISOString();
      this.db.transaction(() => {
        this.db.db
          .prepare(
            `UPDATE job_attempts 
             SET phase = 'submitting_intent', submit_intent_at = ?, updated_at = ?
             WHERE id = ?`,
          )
          .run(submitIntentAt, submitIntentAt, attemptId);
      });

      // 3. Dispatch to Flow
      const outputs = await this.adapter.executeGeneration({
        accountId: binding.accountId,
        profilePath: binding.profilePath,
        remoteProjectId: binding.remoteProjectId,
        prompt: job.prompt,
        model: job.model,
        options: JSON.parse(job.options_json),
        referenceImagePaths: inputPaths,
      });

      // 4. Record outputs, link attempt inputs, and mark attempt succeeded
      const completedAt = new Date().toISOString();
      this.db.transaction(() => {
        for (const upl of uploadAttempts) {
          this.db.db
            .prepare(
              `UPDATE upload_attempts
               SET operation_state = 'verified', updated_at = ?
               WHERE id = ?`,
            )
            .run(completedAt, upl.id);

          this.db.db
            .prepare(
              `INSERT INTO attempt_inputs (attempt_id, position, upload_attempt_id, attached_at)
               VALUES (?, ?, ?, ?)`,
            )
            .run(attemptId, upl.position, upl.id, completedAt);
        }

        for (let pos = 0; pos < outputs.length; pos++) {
          const out = outputs[pos]!;
          const outId = `out-${Date.now()}-${pos}`;
          this.db.db
            .prepare(
              `INSERT INTO job_outputs (id, attempt_id, position, remote_url, local_asset_id, download_status, created_at)
               VALUES (?, ?, ?, ?, ?, 'downloaded', ?)`,
            )
            .run(
              outId,
              attemptId,
              pos,
              out.remoteUrl,
              out.localAssetId,
              completedAt,
            );
        }

        this.db.db
          .prepare(
            `UPDATE job_attempts 
             SET phase = 'completed', outcome = 'succeeded', updated_at = ?
             WHERE id = ?`,
          )
          .run(completedAt, attemptId);

        this.db.db
          .prepare(
            "UPDATE jobs SET status = 'succeeded', updated_at = ? WHERE id = ?",
          )
          .run(completedAt, jobId);
      });
    } catch (err: any) {
      const failedAt = new Date().toISOString();
      this.db.transaction(() => {
        this.db.db
          .prepare(
            `UPDATE job_attempts 
             SET phase = 'failed', outcome = 'failed', error_message = ?, updated_at = ?
             WHERE id = ?`,
          )
          .run(err.message, failedAt, attemptId);

        this.db.db
          .prepare(
            "UPDATE jobs SET status = 'failed', updated_at = ? WHERE id = ?",
          )
          .run(failedAt, jobId);
      });
      throw err;
    } finally {
      lease.release();
    }
  }
}
