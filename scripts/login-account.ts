import { FlowStudio } from "../src/index.js";

async function main() {
  const accountId = process.argv[2] || "account-1";
  const label = process.argv[3] || "Tài khoản chính";

  const studio = new FlowStudio();

  console.log(`=== Flow Studio: Manual Login & Setup ===`);
  console.log(`Account ID : ${accountId}`);
  console.log(`Label      : ${label}`);
  console.log(`Profile Dir: ${studio.config.getAccountProfileDir(accountId)}`);
  console.log(`Database   : ${studio.config.dbPath}`);
  console.log(`Chrome     : ${studio.config.chromePath}`);
  console.log(`=========================================\n`);

  try {
    const result = await studio.loginAccount({
      accountId,
      label,
      onStatusChange: (status) => console.log(`[Status] ${status}`),
    });

    if (result.success) {
      if (result.remoteProjectId) {
        console.log(
          `\n[LINKED] Đã liên kết tài khoản với Flow Remote Project '${result.remoteProjectId}'!`,
        );
      }
      console.log(
        `\n[SUCCESS] Tài khoản '${accountId}' đã sẵn sàng hoạt động trong hệ thống!`,
      );
    } else {
      console.log(`\n[NOTICE] Quá trình đăng nhập chưa hoàn tất.`);
    }
  } finally {
    await studio.close();
  }
}

main().catch((err) => {
  console.error("[Error]:", err.message);
  process.exit(1);
});
