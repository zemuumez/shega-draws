"use client";

import React from "react";
import { Ticket, CreditCard, Trophy, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function HowItWorks() {
  const { t } = useLanguage();

  const steps = [
    {
      num: "01",
      icon: Ticket,
      title: t.howItWorks.step1,
      desc: t.howItWorks.step1Desc,
    },
    {
      num: "02",
      icon: CreditCard,
      title: t.howItWorks.step2,
      desc: t.howItWorks.step2Desc,
    },
    {
      num: "03",
      icon: Trophy,
      title: t.howItWorks.step3,
      desc: t.howItWorks.step3Desc,
    },
  ];

  return (
    <section style={{ margin: "48px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="badge badge-gold" style={{ marginBottom: 8 }}>
          <Sparkles size={12} /> {t.howItWorks.title}
        </div>
        <h2 className="display" style={{ fontSize: "clamp(1.375rem, 3.5vw, 2rem)", color: "var(--blue-navy)", maxWidth: 580, margin: "0 auto", fontWeight: 800 }}>
          {t.howItWorks.subtitle}
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="card-base"
              style={{
                padding: "26px 24px",
                position: "relative",
                background: "#FFFFFF",
                border: "1.5px solid var(--blue-border)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-sm)",
                    background: "var(--gold-bg)",
                    border: "1px solid var(--gold-border)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color="var(--gold-deep)" />
                </div>
                <span className="mono" style={{ fontSize: "1.25rem", fontWeight: 800, color: "var(--blue-border)" }}>
                  {step.num}
                </span>
              </div>

              <h3 className="display" style={{ fontSize: "1.125rem", color: "var(--blue-navy)", marginBottom: 8, fontWeight: 700 }}>
                {step.title}
              </h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.55 }}>
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
