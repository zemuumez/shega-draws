"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  Ticket,
  Clock3,
  CircleAlert,
} from "lucide-react";
import { accountAPI } from "@/lib/account-api";
import { type AdminOverviewData, money } from "@/lib/admin";
export function AdminOverview() {
  const [data, setData] = useState<AdminOverviewData | null>(null),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
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
        <p role="alert">{error}</p>
        <button onClick={() => setRevision((v) => v + 1)}>Try again</button>
      </div>
    );
  if (!data)
    return (
      <div className="admin-card" role="status">
        Loading the operations overview…
      </div>
    );
  const stats = [
    { title: "Open rounds", value: data.openRounds, Icon: CalendarDays },
    { title: "Paid tickets", value: data.issuedTickets, Icon: Ticket },
    { title: "Payments pending", value: data.pendingPayments, Icon: Clock3 },
    {
      title: "Refunds to review",
      value: data.refundRequired,
      Icon: CircleAlert,
    },
  ];
  return (
    <>
      <div className="admin-stats">
        {stats.map(({ title, value, Icon }) => (
          <div className="admin-card admin-stat" key={title}>
            <div>
              <span>{title}</span>
              <Icon size={21} />
            </div>
            <strong>{value.toLocaleString()}</strong>
          </div>
        ))}
      </div>
      <div className="admin-columns">
        <section className="admin-card">
          <div className="admin-card-heading">
            <h2>Recorded collections</h2>
            <span className="admin-badge">By currency</span>
          </div>
          <p className="admin-muted">
            Verified ticket payments and recorded refunds. These are not wallet
            balances or the net prize fund.
          </p>
          {data.collections.length === 0 ? (
            <div className="admin-empty">
              No verified collections recorded yet.
            </div>
          ) : (
            <div className="admin-table-scroll">
              <table>
                <thead>
                  <tr>
                    <th>Currency</th>
                    <th>Payments</th>
                    <th>Refunds</th>
                  </tr>
                </thead>
                <tbody>
                  {data.collections.map((c) => (
                    <tr key={c.currency}>
                      <th>{c.currency}</th>
                      <td>{money(c.paidMinor, c.currency)}</td>
                      <td>{money(c.refundedMinor, c.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
        <section className="admin-card">
          <h2>Your next actions</h2>
          <Link className="admin-action-link" href="/admin/orders">
            <span>
              <strong>Review payments</strong>
              <small>
                {data.pendingPayments} pending · {data.refundRequired} need
                refund review
              </small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
          <Link className="admin-action-link" href="/admin/draws">
            <span>
              <strong>Manage lottery rounds</strong>
              <small>Prices, ticket capacity and sales deadlines</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
          <Link className="admin-action-link" href="/admin/operations">
            <span>
              <strong>Check system operations</strong>
              <small>Sales controls, backups and worker status</small>
            </span>
            <ArrowUpRight size={18} />
          </Link>
        </section>
      </div>
      <p className="admin-muted">
        Counts captured {new Date(data.asOf).toLocaleString()}. Collections may
        include more recent activity.{" "}
        <button onClick={() => setRevision((v) => v + 1)}>
          Refresh overview
        </button>
      </p>
    </>
  );
}
