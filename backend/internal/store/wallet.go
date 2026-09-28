package store

import (
	"context"
	"github.com/jackc/pgx/v5"
	"rimna/backend/internal/domain"
)

func walletAccount(ctx context.Context, tx pgx.Tx, user, currency string) (int64, error) {
	if _, err := tx.Exec(ctx, `INSERT INTO wallet_accounts(user_id,kind,currency) VALUES($1,'customer',$2) ON CONFLICT(user_id,currency) DO NOTHING`, user, currency); err != nil {
		return 0, err
	}
	var id int64
	err := tx.QueryRow(ctx, `SELECT id FROM wallet_accounts WHERE user_id=$1 AND currency=$2 FOR UPDATE`, user, currency).Scan(&id)
	return id, err
}

// postWallet runs inside the caller's transaction; the future ticket purchase
// use case must call this in the SAME transaction that issues its tickets.
func postWallet(ctx context.Context, tx pgx.Tx, user, currency, kind, reference string, amount int64, reversal *int64) (int64, error) {
	if (currency != "ETB" && currency != "USD") || amount == 0 || amount > 100000000 || amount < -100000000 {
		return 0, domain.ErrInvalid
	}
	customer, err := walletAccount(ctx, tx, user, currency)
	if err != nil {
		return 0, err
	}
	systemKind := "provider_clearing"
	if kind == "purchase" || kind == "purchase_reversal" {
		systemKind = "ticket_sales"
	}
	if _, err = tx.Exec(ctx, `INSERT INTO wallet_accounts(kind,currency) VALUES($1,$2) ON CONFLICT DO NOTHING`, systemKind, currency); err != nil {
		return 0, err
	}
	var system, id int64
	if err = tx.QueryRow(ctx, `SELECT id FROM wallet_accounts WHERE kind=$1 AND currency=$2`, systemKind, currency).Scan(&system); err != nil {
		return 0, err
	}
	if err = tx.QueryRow(ctx, `INSERT INTO wallet_journals(operation,currency,kind,reference,reversal_of) VALUES($1,$2,$3,$4,$5) RETURNING id`, kind+":"+reference, currency, kind, reference, reversal).Scan(&id); err != nil {
		return 0, dbError(err)
	}
	_, err = tx.Exec(ctx, `INSERT INTO wallet_entries(journal_id,account_id,currency,amount_minor) VALUES($1,$2,$3,$4),($1,$5,$3,-$4)`, id, customer, currency, amount, system)
	return id, dbError(err)
}
func (s *Store) WalletBalances(ctx context.Context, user string) ([]domain.WalletBalance, error) {
	rows, err := s.DB.Query(ctx, `SELECT c.currency,COALESCE(a.balance_minor,0),COALESCE(a.restricted,false),
 COALESCE((SELECT sum(amount_minor) FROM deposits WHERE user_id=$1 AND currency=c.currency AND credited_at IS NULL AND status IN ('initializing','pending','review')),0)
 FROM (VALUES('ETB'),('USD')) c(currency) LEFT JOIN wallet_accounts a ON a.user_id=$1 AND a.currency=c.currency`, user)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.WalletBalance{}
	for rows.Next() {
		var b domain.WalletBalance
		if err = rows.Scan(&b.Currency, &b.BalanceMinor, &b.Restricted, &b.PendingMinor); err != nil {
			return nil, err
		}
		if !b.Restricted && b.BalanceMinor > 0 {
			b.AvailableMinor = b.BalanceMinor
		}
		out = append(out, b)
	}
	return out, rows.Err()
}

type WalletHistory struct {
	Items   []domain.WalletEntry `json:"items"`
	HasMore bool                 `json:"hasMore"`
}

func (s *Store) WalletHistory(ctx context.Context, user, currency string, offset int) (WalletHistory, error) {
	out := WalletHistory{Items: []domain.WalletEntry{}}
	if (currency != "ETB" && currency != "USD") || offset < 0 || offset > 1000000 {
		return out, domain.ErrInvalid
	}
	rows, err := s.DB.Query(ctx, `SELECT e.id,j.kind,j.reference,e.currency,e.amount_minor,e.balance_after_minor,e.created_at
 FROM wallet_entries e JOIN wallet_accounts a ON a.id=e.account_id JOIN wallet_journals j ON j.id=e.journal_id
 WHERE a.user_id=$1 AND a.currency=$2 ORDER BY e.id DESC LIMIT 51 OFFSET $3`, user, currency, offset)
	if err != nil {
		return out, err
	}
	defer rows.Close()
	for rows.Next() {
		var e domain.WalletEntry
		if err = rows.Scan(&e.ID, &e.Kind, &e.Reference, &e.Currency, &e.AmountMinor, &e.BalanceAfterMinor, &e.CreatedAt); err != nil {
			return out, err
		}
		out.Items = append(out.Items, e)
	}
	if len(out.Items) > 50 {
		out.Items = out.Items[:50]
		out.HasMore = true
	}
	return out, rows.Err()
}

type WalletReport struct {
	Currency             string `json:"currency"`
	CustomerBalanceMinor int64  `json:"customerBalanceMinor"`
	LedgerBalanceMinor   int64  `json:"ledgerBalanceMinor"`
	MismatchedAccounts   int    `json:"mismatchedAccounts"`
	RestrictedAccounts   int    `json:"restrictedAccounts"`
}

func (s *Store) WalletReport(ctx context.Context) ([]WalletReport, error) {
	rows, err := s.DB.Query(ctx, `SELECT c.currency,COALESCE(sum(a.balance_minor),0)::bigint,COALESCE(sum(e.total),0)::bigint,
 count(a.id) FILTER(WHERE a.balance_minor<>COALESCE(e.total,0)),count(a.id) FILTER(WHERE a.restricted)
 FROM (VALUES('ETB'),('USD')) c(currency) LEFT JOIN wallet_accounts a ON a.currency=c.currency AND a.kind='customer'
 LEFT JOIN LATERAL(SELECT sum(amount_minor) total FROM wallet_entries WHERE account_id=a.id) e ON true GROUP BY c.currency ORDER BY c.currency`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []WalletReport{}
	for rows.Next() {
		var r WalletReport
		if err = rows.Scan(&r.Currency, &r.CustomerBalanceMinor, &r.LedgerBalanceMinor, &r.MismatchedAccounts, &r.RestrictedAccounts); err != nil {
			return nil, err
		}
		out = append(out, r)
	}
	return out, rows.Err()
}
