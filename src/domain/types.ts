/**
 * Domain types for Flow Studio
 * Follows SPEC.md schema and domain invariants
 */

export type SessionStatus =
  | "unauthenticated"
  | "authenticated"
  | "checking"
  | "needs_attention";

export interface Account {
  id: string;
  label: string;
  profilePath: string;
  enabled: boolean;
  sessionEpoch: number;
  observedPrincipal: string | null;
  identityEvidence: string | null;
  sessionStatus: SessionStatus;
  createdAt: string;
  updatedAt: string;
}

export type RoutingMode = "auto" | "explicit";

export interface Project {
  id: string;
  name: string;
  description: string | null;
  defaultRoutingMode: RoutingMode;
  defaultBindingId: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type BindingSetupState = "pending" | "verified" | "error";

export interface ProjectBinding {
  id: string;
  projectId: string;
  accountId: string;
  remoteProjectId: string | null;
  setupState: BindingSetupState;
  lastVerifiedAt: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type AssetAvailability = "ready" | "missing";

export interface Asset {
  id: string;
  contentHash: string; // SHA-256
  blobKey: string;
  mimeType: string;
  sizeBytes: number;
  width: number | null;
  height: number | null;
  availability: AssetAvailability;
  createdAt: string;
}

export interface ProjectAsset {
  projectId: string;
  assetId: string;
  displayName: string;
  createdAt: string;
}

export type JobStatus =
  | "queued"
  | "running"
  | "needs_attention"
  | "succeeded"
  | "failed"
  | "cancelled";

export interface Job {
  id: string;
  projectId: string;
  idempotencyKey: string;
  requestHash: string;
  prompt: string;
  model: string;
  optionsJson: string; // aspect ratio, negative prompt, seed, etc.
  routingMode: RoutingMode;
  pinnedBindingId: string | null;
  status: JobStatus;
  createdAt: string;
  updatedAt: string;
}

export interface JobInput {
  jobId: string;
  position: number;
  assetId: string;
}

export type AttemptPhase =
  | "preparing_inputs"
  | "submitting_intent"
  | "awaiting_generation"
  | "downloading_outputs"
  | "completed"
  | "failed";

export type AttemptOutcome =
  | "succeeded"
  | "failed"
  | "needs_attention"
  | "unknown";

export interface JobAttempt {
  id: string;
  jobId: string;
  attemptNumber: number;
  bindingId: string;
  sessionEpoch: number;
  phase: AttemptPhase;
  submitIntentAt: string | null;
  remoteOperationId: string | null;
  outcome: AttemptOutcome | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UploadState = "pending" | "uploaded" | "verified" | "failed";

export interface UploadAttempt {
  id: string;
  assetId: string;
  bindingId: string;
  sessionEpoch: number;
  filenameSent: string;
  operationState: UploadState;
  remoteMediaId: string | null;
  verificationEvidence: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AttemptInput {
  attemptId: string;
  position: number;
  uploadAttemptId: string;
  mediaIdObserved: string | null;
  attachedAt: string;
}

export type DownloadStatus = "pending" | "downloaded" | "failed";

export interface JobOutput {
  id: string;
  attemptId: string;
  position: number;
  remoteMediaId: string | null;
  remoteUrl: string;
  localAssetId: string | null;
  downloadStatus: DownloadStatus;
  downloadError: string | null;
  createdAt: string;
}
