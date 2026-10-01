package store

import (
	"context"
	"errors"
	"github.com/jackc/pgx/v5"
	"rimna/backend/internal/domain"
	"strings"
)

const depositColumns = `id,user_id,currency,amount_minor,provider,mode,status,checkout_url,provider_reference,idempotency_key,fingerprint,phone,email,name,created_at,credited_at,reversed_at,review_reason`

func scanDeposit(row pgx.Row) (domain.Deposit, error) {
	var d domain.Deposit
	err := row.Scan(&d.ID, &d.UserID, &d.Currency, &d.AmountMinor, &d.Provider, &d.Mode, &d.Status, &d.CheckoutURL, &d.ProviderReference, &d.Key, &d.Fingerprint, &d.Phone, &d.Email, &d.Name, &d.CreatedAt, &d.CreditedAt, &d.ReversedAt, &d.ReviewReason)
	return d, dbError(err)
}
func (s *Store) Deposit(ctx context.Context, id string) (domain.Deposit, error) {
	return scanDeposit(s.DB.QueryRow(ctx, `SELECT `+depositColumns+` FROM deposits WHERE id=$1`, id))
}
func (s *Store) CreateDeposit(ctx context.Context, d domain.Deposit) (domain.Deposit, bool, error) {
	if d.UserID == "" || d.AmountMinor < 1 || d.AmountMinor > 100000000 || (d.Currency != "ETB" && d.Currency != "USD") || (d.Mode != "test" && d.Mode != "live") {
		return d, false, domain.ErrInvalid
	}
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return d, false, err
	}
	defer tx.Rollback(ctx)
	if _, err = tx.Exec(ctx, `SELECT pg_advisory_xact_lock(hashtextextended($1,0))`, d.UserID); err != nil {
		return d, false, err
	}
	old, e := scanDeposit(tx.QueryRow(ctx, `SELECT `+depositColumns+` FROM deposits WHERE user_id=$1 AND idempotency_key=$2`, d.UserID, d.Key))
	if e == nil {
		if old.Fingerprint != d.Fingerprint {
			return d, false, domain.ErrConflict
		}
		return old, false, nil
	}
	if !errors.Is(e, domain.ErrNotFound) {
		return d, false, e
	}
	var paused, recovery bool
	if err = tx.QueryRow(ctx, `SELECT deposits_paused,recovery_locked FROM operations_control WHERE id=true FOR SHARE`).Scan(&paused, &recovery); err != nil {
		return d, false, err
	}
	if paused || recovery {
		return d, false, domain.ErrUnavailable
	}
	account, err := walletAccount(ctx, tx, d.UserID, d.Currency)
	if err != nil {
		return d, false, err
	}
	var restricted bool
	if err = tx.QueryRow(ctx, `SELECT restricted FROM wallet_accounts WHERE id=$1`, account).Scan(&restricted); err != nil {
		return d, false, err
	}
	if restricted {
		return d, false, domain.ErrConflict
	}
	var pending int
	if err = tx.QueryRow(ctx, `SELECT count(*) FROM deposits WHERE user_id=$1 AND status IN ('initializing','pending') AND created_at > now() - interval '15 minutes'`, d.UserID).Scan(&pending); err != nil {
		return d, false, err
	}
	if pending >= 5 {
		return d, false, domain.ErrRate
	}
	d.Status = "initializing"
	d, err = scanDeposit(tx.QueryRow(ctx, `INSERT INTO deposits(id,user_id,currency,amount_minor,provider,mode,status,idempotency_key,fingerprint,phone,email,name,next_check_at) VALUES($1,$2,$3,$4,$5,$6,'initializing',$7,$8,$9,$10,$11,now()+interval '3 seconds') RETURNING `+depositColumns, d.ID, d.UserID, d.Currency, d.AmountMinor, d.Provider, d.Mode, d.Key, d.Fingerprint, d.Phone, d.Email, d.Name))
	if err != nil {
		return d, false, err
	}
	return d, true, tx.Commit(ctx)
}
func (s *Store) DepositCheckout(ctx context.Context, id string, c domain.Checkout) error {
	_, err := s.DB.Exec(ctx, `UPDATE deposits SET checkout_url=$2,provider_reference=CASE WHEN $3='' THEN provider_reference ELSE $3 END,status=CASE WHEN status='initializing' THEN 'pending' ELSE status END WHERE id=$1`, id, c.URL, c.Reference)
	return dbError(err)
}
func (s *Store) ApplyDeposit(ctx context.Context, id string, v domain.Verification, mode string) error {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	var recovery bool
	if err = tx.QueryRow(ctx, `SELECT recovery_locked FROM operations_control WHERE id=true FOR SHARE`).Scan(&recovery); err != nil {
		return err
	}
	if recovery {
		return domain.ErrUnavailable
	}
	d, err := scanDeposit(tx.QueryRow(ctx, `SELECT `+depositColumns+` FROM deposits WHERE id=$1 FOR UPDATE`, id))
	if err != nil {
		return err
	}
	if v.MerchantReference != d.ID || v.Reference == "" || len(v.Reference) > 128 || v.Currency != d.Currency || v.AmountMinor != d.AmountMinor || v.Mode != mode || d.Mode != mode || (d.ProviderReference != "" && v.Reference != d.ProviderReference) {
		return domain.ErrInvalid
	}
	if _, err = tx.Exec(ctx, `UPDATE deposits SET provider_reference=$2 WHERE id=$1 AND provider_reference=''`, id, v.Reference); err != nil {
		return dbError(err)
	}
	switch v.Status {
	case "success":
		if d.ReversedAt != nil || d.CreditedAt != nil {
			return tx.Commit(ctx)
		}
		if _, err = postWallet(ctx, tx, d.UserID, d.Currency, "deposit", d.ID, d.AmountMinor, nil); err != nil {
			return err
		}
		_, err = tx.Exec(ctx, `UPDATE deposits SET status='succeeded',credited_at=now(),review_reason='' WHERE id=$1`, id)
	case "fully_refunded":
		if d.ReversedAt != nil {
			return tx.Commit(ctx)
		}
		if d.CreditedAt != nil {
			var original int64
			if err = tx.QueryRow(ctx, `SELECT id FROM wallet_journals WHERE operation=$1`, "deposit:"+id).Scan(&original); err != nil {
				return err
			}
			if _, err = postWallet(ctx, tx, d.UserID, d.Currency, "deposit_reversal", id, -d.AmountMinor, &original); err != nil {
				return err
			}
		}
		_, err = tx.Exec(ctx, `UPDATE deposits SET status='reversed',reversed_at=now(),review_reason='' WHERE id=$1`, id)
	case "failed", "cancelled", "incomplete", "blocked":
		if d.CreditedAt == nil && d.ReversedAt == nil {
			_, err = tx.Exec(ctx, `UPDATE deposits SET status='failed',review_reason='' WHERE id=$1`, id)
		}
	case "pending", "auth_needed":
		// Pending/out-of-order signals cannot erase a credit or reverse a reversal.
	default:
		return domain.ErrInvalid
	}
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Store) ReviewDeposit(ctx context.Context, id, reason string) error {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	d, err := scanDeposit(tx.QueryRow(ctx, `SELECT `+depositColumns+` FROM deposits WHERE id=$1 FOR UPDATE`, id))
	if err != nil {
		return err
	}
	if d.ReversedAt != nil {
		return nil
	}
	if d.CreditedAt != nil {
		if _, err = tx.Exec(ctx, `UPDATE wallet_accounts SET restricted=true WHERE user_id=$1 AND currency=$2`, d.UserID, d.Currency); err != nil {
			return err
		}
	}
	_, err = tx.Exec(ctx, `UPDATE deposits SET status='review',review_reason=$2 WHERE id=$1`, id, reason)
	if err != nil {
		return err
	}
	return tx.Commit(ctx)
}

type DepositPage struct {
	Items   []domain.Deposit `json:"items"`
	HasMore bool             `json:"hasMore"`
}

func (s *Store) Deposits(ctx context.Context, user string, offset int, admin bool, currency string) (DepositPage, error) {
	out := DepositPage{Items: []domain.Deposit{}}
	currency = strings.ToUpper(strings.TrimSpace(currency))
	rows, err := s.DB.Query(ctx, `SELECT `+depositColumns+` FROM deposits WHERE ($1 OR user_id=$2) AND ($4 = '' OR currency=$4) ORDER BY created_at DESC,id LIMIT 51 OFFSET $3`, admin, user, offset, currency)
	if err != nil {
		return out, err
	}
	defer rows.Close()
	for rows.Next() {
		d, e := scanDeposit(rows)
		if e != nil {
			return out, e
		}
		out.Items = append(out.Items, d)
	}
	if len(out.Items) > 50 {
		out.Items = out.Items[:50]
		out.HasMore = true
	}
	return out, rows.Err()
}
func (s *Store) DepositWork(ctx context.Context) (domain.Deposit, error) {
	cols := strings.Split(depositColumns, ",")
	for i := range cols {
		cols[i] = "d." + cols[i]
	}
	return scanDeposit(s.DB.QueryRow(ctx, `WITH candidate AS(SELECT id FROM deposits WHERE provider_reference<>'' AND status IN ('initializing','pending') AND next_check_at<=now() AND (lease_until IS NULL OR lease_until<now()) ORDER BY next_check_at LIMIT 1 FOR UPDATE SKIP LOCKED) UPDATE deposits d SET lease_until=now()+interval '60 seconds',attempts=attempts+1 FROM candidate c WHERE d.id=c.id RETURNING `+strings.Join(cols, ",")))
}
func (s *Store) FinishDepositWork(ctx context.Context, id string, success bool) error {
	_, err := s.DB.Exec(ctx, `UPDATE deposits SET lease_until=NULL,next_check_at=now()+CASE WHEN status IN ('succeeded','failed','review') OR created_at<now()-interval '1 day' THEN interval '24 hours' ELSE least(interval '1 hour',interval '5 seconds'*power(2,least(attempts,6))) END WHERE id=$1`, id)
	return err
}
func (s *Store) TouchPendingDeposits(ctx context.Context, userID string) {
	_, _ = s.DB.Exec(ctx, `UPDATE deposits SET next_check_at=now() WHERE user_id=$1 AND status IN ('initializing','pending') AND (lease_until IS NULL OR lease_until<now())`, userID)
}
func (s *Store) SetDepositsPaused(ctx context.Context, actor string, paused bool, reason string) error {
	if len(strings.TrimSpace(reason)) < 5 || len(reason) > 500 {
		return domain.ErrInvalid
	}
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	tag, err := tx.Exec(ctx, `UPDATE operations_control SET deposits_paused=$1 WHERE id=true AND (NOT recovery_locked OR $1)`, paused)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return domain.ErrConflict
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_log(actor,action,resource,details) VALUES($1,'deposits.pause','wallet',jsonb_build_object('paused',$2::boolean,'reason',$3::text))`, actor, paused, reason); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Store) DepositPaused(ctx context.Context) (bool, error) {
	var paused bool
	err := s.DB.QueryRow(ctx, `SELECT deposits_paused OR recovery_locked FROM operations_control WHERE id=true`).Scan(&paused)
	return paused, err
}
func (s *Store) DepositReference(ctx context.Context, actor, id, reference string) error {
	if reference == "" || len(reference) > 128 {
		return domain.ErrInvalid
	}
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	tag, err := tx.Exec(ctx, `UPDATE deposits SET provider_reference=$2,next_check_at=now() WHERE id=$1 AND (provider_reference='' OR provider_reference=$2)`, id, reference)
	if err != nil {
		return dbError(err)
	}
	if tag.RowsAffected() != 1 {
		return domain.ErrConflict
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_log(actor,action,resource) VALUES($1,'deposit.verify_request',$2)`, actor, id); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

func (s *Store) FailDeposit(ctx context.Context, id, reason string) error {
	_, err := s.DB.Exec(ctx, `UPDATE deposits SET status='failed',review_reason=$2 WHERE id=$1 AND status IN ('initializing','pending') AND provider_reference=''`, id, reason)
	return dbError(err)
}

func (s *Store) DepositMaintenance(ctx context.Context) error {
	_, err := s.DB.Exec(ctx, `UPDATE deposits SET status='failed',review_reason='Payment session expired without payment confirmation.' WHERE provider_reference='' AND (status IN ('initializing','pending') OR (status='review' AND review_reason LIKE 'Payment reference unavailable%')) AND created_at<now()-interval '2 minutes'`)
	return err
}

