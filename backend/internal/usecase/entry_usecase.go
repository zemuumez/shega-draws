package usecase

import (
	"context"
	"fmt"
	"mime"
	"net/http"
	"time"

	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/shega-draws/backend/internal/domain"
	"github.com/shega-draws/backend/internal/repository"
)

const (
	maxProofSizeBytes = 5 * 1024 * 1024 // 5 MB
)

// allowedProofMIMETypes is the allowlist for uploaded payment proof images.
var allowedProofMIMETypes = map[string]bool{
	"image/jpeg": true,
	"image/png":  true,
	"image/webp": true,
}

// FileUploader defines the contract for S3-compatible file upload.
type FileUploader interface {
	Upload(ctx context.Context, key string, data []byte, contentType string) error
	PresignGetURL(ctx context.Context, key string) (string, error)
}

// EntryUseCase handles entry submission, confirmation, and rejection.
type EntryUseCase struct {
	entryRepo  repository.EntryRepository
	drawRepo   repository.DrawRepository
	uploader   FileUploader
}

// NewEntryUseCase constructs an EntryUseCase.
func NewEntryUseCase(
	entryRepo repository.EntryRepository,
	drawRepo repository.DrawRepository,
	uploader FileUploader,
) *EntryUseCase {
	return &EntryUseCase{
		entryRepo: entryRepo,
		drawRepo:  drawRepo,
		uploader:  uploader,
	}
}

// SubmitEntryInput holds all data for a new entry submission.
type SubmitEntryInput struct {
	UserID    uuid.UUID
	DrawID    uuid.UUID
	Number    string              `validate:"required,len=2"`
	Amount    int                 `validate:"required,gt=0"`
	Method    domain.PaymentMethod `validate:"required,oneof=telebirr cbebirr bank"`
	ProofData []byte              // Raw image bytes
	ProofName string              // Original filename
}

// SubmitEntry validates a new entry, uploads the proof image to S3, and persists the entry.
func (uc *EntryUseCase) SubmitEntry(ctx context.Context, input SubmitEntryInput) (*domain.Entry, error) {
	// 1. Validate draw is open
	draw, err := uc.drawRepo.FindByID(ctx, input.DrawID)
	if err != nil {
		return nil, domain.ErrDrawNotFound
	}
	if !draw.IsOpen() {
		return nil, domain.ErrDrawNotOpen
	}

	// 2. Validate proof image
	if len(input.ProofData) == 0 {
		return nil, domain.ErrProofRequired
	}
	if len(input.ProofData) > maxProofSizeBytes {
		return nil, domain.ErrProofTooLarge
	}
	// Detect MIME by file content (not trusting the Content-Type header)
	detectedMIME := http.DetectContentType(input.ProofData)
	parsedMIME, _, _ := mime.ParseMediaType(detectedMIME)
	if !allowedProofMIMETypes[parsedMIME] {
		return nil, domain.ErrProofInvalidType
	}

	// 3. Check number availability
	taken, err := uc.entryRepo.IsNumberTaken(ctx, input.DrawID, input.Number)
	if err != nil {
		return nil, fmt.Errorf("checking number: %w", err)
	}
	if taken {
		return nil, domain.ErrNumberTaken
	}

	// 4. Upload proof image to S3 with a UUID key (never trust user-provided filenames)
	proofKey := fmt.Sprintf("proofs/%s/%s/%s.jpg", input.DrawID, input.UserID, uuid.New().String())
	if err := uc.uploader.Upload(ctx, proofKey, input.ProofData, parsedMIME); err != nil {
		return nil, fmt.Errorf("uploading proof: %w", err)
	}

	// 5. Persist entry
	entry := &domain.Entry{
		ID:        uuid.New(),
		DrawID:    input.DrawID,
		UserID:    input.UserID,
		Number:    input.Number,
		Amount:    input.Amount,
		Method:    input.Method,
		ProofKey:  proofKey,
		Status:    domain.EntryStatusPending,
		CreatedAt: time.Now(),
	}

	created, err := uc.entryRepo.Create(ctx, entry)
	if err != nil {
		return nil, fmt.Errorf("persisting entry: %w", err)
	}

	log.Info().
		Str("entry_id", created.ID.String()).
		Str("number", created.Number).
		Str("draw_id", input.DrawID.String()).
		Msg("new entry submitted — awaiting payment confirmation")

	return created, nil
}

// GetMyEntries returns all entries for a player in a specific draw.
func (uc *EntryUseCase) GetMyEntries(ctx context.Context, userID, drawID uuid.UUID) ([]*domain.Entry, error) {
	return uc.entryRepo.FindByUserAndDraw(ctx, userID, drawID)
}

// ListAllEntries returns all entries (admin use) with optional filtering.
func (uc *EntryUseCase) ListAllEntries(ctx context.Context, filter repository.EntryFilter) ([]*domain.Entry, error) {
	entries, err := uc.entryRepo.FindAll(ctx, filter)
	if err != nil {
		return nil, err
	}

	// Attach pre-signed URLs for proof images so the admin can view them
	for _, e := range entries {
		url, _ := uc.uploader.PresignGetURL(ctx, e.ProofKey)
		e.ProofKey = url // Replace internal key with temporary signed URL
	}

	return entries, nil
}

// ConfirmEntry marks an entry as confirmed after payment verification.
func (uc *EntryUseCase) ConfirmEntry(ctx context.Context, entryID, adminID uuid.UUID) error {
	entry, err := uc.entryRepo.FindByID(ctx, entryID)
	if err != nil {
		return domain.ErrEntryNotFound
	}
	if entry.Status != domain.EntryStatusPending {
		return domain.ErrEntryAlreadyActed
	}

	if err := uc.entryRepo.Confirm(ctx, entryID, adminID); err != nil {
		return fmt.Errorf("confirming entry: %w", err)
	}

	meta := map[string]interface{}{"number": entry.Number, "draw_id": entry.DrawID.String()}
	_ = uc.entryRepo.LogAudit(ctx, adminID, "confirm_entry", &entryID, meta)

	log.Info().Str("entry_id", entryID.String()).Str("admin", adminID.String()).Msg("entry confirmed")
	return nil
}

// RejectEntry marks an entry as rejected.
func (uc *EntryUseCase) RejectEntry(ctx context.Context, entryID, adminID uuid.UUID) error {
	entry, err := uc.entryRepo.FindByID(ctx, entryID)
	if err != nil {
		return domain.ErrEntryNotFound
	}
	if entry.Status != domain.EntryStatusPending {
		return domain.ErrEntryAlreadyActed
	}

	if err := uc.entryRepo.Reject(ctx, entryID, adminID); err != nil {
		return fmt.Errorf("rejecting entry: %w", err)
	}

	meta := map[string]interface{}{"number": entry.Number, "draw_id": entry.DrawID.String()}
	_ = uc.entryRepo.LogAudit(ctx, adminID, "reject_entry", &entryID, meta)

	log.Info().Str("entry_id", entryID.String()).Str("admin", adminID.String()).Msg("entry rejected")
	return nil
}
