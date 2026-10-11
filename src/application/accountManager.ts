import { mkdirSync } from "node:fs";
import { chromium, type BrowserContext, type Page } from "playwright-core";
import type { FlowDatabase } from "../infrastructure/db/database.js";
import type { AccountCoordinator } from "./accountCoordinator.js";
import { getAccountProfileDir } from "../config.js";
import type { Account, SessionStatus } from "../domain/types.js";

const CHROME_EXECUTABLE_PATH =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

export interface RegisterAccountParams {
  id: string;
  label: string;
}

export interface AccountWithRuntimeInfo extends Account {
  isBusy: boolean;
  activeOperation?: string;
  bindingsCount: number;
}

export class AccountManager {
  constructor(
    private readonly db: FlowDatabase,
    private readonly coordinator: AccountCoordinator,
  ) {}

  /**
   * Registers a new account and initializes its isolated Chrome profile folder.
   */
  public registerAccount(params: RegisterAccountParams): Account {
    const { id, label } = params;
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
    });

    return this.getAccount(id)!;
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
   * Lists all accounts with real-time coordinator lease status.
   */
  public listAccounts(): AccountWithRuntimeInfo[] {
    const rows = this.db.db
      .prepare(
        `SELECT a.*, COUNT(b.id) as bindings_count 
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

      return {
        ...acc,
        isBusy,
        activeOperation: activeLease?.operation,
        bindingsCount: row.bindings_count || 0,
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
    const now = new Date().toISOString();

    try {
      this.updateSessionStatus(id, "checking");

      const context: BrowserContext = await chromium.launchPersistentContext(
        acc.profilePath,
        {
          executablePath: CHROME_EXECUTABLE_PATH,
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
   * Prioritizes:
   * 1. Enabled accounts with 'authenticated' session status.
   * 2. Accounts that are currently idle (NOT busy in coordinator).
   * 3. Round-robin / least recently updated account.
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

    const candidates = this.db.db
      .prepare(
        `SELECT b.*, a.profile_path, a.session_epoch, a.session_status, a.updated_at as account_updated_at
         FROM project_bindings b
         JOIN accounts a ON b.account_id = a.id
         WHERE b.project_id = ? 
           AND b.archived_at IS NULL 
           AND b.setup_state = 'verified'
           AND b.remote_project_id IS NOT NULL
           AND a.enabled = 1
           AND a.session_status = 'authenticated'
         ORDER BY a.updated_at ASC`,
      )
      .all(projectId) as any[];

    if (candidates.length === 0) {
      // Fallback: check if there are bindings with enabled accounts (even if status is not explicitly authenticated yet)
      const fallbackCandidates = this.db.db
        .prepare(
          `SELECT b.*, a.profile_path, a.session_epoch, a.session_status, a.updated_at as account_updated_at
           FROM project_bindings b
           JOIN accounts a ON b.account_id = a.id
           WHERE b.project_id = ? 
             AND b.archived_at IS NULL 
             AND b.setup_state = 'verified'
             AND b.remote_project_id IS NOT NULL
             AND a.enabled = 1
           ORDER BY a.updated_at ASC`,
        )
        .all(projectId) as any[];

      if (fallbackCandidates.length === 0) return null;

      // Select first idle fallback account
      for (const candidate of fallbackCandidates) {
        if (!this.coordinator.isBusy(candidate.account_id)) {
          return {
            bindingId: candidate.id,
            accountId: candidate.account_id,
            remoteProjectId: candidate.remote_project_id,
            profilePath: candidate.profile_path,
            sessionEpoch: candidate.session_epoch,
          };
        }
      }
      return null;
    }

    // Pick first candidate whose account is not currently busy
    for (const candidate of candidates) {
      if (!this.coordinator.isBusy(candidate.account_id)) {
        return {
          bindingId: candidate.id,
          accountId: candidate.account_id,
          remoteProjectId: candidate.remote_project_id,
          profilePath: candidate.profile_path,
          sessionEpoch: candidate.session_epoch,
        };
      }
    }

    // All eligible accounts are busy
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
      sessionEpoch: Number(row.session_epoch),
      observedPrincipal: row.observed_principal,
      identityEvidence: row.identity_evidence,
      sessionStatus: row.session_status as SessionStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };
  }
}
