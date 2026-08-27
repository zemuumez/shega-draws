"use client";

import React from "react";
import { Trophy, Users, Sparkles, Award } from "lucide-react";

export function PrizeSpotlight() {
  const tiers = [
    {
      size: "5,000 People (5K)",
      price: "200 ETB Ticket",
      jackpot: "400,000 ETB",
      totalPool: "1,200,000 ETB",
      subtitle: "🥇 1st Place: 400k · 🥈 2nd Place: 250k · 🥉 3rd Place: 150k",
      desc: "Our flagship Mega Jackpot pool for 5,000 players. 10 Guaranteed Winners split over 1.2 Million ETB.",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      accent: "var(--blue-royal)",
    },
    {
      size: "3,000 People (3K)",
      price: "150 ETB Ticket",
      jackpot: "180,000 ETB",
      totalPool: "600,000 ETB",
      subtitle: "🥇 1st Place: 180k · 🥈 2nd Place: 120k · 🥉 3rd Place: 80k",
      desc: "Premier pool for 3,000 players with 10 tiered cash rewards transferred directly to verified winners.",
      bg: "#FEF9C3",
      border: "#FDE047",
      accent: "var(--gold-deep)",
    },
    {
      size: "2,000 People (2K)",
      price: "100 ETB Ticket",
      jackpot: "80,000 ETB",
      totalPool: "300,000 ETB",
      subtitle: "🥇 1st Place: 80k · 🥈 2nd Place: 65k · 🥉 3rd Place: 40k",
      desc: "Classic Community pool for 2,000 players with 10 guaranteed winners sharing 300,000 ETB.",
      bg: "#EFF6FF",
      border: "#BFDBFE",
      accent: "var(--blue-navy)",
    },
    {
      size: "1,000 People (1K)",
      price: "50 ETB Ticket",
      jackpot: "35,000 ETB",
      totalPool: "100,000 ETB",
      subtitle: "🥇 1st Place: 35k · 🥈 2nd Place: 20k · 🥉 3rd Place: 15k",
      desc: "Rapid Starter booster pool for 1,000 players with 10 winners sharing 100,000 ETB.",
      bg: "#FEF9C3",
      border: "#FDE047",
      accent: "var(--gold-deep)",
    }
  ];

  return (
    <section style={{ margin: "48px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="badge badge-gold" style={{ marginBottom: 8 }}>
          <Sparkles size={12} /> Guaranteed Top 10 Winners
        </div>
        <h2 className="display" style={{ fontSize: "clamp(1.375rem, 3.5vw, 2.125rem)", color: "var(--blue-navy)", maxWidth: 640, margin: "0 auto 8px", fontWeight: 800 }}>
          Pick Your Pool Size & Win Big
        </h2>
        <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
          Every pool has a set number of tickets (1K, 2K, 3K, or 5K) and 10 guaranteed cash payouts.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {tiers.map((tier, idx) => {
          return (
            <div
              key={idx}
              className="card-base"
              style={{
                padding: "24px 22px",
                position: "relative",
                background: "#FFFFFF",
                border: `1.5px solid ${tier.border}`,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span className="badge badge-blue" style={{ fontSize: "0.75rem", fontWeight: 800 }}>
                  <Users size={12} /> {tier.size}
                </span>
                <span className="mono" style={{ fontSize: "0.75rem", color: "var(--gold-deep)", fontWeight: 800, background: "#FEF9C3", padding: "3px 8px", borderRadius: 6 }}>
                  {tier.price}
                </span>
              </div>

              <div style={{ marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block", fontWeight: 700 }}>
                  1ST PLACE JACKPOT
                </span>
                <div className="display" style={{ fontSize: "1.625rem", color: tier.accent, fontWeight: 800, lineHeight: 1.1 }}>
                  {tier.jackpot}
                </div>
              </div>

              <p className="mono" style={{ color: "var(--blue-navy)", fontSize: "0.75rem", fontWeight: 700, marginBottom: 8, background: tier.bg, padding: "6px 8px", borderRadius: 6 }}>
                {tier.subtitle}
              </p>

              <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.5 }}>
                {tier.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
