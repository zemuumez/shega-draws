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
    _id: "promo-enkutatash-2026",
    badge: "Special Event · 300,000 ETB Jackpot",
    badgeAm: "የበዓል ልዩ እጣ · 300,000 ብር ጃክፖት",
    badgeOm: "Qophii Addaa · Jaakpootii Qarshii 300,000",
    title: "100 Birr Fixed Ticket Event — 10 Guaranteed Cash Winners!",
    titleAm: "የ100 ብር እጣ — ለ10 እድለኞች 300,000 ብር የተዘጋጀ ሽልማት!",
    titleOm: "Carraa Tikkeettii Qarshii 100 — Mo'attoota 10f Qarshii 300,000!",
    description: "Limited to 2,000 verified ticket holders. 1st place gets 80,000 ETB, 2nd gets 65,000 ETB, and 3rd to 10th win tiered cash payouts.",
    descriptionAm: "ለ2,000 ተሳታፊዎች ብቻ የተወሰነ። 1ኛ የወጣው 80,000 ብር፣ 2ኛ 65,000 ብር፣ ከ3ኛ እስከ 10ኛ የወጡትም ከፍተኛ የገንዘብ ሽልማት ያገኛሉ።",
    descriptionOm: "Hirmaattota 2,000 qofaaf. Sadarkaan 1ffaa Qarshii 80,000, 2ffaan Qarshii 65,000, fi 3ffaa hanga 10ffaan badhaasa qarshii argatu.",
    ctaText: "Buy Ticket (100 ETB)",
    ctaLink: "/enter",
    sponsorName: "Telebirr Official Partner",
    highlightColor: "#D97706",
    isSponsored: true,
  },
  {
    _id: "promo-telebirr-cashback",
    badge: "Zero Fee Payment",
    badgeAm: "ያለ ምንም ተጨማሪ ክፍያ",
    badgeOm: "Kaffaltii Tajaajilaa Malee",
    title: "Direct Telebirr & CBE Birr Payment Checkout",
    titleAm: "በቴሌብር እና በሲቢኢ ብር በቀጥታ ይክፈሉ",
    titleOm: "Telebirr fi CBE Birr dhaan kallattiin kaffalaa",
    description: "Simple mobile transfer with immediate receipt verification and ticket confirmation.",
    descriptionAm: "በቀላሉ በስልክዎ ከፍለው ደረሰኝ በማስገባት የተረጋገጠ የሎተሪ ቲኬትዎን ይያዙ።",
    descriptionOm: "Salphaatti kaffaltii xumurtanii nagahee galchuun tikkeettii keessan mirkaneeffadhaa.",
    ctaText: "Get Ticket Now",
    ctaLink: "/enter",
    sponsorName: "Fast Verification",
    highlightColor: "#059669",
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
          <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gold-dark)", letterSpacing: "0.5px", textTransform: "uppercase" }}>
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
                  background: activeIndex === idx ? "var(--gold)" : "#CBD5E1",
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
          background: "linear-gradient(135deg, #FFFBEB 0%, #FFFFFF 100%)",
          border: "1.5px solid #FDE68A",
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
                <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                  <Megaphone size={12} color="var(--gold-dark)" /> {activePromo.sponsorName}
                </span>
              )}
            </div>

            <h3 className="display" style={{ fontSize: "clamp(1.125rem, 2.5vw, 1.375rem)", color: "var(--text-main)", lineHeight: 1.25, marginBottom: 6 }}>
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
              style={{ fontSize: "0.875rem", padding: "10px 20px" }}
            >
              {activePromo.ctaText} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
