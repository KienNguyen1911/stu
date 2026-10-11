import { join, resolve } from "node:path";
import { existsSync } from "node:fs";

export interface FlowConfigOptions {
  dataRoot?: string;
  dbPath?: string;
  chromePath?: string;
}

export interface FlowResolvedConfig {
  dataRoot: string;
  dbPath: string;
  blobsDir: string;
  profilesDir: string;
  tempDir: string;
  chromePath: string;
  getAccountProfileDir: (accountId: string) => string;
}

/**
 * Detects the Chrome or Chromium binary across Windows, macOS, and Linux.
 */
export function detectChromePath(overridePath?: string): string {
  if (overridePath && existsSync(overridePath)) {
    return overridePath;
  }

  const envPath = process.env.CHROME_PATH;
  if (envPath && existsSync(envPath)) {
    return envPath;
  }

  const platform = process.platform;

  if (platform === "win32") {
    const localAppData = process.env.LOCALAPPDATA || "";
    const programFiles = process.env.PROGRAMFILES || "C:\\Program Files";
    const programFilesX86 =
      process.env["PROGRAMFILES(X86)"] || "C:\\Program Files (x86)";

    const winCandidates = [
      join(localAppData, "Google", "Chrome", "Application", "chrome.exe"),
      join(programFiles, "Google", "Chrome", "Application", "chrome.exe"),
      join(programFilesX86, "Google", "Chrome", "Application", "chrome.exe"),
      "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
      "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
      // Fallback to Edge if Chrome is not installed
      join(programFilesX86, "Microsoft", "Edge", "Application", "msedge.exe"),
      join(programFiles, "Microsoft", "Edge", "Application", "msedge.exe"),
    ];

    for (const candidate of winCandidates) {
      if (candidate && existsSync(candidate)) {
        return candidate;
      }
    }

    return "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
  }

  if (platform === "darwin") {
    const macCandidates = [
      "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      "/Applications/Chromium.app/Contents/MacOS/Chromium",
      join(
        process.env.HOME || "",
        "Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
      ),
    ];

    for (const candidate of macCandidates) {
      if (existsSync(candidate)) {
        return candidate;
      }
    }

    return "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  }

  // Linux and other Unix-like systems
  const linuxCandidates = [
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/snap/bin/chromium",
  ];

  for (const candidate of linuxCandidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return "google-chrome";
}

/**
 * Resolves directory paths for data, blobs, profiles, and database.
 */
export function resolveConfig(
  options: FlowConfigOptions = {},
): FlowResolvedConfig {
  const customRoot = options.dataRoot || process.env.FLOW_DATA_ROOT;
  let dataRoot = customRoot;

  if (!dataRoot) {
    const candidateCwd = resolve(process.cwd(), "data");
    const candidateSrcSibling = resolve(import.meta.dirname, "..", "data");
    const candidateDistSibling = resolve(
      import.meta.dirname,
      "..",
      "..",
      "data",
    );

    if (existsSync(candidateCwd)) {
      dataRoot = candidateCwd;
    } else if (existsSync(candidateSrcSibling)) {
      dataRoot = candidateSrcSibling;
    } else if (existsSync(candidateDistSibling)) {
      dataRoot = candidateDistSibling;
    } else {
      dataRoot = candidateCwd;
    }
  }

  const dbPath = options.dbPath || join(dataRoot, "application.sqlite");
  const blobsDir = join(dataRoot, "blobs");
  const profilesDir = join(dataRoot, "profiles");
  const tempDir = join(dataRoot, "temp");
  const chromePath = detectChromePath(options.chromePath);

  return {
    dataRoot,
    dbPath,
    blobsDir,
    profilesDir,
    tempDir,
    chromePath,
    getAccountProfileDir: (accountId: string) => join(profilesDir, accountId),
  };
}

// Global default instances for backward compatibility
const defaultConfig = resolveConfig();
export const DATA_ROOT = defaultConfig.dataRoot;
export const DB_PATH = defaultConfig.dbPath;
export const BLOBS_DIR = defaultConfig.blobsDir;
export const PROFILES_DIR = defaultConfig.profilesDir;
export const TEMP_DIR = defaultConfig.tempDir;
export const CHROME_PATH = defaultConfig.chromePath;

export function getAccountProfileDir(accountId: string): string {
  return defaultConfig.getAccountProfileDir(accountId);
}
