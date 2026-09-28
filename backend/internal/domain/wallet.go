package domain

import "time"

// CheckoutRequest is provider-facing payment data, independent of tickets or wallets.
type CheckoutRequest struct {
	ID                           string
	AmountMinor                  int64
	Currency, Phone, Email, Name string
}
type DepositRequest struct {
	Currency    string `json:"currency"`
	AmountMinor int64  `json:"amountMinor"`
	Provider    string `json:"provider"`
	Phone       string `json:"phone"`
}
type Deposit struct {
	ID                                   string     `json:"id"`
	UserID                               string     `json:"-"`
	Currency                             string     `json:"currency"`
	AmountMinor                          int64      `json:"amountMinor"`
	Provider                             string     `json:"provider"`
	Mode                                 string     `json:"mode"`
	Status                               string     `json:"status"`
	CheckoutURL                          string     `json:"checkoutUrl"`
	ProviderReference                    string     `json:"paymentReference"`
	Key, Fingerprint, Phone, Email, Name string     `json:"-"`
	CreatedAt                            time.Time  `json:"createdAt"`
	CreditedAt                           *time.Time `json:"creditedAt"`
	ReversedAt                           *time.Time `json:"reversedAt"`
	ReviewReason                         string     `json:"reviewReason"`
}

func (d Deposit) CheckoutRequest() CheckoutRequest {
	return CheckoutRequest{ID: d.ID, AmountMinor: d.AmountMinor, Currency: d.Currency, Phone: d.Phone, Email: d.Email, Name: d.Name}
}

type WalletBalance struct {
	Currency       string `json:"currency"`
	BalanceMinor   int64  `json:"balanceMinor"`
	AvailableMinor int64  `json:"availableMinor"`
	PendingMinor   int64  `json:"pendingMinor"`
	Restricted     bool   `json:"restricted"`
}
type WalletEntry struct {
	ID                int64     `json:"id"`
	Kind              string    `json:"kind"`
	Reference         string    `json:"reference"`
	Currency          string    `json:"currency"`
	AmountMinor       int64     `json:"amountMinor"`
	BalanceAfterMinor int64     `json:"balanceAfterMinor"`
	CreatedAt         time.Time `json:"createdAt"`
}
