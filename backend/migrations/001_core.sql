CREATE TABLE IF NOT EXISTS schema_migrations (version text PRIMARY KEY);
CREATE TABLE IF NOT EXISTS staff (user_id text PRIMARY KEY, role text NOT NULL CHECK (role IN ('admin','reviewer')), enabled boolean NOT NULL DEFAULT true);
CREATE TABLE IF NOT EXISTS draws (
 id text PRIMARY KEY, title text NOT NULL, currency text NOT NULL CHECK(currency IN ('ETB','USD')),
 price_minor bigint NOT NULL CHECK(price_minor > 0 AND price_minor <= 100000000),
 capacity integer NOT NULL CHECK(capacity BETWEEN 1 AND 100000),
 status text NOT NULL DEFAULT 'closed' CHECK(status IN ('open','closed','completed')),
 deadline timestamptz NOT NULL, live_video_url text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS one_open_selection ON draws(currency, price_minor, capacity) WHERE status='open';
CREATE TABLE IF NOT EXISTS advertisers (code text PRIMARY KEY, name text NOT NULL, active boolean NOT NULL DEFAULT true, details jsonb NOT NULL DEFAULT '{}');
CREATE TABLE IF NOT EXISTS orders (
 id text PRIMARY KEY, user_id text NOT NULL, draw_id text NOT NULL REFERENCES draws(id), number integer NOT NULL CHECK(number>0),
 amount_minor bigint NOT NULL CHECK(amount_minor>0), currency text NOT NULL, provider text NOT NULL,
 status text NOT NULL CHECK(status IN ('initializing','pending','paid','expired','failed','refund_required','refunded','legacy_pending')),
 idempotency_key text NOT NULL, fingerprint text NOT NULL, phone text NOT NULL, email text NOT NULL, name text NOT NULL,
 promo_code text NOT NULL DEFAULT '', checkout_url text NOT NULL DEFAULT '', provider_reference text NOT NULL DEFAULT '',
 expires_at timestamptz NOT NULL, created_at timestamptz NOT NULL DEFAULT now(), paid_at timestamptz,
 next_check_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz, attempts integer NOT NULL DEFAULT 0,
 UNIQUE(user_id,idempotency_key)
);
CREATE UNIQUE INDEX IF NOT EXISTS one_ticket_owner ON orders(draw_id,number) WHERE status IN ('initializing','pending','paid','legacy_pending');
CREATE UNIQUE INDEX IF NOT EXISTS unique_provider_transaction ON orders(provider,provider_reference) WHERE provider_reference<>'';
CREATE INDEX IF NOT EXISTS orders_user_history ON orders(user_id,created_at DESC,id);
CREATE INDEX IF NOT EXISTS orders_reconcile ON orders(next_check_at) WHERE status IN ('initializing','pending','expired');
CREATE INDEX IF NOT EXISTS orders_expiry ON orders(expires_at) WHERE status IN ('initializing','pending');
CREATE TABLE IF NOT EXISTS payment_ledger (
 id bigserial PRIMARY KEY, order_id text NOT NULL REFERENCES orders(id), kind text NOT NULL CHECK(kind IN ('payment','refund')),
 amount_minor bigint NOT NULL, currency text NOT NULL, provider_reference text NOT NULL, created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(order_id,kind)
);
CREATE TABLE IF NOT EXISTS webhook_events (
 digest text PRIMARY KEY, provider text NOT NULL, reference text NOT NULL, received_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS results (draw_id text PRIMARY KEY REFERENCES draws(id), published_at timestamptz NOT NULL DEFAULT now(), data jsonb NOT NULL);
CREATE TABLE IF NOT EXISTS messages (id text PRIMARY KEY, kind text NOT NULL CHECK(kind IN ('contact','subscription')), data jsonb NOT NULL, status text NOT NULL DEFAULT 'unread' CHECK(status IN ('unread','resolved')), created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS legacy_records (id text PRIMARY KEY, type text NOT NULL, data jsonb NOT NULL, claimed_by text, imported_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS audit_log (id bigserial PRIMARY KEY, actor text NOT NULL, action text NOT NULL, resource text NOT NULL, created_at timestamptz NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS rate_limits (key text PRIMARY KEY, count integer NOT NULL, reset_at timestamptz NOT NULL);
