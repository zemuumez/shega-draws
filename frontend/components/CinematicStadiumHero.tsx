"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Zap,
  Smartphone,
  ArrowRight,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { FloatingParticlesCanvas } from "./FloatingParticlesCanvas";
import { useLanguage } from "@/lib/i18n/LanguageContext";

import type { CMSSiteSettings } from "@/lib/sanity/queries";

interface CinematicStadiumHeroProps {
  onQuickEnter?: (currency: "ETB" | "USD", price: number, pool: number) => void;
  siteSettings?: CMSSiteSettings | null;
}

export function CinematicStadiumHero({ onQuickEnter, siteSettings }: CinematicStadiumHeroProps) {
  const { text, t, language, getLocalized } = useLanguage();
  const initialCurrency = siteSettings?.defaultCurrency === "USD" ? "USD" : "ETB";
  const [selectedCurrency, setSelectedCurrency] = useState<"ETB" | "USD">(initialCurrency);
  const [selectedPrice, setSelectedPrice] = useState<number>(initialCurrency === "USD" ? 50 : 100);
  const [selectedPool, setSelectedPool] = useState<number>(1000);

  // Sync with published CMS defaultCurrency when settings update
  React.useEffect(() => {
    if (siteSettings?.defaultCurrency) {
      const curr = siteSettings.defaultCurrency === "USD" ? "USD" : "ETB";
      setSelectedCurrency(curr);
      const available = curr === "USD"
        ? siteSettings.usdPrices && siteSettings.usdPrices.length > 0
          ? siteSettings.usdPrices.filter((p) => p.isEnabled !== false).map((p) => p.value)
          : [25, 50, 100, 250]
        : siteSettings.etbPrices && siteSettings.etbPrices.length > 0
        ? siteSettings.etbPrices.filter((p) => p.isEnabled !== false).map((p) => p.value)
        : [100, 200, 500, 1000];
      setSelectedPrice(available[0] || (curr === "USD" ? 50 : 100));
    }
  }, [siteSettings?.defaultCurrency]);

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

  const renderHeadline = () => {
    if (siteSettings?.tagline && getLocalized(siteSettings, "tagline", "")) {
      return getLocalized(siteSettings, "tagline", "");
    }
    if (language === "am") {
      return (
        <>
          <span>የሚቀጥለው </span>
          <span
            style={{
              background: "linear-gradient(135deg, #FFF08A 0%, #FDE047 40%, #F59E0B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "block",
            }}
          >
            ትልቅ ድልዎ
          </span>
          <span>ካሰቡት በላይ ቅርብ ነው</span>
        </>
      );
    }
    if (language === "ti") {
      return (
        <>
          <span>ዝቕጽል </span>
          <span
            style={{
              background: "linear-gradient(135deg, #FFF08A 0%, #FDE047 40%, #F59E0B 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              display: "block",
            }}
          >
            ዓቢ ዓወትኩም
          </span>
          <span>ካብ ዝሓሰብኩምዎ ንላዕሊ ቀረባ እዩ</span>
        </>
      );
    }
    return (
      <>
        <span>Your Next </span>
        <span
          style={{
            background: "linear-gradient(135deg, #FFF08A 0%, #FDE047 40%, #F59E0B 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "block",
          }}
        >
          Big Win Is Closer
        </span>
        <span>Than You Think</span>
      </>
    );
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
            "linear-gradient(90deg, rgba(10, 25, 47, 0.75) 0%, rgba(10, 25, 47, 0.45) 45%, rgba(10, 25, 47, 0.1) 75%, rgba(10, 25, 47, 0.5) 100%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 25% 45%, rgba(234, 179, 8, 0.18) 0%, transparent 60%)",
          zIndex: 0,
          pointerEvents: "none",
        }}
      />

      {/* ── 2. Interactive 3D Canvas Floating Particles ── */}
      <FloatingParticlesCanvas />

      {/* ── 3. Main Hero Content (Left-Aligned Hero Art & Typography, Clear Right Side for 3D Art) ── */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          maxWidth: 1240,
          width: "100%",
          margin: "0 auto",
          padding: "clamp(44px, 7vw, 76px) clamp(16px, 3.5vw, 32px) clamp(24px, 4vw, 40px)",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))",
          gap: "clamp(28px, 4.5vw, 56px)",
          alignItems: "center",
        }}
      >
        {/* Left Side: Eyebrow, Main Headline, Subtitle, Play Now CTA, and Trust Badges */}
        <div data-page-reveal style={{ display: "flex", flexDirection: "column", gap: "clamp(16px, 2.5vw, 24px)", maxWidth: 580 }}>
          {/* Eyebrow: PLAY • WIN • LIVE BIGGER */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              letterSpacing: "3.5px",
              fontSize: "clamp(0.75rem, 1.4vw, 0.875rem)",
              fontWeight: 900,
              color: "#FDE047",
              textTransform: "uppercase",
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
            }}
          >
            <span>{language === "ti" ? "ተጻወቱ" : language === "am" ? "ይጫወቱ" : "PLAY"}</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#FDE047", opacity: 0.85 }} />
            <span>{language === "ti" ? "ተዓወቱ" : language === "am" ? "ያሸንፉ" : "WIN"}</span>
            <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#FDE047", opacity: 0.85 }} />
            <span>{language === "ti" ? "ህይወትኩም ኣዕብዩ" : language === "am" ? "ህይወትዎን ያሳድጉ" : "LIVE BIGGER"}</span>
          </div>

          {/* Huge Main Headline */}
          <h1
            className="display"
            style={{
              fontSize: "clamp(2.5rem, 5.5vw, 4.2rem)",
              fontWeight: 900,
              lineHeight: 1.08,
              color: "#FFFFFF",
              letterSpacing: "-0.6px",
              margin: 0,
              textShadow: "0 4px 24px rgba(0, 0, 0, 0.9)",
            }}
          >
            {renderHeadline()}
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(0.95rem, 1.8vw, 1.125rem)",
              lineHeight: 1.6,
              color: "#E2E8F0",
              margin: 0,
              maxWidth: 500,
              textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
            }}
          >
            {language === "ti"
              ? "ወግዓዊ ናይ ዲጂታል ሎተሪ ጸወታታት ኣብ ዝኾነ ግዜን ቦታን ተጻወቱ። ውሑስ፣ ቀሊልን ዕድል ዝመልኦን እዩ።"
              : language === "am"
              ? "ኦፊሴላዊ የዲጂታል ሎተሪ ጨዋታዎችን በማንኛውም ጊዜ እና ቦታ ይጫወቱ። ደህንነቱ የተጠበቀ፣ ቀላል እና በዕድል የተሞላ ነው።"
              : (t.hero?.subtitle || "Play official digital lottery games anytime, anywhere. It's safe, simple, and full of opportunity.")}
          </p>

          {/* Play Now Signature Gold Pill CTA Button */}
          <div style={{ paddingTop: 4 }}>
            <button
              type="button"
              onClick={handleActionClick}
              style={{
                background: "linear-gradient(135deg, #FFF08A 0%, #FDE047 35%, #F59E0B 80%, #D97706 100%)",
                border: "none",
                borderRadius: "9999px",
                padding: "6px 8px 6px 26px",
                color: "#111827",
                fontWeight: 900,
                fontSize: "clamp(1.05rem, 2vw, 1.18rem)",
                display: "inline-flex",
                alignItems: "center",
                gap: 16,
                cursor: "pointer",
                boxShadow: "0 8px 28px rgba(245, 158, 11, 0.45), 0 2px 8px rgba(0, 0, 0, 0.4)",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow = "0 12px 32px rgba(245, 158, 11, 0.6), 0 4px 12px rgba(0, 0, 0, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow = "0 8px 28px rgba(245, 158, 11, 0.45), 0 2px 8px rgba(0, 0, 0, 0.4)";
              }}
            >
              <span>{language === "ti" ? "ሕጂ ተጻወቱ" : language === "am" ? "አሁን ይጫወቱ" : "Play Now"}</span>
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  background: "#0F172A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <ArrowRight size={20} color="#FFFFFF" strokeWidth={2.5} />
              </div>
            </button>
          </div>

          {/* 3 Trust Badges: Secure & Trusted · Fast & Easy · Play Anywhere */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(18px, 3.5vw, 36px)",
              flexWrap: "wrap",
              marginTop: 6,
              paddingTop: 8,
            }}
          >
            {/* Badge 1: Secure & Trusted */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldCheck size={28} color="#FFFFFF" strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#FFFFFF" }}>
                  {language === "ti" ? "ውሑስ" : language === "am" ? "አስተማማኝ" : "Secure"}
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#CBD5E1" }}>
                  {language === "ti" ? "& ዝተኣመነ" : language === "am" ? "& የታመነ" : "& Trusted"}
                </span>
              </div>
            </div>

            {/* Badge 2: Fast & Easy */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Zap size={28} color="#FFFFFF" strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#FFFFFF" }}>
                  {language === "ti" ? "ቅልጡፍ" : language === "am" ? "ፈጣን" : "Fast"}
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#CBD5E1" }}>
                  {language === "ti" ? "& ቀሊል" : language === "am" ? "& ቀላል" : "& Easy"}
                </span>
              </div>
            </div>

            {/* Badge 3: Play Anywhere */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Smartphone size={28} color="#FFFFFF" strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
                <span style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#FFFFFF" }}>
                  {language === "ti" ? "ተጻወቱ" : language === "am" ? "ይጫወቱ" : "Play"}
                </span>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#CBD5E1" }}>
                  {language === "ti" ? "ኣብ ዝኾነ ቦታ" : language === "am" ? "በማንኛውም ቦታ" : "Anywhere"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Open transparent space so 3D background art (phone, balls, tickets, coins) shines through */}
        <div style={{ minHeight: "100px", pointerEvents: "none" }} />
      </div>

      {/* ── 4. Bottom Overlapping Translucent Glass Quick-Tier Bar ── */}
      <div data-page-reveal
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
            > {text("CHOOSE YOUR LUCKY TIER FAST")} </span>
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
              <span style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}> {text("CURRENCY")} </span>
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
              <span style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}> {text("TICKET PRICE")} </span>
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
              <span style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}> {text("POOL CAPACITY")} </span>
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
                    {p.label} {text("People")} </option>
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
              <span style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase" }}> {text("WINNING ODDS")} </span>
              <span style={{ fontSize: "0.875rem", fontWeight: 900, color: "#FDE047" }}> {text("1 in")} {selectedPool / 10} {text("Odds · 10 Winners")} </span>
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
              <span>{t.hero.enterCta || "Check Pool & Enter"}</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
