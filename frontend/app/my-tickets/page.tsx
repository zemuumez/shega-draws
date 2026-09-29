"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Ticket,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Copy,
  Check,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { accountAPI, clearAccountToken } from "@/lib/account-api";
import type { Order } from "@/lib/backend";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function MyTicketsPage() {
  const router = useRouter();
  const { text } = useLanguage();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [orders, setOrders] = useState<Order[]>([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "confirmed" | "pending" | "refunded">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Authentication Guard
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace(`/login?redirect=${encodeURIComponent("/my-tickets")}`);
    }
  }, [sessionLoading, session, router]);

  // Load orders
  async function fetchOrders(showSpinner = true) {
    if (!session?.user?.id) return;
    if (showSpinner) setLoading(true);
    setErrorMessage("");

    try {
      const data = await accountAPI<Order[]>(`/orders?offset=${offset}`);
      setOrders(data || []);
    } catch (err: any) {
      setErrorMessage(err.message || "Failed to load tickets.");
    } finally {
      if (showSpinner) setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    if (session?.user?.id) {
      fetchOrders(true);
    }
  }, [session?.user?.id, offset]);

  // Auto-refresh when pending orders are present
  useEffect(() => {
    if (!session?.user?.id || !orders.some((o) => ["pending", "initializing"].includes(o.status))) {
      return;
    }
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") {
        fetchOrders(false);
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [session?.user?.id, orders, offset]);

  if (sessionLoading || !session) {
    return (
      <div className="auth-page-container">
        <div className="auth-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Sparkles size={36} color="#FDE047" style={{ margin: "0 auto 16px", animation: "spin 2s linear infinite" }} />
          <p style={{ color: "#D1D5DB" }}>{text("Loading your tickets…")}</p>
        </div>
      </div>
    );
  }

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    if (activeFilter === "all") return true;
    if (activeFilter === "confirmed") return !o.refunded && (o.status === "paid" || o.status === "confirmed" || o.status === "completed");
    if (activeFilter === "pending") return !o.refunded && (o.status === "pending" || o.status === "initializing");
    if (activeFilter === "refunded") return o.refunded || o.status === "refunded";
    return true;
  });

  return (
    <div className="tickets-page-container">
      {/* ── Header ─── */}
      <div className="tickets-hero-header">
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <Ticket size={28} color="#FDE047" />
            <h1>{text("My Tickets & Entries")}</h1>
          </div>
          <p style={{ color: "#9CA3AF", fontSize: "0.875rem", margin: 0 }}>
            {text("Track your selected numbers, payment status, and draw participation.")}
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => {
              setRefreshing(true);
              fetchOrders(false);
            }}
            disabled={refreshing}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "#1F2937",
              border: "1px solid #374151",
              borderRadius: "10px",
              color: "#D1D5DB",
              fontSize: "0.8125rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <RefreshCw size={14} className={refreshing ? "spin-icon" : ""} />
            <span>{refreshing ? text("Refreshing…") : text("Refresh")}</span>
          </button>

          <Link
            href="/#choose-ticket"
            className="casino-btn-gold"
            style={{ padding: "8px 16px", fontSize: "0.8125rem", textDecoration: "none" }}
          >
            <span>{text("Buy More Tickets")}</span>
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      {/* ── Unverified Notice ─── */}
      {!session.user.emailVerified && (
        <div
          style={{
            background: "rgba(245, 158, 11, 0.12)",
            border: "1.5px solid #F59E0B",
            borderRadius: "12px",
            padding: "14px 18px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <span style={{ color: "#FDE047", fontSize: "0.875rem" }}>
            {text("Notice: Please verify your email address to ensure prompt notification when winning numbers are drawn.")}
          </span>
          <Link
            href="/profile"
            style={{
              color: "#FDE047",
              fontSize: "0.8125rem",
              fontWeight: 800,
              textDecoration: "underline",
            }}
          >
            {text("Go to Profile Settings")}
          </Link>
        </div>
      )}

      {/* ── Filters ─── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
        {(
          [
            { id: "all", label: text("All Tickets") },
            { id: "confirmed", label: text("Confirmed / Paid") },
            { id: "pending", label: text("Pending Payment") },
            { id: "refunded", label: text("Refunded") },
          ] as const
        ).map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveFilter(tab.id)}
            style={{
              padding: "6px 14px",
              background: activeFilter === tab.id ? "#1F2937" : "transparent",
              color: activeFilter === tab.id ? "#FDE047" : "#9CA3AF",
              border: activeFilter === tab.id ? "1.5px solid #FDE047" : "1px solid #374151",
              borderRadius: "20px",
              fontSize: "0.8125rem",
              fontWeight: 800,
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "all 0.15s ease",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Error Alert ─── */}
      {errorMessage && (
        <div className="auth-alert-message error" style={{ marginBottom: "20px" }}>
          <span>{errorMessage}</span>
        </div>
      )}

      {/* ── Tickets List ─── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <Sparkles size={32} color="#FDE047" style={{ margin: "0 auto 12px", animation: "spin 2s linear infinite" }} />
          <p style={{ color: "#9CA3AF" }}>{text("Loading ticket entries…")}</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="tickets-empty-card">
          <Ticket size={48} color="#FDE047" style={{ margin: "0 auto 12px", opacity: 0.8 }} />
          <h3>{text("No tickets found")}</h3>
          <p>
            {activeFilter === "all"
              ? text("You have not purchased any tickets yet. Explore our open pools, pick your lucky number, and participate in the live public draw!")
              : text("No tickets match the selected filter category.")}
          </p>
          <Link
            href="/#choose-ticket"
            className="casino-btn-gold"
            style={{ padding: "10px 24px", fontSize: "0.875rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "8px" }}
          >
            <span>{text("Explore Active Draws")}</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div>
          {filteredOrders.map((o) => {
            const isPending = !o.refunded && (o.status === "pending" || o.status === "initializing");
            const isPaid = !o.refunded && (o.status === "paid" || o.status === "confirmed" || o.status === "completed");
            const isExpired = isPending && Date.parse(o.expiresAt) <= Date.now();
            const formattedDate = new Date(o.createdAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            });

            return (
              <article key={o.id} className="ticket-item-card">
                {/* Number Badge */}
                <div className="ticket-number-badge">
                  <span className="label">{text("Ticket No.")}</span>
                  <span className="number">#{o.number}</span>
                </div>

                {/* Ticket Details */}
                <div className="ticket-meta-info">
                  <div className="draw-title">
                    {text("Draw Pool")}: <span style={{ color: "#FDE047" }}>{o.drawId}</span>
                  </div>
                  <div className="meta-subtext">
                    <span>{formattedDate}</span>
                    <span>•</span>
                    <span>
                      {text("Payment")}: <strong style={{ color: "#E5E7EB" }}>{o.provider?.toUpperCase()}</strong>
                    </span>
                    <span>•</span>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(o.id);
                        setCopiedId(o.id);
                        setTimeout(() => setCopiedId(null), 2000);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#9CA3AF",
                        padding: 0,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "0.75rem",
                      }}
                      title="Copy Reference ID"
                    >
                      <span>ID: {o.id.slice(0, 8)}…</span>
                      {copiedId === o.id ? <Check size={12} color="#10B981" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>

                {/* Price & Action */}
                <div className="ticket-action-col">
                  <div className="ticket-price-display">
                    {o.currency} {(o.amountMinor / 100).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>

                  <div>
                    {o.refunded ? (
                      <span className="status-badge-pill" style={{ background: "rgba(107, 114, 128, 0.2)", border: "1px solid #6B7280", color: "#9CA3AF" }}>
                        {text("Refunded")}
                      </span>
                    ) : isPaid ? (
                      <span className="status-badge-pill verified">
                        <CheckCircle2 size={13} /> {text("Confirmed / Paid")}
                      </span>
                    ) : isExpired ? (
                      <span className="status-badge-pill" style={{ background: "rgba(239, 68, 68, 0.2)", border: "1px solid #EF4444", color: "#FCA5A5" }}>
                        {text("Expired")}
                      </span>
                    ) : (
                      <span className="status-badge-pill unverified">
                        <Clock size={13} /> {text("Pending Payment")}
                      </span>
                    )}
                  </div>

                  {/* Continue Payment Link if still pending and unexpired */}
                  {isPending && !isExpired && o.checkoutUrl && (
                    <a
                      href={o.checkoutUrl}
                      target="_blank"
                      rel="noreferrer"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "4px 10px",
                        background: "#FDE047",
                        color: "#111827",
                        borderRadius: "6px",
                        fontSize: "0.75rem",
                        fontWeight: 900,
                        textDecoration: "none",
                        marginTop: "4px",
                      }}
                    >
                      <span>{text("Complete Payment")}</span>
                      <ExternalLink size={12} />
                    </a>
                  )}
                </div>
              </article>
            );
          })}

          {/* Pagination */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <button
              type="button"
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - 100))}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#D1D5DB",
                fontSize: "0.8125rem",
                fontWeight: 700,
                cursor: offset === 0 ? "not-allowed" : "pointer",
                opacity: offset === 0 ? 0.5 : 1,
              }}
            >
              <ChevronLeft size={16} />
              <span>{text("Previous")}</span>
            </button>

            <span style={{ color: "#9CA3AF", fontSize: "0.8125rem" }}>
              {text("Showing entries")} {offset + 1} – {offset + filteredOrders.length}
            </span>

            <button
              type="button"
              disabled={orders.length < 100}
              onClick={() => setOffset(offset + 100)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "8px 14px",
                background: "#1F2937",
                border: "1px solid #374151",
                borderRadius: "8px",
                color: "#D1D5DB",
                fontSize: "0.8125rem",
                fontWeight: 700,
                cursor: orders.length < 100 ? "not-allowed" : "pointer",
                opacity: orders.length < 100 ? 0.5 : 1,
              }}
            >
              <span>{text("Next")}</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
