"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dice5, Sparkles, ArrowRight, ShieldCheck, Check } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function QuickPickTester() {
  const { t } = useLanguage();
  const [selectedNum, setSelectedNum] = useState("07");
  const [isSpinning, setIsSpinning] = useState(false);

  const rollRandom = () => {
    setIsSpinning(true);
    let count = 0;
    const interval = setInterval(() => {
      const rand = String(Math.floor(Math.random() * 100)).padStart(2, "0");
      setSelectedNum(rand);
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setIsSpinning(false);
      }
    }, 50);
  };

  return (
    <section style={{ margin: "56px 0" }}>
      <div
        className="glass-card-gold"
        style={{
          padding: "36px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 32,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div style={{ maxWidth: 540 }}>
          <div className="badge badge-gold" style={{ marginBottom: 10 }}>
            <Sparkles size={12} /> {t.quickPick.title}
          </div>
          <h2 className="display" style={{ fontSize: "clamp(1.5rem, 3vw, 2rem)", color: "var(--paper)", lineHeight: 1.2, marginBottom: 12 }}>
            {t.quickPick.subtitle}
          </h2>
          <p style={{ color: "var(--paper-muted)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 20 }}>
            {t.quickPick.hint}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              onClick={rollRandom}
              disabled={isSpinning}
              className="btn-base btn-secondary"
              style={{ borderColor: "var(--gold)", color: "var(--gold-soft)" }}
            >
              <Dice5 size={18} className={isSpinning ? "animate-spin" : ""} />
              {t.quickPick.randomPick}
            </button>

            <Link
              href={`/enter?num=${selectedNum}`}
              className="btn-base btn-primary"
            >
              {t.quickPick.instantEnter} #{selectedNum} <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {/* Tactile Big Number Ball Display */}
        <div style={{ textAlign: "center", minWidth: 220, margin: "0 auto" }}>
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, rgba(212, 175, 55, 0.4) 0%, var(--ink-deep) 85%)",
              border: "3px solid var(--gold)",
              boxShadow: "0 0 35px rgba(212, 175, 55, 0.35), inset 0 2px 10px rgba(255, 255, 255, 0.3)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 14px",
              transition: "transform var(--transition-fast)",
              transform: isSpinning ? "scale(1.08) rotate(10deg)" : "scale(1)",
            }}
          >
            <span
              className="display"
              style={{
                fontSize: "3.75rem",
                fontWeight: 800,
                color: "var(--gold-light)",
                lineHeight: 1,
                textShadow: "0 2px 10px rgba(0,0,0,0.6)",
              }}
            >
              {selectedNum}
            </span>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--teal-soft)", fontSize: "0.8125rem", fontWeight: 600 }}>
            <Check size={14} /> {t.quickPick.available}
          </div>
        </div>
      </div>
    </section>
  );
}
