# Flow Studio Technical Specification

## 1. Overview

Flow Studio is a local-first automation client, REST API server, and management dashboard for Google Flow image generation. It provides a reliable, transaction-backed layer over browser automation with support for multi-account pooling, ACID job scheduling, content-addressable storage, and text-to-image (T2I) & image-to-image (I2I) generation.

## 2. Core Domain Models

1. **Project**: Local workspace grouping jobs, input assets, and account bindings.
2. **Account**: Represents an isolated local Chrome profile. Does not store raw tokens or passwords in the database; authentication state is preserved safely within Chrome's native profile storage.
3. **Project Binding**: Connects a local `Project` to a remote Google Flow project on a specific `Account`.
4. **Asset**: Content-addressed binary blob identified by SHA-256 hash. Never duplicated across projects.
5. **Job**: An immutable intent to generate images (Prompt, model, parameters, reference assets, request hash, idempotency key).
6. **Job Attempt**: A single execution attempt of a Job associated with a specific binding and `session_epoch`.
7. **Job Output**: A generated image outcome containing remote URL, content hash, local asset ID, and download state.

## 3. Storage Hierarchy

All runtime artifacts are organized under `data_root`:
```text
<data_root>/
  application.sqlite       # ACID metadata database
  blobs/<prefix>/<hash>    # Content-addressable binary blobs
  profiles/<account_id>/   # Isolated Chrome persistent profiles
  temp/                    # Temporary scratch files during upload/download
```

## 4. Safety Invariants & Execution State Machine

### 4.1 Invariant: Strict Idempotency
Submitting a job with the same `idempotency_key` and matching payload returns the existing `job_id` without duplicating work or generating additional remote API calls.

### 4.2 Invariant: Pre-submission Intent Recording
Before initiating any remote mutation or clicking "Generate" in the browser, the attempt MUST record `phase = 'submitting_intent'` and timestamp `submit_intent_at` inside an ACID SQLite transaction.

### 4.3 Invariant: Failure Isolation
If generation succeeds remotely but downloading the image fails, the system ONLY retries the download. It NEVER triggers another remote generation attempt (which would consume additional user credits).

### 4.4 Invariant: Session Epoch Invalidation
Any detected logout or session reset increments `session_epoch`. Cached state or attempts belonging to an older epoch are immediately invalidated.

## 5. Recovery Rules by Execution Phase

When resuming from an unexpected crash or system restart:
- **Phase `preparing_inputs`**: Safe to resume immediately (no remote mutation has occurred).
- **Phase `submitting_intent` / `awaiting_generation`**: Marked as `needs_attention`. Must perform reconciliation against remote Flow canvas rather than blindly re-executing.
- **Phase `downloading_outputs`**: Only retry downloading image binaries for existing output records.
- **Phase `completed`**: Terminal state, no action needed.

## 6. Request Hashing

`calculateRequestHash(prompt, model, optionsJson, inputAssetIds)`:
- Prompts are trimmed and whitespace-normalized.
- Model names are lowercased.
- Options JSON keys are sorted deterministically.
- Input asset IDs are sorted in canonical sequence order.
- SHA-256 digest guarantees identical hashes for identical intents.

## 7. Account Coordination & Mutex Discipline

`AccountCoordinator` is the sole gatekeeper controlling profile browser execution:
- At any point in time, an account profile may have at most ONE active browser lease.
- Multiple jobs queued across different accounts run concurrently.
- Releasing a lease immediately notifies waiting queue workers.

## 8. Seam Discipline & Adapters

Following the `/codebase-design` principles:
- **Interface Seam**: `FlowAdapterPort` defines the minimal contract for generation engines.
- **Production Adapter**: `FlowAdapter` (Playwright automating Chrome).
- **Test Adapter**: `InMemoryFlowAdapter` provides hermetic, in-process execution without browser dependency.
- **Deep Module Facade**: `FlowStudio` encapsulates all underlying subsystems behind a cohesive, high-leverage API.
