.PHONY: help dev-up dev-down backend-run frontend-run migrate keys

# ── Help ──────────────────────────────────────────────────────────────
help:
	@echo ""
	@echo "Shega Draws — development commands"
	@echo "═══════════════════════════════════"
	@echo "  make dev-up        Start PostgreSQL, Redis, MinIO (Docker)"
	@echo "  make dev-down      Stop and remove containers"
	@echo "  make migrate       Run database migrations"
	@echo "  make backend-run   Run the Go API server"
	@echo "  make frontend-run  Run the Next.js dev server"
	@echo "  make keys          Generate RS256 JWT key pair"
	@echo ""

# ── Docker ────────────────────────────────────────────────────────────
dev-up:
	docker compose up -d
	@echo "Waiting for PostgreSQL to be ready..."
	@until docker compose exec -T postgres pg_isready -U shega >/dev/null 2>&1; do sleep 1; done
	@echo "PostgreSQL ready."

dev-down:
	docker compose down

# ── Database migrations ──────────────────────────────────────────────
migrate:
	@for f in backend/migrations/*.sql; do \
		echo "Applying $$f..."; \
		docker compose exec -T postgres psql -U shega -d shega_draws < $$f; \
	done
	@echo "Migrations complete."

# ── Keys ─────────────────────────────────────────────────────────────
KEYS_DIR := backend/keys
keys:
	mkdir -p $(KEYS_DIR)
	openssl genrsa -out $(KEYS_DIR)/private.pem 4096
	openssl rsa -in $(KEYS_DIR)/private.pem -pubout -out $(KEYS_DIR)/public.pem
	@echo "Generated $(KEYS_DIR)/private.pem and $(KEYS_DIR)/public.pem"
	@echo "⚠️  Add the keys/ directory to .gitignore!"

# ── Backend ──────────────────────────────────────────────────────────
backend-run:
	cd backend && go run ./cmd/server

backend-build:
	cd backend && go build -o bin/server ./cmd/server

backend-test:
	cd backend && go test ./...

# ── Frontend ─────────────────────────────────────────────────────────
frontend-install:
	cd frontend && npm install

frontend-run:
	cd frontend && npm run dev

frontend-build:
	cd frontend && npm run build
