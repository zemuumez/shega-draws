package store

import (
	"context"
	"rimna/backend/internal/domain"
	"strings"
	"time"
)

// AdminDraws is paged independently of the public draw catalogue.
func (s *Store) AdminDraws(ctx context.Context, offset int) ([]domain.Draw, error) {
	rows, err := s.DB.Query(ctx, `SELECT id,title,currency,price_minor,capacity,status,deadline,live_video_url FROM draws ORDER BY created_at DESC,id LIMIT 100 OFFSET $1`, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.Draw{}
	for rows.Next() {
		var d domain.Draw
		if err = rows.Scan(&d.ID, &d.Title, &d.Currency, &d.PriceMinor, &d.Capacity, &d.Status, &d.Deadline, &d.LiveVideoURL); err != nil {
			return nil, err
		}
		out = append(out, d)
	}
	return out, rows.Err()
}

type AdminOverview struct {
	OpenRounds      int               `json:"openRounds"`
	IssuedTickets   int               `json:"issuedTickets"`
	PendingPayments int               `json:"pendingPayments"`
	RefundRequired  int               `json:"refundRequired"`
	Collections     []AdminCollection `json:"collections"`
	AsOf            time.Time         `json:"asOf"`
}
type AdminCollection struct {
	Currency      string `json:"currency"`
	PaidMinor     int64  `json:"paidMinor"`
	RefundedMinor int64  `json:"refundedMinor"`
}

func (s *Store) AdminOverview(ctx context.Context) (AdminOverview, error) {
	o := AdminOverview{Collections: []AdminCollection{}}
	// One statement provides a consistent count snapshot. Expired open draws
	// are excluded even if their status has not been changed by an operator.
	err := s.DB.QueryRow(ctx, `SELECT
	 (SELECT count(*) FROM draws WHERE status='open' AND deadline>now()),
	 count(*) FILTER(WHERE status='paid' AND NOT refund_recorded),
	 count(*) FILTER(WHERE status IN ('pending','initializing')),
	 count(*) FILTER(WHERE status='refund_required' AND NOT refund_recorded),now() FROM orders`).Scan(&o.OpenRounds, &o.IssuedTickets, &o.PendingPayments, &o.RefundRequired, &o.AsOf)
	if err != nil {
		return o, err
	}
	rows, err := s.DB.Query(ctx, `SELECT currency,
	 COALESCE(sum(amount_minor) FILTER(WHERE kind='payment'),0)::bigint,
	 COALESCE(sum(abs(amount_minor)) FILTER(WHERE kind='refund'),0)::bigint
	 FROM payment_ledger GROUP BY currency ORDER BY currency`)
	if err != nil {
		return o, err
	}
	defer rows.Close()
	for rows.Next() {
		var c AdminCollection
		if err = rows.Scan(&c.Currency, &c.PaidMinor, &c.RefundedMinor); err != nil {
			return o, err
		}
		o.Collections = append(o.Collections, c)
	}
	return o, rows.Err()
}

type AdminUser struct {
	ID               string    `json:"id"`
	Name             string    `json:"name"`
	Email            string    `json:"email"`
	EmailVerified    bool      `json:"emailVerified"`
	TwoFactorEnabled bool      `json:"twoFactorEnabled"`
	Role             string    `json:"role"`
	CreatedAt        time.Time `json:"createdAt"`
}
type AdminUsersPage struct {
	Items   []AdminUser `json:"items"`
	HasMore bool        `json:"hasMore"`
}

func (s *Store) AdminUsers(ctx context.Context, query string, offset int) (AdminUsersPage, error) {
	out := AdminUsersPage{Items: []AdminUser{}}
	query = strings.TrimSpace(query)
	if len(query) > 100 || offset < 0 || offset > 1000000 {
		return out, domain.ErrInvalid
	}
	// Search terms are literal: '%' and '_' cannot expand a search to all users.
	pattern := "%" + strings.NewReplacer(`\`, `\\`, "%", `\%`, "_", `\_`).Replace(query) + "%"
	rows, err := s.DB.Query(ctx, `SELECT u.id,u.name,u.email,u."emailVerified",
	 COALESCE(u."twoFactorEnabled",false),CASE WHEN s.enabled THEN s.role ELSE 'player' END,u."createdAt"
	 FROM auth."user" u LEFT JOIN staff s ON s.user_id=u.id
	 WHERE $1='' OR u.email ILIKE $2 OR u.name ILIKE $2
	 ORDER BY u."createdAt" DESC,u.id LIMIT 51 OFFSET $3`, query, pattern, offset)
	if err != nil {
		return out, err
	}
	defer rows.Close()
	for rows.Next() {
		var u AdminUser
		if err = rows.Scan(&u.ID, &u.Name, &u.Email, &u.EmailVerified, &u.TwoFactorEnabled, &u.Role, &u.CreatedAt); err != nil {
			return out, err
		}
		out.Items = append(out.Items, u)
	}
	if len(out.Items) > 50 {
		out.HasMore = true
		out.Items = out.Items[:50]
	}
	return out, rows.Err()
}
