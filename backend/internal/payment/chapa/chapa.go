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
	"log/slog"
	"net/http"
	"net/url"
	"os"
	"rimna/backend/internal/domain"
	"strconv"
	"strings"
	"time"
)

// Adapter implements Chapa API v2. A timeout during Start is ambiguous: callers
// must reconcile the merchant reference, never create another charge blindly.
type Adapter struct {
	Key, WebhookSecret, Mode, BaseURL, Origin string
	Currencies                                map[string]bool
	Client                                    *http.Client
}

func New(key, secret, mode string, currencies []string, origin ...string) *Adapter {
	orig := "http://localhost:3000"
	if len(origin) > 0 && origin[0] != "" {
		orig = strings.TrimRight(origin[0], "/")
	}
	baseURL := "https://api.chapa.co/v1"
	if u := os.Getenv("CHAPA_BASE_URL"); u != "" {
		baseURL = strings.TrimRight(u, "/")
	}
	a := &Adapter{
		Key:           key,
		WebhookSecret: secret,
		Mode:          mode,
		BaseURL:       baseURL,
		Origin:        orig,
		Currencies:    map[string]bool{},
		Client: &http.Client{
			Timeout: 15 * time.Second,
			CheckRedirect: func(*http.Request, []*http.Request) error {
				return http.ErrUseLastResponse
			},
		},
	}
	for _, c := range currencies {
		a.Currencies[strings.TrimSpace(c)] = true
	}
	return a
}
func (a *Adapter) Name() string { return "chapa" }
func (a *Adapter) Supports(c string) bool {
	return a.Key != "" && a.WebhookSecret != "" && a.Currencies[c]
}
func (a *Adapter) isMock() bool {
	k := strings.ToUpper(a.Key)
	return a.Mode == "test" && (k == "DEMO" || strings.HasSuffix(k, "DEMO") || strings.Contains(k, "MOCK"))
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
		slog.Error("Chapa request network failure", "error", err)
		return domain.ErrUnavailable
	}
	defer res.Body.Close()
	if res.StatusCode < 200 || res.StatusCode >= 300 {
		body, _ := io.ReadAll(res.Body)
		slog.Error("Chapa request returned non-2xx status", "status", res.StatusCode, "body", string(body))
		return domain.ErrUnavailable
	}
	if err = json.NewDecoder(io.LimitReader(res.Body, 1<<20)).Decode(output); err != nil {
		slog.Error("Chapa response decode failed", "error", err)
		return domain.ErrUnavailable
	}
	return nil
}
func (a *Adapter) Start(ctx context.Context, o domain.CheckoutRequest) (domain.Checkout, error) {
	if !a.Supports(o.Currency) {
		slog.Warn("Chapa adapter does not support currency or is not configured", "currency", o.Currency, "hasKey", a.Key != "", "hasSecret", a.WebhookSecret != "")
		return domain.Checkout{}, domain.ErrUnavailable
	}

	// Local Sandbox Simulator Mode
	if a.isMock() {
		ref := fmt.Sprintf("chapa_mock_%s_amt_%d_cur_%s", o.ID, o.AmountMinor, o.Currency)
		checkoutURL := fmt.Sprintf("%s/chapa-sandbox?id=%s&amount=%d&currency=%s&ref=%s",
			a.Origin, o.ID, o.AmountMinor, o.Currency, ref)
		return domain.Checkout{URL: checkoutURL, Reference: ref}, nil
	}

	// Real Chapa API Hosted Checkout
	names := strings.Fields(o.Name)
	first, last := "Player", ""
	if len(names) > 0 {
		first = names[0]
		last = strings.Join(names[1:], " ")
	}
	email := o.Email
	if email == "" || !strings.Contains(email, "@") {
		email = "customer@example.com"
	}
	body := map[string]any{
		"amount":             fmt.Sprintf("%d.%02d", o.AmountMinor/100, o.AmountMinor%100),
		"currency":           o.Currency,
		"tx_ref":             o.ID,
		"merchant_reference": o.ID,
		"email":              email,
		"first_name":         first,
		"last_name":          last,
		"phone_number":       o.Phone,
		"return_url":         a.Origin + "/deposit",
		"customization": map[string]string{
			"title":       "Shega Draws",
			"description": "Wallet Deposit",
		},
	}
	var result struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Data    struct {
			URL       string `json:"checkout_url"`
			Reference string `json:"chapa_reference"`
		} `json:"data"`
	}
	endpoint := "/transaction/initialize"
	if strings.Contains(a.BaseURL, "/v2") {
		endpoint = "/payments/hosted"
	}
	if err := a.request(ctx, "POST", endpoint, body, &result); err != nil {
		return domain.Checkout{}, err
	}
	u, err := url.Parse(result.Data.URL)
	if err != nil || u.Scheme != "https" || u.User != nil || u.Port() != "" || (u.Hostname() != "checkout.chapa.co" && u.Hostname() != "checkout.chapa.global") || result.Status != "success" {
		slog.Error("Chapa checkout response invalid", "status", result.Status, "url", result.Data.URL, "message", result.Message)
		return domain.Checkout{}, domain.ErrUnavailable
	}
	ref := o.ID
	return domain.Checkout{URL: u.String(), Reference: ref}, nil
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
	if a.isMock() && strings.HasPrefix(ref, "chapa_mock_") {
		parts := strings.Split(strings.TrimPrefix(ref, "chapa_mock_"), "_amt_")
		merchantID := parts[0]
		var amt int64
		currency := "ETB"
		if len(parts) > 1 {
			amtParts := strings.Split(parts[1], "_cur_")
			amt, _ = strconv.ParseInt(amtParts[0], 10, 64)
			if len(amtParts) > 1 && amtParts[1] != "" {
				currency = strings.ToUpper(amtParts[1])
			}
		}
		return domain.Verification{
			Reference:         ref,
			MerchantReference: merchantID,
			Status:            "success",
			AmountMinor:       amt,
			Currency:          currency,
			Mode:              a.Mode,
		}, nil
	}

	var result struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Data    struct {
			Status    string          `json:"status"`
			Amount    json.RawMessage `json:"amount"`
			Currency  string          `json:"currency"`
			Reference string          `json:"reference"`
			ChapaRef  string          `json:"chapa_reference"`
			TxRef     string          `json:"tx_ref"`
			Merchant  string          `json:"merchant_reference"`
			Mode      string          `json:"mode"`
		} `json:"data"`
	}
	endpoint := "/transaction/verify/" + url.PathEscape(ref)
	if strings.Contains(a.BaseURL, "/v2") {
		endpoint = "/payments/" + url.PathEscape(ref) + "/verify"
	}
	if err := a.request(ctx, "GET", endpoint, nil, &result); err != nil {
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
	mode := strings.ToLower(strings.TrimSpace(d.Mode))
	if mode == "" {
		mode = a.Mode
	}
	status := strings.ToLower(strings.TrimSpace(d.Status))
	switch {
	case strings.Contains(status, "success"):
		status = "success"
	case strings.Contains(status, "fail") || strings.Contains(status, "cancel"):
		status = "failed"
	case strings.Contains(status, "pend"):
		status = "pending"
	}
	merchant := d.Merchant
	if merchant == "" {
		merchant = d.TxRef
	}
	if merchant == "" {
		merchant = ref
	}
	return domain.Verification{Reference: ref, MerchantReference: merchant, Status: status, AmountMinor: amount, Currency: strings.ToUpper(d.Currency), Mode: mode}, nil
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
		RefID             string `json:"ref_id"`
		ReferenceAlt      string `json:"reference"`

		Type  string `json:"webhook_type"`
		Event string `json:"event"`

		Mode string `json:"mode"`

		Reference string `json:"merchant_reference"`
		TxRef     string `json:"tx_ref"`
		TrxRef    string `json:"trx_ref"`
	}
	if err := json.Unmarshal(body, &event); err != nil {
		return domain.Webhook{}, domain.ErrInvalid
	}
	providerRef := event.ProviderReference
	if providerRef == "" {
		providerRef = event.RefID
	}
	if providerRef == "" {
		providerRef = event.ReferenceAlt
	}

	merchantRef := event.Reference
	if merchantRef == "" {
		merchantRef = event.TxRef
	}
	if merchantRef == "" {
		merchantRef = event.TrxRef
	}

	if event.Mode != "" && event.Mode != a.Mode {
		return domain.Webhook{}, domain.ErrInvalid
	}
	if merchantRef == "" || len(merchantRef) > 128 || providerRef == "" || len(providerRef) > 128 {
		return domain.Webhook{}, domain.ErrInvalid
	}
	return domain.Webhook{MerchantReference: merchantRef, ProviderReference: providerRef}, nil
}
