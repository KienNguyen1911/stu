/**
 * AccountCoordinator
 * Enforces exclusive browser control per account.
 * SPEC.md Section 8: "AccountCoordinator là cửa duy nhất cấp quyền điều khiển một profile.
 * Upload, verify, login, reconcile và generation đều đi qua cửa này."
 */

export interface Lease {
  accountId: string;
  operation: string;
  acquiredAt: number;
  release: () => void;
}

export class AccountCoordinator {
  private readonly activeLeases = new Map<string, Lease>();
  private readonly waitQueues = new Map<
    string,
    Array<{
      operation: string;
      resolve: (lease: Lease) => void;
      reject: (err: Error) => void;
      timer: NodeJS.Timeout;
    }>
  >();

  /**
   * Acquires exclusive lease for a given account.
   * If account is currently busy, waits in FIFO queue up to timeoutMs.
   */
  public async acquire(
    accountId: string,
    operation: string,
    timeoutMs: number = 60_000,
  ): Promise<Lease> {
    const existing = this.activeLeases.get(accountId);
    if (!existing) {
      return this.createLease(accountId, operation);
    }

    return new Promise<Lease>((resolve, reject) => {
      let queue = this.waitQueues.get(accountId);
      if (!queue) {
        queue = [];
        this.waitQueues.set(accountId, queue);
      }

      const timer = setTimeout(() => {
        const q = this.waitQueues.get(accountId);
        if (q) {
          const idx = q.findIndex((item) => item.resolve === resolve);
          if (idx !== -1) {
            q.splice(idx, 1);
          }
        }
        reject(
          new Error(
            `Timeout waiting for account lease: ${accountId} (held by '${existing.operation}' for ${(
              (Date.now() - existing.acquiredAt) /
              1000
            ).toFixed(1)}s)`,
          ),
        );
      }, timeoutMs);

      queue.push({ operation, resolve, reject, timer });
    });
  }

  /**
   * Checks if an account currently has an active lease.
   */
  public isBusy(accountId: string): boolean {
    return this.activeLeases.has(accountId);
  }

  /**
   * Returns current active lease details for diagnostic/UI.
   */
  public getActiveLease(accountId: string): Lease | undefined {
    return this.activeLeases.get(accountId);
  }

  private createLease(accountId: string, operation: string): Lease {
    const lease: Lease = {
      accountId,
      operation,
      acquiredAt: Date.now(),
      release: () => this.releaseLease(accountId),
    };
    this.activeLeases.set(accountId, lease);
    return lease;
  }

  private releaseLease(accountId: string): void {
    const current = this.activeLeases.get(accountId);
    if (!current) {
      return;
    }

    this.activeLeases.delete(accountId);

    const queue = this.waitQueues.get(accountId);
    if (queue && queue.length > 0) {
      const next = queue.shift()!;
      clearTimeout(next.timer);
      const newLease = this.createLease(accountId, next.operation);
      next.resolve(newLease);
    }
  }
}
