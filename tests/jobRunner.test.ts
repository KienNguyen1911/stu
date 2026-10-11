import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { FlowDatabase } from "../src/infrastructure/db/database.js";
import { BlobStore } from "../src/infrastructure/blobs/blobStore.js";
import { AccountCoordinator } from "../src/application/accountCoordinator.js";
import { JobRunner } from "../src/application/jobRunner.js";
import type { FlowAdapter } from "../src/infrastructure/flow/flowAdapter.js";

test("JobRunner executes complete lifecycle end-to-end with transaction checkpoints", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "flow-runner-test-"));
  const db = new FlowDatabase(":memory:");
  db.initSchema();
  const blobStore = new BlobStore(tempDir);
  const coordinator = new AccountCoordinator();

  try {
    // Setup test Account, Project, and Binding
    const now = new Date().toISOString();
    db.db.exec(`
      INSERT INTO accounts (id, label, profile_path, enabled, session_epoch, session_status, created_at, updated_at)
      VALUES ('acc-1', 'Account 1', '${join(tempDir, "p1").replace(/\\/g, "/")}', 1, 1, 'authenticated', '${now}', '${now}');

      INSERT INTO projects (id, name, created_at, updated_at)
      VALUES ('proj-1', 'Studio Project', '${now}', '${now}');

      INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, created_at, updated_at)
      VALUES ('bind-1', 'proj-1', 'acc-1', 'flow-remote-123', 'verified', '${now}', '${now}');
    `);

    // Mock Adapter seam
    let submitIntentRecordedBeforeGeneration = false;
    const fakeAdapter: FlowAdapter = {
      executeGeneration: async () => {
        // Assert submit_intent_at was recorded in DB before remote call
        const attempt = db.db
          .prepare("SELECT phase, submit_intent_at FROM job_attempts LIMIT 1")
          .get() as any;
        if (
          attempt?.phase === "submitting_intent" &&
          attempt?.submit_intent_at
        ) {
          submitIntentRecordedBeforeGeneration = true;
        }

        const fakeBytes = Buffer.from("Fake PNG Image Bytes 123");
        const meta = blobStore.put(fakeBytes);
        const assetId = "asset-fake-1";

        // Insert asset record to satisfy foreign key constraint
        db.db
          .prepare(
            `
          INSERT INTO assets (id, content_hash, blob_key, mime_type, size_bytes, availability, created_at)
          VALUES ('${assetId}', '${meta.contentHash}', '${meta.blobKey}', 'image/png', ${meta.sizeBytes}, 'ready', '${now}')
        `,
          )
          .run();

        return [
          {
            remoteUrl: "https://flow.google.com/output/img1.png",
            localContentHash: meta.contentHash,
            localAssetId: assetId,
            sizeBytes: meta.sizeBytes,
          },
        ];
      },
    } as any;

    const runner = new JobRunner(db, coordinator, fakeAdapter);

    // 1. Submit Job
    const { jobId, created } = runner.submitJob({
      projectId: "proj-1",
      idempotencyKey: "idem-test-1",
      prompt: "A futuristic city at sunset",
      model: "imagen-3",
    });

    assert.equal(created, true);
    assert.ok(jobId);

    // Verify idempotency: re-submitting with exact same parameters returns same jobId
    const resubmit = runner.submitJob({
      projectId: "proj-1",
      idempotencyKey: "idem-test-1",
      prompt: "A futuristic city at sunset",
      model: "imagen-3",
    });
    assert.equal(resubmit.jobId, jobId);
    assert.equal(resubmit.created, false);

    // 2. Execute Job
    await runner.executeJob(jobId);

    // 3. Verify invariants & outcomes
    assert.equal(
      submitIntentRecordedBeforeGeneration,
      true,
      "submit_intent_at must be recorded before remote mutation",
    );

    const job = db.db
      .prepare("SELECT status FROM jobs WHERE id = ?")
      .get(jobId) as any;
    assert.equal(job.status, "succeeded");

    const attempt = db.db
      .prepare("SELECT phase, outcome FROM job_attempts WHERE job_id = ?")
      .get(jobId) as any;
    assert.equal(attempt.phase, "completed");
    assert.equal(attempt.outcome, "succeeded");

    const outputs = db.db
      .prepare(
        "SELECT * FROM job_outputs WHERE attempt_id IN (SELECT id FROM job_attempts WHERE job_id = ?)",
      )
      .all(jobId) as any[];
    assert.equal(outputs.length, 1);
    assert.equal(outputs[0].download_status, "downloaded");

    // Account lease must be released
    assert.equal(coordinator.isBusy("acc-1"), false);
  } finally {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("JobRunner executes Image-to-Image generation with reference assets and records upload attempts", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "flow-runner-i2i-"));
  const db = new FlowDatabase(":memory:");
  db.initSchema();
  const blobStore = new BlobStore(tempDir);
  const coordinator = new AccountCoordinator();

  try {
    const now = new Date().toISOString();
    db.db.exec(`
      INSERT INTO accounts (id, label, profile_path, enabled, session_epoch, session_status, created_at, updated_at)
      VALUES ('acc-1', 'Account 1', '${join(tempDir, "p1").replace(/\\/g, "/")}', 1, 1, 'authenticated', '${now}', '${now}');

      INSERT INTO projects (id, name, created_at, updated_at)
      VALUES ('proj-1', 'Studio Project', '${now}', '${now}');

      INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, created_at, updated_at)
      VALUES ('bind-1', 'proj-1', 'acc-1', 'flow-remote-123', 'verified', '${now}', '${now}');
    `);

    // 1. Create a reference input asset
    const inputBytes = Buffer.from("Reference Dog Image PNG Bytes");
    const inputMeta = blobStore.put(inputBytes);
    const refAssetId = "asset-input-dog-1";

    db.db
      .prepare(
        `INSERT INTO assets (id, content_hash, blob_key, mime_type, size_bytes, availability, created_at)
         VALUES (?, ?, ?, 'image/png', ?, 'ready', ?)`,
      )
      .run(
        refAssetId,
        inputMeta.contentHash,
        inputMeta.blobKey,
        inputMeta.sizeBytes,
        now,
      );

    // Mock Adapter seam
    let receivedReferencePaths: string[] = [];
    const fakeAdapter: FlowAdapter = {
      blobStore,
      db,
      executeGeneration: async (params: any) => {
        receivedReferencePaths = params.referenceImagePaths || [];

        // Verify upload_attempt is recorded as pending during execution
        const upl = db.db
          .prepare("SELECT * FROM upload_attempts WHERE asset_id = ?")
          .get(refAssetId) as any;
        assert.ok(
          upl,
          "upload_attempt record must exist before remote execution",
        );
        assert.equal(upl.operation_state, "pending");

        const fakeOutBytes = Buffer.from("I2I Output Dog with Glasses PNG");
        const outMeta = blobStore.put(fakeOutBytes);
        const outAssetId = "asset-out-dog-1";

        db.db
          .prepare(
            `INSERT INTO assets (id, content_hash, blob_key, mime_type, size_bytes, availability, created_at)
             VALUES (?, ?, ?, 'image/png', ?, 'ready', ?)`,
          )
          .run(
            outAssetId,
            outMeta.contentHash,
            outMeta.blobKey,
            outMeta.sizeBytes,
            now,
          );

        return [
          {
            remoteUrl: "https://flow.google.com/output/i2i-dog.png",
            localContentHash: outMeta.contentHash,
            localAssetId: outAssetId,
            sizeBytes: outMeta.sizeBytes,
          },
        ];
      },
    } as any;

    const runner = new JobRunner(db, coordinator, fakeAdapter);

    // 2. Submit I2I Job with inputAssetIds
    const { jobId, created } = runner.submitJob({
      projectId: "proj-1",
      idempotencyKey: "idem-i2i-test",
      prompt: "A dog wearing stylish sunglasses",
      inputAssetIds: [refAssetId],
    });

    assert.equal(created, true);

    // Verify job_inputs table
    const jobInputs = db.db
      .prepare("SELECT * FROM job_inputs WHERE job_id = ?")
      .all(jobId) as any[];
    assert.equal(jobInputs.length, 1);
    assert.equal(jobInputs[0].asset_id, refAssetId);
    assert.equal(jobInputs[0].position, 0);

    // 3. Execute Job
    await runner.executeJob(jobId);

    // 4. Verify reference path was passed to adapter
    assert.equal(receivedReferencePaths.length, 1);
    assert.equal(receivedReferencePaths[0], inputMeta.filePath);

    // 5. Verify upload_attempts became verified
    const uplFinal = db.db
      .prepare("SELECT * FROM upload_attempts WHERE asset_id = ?")
      .get(refAssetId) as any;
    assert.equal(uplFinal.operation_state, "verified");

    // 6. Verify attempt_inputs linked
    const attInputs = db.db
      .prepare("SELECT * FROM attempt_inputs WHERE upload_attempt_id = ?")
      .all(uplFinal.id) as any[];
    assert.equal(attInputs.length, 1);
    assert.equal(attInputs[0].position, 0);

    // 7. Verify job succeeded and outputs recorded
    const job = db.db
      .prepare("SELECT status FROM jobs WHERE id = ?")
      .get(jobId) as any;
    assert.equal(job.status, "succeeded");

    const outputs = db.db
      .prepare(
        "SELECT * FROM job_outputs WHERE attempt_id IN (SELECT id FROM job_attempts WHERE job_id = ?)",
      )
      .all(jobId) as any[];
    assert.equal(outputs.length, 1);
    assert.equal(outputs[0].local_asset_id, "asset-out-dog-1");
  } finally {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  }
});
