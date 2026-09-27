# Rimna Digital Lottery — Estimated Delivery Timeline

Prepared: 27 September 2026  
Planning baseline: one full-time developer; Yegara VPS with 8 CPU / 16 GB RAM; existing website and backend foundations.

**Allow 8–10 calendar weeks from the agreed kickoff to the initial production release and handover, based on a five-day working week.** The plan contains eight weeks of scheduled work and up to two weeks of contingency for defects and integration issues. This is an engineering estimate, not a guaranteed completion date. Payment-provider approval and delayed access or decisions can extend the calendar schedule.

The intended result is a working, monitored platform that lets players create accounts, purchase tickets through an approved payment provider and view their ticket history. Sanity will continue managing website content. A dedicated Go backend and PostgreSQL database will manage accounts' business records, draws, ticket ownership and payments.

## What this estimate includes

- Completing and validating the existing account, ticket purchase, history and staff-management features.
- Email/password authentication using Better Auth, with verified email, account recovery and stronger protection for staff access.
- One Chapa payment integration, subject to merchant eligibility and approval, including payment verification and handling unsuccessful or uncertain payments.
- Protection against duplicate ticket allocation and repeated processing of the same payment, including retry and concurrency tests.
- A customer waiting room that limits admission to the measured capacity of the pilot server.
- A production deployment, external encrypted backups, a demonstrated recovery, monitoring, alerts and an administrator's sales-pause control.
- Website checks across supported languages and mobile layouts, migration rehearsal, staff training and handover.

Existing local tests and development features reduce the work remaining, but do not replace production testing. The estimate is for completing the current project, not rebuilding it from the beginning.

## Delivery milestones

| Period | Work and purpose | What the client can review |
| --- | --- | --- |
| **Week 1 — Confirm scope and prepare environments** | Confirm the purchase rules, launch market, refund and reservation rules, login method and responsibilities. Set up staging and obtain hosting, domain, email and payment test access. Start merchant approval immediately. Review the existing implementation and outstanding security findings. | An agreed scope, working staging environment, dependency checklist and launch acceptance criteria. |
| **Week 2 — Complete the player and staff journeys** | Finish account registration, login, recovery, ticket selection, purchase status and history. Check staff permissions, draw management, sales pause, translations and mobile usability. Define how historical receipts will be verified before linking them to accounts. | A demonstration of the player journey and staff controls using test data. |
| **Week 3 — Validate payments** | Connect Chapa's test environment. Exercise successful, failed, cancelled, delayed and repeated payment notifications. Verify amounts and references, reservation expiry and late-payment exceptions. Validate the agreed reconciliation and refund process. | A payment test report showing how the system handles each outcome without issuing duplicate tickets or applying a payment twice. |
| **Week 4 — Implement controlled admission and scaling preparation** | Integrate the waiting room, prevent bypass of its admission rules, tune availability updates and database connections, and verify separate API and worker processes. Prepare the deployment so these processes can move to additional servers later. | A queue demonstration, a deployment diagram and a documented expansion procedure. Admission limits remain provisional until load testing. |
| **Week 5 — Complete production operations** | Configure the VPS, private service access, secrets, off-server encrypted backups, monitoring and alert delivery. Complete recovery procedures and the backup frequency or continuous recovery needed for the agreed data-loss target. Test sales pause and operational access. | Backup and recovery evidence, monitoring dashboards, delivered test alerts and an incident-response checklist. |
| **Week 6 — Test performance, security and failures** | Test mixed login, availability, reservation, history and payment workloads on the chosen VPS. Test simultaneous attempts to buy the same number, retries and worker restarts. Resolve security findings and test recovery under realistic conditions. Use simulated provider traffic for high load unless the provider authorizes otherwise. | Measured capacity, queue settings, response times, observed recovery time and a list of resolved or outstanding release blockers. |
| **Week 7 — Client acceptance and migration rehearsal** | Have staff test the complete system. Rehearse the content/operational-data separation, historical data migration, ownership checks, reconciliation and rollback. Fix acceptance issues and train staff on customer support, backups and incidents. | Client acceptance results, a migration checklist and a go/no-go decision for launch. |
| **Week 8 — Controlled launch and handover** | Activate approved live payments, perform agreed small live checks, migrate during a planned window and admit users gradually. Watch queue behavior, payments, errors and database health. Complete documentation and staff handover. | The initial live release, operating guide, measured pilot limits and a prioritized improvement list. |
| **Weeks 9–10 — Contingency, if needed** | Allow time for defects, provider integration issues, additional tuning and release-blocking findings. This allowance is not a promise to absorb new features or an indefinite merchant-approval delay. | Completion of any remaining acceptance items and revised dates where an external dependency remains unresolved. |

Security and testing take place throughout development; Week 6 is the focused release-validation period. Provide the client with a short progress report and demonstration each week, including work completed, blockers and any change to the launch forecast.

## Dependencies that affect the date

The estimate assumes one developer can work full-time on this project, the agreed scope remains stable, and the client provides decisions and acceptance feedback within two working days. Specialist security or hosting assistance must be available when needed; a separate independent security assessment is not included unless commissioned.

The client needs to provide or authorize:

1. The VPS, domain and access to the relevant Vercel and Sanity projects.
2. Chapa merchant onboarding, the required business documentation and test credentials in time for Week 3. The provider must approve the actual lottery business before live payment acceptance. We cannot promise its approval or an approval date.
3. Email delivery, a suitable waiting-room service, external backup storage and the necessary operating budget.
4. Agreed sales, customer eligibility, refund and support policies, plus staff for acceptance testing.
5. Named incident contacts, monitoring recipients and an agreed recovery-time and acceptable-data-loss target.

Development can continue while merchant approval is pending. However, **live payment launch is dependent on approval**. If a provider declines the business or requires a different payment model, the payment scope and timeline must be reviewed. Adding secret keys alone does not complete payment acceptance testing.

## Conditions for launch

The release date is conditional on the following evidence:

- Players can access only their own ticket records; staff privileges and sensitive operations are protected.
- Concurrent purchase attempts cannot allocate the same draw number twice. Repeated payment events do not create additional ticket ownership or ledger entries. External duplicate charges and uncertain outcomes have a tested detection, reconciliation and refund process; no claim is made that a provider can never charge twice.
- Approved payment flows, delayed notifications and operational exceptions have been exercised.
- The waiting room and server pass an agreed traffic test, including attempts to bypass admission controls. The client receives measured limits and conditional waiting-time estimates.
- An off-server backup is restored successfully into an isolated environment. Recovery time and possible data loss are measured against the agreed targets.
- Alerts reach the responsible staff, sales can be paused, and a migration/rollback rehearsal is completed.
- Release-blocking security findings and client acceptance issues are resolved.

**This schedule does not promise 100,000 simultaneous purchases, zero downtime or a fixed customer waiting time.** The single-VPS pilot has a server-level failure risk. The waiting room controls how many customers enter; the audience can be larger than the number admitted at once. Capacity and recovery commitments will be based on Week 6 measurements, with hardware or schedule changes proposed if the results fall short.

## Features outside the initial delivery

The initial estimate excludes native mobile applications, international payment integrations, phone OTP, a new authenticated screenshot-review workflow, automated prize payouts, a new draw-selection engine and production operation across multiple VPS hosts.

These can be planned as later phases. Each needs a separate estimate after its requirements, provider access and acceptance criteria are agreed. Preparing the backend to expand is included; purchasing, configuring and proving future multi-server capacity is a subsequent delivery.

If the client chooses screenshot review as an interim model, it requires its own implementation and staffing plan. It should not be assumed to remove the need for ticket reservation, duplicate-payment checks, recovery or load testing. The unchanged CMS version has not been certified for a 25,000-person traffic burst.

## Recommended client commitment

Approve an **8–10 week planning window for the first controlled production release**, with weekly progress reviews and a launch decision after acceptance testing. Begin with measured admission limits, then increase traffic gradually. Plan major advertising only after payment approval and the capacity tests have passed.

Ongoing monitoring, security updates, backups, customer support and capacity expansion continue after handover and require an operating budget and named owners.

Supporting reports: [Client proposal](CLIENT_BACKEND_PROPOSAL.md), [Capacity and operations comparison](CAPACITY_AND_OPERATIONS_REPORT.md), [Operations validation](OPERATIONS_VALIDATION.md), and [Existing validation and release blockers](VALIDATION.md).
