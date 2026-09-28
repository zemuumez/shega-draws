// Package stripe implements hosted, card-only SANDBOX checkout. It deliberately
// rejects live keys/objects. Provider eligibility must be resolved separately.
package stripe

import (
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"rimna/backend/internal/domain"
	"strconv"
	"strings"
	"time"
)

const apiVersion = "2025-02-24.acacia"

var reference = regexp.MustCompile(`^cs_test_[A-Za-z0-9_]{1,110}$`)
var merchant = regexp.MustCompile(`^dep_[A-Za-z0-9_-]{1,120}$`)

type Adapter struct {
	Key, WebhookSecret, ReturnURL, BaseURL string
	Client                                 *http.Client
	now                                    func() time.Time
}

func New(key, secret, returnURL string) *Adapter {
	return &Adapter{Key: key, WebhookSecret: secret, ReturnURL: returnURL, BaseURL: "https://api.stripe.com/v1", Client: &http.Client{Timeout: 15 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}, now: time.Now}
}
func (a *Adapter) Name() string { return "stripe" }
func (a *Adapter) Supports(currency string) bool {
	return currency == "USD" && (strings.HasPrefix(a.Key, "sk_test_") || strings.HasPrefix(a.Key, "rk_test_")) && strings.HasPrefix(a.WebhookSecret, "whsec_") && validReturn(a.ReturnURL)
}
func validReturn(raw string) bool {
	u, e := url.Parse(raw)
	return e == nil && u.Host != "" && u.User == nil && u.Fragment == "" && (u.Scheme == "https" || (u.Scheme == "http" && (u.Hostname() == "localhost" || u.Hostname() == "127.0.0.1")))
}
func (a *Adapter) request(ctx context.Context, method, path string, form url.Values, key string, out any) error {
	if !a.Supports("USD") {
		return domain.ErrUnavailable
	}
	req, e := http.NewRequestWithContext(ctx, method, a.BaseURL+path, strings.NewReader(form.Encode()))
	if e != nil {
		return domain.ErrUnavailable
	}
	req.SetBasicAuth(a.Key, "")
	req.Header.Set("Stripe-Version", apiVersion)
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")
	if key != "" {
		req.Header.Set("Idempotency-Key", key)
	}
	res, e := a.Client.Do(req)
	if e != nil {
		return domain.ErrUnavailable
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return domain.ErrUnavailable
	}
	body, e := io.ReadAll(io.LimitReader(res.Body, (1<<20)+1))
	if e != nil || len(body) > 1<<20 || json.Unmarshal(body, out) != nil {
		return domain.ErrUnavailable
	}
	return nil
}

type session struct {
	ID            string            `json:"id"`
	Object        string            `json:"object"`
	URL           string            `json:"url"`
	Live          bool              `json:"livemode"`
	Mode          string            `json:"mode"`
	Status        string            `json:"status"`
	PaymentStatus string            `json:"payment_status"`
	Currency      string            `json:"currency"`
	Amount        int64             `json:"amount_total"`
	Merchant      string            `json:"client_reference_id"`
	Metadata      map[string]string `json:"metadata"`
	Intent        *struct {
		ID       string            `json:"id"`
		Status   string            `json:"status"`
		Live     bool              `json:"livemode"`
		Currency string            `json:"currency"`
		Amount   int64             `json:"amount_received"`
		Metadata map[string]string `json:"metadata"`
		Charge   *struct {
			ID       string `json:"id"`
			Live     bool   `json:"livemode"`
			Paid     bool   `json:"paid"`
			Captured bool   `json:"captured"`
			Disputed bool   `json:"disputed"`
			Amount   int64  `json:"amount"`
			Refunded int64  `json:"amount_refunded"`
			Currency string `json:"currency"`
		} `json:"latest_charge"`
	} `json:"payment_intent"`
}

func (a *Adapter) Start(ctx context.Context, o domain.CheckoutRequest) (domain.Checkout, error) {
	if !a.Supports(o.Currency) || !merchant.MatchString(o.ID) || o.AmountMinor < 2500 || o.AmountMinor > 100000000 {
		return domain.Checkout{}, domain.ErrInvalid
	}
	form := url.Values{
		"mode": {"payment"}, "payment_method_types[0]": {"card"},
		"success_url": {a.ReturnURL}, "cancel_url": {a.ReturnURL},
		"client_reference_id": {o.ID}, "metadata[deposit_id]": {o.ID}, "payment_intent_data[metadata][deposit_id]": {o.ID},
		"customer_email": {o.Email}, "line_items[0][quantity]": {"1"},
		"line_items[0][price_data][currency]": {"usd"}, "line_items[0][price_data][unit_amount]": {strconv.FormatInt(o.AmountMinor, 10)},
		"line_items[0][price_data][product_data][name]": {"Rimna lottery wallet deposit (sandbox)"},
	}
	var s session
	if e := a.request(ctx, "POST", "/checkout/sessions", form, "deposit:"+o.ID, &s); e != nil {
		return domain.Checkout{}, e
	}
	u, e := url.Parse(s.URL)
	if e != nil || u.Scheme != "https" || u.Host != "checkout.stripe.com" || u.User != nil || s.Live || !reference.MatchString(s.ID) || s.Merchant != o.ID || s.Amount != o.AmountMinor || s.Currency != "usd" || s.Mode != "payment" {
		return domain.Checkout{}, domain.ErrInvalid
	}
	return domain.Checkout{URL: s.URL, Reference: s.ID}, nil
}
func (a *Adapter) Verify(ctx context.Context, ref string) (domain.Verification, error) {
	if !reference.MatchString(ref) {
		return domain.Verification{}, domain.ErrInvalid
	}
	var s session
	if e := a.request(ctx, "GET", "/checkout/sessions/"+ref+"?expand[]=payment_intent.latest_charge", nil, "", &s); e != nil {
		return domain.Verification{}, e
	}
	if s.ID != ref || s.Live || s.Object != "checkout.session" || s.Mode != "payment" || s.Currency != "usd" || !merchant.MatchString(s.Merchant) || s.Metadata["deposit_id"] != s.Merchant || s.Amount < 2500 || s.Amount > 100000000 {
		return domain.Verification{}, domain.ErrInvalid
	}
	v := domain.Verification{Reference: ref, MerchantReference: s.Merchant, Mode: "test", Currency: "USD", AmountMinor: s.Amount, Status: "pending"}
	if s.PaymentStatus == "paid" {
		p := s.Intent
		if p == nil || p.Live || p.Status != "succeeded" || p.Currency != s.Currency || p.Amount != s.Amount || p.Metadata["deposit_id"] != s.Merchant || p.Charge == nil {
			return domain.Verification{}, domain.ErrInvalid
		}
		c := p.Charge
		if c.ID == "" || c.Live || !c.Paid || !c.Captured || c.Currency != s.Currency || c.Amount != s.Amount || c.Refunded < 0 || c.Refunded > c.Amount {
			return domain.Verification{}, domain.ErrInvalid
		}
		switch {
		case c.Disputed:
			v.Status = "disputed" // The ledger freezes the wallet for staff review.
		case c.Refunded == c.Amount:
			v.Status = "fully_refunded"
		case c.Refunded > 0:
			v.Status = "partially_refunded"
		default:
			v.Status = "success"
		}
	} else if s.Status == "expired" {
		v.Status = "cancelled"
	}
	return v, nil
}
func (a *Adapter) AuthenticateWebhook(body []byte, header string) bool {
	if !a.Supports("USD") || len(header) > 4096 {
		return false
	}
	var stamp string
	var signatures []string
	for _, part := range strings.Split(header, ",") {
		k, v, ok := strings.Cut(strings.TrimSpace(part), "=")
		if !ok {
			continue
		}
		if k == "t" {
			if stamp != "" {
				return false
			}
			stamp = v
		}
		if k == "v1" {
			signatures = append(signatures, v)
		}
	}
	t, e := strconv.ParseInt(stamp, 10, 64)
	if e != nil {
		return false
	}
	now := a.now().Unix()
	if t < now-300 || t > now+300 {
		return false
	}
	mac := hmac.New(sha256.New, []byte(a.WebhookSecret))
	mac.Write([]byte(stamp + "."))
	mac.Write(body)
	for _, sig := range signatures {
		b, e := hex.DecodeString(sig)
		if e == nil && hmac.Equal(b, mac.Sum(nil)) {
			return true
		}
	}
	return false
}
func (a *Adapter) WebhookReference(body []byte) (domain.Webhook, error) {
	var event struct {
		Live bool   `json:"livemode"`
		Type string `json:"type"`
		Data struct {
			Object struct {
				ID       string            `json:"id"`
				Live     bool              `json:"livemode"`
				Merchant string            `json:"client_reference_id"`
				Metadata map[string]string `json:"metadata"`
			} `json:"object"`
		} `json:"data"`
	}
	if json.Unmarshal(body, &event) != nil || event.Live || event.Data.Object.Live {
		return domain.Webhook{}, domain.ErrInvalid
	}
	o := event.Data.Object
	switch event.Type {
	case "checkout.session.completed", "checkout.session.async_payment_succeeded", "checkout.session.async_payment_failed", "checkout.session.expired":
		if !reference.MatchString(o.ID) || !merchant.MatchString(o.Merchant) || o.Metadata["deposit_id"] != o.Merchant {
			return domain.Webhook{}, domain.ErrInvalid
		}
		return domain.Webhook{MerchantReference: o.Merchant, ProviderReference: o.ID}, nil
	case "charge.refunded", "charge.updated":
		// A charge ID must never replace the stored Checkout Session reference.
		// Its metadata only schedules an independent lookup of the saved session.
		if !merchant.MatchString(o.Metadata["deposit_id"]) {
			return domain.Webhook{}, domain.ErrInvalid
		}
		return domain.Webhook{MerchantReference: o.Metadata["deposit_id"]}, nil
	default:
		return domain.Webhook{}, domain.ErrNotFound // Authenticated but not a subscribed payment event.
	}
}
