import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { BlobStore } from "../src/infrastructure/blobs/blobStore.js";
import { FlowDatabase } from "../src/infrastructure/db/database.js";
import { AccountCoordinator } from "../src/application/accountCoordinator.js";
import {
  calculateRequestHash,
  determineRecoveryAction,
  canRetryOutputDownload,
} from "../src/domain/invariants.js";

test("BlobStore stores files by SHA-256 hash and deduplicates", () => {
  const tempDir = mkdtempSync(join(tmpdir(), "flow-blob-test-"));
  try {
    const store = new BlobStore(tempDir);
    const content = Buffer.from("Hello Google Flow Image Generator");

    const meta1 = store.put(content);
    assert.ok(meta1.contentHash);
    assert.equal(meta1.sizeBytes, content.length);
    assert.equal(store.hasBlob(meta1.contentHash), true);

    // Deduplication test: putting exact same content returns existing blob without error
    const meta2 = store.put(content);
    assert.equal(meta1.contentHash, meta2.contentHash);

    // Read back bytes
    const read = store.get(meta1.contentHash);
    assert.deepEqual(read, content);

    // Verify integrity
    assert.equal(store.verifyIntegrity(meta1.contentHash), true);
  } finally {
    rmSync(tempDir, { recursive: true, force: true });
  }
});

test("FlowDatabase enforces schema constraints and foreign keys", () => {
  const db = new FlowDatabase(":memory:");
  db.initSchema();

  // Insert an account
  db.db.exec(`
    INSERT INTO accounts (id, label, profile_path, created_at, updated_at)
    VALUES ('acc-1', 'Test Account', 'C:/profiles/acc-1', datetime('now'), datetime('now'));
  `);

  // Insert a project
  db.db.exec(`
    INSERT INTO projects (id, name, created_at, updated_at)
    VALUES ('proj-1', 'Product Shoot', datetime('now'), datetime('now'));
  `);

  // Insert a binding
  db.db.exec(`
    INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, created_at, updated_at)
    VALUES ('bind-1', 'proj-1', 'acc-1', 'remote-p1', datetime('now'), datetime('now'));
  `);

  // Foreign key constraint test: inserting a job with non-existent project fails
  assert.throws(() => {
    db.db.exec(`
      INSERT INTO jobs (id, project_id, idempotency_key, request_hash, prompt, model, created_at, updated_at)
      VALUES ('job-err', 'non-existent-proj', 'key-1', 'hash-1', 'prompt', 'imagen-3', datetime('now'), datetime('now'));
    `);
  });

  // Unique constraint test: duplicate active binding on same project/account fails
  assert.throws(() => {
    db.db.exec(`
      INSERT INTO project_bindings (id, project_id, account_id, created_at, updated_at)
      VALUES ('bind-2', 'proj-1', 'acc-1', datetime('now'), datetime('now'));
    `);
  });

  // ACID transaction test
  assert.throws(() => {
    db.transaction(() => {
      db.db.exec(`
        INSERT INTO projects (id, name, created_at, updated_at)
        VALUES ('proj-temp', 'Temp Proj', datetime('now'), datetime('now'));
      `);
      throw new Error("Simulated crash inside transaction");
    });
  });

  const queryTemp = db.db
    .prepare("SELECT * FROM projects WHERE id = 'proj-temp'")
    .all();
  assert.equal(
    queryTemp.length,
    0,
    "Transaction should have rolled back completely",
  );

  db.close();
});

test("AccountCoordinator guarantees exclusive browser execution", async () => {
  const coordinator = new AccountCoordinator();

  const lease1 = await coordinator.acquire("acc-1", "generate-image");
  assert.equal(coordinator.isBusy("acc-1"), true);

  let lease2Acquired = false;
  const p2 = coordinator.acquire("acc-1", "upload-reference").then((l2) => {
    lease2Acquired = true;
    l2.release();
  });

  // Lease 2 must wait while Lease 1 is held
  await new Promise((r) => setTimeout(r, 50));
  assert.equal(lease2Acquired, false);

  // Release lease 1
  lease1.release();

  await p2;
  assert.equal(lease2Acquired, true);
  assert.equal(coordinator.isBusy("acc-1"), false);
});

test("Domain invariants enforce safety rules from SPEC.md", () => {
  // Request hash calculation
  const hash1 = calculateRequestHash(
    " cinematic photo ",
    "imagen-3",
    '{"aspectRatio":"16:9"}',
    ["asset-1"],
  );
  const hash2 = calculateRequestHash(
    "cinematic photo",
    "imagen-3",
    '{"aspectRatio":"16:9"}',
    ["asset-1"],
  );
  assert.equal(
    hash1,
    hash2,
    "Normalized inputs produce identical request hash",
  );

  // Recovery rules
  const attemptNoMutation = {
    id: "att-1",
    jobId: "job-1",
    attemptNumber: 1,
    bindingId: "bind-1",
    sessionEpoch: 1,
    phase: "preparing_inputs",
    submitIntentAt: null,
    remoteOperationId: null,
    outcome: null,
    errorMessage: null,
    createdAt: "",
    updatedAt: "",
  } as const;

  const rec1 = determineRecoveryAction(attemptNoMutation);
  assert.equal(rec1.canResumeImmediately, true);

  const attemptUncertain = {
    ...attemptNoMutation,
    phase: "awaiting_generation",
    submitIntentAt: "2026-10-10T12:00:00Z",
    outcome: null,
  } as const;

  const rec2 = determineRecoveryAction(attemptUncertain);
  assert.equal(rec2.canResumeImmediately, false);
  assert.equal(
    rec2.requiresAttention,
    true,
    "Uncertain outcome requires attention, not re-generate",
  );

  // Output download retry
  const successfulAttempt = {
    ...attemptUncertain,
    outcome: "succeeded",
  } as const;

  const failedDownload = {
    id: "out-1",
    attemptId: "att-1",
    position: 0,
    remoteMediaId: "media-1",
    remoteUrl: "https://flow.google.com/img/1.png",
    localAssetId: null,
    downloadStatus: "failed",
    downloadError: "Network timeout",
    createdAt: "",
  } as const;

  assert.equal(canRetryOutputDownload(failedDownload, successfulAttempt), true);
});
