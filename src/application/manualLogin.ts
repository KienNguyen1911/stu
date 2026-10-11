import { chromium, type BrowserContext, type Page } from "playwright-core";
import { existsSync, mkdirSync } from "node:fs";
import { detectChromePath } from "../config.js";

export interface ManualLoginOptions {
  profileDir: string;
  chromePath?: string;
  onStatusChange?: (status: string) => void;
}

export class ManualLoginHelper {
  constructor(private readonly defaultChromePath?: string) {}

  /**
   * Opens an interactive, non-headless Chrome window with the specified profile
   * and waits for the user to reach the actual Flow Studio workspace/project.
   */
  public async launchLoginSession(options: ManualLoginOptions): Promise<{
    success: boolean;
    finalUrl: string;
    remoteProjectId?: string;
    email?: string;
  }> {
    const { profileDir, onStatusChange } = options;
    const chromePath = detectChromePath(
      options.chromePath || this.defaultChromePath,
    );

    if (!existsSync(profileDir)) {
      mkdirSync(profileDir, { recursive: true });
    }

    onStatusChange?.("Launching Chrome for manual sign-in...");

    const context: BrowserContext = await chromium.launchPersistentContext(
      profileDir,
      {
        executablePath: chromePath,
        headless: false, // Visible for the user
        viewport: { width: 1440, height: 900 },
        args: [
          "--disable-blink-features=AutomationControlled",
          "--no-first-run",
          "--no-default-browser-check",
        ],
      },
    );

    const page: Page = context.pages()[0] || (await context.newPage());

    try {
      onStatusChange?.("Navigating to flow.google.com ...");
      await page.goto("https://flow.google.com", {
        waitUntil: "domcontentloaded",
      });

      onStatusChange?.(
        'Vui lòng đăng nhập Google và bấm "Create with Google Flow" hoặc mở 1 Project trên trình duyệt...',
      );

      // Poll until user actually reaches a Flow project or studio workspace
      const maxWaitMs = 10 * 60 * 1000; // 10 minutes
      const start = Date.now();

      while (Date.now() - start < maxWaitMs) {
        if (page.isClosed()) {
          throw new Error(
            "Cửa sổ trình duyệt đã bị đóng trước khi hoàn tất đăng nhập.",
          );
        }

        const currentUrl = page.url();

        // Check if user is inside a Flow Project (URL contains /project/<id>)
        const projectMatch = currentUrl.match(
          /flow\.google\.com\/project\/([a-zA-Z0-9_-]+)/,
        );
        if (projectMatch && projectMatch[1]) {
          const remoteProjectId = projectMatch[1];
          onStatusChange?.(`Đã phát hiện Flow Project: ${remoteProjectId}!`);
          await page.waitForTimeout(3000);

          return {
            success: true,
            finalUrl: currentUrl,
            remoteProjectId,
          };
        }

        // Check if user reached Flow Studio dashboard with project creation button
        const isFlowApp =
          currentUrl.startsWith("https://flow.google.com") &&
          !currentUrl.includes("/about") &&
          !currentUrl.includes("ServiceLogin");

        if (isFlowApp) {
          // If on flow.google.com home, check if there's any active project link or prompt input
          const promptFound = await page
            .evaluate(() => {
              return !!document.querySelector(
                'textarea, div[contenteditable="true"], [aria-label*="prompt" i]',
              );
            })
            .catch(() => false);

          if (promptFound) {
            onStatusChange?.("Đã phát hiện giao diện tạo ảnh Flow!");
            return {
              success: true,
              finalUrl: currentUrl,
            };
          }
        }

        await new Promise((r) => setTimeout(r, 2000));
      }

      throw new Error(
        "Quá thời gian chờ (10 phút) mà chưa hoàn tất đăng nhập vào Flow.",
      );
    } finally {
      await context.close().catch(() => {});
    }
  }
}
