# Player login and ticket history

Players register or log in with a phone number and exactly four digits for their PIN. Ethiopian `09...` and `07...` numbers are normalized to `+251...`. PINs are hashed with bcrypt in PostgreSQL. The Go service issues signed access tokens and rotating refresh tokens stored in Redis. Login is limited to five attempts per account in fifteen minutes, in addition to existing IP limits.

The website's `/entries` page verifies the session, shows all of that account's tickets, and offers the real active draw. Current tickets belong to draws awaiting results; previous tickets belong to revealed draws. Payment status remains independent: pending, confirmed, or rejected. Every submission uses the authenticated user ID, regardless of names or phone numbers supplied by the browser.

## Run and deploy

1. Apply `migrations/006_player_ticket_price.sql` once after migrations 001–005. Back up the deployment database before your normal migration rollout. Existing draws receive a default ticket price of 100 ETB; set the appropriate price for each draw before accepting purchases. New draws can supply `ticket_price` when created by a superadmin.
2. Start the Go service with PostgreSQL, Redis 6.2 or later, signing keys, and private S3-compatible proof storage configured as described in the root environment example.
3. Set `BACKEND_API_URL` in the Next.js environment to the Go API base URL, including `/api/v1`. It defaults to `NEXT_PUBLIC_API_URL` and then `http://localhost:8080/api/v1`. Restart/redeploy the frontend when changing it.
4. Open `/entries`, create an account, and select the active draw to buy a ticket. A successful upload creates a pending entry. An administrator must verify payment before confirmation.

The browser calls same-origin Next.js routes for player operations. Refresh cookies use `/api/auth`, HttpOnly, SameSite=Strict, and Secure in production. They are forwarded to the backend for renewal and logout. Server responses are not cached. Vercel's platform-provided client IP is forwarded for the existing IP limits; see [Vercel request headers](https://vercel.com/docs/headers/request-headers#x-vercel-forwarded-for). Other hosts should configure their own trusted proxy IP handling before public rollout.

## Endpoints

| Go endpoint | Behavior |
| --- | --- |
| `POST /api/v1/auth/register` | Register `{name, phone, pin}` and start a session |
| `POST /api/v1/auth/player-login` | Log in with `{phone, pin}` |
| `GET /api/v1/auth/me` | Return the verified account profile |
| `POST /api/v1/auth/refresh` | Consume and rotate the refresh cookie |
| `POST /api/v1/auth/logout` | Revoke the refresh cookie, even when the access token expired |
| `GET /api/v1/entries/mine` | All tickets owned by the signed-in account |
| `GET /api/v1/entries/mine?draw_id=<UUID>` | That account's tickets for one draw |
| `GET /api/v1/draws/active` | Open, unexpired draw, ETB ticket price, and reserved numbers |
| `POST /api/v1/entries` | Authenticated multipart purchase with draw UUID, number, amount, method, payment_reference, and proof |

The current Go draw model supports numbers 00–99, ETB pricing, and Telebirr/CBE/bank proof uploads. Pending and confirmed tickets reserve a number; rejection releases it. The website prevents checkout of unsupported USD or mismatched price options. This does not implement automatic payment gateway settlement, SMS phone verification, or PIN recovery.

## Existing data

Existing PostgreSQL tickets retain their user ownership and appear across draws. Browser-only fallback accounts/tickets and Sanity `playerEntry` records are not trusted as authenticated account history and are not automatically imported. Importing historical CMS tickets requires an audited mapping to verified PostgreSQL users; a supplied phone number alone is not ownership proof. New account registration does not establish possession of the phone via SMS.

New purchases no longer write receipt images or personal ticket data to the CMS. The legacy screenshot management API now requires a verified Go admin session (sign in at `/admin/login` before using the Studio tool). Legacy Sanity documents/assets may still be public if the dataset/assets were public; protect or migrate those records separately. No remote CMS records have been changed.

## Verification

From `backend`: `go test ./...` runs the HTTP account/purchase tests with isolated in-memory stores. To exercise the real PostgreSQL repositories and migrations, set `PLAYER_TEST_DATABASE_URL` to a disposable database and run `go test ./internal/delivery/http/handler -run TestPlayerAccountAndTickets -count=1`. The test creates and drops an isolated schema. Redis and proof upload are represented by test stores in this flow test.

From `frontend`: `npm run test:player` checks cookie forwarding, fail-closed auth, ownership filter handling, receipt authorization, single purchase submission, and session renewal. `npx tsc --noEmit --incremental false` checks types.
