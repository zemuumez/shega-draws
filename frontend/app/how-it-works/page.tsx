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
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works & Complete Player Guide — Rimna Digital Lottery",
  description:
    "Complete official guide on how to choose tickets, buy via Telebirr or CBE, watch live founder draws, claim prizes, and verify cryptographic fairness on Rimna Digital Lottery.",
};

export default function HowItWorksPage() {
  return (
    <div style={{ paddingBottom: 80, width: "100%", overflowX: "hidden" }}>
      {/* ── 1. Bright & Warm Hero Header Banner ──────────────────────── */}
      <section
        style={{
          position: "relative",
          width: "100%",
          background: "linear-gradient(135deg, #FFFDF5 0%, #FEF9C3 50%, #FEF08A 100%)",
          borderTop: "2px solid #F59E0B",
          borderBottom: "2px solid #F59E0B",
          color: "#111827",
          padding: "clamp(36px, 5vw, 56px) 0",
          marginBottom: 40,
          boxShadow: "0 6px 20px rgba(245, 158, 11, 0.12)",
        }}
      >
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#FEF08A", border: "1.5px solid #F59E0B", borderRadius: "20px", padding: "5px 14px", marginBottom: 14, boxShadow: "0 2px 6px rgba(245, 158, 11, 0.2)" }}>
            <Sparkles size={14} color="#B45309" />
            <span className="mono" style={{ fontSize: "0.75rem", color: "#854D0E", fontWeight: 900, textTransform: "uppercase" }}>
              COMPLETE PLATFORM GUIDE
            </span>
          </div>

          <h1 className="display" style={{ fontSize: "clamp(2rem, 4.5vw, 3rem)", fontWeight: 900, lineHeight: 1.1, color: "#111827", marginBottom: 14 }}>
            How Rimna Digital Lottery Works
          </h1>

          <p style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)", color: "#374151", maxWidth: 680, lineHeight: 1.6, marginBottom: 24, fontWeight: 500 }}>
            Learn how to choose your lucky numbers, complete mobile payment, watch our founders draw the 10 guaranteed winners live on video, and claim instant cash rewards.
          </p>

          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link
              href="/#choose-ticket"
              className="casino-btn-red"
              style={{
                padding: "12px 24px",
                fontSize: "0.9375rem",
                textDecoration: "none",
                fontWeight: 900,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
              }}
            >
              <Ticket size={17} /> Choose Your Ticket Now
            </Link>
            <Link
              href="/results"
              className="casino-btn-gold"
              style={{
                padding: "12px 20px",
                fontSize: "0.9375rem",
                textDecoration: "none",
                fontWeight: 900,
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Award size={17} color="#111827" /> View Live & Past Results
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Main Content Container ─────────────────────────────────── */}
      <div className="page-inner-container" style={{ display: "flex", flexDirection: "column", gap: 48 }}>
        {/* ── STEP 1: How to Choose & Buy a Ticket ───────────────────── */}
        <div className="card-base rough-paper-ticket" style={{ padding: "clamp(20px, 4vw, 36px)", border: "2px solid #F59E0B", borderRadius: "20px", background: "#FFFDF5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FEF08A", border: "2px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#854D0E", fontSize: "1.1rem" }}>
              1
            </div>
            <h2 className="display" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)", fontWeight: 900, color: "#111827", margin: 0 }}>
              How to Choose & Buy Your Ticket
            </h2>
          </div>

          <p style={{ color: "#4B5563", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 20 }}>
            Our interactive ticket configurator gives you 100% control over your entry price, currency, and participant pool size:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "16px" }}>
              <span className="mono" style={{ fontSize: "0.75rem", color: "#D97706", fontWeight: 800, textTransform: "uppercase" }}>
                Step A · Select Currency
              </span>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111827", margin: "6px 0" }}>
                Local ETB (Birr) or Diaspora USD ($)
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                Choose ETB if paying via Telebirr or CBE Birr. Choose USD if you are in the diaspora paying via credit/debit or global wire.
              </p>
            </div>

            <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "16px" }}>
              <span className="mono" style={{ fontSize: "0.75rem", color: "#D97706", fontWeight: 800, textTransform: "uppercase" }}>
                Step B · Choose Price Tier
              </span>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111827", margin: "6px 0" }}>
                Fixed Ticket Cost
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                Select between 100, 200, 500, or 1,000 ETB (or $25, $50, $100, $250). Higher tiers have significantly larger jackpot prize pools.
              </p>
            </div>

            <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "16px" }}>
              <span className="mono" style={{ fontSize: "0.75rem", color: "#D97706", fontWeight: 800, textTransform: "uppercase" }}>
                Step C · Select Pool Capacity
              </span>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111827", margin: "6px 0" }}>
                1K, 2K, 3K, or 5K People
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                Capped participant pools guarantee that odds remain high (1 in 100 for 1K pool) and 10 winners are always drawn.
              </p>
            </div>

            <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "16px" }}>
              <span className="mono" style={{ fontSize: "0.75rem", color: "#D97706", fontWeight: 800, textTransform: "uppercase" }}>
                Step D · Payment & Screenshot Proof
              </span>
              <h3 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#111827", margin: "6px 0" }}>
                Instant Verification
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                Pay to our official Telebirr merchant or CBE account, pick your lucky number (00–99), and upload your transaction SMS/slip screenshot.
              </p>
            </div>
          </div>
        </div>

        {/* ── STEP 2: How to Login & Track Your Tickets ───────────────── */}
        <div className="card-base rough-paper-ticket" style={{ padding: "clamp(20px, 4vw, 36px)", border: "2px solid #F59E0B", borderRadius: "20px", background: "#FFFDF5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FEF08A", border: "2px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#854D0E", fontSize: "1.1rem" }}>
              2
            </div>
            <h2 className="display" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)", fontWeight: 900, color: "#111827", margin: 0 }}>
              How to Sign In & Track Your Tickets
            </h2>
          </div>

          <p style={{ color: "#4B5563", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 20 }}>
            Every ticket purchase is registered under your phone number. You can verify and inspect all your entries anytime:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Phone size={18} color="#D97706" />
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827", margin: 0 }}>Instant Phone Login</h3>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                Click <strong>Sign In</strong> in the top navigation bar, enter your registered phone number, and access your personal dashboard.
              </p>
            </div>

            <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Ticket size={18} color="#059669" />
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827", margin: 0 }}>My Tickets Dashboard</h3>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                Go to <Link href="/entries" style={{ color: "#1D4ED8", fontWeight: 700 }}>My Tickets</Link> to see your chosen numbers, status (🟡 Pending / 🟢 Approved), and draw countdowns.
              </p>
            </div>
          </div>
        </div>

        {/* ── STEP 3: How the Live Video Draw Works ───────────────────── */}
        <div className="card-base rough-paper-ticket" style={{ padding: "clamp(20px, 4vw, 36px)", border: "2px solid #F59E0B", borderRadius: "20px", background: "#FFFDF5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FEF08A", border: "2px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#854D0E", fontSize: "1.1rem" }}>
              3
            </div>
            <h2 className="display" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)", fontWeight: 900, color: "#111827", margin: 0 }}>
              How Numbers are Drawn (100% Live Video Broadcast)
            </h2>
          </div>

          <p style={{ color: "#4B5563", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 20 }}>
            Unlike automated lotteries with hidden digital algorithms, Rimna Digital Lottery conducts <strong>public video draws</strong> on camera:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Tv size={18} color="#DC2626" />
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827", margin: 0 }}>YouTube & Telegram Live Stream</h3>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                Every draw is broadcasted live in HD. The company founders physically draw each numbered ball on camera in real time for everyone to witness.
              </p>
            </div>

            <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Trophy size={18} color="#D97706" />
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827", margin: 0 }}>10 Guaranteed Winners</h3>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                Every single pool awards guaranteed cash prizes to the Top 10 winning ranks (1st place receives 30% jackpot, with 9 additional cash prizes).
              </p>
            </div>
          </div>
        </div>

        {/* ── STEP 4: How to See Previous Results & Verify Fairness ───── */}
        <div className="card-base rough-paper-ticket" style={{ padding: "clamp(20px, 4vw, 36px)", border: "2px solid #F59E0B", borderRadius: "20px", background: "#FFFDF5" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#FEF08A", border: "2px solid #F59E0B", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, color: "#854D0E", fontSize: "1.1rem" }}>
              4
            </div>
            <h2 className="display" style={{ fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)", fontWeight: 900, color: "#111827", margin: 0 }}>
              How to Check Results & Verify Payouts
            </h2>
          </div>

          <p style={{ color: "#4B5563", fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 20 }}>
            All past results, winner names, and broadcast archives are stored permanently:
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 20 }}>
            <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <Award size={18} color="#D97706" />
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827", margin: 0 }}>Results & Video Archive</h3>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5, margin: "0 0 10px" }}>
                Visit the <Link href="/results" style={{ color: "#1D4ED8", fontWeight: 700 }}>Results Page</Link> to watch past draw recordings, check winning numbers, and verify winner payout confirmations.
              </p>
            </div>

            <div style={{ background: "#FFFFFF", border: "1.5px solid #E5E7EB", borderRadius: "12px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <ShieldCheck size={18} color="#059669" />
                <h3 style={{ fontSize: "1rem", fontWeight: 800, color: "#111827", margin: 0 }}>Instant Mobile & Bank Payouts</h3>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "#6B7280", lineHeight: 1.5, margin: 0 }}>
                Winners are contacted within 30 minutes of the live stream and receive direct payouts via Telebirr, CBE Bank transfer, or international wire.
              </p>
            </div>
          </div>
        </div>

        {/* ── Ready to Play CTA Banner ───────────────────────────────── */}
        <div style={{ background: "#FFFDF5", border: "2px solid #F59E0B", borderRadius: "20px", padding: "clamp(24px, 4vw, 40px)", textAlign: "center", color: "#111827", boxShadow: "0 10px 30px rgba(245, 158, 11, 0.15)" }}>
          <h2 className="display" style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)", fontWeight: 900, color: "#111827", marginBottom: 10 }}>
            Ready to Play & Win?
          </h2>
          <p style={{ color: "#4B5563", fontSize: "0.95rem", maxWidth: 540, margin: "0 auto 20px", lineHeight: 1.5 }}>
            Pick your lucky number, choose your pool capacity, and join thousands of winners across Ethiopia and the diaspora.
          </p>
          <Link href="/#choose-ticket" className="casino-btn-red" style={{ padding: "14px 28px", fontSize: "1rem", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8, boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)" }}>
            <Ticket size={18} /> Go to Ticket Selector
          </Link>
        </div>
      </div>
    </div>
  );
}
