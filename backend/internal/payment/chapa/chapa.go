package chapa

import (
	"bytes"
	"context"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"rimna/backend/internal/domain"
	"strconv"
	"strings"
	"time"
)

// Adapter implements Chapa API v2. A timeout during Start is ambiguous: callers
// must reconcile the merchant reference, never create another charge blindly.
type Adapter struct {
	Key, WebhookSecret, Mode, BaseURL string
	Currencies                        map[string]bool
	Client                            *http.Client
}

func New(key, secret, mode string, currencies []string) *Adapter {
	a := &Adapter{Key: key, WebhookSecret: secret, Mode: mode, BaseURL: "https://api.chapa.global/v2", Currencies: map[string]bool{}, Client: &http.Client{Timeout: 15 * time.Second, CheckRedirect: func(*http.Request, []*http.Request) error { return http.ErrUseLastResponse }}}
	for _, c := range currencies {
		a.Currencies[strings.TrimSpace(c)] = true
	}
	return a
}
func (a *Adapter) Name() string { return "chapa" }
func (a *Adapter) Supports(c string) bool {
	return a.Key != "" && a.WebhookSecret != "" && a.Currencies[c]
}
func (a *Adapter) request(ctx context.Context, method, path string, body any, output any) error {
	if a.Key == "" {
		return domain.ErrUnavailable
	}
	var data []byte
	var err error
	if body != nil {
		data, err = json.Marshal(body)
		if err != nil {
			return err
		}
	}
	req, err := http.NewRequestWithContext(ctx, method, a.BaseURL+path, bytes.NewReader(data))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+a.Key)
	req.Header.Set("Content-Type", "application/json")
	res, err := a.Client.Do(req)
	if err != nil {
		return domain.ErrUnavailable
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return domain.ErrUnavailable
	}
	if err = json.NewDecoder(io.LimitReader(res.Body, 1<<20)).Decode(output); err != nil {
		return domain.ErrUnavailable
	}
	return nil
}
func (a *Adapter) Start(ctx context.Context, o domain.Order) (domain.Checkout, error) {
	if !a.Supports(o.Currency) {
		return domain.Checkout{}, domain.ErrUnavailable
	}
	names := strings.Fields(o.Name)
	first, last := "Player", ""
	if len(names) > 0 {
		first = names[0]
		last = strings.Join(names[1:], " ")
	}
	body := map[string]any{"amount": json.Number(fmt.Sprintf("%d.%02d", o.AmountMinor/100, o.AmountMinor%100)), "currency": o.Currency, "merchant_reference": o.ID, "customer": map[string]string{"first_name": first, "last_name": last, "email": o.Email, "phone_number": o.Phone}, "meta": map[string]string{"order_id": o.ID}}
	var result struct {
		Status string `json:"status"`
		Data   struct {
			URL       string `json:"checkout_url"`
			Reference string `json:"chapa_reference"`
		} `json:"data"`
	}
	if err := a.request(ctx, "POST", "/payments/hosted", body, &result); err != nil {
		return domain.Checkout{}, err
	}
	u, err := url.Parse(result.Data.URL)
	if err != nil || u.Scheme != "https" || u.User != nil || u.Port() != "" || (u.Hostname() != "checkout.chapa.co" && u.Hostname() != "checkout.chapa.global") || result.Status != "success" {
		return domain.Checkout{}, domain.ErrUnavailable
	}
	return domain.Checkout{URL: u.String(), Reference: result.Data.Reference}, nil
}

// DecimalMinor rejects rounding, exponent notation, negatives and excess precision.
func DecimalMinor(raw string) (int64, error) {
	raw = strings.Trim(raw, "\"")
	parts := strings.Split(raw, ".")
	if len(parts) > 2 || len(parts[0]) == 0 {
		return 0, domain.ErrInvalid
	}
	for _, c := range strings.ReplaceAll(raw, ".", "") {
		if c < '0' || c > '9' {
			return 0, domain.ErrInvalid
		}
	}
	fraction := "00"
	if len(parts) == 2 {
		if len(parts[1]) > 2 || len(parts[1]) == 0 {
			return 0, domain.ErrInvalid
		}
		fraction = (parts[1] + "00")[:2]
	}
	major, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil || major > 1000000000 {
		return 0, domain.ErrInvalid
	}
	minor, _ := strconv.ParseInt(fraction, 10, 64)
	return major*100 + minor, nil
}
func (a *Adapter) Verify(ctx context.Context, ref string) (domain.Verification, error) {
	var result struct {
		Status string `json:"status"`
		Data   struct {
			Status    string          `json:"status"`
			Amount    json.RawMessage `json:"amount"`
			Currency  string          `json:"currency"`
			Reference string          `json:"chapa_reference"`
			Merchant  string          `json:"merchant_reference"`
			Mode      string          `json:"mode"`
		} `json:"data"`
	}
	if err := a.request(ctx, "GET", "/payments/"+url.PathEscape(ref)+"/verify", nil, &result); err != nil {
		return domain.Verification{}, err
	}
	if result.Status != "success" {
		return domain.Verification{}, domain.ErrUnavailable
	}
	amount, err := DecimalMinor(string(result.Data.Amount))
	if err != nil {
		return domain.Verification{}, err
	}
	d := result.Data
	// v2 verification does not document a mode field. The authenticated API key
	// selects the environment; reject any conflicting mode when one is returned.
	if d.Mode == "" {
		d.Mode = a.Mode
	}
	return domain.Verification{Reference: d.Reference, MerchantReference: d.Merchant, Status: d.Status, AmountMinor: amount, Currency: d.Currency, Mode: d.Mode}, nil
}
func (a *Adapter) AuthenticateWebhook(body []byte, sig string) bool {
	if a.WebhookSecret == "" {
		return false
	}
	received, err := hex.DecodeString(sig)
	if err != nil {
		return false
	}
	mac := hmac.New(sha256.New, []byte(a.WebhookSecret))
	mac.Write(body)
	return hmac.Equal(received, mac.Sum(nil))
}
func (a *Adapter) WebhookReference(body []byte) (domain.Webhook, error) {
	var event struct {
		ProviderReference string `json:"chapa_reference"`
		Type              string `json:"webhook_type"`
		Mode              string `json:"mode"`
		Reference         string `json:"merchant_reference"`
	}
	if json.Unmarshal(body, &event) != nil || (event.Type != "payment" && event.Type != "refund") || event.Mode != a.Mode || event.Reference == "" || len(event.Reference) > 128 || event.ProviderReference == "" || len(event.ProviderReference) > 128 {
		return domain.Webhook{}, domain.ErrInvalid
	}
	return domain.Webhook{MerchantReference: event.Reference, ProviderReference: event.ProviderReference}, nil
}
