package httpapi

import (
	"context"
	"net/http"
	"rimna/backend/internal/domain"
)

func (a *API) wallet(w http.ResponseWriter, r *http.Request, u domain.User) {
	if err := a.Store.Rate(r.Context(), "wallet-read:"+u.ID, 120); err != nil {
		fail(w, err)
		return
	}
	balances, err := a.Store.WalletBalances(r.Context(), u.ID)
	if err != nil {
		fail(w, err)
		return
	}
	paused, err := a.Store.DepositPaused(r.Context())
	if err != nil {
		fail(w, err)
		return
	}
	currency := r.URL.Query().Get("currency")
	if currency == "" {
		currency = "ETB"
	}
	if currency != "ETB" && currency != "USD" {
		fail(w, domain.ErrInvalid)
		return
	}
	policy := a.Service.DepositPolicyFor(currency)
	methods := []string{}
	if policy.Enabled && !paused {
		for name, p := range a.Service.Providers {
			if p.Supports(policy.Currency) {
				methods = append(methods, name)
			}
		}
	}
	policy.Enabled = policy.Enabled && !paused && len(methods) > 0
	reply(w, 200, map[string]any{"balances": balances, "depositPolicy": policy, "methods": methods, "mode": a.Service.Mode, "walletPurchasesEnabled": false})
}
func (a *API) walletHistory(w http.ResponseWriter, r *http.Request, u domain.User) {
	if err := a.Store.Rate(r.Context(), "wallet-read:"+u.ID, 120); err != nil {
		fail(w, err)
		return
	}
	out, err := a.Store.WalletHistory(r.Context(), u.ID, r.URL.Query().Get("currency"), offset(r))
	if err != nil {
		fail(w, err)
		return
	}
	reply(w, 200, out)
}
func (a *API) deposits(w http.ResponseWriter, r *http.Request, u domain.User) {
	if err := a.Store.Rate(r.Context(), "wallet-read:"+u.ID, 120); err != nil {
		fail(w, err)
		return
	}
	out, err := a.Store.Deposits(r.Context(), u.ID, offset(r), false)
	if err != nil {
		fail(w, err)
		return
	}
	reply(w, 200, out)
}
func (a *API) deposit(w http.ResponseWriter, r *http.Request, u domain.User) {
	if err := a.Store.Rate(r.Context(), "wallet-read:"+u.ID, 120); err != nil {
		fail(w, err)
		return
	}
	d, err := a.Store.Deposit(r.Context(), r.PathValue("id"))
	if err != nil {
		fail(w, err)
		return
	}
	if d.UserID != u.ID {
		fail(w, domain.ErrNotFound)
		return
	}
	reply(w, 200, d)
}
func (a *API) startDeposit(w http.ResponseWriter, r *http.Request, u domain.User) {
	var input domain.DepositRequest
	if err := decode(r, &input); err != nil {
		fail(w, err)
		return
	}
	d, err := a.Service.StartDeposit(r.Context(), u, r.Header.Get("Idempotency-Key"), input)
	if err != nil {
		fail(w, err)
		return
	}
	reply(w, 200, d)
}

// Account identifiers are exposed only by the administrator endpoint.
type adminDeposit struct {
	domain.Deposit
	AccountID string `json:"accountId"`
}
type adminDepositPage struct {
	Items   []adminDeposit `json:"items"`
	HasMore bool           `json:"hasMore"`
}

func (a *API) adminDepositPage(ctx context.Context, offset int) (adminDepositPage, error) {
	page, err := a.Store.Deposits(ctx, "", offset, true)
	out := adminDepositPage{Items: []adminDeposit{}, HasMore: page.HasMore}
	for _, d := range page.Items {
		out.Items = append(out.Items, adminDeposit{Deposit: d, AccountID: d.UserID})
	}
	return out, err
}
