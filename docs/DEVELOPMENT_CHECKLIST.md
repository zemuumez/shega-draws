# Rimna — Master Development and Release Checklist

Created: 28 September 2026  
Last reviewed: 28 September 2026  
Purpose: the working tracker for the revised lottery platform, from development through production acceptance.

## How we will use this checklist

This file is the canonical progress tracker. Read it with the linked specifications before each development task. New client decisions supersede older proposals; record the decision and update affected tasks instead of silently changing scope.

- `[x]` means the exact task is complete, with evidence. A confirmed design decision is not an implemented feature.
- `[ ]` means incomplete, not yet verified, or intentionally deferred. Use **IN PROGRESS**, **BLOCKED**, or **LATER** in the task's evidence record when needed; leave its checkbox open.
- Task IDs are stable. Do not renumber them when adding work. Create a new ID for new scope.
- Before work: select IDs, check their dependencies and identify whether the task affects customer money, data or access.
- After work: record changed files/revision, relevant checks, environment, date and remaining limitations in the evidence register. Then mark only completed items. Reopen affected items if later changes invalidate their evidence.
- Do not mark a task done merely because code exists, a mock succeeds, a configuration parses or a previous version passed. Distinguish local, staging, provider-sandbox and production evidence.
- All non-`LATER` tasks are part of release acceptance unless an explicit, documented scope decision removes them. Business-policy decisions may be resolved through an approved staged release, such as disabling USD funding initially.
- At the end of each work session, update **Current focus**, the evidence register and any changed decisions. No sensitive credentials, personal records or private payment evidence belong in this file.

**Overall state:** specification captured; admin foundation and template/round workflow delivered and locally verified; wallet ledger/test-deposit foundation locally verified; wallet ticket purchases, full admin workflows and production acceptance remain incomplete. No overall completion percentage is asserted.

## Current focus and execution order

| Order | Workstream | Depends on | Exit evidence |
| --- | --- | --- | --- |
| 1 | Resolve launch policies and review existing foundations | Confirmed scope below | Decision record, revised estimate, baseline checks |
| 2 | Define contracts, schema and financial invariants | Applicable policy decisions | Reviewed model, migrations and invariant tests |
| 3 | Build authentication/permissions, ledger, deposits and purchases | Contracts/schema | Integration and concurrency evidence |
| 4 | Build player/admin journeys and live-draw administration | Working protected APIs | Browser and staff acceptance |
| 5 | Complete CMS regression, migration, exports and operations | Stable data model | Rehearsals and reconciliation reports |
| 6 | Deploy staging on target infrastructure; load/security/recovery tests | Critical feature paths | Measured pilot limits and resolved blockers |
| 7 | Controlled launch and handover | All release gates | Signed go/no-go and production observations |

Security review accompanies every workstream. Start payment onboarding and infrastructure access early; do not postpone these external dependencies until UI completion.

**Current focus:** admin templates/rounds and the wallet ledger/test-deposit increment are locally verified. Next: connect quantity ticket purchases and lucky-number allocation to the authoritative wallet debit in one transaction, then complete the player journeys. Live wallet deposits remain blocked in code. Provider sandbox acceptance, database privileges, settlement reconciliation, wallet recovery rehearsal, full staff permissions and unresolved draw/refund policies remain open. See [wallet delivery and evidence](WALLET_DEPOSITS_IMPLEMENTATION.md).

## 0. Confirmed scope — decisions, not delivery claims

- [x] **SCOPE-01** Record Go/PostgreSQL as the operational system; Sanity manages website content, branding, ads, testimonials and translations. Evidence: [architecture](ADMIN_PORTAL_ARCHITECTURE.md).
- [x] **SCOPE-02** Record authenticated accounts with separate ETB and USD balances; currency switching is not currency conversion. Evidence: [player specification](PLAYER_PORTAL_AND_TICKETING_SPEC.md), sections 1–3.
- [x] **SCOPE-03** Record deposits and wallet-funded ticket purchases; exclude self-service withdrawals and automatic prize credits. Evidence: player specification, sections 3 and 6.
- [x] **SCOPE-04** Record ticket quantities plus automatic random or manual available-number selection; show a tracking ID and lucky number for each ticket. Evidence: player specification, section 4.
- [x] **SCOPE-05** Record capacity per round, fixed closing dates and live owner-conducted draws using only sold, eligible tickets even if not sold out. Evidence: player specification, section 5.
- [x] **SCOPE-06** Record ten ranked prize positions, multiple wins for one customer through different tickets and external prize payment. Evidence: client confirmations captured in player specification.
- [x] **SCOPE-07** Record current versus maximum prize funds and disclosed deductions, with actual sales determining the final pool. Evidence: player specification, section 6.
- [x] **SCOPE-08** Record the player/admin reference layouts and prioritize written rules over screenshot placeholders. Evidence: player and admin specifications.
- [x] **SCOPE-09** Record the Yegara 8 CPU / 16 GB pilot, customer queue acceptance, future VPS expansion and potentially 100,000-user audience. No simultaneous-user guarantee. Evidence: [capacity report](CAPACITY_AND_OPERATIONS_REPORT.md) and admin architecture.
- [x] **SCOPE-10** Record that the earlier 8–10 week estimate does not cover the expanded wallet scope. Evidence: [timeline](PROJECT_TIMELINE.md) and admin architecture, release sequence.

### Earlier requests that remain relevant

| Earlier request | Current treatment | Tasks |
| --- | --- | --- |
| Remove the old backend and use Sanity for all operations | Superseded by the dedicated Go/PostgreSQL decision; do not delete the new backend | ARC, MIG |
| Guest screenshots and manual approval | Superseded as the new purchase flow; preserve and migrate existing records and private images | MIG, EXP |
| Chapa and future international/bank payments | Chapa for approved deposits; other processors through adapters after approval | PAY, LATER |
| Better Auth versus phone OTP | Better Auth email/password is the planning baseline; phone OTP remains a separate option | AUTH, DEC-07, LATER-01 |
| Loader logo, smooth animation, mobile duplicate purchase card and broken modal | Retain and regression-test in the redesigned journeys | WEB |
| Price/pool availability, disabled numbers and places remaining | Operational API and round rules replace CMS purchase authorization | LOT, BUY, WEB |
| English/Amharic/Tigrinya and default language | Retain CMS-controlled translations and test all languages/default behavior | CMS |
| Remove Content & Language Sync | Keep it removed from Studio navigation and unused workflows | CMS-03 |
| Full CMS JSON/ZIP backup and restore | Retain content recovery separately from operational database recovery | CMS, OPS |
| Excel player list and screenshots ZIP | Preserve authorized legacy exports; large exports become background jobs | EXP |
| Client comparison, timeframe, waiting/downtime estimates | Maintain honest reports with measured evidence and revised scope | DOC, PERF |
| Mobile applications | Preserve API reuse; native app delivery is a later project | LATER-03 |

## 1. Decisions and external dependencies

These block their dependent features or launch; they do not stop unrelated development.

- [ ] **DEC-01** Agree the allocation of unfilled prize positions when fewer than ten eligible tickets sell; document zero-sales handling. The owner's expectation of strong sales is recorded but does not define this exception.
- [ ] **DEC-02** Agree unused-deposit, cancelled-round, disputed-payment and purchase-refund rules, destinations, deadlines and responsible staff. No withdrawal button does not establish a no-refund policy.
- [ ] **DEC-03** Confirm exact deductions, their calculation basis, ten prize percentages totaling 100%, rounding/remainder handling, and any guaranteed versus variable prize obligations. Screenshot percentages are examples.
- [ ] **DEC-04** Obtain provider approval for the actual lottery plus stored-balance model, supported markets/currencies, limits and required business documents. Record the approval scope without secrets; keys alone are not acceptance.
- [ ] **DEC-05** Select and approve USD funding/settlement, or approve an ETB-only live launch with USD deposits/purchases explicitly disabled. Do not assume Stripe eligibility or treat a mock adapter as live support.
- [ ] **DEC-06** Obtain qualified guidance and client decisions on operating permissions, age/country eligibility, identity checks, customer-funds handling, privacy/retention and responsible-play requirements. Implement the resulting policy; do not infer compliance from payment integration.
- [ ] **DEC-07** Confirm initial email/password sign-in, email delivery and account recovery; scope phone OTP separately if selected.
- [ ] **DEC-08** Set deposit limits, per-order/per-account ticket limits, account restrictions and any spending/cooling-off/self-exclusion controls required by the agreed policy.
- [ ] **DEC-09** Assign named owner, finance, result approver, support, incident contact and recovery operator; confirm enough distinct people for two-person approvals.
- [ ] **DEC-10** Agree expected traffic scenarios, acceptable queue behavior, response-time/error objectives, acceptable data loss (RPO) and recovery time (RTO), and recurring infrastructure budget.
- [ ] **DEC-11** Confirm live-stream draw procedure, timezone, sales cutoff versus stream start, unsold-number rejection/redraw procedure and result disputes/corrections policy. No silent sales extension.

## 2. Baseline and maintainable architecture

- [x] **BASE-01** Inspect current changes and rerun applicable baseline checks in isolated environments; record current tool/dependency versions and distinguish inherited failures from new regressions. Evidence: [admin validation](ADMIN_PORTAL_VALIDATION.md); target production acceptance remains separate.
- [ ] **BASE-02** Reassess the dependency findings in [prior validation](VALIDATION.md); resolve or safely isolate affected Sanity tooling and obtain a fresh audit. Old counts are historical, not today's scan.
- [ ] **ARC-01** Define module ownership for identity/permissions, templates/rounds, inventory, ledger, deposits, purchases, results, settlements, support, exports and operations.
- [ ] **ARC-02** Write versioned API contracts with typed payloads, validation, pagination, currency/amount formats, consistent errors and idempotency semantics; cover browser and future mobile clients.
- [ ] **ARC-03** Review the revised schema, state transitions and transaction boundaries. Separate orders, individual tickets, provider attempts, deposits and ledger entries; do not stretch a single-number order into a wallet record.
- [ ] **ARC-04** Keep HTTP, application rules, persistence and provider adapters separated. Use one modular Go backend and independently runnable workers; avoid unnecessary microservices.
- [ ] **ARC-05** Introduce safe, versioned migrations and compatibility checks; rehearse upgrade/rollback or forward repair without destroying issued tickets or accounting records.
- [ ] **ARC-06** Separate local/staging/production data, credentials and provider modes; remove demo funding controls and sample customers from production paths.
- [ ] **ARC-07** Define bounded durable jobs/outbox events, leases, retry/backoff, dead-letter review and deduplication. Multiple workers must not repeat financial effects.
- [ ] **ARC-08** Add maintained setup, environment-variable and architecture-decision documentation; ensure clean checkout setup does not require production secrets.

## 3. Authentication, staff access and customer isolation

- [ ] **AUTH-01** Revalidate Better Auth signup, email verification, login/logout, password reset and session revocation against the revised application.
- [ ] **AUTH-02** Configure and test email delivery, expired/reused verification links and recovery flows; prevent account enumeration and abusive resend/login traffic.
- [ ] **AUTH-03** Enforce secure cookies, trusted origins and CSRF protection for cookie-authenticated mutations; retain short-lived browser bearer tokens only in memory.
- [ ] **AUTH-04** Verify JWT signature/issuer/audience/expiry and live session/account status on protected Go requests, including logout, suspension and role-revocation cases.
- [ ] **AUTH-05** Enforce completed MFA sign-in for staff, secure enrollment/recovery and fresh reauthentication for sensitive actions. Test every enabled authentication method; an enrollment flag alone is not a challenge.
- [ ] **AUTH-06** Replace broad staff access with explicit per-action permissions and deny-by-default checks on every endpoint, object and export/download.
- [ ] **AUTH-07** Implement staff invitation/grant/revoke and audit controls; prevent self-escalation and customer-supplied identity/role authority. Define privileged recovery access.
- [ ] **AUTH-08** Enforce different people for proposing/approving sensitive financial changes and result publication; edits invalidate prior approval of that payload.
- [ ] **AUTH-09** Restrict support visibility and account suspension actions; retain history and customer financial obligations when access is blocked.
- [ ] **AUTH-10** Prove cross-account, cross-role, expired/revoked-session and direct-API access denial in automated integration tests.
- [x] **AUTH-11** First admin increment: enforce explicit existing admin/reviewer route permissions, protect overview/user-directory reads, fail closed for unknown roles/routes and verify revoked staff/expired-session denial with real HTTP/database checks. Evidence: [admin validation](ADMIN_PORTAL_VALIDATION.md). This does not complete the full future permission/approval model.

## 4. Wallet ledger and financial integrity

Depends on applicable DEC policies and ARC-02/03. No real-money deposits until ledger invariants pass.

- [x] **FIN-01** Create distinct user/currency accounts and integer-minor-unit money types, with bounds and overflow/precision validation.
- [ ] **FIN-02** Implement balanced, append-only ledger transactions per currency; explicit unique operation references; corrections through reversals. Runtime roles cannot casually edit posted entries. **IN PROGRESS:** immutable/balanced journal constraints and reversals pass local SQL tests; deployment privilege separation remains unverified.
- [x] **FIN-03** Define available, pending and any restricted amounts and their permitted transitions. Unverified deposits and externally paid prize awards are not spendable balance.
- [ ] **FIN-04** Lock/check the authoritative balance during spend and atomically post debits; prevent negative spendable balances and simultaneous overspending across sessions/servers. **IN PROGRESS:** internal concurrent debit primitive passes; atomic wallet-funded ticket issuance is next.
- [ ] **FIN-05** Reconcile displayed balance to ledger entries and customer liabilities to provider/settlement records; deposits are not ticket sales or platform revenue. **IN PROGRESS:** administrator internal balance comparison delivered; external provider/bank settlement reconciliation remains open.
- [ ] **FIN-06** Implement approved refunds/reversals/adjustments with approval, reasons and traceability; define disputed deposits already spent without rewriting historical purchases.
- [x] **FIN-07** Test concurrent credit/debit, duplicate credit, refund replay, rollback, integer limits, cross-currency attempts and ledger imbalance rejection.
- [x] **FIN-08** Expose currency-specific balances/history with authorization and pagination; currency toggling never transfers or exchanges money. Evidence for FIN-01/03/07/08: [wallet local integration and browser checks](WALLET_DEPOSITS_IMPLEMENTATION.md).

## 5. Deposits and payment-provider integration

Test implementation evidence for PAY-01–08 is recorded in [wallet delivery](WALLET_DEPOSITS_IMPLEMENTATION.md). Keep these broader acceptance items open: live approval, fees/policy decisions, actual provider sandbox behavior, mature exception handling and production acceptance are incomplete.

- [ ] **PAY-01** Adapt the provider interface for deposits and provider attempts while preserving reference, amount, currency, environment and account checks. Keep international/bank adapters replaceable.
- [ ] **PAY-02** Create server-priced deposit intents with unique idempotency keys, permitted limits/precision, displayed fees and clear pending status.
- [ ] **PAY-03** Initialize approved hosted checkout server-side; allow only expected return destinations and never expose secret keys or collect card credentials unnecessarily.
- [ ] **PAY-04** Authenticate webhook raw payloads using the provider's documented method, bound payload size, persist/retry processing and reject forged/mismatched events.
- [ ] **PAY-05** Independently verify payment before crediting the correct wallet once. Browser redirects or screenshots cannot confirm funds.
- [ ] **PAY-06** Handle duplicate/out-of-order/late notifications, lost initialization responses, provider outages and uncertain payments without blind duplicate charge attempts.
- [ ] **PAY-07** Add periodic reconciliation with bounded shared provider quotas, backoff and an actionable staff exception queue; preserve reference uniqueness across orders/accounts.
- [ ] **PAY-08** Keep callbacks and reconciliation available during purchase queues/pauses; separate deposit pause from sales pause and recovery lock semantics.
- [ ] **PAY-09** Exercise approved refunds/disputes and reconciliation paths with test credentials; document which actions are external/manual and which are verified automatically.
- [ ] **PAY-10** Complete real Chapa sandbox acceptance using configured public callbacks; record outcomes beyond mock-provider tests and confirm current quotas with the merchant account.
- [ ] **PAY-11** Configure production credentials through secret management only after approval and staging acceptance, then perform authorized small live checks. Keep unapproved currencies/providers disabled.

## 6. Lotteries, tickets and atomic purchases

- [x] **LOT-01** Implement reusable templates and independently identified rounds with immutable snapshots of financial rules when sales start. Evidence: [round implementation](LOTTERY_ROUNDS_IMPLEMENTATION.md), local database and browser checks.
- [x] **LOT-02** Validate currency, price, capacity/lucky-number range, timestamps/timezone, deductions, ranked shares and allowed status transitions on the server. Evidence: round implementation; actual business terms and settlement policies remain undecided.
- [ ] **LOT-03** Implement global/per-round sales pause, sold-out behavior and fixed cutoff enforced transactionally. Pausing does not silently change published dates/rules.
- [ ] **LOT-04** Publish accurate sold/remaining counts and separate current versus maximum net pools; private customer information never enters public availability responses.
- [ ] **BUY-01** Support quantity purchases with one unique tracking ID per ticket and a per-round unique lucky number; allow a number to recur in a different round.
- [ ] **BUY-02** Implement secure, unbiased random assignment among available numbers and test full/nearly-full inventory performance; avoid duplicate choices within a batch.
- [ ] **BUY-03** Implement optional manual selection with search/pagination/virtualization and disabled occupied numbers; explain conflicts without silently replacing chosen numbers.
- [ ] **BUY-04** Atomically validate price, balance, quantity, deadline, sales state and inventory; debit and issue the complete batch or roll back everything.
- [ ] **BUY-05** Enforce database uniqueness, consistent lock order and bounded retry; never hold a database transaction open while contacting an external payment provider.
- [ ] **BUY-06** Bind idempotency to authenticated account and canonical request details; identical retries return the same purchase and changed payloads fail.
- [ ] **BUY-07** Handle connection loss after commit through order lookup; page refresh/double click/retry cannot cause an extra debit or extra tickets.
- [ ] **BUY-08** Test same-number contention across different API instances, one account's parallel spending, capacity exhaustion, invalid quantities, paused/closed rounds and cutoff races.

## 7. Live draw, results and external prize payments

- [ ] **DRAW-01** Freeze the eligible sold-ticket register and final prize calculation after cutoff/reconciliation; record rules version, timestamp, count and checksum.
- [ ] **DRAW-02** Prepare a private draw-operator export that includes only eligible lucky numbers; warn below ten eligible tickets and implement DEC-01 before launch.
- [ ] **DRAW-03** Support staff entry of live drawn numbers and stream/recording references; reject unsold, duplicate, out-of-range and wrong-round numbers.
- [ ] **DRAW-04** Permit the same customer to win through different tickets; prohibit one ticket from occupying multiple prize positions.
- [ ] **DRAW-05** Calculate final ranked prizes from actual eligible sales and frozen deductions/shares, with deterministic rounding and financial reconciliation.
- [ ] **DRAW-06** Implement draft, independent review and publication; lock approved payloads and retain an audited correction process without silent result replacement.
- [ ] **DRAW-07** Display public results without disclosing private winner contact/payment details; expose each player's own prize detail privately.
- [ ] **DRAW-08** Record external prize settlement amount/currency/date/reference and authorized staff confirmation, with private evidence and pending/paid status.
- [ ] **DRAW-09** Prevent duplicate settlement recording and allocate one external payment across multiple awards explicitly; corrections retain history. Do not label staff confirmation as provider verification.
- [ ] **DRAW-10** Rehearse a complete live draw including an unsold-number attempt, repeated submission, multiple wins by one user and disputed-result correction.

## 8. Player portal, mobile website and visual regression

- [ ] **WEB-01** Build the reference-inspired responsive portal shell using Rimna branding, clear navigation, currency switch and accessible loading/error states; remove withdrawals and demo funding controls.
- [ ] **WEB-02** Build overview with currency-specific balance, deposited amounts, tickets, recent activity and separately shown winnings.
- [ ] **WEB-03** Build lottery cards/search/filters with price, sold/capacity, remaining tickets, closing time and current/maximum prize amounts.
- [ ] **WEB-04** Build purchase details/modal with quantity, number-selection modes, full deduction/ranked-prize disclosure, cost, available balance and outcome.
- [ ] **WEB-05** Build My Tickets with tracking ID, lucky number, round, purchase date, currency, price and result; search/paginate and show ownership only to the authenticated player.
- [ ] **WEB-06** Build deposit and transaction history with pending/verified/failed states and safe return/retry behavior; disable unavailable payment methods clearly.
- [ ] **WEB-07** Build results/My Winnings with external-payment status and live-stream/recording links; no withdrawal action or automatic wallet credit.
- [ ] **WEB-08** Retain the supplied Rimna SVG loader and smooth component entrance animations; respect reduced-motion settings, avoid excessive loading delays and prevent hidden overlays trapping clicks.
- [ ] **WEB-09** Remove the redundant mobile purchase strip shown in earlier references; verify every intended Buy Ticket button opens the correct usable modal on mobile and desktop.
- [ ] **WEB-10** Test focus trapping/restoration, keyboard operation, screen-reader labels, contrast, input errors and scrolling for modal, navigation and number selection.
- [ ] **WEB-11** Use shared typed API access and reusable components; keep private pages/data out of shared caches and browser tokens out of persistent storage. Clear account-scoped caches at logout/switch.
- [ ] **WEB-12** Test slow networks, session expiry mid-flow, refresh/back navigation and repeated clicks; preserve order recovery and never display an unconfirmed purchase as final.

## 9. Admin portal and staff workflows

- [ ] **ADM-01** Build the reference-inspired admin shell and overview with separate-currency metrics, data freshness, health and actionable exceptions.
- [ ] **ADM-02** Build templates/rounds screens with create, draft edit, copy defaults, view, pause and policy-controlled cancellation. Existing financial terms remain immutable after sales begin.
- [ ] **ADM-03** Build draw review/publication and external settlement interfaces on the protected DRAW workflows.
- [ ] **ADM-04** Build user search/detail and authorized access restrictions, session revocation and staff grants; no arbitrary balance edit or password disclosure.
- [ ] **ADM-05** Build deposit/reconciliation, refund/adjustment and identity-review screens with permission-specific data. Email verification must not be labeled identity verification.
- [ ] **ADM-06** Build limited-access support cases with safe customer content/internal notes; no support capability to grant roles or alter money/results.
- [ ] **ADM-07** Build reports/audit tabs and export job progress/downloads; retain historical commission data without silently adding new referral scope.
- [ ] **ADM-08** Build system operations views for sales/deposit controls, backups, restore readiness, alerts and incident contacts. Keep destructive recovery outside ordinary admin actions.
- [ ] **ADM-09** Link content editing to Sanity while keeping customer records, subscriptions and financial permissions operationally separate.
- [ ] **ADM-10** Test each staff role in the browser and directly against the API, including concurrent edits and stale approval attempts; record staff acceptance.
- [x] **ADM-11** Deliver responsive admin shell, dedicated section routes, verified staff-access gate, role-filtered navigation and access-error states. Evidence: [admin validation](ADMIN_PORTAL_VALIDATION.md); fixture browser checks and separate API tests.
- [x] **ADM-12** Deliver database-backed overview and read-only, paginated user directory with search and distinct email/MFA labels; do not invent wallet or identity-verification data. Evidence: admin validation.
- [x] **ADM-13** Carry existing management actions into the new shell, page draw listings and protect immutable fields in the editor; preserve read-only reviewer UI and server write restrictions. Evidence: admin validation. Existing publication/export limitations remain open.
- [x] **ADM-14** Deliver reusable template and round screens, explicit financial rule entry, draft editing, version checks, rule locking, open/pause/resume/permanent-close controls, admin sold/remaining/prize-fund estimates and readable before/after audit records. Evidence: [round implementation and local verification](LOTTERY_ROUNDS_IMPLEMENTATION.md). Cancellation/refunds, public portal rollout and independent draw approval remain separate.
- [x] **ADM-15** Deliver administrator-only wallet accounting and deposit review, audited independent deposit pause, verification scheduling with immutable provider references, and paginated player currency balances/history. Evidence: [wallet increment](WALLET_DEPOSITS_IMPLEMENTATION.md), real API/database checks and fixture browser tests. Test mode only; no arbitrary credit/refund approval, advanced identity review or production acceptance.

## 10. Sanity content and language preservation

- [ ] **CMS-01** Verify English, Amharic and Tigrinya on public pages, new portal flows, validation/errors, currency/date formatting and emails where supported; identify and fill missing keys/fallbacks.
- [ ] **CMS-02** Verify CMS default-language changes and explicitly documented visitor preference precedence, including existing stored preferences, refresh and first render without a wrong-language flash.
- [ ] **CMS-03** Keep Content & Language Sync removed from Studio and retire unused sync entry points without deleting valid translations/content.
- [ ] **CMS-04** Test branding, ads, testimonials, page content and content publishing/revalidation; CMS content edits must not change financial rules or staff privileges.
- [ ] **CMS-05** Verify complete content JSON backup with documents/drafts and asset manifest; disclose configuration/users/history and other exclusions accurately.
- [ ] **CMS-06** Verify full ZIP includes original media bytes, checksums and missing-download failures; restrict source hosts and credential scope, including redirects. Never publish secrets in a backup.
- [ ] **CMS-07** Rehearse JSON/ZIP restore in an isolated dataset with reference remapping, validation, progress/retry and failure reporting; do not test by overwriting live content.
- [ ] **CMS-08** Clearly separate content backup from operational recovery and retire misleading copy that says CMS alone contains all current financial/customer records.

## 11. Legacy migration and staff exports

- [ ] **MIG-01** Inventory legacy receipts, numbers, rounds, customer fields, screenshots and current PostgreSQL records; identify authoritative sources and take recoverable backups before any cutover.
- [ ] **MIG-02** Define mappings for legacy round identity, status, currency, references and assets; preserve originals and resolve collisions without dropping records.
- [ ] **MIG-03** Verify historical ticket ownership before linking to new accounts; matching an entered phone number alone is insufficient.
- [ ] **MIG-04** Do not convert historical purchase amounts into new wallet deposits. Define and reconcile any legitimate opening balances with independent approval.
- [ ] **MIG-05** Rehearse resumable/idempotent import into isolation, including missing media, duplicate references, malformed data and rollback; reconcile counts and money per currency.
- [ ] **MIG-06** Schedule the write freeze/final migration, old-route retirement, reconciliation and rollback decision. Avoid two writable systems owning the same sales.
- [ ] **EXP-01** Produce authorized Excel player/ticket exports with round, tracking/lucky number, currency, payment status and necessary staff fields; protect against spreadsheet formula injection.
- [ ] **EXP-02** Preserve bulk original legacy screenshots ZIP with a manifest mapping files to records, safe filenames and checksums; no publicly guessable media URLs.
- [ ] **EXP-03** Move large exports to background jobs using consistent snapshots, bounded memory/storage and progress/failure states; do not load every customer into a browser.
- [ ] **EXP-04** Authorize creation and download, recheck access before granting links, expire artifacts, audit access and apply data-retention policy. Test unauthorized and revoked-user access.

## 12. Cybersecurity engineering and verification

Target a documented OWASP ASVS assessment appropriate to financial/customer data, using Level 2 as the proposed baseline and stronger controls for high-impact administration. Map applicable requirements to evidence; this checklist is not an ASVS certification. [OWASP ASVS](https://owasp.org/projects/asvs).

- [ ] **SEC-01** Create a threat model/data-flow diagram covering customer browsers, staff, Vercel, Go, auth, PostgreSQL, Sanity, providers, exports and backups; include insider abuse and financial race conditions.
- [ ] **SEC-02** Map applicable ASVS requirements and owners, document scope/exclusions and define release-blocking vulnerability severity and response times.
- [ ] **SEC-03** Validate server-side inputs and workflow transitions; parameterize SQL; prevent mass assignment, price/currency tampering and unauthorized state changes.
- [ ] **SEC-04** Test XSS/HTML rendering, CSRF/origin checks, CORS, clickjacking/CSP, redirects and SSRF in provider/media/link features; tune controls against actual Next.js/Sanity behavior.
- [ ] **SEC-05** Enforce bounded body/header sizes, execution timeouts, pagination, batch size and concurrency; prevent expensive queries, enumeration and abusive login/deposit/export traffic.
- [ ] **SEC-06** If accepting support/identity/evidence uploads, use private storage, size/type/signature validation, safe names, scanning/quarantine and authorized downloads; test malformed/archive bomb and path traversal inputs where archives are handled.
- [ ] **SEC-07** Keep secrets server-side in controlled storage, separate environments, scan repository/builds for leaks, rotate keys and rehearse revocation/recovery. Never log credentials or payment/identity secrets.
- [ ] **SEC-08** Use TLS with certificate verification, restricted database/storage/network access, least-privilege runtime roles, SSH keys and restricted administrative entry points.
- [ ] **SEC-09** Run containers as non-root with minimal permissions, read-only filesystem where practical, resource/log limits and patched pinned builds; restrict exposed ports and migration privileges.
- [ ] **SEC-10** Maintain dependency/SAST/secret scans and reviewed updates in CI; protect branches/releases and minimize CI permissions. Resolve high-impact findings before release; document any reviewed exceptions.
- [ ] **SEC-11** Protect audit records outside the app host, redact sensitive data, sanitize log inputs and test log/storage failure behavior without losing financial integrity.
- [ ] **SEC-12** Apply data minimization, identity-document isolation, retention/deletion rules and access logging; preserve required accounting history without retaining unnecessary personal copies.
- [ ] **SEC-13** Conduct an independent assessment of auth, authorization, deposits, ledger, purchase races, staff approvals and exposed infrastructure; fix findings and retest before real-money release.
- [ ] **SEC-14** Document incident response for account takeover, leaked keys, suspected balance manipulation, duplicate external charges, data exposure and provider compromise; exercise containment and reconciliation.

Authority belongs on the server and must apply to each operation, including transaction approval and state transitions. [OWASP transaction authorization](https://cheatsheetseries.owasp.org/cheatsheets/Transaction_Authorization_Cheat_Sheet.html). Logging must support investigation without exposing credentials or sensitive records. [OWASP logging](https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html).

## 13. Deployment, capacity and horizontal expansion

- [ ] **DEP-01** Provision the selected VPS and staging; confirm actual CPU sharing, RAM/disk/IOPS, network speed/transfer limits, backups, support and upgrade terms. Screenshot specs alone are not capacity evidence.
- [ ] **DEP-02** Configure HTTPS/reverse proxy, API and worker processes, health checks, draining, bounded logs and restart behavior; add PostgreSQL deployment explicitly if self-hosting it on the pilot.
- [ ] **DEP-03** Resolve secure Vercel/Better Auth-to-database connectivity and pooling. If restricted VPS access is unavailable, change auth placement or use a suitable managed database; never solve it with unrestricted database exposure.
- [ ] **DEP-04** Set measured resource/connection budgets across Next.js instances, APIs, workers, exports and monitoring; keep database/OS headroom and alerts for storage exhaustion.
- [ ] **DEP-05** Use private shared object storage for evidence/exports and external backups; prepare stateless API/worker deployment without reliance on one host's local files.
- [ ] **DEP-06** Configure edge protection, trusted proxies and a waiting room with server-validated admission, direct-origin bypass prevention and suitable session expiry/reentry behavior.
- [ ] **DEP-07** Separate admission/abuse limits for login, browsing, purchases and provider callbacks. Keep already accepted payments reconcilable during overload or sales pause.
- [ ] **DEP-08** Share rate limits/provider budgets/job leases across instances; local caches never authorize balance or ticket ownership. Add Redis only for measured cache/coordination needs.
- [ ] **DEP-09** Document and rehearse adding worker/API VPS hosts, load-balancer routing, shared storage/DB connectivity, graceful draining and rollback. Moving workers alone does not create high availability.
- [ ] **PERF-01** Define realistic active-user, arrival-rate, request-mix and provider-latency scenarios for launch plus TikTok-driven bursts; distinguish accounts, tickets, concurrency and requests/second.
- [ ] **PERF-02** Test target-host mixed load: login, history, availability, manual/random quantity purchases, deposit callbacks, admin actions, cutoff and background exports, including near sellout.
- [ ] **PERF-03** Test queue fairness, bounded admission, bypass attempts, abandoned sessions and recovery after bursts. Measure actual queue wait and serve an honest estimate/status.
- [ ] **PERF-04** Record p95/p99 latency, completion/error rates, CPU/RAM/IOPS/network, pool waits, lock contention, deadlocks, job age and reconciliation lag. Tune indexed queries and transaction duration first.
- [ ] **PERF-05** Run soak and controlled failure tests for restarts, dependency slowdown, disk/network problems and worker retries. Use synthetic provider load unless the provider explicitly authorizes high-volume tests.
- [ ] **PERF-06** Agree measured launch admission limits and thresholds that trigger scaling, pause or rollback; publish a capacity report without converting local reservation benchmarks into payment-user guarantees.

## 14. Backups, disaster recovery, monitoring and operations

- [ ] **OPS-01** Configure scheduled and admin-requested external encrypted backups of operational data and private media with checksums, status, independent key custody and failure alerts.
- [ ] **OPS-02** Agree retention/immutability/access policy and test key recovery; distinguish database, private media, Sanity content, infrastructure configuration and separately protected secrets.
- [ ] **OPS-03** Implement continuous WAL/PITR if required by the agreed RPO. Verify archive freshness; logical snapshots alone must not be advertised as five-minute recovery-point protection.
- [ ] **OPS-04** Rehearse full recovery on a replacement host into an isolated database with realistic data, media, secrets and networking. Measure elapsed RTO and lost-data interval, not just restore-command time.
- [ ] **OPS-05** Revoke restored sessions, keep recovery lock enabled, reconcile ledger/tickets/provider events since the restore point, fence the old writer and require authorized reopening.
- [ ] **OPS-06** Deploy protected Prometheus/Grafana dashboards, external uptime checks and remote structured logs; confirm alerts reach named humans and escalation works if the VPS is down.
- [ ] **OPS-07** Alert on errors/latency, database saturation/disk, queue age, failed deposits/reconciliation, unusual staff changes, ledger discrepancies and stale/failed backups.
- [ ] **OPS-08** Test global/per-round sales pause, deposit pause and recovery lock; preserve history/support access where safe and show customers clear status.
- [ ] **OPS-09** Write and exercise runbooks for provider outage, unsold-round closure, restore, security incident, deployment rollback, account restriction and external prize-payment reconciliation.
- [ ] **OPS-10** Make backup freshness, last successful restore, measured RTO/RPO, incident contacts and action permissions understandable in the admin portal; no unguarded production restore button.

## 15. Release, documentation and client acceptance

- [ ] **DOC-01** Keep the client proposal, architecture, operating guide and screenshot-to-feature mapping aligned with confirmed scope; label implemented versus planned behavior.
- [ ] **DOC-02** Re-estimate the expanded wallet/admin project with milestones, external dependencies and contingency; obtain client agreement before treating a date as committed.
- [ ] **DOC-03** Update the old Sanity/screenshot versus new backend comparison with actual plan/usage evidence where available. Do not promise the untouched version handles a 25,000-person burst.
- [ ] **DOC-04** Deliver the measured one-server capacity, queue-wait scenarios, downtime/recovery limits, recurring costs and scaling triggers in client-readable language.
- [ ] **REL-01** Pass relevant unit, integration, concurrency, browser and accessibility checks for the release revision; record environments and intentionally deferred coverage.
- [ ] **REL-02** Complete approved payment sandbox and limited live checks; confirm no test credentials/data or unsupported funding methods reach real customers.
- [ ] **REL-03** Resolve release-blocking security findings and review production configuration, staff permissions and data exposure.
- [ ] **REL-04** Demonstrate external backup restore and failure alerting; accept measured recovery targets and incident ownership.
- [ ] **REL-05** Complete migration rehearsal/final reconciliation, staff training and player/admin acceptance in all supported languages and mobile layouts.
- [ ] **REL-06** Obtain a recorded go/no-go against policy, funds integrity, capacity, security and recovery evidence; set a controlled launch window with rollback criteria.
- [ ] **REL-07** Launch gradually under measured admission limits; reconcile early real deposits/purchases and monitor queue/provider behavior before a large advertising campaign.
- [ ] **REL-08** Handover source/deployment documentation, permissions, recovery-key custody, incident contacts, operating budget and maintenance ownership securely.
- [ ] **REL-09** Schedule the initial production review and continuing patch, access, reconciliation, restore-drill and capacity reviews with responsible owners.

## 16. Later roadmap — excluded from initial completion

- [ ] **LATER-01** Phone OTP: choose an approved SMS provider, delivery markets, abuse/cost controls and verified account-recovery strategy; estimate separately.
- [ ] **LATER-02** Additional international/bank processors: validate eligibility, currency/settlement, fees, asynchronous verification and refunds before implementing/testing an adapter.
- [ ] **LATER-03** Native mobile apps: assess shared API/auth integration and UI reuse, secure device storage, deep links, accessibility and applicable store distribution rules; do not assume a website clone is sufficient.
- [ ] **LATER-04** Higher availability: dedicated/managed database, redundant application/ingress, tested failover and standby promotion with old-writer fencing as budget and uptime targets justify.
- [ ] **LATER-05** Evaluate new referral/commission programs, screenshot-based new purchases, withdrawals, automated payouts or a new draw engine only through a separate explicit scope decision. Preserve existing historical records meanwhile.

## Release stop conditions

Do not enable real-money sales if any of these remain unresolved: provider eligibility/approval; unbalanced or double-spendable money; duplicate ticket allocation; unauthorized customer/staff data access; undefined rules required for the round being opened; unresolved release-blocking vulnerabilities; absent external recovery evidence; missing incident/financial ownership; or target-host capacity/admission controls not tested.

Development may proceed on independent tasks while a dependency is blocked. A pilot remains a single-server failure domain until redundancy is implemented and tested. Zero downtime, zero external duplicate charges and 100,000 simultaneous checkouts are not promised by checking off architecture tasks.

## Evidence register and work log

Use one row per completed task or coherent tested group. Link a detailed test report rather than pasting private outputs. For an incomplete task, record the blocker here without checking its box.

| Date | IDs | Status / environment | Evidence | Remaining limitations / next action |
| --- | --- | --- | --- | --- |
| 2026-09-28 | SCOPE-01–10 | Decisions recorded | Player/admin specifications and client confirmations | Implementation and production acceptance remain open |
| 2026-09-28 | Checklist creation | Documentation only | This file; local link/ID/format checks | No application tests or production checks run for this documentation task |
| 2026-09-28 | BASE-01, AUTH-11, ADM-11–13 | Complete for first increment / local | [Admin validation](ADMIN_PORTAL_VALIDATION.md); modified/new source and tests in current working tree | Production, full MFA end-to-end, wallet, advanced permissions, translations and approval flows remain open |
| 2026-09-28 | LOT-01/02, ADM-14 | Complete for templates/rounds increment / local | [Round contracts, migration and verification](LOTTERY_ROUNDS_IMPLEMENTATION.md); source and executable tests in current changes | LOT-03/04 and ADM-02 remain broader release tasks: public portal, cancellation policy, full inventory/wallet rollout and target-server acceptance are incomplete |
| 2026-09-28 | FIN-01/03/07/08, ADM-15; FIN-02/04/05 and PAY partial | Complete for local test-deposit increment / broader release open | [Wallet ledger, contracts and validation](WALLET_DEPOSITS_IMPLEMENTATION.md); Go/PostgreSQL race tests and fixture browser checks | Live deposits blocked; wallet ticket purchase, privilege separation, provider sandbox, business exceptions, external reconciliation and wallet restore/load acceptance remain open |

### Historical evidence — useful foundations, not current release sign-off

| Date | Existing evidence | Interpretation |
| --- | --- | --- |
| 2026-09-24 | [Implementation validation](VALIDATION.md): local auth/payment/reservation/browser checks; 25K reservations with 100 workers | Direct-payment foundation only; not the revised wallet system or a target-VPS concurrency guarantee |
| 2026-09-26 | [Operations validation](OPERATIONS_VALIDATION.md): local concurrent replay tests and synthetic encrypted backup/restore | Local evidence; external backup custody, full-host restore, real provider checks and production monitoring were not demonstrated |
| 2026-09-28 | Limited source review recorded in [admin architecture](ADMIN_PORTAL_ARCHITECTURE.md) | Identifies modules/gaps; not an exhaustive security audit |

### Required completion record

For each task marked complete, record: **task ID; implementation/revision or decision reference; date; environment; checks and result; reviewer where required; remaining limitations**. A checked policy decision needs a client decision reference; an implemented money/access control needs executable verification; a deployment task needs deployed-environment evidence.

## Project references

- [Player portal and ticketing specification](PLAYER_PORTAL_AND_TICKETING_SPEC.md)
- [Admin portal and scalable architecture](ADMIN_PORTAL_ARCHITECTURE.md)
- [Existing backend architecture](BACKEND_ARCHITECTURE.md)
- [Backend setup and cutover](BACKEND_SETUP.md)
- [Operations runbook](OPERATIONS_RUNBOOK.md)
- [Capacity and operations comparison](CAPACITY_AND_OPERATIONS_REPORT.md)
- [Client proposal](CLIENT_BACKEND_PROPOSAL.md)
- [Earlier baseline timeline — needs re-estimation for expanded scope](PROJECT_TIMELINE.md)
