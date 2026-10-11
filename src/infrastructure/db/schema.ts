// Flow Studio SQLite DDL Schema in TypeScript constant for reliable bundling

export const FLOW_SQL_SCHEMA = `
PRAGMA foreign_keys = ON;

-- 1. Accounts (Local Connection & Profile)
CREATE TABLE IF NOT EXISTS accounts (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  profile_path TEXT NOT NULL UNIQUE,
  enabled INTEGER NOT NULL DEFAULT 1,
  session_epoch INTEGER NOT NULL DEFAULT 1,
  observed_principal TEXT,
  identity_evidence TEXT,
  session_status TEXT NOT NULL DEFAULT 'unauthenticated',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 2. Projects (Business Work Project)
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  default_routing_mode TEXT NOT NULL DEFAULT 'auto',
  default_binding_id TEXT,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 3. Project Bindings (Association of Project + Account + Remote Flow Project)
CREATE TABLE IF NOT EXISTS project_bindings (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  account_id TEXT NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  remote_project_id TEXT,
  setup_state TEXT NOT NULL DEFAULT 'pending',
  last_verified_at TEXT,
  archived_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_project_account
  ON project_bindings(project_id, account_id)
  WHERE archived_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_account_remote
  ON project_bindings(account_id, remote_project_id)
  WHERE archived_at IS NULL AND remote_project_id IS NOT NULL;

-- 4. Assets (Local content-addressed file)
CREATE TABLE IF NOT EXISTS assets (
  id TEXT PRIMARY KEY,
  content_hash TEXT NOT NULL UNIQUE,
  blob_key TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  width INTEGER,
  height INTEGER,
  availability TEXT NOT NULL DEFAULT 'ready',
  created_at TEXT NOT NULL
);

-- 5. Project Assets (Associates asset to project with display name)
CREATE TABLE IF NOT EXISTS project_assets (
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TEXT NOT NULL,
  PRIMARY KEY (project_id, asset_id)
);

-- 6. Jobs (Immutable generation intent)
CREATE TABLE IF NOT EXISTS jobs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL UNIQUE,
  request_hash TEXT NOT NULL,
  prompt TEXT NOT NULL,
  model TEXT NOT NULL,
  options_json TEXT NOT NULL DEFAULT '{}',
  routing_mode TEXT NOT NULL DEFAULT 'auto',
  pinned_binding_id TEXT REFERENCES project_bindings(id),
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 7. Job Inputs (Ordered reference assets attached to the job)
CREATE TABLE IF NOT EXISTS job_inputs (
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  PRIMARY KEY (job_id, position)
);

-- 8. Job Attempts (Specific execution attempt of a job)
CREATE TABLE IF NOT EXISTS job_attempts (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL,
  binding_id TEXT NOT NULL REFERENCES project_bindings(id),
  session_epoch INTEGER NOT NULL,
  phase TEXT NOT NULL DEFAULT 'preparing_inputs',
  submit_intent_at TEXT,
  remote_operation_id TEXT,
  outcome TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(job_id, attempt_number)
);

-- 9. Upload Attempts (Evidence of reference image uploaded to remote project)
CREATE TABLE IF NOT EXISTS upload_attempts (
  id TEXT PRIMARY KEY,
  asset_id TEXT NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  binding_id TEXT NOT NULL REFERENCES project_bindings(id) ON DELETE CASCADE,
  session_epoch INTEGER NOT NULL,
  filename_sent TEXT NOT NULL,
  operation_state TEXT NOT NULL DEFAULT 'pending',
  remote_media_id TEXT,
  verification_evidence TEXT,
  error_message TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- 10. Attempt Inputs (Evidence linking job attempt to specific upload attempts)
CREATE TABLE IF NOT EXISTS attempt_inputs (
  attempt_id TEXT NOT NULL REFERENCES job_attempts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  upload_attempt_id TEXT NOT NULL REFERENCES upload_attempts(id),
  media_id_observed TEXT,
  attached_at TEXT NOT NULL,
  PRIMARY KEY (attempt_id, position)
);

-- 11. Job Outputs (Generated result records and local download tracking)
CREATE TABLE IF NOT EXISTS job_outputs (
  id TEXT PRIMARY KEY,
  attempt_id TEXT NOT NULL REFERENCES job_attempts(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  remote_media_id TEXT,
  remote_url TEXT NOT NULL,
  local_asset_id TEXT REFERENCES assets(id),
  download_status TEXT NOT NULL DEFAULT 'pending',
  download_error TEXT,
  created_at TEXT NOT NULL,
  UNIQUE(attempt_id, position)
);
`;
