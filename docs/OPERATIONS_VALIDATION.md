# Operations change verification — 26 September 2026

No production deployment, Sanity mutation, real customer data export, live payment or real refund was performed. The selected Yegara VPS has not been provisioned or tested. This report supplements, and does not supersede the unresolved launch/security findings in, `VALIDATION.md`.

## Passed checks

| Check | Evidence |
| --- | --- |
| Go regression suite with race detector | 22 tests passed; one opt-in 25,000-reservation stress test skipped in this run |
| PostgreSQL integration | Used a new isolated local PostgreSQL 14 cluster on port 55439 and disposable schemas; production baseline remains PostgreSQL 17 and needs its own acceptance run |
| Duplicate checkout initialization | 100 concurrent retries across separate service instances produced one provider initialization using a test provider |
| Duplicate payment completion | 50 concurrent verified payment applications produced one payment ledger entry |
| Duplicate worker claim | 50 competing claims obtained one active lease |
| Provider-reference reuse | A verified provider reference could not be assigned to a second order |
| Global pause | New reservations blocked; same-order retry and existing valid payment completion still worked |
| Recovery lock | Prevented new reservations, worker processing, ordinary admin resume and payment application |
| Backup request deduplication | Second queued/running backup request rejected |
| Metrics access/privacy | Missing credentials rejected; normalized routes excluded private path IDs and query strings |
| Frontend TypeScript | `tsc --noEmit --incremental false` passed |
| Existing frontend regression suite | 22 tests passed |
| Python recovery helper | Four tests passed: archive path/duplicate safety, manifest/checksum checks, database identity comparison, PostgreSQL URI parsing |
| Monitoring configuration | YAML files and dashboard JSON parsed successfully |
| Formatting | `git diff --check` passed |

## Actual encrypted backup and restore drill

Downloaded Restic 0.18.1 from its official release and verified the binary archive against the release's SHA-256 checksum list. This was a temporary local test tool, not a production installation or recommendation to freeze that version indefinitely.

Created isolated source and destination databases containing a synthetic draw, one paid ticket, one payment ledger entry, one synthetic login session and one private media fixture. No customer or live CMS records were read.

The operator runner successfully:

1. Created a consistent custom PostgreSQL dump and media/checksum manifest.
2. Stored the archive in an encrypted local Restic test repository and checked repository structure.
3. Restored into an empty database, with the recovery lock committed in the same transaction as the restored schema/data.
4. Preserved the ticket count, amount total and exact media bytes.
5. Revoked the restored session and locked sales and payment processing.
6. Rejected restoring over a nonempty database in the initial drill.

The final small fixture backup took approximately two seconds and restore approximately one second locally. **These timings do not estimate recovery of the production dataset or VPS.** Provisioning, external storage/network transfer, secrets, role grants, provider reconciliation and DNS/application cutover were not part of that timing.

An initial connection-format issue and a restore-session search-path issue were found during the drill and fixed; the final restored data and atomic recovery lock were verified. Backup success and completed disaster recovery are deliberately reported as separate states.

## Not yet demonstrated or configured

- Actual Yegara hardware/network behavior, mixed-load throughput, peak concurrent users or a production waiting-time bound.
- A customer waiting room, admission fairness or prevention of direct queue bypass.
- Actual Chapa sandbox/live acceptance, provider quotas or duplicate-debit behavior in the external payment network.
- External backup storage, production encryption-key custody, retention/immutability or credentials.
- Continuous WAL archiving/PITR. The shipped runner provides logical snapshots; it does not deliver a five-minute RPO.
- A whole-server recovery or failover drill, or a measured production RTO.
- Live Prometheus/Grafana deployment, alert delivery, external uptime checks, host metrics or remote log shipping. Configuration parsing is not runtime validation.
- Browser-driven acceptance of the new operations panel with production staff roles.
- A production security/dependency audit. Prior high/critical Sanity-tooling findings remain a separate launch gate.

The user-facing report is `CAPACITY_AND_OPERATIONS_REPORT.md`; operator setup, recovery and limitations are in `OPERATIONS_RUNBOOK.md`.
