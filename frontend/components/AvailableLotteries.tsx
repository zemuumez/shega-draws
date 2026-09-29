"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Users,
  Video,
  Sparkles,
  Ticket,
  ChevronRight,
  ShieldCheck,
  Calendar,
  Percent,
} from "lucide-react";
import type { BackendDraw } from "@/lib/backend";
import { money } from "@/lib/admin";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { BuyTicketFlowModal } from "./BuyTicketFlowModal";

interface AvailableLotteriesProps {
  initialDraws?: BackendDraw[];
}

export function AvailableLotteries({ initialDraws = [] }: AvailableLotteriesProps) {
  const { text } = useLanguage();
  const [selectedCurrency, setSelectedCurrency] = useState<"ALL" | "ETB" | "USD">("ALL");
  const [activeDrawForModal, setActiveDrawForModal] = useState<BackendDraw | null>(null);

  // Filter open active draws
  const openDraws = initialDraws.filter(
    (d) => d.status === "open" && (!d.deadline || new Date(d.deadline).getTime() > Date.now())
  );

  const filteredDraws = openDraws.filter((d) => {
    if (selectedCurrency === "ALL") return true;
    return d.currency === selectedCurrency;
  });

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
              onClick={() => setSelectedCurrency(curr)}
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

      {/* Lotteries Grid */}
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
            onClick={() => setSelectedCurrency("ALL")}
            className="casino-btn-gold"
            style={{ padding: "8px 20px", fontSize: "0.8125rem" }}
          >
            {text("Show All Available Draws")}
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 460px), 1fr))",
            gap: "24px",
            maxWidth: "1080px",
            margin: "0 auto",
          }}
        >
          {filteredDraws.map((d) => {
            // Pool calculations
            const totalPoolMinor = d.priceMinor * d.capacity;
            // 45% deductions, 55% net prize pool; 1st prize is 35% of net prize pool = 19.25% of total
            const jackpotMinor = Math.round(totalPoolMinor * 0.1925);
            const secondPrizeMinor = Math.round(totalPoolMinor * 0.11);
            const thirdPrizeMinor = Math.round(totalPoolMinor * 0.0825);

            return (
              <div
                key={d.id}
                style={{
                  background: "linear-gradient(180deg, #0F172A 0%, #0A0F1D 100%)",
                  border: "1.5px solid rgba(253, 224, 71, 0.35)",
                  borderRadius: "22px",
                  padding: "clamp(24px, 3.5vw, 32px)",
                  boxShadow: "0 16px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(253, 224, 71, 0.08)",
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                  overflow: "hidden",
                  transition: "transform 0.25s, border-color 0.25s",
                }}
              >
                {/* Top Badges Bar */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      background: "rgba(253, 224, 71, 0.15)",
                      borderRadius: "6px",
                      color: "#FDE047",
                      fontSize: "0.725rem",
                      fontWeight: 800,
                    }}
                  >
                    <span>{d.currency === "USD" ? "DIASPORA USD TICKET" : "ETHIOPIA BIRR TICKET"}</span>
                    <span>•</span>
                    <span>#{d.id}</span>
                  </div>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        background: "rgba(16, 185, 129, 0.15)",
                        border: "1px solid rgba(16, 185, 129, 0.3)",
                        borderRadius: "6px",
                        color: "#34D399",
                        fontSize: "0.6875rem",
                        fontWeight: 800,
                      }}
                    >
                      <Video size={12} /> 100% Video Draw
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "4px 8px",
                        background: "rgba(56, 189, 248, 0.15)",
                        border: "1px solid rgba(56, 189, 248, 0.3)",
                        borderRadius: "6px",
                        color: "#38BDF8",
                        fontSize: "0.6875rem",
                        fontWeight: 800,
                      }}
                    >
                      <Trophy size={12} /> 10 Winners
                    </span>
                  </div>
                </div>

                {/* Draw Title & Price */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "14px" }}>
                  <h3
                    style={{
                      fontFamily: "var(--font-heading, 'Cinzel', Georgia, serif)",
                      fontSize: "clamp(1.4rem, 2vw, 1.85rem)",
                      fontWeight: 900,
                      color: "#FFFFFF",
                      margin: 0,
                    }}
                  >
                    {d.title}
                  </h3>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.75rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, display: "block" }}>
                      Ticket Price
                    </span>
                    <strong style={{ fontSize: "1.5rem", color: "#FDE047", fontWeight: 900 }}>
                      {money(d.priceMinor, d.currency)}
                    </strong>
                  </div>
                </div>

                {/* Jackpot Highlight Banner */}
                <div
                  style={{
                    background: "rgba(8, 13, 26, 0.8)",
                    border: "1.5px solid rgba(253, 224, 71, 0.3)",
                    borderRadius: "14px",
                    padding: "16px 20px",
                    marginBottom: "20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <span style={{ color: "#94A3B8", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
                      1st Grand Jackpot
                    </span>
                    <strong style={{ display: "block", fontSize: "1.65rem", color: "#F87171", fontWeight: 900, marginTop: "2px" }}>
                      {money(jackpotMinor, d.currency)}
                    </strong>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <span style={{ color: "#94A3B8", fontSize: "0.75rem", textTransform: "uppercase", fontWeight: 800 }}>
                      Winning Odds
                    </span>
                    <span style={{ display: "block", color: "#34D399", fontWeight: 800, fontSize: "0.875rem", marginTop: "2px" }}>
                      1 in 100 (High Odds)
                    </span>
                  </div>
                </div>

                {/* Pool & Draw Details */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "12px",
                    marginBottom: "20px",
                    fontSize: "0.8125rem",
                  }}
                >
                  <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <span style={{ color: "#64748B", display: "block", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700 }}>
                      Pool Capacity
                    </span>
                    <strong style={{ color: "#FFFFFF", fontSize: "0.95rem" }}>
                      {d.capacity.toLocaleString()} People Max
                    </strong>
                  </div>

                  <div style={{ background: "rgba(255, 255, 255, 0.03)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(255, 255, 255, 0.06)" }}>
                    <span style={{ color: "#64748B", display: "block", fontSize: "0.7rem", textTransform: "uppercase", fontWeight: 700 }}>
                      Total Prize Pool
                    </span>
                    <strong style={{ color: "#FDE047", fontSize: "0.95rem" }}>
                      {money(totalPoolMinor, d.currency)}
                    </strong>
                  </div>
                </div>

                {/* Top 3 Guaranteed Payouts Row */}
                <div style={{ marginBottom: "24px" }}>
                  <span style={{ fontSize: "0.725rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 800, display: "block", marginBottom: "8px" }}>
                    Top 3 Guaranteed Payouts (10 Total Winners)
                  </span>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                    <div style={{ background: "#080D1A", border: "1px solid rgba(253, 224, 71, 0.3)", borderRadius: "8px", padding: "8px 6px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.65rem", color: "#FDE047", fontWeight: 800, display: "block" }}>#1 Jackpot</span>
                      <strong style={{ fontSize: "0.8125rem", color: "#F87171" }}>{money(jackpotMinor, d.currency)}</strong>
                    </div>
                    <div style={{ background: "#080D1A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 6px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.65rem", color: "#38BDF8", fontWeight: 800, display: "block" }}>#2 Luxury</span>
                      <strong style={{ fontSize: "0.8125rem", color: "#38BDF8" }}>{money(secondPrizeMinor, d.currency)}</strong>
                    </div>
                    <div style={{ background: "#080D1A", border: "1px solid rgba(255, 255, 255, 0.1)", borderRadius: "8px", padding: "8px 6px", textAlign: "center" }}>
                      <span style={{ fontSize: "0.65rem", color: "#34D399", fontWeight: 800, display: "block" }}>#3 Cash</span>
                      <strong style={{ fontSize: "0.8125rem", color: "#34D399" }}>{money(thirdPrizeMinor, d.currency)}</strong>
                    </div>
                  </div>
                </div>

                {/* Action CTA Button */}
                <div style={{ marginTop: "auto" }}>
                  <button
                    type="button"
                    onClick={() => setActiveDrawForModal(d)}
                    className="flow-continue-btn"
                    style={{
                      width: "100%",
                      justifyContent: "center",
                      padding: "14px 20px",
                      fontSize: "1rem",
                      borderRadius: "12px",
                    }}
                  >
                    <Ticket size={18} />
                    <span>Choose Lucky Number & Buy — {money(d.priceMinor, d.currency)}</span>
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

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
