"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Trophy,
  ArrowUpRight,
  Coins,
  Ticket,
  Users,
  Percent,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { FloatingParticlesCanvas } from "./FloatingParticlesCanvas";

import type { CMSSiteSettings } from "@/lib/sanity/queries";

interface CinematicStadiumHeroProps {
  onQuickEnter?: (currency: "ETB" | "USD", price: number, pool: number) => void;
  siteSettings?: CMSSiteSettings | null;
}

export function CinematicStadiumHero({ onQuickEnter, siteSettings }: CinematicStadiumHeroProps) {
  const [selectedCurrency, setSelectedCurrency] = useState<"ETB" | "USD">("ETB");
  const [selectedPrice, setSelectedPrice] = useState<number>(100);
  const [selectedPool, setSelectedPool] = useState<number>(1000);

  const isUSD = selectedCurrency === "USD";

  const priceOptions = isUSD
    ? siteSettings?.usdPrices && siteSettings.usdPrices.length > 0
      ? siteSettings.usdPrices.filter((p) => p.isEnabled !== false).map((p) => p.value)
      : [25, 50, 100, 250]
    : siteSettings?.etbPrices && siteSettings.etbPrices.length > 0
    ? siteSettings.etbPrices.filter((p) => p.isEnabled !== false).map((p) => p.value)
    : [100, 200, 500, 1000];

  const poolOptions =
    siteSettings?.poolSizes && siteSettings.poolSizes.length > 0
      ? siteSettings.poolSizes
          .filter((p) => p.isEnabled !== false)
          .map((p) => ({
            size: p.size,
            label: p.label || (p.size >= 1000 ? `${p.size / 1000}K` : `${p.size}`),
          }))
      : [
          { size: 1000, label: "1,000 (1K)" },
          { size: 2000, label: "2,000 (2K)" },
          { size: 3000, label: "3,000 (3K)" },
          { size: 5000, label: "5,000 (5K)" },
        ];

  const handleCurrencyChange = (curr: "ETB" | "USD") => {
    setSelectedCurrency(curr);
    const available = curr === "USD"
      ? siteSettings?.usdPrices && siteSettings.usdPrices.length > 0
        ? siteSettings.usdPrices.filter((p) => p.isEnabled !== false).map((p) => p.value)
        : [25, 50, 100, 250]
      : siteSettings?.etbPrices && siteSettings.etbPrices.length > 0
      ? siteSettings.etbPrices.filter((p) => p.isEnabled !== false).map((p) => p.value)
      : [100, 200, 500, 1000];
    setSelectedPrice(available[0] || (curr === "USD" ? 50 : 100));
  };

  const handleActionClick = () => {
    if (onQuickEnter) {
      onQuickEnter(selectedCurrency, selectedPrice, selectedPool);
      return;
    }
    const el = document.getElementById("choose-ticket");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      style={{
        position: "relative",
        minHeight: "88vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: "transparent",
        overflow: "hidden",
        color: "#FFFFFF",
        paddingBottom: "clamp(32px, 6vw, 64px)",
      }}
    >
      {/* ── 1. Gradient Highlights Over Fixed Background ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.55) 0%, rgba(15, 23, 42, 0.25) 45%, rgba(15, 23, 42, 0.65) 100%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 40%, rgba(234, 179, 8, 0.16) 0%, transparent 65%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ── 2. Interactive 3D Canvas Floating Particles ── */}
      <FloatingParticlesCanvas />

      {/* ── 3. Main Hero Two-Column Content (Left Hero Text · Right Floating Card) ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1220,
          width: "100%",
          margin: "0 auto",
          padding: "clamp(48px, 8vw, 84px) clamp(16px, 3.5vw, 32px) clamp(24px, 4vw, 40px)",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "clamp(28px, 4.5vw, 56px)",
          alignItems: "center",
        }}
      >
        {/* Left Side: Headline & Mission */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Trust Pill */}
          <div style={{ display: "inline-flex" }}>
            <span
              style={{
                background: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid #FDE047",
                padding: "6px 14px",
                borderRadius: "30px",
                fontSize: "0.8125rem",
                fontWeight: 800,
                color: "#FEF08A",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(234, 179, 8, 0.3)",
              }}
            >
              <ShieldCheck size={15} color="#FACC15" /> 100% Live Video Draws · Audited Broadcast
            </span>
          </div>

          {/* Huge Main Headline */}
          <h1
            className="display"
            style={{
              fontSize: "clamp(2.4rem, 5.2vw, 4rem)",
              fontWeight: 900,
              lineHeight: 1.06,
              color: "#FFFFFF",
              letterSpacing: "-0.8px",
              margin: 0,
              textShadow: "0 2px 20px rgba(0, 0, 0, 0.8)",
            }}
          >
            Win Ethiopia&apos;s Biggest Live Digital Jackpot
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              lineHeight: 1.6,
              color: "#F8FAFC",
              margin: 0,
              maxWidth: 540,
              textShadow: "0 1px 8px rgba(0,0,0,0.8)",
            }}
          >
            Pick your lucky number, choose your pool capacity, and watch our company founders draw the 10 winning numbers live on video with 100% transparent payouts.
          </p>
        </div>

        {/* Right Side: Floating Translucent Glass Feature Card */}
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <div
            style={{
              width: "100%",
              maxWidth: 420,
              background: "rgba(15, 23, 42, 0.58)",
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
              borderRadius: "24px",
              border: "2px solid rgba(253, 224, 71, 0.75)",
              padding: "24px 22px",
              boxShadow:
                "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(254, 240, 138, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              boxSizing: "border-box",
            }}
          >
            {/* Top Gold Badge */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "12px",
                  background: "rgba(254, 240, 138, 0.2)",
                  border: "1.5px solid #FDE047",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  boxShadow: "0 2px 8px rgba(234, 179, 8, 0.25)",
                }}
              >
                <Trophy size={20} color="#FDE047" />
              </div>
              <div>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 900,
                    color: "#FEF08A",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                    display: "block",
                  }}
                >
                  10 GUARANTEED WINNERS
                </span>
                <span style={{ fontSize: "0.75rem", color: "#E2E8F0", fontWeight: 700 }}>
                  High Winning Odds (1 in 100)
                </span>
              </div>
            </div>

            {/* Feature Text */}
            <h3
              className="display"
              style={{
                fontSize: "1.35rem",
                fontWeight: 900,
                color: "#FFFFFF",
                lineHeight: 1.25,
                margin: 0,
                textShadow: "0 2px 8px rgba(0,0,0,0.6)",
              }}
            >
              100% Guaranteed Cash Payouts In Every Single Pool
            </h3>

            <p style={{ fontSize: "0.8125rem", color: "#CBD5E1", lineHeight: 1.5, margin: 0 }}>
              No endless rollover delays. Every single draw pays out 10 distinct cash ranks live on video within 30 minutes.
            </p>

            {/* Action Button: Signature Casino Red */}
            <button
              type="button"
              onClick={handleActionClick}
              className="casino-btn-red"
              style={{
                padding: "13px 22px",
                borderRadius: "30px",
                fontSize: "0.9375rem",
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: "0 6px 18px rgba(220, 38, 38, 0.45)",
                width: "100%",
                boxSizing: "border-box",
              }}
            >
              <span>Explore Live Pools</span>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "rgba(255, 255, 255, 0.25)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ArrowUpRight size={16} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── 4. Bottom Overlapping Translucent Glass Quick-Tier Bar ── */}
      <div
        style={{
          position: "relative",
          zIndex: 20,
          maxWidth: 1220,
          width: "100%",
          margin: "0 auto",
          padding: "0 clamp(16px, 3.5vw, 32px)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.58)",
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
            borderRadius: "24px",
            border: "2px solid rgba(253, 224, 71, 0.75)",
            padding: "18px clamp(16px, 2.5vw, 24px)",
            boxShadow:
              "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(254, 240, 138, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
            color: "#FFFFFF",
          }}
        >
          {/* Header Label */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
            <Sparkles size={14} color="#FDE047" />
            <span
              style={{
                fontSize: "0.6875rem",
                fontWeight: 900,
                color: "#FEF08A",
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                textShadow: "0 1px 4px rgba(0,0,0,0.5)",
              }}
            >
              CHOOSE YOUR LUCKY TIER FAST
            </span>
          </div>

          {/* 4 Interactive Selector Slots + Action Button */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: 10,
              alignItems: "center",
            }}
          >
            {/* Slot 1: Currency Toggle */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid rgba(253, 224, 71, 0.45)",
                borderRadius: "12px",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}>
                CURRENCY
              </span>
              <div style={{ display: "flex", gap: 4, marginTop: 2 }}>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange("ETB")}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: !isUSD ? "1.5px solid #FDE047" : "1px solid rgba(255,255,255,0.15)",
                    background: !isUSD ? "#FEF08A" : "rgba(255, 255, 255, 0.08)",
                    color: !isUSD ? "#854D0E" : "#E2E8F0",
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: !isUSD ? "0 2px 6px rgba(234, 179, 8, 0.35)" : "none",
                  }}
                >
                  🇪🇹 ETB
                </button>
                <button
                  type="button"
                  onClick={() => handleCurrencyChange("USD")}
                  style={{
                    flex: 1,
                    padding: "4px 8px",
                    borderRadius: "6px",
                    border: isUSD ? "1.5px solid #93C5FD" : "1px solid rgba(255,255,255,0.15)",
                    background: isUSD ? "#EFF6FF" : "rgba(255, 255, 255, 0.08)",
                    color: isUSD ? "#1D4ED8" : "#E2E8F0",
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    boxShadow: isUSD ? "0 2px 6px rgba(29, 78, 216, 0.35)" : "none",
                  }}
                >
                  🇺🇸 USD
                </button>
              </div>
            </div>

            {/* Slot 2: Ticket Price */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid rgba(253, 224, 71, 0.45)",
                borderRadius: "12px",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}>
                TICKET PRICE
              </span>
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(Number(e.target.value))}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  outline: "none",
                  padding: "2px 0",
                }}
              >
                {priceOptions.map((p) => (
                  <option key={p} value={p} style={{ background: "#0F172A", color: "#FFFFFF" }}>
                    {isUSD ? `$${p} USD Entry` : `${p} ETB Fixed Price`}
                  </option>
                ))}
              </select>
            </div>

            {/* Slot 3: Pool Capacity */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid rgba(253, 224, 71, 0.45)",
                borderRadius: "12px",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}>
                POOL CAPACITY
              </span>
              <select
                value={selectedPool}
                onChange={(e) => setSelectedPool(Number(e.target.value))}
                style={{
                  background: "transparent",
                  border: "none",
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  outline: "none",
                  padding: "2px 0",
                }}
              >
                {poolOptions.map((p) => (
                  <option key={p.size} value={p.size} style={{ background: "#0F172A", color: "#FFFFFF" }}>
                    {p.label} People
                  </option>
                ))}
              </select>
            </div>

            {/* Slot 4: Guaranteed Odds Preview */}
            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid rgba(253, 224, 71, 0.45)",
                borderRadius: "12px",
                padding: "8px 12px",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              }}
            >
              <span style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}>
                WINNING ODDS
              </span>
              <span style={{ fontSize: "0.875rem", fontWeight: 900, color: "#FDE047" }}>
                1 in {selectedPool / 10} Odds · 10 Winners
              </span>
            </div>

            {/* Action CTA Button: Signature Casino Red */}
            <button
              type="button"
              onClick={handleActionClick}
              className="casino-btn-red"
              style={{
                fontSize: "0.9375rem",
                fontWeight: 900,
                padding: "14px 18px",
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                boxShadow: "0 6px 18px rgba(220, 38, 38, 0.45)",
                height: "100%",
                minHeight: 48,
              }}
            >
              <span>Check Pool & Enter</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
