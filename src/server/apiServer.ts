import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
  type Server,
} from "node:http";
import { URL } from "node:url";
import type { FlowDatabase } from "../infrastructure/db/database.js";
import type { BlobStore } from "../infrastructure/blobs/blobStore.js";
import type { AccountManager } from "../application/accountManager.js";
import type { JobQueue } from "../application/jobQueue.js";
import type { JobRunner } from "../application/jobRunner.js";
import { getDashboardHtml } from "./dashboardHtml.js";

export interface ApiServerOptions {
  port?: number;
  host?: string;
}

export class ApiServer {
  private server: Server | null = null;
  private readonly port: number;
  private readonly host: string;
  private readonly startTime = Date.now();

  constructor(
    private readonly db: FlowDatabase,
    private readonly blobStore: BlobStore,
    private readonly accountManager: AccountManager,
    private readonly runner: JobRunner,
    private readonly queue: JobQueue,
    options: ApiServerOptions = {},
  ) {
    this.port = options.port || 3100;
    this.host = options.host || "0.0.0.0";
  }

  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server = createServer((req, res) => this.handleRequest(req, res));
      this.server.listen(this.port, this.host, () => {
        console.log(
          `[ApiServer] REST API & Dashboard đang chạy tại: http://localhost:${this.port}`,
        );
        resolve();
      });
    });
  }

  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) return resolve();
      this.server.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  private async handleRequest(
    req: IncomingMessage,
    res: ServerResponse,
  ): Promise<void> {
    // Enable CORS for API clients
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, OPTIONS",
    );
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization",
    );

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.end();
      return;
    }

    const reqUrl = new URL(
      req.url || "/",
      `http://${req.headers.host || "localhost"}`,
    );
    const pathname = reqUrl.pathname;
    const method = req.method || "GET";

    try {
      // 1. Health & Status
      if (method === "GET" && pathname === "/api/health") {
        return this.sendJson(res, 200, {
          status: "ok",
          uptimeSeconds: Math.floor((Date.now() - this.startTime) / 1000),
          timestamp: new Date().toISOString(),
          queue: this.queue.getStats(),
        });
      }

      // 2. Accounts
      if (method === "GET" && pathname === "/api/accounts") {
        const accounts = this.accountManager.listAccounts();
        return this.sendJson(res, 200, { accounts });
      }

      if (method === "POST" && pathname === "/api/accounts") {
        const body = await this.readJsonBody(req);
        if (!body.id || !body.label) {
          return this.sendJson(res, 400, {
            error: "Missing required fields: 'id', 'label'",
          });
        }
        const acc = this.accountManager.registerAccount({
          id: body.id,
          label: body.label,
        });
        return this.sendJson(res, 201, { account: acc });
      }

      const accountEnableMatch = pathname.match(
        /^\/api\/accounts\/([^/]+)\/enable$/,
      );
      if (method === "POST" && accountEnableMatch) {
        const accId = accountEnableMatch[1]!;
        this.accountManager.setAccountEnabled(accId, true);
        return this.sendJson(res, 200, {
          success: true,
          accountId: accId,
          enabled: true,
        });
      }

      const accountDisableMatch = pathname.match(
        /^\/api\/accounts\/([^/]+)\/disable$/,
      );
      if (method === "POST" && accountDisableMatch) {
        const accId = accountDisableMatch[1]!;
        this.accountManager.setAccountEnabled(accId, false);
        return this.sendJson(res, 200, {
          success: true,
          accountId: accId,
          enabled: false,
        });
      }

      const accountCheckMatch = pathname.match(
        /^\/api\/accounts\/([^/]+)\/check$/,
      );
      if (method === "POST" && accountCheckMatch) {
        const accId = accountCheckMatch[1]!;
        const status = await this.accountManager.checkAccountSession(accId);
        return this.sendJson(res, 200, {
          accountId: accId,
          sessionStatus: status,
        });
      }

      // 3. Projects & Bindings
      if (method === "GET" && pathname === "/api/projects") {
        const projects = this.db.db
          .prepare("SELECT * FROM projects ORDER BY created_at DESC")
          .all() as any[];
        const bindings = this.db.db
          .prepare("SELECT * FROM project_bindings WHERE archived_at IS NULL")
          .all() as any[];
        return this.sendJson(res, 200, { projects, bindings });
      }

      if (method === "POST" && pathname === "/api/projects") {
        const body = await this.readJsonBody(req);
        if (!body.id || !body.name) {
          return this.sendJson(res, 400, {
            error: "Missing required fields: 'id', 'name'",
          });
        }
        const now = new Date().toISOString();
        this.db.transaction(() => {
          this.db.db
            .prepare(
              `INSERT INTO projects (id, name, description, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
            )
            .run(body.id, body.name, body.description || null, now, now);
        });
        return this.sendJson(res, 201, { projectId: body.id, name: body.name });
      }

      const projectBindingsMatch = pathname.match(
        /^\/api\/projects\/([^/]+)\/bindings$/,
      );
      if (method === "POST" && projectBindingsMatch) {
        const projId = projectBindingsMatch[1]!;
        const body = await this.readJsonBody(req);
        if (!body.accountId || !body.remoteProjectId) {
          return this.sendJson(res, 400, {
            error: "Missing required fields: 'accountId', 'remoteProjectId'",
          });
        }
        const bindingId = body.id || `bind-${Date.now()}`;
        const now = new Date().toISOString();
        this.db.transaction(() => {
          this.db.db
            .prepare(
              `INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'verified', ?, ?)`,
            )
            .run(
              bindingId,
              projId,
              body.accountId,
              body.remoteProjectId,
              now,
              now,
            );
        });
        return this.sendJson(res, 201, {
          bindingId,
          projectId: projId,
          accountId: body.accountId,
        });
      }

      // 4. Asset Ingestion & Blobs
      if (method === "POST" && pathname === "/api/assets/upload") {
        const contentType = req.headers["content-type"] || "";
        let buffer: Buffer;

        if (contentType.includes("application/json")) {
          const body = await this.readJsonBody(req);
          if (!body.data) {
            return this.sendJson(res, 400, {
              error: "Missing 'data' field (base64 encoded binary)",
            });
          }
          buffer = Buffer.from(body.data, "base64");
        } else {
          buffer = await this.readRawBody(req);
        }

        if (buffer.length === 0) {
          return this.sendJson(res, 400, { error: "Empty upload payload" });
        }

        const meta = this.blobStore.put(buffer);

        let assetRow = this.db.db
          .prepare("SELECT id FROM assets WHERE content_hash = ?")
          .get(meta.contentHash) as { id: string } | undefined;

        let assetId = assetRow
          ? assetRow.id
          : `asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
        if (!assetRow) {
          const now = new Date().toISOString();
          this.db.transaction(() => {
            this.db.db
              .prepare(
                `INSERT INTO assets (id, content_hash, blob_key, mime_type, size_bytes, availability, created_at)
                 VALUES (?, ?, ?, 'image/png', ?, 'ready', ?)`,
              )
              .run(
                assetId,
                meta.contentHash,
                meta.blobKey,
                meta.sizeBytes,
                now,
              );
          });
        }

        return this.sendJson(res, 201, {
          assetId,
          contentHash: meta.contentHash,
          sizeBytes: meta.sizeBytes,
          blobUrl: `/api/assets/${assetId}/blob`,
        });
      }

      const assetBlobMatch = pathname.match(/^\/api\/assets\/([^/]+)\/blob$/);
      if (method === "GET" && assetBlobMatch) {
        const assetId = assetBlobMatch[1]!;
        const asset = this.db.db
          .prepare("SELECT * FROM assets WHERE id = ?")
          .get(assetId) as any;
        if (!asset) {
          return this.sendJson(res, 404, {
            error: `Asset not found: ${assetId}`,
          });
        }
        const data = this.blobStore.get(asset.content_hash);
        res.statusCode = 200;
        res.setHeader("Content-Type", asset.mime_type || "image/png");
        res.setHeader("Content-Length", data.length);
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        res.end(data);
        return;
      }

      const assetMetaMatch = pathname.match(/^\/api\/assets\/([^/]+)$/);
      if (method === "GET" && assetMetaMatch) {
        const assetId = assetMetaMatch[1]!;
        const asset = this.db.db
          .prepare("SELECT * FROM assets WHERE id = ?")
          .get(assetId) as any;
        if (!asset) {
          return this.sendJson(res, 404, {
            error: `Asset not found: ${assetId}`,
          });
        }
        return this.sendJson(res, 200, { asset });
      }

      // 5. Jobs (T2I & I2I)
      if (method === "POST" && pathname === "/api/jobs") {
        const body = await this.readJsonBody(req);
        if (!body.projectId || !body.prompt) {
          return this.sendJson(res, 400, {
            error: "Missing required fields: 'projectId', 'prompt'",
          });
        }

        const idempotencyKey =
          body.idempotencyKey ||
          `api-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        const { jobId, created } = this.queue.enqueue({
          projectId: body.projectId,
          idempotencyKey,
          prompt: body.prompt,
          model: body.model || "imagen-3",
          options: body.options || {},
          inputAssetIds: body.inputAssetIds || [],
          pinnedBindingId: body.pinnedBindingId,
        });

        return this.sendJson(res, 202, {
          jobId,
          created,
          status: "queued",
          idempotencyKey,
          checkUrl: `/api/jobs/${jobId}`,
        });
      }

      const jobDetailMatch = pathname.match(/^\/api\/jobs\/([^/]+)$/);
      if (method === "GET" && jobDetailMatch) {
        const jobId = jobDetailMatch[1]!;
        const job = this.db.db
          .prepare("SELECT * FROM jobs WHERE id = ?")
          .get(jobId) as any;
        if (!job) {
          return this.sendJson(res, 404, { error: `Job not found: ${jobId}` });
        }

        const inputs = this.db.db
          .prepare(
            "SELECT * FROM job_inputs WHERE job_id = ? ORDER BY position ASC",
          )
          .all(jobId) as any[];
        const attempts = this.db.db
          .prepare(
            "SELECT * FROM job_attempts WHERE job_id = ? ORDER BY attempt_number ASC",
          )
          .all(jobId) as any[];
        const outputs = this.db.db
          .prepare(
            `SELECT o.*, a.content_hash, a.size_bytes 
           FROM job_outputs o
           LEFT JOIN assets a ON o.local_asset_id = a.id
           WHERE o.attempt_id IN (SELECT id FROM job_attempts WHERE job_id = ?)`,
          )
          .all(jobId) as any[];

        const formattedOutputs = outputs.map((out) => ({
          ...out,
          imageUrl: out.local_asset_id
            ? `/api/assets/${out.local_asset_id}/blob`
            : null,
        }));

        return this.sendJson(res, 200, {
          job,
          inputs,
          attempts,
          outputs: formattedOutputs,
        });
      }

      if (method === "GET" && pathname === "/api/jobs") {
        const status = reqUrl.searchParams.get("status");
        const limit = Math.min(
          Number(reqUrl.searchParams.get("limit") || 50),
          100,
        );

        let query = "SELECT * FROM jobs";
        const params: any[] = [];
        if (status) {
          query += " WHERE status = ?";
          params.push(status);
        }
        query += " ORDER BY created_at DESC LIMIT ?";
        params.push(limit);

        const jobs = this.db.db.prepare(query).all(...params) as any[];

        // Include outputs inline so caller doesn't need N+1 requests
        const jobsWithOutputs = jobs.map((job) => {
          const outputs = this.db.db
            .prepare(
              `SELECT o.id, o.local_asset_id, o.download_status, a.content_hash, a.size_bytes
               FROM job_outputs o
               LEFT JOIN assets a ON o.local_asset_id = a.id
               WHERE o.attempt_id IN (SELECT id FROM job_attempts WHERE job_id = ?)
               ORDER BY o.position ASC`,
            )
            .all(job.id) as any[];
          return {
            ...job,
            outputs: outputs.map((out) => ({
              ...out,
              imageUrl: out.local_asset_id
                ? `/api/assets/${out.local_asset_id}/blob`
                : null,
            })),
          };
        });

        return this.sendJson(res, 200, { jobs: jobsWithOutputs });
      }

      // 6. Built-in Dashboard UI
      if (method === "GET" && (pathname === "/" || pathname === "/dashboard")) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(this.renderDashboardHtml());
        return;
      }

      // 404
      return this.sendJson(res, 404, {
        error: `Route not found: ${method} ${pathname}`,
      });
    } catch (err: any) {
      console.error(`[ApiServer Error] ${method} ${pathname}:`, err.message);
      return this.sendJson(res, 500, {
        error: err.message || "Internal server error",
      });
    }
  }

  private sendJson(res: ServerResponse, status: number, data: any): void {
    const json = JSON.stringify(data, null, 2);
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Content-Length", Buffer.byteLength(json));
    res.end(json);
  }

  private async readJsonBody(req: IncomingMessage): Promise<any> {
    const raw = await this.readRawBody(req);
    if (raw.length === 0) return {};
    return JSON.parse(raw.toString("utf-8"));
  }

  private async readRawBody(req: IncomingMessage): Promise<Buffer> {
    const chunks: Buffer[] = [];
    for await (const chunk of req) {
      chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
  }

  private renderDashboardHtml(): string {
    return getDashboardHtml();
  }
}
