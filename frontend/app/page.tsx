import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getActiveDraw, listDraws, type DrawState, type Currency, type PoolOption } from "@/lib/api";
import { sanityClient } from "@/lib/sanity/client";
import { ALL_DRAWS_QUERY, JACKPOT_CARDS_QUERY, type CMSJackpotCard } from "@/lib/sanity/queries";
import { CountdownTimer } from "@/components/CountdownTimer";
import { HeroBuyButton } from "@/components/HeroBuyButton";
import { Trophy, CheckCircle2, ShieldCheck, ArrowRight, Clock, Award, Sparkles } from "lucide-react";
import { JackpotCardsSection } from "@/components/JackpotCardsSection";
import { DrawsExplorer } from "@/components/DrawsExplorer";
import { TestimonialsNewsletter } from "@/components/TestimonialsNewsletter";

export const metadata: Metadata = {
  title: "Rimna Digital Lottery — Transparent Live Video Draws & Real Payouts",
  description:
    "Ethiopia & Diaspora's premier transparent digital lottery. Real cash prizes drawn live on video by company founders. Top 10 guaranteed winners per draw.",
};

export const revalidate = 0;

function mapSanityDraw(s: any): DrawState {
  const price = s.ticketPrice || 100;
  const curr = (s.currency === "USD" ? "USD" : "ETB") as Currency;
  const isUSD = curr === "USD";

  const pools: PoolOption[] = [
    { size: 1000, label: "1,000 (1K)", pool: isUSD ? `$${price * 1000}` : `${(price * 1000).toLocaleString()} ETB`, jackpot: isUSD ? `$${Math.round(price * 1000 * 0.35)} (1st)` : `${Math.round(price * 1000 * 0.35).toLocaleString()} ETB (1st)`, totalSum: price * 1000 },
    { size: 2000, label: "2,000 (2K)", pool: isUSD ? `$${price * 2000}` : `${(price * 2000).toLocaleString()} ETB`, jackpot: isUSD ? `$${Math.round(price * 2000 * 0.35)} (1st)` : `${Math.round(price * 2000 * 0.35).toLocaleString()} ETB (1st)`, totalSum: price * 2000 },
    { size: 3000, label: "3,000 (3K)", pool: isUSD ? `$${price * 3000}` : `${(price * 3000).toLocaleString()} ETB`, jackpot: isUSD ? `$${Math.round(price * 3000 * 0.35)} (1st)` : `${Math.round(price * 3000 * 0.35).toLocaleString()} ETB (1st)`, totalSum: price * 3000 },
    { size: 5000, label: "5,000 (5K)", pool: isUSD ? `$${price * 5000}` : `${(price * 5000).toLocaleString()} ETB`, jackpot: isUSD ? `$${Math.round(price * 5000 * 0.35)} (1st)` : `${Math.round(price * 5000 * 0.35).toLocaleString()} ETB (1st)`, totalSum: price * 5000 },
  ];

  return {
    id: s._id || s.drawId,
    draw_id: s.drawId || "RDL-CMS",
    sanity_id: s._id,
    title: s.title,
    description: s.description,
    status: s.status || "open",
    deadline: s.deadline || new Date(Date.now() + 7 * 86400000).toISOString(),
    ticket_price: price,
    currency: curr,
    total_prize_value: s.totalPrizeValue || `${pools[pools.length - 1].pool}`,
    commitment: s.commitment || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    prizes: s.prizes || [],
    custom_pools: pools,
    winning_numbers: s.winningNumbers,
    seed: s.seed,
  };
}

export default async function HomePage() {
  const [cmsDrawsRes, cmsJackpotCardsRes, activeDrawState, fallbackDrawsRes] = await Promise.allSettled([
    sanityClient.fetch<any[]>(ALL_DRAWS_QUERY).catch(() => null),
    sanityClient.fetch<CMSJackpotCard[]>(JACKPOT_CARDS_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
    listDraws().catch(() => []),
  ]);

  const rawCmsDraws = cmsDrawsRes.status === "fulfilled" ? cmsDrawsRes.value : null;
  const cmsJackpotCards = cmsJackpotCardsRes.status === "fulfilled" ? cmsJackpotCardsRes.value : null;
  const drawState = activeDrawState.status === "fulfilled" ? activeDrawState.value : null;
  const fallbackDraws = fallbackDrawsRes.status === "fulfilled" ? fallbackDrawsRes.value : [];

  // Convert CMS draws to DrawState
  const mappedCmsDraws = rawCmsDraws && rawCmsDraws.length > 0
    ? rawCmsDraws.map(mapSanityDraw)
    : [];

  // CMS draws take highest priority!
  const cmsIds = new Set(mappedCmsDraws.map((d) => d.draw_id));
  const combinedDraws = [
    ...mappedCmsDraws,
    ...fallbackDraws.filter((d) => !cmsIds.has(d.draw_id)),
  ];

  const allDraws = combinedDraws.length > 0 ? combinedDraws : fallbackDraws;

  // Filter approved open draws or fallback to the latest active state
  const approvedOpenDraws = allDraws.filter((d) => d.status === "open");
  const currentApprovedDraw =
    approvedOpenDraws.find((d) => d.id === drawState?.id) ||
    approvedOpenDraws[0] ||
    drawState ||
    allDraws[0];

  const deadline = currentApprovedDraw?.deadline || new Date(Date.now() + 3 * 86400000).toISOString();
  const activeCurrency = ((currentApprovedDraw as any)?.currency || "ETB") as any;
  const activeTicketPrice = (currentApprovedDraw as any)?.ticket_price || 100;

  return (
    <div style={{ paddingBottom: 60, width: "100%", overflowX: "hidden" }}>
      {/* ── 1. Full-Width Hero Section with Rich Full-Bleed Background Image ── */}
      <section
        className="hero-section-wrapper"
        style={{
          position: "relative",
          width: "100%",
          borderTop: "2px solid #F59E0B",
          borderBottom: "2px solid #F59E0B",
          borderLeft: "none",
          borderRight: "none",
          borderRadius: 0,
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.2)",
          marginBottom: 28,
          overflow: "hidden",
          backgroundColor: "#0A1122",
        }}
      >
        {/* Full Section Background Image */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <Image
            src="/images/hero-lottery.jpg"
            alt="Rimna Digital Lottery Background Banner"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center center" }}
          />
        </div>

        {/* Dark Luxury Gradient Overlay for Crisp Text Legibility */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(10, 17, 34, 0.95) 0%, rgba(10, 17, 34, 0.88) 52%, rgba(10, 17, 34, 0.68) 100%)",
            zIndex: 2,
          }}
        />

        {/* Hero Content Container */}
        <div style={{ position: "relative", zIndex: 3, maxWidth: 1140, margin: "0 auto", padding: "0 clamp(16px, 4vw, 32px)", boxSizing: "border-box" }}>
          <div
            className="hero-grid-layout"
            style={{
              display: "grid",
              gap: 32,
              alignItems: "center",
            }}
          >
            {/* Left Column: Live Jackpot Status & Quick Buy CTA */}
            <div>
              {/* Trust Badges */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
                <span className="badge badge-gold">
                  <Trophy size={13} color="#D97706" /> 10 GUARANTEED WINNERS PER DRAW
                </span>
                <span className="badge" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34D399", border: "1px solid #059669", fontWeight: 800 }}>
                  <CheckCircle2 size={13} color="#34D399" /> PUBLIC VIDEO BROADCAST
                </span>
              </div>

              {/* Title */}
              <h1
                className="display"
                style={{
                  fontSize: "clamp(1.75rem, 4vw, 2.75rem)",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  lineHeight: 1.12,
                  marginBottom: 12,
                  textShadow: "0 2px 8px rgba(0,0,0,0.5)",
                }}
              >
                {currentApprovedDraw?.title || "100 Birr Classic Multi-Pool Draw"}
              </h1>

              <p
                style={{
                  fontSize: "clamp(0.875rem, 2vw, 1rem)",
                  color: "#E2E8F0",
                  lineHeight: 1.5,
                  maxWidth: 540,
                  marginBottom: 22,
                  textShadow: "0 1px 4px rgba(0,0,0,0.4)",
                }}
              >
                Pick your lucky number, choose your pool capacity, and watch our founders draw the 10 winning numbers live on video stream.
              </p>

              {/* High-Impact Quick Buy Action */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <HeroBuyButton
                  drawId={currentApprovedDraw?.draw_id || "RDL-2026-08A"}
                  currency={activeCurrency}
                  price={activeTicketPrice}
                />

                <Link
                  href="/results"
                  className="casino-btn-dark"
                  style={{
                    padding: "12px 20px",
                    fontSize: "0.875rem",
                    textDecoration: "none",
                    border: "1.5px solid #F59E0B",
                    background: "rgba(17, 24, 39, 0.85)",
                    backdropFilter: "blur(6px)",
                  }}
                >
                  <Award size={16} color="#F59E0B" /> View Results & Live Stream
                </Link>
              </div>
            </div>

            {/* Right Column: Mini Box with New 3D Gold Tumbler Image & Countdown */}
            <div>
              <div
                className="card-base"
                style={{
                  borderRadius: "16px",
                  overflow: "hidden",
                  border: "2.5px solid #F59E0B",
                  background: "#111827",
                  boxShadow: "0 14px 32px rgba(0, 0, 0, 0.45)",
                }}
              >
                {/* Dedicated Mini Card Graphic */}
                <div style={{ position: "relative", width: "100%", height: 215 }}>
                  <Image
                    src="/images/hero-mini-card.jpg"
                    alt="Golden Jackpot Raffle Tumbler Machine"
                    fill
                    priority
                    style={{ objectFit: "cover" }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(17, 24, 39, 0.1) 0%, rgba(17, 24, 39, 0.65) 100%)",
                    }}
                  />
                  <div style={{ position: "absolute", bottom: 8, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 6 }}>
                    <span className="badge" style={{ background: "#FEF08A", color: "#854D0E", border: "1px solid #FACC15", fontWeight: 900, fontSize: "0.6875rem" }}>
                      <Trophy size={12} color="#D97706" /> 10 Guaranteed Winners
                    </span>
                    <span className="mono" style={{ fontSize: "0.6875rem", color: "#FFFFFF", fontWeight: 800, textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}>
                      Live Video Draw
                    </span>
                  </div>
                </div>

                {/* Countdown Strip */}
                <div style={{ padding: "10px 12px", background: "#FFFFFF", borderTop: "2px solid #F59E0B" }}>
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
        <div style={{ marginBottom: 32 }}>
          <JackpotCardsSection cmsCards={cmsJackpotCards} />
        </div>

        {/* ── 3. Full Draws Catalog (Dedicated Full-Width Section) ── */}
        <div style={{ marginBottom: 40 }}>
          <DrawsExplorer initialDraws={allDraws} />
        </div>

        {/* ── 4. Bottom Testimonials & Newsletter Section ── */}
        <div style={{ marginBottom: 32 }}>
          <TestimonialsNewsletter />
        </div>
      </div>
    </div>
  );
}
