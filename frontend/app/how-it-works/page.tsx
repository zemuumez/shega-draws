import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Ticket,
  Users,
  CreditCard,
  Tv,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Sparkles,
  Award,
  Phone,
  Send,
  Lock,
  Search,
  Check,
  DollarSign,
  ChevronRight,
} from "lucide-react";
import { FAQSection } from "@/components/FAQSection";

export const metadata: Metadata = {
  title: "How It Works & Complete Player Guide — Rimna Digital Lottery",
  description:
    "Complete official guide on how to choose tickets, buy via Telebirr or CBE, watch live founder draws, claim prizes, and verify cryptographic fairness on Rimna Digital Lottery.",
};

const STEPS = [
  {
    stepNumber: "01",
    badge: "SELECT YOUR TIER",
    title: "Pick Your Lucky Number & Pool Capacity",
    description:
      "Choose any 2-digit lucky number from 00 to 99, or click Quick Pick for an instant selection. Select your preferred ticket price (100, 200, 500, or 1,000 ETB) and capped participant pool (1K, 2K, 3K, or 5K).",
    highlights: [
      "Fixed, capped participant pool ensures your odds remain high (1 in 100).",
      "Real-time calculations show total pool value and exact Top 10 prize amounts.",
      "Instant multi-ticket purchasing with unique serial numbers.",
    ],
    icon: Ticket,
    iconColor: "#FDE047",
  },
  {
    stepNumber: "02",
    badge: "INSTANT MOBILE PAYMENT",
    title: "Pay Seamlessly via Telebirr, CBE, or Cards",
    description:
      "Complete your entry in seconds using Ethiopia's most trusted payment channels or international cards. Enter your phone number, submit payment, and receive your digital ticket with instant cryptographic verification.",
    highlights: [
      "Supported: Telebirr, CBE Birr, Awash, Bank of Abyssinia, Dashen, Visa & Mastercard.",
      "Automated verification confirms your ticket in under 30 seconds.",
      "Receive SMS confirmation and unique verifiable ticket stub.",
    ],
    icon: CreditCard,
    iconColor: "#60A5FA",
  },
  {
    stepNumber: "03",
    badge: "100% TRANSPARENT BROADCAST",
    title: "Watch Founders Draw Winners Live on Video",
    description:
      "No secret computer algorithms or automated backdoors. Company founders draw all winning numbers physically on live video stream. Each selected number is held up to the camera and announced publicly in real time.",
    highlights: [
      "Scheduled public video stream broadcast on Telegram & Web.",
      "Founders physically pull winning balls from the illuminated lottery tumbler.",
      "Draw video archive is permanently recorded and available for replay.",
    ],
    icon: Tv,
    iconColor: "#34D399",
  },
  {
    stepNumber: "04",
    badge: "GUARANTEED PAYOUTS",
    title: "Top 10 Guaranteed Winners Claim Instant Cash",
    description:
      "Every single draw awards guaranteed cash prizes across 10 distinct winning ranks totaling 100% of the player prize pool. Winnings are deposited directly into your Telebirr or bank account within minutes.",
    highlights: [
      "1st Rank (Jackpot): 30% of total prize pool.",
      "2nd Rank: 20% · 3rd Rank: 15% · 4th Rank: 8% · 5th Rank: 6%.",
      "6th–10th Ranks: 4%–5% guaranteed cash payouts.",
    ],
    icon: Trophy,
    iconColor: "#F59E0B",
  },
];

export default function HowItWorksPage() {
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
              <Sparkles size={14} color="#FACC15" /> COMPLETE TRANSPARENCY & PLAYER GUIDE
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
            How Rimna Digital Lottery Works
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
            Built on 100% genuine public transparency. Learn how to configure your lucky numbers, complete instant mobile checkout, watch company founders draw the 10 guaranteed winners live on video, and claim verified cash payouts.
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
              <Ticket size={17} /> Choose Your Ticket Now
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
              <Award size={17} color="#FDE047" /> View Live & Past Results
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
            {STEPS.map((step) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={step.stepNumber}
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
                          border: `1.5px solid ${step.iconColor}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <IconComponent size={20} color={step.iconColor} />
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
                  100% MATHEMATICAL GUARANTEE
                </span>
                <h2 className="display" style={{ fontSize: "clamp(1.3rem, 2.5vw, 1.85rem)", color: "#FFFFFF", fontWeight: 900, margin: "4px 0 0" }}>
                  Top 10 Prize Payout Schedule
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
                <ShieldCheck size={14} color="#34D399" /> 100% Payout / No Rollover
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
              }}
            >
              {[
                { rank: "#1 Grand Jackpot", share: "30% of Pool", desc: "Top Cash / Luxury Reward", highlight: true },
                { rank: "#2 Luxury Prize", share: "20% of Pool", desc: "Guaranteed High Cash", highlight: false },
                { rank: "#3 High Cash", share: "15% of Pool", desc: "Guaranteed Cash", highlight: false },
                { rank: "#4 Cash Winner", share: "8% of Pool", desc: "Direct Bank Transfer", highlight: false },
                { rank: "#5 Cash Winner", share: "6% of Pool", desc: "Direct Bank Transfer", highlight: false },
                { rank: "#6 Cash Winner", share: "5% of Pool", desc: "Direct Bank Transfer", highlight: false },
                { rank: "#7–#10 (4 Winners)", share: "4% Each (16%)", desc: "Instant Mobile Deposit", highlight: false },
              ].map((tier, idx) => (
                <div
                  key={idx}
                  style={{
                    background: tier.highlight ? "rgba(254, 240, 138, 0.2)" : "rgba(0, 0, 0, 0.35)",
                    border: `1.5px solid ${tier.highlight ? "#FDE047" : "rgba(255, 255, 255, 0.12)"}`,
                    borderRadius: "14px",
                    padding: "14px 12px",
                    textAlign: "center",
                  }}
                >
                  <span style={{ fontSize: "0.6875rem", color: tier.highlight ? "#FEF08A" : "#94A3B8", fontWeight: 800, display: "block", marginBottom: 2 }}>
                    {tier.rank}
                  </span>
                  <div className="display" style={{ fontSize: "1.15rem", fontWeight: 900, color: tier.highlight ? "#FDE047" : "#FFFFFF" }}>
                    {tier.share}
                  </div>
                  <span style={{ fontSize: "0.6875rem", color: "#CBD5E1", display: "block", marginTop: 4 }}>
                    {tier.desc}
                  </span>
                </div>
              ))}
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
            <div style={{ textAlign: "center", marginBottom: 28 }}>
              <span style={{ fontSize: "0.6875rem", fontWeight: 900, color: "#FEF08A", textTransform: "uppercase", letterSpacing: "0.8px" }}>
                QUESTIONS & ANSWERS
              </span>
              <h2 className="display" style={{ fontSize: "clamp(1.5rem, 3vw, 2.2rem)", color: "#FFFFFF", fontWeight: 900, margin: "6px 0 0" }}>
                Frequently Asked Questions
              </h2>
            </div>

            <FAQSection />
          </div>
        </section>
      </div>
    </div>
  );
}
