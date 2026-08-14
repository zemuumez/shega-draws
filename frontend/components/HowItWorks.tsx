"use client";

import React from "react";
import { Ticket, CreditCard, Sparkles, Trophy } from "lucide-react";
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
    <section style={{ margin: "56px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div className="badge badge-gold" style={{ marginBottom: 8 }}>
          <Sparkles size={12} /> {t.howItWorks.title}
        </div>
        <h2 className="display" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", color: "var(--paper)", maxWidth: 580, margin: "0 auto" }}>
          {t.howItWorks.subtitle}
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="card-base"
              style={{
                padding: "28px 24px",
                position: "relative",
                background: "var(--ink-card)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "var(--radius-sm)",
                    background: "rgba(212, 175, 55, 0.12)",
                    border: "1px solid rgba(212, 175, 55, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Icon size={20} color="var(--gold)" />
                </div>
                <span className="mono" style={{ fontSize: "1.25rem", fontWeight: 800, color: "rgba(255, 255, 255, 0.15)" }}>
                  {step.num}
                </span>
              </div>

              <h3 className="display" style={{ fontSize: "1.1875rem", color: "var(--paper)", marginBottom: 8 }}>
                {step.title}
              </h3>
              <p style={{ color: "var(--paper-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                {step.desc}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
