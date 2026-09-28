# Wallet ledger and verified deposits

Implemented and locally checked: 28 September 2026. This is a test-only increment, not approval to accept customer deposits or a production-capacity certification.

## Delivered

- PostgreSQL migration `005_wallet_ledger.sql` adds separate ETB/USD customer accounts, balanced journals, immutable entries, deposit records and a shared provider-reference registry.
- Deposits have their own records. Existing direct-payment ticket orders and their ledger remain separate. No historical ticket payment is treated as a wallet deposit.
- Signed-in, verified users can view their own balances, deposit history and posted balance history on `/account`. Switching currency does not move money. Only configured ETB test checkout can be enabled; USD funding has no provider yet.
- Administrators have `/admin/wallets`: currency-separated accounting totals, mismatch/restriction counts, paginated deposits with account IDs, original-reference verification requests and an independently audited deposit pause control. Reviewers cannot enter this workspace or call its APIs.
- No withdrawal, automatic winnings credit, manual balance editor, refund initiation or wallet-funded ticket purchase is exposed.

## Financial boundaries

Money is represented in integer minor units. Deposit amounts must be positive and within explicitly configured limits, with a technical ceiling of 100,000,000 minor units per deposit. This ceiling is not an approved business limit. Decimal input is parsed exactly; extra decimals are rejected instead of rounded. ETB and USD entries cannot be combined in a journal.

Every posted journal has exactly two equal-and-opposite entries: a customer account and the appropriate provider-clearing or ticket-sales account. PostgreSQL checks balance and counterparties at transaction commit. The journal has a unique operation reference. Entry posting and updating the customer's cached balance happen in the same transaction; rollback removes both changes. Posted journals/entries reject ordinary SQL updates/deletes and later append attempts. Reversals must exactly negate their original journal and can occur once.

Customer balance locks serialize competing debits across processes. A purchase debit cannot exceed the available balance or spend a restricted wallet. The internal debit primitive is tested, but **ticket issuance is not yet connected to that primitive**. The next increment must issue tickets and post their debit in one transaction.

System counterparties do not update a global cached balance for each purchase/deposit. This avoids making all customers contend on a single currency balance row. The authoritative system balance is its ledger entries.

Pending or uncertain deposits contribute only to the displayed pending amount. They are never available funds. Restriction sets available funds to zero without erasing accounting history. External prize payments never credit the wallet.

A provider-verified full refund appends a reversal, including when the refund arrives after a credit. If a future purchase has already consumed those funds, the accounting balance can become negative and the wallet is restricted; available funds stay zero. A refund verified before any credit prevents a later out-of-order success from crediting it. Partial refunds/unsupported verification states go to review; a previously credited wallet is restricted. This does not settle the business policy for disputes, fees, partial refunds, customer notification or unfreezing accounts.

Database triggers protect ordinary application mistakes. Database owners/superusers can alter triggers; separate migration/runtime credentials and restricted database grants must be completed and tested before production. The internal balance report is not bank settlement reconciliation or a full accounting audit.

## Deposit lifecycle and duplicate protection

1. The authenticated user submits currency, exact amount, phone, provider and an idempotency key. Account ownership and customer identity come from the verified session, not the request body.
2. The server enforces funding configuration, limits, provider support, operational/recovery controls and a maximum of three unresolved deposits per user. It stores an `initializing` intent before calling Chapa.
3. A repeated key with the same request returns the original deposit. A changed request with that key conflicts. Only the creator initializes checkout. A timeout does not cause the server to create another provider payment.
4. The browser preserves the same attempt key and frozen request in account-scoped session storage before sending. An interrupted request can be retried after reload without creating a new intent. Tokens are never stored there. The small retry record contains the entered phone/amount and is removed when a response is received; closing the tab clears session storage. A definitive response to an uncertain provider initialization directs the user to history/support.
5. Authenticated raw-body Chapa webhooks persist a digest and schedule verification. They do not credit funds. The worker independently queries Chapa using its payment reference.
6. Verification must match merchant reference, provider reference, amount, currency and environment before a single credit can commit. A provider receipt cannot be attached to another customer's deposit, another deposit, or an old direct ticket order. Replay and out-of-order notifications do not add another credit.
7. Missing initialization references older than 15 minutes move to staff review. Staff may attach the original provider reference and schedule verification; this never bypasses the financial checks. An attached reference cannot be replaced through the admin API. Mistaken references need a controlled exception procedure before launch.

This prevents duplicate application credits for a single payment/intent. It cannot promise that a provider or customer never initiates two genuinely different payments. Provider-side transaction reconciliation, refunds and clear customer handling remain necessary.

## Operations and scaling

- `DEPOSITS_ENABLED=false` is the default. Migration 005 also sets `operations_control.deposits_paused=true`.
- To exercise the test workflow: migrate an isolated test database; configure Chapa test credentials and public test callbacks; set explicit positive `DEPOSIT_MIN_MINOR`/`DEPOSIT_MAX_MINOR`, `CHAPA_MODE=test`, and `DEPOSITS_ENABLED=true`; then an administrator can allow test deposits with an audit reason. Do not repurpose a live database for test balances.
- The current server refuses to start with live mode and enabled wallet deposits. Removing that release guard requires wallet purchase completion, merchant approval for the actual business/wallet flow, policy decisions and staging/provider acceptance.
- Deposit pause prevents new intents. Existing verification continues. Sales pause independently prevents new ticket orders. Recovery lock blocks new deposits and financial credits/reversals until the controlled restore procedure releases it.
- API and worker remain independently deployable Go processes sharing PostgreSQL. Workers claim deposit jobs with database leases and `SKIP LOCKED`; duplicate/stale execution is financially idempotent.
- Provider verification uses a shared database-backed per-minute quota across direct orders, deposits and instances. `PAYMENT_VERIFY_PER_MINUTE=60` is a conservative technical default, **not a confirmed Chapa merchant quota**. Worker batches and retries are bounded; unsuccessful pending checks back off, and settled/failed/review records are periodically rechecked. Signed new events can bring verification forward. Configure quotas and retry latency from staging evidence before launch.
- Customer histories return 50 rows with lookahead. Balance/history reads are rate limited. The browser refreshes visible pages with pending deposits at a jittered 20–25-second interval and avoids overlapping polls; stable history requires manual refresh. Admin reconciliation scans are limited to 10 per minute per administrator. At growth, move full-ledger reports to scheduled reconciliation snapshots and use cursor pagination for deep history.
- Existing database backups include the new tables. The recovery runner also pauses deposits when restoring backups containing the new column, in addition to the recovery lock and sales pause. A restore rehearsal with wallet data, settlement replay and recovery lock remains a release requirement; no live restore was performed in this increment. New alert rules for deposit queue age, restricted wallets, reconciliation discrepancies and provider failures remain open.

## API contract

All player routes require a verified, unexpired/revocable session; responses are private and not cached.

| Route | Purpose |
| --- | --- |
| `GET /v1/wallet` | Separate balances, effective deposit policy, supported methods and test/live mode |
| `GET /v1/wallet/history?currency=ETB&offset=0` | Own posted entries, 50-row page |
| `GET /v1/deposits?offset=0` | Own deposits, 50-row page |
| `GET /v1/deposits/{id}` | Own deposit; another account's ID returns 404 |
| `POST /v1/deposits` | Initialize/retrieve an idempotent intent; `Idempotency-Key` required |
| `GET /v1/admin/wallets` | Administrator-only internal balance comparison |
| `GET /v1/admin/deposits?offset=0` | Administrator-only deposit review page |
| `PUT /v1/admin/deposits/{id}` | Schedule verification with `{ "reference": "original-provider-reference" }` |
| `PUT /v1/admin/operations/deposits` | Pause/allow new intents with `{ "paused": true, "reason": "…" }` |

The staff routes use existing enabled-admin/MFA-enrollment checks, not a new unrestricted role. Full step-up/independent-approval work remains tracked separately.

## Verification evidence

Real, isolated PostgreSQL integration tests with Go's race detector cover:

- 25 simultaneous identical deposit requests: one deposit and one provider initialization.
- 25 simultaneous successful confirmations: one credit and one customer ledger entry.
- Reused receipt across deposits/accounts and direct ticket orders rejected.
- Wrong reference, merchant identity, amount, currency and environment rejected.
- Full-refund replay; refund before credit; stale success after reversal.
- 20 simultaneous internal debits against limited funds: only affordable debits commit; subsequent refund restricts the negative accounting balance.
- Journal imbalance, cross-currency entries, posted-entry edits, direct cached-balance edits, identity changes and later journal appends rejected; rollback leaves balance unchanged.
- Deposit bounds, maximum amount and currency isolation.
- Provider outage, mismatched verification, recovery lock, independently paused funding and uncertain initialization without repeated checkout.
- Real HTTP authorization/owner filtering, revoked staff/session behavior, signed callback replay, forged callback rejection and callbacks unable to credit without independent verification.

Frontend checks passed: TypeScript, lint, an optimized production build, 25 regression tests (including three account-switch/retry safety tests), and local Chrome fixture tests in `scripts/test-wallet-portal.cjs`: decimal amount, separate currencies, checkout link restrictions, retry-key persistence across reload, staff pause/recheck controls, reviewer denial and desktop/mobile layout. `scripts/test-admin-portal.cjs` checks existing admin workflows. Provider/auth fixtures are not a live Chapa or Better Auth browser acceptance test.

The runnable backend tests live in `internal/store/wallet_test.go` and `internal/httpapi/admin_integration_test.go`, alongside existing provider/authorization tests. Use `TEST_DATABASE_URL` pointing to a disposable PostgreSQL database and run `go test -race ./...`; the HTTP integration tests require the documented Better Auth fixture tables. Never point the tests at production.

## Remaining release work

Wallet-funded quantity purchases with atomic ticket issuance; payment-provider sandbox acceptance and quotas; refunds/disputes/unfreezing policies; deposits' displayed fees/approved limits; provider settlement reconciliation; operational alerts and wallet restore rehearsal; deployment database privilege separation; production load/security tests; approved international funding; native-language review of new portal copy. New wallet copy uses the translation helper but untranslated keys currently fall back to English.

No real credentials were introduced, no live customer deposit was made, and no deployment was performed. Local tests establish correctness for the covered cases, not a guaranteed 25K/100K-user capacity or absence of all bugs.

## Provider documentation consulted

- [Chapa v2 hosted payments](https://docs.chapa.global/docs/v2/integrations/accept-payment)
- [Chapa v2 verification](https://docs.chapa.global/docs/v2/integrations/verify-payment)
- [Chapa v2 webhooks](https://docs.chapa.global/docs/v2/integrations/webhooks)
- [Chapa security guide](https://docs.chapa.global/docs/v2/security/security-guide)

Current v2 verification uses the Chapa payment reference. Where verification does not return mode, the adapter uses its authenticated key environment; a returned conflicting mode is rejected. Real merchant sandbox fixtures must confirm the account's actual responses before release.
