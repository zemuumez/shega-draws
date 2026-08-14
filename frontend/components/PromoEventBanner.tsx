"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Tag, Megaphone, Flame } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CMSPromotion } from "@/lib/sanity/queries";

interface PromoEventBannerProps {
  promotions?: CMSPromotion[];
}

const DEFAULT_PROMOTIONS: CMSPromotion[] = [
  {
    _id: "promo-enkutatash-2026",
    badge: "Holiday Grand Jackpot",
    badgeAm: "የበዓል ልዩ ታላቅ ጃክፖት",
    badgeOm: "Jaakpootii Ayyaana Addaa",
    title: "Enkutatash Golden New Year Bonanza — 2x Suzuki Dzires Added!",
    titleAm: "የእንቁጣጣሽ አዲስ ዓመት ልዩ ድግስ — 2 አዳዲስ ሱዙኪ ድዛይር መኪናዎች ተካተዋል!",
    titleOm: "Ayyaana Enkuxaaxashii Waggaa Haaraa — Konkolaataan 2 Dabalamaniiru!",
    description: "Enter any draw this week and receive automatic free ticket entry into the Holiday Golden Vault. Guaranteed 10 Extra Gold Coin Winners.",
    descriptionAm: "በዚህ ሳምንት በማንኛውም እጣ ሲሳተፉ ለበዓሉ ልዩ የወርቅ ሳንቲም እጣ በነጻ የቲኬት ማለፊያ ያገኛሉ። 10 ተጨማሪ የወርቅ ሳንቲም አሸናፊዎች!",
    descriptionOm: "Torbee kana carraa kamiyyuu yoo bitattan tikkeettii bilisaa Jaakpootii Ayyaanaa ni argattu. Mo'attoota warqee dabalataa 10.",
    ctaText: "Explore Holiday Draw",
    ctaLink: "#draws-catalog",
    sponsorName: "Telebirr Official Partner Special",
    highlightColor: "#D4AF37",
    isSponsored: true,
  },
  {
    _id: "promo-telebirr-cashback",
    badge: "Payment Deal · 0% Service Fee",
    badgeAm: "የክፍያ ቅናሽ · 0% የአገልግሎት ክፍያ",
    badgeOm: "Gurgurtaa Kaffaltii · 0% Kaffaltii Tajaajilaa",
    title: "Zero-Fee Telebirr Direct Checkout + Instant 50 ETB Reward",
    titleAm: "በቴሌብር ያለ ምንም ተጨማሪ ክፍያ ይክፈሉ + የ50 ብር ፈጣን የቦነስ ስጦታ",
    titleOm: "Telebirr dhaan kaffaltii tajaajilaa malee kaffalaa + Qarshii 50 badhaasa",
    description: "Pay for 3 or more tickets in a single checkout to claim instant 15% cashback credited back to your registered mobile wallet.",
    descriptionAm: "በአንድ ጊዜ 3 ወይም ከዚያ በላይ ቲኬቶችን ሲገዙ የ15% ተመላሽ ክፍያ በስልክ ቁጥርዎ ይላክልዎታል።",
    descriptionOm: "Yeroo tokkotti tikkeettii 3 fi isaa ol yoo bitattan qarshii 15% gara herrega keessaniitti ni deebi'a.",
    ctaText: "Get 3 Tickets",
    ctaLink: "/enter",
    sponsorName: "FinTech Sponsor",
    highlightColor: "#2BB694",
    isSponsored: false,
  }
];

export function PromoEventBanner({ promotions = DEFAULT_PROMOTIONS }: PromoEventBannerProps) {
  const { language, t } = useLanguage();
  const [activeIndex, setActiveIndex] = useState(0);

  const activePromo = promotions[activeIndex] || DEFAULT_PROMOTIONS[0];

  const localizedBadge = language === "am" ? (activePromo.badgeAm || activePromo.badge) : language === "om" ? (activePromo.badgeOm || activePromo.badge) : activePromo.badge;
  const localizedTitle = language === "am" ? (activePromo.titleAm || activePromo.title) : language === "om" ? (activePromo.titleOm || activePromo.title) : activePromo.title;
  const localizedDesc = language === "am" ? (activePromo.descriptionAm || activePromo.description) : language === "om" ? (activePromo.descriptionOm || activePromo.description) : activePromo.description;

  return (
    <div style={{ margin: "24px 0 36px" }}>
      {/* Featured Header & Tab Toggles */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Flame size={18} color="var(--rust-soft)" />
          <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gold-soft)", letterSpacing: "1px", textTransform: "uppercase" }}>
            {t.promo.badge}
          </span>
        </div>

        {promotions.length > 1 && (
          <div style={{ display: "flex", gap: 6 }}>
            {promotions.map((p, idx) => (
              <button
                key={p._id}
                onClick={() => setActiveIndex(idx)}
                style={{
                  background: activeIndex === idx ? "var(--gold)" : "rgba(255, 255, 255, 0.08)",
                  border: "none",
                  width: activeIndex === idx ? 24 : 8,
                  height: 8,
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                aria-label={`Show event ${idx + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Main Promo Showcase Card */}
      <div
        className="card-base animate-fade"
        style={{
          padding: "24px 28px",
          background: "linear-gradient(135deg, rgba(22, 31, 42, 0.95) 0%, rgba(14, 20, 27, 0.95) 100%)",
          border: `1.5px solid ${activePromo.highlightColor ? activePromo.highlightColor + "55" : "rgba(212, 175, 55, 0.35)"}`,
          borderRadius: "var(--radius-lg)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow backdrop accent */}
        <div
          style={{
            position: "absolute",
            top: -40,
            right: -40,
            width: 180,
            height: 180,
            background: activePromo.highlightColor ? `${activePromo.highlightColor}22` : "rgba(212, 175, 55, 0.15)",
            borderRadius: "50%",
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 20, position: "relative", zIndex: 2 }}>
          <div style={{ maxWidth: 650 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <span
                className="badge"
                style={{
                  background: activePromo.highlightColor ? `${activePromo.highlightColor}22` : "rgba(212, 175, 55, 0.18)",
                  color: activePromo.highlightColor || "var(--gold)",
                  border: `1px solid ${activePromo.highlightColor ? activePromo.highlightColor + "66" : "rgba(212, 175, 55, 0.4)"}`,
                }}
              >
                <Sparkles size={11} /> {localizedBadge}
              </span>

              {activePromo.sponsorName && (
                <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gray)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Megaphone size={11} /> {activePromo.sponsorName}
                </span>
              )}
            </div>

            <h3 className="display" style={{ fontSize: "clamp(1.1875rem, 3vw, 1.4375rem)", color: "var(--paper)", lineHeight: 1.25, marginBottom: 8 }}>
              {localizedTitle}
            </h3>

            <p style={{ color: "var(--paper-muted)", fontSize: "0.875rem", lineHeight: 1.6, maxWidth: 580 }}>
              {localizedDesc}
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
            <Link
              href={activePromo.ctaLink}
              className="btn-base btn-primary"
              style={{
                background: activePromo.highlightColor || "var(--gold)",
                color: "var(--ink-deep)",
                padding: "11px 20px",
                fontSize: "0.875rem",
              }}
            >
              {activePromo.ctaText} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
