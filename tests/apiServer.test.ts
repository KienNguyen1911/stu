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
import { ApiServer } from "../src/server/apiServer.js";
import type { FlowAdapter } from "../src/infrastructure/flow/flowAdapter.js";

test("ApiServer serves health, accounts, assets upload, blob download, and jobs endpoints", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "flow-api-test-"));
  const db = new FlowDatabase(":memory:");
  db.initSchema();
  const blobStore = new BlobStore(tempDir);
  const coordinator = new AccountCoordinator();
  const manager = new AccountManager(db, coordinator);

  const fakeAdapter: FlowAdapter = {
    blobStore,
    db,
    executeGeneration: async () => [],
  } as any;

  const runner = new JobRunner(db, coordinator, fakeAdapter);
  const queue = new JobQueue(db, runner, manager, coordinator);
  const port = 3456;
  const server = new ApiServer(db, blobStore, manager, runner, queue, { port });

  await server.start();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. Health check
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    const healthData = (await healthRes.json()) as any;
    assert.equal(healthData.status, "ok");

    // 2. Register account via API
    const regRes = await fetch(`${baseUrl}/api/accounts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "api-test-acc", label: "API Test Account" }),
    });
    assert.equal(regRes.status, 201);
    const regData = (await regRes.json()) as any;
    assert.equal(regData.account.id, "api-test-acc");

    // 3. List accounts
    const listRes = await fetch(`${baseUrl}/api/accounts`);
    assert.equal(listRes.status, 200);
    const listData = (await listRes.json()) as any;
    assert.equal(listData.accounts.length, 1);
    assert.equal(listData.accounts[0].isBusy, false);

    // 4. Upload binary asset
    const sampleBytes = Buffer.from("Test PNG Image Asset Bytes for API");
    const uploadRes = await fetch(`${baseUrl}/api/assets/upload`, {
      method: "POST",
      headers: { "Content-Type": "image/png" },
      body: sampleBytes,
    });
    assert.equal(uploadRes.status, 201);
    const uploadData = (await uploadRes.json()) as any;
    assert.ok(uploadData.assetId);
    assert.ok(uploadData.blobUrl);

    // 5. Download raw blob bytes
    const blobRes = await fetch(`${baseUrl}${uploadData.blobUrl}`);
    assert.equal(blobRes.status, 200);
    assert.equal(blobRes.headers.get("content-type"), "image/png");
    const downloadedBuf = Buffer.from(await blobRes.arrayBuffer());
    assert.deepEqual(downloadedBuf, sampleBytes);

    // 6. Create Project & Enqueue Job
    const projRes = await fetch(`${baseUrl}/api/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: "proj-api", name: "Project API" }),
    });
    assert.equal(projRes.status, 201);

    const jobRes = await fetch(`${baseUrl}/api/jobs`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: "proj-api",
        prompt: "A beautiful garden",
        inputAssetIds: [uploadData.assetId],
      }),
    });
    assert.equal(jobRes.status, 202);
    const jobData = (await jobRes.json()) as any;
    assert.ok(jobData.jobId);
    assert.equal(jobData.status, "queued");

    // 7. Get Job detail
    const detailRes = await fetch(`${baseUrl}/api/jobs/${jobData.jobId}`);
    assert.equal(detailRes.status, 200);
    const detailData = (await detailRes.json()) as any;
    assert.equal(detailData.job.id, jobData.jobId);
    assert.equal(detailData.inputs.length, 1);
    assert.equal(detailData.inputs[0].asset_id, uploadData.assetId);

    // 8. Update account
    const updateRes = await fetch(`${baseUrl}/api/accounts/api-test-acc`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: "Updated Label", enabled: true }),
    });
    assert.equal(updateRes.status, 200);
    const updateData = (await updateRes.json()) as any;
    assert.equal(updateData.account.label, "Updated Label");

    // 9. Check login status endpoint
    const statusRes = await fetch(`${baseUrl}/api/accounts/api-test-acc/login-status`);
    assert.equal(statusRes.status, 200);
    const statusData = (await statusRes.json()) as any;
    assert.equal(statusData.session.status, "idle");

    // 10. Dashboard HTML
    const dashRes = await fetch(`${baseUrl}/`);
    assert.equal(dashRes.status, 200);
    assert.ok(dashRes.headers.get("content-type")?.includes("text/html"));
    const html = await dashRes.text();
    assert.ok(html.includes("Flow Studio Core"));
    assert.ok(html.includes("Chrome Profiles"));

    // 11. Delete account
    const delRes = await fetch(`${baseUrl}/api/accounts/api-test-acc`, {
      method: "DELETE",
    });
    assert.equal(delRes.status, 200);
    const afterListRes = await fetch(`${baseUrl}/api/accounts`);
    const afterListData = (await afterListRes.json()) as any;
    assert.equal(afterListData.accounts.length, 0);
  } finally {
    await server.stop();
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  }
});
