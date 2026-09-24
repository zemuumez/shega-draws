# Rimna Digital Lottery

Rimna now uses a Go backend and PostgreSQL for ticket sales, payments, customer ownership and staff operations. Better Auth runs in the existing Next.js application. Sanity is for website content, branding and English/Amharic/Tigrinya translations.

**Start with [Backend setup and cutover](docs/BACKEND_SETUP.md).** Chapa secrets are intentionally unset. Checkout cannot accept payments until those credentials and the webhook are configured. Existing production Sanity data has not been modified or imported automatically.

| Area | Owner |
| --- | --- |
| Accounts, email verification, passwords, MFA, sessions | Better Auth, PostgreSQL `auth` schema |
| Draw prices/capacities, reservations, tickets, payments | Go API, PostgreSQL |
| Affiliates, messages, results, receipt review, Excel/ZIP exports | `/admin`, Go API |
| Branding, page content, translations, ads and testimonials | Sanity `/studio` |
| Original imported payment screenshots | Private backend storage, accessible only to staff |

A draw must be open, before its deadline, and supported by a configured payment provider. A CMS price switch no longer authorizes a purchase. Verified players select a number, receive a temporary reservation and pay through Chapa’s hosted page. Tickets are issued only after independent server-side payment verification.

[Architecture and scaling](docs/BACKEND_ARCHITECTURE.md) explains the boundaries, concurrency design, payment lifecycle, future processors, and current limitations. [Backend setup and cutover](docs/BACKEND_SETUP.md) covers local development, deployment, staff access, migration, backups and final credentials.

## Tests

- `make test`: backend unit tests and website content/export tests.
- `TEST_DATABASE_URL=... make backend-test`: real PostgreSQL reservation and payment tests in temporary schemas.
- In `backend`: `RUN_LOAD_TEST=1 TEST_DATABASE_URL=... go test -run TestTwentyFiveThousandReservations -v ./internal/store`.
- In `frontend`: `node scripts/test-auth-e2e.mjs` and `node scripts/test-import-e2e.mjs` use **only** the documented isolated local services. They never contact Chapa or production Sanity.

The old unauthenticated Sanity purchase/contact endpoints return HTTP 410. Old guest-purchase tests have been replaced by backend transaction, account-isolation and payment tests. Content backup/restore, language and spreadsheet tests are retained.

See [verification results and outstanding launch checks](docs/VALIDATION.md), including remaining Sanity tooling advisories.
