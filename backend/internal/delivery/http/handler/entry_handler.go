package handler

import (
	"io"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/shega-draws/backend/internal/delivery/http/middleware"
	"github.com/shega-draws/backend/internal/domain"
	"github.com/shega-draws/backend/internal/repository"
	"github.com/shega-draws/backend/internal/usecase"
)

const maxMultipartMemory = 6 * 1024 * 1024 // 6 MB in-memory buffer

// EntryHandler handles entry submission and management.
type EntryHandler struct {
	entryUC *usecase.EntryUseCase
}

// NewEntryHandler constructs an EntryHandler.
func NewEntryHandler(entryUC *usecase.EntryUseCase) *EntryHandler {
	return &EntryHandler{entryUC: entryUC}
}

// SubmitEntry handles POST /api/v1/entries — player only (multipart/form-data)
func (h *EntryHandler) SubmitEntry(w http.ResponseWriter, r *http.Request) {
	// Parse multipart form (max 6 MB in memory)
	if err := r.ParseMultipartForm(maxMultipartMemory); err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid multipart form"})
		return
	}

	claims, _ := middleware.ClaimsFromContext(r.Context())
	userID, _ := uuid.Parse(claims.UserID)

	drawIDStr := r.FormValue("draw_id")
	drawID, err := uuid.Parse(drawIDStr)
	if err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid draw_id"})
		return
	}

	number := r.FormValue("number")
	method := domain.PaymentMethod(r.FormValue("method"))
	amountStr := r.FormValue("amount")
	var amount int
	if _, err := parseInt(amountStr, &amount); err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid amount"})
		return
	}

	// Extract proof image
	file, header, err := r.FormFile("proof")
	if err != nil {
		respondError(w, domain.ErrProofRequired)
		return
	}
	defer file.Close()

	proofData, err := io.ReadAll(io.LimitReader(file, 6*1024*1024))
	if err != nil {
		respond(w, http.StatusInternalServerError, map[string]string{"error": "reading proof file"})
		return
	}

	input := usecase.SubmitEntryInput{
		UserID:    userID,
		DrawID:    drawID,
		Number:    number,
		Amount:    amount,
		Method:    method,
		ProofData: proofData,
		ProofName: header.Filename,
	}

	entry, err := h.entryUC.SubmitEntry(r.Context(), input)
	if err != nil {
		respondError(w, err)
		return
	}
	respond(w, http.StatusCreated, entry)
}

// GetMyEntries handles GET /api/v1/entries/mine — player
func (h *EntryHandler) GetMyEntries(w http.ResponseWriter, r *http.Request) {
	claims, _ := middleware.ClaimsFromContext(r.Context())
	userID, _ := uuid.Parse(claims.UserID)

	drawIDStr := r.URL.Query().Get("draw_id")
	drawID, err := uuid.Parse(drawIDStr)
	if err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "draw_id query param required"})
		return
	}

	entries, err := h.entryUC.GetMyEntries(r.Context(), userID, drawID)
	if err != nil {
		respondError(w, err)
		return
	}
	respond(w, http.StatusOK, entries)
}

// ListEntries handles GET /api/v1/entries — admin (with optional status filter)
func (h *EntryHandler) ListEntries(w http.ResponseWriter, r *http.Request) {
	filter := repository.EntryFilter{}

	if drawIDStr := r.URL.Query().Get("draw_id"); drawIDStr != "" {
		id, err := uuid.Parse(drawIDStr)
		if err == nil {
			filter.DrawID = &id
		}
	}
	if statusStr := r.URL.Query().Get("status"); statusStr != "" {
		s := domain.EntryStatus(statusStr)
		filter.Status = &s
	}

	entries, err := h.entryUC.ListAllEntries(r.Context(), filter)
	if err != nil {
		respondError(w, err)
		return
	}
	respond(w, http.StatusOK, entries)
}

// ConfirmEntry handles POST /api/v1/entries/{entryID}/confirm — admin
func (h *EntryHandler) ConfirmEntry(w http.ResponseWriter, r *http.Request) {
	entryID, err := uuid.Parse(chi.URLParam(r, "entryID"))
	if err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid entry ID"})
		return
	}

	claims, _ := middleware.ClaimsFromContext(r.Context())
	adminID, _ := uuid.Parse(claims.UserID)

	if err := h.entryUC.ConfirmEntry(r.Context(), entryID, adminID); err != nil {
		respondError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]string{"message": "entry confirmed"})
}

// RejectEntry handles POST /api/v1/entries/{entryID}/reject — admin
func (h *EntryHandler) RejectEntry(w http.ResponseWriter, r *http.Request) {
	entryID, err := uuid.Parse(chi.URLParam(r, "entryID"))
	if err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid entry ID"})
		return
	}

	claims, _ := middleware.ClaimsFromContext(r.Context())
	adminID, _ := uuid.Parse(claims.UserID)

	if err := h.entryUC.RejectEntry(r.Context(), entryID, adminID); err != nil {
		respondError(w, err)
		return
	}
	respond(w, http.StatusOK, map[string]string{"message": "entry rejected"})
}

func parseInt(s string, out *int) (bool, error) {
	if s == "" {
		return false, nil
	}
	n := 0
	for _, c := range s {
		if c < '0' || c > '9' {
			return false, errToUnauthorized("non-numeric amount")
		}
		n = n*10 + int(c-'0')
	}
	*out = n
	return true, nil
}
