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
        className="hero-section-wrapper"
        style={{
          background: "linear-gradient(135deg, #FFFDF5 0%, #FFFFFF 50%, #FEF9C3 100%)",
          border: "2px solid #FDE047",
          borderRadius: "20px",
          boxShadow: "0 16px 36px -8px rgba(234, 179, 8, 0.25)",
          marginBottom: 28,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div className="hero-grid-layout" style={{ display: "grid", gap: 24, alignItems: "center", width: "100%" }}>
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
                textShadow: "0 2px 4px rgba(0,0,0,0.06)",
                wordBreak: "break-word",
              }}
            >
              {(currentApprovedDraw as any)?.total_prize_value || "$1,250,000 / 1,000,000 ETB"}
            </div>

            <h2 className="display" style={{ fontSize: "clamp(1.05rem, 2.5vw, 1.25rem)", color: "var(--blue-navy)", fontWeight: 800, marginBottom: 14, lineHeight: 1.25 }}>
              {currentApprovedDraw?.title || "100 Birr Ticket · 10 Guaranteed Cash Winners"}
            </h2>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
              <span className="mono" style={{ fontSize: "0.8125rem", color: "var(--text-muted)", fontWeight: 700 }}>
                Live Broadcast: <strong>Aug 31, 2026</strong>
              </span>

              {/* Big Golden BUY NOW Button (Opens Responsive BuyTicketModal) */}
              <HeroBuyButton
                drawId={(currentApprovedDraw as any)?.id}
                currency={activeCurrency}
                price={activeTicketPrice}
              />
            </div>

            {/* Quick Guarantees */}
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", fontSize: "0.8125rem", color: "var(--blue-navy)", fontWeight: 700 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <CheckCircle2 size={15} color="var(--teal)" /> 10 Guaranteed Winners
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Tv size={15} color="#DC2626" /> Drawn Live on Stream
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <Globe size={15} color="var(--gold-deep)" /> ETB & Diaspora USD ($25+)
              </span>
            </div>
          </div>

          {/* Right Column: 3D Hero Graphic & Countdown */}
          <div style={{ position: "relative", width: "100%" }}>
            <div
              className="card-base"
              style={{
                overflow: "hidden",
                borderRadius: "16px",
                border: "2px solid #FDE047",
                boxShadow: "0 12px 30px -6px rgba(42, 101, 230, 0.16)",
                background: "#FFFFFF",
                position: "relative",
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
                  <span className="badge" style={{ background: "rgba(255, 255, 255, 0.95)", color: "var(--blue-navy)", fontWeight: 800, fontSize: "0.6875rem" }}>
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
      <JackpotCardsSection />

      {/* ── 3. Main 2-Column Portal Section (Live Broadcast & Draws) ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: 28,
          alignItems: "start",
          width: "100%",
        }}
        className="portal-grid-container"
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
      <TestimonialsNewsletter />
    </div>
  );
}
