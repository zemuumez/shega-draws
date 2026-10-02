package store

import (
	"context"
	"encoding/json"
	"rimna/backend/internal/domain"
	"strings"
	"time"
)

// AdminDraws is paged independently of the public draw catalogue.
func (s *Store) AdminDraws(ctx context.Context, offset int) ([]domain.Draw, error) {
	rows, err := s.DB.Query(ctx, `SELECT d.id, d.title, d.currency, d.price_minor, d.capacity, d.status, d.deadline, COALESCE(d.live_video_url,''), d.rules,
		COALESCE(o.sold, 0), COALESCE(o.occupied, 0)
		FROM draws d
		LEFT JOIN LATERAL (
			SELECT
				count(*) FILTER(WHERE status IN ('paid','legacy_pending')) AS sold,
				count(*) FILTER(WHERE status IN ('paid','legacy_pending') OR (status IN ('initializing','pending') AND expires_at>now())) AS occupied
			FROM orders WHERE draw_id=d.id
		) o ON true
		ORDER BY d.created_at DESC, d.id LIMIT 100 OFFSET $1`, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []domain.Draw{}
	for rows.Next() {
		var d domain.Draw
		var rawRules []byte
		if err = rows.Scan(&d.ID, &d.Title, &d.Currency, &d.PriceMinor, &d.Capacity, &d.Status, &d.Deadline, &d.LiveVideoURL, &rawRules, &d.SoldCount, &d.OccupiedCount); err != nil {
			return nil, err
		}
		d.PurchasedCount = d.SoldCount
		if len(rawRules) > 0 {
			var rules domain.LotteryRules
			if err := json.Unmarshal(rawRules, &rules); err == nil {
				d.Rules = &rules
			}
		}
		out = append(out, d)
	}
	return out, rows.Err()
}

type AdminOverview struct {
	OpenRounds          int                 `json:"openRounds"`
	IssuedTickets       int                 `json:"issuedTickets"`
	PendingPayments     int                 `json:"pendingPayments"`
	RefundRequired      int                 `json:"refundRequired"`
	Collections         []AdminCollection   `json:"collections"`
	TotalUsers          int                 `json:"totalUsers"`
	VerifiedUsers       int                 `json:"verifiedUsers"`
	TotalRounds         int                 `json:"totalRounds"`
	CompletedRounds     int                 `json:"completedRounds"`
	TotalRefundedOrders int                 `json:"totalRefundedOrders"`
	TotalDepositsCount  int                 `json:"totalDepositsCount"`
	DepositVolume       []AdminDepositTotal `json:"depositVolume"`
	SalesPaused         bool                `json:"salesPaused"`
	DepositsPaused      bool                `json:"depositsPaused"`
	RecoveryLocked      bool                `json:"recoveryLocked"`
	RecentOrders        []domain.Order      `json:"recentOrders"`
	RecentAudits        []AdminAuditItem    `json:"recentAudits"`
	AsOf                time.Time           `json:"asOf"`
}
type AdminCollection struct {
	Currency      string `json:"currency"`
	PaidMinor     int64  `json:"paidMinor"`
	RefundedMinor int64  `json:"refundedMinor"`
}
type AdminDepositTotal struct {
	Currency       string `json:"currency"`
	SucceededMinor int64  `json:"succeededMinor"`
	PendingMinor   int64  `json:"pendingMinor"`
}
type AdminAuditItem struct {
	ID        int64           `json:"id"`
	Actor     string          `json:"actor"`
	Action    string          `json:"action"`
	Resource  string          `json:"resource"`
	Details   json.RawMessage `json:"details"`
	CreatedAt time.Time       `json:"createdAt"`
}

func (s *Store) AdminOverview(ctx context.Context) (AdminOverview, error) {
	o := AdminOverview{
		Collections:   []AdminCollection{},
		DepositVolume: []AdminDepositTotal{},
		RecentOrders:  []domain.Order{},
		RecentAudits:  []AdminAuditItem{},
	}
	// One statement provides a consistent count snapshot. Expired open draws
	// are excluded even if their status has not been changed by an operator.
	err := s.DB.QueryRow(ctx, `SELECT
	 (SELECT count(*) FROM draws WHERE status='open' AND deadline>now()),
	 count(*) FILTER(WHERE status='paid' AND NOT refund_recorded),
	 count(*) FILTER(WHERE status IN ('pending','initializing')),
	 count(*) FILTER(WHERE status='refund_required' AND NOT refund_recorded),
	 count(*) FILTER(WHERE status='refunded' OR refund_recorded),
	 (SELECT count(*) FROM draws),
	 (SELECT count(*) FROM draws WHERE status='completed'),
	 (SELECT count(*) FROM deposits WHERE status='succeeded'),
	 now() FROM orders`).Scan(
		&o.OpenRounds,
		&o.IssuedTickets,
		&o.PendingPayments,
		&o.RefundRequired,
		&o.TotalRefundedOrders,
		&o.TotalRounds,
		&o.CompletedRounds,
		&o.TotalDepositsCount,
		&o.AsOf,
	)
	if err != nil {
		return o, err
	}

	// Operations control status
	_ = s.DB.QueryRow(ctx, `SELECT sales_paused, deposits_paused, recovery_locked FROM operations_control WHERE id=true`).Scan(
		&o.SalesPaused, &o.DepositsPaused, &o.RecoveryLocked,
	)

	// User counts (safe check for auth.user table created by Better-Auth)
	var hasUserTable bool
	_ = s.DB.QueryRow(ctx, `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema='auth' AND table_name='user')`).Scan(&hasUserTable)
	if hasUserTable {
		_ = s.DB.QueryRow(ctx, `SELECT count(*), count(*) FILTER(WHERE "emailVerified"=true) FROM auth."user"`).Scan(&o.TotalUsers, &o.VerifiedUsers)
	}

	// Collections by currency
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

	// Deposit volume by currency
	drows, err := s.DB.Query(ctx, `SELECT currency,
	 COALESCE(sum(amount_minor) FILTER(WHERE status='succeeded'),0)::bigint,
	 COALESCE(sum(amount_minor) FILTER(WHERE status IN ('pending','initializing')),0)::bigint
	 FROM deposits GROUP BY currency ORDER BY currency`)
	if err == nil {
		defer drows.Close()
		for drows.Next() {
			var dt AdminDepositTotal
			if err = drows.Scan(&dt.Currency, &dt.SucceededMinor, &dt.PendingMinor); err == nil {
				o.DepositVolume = append(o.DepositVolume, dt)
			}
		}
	}

	// 5 Most recent orders
	orders, err := s.Orders(ctx, "", 0, true)
	if err == nil {
		if len(orders) > 5 {
			o.RecentOrders = orders[:5]
		} else {
			o.RecentOrders = orders
		}
	}

	// 5 Most recent audits
	arows, err := s.DB.Query(ctx, `SELECT id, actor, action, resource, to_jsonb(details), created_at FROM audit_log ORDER BY id DESC LIMIT 5`)
	if err == nil {
		defer arows.Close()
		for arows.Next() {
			var item AdminAuditItem
			var details []byte
			if err = arows.Scan(&item.ID, &item.Actor, &item.Action, &item.Resource, &details, &item.CreatedAt); err == nil {
				item.Details = json.RawMessage(details)
				o.RecentAudits = append(o.RecentAudits, item)
			}
		}
	}

	return o, nil
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
