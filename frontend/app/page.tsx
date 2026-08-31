import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getActiveDraw, listDraws, type DrawState, type Currency, type PoolOption } from "@/lib/api";
import { sanityClient } from "@/lib/sanity/client";
import {
  ALL_DRAWS_QUERY,
  HERO_CONTENT_QUERY,
  SECTION_CONTENT_QUERY,
  TESTIMONIALS_QUERY,
  type CMSHeroContent,
  type CMSSectionContent,
  type CMSTestimonial,
} from "@/lib/sanity/queries";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Trophy, CheckCircle2, ShieldCheck, Ticket, Sparkles, Award, HelpCircle } from "lucide-react";
import { InteractiveTicketConfigurator } from "@/components/InteractiveTicketConfigurator";
import { TestimonialsNewsletter } from "@/components/TestimonialsNewsletter";

export const metadata: Metadata = {
  title: "Rimna International Digital Lottery — Transparent Live Video Draws & Real Payouts",
  description:
    "Ethiopia & Diaspora's premier transparent digital lottery. Real cash prizes drawn live on video by company founders. Top 10 guaranteed winners per draw.",
};

export const revalidate = 0;

function mapSanityDraw(s: any): DrawState {
  const price = s.ticketPrice || 100;
  const curr = (s.currency === "USD" ? "USD" : "ETB") as Currency;
  const isUSD = curr === "USD";

  const pools: PoolOption[] = [
    { size: 1000, label: "1,000 (1K)", pool: isUSD ? `$${price * 1000}` : `${(price * 1000).toLocaleString()} ETB`, jackpot: isUSD ? `$${Math.round(price * 1000 * 0.30)} (1st)` : `${Math.round(price * 1000 * 0.30).toLocaleString()} ETB (1st)`, totalSum: price * 1000 },
    { size: 2000, label: "2,000 (2K)", pool: isUSD ? `$${price * 2000}` : `${(price * 2000).toLocaleString()} ETB`, jackpot: isUSD ? `$${Math.round(price * 2000 * 0.30)} (1st)` : `${Math.round(price * 2000 * 0.30).toLocaleString()} ETB (1st)`, totalSum: price * 2000 },
    { size: 3000, label: "3,000 (3K)", pool: isUSD ? `$${price * 3000}` : `${(price * 3000).toLocaleString()} ETB`, jackpot: isUSD ? `$${Math.round(price * 3000 * 0.30)} (1st)` : `${Math.round(price * 3000 * 0.30).toLocaleString()} ETB (1st)`, totalSum: price * 3000 },
    { size: 5000, label: "5,000 (5K)", pool: isUSD ? `$${price * 5000}` : `${(price * 5000).toLocaleString()} ETB`, jackpot: isUSD ? `$${Math.round(price * 5000 * 0.30)} (1st)` : `${Math.round(price * 5000 * 0.30).toLocaleString()} ETB (1st)`, totalSum: price * 5000 },
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
  const [cmsDrawsRes, activeDrawState, fallbackDrawsRes, heroContentRes, sectionContentRes, testimonialsRes] = await Promise.allSettled([
    sanityClient.fetch<any[]>(ALL_DRAWS_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
    listDraws().catch(() => []),
    sanityClient.fetch<CMSHeroContent>(HERO_CONTENT_QUERY).catch(() => null),
    sanityClient.fetch<CMSSectionContent[]>(SECTION_CONTENT_QUERY).catch(() => null),
    sanityClient.fetch<CMSTestimonial[]>(TESTIMONIALS_QUERY).catch(() => null),
  ]);

  const rawCmsDraws = cmsDrawsRes.status === "fulfilled" ? cmsDrawsRes.value : null;
  const drawState = activeDrawState.status === "fulfilled" ? activeDrawState.value : null;
  const fallbackDraws = fallbackDrawsRes.status === "fulfilled" ? fallbackDrawsRes.value : [];
  const heroContent = heroContentRes.status === "fulfilled" ? heroContentRes.value : null;
  const sectionContents = sectionContentRes.status === "fulfilled" ? sectionContentRes.value : null;
  const testimonials = testimonialsRes.status === "fulfilled" ? testimonialsRes.value : null;

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

  return (
    <div style={{ paddingBottom: 60, width: "100%", overflowX: "hidden" }}>
      {/* ── 1. Full-Width Hero Section with Official User-Provided Panoramic Banner ── */}
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
          boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
          marginBottom: 36,
          overflow: "hidden",
          backgroundColor: "#0A1B3A",
        }}
      >
        {/* Full Section Official Background Banner */}
        <div style={{ position: "absolute", inset: 0, zIndex: 1 }}>
          <Image
            src="/images/rimna-official-hero.jpg"
            alt="Rimna International Digital Lottery Official Banner"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center center" }}
          />
        </div>

        {/* Sophisticated Dark Gradient Overlay for High Contrast Text */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(90deg, rgba(10, 27, 58, 0.94) 0%, rgba(10, 27, 58, 0.86) 52%, rgba(10, 27, 58, 0.65) 100%)",
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
            {/* Left Column: Live Jackpot Status & Action Buttons */}
            <div>
              {/* Trust Badges */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 14 }}>
                <span className="badge badge-gold">
                  <Trophy size={13} color="#D97706" /> 10 GUARANTEED WINNERS PER DRAW
                </span>
                <span className="badge" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34D399", border: "1px solid #059669", fontWeight: 800 }}>
                  <CheckCircle2 size={13} color="#34D399" /> 100% PUBLIC VIDEO BROADCAST
                </span>
              </div>

              {/* Title */}
              <h1
                className="display"
                style={{
                  fontSize: "clamp(1.85rem, 4.2vw, 2.85rem)",
                  fontWeight: 900,
                  color: "#FFFFFF",
                  lineHeight: 1.12,
                  marginBottom: 12,
                  textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                }}
              >
                {heroContent?.title || "Rimna International Digital Lottery"}
              </h1>

              <p
                style={{
                  fontSize: "clamp(0.9rem, 2vw, 1.05rem)",
                  color: "#F1F5F9",
                  lineHeight: 1.5,
                  maxWidth: 540,
                  marginBottom: 24,
                  textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                }}
              >
                {heroContent?.subtitle || "Choose your lucky number, select your participant pool, and watch our founders draw the 10 guaranteed winning numbers live on video stream."}
              </p>

              {/* High-Impact Action CTAs: Smooth Scroll & How It Works Guide */}
              <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
                <a
                  href="#choose-ticket"
                  className="casino-btn-red"
                  style={{
                    padding: "13px 24px",
                    fontSize: "0.95rem",
                    fontWeight: 900,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                    cursor: "pointer",
                  }}
                >
                  <Ticket size={18} /> Choose & Buy Ticket ↓
                </a>

                <Link
                  href="/how-it-works"
                  className="casino-btn-dark"
                  style={{
                    padding: "13px 20px",
                    fontSize: "0.95rem",
                    fontWeight: 800,
                    textDecoration: "none",
                    border: "1.5px solid #F59E0B",
                    background: "rgba(17, 24, 39, 0.85)",
                    backdropFilter: "blur(6px)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <Sparkles size={16} color="#F59E0B" /> How It Works & Guide
                </Link>
              </div>
            </div>

            {/* Right Column: Mini Box with 3D Gold Tumbler & Live Countdown */}
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

      {/* ── Page Inner Container for Centerpiece Content ── */}
      <div className="page-inner-container" style={{ marginTop: 28 }}>
        {/* ── 2. Interactive Ticket Configurator (Centerpiece) ── */}
        <div style={{ marginBottom: 54 }}>
          <InteractiveTicketConfigurator />
        </div>

        {/* ── 3. Bottom Testimonials & Newsletter Section ── */}
        <div style={{ marginBottom: 48 }}>
          <TestimonialsNewsletter cmsTestimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}
