# Rimna operations runbook

This implements operator tools, not a claim of a configured live service. Use the selected 8 CPU / 16 GB VPS as a measured pilot. Customer queuing, production credentials, external alert delivery, WAL/PITR and the real-server capacity test remain deployment work.

## 1. Release and roles

Apply `003_operations.sql` through the normal migration command before deploying the updated API/worker. Keep one shared PostgreSQL writer for all application instances. Use one versioned container image for API and worker; deploy each with its appropriate `PROCESS_ROLE`. Run schema migrations once, not concurrently from every container.

All API instances must use the same authentication issuer and database. Total API/worker/auth database connection budgets must fit PostgreSQL; moving a process to another VPS does not justify unbounded connection pools. Private receipt files must also be available to each API serving downloads: use shared private storage or an object-storage adapter before adding those hosts. Do not independently copy live databases and allow both copies to accept purchases.

Add permissions for the new tables to existing least-privilege roles:

- API: read `operations_control`, `backup_jobs`, `worker_heartbeats`; insert `backup_jobs`; update only normal sales-control fields, not `recovery_locked`; insert audit records. Existing order permissions remain required.
- Worker: read operational controls; insert/update heartbeat; existing reconciliation permissions.
- Backup operator: read the complete database including `auth`, plus select/update `backup_jobs`; insert jobs for scheduled backups. `pg_read_all_data` is one possible dedicated read role; review access carefully. It does not bypass row-level security if later enabled.
- Restore operator: owns a NEW empty target database and can restore schemas. Never give this credential to the website/API.

## 2. Pausing sales

Use **Management → Operations, sales pause & backups**. Enter a reason and choose **Pause new sales**. Administrator role and MFA are required by the existing staff gate. Reviewers can see operational status but cannot change it.

The pause is database-enforced and affects new reservations across all API hosts after the pause transaction commits. Existing committed holds/payment attempts and reconciliation can continue; the button is not a provider-wide cancellation. History and status remain accessible. Preserve Chapa webhook access during incidents. Draw settings still apply after global resume.

For a break-glass database pause when the UI is unavailable, a trusted operator can run:

```sql
BEGIN;
UPDATE operations_control SET sales_paused=true,reason='Incident: operator pause',updated_at=now(),updated_by='operator' WHERE id=true;
INSERT INTO audit_log(actor,action,resource) VALUES('operator','sales.pause','Incident: operator pause');
COMMIT;
```

Record who used this access in the incident log. If the database is unavailable, stop new checkout admission at the edge. Do not represent a temporary queue position as ticket ownership.

## 3. Configure encrypted backups

Install supported PostgreSQL client tools matching the server major version, Python 3 and Restic on a trusted operator host. The web application does not execute backup commands or receive repository credentials.

1. Create a private backup bucket/repository **outside the VPS**. Select storage with suitable retention/versioning or immutability and controlled deletion rights. Test Restic compatibility with the chosen storage policy.
2. Create a `rimna-backup` OS user and `/var/lib/rimna-backup`, owned by that user, mode 0700. It needs space for the dump, temporary archive and Restic cache. Full screenshot archives can exceed free VPS space; measure this before enabling large backups.
3. Copy `backend/ops/operator.env.example` to `/etc/rimna/operator.env`, with real credentials, mode 0600. Use a direct database connection for dumps, not a transaction pooler. The helper accepts explicit PostgreSQL URLs and common TLS settings; production network connections require certificate-verified TLS.
4. Store the repository password in `/etc/rimna/restic-password`, readable only by the operator. Keep a separate secure recovery copy. Do not put secrets in Git or the admin interface.
5. Set `MEDIA_DIR` to the immutable private media directory. An empty directory is required if no legacy media exists. Finish/pause imports before backing up.
6. Initialize the repository once with `restic init` using the protected operator environment. This does not happen automatically on typoed configuration.
7. Install the supplied `backup.service` and `backup.timer` as `rimna-backup.service` / `rimna-backup.timer`. Adjust absolute paths for the installation; enable the timer after a successful manual run. The timer checks every minute and creates a scheduled job approximately hourly. Only one queued/running backup is allowed globally.
8. In the administrator UI, request a backup and verify **succeeded**, a snapshot reference, and the external repository contents. **Queued** means waiting for the operator runner, not protected data.

A trusted operator can also execute:

```sh
python3 /srv/rimna/backend/ops/operations.py schedule
```

Load the environment securely before invoking it; the script does not automatically read a dotenv file. `once` processes an existing administrator request without scheduling another. Tool failures are reported without printing credentials. A terminated job is marked failed after its two-hour job window when the runner resumes. An entirely stopped runner needs monitoring; the UI will not invent success.

The archive contains a consistent custom-format PostgreSQL dump (accounts and operations), the original private media and SHA-256 manifest. Restic encrypts it and the runner checks repository structure. Secrets and Sanity content are separate backup scopes. Raw operational backups contain sensitive data; keep staff access tightly limited.

**Recovery point:** hourly logical snapshots are not continuous transaction recovery. Implement monitored WAL archiving/PITR or select managed PostgreSQL before promising a five-minute recovery point. The lost-data window can exceed the interval if a backup is slow or fails.

**Retention:** start by agreeing a documented policy such as hourly snapshots for 48 hours, daily for 30 days and monthly for 12 months, subject to the business's privacy/accounting requirements and storage budget. Run and review `restic forget --dry-run` before enabling pruning. Pruning is deliberately not exposed to the admin UI or automatically installed by this change. Keep deletion credentials separate where the storage supports it.

## 4. Isolated recovery drill

Never restore over a database accepting traffic. Preserve evidence from the failed system, pause admissions and keep a record of the last known successful payments.

1. Create a new empty database and a new private media destination. Use compatible PostgreSQL tools. Do not attach a running API/worker to the target during restoration.
2. Load operator credentials, set `RESTORE_DATABASE_URL` to the new database, and select the full 64-character snapshot ID from the backup record. `latest` is intentionally not accepted.
3. Run:

```sh
python3 /srv/rimna/backend/ops/operations.py restore SNAPSHOT_ID --media-destination /srv/rimna/recovered-media
```

4. The helper rejects the source identity and nonempty targets, validates archive paths and hashes, restores the dump in one transaction, sets sales/reconciliation recovery locks, clears restored login sessions and checks allocated-number uniqueness. Media restoration must also complete; if it fails, leave the target locked and investigate. Do not reuse a partially restored target as an empty target.
5. Compare accounts, orders and ledger totals by currency against the backup and external payment records. Validate representative media, known paid numbers and administrator access. Restore separate auth/encryption secrets and required runtime database grants: dumps omit ownership/ACLs intentionally.
6. Reconcile provider transactions after the backup capture time before any number can be resold. The helper cannot recover post-snapshot ticket choices from a provider statement alone if that metadata was not retained elsewhere. Missing evidence requires manual resolution, not guessing. This is why a short, tested PITR window matters.
7. Fence off the old application/database writer. Switch the stable API domain/load balancer and all auth/database connection settings together. Test the replacement with sales still paused.
8. Only the trusted operator may clear `recovery_locked` after documented sign-off. Keep `sales_paused=true`, restart workers, check reconciliation and then let the administrator resume reviewed draws. Record these steps in `audit_log` and the incident record.

A restore drill does not contact Chapa or charge/refund a customer. Restic encryption and manifest checks protect archive integrity; they do not establish that payment reconciliation or the whole disaster recovery has completed.

## 5. Metrics, logs and alerts

Set a random `METRICS_TOKEN` of at least 32 characters, or `METRICS_TOKEN_FILE`, in every API. Put the same value into `backend/ops/monitoring/secrets/metrics_token`. Create a separate strong Grafana administrator password file. Ensure these files are readable by the container service users but restricted on the host. They are ignored by Git.

The monitoring Compose configuration joins the stock backend's private Docker network (`rimna-backend_default`). Override `RIMNA_NETWORK` if the deployed network differs. Prometheus scrapes the private `api:8080/metrics` endpoint with a bearer secret. For separate hosts, use private networking and certificate-verified HTTPS; do not expose plaintext metrics tokens across the public internet.

Grafana and Prometheus bind to loopback. Access them using SSH/VPN, not an open dashboard. The supplied dashboard covers API rate/latency, payment backlog, refund review, heartbeat, backup age and database connections. Image versions are explicit reproducibility baselines; scan and update them before production deployment.

Prometheus alert rules are supplied, **but no email/paging recipient is configured**. Connect an Alertmanager or managed monitoring receiver, nominate primary and secondary responders, and perform a test alert. Do not consider alerts operational until delivery is verified. For host disk, CPU, memory and external HTTP/TLS health, add a host exporter and an external uptime monitor. Those are additional deployment components, not delivered application metrics.

JSON application logs contain request IDs, normalized routes, status and duration. They deliberately omit request bodies, query strings, player identities and authorization headers. Rotate local container logs; ship restricted logs to an external log service for investigations that must survive host failure. Loki/Alloy or a managed log service can be added, but are not preconfigured in this change. Review reverse-proxy logs separately: default proxy logs can include query strings.

## 6. Incidents and release controls

Maintain an operator-owned contact sheet outside public documentation with:

- Primary/backup responder, coverage hours and tested alert destination.
- Hosting, database, payment-provider and DNS support contacts.
- Authority to pause sales, refund payments and approve recovery/cutover.
- Timestamped incident log and customer communication owner.

On serious payment, database or security errors: pause new admissions/reservations, preserve webhook/reconciliation paths where safe, inspect logs and provider records, resolve/recover, reconcile, document and only then resume. Do not restart all services repeatedly or re-initialize uncertain payments.

Before a campaign: rehearse rollback, run the target-VPS load test, pre-scale if necessary and verify the external queue cannot be bypassed via the API hostname. A 503/retry response is overload protection, not a customer waiting room. Queue integration and truthful estimated wait times remain acceptance work.
