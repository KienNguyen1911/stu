import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { FlowStudio } from "../src/index.js";
import { FlowDatabase } from "../src/infrastructure/db/database.js";
import { BlobStore } from "../src/infrastructure/blobs/blobStore.js";
import { InMemoryFlowAdapter } from "../src/infrastructure/flow/inMemoryFlowAdapter.js";

test("FlowStudio deep module provides seamless end-to-end operations", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "flow-studio-test-"));
  const db = new FlowDatabase(":memory:");
  const blobStore = new BlobStore(tempDir);
  const adapter = new InMemoryFlowAdapter(blobStore, db);

  const studio = new FlowStudio({
    dataRoot: tempDir,
    db,
    blobStore,
    adapter,
    pollIntervalMs: 50,
  });

  try {
    // 1. Ingest asset directly through deep module interface
    const dummyImage = Buffer.from("PNG_TEST_ASSET_CONTENT_123");
    const assetMeta = studio.ingestAsset(dummyImage);
    assert.ok(assetMeta.assetId);
    assert.equal(assetMeta.sizeBytes, dummyImage.length);

    // Verify deduplication
    const assetMeta2 = studio.ingestAsset(dummyImage);
    assert.equal(assetMeta.contentHash, assetMeta2.contentHash);
    assert.equal(assetMeta.assetId, assetMeta2.assetId);

    // 2. Setup account and project binding
    const now = new Date().toISOString();
    studio.db.db.exec(`
      INSERT INTO accounts (id, label, profile_path, enabled, session_epoch, session_status, created_at, updated_at)
      VALUES ('acc-1', 'Main Account', '${join(tempDir, "p1").replace(/\\/g, "/")}', 1, 1, 'authenticated', '${now}', '${now}');
    `);

    const linkResult = studio.linkProject({
      accountId: "acc-1",
      remoteProjectId: "remote-flow-proj-999",
      projectId: "proj-test",
      projectName: "Test Project",
    });
    assert.ok(linkResult.bindingId);
    assert.equal(linkResult.projectId, "proj-test");

    // 3. Test generate workflow end-to-end
    // Create a local reference image file on disk
    const refImagePath = join(tempDir, "ref.png");
    writeFileSync(refImagePath, Buffer.from("REFERENCE_IMAGE_BYTES"));

    const genResult = await studio.generate({
      prompt: "A beautiful mountain landscape at sunrise",
      projectId: "proj-test",
      referenceImages: [refImagePath],
      headless: true,
    });

    assert.equal(genResult.status, "succeeded");
    assert.ok(genResult.jobId);
    assert.equal(genResult.outputs.length, 1);
    assert.ok(genResult.outputs[0]?.contentHash);
    assert.ok(genResult.outputs[0]?.blobPath);
    assert.equal(adapter.calls.length, 1);
    assert.equal(
      adapter.calls[0]?.prompt,
      "A beautiful mountain landscape at sunrise",
    );

    // 4. Test Job Queue lifecycle through FlowStudio
    studio.startQueue();
    // Enqueue another job
    const queuedJob = studio.submitJob({
      projectId: "proj-test",
      idempotencyKey: "queued-idem-1",
      prompt: "A neon cyberpunk cityscape in rain",
    });
    assert.equal(queuedJob.created, true);

    // Wait for queue loop to pick up and finish
    await new Promise((r) => setTimeout(r, 150));

    const checkJob = studio.db.db
      .prepare("SELECT status FROM jobs WHERE id = ?")
      .get(queuedJob.jobId) as any;
    assert.equal(checkJob.status, "succeeded");

    // 5. Test Embedded HTTP Server lifecycle through FlowStudio
    const port = 3789;
    const server = await studio.startServer({ port });
    assert.ok(server);

    const healthRes = await fetch(`http://127.0.0.1:${port}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthJson = (await healthRes.json()) as any;
    assert.equal(healthJson.status, "ok");

    // Verify calling startServer again returns existing server instance
    const sameServer = await studio.startServer({ port });
    assert.equal(sameServer, server);

    // 6. Test graceful shutdown and close
    await studio.close();

    // Verify operations after close throw clear errors
    assert.throws(() => {
      studio.submitJob({
        projectId: "proj-test",
        idempotencyKey: "fail-after-close",
        prompt: "test",
      });
    }, /closed/i);
  } finally {
    try {
      await studio.close();
    } catch {}
    rmSync(tempDir, { recursive: true, force: true });
  }
});
