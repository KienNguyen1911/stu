// Core Deep Module
export {
  FlowStudio,
  type FlowStudioOptions,
  type GenerateImageOptions,
  type GenerateImageResult,
  type GeneratedAssetOutput,
  type LinkProjectParams,
} from "./flowStudio.js";

// Config & Platform Helpers
export {
  resolveConfig,
  detectChromePath,
  type FlowConfigOptions,
  type FlowResolvedConfig,
  DATA_ROOT,
  DB_PATH,
  BLOBS_DIR,
  PROFILES_DIR,
  TEMP_DIR,
  CHROME_PATH,
  getAccountProfileDir,
} from "./config.js";

// Domain Models & Safety Invariants
export * from "./domain/types.js";
export * from "./domain/invariants.js";

// Application
export { AccountCoordinator, type Lease } from "./application/accountCoordinator.js";
export { AccountManager, type RegisterAccountParams } from "./application/accountManager.js";
export { JobRunner, type SubmitJobParams } from "./application/jobRunner.js";
export { JobQueue, type JobQueueOptions, type QueueStats } from "./application/jobQueue.js";
export { ManualLoginHelper, type ManualLoginOptions } from "./application/manualLogin.js";

// Infrastructure
export { FlowDatabase } from "./infrastructure/db/database.js";
export { BlobStore, type BlobMetadata } from "./infrastructure/blobs/blobStore.js";
export {
  FlowAdapter,
  type FlowAdapterPort,
  type GenerateImageParams,
  type GeneratedImageOutput,
} from "./infrastructure/flow/flowAdapter.js";
export {
  InMemoryFlowAdapter,
  type InMemoryFlowAdapterOptions,
} from "./infrastructure/flow/inMemoryFlowAdapter.js";

// Server & Dashboard
export { ApiServer, type ApiServerOptions } from "./server/apiServer.js";
