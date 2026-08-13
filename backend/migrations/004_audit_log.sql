-- 004_audit_log.sql
-- Immutable audit trail for all admin actions

CREATE TABLE IF NOT EXISTS audit_log (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id   UUID        NOT NULL REFERENCES users(id),
  action     TEXT        NOT NULL,
               -- 'confirm_entry' | 'reject_entry' | 'close_draw' | 'reveal_draw'
  target_id  UUID,       -- Entry or Draw UUID, NULL for global actions
  metadata   JSONB,      -- Action-specific context (number, draw_id, commitment, etc.)
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Revoke UPDATE and DELETE on audit_log for all roles except superuser
-- This makes the audit log append-only at the PostgreSQL level
REVOKE UPDATE, DELETE ON audit_log FROM PUBLIC;

CREATE INDEX idx_audit_actor     ON audit_log(actor_id);
CREATE INDEX idx_audit_action    ON audit_log(action);
CREATE INDEX idx_audit_target_id ON audit_log(target_id) WHERE target_id IS NOT NULL;
CREATE INDEX idx_audit_created   ON audit_log(created_at DESC);
