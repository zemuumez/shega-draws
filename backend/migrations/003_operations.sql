CREATE TABLE IF NOT EXISTS operations_control (
 id boolean PRIMARY KEY DEFAULT true CHECK(id),
 sales_paused boolean NOT NULL DEFAULT false,
 recovery_locked boolean NOT NULL DEFAULT false,
 reason text NOT NULL DEFAULT '',
 updated_at timestamptz NOT NULL DEFAULT now(),
 updated_by text NOT NULL DEFAULT 'migration'
);
INSERT INTO operations_control(id) VALUES(true) ON CONFLICT DO NOTHING;
CREATE TABLE IF NOT EXISTS backup_jobs (
 id text PRIMARY KEY,
 requested_by text NOT NULL,
 status text NOT NULL DEFAULT 'queued' CHECK(status IN ('queued','running','succeeded','failed')),
 requested_at timestamptz NOT NULL DEFAULT now(),
 started_at timestamptz,
 finished_at timestamptz,
 snapshot_id text NOT NULL DEFAULT '',
 message text NOT NULL DEFAULT ''
);
CREATE UNIQUE INDEX IF NOT EXISTS one_active_backup ON backup_jobs((true)) WHERE status IN ('queued','running');
CREATE TABLE IF NOT EXISTS worker_heartbeats (
 id text PRIMARY KEY,
 seen_at timestamptz NOT NULL DEFAULT now()
);
