import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getActiveDraw, listDraws, type DrawState, type Currency } from "@/lib/api";
import { sanityClient } from "@/lib/sanity/client";
import { ACTIVE_DRAW_QUERY, ALL_DRAWS_QUERY, JACKPOT_CARDS_QUERY, type ActiveDraw, type CMSJackpotCard } from "@/lib/sanity/queries";
import { CountdownTimer } from "@/components/CountdownTimer";
import { HeroBuyButton } from "@/components/HeroBuyButton";
import { Trophy, CheckCircle2, ShieldCheck, ArrowRight, Clock, Award } from "lucide-react";
import { JackpotCardsSection } from "@/components/JackpotCardsSection";
import { DrawsExplorer } from "@/components/DrawsExplorer";
import { TestimonialsNewsletter } from "@/components/TestimonialsNewsletter";

export const metadata: Metadata = {
  title: "Rimna Digital Lottery — Transparent Live Video Draws & Real Payouts",
  description:
    "Ethiopia & Diaspora's premier transparent digital lottery. Real cash prizes drawn live on video by company founders. Top 10 guaranteed winners per draw.",
};

export const revalidate = 10;

function mapCmsDrawToDrawState(doc: any): DrawState {
  const currency: Currency = doc.currency === "USD" ? "USD" : "ETB";
  const ticketPrice = doc.ticketPrice || 100;
  return {
    id: doc._id || doc.drawId,
    draw_id: doc.drawId || doc.title || "RDL-001",
    commitment: doc.commitment || "sha256-verified-draw-seed",
    status: (doc.status as any) || "open",
    title: doc.title || "Raffle Draw",
    currency: currency,
    ticket_price: ticketPrice,
    deadline: doc.deadline || new Date(Date.now() + 3 * 86400000).toISOString(),
    winning_numbers: doc.winningNumbers || {},
    prizes: (doc.prizes || []).map((p: any) => ({
      rank: p.rank,
      label: p.label || `Rank #${p.rank}`,
      prizeTitle: p.prizeTitle || p.label || `Rank #${p.rank}`,
      valueAmount: p.valueAmount || "",
      description: p.description || "",
    })),
    description: doc.description || "",
  };
}

export default async function HomePage() {
  const [cmsActive, cmsAllDrawsRes, cmsCardsRes, activeDrawState, allDrawsRes] = await Promise.allSettled([
    sanityClient.fetch<ActiveDraw>(ACTIVE_DRAW_QUERY).catch(() => null),
    sanityClient.fetch<any[]>(ALL_DRAWS_QUERY).catch(() => []),
    sanityClient.fetch<CMSJackpotCard[]>(JACKPOT_CARDS_QUERY).catch(() => []),
    getActiveDraw().catch(() => null),
    listDraws().catch(() => []),
  ]);

  const cmsData      = cmsActive.status === "fulfilled" ? cmsActive.value : null;
  const cmsAllDraws  = (cmsAllDrawsRes.status === "fulfilled" && cmsAllDrawsRes.value) ? cmsAllDrawsRes.value : [];
  const cmsCards     = (cmsCardsRes.status === "fulfilled" && cmsCardsRes.value) ? cmsCardsRes.value : [];
  const drawState    = activeDrawState.status === "fulfilled" ? activeDrawState.value : null;
  const backendDraws = allDrawsRes.status === "fulfilled" ? allDrawsRes.value : [];

  // Convert CMS documents to DrawState
  const mappedCmsDraws = cmsAllDraws.map(mapCmsDrawToDrawState);

  // Combine draws: CMS draws take priority at the top, followed by backend/fallback draws
  const allDrawsMap = new Set<string>();
  const combinedDraws: DrawState[] = [];

  for (const d of mappedCmsDraws) {
    if (!allDrawsMap.has(d.id) && !allDrawsMap.has(d.draw_id)) {
      allDrawsMap.add(d.id);
      allDrawsMap.add(d.draw_id);
      combinedDraws.push(d);
    }
  }

  for (const d of backendDraws) {
    if (!allDrawsMap.has(d.id) && !allDrawsMap.has(d.draw_id)) {
      allDrawsMap.add(d.id);
      allDrawsMap.add(d.draw_id);
      combinedDraws.push(d);
    }
  }

  const allDraws = combinedDraws.length > 0 ? combinedDraws : backendDraws;

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
      {/* ── 1. Current Active Admin-Approved Draw Hero Banner (Full Viewport Width & 0 Border Radius) ── */}
      <section
        className="hero-section-wrapper lottery-guilloche-bg reveal-item is-revealed"
        style={{
          background: "#FFFBEB",
          borderTop: "2px solid #F59E0B",
          borderBottom: "2px solid #F59E0B",
          borderLeft: "none",
          borderRight: "none",
          borderRadius: 0,
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.04)",
          marginBottom: 28,
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
                  <ShieldCheck size={15} color="var(--blue-navy)" /> 100% Live Video Draw
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.8125rem", color: "#111827", fontWeight: 700 }}>
                  <Award size={15} color="var(--gold-deep)" /> Transparent Capped Pools
                </span>
              </div>

              {/* Action Buttons */}
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
                  border: "2px solid #F59E0B",
                  background: "#FFFFFF",
                  boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
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
                      background: "rgba(17, 24, 39, 0.35)",
                    }}
                  />
                  <div style={{ position: "absolute", bottom: 8, left: 10, right: 10, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 6 }}>
                    <span className="badge" style={{ background: "#FFFFFF", color: "#111827", fontWeight: 800, fontSize: "0.6875rem" }}>
                      <Trophy size={12} color="#D97706" /> 100% Guaranteed Payouts
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
        <div className="reveal-item" style={{ marginBottom: 32 }}>
          <JackpotCardsSection cmsCards={cmsCards} />
        </div>

        {/* ── 3. Full Draws Catalog (Dedicated Full-Width Section) ── */}
        <div className="reveal-item" style={{ marginBottom: 40 }}>
          <DrawsExplorer initialDraws={allDraws} />
        </div>

        {/* ── 4. Bottom Testimonials & Newsletter Section ── */}
        <div className="reveal-item" style={{ marginBottom: 32 }}>
          <TestimonialsNewsletter />
        </div>
      </div>
    </div>
  );
}
