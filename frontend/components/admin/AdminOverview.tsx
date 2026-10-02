"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Ticket,
  Clock3,
  CircleAlert,
  Users,
  Wallet,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Receipt,
  History,
} from "lucide-react";
import { accountAPI } from "@/lib/account-api";
import { type AdminOverviewData, money } from "@/lib/admin";

export function AdminOverview() {
  const [data, setData] = useState<AdminOverviewData | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const c = new AbortController();
    setData(null);
    setError("");
    accountAPI<AdminOverviewData>("/admin/overview", { signal: c.signal })
      .then((v) => {
        if (!c.signal.aborted) setData(v);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [revision]);

  if (error)
    return (
      <div className="admin-card">
        <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#dc2626" }}>
          <AlertTriangle size={24} />
          <h2 style={{ margin: 0 }}>Unable to load operations data</h2>
        </div>
        <p role="alert" style={{ marginTop: 12 }}>{error}</p>
        <button className="admin-primary" onClick={() => setRevision((v) => v + 1)}>
          Try again
        </button>
      </div>
    );

  if (!data)
    return (
      <div className="admin-card" role="status" style={{ padding: "40px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, color: "var(--admin-muted)" }}>Loading live database operations overview…</p>
      </div>
    );

  const stats = [
    {
      title: "Open rounds",
      value: data.openRounds,
      subtext: `${data.totalRounds ?? data.openRounds} total rounds · ${data.completedRounds ?? 0} completed`,
      Icon: CalendarDays,
      link: "/admin/draws",
      color: "#6429ef",
    },
    {
      title: "Paid tickets",
      value: data.issuedTickets,
      subtext: `${data.totalRefundedOrders ?? 0} refunded orders`,
      Icon: Ticket,
      link: "/admin/orders",
      color: "#059669",
    },
    {
      title: "Payments pending",
      value: data.pendingPayments,
      subtext: "Awaiting customer checkout or webhook",
      Icon: Clock3,
      link: "/admin/orders",
      color: data.pendingPayments > 0 ? "#d97706" : "#68738b",
    },
    {
      title: "Refunds to review",
      value: data.refundRequired,
      subtext: data.refundRequired > 0 ? "Requires staff resolution" : "All clean",
      Icon: CircleAlert,
      link: "/admin/orders",
      color: data.refundRequired > 0 ? "#dc2626" : "#059669",
    },
    {
      title: "Registered users",
      value: data.totalUsers ?? 0,
      subtext: `${data.verifiedUsers ?? 0} verified accounts`,
      Icon: Users,
      link: "/admin/users",
      color: "#2563eb",
    },
    {
      title: "Verified deposits",
      value: data.totalDepositsCount ?? 0,
      subtext: "Wallet funding transactions",
      Icon: Wallet,
      link: "/admin/wallets",
      color: "#7c3aed",
    },
  ];

  return (
    <>
      {/* Live System Operations Status Banner */}
      <div
        className="admin-card"
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          padding: "16px 22px",
          background: "#ffffff",
          borderLeft: `4px solid ${data.salesPaused || data.depositsPaused ? "#f59e0b" : "#10b981"}`,
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: data.salesPaused ? "#ef4444" : "#10b981",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Ticket Sales:{" "}
              <strong style={{ color: data.salesPaused ? "#dc2626" : "#059669" }}>
                {data.salesPaused ? "Paused" : "Live & Active"}
              </strong>
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                display: "inline-block",
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: data.depositsPaused ? "#f59e0b" : "#10b981",
              }}
            />
            <span style={{ fontSize: 13, fontWeight: 600 }}>
              Test Deposits:{" "}
              <strong style={{ color: data.depositsPaused ? "#d97706" : "#059669" }}>
                {data.depositsPaused ? "Paused" : "Operational"}
              </strong>
            </span>
          </div>

          {data.recoveryLocked && (
            <span className="badge-pill badge-danger" style={{ display: "inline-flex", gap: 4 }}>
              <ShieldAlert size={12} /> Recovery lock active
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, color: "var(--admin-muted)" }}>
            Database synchronized {new Date(data.asOf).toLocaleTimeString()}
          </span>
          <button
            className="admin-btn-sm"
            onClick={() => setRevision((v) => v + 1)}
            title="Refresh database snapshot"
          >
            <RotateCcw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="admin-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
        {stats.map(({ title, value, subtext, Icon, link, color }) => (
          <Link
            href={link}
            className="admin-card admin-stat"
            key={title}
            style={{
              textDecoration: "none",
              color: "inherit",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              transition: "transform 0.15s ease, box-shadow 0.15s ease",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--admin-muted)" }}>{title}</span>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: `${color}15`,
                    color: color,
                  }}
                >
                  <Icon size={19} />
                </span>
              </div>
              <strong style={{ fontSize: 28, fontWeight: 800, color: "var(--admin-ink)", letterSpacing: "-0.03em" }}>
                {value.toLocaleString()}
              </strong>
            </div>
            <p style={{ margin: "10px 0 0", fontSize: 12, color: "var(--admin-muted)" }}>{subtext}</p>
          </Link>
        ))}
      </div>

      {/* Collections & Deposit Ledger Split Cards */}
      <div className="admin-columns" style={{ marginTop: 24 }}>
        {/* Ticket Collections by Currency */}
        <section className="admin-card">
          <div className="admin-card-heading">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Receipt size={18} color="var(--admin-accent)" />
              <h2 style={{ margin: 0 }}>Ticket collections</h2>
            </div>
            <span className="admin-badge">Database verified</span>
          </div>
          <p className="admin-muted" style={{ marginBottom: 16 }}>
            Verified payments recorded into the immutable payment ledger.
          </p>
          {data.collections.length === 0 ? (
            <div className="admin-empty">No ticket payments recorded in the database yet.</div>
          ) : (
            <div className="admin-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Currency</th>
                    <th>Gross payments</th>
                    <th>Recorded refunds</th>
                    <th>Net ticket fund</th>
                  </tr>
                </thead>
                <tbody>
                  {data.collections.map((c) => {
                    const net = c.paidMinor - c.refundedMinor;
                    return (
                      <tr key={c.currency}>
                        <th scope="row" style={{ fontWeight: 700 }}>{c.currency}</th>
                        <td style={{ color: "#059669", fontWeight: 600 }}>{money(c.paidMinor, c.currency)}</td>
                        <td style={{ color: c.refundedMinor > 0 ? "#dc2626" : "var(--admin-muted)" }}>
                          {money(c.refundedMinor, c.currency)}
                        </td>
                        <td style={{ fontWeight: 700, color: net > 0 ? "var(--admin-ink)" : "inherit" }}>
                          {money(net, c.currency)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Wallet Deposit Volume by Currency */}
        <section className="admin-card">
          <div className="admin-card-heading">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Wallet size={18} color="#7c3aed" />
              <h2 style={{ margin: 0 }}>Wallet deposits</h2>
            </div>
            <span className="admin-badge">Funding Ledger</span>
          </div>
          <p className="admin-muted" style={{ marginBottom: 16 }}>
            User deposits funded into customer balances (separate from ticket sales).
          </p>
          {(!data.depositVolume || data.depositVolume.length === 0) ? (
            <div className="admin-empty">No wallet deposit transactions recorded yet.</div>
          ) : (
            <div className="admin-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Currency</th>
                    <th>Succeeded deposits</th>
                    <th>Pending verification</th>
                  </tr>
                </thead>
                <tbody>
                  {data.depositVolume.map((d) => (
                    <tr key={d.currency}>
                      <th scope="row" style={{ fontWeight: 700 }}>{d.currency}</th>
                      <td style={{ color: "#059669", fontWeight: 600 }}>{money(d.succeededMinor, d.currency)}</td>
                      <td style={{ color: d.pendingMinor > 0 ? "#d97706" : "var(--admin-muted)" }}>
                        {money(d.pendingMinor, d.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Bottom Section: Recent Database Activity & Operations */}
      <div className="admin-columns" style={{ marginTop: 24 }}>
        {/* Recent Database Orders */}
        <section className="admin-card">
          <div className="admin-card-heading">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Ticket size={18} color="var(--admin-accent)" />
              <h2 style={{ margin: 0 }}>Recent ticket activity</h2>
            </div>
            <Link href="/admin/orders" className="admin-link" style={{ fontSize: 13 }}>
              View all orders <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="admin-muted">Latest ticket purchases processed by the system.</p>
          {(!data.recentOrders || data.recentOrders.length === 0) ? (
            <div className="admin-empty">No orders found in database.</div>
          ) : (
            <div className="admin-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Ticket / Player</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <strong>#{o.number}</strong> · {o.name || "Anonymous"}
                        <br />
                        <small style={{ color: "var(--admin-muted)" }}>{o.id}</small>
                      </td>
                      <td>
                        {money(o.amountMinor, o.currency)}
                        <br />
                        <small style={{ color: "var(--admin-muted)" }}>{o.provider}</small>
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
                      <td style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                        {new Date(o.createdAt).toLocaleDateString()}{" "}
                        {new Date(o.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Recent Audit Trail from Database */}
        <section className="admin-card">
          <div className="admin-card-heading">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <History size={18} color="var(--admin-accent)" />
              <h2 style={{ margin: 0 }}>Recent audit trail</h2>
            </div>
            <Link href="/admin/audit" className="admin-link" style={{ fontSize: 13 }}>
              Full audit log <ArrowUpRight size={14} />
            </Link>
          </div>
          <p className="admin-muted">Recorded operations and administrative events.</p>
          {(!data.recentAudits || data.recentAudits.length === 0) ? (
            <div className="admin-empty">No audit events recorded yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {data.recentAudits.map((a) => (
                <div
                  key={a.id}
                  style={{
                    padding: "10px 14px",
                    background: "#fbfbfe",
                    borderRadius: 8,
                    border: "1px solid var(--admin-line)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                      <span className="badge-pill badge-neutral" style={{ fontSize: 10, padding: "2px 6px" }}>
                        {a.action}
                      </span>
                      <strong style={{ fontSize: 12, color: "var(--admin-ink)" }}>{a.resource}</strong>
                    </div>
                    <small style={{ color: "var(--admin-muted)" }}>
                      By: {a.actor} · {new Date(a.createdAt).toLocaleString()}
                    </small>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--admin-line)" }}>
            <h3 style={{ fontSize: 14, margin: "0 0 10px" }}>Operations quick links</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Link className="admin-action-link" href="/admin/orders">
                <span>
                  <strong>Financial review & reconciliation</strong>
                  <small>Payment verification and customer refunds</small>
                </span>
                <ArrowUpRight size={16} />
              </Link>
              <Link className="admin-action-link" href="/admin/wallets">
                <span>
                  <strong>Wallets & deposits control</strong>
                  <small>Ledger balances and test deposit controls</small>
                </span>
                <ArrowUpRight size={16} />
              </Link>
              <Link className="admin-action-link" href="/admin/audit">
                <span>
                  <strong>Report generator & audit log</strong>
                  <small>Export official compliance reports</small>
                </span>
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
