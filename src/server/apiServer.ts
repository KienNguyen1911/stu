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
import { ManualLoginHelper } from "../application/manualLogin.js";
import { getDashboardHtml } from "./dashboardHtml.js";

export interface ApiServerOptions {
  port?: number;
  host?: string;
  manualLoginHelper?: ManualLoginHelper;
}

export class ApiServer {
  private server: Server | null = null;
  private readonly port: number;
  private readonly host: string;
  private readonly startTime = Date.now();
  private readonly manualLoginHelper: ManualLoginHelper;
  private readonly activeLoginSessions = new Map<
    string,
    {
      status: "launching" | "running" | "succeeded" | "failed" | "error";
      message: string;
      startedAt: number;
      result?: any;
      error?: string;
    }
  >();

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
    this.manualLoginHelper =
      options.manualLoginHelper || new ManualLoginHelper();
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
      "Content-Type, Authorization, x-display-name, x-project-id",
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
          remoteProjectId: body.remoteProjectId,
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

      const accountLoginMatch = pathname.match(
        /^\/api\/accounts\/([^/]+)\/login$/,
      );
      if (method === "POST" && accountLoginMatch) {
        const accId = accountLoginMatch[1]!;
        const acc = this.accountManager.getAccount(accId);
        if (!acc) {
          return this.sendJson(res, 404, { error: `Account not found: ${accId}` });
        }

        const currentSession = this.activeLoginSessions.get(accId);
        if (
          currentSession &&
          (currentSession.status === "launching" || currentSession.status === "running") &&
          Date.now() - currentSession.startedAt < 10 * 60 * 1000
        ) {
          return this.sendJson(res, 200, {
            success: true,
            alreadyRunning: true,
            session: currentSession,
          });
        }

        this.activeLoginSessions.set(accId, {
          status: "launching",
          message: "Đang khởi chạy trình duyệt Chrome...",
          startedAt: Date.now(),
        });

        // Launch in background
        (async () => {
          try {
            const result = await this.manualLoginHelper.launchLoginSession({
              profileDir: acc.profilePath,
              onStatusChange: (statusMsg) => {
                this.activeLoginSessions.set(accId, {
                  status: "running",
                  message: statusMsg,
                  startedAt: Date.now(),
                });
              },
            });

            if (result.success) {
              const now = new Date().toISOString();
              this.db.transaction(() => {
                this.db.db
                  .prepare(
                    `UPDATE accounts 
                     SET session_status = 'authenticated',
                         observed_principal = COALESCE(?, observed_principal),
                         updated_at = ?
                     WHERE id = ?`,
                  )
                  .run(result.email || null, now, accId);

                if (result.remoteProjectId) {
                  const targetProjId = `proj-${accId}`;
                  const accRow = this.db.db
                    .prepare("SELECT label FROM accounts WHERE id = ?")
                    .get(accId) as { label: string } | undefined;
                  const label = accRow?.label || accId;

                  this.db.db
                    .prepare(
                      `INSERT OR IGNORE INTO projects (id, name, description, created_at, updated_at)
                       VALUES (?, ?, ?, ?, ?)`,
                    )
                    .run(targetProjId, `Dự án Flow - ${label}`, `Tài khoản ${label}`, now, now);

                  const existingBinding = this.db.db
                    .prepare(
                      `SELECT id FROM project_bindings 
                       WHERE account_id = ? AND archived_at IS NULL`,
                    )
                    .get(accId) as { id: string } | undefined;

                  if (existingBinding) {
                    this.db.db
                      .prepare(
                        `UPDATE project_bindings 
                         SET project_id = ?, remote_project_id = ?, setup_state = 'verified', last_verified_at = ?, updated_at = ?
                         WHERE id = ?`,
                      )
                      .run(targetProjId, result.remoteProjectId, now, now, existingBinding.id);
                  } else {
                    const bindingId = `bind-${accId}-${targetProjId}`;
                    this.db.db
                      .prepare(
                        `INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, last_verified_at, created_at, updated_at)
                         VALUES (?, ?, ?, ?, 'verified', ?, ?, ?)`,
                      )
                      .run(
                        bindingId,
                        targetProjId,
                        accId,
                        result.remoteProjectId,
                        now,
                        now,
                        now,
                      );
                  }
                }
              });

              this.activeLoginSessions.set(accId, {
                status: "succeeded",
                message: "Đăng nhập và liên kết Flow Project thành công!",
                startedAt: Date.now(),
                result,
              });
            } else {
              this.activeLoginSessions.set(accId, {
                status: "failed",
                message: "Phiên đăng nhập chưa hoàn tất hoặc đã đóng.",
                startedAt: Date.now(),
              });
            }
          } catch (err: any) {
            this.activeLoginSessions.set(accId, {
              status: "error",
              message: err.message,
              startedAt: Date.now(),
              error: err.message,
            });
          }
        })();

        return this.sendJson(res, 202, {
          success: true,
          message: "Đã mở trình duyệt Chrome cho tài khoản. Vui lòng đăng nhập Google.",
          accountId: accId,
        });
      }

      const accountLoginStatusMatch = pathname.match(
        /^\/api\/accounts\/([^/]+)\/login-status$/,
      );
      if (method === "GET" && accountLoginStatusMatch) {
        const accId = accountLoginStatusMatch[1]!;
        const session = this.activeLoginSessions.get(accId) || {
          status: "idle",
          message: "Chưa có phiên đăng nhập nào đang chạy.",
        };
        return this.sendJson(res, 200, { session });
      }

      // Single Account GET / PUT / DELETE
      const accountIdMatch = pathname.match(/^\/api\/accounts\/([^/]+)$/);
      if (accountIdMatch) {
        const accId = accountIdMatch[1]!;

        if (method === "GET") {
          const acc = this.accountManager.getAccount(accId);
          if (!acc) return this.sendJson(res, 404, { error: `Account not found: ${accId}` });
          return this.sendJson(res, 200, { account: acc });
        }

        if (method === "PUT" || method === "PATCH") {
          const body = await this.readJsonBody(req);
          const updated = this.accountManager.updateAccount(accId, {
            label: body.label,
            enabled: body.enabled,
            remoteProjectId: body.remoteProjectId,
          });
          return this.sendJson(res, 200, { success: true, account: updated });
        }

        if (method === "DELETE") {
          let deleteDisk = reqUrl.searchParams.get("deleteDisk") === "true";
          try {
            const body = await this.readJsonBody(req);
            if (body?.deleteDisk !== undefined) {
              deleteDisk = Boolean(body.deleteDisk);
            }
          } catch {}

          this.accountManager.deleteAccount(accId, deleteDisk);
          return this.sendJson(res, 200, {
            success: true,
            accountId: accId,
            deletedDiskProfile: deleteDisk,
          });
        }
      }

      // 3. Projects & Bindings
      if (method === "GET" && pathname === "/api/projects") {
        const urlObj = new URL(req.url || "/", "http://localhost");
        const accountFilter = urlObj.searchParams.get("accountId");

        let sql = `
          SELECT p.*,
                 b.id as binding_id,
                 b.account_id,
                 a.label as account_label,
                 b.remote_project_id,
                 (SELECT COUNT(DISTINCT id) FROM jobs WHERE project_id = p.id) as job_count,
                 (SELECT COUNT(DISTINCT asset_id) FROM project_assets WHERE project_id = p.id) as uploaded_assets_count,
                 (SELECT COUNT(DISTINCT jo.id) FROM jobs j JOIN job_attempts ja ON j.id = ja.job_id JOIN job_outputs jo ON ja.id = jo.attempt_id WHERE j.project_id = p.id AND jo.local_asset_id IS NOT NULL) as generated_images_count
          FROM projects p
          LEFT JOIN project_bindings b ON p.id = b.project_id AND b.archived_at IS NULL
          LEFT JOIN accounts a ON b.account_id = a.id
          WHERE p.archived_at IS NULL
        `;

        const params: any[] = [];
        if (accountFilter) {
          sql += ` AND b.account_id = ?`;
          params.push(accountFilter);
        }

        sql += ` ORDER BY p.created_at DESC`;

        const projects = this.db.db.prepare(sql).all(...params) as any[];
        const bindings = this.db.db
          .prepare("SELECT * FROM project_bindings WHERE archived_at IS NULL")
          .all() as any[];
        const accounts = this.db.db
          .prepare("SELECT id, label, session_status, enabled FROM accounts ORDER BY created_at ASC")
          .all() as any[];
        return this.sendJson(res, 200, { projects, bindings, accounts });
      }

      if (method === "POST" && pathname === "/api/projects") {
        const body = await this.readJsonBody(req);
        if (!body.name) {
          return this.sendJson(res, 400, {
            error: "Missing required field: 'name'",
          });
        }
        const projId = body.id || `proj-${Date.now()}`;
        const now = new Date().toISOString();
        this.db.transaction(() => {
          this.db.db
            .prepare(
              `INSERT INTO projects (id, name, description, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?)`,
            )
            .run(projId, body.name, body.description || null, now, now);

          if (body.accountId && body.remoteProjectId) {
            const bindingId = `bind-${Date.now()}`;
            this.db.db
              .prepare(
                `INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, created_at, updated_at)
                 VALUES (?, ?, ?, ?, 'verified', ?, ?)`,
              )
              .run(bindingId, projId, body.accountId, body.remoteProjectId, now, now);
          }
        });
        const createdProject = this.db.db.prepare("SELECT * FROM projects WHERE id = ?").get(projId);
        return this.sendJson(res, 201, { project: createdProject, projectId: projId, name: body.name });
      }

      const projectImagesMatch = pathname.match(/^\/api\/projects\/([^/]+)\/images$/);
      if (projectImagesMatch) {
        const projId = projectImagesMatch[1]!;

        if (method === "GET") {
          // 1. Uploaded reference assets for this project
          const uploadedAssetsRaw = this.db.db
            .prepare(`
              SELECT a.id, a.content_hash, a.blob_key, a.mime_type, a.size_bytes, a.created_at,
                     COALESCE(pa.display_name, 'Ảnh tham chiếu ' || SUBSTR(a.id, -6)) as display_name,
                     pa.project_id,
                     (SELECT COUNT(DISTINCT ji.job_id) FROM job_inputs ji WHERE ji.asset_id = a.id) as used_in_jobs_count
              FROM assets a
              LEFT JOIN project_assets pa ON a.id = pa.asset_id AND pa.project_id = ?
              WHERE pa.project_id = ?
                 OR (a.id IN (SELECT ji.asset_id FROM job_inputs ji JOIN jobs j ON ji.job_id = j.id WHERE j.project_id = ?)
                     AND a.id NOT IN (SELECT local_asset_id FROM job_outputs WHERE local_asset_id IS NOT NULL))
              ORDER BY a.created_at DESC
            `)
            .all(projId, projId, projId) as any[];

          const uploadedAssets = uploadedAssetsRaw.map(a => ({
            ...a,
            blobUrl: `/api/assets/${a.id}/blob`,
            imageUrl: `/api/assets/${a.id}/blob`,
            usedInJobsCount: Number(a.used_in_jobs_count || 0),
          }));

          // 2. Generated images created by Google Flow jobs in this project
          const generatedImagesRaw = this.db.db
            .prepare(`
              SELECT jo.id as output_id, jo.position, jo.remote_url, jo.created_at,
                     a.id as asset_id, a.size_bytes, a.content_hash,
                     j.id as job_id, j.prompt, j.status as job_status
              FROM jobs j
              JOIN job_attempts ja ON j.id = ja.job_id
              JOIN job_outputs jo ON ja.id = jo.attempt_id
              JOIN assets a ON jo.local_asset_id = a.id
              WHERE j.project_id = ?
              ORDER BY jo.created_at DESC
            `)
            .all(projId) as any[];

          const generatedImages = generatedImagesRaw.map(g => ({
            ...g,
            blobUrl: `/api/assets/${g.asset_id}/blob`,
            imageUrl: `/api/assets/${g.asset_id}/blob`,
          }));

          return this.sendJson(res, 200, {
            projectId: projId,
            uploadedAssets,
            generatedImages,
          });
        }
      }

      const projectImportMatch = pathname.match(/^\/api\/projects\/([^/]+)\/import-output$/);
      if (method === "POST" && projectImportMatch) {
        const projId = projectImportMatch[1]!;
        const body = await this.readJsonBody(req);
        if (!body.assetId) {
          return this.sendJson(res, 400, { error: "Missing 'assetId'" });
        }
        const now = new Date().toISOString();
        const displayName = body.displayName || `Ref từ ảnh tạo ${body.assetId.slice(-6)}`;
        this.db.db
          .prepare(
            `INSERT OR REPLACE INTO project_assets (project_id, asset_id, display_name, created_at)
             VALUES (?, ?, ?, ?)`
          )
          .run(projId, body.assetId, displayName, now);
        return this.sendJson(res, 200, { success: true, projectId: projId, assetId: body.assetId, displayName });
      }

      const projectItemMatch = pathname.match(/^\/api\/projects\/([^/]+)$/);
      if (projectItemMatch) {
        const projId = projectItemMatch[1]!;

        if (method === "GET") {
          const project = this.db.db
            .prepare("SELECT * FROM projects WHERE id = ?")
            .get(projId);
          if (!project) return this.sendJson(res, 404, { error: `Project not found: ${projId}` });
          const bindings = this.db.db
            .prepare("SELECT * FROM project_bindings WHERE project_id = ? AND archived_at IS NULL")
            .all(projId);
          return this.sendJson(res, 200, { project, bindings });
        }

        if (method === "PUT" || method === "PATCH") {
          const body = await this.readJsonBody(req);
          const now = new Date().toISOString();
          this.db.transaction(() => {
            if (body.name !== undefined) {
              this.db.db
                .prepare("UPDATE projects SET name = ?, description = ?, updated_at = ? WHERE id = ?")
                .run(body.name, body.description ?? null, now, projId);
            }
            if (body.accountId !== undefined || body.remoteProjectId !== undefined) {
              const existingBinding = this.db.db
                .prepare("SELECT id, account_id, remote_project_id FROM project_bindings WHERE project_id = ? AND archived_at IS NULL")
                .get(projId) as { id: string; account_id: string; remote_project_id: string } | undefined;
              if (existingBinding) {
                const accId = body.accountId !== undefined ? (body.accountId || null) : existingBinding.account_id;
                const remId = body.remoteProjectId !== undefined ? (body.remoteProjectId || null) : existingBinding.remote_project_id;
                if (!accId && !remId) {
                  this.db.db.prepare("DELETE FROM project_bindings WHERE id = ?").run(existingBinding.id);
                } else {
                  this.db.db
                    .prepare("UPDATE project_bindings SET account_id = ?, remote_project_id = ?, updated_at = ? WHERE id = ?")
                    .run(accId, remId, now, existingBinding.id);
                }
              } else if (body.accountId) {
                const bindingId = `bind-${Date.now()}`;
                const remId = body.remoteProjectId || null;
                this.db.db
                  .prepare("INSERT INTO project_bindings (id, project_id, account_id, remote_project_id, setup_state, created_at, updated_at) VALUES (?, ?, ?, ?, 'verified', ?, ?)")
                  .run(bindingId, projId, body.accountId, remId, now, now);
              }
            }
          });
          const updatedProject = this.db.db
            .prepare(
              `SELECT p.*, pb.account_id, pb.remote_project_id, a.label as account_label
               FROM projects p
               LEFT JOIN project_bindings pb ON p.id = pb.project_id AND pb.archived_at IS NULL
               LEFT JOIN accounts a ON pb.account_id = a.id
               WHERE p.id = ?`,
            )
            .get(projId);
          return this.sendJson(res, 200, { success: true, project: updatedProject, projectId: projId });
        }

        if (method === "DELETE") {
          if (projId === "proj-default") {
            return this.sendJson(res, 400, { error: "Không thể xoá project mặc định (proj-default)" });
          }
          this.db.transaction(() => {
            this.db.db.prepare("DELETE FROM projects WHERE id = ?").run(projId);
          });
          return this.sendJson(res, 200, { success: true, deletedProjectId: projId });
        }
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
      if (method === "GET" && pathname === "/api/assets") {
        const typeFilter = reqUrl.searchParams.get("type"); // 'uploaded' | 'generated'
        const projFilter = reqUrl.searchParams.get("projectId");

        let whereClause = "";
        const conditions: string[] = [];
        const params: any[] = [];

        if (typeFilter === "uploaded") {
          conditions.push("a.id NOT IN (SELECT local_asset_id FROM job_outputs WHERE local_asset_id IS NOT NULL)");
        } else if (typeFilter === "generated") {
          conditions.push("a.id IN (SELECT local_asset_id FROM job_outputs WHERE local_asset_id IS NOT NULL)");
        }

        if (projFilter) {
          conditions.push("(pa.project_id = ? OR a.id IN (SELECT ji.asset_id FROM job_inputs ji JOIN jobs j ON ji.job_id = j.id WHERE j.project_id = ?))");
          params.push(projFilter, projFilter);
        }

        if (conditions.length > 0) {
          whereClause = "WHERE " + conditions.join(" AND ");
        }

        const query = `
          SELECT a.id, a.content_hash, a.blob_key, a.mime_type, a.size_bytes, a.created_at,
                 COUNT(DISTINCT ji.job_id) as used_in_jobs_count,
                 pa.display_name, pa.project_id
          FROM assets a
          LEFT JOIN job_inputs ji ON a.id = ji.asset_id
          LEFT JOIN project_assets pa ON a.id = pa.asset_id
          ${whereClause}
          GROUP BY a.id
          ORDER BY a.created_at DESC
        `;

        const assets = this.db.db.prepare(query).all(...params) as any[];

        const enriched = assets.map(a => ({
          ...a,
          blobUrl: `/api/assets/${a.id}/blob`,
          displayName: a.display_name || `Asset ${a.id.slice(-6)}`,
          usedInJobsCount: Number(a.used_in_jobs_count || 0),
        }));

        return this.sendJson(res, 200, { assets: enriched });
      }

      if (method === "POST" && pathname === "/api/assets/upload") {
        const contentType = req.headers["content-type"] || "";
        const urlObj = new URL(req.url || "/", "http://localhost");
        const rawDisplayName = urlObj.searchParams.get("displayName") || (req.headers["x-display-name"] as string) || "Reference Image";
        let displayName = rawDisplayName;
        try {
          displayName = decodeURIComponent(rawDisplayName);
        } catch {}
        let targetProjectId = (req.headers["x-project-id"] as string) || urlObj.searchParams.get("projectId") || null;
        let buffer: Buffer;

        if (contentType.includes("application/json")) {
          const body = await this.readJsonBody(req);
          if (!body.data) {
            return this.sendJson(res, 400, {
              error: "Missing 'data' field (base64 encoded binary)",
            });
          }
          buffer = Buffer.from(body.data, "base64");
          if (body.displayName) displayName = body.displayName;
          if (body.projectId) targetProjectId = body.projectId;
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
        const now = new Date().toISOString();

        this.db.transaction(() => {
          if (!assetRow) {
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
          }

          if (targetProjectId) {
            this.db.db
              .prepare(
                `INSERT OR REPLACE INTO project_assets (project_id, asset_id, display_name, created_at)
                 VALUES (?, ?, ?, ?)`,
              )
              .run(targetProjectId, assetId, displayName, now);
          }
        });

        const statusCode = assetRow ? 200 : 201;
        return this.sendJson(res, statusCode, {
          assetId,
          contentHash: meta.contentHash,
          sizeBytes: meta.sizeBytes,
          blobUrl: `/api/assets/${assetId}/blob`,
          isDuplicate: Boolean(assetRow),
          displayName,
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

      const assetItemMatch = pathname.match(/^\/api\/assets\/([^/]+)$/);
      if (assetItemMatch) {
        const assetId = assetItemMatch[1]!;

        if (method === "GET") {
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

        if (method === "DELETE") {
          this.db.transaction(() => {
            this.db.db.prepare("DELETE FROM project_assets WHERE asset_id = ?").run(assetId);
            this.db.db.prepare("DELETE FROM job_inputs WHERE asset_id = ?").run(assetId);
            this.db.db.prepare("DELETE FROM assets WHERE id = ?").run(assetId);
          });
          return this.sendJson(res, 200, { success: true, deletedAssetId: assetId });
        }
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
