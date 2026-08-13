-- 002_create_draws.sql
-- Draws: one active draw at a time, commit-reveal fairness

CREATE TABLE IF NOT EXISTS draws (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  draw_id         TEXT        NOT NULL UNIQUE,   -- e.g. "SHEGA-0842" (human-readable)
  sanity_id       TEXT        NOT NULL UNIQUE,   -- Sanity CMS document _id
  seed            TEXT,                          -- Secret until revealed (NULL before reveal)
  commitment      TEXT        NOT NULL,          -- SHA-256(seed), always public
  status          TEXT        NOT NULL DEFAULT 'open'
                              CHECK (status IN ('open', 'closed', 'revealed')),
  deadline        TIMESTAMPTZ NOT NULL,
  winning_numbers JSONB,                         -- {"1":"07","2":"43",...} after reveal
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at       TIMESTAMPTZ,
  revealed_at     TIMESTAMPTZ,
  closed_by       UUID        REFERENCES users(id),
  revealed_by     UUID        REFERENCES users(id)
);

-- Enforce only one open draw at a time
CREATE UNIQUE INDEX idx_draws_single_open
  ON draws(status)
  WHERE status = 'open';

CREATE INDEX idx_draws_status     ON draws(status);
CREATE INDEX idx_draws_created_at ON draws(created_at DESC);
