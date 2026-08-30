"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ticket, Trophy, Calendar, Users, ShieldCheck, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { type DrawState, type Currency, USD_TICKET_CONFIGS, ETB_TICKET_CONFIGS } from "@/lib/api";
import { BuyTicketModal } from "./BuyTicketModal";

interface PhysicalDrawTicketProps {
  draw: DrawState;
}

export function PhysicalDrawTicket({ draw }: PhysicalDrawTicketProps) {
  const { t, language } = useLanguage();
  const [showAllPrizes, setShowAllPrizes] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const currency: Currency = draw.currency || "ETB";
  const isUSD = currency === "USD";
  const currSymbol = isUSD ? "$" : "ETB";
  const ticketPrice = draw.ticket_price || (isUSD ? 25 : 100);

  // Find pool options configuration
  const poolConfig = isUSD
    ? USD_TICKET_CONFIGS.find((c) => c.price === ticketPrice) || USD_TICKET_CONFIGS[0]
    : ETB_TICKET_CONFIGS.find((c) => c.price === ticketPrice) || ETB_TICKET_CONFIGS[0];

  const pools = draw.custom_pools || poolConfig.pools;

  // Compute guaranteed 10 winner prizes for this ticket
  const basePool = pools[pools.length > 1 ? 1 : 0] || pools[0];
  const totalPoolVal = basePool.totalSum || (ticketPrice * basePool.size);

  const prizes = [
    { rank: 1, label: "1st Place Jackpot", valueAmount: isUSD ? `$${Math.round(totalPoolVal * 0.30).toLocaleString()}` : `${Math.round(totalPoolVal * 0.30).toLocaleString()} ETB` },
    { rank: 2, label: "2nd Place Prize",   valueAmount: isUSD ? `$${Math.round(totalPoolVal * 0.20).toLocaleString()}` : `${Math.round(totalPoolVal * 0.20).toLocaleString()} ETB` },
    { rank: 3, label: "3rd Place Prize",   valueAmount: isUSD ? `$${Math.round(totalPoolVal * 0.15).toLocaleString()}` : `${Math.round(totalPoolVal * 0.15).toLocaleString()} ETB` },
    { rank: 4, label: "4th Place Prize",   valueAmount: isUSD ? `$${Math.round(totalPoolVal * 0.08).toLocaleString()}` : `${Math.round(totalPoolVal * 0.08).toLocaleString()} ETB` },
    { rank: 5, label: "5th Place Prize",   valueAmount: isUSD ? `$${Math.round(totalPoolVal * 0.06).toLocaleString()}` : `${Math.round(totalPoolVal * 0.06).toLocaleString()} ETB` },
    { rank: 6, label: "6th Place Prize",   valueAmount: isUSD ? `$${Math.round(totalPoolVal * 0.05).toLocaleString()}` : `${Math.round(totalPoolVal * 0.05).toLocaleString()} ETB` },
    { rank: 7, label: "7th Place Prize",   valueAmount: isUSD ? `$${Math.round(totalPoolVal * 0.04).toLocaleString()}` : `${Math.round(totalPoolVal * 0.04).toLocaleString()} ETB` },
    { rank: 8, label: "8th Place Prize",   valueAmount: isUSD ? `$${Math.round(totalPoolVal * 0.04).toLocaleString()}` : `${Math.round(totalPoolVal * 0.04).toLocaleString()} ETB` },
    { rank: 9, label: "9th Place Prize",   valueAmount: isUSD ? `$${Math.round(totalPoolVal * 0.04).toLocaleString()}` : `${Math.round(totalPoolVal * 0.04).toLocaleString()} ETB` },
    { rank: 10, label: "10th Place Prize", valueAmount: isUSD ? `$${Math.round(totalPoolVal * 0.04).toLocaleString()}` : `${Math.round(totalPoolVal * 0.04).toLocaleString()} ETB` },
  ];

  const totalEntries = draw.total_entries || (draw.status === "revealed" ? basePool.size : Math.round(basePool.size * 0.72));
  const maxCapacity = basePool.size;
  const percentageSold = Math.min(100, Math.round((totalEntries / maxCapacity) * 100));

  const isOpen = draw.status === "open";
  const isUpcoming = draw.status === "upcoming";
  const isRevealed = draw.status === "revealed";

  const displayedPrizes = showAllPrizes ? prizes : prizes.slice(0, 3);

  return (
    <div
      className="physical-lottery-ticket ticket-card-container interactive-ticket-card lottery-watermark animate-fade"
      style={{
        margin: "0 0 16px 0",
        position: "relative",
        background: "#FFFDF7",
        border: "1.5px solid #FDE047",
        borderRadius: "14px",
      }}
    >
      {/* ── Left / Main Ticket Body ───────────────────────────────────── */}
      <div className="ticket-body-padding" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Top Bar: Currency, Serial & Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span
                className="badge"
                style={{
                  background: isOpen ? "var(--teal-bg)" : isUpcoming ? "var(--gold-bg)" : "#F1F5F9",
                  color: isOpen ? "var(--teal-dark)" : isUpcoming ? "var(--gold-dark)" : "var(--text-muted)",
                  border: `1px solid ${isOpen ? "var(--teal-border)" : isUpcoming ? "var(--gold-border)" : "var(--gray-line)"}`,
                  fontSize: "0.6875rem",
                  fontWeight: 900,
                }}
              >
                {isOpen ? "ACTIVE DRAW" : isUpcoming ? "SCHEDULED" : "COMPLETED"}
              </span>

              {/* Currency Tag */}
              <span className={isUSD ? "badge badge-blue" : "badge badge-gold"} style={{ fontSize: "0.6875rem", fontWeight: 800 }}>
                {isUSD ? <Globe size={11} /> : null}
                {isUSD ? `$${ticketPrice} USD Diaspora Ticket` : `${ticketPrice} ETB Fixed Price`}
              </span>

              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", fontWeight: 700 }}>
                #{draw.draw_id}
              </span>
            </div>

            <div className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 5 }}>
              <Calendar size={12} color="#2A65E6" />
              <span>{new Date(draw.deadline).toLocaleDateString(language === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {/* Title & Pool Options Display */}
          <div style={{ marginBottom: 10 }}>
            <h3 className="display" style={{ fontSize: "clamp(1.15rem, 2.2vw, 1.35rem)", color: "#111827", lineHeight: 1.2, fontWeight: 800, marginBottom: 4 }}>
              {draw.title || (isUSD ? `$${ticketPrice} USD International Draw` : `${ticketPrice} Birr Multi-Pool Jackpot Draw`)}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.75rem", marginBottom: 8 }}>
              Available participant pools (Select pool capacity after clicking Buy Ticket):
            </p>

            {/* Non-choosable Info Cards for Pool Sizes */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(100px, 1fr))`, gap: 6, marginBottom: 10 }}>
              {pools.map((pool) => (
                <div
                  key={pool.size}
                  style={{
                    padding: "6px 6px",
                    borderRadius: 6,
                    border: "1px solid #E2E8F0",
                    background: "#FFFFFF",
                    textAlign: "center",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                  }}
                >
                  <span className="mono" style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#111827", display: "block" }}>
                    {pool.label}
                  </span>
                  <span className="display" style={{ fontSize: "0.8125rem", fontWeight: 800, color: "var(--gold-deep)", display: "block", marginTop: 1 }}>
                    {pool.pool}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Guaranteed Top 10 Winner Prizes ────────────────────────── */}
          <div style={{ background: "#FFFFFF", border: "1px solid var(--gray-line)", borderRadius: 10, padding: "10px 12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 6 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#111827", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                <Trophy size={13} color="var(--gold-dark)" /> Guaranteed 10 Winner Prizes ({basePool.pool} Pool)
              </span>
              
              <button
                type="button"
                onClick={() => setShowAllPrizes((prev) => !prev)}
                style={{
                  background: showAllPrizes ? "var(--blue-bg)" : "#FEF9C3",
                  border: showAllPrizes ? "1px solid var(--blue-border)" : "1px solid #FDE047",
                  color: showAllPrizes ? "#2A65E6" : "var(--gold-deep)",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  padding: "2px 8px",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {showAllPrizes ? "Top 3" : "All 10 Prizes"}
                {showAllPrizes ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>

            {/* Prize Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 5 }}>
              {displayedPrizes.map((p) => (
                <div
                  key={p.rank}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "4px 8px",
                    background: p.rank === 1 ? "#FEF9C3" : "#F8FAFC",
                    border: `1px solid ${p.rank === 1 ? "#FDE047" : "#E2E8F0"}`,
                    borderRadius: 6,
                  }}
                >
                  <span style={{ fontSize: "0.6875rem", fontWeight: p.rank === 1 ? 800 : 600, color: p.rank === 1 ? "var(--gold-deep)" : "#374151" }}>
                    #{p.rank}
                  </span>
                  <span className="mono" style={{ fontSize: "0.6875rem", fontWeight: 800, color: p.rank === 1 ? "#DC2626" : "#111827" }}>
                    {p.valueAmount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Pool Progress Bar */}
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", marginBottom: 3 }}>
            <span style={{ color: "var(--text-subtle)", fontWeight: 700 }}>
              Pool Capacity Sold:
            </span>
            <span className="mono" style={{ color: "#111827", fontWeight: 800 }}>
              {totalEntries.toLocaleString()} / {maxCapacity.toLocaleString()} Tickets ({percentageSold}%)
            </span>
          </div>
          <div style={{ width: "100%", height: 6, background: "#E2E8F0", borderRadius: 4, overflow: "hidden" }}>
            <div
              style={{
                width: `${percentageSold}%`,
                height: "100%",
                background: "linear-gradient(90deg, #FDE047 0%, #EAB308 100%)",
                borderRadius: 4,
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Right Stub / Tear-off Ticket Stub ─────────────────────────── */}
      <div className="ticket-stub-container">
        {/* Stub Header & Brand */}
        <div style={{ width: "100%" }}>
          <span className="mono" style={{ fontSize: "0.625rem", color: "#D97706", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 900 }}>
            {isUSD ? "DIASPORA USD TICKET" : "OFFICIAL RAFFLE TICKET"}
          </span>
          <div className="display" style={{ fontSize: "1rem", color: "#111827", fontWeight: 800, margin: "1px 0 6px" }}>
            Rimna Lottery
          </div>

          {/* Multi-Pool Tag on Stub */}
          <div className="badge badge-gold" style={{ marginBottom: 8, fontSize: "0.6875rem", fontWeight: 800 }}>
            {pools.length} Pools Available
          </div>

          {/* Fixed Price Stamp */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #FDE047",
              borderRadius: "8px",
              padding: "6px 8px",
              boxShadow: "0 2px 5px rgba(234, 179, 8, 0.15)",
              marginBottom: 8,
            }}
          >
            <span className="mono" style={{ fontSize: "0.5625rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block" }}>
              TICKET PRICE
            </span>
            <span className="display" style={{ fontSize: "1.35rem", fontWeight: 900, color: "var(--gold-deep)", lineHeight: 1 }}>
              {isUSD ? `$${ticketPrice}` : `${ticketPrice}`} <span style={{ fontSize: "0.75rem" }}>{currSymbol}</span>
            </span>
          </div>

          {/* Barcode Graphic */}
          <div className="barcode-pattern" style={{ marginBottom: 4 }} />
          <span className="mono" style={{ fontSize: "0.5625rem", color: "var(--text-subtle)" }}>
            RDL-{draw.draw_id}
          </span>
        </div>

        {/* Action Button on the Stub */}
        <div style={{ width: "100%", marginTop: 8 }}>
          {isOpen && (
            <button
              type="button"
              onClick={() => setIsBuyModalOpen(true)}
              className="casino-btn-red"
              style={{ width: "100%", padding: "10px 12px", fontSize: "0.8125rem", cursor: "pointer" }}
            >
              <Ticket size={14} /> Buy ({isUSD ? `$${ticketPrice}` : `${ticketPrice} ETB`})
            </button>
          )}

          <BuyTicketModal
            isOpen={isBuyModalOpen}
            onClose={() => setIsBuyModalOpen(false)}
            initialCurrency={currency}
            initialPrice={ticketPrice}
            initialDrawId={draw.id}
          />

          {isUpcoming && (
            <button
              type="button"
              className="btn-base btn-secondary"
              style={{ width: "100%", fontSize: "0.75rem", padding: "8px" }}
              onClick={() => alert(`Draw #${draw.draw_id} opens soon!`)}
            >
              <Calendar size={13} /> Scheduled Soon
            </button>
          )}

          {isRevealed && (
            <Link
              href="/results"
              className="btn-base btn-secondary"
              style={{ width: "100%", fontSize: "0.75rem", padding: "8px" }}
            >
              <ShieldCheck size={13} /> Audit Outcomes
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
