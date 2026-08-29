"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Trophy, Sparkles, ChevronRight, Globe, Ticket, HelpCircle, Calendar, Users } from "lucide-react";
import { HowToBuyModal } from "./HowToBuyModal";

export function JackpotCardsSection() {
  const [mounted, setMounted] = useState(false);
  const [isHowToBuyOpen, setIsHowToBuyOpen] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    days: 2,
    hours: 14,
    mins: 35,
    secs: 20,
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const jackpotTickets = [
    {
      id: "usd-250",
      serial: "RDL-USD-250",
      badgeTitle: "🌐 TOP DIASPORA JACKPOT",
      title: "$250 Grand Diaspora Tier",
      ticketPrice: 250,
      currency: "USD",
      currSymbol: "$",
      grandPrize: "$1,250,000",
      topPrizeText: "$400,000 for 1st Place",
      drawDate: "Aug 31, 2026",
      pools: [
        { label: "1K People", total: "$250K" },
        { label: "3K People", total: "$750K" },
        { label: "5K People", total: "$1.25M" },
      ],
      progress: "82% Confirmed",
    },
    {
      id: "etb-200",
      serial: "RDL-ETB-200",
      badgeTitle: "🇪🇹 TOP LOCAL ETB JACKPOT",
      title: "200 Birr Grand Holiday Jackpot",
      ticketPrice: 200,
      currency: "ETB",
      currSymbol: "ETB",
      grandPrize: "1,000,000 ETB",
      topPrizeText: "320,000 ETB for 1st Place",
      drawDate: "Aug 31, 2026",
      pools: [
        { label: "1K People", total: "200K ETB" },
        { label: "3K People", total: "600K ETB" },
        { label: "5K People", total: "1.0M ETB" },
      ],
      progress: "76% Confirmed",
    },
    {
      id: "etb-100",
      serial: "RDL-ETB-100",
      badgeTitle: "⭐ POPULAR MULTI-POOL",
      title: "100 Birr Classic Multi-Pool",
      ticketPrice: 100,
      currency: "ETB",
      currSymbol: "ETB",
      grandPrize: "500,000 ETB",
      topPrizeText: "160,000 ETB for 1st Place",
      drawDate: "Aug 31, 2026",
      pools: [
        { label: "1K", total: "100K" },
        { label: "2K", total: "200K" },
        { label: "3K", total: "300K" },
        { label: "5K", total: "500K" },
      ],
      progress: "71% Confirmed",
    },
  ];

  return (
    <>
      <HowToBuyModal
        isOpen={isHowToBuyOpen}
        onClose={() => setIsHowToBuyOpen(false)}
      />

      <section style={{ margin: "28px 0 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
          {jackpotTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="physical-lottery-ticket animate-fade"
              style={{
                background: "#FFFDF7",
                border: "2px solid #FDE047",
                borderRadius: "16px",
                overflow: "hidden",
                boxShadow: "0 10px 25px -5px rgba(234, 179, 8, 0.25)",
                display: "grid",
                gridTemplateColumns: "1fr 140px",
                position: "relative",
              }}
            >
              {/* Left Ticket Body */}
              <div style={{ padding: "20px 18px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div>
                  {/* Top Bar: Badge & Date */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 6 }}>
                    <span
                      style={{
                        background: ticket.currency === "USD" ? "var(--blue-bg)" : "#FEF9C3",
                        color: ticket.currency === "USD" ? "#2A65E6" : "var(--gold-deep)",
                        border: `1px solid ${ticket.currency === "USD" ? "var(--blue-border)" : "#FDE047"}`,
                        padding: "3px 8px",
                        borderRadius: "6px",
                        fontSize: "0.6875rem",
                        fontWeight: 800,
                      }}
                    >
                      {ticket.badgeTitle}
                    </span>

                    <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontWeight: 700 }}>
                      📅 {ticket.drawDate}
                    </span>
                  </div>

                  <h3 className="display" style={{ fontSize: "1.15rem", color: "var(--blue-navy)", fontWeight: 800, lineHeight: 1.2, marginBottom: 2 }}>
                    {ticket.title}
                  </h3>

                  {/* Grand Prize Total */}
                  <div className="display" style={{ fontSize: "1.65rem", color: "var(--gold-deep)", fontWeight: 900, margin: "2px 0" }}>
                    {ticket.grandPrize}
                  </div>
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--teal-dark)", fontWeight: 700, display: "block", marginBottom: 10 }}>
                    🏆 10 Winners · {ticket.topPrizeText}
                  </span>

                  {/* Available Pools Overview */}
                  <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 10px", marginBottom: 12 }}>
                    <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block", marginBottom: 4, fontWeight: 700 }}>
                      AVAILABLE POOLS & SUMS:
                    </span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {ticket.pools.map((p, idx) => (
                        <span
                          key={idx}
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #E2E8F0",
                            borderRadius: 4,
                            padding: "2px 6px",
                            fontSize: "0.6875rem",
                            fontWeight: 700,
                            color: "var(--blue-navy)",
                          }}
                        >
                          {p.label}: <strong>{p.total}</strong>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Live Countdown Clock */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#F8FAFC", padding: "6px 10px", borderRadius: 6, border: "1px solid #E2E8F0" }}>
                    <Clock size={13} color="#DC2626" />
                    <span className="mono" style={{ fontSize: "0.6875rem", fontWeight: 700, color: "var(--text-muted)" }}>
                      Live Draw in:
                    </span>
                    <div style={{ display: "flex", gap: 4 }}>
                      <span className="mono" suppressHydrationWarning style={{ fontSize: "0.75rem", fontWeight: 800, color: "#DC2626" }}>
                        {mounted ? `${String(timeLeft.days).padStart(2, "0")}d ${String(timeLeft.hours).padStart(2, "0")}h ${String(timeLeft.mins).padStart(2, "0")}m` : "--"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Ticket Buttons */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={() => setIsHowToBuyOpen(true)}
                    className="btn-base"
                    style={{
                      background: "#F1F5F9",
                      border: "1px solid #CBD5E1",
                      color: "var(--blue-navy)",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      padding: "8px 6px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      justifyContent: "center",
                    }}
                  >
                    <HelpCircle size={13} /> How to Buy Ticket
                  </button>

                  <Link
                    href={`/enter?currency=${ticket.currency}&price=${ticket.ticketPrice}`}
                    className="btn-base"
                    style={{
                      background: "linear-gradient(135deg, #FDE047 0%, #EAB308 100%)",
                      color: "#0C2666",
                      fontSize: "0.75rem",
                      fontWeight: 900,
                      padding: "8px 6px",
                      borderRadius: "6px",
                      boxShadow: "0 2px 6px rgba(234, 179, 8, 0.35)",
                      textDecoration: "none",
                      border: "1px solid #FEF08A",
                      justifyContent: "center",
                    }}
                  >
                    <Ticket size={13} /> Buy Now
                  </Link>
                </div>
              </div>

              {/* Right Perforated Ticket Stub */}
              <div
                style={{
                  background: "var(--bg-ticket-stub)",
                  borderLeft: "2px dashed #CBD5E1",
                  padding: "16px 10px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "center",
                  position: "relative",
                }}
              >
                <div>
                  <span className="mono" style={{ fontSize: "0.5625rem", color: "#2A65E6", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                    RIMNA LOTTERY
                  </span>
                  <div
                    style={{
                      background: "#FFFFFF",
                      border: "1px solid #FDE047",
                      borderRadius: 6,
                      padding: "6px 4px",
                      marginTop: 6,
                    }}
                  >
                    <span className="mono" style={{ fontSize: "0.5625rem", color: "var(--text-subtle)", display: "block" }}>
                      PRICE
                    </span>
                    <span className="display" style={{ fontSize: "1.15rem", fontWeight: 900, color: "var(--gold-deep)", lineHeight: 1 }}>
                      {ticket.currency === "USD" ? `$${ticket.ticketPrice}` : `${ticket.ticketPrice}`}
                    </span>
                    <span className="mono" style={{ fontSize: "0.5625rem", color: "var(--text-muted)", display: "block" }}>
                      {ticket.currSymbol}
                    </span>
                  </div>
                </div>

                <div style={{ width: "100%" }}>
                  <div className="barcode-pattern" style={{ height: 26, marginBottom: 4 }} />
                  <span className="mono" style={{ fontSize: "0.5625rem", color: "var(--text-subtle)", display: "block" }}>
                    {ticket.serial}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
