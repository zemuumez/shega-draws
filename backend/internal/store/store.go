package store

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgxpool"
	"net/url"
	"regexp"
	"rimna/backend/internal/domain"
	"strings"
	"time"
)

type Store struct{ DB *pgxpool.Pool }

func Open(ctx context.Context, dsn string, max int32) (*Store, error) {
	c, err := pgxpool.ParseConfig(dsn)
	if err != nil {
		return nil, err
	}
	c.MaxConns = max
	c.MinConns = 2
	c.MaxConnLifetime = time.Hour
	c.ConnConfig.RuntimeParams["statement_timeout"] = "10000"
	c.ConnConfig.RuntimeParams["idle_in_transaction_session_timeout"] = "10000"
	p, err := pgxpool.NewWithConfig(ctx, c)
	if err != nil {
		return nil, err
	}
	if err = p.Ping(ctx); err != nil {
		p.Close()
		return nil, err
	}
	return &Store{DB: p}, nil
}
func dbError(err error) error {
	if errors.Is(err, pgx.ErrNoRows) {
		return domain.ErrNotFound
	}
	var p *pgconn.PgError
	if errors.As(err, &p) && (p.Code == "23505" || p.Code == "23514") {
		return domain.ErrConflict
	}
	return err
}

const orderColumns = `id,user_id,draw_id,number,amount_minor,currency,provider,status,idempotency_key,fingerprint,phone,email,name,promo_code,checkout_url,provider_reference,expires_at,created_at,refund_recorded`

func scanOrder(r pgx.Row) (domain.Order, error) {
	var o domain.Order
	err := r.Scan(&o.ID, &o.UserID, &o.DrawID, &o.Number, &o.AmountMinor, &o.Currency, &o.Provider, &o.Status, &o.Key, &o.Fingerprint, &o.Phone, &o.Email, &o.Name, &o.PromoCode, &o.CheckoutURL, &o.ProviderReference, &o.ExpiresAt, &o.CreatedAt, &o.Refunded)
	return o, dbError(err)
}
func (s *Store) Draw(ctx context.Context, id string) (domain.Draw, error) {
	var d domain.Draw
	err := s.DB.QueryRow(ctx, `SELECT id,title,currency,price_minor,capacity,status,deadline,live_video_url FROM draws WHERE id=$1`, id).Scan(&d.ID, &d.Title, &d.Currency, &d.PriceMinor, &d.Capacity, &d.Status, &d.Deadline, &d.LiveVideoURL)
	return d, dbError(err)
}
func (s *Store) Draws(ctx context.Context) ([]domain.Draw, error) {
	rows, err := s.DB.Query(ctx, `SELECT id,title,currency,price_minor,capacity,status,deadline,live_video_url FROM draws ORDER BY created_at DESC LIMIT 500`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.Draw{}
	for rows.Next() {
		var d domain.Draw
		if err = rows.Scan(&d.ID, &d.Title, &d.Currency, &d.PriceMinor, &d.Capacity, &d.Status, &d.Deadline, &d.LiveVideoURL); err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	return out, rows.Err()
}
func (s *Store) Availability(ctx context.Context, id string, from, to int) (map[string]any, error) {
	var capacity int
	var status string
	var deadline time.Time
	err := s.DB.QueryRow(ctx, `SELECT capacity,status,deadline FROM draws WHERE id=$1`, id).Scan(&capacity, &status, &deadline)
	if err != nil {
		return nil, dbError(err)
	}
	if from < 1 {
		from = 1
	}
	if to < from || to > from+199 {
		to = from + 99
	}
	if to > capacity {
		to = capacity
	}
	rows, err := s.DB.Query(ctx, `SELECT number FROM orders WHERE draw_id=$1 AND number BETWEEN $2 AND $3 AND (status IN ('paid','legacy_pending') OR (status IN ('initializing','pending') AND expires_at>now())) ORDER BY number`, id, from, to)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	taken := []int{}
	for rows.Next() {
		var n int
		if err = rows.Scan(&n); err != nil {
			return nil, err
		}
		taken = append(taken, n)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	var count int
	err = s.DB.QueryRow(ctx, `SELECT count(*) FROM orders WHERE draw_id=$1 AND (status IN ('paid','legacy_pending') OR (status IN ('initializing','pending') AND expires_at>now()))`, id).Scan(&count)
	return map[string]any{"drawId": id, "poolSize": capacity, "reserved": count, "remaining": capacity - count, "takenNumbers": taken, "from": from, "to": to, "open": status == "open" && deadline.After(time.Now())}, err
}
func (s *Store) Reserve(ctx context.Context, o domain.Order) (domain.Order, bool, error) {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return o, false, err
	}
	defer tx.Rollback(ctx)
	// Serialize only this user's purchases, never all buyers in a draw.
	if _, err = tx.Exec(ctx, `SELECT pg_advisory_xact_lock(hashtextextended($1,0))`, o.UserID); err != nil {
		return o, false, err
	}
	existing, e := scanOrder(tx.QueryRow(ctx, `SELECT `+orderColumns+` FROM orders WHERE user_id=$1 AND idempotency_key=$2`, o.UserID, o.Key))
	if e == nil {
		if existing.Fingerprint != o.Fingerprint {
			return o, false, domain.ErrConflict
		}
		return existing, false, nil
	}
	if !errors.Is(e, domain.ErrNotFound) {
		return o, false, e
	}
	var paused, recovery bool
	if err = tx.QueryRow(ctx, `SELECT sales_paused,recovery_locked FROM operations_control WHERE id=true FOR SHARE`).Scan(&paused, &recovery); err != nil {
		return o, false, err
	}
	if paused || recovery {
		return o, false, domain.ErrPaused
	}
	var active int
	if err = tx.QueryRow(ctx, `SELECT count(*) FROM orders WHERE user_id=$1 AND status IN ('initializing','pending') AND expires_at>now()`, o.UserID).Scan(&active); err != nil {
		return o, false, err
	}
	if active >= 3 {
		return o, false, domain.ErrRate
	}
	var d domain.Draw
	err = tx.QueryRow(ctx, `SELECT id,currency,price_minor,capacity,status,deadline FROM draws WHERE id=$1 FOR SHARE`, o.DrawID).Scan(&d.ID, &d.Currency, &d.PriceMinor, &d.Capacity, &d.Status, &d.Deadline)
	if err != nil {
		return o, false, dbError(err)
	}
	// Use the authoritative database clock after acquiring the round lock;
	// different API hosts must not disagree about the sales cutoff.
	var admissionTime time.Time
	if err = tx.QueryRow(ctx, `SELECT clock_timestamp()`).Scan(&admissionTime); err != nil {
		return o, false, err
	}
	if d.Status != "open" || !d.Deadline.After(admissionTime) {
		return o, false, domain.ErrClosed
	}
	if o.Number < 1 || o.Number > d.Capacity {
		return o, false, domain.ErrInvalid
	}
	if o.PromoCode != "" {
		var ok bool
		err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM advertisers WHERE code=$1 AND active)`, o.PromoCode).Scan(&ok)
		if err != nil {
			return o, false, err
		}
		if !ok {
			return o, false, domain.ErrInvalid
		}
	}
	// Release only an expired hold for the chosen number. The partial unique index
	// arbitrates simultaneous attempts across every API instance.
	_, err = tx.Exec(ctx, `UPDATE orders SET status='expired' WHERE draw_id=$1 AND number=$2 AND status IN ('initializing','pending') AND expires_at<=now()`, o.DrawID, o.Number)
	if err != nil {
		return o, false, err
	}
	o.AmountMinor = d.PriceMinor
	o.Currency = d.Currency
	o.Status = "initializing"
	o.ExpiresAt = admissionTime.Add(15 * time.Minute)
	if d.Deadline.Before(o.ExpiresAt) {
		o.ExpiresAt = d.Deadline
	}
	_, err = tx.Exec(ctx, `INSERT INTO orders(id,user_id,draw_id,number,amount_minor,currency,provider,status,idempotency_key,fingerprint,phone,email,name,promo_code,expires_at,next_check_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,now()+interval '30 seconds')`, o.ID, o.UserID, o.DrawID, o.Number, o.AmountMinor, o.Currency, o.Provider, o.Status, o.Key, o.Fingerprint, o.Phone, o.Email, o.Name, o.PromoCode, o.ExpiresAt)
	if err != nil {
		return o, false, dbError(err)
	}
	return o, true, tx.Commit(ctx)
}
func (s *Store) Checkout(ctx context.Context, id string, c domain.Checkout) error {
	_, err := s.DB.Exec(ctx, `UPDATE orders SET checkout_url=$2,provider_reference=CASE WHEN $3='' THEN provider_reference ELSE $3 END,status=CASE WHEN status='initializing' THEN 'pending' ELSE status END WHERE id=$1`, id, c.URL, c.Reference)
	return dbError(err)
}
func (s *Store) Order(ctx context.Context, id string) (domain.Order, error) {
	return scanOrder(s.DB.QueryRow(ctx, `SELECT `+orderColumns+` FROM orders WHERE id=$1`, id))
}
func (s *Store) Orders(ctx context.Context, user string, offset int, admin bool) ([]domain.Order, error) {
	rows, err := s.DB.Query(ctx, `SELECT `+orderColumns+` FROM orders WHERE ($1 OR user_id=$2) ORDER BY created_at DESC,id DESC LIMIT 100 OFFSET $3`, admin, user, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.Order{}
	for rows.Next() {
		o, e := scanOrder(rows)
		if e != nil {
			return nil, e
		}
		out = append(out, o)
	}
	return out, rows.Err()
}
func (s *Store) ApplyPayment(ctx context.Context, id string, v domain.Verification, mode string) error {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	var recovering bool
	if err = tx.QueryRow(ctx, `SELECT recovery_locked FROM operations_control WHERE id=true FOR SHARE`).Scan(&recovering); err != nil {
		return err
	}
	if recovering {
		return domain.ErrUnavailable
	}
	var drawStatus string
	// Same lock order as reservation: draw first, then order. Publishing locks the
	// draw exclusively, so payment completion cannot race final results.
	err = tx.QueryRow(ctx, `SELECT d.status FROM draws d JOIN orders o ON o.draw_id=d.id WHERE o.id=$1 FOR SHARE OF d`, id).Scan(&drawStatus)
	if err != nil {
		return dbError(err)
	}
	o, err := scanOrder(tx.QueryRow(ctx, `SELECT `+orderColumns+` FROM orders WHERE id=$1 FOR UPDATE`, id))
	if err != nil {
		return err
	}
	var verificationTime time.Time
	if err = tx.QueryRow(ctx, `SELECT clock_timestamp()`).Scan(&verificationTime); err != nil {
		return err
	}
	if v.MerchantReference != o.ID || v.Reference == "" || v.Currency != o.Currency || v.AmountMinor != o.AmountMinor || v.Mode != mode || (o.ProviderReference != "" && o.ProviderReference != v.Reference) {
		return domain.ErrInvalid
	}
	if _, err = tx.Exec(ctx, `UPDATE orders SET provider_reference=$2 WHERE id=$1 AND provider_reference=''`, id, v.Reference); err != nil {
		return dbError(err)
	}
	switch v.Status {
	case "success":
		if o.Status == "paid" || o.Status == "refund_required" || o.Status == "refunded" {
			return nil
		}
		status := "paid"
		if (o.Status != "pending" && o.Status != "initializing") || !o.ExpiresAt.After(verificationTime) || drawStatus == "completed" {
			status = "refund_required"
		}
		_, err = tx.Exec(ctx, `UPDATE orders SET status=$2,provider_reference=$3,paid_at=now() WHERE id=$1`, id, status, v.Reference)
		if err != nil {
			return dbError(err)
		}
		_, err = tx.Exec(ctx, `INSERT INTO payment_ledger(order_id,kind,amount_minor,currency,provider_reference) VALUES($1,'payment',$2,$3,$4) ON CONFLICT(order_id,kind) DO NOTHING`, id, o.AmountMinor, o.Currency, v.Reference)
	case "failed", "cancelled", "incomplete", "blocked":
		_, err = tx.Exec(ctx, `UPDATE orders SET status='failed',provider_reference=$2 WHERE id=$1 AND status IN ('initializing','pending')`, id, v.Reference)
	case "fully_refunded":
		// A refund can arrive before the success event. Record both ledger entries;
		// retain an already issued number, otherwise never issue a new one.
		_, err = tx.Exec(ctx, `INSERT INTO payment_ledger(order_id,kind,amount_minor,currency,provider_reference) VALUES($1,'payment',$2,$3,$4) ON CONFLICT(order_id,kind) DO NOTHING`, id, o.AmountMinor, o.Currency, v.Reference)
		if err != nil {
			return err
		}
		_, err = tx.Exec(ctx, `INSERT INTO payment_ledger(order_id,kind,amount_minor,currency,provider_reference) SELECT id,'refund',amount_minor,currency,$2 FROM orders WHERE id=$1 ON CONFLICT(order_id,kind) DO NOTHING`, id, v.Reference)
		if err == nil {
			_, err = tx.Exec(ctx, `UPDATE orders SET refund_recorded=true,status=CASE WHEN status='paid' THEN status ELSE 'refunded' END WHERE id=$1`, id)
		}
	}
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Store) Webhook(ctx context.Context, provider, digest, ref, providerRef string) error {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	tag, err := tx.Exec(ctx, `INSERT INTO webhook_events(digest,provider,reference) VALUES($1,$2,$3) ON CONFLICT DO NOTHING`, digest, provider, ref)
	if err != nil {
		return err
	}
	if tag.RowsAffected() > 0 {
		_, err = tx.Exec(ctx, `UPDATE orders SET next_check_at=now(),provider_reference=CASE WHEN provider_reference='' THEN $3 ELSE provider_reference END WHERE id=$1 AND provider=$2 AND (provider_reference='' OR provider_reference=$3)`, ref, provider, providerRef)
		if err != nil {
			return err
		}
	}
	return tx.Commit(ctx)
}
func (s *Store) Work(ctx context.Context) (domain.Order, error) {
	return scanOrder(s.DB.QueryRow(ctx, `WITH candidate AS (SELECT id FROM orders WHERE provider<>'legacy' AND provider_reference<>'' AND status IN ('initializing','pending','expired','failed','paid','refund_required') AND next_check_at<=now() AND (lease_until IS NULL OR lease_until<now()) ORDER BY next_check_at FOR UPDATE SKIP LOCKED LIMIT 1) UPDATE orders SET lease_until=now()+interval '60 seconds',attempts=attempts+1 FROM candidate WHERE orders.id=candidate.id RETURNING `+prefixedOrderColumns()))
}
func prefixedOrderColumns() string {
	cols := ""
	for i, c := range strings.Split(orderColumns, ",") {
		if i > 0 {
			cols += ","
		}
		cols += "orders." + c
	}
	return cols
}
func (s *Store) FinishWork(ctx context.Context, id string, success bool) error {
	_, err := s.DB.Exec(ctx, `UPDATE orders SET lease_until=NULL,next_check_at=now()+CASE WHEN status IN ('paid','refund_required') OR created_at<now()-interval '7 days' THEN interval '24 hours' ELSE least(interval '1 hour',interval '15 seconds'*power(2,least(attempts,8))) END WHERE id=$1`, id)
	return err
}
func (s *Store) Expire(ctx context.Context) error {
	// Admission already checks the deadline synchronously. This bounded worker
	// batch records closure and releases the legacy open-selection index.
	if _, err := s.DB.Exec(ctx, `WITH batch AS (
      SELECT * FROM draws WHERE sales_started_at IS NOT NULL AND sales_closed_at IS NULL
      AND deadline<=now() AND status<>'completed' ORDER BY deadline LIMIT 100 FOR UPDATE SKIP LOCKED
    ), changed AS (
      UPDATE draws d SET status='closed',sales_closed_at=d.deadline,version=d.version+1
      FROM batch b WHERE d.id=b.id RETURNING d.*
    ) INSERT INTO audit_log(actor,action,resource,details)
      SELECT 'system:deadline','round.close_deadline',c.id,
      jsonb_build_object('before',to_jsonb(b),'after',to_jsonb(c)) FROM changed c JOIN batch b ON c.id=b.id`); err != nil {
		return err
	}

	if _, err := s.DB.Exec(ctx, `DELETE FROM rate_limits WHERE reset_at<now()-interval '1 day'`); err != nil {
		return err
	}
	_, err := s.DB.Exec(ctx, `WITH batch AS(SELECT id FROM orders WHERE status IN ('initializing','pending') AND expires_at<=now() LIMIT 1000 FOR UPDATE SKIP LOCKED) UPDATE orders SET status='expired' FROM batch WHERE orders.id=batch.id`)
	return err
}
func (s *Store) Rate(ctx context.Context, key string, max int) error {
	var n int
	err := s.DB.QueryRow(ctx, `INSERT INTO rate_limits(key,count,reset_at) VALUES($1,1,now()+interval '1 minute') ON CONFLICT(key) DO UPDATE SET count=CASE WHEN rate_limits.reset_at<=now() THEN 1 ELSE rate_limits.count+1 END, reset_at=CASE WHEN rate_limits.reset_at<=now() THEN now()+interval '1 minute' ELSE rate_limits.reset_at END RETURNING count`, key).Scan(&n)
	if err != nil {
		return err
	}
	if n > max {
		return domain.ErrRate
	}
	return nil
}
func (s *Store) Staff(ctx context.Context, user string) (string, error) {
	var role string
	err := s.DB.QueryRow(ctx, `SELECT s.role FROM staff s JOIN auth."user" u ON u.id=s.user_id WHERE s.user_id=$1 AND s.enabled AND u."twoFactorEnabled"`, user).Scan(&role)
	return role, dbError(err)
}
func (s *Store) SessionActive(ctx context.Context, u domain.User) bool {
	var ok bool
	err := s.DB.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM auth.session s JOIN auth."user" u ON u.id=s."userId" WHERE s.id=$1 AND s."userId"=$2 AND s."expiresAt">now() AND u."emailVerified")`, u.SessionID, u.ID).Scan(&ok)
	return err == nil && ok
}
func (s *Store) SaveDraw(ctx context.Context, actor string, d domain.Draw) error {
	if d.ID == "" || len(d.ID) > 100 || len(d.Title) < 1 || len(d.Title) > 160 || d.PriceMinor <= 0 || d.PriceMinor > 100000000 || d.Capacity < 1 || d.Capacity > 100000 || (d.Currency != "ETB" && d.Currency != "USD") || (d.Status != "open" && d.Status != "closed" && d.Status != "completed") || d.Deadline.IsZero() {
		return domain.ErrInvalid
	}
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	// A selection is immutable; create a new draw for a different price or capacity.
	tag, err := tx.Exec(ctx, `INSERT INTO draws(id,title,currency,price_minor,capacity,status,deadline,live_video_url) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(id) DO UPDATE SET title=EXCLUDED.title,status=EXCLUDED.status,deadline=EXCLUDED.deadline,live_video_url=EXCLUDED.live_video_url WHERE draws.template_id IS NULL AND (draws.sales_closed_at IS NULL OR EXCLUDED.status<>'open') AND (draws.sales_started_at IS NULL OR draws.deadline=EXCLUDED.deadline) AND draws.currency=EXCLUDED.currency AND draws.price_minor=EXCLUDED.price_minor AND draws.capacity=EXCLUDED.capacity AND (draws.status<>'completed' OR EXCLUDED.status='completed')`, d.ID, d.Title, d.Currency, d.PriceMinor, d.Capacity, d.Status, d.Deadline, d.LiveVideoURL)
	if err != nil {
		return dbError(err)
	}
	if tag.RowsAffected() == 0 {
		return domain.ErrConflict
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_log(actor,action,resource) VALUES($1,'draw.save',$2)`, actor, d.ID); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Store) JSONList(ctx context.Context, kind string, offset int) ([]json.RawMessage, error) {
	queries := map[string]string{"results": `SELECT data FROM results ORDER BY published_at DESC LIMIT 100 OFFSET $1`, "messages": `SELECT jsonb_build_object('id',id,'kind',kind,'data',data,'status',status,'createdAt',created_at) FROM messages ORDER BY created_at DESC LIMIT 100 OFFSET $1`, "legacy": `SELECT jsonb_build_object('id',id,'type',type,'data',data,'claimedBy',claimed_by) FROM legacy_records ORDER BY id LIMIT 100 OFFSET $1`, "advertisers": `SELECT jsonb_build_object('code',a.code,'name',a.name,'active',a.active,'details',a.details,'paidTickets',(SELECT count(*) FROM orders o WHERE o.promo_code=a.code AND o.status='paid')) FROM advertisers a ORDER BY a.code LIMIT 100 OFFSET $1`, "audit": `SELECT to_jsonb(a) FROM audit_log a ORDER BY id DESC LIMIT 100 OFFSET $1`}
	query, ok := queries[kind]
	if !ok {
		return nil, domain.ErrInvalid
	}
	rows, err := s.DB.Query(ctx, query, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []json.RawMessage{}
	for rows.Next() {
		var data []byte
		if err = rows.Scan(&data); err != nil {
			return nil, err
		}
		out = append(out, json.RawMessage(data))
	}
	return out, rows.Err()
}
func (s *Store) Message(ctx context.Context, id, kind string, data []byte) error {
	_, err := s.DB.Exec(ctx, `INSERT INTO messages(id,kind,data) VALUES($1,$2,$3) ON CONFLICT(id) DO NOTHING`, id, kind, data)
	return err
}
func (s *Store) AdminWrite(ctx context.Context, actor, kind, id string, data []byte) error {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	switch kind {
	case "legacy":
		var v struct {
			Email  string `json:"email"`
			Notes  string `json:"notes"`
			Status string `json:"status"`
		}
		if json.Unmarshal(data, &v) != nil || len(v.Notes) < 10 || len(v.Notes) > 2000 || len(v.Email) > 254 || (v.Status != "" && v.Status != "paid" && v.Status != "failed") {
			return domain.ErrInvalid
		}
		var existing, oldStatus string
		err = tx.QueryRow(ctx, `SELECT user_id,status FROM orders WHERE id=$1 AND provider='legacy' FOR UPDATE`, id).Scan(&existing, &oldStatus)
		if err != nil {
			return dbError(err)
		}
		owner := existing
		if v.Email != "" {
			if err = tx.QueryRow(ctx, `SELECT id FROM auth."user" WHERE lower(email)=lower($1) AND "emailVerified"`, v.Email).Scan(&owner); err != nil {
				return domain.ErrNotFound
			}
			if !strings.HasPrefix(existing, "unclaimed:") && existing != owner {
				return domain.ErrConflict
			}
		}
		status := oldStatus
		if v.Status != "" {
			if oldStatus != "legacy_pending" && oldStatus != v.Status {
				return domain.ErrConflict
			}
			status = v.Status
		}
		_, err = tx.Exec(ctx, `UPDATE orders SET user_id=$2,status=$3 WHERE id=$1`, id, owner, status)
		if err != nil {
			return dbError(err)
		}
		_, err = tx.Exec(ctx, `UPDATE legacy_records SET claimed_by=CASE WHEN $2 LIKE 'unclaimed:%' THEN NULL ELSE $2 END,data=data || jsonb_build_object('adminNotes',$3::text,'status',$4::text) WHERE id=$1`, id, owner, v.Notes, status)
	case "advertisers":
		var a struct {
			Code       string  `json:"code"`
			Name       string  `json:"name"`
			Active     bool    `json:"active"`
			Commission float64 `json:"commissionPerTicket"`
			Currency   string  `json:"commissionCurrency"`
		}
		if json.Unmarshal(data, &a) != nil || a.Code == "" || !regexp.MustCompile(`^[A-Z0-9_-]{1,25}$`).MatchString(a.Code) || a.Name == "" || len(a.Name) > 120 || a.Commission < 0 || a.Commission > 1000000 || (a.Currency != "ETB" && a.Currency != "USD" && a.Currency != "MATCH") {
			return domain.ErrInvalid
		}
		_, err = tx.Exec(ctx, `INSERT INTO advertisers(code,name,active,details) VALUES($1,$2,$3,$4) ON CONFLICT(code) DO UPDATE SET name=EXCLUDED.name,active=EXCLUDED.active,details=EXCLUDED.details`, a.Code, a.Name, a.Active, data)
		id = a.Code
	case "messages":
		if string(data) != `{"status":"resolved"}` {
			var v map[string]string
			if json.Unmarshal(data, &v) != nil || v["status"] != "resolved" {
				return domain.ErrInvalid
			}
		}
		_, err = tx.Exec(ctx, `UPDATE messages SET status='resolved' WHERE id=$1`, id)
	case "results":
		var v struct {
			DrawID       string `json:"drawId"`
			BroadcastURL string `json:"broadcastVideoUrl"`
			Winning      []struct {
				Rank   int    `json:"rank"`
				Number string `json:"luckyNumber"`
				Prize  string `json:"prizeAmount"`
				Name   string `json:"winnerName"`
				Payout string `json:"payoutStatus"`
			} `json:"winningNumbers"`
		}
		if json.Unmarshal(data, &v) != nil || v.DrawID != id || len(v.Winning) < 1 || len(v.Winning) > 10 {
			return domain.ErrInvalid
		}
		if v.BroadcastURL != "" {
			u, e := url.Parse(v.BroadcastURL)
			if e != nil || u.Scheme != "https" || u.Host == "" || u.User != nil {
				return domain.ErrInvalid
			}
		}
		var status string
		var needsClosure bool
		if err = tx.QueryRow(ctx, `SELECT status,template_id IS NOT NULL AND sales_closed_at IS NULL FROM draws WHERE id=$1 FOR UPDATE`, id).Scan(&status, &needsClosure); err != nil {
			return dbError(err)
		}
		if status == "open" || needsClosure {
			return domain.ErrClosed
		}
		var pending bool
		if err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM orders WHERE draw_id=$1 AND (status='legacy_pending' OR (status IN ('pending','initializing') AND expires_at>now())))`, id).Scan(&pending); err != nil {
			return err
		}
		if pending {
			return fmt.Errorf("%w: resolve outstanding reservations before publishing", domain.ErrConflict)
		}
		ranks := map[int]bool{}
		nums := map[string]bool{}
		for _, w := range v.Winning {
			if w.Rank < 1 || w.Rank > 10 || ranks[w.Rank] || nums[w.Number] || len(w.Name) > 120 || len(w.Prize) > 120 || (w.Payout != "" && w.Payout != "pending" && w.Payout != "paid") {
				return domain.ErrInvalid
			}
			ranks[w.Rank] = true
			nums[w.Number] = true
			var exists bool
			if err = tx.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM orders WHERE draw_id=$1 AND number::text=$2 AND status='paid' AND NOT refund_recorded)`, id, w.Number).Scan(&exists); err != nil {
				return err
			}
			if !exists {
				return fmt.Errorf("%w: winner must have an issued ticket", domain.ErrInvalid)
			}
		}
		_, err = tx.Exec(ctx, `INSERT INTO results(draw_id,data) VALUES($1,$2) ON CONFLICT(draw_id) DO UPDATE SET data=EXCLUDED.data,published_at=now()`, id, data)
		if err == nil {
			_, err = tx.Exec(ctx, `UPDATE draws SET status='completed' WHERE id=$1`, id)
		}
	default:
		return domain.ErrInvalid
	}
	if err != nil {
		return dbError(err)
	}
	_, err = tx.Exec(ctx, `INSERT INTO audit_log(actor,action,resource) VALUES($1,$2,$3)`, actor, kind+".update", id)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

// Environment is persistent: test payments can never be promoted to live tickets
// by changing a key. Production uses a separate, empty operational database.
func (s *Store) EnsureMode(ctx context.Context, mode string) error {
	_, err := s.DB.Exec(ctx, `INSERT INTO backend_settings(key,value) VALUES('payment_mode',$1) ON CONFLICT DO NOTHING`, mode)
	if err != nil {
		return err
	}
	var existing string
	if err = s.DB.QueryRow(ctx, `SELECT value FROM backend_settings WHERE key='payment_mode'`).Scan(&existing); err != nil {
		return err
	}
	if existing != mode {
		return fmt.Errorf("database payment environment mismatch")
	}
	return nil
}

func (s *Store) Audit(ctx context.Context, actor, action, resource string) error {
	_, err := s.DB.Exec(ctx, `INSERT INTO audit_log(actor,action,resource) VALUES($1,$2,$3)`, actor, action, resource)
	return err
}
