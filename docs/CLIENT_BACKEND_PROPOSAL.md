# Rimna Digital Lottery
## Backend Upgrade, Payment Options & Phased Launch Proposal

**Prepared for:** Rimna project stakeholders  
**Date:** 25 September 2026  
**Purpose:** Agree on the operating model, launch scope and investment priorities before production rollout.

## 1. Project introduction

Rimna Digital Lottery is a web platform designed to let eligible players discover available draws, select a ticket price and pool, choose an available ticket number, and participate in a draw. The website also presents draw information, results, promotions and supporting information in English, Amharic and Tigrinya.

The website and CMS work to date includes:

- A responsive interface for desktop and mobile visitors.
- Ticket price, currency and pool selection, with number availability information.
- Draw information, countdowns, broadcast links and published winner results.
- Website content, translations, language defaults, advertisements and testimonials managed through Sanity.
- A screenshot-based payment submission workflow, with player exports and payment-image downloads for staff review.
- CMS content backup and restoration tools.

The initial approach puts much of the management workflow in Sanity. The proposed upgrade separates website publishing from financial and player operations, adds personal player accounts, and establishes a stronger foundation for reliable purchases and future growth.

This document distinguishes existing website capabilities, local development groundwork and proposed production features. It does not represent confirmation that a payment provider has approved the business or that the new backend is already operating in production.

## 2. What will change

**Sanity will continue to manage website content. A dedicated backend will manage the business transactions.**

| Sanity: website publishing | Dedicated backend: operational management |
| --- | --- |
| Page text and translations | Player accounts, sessions and permissions |
| Branding and general website settings | Draw sales settings, prices, capacity and deadlines |
| Advertisements and testimonials | Ticket availability, reservations and ownership |
| Editorial announcements and explanatory content | Orders, verified payments, refunds and payment exceptions |
| Promotional media | Review queues, operational exports and audit history |
| Content backups | Operational backups, reconciliation and recovery |

The website can display both types of information, but payment status and ticket ownership will have one authoritative source: the operational database. Changing promotional text in the CMS will not change a player's payment or issue a ticket.

Players will be able to sign in, purchase available tickets, and see their own current and previous orders. Staff will receive a dedicated management area with access based on their responsibilities.

## 3. Client options

### Option 1 — Player account foundation

This option introduces registration, secure login, account recovery and a personal dashboard. It is the foundation for Options 2 and 3; authentication alone does not verify a payment or complete the purchasing system.

There are two practical login choices:

| Login choice | Benefits | Costs and limitations |
| --- | --- | --- |
| **A. Email and password using Better Auth** | Familiar account model; no SMS cost for each login; suitable starting point where players use email | Requires reliable verification/reset emails; players must manage passwords and retain access to their email |
| **B. Phone number and one-time SMS code using Better Auth** | Convenient for a phone-first audience; no password to remember | SMS charges, delivery delays, country/operator coverage, resend abuse, and support when a number is lost or reassigned |

Phone OTP and Better Auth are not competing technologies. Better Auth supports a phone-number plugin, while a separate SMS provider must deliver the codes. [Better Auth phone-number documentation](https://better-auth.com/docs/plugins/phone-number)

For either choice, staff accounts should require an additional authentication factor. Account recovery, login limits and session revocation are part of the scope. A verified phone number or email proves access to that contact channel; it does not by itself verify age, legal identity or eligibility to participate.

**Suggested starting choice:** email/password for the initial technical pilot. If the target audience strongly prefers phone login, select OTP before public launch after testing local delivery and agreeing a monthly messaging budget. Avoid building both at launch unless there is a clear need.

### Option 2 — Accounts with payment screenshot submission

The player signs in, selects a ticket, pays through an approved external payment channel, and submits the payment reference and screenshot. Staff compare the submission with actual bank or provider records before approving it.

The dashboard would show understandable stages such as **Awaiting payment, Under review, Approved, Rejected, Expired** and **Refund required**, together with purchase history and explanations where appropriate.

Staff would receive a review queue, duplicate-reference checks, approval/rejection controls, reviewer audit records, Excel exports and controlled screenshot downloads. Uploaded images would remain private.

**Benefits:** supports a controlled manual operating model and gives players visibility into a process that would otherwise happen through messages or spreadsheets.

**Limitations:** approval depends on staff availability. Screenshots can be edited, reused, unreadable or linked to the wrong transaction. A screenshot is supporting evidence, not proof that funds reached the correct account.

The client must approve rules for how long a number remains reserved, how late payments are handled, and what happens when a receipt arrives near draw closing time. Indefinite reservations can block sales; releasing a number too early can produce a paid customer without the requested ticket.

**Best fit:** a smaller, legally and commercially approved pilot with sufficient review staff. This is additional software and operational scope; the complete authenticated screenshot workflow is not yet delivered.

### Option 3 — Accounts with integrated payments

The player signs in, selects a ticket and pays through an approved provider's checkout. The backend verifies the result directly with the provider and issues the ticket when the payment and reservation checks succeed. Routine purchases do not require screenshots or staff approval.

For Chapa, the proposed flow is:

1. Temporarily reserve an available number using the server's price and draw rules.
2. Create the payment request and direct the player to checkout.
3. Receive payment notifications and verify the transaction from the backend.
4. Confirm the amount, currency and order reference before issuing the ticket.
5. Show the resulting ticket or payment status in the player's account.

Chapa recommends server-side verification before fulfilling an order; a browser redirect alone is not reliable payment confirmation. [Chapa payment verification](https://docs.chapa.global/docs/v2/integrations/verify-payment)

**Benefits:** faster routine confirmation, less repetitive staff work, stronger transaction matching and a better foundation for larger pools.

**Limitations:** merchant approval, transaction fees, provider availability and service limits remain dependencies. Delayed or disputed payments, refunds and unusual cases still require operations support. Automatic ticket confirmation does not mean immediate bank settlement or automatic prize payout.

**Best fit:** the recommended long-term operating model, once the business and payment channel are approved.

### Option comparison

| Decision | Option 1: accounts | Option 2: accounts + screenshots | Option 3: accounts + integrated payments |
| --- | --- | --- | --- |
| Complete purchase workflow | No; foundation only | Yes, with manual verification | Yes, with provider verification |
| Confirmation speed | Not applicable | Depends on review queue | Usually faster; may remain pending |
| Routine staff workload | Account support | High as sales grow | Lower; exceptions and reconciliation remain |
| Main operating costs | Hosting, email/SMS, support | Foundation costs plus reviewers, media storage and disputes | Foundation costs plus provider fees and payment operations |
| Main dependency | Login delivery and recovery | Approved collection method and review capacity | Approved merchant account and reliable integration |
| Suitability for larger pools | Must add payment model | Increasingly expensive to operate | Preferred, after measured load testing |

## 4. Payment approval: a business dependency

The significant hurdle identified in research is **permission to process lottery-related payments**, rather than simply obtaining an API key. No merchant approval or rejection for Rimna has been confirmed in this proposal.

**Chapa:** its documentation includes gambling and betting among high-risk categories. Additional monitoring, transaction limits, payment-method restrictions, settlement delays and payout controls may apply. This does not establish that Rimna is approved. We should obtain written confirmation covering the actual business model, merchant entity, customer markets and enabled payment methods before live sales. [Chapa high-risk business guidance](https://docs.chapa.global/docs/v2/security/high-risk-business)

**Stripe:** its published prohibited-business list explicitly includes lotteries. We should therefore exclude ordinary Stripe processing from the committed delivery scope for this lottery model, rather than promise it as a future switch that only needs credentials. [Stripe prohibited and restricted businesses](https://stripe.com/legal/restricted-businesses)

**Other international processors or bank payments:** each needs its own eligibility review, commercial agreement and technical assessment. Provider approval and legal permission to operate are separate questions. The client should obtain qualified advice on licensing, eligible countries, age/identity checks, taxes, marketing and prize rules for the intended markets.

The client will need to lead merchant onboarding and provide requested business documentation, ownership information, licenses where applicable, settlement-account details and customer policies. The development team can supply technical flow descriptions and integration support.

Manual transfers and screenshot uploads are not an alternative way around these requirements. The receiving bank or payment service must also permit the actual activity.

## 5. What a 25,000-ticket pool means

Four different quantities must be planned separately:

- **Pool capacity:** how many tickets or numbers one draw offers.
- **Unique players:** how many different people participate; one person may hold several tickets if permitted.
- **Concurrent users:** how many people use the platform at the same time.
- **Request rate:** how much work those users generate each second.

A pool of 25,000 tickets sold over several weeks may create manageable traffic. A launch announcement that sends thousands of people to login and checkout together creates a much harder workload—even for a smaller pool. Reducing pool size alone does not prevent a traffic spike.

The system must handle people requesting the same number, repeated clicks and retries, login bursts, database contention and payment-provider limits. Screenshot uploads add network and storage demands. Each dependency has its own capacity: increasing server size does not increase an SMS provider's or payment processor's agreed limits.

The proposed protections include database-enforced number uniqueness, temporary reservations, safe handling of repeated requests, cached public information, paginated number selection, request limits and background payment checks. Larger launches may need controlled admission or a waiting room.

**What has been demonstrated so far:** local testing recorded 25,000 reservations using 100 concurrent workers, and a separate test allowed exactly one successful reservation when 100 buyers requested the same number. This is useful development evidence, not certification for 25,000 simultaneous online buyers. It did not include real Chapa transactions, public internet conditions or the final hosting environment.

### The operational cost of screenshots

The following is an illustration, not a staffing quotation. Assume **25,000 submissions**, one screenshot each, and **one minute of review per submission**:

| Item | Illustrative requirement |
| --- | --- |
| Direct review time | About 417 staff-hours |
| Ten reviewers, six productive review hours per day | About seven working days |
| Screenshots averaging 2 MB each | About 50 GB of original uploads, before backups |

These estimates exclude duplicate receipts, statement lookup delays, rejected submissions, support, refunds and supervision. At two minutes per review, the review time doubles.

Large Excel and ZIP exports also create privacy, download and reconciliation burdens. An in-system review queue should remain authoritative; downloaded spreadsheets should not become a competing record of ticket ownership. Exports should be access-controlled and produced in manageable batches.

For a manual pilot, calculate the sales cap from measured review capacity and the promised approval time. If customers expect approval on the same day, a queue that takes a week to clear is not an acceptable launch model.

## 6. Recommended architecture and technologies

Our recommendation is a **modular Go backend**: one application codebase with clearly separated responsibilities, plus a background worker. This keeps deployment and debugging manageable while allowing the API and background processing to grow independently.

Microservices are not recommended for the initial release. They introduce additional deployments, network failures and coordination between services. We can separate a module later if measured demand or team ownership justifies it.

| Technology or component | Purpose |
| --- | --- |
| Next.js, React and TypeScript | Existing website, player dashboard and staff interface |
| Sanity | Editorial content, translations and promotional media |
| Go with separated business, database, HTTP and provider layers | Ticket rules, orders, payments and operational management |
| PostgreSQL | Reliable records and transactions for accounts, reservations, tickets and payments |
| Better Auth in the Next.js server layer | Registration, login, recovery and sessions; Go validates authenticated access |
| Chapa hosted checkout, subject to approval | Ethiopian payment collection and backend verification |
| Replaceable payment-provider adapters | Future approved processors without rewriting ticket rules |
| Private object storage, if screenshots are selected | Restricted receipt storage and controlled downloads |
| Email service; SMS service if OTP is selected | Verification, recovery and account notifications |
| Docker; managed application hosting or an operated VPS | Repeatable backend deployment |
| Managed PostgreSQL backups, monitoring and edge protection | Recovery, performance visibility and abuse protection |

Better Auth is a TypeScript component, not a Go library; this is a deliberate boundary within the architecture. Redis can be added later for shared caching or rate limits if measurements justify it. Ticket ownership will continue to be enforced in PostgreSQL.

For launch, managed application hosting and a managed database are preferred where budget permits. A VPS is viable, but someone must own patching, monitoring, backups, incidents and recovery. A single VPS is a single point of failure unless additional resilience is provisioned.

The backend API also provides a foundation for a future mobile application. Mobile screens, secure login storage and payment-return handling would still require separate implementation; the website will not automatically become a production mobile app.

## 7. Security and reliability requirements

The objective is a tested and maintainable system with clear safeguards and operational ownership. No technology choice guarantees the absence of attacks or bugs.

Production acceptance should cover:

- Players can access only their own tickets, orders and private files.
- Staff permissions are limited by role, with additional authentication and recorded actions.
- Prices and ticket eligibility are enforced by the server, including under simultaneous requests.
- Login, OTP, uploads and purchase endpoints have abuse limits and validated inputs.
- Payment notifications are authenticated, independently checked and safe to process more than once.
- Secrets and private media are protected; sensitive information is excluded from ordinary logs.
- Payment failures, late confirmations, refunds and outages have tested recovery procedures.
- Backups can actually be restored, with agreed recovery-time and data-loss targets.
- Dependencies are maintained, security findings are reviewed, and monitoring has a named responder.

Age, identity, location and responsible-participation controls must be defined from the approved business requirements. They are not automatically provided by adding login.

## 8. Recommended phased execution

**Recommended destination: Option 3, with one well-supported login method and incremental growth.** Option 2 should be a deliberate, capped interim choice only where approved collection channels and review staffing are available. If automated payment approval is ready, avoid investing in a full temporary screenshot system unnecessarily.

| Phase | Work and deliverables | Condition for moving forward |
| --- | --- | --- |
| **1. Business and operating decisions** | Confirm merchant eligibility, target markets, login method, draw rules, refunds, retention, staffing and budget | Client approves scope; legal and payment dependencies have a documented path |
| **2. Account and backend foundation** | Complete authentication, operational management, database safeguards, monitoring and migration rehearsal; keep Sanity for content | Ownership, recovery, security and migration checks pass |
| **3. Payment acceptance and pilot** | Test Chapa with real sandbox credentials and public notifications; test failures and refunds; provision production services | Provider approval and end-to-end acceptance complete before real payments |
| **4. Controlled public launch** | Start with an illustrative 500–1,000-ticket draw, or a lower cap if manual staffing requires it; monitor actual demand | Ticket and payment records reconcile; agreed response times and support targets are met |
| **5. Measured growth** | Consider 2,500, then 5,000 and 10,000 tickets across later draws; test marketing bursts and increase resources when needed | Load tests, provider limits, queue performance and operating costs support each increase |
| **6. Larger pools and expansion** | Consider 25,000-ticket draws, greater resilience and separately approved international methods; evaluate mobile delivery | Target concurrency is tested on the deployed system and operational readiness is demonstrated |

The pool sizes above are planning examples, not capacity guarantees. Each new draw should use published prices, prize commitments and rules appropriate to its size. Existing commitments should not be changed simply to make the software easier to operate.

Before scaling, agree measurable targets for normal and peak traffic: response time, error rate, payment-confirmation delay, database headroom, unresolved payments, review backlog and support response time. Set traffic limits and a stop-sales procedure if those targets are exceeded.

Delivery estimates should be finalized after the client selects the operating model. Merchant onboarding, SMS delivery approval and external testing can affect the schedule independently of coding progress.

## 9. Development status and remaining work

The local codebase already contains groundwork for the Go backend, PostgreSQL operations, Better Auth email/password accounts, staff access, player history, Chapa integration and migration tools. Local correctness, authentication and build tests have been recorded.

The following remain production gates:

- Actual Chapa sandbox testing with merchant credentials, followed by approved live activation.
- Production hosting, email delivery, secret management, backups, monitoring and security review.
- Rehearsal with a current production backup and a controlled migration, including reconciliation and rollback planning.
- End-to-end load testing on the intended hosting environment.
- Resolution or safe isolation of outstanding dependency findings, including high/critical findings in retained Sanity tooling.
- Completion of any selected phone OTP or authenticated screenshot workflow, plus applicable eligibility controls.

Existing receipts must not be attached to a new account solely because someone enters a matching phone number. Historical ownership needs a controlled verification process.

Adding secret keys is therefore one final configuration activity, not the only remaining step before production readiness. Automated prize payouts and a new automated draw-selection engine are separate scope items.

## 10. Client decisions and budget ownership

To proceed, the client should select:

1. **Payment model:** integrated payments as the target, or a specifically staffed manual pilot first.
2. **Login method:** email/password or phone OTP, based on the intended audience and delivery budget.
3. **Initial market:** merchant entity, supported countries and currencies, and the person responsible for approvals.
4. **Initial draw size and launch strategy:** gradual access or a promoted opening likely to create a burst.
5. **Service commitments:** approval/confirmation expectations, support hours and refund rules.
6. **Operating budget:** hosting, database, email/SMS, provider fees, storage, backups, security maintenance and support staff.
7. **Operational ownership:** who handles reviews, reconciliation, disputes, content, incidents and customer requests.

Development cost and recurring operating cost should be budgeted separately. A lower initial integration cost can lead to a much higher ongoing review cost; larger pools should be approved against both technical capacity and the business's ability to serve its players.

**Proposed decision:** approve the shared account/backend foundation and provider-onboarding work first; target automated verified payments; launch at a controlled size; expand only after measured evidence supports the next stage.

## 11. Previous system versus the new backend: capacity and launch decision

**Update — 26 September 2026:** The client now expects an audience that could grow to 100,000 users and accepts customer queuing. The selected pilot baseline is Yegara's 8 CPU / 16 GB VPS. A server has not yet been benchmarked, so exact waiting time, downtime and maximum concurrent users remain unmeasured.

| Question | Previous screenshot/CMS version | New Go/PostgreSQL version |
| --- | --- | --- |
| What does it do? | Collects guest payment screenshots for staff review | Authenticates players, reserves numbers and verifies provider payments |
| Can it support a 25,000-ticket round? | Conditional on plan capacity, measured traffic and review staffing; not certified | Supported by the data model; target-server capacity still needs testing |
| Can it handle a 25,000-person burst unchanged? | No evidence supports that promise; no waiting room and a shared settings-document bottleneck | Needs a tested admission limit and waiting-room integration; not yet certified |
| Duplicate numbers | Deterministic IDs protect submissions for the same selection | Unique per-draw database allocation across all API servers |
| Duplicate payment references | Manual staff checks | Provider-reference uniqueness, safe retries and verified payment ledger |
| New rounds | Same price/currency/pool combination reuses earlier number identity | A distinct draw ID separates every round |
| Approval time | Employee review queue | Provider completion and verification; manual exceptions |
| Adding servers | Does not remove CMS contention/allowances | API and worker processes can move to separate VPS hosts using a shared database |
| Operations | CMS backups and hosting logs | Admin sales pause, encrypted-backup requests, guarded recovery tools and monitoring configuration |
| Exact uptime and wait | Not measured | Not measured on the selected VPS; pilot remains one failure domain |

The full [Capacity and Operations Comparison](CAPACITY_AND_OPERATIONS_REPORT.md) documents the code findings, subscription limits, workload calculations, waiting-time scenarios, operational safeguards and production acceptance requirements. It is the basis for the client's capacity discussion; pool size must not be presented as a tested concurrent-user limit.

## 12. Estimated delivery timeframe

**Planning update — 27 September 2026:** Allow **8–10 calendar weeks from the agreed kickoff** for the initial production release and handover, assuming one full-time developer working a five-day week. Eight weeks cover the planned work; up to two additional weeks provide contingency for defects and integration issues. This estimates completion of the existing foundations, not a rebuild from zero.

| Period | Milestone |
| --- | --- |
| Week 1 | Confirm scope, prepare staging and start merchant approval |
| Week 2 | Complete player accounts, ticket history and staff journeys |
| Week 3 | Validate Chapa payments, retries and payment exceptions |
| Week 4 | Integrate the waiting room and prepare deployment for later expansion |
| Week 5 | Configure production hosting, external backups, recovery, monitoring and alerts |
| Week 6 | Measure target-server capacity and test security and failure recovery |
| Week 7 | Complete client acceptance, migration rehearsal and staff training |
| Week 8 | Launch gradually, observe the pilot and hand over operations |
| Weeks 9–10 | Resolve contingency items if needed |

The baseline includes email/password authentication, one approved Chapa integration and the selected Yegara 8 CPU / 16 GB pilot. Phone OTP, international processors, a new authenticated screenshot workflow, native mobile apps and deployment across multiple VPS hosts require separate estimates.

Payment-provider approval, access delays and new scope can extend the calendar schedule. Live payments cannot launch before merchant approval. A large advertising campaign should follow successful capacity and recovery tests; the schedule does not guarantee 100,000 concurrent users or zero downtime on one VPS.

The [Detailed Delivery Timeline](PROJECT_TIMELINE.md) lists the weekly deliverables, client responsibilities, exclusions and evidence required before launch. Provide a weekly demonstration and progress report, and confirm the final launch date after acceptance testing.
