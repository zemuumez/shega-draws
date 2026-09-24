ALTER TABLE orders ADD COLUMN IF NOT EXISTS refund_recorded boolean NOT NULL DEFAULT false;
CREATE TABLE IF NOT EXISTS backend_settings (key text PRIMARY KEY, value text NOT NULL);
CREATE INDEX IF NOT EXISTS orders_worker_due ON orders(next_check_at) WHERE provider<>'legacy' AND provider_reference<>'';
CREATE INDEX IF NOT EXISTS orders_pool_status ON orders(draw_id,status,expires_at);
CREATE INDEX IF NOT EXISTS rate_limits_expiry ON rate_limits(reset_at);
