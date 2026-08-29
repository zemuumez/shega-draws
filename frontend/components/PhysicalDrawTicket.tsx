"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ticket, Trophy, Calendar, Users, ShieldCheck, ChevronDown, ChevronUp, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { DrawState } from "@/lib/api";

interface PhysicalDrawTicketProps {
  draw: DrawState;
}

interface PoolTier {
  size: number;
  label: string;
  totalPrizeValue: string;
  jackpot1st: string;
  confirmedCount: number;
}

export function PhysicalDrawTicket({ draw }: PhysicalDrawTicketProps) {
  const { t, language } = useLanguage();
  const [showAllPrizes, setShowAllPrizes] = useState(false);

  const ticketPrice = draw.ticket_price || 100;

  // Pools configuration for this ticket (1K, 2K, 3K, 5K)
  const poolTiers: PoolTier[] = [
    { size: 1000, label: "1,000 (1K)", totalPrizeValue: `${(1000 * ticketPrice).toLocaleString()} ETB`, jackpot1st: `${(1000 * ticketPrice * 0.35).toLocaleString()} ETB`, confirmedCount: 740 },
    { size: 2000, label: "2,000 (2K)", totalPrizeValue: `${(2000 * ticketPrice).toLocaleString()} ETB`, jackpot1st: `${(2000 * ticketPrice * 0.30).toLocaleString()} ETB`, confirmedCount: 1480 },
    { size: 3000, label: "3,000 (3K)", totalPrizeValue: `${(3000 * ticketPrice).toLocaleString()} ETB`, jackpot1st: `${(3000 * ticketPrice * 0.30).toLocaleString()} ETB`, confirmedCount: 2210 },
    { size: 5000, label: "5,000 (5K)", totalPrizeValue: `${(5000 * ticketPrice).toLocaleString()} ETB`, jackpot1st: `${(5000 * ticketPrice * 0.32).toLocaleString()} ETB`, confirmedCount: 3850 },
  ];

  // Guaranteed 10 Winner Prize Breakdown for this draw ticket tier
  const prizes = [
    { rank: 1, label: "1st Place Jackpot", prizeTitle: "1st Place Cash", valueAmount: `${(2000 * ticketPrice * 0.30).toLocaleString()} ETB` },
    { rank: 2, label: "2nd Place Prize", prizeTitle: "2nd Place Cash", valueAmount: `${(2000 * ticketPrice * 0.225).toLocaleString()} ETB` },
    { rank: 3, label: "3rd Place Prize", prizeTitle: "3rd Place Cash", valueAmount: `${(2000 * ticketPrice * 0.15).toLocaleString()} ETB` },
    { rank: 4, label: "4th Place Prize", prizeTitle: "4th Place Cash", valueAmount: `${(2000 * ticketPrice * 0.075).toLocaleString()} ETB` },
    { rank: 5, label: "5th Place Prize", prizeTitle: "5th Place Cash", valueAmount: `${(2000 * ticketPrice * 0.06).toLocaleString()} ETB` },
    { rank: 6, label: "6th Place Prize", prizeTitle: "6th Place Cash", valueAmount: `${(2000 * ticketPrice * 0.05).toLocaleString()} ETB` },
    { rank: 7, label: "7th Place Prize", prizeTitle: "7th Place Cash", valueAmount: `${(2000 * ticketPrice * 0.04).toLocaleString()} ETB` },
    { rank: 8, label: "8th Place Prize", prizeTitle: "8th Place Cash", valueAmount: `${(2000 * ticketPrice * 0.04).toLocaleString()} ETB` },
    { rank: 9, label: "9th Place Prize", prizeTitle: "9th Place Cash", valueAmount: `${(2000 * ticketPrice * 0.03).toLocaleString()} ETB` },
    { rank: 10, label: "10th Place Prize", prizeTitle: "10th Place Cash", valueAmount: `${(2000 * ticketPrice * 0.03).toLocaleString()} ETB` },
  ];

  const totalEntries = 8280;
  const maxCapacity = 11000;
  const percentageSold = 75;

  const isOpen = draw.status === "open";
  const isUpcoming = draw.status === "upcoming";
  const isRevealed = draw.status === "revealed";

  const displayedPrizes = showAllPrizes ? prizes : prizes.slice(0, 3);

  return (
    <div
      className="physical-lottery-ticket ticket-card-container animate-fade"
      style={{
        margin: "0 0 24px 0",
        position: "relative",
        background: "#FFFDF7",
        border: "1.5px solid #FDE047",
      }}
    >
      {/* ── Left / Main Ticket Body ───────────────────────────────────── */}
      <div className="ticket-body-padding" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Top Bar: Serial & Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
              <span
                className="badge"
                style={{
                  background: isOpen ? "var(--teal-bg)" : isUpcoming ? "var(--gold-bg)" : "#F1F5F9",
                  color: isOpen ? "var(--teal-dark)" : isUpcoming ? "var(--gold-dark)" : "var(--text-muted)",
                  border: `1px solid ${isOpen ? "var(--teal-border)" : isUpcoming ? "var(--gold-border)" : "var(--gray-line)"}`,
                }}
              >
                {isOpen ? "● ACTIVE DRAW" : isUpcoming ? "🕒 SCHEDULED" : "✓ COMPLETED"}
              </span>

              <span className="badge badge-gold" style={{ fontSize: "0.75rem", fontWeight: 800 }}>
                {ticketPrice} ETB Fixed Ticket Price
              </span>

              <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontWeight: 700 }}>
                #{draw.draw_id}
              </span>
            </div>

            <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={13} color="#2A65E6" />
              <span>{new Date(draw.deadline).toLocaleDateString(language === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {/* Title & Pool Options Display (Non-clickable overview) */}
          <div style={{ marginBottom: 14 }}>
            <h3 className="display" style={{ fontSize: "clamp(1.2rem, 2.5vw, 1.45rem)", color: "var(--blue-navy)", lineHeight: 1.2, fontWeight: 800, marginBottom: 4 }}>
              {draw.title || `${ticketPrice} Birr Multi-Pool Jackpot Draw`}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginBottom: 12 }}>
              Total prize values per pool size (Choose your pool after clicking Buy Ticket):
            </p>

            {/* Non-choosable Info Cards for Pool Sizes */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 14 }}>
              {poolTiers.map((pool) => (
                <div
                  key={pool.size}
                  style={{
                    padding: "10px 10px",
                    borderRadius: 8,
                    border: "1.5px solid #E2E8F0",
                    background: "#FFFFFF",
                    textAlign: "center",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
                  }}
                >
                  <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--blue-navy)", display: "block" }}>
                    👥 {pool.label}
                  </span>
                  <span className="display" style={{ fontSize: "0.9375rem", fontWeight: 800, color: "var(--gold-deep)", display: "block", marginTop: 2 }}>
                    {pool.totalPrizeValue}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Tickets Confirmed Progress */}
          <div style={{ marginBottom: 16, background: "#F8FAFC", border: "1px solid var(--gray-line)", borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>
                TICKETS CONFIRMED ACROSS POOLS
              </span>
              <span className="mono" style={{ fontSize: "0.75rem", color: "var(--blue-navy)", fontWeight: 800 }}>
                {totalEntries.toLocaleString()} / {maxCapacity.toLocaleString()} Tickets ({percentageSold}%)
              </span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${percentageSold}%` }} />
            </div>
          </div>

          {/* ── Guaranteed Top 10 Winner Prizes ────────────────────────── */}
          <div style={{ background: "#FFFFFF", border: "1px solid var(--gray-line)", borderRadius: 12, padding: "14px 16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 6 }}>
              <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--blue-navy)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <Trophy size={15} color="var(--gold-dark)" /> Guaranteed 10 Winner Prizes
              </span>
              
              {/* Interactive Toggle Button */}
              <button
                type="button"
                onClick={() => setShowAllPrizes((prev) => !prev)}
                style={{
                  background: showAllPrizes ? "var(--blue-bg)" : "#FEF9C3",
                  border: showAllPrizes ? "1px solid var(--blue-border)" : "1px solid #FDE047",
                  color: showAllPrizes ? "#2A65E6" : "var(--gold-deep)",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  padding: "5px 12px",
                  borderRadius: 6,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  transition: "all var(--transition-fast)",
                }}
              >
                {showAllPrizes ? "Collapse to Top 3" : "View All 10 Prizes"}
                {showAllPrizes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>

            {/* Prize list grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 8 }}>
              {displayedPrizes.map((p) => {
                const isRank1 = p.rank === 1;
                const isRank2 = p.rank === 2;
                const isRank3 = p.rank === 3;

                return (
                  <div
                    key={p.rank}
                    style={{
                      background: isRank1 ? "#FEF9C3" : isRank2 ? "#EFF5FF" : isRank3 ? "#ECFDF5" : "#F8FAFC",
                      border: isRank1 ? "1.5px solid #FDE047" : isRank2 ? "1px solid #C3DAFE" : "1px solid var(--gray-line)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      className="mono"
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: isRank1 ? "var(--gold-deep)" : isRank2 ? "var(--blue-navy)" : "var(--text-subtle)",
                      }}
                    >
                      {isRank1 ? "🥇 1st" : isRank2 ? "🥈 2nd" : isRank3 ? "🥉 3rd" : `#${p.rank}`}
                    </span>

                    <strong className="mono" style={{ fontSize: "0.8125rem", color: isRank1 ? "var(--gold-deep)" : "var(--text-main)" }}>
                      {p.valueAmount || p.prizeTitle}
                    </strong>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Revealed Winning Numbers Pill */}
        {isRevealed && draw.winning_numbers && (
          <div
            style={{
              background: "#EFF5FF",
              border: "1.5px dashed #C3DAFE",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--blue-navy)", textTransform: "uppercase", display: "block", fontWeight: 700 }}>
                🏆 1st Place Winning Number
              </span>
              <span className="display" style={{ fontSize: "1.875rem", color: "#2A65E6", fontWeight: 800 }}>
                #{draw.winning_numbers[1] || "42"}
              </span>
            </div>
            <Link
              href="/results"
              className="btn-base btn-secondary"
              style={{ fontSize: "0.75rem", padding: "8px 12px" }}
            >
              <ShieldCheck size={14} /> Audit All Numbers
            </Link>
          </div>
        )}
      </div>

      {/* ── Perforated Tear-off Ticket Stub ──────────────────────────── */}
      <div className="ticket-stub-container">
        {/* Cutout punch notches (Desktop) */}
        <div className="ticket-punch-top desk-punch" style={{ top: -11, left: -11 }} />
        <div className="ticket-punch-bottom desk-punch" style={{ bottom: -11, left: -11 }} />
        
        {/* Cutout punch notches (Mobile) */}
        <div className="ticket-punch-left mob-punch" style={{ top: -11, left: -11 }} />
        <div className="ticket-punch-right mob-punch" style={{ top: -11, right: -11 }} />

        {/* Stub Header & Brand */}
        <div style={{ width: "100%" }}>
          <span className="mono" style={{ fontSize: "0.6875rem", color: "#2A65E6", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800 }}>
            OFFICIAL RAFFLE TICKET
          </span>
          <div className="display" style={{ fontSize: "1.125rem", color: "var(--blue-navy)", fontWeight: 800, margin: "2px 0 10px" }}>
            Rimna Lottery
          </div>

          {/* Multi-Pool Tag on Stub */}
          <div className="badge badge-blue" style={{ marginBottom: 12, fontSize: "0.75rem", fontWeight: 800 }}>
            1K - 5K Pools Available
          </div>

          {/* Fixed Price Stamp */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #FDE047",
              borderRadius: "var(--radius-md)",
              padding: "10px 12px",
              boxShadow: "0 2px 6px rgba(234, 179, 8, 0.15)",
              marginBottom: 14,
            }}
          >
            <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block" }}>
              TICKET PRICE
            </span>
            <span className="display" style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--gold-deep)", lineHeight: 1 }}>
              {ticketPrice} <span style={{ fontSize: "0.875rem" }}>ETB</span>
            </span>
          </div>

          {/* Barcode Graphic */}
          <div className="barcode-pattern" style={{ marginBottom: 6 }} />
          <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)" }}>
            RDL-{draw.draw_id}
          </span>
        </div>

        {/* Action Button on the Stub */}
        <div style={{ width: "100%", marginTop: 12 }}>
          {isOpen && (
            <Link
              href={`/enter?draw=${draw.id}`}
              className="btn-base btn-primary"
              style={{ width: "100%", padding: "13px 14px", fontSize: "0.9375rem" }}
            >
              <Ticket size={16} /> Buy Ticket ({ticketPrice} ETB)
            </Link>
          )}

          {isUpcoming && (
            <button
              type="button"
              className="btn-base btn-secondary"
              style={{ width: "100%", fontSize: "0.8125rem", padding: "11px" }}
              onClick={() => alert(`Draw #${draw.draw_id} opens soon!`)}
            >
              <Calendar size={14} /> Scheduled Soon
            </button>
          )}

          {isRevealed && (
            <Link
              href="/results"
              className="btn-base btn-secondary"
              style={{ width: "100%", fontSize: "0.8125rem", padding: "11px" }}
            >
              <ShieldCheck size={15} /> Audit Outcomes
            </Link>
          )}
        </div>
      </div>

      {/* ── Responsive CSS for Desktop & Mobile Layout ───────────────── */}
      <style>{`
        .ticket-card-container {
          display: grid;
          grid-template-columns: 1fr 270px;
        }
        .ticket-body-padding {
          padding: 26px 28px 22px;
        }
        .ticket-stub-container {
          background: var(--bg-ticket-stub);
          border-left: 2px dashed #CBD5E1;
          padding: 26px 18px;
          display: flex;
          flex-direction: column;
          justifyContent: space-between;
          align-items: center;
          text-align: center;
          position: relative;
        }
        .mob-punch {
          display: none !important;
        }
        .desk-punch {
          display: block !important;
        }

        /* Mobile layout styling */
        @media (max-width: 768px) {
          .ticket-card-container {
            grid-template-columns: 1fr !important;
          }
          .ticket-body-padding {
            padding: 18px 16px 16px !important;
          }
          .ticket-stub-container {
            border-left: none !important;
            border-top: 2px dashed #CBD5E1 !important;
            padding: 20px 16px !important;
          }
          .desk-punch {
            display: none !important;
          }
          .mob-punch {
            display: block !important;
            position: absolute;
            width: 22px;
            height: 22px;
            background: var(--bg-page);
            border-radius: 50%;
            border: 1.5px solid #E2E8F0;
            z-index: 5;
          }
        }
      `}</style>
    </div>
  );
}
