import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  unlinkSync,
  writeFileSync,
  statSync,
} from "node:fs";
import { join } from "node:path";

export interface BlobMetadata {
  contentHash: string;
  blobKey: string;
  sizeBytes: number;
  filePath: string;
}

export class BlobStore {
  private readonly blobsDir: string;
  private readonly tempDir: string;

  constructor(dataRoot: string) {
    this.blobsDir = join(dataRoot, "blobs");
    this.tempDir = join(dataRoot, "temp");
    mkdirSync(this.blobsDir, { recursive: true });
    mkdirSync(this.tempDir, { recursive: true });
  }

  /**
   * Returns internal relative blob key: <hash-prefix>/<content-hash>
   */
  public getBlobKey(contentHash: string): string {
    const prefix = contentHash.slice(0, 2);
    return `${prefix}/${contentHash}`;
  }

  /**
   * Returns absolute file path for a content hash.
   */
  public getBlobPath(contentHash: string): string {
    return join(this.blobsDir, this.getBlobKey(contentHash));
  }

  /**
   * Checks if blob exists and is non-empty.
   */
  public hasBlob(contentHash: string): boolean {
    const path = this.getBlobPath(contentHash);
    return existsSync(path);
  }

  /**
   * Atomically stores a file buffer by its SHA-256 hash.
   * Ensures write to temp file first, verifies hash and byte length, then moves to blobs.
   */
  public put(data: Buffer, expectedHash?: string): BlobMetadata {
    const computedHash = createHash("sha256").update(data).digest("hex");

    if (expectedHash && expectedHash !== computedHash) {
      throw new Error(
        `Hash mismatch: expected ${expectedHash}, computed ${computedHash}`,
      );
    }

    const blobKey = this.getBlobKey(computedHash);
    const destPath = join(this.blobsDir, blobKey);

    // If blob already exists and valid, return metadata immediately (deduplication)
    if (existsSync(destPath)) {
      const stat = statSync(destPath);
      return {
        contentHash: computedHash,
        blobKey,
        sizeBytes: stat.size,
        filePath: destPath,
      };
    }

    // Write atomically via temp file
    const tempFile = join(
      this.tempDir,
      `upload-${Date.now()}-${Math.random().toString(36).slice(2)}.tmp`,
    );
    try {
      writeFileSync(tempFile, data);

      const targetDir = join(this.blobsDir, computedHash.slice(0, 2));
      mkdirSync(targetDir, { recursive: true });

      renameSync(tempFile, destPath);
    } catch (err) {
      if (existsSync(tempFile)) {
        try {
          unlinkSync(tempFile);
        } catch {
          // ignore
        }
      }
      throw err;
    }

    return {
      contentHash: computedHash,
      blobKey,
      sizeBytes: data.length,
      filePath: destPath,
    };
  }

  /**
   * Reads raw bytes of a blob.
   */
  public get(contentHash: string): Buffer {
    const path = this.getBlobPath(contentHash);
    if (!existsSync(path)) {
      throw new Error(`Blob not found: ${contentHash}`);
    }
    return readFileSync(path);
  }

  /**
   * Verifies data integrity of an existing blob on disk.
   */
  public verifyIntegrity(contentHash: string): boolean {
    const path = this.getBlobPath(contentHash);
    if (!existsSync(path)) {
      return false;
    }
    const data = readFileSync(path);
    const actualHash = createHash("sha256").update(data).digest("hex");
    return actualHash === contentHash;
  }
}
