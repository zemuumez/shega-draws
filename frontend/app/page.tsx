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
      {/* ── 1. Current Active Admin-Approved Draw Hero Banner ── */}
      <section
        className="hero-section-wrapper lottery-guilloche-bg reveal-item is-revealed"
        style={{
          background: "linear-gradient(135deg, #FFFDF5 0%, #FFFFFF 50%, #FEF9C3 100%)",
          border: "2px solid #FDE047",
          borderRadius: "20px",
          boxShadow: "0 16px 36px -8px rgba(234, 179, 8, 0.25)",
          marginBottom: 28,
          width: "100%",
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Floating Ambient Lottery Spheres */}
        <div
          className="float-slow"
          style={{
            position: "absolute",
            top: -15,
            right: "25%",
            width: 48,
            height: 48,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FEF08A 0%, #EAB308 100%)",
            border: "2px solid #FFFFFF",
            boxShadow: "0 6px 14px rgba(234, 179, 8, 0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#111827",
            fontWeight: 900,
            fontSize: "0.875rem",
            fontFamily: "var(--font-mono)",
            pointerEvents: "none",
            zIndex: 2,
            opacity: 0.85,
          }}
        >
          #7
        </div>

        <div
          className="float-reverse"
          style={{
            position: "absolute",
            bottom: 20,
            left: "48%",
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #DBEAFE 0%, #2A65E6 100%)",
            border: "2px solid #FFFFFF",
            boxShadow: "0 4px 12px rgba(42, 101, 230, 0.3)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#FFFFFF",
            fontWeight: 900,
            fontSize: "0.75rem",
            fontFamily: "var(--font-mono)",
            pointerEvents: "none",
            zIndex: 2,
            opacity: 0.8,
          }}
        >
          #77
        </div>

        <div className="hero-grid-layout" style={{ display: "grid", gap: 24, alignItems: "center", width: "100%", position: "relative", zIndex: 3 }}>
          {/* Left Column: Headline, Active Draw Info & CTA */}
          <div style={{ width: "100%" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <span
                style={{
                  background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                  color: "#FFFFFF",
                  padding: "4px 12px",
                  borderRadius: "20px",
                  fontSize: "0.6875rem",
                  fontWeight: 900,
                  letterSpacing: "0.4px",
                  textTransform: "uppercase",
                  boxShadow: "0 2px 6px rgba(185, 28, 28, 0.35)",
                }}
              >
                OFFICIAL LIVE DRAW · {(currentApprovedDraw as any)?.draw_id || "RDL-2026-08A"}
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
                margin: "4px 0 8px",
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
                marginBottom: 10,
              }}
            >
              {currentApprovedDraw?.title || "Rimna Grand Jackpot — Multi-Pool Live Drawing"}
            </h1>

            <p style={{ color: "var(--text-muted)", fontSize: "clamp(0.875rem, 1.5vw, 0.95rem)", lineHeight: 1.6, marginBottom: 20, maxWidth: 580 }}>
              Pick your lucky numbers across 4 fixed participant pools. Watch the owner draw and display winning numbers live on broadcast with guaranteed payouts for the Top 10 winners!
            </p>

            {/* Hero Quick Trust Signals */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#111827", fontWeight: 700 }}>
                <CheckCircle2 size={15} color="var(--teal)" /> 10 Guaranteed Winners
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#111827", fontWeight: 700 }}>
                <Tv size={15} color="#2A65E6" /> Live Public Video Broadcast
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.8125rem", color: "#111827", fontWeight: 700 }}>
                <Ticket size={15} color="var(--gold-deep)" /> Fixed Capped Pools (1K-5K)
              </span>
            </div>

            {/* Buy Ticket CTA Button */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <HeroBuyButton
                drawId={(currentApprovedDraw as any)?.id || "RDL-ACTIVE"}
                currency={activeCurrency}
                price={activeTicketPrice}
              />

              <Link
                href="#draws-catalog"
                className="btn-base btn-secondary"
                style={{ padding: "12px 22px", fontSize: "0.9375rem", fontWeight: 800 }}
              >
                Browse All Draws <ArrowRight size={16} />
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
                boxShadow: "0 12px 28px -4px rgba(234, 179, 8, 0.35)",
                maxWidth: 420,
                width: "100%",
              }}
            >
              <div style={{ position: "relative", width: "100%", height: 240 }}>
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
                <div style={{ position: "absolute", bottom: 10, left: 12, right: 12, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 6 }}>
                  <span className="badge" style={{ background: "rgba(255, 255, 255, 0.95)", color: "#111827", fontWeight: 800, fontSize: "0.6875rem" }}>
                    <Trophy size={12} color="var(--gold-dark)" /> 100% Guaranteed Payouts
                  </span>
                  <span className="mono" style={{ fontSize: "0.6875rem", color: "#FFFFFF", fontWeight: 700 }}>
                    Live Video Draw
                  </span>
                </div>
              </div>

              {/* Countdown Strip */}
              <div style={{ padding: "12px 14px", background: "#FFFFFF", borderTop: "1px solid var(--gray-line)" }}>
                <CountdownTimer target={deadline} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Triple Physical Ticket Cards (Diaspora & Local) ── */}
      <div className="reveal-item">
        <JackpotCardsSection />
      </div>

      {/* ── 3. Main 2-Column Portal Section (Live Broadcast & Draws) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 28,
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
  );
}
