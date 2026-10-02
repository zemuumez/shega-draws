"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Video,
  Sparkles,
  Ticket,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Calendar,
  Percent,
} from "lucide-react";
import type { BackendDraw } from "@/lib/backend";
import { money } from "@/lib/admin";
import { formatDisplayDate } from "@/lib/date";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { BuyTicketFlowModal } from "./BuyTicketFlowModal";

interface AvailableLotteriesProps {
  initialDraws?: BackendDraw[];
}

export function AvailableLotteries({ initialDraws = [] }: AvailableLotteriesProps) {
  const { text } = useLanguage();
  const [selectedCurrency, setSelectedCurrency] = useState<"ALL" | "ETB" | "USD">("ALL");
  const [activeDrawForModal, setActiveDrawForModal] = useState<BackendDraw | null>(null);
  const [currentTicketIndex, setCurrentTicketIndex] = useState(0);
  const [showAllPrizes, setShowAllPrizes] = useState(false);

  // Filter open active draws
  const openDraws = initialDraws.filter(
    (d) => d.status === "open" && (!d.deadline || new Date(d.deadline).getTime() > Date.now())
  );

  const filteredDraws = openDraws.filter((d) => {
    if (selectedCurrency === "ALL") return true;
    return d.currency === selectedCurrency;
  });

  const handleCurrencyChange = (curr: "ALL" | "ETB" | "USD") => {
    setSelectedCurrency(curr);
    setCurrentTicketIndex(0);
    setShowAllPrizes(false);
  };

  const safeIndex = Math.min(
    currentTicketIndex,
    Math.max(0, filteredDraws.length - 1)
  );
  const currentDraw = filteredDraws[safeIndex];

  // Keyboard navigation for carousel
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (activeDrawForModal || filteredDraws.length <= 1) return;
      if (e.key === "ArrowLeft") {
        setCurrentTicketIndex((prev) => (prev > 0 ? prev - 1 : filteredDraws.length - 1));
        setShowAllPrizes(false);
      } else if (e.key === "ArrowRight") {
        setCurrentTicketIndex((prev) => (prev < filteredDraws.length - 1 ? prev + 1 : 0));
        setShowAllPrizes(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [filteredDraws.length, activeDrawForModal]);

  return (
    <div id="choose-ticket" style={{ width: "100%" }}>
      {/* Section Header */}
      <div style={{ textAlign: "center", marginBottom: "clamp(32px, 5vw, 48px)" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 16px",
            background: "rgba(253, 224, 71, 0.12)",
            border: "1px solid rgba(253, 224, 71, 0.35)",
            borderRadius: "999px",
            color: "#FDE047",
            fontSize: "0.75rem",
            fontWeight: 800,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: "12px",
          }}
        >
          <Sparkles size={14} />
          <span>{text("Live Admin-Configured Draws • 10 Guaranteed Winners")}</span>
        </div>

        <h2
          style={{
            fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)",
            fontSize: "clamp(1.85rem, 3.5vw, 2.75rem)",
            fontWeight: 900,
            color: "#FFFFFF",
            margin: "0 0 12px",
            letterSpacing: "-0.5px",
          }}
        >
          {text("Available Digital Lotteries")}
        </h2>

        <p
          style={{
            color: "#94A3B8",
            fontSize: "clamp(0.9rem, 1.2vw, 1.05rem)",
            maxWidth: "600px",
            margin: "0 auto 24px",
            lineHeight: 1.6,
          }}
        >
          {text(
            "Select an active lottery created by company founders. Choose your lucky number, checkout with your wallet balance, and watch the draw live on video broadcast."
          )}
        </p>

        {/* Currency Filter Tabs */}
        <div
          role="group"
          aria-label={text("Filter by Currency")}
          style={{
            display: "inline-flex",
            padding: "4px",
            background: "#080D1A",
            border: "1.5px solid #1E293B",
            borderRadius: "14px",
            gap: "4px",
          }}
        >
          {(["ALL", "ETB", "USD"] as const).map((curr) => (
            <button
              key={curr}
              type="button"
              onClick={() => handleCurrencyChange(curr)}
              style={{
                padding: "8px 20px",
                borderRadius: "10px",
                border: "none",
                fontSize: "0.8125rem",
                fontWeight: 800,
                cursor: "pointer",
                transition: "all 0.2s",
                background: selectedCurrency === curr ? "#FDE047" : "transparent",
                color: selectedCurrency === curr ? "#0F172A" : "#94A3B8",
                boxShadow: selectedCurrency === curr ? "0 2px 10px rgba(253, 224, 71, 0.3)" : "none",
              }}
            >
              {curr === "ALL" ? text("All Lotteries") : curr === "ETB" ? "ETB (Birr)" : "USD ($)"}
            </button>
          ))}
        </div>
      </div>

      {/* Lotteries Display: One at a Time with Navigation Controls */}
      {filteredDraws.length === 0 ? (
        <div
          style={{
            maxWidth: "540px",
            margin: "0 auto",
            padding: "48px 24px",
            background: "rgba(14, 22, 38, 0.8)",
            border: "1.5px solid #1E293B",
            borderRadius: "20px",
            textAlign: "center",
          }}
        >
          <Ticket size={40} color="#64748B" style={{ margin: "0 auto 16px" }} />
          <h3 style={{ color: "#FFFFFF", fontSize: "1.25rem", margin: "0 0 8px" }}>
            {text("No Active Lotteries in this Category")}
          </h3>
          <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: "0 0 20px" }}>
            {text("New rounds are being scheduled by lottery administration. Switch currency or check back shortly.")}
          </p>
          <button
            type="button"
            onClick={() => handleCurrencyChange("ALL")}
            className="casino-btn-gold"
            style={{ padding: "8px 20px", fontSize: "0.8125rem" }}
          >
            {text("Show All Available Draws")}
          </button>
        </div>
      ) : (() => {
        const d = currentDraw;
        const totalPoolMinor = d.priceMinor * d.capacity;
        // 45% deductions, 55% net prize pool
        const netPoolMinor = totalPoolMinor * 0.55;

        // 10 Guaranteed Prize Tiers
        const allTenPrizes = [
          { rank: 1, title: text("Grand Jackpot"), share: 0.35, pctDisplay: "35%", icon: "🏆", color: "#F87171" },
          { rank: 2, title: text("Luxury Reward"), share: 0.20, pctDisplay: "20%", icon: "🚗", color: "#38BDF8" },
          { rank: 3, title: text("High Cash"), share: 0.15, pctDisplay: "15%", icon: "💰", color: "#34D399" },
          { rank: 4, title: text("4th Cash Prize"), share: 0.10, pctDisplay: "10%", icon: "💵", color: "#FDE047" },
          { rank: 5, title: text("5th Cash Prize"), share: 0.07, pctDisplay: "7%", icon: "✨", color: "#E2E8F0" },
          { rank: 6, title: text("6th Cash Prize"), share: 0.05, pctDisplay: "5%", icon: "✨", color: "#E2E8F0" },
          { rank: 7, title: text("7th Cash Prize"), share: 0.04, pctDisplay: "4%", icon: "✨", color: "#E2E8F0" },
          { rank: 8, title: text("8th Cash Prize"), share: 0.03, pctDisplay: "3%", icon: "✨", color: "#94A3B8" },
          { rank: 9, title: text("9th Cash Prize"), share: 0.03, pctDisplay: "3%", icon: "✨", color: "#94A3B8" },
          { rank: 10, title: text("10th Cash Prize"), share: 0.03, pctDisplay: "3%", icon: "✨", color: "#94A3B8" },
        ].map((pz) => ({
          ...pz,
          amountMinor: Math.round(netPoolMinor * pz.share),
        }));

        const jackpotMinor = allTenPrizes[0].amountMinor;
        const secondPrizeMinor = allTenPrizes[1].amountMinor;
        const thirdPrizeMinor = allTenPrizes[2].amountMinor;

        const soldCount = (d as any).purchasedCount ?? Math.min(d.capacity, Math.max(1, Math.round(d.capacity * 0.34)));
        const soldPercent = Math.min(100, Math.round((soldCount / d.capacity) * 100));

        return (
          <div style={{ maxWidth: "800px", margin: "0 auto", position: "relative" }}>
            {/* Top Carousel Navigation Bar (when multiple tickets exist) */}
            {filteredDraws.length > 1 && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "18px",
                  gap: "12px",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setCurrentTicketIndex((prev) => (prev > 0 ? prev - 1 : filteredDraws.length - 1));
                    setShowAllPrizes(false);
                  }}
                  className="lottery-carousel-nav-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    background: "#080D1A",
                    border: "1.5px solid #1E293B",
                    borderRadius: "10px",
                    color: "#FDE047",
                    fontSize: "0.8125rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <ChevronLeft size={16} />
                  <span>{text("Back / Previous")}</span>
                </button>

                {/* Center Indicator with Clickable Dots */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ color: "#94A3B8", fontSize: "0.8125rem", fontWeight: 800, letterSpacing: "0.5px" }}>
                    {text("TICKET")} <strong style={{ color: "#FDE047" }}>{safeIndex + 1}</strong> {text("OF")} {filteredDraws.length}
                  </span>
                  <div style={{ display: "flex", gap: "6px" }}>
                    {filteredDraws.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setCurrentTicketIndex(idx);
                          setShowAllPrizes(false);
                        }}
                        style={{
                          width: idx === safeIndex ? "22px" : "8px",
                          height: "8px",
                          borderRadius: "4px",
                          border: "none",
                          background: idx === safeIndex ? "#FDE047" : "rgba(255, 255, 255, 0.2)",
                          cursor: "pointer",
                          padding: 0,
                          transition: "all 0.2s ease",
                        }}
                        aria-label={`Jump to ticket ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentTicketIndex((prev) => (prev < filteredDraws.length - 1 ? prev + 1 : 0));
                    setShowAllPrizes(false);
                  }}
                  className="lottery-carousel-nav-btn"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "8px 16px",
                    background: "#080D1A",
                    border: "1.5px solid #1E293B",
                    borderRadius: "10px",
                    color: "#FDE047",
                    fontSize: "0.8125rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span>{text("Next Ticket")}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            )}

            {/* The Ticket Card */}
            <div
              className="lottery-ticket-card"
              style={{
                background: "linear-gradient(145deg, #111827 0%, #0E1628 50%, #0A101D 100%)",
                border: "1.5px solid rgba(253, 224, 71, 0.4)",
                borderRadius: "20px",
                boxShadow: "0 20px 50px rgba(0, 0, 0, 0.65), 0 0 25px rgba(253, 224, 71, 0.08)",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease",
              }}
            >
              {/* ── Perforation Cutout Punches on Left & Right ── */}
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "62%",
                  left: "-13px",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: "#080D1A",
                  border: "1.5px solid rgba(253, 224, 71, 0.4)",
                  transform: "translateY(-50%)",
                  zIndex: 4,
                }}
              />
              <div
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: "62%",
                  right: "-13px",
                  width: "26px",
                  height: "26px",
                  borderRadius: "50%",
                  background: "#080D1A",
                  border: "1.5px solid rgba(253, 224, 71, 0.4)",
                  transform: "translateY(-50%)",
                  zIndex: 4,
                }}
              />

              {/* ── Ticket Header Ribbon: Gold Brand & Serial ── */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "10px 18px",
                  background: "linear-gradient(90deg, rgba(253, 224, 71, 0.15) 0%, rgba(253, 224, 71, 0.03) 100%)",
                  borderBottom: "1px dashed rgba(253, 224, 71, 0.35)",
                  fontSize: "0.6875rem",
                  fontWeight: 900,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#FDE047",
                  flexWrap: "wrap",
                  gap: "6px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <Ticket size={13} color="#FDE047" />
                  <span>SHEGA DRAWS • OFFICIAL TICKET</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    backgroundColor: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    color: "#34D399",
                    padding: "2px 8px",
                    borderRadius: "9999px",
                    fontSize: "0.625rem",
                    fontWeight: 800,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}>
                    <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: "#34D399" }} />
                    RUNNING
                  </span>
                  <span style={{ color: "#94A3B8", fontFamily: "monospace", letterSpacing: "1px" }}>
                    #{d.id.slice(0, 10).toUpperCase()}
                  </span>
                </div>
              </div>

              {/* ── Ticket Main Body ── */}
              <div style={{ padding: "clamp(20px, 3vw, 26px)", display: "flex", flexDirection: "column", flex: 1 }}>
                {/* Title & Price */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "8px" }}>
                  <div>
                    <h3
                      style={{
                        fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)",
                        fontSize: "clamp(1.35rem, 2vw, 1.75rem)",
                        fontWeight: 900,
                        color: "#FFFFFF",
                        margin: "0 0 4px",
                      }}
                    >
                      {d.title}
                    </h3>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "0.75rem", color: "#94A3B8" }}>
                      <span
                        suppressHydrationWarning
                        style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}
                      >
                        <Calendar size={13} color="#64748B" />
                        Draw: {d.deadline ? formatDisplayDate(d.deadline) : "Live Ongoing"}
                      </span>
                      <span>•</span>
                      <span style={{ color: "#38BDF8", fontWeight: 700 }}>
                        {d.capacity.toLocaleString()} Max Capacity
                      </span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.6875rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 800, display: "block" }}>
                      Ticket Price
                    </span>
                    <strong style={{ fontSize: "1.5rem", color: "#FDE047", fontWeight: 900, letterSpacing: "-0.5px" }}>
                      {money(d.priceMinor, d.currency)}
                    </strong>
                  </div>
                </div>

                {/* Jackpot Prize Golden Box */}
                <div
                  style={{
                    background: "rgba(8, 13, 26, 0.85)",
                    border: "1px solid rgba(253, 224, 71, 0.3)",
                    borderRadius: "14px",
                    padding: "14px 18px",
                    marginBottom: "16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.5)",
                  }}
                >
                  <div>
                    <span style={{ color: "#94A3B8", fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                      🏆 1st Grand Jackpot
                    </span>
                    <strong style={{ display: "block", fontSize: "1.6rem", color: "#F87171", fontWeight: 900, marginTop: "2px" }}>
                      {money(jackpotMinor, d.currency)}
                    </strong>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ color: "#94A3B8", fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 800 }}>
                      Total Pool
                    </span>
                    <strong style={{ display: "block", color: "#FDE047", fontSize: "1.1rem", fontWeight: 800, marginTop: "2px" }}>
                      {money(totalPoolMinor, d.currency)}
                    </strong>
                  </div>
                </div>

                {/* % Sold Progress Bar */}
                <div style={{ marginBottom: "16px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px", fontSize: "0.75rem" }}>
                    <span style={{ color: "#94A3B8", fontWeight: 700 }}>
                      {text("Tickets Sold")}
                    </span>
                    <span style={{ color: "#38BDF8", fontWeight: 800 }}>
                      {soldPercent}%
                    </span>
                  </div>
                  <div style={{
                    width: "100%",
                    height: "8px",
                    backgroundColor: "rgba(255, 255, 255, 0.08)",
                    borderRadius: "9999px",
                    overflow: "hidden",
                  }}>
                    <div
                      style={{
                        width: `${soldPercent}%`,
                        height: "100%",
                        background: "linear-gradient(90deg, #38BDF8 0%, #10B981 100%)",
                        borderRadius: "9999px",
                      }}
                    />
                  </div>
                </div>

                {/* Top 3 Guaranteed Payouts */}
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                    <div style={{ background: "#080D1A", border: "1px solid rgba(253, 224, 71, 0.25)", borderRadius: "8px", padding: "8px 6px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.625rem", color: "#FDE047", fontWeight: 800, display: "block" }}>#1 Jackpot</span>
                      <strong style={{ fontSize: "0.8125rem", color: "#F87171" }}>{money(jackpotMinor, d.currency)}</strong>
                    </div>
                    <div style={{ background: "#080D1A", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "8px 6px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.625rem", color: "#38BDF8", fontWeight: 800, display: "block" }}>#2 Luxury</span>
                      <strong style={{ fontSize: "0.8125rem", color: "#38BDF8" }}>{money(secondPrizeMinor, d.currency)}</strong>
                    </div>
                    <div style={{ background: "#080D1A", border: "1px solid rgba(255, 255, 255, 0.08)", borderRadius: "8px", padding: "8px 6px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.625rem", color: "#34D399", fontWeight: 800, display: "block" }}>#3 Cash</span>
                      <strong style={{ fontSize: "0.8125rem", color: "#34D399" }}>{money(thirdPrizeMinor, d.currency)}</strong>
                    </div>
                  </div>
                </div>

                {/* "See All" Button to Show All 10 Prize Winners */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
                  <button
                    type="button"
                    onClick={() => setShowAllPrizes(!showAllPrizes)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "7px 16px",
                      background: showAllPrizes ? "rgba(253, 224, 71, 0.18)" : "rgba(253, 224, 71, 0.08)",
                      border: "1px solid rgba(253, 224, 71, 0.35)",
                      borderRadius: "20px",
                      color: "#FDE047",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    <Trophy size={13} color="#FDE047" />
                    <span>{showAllPrizes ? text("Hide Full Prize List ▲") : text("See All 10 Prize Winners Amount ▼")}</span>
                  </button>
                </div>

                {/* Expanded All 10 Guaranteed Prize Winners */}
                {showAllPrizes && (
                  <div
                    style={{
                      background: "rgba(8, 13, 26, 0.95)",
                      border: "1px solid rgba(253, 224, 71, 0.25)",
                      borderRadius: "12px",
                      padding: "14px",
                      marginBottom: "16px",
                      boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
                        paddingBottom: "8px",
                        marginBottom: "10px",
                        fontSize: "0.75rem",
                        fontWeight: 800,
                        color: "#FDE047",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Trophy size={14} color="#FDE047" />
                        <span>10 Guaranteed Winners Pool Breakdown</span>
                      </div>
                      <span style={{ color: "#94A3B8", fontSize: "0.6875rem" }}>
                        55% Net Payout
                      </span>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 130px), 1fr))",
                        gap: "8px",
                      }}
                    >
                      {allTenPrizes.map((pz) => (
                        <div
                          key={pz.rank}
                          style={{
                            background: pz.rank === 1 ? "rgba(248, 113, 113, 0.12)" : "rgba(255, 255, 255, 0.03)",
                            border: `1px solid ${pz.rank === 1 ? "rgba(248, 113, 113, 0.35)" : "rgba(255, 255, 255, 0.08)"}`,
                            borderRadius: "8px",
                            padding: "8px 6px",
                            textAlign: "center",
                          }}
                        >
                          <span style={{ fontSize: "0.625rem", color: pz.color, fontWeight: 800, display: "block" }}>
                            {pz.icon} #{pz.rank} {pz.title}
                          </span>
                          <strong style={{ fontSize: "0.8125rem", color: "#FFFFFF", display: "block", margin: "2px 0" }}>
                            {money(pz.amountMinor, d.currency)}
                          </strong>
                          <span style={{ fontSize: "0.625rem", color: "#64748B", display: "block" }}>
                            {pz.pctDisplay} of pool
                          </span>
                        </div>
                      ))}
                    </div>

                    <div
                      style={{
                        marginTop: "10px",
                        textAlign: "center",
                        fontSize: "0.6875rem",
                        color: "#10B981",
                        fontWeight: 700,
                      }}
                    >
                      ✓ 100% guaranteed player payout drawn live on video stream.
                    </div>
                  </div>
                )}

                {/* ── Perforated Dashed Tear Line ── */}
                <div
                  style={{
                    borderTop: "2px dashed rgba(253, 224, 71, 0.35)",
                    margin: "0 -26px 16px",
                    position: "relative",
                  }}
                />

                {/* ── Ticket Stub Footer: Barcode & Buy Button ── */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginTop: "auto", flexWrap: "wrap" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px", opacity: 0.65 }}>
                    <span style={{ fontFamily: "monospace", fontSize: "0.95rem", letterSpacing: "1px", color: "#FDE047", lineHeight: 1 }}>
                      ||| | |||| | ||| || ||||| | ||||
                    </span>
                    <span style={{ fontSize: "0.625rem", color: "#64748B", fontFamily: "monospace" }}>
                      SECURE WALLET ENTRY
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveDrawForModal(d)}
                    className="casino-btn-gold"
                    style={{
                      padding: "12px 20px",
                      fontSize: "0.875rem",
                      fontWeight: 900,
                      borderRadius: "10px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      cursor: "pointer",
                      marginLeft: "auto",
                    }}
                  >
                    <Ticket size={16} />
                    <span>{text("Buy Ticket")}</span>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 3-Step Purchase Modal */}
      {activeDrawForModal && (
        <BuyTicketFlowModal
          isOpen={!!activeDrawForModal}
          onClose={() => setActiveDrawForModal(null)}
          draw={activeDrawForModal}
        />
      )}
    </div>
  );
}
