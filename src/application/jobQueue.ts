import type { FlowDatabase } from "../infrastructure/db/database.js";
import type { JobRunner, SubmitJobParams } from "./jobRunner.js";
import type { AccountManager } from "./accountManager.js";
import type { AccountCoordinator } from "./accountCoordinator.js";

export interface JobQueueOptions {
  pollIntervalMs?: number;
}

export interface QueueStats {
  queuedCount: number;
  runningCount: number;
  activeJobIds: string[];
}

export class JobQueue {
  private isRunning = false;
  private timer: NodeJS.Timeout | null = null;
  private readonly runningJobIds = new Set<string>();
  private readonly processingPromises = new Map<string, Promise<void>>();

  constructor(
    private readonly db: FlowDatabase,
    private readonly runner: JobRunner,
    private readonly accountManager: AccountManager,
    private readonly coordinator: AccountCoordinator,
    private readonly options: JobQueueOptions = {},
  ) {}

  /**
   * Submits a job and immediately triggers the queue worker.
   */
  public enqueue(params: SubmitJobParams): {
    jobId: string;
    created: boolean;
  } {
    const result = this.runner.submitJob(params);
    if (result.created && this.isRunning) {
      setImmediate(() => {
        if (this.isRunning) {
          this.tick().catch(() => {});
        }
      });
    }
    return result;
  }

  /**
   * Starts background processing.
   */
  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    const interval = this.options.pollIntervalMs || 2000;

    const loop = async () => {
      if (!this.isRunning) return;
      try {
        await this.tick();
      } catch (err: any) {
        console.error("[JobQueue] Lỗi trong vòng lặp queue:", err.message);
      } finally {
        if (this.isRunning) {
          this.timer = setTimeout(loop, interval);
        }
      }
    };

    this.timer = setTimeout(loop, 100);
    console.log(
      `[JobQueue] Đã khởi chạy hàng đợi công việc (chu kỳ poll: ${interval}ms)`,
    );
  }

  /**
   * Gracefully stops the queue and waits for in-flight jobs to complete.
   */
  public async stop(): Promise<void> {
    this.isRunning = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    if (this.processingPromises.size > 0) {
      console.log(
        `[JobQueue] Đang chờ ${this.processingPromises.size} tác vụ đang chạy hoàn tất...`,
      );
      await Promise.allSettled(Array.from(this.processingPromises.values()));
    }
    // Give event loop a microtick to clear any pending setImmediate callbacks
    await new Promise((r) => setImmediate(r));
    console.log("[JobQueue] Đã dừng hàng đợi công việc.");
  }

  /**
   * Checks for queued jobs and dispatches to available accounts concurrently.
   */
  public async tick(): Promise<void> {
    if (!this.isRunning) return;

    const queuedJobs = this.db.db
      .prepare(
        `SELECT id, project_id, pinned_binding_id 
         FROM jobs 
         WHERE status = 'queued' 
         ORDER BY created_at ASC`,
      )
      .all() as Array<{
      id: string;
      project_id: string;
      pinned_binding_id: string | null;
    }>;

    for (const job of queuedJobs) {
      // Skip if this job is already actively executing in memory
      if (this.runningJobIds.has(job.id)) {
        continue;
      }

      // Check for available, non-busy account binding
      const binding = this.accountManager.selectEligibleBinding(
        job.project_id,
        job.pinned_binding_id,
      );

      if (!binding) {
        // No available idle account for this job at this moment; continue checking other jobs
        continue;
      }

      // Found an eligible idle account! Dispatch job execution in a non-blocking worker slot
      this.dispatchJob(job.id, binding);
    }
  }

  /**
   * Returns runtime statistics of the queue.
   */
  public getStats(): {
    queuedCount: number;
    runningCount: number;
    activeJobIds: string[];
  } {
    const queuedRow = this.db.db
      .prepare("SELECT COUNT(*) as cnt FROM jobs WHERE status = 'queued'")
      .get() as any;

    return {
      queuedCount: queuedRow?.cnt || 0,
      runningCount: this.runningJobIds.size,
      activeJobIds: Array.from(this.runningJobIds),
    };
  }

  private dispatchJob(
    jobId: string,
    binding: {
      bindingId: string;
      accountId: string;
      remoteProjectId: string;
      profilePath: string;
      sessionEpoch: number;
    },
  ): void {
    this.runningJobIds.add(jobId);
    console.log(
      `[JobQueue] Bắt đầu xử lý Job ${jobId} trên Account ${binding.accountId}...`,
    );

    const promise = (async () => {
      try {
        await this.runner.executeJob(jobId, {
          id: binding.bindingId,
          accountId: binding.accountId,
          remoteProjectId: binding.remoteProjectId,
          profilePath: binding.profilePath,
          sessionEpoch: binding.sessionEpoch,
        });
        console.log(`[JobQueue] Job ${jobId} hoàn thành thành công!`);
      } catch (err: any) {
        console.error(`[JobQueue] Job ${jobId} thất bại:`, err.message);
      } finally {
        this.runningJobIds.delete(jobId);
        this.processingPromises.delete(jobId);
        // An account was freed up; trigger tick immediately for any waiting jobs
        if (this.isRunning) {
          setImmediate(() => {
            if (this.isRunning) {
              this.tick().catch(() => {});
            }
          });
        }
      }
    })();

    this.processingPromises.set(jobId, promise);
  }
}
