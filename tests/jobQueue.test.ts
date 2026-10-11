import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { FlowDatabase } from "../src/infrastructure/db/database.js";
import { BlobStore } from "../src/infrastructure/blobs/blobStore.js";
import { AccountCoordinator } from "../src/application/accountCoordinator.js";
import { AccountManager } from "../src/application/accountManager.js";
import { JobRunner } from "../src/application/jobRunner.js";
import { JobQueue } from "../src/application/jobQueue.js";
import type { FlowAdapter } from "../src/infrastructure/flow/flowAdapter.js";

test("JobQueue dispatches queued jobs across multi-accounts concurrently", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "flow-queue-test-"));
  const db = new FlowDatabase(":memory:");
  db.initSchema();
  const blobStore = new BlobStore(tempDir);
  const coordinator = new AccountCoordinator();
  const manager = new AccountManager(db, coordinator);

  try {
    const now = new Date().toISOString();
    db.db.exec(`
      INSERT INTO accounts (id, label, profile_path, enabled, session_epoch, session_status, created_at, updated_at)
      VALUES 
        ('acc-1', 'Acc 1', '${join(tempDir, "p1").replace(/\\/g, "/")}', 1, 1, 'authenticated', '${now}', '${now}'),
        ('acc-2', 'Acc 2', '${join(tempDir, "p2").replace(/\\/g, "/")}', 1, 1, 'authenticated', '${now}', '${now}');

      INSERT INTO projects (id, name, created_at, updated_at)
      VALUES ('proj-q', 'Queue Project', '${now}', '${now}');

      INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, created_at, updated_at)
      VALUES 
        ('bind-1', 'proj-q', 'acc-1', 'remote-1', 'verified', '${now}', '${now}'),
        ('bind-2', 'proj-q', 'acc-2', 'remote-2', 'verified', '${now}', '${now}');
    `);

    // Mock Adapter that records execution and delays slightly
    const executions: Array<{ accountId: string; prompt: string }> = [];
    const fakeAdapter: FlowAdapter = {
      blobStore,
      db,
      executeGeneration: async (params: any) => {
        executions.push({
          accountId: params.accountId,
          prompt: params.prompt,
        });

        // Small simulated delay
        await new Promise((r) => setTimeout(r, 50));

        const fakeBytes = Buffer.from(`Output for ${params.prompt}`);
        const meta = blobStore.put(fakeBytes);
        const assetId = `asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        db.db
          .prepare(
            `INSERT INTO assets (id, content_hash, blob_key, mime_type, size_bytes, availability, created_at)
             VALUES (?, ?, ?, 'image/png', ?, 'ready', ?)`,
          )
          .run(assetId, meta.contentHash, meta.blobKey, meta.sizeBytes, now);

        return [
          {
            remoteUrl: `https://flow.google.com/output/${assetId}.png`,
            localContentHash: meta.contentHash,
            localAssetId: assetId,
            sizeBytes: meta.sizeBytes,
          },
        ];
      },
    } as any;

    const runner = new JobRunner(db, coordinator, fakeAdapter);
    const queue = new JobQueue(db, runner, manager, coordinator, {
      pollIntervalMs: 50,
    });

    // 1. Enqueue two jobs
    const job1 = queue.enqueue({
      projectId: "proj-q",
      idempotencyKey: "q-job-1",
      prompt: "Prompt Alpha",
    });

    const job2 = queue.enqueue({
      projectId: "proj-q",
      idempotencyKey: "q-job-2",
      prompt: "Prompt Beta",
    });

    assert.ok(job1.jobId);
    assert.ok(job2.jobId);

    // 2. Start queue worker
    queue.start();

    // Wait for both jobs to process
    const startWait = Date.now();
    while (Date.now() - startWait < 3000) {
      const stats = queue.getStats();
      if (stats.queuedCount === 0 && stats.runningCount === 0) {
        break;
      }
      await new Promise((r) => setTimeout(r, 50));
    }

    await queue.stop();

    // 3. Verify both jobs were executed on different accounts
    assert.equal(executions.length, 2);
    const accountsUsed = new Set(executions.map((e) => e.accountId));
    assert.ok(
      accountsUsed.has("acc-1") && accountsUsed.has("acc-2"),
      "Jobs should be dispatched across available accounts in parallel",
    );

    // Verify jobs in DB are marked succeeded
    const j1 = db.db
      .prepare("SELECT status FROM jobs WHERE id = ?")
      .get(job1.jobId) as any;
    const j2 = db.db
      .prepare("SELECT status FROM jobs WHERE id = ?")
      .get(job2.jobId) as any;

    assert.equal(j1.status, "succeeded");
    assert.equal(j2.status, "succeeded");
  } finally {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  }
});
