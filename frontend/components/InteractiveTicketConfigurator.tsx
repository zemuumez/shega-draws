"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Currency } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { Trophy, Users, ShieldCheck, ChevronDown, ChevronUp, ArrowUpRight, Award, Sparkles, CheckCircle2, Ticket } from "lucide-react";
import { BuyTicketModal } from "./BuyTicketModal";

interface PriceOption {
  value: number;
  label: string;
  percentLeft: number;
}

const ETB_PRICES: PriceOption[] = [
  { value: 100, label: "100", percentLeft: 61 },
  { value: 200, label: "200", percentLeft: 67 },
  { value: 500, label: "500", percentLeft: 52 },
  { value: 1000, label: "1,000", percentLeft: 24 },
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

// Prize distribution percentages for the 10 guaranteed winners
const PRIZE_PERCENTAGES = [
  { rank: 1, percent: 0.30, label: "1st Prize · Grand Jackpot" },
  { rank: 2, percent: 0.20, label: "2nd Prize" },
  { rank: 3, percent: 0.15, label: "3rd Prize" },
  { rank: 4, percent: 0.10, label: "4th Prize" },
  { rank: 5, percent: 0.07, label: "5th Prize" },
  { rank: 6, percent: 0.05, label: "6th Prize" },
  { rank: 7, percent: 0.04, label: "7th Prize" },
  { rank: 8, percent: 0.03, label: "8th Prize" },
  { rank: 9, percent: 0.03, label: "9th Prize" },
  { rank: 10, percent: 0.03, label: "10th Prize" },
];

export function InteractiveTicketConfigurator() {
  const { language } = useLanguage();
  const [currency, setCurrency] = useState<Currency>("ETB");
  const [selectedPrice, setSelectedPrice] = useState<number>(100);
  const [selectedPool, setSelectedPool] = useState<number>(1000);
  const [showAllPrizes, setShowAllPrizes] = useState<boolean>(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);

  const isUSD = currency === "USD";
  const currencySymbol = isUSD ? "$" : "ETB";
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

  // 10 Guaranteed Prizes List
  const calculatedPrizes = PRIZE_PERCENTAGES.map((p) => ({
    rank: p.rank,
    label: p.label,
    amount: formatMoney(Math.round(totalPrizePool * p.percent)),
  }));

  const visiblePrizes = showAllPrizes ? calculatedPrizes : calculatedPrizes.slice(0, 4);

  return (
    <section
      id="choose-ticket"
      className="card-base rough-paper-ticket"
      style={{
        background: "#FFFDF5",
        borderRadius: "20px",
        padding: "clamp(20px, 4vw, 36px)",
        border: "2px solid #F59E0B",
        boxShadow: "0 10px 30px rgba(245, 158, 11, 0.1), 0 4px 12px rgba(0, 0, 0, 0.04)",
        position: "relative",
      }}
    >
      {/* ── Top Header Strip ─────────────────────────────────────────── */}
      <div style={{ marginBottom: 26, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
        <div>
          <span
            className="mono"
            style={{
              fontSize: "0.75rem",
              color: "#D97706",
              textTransform: "uppercase",
              letterSpacing: "1.5px",
              fontWeight: 900,
              display: "block",
              marginBottom: 4,
            }}
          >
            STEP 1 · OFFICIAL DIGITAL LOTTERY
          </span>
          <h2
            className="display"
            style={{
              fontSize: "clamp(1.6rem, 3.2vw, 2.25rem)",
              fontWeight: 900,
              color: "#111827",
              lineHeight: 1.15,
              margin: 0,
              letterSpacing: "-0.5px",
            }}
          >
            CHOOSE YOUR TICKET
          </h2>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span className="badge badge-gold" style={{ fontSize: "0.75rem", fontWeight: 800 }}>
            <Trophy size={13} color="#D97706" /> 10 Guaranteed Winners
          </span>
          <span className="badge badge-green" style={{ fontSize: "0.75rem", fontWeight: 800 }}>
            <CheckCircle2 size={13} color="#059669" /> Public Video Draw
          </span>
        </div>
      </div>

      {/* ── Main Two-Column Grid ─────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "clamp(24px, 3.5vw, 40px)",
          alignItems: "start",
        }}
      >
        {/* ── LEFT COLUMN: Interactive Options ─────────────────────────── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* 1. CURRENCY SELECTOR */}
          <div>
            <label
              className="mono"
              style={{
                fontSize: "0.75rem",
                color: "#4B5563",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 900,
                display: "block",
                marginBottom: 8,
              }}
            >
              SELECT CURRENCY
            </label>

            <div
              style={{
                display: "inline-flex",
                background: "#F3F4F6",
                borderRadius: "12px",
                padding: 4,
                border: "1.5px solid #E5E7EB",
                width: "100%",
                maxWidth: 360,
              }}
            >
              <button
                type="button"
                onClick={() => handleCurrencyChange("ETB")}
                style={{
                  flex: 1,
                  padding: "9px 16px",
                  borderRadius: "9px",
                  border: currency === "ETB" ? "1.5px solid #FDE047" : "none",
                  background: currency === "ETB" ? "#FEF08A" : "transparent",
                  color: currency === "ETB" ? "#854D0E" : "#4B5563",
                  fontWeight: 900,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "center",
                  boxShadow: currency === "ETB" ? "0 2px 6px rgba(234, 179, 8, 0.25)" : "none",
                }}
              >
                ETB (Birr) · Local
              </button>

              <button
                type="button"
                onClick={() => handleCurrencyChange("USD")}
                style={{
                  flex: 1,
                  padding: "9px 16px",
                  borderRadius: "9px",
                  border: currency === "USD" ? "1.5px solid #BFDBFE" : "none",
                  background: currency === "USD" ? "#EFF6FF" : "transparent",
                  color: currency === "USD" ? "#1D4ED8" : "#4B5563",
                  fontWeight: 900,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  textAlign: "center",
                  boxShadow: currency === "USD" ? "0 2px 6px rgba(29, 78, 216, 0.2)" : "none",
                }}
              >
                USD ($) · Diaspora
              </button>
            </div>
          </div>

          {/* 2. TICKET PRICE SELECTION */}
          <div>
            <label
              className="mono"
              style={{
                fontSize: "0.75rem",
                color: "#4B5563",
                textTransform: "uppercase",
                letterSpacing: "1px",
                fontWeight: 900,
                display: "block",
                marginBottom: 8,
              }}
            >
              TICKET PRICE
            </label>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))",
                gap: 10,
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
                      padding: "12px 8px",
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
                        fontSize: "1.35rem",
                        fontWeight: 900,
                        lineHeight: 1.1,
                        color: isSelected ? "#B45309" : "#111827",
                        marginBottom: 2,
                      }}
                    >
                      {tier.label}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: "0.6875rem",
                        fontWeight: 800,
                        color: isSelected ? "#854D0E" : "#6B7280",
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      {isUSD ? "USD" : "ETB"}
                    </div>
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        fontSize: "0.6875rem",
                        fontWeight: 800,
                        color: "#059669",
                        background: "#ECFDF5",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      <span style={{ display: "inline-block", width: 5, height: 5, borderRadius: "50%", background: "#059669" }} />
                      {tier.percentLeft}% left
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. PARTICIPANT POOL SELECTION */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <label
                className="mono"
                style={{
                  fontSize: "0.75rem",
                  color: "#4B5563",
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
                gridTemplateColumns: "repeat(auto-fit, minmax(75px, 1fr))",
                gap: 10,
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
                      padding: "11px 8px",
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
                        gap: 4,
                        fontWeight: 900,
                        fontSize: "0.9375rem",
                      }}
                    >
                      <Users size={14} /> {pool.label}
                    </div>
                    <div
                      className="mono"
                      style={{
                        fontSize: "0.625rem",
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

          {/* 4. GUARANTEED PRIZES ACCORDION STRIP */}
          <div
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E5E7EB",
              borderRadius: "14px",
              padding: "14px 16px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span className="mono" style={{ fontSize: "0.75rem", color: "#111827", fontWeight: 900, textTransform: "uppercase" }}>
                {showAllPrizes ? "All 10 guaranteed prizes" : "Top 4 of 10 guaranteed prizes"}
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
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  padding: "3px 8px",
                  borderRadius: "6px",
                }}
              >
                {showAllPrizes ? "Show less" : "Show more"}
                {showAllPrizes ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </button>
            </div>

            {/* Prize cards grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(135px, 1fr))",
                gap: 6,
              }}
            >
              {visiblePrizes.map((pz) => (
                <div
                  key={pz.rank}
                  style={{
                    background: pz.rank === 1 ? "#FEF9C3" : "#FAFAFA",
                    border: `1.5px solid ${pz.rank === 1 ? "#FDE047" : "#E5E7EB"}`,
                    borderRadius: "8px",
                    padding: "7px 10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    className="mono"
                    style={{
                      fontSize: "0.75rem",
                      fontWeight: pz.rank === 1 ? 900 : 700,
                      color: pz.rank === 1 ? "#854D0E" : "#4B5563",
                    }}
                  >
                    #{pz.rank}
                  </span>
                  <span
                    className="mono"
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 900,
                      color: pz.rank === 1 ? "#DC2626" : "#111827",
                    }}
                  >
                    {pz.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Live Summary & Action Card ─────────────────── */}
        <div
          style={{
            background: "#FFFFFF",
            border: "2px solid #F59E0B",
            borderRadius: "18px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.06)",
          }}
        >
          {/* Top Visual Banner */}
          <div style={{ position: "relative", width: "100%", height: 195, background: "#000000" }}>
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
          <div style={{ padding: "18px 22px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
            {/* Total prize pool */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1.5px solid #F3F4F6", paddingBottom: 8 }}>
              <span style={{ fontSize: "0.875rem", color: "#4B5563", fontWeight: 700 }}>
                Total prize pool
              </span>
              <span className="display" style={{ fontSize: "1.35rem", color: "#B45309", fontWeight: 900 }}>
                {formatMoney(totalPrizePool)}
              </span>
            </div>

            {/* Participants */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "#4B5563", fontWeight: 600 }}>
                Participants
              </span>
              <span className="mono" style={{ fontSize: "0.875rem", color: "#111827", fontWeight: 800 }}>
                {selectedPool.toLocaleString()} people
              </span>
            </div>

            {/* Guaranteed winners */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "#4B5563", fontWeight: 600 }}>
                Guaranteed winners
              </span>
              <span className="mono" style={{ fontSize: "0.875rem", color: "#111827", fontWeight: 800 }}>
                10
              </span>
            </div>

            {/* Odds of a prize */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "#4B5563", fontWeight: 600 }}>
                Odds of a prize
              </span>
              <span className="mono" style={{ fontSize: "0.875rem", color: "#059669", fontWeight: 900 }}>
                1 in {oddsRatio}
              </span>
            </div>

            {/* Draw date */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "0.875rem", color: "#4B5563", fontWeight: 600 }}>
                Draw date
              </span>
              <span className="mono" style={{ fontSize: "0.875rem", color: "#111827", fontWeight: 800 }}>
                Sep 3, 2026
              </span>
            </div>

            {/* Top prize */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderTop: "1.5px solid #F3F4F6", paddingTop: 10 }}>
              <span style={{ fontSize: "0.875rem", color: "#4B5563", fontWeight: 700 }}>
                Top prize (1st Rank)
              </span>
              <span className="display" style={{ fontSize: "1.15rem", color: "#B45309", fontWeight: 900 }}>
                {formatMoney(topPrize)}
              </span>
            </div>

            {/* Big Primary CTA Button (Casino Gold / Red) */}
            <div style={{ marginTop: 6 }}>
              <button
                type="button"
                onClick={() => setIsBuyModalOpen(true)}
                className="casino-btn-red"
                style={{
                  width: "100%",
                  padding: "14px 18px",
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
                  marginBottom: 0,
                  fontWeight: 600,
                }}
              >
                ✓ Secure mobile checkout · Instant verification
              </p>
            </div>

            {/* Link to Past Results */}
            <div style={{ textAlign: "center", marginTop: 4 }}>
              <Link
                href="/results"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: "0.75rem",
                  color: "#4B5563",
                  textDecoration: "none",
                  fontWeight: 700,
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#D97706")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#4B5563")}
              >
                <Award size={14} color="#D97706" /> View Past Audited Results & Live Streams
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
          borderRadius: "16px",
          padding: "10px 16px",
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          zIndex: 99,
        }}
      >
        <div>
          <div className="display" style={{ fontSize: "1.15rem", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
            {formatMoney(selectedPrice)}
          </div>
          <div style={{ fontSize: "0.6875rem", color: "#10B981", fontWeight: 800 }}>
            Rimna Lottery · {currentPoolObj.label} pool
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsBuyModalOpen(true)}
          className="casino-btn-red"
          style={{
            padding: "9px 16px",
            fontWeight: 900,
            fontSize: "0.875rem",
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
            cursor: "pointer",
          }}
        >
          Buy ticket <ArrowUpRight size={15} />
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
