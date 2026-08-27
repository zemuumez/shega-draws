"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Flame, Megaphone } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CMSPromotion } from "@/lib/sanity/queries";

interface PromoEventBannerProps {
  promotions?: CMSPromotion[];
}

const DEFAULT_PROMOTIONS: CMSPromotion[] = [
  {
    _id: "promo-mega-5k",
    badge: "5,000 People Pool · 1,200,000 ETB Mega Jackpot",
    badgeAm: "የ5,000 ሰዎች እጣ · 1,200,000 ብር ሜጋ ጃክፖት",
    badgeOm: "Carraa Namoota 5,000 · Jaakpootii Qarshii 1,200,000",
    title: "5K Mega Raffle — 400,000 ETB 1st Place & 10 Guaranteed Winners!",
    titleAm: "የ5ሺህ ሰዎች ሜጋ እጣ — 1ኛ ለወጣው 400,000 ብር እና ለ10 አሸናፊዎች የተዘጋጀ!",
    titleOm: "Carraa Meegaa 5K — Sadarkaa 1ffaaf Qarshii 400,000 fi Mo'attoota 10f!",
    description: "Choose 1K, 2K, 3K, or 5K people pool sizes. 100% provably fair with SHA-256 cryptographic verification.",
    descriptionAm: "የ1ሺህ፣ 2ሺህ፣ 3ሺህ ወይም 5ሺህ ሰዎችን ገደብ ይምረጡ። በSHA-256 የተረጋገጠ ፍጹም ፍትሃዊ እጣ።",
    descriptionOm: "Daangaa namoota 1K, 2K, 3K ykn 5K filadhaa. SHA-256 dhaan kan mirkanaa'e.",
    ctaText: "Choose Pool & Enter",
    ctaLink: "/enter?size=5000",
    sponsorName: "Official Mega Pool",
    highlightColor: "#EAB308",
    isSponsored: true,
  },
  {
    _id: "promo-promo-code",
    badge: "Use Promo Code",
    badgeAm: "የፕሮሞ ኮድ ይጠቀሙ",
    badgeOm: "Koodii Proomoo Fayyadamaa",
    title: "Enter Code 'PRIMEDRAW2026' for Free Extra Verified Entry Points!",
    titleAm: "በ'PRIMEDRAW2026' ኮድ ተጨማሪ የተረጋገጡ የነጥብ እድሎችን ያግኙ!",
    titleOm: "Koodii 'PRIMEDRAW2026' fayyadamuun carraa dabalataa argadhaa!",
    description: "Enter promo codes at checkout in Step 1 (optional). Instant Telebirr and CBE Birr verification.",
    descriptionAm: "በመጀመሪያው ደረጃ ላይ የፕሮሞ ኮድዎን በማስገባት በቴሌብር ወይም በሲቢኢ ብር ክፍያዎን ያጠናቁ።",
    descriptionOm: "Tarkaanfii 1ffaa irratti koodii proomoo galchaa, Telebirr ykn CBE Birr dhaan kaffalaa.",
    ctaText: "Enter with Promo",
    ctaLink: "/enter",
    sponsorName: "Special Promo",
    highlightColor: "#2563EB",
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
    <div style={{ margin: "20px 0 32px" }}>
      {/* Featured Header & Tab Toggles */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Flame size={18} color="var(--gold-dark)" />
          <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--blue-navy)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
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
                  background: activeIndex === idx ? "var(--blue-royal)" : "#CBD5E1",
                  border: "none",
                  width: activeIndex === idx ? 22 : 8,
                  height: 8,
                  borderRadius: 4,
                  cursor: "pointer",
                  transition: "all var(--transition-fast)",
                }}
                aria-label={`Show promo ${idx + 1}`}
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
          background: "linear-gradient(135deg, #FEF9C3 0%, #EFF6FF 100%)",
          border: "1.5px solid #FDE047",
          borderRadius: "var(--radius-lg)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div style={{ maxWidth: 640 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <span className="badge badge-gold">
                <Sparkles size={12} /> {localizedBadge}
              </span>

              {activePromo.sponsorName && (
                <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--blue-navy)", display: "inline-flex", alignItems: "center", gap: 4, fontWeight: 700 }}>
                  <Megaphone size={12} color="var(--blue-royal)" /> {activePromo.sponsorName}
                </span>
              )}
            </div>

            <h3 className="display" style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)", color: "var(--blue-navy)", lineHeight: 1.25, marginBottom: 6, fontWeight: 800 }}>
              {localizedTitle}
            </h3>

            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.55 }}>
              {localizedDesc}
            </p>
          </div>

          <div>
            <Link
              href={activePromo.ctaLink}
              className="btn-base btn-primary"
              style={{ fontSize: "0.875rem", padding: "11px 22px" }}
            >
              {activePromo.ctaText} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
