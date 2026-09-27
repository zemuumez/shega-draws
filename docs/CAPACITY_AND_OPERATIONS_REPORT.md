# Rimna — Capacity, Reliability and Operations Comparison

**Prepared for the project owner · 26 September 2026**  
**Pilot baseline:** one Yegara VPS advertised as 8 CPU / 16 GB RAM / 160 GB NVMe, with Vercel for the website and Sanity for content. CPU allocation, network speed, storage performance, hosting terms and actual server availability still need confirmation.

## Decision for the client

The original CMS version must **not** be advertised as proven to support 25,000 simultaneous purchasers. It may collect 25,000 submissions gradually if the Sanity subscription, upload/storage allowances, hosting limits and review team support that volume. On Sanity's currently published Free document allowance, it cannot retain 25,000 individual ticket documents.

The new Go version is designed to make ticket ownership and payment processing consistent across multiple servers. One VPS can host its API, worker and database for a controlled pilot. A fair waiting room and a measured admission rate are required before exposing that pilot to an unpredictable advertising burst. A larger audience does not automatically need a larger pool or a larger server: these are separate decisions.

**No exact maximum user count, waiting time or downtime has been measured on the selected VPS.** It has not been provisioned or benchmarked in this task. Providing those as facts now would be misleading. This report states confirmed implementation behavior, numerical scenarios and the tests required to establish production limits.

## 1. Versions examined and evidence boundaries

- **Previous version:** repository commit `7ecd644`, immediately before the Go migration. It uses Next.js API routes and Sanity to collect guest payment screenshots and manage operations.
- **New baseline:** commit `3d874a1`, plus the operations changes accompanying this report. It uses Better Auth, Go and PostgreSQL for player accounts and transactions; Sanity remains editorial.
- The repository revisions have been inspected. The actual production deployment revision, current Sanity subscription, production data volume and traffic were not independently verified. This is not a live-site load test.
- Earlier recorded local tests are described in `docs/VALIDATION.md`. New verification evidence is recorded separately in `docs/OPERATIONS_VALIDATION.md`.
- Neither a UI limit of 100,000 numbers nor a local database stress test is evidence of 100,000 concurrent production buyers.

## 2. Previous version: CMS operations and screenshot payments

### Customer and employee workflow

A guest chooses a price, currency, pool and number; pays through the displayed external payment channel; then sends a reference and screenshot. A Next.js route validates the submission and stores a pending ticket document and image in Sanity. Employees inspect submissions, compare actual payment records, approve or reject them, and export spreadsheets and screenshots.

The flow has no verified player login or private account history. Submitting a receipt is not the same as having a confirmed paid ticket.

### What already protects ticket numbers

The old code generates a deterministic document ID from the price/currency/pool combination and number. Creating that document atomically prevents two submissions through this route from creating the same number document. It also recognizes retries using a submission ID and a fingerprint of the submitted details and image.

This is real protection; the comparison does not assume Sanity has no transactions. It does not prove payment authenticity. There is no unique constraint tying one payment reference to only one different ticket, so staff must detect reference reuse and reconcile actual money received. Direct CMS edits or legacy documents with other IDs are outside the route's deterministic-ID guarantee.

### Important limitations found in the code

1. **One shared settings document is updated during every submission.** A revision-checked transaction protects against settings changing during an upload, but competing buyers also change that revision. The route retries at most three times. Bursts can therefore cause rejected attempts even when different numbers were selected.
2. **Availability reads the matching receipts and returns all taken numbers.** The request is uncached; the application filters by pool size after querying by price/currency. Its read and response work grows with the receipt collection.
3. **Payment occurs before the number is atomically secured at submission.** Another buyer can obtain that number while the first buyer pays or uploads. The customer then needs an alternative number or a refund decision; payment screenshots cannot eliminate this timing problem.
4. **Pool identity does not distinguish rounds.** Reusing the same currency, price and capacity reuses the previous number namespace. Prior tickets continue affecting availability. Changing the pool size creates another selection, but it does not provide proper round ownership/history.
5. **Rejected entries still appear in the taken-number query.** There is no status filter or expiring reservation mechanism in that query. Clearing numbers needs an explicit operating policy; deleting old financial evidence is not an acceptable automatic reset.
6. **No durable customer waiting room was found.** Busy requests fail or need retry; there is no guaranteed queue position or waiting estimate.
7. **Uploads and exports have their own limits.** Each image may be up to 3 MB. Full ZIP exports assemble original files in the employee's browser, which can run out of memory or become impractical at large volumes.

### Can it hold 25,000 tickets?

Sanity currently lists 10,000 documents on Free and 50,000 on Growth, with higher Enterprise allowances. Site content, ticket documents and other counted documents share the allowance. Asset documents are excluded from that document count, but media has separate usage/storage considerations. Thus Free cannot retain 25,000 ticket documents; Growth may fit one such round plus other documents if sufficient allowance remains, but does not have room for unlimited accumulating rounds. The actual subscription must be checked. [Sanity technical limits](https://www.sanity.io/docs/content-lake/technical-limits)

The same documentation lists 25 mutation requests/second and 25 upload requests/second per source IP, plus dataset concurrency limits. These are service limits, **not a guaranteed ticket-sales rate**. Each submission performs several reads, an upload and a transaction; retries and shared-document contention consume additional capacity. Different serverless egress addresses do not remove the application's contention or plan limits. [Sanity technical limits](https://www.sanity.io/docs/content-lake/technical-limits)

**Verdict:** 25,000 gradually collected submissions may be possible on an adequate paid plan, but that is conditional and untested. The unchanged version cannot be certified for a 25,000-person purchase burst or a 100,000-person campaign. It should not be used as an unmodified high-volume bridge while the new version is developed.

### Manual review capacity

For illustration, assume one screenshot per submission and one minute to verify each against actual financial records:

| Workload | 25,000 submissions | 100,000 submissions |
| --- | ---: | ---: |
| Direct review labor | 417 hours | 1,667 hours |
| Ten reviewers working six productive hours/day | About 7 days | About 28 days |
| Original images averaging 2 MB | About 50 GB | About 200 GB |

These are arithmetic estimates, not measured review speeds or storage quotations. Support, duplicated references, rejected receipts, refunds, backups and supervision add work. Reducing queue time requires staff capacity as well as technical capacity.

## 3. New version: accounts, Go operations and verified payments

Players authenticate through Better Auth. Go checks account access and owns the ticket rules. PostgreSQL stores draws, reservations, orders, payment records and audit events. Chapa checkout is initialized from the server, then independently verified before a ticket is issued. Sanity holds website content and translations only.

A single pilot VPS can run separate containers for the Go API, payment worker and PostgreSQL, with an HTTPS proxy. The existing Next.js/Better Auth functions remain on Vercel and need a deliberately secured database connection. Keeping PostgreSQL private while using Vercel requires an approved connectivity solution; opening the database to unrestricted internet traffic is not part of this design.

### Safeguards against duplicates

| Situation | Implemented rule | Boundary of the guarantee |
| --- | --- | --- |
| Two buyers request the same number | A database unique index allows only one occupied number per draw | All API hosts must use the same authoritative database and schema |
| The browser retries the same purchase | Account + idempotency key maps to one order; a changed payload is rejected | The same logical retry must reuse its key |
| Checkout initialization times out | Preserve the uncertain order; do not blindly send initialization again | Provider-side collection still requires reconciliation |
| A provider transaction is submitted for another order | Unique provider/reference mapping and order-reference verification | Depends on authentic provider verification responses |
| A notification is delivered repeatedly | Event deduplication and one payment/refund ledger entry per order | Repeated delivery is expected; duplicate internal financial effects are prevented |
| Several worker instances claim work | Durable database leases coordinate claims | A crash or expired lease may cause verification to run again, so completion stays idempotent |
| Payment arrives after its number was released | Record refund-required; do not issue a second ticket or replace another buyer | Staff must handle the refund using approved provider processes |

We can verify that our application does not issue duplicate ticket ownership or record the same verified transaction twice. We cannot truthfully promise that a bank/provider can never make a duplicate debit. External duplicate collections require detection, reconciliation and refund handling. Database recovery also needs payment reconciliation so that newer paid transactions are not forgotten.

## 4. Side-by-side comparison

| Area | Previous: screenshots + Sanity operations | New: Go operations + Sanity content |
| --- | --- | --- |
| Main purpose | Guest receipt collection and employee review | Authenticated purchases and provider-verified tickets |
| Player accounts/history | No verified account dashboard | Verified login and account-scoped history |
| Operational source of truth | Sanity documents | PostgreSQL transactions |
| Payment approval | Staff check actual transfers | Server verifies provider result; exceptions remain manual |
| Duplicate number protection | Deterministic document ID per selection/number | Database uniqueness per draw/number across all API hosts |
| Reused payment reference | Staff must identify misuse | Provider-reference uniqueness and independent verification |
| Number reserved before checkout | No | Yes, with a bounded expiry |
| Later rounds at the same price/size | Old entries share the same number namespace | Distinct draw IDs keep rounds separate |
| Availability workload | Full matching receipt query and taken-number response | Bounded number pages, indexed queries and short-lived cache |
| Common write contention | All submissions update one settings revision | Per-user coordination and per-number uniqueness; shared read locks for controls |
| 25,000 total tickets | Cannot fit Free allowance; paid-plan fit and performance need confirmation | Fits the application data model; deployment performance still needs testing |
| 100,000-number pool validation | Allowed in the old input validation | Allowed in draw validation; neither is a concurrency certification |
| Verified maximum concurrent users | Not measured | Not measured on the target VPS |
| Customer waiting room today | Not implemented | Still requires edge queue integration; existing busy responses are not a FIFO queue |
| Pause sales | CMS option switches; reservations are not modeled | Individual draw controls plus a database-enforced global pause |
| Backups | CMS documents/original media; large browser archives can be impractical | Encrypted PostgreSQL + private-media snapshots; Sanity content and secrets separately |
| Recovery | CMS restore plus manual receipt/payment reconciliation | Isolated restoration, integrity checks, forced sales/worker lock and payment reconciliation |
| Monitoring | Hosting/CMS logs and manual review workload | Structured request logs, protected metrics and supplied monitoring configuration |
| Scale by adding VPS | More web instances still share CMS limits and the settings revision | Move/add API or worker containers using shared database, secrets and media |
| Pilot failure domain | Depends on Vercel, Sanity and payment/review operations | API/worker/database share one VPS unless separated; VPS failure stops operations |
| Normal customer approval delay | Queue of employee reviews | Provider completion + notification/verification delay |
| Exact downtime or maximum queue wait | Unknown; no measured end-to-end guarantee | Unknown until deployment tests and traffic/admission assumptions are agreed |

## 5. One-server capacity and waiting-time report

The selected 8 CPU / 16 GB machine is the **test baseline**, not a certified 100,000-user configuration. Its RAM is shared by PostgreSQL, application processes, operating system and any local monitoring. Backups and reporting also use CPU, disk and network resources.

Record the following after deployment:

| Measurement | Current evidence | Acceptance method |
| --- | --- | --- |
| Maximum safe new checkouts/second | Not measured | Mixed HTTP workload with provider simulation, then provider-agreed acceptance tests |
| Simultaneous logged-in customers | Not measured | Realistic history and availability access, plus login bursts |
| Same-number collision correctness | Earlier local test: 100 competing reservations, one winner | Repeat across separate API processes against the shared database |
| 25,000 reservations | Earlier local run: 100 concurrent workers, about 15.8 seconds | Database-only evidence; not a hosted-payment benchmark |
| Normal page/API response time | Not measured on VPS | Record p50, p95 and p99 during sustained load and spikes |
| Payment confirmation delay | Live/sandbox provider acceptance outstanding | Measure successful, delayed and missing notification scenarios |
| Restart and deployment interruption | Not measured on VPS | Restart API, worker, database and proxy separately |
| Full-server disaster recovery time | Not measured on VPS | Provision replacement, restore, reconcile and verify access |
| Backup recovery point/data-loss window | Depends on successfully completed backup capture time | Measure scheduled backup health; add WAL/PITR for a tighter objective |

### Customer waiting-time scenarios

Once a fair queue exists, a rough waiting estimate is:

**people ahead ÷ sustainable admissions per second**, assuming stable admission capacity, no outage and no changes in priority. This is time to enter the purchase flow, not time to complete payment or a ticket guarantee.

| People ahead | 10 admissions/sec | 25 admissions/sec | 50 admissions/sec |
| --- | ---: | ---: | ---: |
| 1,000 | 1 min 40 sec | 40 sec | 20 sec |
| 10,000 | 16 min 40 sec | 6 min 40 sec | 3 min 20 sec |
| 25,000 | 41 min 40 sec | 16 min 40 sec | 8 min 20 sec |
| 100,000 | 2 hr 46 min 40 sec | 1 hr 6 min 40 sec | 33 min 20 sec |

**These rates are scenarios, not measured Rimna or Chapa capacity.** Session duration, abandonment, retries and payment quotas also constrain admission. If arrivals continuously exceed service capacity, the queue grows. If sales are paused or the provider is unavailable, a reliable maximum wait cannot be promised. A sold-out draw must stop admitting purchasers and display that status.

The queue must protect authentication as well as checkout during a login surge, prevent direct API bypass, and maintain an understandable customer position. Payment notifications and recovery work must bypass the customer queue. Cloudflare provides managed waiting-room capabilities on eligible plans; purchasing/configuring that service is separate work. [Cloudflare Waiting Room](https://developers.cloudflare.com/waiting-room/)

### Downtime and recovery

- One server cannot promise zero downtime. Hardware, operating-system, network, database and deployment incidents can interrupt service.
- Moving workers to another VPS protects processing from an API-host restart only if their shared database remains available. It does not fix a database-host outage.
- A database standby on the same physical failure domain is not full disaster protection.
- RTO means time to restore usable service. RPO means how much recent data may be missing from a restore. Both must be demonstrated, not inferred from CPU/RAM.
- Proposed business objectives for discussion: a rehearsed recovery within 60 minutes and a recovery point within five minutes once offsite transaction-log archiving is implemented. These are targets, not delivered guarantees. Provisioning or payment reconciliation may take longer.
- The supplied scheduled logical-backup runner is an initial safety layer, not five-minute PITR. Hourly jobs can lose approximately an interval plus backup/upload delay, and longer if jobs fail. High-volume live sales should add monitored continuous WAL archiving/PITR or a managed database before accepting a tighter recovery promise.

## 6. Professional operations and administrator experience

### Sales pause

An MFA-protected administrator can pause new reservations with an audit reason. The control is stored in PostgreSQL and checked within the reservation transaction, so newly added API servers use the same rule. A pause waits for already-running reservation transactions to finish before it takes effect; it is not retroactive. Existing holds may still initialize checkout, and confirmed payments continue reconciliation. History remains accessible.

Individual draw status/deadline controls remain in force when the global pause is lifted. Restored databases have a separate recovery lock that the ordinary resume button cannot clear.

### Backups

The admin can request an encrypted operational backup and see queued/running/succeeded/failed status and the successful repository snapshot reference. A trusted operator runner performs the work outside web requests and never accepts shell commands or a storage destination from the browser.

The archive contains a consistent PostgreSQL dump, including account tables, and verified immutable private receipt files. Restic encrypts the repository. Archive checksums are validated during restore. A successful upload and repository structure check are not substitutes for a restore drill. PostgreSQL documents that a logical dump provides a consistent snapshot while ordinary operations continue. [PostgreSQL backup guidance](https://www.postgresql.org/docs/18/backup-dump.html)

Store backups outside the VPS, protect the repository password separately, and retain the application/authentication secrets in a separate restricted secret store. Sanity content has its own backup workflow. Staff should not download the whole account database onto ordinary laptops as the routine backup process.

### Recovery

Use a fresh database and a new media destination. The operator selects an explicit snapshot; the restore helper rejects an occupied target or the source database identity. It verifies archive paths and hashes, restores transactionally, sets recovery locks, clears restored login sessions, and checks occupied-number uniqueness. No public one-click overwrite of the live database is provided.

The operator then reconciles provider records newer than the backup, resolves late/refund-required payments, restores required secrets and runtime permissions, verifies media and account flows, and approves the cutover. Old hosts must be fenced off before the replacement can issue tickets. Restored data must never be allowed to sell a number that was paid for after the backup.

### Monitoring and incident ownership

The provided Prometheus/Grafana configuration observes request errors/latency, database connection use, worker heartbeat, pending payments, refund-required cases and backup age. JSON request logs use request IDs and normalized routes; they exclude authorization headers, query strings, payment secrets and request bodies. Grafana/Prometheus remain private or VPN-accessible.

An external uptime check is still needed: monitoring on the failed VPS cannot notify anyone if the whole VPS is offline. Alert routing needs a real recipient and a named primary/backup operator. Their contact details and response hours have not been supplied. Graphs alone are not an incident-response arrangement.

## 7. Expansion without rebuilding the application

1. **Pilot:** API, worker and database on the VPS; website on Vercel; externally stored backups; queue and protected operations configured before advertising.
2. **Second VPS:** move or add workers when verification lag is the bottleneck, or add an API behind a load balancer when API capacity/availability is the bottleneck. Do not move workers merely because another server exists.
3. **Database resilience:** use a managed database with failover or a separately operated primary/standby arrangement. Retain one authoritative writer for ticket allocation.
4. **Additional API hosts:** same image version, common database, compatible migrations, same authentication trust and shared private-media access. Use TLS/private networking and budget total database connections.
5. **Higher volumes:** tune indexes and queries, cache public data, adjust admission rates and provider-agreed worker concurrency. Add services only when a measured need justifies them.

Keep public domains stable so customers do not need a different URL when servers are added. Background verification is retry-safe. Planned restarts and migrations should be drained and tested, but an invisible transition or uninterrupted service is not guaranteed on the single-host pilot.

## 8. Recommendation on using the old version temporarily

Do not launch a large TikTok campaign against the unchanged screenshot system on the assumption that a 25,000 pool setting is a capacity guarantee.

A temporary limited release is conditional on: checking the paid-plan allowances, confirming the deployed revision and media privacy, measuring actual submission behavior, staffing the review queue, agreeing number-conflict/refund rules and handling round separation. Adding a waiting room or fixing round identity means modifying that version; those protections do not already exist merely because they are recommended here.

The preferred route is to finish and accept the new operational controls and approved payment integration, test the selected VPS, set a safe admission limit and expand based on results. The client's budget can begin with one server, while the architecture and shared transactional guarantees support later expansion.
