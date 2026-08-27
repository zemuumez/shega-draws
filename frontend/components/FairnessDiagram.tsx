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
      color: "var(--gold-deep)",
      bg: "var(--gold-bg)",
    },
    {
      num: "02",
      icon: CheckCircle2,
      title: t.fairness.step2Title,
      desc: t.fairness.step2Desc,
      color: "var(--teal-dark)",
      bg: "var(--teal-bg)",
    },
    {
      num: "03",
      icon: Unlock,
      title: t.fairness.step3Title,
      desc: t.fairness.step3Desc,
      color: "var(--blue-navy)",
      bg: "var(--blue-bg)",
    },
  ];

  return (
    <section style={{ margin: "48px 0" }}>
      <div className="card-base" style={{ padding: "36px 30px", background: "#FFFFFF", border: "1.5px solid var(--blue-border)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
          <div>
            <div className="badge badge-blue" style={{ marginBottom: 8 }}>
              <ShieldCheck size={12} /> {t.fairness.title}
            </div>
            <h2 className="display" style={{ fontSize: "clamp(1.375rem, 3vw, 1.875rem)", color: "var(--blue-navy)", fontWeight: 800 }}>
              {t.fairness.subtitle}
            </h2>
          </div>

          <Link href="/results" className="btn-base btn-secondary">
            {t.fairness.verifyBtn} <ArrowRight size={15} />
          </Link>
        </div>

        {/* 3 Steps Visual Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 24 }}>
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.num}
                style={{
                  background: "#F8FAFC",
                  border: "1px solid var(--gray-line)",
                  borderRadius: "var(--radius-md)",
                  padding: "20px 18px",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: s.bg,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon size={18} color={s.color} />
                  </div>
                  <span className="mono" style={{ fontSize: "0.875rem", fontWeight: 800, color: "var(--blue-royal)" }}>
                    {s.num}
                  </span>
                </div>

                <h3 className="display" style={{ fontSize: "1.0625rem", color: "var(--blue-navy)", marginBottom: 6, fontWeight: 700 }}>
                  {s.title}
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.55 }}>
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>

        {/* Algorithm Code Box */}
        <div
          style={{
            background: "var(--blue-bg)",
            border: "1px solid var(--blue-border)",
            borderRadius: "var(--radius-sm)",
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 6,
          }}
        >
          <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--blue-navy)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, fontWeight: 800 }}>
            <Binary size={14} color="var(--blue-royal)" /> {t.fairness.algoTitle}
          </span>
          <code
            className="mono"
            style={{
              color: "var(--blue-navy)",
              fontSize: "0.75rem",
              wordBreak: "break-all",
              background: "#FFFFFF",
              border: "1px solid var(--blue-border)",
              padding: "8px 10px",
              borderRadius: 6,
              fontWeight: 700,
            }}
          >
            {t.fairness.formula}
          </code>
        </div>
      </div>
    </section>
  );
}
