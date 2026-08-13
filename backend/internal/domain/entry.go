package domain

import (
	"time"

	"github.com/google/uuid"
)

// EntryStatus represents the payment confirmation state of an entry.
type EntryStatus string

const (
	EntryStatusPending   EntryStatus = "pending"
	EntryStatusConfirmed EntryStatus = "confirmed"
	EntryStatusRejected  EntryStatus = "rejected"
)

// PaymentMethod represents the payment channel used.
type PaymentMethod string

const (
	PaymentMethodTelebirr PaymentMethod = "telebirr"
	PaymentMethodCBEBirr  PaymentMethod = "cbebirr"
	PaymentMethodBank     PaymentMethod = "bank"
)

// Entry is a player's raffle ticket.
type Entry struct {
	ID          uuid.UUID     `json:"id"`
	DrawID      uuid.UUID     `json:"draw_id"`
	UserID      uuid.UUID     `json:"user_id"`
	Number      string        `json:"number"`      // Zero-padded "00"–"99"
	Amount      int           `json:"amount"`      // ETB
	Method      PaymentMethod `json:"method"`
	ProofKey    string        `json:"-"`           // S3 object key — never expose directly
	Status      EntryStatus   `json:"status"`
	ConfirmedBy *uuid.UUID    `json:"confirmed_by,omitempty"`
	RejectedBy  *uuid.UUID    `json:"rejected_by,omitempty"`
	CreatedAt   time.Time     `json:"created_at"`
	ConfirmedAt *time.Time    `json:"confirmed_at,omitempty"`
	RejectedAt  *time.Time    `json:"rejected_at,omitempty"`
	// Joined fields (not stored in entries table)
	UserName  string `json:"user_name,omitempty"`
	UserPhone string `json:"user_phone,omitempty"`
}

// IsConfirmed returns true if the entry is in the draw.
func (e *Entry) IsConfirmed() bool {
	return e.Status == EntryStatusConfirmed
}
