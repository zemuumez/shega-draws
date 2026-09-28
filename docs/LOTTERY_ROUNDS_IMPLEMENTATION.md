# Lottery templates and rounds — implementation and validation

Date: 28 September 2026. Scope: the second admin portal increment. This is local development evidence, not a production launch or capacity certification.

## What staff can now do

At `/admin/draws`, administrators can create reusable lottery templates, change their defaults, disable templates for future creation, and create independently identified rounds. Template defaults include currency, price, capacity, named percentage deductions, and ten ranked prize shares. A new round copies those defaults into its own editable draft and adds an absolute closing date and optional HTTPS broadcast link.

Opening a round freezes its title, currency, price, capacity, deadline and financial rules. Pausing stops new reservations without extending the deadline. Resuming is allowed before the deadline. Permanent closure cannot be reversed and is distinct from cancellation or refunding existing customers. Opening and permanent closure require a concrete confirmation in the UI. Reviewers can inspect these records but cannot change them.

The list shows eligible sold tickets, occupied/remaining numbers, current net prize-fund estimates, and maximum estimates at full capacity. Details show deductions and ranked shares. Desktop uses a table; narrow mobile screens use labeled round cards. Staff can inspect readable before/after changes in Reports & audit.

## Contracts and storage

All routes below require the existing verified session, enabled staff record and MFA enrollment. Writes require the `admin` role. GET access also permits `reviewer`. Unknown roles, methods and routes fail closed. Reads share the existing 60-per-minute per-staff database limit; writes retain the existing 30-per-minute authenticated-user limit. These are operational protections, not measured production limits.

| Method and path | Contract |
| --- | --- |
| `GET /v1/admin/templates?offset=0` | `{items, hasMore}`; 50 templates per page with deterministic creation-time/ID ordering |
| `PUT /v1/admin/templates/{id}` | `{id, version, active, title, currency, priceMinor, capacity, rules}`; version 0 creates, a matching current version updates |
| `GET /v1/admin/rounds?offset=0` | `{items, hasMore}`; 50 rounds per page with snapshots, effective state and statistics |
| `PUT /v1/admin/rounds/{id}` | Save draft: `{action:"save", version, templateId, templateVersion, title, currency, priceMinor, capacity, rules, deadline, liveVideoUrl}` |
| Same round route | Transition: `{action:"open"\|"pause"\|"close", version}` |
| `PUT /v1/admin/draws/{id}` | Retired and denied. The old unversioned editor was removed. Read-only legacy draw APIs remain compatible. |

A stale round/template version returns 409. Creation uses a stable client-generated ID; retrying the same ID cannot create a second record. Creating a round requires the current template revision and an active template; outdated browser defaults must be refreshed. Draft round settings may be deliberately customized without changing their source template. Editing a template never rewrites existing rounds, including drafts. Template IDs and source revisions cannot change on an existing round.

`rules` is `{deductions:[{label,bps}], prizeBps:[...]}`. Money is integer minor units and percentages are integer basis points (100 means 1%). The backend rejects unsupported currencies, nonpositive/out-of-range prices, capacity outside 10–100,000, duplicate deduction labels, negative deductions, total deductions at or above 100%, nonpositive prize shares, or anything other than ten shares totaling 100%. New/edited drafts need future deadlines. All ten prize percentages are explicit staff input; screenshot examples are not product defaults.

Migration `004_lottery_rounds.sql` adds `lottery_templates`, round source/rule/version/first-open/closure fields, supporting indexes, and structured audit details. Existing `draws.id` remains the purchase reference, avoiding a destructive order migration. A database trigger protects opened or permanently closed managed-round terms and prevents reopening a terminal round. The existing per-round lucky-number uniqueness constraint remains authoritative.

## Lifecycle and concurrency

| State | Allowed actions |
| --- | --- |
| Draft | Edit settings, open sales, permanently close |
| Open | Pause new sales, permanently close; deadline automatically ends admission |
| Paused | Resume before the deadline, permanently close; settings stay locked |
| Closed / completed | View only; no reopening |

An unstarted draft with a past deadline can be corrected before opening; it has no published sales terms. An opened round with a past deadline cannot have its date extended.

Round writes acquire a database row lock, check the version, apply one transition, and record before/after audit details in the same transaction. Reservation and payment paths share-lock the round, so staff transitions cannot interleave unsafely with those operations. No provider call runs inside these database locks. Reservation admission and payment-expiry checks use the database clock after locking, allowing additional API hosts to share the same cutoff authority.

Requests independently reject closed or expired rounds. The worker's bounded expiry batch also persists past-deadline closures and emits one `round.close_deadline` audit entry. Sales cutoff does not depend on that worker running on time. Expiry persistence frees the existing unique open price/currency/capacity selection for subsequent rounds. Multiple worker instances skip already locked closure candidates.

The current public configurator still selects by currency/price/capacity. Its existing database constraint permits one open round for each such combination. Different templates with the same combination therefore cannot open simultaneously yet. Revisit this deliberately when the player portal selects lotteries by round ID; do not silently remove the constraint while the old selector is in use.

## Counting and financial estimates

- Sold means `paid` tickets without a recorded full refund.
- Occupied includes paid numbers (including refunded issued numbers retained by the existing policy), historical pending records, and unexpired checkout reservations. Remaining is capacity minus occupied, so it may differ from capacity minus sold.
- Current gross uses actual eligible paid order amounts. Maximum gross is price multiplied by capacity.
- Each named deduction is calculated against gross and rounded down to a minor unit; the remaining amount is displayed as the estimated net prize fund. This is an explicit projection convention, not approval of final settlement rounding.
- Values for all listed rounds come from one database query snapshot. Aggregation is restricted to the current page; customer identities are not exposed by the round list.
- Views refresh on load, staff actions, and the Refresh button; they are not pushed live to every browser. Existing purchase-time checks remain authoritative if a display becomes stale.
- Permanent closing/pausing does not cancel existing payment attempts. Valid existing payments can still reconcile within their reservation expiry. Result publication requires outstanding holds to be resolved.

Historical rounds retain their records and purchases. Their absent deductions and prize rules are displayed as “Not recorded,” rather than being invented. Existing historical sales can pause/resume before cutoff or close permanently; they cannot be converted into new financial-rule drafts through this portal. Result publication for managed rounds requires permanent closure; refunded tickets are excluded from eligible winners. Independent result approval remains future work.

## Local verification

| Check | Evidence |
| --- | --- |
| Backend race-enabled suite | Passed with disposable PostgreSQL 14, including existing auth/payment/operations tests |
| Rule validation | Valid shares, missing/incorrect totals, zero shares, negative/excess deductions, duplicate labels, bounds and integer projections covered |
| Real database lifecycle | Template snapshots, draft edits, stale updates, inactive/stale template creation, pause/resume/closure and protected SQL updates covered |
| Concurrency | 25 competing reservations for one number yielded one owner; ten competing staff opening attempts yielded one accepted transition |
| Cutoff / worker | Admission rejects expired rounds; reopening rejected; repeated worker expiry produces one closure audit entry |
| Counts | Paid tickets, active/expired holds, recorded refunds, remaining capacity and current/maximum estimates covered |
| Upgrade | Migrations 001–003 populated with historical data, then 004 applied and retried; ticket ownership, existing records and unknown financial rules preserved |
| HTTP permissions | Actual handlers and database session/staff fixtures exercised reviewer read/write boundaries, new template/round writes, stale versions, ID mismatch, unknown fields and retired write denial |
| Frontend | 22 existing regression tests passed; TypeScript and targeted lint passed; isolated production build passed |
| Browser contracts | Template creation, invalid-share feedback, exact amount conversion, copied round defaults, draft editing, opening, pause/closure, rules view, desktop/mobile navigation and read-only/error gates passed |
| Visual review | Desktop round details/editor and mobile listing inspected using synthetic fixtures |

The browser tests intercept auth/API traffic in a fresh local Chrome context. Separate backend tests use real SQL and application handlers with a fixture identity verifier. This is not an end-to-end Better Auth login, Chapa transaction or real-money test. No production account, database, Sanity content, payment or deployment was changed. The optional 25K load scenario was not enabled; target-VPS load and queue testing remain open.

Run the backend checks with a disposable `TEST_DATABASE_URL` and `go test -race ./...`. The migration test does not need Better Auth tables; HTTP staff tests additionally need the isolated auth fixtures described in [admin validation](ADMIN_PORTAL_VALIDATION.md). The existing `frontend/scripts/test-admin-portal.cjs` now covers the revised templates/rounds journey.

## Deployment and outstanding work

Before running this code on staging, back up the operational database, run the normal migration command for migration 004, and deploy the updated API, worker and frontend together. Old admin draw writes are intentionally no longer supported. Migration was demonstrated locally; production restore rehearsal and deployment remain separate checklist gates.

This increment does not implement wallet balances/deposits, quantity purchases, the redesigned player portal, automatic lucky-number assignment, a frozen draw register, independent result approval, or final external prize settlement. Cancellation/refund policy and fewer-than-ten-ticket prize handling still need decisions. They are not silently inferred from the owner's sales expectations. Business approval of deduction amounts, prize shares and final remainder handling remains open.

The new staff labels are English; full admin localization, broader accessibility review, advanced role permissions, fresh reauthentication, production monitoring/backup acceptance and measured multi-VPS capacity remain on the master checklist. This increment establishes the admin round workflow without claiming the full platform is launch-ready.
