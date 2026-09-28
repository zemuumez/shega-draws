CREATE TABLE lottery_templates (
 id text PRIMARY KEY CHECK(length(id) BETWEEN 1 AND 100),
 settings jsonb NOT NULL,
 active boolean NOT NULL DEFAULT true,
 version integer NOT NULL DEFAULT 1 CHECK(version>0),
 created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE draws ADD COLUMN template_id text REFERENCES lottery_templates(id);
ALTER TABLE draws ADD COLUMN template_version integer;
ALTER TABLE draws ADD COLUMN rules jsonb;
ALTER TABLE draws ADD COLUMN version integer NOT NULL DEFAULT 1;
ALTER TABLE draws ADD COLUMN sales_started_at timestamptz;
ALTER TABLE draws ADD COLUMN sales_closed_at timestamptz;
-- Preserve existing records without inventing historical deductions/shares.
UPDATE draws SET sales_started_at=created_at WHERE status IN ('open','completed') OR EXISTS(SELECT 1 FROM orders WHERE draw_id=draws.id);
UPDATE draws SET sales_closed_at=deadline WHERE status='completed' OR (sales_started_at IS NOT NULL AND deadline<=now());
ALTER TABLE audit_log ADD COLUMN details jsonb NOT NULL DEFAULT '{}';
CREATE INDEX orders_round_status ON orders(draw_id,status);
CREATE INDEX draws_admin_pages ON draws(created_at DESC,id);
CREATE INDEX templates_admin_pages ON lottery_templates(created_at DESC,id);
-- Defense in depth: old endpoints or later code cannot rewrite opened terms.
CREATE FUNCTION protect_round_terms() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF OLD.template_id IS NOT NULL THEN
  IF NEW.template_id IS DISTINCT FROM OLD.template_id OR NEW.template_version IS DISTINCT FROM OLD.template_version THEN
   RAISE EXCEPTION 'Round template is immutable' USING ERRCODE='23514';
  END IF;
  IF (OLD.sales_started_at IS NOT NULL OR OLD.sales_closed_at IS NOT NULL) AND
   (ROW(NEW.title,NEW.currency,NEW.price_minor,NEW.capacity,NEW.deadline,NEW.rules,NEW.sales_started_at)
    IS DISTINCT FROM ROW(OLD.title,OLD.currency,OLD.price_minor,OLD.capacity,OLD.deadline,OLD.rules,OLD.sales_started_at)) THEN
   RAISE EXCEPTION 'Opened round terms are immutable' USING ERRCODE='23514';
  END IF;
  IF OLD.status='completed' AND NEW.status<>'completed' THEN
   RAISE EXCEPTION 'Completed round cannot reopen' USING ERRCODE='23514';
  END IF;
  IF OLD.sales_closed_at IS NOT NULL AND (NEW.sales_closed_at IS DISTINCT FROM OLD.sales_closed_at OR NEW.status='open') THEN
   RAISE EXCEPTION 'Closed round cannot reopen' USING ERRCODE='23514';
  END IF;
  IF NEW.status='open' AND (NEW.sales_started_at IS NULL OR NEW.rules IS NULL OR NEW.deadline<=clock_timestamp()) THEN
   RAISE EXCEPTION 'Round cannot open' USING ERRCODE='23514';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER draws_protect_terms BEFORE UPDATE ON draws FOR EACH ROW EXECUTE FUNCTION protect_round_terms();
