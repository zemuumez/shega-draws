"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ticket, Trophy, Calendar, Users, ShieldCheck, ChevronDown, ChevronUp, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { DrawState } from "@/lib/api";

interface PhysicalDrawTicketProps {
  draw: DrawState;
}

export function PhysicalDrawTicket({ draw }: PhysicalDrawTicketProps) {
  const { t, language } = useLanguage();
  const [showAllPrizes, setShowAllPrizes] = useState(false);

  const isOpen = draw.status === "open";
  const isUpcoming = draw.status === "upcoming";
  const isRevealed = draw.status === "revealed";

  const ticketPrice = draw.ticket_price || 100;
  const maxCapacity = draw.max_capacity || 2000;
  const totalEntries = draw.total_entries || (isRevealed ? maxCapacity : Math.round(maxCapacity * 0.7));
  const percentageSold = Math.min(100, Math.round((totalEntries / maxCapacity) * 100));

  const prizes = draw.prizes || [];
  const topPrizesToDisplay = showAllPrizes ? prizes : prizes.slice(0, 4);

  return (
    <div
      className="physical-lottery-ticket animate-fade"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 270px",
        margin: "0 0 22px 0",
        position: "relative",
        background: "#FFFDF7",
        border: "1.5px solid #FDE047",
      }}
    >
      {/* ── Left / Main Ticket Body ───────────────────────────────────── */}
      <div style={{ padding: "26px 28px 22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Top Bar: People Size & Status */}
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

              {/* People Capacity Size Badge */}
              <span className="badge badge-blue" style={{ fontSize: "0.75rem", fontWeight: 800 }}>
                <Users size={12} /> {maxCapacity.toLocaleString()} People Pool
              </span>

              <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontWeight: 700 }}>
                #{draw.draw_id}
              </span>
            </div>

            <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={13} color="var(--blue-royal)" />
              <span>{new Date(draw.deadline).toLocaleDateString(language === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {/* Title & Pool Sum */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
            <div>
              <h3 className="display" style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.5rem)", color: "var(--blue-navy)", lineHeight: 1.2, fontWeight: 800 }}>
                {draw.title || `${maxCapacity.toLocaleString()} People Draw (${ticketPrice} Birr)`}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
                {draw.description}
              </p>
            </div>

            <div style={{ textAlign: "right", background: "#FEF9C3", padding: "8px 14px", borderRadius: 10, border: "1px solid #FDE047" }}>
              <span className="mono" style={{ fontSize: "0.625rem", color: "var(--gold-deep)", textTransform: "uppercase", display: "block", fontWeight: 700 }}>
                TOTAL PRIZE POOL
              </span>
              <span className="display" style={{ fontSize: "1.25rem", color: "var(--gold-deep)", fontWeight: 800 }}>
                {draw.total_prize_value || "300,000 ETB"}
              </span>
            </div>
          </div>

          {/* Ticket Capacity Sold Progress */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>
                TICKETS CONFIRMED
              </span>
              <span className="mono" style={{ fontSize: "0.75rem", color: "var(--blue-navy)", fontWeight: 700 }}>
                {totalEntries.toLocaleString()} / {maxCapacity.toLocaleString()} ({percentageSold}%)
              </span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${percentageSold}%` }} />
            </div>
          </div>

          {/* ── Top 10 Prize Breakdown ─────────────────────────────────── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--blue-navy)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <Trophy size={14} color="var(--gold-dark)" /> Guaranteed Top 10 Winner Prizes
              </span>
              {prizes.length > 4 && (
                <button
                  type="button"
                  onClick={() => setShowAllPrizes(!showAllPrizes)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--blue-royal)",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  {showAllPrizes ? "Show Top 4" : `View All ${prizes.length} Prizes`}
                  {showAllPrizes ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              )}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 8 }}>
              {topPrizesToDisplay.map((p) => {
                const isRank1 = p.rank === 1;
                const isRank2 = p.rank === 2;
                const isRank3 = p.rank === 3;

                return (
                  <div
                    key={p.rank}
                    style={{
                      background: isRank1 ? "#FEF9C3" : isRank2 ? "#EFF6FF" : isRank3 ? "#ECFDF5" : "#FFFFFF",
                      border: isRank1 ? "1.5px solid #FDE047" : isRank2 ? "1px solid #BFDBFE" : "1px solid var(--gray-line)",
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
                        fontSize: "0.6875rem",
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
              background: "#EFF6FF",
              border: "1.5px dashed #BFDBFE",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--blue-navy)", textTransform: "uppercase", display: "block", fontWeight: 700 }}>
                🏆 1st Place Winning Number
              </span>
              <span className="display" style={{ fontSize: "1.875rem", color: "var(--blue-royal)", fontWeight: 800 }}>
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

      {/* ── Perforated Tear-off Ticket Stub (Right Column) ─────────────── */}
      <div
        style={{
          background: "var(--bg-ticket-stub)",
          borderLeft: "2px dashed #CBD5E1",
          padding: "26px 18px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "center",
          textAlign: "center",
          position: "relative",
        }}
      >
        {/* Cutout punch notches on tear-line */}
        <div className="ticket-punch-top" style={{ top: -11, left: -11 }} />
        <div className="ticket-punch-bottom" style={{ bottom: -11, left: -11 }} />

        {/* Stub Header & Brand */}
        <div style={{ width: "100%" }}>
          <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--blue-royal)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 800 }}>
            OFFICIAL ENTRY
          </span>
          <div className="display" style={{ fontSize: "1.125rem", color: "var(--blue-navy)", fontWeight: 800, margin: "2px 0 10px" }}>
            PrimeDraws
          </div>

          {/* People Pool Size Tag on Stub */}
          <div className="badge badge-blue" style={{ marginBottom: 12, fontSize: "0.6875rem" }}>
            {maxCapacity.toLocaleString()} People Pool
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
              INPUT MONEY
            </span>
            <span className="display" style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--gold-deep)", lineHeight: 1 }}>
              {ticketPrice} <span style={{ fontSize: "0.875rem" }}>ETB</span>
            </span>
          </div>

          {/* Barcode Graphic */}
          <div className="barcode-pattern" style={{ marginBottom: 6 }} />
          <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)" }}>
            PD-{draw.draw_id}-{maxCapacity}
          </span>
        </div>

        {/* Action Button on the Stub */}
        <div style={{ width: "100%", marginTop: 12 }}>
          {isOpen && (
            <Link
              href={`/enter?size=${maxCapacity}&draw=${draw.id}`}
              className="btn-base btn-primary"
              style={{ width: "100%", padding: "12px 14px", fontSize: "0.9375rem" }}
            >
              <Ticket size={16} /> Buy Ticket ({ticketPrice} ETB)
            </Link>
          )}

          {isUpcoming && (
            <button
              type="button"
              className="btn-base btn-secondary"
              style={{ width: "100%", fontSize: "0.8125rem", padding: "10px" }}
              onClick={() => alert(`Draw #${draw.draw_id} (${maxCapacity} people) opens soon!`)}
            >
              <Calendar size={14} /> Scheduled Soon
            </button>
          )}

          {isRevealed && (
            <Link
              href="/results"
              className="btn-base btn-secondary"
              style={{ width: "100%", fontSize: "0.8125rem", padding: "10px" }}
            >
              <ShieldCheck size={15} /> Audit Outcomes
            </Link>
          )}
        </div>
      </div>

      {/* Responsive layout tweak for mobile */}
      <style>{`
        @media (max-width: 768px) {
          .physical-lottery-ticket {
            grid-template-columns: 1fr !important;
          }
          .ticket-punch-top, .ticket-punch-bottom {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
