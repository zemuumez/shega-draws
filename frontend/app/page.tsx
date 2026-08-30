import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Ticket, Tv, Sparkles, Trophy, Clock, CheckCircle2, ArrowRight, Zap, Users, Gift, Globe } from "lucide-react";
import { sanityClient } from "@/lib/sanity/client";
import {
  ACTIVE_DRAW_QUERY,
  ALL_DRAWS_QUERY,
  PROMOTIONS_QUERY,
  type ActiveDraw,
  type CMSPromotion,
} from "@/lib/sanity/queries";
import { getActiveDraw, listDraws } from "@/lib/api";
import { CountdownTimer } from "@/components/CountdownTimer";
import { JackpotCardsSection } from "@/components/JackpotCardsSection";
import { LiveBroadcastBanner } from "@/components/LiveBroadcastBanner";
import { DrawsExplorer } from "@/components/DrawsExplorer";
import { SidebarWidgets } from "@/components/SidebarWidgets";
import { WhyRimnaLottery } from "@/components/WhyRimnaLottery";
import { TestimonialsNewsletter } from "@/components/TestimonialsNewsletter";
import { HeroBuyButton } from "@/components/HeroBuyButton";

export const metadata: Metadata = {
  title: "Rimna Digital Lottery — Transparent Live Digital Raffle & Lottery",
  description: "Official verified multi-pool digital raffle tickets. Pick your lucky number, win guaranteed top 10 cash prizes, and watch winning numbers drawn live on broadcast.",
};

export const revalidate = 0; // Dynamic server render

export default async function HomePage() {
  // Fetch active approved draw from Sanity or fallback API
  const [sanityActive, sanityAll, apiActive, apiAll] = await Promise.allSettled([
    sanityClient.fetch<ActiveDraw>(ACTIVE_DRAW_QUERY),
    sanityClient.fetch<any[]>(ALL_DRAWS_QUERY),
    getActiveDraw(),
    listDraws(),
  ]);

  const currentApprovedDraw =
    sanityActive.status === "fulfilled" && sanityActive.value
      ? sanityActive.value
      : apiActive.status === "fulfilled"
      ? apiActive.value
      : null;

  const allDraws =
    apiAll.status === "fulfilled" && apiAll.value?.length > 0
      ? apiAll.value
      : [];

  const deadline = currentApprovedDraw?.deadline || new Date(Date.now() + 3 * 86400000).toISOString();
  const activeCurrency = ((currentApprovedDraw as any)?.currency || "ETB") as any;
  const activeTicketPrice = (currentApprovedDraw as any)?.ticket_price || 100;

  return (
    <div style={{ paddingBottom: 60, width: "100%", overflowX: "hidden" }}>
      {/* ── 1. Current Active Admin-Approved Draw Hero Banner (Full Viewport Width & 0 Border Radius) ── */}
      <section
        className="hero-section-wrapper lottery-guilloche-bg reveal-item is-revealed"
        style={{
          background: "linear-gradient(135deg, #FFFDF5 0%, #FFFFFF 40%, #FEF9C3 100%)",
          borderTop: "2px solid #FDE047",
          borderBottom: "2px solid #FDE047",
          borderLeft: "none",
          borderRight: "none",
          borderRadius: 0,
          boxShadow: "0 12px 28px -6px rgba(234, 179, 8, 0.22)",
          marginBottom: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Centered Content Container matching exact indentation of other sections */}
        <div className="page-inner-container">
          <div className="hero-grid-layout" style={{ display: "grid", gap: 20, alignItems: "center", width: "100%", position: "relative", zIndex: 3 }}>
          {/* Left Column: Headline, Active Draw Info & CTA */}
          <div style={{ width: "100%" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span className="casino-ribbon-badge">
                <Trophy size={13} /> OFFICIAL LIVE DRAW · {(currentApprovedDraw as any)?.draw_id || "RDL-2026-08A"}
              </span>
            </div>

            {/* Huge Jackpot Display */}
            <div
              className="display"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.5rem)",
                color: "#DC2626",
                lineHeight: 1.05,
                fontWeight: 900,
                letterSpacing: "-1px",
                margin: "2px 0 6px",
              }}
            >
              {(currentApprovedDraw as any)?.total_prize_value || (currentApprovedDraw as any)?.prize_pool_estimate || "$1,250,000 / 1,000,000 ETB"}
            </div>

            <h1
              className="display"
              style={{
                fontSize: "clamp(1.125rem, 2.5vw, 1.5rem)",
                color: "#111827",
                fontWeight: 800,
                lineHeight: 1.25,
                marginBottom: 8,
              }}
            >
              {currentApprovedDraw?.title || "Rimna Grand Jackpot — Multi-Pool Live Drawing"}
            </h1>

            <p style={{ color: "var(--text-muted)", fontSize: "clamp(0.875rem, 1.5vw, 0.9375rem)", lineHeight: 1.55, marginBottom: 16, maxWidth: 580 }}>
              Pick your lucky numbers across 4 fixed participant pools. Watch the owner draw and display winning numbers live on broadcast with guaranteed payouts for the Top 10 winners!
            </p>

            {/* Hero Quick Trust Signals */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.8125rem", color: "#111827", fontWeight: 700 }}>
                <CheckCircle2 size={15} color="var(--teal)" /> 10 Guaranteed Winners
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.8125rem", color: "#111827", fontWeight: 700 }}>
                <Tv size={15} color="#2A65E6" /> Live Public Broadcast
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.8125rem", color: "#111827", fontWeight: 700 }}>
                <Ticket size={15} color="var(--gold-deep)" /> Fixed Capped Pools (1K-5K)
              </span>
            </div>

            {/* Buy Ticket CTA Button */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <HeroBuyButton
                drawId={(currentApprovedDraw as any)?.id || "RDL-ACTIVE"}
                currency={activeCurrency}
                price={activeTicketPrice}
              />

              <Link
                href="#draws-catalog"
                className="btn-base btn-secondary"
                style={{ padding: "11px 20px", fontSize: "0.875rem", fontWeight: 800 }}
              >
                Browse All Draws <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {/* Right Column: Hero Visual Ticket Card with Countdown */}
          <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
            <div
              className="card-base interactive-ticket-card"
              style={{
                borderRadius: "16px",
                overflow: "hidden",
                border: "2px solid #FDE047",
                background: "#FFFFFF",
                boxShadow: "0 10px 24px -4px rgba(234, 179, 8, 0.3)",
                maxWidth: 400,
                width: "100%",
              }}
            >
              <div style={{ position: "relative", width: "100%", height: 210 }}>
                <Image
                  src="/images/hero-lottery.jpg"
                  alt="Rimna Digital Lottery Gold and Blue Lottery Banner"
                  fill
                  priority
                  style={{ objectFit: "cover" }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "linear-gradient(180deg, rgba(12, 38, 102, 0.1) 0%, rgba(12, 38, 102, 0.65) 100%)",
                  }}
                />
                <div style={{ position: "absolute", bottom: 8, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 6 }}>
                  <span className="badge" style={{ background: "rgba(255, 255, 255, 0.95)", color: "#111827", fontWeight: 800, fontSize: "0.6875rem" }}>
                    <Trophy size={12} color="var(--gold-dark)" /> 100% Guaranteed Payouts
                  </span>
                  <span className="mono" style={{ fontSize: "0.6875rem", color: "#FFFFFF", fontWeight: 700 }}>
                    Live Video Draw
                  </span>
                </div>
              </div>

              {/* Countdown Strip */}
              <div style={{ padding: "10px 12px", background: "#FFFFFF", borderTop: "1px solid var(--gray-line)" }}>
                <CountdownTimer target={deadline} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

      {/* ── Page Inner Container for content below full-width hero ── */}
      <div className="page-inner-container">
        {/* ── 2. Triple Physical Ticket Cards (Diaspora & Local) ── */}
        <div className="reveal-item" style={{ marginBottom: 20 }}>
          <JackpotCardsSection />
        </div>

        {/* ── 3. Main 2-Column Portal Section (Live Broadcast & Draws) ── */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 340px",
            gap: 20,
            alignItems: "start",
            width: "100%",
          }}
          className="portal-grid-container reveal-item"
        >
          {/* Left Column: Live Stream Banner + Draws Catalog + Why Rimna */}
          <div style={{ width: "100%", minWidth: 0 }}>
            {/* Live Broadcast & Stream Information */}
            <LiveBroadcastBanner />

            {/* Full Draws Catalog (with ETB / USD Currency Switcher) */}
            <DrawsExplorer initialDraws={allDraws} />

            {/* Why Rimna Lottery Public Transparency Section */}
            <WhyRimnaLottery />
          </div>

          {/* Right Column: Sidebar Widgets (Results, 24/7 Support, Promos) */}
          <div style={{ width: "100%", minWidth: 0 }}>
            <SidebarWidgets />
          </div>
        </div>

        {/* ── 4. Bottom Testimonials & Newsletter Section ────────── */}
        <div className="reveal-item">
          <TestimonialsNewsletter />
        </div>
      </div>
    </div>
  );
}
