"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Currency } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import {
  Trophy,
  Users,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Ticket,
  HelpCircle,
  Percent,
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
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

// All 10 Guaranteed Prize distribution percentages (Sums to 100%)
const ALL_10_PRIZES = [
  { rank: 1, percent: 0.30, label: "1st Grand Jackpot", tag: "30%" },
  { rank: 2, percent: 0.20, label: "2nd Luxury Prize", tag: "20%" },
  { rank: 3, percent: 0.15, label: "3rd High Cash", tag: "15%" },
  { rank: 4, percent: 0.08, label: "4th Cash Prize", tag: "8%" },
  { rank: 5, percent: 0.06, label: "5th Cash Prize", tag: "6%" },
  { rank: 6, percent: 0.05, label: "6th Cash Prize", tag: "5%" },
  { rank: 7, percent: 0.04, label: "7th Cash Prize", tag: "4%" },
  { rank: 8, percent: 0.04, label: "8th Cash Prize", tag: "4%" },
  { rank: 9, percent: 0.04, label: "9th Cash Prize", tag: "4%" },
  { rank: 10, percent: 0.04, label: "10th Cash Prize", tag: "4%" },
];

export function InteractiveTicketConfigurator() {
  const { language } = useLanguage();
  const [currency, setCurrency] = useState<Currency>("ETB");
  const [selectedPrice, setSelectedPrice] = useState<number>(100);
  const [selectedPool, setSelectedPool] = useState<number>(1000);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState<boolean>(false);
  const [showAllPrizes, setShowAllPrizes] = useState<boolean>(false);

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

  // Calculate all 10 prizes based on live pool total
  const calculatedAll10Prizes = ALL_10_PRIZES.map((p) => ({
    rank: p.rank,
    label: p.label,
    tag: p.tag,
    amount: formatMoney(Math.round(totalPrizePool * p.percent)),
  }));

  const visiblePrizes = showAllPrizes ? calculatedAll10Prizes : calculatedAll10Prizes.slice(0, 3);

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.62)",
        backdropFilter: "blur(28px) saturate(190%)",
        WebkitBackdropFilter: "blur(28px) saturate(190%)",
        borderRadius: "24px",
        padding: "clamp(14px, 2.5vw, 24px)",
        border: "2px solid rgba(253, 224, 71, 0.75)",
        boxShadow:
          "0 32px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(254, 240, 138, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
        position: "relative",
        boxSizing: "border-box",
        color: "#FFFFFF",
      }}
    >
      {/* ── 1. Compact Glass Header Bar ────────────────────────────── */}
      <div
        style={{
          marginBottom: 14,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          borderBottom: "1.5px solid rgba(253, 224, 71, 0.4)",
          paddingBottom: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image
            src="/images/rimna-logo.png"
            alt="Rimna Emblem"
            width={30}
            height={30}
            style={{
              borderRadius: "50%",
              objectFit: "cover",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            }}
          />
          <div>
            <h2
              className="display"
              style={{
                fontSize: "clamp(1.1rem, 2.2vw, 1.35rem)",
                fontWeight: 900,
                color: "#FFFFFF",
                margin: 0,
                lineHeight: 1.1,
                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              }}
            >
              Interactive Ticket Configurator
            </h2>
            <span
              className="mono"
              style={{
                fontSize: "0.625rem",
                color: "#FEF08A",
                textTransform: "uppercase",
                fontWeight: 800,
                letterSpacing: "0.5px",
                display: "block",
              }}
            >
              Capped Pools · 10 Guaranteed Winners · 100% Video Draw
            </span>
          </div>
        </div>

        {/* Header Badges */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              background: "rgba(254, 240, 138, 0.2)",
              border: "1px solid #FDE047",
              color: "#FEF08A",
              fontSize: "0.6875rem",
              fontWeight: 900,
              padding: "3px 8px",
              borderRadius: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              boxShadow: "0 2px 6px rgba(234, 179, 8, 0.2)",
            }}
          >
            <Trophy size={11} color="#FDE047" /> 10 Winners
          </span>
          <span
            style={{
              background: "rgba(16, 185, 129, 0.2)",
              border: "1px solid #10B981",
              color: "#6EE7B7",
              fontSize: "0.6875rem",
              fontWeight: 900,
              padding: "3px 8px",
              borderRadius: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              boxShadow: "0 2px 6px rgba(16, 185, 129, 0.2)",
            }}
          >
            <CheckCircle2 size={11} color="#34D399" /> Live Video
          </span>
        </div>
      </div>

      {/* ── 2. Main Two-Column Translucent Floating Grid ───────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
          gap: "clamp(12px, 2vw, 18px)",
          alignItems: "stretch",
        }}
      >
        {/* ── LEFT COLUMN: Translucent Frosted Glass Controls ───── */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            borderRadius: "16px",
            border: "1px solid rgba(253, 224, 71, 0.3)",
            padding: "clamp(12px, 2vw, 16px)",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            justifyContent: "space-between",
            boxShadow: "0 8px 24px rgba(0, 0, 0, 0.3)",
          }}
        >
          {/* A. CURRENCY SELECTOR */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}>
                1. CURRENCY
              </span>
              <span style={{ fontSize: "0.6875rem", color: "#94A3B8", fontWeight: 800 }}>
                {isUSD ? "International / Diaspora" : "Ethiopia National"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                background: "rgba(0, 0, 0, 0.4)",
                borderRadius: "10px",
                padding: 3,
                border: "1px solid rgba(255, 255, 255, 0.15)",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <button
                type="button"
                onClick={() => handleCurrencyChange("ETB")}
                style={{
                  flex: 1,
                  padding: "7px 12px",
                  borderRadius: "8px",
                  border: currency === "ETB" ? "1.5px solid #FDE047" : "none",
                  background: currency === "ETB" ? "#FEF08A" : "transparent",
                  color: currency === "ETB" ? "#854D0E" : "#CBD5E1",
                  fontWeight: 900,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                  textAlign: "center",
                  boxShadow: currency === "ETB" ? "0 2px 6px rgba(234, 179, 8, 0.35)" : "none",
                }}
              >
                🇪🇹 ETB (Birr)
              </button>

              <button
                type="button"
                onClick={() => handleCurrencyChange("USD")}
                style={{
                  flex: 1,
                  padding: "7px 12px",
                  borderRadius: "8px",
                  border: currency === "USD" ? "1.5px solid #93C5FD" : "none",
                  background: currency === "USD" ? "#EFF6FF" : "transparent",
                  color: currency === "USD" ? "#1D4ED8" : "#CBD5E1",
                  fontWeight: 900,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                  textAlign: "center",
                  boxShadow: currency === "USD" ? "0 2px 6px rgba(29, 78, 216, 0.35)" : "none",
                }}
              >
                🇺🇸 USD ($)
              </button>
            </div>
          </div>

          {/* B. TICKET PRICE SELECTION */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}>
                2. TICKET PRICE
              </span>
              <span style={{ fontSize: "0.6875rem", color: "#FDE047", fontWeight: 900 }}>
                Selected: {formatMoney(selectedPrice)}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
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
                      padding: "8px 4px",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid #F59E0B" : "1.5px solid rgba(255, 255, 255, 0.15)",
                      background: isSelected ? "#FEF9C3" : "rgba(0, 0, 0, 0.35)",
                      color: isSelected ? "#111827" : "#FFFFFF",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.12s ease",
                      boxShadow: isSelected ? "0 4px 12px rgba(245, 158, 11, 0.35)" : "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div
                      className="display"
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 900,
                        lineHeight: 1.1,
                        color: isSelected ? "#B45309" : "#FFFFFF",
                      }}
                    >
                      {isUSD ? `$${tier.label}` : tier.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.5625rem",
                        fontWeight: 800,
                        color: isSelected ? "#854D0E" : "#94A3B8",
                        textTransform: "uppercase",
                      }}
                    >
                      {tier.percentLeft}% left
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* C. PARTICIPANT POOL SELECTION */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}>
                3. PARTICIPANT POOL
              </span>
              <span style={{ fontSize: "0.6875rem", color: "#94A3B8", fontWeight: 800 }}>
                {currentPoolObj.ticketsCount}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 6,
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
                      padding: "8px 4px",
                      borderRadius: "10px",
                      border: isSelected ? "2px solid #F59E0B" : "1.5px solid rgba(255, 255, 255, 0.15)",
                      background: isSelected ? "#FEF08A" : "rgba(0, 0, 0, 0.35)",
                      color: isSelected ? "#854D0E" : "#E2E8F0",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.12s ease",
                      boxShadow: isSelected ? "0 4px 12px rgba(245, 158, 11, 0.35)" : "0 1px 3px rgba(0,0,0,0.2)",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 3,
                        fontWeight: 900,
                        fontSize: "0.875rem",
                      }}
                    >
                      <Users size={12} /> {pool.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.5625rem",
                        fontWeight: 800,
                        color: isSelected ? "#854D0E" : "#94A3B8",
                        textTransform: "uppercase",
                      }}
                    >
                      PEOPLE
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* D. TOP PRIZES */}
          <div
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              border: "1.5px solid rgba(253, 224, 71, 0.4)",
              borderRadius: "12px",
              padding: "8px 10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                <Trophy size={12} color="#FDE047" /> {showAllPrizes ? "All 10 Guaranteed Payouts" : "Top 3 Guaranteed Payouts"}
              </span>

              <button
                type="button"
                onClick={() => setShowAllPrizes(!showAllPrizes)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#FDE047",
                  fontSize: "0.6875rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  padding: 0,
                }}
              >
                {showAllPrizes ? (
                  <>Show Top 3 <ChevronUp size={13} /></>
                ) : (
                  <>Show All 10 Prizes <ChevronDown size={13} /></>
                )}
              </button>
            </div>

            {/* Prizes Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: showAllPrizes ? "repeat(auto-fit, minmax(130px, 1fr))" : "repeat(3, 1fr)",
                gap: 6,
                maxHeight: showAllPrizes ? 220 : "none",
                overflowY: showAllPrizes ? "auto" : "visible",
                paddingRight: showAllPrizes ? 2 : 0,
              }}
            >
              {visiblePrizes.map((pz) => (
                <div
                  key={pz.rank}
                  style={{
                    background: pz.rank === 1 ? "rgba(254, 240, 138, 0.25)" : pz.rank === 2 ? "rgba(59, 130, 246, 0.2)" : pz.rank === 3 ? "rgba(245, 158, 11, 0.2)" : "rgba(255, 255, 255, 0.08)",
                    border: `1px solid ${pz.rank === 1 ? "#FDE047" : pz.rank === 2 ? "#93C5FD" : pz.rank === 3 ? "#FCD34D" : "rgba(255,255,255,0.15)"}`,
                    borderRadius: "8px",
                    padding: "6px 4px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.5625rem",
                      fontWeight: 900,
                      color: pz.rank === 1 ? "#FEF08A" : pz.rank === 2 ? "#93C5FD" : pz.rank === 3 ? "#FDE047" : "#CBD5E1",
                      display: "block",
                      marginBottom: 1,
                    }}
                  >
                    #{pz.rank} {pz.rank <= 3 ? "" : `(${pz.tag})`}
                  </span>
                  <span
                    className="display"
                    style={{
                      fontSize: "0.8125rem",
                      fontWeight: 900,
                      color: pz.rank === 1 ? "#F87171" : "#FFFFFF",
                      display: "block",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {pz.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Translucent Floating Summary Card & Stat Grid ── */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.4)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            border: "2px solid rgba(253, 224, 71, 0.6)",
            borderRadius: "16px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.4)",
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 54,
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              boxSizing: "border-box",
              color: "#FFFFFF",
              borderBottom: "1px solid rgba(253, 224, 71, 0.3)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <Sparkles size={14} color="#FDE047" />
              <span style={{ fontSize: "0.8125rem", fontWeight: 900, color: "#FEF08A" }}>
                Live Draw Tier Summary
              </span>
            </div>
            <span
              style={{
                background: "rgba(253, 224, 71, 0.25)",
                border: "1px solid #FDE047",
                color: "#FEF08A",
                fontSize: "0.625rem",
                fontWeight: 900,
                padding: "2px 7px",
                borderRadius: "10px",
              }}
            >
              100% VIDEO DRAW
            </span>
          </div>

          {/* Translucent 2x3 Stat Grid */}
          <div
            style={{
              padding: "12px 14px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              background: "rgba(0, 0, 0, 0.25)",
            }}
          >
            {/* Stat 1: Total Prize Pool */}
            <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "8px", padding: "6px 8px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: "0.625rem", color: "#94A3B8", fontWeight: 800, display: "block" }}>
                TOTAL PRIZE POOL
              </span>
              <span className="display" style={{ fontSize: "1.05rem", fontWeight: 900, color: "#FDE047" }}>
                {formatMoney(totalPrizePool)}
              </span>
            </div>

            {/* Stat 2: 1st Jackpot Prize */}
            <div style={{ background: "rgba(254, 240, 138, 0.15)", border: "1px solid #FDE047", borderRadius: "8px", padding: "6px 8px", boxShadow: "0 1px 3px rgba(234, 179, 8, 0.2)" }}>
              <span style={{ fontSize: "0.625rem", color: "#FEF08A", fontWeight: 800, display: "block" }}>
                1ST GRAND JACKPOT
              </span>
              <span className="display" style={{ fontSize: "1.05rem", fontWeight: 900, color: "#F87171" }}>
                {formatMoney(topPrize)}
              </span>
            </div>

            {/* Stat 3: Participants */}
            <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "8px", padding: "6px 8px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: "0.625rem", color: "#94A3B8", fontWeight: 800, display: "block" }}>
                POOL CAPACITY
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 900, color: "#FFFFFF" }}>
                {selectedPool.toLocaleString()} People
              </span>
            </div>

            {/* Stat 4: Winning Odds */}
            <div style={{ background: "rgba(16, 185, 129, 0.15)", border: "1px solid #10B981", borderRadius: "8px", padding: "6px 8px", boxShadow: "0 1px 3px rgba(16, 185, 129, 0.2)" }}>
              <span style={{ fontSize: "0.625rem", color: "#6EE7B7", fontWeight: 800, display: "block" }}>
                WINNING ODDS
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 900, color: "#34D399" }}>
                1 in {oddsRatio} (High Odds)
              </span>
            </div>

            {/* Stat 5: Guaranteed Winners */}
            <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "8px", padding: "6px 8px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: "0.625rem", color: "#94A3B8", fontWeight: 800, display: "block" }}>
                CASH WINNERS
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 900, color: "#FFFFFF" }}>
                10 Guaranteed
              </span>
            </div>

            {/* Stat 6: Draw Date */}
            <div style={{ background: "rgba(15, 23, 42, 0.6)", border: "1px solid rgba(255, 255, 255, 0.12)", borderRadius: "8px", padding: "6px 8px", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }}>
              <span style={{ fontSize: "0.625rem", color: "#94A3B8", fontWeight: 800, display: "block" }}>
                DRAW BROADCAST
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 900, color: "#FFFFFF" }}>
                Sep 3, 2026
              </span>
            </div>
          </div>

          {/* Action CTA */}
          <div style={{ padding: "10px 14px 12px", borderTop: "1px solid rgba(255, 255, 255, 0.12)", background: "rgba(15, 23, 42, 0.7)" }}>
            <button
              type="button"
              onClick={() => setIsBuyModalOpen(true)}
              className="casino-btn-red"
              style={{
                width: "100%",
                padding: "10px 14px",
                fontSize: "0.9375rem",
                fontWeight: 900,
                borderRadius: "10px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.45)",
              }}
            >
              <Ticket size={16} /> Buy Ticket — {formatMoney(selectedPrice)}
            </button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
              <Link
                href="/how-it-works"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.6875rem",
                  color: "#93C5FD",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                <HelpCircle size={12} color="#93C5FD" /> How It Works
              </Link>

              <Link
                href="/results"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.6875rem",
                  color: "#CBD5E1",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                <Award size={12} color="#FDE047" /> Past Results
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
          padding: "8px 14px",
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.6)",
          zIndex: 99,
        }}
      >
        <div>
          <div className="display" style={{ fontSize: "1.1rem", fontWeight: 900, color: "#FFFFFF", lineHeight: 1.1 }}>
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
            borderRadius: "10px",
            padding: "8px 16px",
            fontWeight: 900,
            fontSize: "0.8125rem",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
          }}
        >
          Buy ticket <ArrowUpRight size={14} />
        </button>
      </div>

      {/* Buy Ticket Modal */}
      <BuyTicketModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        initialCurrency={currency}
        initialPrice={selectedPrice}
        initialPoolSize={selectedPool}
        initialDrawId={`RDL-${currency}-${selectedPrice}`}
      />
    </div>
  );
}
