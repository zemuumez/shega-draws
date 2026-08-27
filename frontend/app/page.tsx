import type { Metadata } from "next";
import Link from "next/link";
import { Ticket, ShieldCheck, Sparkles, Trophy, Clock, CheckCircle2 } from "lucide-react";
import { sanityClient } from "@/lib/sanity/client";
import {
  ACTIVE_DRAW_QUERY,
  ALL_DRAWS_QUERY,
  PROMOTIONS_QUERY,
  type ActiveDraw,
  type CMSPromotion,
} from "@/lib/sanity/queries";
import { getActiveDraw, listDraws, type DrawState } from "@/lib/api";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PromoEventBanner } from "@/components/PromoEventBanner";
import { DrawsExplorer } from "@/components/DrawsExplorer";
import { PrizeSpotlight } from "@/components/PrizeSpotlight";
import { QuickPickTester } from "@/components/QuickPickTester";
import { FairnessDiagram } from "@/components/FairnessDiagram";
import { WinnersFeed } from "@/components/WinnersFeed";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQSection } from "@/components/FAQSection";

export const metadata: Metadata = {
  title: "PrimeDraws — Provably Fair Digital Raffle & Lottery",
  description: "Browse live prize pools, upcoming holiday jackpots, and verified historical draws. Pick a number, pay securely, and audit the results in your browser.",
};

// Revalidate every 30 seconds for live entries & draw updates
export const revalidate = 30;

export default async function HomePage() {
  // Fetch CMS data and API state concurrently
  const [cmsDrawRes, allCmsDrawsRes, promosRes, activeDrawApiRes, allDrawsApiRes] = await Promise.allSettled([
    sanityClient.fetch<ActiveDraw>(ACTIVE_DRAW_QUERY).catch(() => null),
    sanityClient.fetch<any[]>(ALL_DRAWS_QUERY).catch(() => null),
    sanityClient.fetch<CMSPromotion[]>(PROMOTIONS_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
    listDraws().catch(() => []),
  ]);

  const cmsDraw     = cmsDrawRes.status === "fulfilled" ? cmsDrawRes.value : null;
  const promos      = promosRes.status === "fulfilled" && promosRes.value ? promosRes.value : undefined;
  const activeDraw  = activeDrawApiRes.status === "fulfilled" ? activeDrawApiRes.value : null;
  const allDraws    = allDrawsApiRes.status === "fulfilled" && allDrawsApiRes.value ? allDrawsApiRes.value : [];

  const deadline = cmsDraw?.deadline ?? activeDraw?.deadline ?? allDraws[0]?.deadline;

  return (
    <div className="container" style={{ paddingTop: 20 }}>
      {/* ── 1. Hero Section (Clean Light Theme) ─────────────────────────── */}
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 32,
          padding: "32px 0 20px",
        }}
      >
        <div style={{ maxWidth: 640 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span className="badge badge-gold">
              <Sparkles size={11} /> OFFICIAL DIGITAL RAFFLE · ENTRIES OPEN
            </span>
          </div>

          <h1
            className="display"
            style={{
              fontSize: "clamp(2rem, 4.8vw, 3rem)",
              color: "var(--text-main)",
              lineHeight: 1.12,
              marginBottom: 14,
              fontWeight: 800,
            }}
          >
            {cmsDraw?.title ?? "100 Birr Ticket. 10 Guaranteed Cash Winners."}
          </h1>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.0625rem",
              lineHeight: 1.6,
              maxWidth: 560,
              marginBottom: 24,
            }}
          >
            {cmsDraw?.description ??
              "Pick your lucky two-digit number (00–99). 1st place wins 80,000 ETB, 2nd wins 65,000 ETB, 3rd wins 40,000 ETB, down to 10th place. 100% verified & auditable."}
          </p>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/enter"
              className="btn-base btn-primary"
              style={{ padding: "12px 24px", fontSize: "1rem" }}
            >
              <Ticket size={18} /> Buy Ticket (100 ETB)
            </Link>

            <Link
              href="#draws-catalog"
              className="btn-base btn-secondary"
              style={{ padding: "12px 20px", fontSize: "0.9375rem" }}
            >
              <Trophy size={16} color="var(--gold-dark)" /> View All Draws
            </Link>

            <Link
              href="/results"
              style={{
                color: "var(--text-muted)",
                fontSize: "0.875rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 600,
              }}
            >
              <ShieldCheck size={16} color="var(--teal)" /> Audit Results
            </Link>
          </div>
        </div>

        {/* Live Draw Ticker Card */}
        {deadline && (
          <div
            className="card-base"
            style={{
              padding: "24px 28px",
              borderRadius: "var(--radius-lg)",
              minWidth: 280,
              background: "linear-gradient(135deg, #FEF3C7 0%, #FFFFFF 100%)",
              border: "1.5px solid #FDE68A",
              alignSelf: "center",
              margin: "0 auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Clock size={16} color="var(--gold-dark)" />
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gold-dark)", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 700 }}>
                Next Live Draw In
              </span>
            </div>
            <CountdownTimer target={deadline} />
            <div
              className="mono"
              style={{
                fontSize: "0.6875rem",
                color: "var(--text-subtle)",
                marginTop: 14,
                borderTop: "1px solid #FDE68A",
                paddingTop: 8,
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              Active Draw: #{activeDraw?.draw_id ?? cmsDraw?.drawId ?? "PD-2026-08A"}
            </div>
          </div>
        )}
      </section>

      {/* ── 2. Featured Events, Deals & Sponsored Ads Section ──────────── */}
      <PromoEventBanner promotions={promos} />

      {/* ── 3. Flagship Draws Catalog (Physical Lottery Tickets) ────────── */}
      <DrawsExplorer initialDraws={allDraws} />

      {/* ── 4. Grand Prize Spotlight (Top 10 Breakdown Highlight) ──────── */}
      <PrizeSpotlight />

      {/* ── 5. Interactive Quick-Pick Tester ───────────────────────────── */}
      <QuickPickTester />

      {/* ── 6. Cryptographic Fairness Explainer ────────────────────────── */}
      <FairnessDiagram />

      {/* ── 7. Verified Recent Winners Feed ────────────────────────────── */}
      <WinnersFeed />

      {/* ── 8. How It Works 3-Step Guide ───────────────────────────────── */}
      <HowItWorks />

      {/* ── 9. Interactive FAQ Accordion ───────────────────────────────── */}
      <FAQSection />
    </div>
  );
}
