# Authentication, deposits and external prize settlements — acceptance gate

Updated: 28 September 2026. Requested priority: finish and verify these features before proceeding with wallet-funded ticket purchases. This document specifies the work and required inputs; it does not assert that sandbox acceptance or external prize settlement is implemented.

## Current evidence

- Better Auth is installed and configured for email/password, verified email, password reset, authenticator enrollment/recovery codes and short-lived API tokens. Local auth test coverage exists, but the current end-to-end script does not cover the full forgot-password and subsequent two-step sign-in/recovery lifecycle.
- The Go API verifies token signature, issuer/audience/expiry and live sessions. Existing admin access checks include enabled staff membership and authenticator enrollment. Completed MFA challenges and fresh reauthentication must be validated for every privileged path; an enrollment flag is not sufficient evidence by itself.
- Chapa's deposit adapter and wallet ledger have local concurrency, replay, signature and authorization coverage. Real merchant sandbox acceptance is outstanding. Deposits are disabled by default and live wallet funding remains blocked.
- No Stripe payment adapter or externally paid prize settlement workflow has been delivered yet.
- Existing local configuration has nonempty authentication/database and some SMTP fields. Their presence is not proof of valid credentials or real inbox delivery. Chapa credentials are empty; Stripe credentials are not configured. No existing secret values were printed or changed during intake.

## Required information — reply with non-secret values

| Area | Details needed |
| --- | --- |
| Test environment | Staging frontend URL, Go API URL, and where they run. If none exists, state that; select isolated staging or a temporary test callback endpoint before provider tests. |
| Authentication | Email/password versus additional phone login; optional or mandatory player MFA. Recommend mandatory authenticator MFA for staff. Phone/SMS login additionally needs an SMS provider, supported countries and approved costs. |
| Email delivery | SMTP provider, host, port, TLS mode, sender address/display name, sending-domain verification status and one controlled recipient inbox authorized for signup/reset/security test emails. |
| Staff tests | Owner/admin email and, if independent approval is selected, a second distinct staff test email. Use separate test accounts; no personal passwords or recovery codes are needed. |
| Database | Confirm a separate test database can be used, and where its connection credentials are configured. Do not run mutation tests against production/customer records. |
| Chapa | Whether a merchant test account exists, API version/account guidance, ETB methods available, and whether the provider has reviewed the actual lottery plus wallet-deposit model. |
| International processor | Merchant legal-entity country, intended customer countries/currencies, whether a Stripe sandbox exists, and provider eligibility feedback for this exact business. |
| Deposits | ETB/USD minimum and maximum amounts, whether fees are absorbed or disclosed separately, test-only amounts, and intended refund/dispute policy. UI must distinguish gross payment, fees and credited amount if they differ. |
| External prizes | Who records a payment, who confirms it, payment methods/reference/evidence required, partial-payment policy, and whether the winner must acknowledge receipt. |

The external-prize choice is pending: recommended status progression is Unpaid → Payment recorded → Confirmed paid with distinct staff approval. User confirmation, if selected, is a separate “receipt acknowledged” fact. A screenshot or a staff checkbox alone must not be presented as automatic bank verification.

## Credentials — configure privately, do not send in chat

Use the hosting platform's secret settings for staging, or merge local settings into the existing ignored files. Do not overwrite existing environment files. Keep separate test and live secrets, and never place private keys in `NEXT_PUBLIC_*`, source control, screenshots or CMS content.

### Frontend authentication runtime

Local path: `frontend/.env.local`; staging equivalent: server-side environment settings.

- `BETTER_AUTH_URL`: exact frontend origin for this environment.
- `BETTER_AUTH_SECRET`: strong generated server secret. An existing secret is present; do not rotate it casually because encrypted authenticator material and sessions depend on configuration.
- `AUTH_DATABASE_URL`: isolated test database credentials, consistent with the backend's auth schema access.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, `SMTP_USER`, `SMTP_PASSWORD`: sending service details. Use a dedicated SMTP/app credential, not the personal mailbox login password.
- `NEXT_PUBLIC_API_BASE_URL`: public Go API origin; this value is not secret.

The current SMTP transport needs review for enforced TLS, certificate validation, timeouts, sender verification and production failure behavior. No SMTP authentication values are currently configured locally; that can be normal for a local mail catcher, but does not establish real delivery.

### Go backend

Local path: `backend/.env`; staging equivalent: server-side environment settings. The deployment must actually inject these values into the Go process.

- `DATABASE_URL`, `WEB_ORIGIN`, `AUTH_ISSUER`, `AUTH_JWKS_URL`: matching test environment.
- `CHAPA_MODE=test`, `CHAPA_SECRET_KEY`, `CHAPA_WEBHOOK_SECRET`: Chapa test credentials and the signing secret used by the registered test webhook.
- Existing Chapa callback route: `POST <Go API origin>/v1/webhooks/chapa`. A real provider needs an externally reachable endpoint; a localhost URL alone is insufficient.
- `DEPOSITS_ENABLED`, `DEPOSIT_MIN_MINOR`, `DEPOSIT_MAX_MINOR`: enable only after explicit test limits and isolated storage are ready. The database deposit pause is an additional independent control.

For the proposed Stripe adapter, reserve server-side settings `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET`. These are **planned inputs, not settings consumed by the current backend**. Prefer a scoped sandbox API key; establish its required permissions during adapter implementation. The endpoint signing secret is separate from the API key and depends on the actual registered endpoint or local CLI forwarder. A publishable key is needed only if the selected browser integration uses Stripe.js; hosted redirect checkout need not require one. Do not supply a live key for sandbox work. [Stripe keys](https://docs.stripe.com/keys), [Stripe webhooks](https://docs.stripe.com/webhooks).

Tell the developer which environment/file holds the credentials and that they are configured; never paste their values into the conversation. Do not send personal account passwords, full card details, authenticator secrets or recovery codes.

## Provider eligibility is separate from a passing test

Stripe's published prohibited-business list explicitly includes lotteries. A license or an account with working test keys does not by itself establish Stripe eligibility, and moving the purchase through a wallet does not change the underlying business. Do not promise Stripe for production. Clarify the actual model with Stripe; if unsupported, select an eligible processor using the same application interfaces. No attempt will be made to disguise the product. [Stripe prohibited businesses](https://stripe.com/legal/restricted-businesses).

Obtain Chapa's position for this actual merchant, lottery and deposit model as well; no approval is inferred here. Sandbox testing is technical evidence only, not provider approval or legal clearance.

## Acceptance work before the next feature milestone

### A. Authentication and recovery

- [ ] Review the pinned Better Auth version, relevant security advisories and deployment settings; test any upgrade before adopting it.
- [ ] Enforce correct HTTPS origins, secure session cookies, CSRF/origin checks, short-lived API credentials and revocation across frontend/backend.
- [ ] Test signup, duplicate-account responses, email delivery, verification, expired/reused/tampered links, resend abuse and unverified-account denial.
- [ ] Test correct/incorrect credentials, rate limits across instances and trusted-proxy IP handling; do not expose account existence unnecessarily.
- [ ] Test forgot/reset password with valid, expired and reused tokens, old-password denial, existing-session revocation, and retention of MFA requirements after reset.
- [ ] Test authenticator setup, confirmation, later sign-in challenge, incorrect/replayed codes, one-time backup codes, disable/change protections and lost-factor recovery.
- [ ] Prove staff cannot access privileged APIs before completing required MFA. Protect settlement approval and sensitive changes with fresh reauthentication.
- [ ] Test logout, account switches, revoked staff access, cross-account reads/writes and direct API bypasses.
- [ ] Deliver real mail to an explicitly authorized test inbox; record outcomes without logging secrets, reset links or OTPs.

Better Auth provides email/password and authenticator building blocks; integration testing must cover the application's complete paths. [Email/password documentation](https://better-auth.com/docs/authentication/email-password), [two-factor documentation](https://better-auth.com/docs/plugins/2fa).

### B. Deposits and interchangeable providers

- [ ] Retain a provider-neutral deposit service and ledger. Provider adapters initialize checkout, verify provider facts and authenticate/normalize events; they cannot directly credit balances or publish winnings.
- [ ] Extend normalized states/capabilities as needed for Stripe and future bank processors, including asynchronous payments, provider receipt/event IDs, partial refunds/disputes, expiry and supported currencies. Unsupported operations must be explicit.
- [ ] Use server-side allowlisted providers/methods and currency configuration. Keep secrets in server secret storage; an admin setting must never enable an unapproved provider or execute arbitrary adapter code.
- [ ] Implement hosted Stripe sandbox checkout and its signed webhook handler only as a separate test-capable adapter; keep production unavailable while eligibility is unresolved.
- [ ] For Chapa and the selected international test processor, run actual hosted test success, cancellation/failure, required authentication and asynchronous pending scenarios where supported.
- [ ] Match user-owned intent, amount, currency, provider, merchant reference and environment before a single atomic credit. Browser return URLs do not establish success.
- [ ] Test duplicate requests/events, out-of-order events, forged signatures, wrong amounts/currencies, replayed receipts, provider timeouts, worker restart and webhook retry.
- [ ] Test refunds/disputes and negative-balance restrictions under approved rules. Never silently rewrite the ledger.
- [ ] Confirm actual public callback delivery, reconciliation fallback, shared provider quotas and admin/player status consistency in sandbox.
- [ ] Preserve separate test/live databases and the live-funding guard. Passing deposits alone does not make real stored funds usable before wallet ticket purchases exist.

Chapa setup and event handling must follow the merchant's current API documentation. [Chapa v2 quick start](https://docs.chapa.global/docs/v2/getting-started), [webhooks](https://docs.chapa.global/docs/v2/integrations/webhooks). Stripe test objects simulate payment activity without moving real money. [Stripe testing](https://docs.stripe.com/testing).

### C. Externally paid prizes

- [ ] Bind each prize award to the published round, rank, eligible winning ticket and its owner; preserve amount/currency and multiple prizes through different tickets.
- [ ] Implement the selected record/approval/acknowledgment policy. Store amount paid, date, method, reference, staff identity and private evidence with an audit trail.
- [ ] Reject duplicate settlement submission and concurrent overpayment; define partial settlements before enabling them.
- [ ] Require distinct approvers if chosen; edits invalidate approval. Provide a controlled correction/dispute path rather than deleting history.
- [ ] Show players only their awards, settlement status and history. External prizes do not increase spendable wallet balance; there is no self-service withdrawal.
- [ ] Test unauthorized access, evidence downloads, duplicate payment references, concurrent staff actions and status consistency across portals.

## Evidence and completion standard

Record each test's environment, date, outcome and non-sensitive references. Distinguish local fixtures, real provider sandbox, real email delivery and production checks. “Works perfectly” is not a defensible guarantee; the acceptance report must identify tested cases and remaining risks explicitly. No production activation, real charge, real prize payout or email to an unapproved recipient is part of this sandbox milestone.
