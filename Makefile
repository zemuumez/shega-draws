.PHONY: help frontend-install frontend-run frontend-build test
help:
	@echo "Rimna Lottery — Vercel + Sanity"
	@echo "make frontend-install  Install dependencies"
	@echo "make frontend-run      Start the website and Sanity Studio"
	@echo "make frontend-build    Build for production"
	@echo "make test              Check ticket submissions and exports"
frontend-install:
	cd frontend && npm install
frontend-run:
	cd frontend && npm run dev
frontend-build:
	cd frontend && npm run build
test:
	cd frontend && npm test
