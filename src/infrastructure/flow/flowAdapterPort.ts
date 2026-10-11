import type { BlobStore } from "../blobs/blobStore.js";
import type { FlowDatabase } from "../db/database.js";

export interface GenerateImageParams {
  accountId: string;
  profilePath: string;
  remoteProjectId: string;
  prompt: string;
  model: string;
  options: Record<string, any>;
  referenceImagePaths?: string[];
  headless?: boolean;
}

export interface GeneratedImageOutput {
  remoteUrl: string;
  remoteMediaId?: string;
  localContentHash: string;
  localAssetId: string;
  sizeBytes: number;
}

/**
 * Seam port for Flow generation adapters.
 * Satisfied by PlaywrightFlowAdapter (production) and InMemoryFlowAdapter (testing).
 */
export interface FlowAdapterPort {
  readonly blobStore: BlobStore;
  readonly db: FlowDatabase;
  executeGeneration(params: GenerateImageParams): Promise<GeneratedImageOutput[]>;
}
