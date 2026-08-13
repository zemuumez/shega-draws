-- 003_create_entries.sql
-- Entries: player raffle tickets, one confirmed number per draw (unique constraint)

CREATE TABLE IF NOT EXISTS entries (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id      UUID        NOT NULL REFERENCES draws(id) ON DELETE RESTRICT,
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
  number       TEXT        NOT NULL CHECK (number ~ '^[0-9]{2}$'),  -- "00"–"99"
  amount       INTEGER     NOT NULL CHECK (amount > 0),
  method       TEXT        NOT NULL CHECK (method IN ('telebirr', 'cbebirr', 'bank')),
  proof_key    TEXT        NOT NULL,    -- S3 object key (never a URL)
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'confirmed', 'rejected')),
  confirmed_by UUID        REFERENCES users(id),
  rejected_by  UUID        REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  rejected_at  TIMESTAMPTZ,

  -- One confirmed entry per number per draw (first-confirmed wins)
  CONSTRAINT unique_confirmed_number_per_draw
    UNIQUE (draw_id, number)
    DEFERRABLE INITIALLY IMMEDIATE
);

-- Note: The UNIQUE constraint above applies only to the draw+number combination.
-- A number can have multiple pending/rejected entries — only one confirmed.
-- The application enforces uniqueness check before confirming via IsNumberTaken().

CREATE INDEX idx_entries_draw_id    ON entries(draw_id);
CREATE INDEX idx_entries_user_id    ON entries(user_id);
CREATE INDEX idx_entries_status     ON entries(status);
CREATE INDEX idx_entries_number     ON entries(draw_id, number);
CREATE INDEX idx_entries_created_at ON entries(created_at DESC);
