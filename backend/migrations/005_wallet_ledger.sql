ALTER TABLE operations_control ADD COLUMN deposits_paused boolean NOT NULL DEFAULT true;
CREATE TABLE wallet_accounts (
 id bigserial PRIMARY KEY,
 user_id text,
 kind text NOT NULL CHECK(kind IN ('customer','provider_clearing','ticket_sales')),
 currency text NOT NULL CHECK(currency IN ('ETB','USD')),
 balance_minor bigint NOT NULL DEFAULT 0 CHECK(balance_minor BETWEEN -10000000000000 AND 10000000000000),
 restricted boolean NOT NULL DEFAULT false,
 CHECK((kind='customer')=(user_id IS NOT NULL)),
 UNIQUE(user_id,currency), UNIQUE(id,currency)
);
CREATE UNIQUE INDEX wallet_system_account ON wallet_accounts(kind,currency) WHERE kind<>'customer';
CREATE TABLE wallet_journals (
 id bigserial PRIMARY KEY,
 operation text NOT NULL UNIQUE,
 currency text NOT NULL CHECK(currency IN ('ETB','USD')),
 kind text NOT NULL CHECK(kind IN ('deposit','deposit_reversal','purchase','purchase_reversal')),
 reference text NOT NULL,
 reversal_of bigint UNIQUE REFERENCES wallet_journals(id),
 created_at timestamptz NOT NULL DEFAULT now(),
 created_xid xid8 NOT NULL DEFAULT pg_current_xact_id(),
 UNIQUE(id,currency),
 CHECK((kind IN ('deposit_reversal','purchase_reversal'))=(reversal_of IS NOT NULL))
);
CREATE TABLE wallet_entries (
 id bigserial PRIMARY KEY,
 journal_id bigint NOT NULL,
 account_id bigint NOT NULL,
 currency text NOT NULL,
 amount_minor bigint NOT NULL CHECK(amount_minor<>0 AND amount_minor BETWEEN -100000000 AND 100000000),
 balance_after_minor bigint,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY(journal_id,currency) REFERENCES wallet_journals(id,currency),
 FOREIGN KEY(account_id,currency) REFERENCES wallet_accounts(id,currency),
 UNIQUE(journal_id,account_id)
);
CREATE INDEX wallet_history ON wallet_entries(account_id,id DESC);
CREATE FUNCTION wallet_immutable() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN RAISE EXCEPTION 'Posted ledger data is immutable' USING ERRCODE='23514'; END $$;
CREATE TRIGGER wallet_journals_immutable BEFORE UPDATE OR DELETE ON wallet_journals FOR EACH ROW EXECUTE FUNCTION wallet_immutable();
CREATE TRIGGER wallet_entries_immutable BEFORE UPDATE OR DELETE ON wallet_entries FOR EACH ROW EXECUTE FUNCTION wallet_immutable();
CREATE FUNCTION wallet_account_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  IF NEW.balance_minor<>0 THEN RAISE EXCEPTION 'Initial balance must be zero' USING ERRCODE='23514'; END IF;
 ELSE
  IF ROW(NEW.user_id,NEW.kind,NEW.currency) IS DISTINCT FROM ROW(OLD.user_id,OLD.kind,OLD.currency) OR
   (NEW.balance_minor<>OLD.balance_minor AND pg_trigger_depth()<2) THEN
   RAISE EXCEPTION 'Account identity and ledger balance are protected' USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER wallet_account_guard BEFORE INSERT OR UPDATE ON wallet_accounts FOR EACH ROW EXECUTE FUNCTION wallet_account_guard();
CREATE FUNCTION wallet_entry_apply() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE j wallet_journals; a wallet_accounts;
BEGIN
 SELECT * INTO STRICT j FROM wallet_journals WHERE id=NEW.journal_id;
 IF j.created_xid<>pg_current_xact_id() THEN RAISE EXCEPTION 'Cannot append to a posted journal' USING ERRCODE='23514'; END IF;
 SELECT * INTO STRICT a FROM wallet_accounts WHERE id=NEW.account_id;
 IF a.kind='customer' THEN
  IF (j.kind IN ('deposit','purchase_reversal') AND NEW.amount_minor<0) OR (j.kind IN ('purchase','deposit_reversal') AND NEW.amount_minor>0) THEN
   RAISE EXCEPTION 'Incorrect customer entry direction' USING ERRCODE='23514';
  END IF;
  SELECT * INTO STRICT a FROM wallet_accounts WHERE id=NEW.account_id FOR UPDATE;
  IF NEW.amount_minor<0 AND j.kind<>'deposit_reversal' AND (a.restricted OR a.balance_minor+NEW.amount_minor<0) THEN
   RAISE EXCEPTION 'Insufficient available balance' USING ERRCODE='23514';
  END IF;
  UPDATE wallet_accounts SET balance_minor=balance_minor+NEW.amount_minor,
   restricted=restricted OR (balance_minor+NEW.amount_minor<0) WHERE id=a.id RETURNING balance_minor INTO NEW.balance_after_minor;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER wallet_entry_apply BEFORE INSERT ON wallet_entries FOR EACH ROW EXECUTE FUNCTION wallet_entry_apply();
CREATE FUNCTION wallet_balanced() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE journal bigint; total numeric; entries bigint; customers bigint; counters bigint; j wallet_journals;
BEGIN
 IF TG_TABLE_NAME='wallet_journals' THEN journal:=NEW.id; ELSE journal:=NEW.journal_id; END IF;
 SELECT count(*),COALESCE(sum(amount_minor),0) INTO entries,total FROM wallet_entries WHERE journal_id=journal;
 IF entries<2 OR total<>0 THEN RAISE EXCEPTION 'Unbalanced wallet journal' USING ERRCODE='23514'; END IF;
 SELECT * INTO STRICT j FROM wallet_journals WHERE id=journal;
 SELECT count(*) FILTER(WHERE a.kind='customer'), count(*) FILTER(WHERE a.kind=CASE WHEN j.kind IN ('deposit','deposit_reversal') THEN 'provider_clearing' ELSE 'ticket_sales' END)
 INTO customers,counters FROM wallet_entries e JOIN wallet_accounts a ON a.id=e.account_id WHERE e.journal_id=journal;
 IF entries<>2 OR customers<>1 OR counters<>1 THEN RAISE EXCEPTION 'Invalid wallet counterparties' USING ERRCODE='23514'; END IF;
 IF j.reversal_of IS NOT NULL THEN
  IF NOT EXISTS(SELECT 1 FROM wallet_journals original WHERE original.id=j.reversal_of AND original.currency=j.currency AND original.reference=j.reference AND original.kind=CASE WHEN j.kind='deposit_reversal' THEN 'deposit' ELSE 'purchase' END) OR
   (SELECT count(*) FROM wallet_entries e JOIN wallet_entries original ON original.journal_id=j.reversal_of AND original.account_id=e.account_id AND original.amount_minor=-e.amount_minor WHERE e.journal_id=journal)<>2 THEN
   RAISE EXCEPTION 'Reversal must match original journal' USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NULL;
END $$;
CREATE CONSTRAINT TRIGGER wallet_journal_balanced AFTER INSERT ON wallet_journals DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION wallet_balanced();
CREATE CONSTRAINT TRIGGER wallet_entries_balanced AFTER INSERT ON wallet_entries DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION wallet_balanced();
CREATE TABLE deposits (
 id text PRIMARY KEY CHECK(id LIKE 'dep_%'), user_id text NOT NULL,
 currency text NOT NULL CHECK(currency IN ('ETB','USD')), amount_minor bigint NOT NULL CHECK(amount_minor BETWEEN 1 AND 100000000),
 provider text NOT NULL, mode text NOT NULL CHECK(mode IN ('test','live')),
 status text NOT NULL CHECK(status IN ('initializing','pending','succeeded','failed','reversed','review')),
 idempotency_key text NOT NULL, fingerprint text NOT NULL, phone text NOT NULL, email text NOT NULL, name text NOT NULL,
 checkout_url text NOT NULL DEFAULT '', provider_reference text NOT NULL DEFAULT '',
 credited_at timestamptz, reversed_at timestamptz, review_reason text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(), next_check_at timestamptz NOT NULL DEFAULT now(), lease_until timestamptz, attempts integer NOT NULL DEFAULT 0,
 UNIQUE(user_id,idempotency_key)
);
CREATE INDEX deposits_user_history ON deposits(user_id,created_at DESC,id);
CREATE INDEX deposits_reconcile ON deposits(next_check_at) WHERE provider_reference<>'' AND status<>'reversed';
-- One provider receipt can fund either an old ticket or a deposit, never both.
CREATE TABLE provider_payment_references (
 provider text NOT NULL, reference text NOT NULL, owner_type text NOT NULL, owner_id text NOT NULL,
 PRIMARY KEY(provider,reference), UNIQUE(owner_type,owner_id)
);
INSERT INTO provider_payment_references SELECT provider,provider_reference,'orders',id FROM orders WHERE provider_reference<>'';
CREATE FUNCTION claim_payment_reference() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE current_owner text; current_type text;
BEGIN
 IF TG_OP='UPDATE' AND OLD.provider_reference<>'' AND ROW(NEW.provider_reference,NEW.provider) IS DISTINCT FROM ROW(OLD.provider_reference,OLD.provider) THEN
  RAISE EXCEPTION 'Payment reference is immutable' USING ERRCODE='23505';
 END IF;
 IF NEW.provider_reference<>'' THEN
  INSERT INTO provider_payment_references VALUES(NEW.provider,NEW.provider_reference,TG_TABLE_NAME,NEW.id) ON CONFLICT(provider,reference) DO NOTHING;
  SELECT owner_type,owner_id INTO current_type,current_owner FROM provider_payment_references WHERE provider=NEW.provider AND reference=NEW.provider_reference;
  IF current_type<>TG_TABLE_NAME OR current_owner<>NEW.id THEN RAISE EXCEPTION 'Payment receipt already assigned' USING ERRCODE='23505'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER order_payment_reference BEFORE INSERT OR UPDATE OF provider_reference,provider ON orders FOR EACH ROW EXECUTE FUNCTION claim_payment_reference();
CREATE TRIGGER deposit_payment_reference BEFORE INSERT OR UPDATE OF provider_reference,provider ON deposits FOR EACH ROW EXECUTE FUNCTION claim_payment_reference();
CREATE TRIGGER payment_reference_immutable BEFORE UPDATE OR DELETE ON provider_payment_references FOR EACH ROW EXECUTE FUNCTION wallet_immutable();

CREATE FUNCTION deposit_identity_guard() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF ROW(NEW.user_id,NEW.currency,NEW.amount_minor,NEW.provider,NEW.mode,NEW.idempotency_key,NEW.fingerprint) IS DISTINCT FROM ROW(OLD.user_id,OLD.currency,OLD.amount_minor,OLD.provider,OLD.mode,OLD.idempotency_key,OLD.fingerprint) THEN
  RAISE EXCEPTION 'Deposit identity is immutable' USING ERRCODE='23514';
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER deposit_identity_guard BEFORE UPDATE ON deposits FOR EACH ROW EXECUTE FUNCTION deposit_identity_guard();
