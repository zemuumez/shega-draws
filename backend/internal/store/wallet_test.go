package store

import (
	"context"
	"errors"
	"fmt"
	"rimna/backend/internal/domain"
	"rimna/backend/internal/service"
	"sync"
	"sync/atomic"
	"testing"
	"time"
)

func enableDeposits(t *testing.T, s *Store) {
	t.Helper()
	if err := s.SetDepositsPaused(context.Background(), "test-admin", false, "Enable isolated test funding"); err != nil {
		t.Fatal(err)
	}
}
func depositFixture(t *testing.T, s *Store, id, user, currency string, amount int64) domain.Deposit {
	t.Helper()
	d, _, err := s.CreateDeposit(context.Background(), domain.Deposit{ID: "dep_" + id, UserID: user, Currency: currency, AmountMinor: amount, Provider: "chapa", Mode: "test", Key: "deposit-key-" + id, Fingerprint: id, Phone: "+251911123456", Email: "fixture@example.test", Name: "Fixture"})
	if err != nil {
		t.Fatal(err)
	}
	return d
}
func depositVerification(d domain.Deposit) domain.Verification {
	return domain.Verification{Reference: "receipt-" + d.ID, MerchantReference: d.ID, Currency: d.Currency, AmountMinor: d.AmountMinor, Mode: "test", Status: "success"}
}
func balance(t *testing.T, s *Store, user, currency string) domain.WalletBalance {
	t.Helper()
	b, err := s.WalletBalances(context.Background(), user)
	if err != nil {
		t.Fatal(err)
	}
	for _, v := range b {
		if v.Currency == currency {
			return v
		}
	}
	t.Fatal("missing currency")
	return domain.WalletBalance{}
}
func TestDepositConcurrentInitializationAndCredit(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	enableDeposits(t, s)
	p := &testProvider{}
	svc := service.Service{Store: s, Wallet: s, Mode: "test", Providers: map[string]domain.PaymentProvider{"chapa": p}, Deposits: service.DepositPolicy{Enabled: true, Currency: "ETB", MinMinor: 100, MaxMinor: 100000}}
	u := domain.User{ID: "wallet-user", Verified: true, Email: "user@example.test", Name: "User"}
	request := domain.DepositRequest{AmountMinor: 2500, Currency: "ETB", Provider: "chapa", Phone: "+251911123456"}
	var wg sync.WaitGroup
	ids := make(chan string, 25)
	for i := 0; i < 25; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			d, err := svc.StartDeposit(ctx, u, "same-wallet-operation", request)
			if err != nil {
				t.Error(err)
				return
			}
			ids <- d.ID
		}()
	}
	wg.Wait()
	close(ids)
	id := ""
	for current := range ids {
		if id != "" && current != id {
			t.Fatal("duplicate deposit IDs")
		}
		id = current
	}
	if p.starts.Load() != 1 {
		t.Fatal("duplicate hosted initialization", p.starts.Load())
	}
	if b := balance(t, s, u.ID, "ETB"); b.AvailableMinor != 0 || b.PendingMinor != 2500 {
		t.Fatal("unverified money spendable", b)
	}
	d, err := s.Deposit(ctx, id)
	if err != nil {
		t.Fatal(err)
	}
	v := depositVerification(d)
	v.Reference = d.ProviderReference
	for i := 0; i < 25; i++ {
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := s.ApplyDeposit(ctx, id, v, "test"); err != nil {
				t.Error(err)
			}
		}()
	}
	wg.Wait()
	if b := balance(t, s, u.ID, "ETB"); b.AvailableMinor != 2500 || b.PendingMinor != 0 {
		t.Fatal("duplicate credit", b)
	}
	h, err := s.WalletHistory(ctx, u.ID, "ETB", 0)
	if err != nil || len(h.Items) != 1 || h.Items[0].AmountMinor != 2500 {
		t.Fatal(h, err)
	}
	if b := balance(t, s, u.ID, "USD"); b.AvailableMinor != 0 {
		t.Fatal("currency contamination", b)
	}
	request.AmountMinor = 2600
	if _, err = svc.StartDeposit(ctx, u, "same-wallet-operation", request); err != domain.ErrConflict {
		t.Fatal("changed replay accepted", err)
	}
	report, err := s.WalletReport(ctx)
	if err != nil {
		t.Fatal(err)
	}
	for _, r := range report {
		if r.MismatchedAccounts != 0 || r.CustomerBalanceMinor != r.LedgerBalanceMinor {
			t.Fatal(r)
		}
	}
}
func TestDepositVerificationBindingAndReceiptUniqueness(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	enableDeposits(t, s)
	d := depositFixture(t, s, "binding", "buyer", "ETB", 2500)
	good := depositVerification(d)
	for _, mutate := range []func(*domain.Verification){func(v *domain.Verification) { v.AmountMinor++ }, func(v *domain.Verification) { v.Currency = "USD" }, func(v *domain.Verification) { v.Mode = "live" }, func(v *domain.Verification) { v.MerchantReference = "other" }, func(v *domain.Verification) { v.Reference = "" }} {
		v := good
		mutate(&v)
		if err := s.ApplyDeposit(ctx, d.ID, v, "test"); err != domain.ErrInvalid {
			t.Fatal("mismatch credited", err)
		}
	}
	if balance(t, s, "buyer", "ETB").BalanceMinor != 0 {
		t.Fatal("bad credit")
	}
	o, _, err := s.Reserve(ctx, order("old-ticket", "other", 5))
	if err != nil {
		t.Fatal(err)
	}
	if err = s.Checkout(ctx, o.ID, domain.Checkout{Reference: good.Reference}); err != nil {
		t.Fatal(err)
	}
	if err = s.ApplyDeposit(ctx, d.ID, good, "test"); err != domain.ErrConflict {
		t.Fatal("receipt funded order and wallet", err)
	}
	good.Reference = "new-receipt"
	if err = s.ApplyDeposit(ctx, d.ID, good, "test"); err != nil {
		t.Fatal(err)
	}
	other := depositFixture(t, s, "other", "other", "ETB", 2500)
	v := depositVerification(other)
	v.Reference = good.Reference
	if err = s.ApplyDeposit(ctx, other.ID, v, "test"); err != domain.ErrConflict {
		t.Fatal("receipt funded second wallet", err)
	}
	if b := balance(t, s, "other", "ETB"); b.BalanceMinor != 0 {
		t.Fatal(b)
	}
	history, err := s.WalletHistory(ctx, "other", "ETB", 0)
	if err != nil || len(history.Items) != 0 {
		t.Fatal("ownership leak", err)
	}
}
func TestDepositRefundReplayAndOutOfOrderEvents(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	enableDeposits(t, s)
	d := depositFixture(t, s, "refund", "buyer", "ETB", 2500)
	v := depositVerification(d)
	if err := s.ApplyDeposit(ctx, d.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	v.Status = "fully_refunded"
	for i := 0; i < 3; i++ {
		if err := s.ApplyDeposit(ctx, d.ID, v, "test"); err != nil {
			t.Fatal(err)
		}
	}
	v.Status = "success"
	if err := s.ApplyDeposit(ctx, d.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	if b := balance(t, s, "buyer", "ETB"); b.BalanceMinor != 0 {
		t.Fatal("refund replay changed balance", b)
	}
	history, _ := s.WalletHistory(ctx, "buyer", "ETB", 0)
	if len(history.Items) != 2 {
		t.Fatal("refund history not preserved", history)
	}
	firstRefund := depositFixture(t, s, "refund-first", "buyer", "USD", 5000)
	v = depositVerification(firstRefund)
	v.Status = "fully_refunded"
	if err := s.ApplyDeposit(ctx, firstRefund.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	v.Status = "success"
	if err := s.ApplyDeposit(ctx, firstRefund.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	if b := balance(t, s, "buyer", "USD"); b.AvailableMinor != 0 {
		t.Fatal("out-of-order credit", b)
	}
}
func TestLedgerConcurrentSpendingAndReversalRestriction(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	enableDeposits(t, s)
	d := depositFixture(t, s, "spend", "buyer", "ETB", 2500)
	v := depositVerification(d)
	if err := s.ApplyDeposit(ctx, d.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	var accepted atomic.Int32
	var wg sync.WaitGroup
	for i := 0; i < 20; i++ {
		wg.Add(1)
		go func(i int) {
			defer wg.Done()
			tx, err := s.DB.Begin(ctx)
			if err != nil {
				t.Error(err)
				return
			}
			defer tx.Rollback(ctx)
			_, err = postWallet(ctx, tx, "buyer", "ETB", "purchase", fmt.Sprint(i), -1000, nil)
			if err == nil {
				err = tx.Commit(ctx)
				if err == nil {
					accepted.Add(1)
				}
			}
			if err != nil && !errors.Is(err, domain.ErrConflict) {
				t.Error(err)
			}
		}(i)
	}
	wg.Wait()
	if accepted.Load() != 2 || balance(t, s, "buyer", "ETB").AvailableMinor != 500 {
		t.Fatal("overspend", accepted.Load())
	}
	v.Status = "fully_refunded"
	if err := s.ApplyDeposit(ctx, d.ID, v, "test"); err != nil {
		t.Fatal(err)
	}
	b := balance(t, s, "buyer", "ETB")
	if b.BalanceMinor != -2000 || b.AvailableMinor != 0 || !b.Restricted {
		t.Fatal("spent refund not restricted", b)
	}
}
func TestLedgerImmutabilityBalanceAndRollback(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	enableDeposits(t, s)
	d := depositFixture(t, s, "immutable", "buyer", "ETB", 2500)
	if err := s.ApplyDeposit(ctx, d.ID, depositVerification(d), "test"); err != nil {
		t.Fatal(err)
	}
	for _, sql := range []string{`UPDATE wallet_entries SET amount_minor=1`, `DELETE FROM wallet_entries`, `UPDATE wallet_journals SET kind='purchase'`, `UPDATE wallet_accounts SET balance_minor=9999 WHERE kind='customer'`, `UPDATE deposits SET user_id='thief'`, `INSERT INTO wallet_entries(journal_id,account_id,currency,amount_minor) SELECT journal_id,account_id,currency,1 FROM wallet_entries LIMIT 1`} {
		if _, err := s.DB.Exec(ctx, sql); err == nil {
			t.Fatal("ledger mutation accepted", sql)
		}
	}
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer tx.Rollback(ctx)
	var journal, account int64
	if err = tx.QueryRow(ctx, `SELECT id FROM wallet_accounts WHERE user_id='buyer'`).Scan(&account); err != nil {
		t.Fatal(err)
	}
	if err = tx.QueryRow(ctx, `INSERT INTO wallet_journals(operation,kind,reference,currency) VALUES('broken','deposit','broken','ETB') RETURNING id`).Scan(&journal); err != nil {
		t.Fatal(err)
	}
	if _, err = tx.Exec(ctx, `INSERT INTO wallet_entries(journal_id,account_id,currency,amount_minor) VALUES($1,$2,'ETB',500)`, journal, account); err != nil {
		t.Fatal(err)
	}
	if err = tx.Commit(ctx); err == nil {
		t.Fatal("unbalanced journal committed")
	}
	if balance(t, s, "buyer", "ETB").BalanceMinor != 2500 {
		t.Fatal("failed commit changed cached balance")
	}
}
func TestDepositPausesAndUncertainInitialization(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	enableDeposits(t, s)
	p := &testProvider{uncertain: true}
	svc := service.Service{Store: s, Wallet: s, Mode: "test", Providers: map[string]domain.PaymentProvider{"chapa": p}, Deposits: service.DepositPolicy{Enabled: true, Currency: "ETB", MinMinor: 100, MaxMinor: 100000}}
	if err := s.SetSalesPaused(ctx, "admin", true, "Separate sales pause test"); err != nil {
		t.Fatal(err)
	}
	u := domain.User{ID: "buyer", Verified: true}
	input := domain.DepositRequest{AmountMinor: 2500, Currency: "ETB", Provider: "chapa", Phone: "+251911123456"}
	d, err := svc.StartDeposit(ctx, u, "uncertain-wallet-key", input)
	if err != nil {
		t.Fatal(err)
	}
	if _, err = svc.StartDeposit(ctx, u, "uncertain-wallet-key", input); err != nil || p.starts.Load() != 1 {
		t.Fatal("uncertain start retried", err)
	}
	if _, err = s.DB.Exec(ctx, `UPDATE deposits SET created_at=now()-interval '20 minutes' WHERE id=$1`, d.ID); err != nil {
		t.Fatal(err)
	}
	if err = s.DepositMaintenance(ctx); err != nil {
		t.Fatal(err)
	}
	d, _ = s.Deposit(ctx, d.ID)
	if d.Status != "review" {
		t.Fatal(d)
	}
	if err = s.SetDepositsPaused(ctx, "admin", true, "Pause new deposit attempts"); err != nil {
		t.Fatal(err)
	}
	if _, err = svc.StartDeposit(ctx, u, "different-wallet-key", input); err != domain.ErrUnavailable {
		t.Fatal("deposit pause ignored", err)
	}
	v := depositVerification(d)
	if err = s.Webhook(ctx, "chapa", "deposit-hook", d.ID, v.Reference); err != nil {
		t.Fatal(err)
	}
	work, err := s.DepositWork(ctx)
	if err != nil || work.ID != d.ID {
		t.Fatal("webhook did not wake deposit", err)
	}
	if _, err = s.DepositWork(ctx); err != domain.ErrNotFound {
		t.Fatal("worker lease duplicated", err)
	}
	if err = s.ApplyDeposit(ctx, d.ID, v, "test"); err != nil {
		t.Fatal("pause blocked existing verification", err)
	}
	if err = s.FinishDepositWork(ctx, d.ID, true); err != nil {
		t.Fatal(err)
	}
	input.Currency = "USD"
	if _, err = svc.StartDeposit(ctx, u, "disabled-usd-wallet", input); err != domain.ErrUnavailable {
		t.Fatal("USD funding enabled", err)
	}
	// Keep imported time dependency explicit for the lease duration sanity check.
	if d.CreatedAt.After(time.Now()) {
		t.Fatal("bad test clock")
	}
}

type verifyingDepositProvider struct {
	testProvider
	result domain.Verification
	err    error
}

func (p *verifyingDepositProvider) Verify(context.Context, string) (domain.Verification, error) {
	return p.result, p.err
}
func TestDepositServiceVerificationAndRecovery(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	enableDeposits(t, s)
	d := depositFixture(t, s, "verify", "buyer", "ETB", 2500)
	v := depositVerification(d)
	if err := s.DepositReference(ctx, "admin", d.ID, v.Reference); err != nil {
		t.Fatal(err)
	}
	d, _ = s.Deposit(ctx, d.ID)
	p := &verifyingDepositProvider{err: domain.ErrUnavailable}
	svc := service.Service{Store: s, Wallet: s, Mode: "test", Providers: map[string]domain.PaymentProvider{"chapa": p}, VerificationPerMinute: 60}
	if err := svc.ReconcileDeposit(ctx, d); err != domain.ErrUnavailable {
		t.Fatal(err)
	}
	if b := balance(t, s, d.UserID, "ETB"); b.AvailableMinor != 0 {
		t.Fatal("provider outage credited funds", b)
	}
	p.err = nil
	p.result = v
	p.result.AmountMinor++
	if err := svc.ReconcileDeposit(ctx, d); err != domain.ErrInvalid {
		t.Fatal(err)
	}
	reviewed, err := s.Deposit(ctx, d.ID)
	if err != nil || reviewed.Status != "review" {
		t.Fatal(reviewed, err)
	}
	p.result = v
	if _, err = s.DB.Exec(ctx, `UPDATE operations_control SET recovery_locked=true`); err != nil {
		t.Fatal(err)
	}
	if err = svc.ReconcileDeposit(ctx, d); err != domain.ErrUnavailable {
		t.Fatal("recovery credited", err)
	}
	if _, err = s.DB.Exec(ctx, `UPDATE operations_control SET recovery_locked=false`); err != nil {
		t.Fatal(err)
	}
	for i := 0; i < 2; i++ {
		if err = svc.ReconcileDeposit(ctx, d); err != nil {
			t.Fatal(err)
		}
	}
	if b := balance(t, s, d.UserID, "ETB"); b.AvailableMinor != 2500 {
		t.Fatal("incorrect credit", b)
	}
	p.result.Status = "partially_refunded"
	if err = svc.ReconcileDeposit(ctx, d); err != domain.ErrInvalid {
		t.Fatal(err)
	}
	if b := balance(t, s, d.UserID, "ETB"); !b.Restricted || b.AvailableMinor != 0 || b.BalanceMinor != 2500 {
		t.Fatal("unknown adjustment must restrict already credited wallet", b)
	}
}

func TestWalletMoneyBoundsAndCurrencyIsolation(t *testing.T) {
	s := testStore(t)
	ctx := context.Background()
	enableDeposits(t, s)
	for _, amount := range []int64{0, -1, 100000001} {
		if _, _, err := s.CreateDeposit(ctx, domain.Deposit{ID: "dep_bound", UserID: "bounds", Currency: "ETB", AmountMinor: amount, Provider: "chapa", Mode: "test"}); err != domain.ErrInvalid {
			t.Fatal(amount, err)
		}
	}
	d := depositFixture(t, s, "usdmax", "bounds", "USD", 100000000)
	if err := s.ApplyDeposit(ctx, d.ID, depositVerification(d), "test"); err != nil {
		t.Fatal(err)
	}
	if b := balance(t, s, "bounds", "USD"); b.AvailableMinor != 100000000 {
		t.Fatal(b)
	}
	if b := balance(t, s, "bounds", "ETB"); b.BalanceMinor != 0 {
		t.Fatal(b)
	}
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		t.Fatal(err)
	}
	defer tx.Rollback(ctx)
	var journal int64
	if err = tx.QueryRow(ctx, `INSERT INTO wallet_journals(operation,currency,kind,reference) VALUES('mixed','ETB','deposit','mixed') RETURNING id`).Scan(&journal); err != nil {
		t.Fatal(err)
	}
	if _, err = tx.Exec(ctx, `INSERT INTO wallet_entries(journal_id,account_id,currency,amount_minor) SELECT $1,id,'ETB',1 FROM wallet_accounts WHERE user_id='bounds' AND currency='USD'`, journal); err == nil {
		t.Fatal("cross-currency entry accepted")
	}
}
