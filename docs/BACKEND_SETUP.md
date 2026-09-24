# Setup, migration and final Chapa activation

## 1. Local prerequisites

Use Go 1.26.8+, Node 22+, npm and Docker Compose. The root `compose.yaml` is named `rimna-development` and uses its own volume. Its PostgreSQL port is **55437**, SMTP port **1027**, and Mailpit inbox is **http://localhost:8027**. These do not replace the older `shega_draws` services or their volumes.

```sh
make dev-up
make frontend-install
```

Copy `frontend/.env.example` into your existing `frontend/.env.local` **by merging missing entries**; do not overwrite existing Sanity configuration. Copy `backend/.env.example` to `backend/.env`. Keep both files untracked.

For local development:

```dotenv
# frontend/.env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
BETTER_AUTH_URL=http://localhost:3000
AUTH_DATABASE_URL=postgres://rimna:local-development-only@localhost:55437/rimna?sslmode=disable
BETTER_AUTH_SECRET=<random secret of at least 32 characters>
SMTP_HOST=localhost
SMTP_PORT=1027
SMTP_FROM=Rimna <accounts@example.test>
```

Generate the auth secret once with `openssl rand -base64 48`; paste it into your local secret configuration. Keep the same value across frontend instances and deployments. Chapa secret/key fields remain blank for now. Missing Chapa configuration hides payment methods and blocks checkout.

The Go binary reads environment variables; it does not automatically read `.env`. In a shell from the repository root, export the backend values before running commands:

```sh
set -a
. backend/.env
set +a
make backend-migrate
make auth-migrate
make backend-run
```

Run `make frontend-run` in another terminal. Sign up at `/account`, open Mailpit, follow the verification link, then sign in. Local Mailpit never delivers those messages to external recipients.

## 2. First staff account

1. Create and verify an account through `/account`.
2. Expand **Two-factor authentication**, enter the account password, add the setup URI to an authenticator app, save recovery codes privately and verify a code.
3. From the trusted backend shell, with `DATABASE_URL` exported:

```sh
cd backend
go run ./cmd/admin -email staff@example.com -role admin
```

`reviewer` grants read/export access only. Public registration never creates staff access. To revoke: `go run ./cmd/admin -email staff@example.com -revoke`.

Open `/admin` to create draws, configure price and capacity, set a deadline and open sales. Price/currency/capacity are fixed after creation; use a new draw for another round. Opening a draw does not enable an unconfigured payment processor. `/studio` is website content management only.

## 3. Import old Sanity operations

The repository includes a tested offline importer. **No existing production records have been moved by this change.** Keep the old deployment available until the new deployment is verified. Do not deploy the new frontend alone: it expects the new API and authentication configuration.

1. Pause ticket sales and employee edits on the old deployment.
2. Export its **complete ZIP backup with original media**. A JSON backup alone cannot migrate screenshot bytes. Keep a secure copy and take a destination PostgreSQL snapshot.
3. Run backend migrations and Better Auth migrations on the destination.
4. From `frontend`, set `DATABASE_URL` to the destination backend database and `MEDIA_DIR` to its private media folder. Validate, then import:

```sh
npm run import:operations -- /secure/location/rimna-backup.zip
npm run import:operations -- /secure/location/rimna-backup.zip --apply
```

The importer validates media hashes, retains original files, archives operational documents, imports draws/prices/pools, receipts, affiliates, messages and matching results. It is repeatable and wraps database changes in one transaction. Duplicate occupied numbers abort the transaction instead of silently choosing an owner. Files written before a failed transaction can remain as harmless orphaned originals; keep or remove them only after reconciliation.

Imported draws start closed; draws with imported results are completed. Confirmed receipts reserve their original numbers. Pending receipts use `legacy_pending` and remain reserved until reviewed. Rejected receipts are retained as failed records. Review this change against the old pool before reopening sales. Results without matching draw documents remain archived for manual review, and the importer reports their count.

Guest purchases cannot safely become account-owned based only on a phone number. They start unclaimed. Staff verify evidence and assign each receipt to an existing verified account in **Imported receipts**, with audit notes. Imported private screenshots are available only through staff-authorized downloads and ZIP exports.

Review document/order counts, amounts by currency, occupied numbers, original screenshots and selected Excel exports. Then configure the frontend API URL, deploy both applications, verify public/account/staff flows and open reviewed draws. Keep the old Sanity archive until the migration and backup restore have been accepted. Content and translations remain in Sanity; no production Sanity documents are deleted by the importer.

## 4. Deploy the backend

Recommended starting point: managed PostgreSQL with point-in-time recovery, a managed Go/container service or VPS for API + worker, Vercel for Next.js. The backend Docker build context is **`backend`**, Dockerfile **`Dockerfile`**, default command **`/app/api`**. There is no separate build command for a Docker service. Run migrations once through a release job using **`/app/migrate`**.

Create API and worker from the same image. Set `PROCESS_ROLE=api` for the web service and `PROCESS_ROLE=worker` for the worker. A small first deployment may use `all`, but separate processes let payment verification continue independently of web restarts. API health endpoints are `/healthz` and `/readyz`. The worker needs no public port.

Backend configuration:

| Variable | Production value |
| --- | --- |
| `DATABASE_URL` | Operational runtime database credential; require TLS |
| `DB_MAX_CONNECTIONS` | Initially 20 per API/worker; fit the total database budget |
| `APP_ENV` | `production` |
| `LISTEN_ADDR` | `:8080` or the assigned service port |
| `WEB_ORIGIN` | Exact frontend origin, e.g. `https://www.example.com` |
| `AUTH_ISSUER` | Same value as `BETTER_AUTH_URL` |
| `AUTH_JWKS_URL` | `https://www.example.com/api/auth/jwks` |
| `AUTH_AUDIENCE` | `rimna-api` |
| `CHAPA_MODE` | `test` for sandbox; **separate database** for `live` |
| `CHAPA_CURRENCIES` | `ETB`; add currencies only after merchant approval/testing |
| `CHAPA_SECRET_KEY` / `CHAPA_WEBHOOK_SECRET` | Add at the final Chapa step below |
| `MEDIA_DIR` | Private persistent path for imported originals |

On a VPS, the supplied `backend/deploy/compose.yaml` binds the API to loopback only. Put an HTTPS reverse proxy in front, allow only HTTPS/SSH externally, and restrict SSH. Provision the private media directory for container UID 10001 and include it in encrypted backups. When running multiple API instances, mount the same private media storage on each (or later replace the media adapter with private object storage). Never mount it as public web content.

Set `TRUSTED_PROXY_CIDRS` to the actual proxy addresses/networks only, and configure the proxy to **overwrite** `X-Real-IP` with the client address. Never use `0.0.0.0/0`. Without trusted proxy configuration, contact-form limits intentionally use the direct connection address. Do not trust client-provided forwarding headers. Put broader request limits at the HTTPS edge.

Use separate database roles: migrations own the schema; the auth runtime can operate only on `auth.*`; the Go runtime can read active auth sessions/users and operate on operational tables. Deny runtime update/delete of the payment ledger and audit log. Neither runtime should have schema creation or superuser rights. The local demo credentials are not production credentials. Use a PostgreSQL pooler compatible with Better Auth/Vercel and budget its connections.

## 5. Vercel configuration

Keep existing Sanity public configuration. Add:

- `NEXT_PUBLIC_API_BASE_URL=https://api.example.com` (rebuild when changed).
- `BETTER_AUTH_URL=https://www.example.com` (exact canonical frontend origin).
- `AUTH_DATABASE_URL` for the auth runtime role, same PostgreSQL database as the backend.
- `BETTER_AUTH_SECRET`, at least 32 random characters, persistent across instances.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, and production `SMTP_USER` / `SMTP_PASSWORD`.

Configure the SMTP domain and delivery records with your provider. Account verification and password reset require working email delivery. Use a separate staging database and keys for preview deployments. Do not allow arbitrary Vercel preview origins against production authentication.

Sanity write tokens are no longer required by ticket purchase routes. Studio retains its normal Sanity account authentication for content edits and content backups. The CMS ZIP backup is not a backup of PostgreSQL accounts, orders or payment data.

## 6. Final Chapa step — secrets and acceptance

1. Obtain approval for the actual business and enabled payment methods. A working test key is not live merchant approval.
2. In staging, set `CHAPA_MODE=test`, the Chapa v2 **test private key**, and a distinct webhook secret. Configure Chapa’s **Signature** webhook authentication with that same webhook secret.
3. Register `https://api.example.com/v1/webhooks/chapa` for payment and refund events. Preserve `X-Chapa-Signature` through the proxy. This implementation verifies v2 raw-body HMAC-SHA256 signatures; do not use a v1 webhook configuration.
4. Configure the customer return destination as the account page where supported by the merchant checkout configuration. The published hosted-init documentation does not specify a return-URL request field, so the adapter does not invent one. The player can return to `/account`; payment confirmation does not depend on browser redirection.
5. Complete official sandbox payments, failed/cancelled payments, repeated notifications, delayed notifications and refunds. Confirm amount, currency, transaction reference, order ownership and number allocation. Test a closed/sold-out draw and provider/network failure.
6. Check for a merchant-approved way to recover a Chapa reference after initialization ambiguity. Hosted initialization may return only `checkout_url`; signed webhooks provide the Chapa reference. Staff can use **Recheck a payment** with the reference from the Chapa dashboard if a webhook is missing. No order is fulfilled from a URL or screenshot alone.
7. For production, initialize a separate live database, migrate only reviewed real legacy records, configure live keys and repeat a controlled approved purchase/refund before opening sales.

No live charge, refund or payout has been executed by this implementation. Secrets remain blank in example files; the provider flow has been exercised with local contract tests, not a Chapa sandbox account.

## 7. Backups and launch checks

Back up PostgreSQL (both `public` and `auth` schemas), the private media folder, and separately the Sanity content dataset. Test restoring into a separate environment with payment processing disabled. Keep auth signing/encryption secrets in your secret manager; a database restore without those secrets may make stored auth material unusable. Never restore staging transactions into live.

Configure alerts for payment verification errors, oldest unresolved order, refund-required count, webhook failure rate, database saturation and 5xx responses. Reconcile Chapa transaction/settlement reports against the internal ledger daily. Partial refunds, disputes, prize payouts and affiliate disbursements are still staff-operated through approved banking/provider systems.

Run the target-server load test and a security review before a high-volume launch. The local tests are evidence of transaction correctness, not a production throughput guarantee.

Review [the validation report](VALIDATION.md), including unresolved Sanity tooling advisories, before treating this as a production-ready release. Review and publish updated content describing account sign-in and Chapa checkout; existing CMS translation overrides can still contain the old screenshot-payment instructions.
