"use client";

import React from "react";
import Link from "next/link";
import { Lock, Unlock, ShieldCheck, CheckCircle2, ArrowRight, Binary } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function FairnessDiagram() {
  const { t } = useLanguage();

  const steps = [
    {
      num: "01",
      icon: Lock,
      title: t.fairness.step1Title,
      desc: t.fairness.step1Desc,
      color: "var(--gold)",
    },
    {
      num: "02",
      icon: CheckCircle2,
      title: t.fairness.step2Title,
      desc: t.fairness.step2Desc,
      color: "var(--teal-soft)",
    },
    {
      num: "03",
      icon: Unlock,
      title: t.fairness.step3Title,
      desc: t.fairness.step3Desc,
      color: "var(--paper)",
    },
  ];

  return (
    <section style={{ margin: "56px 0" }}>
      <div className="card-base" style={{ padding: "36px 30px", background: "var(--ink-card)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
          <div>
            <div className="badge badge-teal" style={{ marginBottom: 8 }}>
              <ShieldCheck size={12} /> {t.fairness.title}
            </div>
            <h2 className="display" style={{ fontSize: "clamp(1.375rem, 3vw, 1.875rem)", color: "var(--paper)" }}>
              {t.fairness.subtitle}
            </h2>
          </div>

          <Link href="/results" className="btn-base btn-secondary" style={{ borderColor: "var(--teal)" }}>
            {t.fairness.verifyBtn} <ArrowRight size={15} />
          </Link>
        </div>

        {/* 3 Steps Visual Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 28 }}>
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                style={{
                  background: "var(--ink-soft)",
                  border: "1px solid var(--gray-line)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px 18px",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: `${s.color}15`,
                      border: `1px solid ${s.color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} color={s.color} />
                  </div>
                  <span className="mono" style={{ fontSize: "0.875rem", fontWeight: 700, color: "var(--gray)" }}>
                    {s.num}
                  </span>
                </div>

                <h3 className="display" style={{ fontSize: "1.0625rem", color: "var(--paper)", marginBottom: 6 }}>
                  {s.title}
                </h3>
                <p style={{ color: "var(--paper-muted)", fontSize: "0.8125rem", lineHeight: 1.55 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Algorithm Code Box */}
        <div
          style={{
            background: "var(--ink-deep)",
            border: "1px solid var(--gray-line)",
            borderRadius: "var(--radius-sm)",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gold)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <Binary size={13} /> {t.fairness.algoTitle}
          </span>
          <code
            className="mono"
            style={{
              color: "var(--gold-soft)",
              fontSize: "0.75rem",
              wordBreak: "break-all",
              background: "rgba(255,255,255,0.02)",
              padding: "8px 10px",
              borderRadius: 6,
            }}
          >
            {t.fairness.formula}
          </code>
        </div>
      </div>
    </section>
  );
}
