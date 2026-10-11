import { mkdirSync, existsSync, rmSync } from "node:fs";
import { chromium, type BrowserContext, type Page } from "playwright-core";
import type { FlowDatabase } from "../infrastructure/db/database.js";
import type { AccountCoordinator } from "./accountCoordinator.js";
import { getAccountProfileDir, detectChromePath } from "../config.js";
import type { Account, SessionStatus } from "../domain/types.js";

export interface RegisterAccountParams {
  id: string;
  label: string;
  remoteProjectId?: string;
}

export interface UpdateAccountParams {
  label?: string;
  enabled?: boolean;
  remoteProjectId?: string;
}

export interface AccountWithRuntimeInfo extends Account {
  isBusy: boolean;
  activeOperation?: string;
  bindingsCount: number;
  remoteProjectId?: string;
  profileExistsOnDisk: boolean;
}

export class AccountManager {
  constructor(
    private readonly db: FlowDatabase,
    private readonly coordinator: AccountCoordinator,
    private readonly customChromePath?: string,
  ) {}

  /**
   * Registers a new account and initializes its isolated Chrome profile folder.
   * If remoteProjectId is provided, automatically establishes a binding to proj-default.
   */
  public registerAccount(params: RegisterAccountParams): Account {
    const { id, label, remoteProjectId } = params;
    const profilePath = getAccountProfileDir(id);
    mkdirSync(profilePath, { recursive: true });

    const now = new Date().toISOString();

    this.db.transaction(() => {
      this.db.db
        .prepare(
          `INSERT INTO accounts (id, label, profile_path, enabled, session_epoch, session_status, created_at, updated_at)
           VALUES (?, ?, ?, 1, 1, 'unauthenticated', ?, ?)`,
        )
        .run(id, label, profilePath, now, now);

      if (remoteProjectId) {
        const targetProjId = `proj-${id}`;
        this.db.db
          .prepare(
            `INSERT OR IGNORE INTO projects (id, name, description, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
          )
          .run(targetProjId, `Dự án Flow - ${label}`, `Tự động tạo cho ${label}`, now, now);

        const bindingId = `bind-${id}-${targetProjId}`;
        this.db.db
          .prepare(
            `INSERT OR REPLACE INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, last_verified_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'verified', ?, ?, ?)`,
          )
          .run(bindingId, targetProjId, id, remoteProjectId, now, now, now);
      }
    });

    return this.getAccount(id)!;
  }

  /**
   * Updates an existing account's metadata and project binding.
   */
  public updateAccount(id: string, params: UpdateAccountParams): Account {
    const acc = this.getAccount(id);
    if (!acc) {
      throw new Error(`Account not found: ${id}`);
    }

    const now = new Date().toISOString();

    this.db.transaction(() => {
      if (params.label !== undefined || params.enabled !== undefined) {
        const newLabel = params.label ?? acc.label;
        const newEnabled = params.enabled !== undefined ? (params.enabled ? 1 : 0) : (acc.enabled ? 1 : 0);
        this.db.db
          .prepare("UPDATE accounts SET label = ?, enabled = ?, updated_at = ? WHERE id = ?")
          .run(newLabel, newEnabled, now, id);
      }

      if (params.remoteProjectId !== undefined) {
        const targetProjId = `proj-${id}`;
        const label = params.label ?? acc.label;
        this.db.db
          .prepare(
            `INSERT OR IGNORE INTO projects (id, name, description, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
          )
          .run(targetProjId, `Dự án Flow - ${label}`, `Tự động tạo cho ${label}`, now, now);

        const existingBinding = this.db.db
          .prepare(
            `SELECT id FROM project_bindings 
             WHERE account_id = ? AND archived_at IS NULL`,
          )
          .get(id) as { id: string } | undefined;

        if (existingBinding) {
          this.db.db
            .prepare(
              `UPDATE project_bindings 
               SET project_id = ?, remote_project_id = ?, setup_state = 'verified', last_verified_at = ?, updated_at = ?
               WHERE id = ?`,
            )
            .run(targetProjId, params.remoteProjectId, now, now, existingBinding.id);
        } else {
          const bindingId = `bind-${id}-${targetProjId}`;
          this.db.db
            .prepare(
              `INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, last_verified_at, created_at, updated_at)
               VALUES (?, ?, ?, ?, 'verified', ?, ?, ?)`,
            )
            .run(bindingId, targetProjId, id, params.remoteProjectId, now, now, now);
        }
      }
    });

    return this.getAccount(id)!;
  }

  /**
   * Deletes an account, its project bindings, and optionally removes the disk profile folder.
   */
  public deleteAccount(id: string, deleteDiskProfile = false): void {
    if (this.coordinator.isBusy(id)) {
      throw new Error(`Cannot delete account '${id}' while an operation is currently active.`);
    }

    const acc = this.getAccount(id);
    if (!acc) {
      throw new Error(`Account not found: ${id}`);
    }

    this.db.transaction(() => {
      this.db.db.prepare("DELETE FROM project_bindings WHERE account_id = ?").run(id);
      this.db.db.prepare("DELETE FROM accounts WHERE id = ?").run(id);
    });

    if (deleteDiskProfile && acc.profilePath && existsSync(acc.profilePath)) {
      rmSync(acc.profilePath, { recursive: true, force: true });
    }
  }

  /**
   * Retrieves an account by ID.
   */
  public getAccount(id: string): Account | null {
    const row = this.db.db
      .prepare("SELECT * FROM accounts WHERE id = ?")
      .get(id) as any;

    if (!row) return null;
    return this.mapAccount(row);
  }

  /**
   * Lists all accounts with real-time coordinator lease status and remote project info.
   */
  public listAccounts(): AccountWithRuntimeInfo[] {
    const rows = this.db.db
      .prepare(
        `SELECT a.*, COUNT(b.id) as bindings_count, MAX(b.remote_project_id) as remote_project_id
         FROM accounts a
         LEFT JOIN project_bindings b ON a.id = b.account_id AND b.archived_at IS NULL
         GROUP BY a.id
         ORDER BY a.created_at ASC`,
      )
      .all() as any[];

    return rows.map((row) => {
      const acc = this.mapAccount(row);
      const isBusy = this.coordinator.isBusy(acc.id);
      const activeLease = this.coordinator.getActiveLease(acc.id);
      const profileExistsOnDisk = Boolean(acc.profilePath && existsSync(acc.profilePath));

      return {
        ...acc,
        isBusy,
        activeOperation: activeLease?.operation,
        bindingsCount: row.bindings_count || 0,
        remoteProjectId: row.remote_project_id || undefined,
        profileExistsOnDisk,
      };
    });
  }

  /**
   * Enables or disables an account.
   */
  public setAccountEnabled(id: string, enabled: boolean): void {
    const now = new Date().toISOString();
    this.db.transaction(() => {
      this.db.db
        .prepare("UPDATE accounts SET enabled = ?, updated_at = ? WHERE id = ?")
        .run(enabled ? 1 : 0, now, id);
    });
  }

  /**
   * Non-interactive probe to check if an account's session is authenticated on Google Flow.
   * Acquires exclusive lease, launches headless browser, and inspects auth state.
   */
  public async checkAccountSession(id: string): Promise<SessionStatus> {
    const acc = this.getAccount(id);
    if (!acc) {
      throw new Error(`Account not found: ${id}`);
    }

    const lease = await this.coordinator.acquire(id, "check_session", 30_000);
    const chromePath = detectChromePath(this.customChromePath);

    try {
      this.updateSessionStatus(id, "checking");

      const context: BrowserContext = await chromium.launchPersistentContext(
        acc.profilePath,
        {
          executablePath: chromePath,
          headless: true,
          viewport: { width: 1280, height: 800 },
          args: ["--disable-blink-features=AutomationControlled"],
        },
      );

      const page: Page = context.pages()[0] || (await context.newPage());
      let status: SessionStatus = "unauthenticated";

      try {
        await page.goto("https://flow.google.com", {
          waitUntil: "domcontentloaded",
          timeout: 25_000,
        });
        await page.waitForTimeout(3000);

        const currentUrl = page.url();
        if (
          currentUrl.includes("accounts.google.com") ||
          currentUrl.includes("/about")
        ) {
          status = "unauthenticated";
        } else {
          // Check for user avatar or editor elements
          const hasAuthSignals = await page.evaluate(() => {
            const hasAvatar = !!document.querySelector(
              'img[src*="googleusercontent.com"], button[aria-label*="Google Account"], button[aria-label*="Tài khoản Google"]',
            );
            const hasEditor = !!document.querySelector(
              "flow-rich-text-editor, flow-prompt-box, button.add-menu-trigger",
            );
            return hasAvatar || hasEditor;
          });

          status = hasAuthSignals ? "authenticated" : "needs_attention";
        }
      } finally {
        await context.close().catch(() => {});
      }

      this.updateSessionStatus(id, status);
      return status;
    } catch (err: any) {
      this.updateSessionStatus(id, "needs_attention");
      throw err;
    } finally {
      lease.release();
    }
  }

  /**
   * Selects the optimal active account and project binding for a given project.
   */
  public selectEligibleBinding(
    projectId: string,
    pinnedBindingId?: string | null,
  ): {
    bindingId: string;
    accountId: string;
    remoteProjectId: string;
    profilePath: string;
    sessionEpoch: number;
  } | null {
    if (pinnedBindingId) {
      const binding = this.db.db
        .prepare(
          `SELECT b.*, a.profile_path, a.session_epoch, a.session_status, a.enabled
           FROM project_bindings b
           JOIN accounts a ON b.account_id = a.id
           WHERE b.id = ? AND b.project_id = ? AND b.archived_at IS NULL`,
        )
        .get(pinnedBindingId, projectId) as any;

      if (!binding || !binding.enabled || !binding.remote_project_id) {
        return null;
      }
      return {
        bindingId: binding.id,
        accountId: binding.account_id,
        remoteProjectId: binding.remote_project_id,
        profilePath: binding.profile_path,
        sessionEpoch: binding.session_epoch,
      };
    }

    const bindings = this.db.db
      .prepare(
        `SELECT b.*, a.profile_path, a.session_epoch, a.session_status, a.enabled, a.updated_at as account_updated_at
         FROM project_bindings b
         JOIN accounts a ON b.account_id = a.id
         WHERE b.project_id = ? AND b.archived_at IS NULL AND a.enabled = 1 AND b.remote_project_id IS NOT NULL
         ORDER BY 
           CASE WHEN a.session_status = 'authenticated' THEN 0 ELSE 1 END ASC,
           a.updated_at ASC`,
      )
      .all(projectId) as any[];

    if (bindings.length === 0) {
      return null;
    }

    for (const b of bindings) {
      if (!this.coordinator.isBusy(b.account_id)) {
        return {
          bindingId: b.id,
          accountId: b.account_id,
          remoteProjectId: b.remote_project_id,
          profilePath: b.profile_path,
          sessionEpoch: b.session_epoch,
        };
      }
    }

    return null;
  }

  private updateSessionStatus(id: string, status: SessionStatus): void {
    const now = new Date().toISOString();
    this.db.transaction(() => {
      this.db.db
        .prepare(
          "UPDATE accounts SET session_status = ?, updated_at = ? WHERE id = ?",
        )
        .run(status, now, id);
    });
  }

  private mapAccount(row: any): Account {
    return {
      id: row.id,
      label: row.label,
      profilePath: row.profile_path,
      enabled: Boolean(row.enabled),
      sessionEpoch: row.session_epoch,
      sessionStatus: row.session_status,
      observedPrincipal: row.observed_principal,
      identityEvidence: row.identity_evidence ?? null,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
