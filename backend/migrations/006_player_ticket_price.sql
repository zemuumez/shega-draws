-- Operator-controlled price for the current ETB draw model.
ALTER TABLE draws ADD COLUMN IF NOT EXISTS ticket_price INTEGER NOT NULL DEFAULT 100 CHECK (ticket_price > 0);
CREATE INDEX IF NOT EXISTS idx_entries_player_history ON entries(user_id, created_at DESC);

-- Pending purchases reserve numbers; rejected payments release them for resale.
ALTER TABLE entries DROP CONSTRAINT IF EXISTS unique_confirmed_number_per_draw;
CREATE UNIQUE INDEX IF NOT EXISTS unique_confirmed_number_per_draw
ON entries(draw_id, number) WHERE status IN ('pending', 'confirmed');
