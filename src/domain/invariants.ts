import { createHash } from "node:crypto";
import type { Job, JobAttempt, JobOutput } from "./types.js";

/**
 * Calculates SHA-256 request hash for normalized job payload to enforce idempotency.
 */
export function calculateRequestHash(
  prompt: string,
  model: string,
  optionsJson: string,
  inputAssetIds: string[],
): string {
  const normalized = JSON.stringify({
    prompt: prompt.trim(),
    model: model.trim(),
    options: JSON.parse(optionsJson || "{}"),
    inputs: [...inputAssetIds],
  });
  return createHash("sha256").update(normalized, "utf8").digest("hex");
}

/**
 * Invariant: Recovery rule after system restart or crash.
 * SPEC.md Section 6: Phục hồi đúng theo pha.
 */
export function determineRecoveryAction(attempt: JobAttempt): {
  canResumeImmediately: boolean;
  requiresAttention: boolean;
  reason: string;
} {
  // If submit_intent was never recorded, we haven't touched remote mutation yet
  if (!attempt.submitIntentAt) {
    return {
      canResumeImmediately: true,
      requiresAttention: false,
      reason:
        "No remote mutation attempted; safe to revalidate inputs and resume.",
    };
  }

  // If submit_intent was recorded but no final remote outcome was confirmed
  if (attempt.outcome === null || attempt.outcome === "unknown") {
    return {
      canResumeImmediately: false,
      requiresAttention: true,
      reason:
        "Submit intent was dispatched to Flow, but remote outcome is uncertain. Do NOT re-generate. Needs reconciliation.",
    };
  }

  return {
    canResumeImmediately: false,
    requiresAttention: false,
    reason: `Attempt already reached final outcome: ${attempt.outcome}`,
  };
}

/**
 * Invariant: Download retry policy.
 * SPEC.md Section 5: "generate thành công nhưng tải ảnh lỗi chỉ retry download, tuyệt đối không Generate lại."
 */
export function canRetryOutputDownload(
  output: JobOutput,
  attempt: JobAttempt,
): boolean {
  if (attempt.outcome !== "succeeded") {
    return false;
  }
  return (
    output.downloadStatus === "failed" || output.downloadStatus === "pending"
  );
}

/**
 * Validates sequential positions for ordered list (e.g. job inputs, attempt inputs).
 */
export function validateSequentialPositions(positions: number[]): boolean {
  const sorted = [...positions].sort((a, b) => a - b);
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i] !== i) {
      return false;
    }
  }
  return true;
}
