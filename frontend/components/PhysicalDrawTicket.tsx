"use client";

import React, { useState } from "react";
import { type DrawState, type Currency } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Trophy, Calendar, Ticket, ChevronDown, ChevronUp, Globe } from "lucide-react";
import { BuyTicketModal } from "./BuyTicketModal";

export function PhysicalDrawTicket({ draw }: { draw: DrawState }) {
  const { language } = useLanguage();
  const [showAllPrizes, setShowAllPrizes] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const isUSD = draw.currency === "USD";
  const currSymbol = isUSD ? "$" : "ETB";
  const ticketPrice = draw.ticket_price ?? (isUSD ? 25 : 100);

  // Dynamic participant pools
  const pools = draw.custom_pools && draw.custom_pools.length > 0
    ? draw.custom_pools
    : [
        { size: 1000, label: "1,000 (1K)", pool: isUSD ? `$${ticketPrice * 1000}` : `${(ticketPrice * 1000).toLocaleString()} ETB`, jackpot: isUSD ? `$${ticketPrice * 350} (1st)` : `${(ticketPrice * 350).toLocaleString()} ETB (1st)`, totalSum: ticketPrice * 1000 },
        { size: 2000, label: "2,000 (2K)", pool: isUSD ? `$${ticketPrice * 2000}` : `${(ticketPrice * 2000).toLocaleString()} ETB`, jackpot: isUSD ? `$${ticketPrice * 600} (1st)` : `${(ticketPrice * 600).toLocaleString()} ETB (1st)`, totalSum: ticketPrice * 2000 },
        { size: 3000, label: "3,000 (3K)", pool: isUSD ? `$${ticketPrice * 3000}` : `${(ticketPrice * 3000).toLocaleString()} ETB`, jackpot: isUSD ? `$${ticketPrice * 900} (1st)` : `${(ticketPrice * 900).toLocaleString()} ETB (1st)`, totalSum: ticketPrice * 3000 },
        { size: 5000, label: "5,000 (5K)", pool: isUSD ? `$${ticketPrice * 5000}` : `${(ticketPrice * 5000).toLocaleString()} ETB`, jackpot: isUSD ? `$${ticketPrice * 1600} (1st)` : `${(ticketPrice * 1600).toLocaleString()} ETB (1st)`, totalSum: ticketPrice * 5000 },
      ];

  const basePool = pools.find(p => p.size === 2000) || pools[0];
  const maxPool = pools[pools.length - 1];

  // Guaranteed 10 Winner Prizes Breakdown
  const prizes = draw.prizes && draw.prizes.length > 0
    ? draw.prizes
    : [
        { rank: 1, label: "1st Prize · Jackpot", valueAmount: isUSD ? `$${ticketPrice * 600}` : `${(ticketPrice * 600).toLocaleString()} ETB` },
        { rank: 2, label: "2nd Prize", valueAmount: isUSD ? `$${ticketPrice * 400}` : `${(ticketPrice * 400).toLocaleString()} ETB` },
        { rank: 3, label: "3rd Prize", valueAmount: isUSD ? `$${ticketPrice * 300}` : `${(ticketPrice * 300).toLocaleString()} ETB` },
        { rank: 4, label: "4th Prize", valueAmount: isUSD ? `$${ticketPrice * 180}` : `${(ticketPrice * 180).toLocaleString()} ETB` },
        { rank: 5, label: "5th Prize", valueAmount: isUSD ? `$${ticketPrice * 140}` : `${(ticketPrice * 140).toLocaleString()} ETB` },
        { rank: 6, label: "6th Prize", valueAmount: isUSD ? `$${ticketPrice * 100}` : `${(ticketPrice * 100).toLocaleString()} ETB` },
        { rank: 7, label: "7th Prize", valueAmount: isUSD ? `$${ticketPrice * 80}` : `${(ticketPrice * 80).toLocaleString()} ETB` },
        { rank: 8, label: "8th Prize", valueAmount: isUSD ? `$${ticketPrice * 70}` : `${(ticketPrice * 70).toLocaleString()} ETB` },
        { rank: 9, label: "9th Prize", valueAmount: isUSD ? `$${ticketPrice * 70}` : `${(ticketPrice * 70).toLocaleString()} ETB` },
        { rank: 10, label: "10th Prize", valueAmount: isUSD ? `$${ticketPrice * 60}` : `${(ticketPrice * 60).toLocaleString()} ETB` },
      ];

  const isOpen = draw.status === "open";
  const isUpcoming = draw.status === "upcoming";
  const isRevealed = draw.status === "revealed";

  const displayedPrizes = showAllPrizes ? prizes : prizes.slice(0, 3);

  return (
    <div
      className="physical-lottery-ticket ticket-card-container interactive-ticket-card rough-paper-ticket animate-fade"
      style={{
        margin: "0 0 28px 0",
        position: "relative",
      }}
    >
      {/* Authentic Semi-Circle Ticket Punch Notches on Perforation */}
      <div className="ticket-notch-top" />
      <div className="ticket-notch-bottom" />

      {/* ── Left / Main Ticket Body ───────────────────────────────────── */}
      <div className="ticket-body-padding" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Top Bar: Currency, Serial & Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                className="badge"
                style={{
                  background: isOpen ? "#ECFDF5" : isUpcoming ? "#FEF3C7" : "#F1F5F9",
                  color: isOpen ? "#059669" : isUpcoming ? "#D97706" : "#64748B",
                  border: `1.5px solid ${isOpen ? "#A7F3D0" : isUpcoming ? "#FDE68A" : "#CBD5E1"}`,
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  padding: "3px 9px",
                }}
              >
                {isOpen ? "ACTIVE DRAW" : isUpcoming ? "SCHEDULED" : "COMPLETED"}
              </span>

              {/* Currency Tag */}
              <span
                style={{
                  background: isUSD ? "#EFF6FF" : "#FEF9C3",
                  color: isUSD ? "#1D4ED8" : "#854D0E",
                  border: `1.5px solid ${isUSD ? "#BFDBFE" : "#FDE047"}`,
                  borderRadius: "6px",
                  padding: "3px 9px",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {isUSD ? <Globe size={13} /> : null}
                {isUSD ? `$${ticketPrice} USD Diaspora Ticket` : `${ticketPrice} ETB Fixed Price`}
              </span>

              <span className="mono" style={{ fontSize: "0.75rem", color: "#4B5563", fontWeight: 800 }}>
                #{draw.draw_id}
              </span>
            </div>

            <div className="mono" style={{ fontSize: "0.75rem", color: "#374151", fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
              <Calendar size={13} color="#1D4ED8" />
              <span>{new Date(draw.deadline).toLocaleDateString(language === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {/* Title & Pool Options Display */}
          <div style={{ marginBottom: 12 }}>
            <h3 className="display" style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", color: "#111827", lineHeight: 1.2, fontWeight: 900, marginBottom: 6 }}>
              {draw.title || (isUSD ? `$${ticketPrice} USD International Draw` : `${ticketPrice} Birr Multi-Pool Jackpot Draw`)}
            </h3>
            <p style={{ color: "#4B5563", fontSize: "0.8125rem", fontWeight: 500, marginBottom: 10 }}>
              Available participant pools (Select pool capacity after clicking Buy Ticket):
            </p>

            {/* Non-choosable Info Cards for Pool Sizes */}
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(110px, 1fr))`, gap: 8, marginBottom: 12 }}>
              {pools.map((pool) => (
                <div
                  key={pool.size}
                  style={{
                    padding: "8px 8px",
                    borderRadius: 8,
                    border: "1.5px solid #E5E7EB",
                    background: "#FFFFFF",
                    textAlign: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111827", display: "block" }}>
                    {pool.label}
                  </span>
                  <span className="display" style={{ fontSize: "0.9375rem", fontWeight: 900, color: "#D97706", display: "block", marginTop: 2 }}>
                    {pool.pool}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* ── Guaranteed Top 10 Winner Prizes ────────────────────────── */}
          <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
              <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 900, color: "#111827", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <Trophy size={14} color="#D97706" /> Guaranteed 10 Winner Prizes ({basePool.pool} Pool)
              </span>
              
              <button
                type="button"
                onClick={() => setShowAllPrizes((prev) => !prev)}
                style={{
                  background: showAllPrizes ? "#EFF6FF" : "#FEF9C3",
                  border: showAllPrizes ? "1px solid #BFDBFE" : "1px solid #FDE047",
                  color: showAllPrizes ? "#1D4ED8" : "#854D0E",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  padding: "3px 10px",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                {showAllPrizes ? "Top 3" : "All 10 Prizes"}
                {showAllPrizes ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Prize Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 6 }}>
              {displayedPrizes.map((p) => (
                <div
                  key={p.rank}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "6px 10px",
                    background: p.rank === 1 ? "#FEF9C3" : "#FAFAFA",
                    border: `1.5px solid ${p.rank === 1 ? "#FDE047" : "#E5E7EB"}`,
                    borderRadius: 6,
                  }}
                >
                  <span style={{ fontSize: "0.75rem", fontWeight: p.rank === 1 ? 900 : 700, color: p.rank === 1 ? "#854D0E" : "#374151" }}>
                    #{p.rank}
                  </span>
                  <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 900, color: p.rank === 1 ? "#DC2626" : "#111827" }}>
                    {p.valueAmount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Stub / Tear-off Ticket Stub ─────────────────────────── */}
      <div className="ticket-stub-container" style={{ background: "#F4EFE4", borderLeft: "2px dashed #9CA3AF" }}>
        {/* Stub Header & Brand */}
        <div style={{ width: "100%" }}>
          <span className="mono" style={{ fontSize: "0.6875rem", color: "#D97706", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 900 }}>
            {isUSD ? "DIASPORA USD TICKET" : "OFFICIAL RAFFLE TICKET"}
          </span>
          <div className="display" style={{ fontSize: "1.125rem", color: "#111827", fontWeight: 900, margin: "2px 0 8px" }}>
            Rimna Lottery
          </div>

          {/* Multi-Pool Tag on Stub */}
          <div
            style={{
              background: "#FEF9C3",
              border: "1.5px solid #FDE047",
              color: "#854D0E",
              borderRadius: "6px",
              padding: "3px 8px",
              fontSize: "0.75rem",
              fontWeight: 800,
              display: "inline-block",
              marginBottom: 10,
            }}
          >
            {pools.length} Pools Available
          </div>

          {/* Fixed Price Stamp */}
          <div
            style={{
              background: "#FFFFFF",
              border: "2px solid #F59E0B",
              borderRadius: "8px",
              padding: "8px 10px",
              marginBottom: 10,
              boxShadow: "0 2px 6px rgba(245, 158, 11, 0.15)",
            }}
          >
            <span className="mono" style={{ fontSize: "0.625rem", color: "#4B5563", textTransform: "uppercase", display: "block", fontWeight: 800 }}>
              TICKET PRICE
            </span>
            <span className="display" style={{ fontSize: "1.55rem", fontWeight: 900, color: "#D97706", lineHeight: 1.1 }}>
              {isUSD ? `$${ticketPrice}` : `${ticketPrice}`} <span style={{ fontSize: "0.875rem" }}>{currSymbol}</span>
            </span>
          </div>

          {/* Barcode Graphic */}
          <div className="barcode-pattern" style={{ marginBottom: 4 }} />
          <span className="mono" style={{ fontSize: "0.625rem", color: "#4B5563", fontWeight: 700 }}>
            RDL-{draw.draw_id}
          </span>
        </div>

        {/* Action Button on the Stub */}
        <div style={{ width: "100%", marginTop: 10 }}>
          {isOpen && (
            <button
              type="button"
              onClick={() => setIsBuyModalOpen(true)}
              className="casino-btn-red"
              style={{ width: "100%", padding: "11px 14px", fontSize: "0.9375rem", fontWeight: 900, cursor: "pointer" }}
            >
              <Ticket size={15} /> Buy ({isUSD ? `$${ticketPrice}` : `${ticketPrice} ETB`})
            </button>
          )}

          {isUpcoming && (
            <span
              style={{
                display: "block",
                textAlign: "center",
                fontSize: "0.8125rem",
                color: "#6B7280",
                fontWeight: 800,
                background: "#E5E7EB",
                padding: "10px",
                borderRadius: 8,
              }}
            >
              Opens Soon
            </span>
          )}

          {isRevealed && (
            <span
              style={{
                display: "block",
                textAlign: "center",
                fontSize: "0.8125rem",
                color: "#059669",
                fontWeight: 800,
                background: "#ECFDF5",
                border: "1px solid #A7F3D0",
                padding: "10px",
                borderRadius: 8,
              }}
            >
              ✓ Winners Drawn
            </span>
          )}
        </div>
      </div>

      {/* Buy Ticket Modal */}
      <BuyTicketModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        initialCurrency={draw.currency || "ETB"}
        initialPrice={ticketPrice}
        initialDrawId={draw.draw_id}
      />
    </div>
  );
}
