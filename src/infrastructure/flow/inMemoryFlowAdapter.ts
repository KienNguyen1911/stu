import type { BlobStore } from "../blobs/blobStore.js";
import type { FlowDatabase } from "../db/database.js";
import type {
  FlowAdapterPort,
  GenerateImageParams,
  GeneratedImageOutput,
} from "./flowAdapterPort.js";

export interface InMemoryFlowAdapterOptions {
  mockImageBytes?: Buffer;
  mockError?: Error | null;
  delayMs?: number;
}

/**
 * In-memory test adapter for hermetic, fast testing without Chrome/Playwright.
 * Implements FlowAdapterPort at the execution seam.
 */
export class InMemoryFlowAdapter implements FlowAdapterPort {
  public readonly calls: GenerateImageParams[] = [];
  public mockImageBytes: Buffer;
  public mockError: Error | null;
  public delayMs: number;

  constructor(
    public readonly blobStore: BlobStore,
    public readonly db: FlowDatabase,
    options: InMemoryFlowAdapterOptions = {},
  ) {
    this.mockImageBytes =
      options.mockImageBytes ||
      Buffer.from("FAKE_PNG_BINARY_DATA_FOR_HERMETIC_TESTING");
    this.mockError = options.mockError || null;
    this.delayMs = options.delayMs || 0;
  }

  public async executeGeneration(
    params: GenerateImageParams,
  ): Promise<GeneratedImageOutput[]> {
    this.calls.push(params);

    if (this.delayMs > 0) {
      await new Promise((r) => setTimeout(r, this.delayMs));
    }

    if (this.mockError) {
      throw this.mockError;
    }

    const now = new Date().toISOString();
    const content = Buffer.concat([
      this.mockImageBytes,
      Buffer.from(`:${params.prompt}:${Date.now()}`),
    ]);
    const meta = this.blobStore.put(content);
    const assetId = `mock-asset-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

    this.db.transaction(() => {
      this.db.db
        .prepare(
          `INSERT INTO assets (id, content_hash, blob_key, mime_type, size_bytes, availability, created_at)
           VALUES (?, ?, ?, 'image/png', ?, 'ready', ?)`,
        )
        .run(assetId, meta.contentHash, meta.blobKey, meta.sizeBytes, now);
    });

    return [
      {
        remoteUrl: `https://flow.google.com/mock-output/${meta.contentHash}.png`,
        remoteMediaId: `mock-media-${Date.now()}`,
        localContentHash: meta.contentHash,
        localAssetId: assetId,
        sizeBytes: meta.sizeBytes,
      },
    ];
  }
}
