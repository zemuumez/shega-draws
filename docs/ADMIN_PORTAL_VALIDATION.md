# Admin portal foundation — 28 September 2026

## Delivered in this development slice

- Responsive Rimna administration shell based on the supplied references, with dedicated section URLs, mobile navigation, sign-out, keyboard focus styles and a navigation skip link.
- Authenticated staff-access probe before protected workspace components mount. Current user identity must match the API identity. Existing verified-session and MFA-enrollment checks remain enforced by the backend.
- Explicit read/write route permissions: reviewers can read draws, orders, imported receipts, results and messages; users, overview totals, operations, audit and affiliates are administrator-only. Unknown roles/routes and reviewer writes are denied.
- Protected overview with actual database counts and per-currency recorded payment/refund totals. Totals are not described as wallet balances, profit or prize funds. Open counts exclude past-deadline rounds.
- Read-only administrator user directory with server-side literal search, 50-row pages and a lookahead for the next page. It exposes selected profile/status fields, not sessions, secrets or fictitious balances/KYC status.
- Existing draw, payment recheck, legacy review, results, affiliate, message, audit and operations controls carried into the new shell. Draw listings now use stable 100-row backend pages; immutable draw price/currency/capacity are disabled in the edit form.
- Large inherited record/export UI is loaded separately from the overview. Public navigation/footer do not surround admin pages. Admin pages are marked noindex.

The protected API routes are `GET /v1/admin/session`, `GET /v1/admin/overview`, and `GET /v1/admin/users?q=...&offset=...`. New overview/directory reads have a shared database-backed per-staff limit of 60 requests per minute. These changes do not create staff accounts or grant access automatically.

## Verification

| Check | Result and limits |
| --- | --- |
| Frontend regression suite | 22 existing tests passed |
| TypeScript | No-emit check passed |
| Production build | Next.js build, lint/type checks and route generation passed using an isolated build directory |
| Backend race suite | Passed against disposable local PostgreSQL 14; optional 25K load test was not enabled |
| New database checks | Actual query tests for payment/refund/deadline counts, draw pagination, user pagination, literal wildcard search and input bounds passed |
| New HTTP checks | Actual API handlers plus isolated auth/session fixtures verified unauthenticated denial, reviewer denial, administrator access, disabled-staff revocation, MFA-enrollment requirement, expired-session rejection and unknown-route denial |
| Browser contract checks | Isolated Chrome tested desktop/mobile navigation, user search/empty state, immutable draw fields, save payload, all sections, reviewer restrictions, forbidden pages and failed/unauthenticated access states |
| Visual review | Desktop overview/user directory/round editor and 390px mobile round list inspected; mobile page did not overflow horizontally (wide tables scroll within their container) |
| Formatting | Diff whitespace check passed |

Browser checks used synthetic intercepted auth/API responses. HTTP/database tests separately used actual application handlers and queries, with a test identity verifier and disposable auth records. These do **not** constitute a new end-to-end Better Auth MFA sign-in or live payment test. Existing authentication verification is recorded separately in [prior validation](VALIDATION.md).

The local database listened on port 55441; the preview used port 3101 and an isolated build directory. No production data, real payment, live Sanity content mutation, staff grant or deployment occurred. PostgreSQL 17 target acceptance, production traffic and external-provider behavior remain untested in this slice.

## Running the checks

From `frontend`, run `npm test`, `npx tsc --noEmit --incremental false` and an isolated `RIMNA_BUILD_DIR=.next-admin-build npm run build`.

From `backend`, run `go test -race ./...` with `TEST_DATABASE_URL` pointing to a disposable PostgreSQL database. Tests requiring auth fixtures skip if the Better Auth user/session tables are absent. Never use a live database. The new HTTP tests substitute the JWT identity verifier while exercising real session and staff checks.

For browser contracts, provide Playwright and a Chromium browser, start a local preview with `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:18081`, then run `node scripts/test-admin-portal.cjs`. Defaults are preview `http://127.0.0.1:3101` and API origin `http://127.0.0.1:18081`. Optional variables: `ADMIN_TEST_WEB`, `ADMIN_TEST_API`, `ADMIN_TEST_BROWSER` (browser executable), `ADMIN_TEST_OUTPUT` (screenshots directory). The script refuses non-local origins, intercepts auth/API responses and creates a fresh browser context. It does not log into a real account.

## Remaining work

This is the first admin development increment. The following are deliberately not claimed complete:

- Two-currency wallets/deposits, financial ledger redesign and bulk-ticket purchases.
- Full permission matrix, fresh reauthentication and separate proposer/approver workflows.
- Account suspension/grants through the portal and identity review.
- Reusable lottery templates, frozen round rules and sold-only draw snapshot workflow.
- Independent result approval, external settlement register and audited result corrections. The portal clearly labels the existing result-publication workflow.
- Background exports; the inherited Excel/ZIP functions still run in the browser with their existing bounds.
- Server search across every record view, complete admin translations and exhaustive accessibility review.
- Sanity-independent root layout for private pages: the current root still fetches CMS settings/translations.
- Production recovery/monitoring setup, security/dependency review, target-VPS capacity and waiting room.

See the [master checklist](DEVELOPMENT_CHECKLIST.md). Only the narrower foundation tasks for this increment are checked; broader admin and security work remains open.
