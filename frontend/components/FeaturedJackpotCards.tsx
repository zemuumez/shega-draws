"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { HelpCircle, Ticket, Clock, Globe, Trophy } from "lucide-react";

interface CardData {
  id: string;
  badge: string;
  badgeIcon: "globe" | "trophy";
  subtitle: string;
  jackpotAmount: string;
  drawDate: string;
  pools: string[];
  price: number;
  currency: "ETB" | "USD";
  targetTimestamp: number;
}

const FEATURED_CARDS: CardData[] = [
  {
    id: "card-usd",
    badge: "DIASPORA USD JACKPOT",
    badgeIcon: "globe",
    subtitle: "Next Grand Jackpot",
    jackpotAmount: "$1,250,000",
    drawDate: "Friday 18th July",
    pools: ["1K", "3K", "5K"],
    price: 50,
    currency: "USD",
    targetTimestamp: Date.now() + (2 * 86400000 + 14 * 3600000 + 21 * 60000 + 45000),
  },
  {
    id: "card-200",
    badge: "200 BIRR HOLIDAY JACKPOT",
    badgeIcon: "trophy",
    subtitle: "Next Grand Jackpot",
    jackpotAmount: "1,000,000 ETB",
    drawDate: "Friday 18th July",
    pools: ["1K", "3K", "5K"],
    price: 200,
    currency: "ETB",
    targetTimestamp: Date.now() + (2 * 86400000 + 14 * 3600000 + 21 * 60000 + 45000),
  },
  {
    id: "card-100",
    badge: "100 BIRR CLASSIC MULTI-POOL",
    badgeIcon: "trophy",
    subtitle: "Next Grand Jackpot",
    jackpotAmount: "500,000 ETB",
    drawDate: "Friday 18th July",
    pools: ["1K", "2K", "3K", "5K"],
    price: 100,
    currency: "ETB",
    targetTimestamp: Date.now() + (2 * 86400000 + 14 * 3600000 + 21 * 60000 + 45000),
  },
];

export function FeaturedJackpotCards() {
  const [countdownString, setCountdownString] = useState("02d 14h 21m 45s");

  useEffect(() => {
    function updateClock() {
      const target = Date.now() + (2 * 86400000 + 14 * 3600000 + 21 * 60000);
      const diff = Math.max(0, target - Date.now());
      const d = String(Math.floor(diff / (1000 * 60 * 60 * 24))).padStart(2, "0");
      const h = String(Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, "0");
      const m = String(Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, "0");
      const s = String(Math.floor((diff % (1000 * 60)) / 1000)).padStart(2, "0");
      setCountdownString(`${d}d ${h}m ${m}m ${s}s`.replace("mm", "m"));
      setCountdownString(`${d}d ${h}h ${m}m ${s}s`);
    }
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleCardBuy = (currency: "ETB" | "USD", price: number) => {
    const el = document.getElementById("choose-ticket");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto 36px",
        padding: "0 clamp(14px, 3vw, 24px)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 20,
          alignItems: "stretch",
        }}
      >
        {FEATURED_CARDS.map((card) => (
          <div
            key={card.id}
            style={{
              background: "#FFFDF5",
              borderRadius: "16px",
              border: "2.5px solid #FACC15",
              boxShadow: "0 10px 24px -6px rgba(234, 179, 8, 0.2), 0 2px 6px rgba(0,0,0,0.04)",
              padding: "20px 18px 18px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxSizing: "border-box",
              position: "relative",
              transition: "transform 180ms ease, box-shadow 180ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-4px)";
              e.currentTarget.style.boxShadow = "0 14px 30px -4px rgba(234, 179, 8, 0.35)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 10px 24px -6px rgba(234, 179, 8, 0.2), 0 2px 6px rgba(0,0,0,0.04)";
            }}
          >
            {/* ── Top Dashed Divider with Red Badge ── */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                <div style={{ flex: 1, borderBottom: "1.5px dashed #D1D5DB" }} />
                <span
                  style={{
                    background: "#DC2626",
                    color: "#FFFFFF",
                    fontSize: "0.6875rem",
                    fontWeight: 900,
                    letterSpacing: "0.5px",
                    padding: "4px 12px",
                    borderRadius: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    whiteSpace: "nowrap",
                    boxShadow: "0 2px 6px rgba(220, 38, 38, 0.35)",
                  }}
                >
                  {card.badgeIcon === "globe" ? <Globe size={12} /> : <Trophy size={12} />}
                  {card.badge}
                </span>
                <div style={{ flex: 1, borderBottom: "1.5px dashed #D1D5DB" }} />
              </div>

              {/* Grand Jackpot Details */}
              <div style={{ textAlign: "center", marginBottom: 12 }}>
                <span
                  style={{
                    fontSize: "0.8125rem",
                    color: "#4B5563",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 2,
                  }}
                >
                  {card.subtitle}
                </span>

                <h2
                  className="display"
                  style={{
                    fontSize: "clamp(1.85rem, 3.5vw, 2.35rem)",
                    fontWeight: 900,
                    color: "#0F172A",
                    margin: 0,
                    letterSpacing: "-0.5px",
                    lineHeight: 1.1,
                  }}
                >
                  {card.jackpotAmount}
                </h2>

                <span
                  style={{
                    fontSize: "0.75rem",
                    color: "#6B7280",
                    fontWeight: 700,
                    display: "block",
                    marginTop: 4,
                  }}
                >
                  {card.drawDate}
                </span>
              </div>

              {/* Pool Size Badges */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 14,
                }}
              >
                <span style={{ fontSize: "0.6875rem", fontWeight: 900, color: "#111827", textTransform: "uppercase" }}>
                  POOLS:
                </span>
                {card.pools.map((p) => (
                  <span
                    key={p}
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #D1D5DB",
                      borderRadius: "6px",
                      padding: "2px 6px",
                      fontSize: "0.6875rem",
                      fontWeight: 800,
                      color: "#111827",
                    }}
                  >
                    {p}
                  </span>
                ))}
              </div>

              {/* Live Draw Countdown Pill */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #E5E7EB",
                  borderRadius: "8px",
                  padding: "7px 12px",
                  textAlign: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 16,
                  boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
                }}
              >
                <Clock size={13} color="#DC2626" />
                <span
                  className="mono"
                  style={{
                    fontSize: "0.8125rem",
                    fontWeight: 800,
                    color: "#111827",
                  }}
                >
                  Live Draw:<span style={{ color: "#DC2626", marginLeft: 4 }}>{countdownString}</span>
                </span>
              </div>
            </div>

            {/* ── Bottom Dashed Divider with Action Buttons ── */}
            <div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                  marginBottom: 12,
                }}
              >
                <div style={{ flex: 1, borderBottom: "1.5px dashed #D1D5DB" }} />
                <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#9CA3AF" }} />
                <div style={{ flex: 1, borderBottom: "1.5px dashed #D1D5DB" }} />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Link
                  href="/how-it-works"
                  style={{
                    background: "#0F172A",
                    color: "#FFFFFF",
                    fontSize: "0.8125rem",
                    fontWeight: 800,
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #334155",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    textDecoration: "none",
                    boxShadow: "0 2px 6px rgba(15, 23, 42, 0.2)",
                    transition: "background 120ms ease",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#1E293B")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "#0F172A")}
                >
                  <HelpCircle size={13} /> How to Buy
                </Link>

                <button
                  type="button"
                  onClick={() => handleCardBuy(card.currency, card.price)}
                  style={{
                    background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #991B1B 100%)",
                    color: "#FFFFFF",
                    fontSize: "0.8125rem",
                    fontWeight: 900,
                    padding: "9px 12px",
                    borderRadius: "8px",
                    border: "1px solid #EF4444",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 5,
                    cursor: "pointer",
                    boxShadow: "0 4px 10px rgba(220, 38, 38, 0.4)",
                    transition: "transform 120ms ease, box-shadow 120ms ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-1px)";
                    e.currentTarget.style.boxShadow = "0 6px 14px rgba(220, 38, 38, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "0 4px 10px rgba(220, 38, 38, 0.4)";
                  }}
                >
                  <Ticket size={14} /> Buy Now
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
