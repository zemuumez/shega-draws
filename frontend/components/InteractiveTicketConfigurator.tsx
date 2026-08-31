"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Currency } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Trophy, Users, ArrowUpRight, Award, CheckCircle2, Ticket, HelpCircle } from "lucide-react";
import { BuyTicketModal } from "./BuyTicketModal";

interface PriceOption {
  value: number;
  label: string;
  percentLeft: number;
}

const ETB_PRICES: PriceOption[] = [
  { value: 100, label: "100", percentLeft: 39 },
  { value: 200, label: "200", percentLeft: 66 },
  { value: 500, label: "500", percentLeft: 14 },
  { value: 1000, label: "1,000", percentLeft: 59 },
];

const USD_PRICES: PriceOption[] = [
  { value: 25, label: "25", percentLeft: 58 },
  { value: 50, label: "50", percentLeft: 72 },
  { value: 100, label: "100", percentLeft: 44 },
  { value: 250, label: "250", percentLeft: 19 },
];

interface PoolOption {
  size: number;
  label: string;
  ticketsCount: string;
}

const POOLS: PoolOption[] = [
  { size: 1000, label: "1K", ticketsCount: "1,000 tickets" },
  { size: 2000, label: "2K", ticketsCount: "2,000 tickets" },
  { size: 3000, label: "3K", ticketsCount: "3,000 tickets" },
  { size: 5000, label: "5K", ticketsCount: "5,000 tickets" },
];

// Top 3 Prize distribution percentages
const TOP_3_PRIZES = [
  { rank: 1, percent: 0.30, label: "1st Prize · Grand Jackpot", color: "gold" },
  { rank: 2, percent: 0.20, label: "2nd Prize · Luxury Reward", color: "silver" },
  { rank: 3, percent: 0.15, label: "3rd Prize · High Cash", color: "bronze" },
];

export function InteractiveTicketConfigurator() {
  const { language } = useLanguage();
  const [currency, setCurrency] = useState<Currency>("ETB");
  const [selectedPrice, setSelectedPrice] = useState<number>(100);
  const [selectedPool, setSelectedPool] = useState<number>(1000);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);

  const isUSD = currency === "USD";
  const currentPrices = isUSD ? USD_PRICES : ETB_PRICES;

  // Handle currency switch
  const handleCurrencyChange = (newCurr: Currency) => {
    setCurrency(newCurr);
    setSelectedPrice(newCurr === "USD" ? 25 : 100);
  };

  // Calculations
  const totalPrizePool = selectedPrice * selectedPool;
  const currentPoolObj = POOLS.find((p) => p.size === selectedPool) || POOLS[0];
  const topPrize = Math.round(totalPrizePool * 0.30);
  const oddsRatio = Math.round(selectedPool / 10);

  // Format currency helper
  const formatMoney = (amount: number) => {
    if (isUSD) {
      return `$${amount.toLocaleString()}`;
    }
    return `${amount.toLocaleString()} ETB`;
  };

  // Top 3 Prizes List
  const calculatedTop3Prizes = TOP_3_PRIZES.map((p) => ({
    rank: p.rank,
    label: p.label,
    amount: formatMoney(Math.round(totalPrizePool * p.percent)),
    color: p.color,
  }));

  return (
    <section
      id="choose-ticket"
      className="card-base rough-paper-ticket"
      style={{
        background: "#FFFDF5",
        borderRadius: "20px",
        padding: "clamp(16px, 3.5vw, 36px)",
        border: "2px solid #F59E0B",
        boxShadow: "0 10px 30px rgba(245, 158, 11, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)",
        position: "relative",
      }}
    >
      {/* ── Top Header Strip ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 22, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Image
            src="/images/rimna-logo.png"
            alt="Rimna Logo"
            width={36}
            height={36}
            style={{ borderRadius: "50%", objectFit: "cover", border: "1.5px solid #F59E0B" }}
          />
          <div>
            <span
              className="display"
              style={{
                fontSize: "clamp(1.15rem, 2.5vw, 1.55rem)",
                fontWeight: 900,
                color: "#111827",
                lineHeight: 1.1,
                display: "block",
                letterSpacing: "-0.3px",
              }}
            >
              RIMNA
            </span>
            <span
              className="mono"
              style={{
                fontSize: "0.625rem",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 800,
              }}
            >
              INTERNATIONAL DIGITAL LOTTERY
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span className="badge badge-gold" style={{ fontSize: "0.75rem", fontWeight: 800, padding: "4px 10px" }}>
            <Trophy size={13} color="#D97706" /> 10 Guaranteed Winners
          </span>
          <span className="badge badge-green" style={{ fontSize: "0.75rem", fontWeight: 800, padding: "4px 10px" }}>
            <CheckCircle2 size={13} color="#059669" /> Public Video Draw
          </span>
        </div>
      </div>

      {/* ── Main Two-Column Grid Layout with Equal Vertical Height ──── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(330px, 1fr))",
          gap: "clamp(20px, 3vw, 36px)",
          alignItems: "stretch", // Ensures both columns have 100% equal vertical space on desktop!
        }}
      >
        {/* ── LEFT COLUMN: Configuration Controls & Top 3 Prizes (Equal Height) ── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: 16,
            height: "100%",
          }}
        >
          {/* 1. CURRENCY SELECTOR (Full Width Pill) */}
          <div>
            <label
              className="mono"
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 900,
                display: "block",
                marginBottom: 6,
              }}
            >
              CURRENCY
            </label>
            <div
              style={{
                display: "flex",
                background: "#F3F4F6",
                borderRadius: "14px",
                padding: 4,
                border: "1.5px solid #E5E7EB",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <button
                type="button"
                onClick={() => handleCurrencyChange("ETB")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: currency === "ETB" ? "1.5px solid #FDE047" : "none",
                  background: currency === "ETB" ? "#FEF08A" : "transparent",
                  color: currency === "ETB" ? "#854D0E" : "#4B5563",
                  fontWeight: 900,
                  fontSize: "0.9375rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "center",
                  boxShadow: currency === "ETB" ? "0 2px 6px rgba(234, 179, 8, 0.25)" : "none",
                }}
              >
                ETB (Birr)
              </button>

              <button
                type="button"
                onClick={() => handleCurrencyChange("USD")}
                style={{
                  flex: 1,
                  padding: "10px 16px",
                  borderRadius: "10px",
                  border: currency === "USD" ? "1.5px solid #BFDBFE" : "none",
                  background: currency === "USD" ? "#EFF6FF" : "transparent",
                  color: currency === "USD" ? "#1D4ED8" : "#4B5563",
                  fontWeight: 900,
                  fontSize: "0.9375rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "center",
                  boxShadow: currency === "USD" ? "0 2px 6px rgba(29, 78, 216, 0.2)" : "none",
                }}
              >
                USD ($)
              </button>
            </div>
          </div>

          {/* 2. TICKET PRICE SELECTION (4 Columns Grid) */}
          <div>
            <label
              className="mono"
              style={{
                fontSize: "0.75rem",
                color: "#6B7280",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 900,
                display: "block",
                marginBottom: 6,
              }}
            >
              TICKET PRICE
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {currentPrices.map((tier) => {
                const isSelected = selectedPrice === tier.value;
                return (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => setSelectedPrice(tier.value)}
                    style={{
                      padding: "11px 4px",
                      borderRadius: "12px",
                      border: isSelected ? "2px solid #F59E0B" : "1.5px solid #E5E7EB",
                      background: isSelected ? "#FEF9C3" : "#FFFFFF",
                      color: "#111827",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "0 4px 12px rgba(245, 158, 11, 0.25)" : "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div
                      className="display"
                      style={{
                        fontSize: "clamp(1.15rem, 2.2vw, 1.4rem)",
                        fontWeight: 900,
                        lineHeight: 1.1,
                        color: isSelected ? "#B45309" : "#111827",
                        marginBottom: 1,
                      }}
                    >
                      {tier.label}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 800,
                        color: isSelected ? "#854D0E" : "#6B7280",
                        textTransform: "uppercase",
                        marginBottom: 4,
                      }}
                    >
                      {isUSD ? "USD" : "ETB"}
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        fontSize: "0.5625rem",
                        fontWeight: 800,
                        color: "#059669",
                        background: "#ECFDF5",
                        padding: "1px 4px",
                        borderRadius: "4px",
                        border: "1px solid #A7F3D0",
                        whiteSpace: "nowrap",
                      }}
                    >
                      <span style={{ display: "inline-block", width: 4, height: 4, borderRadius: "50%", background: "#059669" }} />
                      {tier.percentLeft}% left
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. PARTICIPANT POOL SELECTION (4 Columns Grid) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <label
                className="mono"
                style={{
                  fontSize: "0.75rem",
                  color: "#6B7280",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                  fontWeight: 900,
                }}
              >
                PARTICIPANT POOL
              </label>
              <span className="mono" style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 700 }}>
                {currentPoolObj.ticketsCount}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 8,
              }}
            >
              {POOLS.map((pool) => {
                const isSelected = selectedPool === pool.size;
                return (
                  <button
                    key={pool.size}
                    type="button"
                    onClick={() => setSelectedPool(pool.size)}
                    style={{
                      padding: "11px 4px",
                      borderRadius: "12px",
                      border: isSelected ? "2px solid #F59E0B" : "1.5px solid #E5E7EB",
                      background: isSelected ? "#FEF08A" : "#FFFFFF",
                      color: isSelected ? "#854D0E" : "#374151",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "0 4px 12px rgba(245, 158, 11, 0.25)" : "0 1px 3px rgba(0,0,0,0.03)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        fontWeight: 900,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <Users size={13} /> {pool.label}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: "0.5625rem",
                        fontWeight: 800,
                        textTransform: "uppercase",
                        color: isSelected ? "#854D0E" : "#6B7280",
                        marginTop: 2,
                      }}
                    >
                      PEOPLE
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. TOP 3 GUARANTEED CASH PRIZES STRIP */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E5E7EB",
              borderRadius: "14px",
              padding: "12px 14px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#111827", fontWeight: 900, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                <Trophy size={13} color="#D97706" /> Top 3 Guaranteed Prizes
              </span>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#059669", fontWeight: 800 }}>
                100% Payout
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
              {calculatedTop3Prizes.map((pz) => (
                <div
                  key={pz.rank}
                  style={{
                    background: pz.rank === 1 ? "#FEF9C3" : pz.rank === 2 ? "#EFF6FF" : "#F8FAFC",
                    border: `1px solid ${pz.rank === 1 ? "#FDE047" : pz.rank === 2 ? "#BFDBFE" : "#E2E8F0"}`,
                    borderRadius: "8px",
                    padding: "8px 4px",
                    textAlign: "center",
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: "0.5625rem",
                      fontWeight: 900,
                      color: pz.rank === 1 ? "#854D0E" : pz.rank === 2 ? "#1D4ED8" : "#475569",
                      display: "block",
                      marginBottom: 1,
                    }}
                  >
                    #{pz.rank} {pz.rank === 1 ? "JACKPOT" : pz.rank === 2 ? "2ND" : "3RD"}
                  </span>
                  <span
                    className="display"
                    style={{
                      fontSize: "0.875rem",
                      fontWeight: 900,
                      color: pz.rank === 1 ? "#DC2626" : "#111827",
                      display: "block",
                    }}
                  >
                    {pz.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Banner + Live Summary + Buy Action (Equal Height) ── */}
        <div
          style={{
            background: "#FFFFFF",
            border: "2px solid #F59E0B",
            borderRadius: "18px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.06)",
            height: "100%",
          }}
        >
          {/* Top Visual Banner */}
          <div style={{ position: "relative", width: "100%", height: 185, background: "#000000", flexShrink: 0 }}>
            <Image
              src="/images/rimna-lottery-card.jpg"
              alt="Rimna Digital Lottery Grand Prize Mercedes G-Wagon and Car Keys"
              fill
              priority
              style={{ objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)",
              }}
            />
            <div style={{ position: "absolute", top: 10, right: 10 }}>
              <span
                style={{
                  background: "#FEF08A",
                  border: "1px solid #FACC15",
                  color: "#854D0E",
                  fontSize: "0.6875rem",
                  fontWeight: 900,
                  padding: "3px 8px",
                  borderRadius: "6px",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                }}
              >
                100% LIVE VIDEO DRAW
              </span>
            </div>
          </div>

          {/* Details Metadata List */}
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8, flex: 1, justifyContent: "space-around" }}>
            {/* Total prize pool */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1.5px solid #F3F4F6", paddingBottom: 6 }}>
              <span style={{ fontSize: "0.875rem", color: "#4B5563", fontWeight: 700 }}>
                Total prize pool
              </span>
              <span className="display" style={{ fontSize: "1.35rem", color: "#B45309", fontWeight: 900 }}>
                {formatMoney(totalPrizePool)}
              </span>
            </div>

            {/* Participants */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8125rem", color: "#4B5563", fontWeight: 600 }}>
                Participants
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", color: "#111827", fontWeight: 800 }}>
                {selectedPool.toLocaleString()} people
              </span>
            </div>

            {/* Guaranteed winners */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8125rem", color: "#4B5563", fontWeight: 600 }}>
                Guaranteed winners
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", color: "#111827", fontWeight: 800 }}>
                10
              </span>
            </div>

            {/* Odds of a prize */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8125rem", color: "#4B5563", fontWeight: 600 }}>
                Odds of a prize
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", color: "#059669", fontWeight: 900 }}>
                1 in {oddsRatio}
              </span>
            </div>

            {/* Draw date */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.8125rem", color: "#4B5563", fontWeight: 600 }}>
                Draw date
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", color: "#111827", fontWeight: 800 }}>
                Sep 3, 2026
              </span>
            </div>

            {/* Top prize */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1.5px solid #F3F4F6", paddingTop: 6 }}>
              <span style={{ fontSize: "0.8125rem", color: "#4B5563", fontWeight: 700 }}>
                Top prize (1st Rank)
              </span>
              <span className="display" style={{ fontSize: "1.1rem", color: "#B45309", fontWeight: 900 }}>
                {formatMoney(topPrize)}
              </span>
            </div>
          </div>

          {/* Bottom Action CTA */}
          <div style={{ padding: "0 18px 16px" }}>
            <button
              type="button"
              onClick={() => setIsBuyModalOpen(true)}
              className="casino-btn-red"
              style={{
                width: "100%",
                padding: "13px 18px",
                fontSize: "0.95rem",
                fontWeight: 900,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              <Ticket size={18} /> Buy ticket — {formatMoney(selectedPrice)}
            </button>

            <p
              className="mono"
              style={{
                textAlign: "center",
                fontSize: "0.6875rem",
                color: "#6B7280",
                marginTop: 6,
                marginBottom: 4,
                fontWeight: 600,
              }}
            >
              ✓ Secure mobile checkout · Instant verification
            </p>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4, flexWrap: "wrap", gap: 6 }}>
              <Link
                href="/how-it-works"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.75rem",
                  color: "#1D4ED8",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                <HelpCircle size={13} color="#1D4ED8" /> How It Works Guide
              </Link>

              <Link
                href="/results"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: "0.75rem",
                  color: "#4B5563",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                <Award size={13} color="#D97706" /> Past Results
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── MOBILE STICKY FLOATING BOTTOM BAR ── */}
      <div
        className="mobile-only-floating-bar"
        style={{
          position: "fixed",
          bottom: 12,
          left: 12,
          right: 12,
          background: "#111827",
          border: "2px solid #F59E0B",
          borderRadius: "20px",
          padding: "10px 16px",
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          zIndex: 99,
        }}
      >
        <div>
          <div className="display" style={{ fontSize: "1.2rem", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
            {formatMoney(selectedPrice)}
          </div>
          <div style={{ fontSize: "0.6875rem", color: "#10B981", fontWeight: 800 }}>
            Rimna Lottery · {currentPoolObj.label} pool
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsBuyModalOpen(true)}
          style={{
            background: "#FFFFFF",
            color: "#111827",
            border: "none",
            borderRadius: "12px",
            padding: "10px 20px",
            fontWeight: 900,
            fontSize: "0.875rem",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          Buy ticket <ArrowUpRight size={16} />
        </button>
      </div>

      {/* Buy Ticket Modal */}
      <BuyTicketModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        initialCurrency={currency}
        initialPrice={selectedPrice}
        initialDrawId={`RDL-${currency}-${selectedPrice}`}
      />
    </section>
  );
}
