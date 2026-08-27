"use client";

import React from "react";
import { Trophy, Coins, Sparkles, Award } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function PrizeSpotlight() {
  const { t } = useLanguage();

  const tiers = [
    {
      rank: 1,
      tierBadge: "🥇 1st Place Jackpot",
      title: "80,000 ETB Cash Reward",
      value: "80,000 ETB",
      desc: "Instant, verified lump-sum payout transferred directly to your Telebirr or Commercial Bank of Ethiopia (CBE) account within 2 hours.",
      glowColor: "var(--gold-dark)",
      bg: "#FEF3C7",
      border: "#FDE68A",
    },
    {
      rank: 2,
      tierBadge: "🥈 2nd Place Prize",
      title: "65,000 ETB Cash Reward",
      value: "65,000 ETB",
      desc: "Guaranteed second place winner payout transferred directly with zero deductions or service fees.",
      glowColor: "#0F172A",
      bg: "#F1F5F9",
      border: "#CBD5E1",
    },
    {
      rank: 3,
      tierBadge: "🥉 3rd Place Prize",
      title: "40,000 ETB Cash Reward",
      value: "40,000 ETB",
      desc: "Guaranteed third place prize transfer credited immediately upon cryptographic seed reveal.",
      glowColor: "var(--teal-dark)",
      bg: "#D1FAE5",
      border: "#A7F3D0",
    }
  ];

  return (
    <section style={{ margin: "48px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="badge badge-gold" style={{ marginBottom: 8 }}>
          <Sparkles size={12} /> Top Winner Prizes
        </div>
        <h2 className="display" style={{ fontSize: "clamp(1.375rem, 3.5vw, 2.125rem)", color: "var(--text-main)", maxWidth: 620, margin: "0 auto 8px" }}>
          10 Guaranteed Winners in Every 100 Birr Draw
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 18 }}>
        {tiers.map((tier) => {
          return (
            <div
              key={tier.rank}
              className="card-base"
              style={{
                padding: "26px 24px",
                position: "relative",
                background: "#FFFFFF",
                border: `1.5px solid ${tier.border}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <span className="badge" style={{ background: tier.bg, color: tier.glowColor, border: `1px solid ${tier.border}` }}>
                  {tier.tierBadge}
                </span>
                <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontWeight: 700 }}>
                  Rank #{tier.rank}
                </span>
              </div>

              <h3 className="display" style={{ fontSize: "1.25rem", color: "var(--text-main)", marginBottom: 6, lineHeight: 1.25 }}>
                {tier.title}
              </h3>

              <div className="mono" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--gold-dark)", marginBottom: 10 }}>
                {tier.value}
              </div>

              <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.55 }}>
                {tier.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
