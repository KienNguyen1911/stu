import { FlowStudio } from "../src/index.js";

async function main() {
  const remoteProjectId =
    process.argv[2] || "3166718d-4ebf-43bb-aced-aa5ba3e8a287";
  const accountId = process.argv[3] || "account-1";
  const projectId = process.argv[4] || "proj-default";

  const studio = new FlowStudio();

  try {
    const { bindingId } = studio.linkProject({
      accountId,
      remoteProjectId,
      projectId,
    });

    console.log(
      `[SUCCESS] Đã liên kết thành công account '${accountId}' với Flow Project '${remoteProjectId}' (Binding: ${bindingId})!`,
    );

    const bindings = studio.db.db
      .prepare("SELECT * FROM project_bindings WHERE archived_at IS NULL")
      .all();
    console.log("[Bindings hiện tại]:", bindings);
  } finally {
    await studio.close();
  }
}

main().catch((err) => {
  console.error("[Error]:", err.message);
  process.exit(1);
});
