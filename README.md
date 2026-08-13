<div align="center">

# 🎟️ Shega Draws

**A transparent, cryptographically verifiable digital lottery platform built for trust.**

Pick a number · Pay · Wait for draw day · Verify the result yourself.

[![Go](https://img.shields.io/badge/Go-1.22-00ADD8?logo=go&logoColor=white)](https://go.dev)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Sanity](https://img.shields.io/badge/Sanity-CMS-F03E2F?logo=sanity)](https://sanity.io)

</div>

---

## What is Shega Draws?

Shega Draws is a **digital raffle platform** — like a community lottery, but everything runs on a phone or website, and the outcome is cryptographically provable. Players sign up, pick a number (00–99), pay by Telebirr or bank transfer, and wait for draw day. Organizers confirm payments, run the draw, and publish the results — all through a secure admin dashboard.

The core promise is **trustless fairness**: the winning numbers are derived from a secret seed that is committed (via SHA-256) *before* any entries close. The seed is only revealed on draw day. Anyone can verify the result using the published seed in their browser — no server involved.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Tech Stack](#tech-stack)
- [Security Model](#security-model)
- [Fairness Protocol](#fairness-protocol)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [1. Clone & Setup](#1-clone--setup)
  - [2. Generate JWT Keys](#2-generate-jwt-keys)
  - [3. Configure Environment](#3-configure-environment)
  - [4. Start Infrastructure](#4-start-infrastructure)
  - [5. Run Database Migrations](#5-run-database-migrations)
  - [6. Start the Servers](#6-start-the-servers)
- [Backend Reference](#backend-reference)
  - [Clean Architecture Layers](#clean-architecture-layers)
  - [API Endpoints](#api-endpoints)
  - [Database Schema](#database-schema)
- [Frontend Reference](#frontend-reference)
  - [Pages](#pages)
  - [Component Library](#component-library)
  - [Content Management (Sanity)](#content-management-sanity)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [Contributing](#contributing)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Browser / App                       │
│              Next.js 14 (App Router, ISR)                │
└────────────────────────┬────────────────────────────────┘
                         │ HTTPS / REST
          ┌──────────────┼──────────────┐
          │              │              │
    ┌─────▼─────┐  ┌─────▼─────┐  ┌───▼──────┐
    │  Go API   │  │  Sanity   │  │  MinIO   │
    │  :8080    │  │   CMS     │  │  / S3    │
    └─────┬─────┘  └───────────┘  └──────────┘
          │
    ┌─────▼──────────────┐
    │   PostgreSQL :5432  │  ← draws, users, entries, audit_log
    └─────────────────────┘
    ┌─────────────────────┐
    │    Redis :6379       │  ← JWT blocklist, rate limiting
    └─────────────────────┘
```

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|---|---|---|
| **Go** | 1.22+ | API server language |
| **Chi** | v5 | HTTP router (lightweight, idiomatic) |
| **pgx/v5** | v5 | PostgreSQL driver (connection pooling) |
| **go-redis/v9** | v9 | Redis client (rate limiting, token store) |
| **golang-jwt/jwt** | v5 | RS256 JWT access tokens |
| **aws-sdk-go-v2/s3** | v2 | Payment proof image storage (S3/MinIO) |
| **zerolog** | v1 | Structured JSON logging |
| **go-playground/validator** | v10 | Request body validation |
| **PostgreSQL** | 16 | Primary database |
| **Redis** | 7 | Rate limiting + JWT blocklist |
| **MinIO** | latest | S3-compatible object storage (dev) |

### Frontend

| Technology | Version | Purpose |
|---|---|---|
| **Next.js** | 14.x | React framework (App Router, ISR) |
| **TypeScript** | 5.x | Type safety throughout |
| **Sanity** | v3 | Headless CMS (prizes, draw titles, accounts) |
| **Lucide React** | latest | Icon library |
| **Web Crypto API** | native | SHA-256 client-side fairness verification |
| **Vanilla CSS** | — | Design system (no Tailwind, full control) |

### Infrastructure

| Service | Purpose |
|---|---|
| **Docker Compose** | Local dev stack (PostgreSQL, Redis, MinIO) |
| **MinIO** | S3-compatible object storage for local dev |
| **Nginx / Caddy** | Reverse proxy + TLS termination (production) |

---

## Security Model

Shega Draws implements **8 independent security layers**:

| Layer | Implementation |
|---|---|
| **1. TLS** | Enforced at reverse proxy (Nginx/Caddy). HSTS header: `max-age=63072000; includeSubDomains; preload` |
| **2. Rate Limiting** | Redis sliding-window: Global (100/min), Auth (5/15min), Entry submit (3/10min) |
| **3. RS256 JWT** | Asymmetric keys — 4096-bit RSA. Access token: 15m. Refresh token: 7d, rotated on each use |
| **4. httpOnly Cookies** | Refresh token stored in `httpOnly; Secure; SameSite=Strict` cookie — inaccessible to JavaScript |
| **5. RBAC** | `player < admin < superadmin` — enforced via composable Chi middleware on every route |
| **6. File Validation** | `http.DetectContentType` reads raw bytes to verify MIME type — ignores the `Content-Type` header |
| **7. Security Headers** | CSP, X-Frame-Options: DENY, X-Content-Type-Options: nosniff, Referrer-Policy on every response |
| **8. Audit Log** | Append-only Postgres table — `REVOKE UPDATE, DELETE ON audit_log` at the database level |

---

## Fairness Protocol

Shega Draws uses a **commit-reveal scheme** so players can independently verify the draw outcome:

```
Before entries close:
  seed = crypto/rand.Read(32 bytes)
  commitment = SHA-256(seed)   ← published publicly

On draw day:
  winning_number(rank) = parseInt( SHA256(seed + ":" + drawID + ":" + rank)[0:8], 16 ) % 100
  seed is revealed publicly

Player verification (client-side, Results page):
  1. SHA-256(revealed_seed) must match the published commitment
  2. Winning numbers are re-derived from the seed — no server involved
```

The verification runs entirely in the browser using the **Web Crypto API** (`window.crypto.subtle.digest`). No trust in the server is required.

---

## Project Structure

```
lottery-game/
├── Makefile                    # All dev commands
├── docker-compose.yml          # PostgreSQL + Redis + MinIO
├── .env.example                # Environment variable template
│
├── backend/
│   ├── cmd/server/main.go      # Entrypoint — wires everything together
│   ├── config/config.go        # Typed env config via envconfig
│   ├── migrations/             # SQL migration files (run in order)
│   │   ├── 001_create_users.sql
│   │   ├── 002_create_draws.sql
│   │   ├── 003_create_entries.sql
│   │   └── 004_audit_log.sql
│   ├── internal/
│   │   ├── domain/             # Pure entities — no imports from other layers
│   │   │   ├── user.go
│   │   │   ├── draw.go
│   │   │   ├── entry.go
│   │   │   └── errors.go       # Sentinel errors
│   │   ├── repository/         # Interface contracts (ports)
│   │   ├── usecase/            # Business logic (adapters)
│   │   │   ├── auth_usecase.go
│   │   │   ├── draw_usecase.go
│   │   │   └── entry_usecase.go
│   │   ├── infrastructure/     # Implementations (driven adapters)
│   │   │   ├── postgres/       # pgx/v5 repository implementations
│   │   │   ├── redis/          # Token store + rate limiter
│   │   │   └── storage/        # S3/MinIO uploader
│   │   └── delivery/http/      # HTTP layer
│   │       ├── handler/        # Request/response handlers
│   │       ├── middleware/      # Auth, CORS, logging, rate limit
│   │       └── server.go       # Chi router assembly
│   └── pkg/
│       ├── crypto/fairness.go  # Commit-reveal seed derivation
│       ├── jwt/jwt.go          # RS256 token manager
│       ├── logger/logger.go    # zerolog structured logger
│       └── validator/          # go-playground/validator wrapper
│
└── frontend/
    ├── app/                    # Next.js App Router pages
    │   ├── layout.tsx          # Root layout + Nav + metadata
    │   ├── page.tsx            # Home — current draw, prizes, countdown
    │   ├── enter/page.tsx      # 4-step entry wizard
    │   ├── entries/page.tsx    # My entries + ticket status
    │   ├── results/page.tsx    # Draw results + fairness verifier
    │   └── admin/
    │       ├── login/page.tsx  # Admin login
    │       └── dashboard/page.tsx  # Entry management + draw controls
    ├── components/
    │   ├── ui/                 # Base primitives
    │   │   ├── Button.tsx      # 5 variants, loading state
    │   │   ├── Badge.tsx       # Status/tone badges
    │   │   ├── Card.tsx        # Glass or solid card
    │   │   └── Input.tsx       # Accessible label + error + hint
    │   ├── Nav.tsx             # Responsive nav (top bar desktop, tab bar mobile)
    │   ├── CountdownTimer.tsx  # Live countdown to entry deadline
    │   ├── NumberPicker.tsx    # Wheel + grid number selector
    │   ├── PrizeTable.tsx      # Animated prize rankings
    │   ├── PaymentProofUploader.tsx  # Drag-and-drop image uploader
    │   ├── EntryTicket.tsx     # Perforated ticket card with status
    │   └── ResultsVerifier.tsx # Client-side SHA-256 commitment verifier
    ├── lib/
    │   ├── api.ts              # Typed API client with auto token refresh
    │   └── sanity/
    │       ├── client.ts       # Lazy Sanity singleton
    │       └── queries.ts      # GROQ query definitions + types
    ├── styles/globals.css      # Full design system (tokens, components, animations)
    ├── next.config.mjs         # Security headers, image domains
    └── tsconfig.json           # Strict TypeScript + @/ path alias
```

---

## Getting Started

### Prerequisites

- [Go 1.22+](https://go.dev/dl/)
- [Node.js 20+](https://nodejs.org/) and npm
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for PostgreSQL, Redis, MinIO)
- [OpenSSL](https://www.openssl.org/) (pre-installed on macOS/Linux)

---

### 1. Clone & Setup

```bash
git clone https://github.com/your-org/lottery-game.git
cd lottery-game
```

---

### 2. Generate JWT Keys

RS256 requires an asymmetric key pair. **Never commit these.**

```bash
make keys
# Creates backend/keys/private.pem and backend/keys/public.pem
# backend/keys/ is already in .gitignore
```

---

### 3. Configure Environment

```bash
# Backend
cp .env.example .env
# Edit .env — fill in DB password, S3 bucket name, etc.

# Frontend
cp frontend/.env.local frontend/.env.local
# Edit — set NEXT_PUBLIC_SANITY_PROJECT_ID (optional, see CMS section)
```

Key variables to set in `.env`:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=shega
DB_PASSWORD=your_strong_password_here
DB_NAME=shega_draws

# JWT (paths to the keys you generated in step 2)
JWT_PRIVATE_KEY_PATH=./keys/private.pem
JWT_PUBLIC_KEY_PATH=./keys/public.pem

# S3 / MinIO (for local dev, leave as-is)
S3_ENDPOINT=http://localhost:9000
S3_BUCKET=shega-draws
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin

# CORS (comma-separated)
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
```

---

### 4. Start Infrastructure

```bash
make dev-up
# Starts PostgreSQL :5432, Redis :6379, MinIO :9000
# Waits for PostgreSQL to be ready automatically
```

**MinIO console** is available at [http://localhost:9001](http://localhost:9001)  
Login: `minioadmin` / `minioadmin` → create a bucket named `shega-draws`.

---

### 5. Run Database Migrations

```bash
make migrate
# Applies all 4 SQL migrations in order
```

---

### 6. Start the Servers

Open **two terminal tabs**:

```bash
# Terminal 1 — Go API
make backend-run
# → http://localhost:8080

# Terminal 2 — Next.js
make frontend-run
# → http://localhost:3000
```

The app is now running. Open [http://localhost:3000](http://localhost:3000).

---

## Backend Reference

### Clean Architecture Layers

The Go backend follows **Clean Architecture** — dependencies point inward. Each layer can be tested in isolation.

```
Delivery (HTTP handlers)
    ↓ calls
Use Cases (business logic)
    ↓ calls
Repository interfaces (contracts)
    ↑ implemented by
Infrastructure (Postgres, Redis, S3)
```

The `Domain` layer sits at the center with no dependencies on anything else.

### API Endpoints

All endpoints live under `/api/v1`.

#### Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register a player (phone + name) |
| `POST` | `/auth/login` | Public | Admin password login |
| `POST` | `/auth/refresh` | Cookie | Rotate refresh token, get new access token |
| `POST` | `/auth/logout` | JWT | Revoke refresh token |
| `GET` | `/auth/me` | JWT | Get current user profile |

#### Draws

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/draws/active` | Public | Get the current open draw |
| `POST` | `/draws/` | SuperAdmin | Create a new draw |
| `POST` | `/draws/{id}/close` | Admin | Close entries for a draw |
| `POST` | `/draws/{id}/reveal` | Admin | Reveal seed and compute winners |

#### Entries

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/entries/` | Player | Submit an entry (multipart: fields + proof image) |
| `GET` | `/entries/mine` | Player | List my entries for the active draw |
| `GET` | `/entries/` | Admin | List all entries (filterable by status) |
| `POST` | `/entries/{id}/confirm` | Admin | Confirm a payment-verified entry |
| `POST` | `/entries/{id}/reject` | Admin | Reject an entry |

#### Health

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Liveness probe |
| `GET` | `/health/ready` | Readiness probe (checks DB + Redis) |

### Database Schema

```sql
-- users: players and admins
users (id, name, phone, role, password_hash, created_at)

-- draws: one active draw at a time (enforced by partial unique index)
draws (id, draw_id, status, commitment, seed, winning_numbers, deadline, created_at)

-- entries: one entry per user per draw
entries (id, draw_id, user_id, number, amount, method, proof_key, status, created_at)

-- audit_log: append-only (REVOKE UPDATE, DELETE at DB level)
audit_log (id, actor_id, action, target_type, target_id, metadata, created_at)
```

---

## Frontend Reference

### Pages

| Route | Rendering | Description |
|---|---|---|
| `/` | Server + ISR (60s) | Home: draw hero, prize table, countdown, commitment hash |
| `/enter` | Client Component | 4-step wizard: sign up → pick number → choose amount → pay & upload proof |
| `/entries` | Client Component | View your tickets with status (pending / confirmed / rejected) |
| `/results` | Server + ISR (30s) | Prize table with winning numbers + SHA-256 fairness verifier |
| `/admin/login` | Client Component | Admin login with password |
| `/admin/dashboard` | Client Component | Confirm/reject entries, view payment proofs, close draw, reveal results |

### Component Library

| Component | Description |
|---|---|
| `Button` | 5 variants (primary/secondary/ghost/danger/confirm), loading spinner |
| `Badge` | Color-coded status indicators (gold, teal, rust, gray) |
| `Card` | Solid or glassmorphism variant |
| `Input` | Accessible: label, error, hint with `aria-describedby` |
| `Nav` | Sticky top bar on desktop, fixed tab bar on mobile |
| `CountdownTimer` | Live ticker with `role=timer` and tabular-nums to prevent layout shift |
| `NumberPicker` | Wheel (+/−), random button, full 100-number grid with taken-number overlay |
| `PrizeTable` | Staggered fade-in, trophy icons for top prizes, winner overlay post-reveal |
| `PaymentProofUploader` | Drag-and-drop + click, keyboard accessible, file preview |
| `EntryTicket` | Perforated ticket design, status badge, winner highlight |
| `ResultsVerifier` | Client-side SHA-256 using Web Crypto API — fully trustless |

### Content Management (Sanity)

Sanity CMS powers the **editable content** — things non-engineers need to update:

- Draw title and description
- Prize list (rank, label, prize title)
- Payment account details (Telebirr, CBE Birr, bank)
- Entry deadline

**To set up Sanity:**

1. Create a free project at [sanity.io](https://sanity.io)
2. Copy your **Project ID** from the dashboard
3. Set it in `frontend/.env.local`:
   ```bash
   NEXT_PUBLIC_SANITY_PROJECT_ID=your-actual-project-id
   ```
4. Restart the dev server

> **Without Sanity configured**, the app runs fully — pages display fallback text for CMS-managed content. Nothing crashes.

---

## Environment Variables

### Backend (`.env`)

| Variable | Required | Default | Description |
|---|---|---|---|
| `PORT` | No | `8080` | HTTP server port |
| `DB_HOST` | Yes | — | PostgreSQL host |
| `DB_PORT` | No | `5432` | PostgreSQL port |
| `DB_USER` | Yes | — | PostgreSQL username |
| `DB_PASSWORD` | Yes | — | PostgreSQL password |
| `DB_NAME` | Yes | — | Database name |
| `REDIS_URL` | Yes | — | Redis URL (`redis://localhost:6379`) |
| `JWT_PRIVATE_KEY_PATH` | Yes | — | Path to RSA private key PEM |
| `JWT_PUBLIC_KEY_PATH` | Yes | — | Path to RSA public key PEM |
| `JWT_ACCESS_EXPIRY` | No | `15m` | Access token expiry |
| `JWT_REFRESH_EXPIRY` | No | `168h` | Refresh token expiry (7 days) |
| `S3_ENDPOINT` | Yes | — | S3/MinIO endpoint URL |
| `S3_BUCKET` | Yes | — | Bucket name for payment proofs |
| `S3_ACCESS_KEY` | Yes | — | S3 access key |
| `S3_SECRET_KEY` | Yes | — | S3 secret key |
| `S3_REGION` | No | `us-east-1` | S3 region |
| `CORS_ORIGINS` | Yes | — | Comma-separated allowed origins |
| `RATE_LIMIT_GLOBAL` | No | `100` | Global requests per minute |
| `RATE_LIMIT_AUTH` | No | `5` | Auth requests per 15 minutes |
| `RATE_LIMIT_ENTRY` | No | `3` | Entry submits per 10 minutes |

### Frontend (`frontend/.env.local`)

| Variable | Required | Description |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Yes | Go API base URL (e.g. `http://localhost:8080/api/v1`) |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Optional | Sanity project ID (CMS features disabled without it) |
| `NEXT_PUBLIC_SANITY_DATASET` | No | Sanity dataset (default: `production`) |
| `NEXT_PUBLIC_SANITY_API_VERSION` | No | Sanity API version (default: `2024-01-01`) |

---

## Deployment

### Production Checklist

- [ ] Generate new RSA keys (`make keys`) — never reuse dev keys
- [ ] Set strong `DB_PASSWORD` and `S3_SECRET_KEY`
- [ ] Put the Go API behind Nginx/Caddy with a valid TLS certificate
- [ ] Set `CORS_ORIGINS` to your production domain only
- [ ] Use a managed Redis (Upstash, Redis Cloud) instead of local
- [ ] Use AWS S3 (or Cloudflare R2) instead of MinIO for object storage
- [ ] Set `NODE_ENV=production` for Next.js (enables CDN caching for Sanity)
- [ ] Run `npm run build` to validate the frontend build before deploying

### Makefile Commands

```bash
make help            # List all commands

make dev-up          # Start Docker services
make dev-down        # Stop Docker services
make migrate         # Run database migrations
make keys            # Generate RS256 key pair

make backend-run     # Run Go dev server
make backend-build   # Build Go binary → backend/bin/server
make backend-test    # Run Go tests

make frontend-run    # Run Next.js dev server
make frontend-build  # Build Next.js production bundle
```

---

## Design System

The UI uses a **dark ink palette** with gold accents — no UI framework, pure CSS custom properties.

```css
--ink:       #12181F    /* Deep dark background */
--gold:      #C9A227    /* Primary accent — draws, CTAs */
--teal:      #1F6F5C    /* Success, confirmed entries */
--rust:      #B4432D    /* Errors, rejected entries */
--paper:     #EDE8DC    /* Primary text */
--gray:      #8A8F98    /* Secondary text */
```

**Typography:** [Fraunces](https://fonts.google.com/specimen/Fraunces) (display headings) + [IBM Plex Mono](https://fonts.google.com/specimen/IBM+Plex+Mono) (numbers, codes)

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Run `make backend-test` before committing
4. Open a pull request

Please never commit the `backend/keys/` directory.

---

<div align="center">
Built with care for transparency and trust.
</div>
