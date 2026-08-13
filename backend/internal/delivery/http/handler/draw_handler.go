package handler

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/shega-draws/backend/internal/delivery/http/middleware"
	"github.com/shega-draws/backend/internal/usecase"
)

// DrawHandler handles draw lifecycle routes.
type DrawHandler struct {
	drawUC *usecase.DrawUseCase
}

// NewDrawHandler constructs a DrawHandler.
func NewDrawHandler(drawUC *usecase.DrawUseCase) *DrawHandler {
	return &DrawHandler{drawUC: drawUC}
}

// GetActiveDraw handles GET /api/v1/draws/active — public
func (h *DrawHandler) GetActiveDraw(w http.ResponseWriter, r *http.Request) {
	draw, err := h.drawUC.GetActiveDraw(r.Context())
	if err != nil {
		respondError(w, err)
		return
	}
	respond(w, http.StatusOK, draw)
}

// CreateDraw handles POST /api/v1/draws — superadmin only
func (h *DrawHandler) CreateDraw(w http.ResponseWriter, r *http.Request) {
	var input usecase.CreateDrawInput
	if !decodeJSON(w, r, &input) {
		return
	}

	claims, _ := middleware.ClaimsFromContext(r.Context())
	actorID, _ := uuid.Parse(claims.UserID)

	draw, err := h.drawUC.CreateDraw(r.Context(), input, actorID)
	if err != nil {
		respondError(w, err)
		return
	}
	respond(w, http.StatusCreated, draw)
}

// CloseEntries handles POST /api/v1/draws/{drawID}/close — admin+
func (h *DrawHandler) CloseEntries(w http.ResponseWriter, r *http.Request) {
	drawID, err := uuid.Parse(chi.URLParam(r, "drawID"))
	if err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid draw ID"})
		return
	}

	claims, _ := middleware.ClaimsFromContext(r.Context())
	actorID, _ := uuid.Parse(claims.UserID)

	draw, err := h.drawUC.CloseEntries(r.Context(), drawID, actorID)
	if err != nil {
		respondError(w, err)
		return
	}
	respond(w, http.StatusOK, draw)
}

// RevealDraw handles POST /api/v1/draws/{drawID}/reveal — admin+
func (h *DrawHandler) RevealDraw(w http.ResponseWriter, r *http.Request) {
	drawID, err := uuid.Parse(chi.URLParam(r, "drawID"))
	if err != nil {
		respond(w, http.StatusBadRequest, map[string]string{"error": "invalid draw ID"})
		return
	}

	claims, _ := middleware.ClaimsFromContext(r.Context())
	actorID, _ := uuid.Parse(claims.UserID)

	draw, err := h.drawUC.RevealDraw(r.Context(), drawID, actorID)
	if err != nil {
		respondError(w, err)
		return
	}
	respond(w, http.StatusOK, draw)
}
