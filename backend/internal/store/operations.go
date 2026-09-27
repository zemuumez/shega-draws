package store

import (
	"context"
	"rimna/backend/internal/domain"
	"strings"
	"time"
)

type Operations struct {
	SalesPaused     bool        `json:"salesPaused"`
	RecoveryLocked  bool        `json:"recoveryLocked"`
	Reason          string      `json:"reason"`
	UpdatedAt       time.Time   `json:"updatedAt"`
	PendingPayments int         `json:"pendingPayments"`
	RefundRequired  int         `json:"refundRequired"`
	WorkerLastSeen  *time.Time  `json:"workerLastSeen"`
	Backups         []BackupJob `json:"backups"`
}
type BackupJob struct {
	ID          string     `json:"id"`
	Status      string     `json:"status"`
	RequestedAt time.Time  `json:"requestedAt"`
	FinishedAt  *time.Time `json:"finishedAt"`
	SnapshotID  string     `json:"snapshotId"`
	Message     string     `json:"message"`
}

func (s *Store) Operations(ctx context.Context) (Operations, error) {
	var o Operations
	err := s.DB.QueryRow(ctx, `SELECT sales_paused,recovery_locked,reason,updated_at FROM operations_control WHERE id=true`).Scan(&o.SalesPaused, &o.RecoveryLocked, &o.Reason, &o.UpdatedAt)
	if err != nil {
		return o, err
	}
	err = s.DB.QueryRow(ctx, `SELECT count(*) FILTER (WHERE status IN ('initializing','pending')),count(*) FILTER (WHERE status='refund_required' AND NOT refund_recorded) FROM orders`).Scan(&o.PendingPayments, &o.RefundRequired)
	if err != nil {
		return o, err
	}
	if err = s.DB.QueryRow(ctx, `SELECT max(seen_at) FROM worker_heartbeats`).Scan(&o.WorkerLastSeen); err != nil {
		return o, err
	}
	rows, err := s.DB.Query(ctx, `SELECT id,status,requested_at,finished_at,snapshot_id,message FROM backup_jobs ORDER BY requested_at DESC LIMIT 20`)
	if err != nil {
		return o, err
	}
	defer rows.Close()
	o.Backups = []BackupJob{}
	for rows.Next() {
		var j BackupJob
		if err = rows.Scan(&j.ID, &j.Status, &j.RequestedAt, &j.FinishedAt, &j.SnapshotID, &j.Message); err != nil {
			return o, err
		}
		o.Backups = append(o.Backups, j)
	}
	return o, rows.Err()
}

// All reservation transactions hold a shared lock on this row. Once pause
// commits, no new reservation can pass it on any API host. Existing payments
// continue to reconcile; an already committed hold can still finish checkout.
func (s *Store) SetSalesPaused(ctx context.Context, actor string, paused bool, reason string) error {
	reason = strings.TrimSpace(reason)
	if len(reason) < 5 || len(reason) > 500 {
		return domain.ErrInvalid
	}
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	tag, err := tx.Exec(ctx, `UPDATE operations_control SET sales_paused=$1,reason=$2,updated_at=now(),updated_by=$3 WHERE id=true AND (NOT recovery_locked OR $1)`, paused, reason, actor)
	if err != nil {
		return err
	}
	if tag.RowsAffected() != 1 {
		return domain.ErrConflict
	}
	action := "sales.resume"
	if paused {
		action = "sales.pause"
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_log(actor,action,resource) VALUES($1,$2,$3)`, actor, action, reason); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Store) RequestBackup(ctx context.Context, actor, id string) error {
	tx, err := s.DB.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)
	if _, err = tx.Exec(ctx, `INSERT INTO backup_jobs(id,requested_by) VALUES($1,$2)`, id, actor); err != nil {
		return dbError(err)
	}
	if _, err = tx.Exec(ctx, `INSERT INTO audit_log(actor,action,resource) VALUES($1,'backup.request',$2)`, actor, id); err != nil {
		return err
	}
	return tx.Commit(ctx)
}
func (s *Store) WorkerEnabled(ctx context.Context, id string) (bool, error) {
	var locked bool
	if err := s.DB.QueryRow(ctx, `SELECT recovery_locked FROM operations_control WHERE id=true`).Scan(&locked); err != nil {
		return false, err
	}
	if locked {
		return false, nil
	}
	_, err := s.DB.Exec(ctx, `INSERT INTO worker_heartbeats(id) VALUES($1) ON CONFLICT(id) DO UPDATE SET seen_at=now()`, id)
	return err == nil, err
}
