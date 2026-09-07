"use client";

import React from "react";
import Link from "next/link";
import {
  Ticket,
  CreditCard,
  Tv,
  Trophy,
  ShieldCheck,
  Sparkles,
  Award,
  Check,
} from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { FAQSection } from "@/components/FAQSection";

const STEP_ICONS = [
  { icon: Ticket, iconColor: "#FDE047" },
  { icon: CreditCard, iconColor: "#60A5FA" },
  { icon: Tv, iconColor: "#34D399" },
  { icon: Trophy, iconColor: "#F59E0B" },
];

export default function HowItWorksPage() {
  const { t } = useLanguage();
  const pageT = t.howItWorksPage;

  return (
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
        position: "relative",
        backgroundImage: "url(/images/rimna-stadium-hero.jpg)",
        backgroundAttachment: "fixed",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* Background Overlay for Contrast */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.6) 40%, rgba(15, 23, 42, 0.85) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", zIndex: 2, paddingBottom: 80 }}>
        {/* ── 1. Cinematic Hero Header Banner ──────────────────────── */}
        <section
          style={{
            maxWidth: 1220,
            margin: "0 auto",
            padding: "clamp(48px, 6vw, 76px) clamp(16px, 3.5vw, 32px) clamp(32px, 4vw, 48px)",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "inline-flex", marginBottom: 14 }}>
            <span
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid #FDE047",
                padding: "6px 14px",
                borderRadius: "30px",
                fontSize: "0.8125rem",
                fontWeight: 900,
                color: "#FEF08A",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(234, 179, 8, 0.3)",
              }}
            >
              <Sparkles size={14} color="#FACC15" /> {pageT?.badge || "COMPLETE TRANSPARENCY & PLAYER GUIDE"}
            </span>
          </div>

          <h1
            className="display"
            style={{
              fontSize: "clamp(2.4rem, 5vw, 3.8rem)",
              fontWeight: 900,
              lineHeight: 1.08,
              color: "#FFFFFF",
              letterSpacing: "-0.8px",
              margin: "0 0 16px",
              textShadow: "0 2px 20px rgba(0, 0, 0, 0.8)",
            }}
          >
            {pageT?.title || "How Rimna Digital Lottery Works"}
          </h1>

          <p
            style={{
              fontSize: "clamp(1rem, 2vw, 1.15rem)",
              lineHeight: 1.65,
              color: "#F1F5F9",
              maxWidth: 720,
              margin: "0 0 28px",
              textShadow: "0 1px 8px rgba(0,0,0,0.8)",
            }}
          >
            {pageT?.subtitle || "Built on 100% genuine public transparency. Learn how to configure your lucky numbers, complete instant mobile checkout, watch company founders draw the 10 guaranteed winners live on video, and claim verified cash payouts."}
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/#choose-ticket"
              className="casino-btn-red"
              style={{
                padding: "13px 26px",
                fontSize: "0.9375rem",
                textDecoration: "none",
                fontWeight: 900,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 6px 18px rgba(220, 38, 38, 0.45)",
              }}
            >
              <Ticket size={17} /> {pageT?.chooseTicketCta || "Choose Your Ticket Now"}
            </Link>
            <Link
              href="/results"
              style={{
                background: "rgba(15, 23, 42, 0.75)",
                backdropFilter: "blur(12px)",
                border: "1.5px solid #FDE047",
                color: "#FEF08A",
                borderRadius: "30px",
                padding: "13px 22px",
                fontSize: "0.9375rem",
                textDecoration: "none",
                fontWeight: 900,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Award size={17} color="#FDE047" /> {pageT?.viewResultsCta || "View Live & Past Results"}
            </Link>
          </div>
        </section>

        {/* ── 2. 4-Step Interactive Visual Journey ─────────────────── */}
        <section
          style={{
            maxWidth: 1220,
            margin: "0 auto 48px",
            padding: "0 clamp(16px, 3.5vw, 32px)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 24,
            }}
          >
            {(pageT?.steps || []).map((step, index) => {
              const iconObj = STEP_ICONS[index % STEP_ICONS.length];
              const IconComponent = iconObj.icon;
              return (
                <div
                  key={step.stepNumber || index}
                  style={{
                    background: "rgba(15, 23, 42, 0.62)",
                    backdropFilter: "blur(24px) saturate(190%)",
                    WebkitBackdropFilter: "blur(24px) saturate(190%)",
                    borderRadius: "22px",
                    border: "2px solid rgba(253, 224, 71, 0.75)",
                    padding: "26px 24px",
                    boxShadow:
                      "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(254, 240, 138, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: 16,
                    color: "#FFFFFF",
                  }}
                >
                  <div>
                    {/* Header with Step Number & Badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <span
                        style={{
                          background: "rgba(254, 240, 138, 0.2)",
                          border: "1px solid #FDE047",
                          color: "#FEF08A",
                          fontSize: "0.6875rem",
                          fontWeight: 900,
                          padding: "3px 10px",
                          borderRadius: "14px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {step.badge}
                      </span>
                      <span
                        className="display"
                        style={{
                          fontSize: "1.75rem",
                          fontWeight: 900,
                          color: "#FDE047",
                          lineHeight: 1,
                        }}
                      >
                        {step.stepNumber}
                      </span>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: "10px",
                          background: "rgba(0, 0, 0, 0.4)",
                          border: `1.5px solid ${iconObj.iconColor}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconComponent size={20} color={iconObj.iconColor} />
                      </div>
                      <h3
                        className="display"
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 900,
                          color: "#FFFFFF",
                          margin: 0,
                          lineHeight: 1.25,
                        }}
                      >
                        {step.title}
                      </h3>
                    </div>

                    <p style={{ fontSize: "0.875rem", color: "#CBD5E1", lineHeight: 1.6, margin: "0 0 16px" }}>
                      {step.description}
                    </p>

                    {/* Highlights Bullets */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid rgba(255, 255, 255, 0.12)", paddingTop: 14 }}>
                      {step.highlights.map((h, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: "0.8125rem", color: "#E2E8F0" }}>
                          <Check size={14} color="#34D399" style={{ flexShrink: 0, marginTop: 3 }} />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. Prize Breakdown & Odds Transparency Table ─────────── */}
        <section
          style={{
            maxWidth: 1220,
            margin: "0 auto 48px",
            padding: "0 clamp(16px, 3.5vw, 32px)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.65)",
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
              borderRadius: "22px",
              border: "2px solid rgba(253, 224, 71, 0.75)",
              padding: "clamp(20px, 3.5vw, 36px)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
              color: "#FFFFFF",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div>
                <span style={{ fontSize: "0.6875rem", fontWeight: 900, color: "#FEF08A", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                  {pageT?.mathGuaranteeBadge || "100% MATHEMATICAL GUARANTEE"}
                </span>
                <h2 className="display" style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.85rem)", color: "#FFFFFF", fontWeight: 900, margin: "4px 0 0" }}>
                  {pageT?.scheduleTitle || "Top 10 Prize Payout Schedule"}
                </h2>
              </div>

              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid #10B981",
                  color: "#6EE7B7",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  padding: "4px 12px",
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <ShieldCheck size={14} color="#34D399" /> {pageT?.payoutNoRolloverBadge || "100% Payout / No Rollover"}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {(pageT?.scheduleTiers || []).map((tier, idx) => {
                const isFirst = idx === 0;
                return (
                  <div
                    key={idx}
                    style={{
                      background: isFirst ? "rgba(254, 240, 138, 0.2)" : "rgba(0, 0, 0, 0.35)",
                      border: `1.5px solid ${isFirst ? "#FDE047" : "rgba(255, 255, 255, 0.12)"}`,
                      borderRadius: "14px",
                      padding: "14px 12px",
                      textAlign: "center",
                    }}
                  >
                    <span style={{ fontSize: "0.6875rem", color: isFirst ? "#FEF08A" : "#94A3B8", fontWeight: 800, display: "block", marginBottom: 2 }}>
                      {tier.rank}
                    </span>
                    <div className="display" style={{ fontSize: "1.15rem", fontWeight: 900, color: isFirst ? "#FDE047" : "#FFFFFF" }}>
                      {tier.share}
                    </div>
                    <span style={{ fontSize: "0.6875rem", color: "#CBD5E1", display: "block", marginTop: 4 }}>
                      {tier.desc}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ── 4. Frequently Asked Questions Section ────────────────── */}
        <section
          style={{
            maxWidth: 1220,
            margin: "0 auto",
            padding: "0 clamp(16px, 3.5vw, 32px)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.62)",
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
              borderRadius: "22px",
              border: "2px solid rgba(253, 224, 71, 0.75)",
              padding: "clamp(20px, 3.5vw, 36px)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
              color: "#FFFFFF",
            }}
          >
            <FAQSection />
          </div>
        </section>
      </div>
    </div>
  );
}
