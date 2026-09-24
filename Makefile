.PHONY: help dev-up dev-down backend-run backend-migrate backend-test frontend-install frontend-run frontend-build auth-migrate test
help:
	@echo "Rimna — Go API, PostgreSQL, Better Auth and Sanity content"
	@echo "make dev-up          Start isolated development PostgreSQL and email inbox"
	@echo "make backend-migrate Apply operational database migrations (DATABASE_URL required)"
	@echo "make auth-migrate    Apply Better Auth migrations (frontend environment required)"
	@echo "make backend-run     Start API and payment worker (export backend environment first)"
	@echo "make frontend-run    Start website, account pages and Sanity Studio"
	@echo "make test            Run backend unit tests and frontend tests"
dev-up:
	docker compose up -d
dev-down:
	docker compose down
backend-run:
	cd backend && go run ./cmd/server
backend-migrate:
	cd backend && go run ./cmd/migrate
backend-test:
	cd backend && go test -race ./...
auth-migrate:
	cd frontend && npm run auth:migrate
frontend-install:
	cd frontend && npm ci
frontend-run:
	cd frontend && npm run dev
frontend-build:
	cd frontend && npm run build
test:
	cd backend && go test ./...
	cd frontend && npm test
