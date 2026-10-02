"use client";
import { useEffect, useState, useMemo } from "react";
import {
  Wallet,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Copy,
  Check,
  Search,
  Filter,
  Eye,
  X,
  CreditCard,
  SlidersHorizontal,
} from "lucide-react";
import { accountAPI } from "@/lib/account-api";
import { money } from "@/lib/admin";
import type { Deposit, WalletPage, WalletReport } from "@/lib/wallet";

type WalletTab = "accounting" | "controls" | "deposits";

export function AdminWallets() {
  const [activeTab, setActiveTab] = useState<WalletTab>("accounting");
  const [reports, setReports] = useState<WalletReport[]>([]);
  const [page, setPage] = useState<WalletPage<Deposit> | null>(null);
  const [paused, setPaused] = useState(true);
  const [locked, setLocked] = useState(true);
  const [reason, setReason] = useState("");
  const [offset, setOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  // Filters for Deposits Tab
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals & Action States
  const [verifyingDeposit, setVerifyingDeposit] = useState<Deposit | null>(null);
  const [detailDeposit, setDetailDeposit] = useState<Deposit | null>(null);
  const [resolveReviewDeposit, setResolveReviewDeposit] = useState<Deposit | null>(null);
  const [resolveReason, setResolveReason] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    const c = new AbortController();
    setError("");
    Promise.all([
      accountAPI<WalletReport[]>("/admin/wallets", { signal: c.signal }),
      accountAPI<WalletPage<Deposit>>(
        `/admin/deposits?offset=${offset}${currencyFilter !== "all" ? `&currency=${currencyFilter}` : ""}`,
        { signal: c.signal }
      ),
      accountAPI<{ depositsPaused: boolean; recoveryLocked: boolean }>(
        "/admin/operations",
        { signal: c.signal }
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
  }, [offset, revision, currencyFilter]);

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
      setVerifyingDeposit(null);
      setResolveReviewDeposit(null);
      setReason("");
      setResolveReason("");
      setRevision((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function recheckDeposit(d: Deposit) {
    setBusy(true);
    setError("");
    try {
      await accountAPI(`/admin/deposits/${encodeURIComponent(d.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "recheck" }),
      });
      setMessage(`Deposit ${d.id} scheduled for instant verification check.`);
      setRevision((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  // Filtered deposits based on client-side status & search
  const filteredDeposits = useMemo(() => {
    if (!page?.items) return [];
    return page.items.filter((d) => {
      if (statusFilter !== "all" && d.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = d.id.toLowerCase().includes(q);
        const matchesUser = d.userId?.toLowerCase().includes(q);
        const matchesRef = d.paymentReference?.toLowerCase().includes(q);
        const matchesPhone = d.phone?.toLowerCase().includes(q);
        const matchesEmail = d.email?.toLowerCase().includes(q);
        if (!matchesId && !matchesUser && !matchesRef && !matchesPhone && !matchesEmail) {
          return false;
        }
      }
      return true;
    });
  }, [page?.items, statusFilter, searchQuery]);

  const mismatchCount = reports.reduce((acc, r) => acc + (r.mismatchedAccounts || 0), 0);
  const pendingReviewCount = page?.items.filter((d) => d.status === "review").length || 0;

  return (
    <>
      {error && (
        <div className="admin-alert" role="alert" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          style={{
            padding: "12px 18px",
            background: "#def7ec",
            color: "#03543f",
            borderRadius: 8,
            marginBottom: 16,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {/* User Tabbed Navigation */}
      <nav className="admin-tabs" aria-label="Wallets and deposits sections">
        <button
          className={`admin-tab ${activeTab === "accounting" ? "is-active" : ""}`}
          onClick={() => setActiveTab("accounting")}
        >
          <Wallet size={16} />
          Wallet accounting
          {mismatchCount > 0 ? (
            <span className="admin-tab-badge" style={{ background: "#ef4444", color: "white" }}>
              {mismatchCount} mismatch
            </span>
          ) : (
            <span className="admin-tab-badge">{reports.length}</span>
          )}
        </button>

        <button
          className={`admin-tab ${activeTab === "controls" ? "is-active" : ""}`}
          onClick={() => setActiveTab("controls")}
        >
          <SlidersHorizontal size={16} />
          Deposit controls
          <span
            className="admin-tab-badge"
            style={{
              background: paused ? "#fef08a" : "#def7ec",
              color: paused ? "#713f12" : "#03543f",
            }}
          >
            {paused ? "Paused" : "Allowed"}
          </span>
        </button>

        <button
          className={`admin-tab ${activeTab === "deposits" ? "is-active" : ""}`}
          onClick={() => setActiveTab("deposits")}
        >
          <CreditCard size={16} />
          Deposits & verification
          {pendingReviewCount > 0 ? (
            <span className="admin-tab-badge" style={{ background: "#f59e0b", color: "white" }}>
              {pendingReviewCount} review
            </span>
          ) : (
            <span className="admin-tab-badge">{page?.items.length ?? 0}</span>
          )}
        </button>
      </nav>

      {/* ── TAB 1: WALLET ACCOUNTING ── */}
      {activeTab === "accounting" && (
        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <h2 style={{ margin: 0 }}>Wallet accounting & ledger status</h2>
              <p className="admin-muted" style={{ margin: "4px 0 0" }}>
                Double-entry verification comparing recorded ledger entries against stored customer balances.
              </p>
            </div>
            <button disabled={busy} onClick={() => setRevision((v) => v + 1)}>
              <RotateCcw size={15} /> Refresh
            </button>
          </div>

          <div
            style={{
              padding: "14px 18px",
              background: "#f0f4ff",
              border: "1px solid #dbeafe",
              borderRadius: 8,
              margin: "16px 0",
              fontSize: 13,
              color: "#1e3a8a",
            }}
          >
            <strong>Accounting Guarantee:</strong> Customer balances are amounts held on behalf of customers.
            They are strictly segregated from lottery ticket revenues. Winnings are settled externally.
          </div>

          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Currency</th>
                  <th>Customer balance</th>
                  <th>Ledger balance</th>
                  <th>Accounts with mismatch</th>
                  <th>Restricted wallets</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => {
                  const hasMismatch = r.mismatchedAccounts > 0;
                  return (
                    <tr key={r.currency}>
                      <th scope="row" style={{ fontWeight: 800 }}>{r.currency}</th>
                      <td style={{ fontWeight: 600 }}>{money(r.customerBalanceMinor, r.currency)}</td>
                      <td style={{ fontWeight: 600, color: "var(--admin-ink)" }}>
                        {money(r.ledgerBalanceMinor, r.currency)}
                      </td>
                      <td style={{ color: hasMismatch ? "#dc2626" : "inherit", fontWeight: hasMismatch ? 700 : 400 }}>
                        {r.mismatchedAccounts}
                      </td>
                      <td>{r.restrictedAccounts}</td>
                      <td>
                        <span className={`badge-pill ${hasMismatch ? "badge-danger" : "badge-success"}`}>
                          {hasMismatch ? "Investigate" : "Balanced"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--admin-line)" }}>
            <p className="admin-muted" style={{ margin: 0, fontSize: 13 }}>
              Provider settlements and bank clearing accounts require external verification.
              If an account mismatch occurs, new deposit crediting should be investigated immediately.
            </p>
          </div>
        </section>
      )}

      {/* ── TAB 2: DEPOSIT CONTROLS ── */}
      {activeTab === "controls" && (
        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <h2 style={{ margin: 0 }}>Deposit availability controls</h2>
              <p className="admin-muted" style={{ margin: "4px 0 0" }}>
                Operational kill-switch controlling customer wallet funding entrypoints.
              </p>
            </div>
            <span
              className={`badge-pill ${paused ? "badge-warning" : "badge-success"}`}
              style={{ fontSize: 12, padding: "6px 14px" }}
            >
              {paused ? "Deposits Paused" : "Deposits Live"}
            </span>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 16,
              margin: "20px 0",
            }}
          >
            <div
              style={{
                padding: 18,
                background: "#fbfbfe",
                border: "1px solid var(--admin-line)",
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 12, color: "var(--admin-muted)", fontWeight: 600 }}>OPERATIONS GATE</span>
              <h3 style={{ margin: "8px 0 4px", fontSize: 18 }}>
                New deposits: {paused ? "Paused by staff" : "Allowed by operations"}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: "var(--admin-muted)" }}>
                Pausing deposits prevents customers from starting new deposit checkouts.
                Existing pending transactions are unaffected.
              </p>
            </div>

            <div
              style={{
                padding: 18,
                background: locked ? "#fff1f2" : "#fbfbfe",
                border: `1px solid ${locked ? "#fecdd3" : "var(--admin-line)"}`,
                borderRadius: 10,
              }}
            >
              <span style={{ fontSize: 12, color: locked ? "#e11d48" : "var(--admin-muted)", fontWeight: 600 }}>
                RECOVERY SAFETY LOCK
              </span>
              <h3 style={{ margin: "8px 0 4px", fontSize: 18, color: locked ? "#9f1239" : "inherit" }}>
                {locked ? "Locked" : "Unlocked"}
              </h3>
              <p style={{ margin: 0, fontSize: 13, color: locked ? "#9f1239" : "var(--admin-muted)" }}>
                {locked
                  ? "Database is in emergency recovery lock mode. Deposit funding cannot resume until cleared."
                  : "Normal operations. Recovery locks are clear."}
              </p>
            </div>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void update(
                "/admin/operations/deposits",
                { paused: !paused, reason },
                `Deposit availability updated to ${!paused ? "Paused" : "Allowed"} and recorded in audit history.`
              );
            }}
            style={{ width: "100%" }}
          >
            <label style={{ display: "block", marginBottom: 14 }}>
              <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                Reason for changing deposit availability (recorded in audit log)
              </span>
              <input
                aria-label="Deposit control reason"
                required
                minLength={5}
                maxLength={500}
                placeholder="e.g. Scheduled bank maintenance, gateway upgrade, or routine drill"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                style={{ width: "100%", padding: "10px 14px" }}
              />
            </label>

            <button
              className={`admin-button ${paused ? "admin-primary" : ""}`}
              disabled={busy || !page || (paused && locked)}
              style={{ minWidth: 200 }}
            >
              {paused ? "Allow test deposits" : "Pause new deposits"}
            </button>
          </form>
        </section>
      )}

      {/* ── TAB 3: DEPOSITS & VERIFICATION WITH ACTIONABLE CONTROLS ── */}
      {activeTab === "deposits" && (
        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <h2 style={{ margin: 0 }}>Deposits & payment verification</h2>
              <p className="admin-muted" style={{ margin: "4px 0 0" }}>
                Verify customer funding transactions, re-check pending gateways, and review discrepancies.
              </p>
            </div>
            <button disabled={busy} onClick={() => setRevision((v) => v + 1)}>
              <RotateCcw size={15} /> Refresh
            </button>
          </div>

          {/* Actionable Filter & Search Toolbar */}
          <div className="admin-filter-bar">
            <div className="admin-search-input" style={{ position: "relative" }}>
              <Search
                size={16}
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--admin-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Search deposit ID, account, reference, email, phone…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: 36 }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--admin-muted)" }}>Status:</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="succeeded">Succeeded</option>
                <option value="pending">Pending</option>
                <option value="initializing">Initializing</option>
                <option value="review">Needs review</option>
                <option value="failed">Failed</option>
                <option value="reversed">Reversed</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--admin-muted)" }}>Currency:</span>
              <select
                value={currencyFilter}
                onChange={(e) => {
                  setCurrencyFilter(e.target.value);
                  setOffset(0);
                }}
              >
                <option value="all">All currencies</option>
                <option value="ETB">ETB</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          {!page ? (
            <p role="status">Loading deposits…</p>
          ) : (
            <>
              <div className="admin-table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Deposit details</th>
                      <th>Amount</th>
                      <th>Method / Mode</th>
                      <th>Status</th>
                      <th>Payment reference</th>
                      <th>Review notice</th>
                      <th style={{ textAlign: "right" }}>Actionable controls</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDeposits.map((d) => (
                      <tr key={d.id}>
                        <th scope="row">
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <strong>{d.id}</strong>
                            <button
                              className="admin-modal-close"
                              onClick={() => copyText(d.id, d.id)}
                              title="Copy Deposit ID"
                            >
                              {copiedKey === d.id ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                            </button>
                          </div>
                          <small style={{ color: "var(--admin-muted)" }}>
                            Account: {d.accountId || d.userId || "—"}
                          </small>
                          <br />
                          <small style={{ color: "var(--admin-muted)" }}>
                            {new Date(d.createdAt).toLocaleString()}
                          </small>
                        </th>
                        <td>
                          <strong style={{ fontSize: 15 }}>{money(d.amountMinor, d.currency)}</strong>
                        </td>
                        <td>
                          <span className="admin-badge" style={{ fontSize: 11 }}>
                            {d.paymentMethod ? d.paymentMethod : d.currency === "USD" ? "card / global" : "telebirr / bank"}
                          </span>
                          <br />
                          <small style={{ color: "var(--admin-muted)" }}>{d.mode}</small>
                        </td>
                        <td>
                          <span
                            className={`badge-pill ${
                              d.status === "succeeded"
                                ? "badge-success"
                                : d.status === "review"
                                ? "badge-danger"
                                : d.status === "pending" || d.status === "initializing"
                                ? "badge-pending"
                                : d.status === "reversed"
                                ? "badge-purple"
                                : "badge-neutral"
                            }`}
                          >
                            {d.status}
                          </span>
                        </td>
                        <td>
                          {d.paymentReference ? (
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <code style={{ fontSize: 12 }}>{d.paymentReference}</code>
                              <button
                                className="admin-modal-close"
                                onClick={() => copyText(d.paymentReference, d.paymentReference)}
                                title="Copy reference"
                              >
                                {copiedKey === d.paymentReference ? (
                                  <Check size={13} color="#059669" />
                                ) : (
                                  <Copy size={13} />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span style={{ color: "var(--admin-muted)", fontStyle: "italic" }}>Not attached</span>
                          )}
                        </td>
                        <td>
                          {d.reviewReason ? (
                            <span style={{ color: "#dc2626", fontSize: 12 }}>{d.reviewReason}</span>
                          ) : (
                            <span style={{ color: "var(--admin-muted)" }}>—</span>
                          )}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <div className="admin-row-actions" style={{ justifyContent: "flex-end" }}>
                            {/* Verify Action */}
                            <button
                              className="admin-btn-sm admin-btn-action"
                              disabled={busy || d.status === "reversed"}
                              onClick={() => {
                                setVerifyingDeposit(d);
                                setPaymentReference(d.paymentReference || "");
                              }}
                              title="Schedule or attach payment reference"
                            >
                              Verify
                            </button>

                            {/* Recheck Action */}
                            {(d.status === "pending" || d.status === "initializing" || d.paymentReference) && (
                              <button
                                className="admin-btn-sm"
                                disabled={busy}
                                onClick={() => void recheckDeposit(d)}
                                title="Check status with provider"
                              >
                                Re-check
                              </button>
                            )}

                            {/* Resolve Review Action */}
                            {d.status === "review" && (
                              <button
                                className="admin-btn-sm admin-btn-refund"
                                disabled={busy}
                                onClick={() => {
                                  setResolveReviewDeposit(d);
                                  setResolveReason("");
                                }}
                              >
                                Resolve review
                              </button>
                            )}

                            {/* Details Action */}
                            <button
                              className="admin-btn-sm"
                              onClick={() => setDetailDeposit(d)}
                              title="View full deposit metadata"
                            >
                              <Eye size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {!filteredDeposits.length && (
                <div className="admin-empty">
                  {searchQuery || statusFilter !== "all"
                    ? "No deposits match the selected filters."
                    : "No deposits found on this page."}
                </div>
              )}

              {/* Working Pagination */}
              <div className="admin-pagination" style={{ marginTop: 20 }}>
                <span>
                  Showing {filteredDeposits.length > 0 ? `${offset + 1}–${offset + filteredDeposits.length}` : "0"}{" "}
                  deposits · Page {Math.floor(offset / 50) + 1}
                </span>
                <div style={{ display: "flex", gap: 8 }}>
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
              </div>
            </>
          )}
        </section>
      )}

      {/* ── VERIFY PAYMENT MODAL ── */}
      {verifyingDeposit && (
        <div className="admin-modal-backdrop" onClick={() => setVerifyingDeposit(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Verify deposit {verifyingDeposit.id}</h3>
              <button className="admin-modal-close" onClick={() => setVerifyingDeposit(null)}>
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void update(
                  `/admin/deposits/${encodeURIComponent(verifyingDeposit.id)}`,
                  { reference: paymentReference },
                  "Verification scheduled with payment provider. Refresh to view updated status."
                );
              }}
            >
              <p style={{ margin: "0 0 16px" }}>
                Amount: <strong>{money(verifyingDeposit.amountMinor, verifyingDeposit.currency)}</strong> · User:{" "}
                <strong>{verifyingDeposit.name} ({verifyingDeposit.phone})</strong>
              </p>
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                  Original payment gateway reference (e.g. Chapa reference)
                </span>
                <input
                  aria-label="Chapa payment reference"
                  required
                  maxLength={128}
                  placeholder="e.g. CHAPA_REF_123456"
                  readOnly={!!verifyingDeposit.paymentReference}
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value.trim())}
                  style={{ width: "100%", padding: "10px 14px" }}
                />
              </label>
              <p className="admin-muted" style={{ fontSize: 13 }}>
                Confirm the reference belongs to this deposit in the merchant dashboard. Once attached, it cannot be replaced.
              </p>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button className="admin-primary" disabled={busy}>
                  Schedule verification
                </button>
                <button type="button" disabled={busy} onClick={() => setVerifyingDeposit(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── RESOLVE REVIEW MODAL ── */}
      {resolveReviewDeposit && (
        <div className="admin-modal-backdrop" onClick={() => setResolveReviewDeposit(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Resolve flagged deposit {resolveReviewDeposit.id}</h3>
              <button className="admin-modal-close" onClick={() => setResolveReviewDeposit(null)}>
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void update(
                  `/admin/deposits/${encodeURIComponent(resolveReviewDeposit.id)}`,
                  { action: "resolve_review", reason: resolveReason },
                  "Review resolved and deposit updated."
                );
              }}
            >
              <p>
                Current review reason:{" "}
                <strong style={{ color: "#dc2626" }}>{resolveReviewDeposit.reviewReason}</strong>
              </p>
              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                  Resolution resolution notes
                </span>
                <input
                  required
                  placeholder="e.g. Resolved via customer support proof or manual reconciliation"
                  value={resolveReason}
                  onChange={(e) => setResolveReason(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px" }}
                />
              </label>
              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button className="admin-btn-refund" disabled={busy}>
                  Mark resolved & fail deposit
                </button>
                <button type="button" disabled={busy} onClick={() => setResolveReviewDeposit(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── DEPOSIT DETAILS MODAL ── */}
      {detailDeposit && (
        <div className="admin-modal-backdrop" onClick={() => setDetailDeposit(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Deposit metadata {detailDeposit.id}</h3>
              <button className="admin-modal-close" onClick={() => setDetailDeposit(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "10px 16px", fontSize: 13 }}>
              <strong>Status:</strong>
              <div>
                <span className="badge-pill badge-neutral">{detailDeposit.status}</span>
              </div>

              <strong>Amount:</strong>
              <div>{money(detailDeposit.amountMinor, detailDeposit.currency)}</div>

              <strong>Customer Name:</strong>
              <div>{detailDeposit.name || "—"}</div>

              <strong>Email:</strong>
              <div>{detailDeposit.email || "—"}</div>

              <strong>Phone:</strong>
              <div>{detailDeposit.phone || "—"}</div>

              <strong>Provider:</strong>
              <div>{detailDeposit.provider} ({detailDeposit.mode})</div>

              <strong>Provider Ref:</strong>
              <div><code>{detailDeposit.paymentReference || "None"}</code></div>

              <strong>Idempotency Key:</strong>
              <div style={{ wordBreak: "break-all" }}>{detailDeposit.idempotencyKey || "—"}</div>

              <strong>Fingerprint:</strong>
              <div style={{ wordBreak: "break-all" }}>{detailDeposit.fingerprint || "—"}</div>

              <strong>Created At:</strong>
              <div>{new Date(detailDeposit.createdAt).toLocaleString()}</div>

              {detailDeposit.creditedAt && (
                <>
                  <strong>Credited At:</strong>
                  <div>{new Date(detailDeposit.creditedAt).toLocaleString()}</div>
                </>
              )}

              {detailDeposit.reviewReason && (
                <>
                  <strong>Review Reason:</strong>
                  <div style={{ color: "#dc2626" }}>{detailDeposit.reviewReason}</div>
                </>
              )}
            </div>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={() => setDetailDeposit(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
