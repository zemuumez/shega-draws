"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Dice5, Sparkles, ArrowRight, Check } from "lucide-react";
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
    <section style={{ margin: "48px 0" }}>
      <div
        className="card-base"
        style={{
          padding: "36px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 32,
          background: "linear-gradient(135deg, #FEF9C3 0%, #EFF6FF 100%)",
          border: "1.5px solid #FDE047",
        }}
      >
        <div style={{ maxWidth: 540 }}>
          <div className="badge badge-gold" style={{ marginBottom: 10 }}>
            <Sparkles size={12} /> {t.quickPick.title}
          </div>
          <h2 className="display" style={{ fontSize: "clamp(1.375rem, 3vw, 1.875rem)", color: "var(--blue-navy)", lineHeight: 1.2, marginBottom: 10, fontWeight: 800 }}>
            {t.quickPick.subtitle}
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 20 }}>
            {t.quickPick.hint}
          </p>

          <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={rollRandom}
              disabled={isSpinning}
              className="btn-base btn-secondary"
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
        <div style={{ textAlign: "center", minWidth: 200, margin: "0 auto" }}>
          <div
            style={{
              width: 130,
              height: 130,
              borderRadius: "50%",
              background: "radial-gradient(circle at 35% 35%, #FEF08A 0%, #EAB308 60%, #CA8A04 100%)",
              border: "3px solid #854D0E",
              boxShadow: "0 8px 24px rgba(234, 179, 8, 0.35)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              transition: "transform var(--transition-fast)",
              transform: isSpinning ? "scale(1.08) rotate(10deg)" : "scale(1)",
            }}
          >
            <span
              className="display"
              style={{
                fontSize: "3.5rem",
                fontWeight: 800,
                color: "#1E3A8A",
                lineHeight: 1,
                textShadow: "0 1px 3px rgba(255,255,255,0.6)",
              }}
            >
              {selectedNum}
            </span>
          </div>

          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--teal-dark)", fontSize: "0.8125rem", fontWeight: 700 }}>
            <Check size={14} /> {t.quickPick.available}
          </div>
        </div>
      </div>
    </section>
  );
}
