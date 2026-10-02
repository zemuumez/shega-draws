"use client";
import { useEffect, useState } from "react";
import { accountAPI } from "@/lib/account-api";
import { money } from "@/lib/admin";
import type { Deposit, WalletPage, WalletReport } from "@/lib/wallet";
export function AdminWallets() {
  const [reports, setReports] = useState<WalletReport[]>([]),
    [page, setPage] = useState<WalletPage<Deposit> | null>(null);
  const [paused, setPaused] = useState(true),
    [locked, setLocked] = useState(true),
    [reason, setReason] = useState("");
  const [offset, setOffset] = useState(0),
    [revision, setRevision] = useState(0),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false),
    [selected, setSelected] = useState<Deposit | null>(null),
    [reference, setReference] = useState("");
  useEffect(() => {
    const c = new AbortController();
    setPage(null);
    setError("");
    Promise.all([
      accountAPI<WalletReport[]>("/admin/wallets", { signal: c.signal }),
      accountAPI<WalletPage<Deposit>>(`/admin/deposits?offset=${offset}`, {
        signal: c.signal,
      }),
      accountAPI<{ depositsPaused: boolean; recoveryLocked: boolean }>(
        "/admin/operations",
        { signal: c.signal },
      ),
    ])
      .then(([r, p, o]) => {
        if (!c.signal.aborted) {
          setReports(r);
          setPage(p);
          setPaused(o.depositsPaused);
          setLocked(o.recoveryLocked);
        }
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [offset, revision]);
  async function update(path: string, input: unknown, notice: string) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await accountAPI(path, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      setMessage(notice);
      setSelected(null);
      setReason("");
      setRevision((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <section className="admin-card">
        <div className="admin-card-heading">
          <h2>Wallet accounting</h2>
          <button disabled={busy} onClick={() => setRevision((v) => v + 1)}>
            Refresh
          </button>
        </div>
        <p className="admin-notice">
          This release supports test deposits only. Live funding and wallet
          ticket purchases remain disabled. Customer balances are amounts owed
          to customers; they are not ticket revenue. Winnings are paid outside
          the website.
        </p>
        {error && (
          <p role="alert" className="admin-alert">
            {error}
          </p>
        )}
        {message && <p role="status">{message}</p>}
        <div className="admin-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Currency</th>
                <th>Customer balance</th>
                <th>Ledger balance</th>
                <th>Accounts with a mismatch</th>
                <th>Restricted wallets</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.currency}>
                  <th scope="row">{r.currency}</th>
                  <td>{money(r.customerBalanceMinor, r.currency)}</td>
                  <td>{money(r.ledgerBalanceMinor, r.currency)}</td>
                  <td>{r.mismatchedAccounts}</td>
                  <td>{r.restrictedAccounts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="admin-muted">
          This compares recorded wallet entries with stored balances. Provider
          settlements and bank reconciliation require a separate review. A
          mismatch requires investigation before funding resumes.
        </p>
      </section>
      <section className="admin-card">
        <h2>Deposit controls</h2>
        <p>
          New deposits:{" "}
          <strong>{paused ? "Paused" : "Allowed by operations"}</strong>.
          Payment configuration can still disable checkout.
        </p>
        <p>
          Pausing new deposits does not discard existing payment confirmations.
          Ticket sales have a separate pause control.
        </p>
        {locked && (
          <p className="admin-notice">
            Recovery lock is active. Funding cannot resume.
          </p>
        )}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void update(
              "/admin/operations/deposits",
              { paused: !paused, reason },
              "Deposit controls updated and recorded in the audit history.",
            );
          }}
        >
          <label>
            Reason for changing deposit availability
            <input
              aria-label="Deposit control reason"
              required
              minLength={5}
              maxLength={500}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </label>
          <button
            className="admin-button"
            disabled={busy || !page || (paused && locked)}
          >
            {paused ? "Allow test deposits" : "Pause new deposits"}
          </button>
        </form>
      </section>
      <section className="admin-card">
        <h2>Deposits & verification</h2>
        <p className="admin-muted">
          A payment reference schedules server verification. It never approves a
          deposit or edits a balance by itself. Use the original Chapa
          reference, not a merchant reference.
        </p>
        {!page ? (
          <p role="status">Loading deposits…</p>
        ) : (
          <>
            <div className="admin-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Deposit</th>
                    <th>Amount</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th>Payment reference</th>
                    <th>Review</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {page.items.map((d) => (
                    <tr key={d.id}>
                      <th scope="row">
                        {d.id}
                        <br />
                        <small>Account: {d.accountId || "—"}</small>
                        <br />
                        <small>
                          {new Date(d.createdAt).toLocaleString()} · {d.mode}
                        </small>
                      </th>
                      <td>{money(d.amountMinor, d.currency)}</td>
                      <td>
                        <span className="admin-method-badge">
                          {d.paymentMethod
                            ? d.paymentMethod
                            : d.currency === "USD"
                            ? "card / global"
                            : "telebirr / bank"}
                        </span>
                      </td>
                      <td>{d.status}</td>
                      <td>{d.paymentReference || "Not received"}</td>
                      <td>{d.reviewReason || "—"}</td>
                      <td>
                        <button
                          disabled={busy || d.status === "reversed"}
                          onClick={() => {
                            setSelected(d);
                            setReference(d.paymentReference);
                          }}
                        >
                          Verify payment
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!page.items.length && (
              <div className="admin-empty">No deposits yet.</div>
            )}
            <div className="admin-pagination">
              <button
                disabled={!offset || busy}
                onClick={() => setOffset((v) => Math.max(0, v - 50))}
              >
                Previous
              </button>
              <button
                disabled={!page.hasMore || busy}
                onClick={() => setOffset((v) => v + 50)}
              >
                Next
              </button>
            </div>
          </>
        )}
        {selected && (
          <form
            className="admin-card"
            onSubmit={(e) => {
              e.preventDefault();
              void update(
                `/admin/deposits/${encodeURIComponent(selected.id)}`,
                { reference },
                "Verification scheduled. Refresh later to see the verified outcome.",
              );
            }}
          >
            <h3>Verify {selected.id}</h3>
            <label>
              Original Chapa payment reference
              <input
                aria-label="Chapa payment reference"
                required
                maxLength={128}
                readOnly={!!selected.paymentReference}
                value={reference}
                onChange={(e) => setReference(e.target.value.trim())}
              />
            </label>
            <p>
              Confirm the reference belongs to this deposit in the provider
              dashboard. Once attached, it cannot be replaced here.
            </p>
            <button disabled={busy}>Schedule verification</button>
            <button
              type="button"
              disabled={busy}
              onClick={() => setSelected(null)}
            >
              Cancel
            </button>
          </form>
        )}
      </section>
    </>
  );
}
