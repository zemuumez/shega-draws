package store

import (
	"context"
	"encoding/json"
	"errors"
	"net/url"
	"regexp"
	"time"

	"github.com/jackc/pgx/v5"
	"rimna/backend/internal/domain"
)

var lotteryID = regexp.MustCompile(`^[A-Za-z0-9_-]{1,100}$`)

type TemplatesPage struct {
	Items   []domain.LotteryTemplate `json:"items"`
	HasMore bool                     `json:"hasMore"`
}
type RoundsPage struct {
	Items   []domain.AdminRound `json:"items"`
	HasMore bool                `json:"hasMore"`
}

func (s *Store) Templates(ctx context.Context, offset int) (TemplatesPage, error) {
	out := TemplatesPage{Items: []domain.LotteryTemplate{}}
	if offset < 0 || offset > 1000000 {
		return out, domain.ErrInvalid
	}
	rows, err := s.DB.Query(ctx, `SELECT id,settings,active,version FROM lottery_templates ORDER BY created_at DESC,id LIMIT 51 OFFSET $1`, offset)
	if err != nil {
		return out, err
	}
	defer rows.Close()
	for rows.Next() {
		var t domain.LotteryTemplate
		var raw []byte
		if err = rows.Scan(&t.ID, &raw, &t.Active, &t.Version); err != nil {
			return out, err
		}
		if err = json.Unmarshal(raw, &t.LotterySettings); err != nil {
			return out, err
		}
		out.Items = append(out.Items, t)
	}
	if len(out.Items) > 50 {
		out.HasMore = true
		out.Items = out.Items[:50]
	}
	return out, rows.Err()
}
func auditLottery(ctx context.Context, tx pgx.Tx, actor, action, id string, before, after any) error {
	details, err := json.Marshal(map[string]any{"before": before, "after": after})
	if err != nil {
		return err
	}
	_, err = tx.Exec(ctx, `INSERT INTO audit_log(actor,action,resource,details) VALUES($1,$2,$3,$4)`, actor, action, id, details)
	return err
}
func (s *Store) SaveTemplate(ctx context.Context, actor string, t domain.LotteryTemplate) error {
	if t.Rules.Deductions == nil {
		t.Rules.Deductions = []domain.Deduction{}
	}
	if !lotteryID.MatchString(t.ID) || t.Version < 0 || !t.LotterySettings.Valid() {
		return domain.ErrInvalid
	}
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	var before any
	raw, _ := json.Marshal(t.LotterySettings)
	if t.Version == 0 {
		_, err = tx.Exec(ctx, `INSERT INTO lottery_templates(id,settings,active) VALUES($1,$2,$3)`, t.ID, raw, t.Active)
	} else {
		var old domain.LotteryTemplate
		var data []byte
		err = tx.QueryRow(ctx, `SELECT id,settings,active,version FROM lottery_templates WHERE id=$1 FOR UPDATE`, t.ID).Scan(&old.ID, &data, &old.Active, &old.Version)
		if err != nil {
			return dbError(err)
		}
		if old.Version != t.Version {
			return domain.ErrConflict
		}
		if err = json.Unmarshal(data, &old.LotterySettings); err != nil {
			return err
		}
		before = old
		_, err = tx.Exec(ctx, `UPDATE lottery_templates SET settings=$2,active=$3,version=version+1 WHERE id=$1`, t.ID, raw, t.Active)
	}
	if err != nil {
		return dbError(err)
	}
	t.Version++
	if err = auditLottery(ctx, tx, actor, "template.save", t.ID, before, t); err != nil {
		return err
	}
	return tx.Commit(ctx)
}

const roundColumns = `d.id,d.title,d.currency,d.price_minor,d.capacity,d.status,d.deadline,d.live_video_url,COALESCE(d.template_id,''),COALESCE(d.template_version,0),d.version,d.rules,d.sales_started_at,d.sales_closed_at`

func scanRound(row pgx.Row) (domain.AdminRound, error) {
	var d domain.AdminRound
	var raw []byte
	err := row.Scan(&d.ID, &d.Title, &d.Currency, &d.PriceMinor, &d.Capacity, &d.Status, &d.Deadline, &d.LiveVideoURL, &d.TemplateID, &d.TemplateVersion, &d.Version, &raw, &d.StartedAt, &d.ClosedAt)
	if err != nil {
		return d, dbError(err)
	}
	if len(raw) > 0 {
		err = json.Unmarshal(raw, &d.Rules)
	}
	return d, err
}
func (s *Store) Rounds(ctx context.Context, offset int) (RoundsPage, error) {
	out := RoundsPage{Items: []domain.AdminRound{}}
	if offset < 0 || offset > 1000000 {
		return out, domain.ErrInvalid
	}
	// Page first, aggregate only those rounds. One statement gives a consistent
	// sold/held snapshot; customer identities never leave this query.
	rows, err := s.DB.Query(ctx, `SELECT `+roundColumns+`,
 COALESCE(o.sold,0),COALESCE(o.occupied,0),COALESCE(o.gross,0),clock_timestamp()
 FROM (SELECT * FROM draws ORDER BY created_at DESC,id LIMIT 51 OFFSET $1) d
 LEFT JOIN LATERAL(SELECT count(*) FILTER(WHERE status='paid' AND NOT refund_recorded) sold,
 count(*) FILTER(WHERE status IN ('paid','legacy_pending') OR (status IN ('initializing','pending') AND expires_at>now())) occupied,
 sum(amount_minor) FILTER(WHERE status='paid' AND NOT refund_recorded) gross FROM orders WHERE draw_id=d.id) o ON true
 ORDER BY d.created_at DESC,d.id`, offset)
	if err != nil {
		return out, err
	}
	defer rows.Close()
	for rows.Next() {
		var d domain.AdminRound
		var raw []byte
		var gross int64
		var now time.Time
		err = rows.Scan(&d.ID, &d.Title, &d.Currency, &d.PriceMinor, &d.Capacity, &d.Status, &d.Deadline, &d.LiveVideoURL, &d.TemplateID, &d.TemplateVersion, &d.Version, &raw, &d.StartedAt, &d.ClosedAt, &d.Sold, &d.Occupied, &gross, &now)
		if err != nil {
			return out, err
		}
		if len(raw) > 0 {
			if err = json.Unmarshal(raw, &d.Rules); err != nil {
				return out, err
			}
		}
		d.State = roundState(d, now)
		d.Remaining = d.Capacity - d.Occupied
		if d.Rules != nil && d.Rules.Valid() {
			current, max := d.Rules.Net(gross), d.Rules.Net(int64(d.Capacity)*d.PriceMinor)
			d.CurrentNetMinor = &current
			d.MaximumNetMinor = &max
		}
		out.Items = append(out.Items, d)
	}
	if len(out.Items) > 50 {
		out.HasMore = true
		out.Items = out.Items[:50]
	}
	return out, rows.Err()
}
func roundState(d domain.AdminRound, now time.Time) string {
	if d.Status == "completed" {
		return "completed"
	}
	if d.ClosedAt != nil || !d.Deadline.After(now) {
		return "closed"
	}
	if d.Status == "open" {
		return "open"
	}
	if d.StartedAt != nil {
		return "paused"
	}
	return "draft"
}
func validBroadcast(value string) bool {
	if value == "" {
		return true
	}
	u, e := url.Parse(value)
	return len(value) <= 2000 && e == nil && u.Scheme == "https" && u.Host != "" && u.User == nil
}
func (s *Store) SaveRound(ctx context.Context, actor, id string, c domain.RoundCommand) error {
	if c.Rules.Deductions == nil {
		c.Rules.Deductions = []domain.Deduction{}
	}
	if !lotteryID.MatchString(id) || c.Version < 0 {
		return domain.ErrInvalid
	}
	if c.Action != "save" && c.Action != "open" && c.Action != "pause" && c.Action != "close" {
		return domain.ErrInvalid
	}
	if c.Action == "save" && (!c.LotterySettings.Valid() || c.Deadline.IsZero() || !validBroadcast(c.LiveVideoURL)) {
		return domain.ErrInvalid
	}
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	// Row locks also serialize against Reserve's shared round lock. No network
	// call is made while locked. Version prevents stale staff forms overwriting.
	old, err := scanRound(tx.QueryRow(ctx, `SELECT `+roundColumns+` FROM draws d WHERE id=$1 FOR UPDATE`, id))
	create := errors.Is(err, domain.ErrNotFound)
	if err != nil && !create {
		return err
	}
	var now time.Time
	if err = tx.QueryRow(ctx, `SELECT clock_timestamp()`).Scan(&now); err != nil {
		return err
	}
	if create {
		if c.Version != 0 || c.Action != "save" || !lotteryID.MatchString(c.TemplateID) || !c.Deadline.After(now) {
			return domain.ErrInvalid
		}
		var active bool
		var v int
		if err = tx.QueryRow(ctx, `SELECT active,version FROM lottery_templates WHERE id=$1 FOR SHARE`, c.TemplateID).Scan(&active, &v); err != nil {
			return dbError(err)
		}
		if !active || v != c.TemplateVersion {
			return domain.ErrConflict
		}
		raw, _ := json.Marshal(c.Rules)
		_, err = tx.Exec(ctx, `INSERT INTO draws(id,title,currency,price_minor,capacity,status,deadline,live_video_url,template_id,template_version,rules) VALUES($1,$2,$3,$4,$5,'closed',$6,$7,$8,$9,$10)`, id, c.Title, c.Currency, c.PriceMinor, c.Capacity, c.Deadline, c.LiveVideoURL, c.TemplateID, v, raw)
	} else {
		if old.Version != c.Version {
			return domain.ErrConflict
		}
		state := roundState(old, now)
		switch c.Action {
		case "save":
			if old.StartedAt != nil || old.ClosedAt != nil || old.Status != "closed" || old.TemplateID == "" || c.TemplateID != old.TemplateID || !c.Deadline.After(now) {
				return domain.ErrConflict
			}
			raw, _ := json.Marshal(c.Rules)
			_, err = tx.Exec(ctx, `UPDATE draws SET title=$2,currency=$3,price_minor=$4,capacity=$5,deadline=$6,live_video_url=$7,rules=$8,version=version+1 WHERE id=$1`, id, c.Title, c.Currency, c.PriceMinor, c.Capacity, c.Deadline, c.LiveVideoURL, raw)
		case "open":
			// Historical rounds may resume their existing sale, but missing financial
			// rules cannot authorize a new historical draft.
			if (state != "draft" && state != "paused") || (old.TemplateID != "" && (old.Rules == nil || !old.Rules.Valid())) || (old.TemplateID == "" && state != "paused") {
				return domain.ErrConflict
			}
			_, err = tx.Exec(ctx, `UPDATE draws SET status='open',sales_started_at=COALESCE(sales_started_at,clock_timestamp()),version=version+1 WHERE id=$1`, id)
		case "pause":
			if state != "open" {
				return domain.ErrConflict
			}
			_, err = tx.Exec(ctx, `UPDATE draws SET status='closed',sales_started_at=COALESCE(sales_started_at,created_at),version=version+1 WHERE id=$1`, id)
		case "close":
			if old.Status == "completed" || old.ClosedAt != nil {
				return domain.ErrConflict
			}
			_, err = tx.Exec(ctx, `UPDATE draws SET status='closed',sales_closed_at=clock_timestamp(),version=version+1 WHERE id=$1`, id)
		}
	}
	if err != nil {
		return dbError(err)
	}
	after, err := scanRound(tx.QueryRow(ctx, `SELECT `+roundColumns+` FROM draws d WHERE id=$1`, id))
	if err != nil {
		return err
	}
	var before any
	if !create {
		before = old
	}
	if err = auditLottery(ctx, tx, actor, "round."+c.Action, id, before, after); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
