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
        background: "rgba(255, 253, 245, 0.90)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRadius: "24px",
        padding: "clamp(16px, 2.5vw, 26px)",
        border: "2px solid rgba(245, 158, 11, 0.75)",
        boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(254, 240, 138, 0.6)",
        position: "relative",
      }}
    >
      {/* ── 1. Compact Header Bar ───────────────────────────────────── */}
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          borderBottom: "1.5px solid rgba(253, 224, 71, 0.7)",
          paddingBottom: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Image
            src="/images/rimna-logo.png"
            alt="Rimna Emblem"
            width={28}
            height={28}
            style={{ borderRadius: "50%", objectFit: "cover" }}
          />
          <div>
            <h2
              className="display"
              style={{
                fontSize: "clamp(1.1rem, 2.2vw, 1.35rem)",
                fontWeight: 900,
                color: "#111827",
                margin: 0,
                lineHeight: 1.1,
              }}
            >
              Interactive Ticket Configurator
            </h2>
            <span
              className="mono"
              style={{
                fontSize: "0.625rem",
                color: "#78350F",
                textTransform: "uppercase",
                fontWeight: 800,
                letterSpacing: "0.5px",
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
              background: "rgba(254, 249, 195, 0.9)",
              border: "1px solid #FDE047",
              color: "#92400E",
              fontSize: "0.6875rem",
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Trophy size={11} color="#D97706" /> 10 Winners
          </span>
          <span
            style={{
              background: "rgba(236, 253, 245, 0.9)",
              border: "1px solid #A7F3D0",
              color: "#065F46",
              fontSize: "0.6875rem",
              fontWeight: 800,
              padding: "3px 8px",
              borderRadius: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <CheckCircle2 size={11} color="#059669" /> Live Video
          </span>
        </div>
      </div>

      {/* ── 2. Main Two-Column Space-Optimized Grid ───────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "clamp(14px, 2vw, 20px)",
          alignItems: "stretch",
        }}
      >
        {/* ── LEFT COLUMN: Modern Segmented Pill Controls ───────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            justifyContent: "space-between",
          }}
        >
          {/* A. CURRENCY SELECTOR (Modern Segmented Switch) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#92400E", fontWeight: 900, textTransform: "uppercase" }}>
                1. CURRENCY
              </span>
              <span style={{ fontSize: "0.6875rem", color: "#6B7280", fontWeight: 700 }}>
                {isUSD ? "International / Diaspora" : "Ethiopia National"}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                background: "rgba(241, 245, 249, 0.85)",
                borderRadius: "10px",
                padding: 3,
                border: "1.5px solid rgba(226, 232, 240, 0.9)",
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
                  color: currency === "ETB" ? "#854D0E" : "#475569",
                  fontWeight: 900,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                  textAlign: "center",
                  boxShadow: currency === "ETB" ? "0 2px 4px rgba(234, 179, 8, 0.25)" : "none",
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
                  border: currency === "USD" ? "1.5px solid #BFDBFE" : "none",
                  background: currency === "USD" ? "#EFF6FF" : "transparent",
                  color: currency === "USD" ? "#1D4ED8" : "#475569",
                  fontWeight: 900,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  transition: "all 0.12s ease",
                  textAlign: "center",
                  boxShadow: currency === "USD" ? "0 2px 4px rgba(29, 78, 216, 0.2)" : "none",
                }}
              >
                🇺🇸 USD ($)
              </button>
            </div>
          </div>

          {/* B. TICKET PRICE SELECTION (Compact 4-Pill Grid) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#92400E", fontWeight: 900, textTransform: "uppercase" }}>
                2. TICKET PRICE
              </span>
              <span style={{ fontSize: "0.6875rem", color: "#B45309", fontWeight: 800 }}>
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
                      border: isSelected ? "2px solid #F59E0B" : "1.5px solid rgba(226, 232, 240, 0.8)",
                      background: isSelected ? "rgba(254, 249, 195, 0.95)" : "rgba(255, 255, 255, 0.85)",
                      color: "#111827",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.12s ease",
                      boxShadow: isSelected ? "0 2px 8px rgba(245, 158, 11, 0.25)" : "0 1px 2px rgba(0,0,0,0.02)",
                    }}
                  >
                    <div
                      className="display"
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: 900,
                        lineHeight: 1.1,
                        color: isSelected ? "#B45309" : "#111827",
                      }}
                    >
                      {isUSD ? `$${tier.label}` : tier.label}
                    </div>
                    <div
                      style={{
                        fontSize: "0.5625rem",
                        fontWeight: 800,
                        color: isSelected ? "#854D0E" : "#64748B",
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

          {/* C. PARTICIPANT POOL SELECTION (Compact 4-Pill Grid) */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#92400E", fontWeight: 900, textTransform: "uppercase" }}>
                3. PARTICIPANT POOL
              </span>
              <span style={{ fontSize: "0.6875rem", color: "#6B7280", fontWeight: 700 }}>
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
                      border: isSelected ? "2px solid #F59E0B" : "1.5px solid rgba(226, 232, 240, 0.8)",
                      background: isSelected ? "rgba(254, 240, 138, 0.95)" : "rgba(255, 255, 255, 0.85)",
                      color: isSelected ? "#854D0E" : "#374151",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.12s ease",
                      boxShadow: isSelected ? "0 2px 8px rgba(245, 158, 11, 0.25)" : "0 1px 2px rgba(0,0,0,0.02)",
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
                        color: isSelected ? "#854D0E" : "#64748B",
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

          {/* D. TOP PRIZES (Expandable: Top 3 vs All 10 Guaranteed Payouts) */}
          <div
            style={{
              background: "rgba(255, 255, 255, 0.88)",
              border: "1.5px solid #FDE047",
              borderRadius: "12px",
              padding: "8px 10px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#92400E", fontWeight: 900, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 4 }}>
                <Trophy size={12} color="#D97706" /> {showAllPrizes ? "All 10 Guaranteed Payouts" : "Top 3 Guaranteed Payouts"}
              </span>

              <button
                type="button"
                onClick={() => setShowAllPrizes(!showAllPrizes)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#B45309",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
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
                    background: pz.rank === 1 ? "rgba(254, 249, 195, 0.95)" : pz.rank === 2 ? "rgba(239, 246, 255, 0.95)" : pz.rank === 3 ? "rgba(255, 251, 235, 0.95)" : "rgba(248, 250, 252, 0.9)",
                    border: `1px solid ${pz.rank === 1 ? "#FDE047" : pz.rank === 2 ? "#BFDBFE" : pz.rank === 3 ? "#FDE68A" : "#E2E8F0"}`,
                    borderRadius: "8px",
                    padding: "6px 4px",
                    textAlign: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.5625rem",
                      fontWeight: 900,
                      color: pz.rank === 1 ? "#854D0E" : pz.rank === 2 ? "#1D4ED8" : pz.rank === 3 ? "#B45309" : "#475569",
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
                      color: pz.rank === 1 ? "#DC2626" : "#111827",
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

        {/* ── RIGHT COLUMN: Space-Optimized Translucent Ticket Card & Stat Grid ── */}
        <div
          style={{
            background: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "2px solid #F59E0B",
            borderRadius: "14px",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            boxShadow: "0 6px 18px rgba(0, 0, 0, 0.08)",
          }}
        >
          {/* Slim Compact Header Banner (Reduced Visual Weight) */}
          <div
            style={{
              position: "relative",
              width: "100%",
              height: 56,
              background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 14px",
              boxSizing: "border-box",
              color: "#FFFFFF",
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
                background: "rgba(253, 224, 71, 0.2)",
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

          {/* Compact 2x3 Stat Grid */}
          <div
            style={{
              padding: "12px 14px",
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 8,
              background: "rgba(255, 253, 249, 0.8)",
            }}
          >
            {/* Stat 1: Total Prize Pool */}
            <div style={{ background: "rgba(255, 255, 255, 0.95)", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "6px 8px" }}>
              <span style={{ fontSize: "0.625rem", color: "#6B7280", fontWeight: 800, display: "block" }}>
                TOTAL PRIZE POOL
              </span>
              <span className="display" style={{ fontSize: "1.05rem", fontWeight: 900, color: "#B45309" }}>
                {formatMoney(totalPrizePool)}
              </span>
            </div>

            {/* Stat 2: 1st Jackpot Prize */}
            <div style={{ background: "rgba(254, 249, 195, 0.95)", border: "1px solid #FDE047", borderRadius: "8px", padding: "6px 8px" }}>
              <span style={{ fontSize: "0.625rem", color: "#854D0E", fontWeight: 800, display: "block" }}>
                1ST GRAND JACKPOT
              </span>
              <span className="display" style={{ fontSize: "1.05rem", fontWeight: 900, color: "#DC2626" }}>
                {formatMoney(topPrize)}
              </span>
            </div>

            {/* Stat 3: Participants */}
            <div style={{ background: "rgba(255, 255, 255, 0.95)", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "6px 8px" }}>
              <span style={{ fontSize: "0.625rem", color: "#6B7280", fontWeight: 800, display: "block" }}>
                POOL CAPACITY
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 900, color: "#111827" }}>
                {selectedPool.toLocaleString()} People
              </span>
            </div>

            {/* Stat 4: Winning Odds */}
            <div style={{ background: "rgba(236, 253, 245, 0.95)", border: "1px solid #A7F3D0", borderRadius: "8px", padding: "6px 8px" }}>
              <span style={{ fontSize: "0.625rem", color: "#065F46", fontWeight: 800, display: "block" }}>
                WINNING ODDS
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 900, color: "#059669" }}>
                1 in {oddsRatio} (High Odds)
              </span>
            </div>

            {/* Stat 5: Guaranteed Winners */}
            <div style={{ background: "rgba(255, 255, 255, 0.95)", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "6px 8px" }}>
              <span style={{ fontSize: "0.625rem", color: "#6B7280", fontWeight: 800, display: "block" }}>
                CASH WINNERS
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 900, color: "#111827" }}>
                10 Guaranteed
              </span>
            </div>

            {/* Stat 6: Draw Date */}
            <div style={{ background: "rgba(255, 255, 255, 0.95)", border: "1px solid #E5E7EB", borderRadius: "8px", padding: "6px 8px" }}>
              <span style={{ fontSize: "0.625rem", color: "#6B7280", fontWeight: 800, display: "block" }}>
                DRAW BROADCAST
              </span>
              <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 900, color: "#111827" }}>
                Sep 3, 2026
              </span>
            </div>
          </div>

          {/* Action CTA & Quick Links */}
          <div style={{ padding: "10px 14px 12px", borderTop: "1px solid rgba(229, 231, 235, 0.8)", background: "rgba(255, 255, 255, 0.95)" }}>
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
                boxShadow: "0 4px 12px rgba(220, 38, 38, 0.4)",
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
                  color: "#1D4ED8",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                <HelpCircle size={12} color="#1D4ED8" /> How It Works
              </Link>

              <Link
                href="/results"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                  fontSize: "0.6875rem",
                  color: "#6B7280",
                  textDecoration: "none",
                  fontWeight: 700,
                }}
              >
                <Award size={12} color="#D97706" /> Past Results
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
          <div style={{ fontSize: "0.625rem", color: "#10B981", fontWeight: 800 }}>
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
        initialDrawId={`RDL-${currency}-${selectedPrice}`}
      />
    </div>
  );
}
