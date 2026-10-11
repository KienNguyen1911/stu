import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { resolveConfig, type FlowResolvedConfig } from "./config.js";
import { FlowDatabase } from "./infrastructure/db/database.js";
import { BlobStore } from "./infrastructure/blobs/blobStore.js";
import { FlowAdapter } from "./infrastructure/flow/flowAdapter.js";
import type { FlowAdapterPort } from "./infrastructure/flow/flowAdapterPort.js";
import { AccountCoordinator } from "./application/accountCoordinator.js";
import { AccountManager } from "./application/accountManager.js";
import { JobRunner, type SubmitJobParams } from "./application/jobRunner.js";
import { JobQueue } from "./application/jobQueue.js";
import { ApiServer, type ApiServerOptions } from "./server/apiServer.js";
import { ManualLoginHelper } from "./application/manualLogin.js";

export interface FlowStudioOptions {
  dataRoot?: string;
  dbPath?: string;
  chromePath?: string;
  headless?: boolean;
  pollIntervalMs?: number;
  db?: FlowDatabase;
  blobStore?: BlobStore;
  adapter?: FlowAdapterPort;
  coordinator?: AccountCoordinator;
  accountManager?: AccountManager;
  runner?: JobRunner;
  queue?: JobQueue;
  loginHelper?: ManualLoginHelper;
}

export interface GenerateImageOptions {
  prompt: string;
  projectId?: string;
  model?: string;
  options?: Record<string, any>;
  referenceImages?: string[];
  accountId?: string;
  headless?: boolean;
}

export interface GeneratedAssetOutput {
  position: number;
  remoteUrl: string;
  contentHash: string;
  localAssetId: string;
  blobPath: string;
  sizeBytes: number;
}

export interface GenerateImageResult {
  jobId: string;
  status: "succeeded" | "failed";
  outputs: GeneratedAssetOutput[];
}

export interface LinkProjectParams {
  accountId: string;
  remoteProjectId: string;
  projectId?: string;
  projectName?: string;
}

/**
 * FlowStudio: Deep application module encapsulating Google Flow automation.
 * Presents a cohesive, high-leverage interface over database persistence,
 * content-addressable blob storage, account coordination, browser adapters,
 * job scheduling, and REST API serving.
 */
export class FlowStudio {
  public readonly config: FlowResolvedConfig;
  public readonly db: FlowDatabase;
  public readonly blobStore: BlobStore;
  public readonly coordinator: AccountCoordinator;
  public readonly accountManager: AccountManager;
  public readonly adapter: FlowAdapterPort;
  public readonly runner: JobRunner;
  public readonly queue: JobQueue;
  public readonly loginHelper: ManualLoginHelper;

  private server: ApiServer | null = null;
  private isClosed = false;

  constructor(options: FlowStudioOptions = {}) {
    this.config = resolveConfig({
      dataRoot: options.dataRoot,
      dbPath: options.dbPath,
      chromePath: options.chromePath,
    });

    // Ensure data directories exist
    if (!existsSync(this.config.dataRoot)) {
      mkdirSync(this.config.dataRoot, { recursive: true });
    }
    if (!existsSync(this.config.blobsDir)) {
      mkdirSync(this.config.blobsDir, { recursive: true });
    }
    if (!existsSync(this.config.profilesDir)) {
      mkdirSync(this.config.profilesDir, { recursive: true });
    }
    if (!existsSync(this.config.tempDir)) {
      mkdirSync(this.config.tempDir, { recursive: true });
    }

    // Initialize or accept dependencies
    this.db = options.db ?? new FlowDatabase(this.config.dbPath);
    this.db.initSchema();

    this.blobStore = options.blobStore ?? new BlobStore(this.config.dataRoot);
    this.coordinator = options.coordinator ?? new AccountCoordinator();
    this.accountManager =
      options.accountManager ??
      new AccountManager(this.db, this.coordinator);

    this.adapter =
      options.adapter ??
      new FlowAdapter(this.blobStore, this.db, this.config.chromePath);

    this.runner =
      options.runner ??
      new JobRunner(this.db, this.coordinator, this.adapter);

    this.queue =
      options.queue ??
      new JobQueue(
        this.db,
        this.runner,
        this.accountManager,
        this.coordinator,
        {
          pollIntervalMs: options.pollIntervalMs ?? 2000,
        },
      );

    this.loginHelper =
      options.loginHelper ??
      new ManualLoginHelper(this.config.chromePath);
  }

  /**
   * Submits a job intent idempotently.
   */
  public submitJob(params: SubmitJobParams): {
    jobId: string;
    created: boolean;
  } {
    this.ensureNotClosed();
    return this.runner.submitJob(params);
  }

  /**
   * High-level generation workflow:
   * Ingests reference images, submits the job, coordinates browser execution,
   * and returns generated assets with local blob paths.
   */
  public async generate(
    params: GenerateImageOptions,
  ): Promise<GenerateImageResult> {
    this.ensureNotClosed();
    const {
      prompt,
      model = "imagen-3",
      options = {},
      referenceImages = [],
      headless,
    } = params;

    // Resolve or verify project binding
    let projectId = params.projectId;
    let targetBinding: any = null;

    if (params.accountId) {
      targetBinding = this.db.db
        .prepare(
          `SELECT b.*, a.profile_path, a.session_epoch 
           FROM project_bindings b
           JOIN accounts a ON b.account_id = a.id
           WHERE b.account_id = ? AND b.archived_at IS NULL AND a.enabled = 1
           LIMIT 1`,
        )
        .get(params.accountId);
    } else if (projectId) {
      targetBinding = this.db.db
        .prepare(
          `SELECT b.*, a.profile_path, a.session_epoch 
           FROM project_bindings b
           JOIN accounts a ON b.account_id = a.id
           WHERE b.project_id = ? AND b.archived_at IS NULL AND a.enabled = 1
           LIMIT 1`,
        )
        .get(projectId);
    } else {
      targetBinding = this.db.db
        .prepare(
          `SELECT b.*, a.profile_path, a.session_epoch 
           FROM project_bindings b
           JOIN accounts a ON b.account_id = a.id
           WHERE b.setup_state = 'verified' AND b.archived_at IS NULL AND a.enabled = 1
           LIMIT 1`,
        )
        .get();
    }

    if (!targetBinding || !targetBinding.remote_project_id) {
      throw new Error(
        "No verified project binding found. Please link an account to a Flow remote project first using 'loginAccount' or 'linkProject'.",
      );
    }

    const resolvedProjectId: string =
      targetBinding.project_id || projectId || "proj-default";

    // Ingest reference image assets
    const inputAssetIds: string[] = [];
    for (const ref of referenceImages) {
      const resolvedPath = resolve(ref);
      if (!existsSync(resolvedPath)) {
        throw new Error(`Reference image not found: ${resolvedPath}`);
      }
      const buffer = readFileSync(resolvedPath);
      const asset = this.ingestAsset(buffer, "image/png");
      inputAssetIds.push(asset.assetId);
    }

    const idempotencyKey = `cli-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const mergedOptions = { ...options };
    if (headless !== undefined) {
      mergedOptions.headless = headless;
    }

    const { jobId } = this.runner.submitJob({
      projectId: resolvedProjectId,
      idempotencyKey,
      prompt,
      model,
      options: mergedOptions,
      inputAssetIds,
      pinnedBindingId: targetBinding.id,
    });

    await this.runner.executeJob(jobId, {
      id: targetBinding.id,
      accountId: targetBinding.account_id,
      remoteProjectId: targetBinding.remote_project_id,
      profilePath: targetBinding.profile_path,
      sessionEpoch: targetBinding.session_epoch,
    });

    // Collect generated outputs
    const outputs = this.db.db
      .prepare(
        `SELECT o.*, a.content_hash, a.blob_key, a.size_bytes 
         FROM job_outputs o
         LEFT JOIN assets a ON o.local_asset_id = a.id
         WHERE o.attempt_id IN (SELECT id FROM job_attempts WHERE job_id = ?)
         ORDER BY o.position ASC`,
      )
      .all(jobId) as any[];

    const mappedOutputs: GeneratedAssetOutput[] = outputs.map((out) => ({
      position: out.position,
      remoteUrl: out.remote_url,
      contentHash: out.content_hash || "",
      localAssetId: out.local_asset_id,
      blobPath: out.content_hash
        ? this.blobStore.getBlobPath(out.content_hash)
        : "",
      sizeBytes: out.size_bytes || 0,
    }));

    return {
      jobId,
      status: "succeeded",
      outputs: mappedOutputs,
    };
  }

  /**
   * Ingests a binary buffer into content-addressed BlobStore and records the asset.
   */
  public ingestAsset(
    content: Buffer,
    mimeType = "image/png",
  ): {
    assetId: string;
    contentHash: string;
    blobKey: string;
    sizeBytes: number;
  } {
    this.ensureNotClosed();
    const meta = this.blobStore.put(content);
    const existing = this.db.db
      .prepare("SELECT id FROM assets WHERE content_hash = ?")
      .get(meta.contentHash) as { id: string } | undefined;

    if (existing) {
      return {
        assetId: existing.id,
        contentHash: meta.contentHash,
        blobKey: meta.blobKey,
        sizeBytes: meta.sizeBytes,
      };
    }

    const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();

    this.db.transaction(() => {
      this.db.db
        .prepare(
          `INSERT INTO assets (id, content_hash, blob_key, mime_type, size_bytes, availability, created_at)
           VALUES (?, ?, ?, ?, ?, 'ready', ?)`,
        )
        .run(assetId, meta.contentHash, meta.blobKey, mimeType, meta.sizeBytes, now);
    });

    return {
      assetId,
      contentHash: meta.contentHash,
      blobKey: meta.blobKey,
      sizeBytes: meta.sizeBytes,
    };
  }

  /**
   * Links an account to a remote Flow project ID, creating or updating the binding.
   */
  public linkProject(params: LinkProjectParams): {
    bindingId: string;
    projectId: string;
  } {
    this.ensureNotClosed();
    const {
      accountId,
      remoteProjectId,
      projectId = "proj-default",
      projectName = "Dự án tạo ảnh Flow",
    } = params;
    const now = new Date().toISOString();

    return this.db.transaction(() => {
      this.db.db
        .prepare(
          `INSERT OR IGNORE INTO projects (id, name, description, created_at, updated_at)
           VALUES (?, ?, 'Tự động liên kết', ?, ?)`,
        )
        .run(projectId, projectName, now, now);

      const existingBinding = this.db.db
        .prepare(
          `SELECT id FROM project_bindings 
           WHERE project_id = ? AND account_id = ? AND archived_at IS NULL`,
        )
        .get(projectId, accountId) as { id: string } | undefined;

      if (existingBinding) {
        this.db.db
          .prepare(
            `UPDATE project_bindings 
             SET remote_project_id = ?, setup_state = 'verified', last_verified_at = ?, updated_at = ?
             WHERE id = ?`,
          )
          .run(remoteProjectId, now, now, existingBinding.id);
        return { bindingId: existingBinding.id, projectId };
      }

      const bindingId = `bind-${accountId}-${projectId}`;
      this.db.db
        .prepare(
          `INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, last_verified_at, created_at, updated_at)
           VALUES (?, ?, ?, ?, 'verified', ?, ?, ?)`,
        )
        .run(bindingId, projectId, accountId, remoteProjectId, now, now, now);

      return { bindingId, projectId };
    });
  }

  /**
   * Launches an interactive browser session to log in to Google Flow.
   */
  public async loginAccount(options: {
    accountId?: string;
    label?: string;
    onStatusChange?: (status: string) => void;
  } = {}): Promise<{
    success: boolean;
    accountId: string;
    email?: string;
    remoteProjectId?: string;
  }> {
    this.ensureNotClosed();
    const accountId = options.accountId || "account-1";
    const label = options.label || "Tài khoản chính";
    const profileDir = this.config.getAccountProfileDir(accountId);

    const result = await this.loginHelper.launchLoginSession({
      profileDir,
      onStatusChange: options.onStatusChange,
    });

    if (result.success) {
      const now = new Date().toISOString();
      this.db.transaction(() => {
        const existing = this.db.db
          .prepare("SELECT id FROM accounts WHERE id = ?")
          .get(accountId);

        if (existing) {
          this.db.db
            .prepare(
              `UPDATE accounts 
               SET session_status = 'authenticated',
                   observed_principal = COALESCE(?, observed_principal),
                   updated_at = ?
               WHERE id = ?`,
            )
            .run(result.email || null, now, accountId);
        } else {
          this.db.db
            .prepare(
              `INSERT INTO accounts (id, label, profile_path, session_status, observed_principal, created_at, updated_at)
               VALUES (?, ?, ?, 'authenticated', ?, ?, ?)`,
            )
            .run(accountId, label, profileDir, result.email || null, now, now);
        }

        if (result.remoteProjectId) {
          this.linkProject({
            accountId,
            remoteProjectId: result.remoteProjectId,
          });
        }
      });
    }

    return {
      success: result.success,
      accountId,
      email: result.email,
      remoteProjectId: result.remoteProjectId,
    };
  }

  /**
   * Starts the background job queue processor.
   */
  public startQueue(): void {
    this.ensureNotClosed();
    this.queue.start();
  }

  /**
   * Stops the background job queue processor.
   */
  public async stopQueue(): Promise<void> {
    await this.queue.stop();
  }

  /**
   * Starts the embedded REST API server and Web Dashboard.
   */
  public async startServer(options: ApiServerOptions = {}): Promise<ApiServer> {
    this.ensureNotClosed();
    if (this.server) {
      return this.server;
    }

    this.server = new ApiServer(
      this.db,
      this.blobStore,
      this.accountManager,
      this.runner,
      this.queue,
      {
        ...options,
        manualLoginHelper: options.manualLoginHelper || this.loginHelper,
      },
    );

    await this.server.start();
    return this.server;
  }

  /**
   * Registers a new account profile.
   */
  public createAccount(params: {
    id: string;
    label: string;
    remoteProjectId?: string;
  }) {
    this.ensureNotClosed();
    return this.accountManager.registerAccount(params);
  }

  /**
   * Updates an existing account profile metadata or binding.
   */
  public updateAccount(
    id: string,
    params: {
      label?: string;
      enabled?: boolean;
      remoteProjectId?: string;
    },
  ) {
    this.ensureNotClosed();
    return this.accountManager.updateAccount(id, params);
  }

  /**
   * Deletes an account profile and optionally deletes its folder on disk.
   */
  public deleteAccount(id: string, deleteDiskProfile = false): void {
    this.ensureNotClosed();
    this.accountManager.deleteAccount(id, deleteDiskProfile);
  }

  /**
   * Stops the embedded REST API server.
   */
  public async stopServer(): Promise<void> {
    if (this.server) {
      await this.server.stop();
      this.server = null;
    }
  }

  /**
   * Gracefully disposes of all resources: stops server, stops queue worker, closes database.
   */
  public async close(): Promise<void> {
    if (this.isClosed) return;
    this.isClosed = true;

    await this.stopServer();
    await this.stopQueue();
    this.db.close();
  }

  private ensureNotClosed(): void {
    if (this.isClosed) {
      throw new Error("FlowStudio instance has been closed.");
    }
  }
}
