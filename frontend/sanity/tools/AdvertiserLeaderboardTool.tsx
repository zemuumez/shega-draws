"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";
import {
  Trophy,
  Users,
  Ticket,
  DollarSign,
  TrendingUp,
  Search,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  Award,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Clock,
  Filter,
} from "lucide-react";

interface AdvertiserRecord {
  _id: string;
  name: string;
  promoCode: string;
  platform?: string;
  handleOrUrl?: string;
  phone?: string;
  email?: string;
  commissionPerTicket?: number;
  commissionCurrency?: string;
  payoutMethod?: string;
  payoutAccount?: string;
  payoutRecipientName?: string;
  status?: string;
  notes?: string;
  _createdAt?: string;
}

interface PlayerReceiptSummary {
  _id: string;
  promoCode?: string;
  amount?: number;
  currency?: string;
  status?: string;
  submittedAt?: string;
}

export function AdvertiserLeaderboardTool() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [advertisers, setAdvertisers] = useState<AdvertiserRecord[]>([]);
  const [entries, setEntries] = useState<PlayerReceiptSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(key);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // 1. Fetch all advertisers
      const advData = await client.fetch<AdvertiserRecord[]>(
        `*[_type == "advertiser" && !(_id in path("drafts.**"))] | order(_createdAt desc){
          _id,
          name,
          promoCode,
          platform,
          handleOrUrl,
          phone,
          email,
          commissionPerTicket,
          commissionCurrency,
          payoutMethod,
          payoutAccount,
          payoutRecipientName,
          status,
          notes,
          _createdAt
        }`
      );

      // 2. Fetch all receipts that have a promoCode
      const receiptsData = await client.fetch<PlayerReceiptSummary[]>(
        `*[_type == "playerEntry" && !(_id in path("drafts.**")) && defined(promoCode)]{
          _id,
          promoCode,
          amount,
          currency,
          status,
          submittedAt
        }`
      );

      setAdvertisers(advData || []);
      setEntries(receiptsData || []);
    } catch (err) {
      console.error("Error loading affiliate leaderboard:", err);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Aggregate stats per advertiser / promo code
  const leaderboard = useMemo(() => {
    // Map promo code -> receipts list
    const codeMap = new Map<string, PlayerReceiptSummary[]>();
    for (const entry of entries) {
      if (!entry.promoCode) continue;
      const normalized = entry.promoCode.trim().toUpperCase();
      const list = codeMap.get(normalized) || [];
      list.push(entry);
      codeMap.set(normalized, list);
    }

    return advertisers.map((adv) => {
      const code = (adv.promoCode || "").trim().toUpperCase();
      const matchedEntries = codeMap.get(code) || [];
      const totalTickets = matchedEntries.length;
      const confirmedTickets = matchedEntries.filter((e) => e.status === "confirmed").length;
      const pendingTickets = matchedEntries.filter((e) => e.status === "pending" || !e.status).length;
      const rejectedTickets = matchedEntries.filter((e) => e.status === "rejected").length;

      // Revenue generated
      let revenueETB = 0;
      let revenueUSD = 0;
      for (const e of matchedEntries) {
        if (e.currency === "USD") {
          revenueUSD += e.amount || 0;
        } else {
          revenueETB += e.amount || 0;
        }
      }

      // Commission calculation (default 50 ETB per confirmed ticket if not specified)
      const rate = adv.commissionPerTicket ?? 50;
      const currency = adv.commissionCurrency || "ETB";
      const totalCommission = (currency === "USD" ? rate * confirmedTickets : rate * confirmedTickets);

      return {
        ...adv,
        totalTickets,
        confirmedTickets,
        pendingTickets,
        rejectedTickets,
        revenueETB,
        revenueUSD,
        totalCommission,
      };
    }).sort((a, b) => {
      // Sort by confirmed tickets descending, then total tickets
      if (b.confirmedTickets !== a.confirmedTickets) {
        return b.confirmedTickets - a.confirmedTickets;
      }
      return b.totalTickets - a.totalTickets;
    });
  }, [advertisers, entries]);

  // Filtered leaderboard
  const filteredLeaderboard = useMemo(() => {
    return leaderboard.filter((item) => {
      if (platformFilter !== "all" && item.platform !== platformFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        (item.promoCode || "").toLowerCase().includes(q) ||
        (item.platform || "").toLowerCase().includes(q) ||
        (item.phone || "").toLowerCase().includes(q)
      );
    });
  }, [leaderboard, platformFilter, searchQuery]);

  // Overall Global Summary Metrics
  const globalMetrics = useMemo(() => {
    const totalAdvertisers = advertisers.length;
    const activeAdvertisers = advertisers.filter((a) => a.status === "active" || !a.status).length;
    const totalReferredTickets = entries.length;
    const confirmedReferredTickets = entries.filter((e) => e.status === "confirmed").length;
    let totalRevETB = 0;
    let totalRevUSD = 0;
    for (const e of entries) {
      if (e.currency === "USD") totalRevUSD += e.amount || 0;
      else totalRevETB += e.amount || 0;
    }
    const totalCommissionsOwed = leaderboard.reduce((acc, curr) => acc + curr.totalCommission, 0);

    return {
      totalAdvertisers,
      activeAdvertisers,
      totalReferredTickets,
      confirmedReferredTickets,
      totalRevETB,
      totalRevUSD,
      totalCommissionsOwed,
    };
  }, [advertisers, entries, leaderboard]);

  return (
    <div
      style={{
        padding: "28px 32px",
        background: "#070B14",
        minHeight: "100vh",
        color: "#FFFFFF",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span
              style={{
                fontSize: "1.75rem",
                background: "linear-gradient(135deg, #FDE047 0%, #D97706 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 900,
                letterSpacing: "-0.5px",
              }}
            >
              🏆 Advertisers & Affiliate Leaderboard
            </span>
            <span
              style={{
                background: "rgba(253, 224, 71, 0.15)",
                color: "#FDE047",
                border: "1px solid rgba(253, 224, 71, 0.3)",
                fontSize: "0.75rem",
                fontWeight: 800,
                padding: "3px 10px",
                borderRadius: "999px",
                textTransform: "uppercase",
              }}
            >
              Influencer Tracking
            </span>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#94A3B8", margin: "6px 0 0" }}>
            Real-time ticket referrals, advertiser commissions, and promotional performance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "10px",
            color: "#FFFFFF",
            padding: "10px 18px",
            fontSize: "0.875rem",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "all 0.2s ease",
          }}
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          <span>{loading ? "Refreshing..." : "Refresh Stats"}</span>
        </button>
      </div>

      {/* Top 4 KPI Metrics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: 16,
          marginBottom: 28,
        }}
      >
        {/* Metric 1: Total Influencers */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>
              Total Advertisers
            </span>
            <Users size={18} color="#60A5FA" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#FFFFFF" }}>
            {globalMetrics.totalAdvertisers}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#34D399" }}>
            🟢 {globalMetrics.activeAdvertisers} active promo campaigns
          </div>
        </div>

        {/* Metric 2: Referred Tickets */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "1px solid rgba(253, 224, 71, 0.25)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "#FEF08A", fontWeight: 700, textTransform: "uppercase" }}>
              Referred Tickets Sold
            </span>
            <Ticket size={18} color="#FDE047" />
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#FDE047" }}>
            {globalMetrics.totalReferredTickets}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            {globalMetrics.confirmedReferredTickets} confirmed · {globalMetrics.totalReferredTickets - globalMetrics.confirmedReferredTickets} pending
          </div>
        </div>

        {/* Metric 3: Total Referred Revenue */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>
              Total Referral Sales
            </span>
            <TrendingUp size={18} color="#10B981" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#10B981" }}>
            {globalMetrics.totalRevETB.toLocaleString()} ETB
            {globalMetrics.totalRevUSD > 0 && ` + $${globalMetrics.totalRevUSD.toLocaleString()} USD`}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            Generated directly through creator promo codes
          </div>
        </div>

        {/* Metric 4: Commissions Earned */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(30, 41, 59, 0.7) 0%, rgba(15, 23, 42, 0.8) 100%)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.8125rem", color: "#94A3B8", fontWeight: 700, textTransform: "uppercase" }}>
              Estimated Payouts
            </span>
            <DollarSign size={18} color="#A78BFA" />
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#C4B5FD" }}>
            {globalMetrics.totalCommissionsOwed.toLocaleString()} ETB
          </div>
          <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
            Total affiliate earnings for confirmed sales
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
          marginBottom: 20,
          background: "rgba(15, 23, 42, 0.6)",
          padding: "12px 18px",
          borderRadius: "14px",
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            background: "rgba(0, 0, 0, 0.4)",
            border: "1px solid rgba(255, 255, 255, 0.15)",
            borderRadius: "10px",
            padding: "8px 14px",
            minWidth: 280,
            flex: 1,
            maxWidth: 420,
          }}
        >
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search by name, promo code, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: "#FFFFFF",
              fontSize: "0.875rem",
              outline: "none",
              width: "100%",
            }}
          />
        </div>

        {/* Platform Filter Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          {[
            { id: "all", label: "All Platforms" },
            { id: "tiktok", label: "🎵 TikTok" },
            { id: "telegram", label: "✈️ Telegram" },
            { id: "youtube", label: "▶️ YouTube" },
            { id: "instagram", label: "📸 Instagram" },
            { id: "facebook", label: "📘 Facebook" },
          ].map((pf) => (
            <button
              key={pf.id}
              type="button"
              onClick={() => setPlatformFilter(pf.id)}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                fontSize: "0.8125rem",
                fontWeight: 700,
                cursor: "pointer",
                border: platformFilter === pf.id ? "1px solid #FDE047" : "1px solid rgba(255, 255, 255, 0.1)",
                background: platformFilter === pf.id ? "rgba(253, 224, 71, 0.15)" : "rgba(0, 0, 0, 0.3)",
                color: platformFilter === pf.id ? "#FEF08A" : "#94A3B8",
                transition: "all 0.15s ease",
              }}
            >
              {pf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard Table / Cards */}
      {filteredLeaderboard.length === 0 ? (
        <div
          style={{
            background: "rgba(15, 23, 42, 0.5)",
            border: "1px dashed rgba(255, 255, 255, 0.2)",
            borderRadius: "16px",
            padding: "48px 24px",
            textAlign: "center",
          }}
        >
          <Award size={48} color="#94A3B8" style={{ margin: "0 auto 12px" }} />
          <h3 style={{ fontSize: "1.125rem", fontWeight: 800, color: "#FFFFFF", margin: "0 0 6px" }}>
            {advertisers.length === 0 ? "No Advertisers Registered Yet" : "No Matching Advertisers Found"}
          </h3>
          <p style={{ fontSize: "0.875rem", color: "#94A3B8", maxWidth: 450, margin: "0 auto 16px" }}>
            {advertisers.length === 0
              ? "To get started, go to '📢 Advertisers & Promo Codes' on the left menu and create your first influencer or marketing partner."
              : "Try adjusting your search query or platform filter to see other advertisers."}
          </p>
        </div>
      ) : (
        <div
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
              <thead>
                <tr
                  style={{
                    background: "rgba(0, 0, 0, 0.5)",
                    borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                    color: "#94A3B8",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <th style={{ padding: "14px 16px", width: 60 }}>Rank</th>
                  <th style={{ padding: "14px 16px" }}>Advertiser / Influencer</th>
                  <th style={{ padding: "14px 16px" }}>Promo Code</th>
                  <th style={{ padding: "14px 16px" }}>Referred Tickets</th>
                  <th style={{ padding: "14px 16px" }}>Sales Volume</th>
                  <th style={{ padding: "14px 16px" }}>Commission Earned</th>
                  <th style={{ padding: "14px 16px" }}>Payout Account</th>
                  <th style={{ padding: "14px 16px" }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaderboard.map((item, index) => {
                  const rank = index + 1;
                  const medal =
                    rank === 1 ? "🥇 1st" : rank === 2 ? "🥈 2nd" : rank === 3 ? "🥉 3rd" : `#${rank}`;
                  const isTop3 = rank <= 3;

                  return (
                    <tr
                      key={item._id}
                      style={{
                        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
                        background: isTop3 ? "rgba(253, 224, 71, 0.03)" : "transparent",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* Rank */}
                      <td style={{ padding: "16px", fontWeight: 900, color: isTop3 ? "#FDE047" : "#94A3B8" }}>
                        <span
                          style={{
                            background: isTop3 ? "rgba(253, 224, 71, 0.15)" : "rgba(255, 255, 255, 0.05)",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontSize: "0.8125rem",
                          }}
                        >
                          {medal}
                        </span>
                      </td>

                      {/* Name & Platform */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                          <div style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "0.9375rem" }}>
                            {item.name}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#94A3B8" }}>
                            <span
                              style={{
                                background: "rgba(255, 255, 255, 0.1)",
                                padding: "2px 6px",
                                borderRadius: "4px",
                                textTransform: "capitalize",
                                color: "#CBD5E1",
                                fontWeight: 700,
                              }}
                            >
                              {item.platform || "Direct"}
                            </span>
                            {item.handleOrUrl && (
                              <span>{item.handleOrUrl}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Promo Code */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span
                            style={{
                              fontFamily: "monospace",
                              fontWeight: 900,
                              fontSize: "0.9375rem",
                              color: "#FEF08A",
                              background: "rgba(253, 224, 71, 0.12)",
                              border: "1px solid rgba(253, 224, 71, 0.3)",
                              padding: "4px 8px",
                              borderRadius: "6px",
                            }}
                          >
                            {item.promoCode || "NONE"}
                          </span>
                          {item.promoCode && (
                            <button
                              type="button"
                              onClick={() => copyText(item.promoCode, item._id)}
                              title="Copy Promo Code"
                              style={{
                                background: "rgba(255, 255, 255, 0.08)",
                                border: "1px solid rgba(255, 255, 255, 0.15)",
                                borderRadius: "6px",
                                color: copiedCode === item._id ? "#10B981" : "#CBD5E1",
                                padding: "4px 6px",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                              }}
                            >
                              {copiedCode === item._id ? <Check size={13} /> : <Copy size={13} />}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Referred Tickets */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontWeight: 800, color: "#FFFFFF", fontSize: "1rem" }}>
                            {item.totalTickets} tickets
                          </span>
                          <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                            <strong style={{ color: "#34D399" }}>{item.confirmedTickets}</strong> confirmed ·{" "}
                            <strong style={{ color: "#FBBF24" }}>{item.pendingTickets}</strong> pending
                          </span>
                        </div>
                      </td>

                      {/* Sales Volume */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontWeight: 800, color: "#10B981", fontSize: "0.9375rem" }}>
                            {item.revenueETB.toLocaleString()} ETB
                          </span>
                          {item.revenueUSD > 0 && (
                            <span style={{ fontSize: "0.75rem", color: "#6EE7B7" }}>
                              + ${item.revenueUSD.toLocaleString()} USD
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Commission Earned */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontWeight: 900, color: "#FDE047", fontSize: "1rem" }}>
                            {item.totalCommission.toLocaleString()} {item.commissionCurrency || "ETB"}
                          </span>
                          <span style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>
                            Rate: {item.commissionPerTicket ?? 50} {item.commissionCurrency || "ETB"}/ticket
                          </span>
                        </div>
                      </td>

                      {/* Payout Account */}
                      <td style={{ padding: "16px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: "0.8125rem", color: "#E2E8F0", fontWeight: 700 }}>
                            {item.payoutMethod === "cbe" ? "🏦 CBE Bank" : "📱 Telebirr"}: {item.payoutAccount || item.phone || "Not set"}
                          </span>
                          {item.payoutRecipientName && (
                            <span style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>
                              {item.payoutRecipientName}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "16px" }}>
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                            background:
                              item.status === "active" || !item.status
                                ? "rgba(16, 185, 129, 0.15)"
                                : item.status === "paused"
                                ? "rgba(245, 158, 11, 0.15)"
                                : "rgba(239, 68, 68, 0.15)",
                            color:
                              item.status === "active" || !item.status
                                ? "#34D399"
                                : item.status === "paused"
                                ? "#FBBF24"
                                : "#F87171",
                            border:
                              item.status === "active" || !item.status
                                ? "1px solid rgba(16, 185, 129, 0.3)"
                                : item.status === "paused"
                                ? "1px solid rgba(245, 158, 11, 0.3)"
                                : "1px solid rgba(239, 68, 68, 0.3)",
                            fontSize: "0.6875rem",
                            fontWeight: 800,
                            padding: "3px 8px",
                            borderRadius: "6px",
                            textTransform: "uppercase",
                          }}
                        >
                          {item.status || "active"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
