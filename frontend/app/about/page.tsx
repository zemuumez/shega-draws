import type { Metadata } from "next";
import Link from "next/link";
import { WhyRimnaLottery } from "@/components/WhyRimnaLottery";
import { Trophy, Tv, Users, ShieldCheck, Phone, Send, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Why Rimna Digital Lottery — Public Transparency & Live Draws",
  description: "Learn why Rimna Digital Lottery is Ethiopia's most transparent lottery. 100% live video draws, fixed pools, and 10 guaranteed winners.",
};

export default function AboutPage() {
  return (
    <div className="page-inner-container" style={{ padding: "32px clamp(14px, 3vw, 24px)", maxWidth: 1040, margin: "0 auto" }}>
      {/* ── Page Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            background: "#FEF9C3",
            border: "1.5px solid #FDE047",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={24} color="#D97706" />
        </div>
        <div>
          <h1 className="display" style={{ fontSize: "clamp(1.35rem, 3vw, 1.85rem)", color: "#111827", fontWeight: 900, lineHeight: 1.15 }}>
            Why Rimna Digital Lottery?
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 2 }}>
            Ethiopia and the Diaspora&apos;s premier digital lottery built on genuine public transparency and guaranteed payouts.
          </p>
        </div>
      </div>

      {/* ── Why Rimna Feature Component ── */}
      <div style={{ marginBottom: 28 }}>
        <WhyRimnaLottery />
      </div>

      {/* ── 24/7 Live Support & Hotline Section ── */}
      <div
        className="card-base"
        style={{
          borderRadius: "14px",
          border: "2px solid #F59E0B",
          background: "#FFFBEB",
          padding: "22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 28,
        }}
      >
        <div>
          <span style={{ fontSize: "0.6875rem", color: "#D97706", textTransform: "uppercase", fontWeight: 800, display: "block" }}>
            24/7 CUSTOMER CARE
          </span>
          <h3 className="display" style={{ fontSize: "1.25rem", color: "#111827", fontWeight: 900 }}>
            Dedicated Support & Player Assistance
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "#4B5563", marginTop: 2 }}>
            Have questions about buying tickets, verifying numbers, or claiming your cash prize? Contact us directly.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="tel:+251911000000"
            className="casino-btn-dark"
            style={{ padding: "9px 16px", textDecoration: "none" }}
          >
            <Phone size={14} color="#10B981" /> Call +251 911 000 000
          </a>
          <a
            href="https://t.me/RimnaLotteryOfficial"
            target="_blank"
            rel="noreferrer"
            className="casino-btn-red"
            style={{ padding: "9px 16px", textDecoration: "none" }}
          >
            <Send size={14} /> Telegram @RimnaLottery
          </a>
        </div>
      </div>

      {/* CTA to Explore Draws */}
      <div style={{ textAlign: "center", padding: "16px 0" }}>
        <Link
          href="/"
          className="casino-btn-red"
          style={{ padding: "12px 28px", fontSize: "0.9375rem", textDecoration: "none" }}
        >
          Explore Active Draws & Buy Tickets <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  );
}
