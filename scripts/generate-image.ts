import { copyFileSync } from "node:fs";
import { join } from "node:path";
import { FlowStudio } from "../src/index.js";

async function main() {
  const args = process.argv.slice(2);
  let prompt = "";
  const referencePaths: string[] = [];
  let accountId: string | undefined;
  let projectId: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]!;
    if (arg === "--reference" || arg === "-r") {
      if (i + 1 < args.length) {
        referencePaths.push(args[++i]!);
      }
    } else if (arg === "--account" || arg === "-a") {
      if (i + 1 < args.length) {
        accountId = args[++i];
      }
    } else if (arg === "--project" || arg === "-p") {
      if (i + 1 < args.length) {
        projectId = args[++i];
      }
    } else if (!prompt) {
      prompt = arg;
    } else {
      prompt += " " + arg;
    }
  }

  if (!prompt) {
    prompt =
      "A cute golden retriever puppy sitting on green grass, bright sunny day, high detail";
  }

  const studio = new FlowStudio();

  console.log(`=== Flow Studio: Tạo ảnh (Generate Image) ===`);
  console.log(`Prompt    : "${prompt}"`);
  if (referencePaths.length > 0) {
    console.log(`Reference : ${referencePaths.join(", ")}`);
  }
  if (accountId) {
    console.log(`Account   : ${accountId}`);
  }
  console.log(`Data Root : ${studio.config.dataRoot}`);
  console.log(`============================================\n`);

  try {
    console.log("[1/2] Bắt đầu quá trình tạo ảnh trên Google Flow...");
    const result = await studio.generate({
      prompt,
      referenceImages: referencePaths,
      accountId,
      projectId,
    });

    console.log(
      `\n================ KẾT QUẢ TẠO ẢNH (${result.outputs.length} ảnh) ================\n`,
    );

    for (let i = 0; i < result.outputs.length; i++) {
      const out = result.outputs[i]!;
      const friendlyPath = join(
        studio.config.dataRoot,
        `output-${Date.now()}-${i + 1}.png`,
      );
      try {
        if (out.blobPath) {
          copyFileSync(out.blobPath, friendlyPath);
        }
      } catch {}

      console.log(`[Ảnh #${i + 1}]:`);
      console.log(`  🖼️  File xem trực tiếp : ${friendlyPath}`);
      console.log(`  📦 File lưu trữ Blob  : ${out.blobPath}`);
      console.log(`  🔑 SHA-256             : ${out.contentHash}`);
      console.log(
        `  ⚖️  Dung lượng          : ${(out.sizeBytes / 1024).toFixed(1)} KB`,
      );
      console.log(`  🌐 Remote URL          : ${out.remoteUrl.slice(0, 80)}...`);
    }

    console.log(
      "\n===================================================================\n",
    );
  } finally {
    await studio.close();
  }
}

main().catch((err) => {
  console.error("\n[LỖI THỰC THI]:", err.message);
  process.exit(1);
});
