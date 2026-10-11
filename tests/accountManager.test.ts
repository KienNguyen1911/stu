import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

import { FlowDatabase } from "../src/infrastructure/db/database.js";
import { AccountCoordinator } from "../src/application/accountCoordinator.js";
import { AccountManager } from "../src/application/accountManager.js";

test("AccountManager manages accounts, status toggling, and multi-account binding selection", async () => {
  const tempDir = mkdtempSync(join(tmpdir(), "flow-acc-mgr-test-"));
  const db = new FlowDatabase(":memory:");
  db.initSchema();
  const coordinator = new AccountCoordinator();
  const manager = new AccountManager(db, coordinator);

  try {
    // 1. Register accounts
    const acc1 = manager.registerAccount({
      id: "acc-alpha",
      label: "Account Alpha",
    });
    const acc2 = manager.registerAccount({
      id: "acc-beta",
      label: "Account Beta",
    });

    assert.equal(acc1.id, "acc-alpha");
    assert.equal(acc2.id, "acc-beta");
    assert.equal(acc1.sessionStatus, "unauthenticated");

    // 2. List accounts
    const list = manager.listAccounts();
    assert.equal(list.length, 2);
    assert.equal(list[0]?.isBusy, false);
    assert.equal(list[1]?.isBusy, false);

    // 3. Toggle account enabled
    manager.setAccountEnabled("acc-beta", false);
    const updatedAcc2 = manager.getAccount("acc-beta");
    assert.equal(updatedAcc2?.enabled, false);

    manager.setAccountEnabled("acc-beta", true);
    assert.equal(manager.getAccount("acc-beta")?.enabled, true);

    // 4. Setup Project and Bindings for both accounts
    const now = new Date().toISOString();
    db.db.exec(`
      INSERT INTO projects (id, name, created_at, updated_at)
      VALUES ('proj-multi', 'Multi-Account Project', '${now}', '${now}');

      UPDATE accounts SET session_status = 'authenticated' WHERE id IN ('acc-alpha', 'acc-beta');

      INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, created_at, updated_at)
      VALUES 
        ('bind-alpha', 'proj-multi', 'acc-alpha', 'flow-proj-a', 'verified', '${now}', '${now}'),
        ('bind-beta', 'proj-multi', 'acc-beta', 'flow-proj-b', 'verified', '${now}', '${now}');
    `);

    // 5. When both are idle, selectEligibleBinding returns one
    const selected1 = manager.selectEligibleBinding("proj-multi");
    assert.ok(selected1);
    assert.equal(selected1.bindingId, "bind-alpha");

    // 6. When acc-alpha is busy (lease acquired), it selects acc-beta!
    const leaseAlpha = await coordinator.acquire("acc-alpha", "busy_worker");
    const selected2 = manager.selectEligibleBinding("proj-multi");
    assert.ok(selected2);
    assert.equal(selected2.bindingId, "bind-beta");
    assert.equal(selected2.accountId, "acc-beta");

    // 7. When BOTH are busy, selectEligibleBinding returns null safely
    const leaseBeta = await coordinator.acquire("acc-beta", "busy_worker");
    const selectedNone = manager.selectEligibleBinding("proj-multi");
    assert.equal(selectedNone, null);

    // 8. Release lease and verify it becomes available again
    leaseAlpha.release();
    const selectedAfterRelease = manager.selectEligibleBinding("proj-multi");
    assert.ok(selectedAfterRelease);
    assert.equal(selectedAfterRelease.accountId, "acc-alpha");

    leaseBeta.release();
  } finally {
    db.close();
    rmSync(tempDir, { recursive: true, force: true });
  }
});
