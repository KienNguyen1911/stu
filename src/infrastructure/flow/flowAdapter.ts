import { chromium, type BrowserContext, type Page } from "playwright-core";
import { copyFileSync, unlinkSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import type { BlobStore } from "../blobs/blobStore.js";
import type { FlowDatabase } from "../db/database.js";
import { TEMP_DIR, detectChromePath } from "../../config.js";
import type {
  FlowAdapterPort,
  GenerateImageParams,
  GeneratedImageOutput,
} from "./flowAdapterPort.js";

export type {
  FlowAdapterPort,
  GenerateImageParams,
  GeneratedImageOutput,
};

export class FlowAdapter implements FlowAdapterPort {
  constructor(
    public readonly blobStore: BlobStore,
    public readonly db: FlowDatabase,
    private readonly customChromePath?: string,
  ) {}

  /**
   * Executes a generation attempt inside the isolated Chrome profile for an account.
   * Runs in non-headless mode by default unless FLOW_HEADLESS=true or headless: true is passed.
   */
  public async executeGeneration(
    params: GenerateImageParams,
  ): Promise<GeneratedImageOutput[]> {
    const {
      profilePath,
      remoteProjectId,
      prompt,
      referenceImagePaths = [],
    } = params;

    const envHeadless =
      process.env.FLOW_HEADLESS !== undefined
        ? process.env.FLOW_HEADLESS === "true" || process.env.FLOW_HEADLESS === "1"
        : undefined;
    const headless =
      params.headless ?? params.options?.headless ?? envHeadless ?? false;

    console.log(
      `[FlowAdapter] Khởi chạy Chrome (headless: ${headless}) cho account ${params.accountId}...`,
    );
    const context: BrowserContext = await chromium.launchPersistentContext(
      profilePath,
      {
        executablePath: detectChromePath(this.customChromePath),
        headless,
        viewport: { width: 1440, height: 900 },
        args: [
          "--disable-blink-features=AutomationControlled",
          "--no-first-run",
          "--no-default-browser-check",
          "--window-size=1440,900",
        ],
      },
    );

    const page: Page = context.pages()[0] || (await context.newPage());
    const createdTempFiles: string[] = [];

    try {
      const projectUrl = `https://flow.google.com/project/${remoteProjectId}`;
      console.log(
        `[FlowAdapter] Điều hướng đến Flow Project: ${projectUrl} ...`,
      );
      await page.goto(projectUrl, {
        waitUntil: "domcontentloaded",
        timeout: 35_000,
      });
      await page.waitForTimeout(4000);

      // Check if user is redirected to login
      if (
        page.url().includes("accounts.google.com") ||
        page.url().includes("/about")
      ) {
        throw new Error(
          `Phiên đăng nhập chưa sẵn sàng. Vui lòng chạy lại 'node examples/flow-api/dist/scripts/login-account.js ${params.accountId}'`,
        );
      }

      // If reference images are provided, upload and attach them as ingredients
      if (referenceImagePaths.length > 0) {
        console.log(
          `[FlowAdapter] Đang tải lên và đính kèm ${referenceImagePaths.length} ảnh tham chiếu...`,
        );

        // Clear any leftover ingredient chip in the prompt box from previous runs
        const existingRemoveBtn = page
          .locator(
            "flow-prompt-box button:has-text('close'), flow-prompt-box button:has-text('cancel'), flow-prompt-box [aria-label*='Xóa'], flow-prompt-box [aria-label*='xóa'], flow-prompt-box button.remove-btn",
          )
          .first();
        if (await existingRemoveBtn.isVisible().catch(() => false)) {
          console.log(
            "[FlowAdapter] Phát hiện chip cũ trong prompt box, đang gỡ bỏ...",
          );
          await existingRemoveBtn.click().catch(() => {});
          await page.waitForTimeout(1000);
        }

        if (!existsSync(TEMP_DIR)) {
          mkdirSync(TEMP_DIR, { recursive: true });
        }

        for (let i = 0; i < referenceImagePaths.length; i++) {
          const originalRefPath = referenceImagePaths[i]!;
          if (!existsSync(originalRefPath)) {
            throw new Error(
              `File ảnh tham chiếu không tồn tại trên đĩa: ${originalRefPath}`,
            );
          }

          // Ensure file has valid .png extension for Google Flow file upload
          const uploadFileName = `ref-${Date.now()}-${i + 1}.png`;
          const preparedPath = join(TEMP_DIR, uploadFileName);
          copyFileSync(originalRefPath, preparedPath);
          createdTempFiles.push(preparedPath);
          const uploadPath = preparedPath;

          console.log(
            `[FlowAdapter] [Ảnh #${i + 1}] Đang đính kèm: ${originalRefPath} (qua ${uploadFileName})`,
          );

          // 1. Click Add button to open ingredients / assets menu
          const addBtn = page
            .locator(
              'flow-prompt-box button.add-menu-trigger, flow-prompt-box button:has-text("add")',
            )
            .first();
          await addBtn.click();
          await page.waitForTimeout(1500);

          // 2. Intercept file chooser on sidebar upload button
          const uploadBtn = page
            .locator(
              'button.sidebar-upload-btn, button:has-text("Tải nội dung")',
            )
            .first();
          const [fileChooser] = await Promise.all([
            page.waitForEvent("filechooser", { timeout: 15_000 }),
            uploadBtn.click(),
          ]);

          // 3. Upload file
          await fileChooser.setFiles(uploadPath);
          console.log(
            `[FlowAdapter] [Ảnh #${i + 1}] Đã chọn file, đang chờ Google Flow tải lên và xử lý...`,
          );

          // 4. Wait for newly uploaded item to appear at top of list and complete upload
          let uploadedItemReady = false;
          for (let attempt = 0; attempt < 30; attempt++) {
            await page.waitForTimeout(1000);
            const firstItem = page.locator("button.asset-item").first();
            if ((await firstItem.count()) > 0) {
              const text = await firstItem.innerText().catch(() => "");
              const cleanBase = uploadFileName.replace(/\.[^.]+$/, "");
              if (text.includes(uploadFileName) || text.includes(cleanBase)) {
                // Check if spinner / loading is still active
                const hasSpinner =
                  (await firstItem
                    .locator("mat-spinner, svg, [role='progressbar'], .loading")
                    .count()) > 0;
                if (!hasSpinner) {
                  console.log(
                    `[FlowAdapter] [Ảnh #${i + 1}] Ảnh đã upload hoàn tất sau ${attempt + 1}s! Đang chọn thành phần...`,
                  );
                  uploadedItemReady = true;
                  await firstItem.click();
                  await page.waitForTimeout(1500);
                  break;
                }
              }
            }
          }

          if (!uploadedItemReady) {
            console.log(
              `[FlowAdapter] [Ảnh #${i + 1}] Chọn phần tử đầu tiên trong danh sách thành phần...`,
            );
            const firstItem = page.locator("button.asset-item").first();
            await firstItem.click();
            await page.waitForTimeout(1500);
          }

          // 5. If "Thêm vào câu lệnh" (Add to prompt) button is visible, click it
          const addPromptBtn = page.locator("button.detail-add-to-prompt-btn");
          if (await addPromptBtn.isVisible().catch(() => false)) {
            console.log(
              `[FlowAdapter] [Ảnh #${i + 1}] Bấm 'Thêm vào câu lệnh'...`,
            );
            await addPromptBtn.click();
            await page.waitForTimeout(2000);
          }

          // 6. Verify chip appeared in prompt box
          await page.waitForSelector(
            "flow-prompt-box img, flow-prompt-box flow-ingredient-chip, flow-prompt-box [class*='chip']",
            { timeout: 10_000 },
          );
          console.log(
            `[FlowAdapter] [Ảnh #${i + 1}] Đã đính kèm thành công thành phần vào câu lệnh!`,
          );
        }
      }

      // 1. Wait for canvas tiles to settle (so pre-existing tiles finish loading from Flow's cloud)
      console.log(
        "[FlowAdapter] Đang đợi canvas tải hoàn tất các thẻ hiện có...",
      );
      let prevTileCount = -1;
      let stableChecks = 0;
      for (let attempt = 0; attempt < 8; attempt++) {
        const count = await page.locator("flow-image-tile").count();
        if (count === prevTileCount) {
          stableChecks++;
          if (stableChecks >= 2) break; // Count did not change for 2 consecutive checks
        } else {
          stableChecks = 0;
          prevTileCount = count;
        }
        await page.waitForTimeout(1000);
      }

      // Count existing tiles after canvas has settled
      const initialTileCount = await page.locator("flow-image-tile").count();
      console.log(
        `[FlowAdapter] Số thẻ ảnh hiện có trên canvas (đã ổn định): ${initialTileCount}`,
      );

      // Locate prompt input element (ProseMirror contenteditable inside flow-rich-text-editor)
      const promptSelector =
        "flow-rich-text-editor .ProseMirror, flow-rich-text-editor, div.ProseMirror";
      console.log("[FlowAdapter] Chờ ô nhập prompt hiển thị...");
      await page.waitForSelector(promptSelector, { timeout: 25_000 });

      const promptEl = page.locator(promptSelector).first();
      await promptEl.click();
      await page.waitForTimeout(300);

      // Select all and clear any pre-existing prompt text
      await page.keyboard.press("Control+A");
      await page.keyboard.press("Backspace");
      await page.waitForTimeout(300);

      console.log(`[FlowAdapter] Nhập prompt mới: "${prompt}"...`);
      // Type naturally with keyboard
      await page.keyboard.type(prompt, { delay: 15 });
      await page.waitForTimeout(800);

      // Submit prompt: click arrow_forward button
      const sendButton = page
        .locator('button:has-text("arrow_forward")')
        .first();
      await page.waitForTimeout(400);

      const isSendDisabled = await sendButton.isDisabled().catch(() => true);
      console.log(
        `[FlowAdapter] Trạng thái nút Gửi (disabled: ${isSendDisabled})...`,
      );

      if (!isSendDisabled) {
        await sendButton.click();
      } else {
        await promptEl.click();
        await page.keyboard.press("Enter");
      }

      console.log(
        "[FlowAdapter] Đã gửi lệnh tạo ảnh! Đang chờ Google Flow xử lý (khoảng 20-45 giây)...",
      );

      // Poll for newly generated images on the page
      const pollStart = Date.now();
      const maxWaitMs = 90_000; // 90 seconds
      let newTilesFound = false;

      while (Date.now() - pollStart < maxWaitMs) {
        // Check for error card
        const hasError = await page.evaluate(() => {
          const text = document.body.innerText || "";
          return (
            text.includes("Không thành công") &&
            text.includes("hoạt động bất thường")
          );
        });

        if (hasError) {
          throw new Error(
            'Google Flow thông báo: "Không thành công. Chúng tôi nhận thấy có hoạt động bất thường nào đó." Vui lòng kiểm tra lại tài khoản hoặc thao tác trực tiếp trên trình duyệt một lần.',
          );
        }

        const elapsedSec = (Date.now() - pollStart) / 1000;

        // Check for new flow-image-tile elements added
        const currentCount = await page.locator("flow-image-tile").count();
        if (currentCount > initialTileCount) {
          // AI generation takes at least 10 seconds; if tiles appeared too quickly (< 6s), wait to ensure it's not late DOM hydration
          if (elapsedSec < 6) {
            console.log(
              `[FlowAdapter] Phát hiện thẻ mới quá nhanh (${elapsedSec.toFixed(1)}s), tiếp tục quan sát...`,
            );
          } else {
            console.log(
              `[FlowAdapter] Đã phát hiện ${currentCount - initialTileCount} thẻ ảnh mới (tổng: ${currentCount}) sau ${elapsedSec.toFixed(1)}s!`,
            );
            // Wait for full rendering of images
            await page.waitForTimeout(7000);
            newTilesFound = true;
            break;
          }
        }

        if (initialTileCount === 0 && currentCount > 0 && elapsedSec >= 6) {
          console.log(
            `[FlowAdapter] Đã phát hiện ${currentCount} thẻ ảnh trên canvas mới!`,
          );
          await page.waitForTimeout(7000);
          newTilesFound = true;
          break;
        }

        await page.waitForTimeout(2500);
      }

      const outputs: GeneratedImageOutput[] = [];
      const tiles = page.locator("flow-image-tile");
      const totalCount = await tiles.count();
      const newCount = totalCount - initialTileCount;

      if (newCount > 0) {
        console.log(
          `[FlowAdapter] Đang trích xuất ${newCount} ảnh mới từ các thẻ flow-image-tile...`,
        );

        // Google Flow chèn ảnh mới nhất vào ĐẦU danh sách (index 0, 1...) thay vì ở cuối
        const countToExtract = Math.min(newCount, 4);
        for (let i = 0; i < countToExtract; i++) {
          const tile = tiles.nth(i);
          let tileBuf: Buffer;
          let remoteImgUrl = `${projectUrl}#tile-${i + 1}`;

          try {
            // Wait for tile image to be fully rendered (naturalWidth > 100 and no loading progress percentage)
            try {
              await tile
                .locator("img")
                .first()
                .waitFor({ state: "visible", timeout: 20_000 });
              await page.waitForFunction(
                (tileEl) => {
                  if (!tileEl) return false;
                  const img = tileEl.querySelector("img");
                  const text = (tileEl as HTMLElement).innerText || "";
                  const hasProgress = /\d+%\s*$/.test(text.trim());
                  return Boolean(
                    img && img.src && img.naturalWidth > 100 && !hasProgress,
                  );
                },
                await tile.elementHandle(),
                { timeout: 35_000 },
              );
            } catch (waitErr) {
              console.log(
                `[FlowAdapter] [Ảnh #${i + 1}] Lưu ý: Chờ ảnh thẻ render:`,
                (waitErr as Error).message,
              );
            }

            // 1. Try extracting the original high-resolution image bytes directly from img element
            const imgData = await tile
              .locator("img")
              .first()
              .evaluate(async (img: HTMLImageElement) => {
                if (!img || !img.src) return null;
                try {
                  const res = await fetch(img.src);
                  const blob = await res.blob();
                  return new Promise<{ b64: string; src: string }>(
                    (resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () =>
                        resolve({ b64: reader.result as string, src: img.src });
                      reader.readAsDataURL(blob);
                    },
                  );
                } catch {
                  return null;
                }
              });

            if (imgData && imgData.b64 && imgData.b64.startsWith("data:")) {
              const base64Data = imgData.b64.replace(
                /^data:image\/\w+;base64,/,
                "",
              );
              tileBuf = Buffer.from(base64Data, "base64");
              if (imgData.src) remoteImgUrl = imgData.src;
              console.log(
                `[FlowAdapter] [Ảnh #${i + 1}] Đã trích xuất ảnh gốc nét căng (${(tileBuf.length / 1024).toFixed(1)} KB) từ img.src!`,
              );
            } else {
              await tile.scrollIntoViewIfNeeded().catch(() => {});
              await page.waitForTimeout(500);
              tileBuf = await tile.screenshot();
              console.log(
                `[FlowAdapter] [Ảnh #${i + 1}] Chụp screenshot thẻ ảnh (${(tileBuf.length / 1024).toFixed(1)} KB)...`,
              );
            }
          } catch {
            await tile.scrollIntoViewIfNeeded().catch(() => {});
            await page.waitForTimeout(500);
            tileBuf = await tile.screenshot();
          }

          const meta = this.blobStore.put(tileBuf);

          let assetRow = this.db.db
            .prepare("SELECT id FROM assets WHERE content_hash = ?")
            .get(meta.contentHash) as { id: string } | undefined;

          let assetId = assetRow ? assetRow.id : `asset-${Date.now()}-${i}`;
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

          outputs.push({
            remoteUrl: remoteImgUrl,
            localContentHash: meta.contentHash,
            localAssetId: assetId,
            sizeBytes: meta.sizeBytes,
          });
        }
      } else if (totalCount > 0) {
        // Fallback: extract top 2 available tiles (newest are at index 0, 1)
        const countToExtract = Math.min(2, totalCount);
        for (let i = 0; i < countToExtract; i++) {
          const tile = tiles.nth(i);
          let tileBuf: Buffer;
          try {
            const imgData = await tile
              .locator("img")
              .first()
              .evaluate(async (img: HTMLImageElement) => {
                if (!img || !img.src) return null;
                try {
                  const res = await fetch(img.src);
                  const blob = await res.blob();
                  return new Promise<{ b64: string; src: string }>(
                    (resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () =>
                        resolve({ b64: reader.result as string, src: img.src });
                      reader.readAsDataURL(blob);
                    },
                  );
                } catch {
                  return null;
                }
              });

            if (imgData && imgData.b64 && imgData.b64.startsWith("data:")) {
              const base64Data = imgData.b64.replace(
                /^data:image\/\w+;base64,/,
                "",
              );
              tileBuf = Buffer.from(base64Data, "base64");
            } else {
              await tile.scrollIntoViewIfNeeded().catch(() => {});
              await page.waitForTimeout(500);
              tileBuf = await tile.screenshot();
            }
          } catch {
            await tile.scrollIntoViewIfNeeded().catch(() => {});
            await page.waitForTimeout(500);
            tileBuf = await tile.screenshot();
          }

          const meta = this.blobStore.put(tileBuf);

          let assetRow = this.db.db
            .prepare("SELECT id FROM assets WHERE content_hash = ?")
            .get(meta.contentHash) as { id: string } | undefined;

          let assetId = assetRow ? assetRow.id : `asset-${Date.now()}-${i}`;
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

          outputs.push({
            remoteUrl: `${page.url()}#tile-${i + 1}`,
            localContentHash: meta.contentHash,
            localAssetId: assetId,
            sizeBytes: meta.sizeBytes,
          });
        }
      } else {
        // Fallback: capture canvas screenshot as output
        console.warn(
          "[FlowAdapter] Không bắt được flow-image-tile riêng biệt, thử chụp khung canvas kết quả...",
        );
        const screenshotBuf = await page.screenshot({ fullPage: false });
        const meta = this.blobStore.put(screenshotBuf);

        let assetRow = this.db.db
          .prepare("SELECT id FROM assets WHERE content_hash = ?")
          .get(meta.contentHash) as { id: string } | undefined;

        let assetId = assetRow ? assetRow.id : `asset-${Date.now()}`;
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

        outputs.push({
          remoteUrl: page.url(),
          localContentHash: meta.contentHash,
          localAssetId: assetId,
          sizeBytes: meta.sizeBytes,
        });
      }

      return outputs;
    } finally {
      for (const tempFile of createdTempFiles) {
        try {
          if (existsSync(tempFile)) unlinkSync(tempFile);
        } catch {
          // ignore
        }
      }
      await page.waitForTimeout(2000);
      await context.close().catch(() => {});
    }
  }
}
