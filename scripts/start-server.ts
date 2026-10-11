import { FlowStudio } from "../src/index.js";

async function main() {
  const port = Number(process.env.PORT) || 3100;
  const studio = new FlowStudio();

  console.log(`\n======================================================`);
  console.log(`🚀 KHỞI ĐỘNG FLOW STUDIO: REST API SERVER & JOB QUEUE`);
  console.log(`📁 Data Root : ${studio.config.dataRoot}`);
  console.log(`🗄️ SQLite DB : ${studio.config.dbPath}`);
  console.log(`🔌 Port      : ${port}`);
  console.log(`🌐 Chrome    : ${studio.config.chromePath}`);
  console.log(`======================================================\n`);

  // Start background worker and HTTP server
  studio.startQueue();
  await studio.startServer({ port });

  console.log(`\n✅ Server và Job Queue đã hoạt động!`);
  console.log(`👉 Web Dashboard  : http://localhost:${port}/`);
  console.log(`👉 API Health     : http://localhost:${port}/api/health`);
  console.log(`👉 API Accounts   : http://localhost:${port}/api/accounts`);
  console.log(`👉 API Jobs       : http://localhost:${port}/api/jobs\n`);

  const shutdown = async () => {
    console.log("\n[Shutdown] Đang dừng server và dọn dẹp tài nguyên...");
    await studio.close();
    console.log("[Shutdown] Hoàn tất. Tạm biệt!");
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

main().catch((err) => {
  console.error("[Fatal Error]:", err);
  process.exit(1);
});
