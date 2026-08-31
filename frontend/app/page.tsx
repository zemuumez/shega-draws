import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getActiveDraw, listDraws, type DrawState, type Currency, type PoolOption } from "@/lib/api";
import { sanityClient } from "@/lib/sanity/client";
import {
  ALL_DRAWS_QUERY,
  HERO_CONTENT_QUERY,
  TESTIMONIALS_QUERY,
  type CMSHeroContent,
  type CMSTestimonial,
} from "@/lib/sanity/queries";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Trophy, CheckCircle2, Ticket, Sparkles, Award } from "lucide-react";
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
  const [cmsDrawsRes, activeDrawState, fallbackDrawsRes, heroContentRes, testimonialsRes] = await Promise.allSettled([
    sanityClient.fetch<any[]>(ALL_DRAWS_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
    listDraws().catch(() => []),
    sanityClient.fetch<CMSHeroContent>(HERO_CONTENT_QUERY).catch(() => null),
    sanityClient.fetch<CMSTestimonial[]>(TESTIMONIALS_QUERY).catch(() => null),
  ]);

  const rawCmsDraws = cmsDrawsRes.status === "fulfilled" ? cmsDrawsRes.value : null;
  const drawState = activeDrawState.status === "fulfilled" ? activeDrawState.value : null;
  const fallbackDraws = fallbackDrawsRes.status === "fulfilled" ? fallbackDrawsRes.value : [];
  const heroContent = heroContentRes.status === "fulfilled" ? heroContentRes.value : null;
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
    <div style={{ paddingBottom: 80, width: "100%", overflowX: "hidden" }}>
      {/* ── 1. Hero Showcase Banner (100% Uncovered & Completely Visible) ── */}
      <section
        style={{
          maxWidth: 1200,
          margin: "18px auto 24px",
          padding: "0 clamp(14px, 3vw, 28px)",
          boxSizing: "border-box",
        }}
      >
        {/* The Official Rimna Banner — Unobstructed, Full Image */}
        <div
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1200 / 480",
            minHeight: 220,
            maxHeight: 520,
            borderRadius: "20px",
            overflow: "hidden",
            border: "2px solid #F59E0B",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.12)",
            background: "#4B98E8",
          }}
        >
          <Image
            src="/images/rimna-official-hero.jpg"
            alt="Rimna International Digital Lottery Official Panoramic Banner"
            fill
            priority
            style={{ objectFit: "cover", objectPosition: "center center" }}
          />
        </div>

        {/* Sleek Action & Live Countdown Bar (Directly Below Banner) */}
        <div
          style={{
            marginTop: 14,
            background: "#FFFFFF",
            border: "2px solid #F59E0B",
            borderRadius: "16px",
            padding: "14px clamp(14px, 3vw, 24px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
            boxShadow: "0 4px 16px rgba(245, 158, 11, 0.12)",
          }}
        >
          {/* Trust Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span className="badge badge-gold" style={{ fontSize: "0.75rem", fontWeight: 800, padding: "5px 10px" }}>
              <Trophy size={14} color="#D97706" /> 10 Guaranteed Winners Per Draw
            </span>
            <span className="badge badge-green" style={{ fontSize: "0.75rem", fontWeight: 800, padding: "5px 10px" }}>
              <CheckCircle2 size={14} color="#059669" /> 100% Public Video Broadcast
            </span>
          </div>

          {/* Live Countdown Widget */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span className="mono" style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 800, textTransform: "uppercase" }}>
              Live Draw In:
            </span>
            <CountdownTimer target={deadline} />
          </div>

          {/* Action CTAs */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <a
              href="#choose-ticket"
              className="casino-btn-red"
              style={{
                padding: "10px 22px",
                fontSize: "0.9375rem",
                fontWeight: 900,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.35)",
              }}
            >
              <Ticket size={17} /> Choose & Buy Ticket ↓
            </a>

            <Link
              href="/how-it-works"
              className="casino-btn-gold"
              style={{
                padding: "10px 18px",
                fontSize: "0.9375rem",
                fontWeight: 900,
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Sparkles size={15} color="#111827" /> How It Works
            </Link>
          </div>
        </div>
      </section>

      {/* ── 2. Page Inner Container for Centerpiece Content ── */}
      <div className="page-inner-container" style={{ marginTop: 32 }}>
        {/* ── Interactive Ticket Configurator (Centerpiece) ── */}
        <div style={{ marginBottom: 56 }}>
          <InteractiveTicketConfigurator />
        </div>

        {/* ── Testimonials & Newsletter Section ── */}
        <div style={{ marginBottom: 48 }}>
          <TestimonialsNewsletter cmsTestimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}
