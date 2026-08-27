"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ticket, Trophy, Calendar, Users, ShieldCheck, ChevronDown, ChevronUp, Sparkles, CheckCircle2 } from "lucide-react";
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
  const totalEntries = draw.total_entries || (isRevealed ? maxCapacity : 1420);
  const percentageSold = Math.min(100, Math.round((totalEntries / maxCapacity) * 100));

  const prizes = draw.prizes || [];
  const topPrizesToDisplay = showAllPrizes ? prizes : prizes.slice(0, 4);

  return (
    <div
      className="physical-lottery-ticket animate-fade"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 280px",
        margin: "0 0 24px 0",
        position: "relative",
      }}
    >
      {/* ── Left / Main Ticket Body ───────────────────────────────────── */}
      <div style={{ padding: "28px 28px 24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          {/* Top Bar: Serial & Status */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                className="badge"
                style={{
                  background: isOpen ? "var(--teal-bg)" : isUpcoming ? "var(--gold-bg)" : "var(--gray-bg)",
                  color: isOpen ? "var(--teal-dark)" : isUpcoming ? "var(--gold-dark)" : "var(--text-muted)",
                  border: `1px solid ${isOpen ? "var(--teal-border)" : isUpcoming ? "var(--gold-border)" : "var(--gray-line)"}`,
                }}
              >
                {isOpen ? t.drawsExplorer.statusOpen : isUpcoming ? t.drawsExplorer.statusUpcoming : t.drawsExplorer.statusRevealed}
              </span>
              <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontWeight: 600 }}>
                SERIAL #{draw.draw_id}
              </span>
            </div>

            <div className="mono" style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: 6 }}>
              <Calendar size={13} color="var(--gold-dark)" />
              <span>{new Date(draw.deadline).toLocaleDateString(language === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            </div>
          </div>

          {/* Title & Description */}
          <h3 className="display" style={{ fontSize: "clamp(1.25rem, 2.5vw, 1.625rem)", color: "var(--text-main)", marginBottom: 6, lineHeight: 1.2 }}>
            {draw.title || "The 100 Birr Grand Jackpot Draw"}
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.5, marginBottom: 20 }}>
            {draw.description}
          </p>

          {/* Capacity Progress & Prize Pool Stat Strip */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1px solid var(--gray-line)",
              borderRadius: "var(--radius-md)",
              padding: "16px 18px",
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
              <div>
                <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block" }}>
                  TOTAL PRIZE POOL
                </span>
                <span className="display" style={{ fontSize: "1.375rem", color: "var(--gold-dark)", fontWeight: 800 }}>
                  {draw.total_prize_value || "300,000 ETB"}
                </span>
              </div>

              <div style={{ textAlign: "right" }}>
                <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block" }}>
                  TICKET CAPACITY
                </span>
                <span className="mono" style={{ fontSize: "0.875rem", color: "var(--text-main)", fontWeight: 700 }}>
                  {totalEntries.toLocaleString()} / {maxCapacity.toLocaleString()} Tickets ({percentageSold}%)
                </span>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${percentageSold}%` }} />
            </div>
          </div>

          {/* ── Top 10 Prize Breakdown Grid ────────────────────────────── */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--text-main)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
                <Trophy size={14} color="var(--gold)" /> Top 10 Winner Prize Breakdown
              </span>
              {prizes.length > 4 && (
                <button
                  onClick={() => setShowAllPrizes(!showAllPrizes)}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "var(--gold-dark)",
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

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8 }}>
              {topPrizesToDisplay.map((p) => {
                const isRank1 = p.rank === 1;
                const isRank2 = p.rank === 2;
                const isRank3 = p.rank === 3;

                return (
                  <div
                    key={p.rank}
                    style={{
                      background: isRank1 ? "#FEF3C7" : isRank2 ? "#F1F5F9" : isRank3 ? "#FFFBEB" : "#FFFFFF",
                      border: isRank1 ? "1.5px solid #FDE68A" : "1px solid var(--gray-line)",
                      borderRadius: 8,
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span
                        className="mono"
                        style={{
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          color: isRank1 ? "var(--gold-dark)" : "var(--text-subtle)",
                        }}
                      >
                        {isRank1 ? "🥇 1st" : isRank2 ? "🥈 2nd" : isRank3 ? "🥉 3rd" : `#${p.rank}`}
                      </span>
                    </div>

                    <strong className="mono" style={{ fontSize: "0.8125rem", color: isRank1 ? "var(--gold-dark)" : "var(--text-main)" }}>
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
              background: "#ECFDF5",
              border: "1.5px dashed #A7F3D0",
              borderRadius: "var(--radius-sm)",
              padding: "12px 16px",
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--teal-dark)", textTransform: "uppercase", display: "block" }}>
                🏆 1st Place Winning Number
              </span>
              <span className="display" style={{ fontSize: "1.875rem", color: "var(--teal-dark)", fontWeight: 800 }}>
                #{draw.winning_numbers[1] || "42"}
              </span>
            </div>
            <Link
              href="/results"
              className="btn-base"
              style={{ background: "#FFFFFF", border: "1px solid #A7F3D0", color: "var(--teal-dark)", fontSize: "0.75rem", padding: "8px 12px" }}
            >
              <ShieldCheck size={14} /> Audit All 10 Numbers
            </Link>
          </div>
        )}
      </div>

      {/* ── Perforated Tear-off Ticket Stub (Right Column) ─────────────── */}
      <div
        style={{
          background: "var(--bg-ticket-stub)",
          borderLeft: "2px dashed #DCCBB0",
          padding: "28px 20px",
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
          <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gold-dark)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 700 }}>
            OFFICIAL ENTRY TICKET
          </span>
          <div className="display" style={{ fontSize: "1.0625rem", color: "var(--text-main)", fontWeight: 800, margin: "4px 0 12px" }}>
            PrimeDraws
          </div>

          {/* Fixed Price Stamp */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #DCCBB0",
              borderRadius: "var(--radius-md)",
              padding: "12px 14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.03)",
              marginBottom: 16,
            }}
          >
            <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block" }}>
              FIXED TICKET COST
            </span>
            <span className="display" style={{ fontSize: "1.75rem", fontWeight: 800, color: "var(--gold-dark)", lineHeight: 1 }}>
              {ticketPrice} <span style={{ fontSize: "0.875rem" }}>ETB</span>
            </span>
            <span className="mono" style={{ fontSize: "0.625rem", color: "var(--teal-dark)", display: "block", marginTop: 4, fontWeight: 600 }}>
              ✓ No hidden fees
            </span>
          </div>

          {/* Barcode Graphic */}
          <div className="barcode-pattern" style={{ marginBottom: 6 }} />
          <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)" }}>
            PD-{draw.draw_id}-V26
          </span>
        </div>

        {/* Action Button on the Stub */}
        <div style={{ width: "100%", marginTop: 14 }}>
          {isOpen && (
            <Link
              href={`/enter?draw=${draw.id}`}
              className="btn-base btn-primary"
              style={{ width: "100%", padding: "12px 16px", fontSize: "0.9375rem" }}
            >
              <Ticket size={16} /> Buy Ticket ({ticketPrice} ETB)
            </Link>
          )}

          {isUpcoming && (
            <button
              className="btn-base btn-secondary"
              style={{ width: "100%", fontSize: "0.8125rem", padding: "10px" }}
              onClick={() => alert(`Draw #${draw.draw_id} opens on ${new Date(draw.deadline).toLocaleDateString()}`)}
            >
              <Calendar size={14} /> Scheduled Soon
            </button>
          )}

          {isRevealed && (
            <Link
              href="/results"
              className="btn-base btn-secondary"
              style={{ width: "100%", borderColor: "var(--teal)", color: "var(--teal-dark)", fontSize: "0.8125rem", padding: "10px" }}
            >
              <ShieldCheck size={15} /> Audit Outcomes
            </Link>
          )}
        </div>
      </div>

      {/* Responsive layout tweak for small mobile */}
      <style>{`
        @media (max-width: 768px) {
          .physical-lottery-ticket {
            grid-template-columns: 1fr !important;
          }
          .ticket-punch-top, .ticket-punch-bottom {
            display: none !important;
          }
          .ticket-perforation-v {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
