// Package domain holds business data and ports. It has no HTTP, SQL, or provider dependencies.
package domain

import (
	"context"
	"errors"
	"time"
)

var (
	ErrConflict    = errors.New("ticket is reserved or the request conflicts with an earlier purchase")
	ErrPaused      = errors.New("New ticket sales are temporarily paused. Existing payments are still being checked.")
	ErrClosed      = errors.New("this draw is not open for ticket sales")
	ErrNotFound    = errors.New("record not found")
	ErrUnavailable = errors.New("payment service is not configured or temporarily unavailable")
	ErrInvalid     = errors.New("invalid request")
	ErrRate        = errors.New("too many requests; please try again later")
)

type User struct {
	ID, Email, Name string
	Verified        bool
	SessionID       string
}
type Draw struct {
	ID           string    `json:"id"`
	Title        string    `json:"title"`
	Currency     string    `json:"currency"`
	PriceMinor   int64     `json:"priceMinor"`
	Capacity     int       `json:"capacity"`
	Status       string    `json:"status"`
	Deadline     time.Time `json:"deadline"`
	LiveVideoURL string    `json:"liveVideoUrl"`
}
type Order struct {
	ID                string    `json:"id"`
	UserID            string    `json:"-"`
	DrawID            string    `json:"drawId"`
	Number            int       `json:"number"`
	AmountMinor       int64     `json:"amountMinor"`
	Currency          string    `json:"currency"`
	Provider          string    `json:"provider"`
	Status            string    `json:"status"`
	Refunded          bool      `json:"refunded"`
	Key               string    `json:"-"`
	Fingerprint       string    `json:"-"`
	Phone             string    `json:"phone"`
	Email             string    `json:"email"`
	Name              string    `json:"name"`
	PromoCode         string    `json:"promoCode"`
	CheckoutURL       string    `json:"checkoutUrl"`
	ProviderReference string    `json:"paymentReference"`
	ExpiresAt         time.Time `json:"expiresAt"`
	CreatedAt         time.Time `json:"createdAt"`
}
type Purchase struct {
	DrawID    string `json:"drawId"`
	Number    int    `json:"number"`
	Provider  string `json:"provider"`
	Phone     string `json:"phone"`
	PromoCode string `json:"promoCode"`
}
type Checkout struct{ URL, Reference string }
type Webhook struct{ MerchantReference, ProviderReference string }
type Verification struct {
	Reference, MerchantReference, Status, Currency, Mode string
	AmountMinor                                          int64
}

// PaymentProvider is the boundary for Chapa, bank payment and future processors.
// Provider adapters never issue tickets or write to the database.
type PaymentProvider interface {
	Name() string
	Supports(currency string) bool
	Start(context.Context, CheckoutRequest) (Checkout, error)
	Verify(context.Context, string) (Verification, error)
	AuthenticateWebhook([]byte, string) bool
	WebhookReference([]byte) (Webhook, error)
}
