"use client";

import React from "react";
import { Trophy, Home, Car, Coins, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function PrizeSpotlight() {
  const { t } = useLanguage();

  const tiers = [
    {
      rank: 1,
      tierBadge: t.prizes.tierGrand,
      title: "G+2 Luxury Villa (CMC, Addis Ababa)",
      value: "22,500,000 ETB",
      desc: "Fully finished 4-bedroom villa with modern Italian kitchen, private master suite, solar backup, and 2-car garage.",
      icon: Home,
      glowColor: "var(--gold)",
    },
    {
      rank: 2,
      tierBadge: t.prizes.tierMajor,
      title: "2026 BYD Song Plus EV (Zero Km)",
      value: "4,800,000 ETB",
      desc: "Flagship luxury all-electric SUV with 605km range, panoramic sunroof, smart driving pilot, and home fast-charger included.",
      icon: Car,
      glowColor: "var(--teal-soft)",
    },
    {
      rank: 3,
      tierBadge: t.prizes.tierStandard,
      title: "1,500,000 ETB Direct Cash Transfer",
      value: "1,500,000 ETB",
      desc: "Instant, verified lump-sum transfer directly to your verified Commercial Bank of Ethiopia (CBE) or Telebirr account.",
      icon: Coins,
      glowColor: "var(--gold-soft)",
    }
  ];

  return (
    <section style={{ margin: "56px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div className="badge badge-gold" style={{ marginBottom: 8 }}>
          <Sparkles size={12} /> {t.prizes.title}
        </div>
        <h2 className="display" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", color: "var(--paper)", maxWidth: 620, margin: "0 auto 8px" }}>
          {t.prizes.subtitle}
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.rank}
              className="card-base"
              style={{
                padding: "28px 24px",
                position: "relative",
                overflow: "hidden",
                border: tier.rank === 1 ? "1.5px solid rgba(212, 175, 55, 0.45)" : "1px solid var(--gray-line)",
                background: tier.rank === 1 ? "linear-gradient(145deg, rgba(22, 31, 42, 0.95) 0%, rgba(26, 20, 10, 0.95) 100%)" : "var(--ink-card)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: "var(--radius-md)",
                    background: `${tier.glowColor}18`,
                    border: `1px solid ${tier.glowColor}44`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={24} color={tier.glowColor} />
                </div>
                <span className="badge" style={{ background: `${tier.glowColor}22`, color: tier.glowColor, border: `1px solid ${tier.glowColor}44` }}>
                  {tier.tierBadge}
                </span>
              </div>

              <div className="mono" style={{ fontSize: "0.75rem", color: "var(--gray)", marginBottom: 4 }}>
                Rank #{tier.rank}
              </div>

              <h3 className="display" style={{ fontSize: "1.25rem", color: "var(--paper)", marginBottom: 8, lineHeight: 1.25 }}>
                {tier.title}
              </h3>

              <div className="mono" style={{ fontSize: "1.125rem", fontWeight: 700, color: "var(--gold)", marginBottom: 12 }}>
                {tier.value}
              </div>

              <p style={{ color: "var(--paper-muted)", fontSize: "0.8125rem", lineHeight: 1.55 }}>
                {tier.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
