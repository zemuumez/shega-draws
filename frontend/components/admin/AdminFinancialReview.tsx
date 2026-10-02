"use client";
import { useEffect, useState, useMemo } from "react";
import {
  CreditCard,
  RotateCcw,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle2,
  Copy,
  Check,
  Eye,
  X,
  FileSpreadsheet,
  ArrowUpRight,
  Clock3,
  CircleAlert,
  History,
  RefreshCw,
  Receipt,
  DollarSign,
} from "lucide-react";
import { accountAPI } from "@/lib/account-api";
import { money, type AdminOverviewData } from "@/lib/admin";
import type { Order } from "@/lib/backend";
import { playersWorkbook, type PlayerReceipt } from "@/lib/exports/players";

type FinanceTab = "history" | "refunds" | "recheck" | "ledger";

function downloadBlob(bytes: Uint8Array, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([new Uint8Array(bytes)], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AdminFinancialReview({ canWrite }: { canWrite: boolean }) {
  const [activeTab, setActiveTab] = useState<FinanceTab>("history");
  const [orders, setOrders] = useState<Order[]>([]);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  // Overview ledger metrics
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);

  // Filters for History Tab
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currencyFilter, setCurrencyFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Recheck Form state
  const [manualOrderId, setManualOrderId] = useState("");
  const [manualReference, setManualReference] = useState("");

  // Refund Modal state
  const [refundingOrder, setRefundingOrder] = useState<Order | null>(null);
  const [refundRef, setRefundRef] = useState("");
  const [refundReason, setRefundReason] = useState("");

  // Detail Modal state
  const [detailOrder, setDetailOrder] = useState<Order | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setBusy(true);
    setError("");

    Promise.all([
      accountAPI<Order[]>(`/admin/orders?offset=${offset}`),
      accountAPI<AdminOverviewData>("/admin/overview").catch(() => null),
    ])
      .then(([ordList, ovData]) => {
        if (!active) return;
        setOrders(ordList || []);
        if (ovData) setOverview(ovData);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, [offset, refresh]);

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  async function handleRecheck(orderId: string, reference: string) {
    if (!canWrite) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await accountAPI(`/admin/payments/${encodeURIComponent(orderId)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reference }),
      });
      setMessage(`Payment verification for order ${orderId} reconciled successfully.`);
      setManualOrderId("");
      setManualReference("");
      setRefresh((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function handleRecordRefund() {
    if (!canWrite || !refundingOrder) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      await accountAPI(`/admin/refunds/${encodeURIComponent(refundingOrder.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: refundRef.trim() || `refund_${refundingOrder.id}`,
          reason: refundReason.trim(),
        }),
      });
      setMessage(`Refund recorded in the ledger for order ${refundingOrder.id}.`);
      setRefundingOrder(null);
      setRefundRef("");
      setRefundReason("");
      setRefresh((v) => v + 1);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function exportOrdersExcel() {
    setBusy(true);
    setError("");
    try {
      const entries: PlayerReceipt[] = [];
      let n = 0;
      for (;;) {
        const page = await accountAPI<Order[]>(`/admin/orders?offset=${n}`);
        if (!page?.length) break;
        for (const o of page) {
          entries.push({
            _id: o.id,
            playerName: o.name,
            playerPhone: o.phone,
            drawId: o.drawId,
            luckyNumber: String(o.number),
            amount: o.amountMinor / 100,
            currency: o.currency,
            paymentMethod: o.provider,
            paymentReference: o.paymentReference,
            promoCode: o.promoCode,
            status: o.refunded ? "refunded" : o.status,
            submittedAt: o.createdAt,
          });
        }
        if (page.length < 100) break;
        n += 100;
        if (n > 50000) break;
      }
      const bytes = await playersWorkbook(entries);
      downloadBlob(bytes, `financial-orders-${new Date().toISOString().slice(0, 10)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Client-side filtering on the loaded batch
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (currencyFilter !== "all" && o.currency !== currencyFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesId = o.id.toLowerCase().includes(q);
        const matchesName = o.name?.toLowerCase().includes(q);
        const matchesPhone = o.phone?.toLowerCase().includes(q);
        const matchesEmail = o.email?.toLowerCase().includes(q);
        const matchesRef = o.paymentReference?.toLowerCase().includes(q);
        const matchesDraw = o.drawId?.toLowerCase().includes(q);
        const matchesNum = String(o.number).includes(q);
        if (!matchesId && !matchesName && !matchesPhone && !matchesEmail && !matchesRef && !matchesDraw && !matchesNum) {
          return false;
        }
      }
      return true;
    });
  }, [orders, statusFilter, currencyFilter, searchQuery]);

  // Queue of orders requiring refund review
  const refundQueue = useMemo(() => {
    return orders.filter((o) => o.status === "refund_required" || (!o.refunded && o.status === "refunded"));
  }, [orders]);

  // Queue of pending / unverified orders
  const pendingQueue = useMemo(() => {
    return orders.filter((o) => o.status === "pending" || o.status === "initializing");
  }, [orders]);

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

      {/* Tabbed Navigation Header */}
      <nav className="admin-tabs" aria-label="Financial review sections">
        <button
          className={`admin-tab ${activeTab === "history" ? "is-active" : ""}`}
          onClick={() => setActiveTab("history")}
        >
          <History size={16} />
          Payment history
          <span className="admin-tab-badge">{orders.length}</span>
        </button>

        <button
          className={`admin-tab ${activeTab === "refunds" ? "is-active" : ""}`}
          onClick={() => setActiveTab("refunds")}
        >
          <CircleAlert size={16} />
          Refunds to review
          {overview?.refundRequired && overview.refundRequired > 0 ? (
            <span className="admin-tab-badge" style={{ background: "#dc2626", color: "white" }}>
              {overview.refundRequired}
            </span>
          ) : (
            <span className="admin-tab-badge">{refundQueue.length}</span>
          )}
        </button>

        <button
          className={`admin-tab ${activeTab === "recheck" ? "is-active" : ""}`}
          onClick={() => setActiveTab("recheck")}
        >
          <RefreshCw size={16} />
          Recheck payment
          {pendingQueue.length > 0 && (
            <span className="admin-tab-badge" style={{ background: "#f59e0b", color: "white" }}>
              {pendingQueue.length} pending
            </span>
          )}
        </button>

        <button
          className={`admin-tab ${activeTab === "ledger" ? "is-active" : ""}`}
          onClick={() => setActiveTab("ledger")}
        >
          <Receipt size={16} />
          Ledger & reconciliation
        </button>
      </nav>

      {/* ── TAB 1: PAYMENT HISTORY ── */}
      {activeTab === "history" && (
        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <h2 style={{ margin: 0 }}>Ticket payment transactions</h2>
              <p className="admin-muted" style={{ margin: "4px 0 0" }}>
                Comprehensive ledger of all ticket orders and provider payment states.
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={busy} onClick={() => void exportOrdersExcel()} title="Export all orders to Excel">
                <FileSpreadsheet size={15} /> Export to Excel
              </button>
              <button disabled={busy} onClick={() => setRefresh((v) => v + 1)}>
                <RotateCcw size={15} /> Refresh
              </button>
            </div>
          </div>

          {/* Filter Bar */}
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
                placeholder="Search by Order ID, player name, phone, ticket #, reference…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: "100%", paddingLeft: 36 }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--admin-muted)" }}>Status:</span>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All statuses</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="initializing">Initializing</option>
                <option value="refund_required">Refund required</option>
                <option value="refunded">Refunded</option>
                <option value="expired">Expired</option>
                <option value="failed">Failed</option>
              </select>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--admin-muted)" }}>Currency:</span>
              <select value={currencyFilter} onChange={(e) => setCurrencyFilter(e.target.value)}>
                <option value="all">All currencies</option>
                <option value="ETB">ETB</option>
                <option value="USD">USD</option>
              </select>
            </div>
          </div>

          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Order / Ticket</th>
                  <th>Player & contact</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Provider & ref</th>
                  <th>Timestamp</th>
                  <th style={{ textAlign: "right" }}>Actionable controls</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <strong>#{o.number}</strong>
                        <button
                          className="admin-modal-close"
                          onClick={() => copyText(o.id, o.id)}
                          title="Copy Order ID"
                        >
                          {copiedKey === o.id ? <Check size={13} color="#059669" /> : <Copy size={13} />}
                        </button>
                      </div>
                      <small style={{ color: "var(--admin-muted)" }}>ID: {o.id}</small>
                      <br />
                      <small style={{ color: "var(--admin-muted)" }}>Round: {o.drawId}</small>
                    </td>
                    <td>
                      <strong>{o.name || "Anonymous"}</strong>
                      <br />
                      <small style={{ color: "var(--admin-muted)" }}>{o.phone || o.email || "No contact"}</small>
                    </td>
                    <td>
                      <strong style={{ fontSize: 15 }}>{money(o.amountMinor, o.currency)}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge-pill ${
                          o.status === "paid"
                            ? "badge-success"
                            : o.status === "refund_required"
                            ? "badge-danger"
                            : o.status === "refunded"
                            ? "badge-purple"
                            : o.status === "pending" || o.status === "initializing"
                            ? "badge-pending"
                            : "badge-neutral"
                        }`}
                      >
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <span className="admin-badge" style={{ fontSize: 11 }}>{o.provider}</span>
                      <br />
                      {o.paymentReference ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 4 }}>
                          <code style={{ fontSize: 11 }}>{o.paymentReference}</code>
                          <button
                            className="admin-modal-close"
                            onClick={() => copyText(o.paymentReference, o.paymentReference)}
                            title="Copy ref"
                          >
                            {copiedKey === o.paymentReference ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                          </button>
                        </div>
                      ) : (
                        <small style={{ color: "var(--admin-muted)" }}>No reference</small>
                      )}
                    </td>
                    <td style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                      {new Date(o.createdAt).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="admin-row-actions" style={{ justifyContent: "flex-end" }}>
                        {/* Recheck control */}
                        <button
                          className="admin-btn-sm admin-btn-action"
                          disabled={busy || !canWrite}
                          onClick={() => {
                            if (o.paymentReference) {
                              void handleRecheck(o.id, o.paymentReference);
                            } else {
                              setActiveTab("recheck");
                              setManualOrderId(o.id);
                            }
                          }}
                          title="Re-verify payment with provider"
                        >
                          Recheck
                        </button>

                        {/* Record refund if eligible */}
                        {(o.status === "paid" || o.status === "refund_required") && (
                          <button
                            className="admin-btn-sm admin-btn-refund"
                            disabled={busy || !canWrite}
                            onClick={() => {
                              setRefundingOrder(o);
                              setRefundRef(o.paymentReference || "");
                              setRefundReason(o.status === "refund_required" ? "Late payment outside reservation" : "");
                            }}
                            title="Record customer refund in ledger"
                          >
                            Refund
                          </button>
                        )}

                        {/* View metadata */}
                        <button
                          className="admin-btn-sm"
                          onClick={() => setDetailOrder(o)}
                          title="View order details"
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

          {!filteredOrders.length && (
            <div className="admin-empty">
              {searchQuery || statusFilter !== "all"
                ? "No orders match the selected filters."
                : "No orders found on this page."}
            </div>
          )}

          {/* Working Pagination */}
          <div className="admin-pagination" style={{ marginTop: 20 }}>
            <span>
              Showing {filteredOrders.length > 0 ? `${offset + 1}–${offset + filteredOrders.length}` : "0"} orders · Page{" "}
              {Math.floor(offset / 100) + 1}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={!offset || busy} onClick={() => setOffset((v) => Math.max(0, v - 100))}>
                Previous 100
              </button>
              <button disabled={orders.length < 100 || busy} onClick={() => setOffset((v) => v + 100)}>
                Next 100
              </button>
            </div>
          </div>
        </section>
      )}

      {/* ── TAB 2: REFUNDS TO REVIEW ── */}
      {activeTab === "refunds" && (
        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <h2 style={{ margin: 0 }}>Refund management & customer resolution</h2>
              <p className="admin-muted" style={{ margin: "4px 0 0" }}>
                Orders where payments arrived outside valid reservations or require operator intervention.
              </p>
            </div>
            <button disabled={busy} onClick={() => setRefresh((v) => v + 1)}>
              <RotateCcw size={15} /> Refresh
            </button>
          </div>

          <div
            style={{
              padding: "14px 18px",
              background: "#fffbeb",
              border: "1px solid #fef3c7",
              borderRadius: 8,
              margin: "16px 0",
              fontSize: 13,
              color: "#92400e",
            }}
          >
            <strong>Refund Rule:</strong> When a payment arrives late or after a round closed, the order enters{" "}
            <code>refund_required</code> to protect pool fairness. The ticket number is never issued. Staff must record
            the refund in the ledger once reversed in Chapa.
          </div>

          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Player info</th>
                  <th>Amount</th>
                  <th>Reason / Notice</th>
                  <th>Gateway Ref</th>
                  <th style={{ textAlign: "right" }}>Actionable controls</th>
                </tr>
              </thead>
              <tbody>
                {refundQueue.map((o) => (
                  <tr key={o.id}>
                    <td>
                      <strong>{o.id}</strong>
                      <br />
                      <small style={{ color: "var(--admin-muted)" }}>Draw: {o.drawId} · #{o.number}</small>
                    </td>
                    <td>
                      <strong>{o.name || "Anonymous"}</strong>
                      <br />
                      <small style={{ color: "var(--admin-muted)" }}>{o.phone || o.email}</small>
                    </td>
                    <td>
                      <strong style={{ color: "#dc2626" }}>{money(o.amountMinor, o.currency)}</strong>
                    </td>
                    <td>
                      <span className="badge-pill badge-danger" style={{ marginBottom: 4 }}>
                        {o.status}
                      </span>
                      <br />
                      <small style={{ color: "var(--admin-muted)" }}>
                        Late payment arrival or capacity filled before webhook arrived.
                      </small>
                    </td>
                    <td>
                      <code>{o.paymentReference || "No reference"}</code>
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <div className="admin-row-actions" style={{ justifyContent: "flex-end" }}>
                        <button
                          className="admin-btn-sm admin-btn-refund"
                          disabled={busy || !canWrite}
                          onClick={() => {
                            setRefundingOrder(o);
                            setRefundRef(o.paymentReference || "");
                            setRefundReason("Late payment arrival outside reservation");
                          }}
                        >
                          Record refund
                        </button>
                        <button
                          className="admin-btn-sm"
                          disabled={busy || !o.paymentReference}
                          onClick={() => void handleRecheck(o.id, o.paymentReference)}
                          title="Re-verify against Chapa"
                        >
                          Recheck Chapa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!refundQueue.length && (
            <div className="admin-empty" style={{ padding: "36px 16px" }}>
              <CheckCircle2 size={32} color="#059669" style={{ marginBottom: 8 }} />
              <p style={{ margin: 0, fontWeight: 600 }}>All clear! No orders currently require refund review.</p>
            </div>
          )}
        </section>
      )}

      {/* ── TAB 3: RECHECK PAYMENT ── */}
      {activeTab === "recheck" && (
        <>
          {/* Manual Recheck Form */}
          <section className="admin-card" style={{ marginBottom: 24 }}>
            <div className="admin-card-heading">
              <div>
                <h2 style={{ margin: 0 }}>Recheck payment with provider</h2>
                <p className="admin-muted" style={{ margin: "4px 0 0" }}>
                  Query payment gateway status using merchant reference if checkout response or webhook was missed.
                </p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleRecheck(manualOrderId.trim(), manualReference.trim());
              }}
              style={{ maxWidth: 640 }}
            >
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <label style={{ display: "block" }}>
                  <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>Order reference ID</span>
                  <input
                    required
                    placeholder="e.g. ord_abc123"
                    value={manualOrderId}
                    onChange={(e) => setManualOrderId(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px" }}
                  />
                </label>

                <label style={{ display: "block" }}>
                  <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                    Chapa / Gateway reference
                  </span>
                  <input
                    required
                    maxLength={128}
                    placeholder="e.g. chapa_txn_987654"
                    value={manualReference}
                    onChange={(e) => setManualReference(e.target.value)}
                    style={{ width: "100%", padding: "10px 14px" }}
                  />
                </label>
              </div>

              <div style={{ marginTop: 18 }}>
                <button className="admin-primary" disabled={busy || !canWrite}>
                  Reconcile & verify with provider
                </button>
              </div>
            </form>
          </section>

          {/* Pending Verification Queue */}
          <section className="admin-card">
            <div className="admin-card-heading">
              <div>
                <h2 style={{ margin: 0 }}>Pending verification queue</h2>
                <p className="admin-muted" style={{ margin: "4px 0 0" }}>
                  Orders currently in initializing or pending status. Click Recheck to instantly trigger server verification.
                </p>
              </div>
              <span className="badge-pill badge-pending">{pendingQueue.length} pending</span>
            </div>

            <div className="admin-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Player</th>
                    <th>Amount</th>
                    <th>Payment gateway</th>
                    <th>Created</th>
                    <th style={{ textAlign: "right" }}>Instant action</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingQueue.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>{o.id}</strong> · Round {o.drawId}
                      </td>
                      <td>
                        {o.name || "Anonymous"} · {o.phone || o.email}
                      </td>
                      <td>
                        <strong>{money(o.amountMinor, o.currency)}</strong>
                      </td>
                      <td>
                        {o.provider} · <code>{o.paymentReference || "Awaiting ref"}</code>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleTimeString()}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          className="admin-btn-sm admin-btn-action"
                          disabled={busy || !canWrite}
                          onClick={() => {
                            if (o.paymentReference) {
                              void handleRecheck(o.id, o.paymentReference);
                            } else {
                              setManualOrderId(o.id);
                              setManualReference(o.paymentReference || "");
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }
                          }}
                        >
                          Recheck now
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!pendingQueue.length && (
              <div className="admin-empty">No orders currently pending verification.</div>
            )}
          </section>
        </>
      )}

      {/* ── TAB 4: RECONCILIATION & LEDGER ── */}
      {activeTab === "ledger" && (
        <section className="admin-card">
          <div className="admin-card-heading">
            <div>
              <h2 style={{ margin: 0 }}>Financial ledger & reconciliation summary</h2>
              <p className="admin-muted" style={{ margin: "4px 0 0" }}>
                Immutable payment ledger reconciliation grouped by active currencies.
              </p>
            </div>
            <button disabled={busy} onClick={() => setRefresh((v) => v + 1)}>
              <RotateCcw size={15} /> Refresh
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              margin: "20px 0",
            }}
          >
            {overview?.collections.map((c) => {
              const net = c.paidMinor - c.refundedMinor;
              return (
                <div
                  key={c.currency}
                  style={{
                    padding: 20,
                    background: "#fbfbfe",
                    border: "1px solid var(--admin-line)",
                    borderRadius: 10,
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--admin-muted)" }}>
                    {c.currency} LEDGER SUMMARY
                  </span>
                  <div style={{ marginTop: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                      <span>Gross Collections:</span>
                      <strong style={{ color: "#059669" }}>{money(c.paidMinor, c.currency)}</strong>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13 }}>
                      <span>Total Refunded:</span>
                      <strong style={{ color: c.refundedMinor > 0 ? "#dc2626" : "inherit" }}>
                        {money(c.refundedMinor, c.currency)}
                      </strong>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        paddingTop: 8,
                        borderTop: "1px solid var(--admin-line)",
                        fontSize: 15,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>Net Position:</span>
                      <strong style={{ color: "var(--admin-ink)" }}>{money(net, c.currency)}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 16 }}>
            <h3>Ledger Integrity Assurance</h3>
            <p className="admin-muted" style={{ fontSize: 13, maxWidth: 700 }}>
              The payment ledger enforces unique transaction references and single-order debit/credit immutability.
              All payment records are signed with transaction timestamps and verified against external Chapa webhook digests.
            </p>
          </div>
        </section>
      )}

      {/* ── RECORD REFUND MODAL ── */}
      {refundingOrder && (
        <div className="admin-modal-backdrop" onClick={() => setRefundingOrder(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Record refund for order {refundingOrder.id}</h3>
              <button className="admin-modal-close" onClick={() => setRefundingOrder(null)}>
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void handleRecordRefund();
              }}
            >
              <div
                style={{
                  padding: 12,
                  background: "#fef2f2",
                  border: "1px solid #fee2e2",
                  borderRadius: 8,
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#991b1b",
                }}
              >
                Refunding <strong>{money(refundingOrder.amountMinor, refundingOrder.currency)}</strong> for customer{" "}
                <strong>{refundingOrder.name} ({refundingOrder.phone})</strong>.
              </div>

              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                  Chapa / Gateway refund reference
                </span>
                <input
                  required
                  placeholder="e.g. refund_chapa_ref_12345"
                  value={refundRef}
                  onChange={(e) => setRefundRef(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px" }}
                />
              </label>

              <label style={{ display: "block", marginBottom: 14 }}>
                <span style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>
                  Refund reason / audit note
                </span>
                <input
                  required
                  placeholder="e.g. Payment arrived after deadline; customer requested refund"
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px" }}
                />
              </label>

              <p className="admin-muted" style={{ fontSize: 13 }}>
                Recording this refund will create an immutable refund entry in the payment ledger and mark the order as
                refunded in the audit trail.
              </p>

              <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                <button className="admin-btn-refund" disabled={busy}>
                  Confirm & record refund
                </button>
                <button type="button" disabled={busy} onClick={() => setRefundingOrder(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ORDER DETAIL MODAL ── */}
      {detailOrder && (
        <div className="admin-modal-backdrop" onClick={() => setDetailOrder(null)}>
          <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Order details {detailOrder.id}</h3>
              <button className="admin-modal-close" onClick={() => setDetailOrder(null)}>
                <X size={20} />
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "10px 16px", fontSize: 13 }}>
              <strong>Ticket Number:</strong>
              <div>
                <strong style={{ fontSize: 16 }}>#{detailOrder.number}</strong>
              </div>

              <strong>Status:</strong>
              <div>
                <span className="badge-pill badge-neutral">{detailOrder.status}</span>
              </div>

              <strong>Amount:</strong>
              <div>{money(detailOrder.amountMinor, detailOrder.currency)}</div>

              <strong>Round ID:</strong>
              <div>{detailOrder.drawId}</div>

              <strong>Player Name:</strong>
              <div>{detailOrder.name || "—"}</div>

              <strong>Phone:</strong>
              <div>{detailOrder.phone || "—"}</div>

              <strong>Email:</strong>
              <div>{detailOrder.email || "—"}</div>

              <strong>Provider:</strong>
              <div>{detailOrder.provider}</div>

              <strong>Provider Ref:</strong>
              <div><code>{detailOrder.paymentReference || "None"}</code></div>

              <strong>Idempotency Key:</strong>
              <div style={{ wordBreak: "break-all" }}>{detailOrder.idempotencyKey || "—"}</div>

              <strong>Fingerprint:</strong>
              <div style={{ wordBreak: "break-all" }}>{detailOrder.fingerprint || "—"}</div>

              <strong>Created At:</strong>
              <div>{new Date(detailOrder.createdAt).toLocaleString()}</div>

              {detailOrder.paidAt && (
                <>
                  <strong>Paid At:</strong>
                  <div>{new Date(detailOrder.paidAt).toLocaleString()}</div>
                </>
              )}

              {detailOrder.promoCode && (
                <>
                  <strong>Promo Code:</strong>
                  <div>{detailOrder.promoCode}</div>
                </>
              )}
            </div>
            <div style={{ marginTop: 24, textAlign: "right" }}>
              <button onClick={() => setDetailOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
