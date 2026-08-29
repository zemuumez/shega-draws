import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { Ticket, ShieldCheck, Sparkles, Trophy, Clock, CheckCircle2, ArrowRight, Zap, Users, Gift } from "lucide-react";
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
import { PromoEventBanner } from "@/components/PromoEventBanner";
import { DrawsExplorer } from "@/components/DrawsExplorer";
import { WinnersFeed } from "@/components/WinnersFeed";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQSection } from "@/components/FAQSection";

export const metadata: Metadata = {
  title: "PrimeDraws — Provably Fair Digital Raffle & Lottery",
  description: "Official verified multi-pool digital raffle tickets. Pick your lucky number, win guaranteed top 10 cash prizes, and audit results instantly.",
};

export const revalidate = 30;

export default async function HomePage() {
  const [cmsDrawRes, promosRes, activeDrawApiRes, allDrawsApiRes] = await Promise.allSettled([
    sanityClient.fetch<ActiveDraw>(ACTIVE_DRAW_QUERY).catch(() => null),
    sanityClient.fetch<CMSPromotion[]>(PROMOTIONS_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
    listDraws().catch(() => []),
  ]);

  const cmsDraw     = cmsDrawRes.status === "fulfilled" ? cmsDrawRes.value : null;
  const promos      = promosRes.status === "fulfilled" && promosRes.value ? promosRes.value : undefined;
  const activeDraw  = activeDrawApiRes.status === "fulfilled" ? activeDrawApiRes.value : null;
  const allDraws    = allDrawsApiRes.status === "fulfilled" && allDrawsApiRes.value ? allDrawsApiRes.value : [];

  const deadline = cmsDraw?.deadline ?? activeDraw?.deadline ?? allDraws[0]?.deadline ?? "2026-09-01T18:00:00Z";

  return (
    <div className="container" style={{ paddingTop: 16 }}>
      {/* ── 1. Modern Professional Hero Section with Visual Image ────── */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 36,
          alignItems: "center",
          padding: "28px 0 36px",
        }}
      >
        {/* Left Column: Headline & Value Proposition */}
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span className="badge badge-gold" style={{ fontSize: "0.75rem", padding: "5px 12px" }}>
              <Sparkles size={13} color="var(--gold-deep)" /> OFFICIAL DIGITAL RAFFLE · ENTRIES OPEN
            </span>
          </div>

          <h1
            className="display"
            style={{
              fontSize: "clamp(2.1rem, 4.5vw, 3.25rem)",
              color: "var(--blue-navy)",
              lineHeight: 1.12,
              marginBottom: 16,
              fontWeight: 800,
              letterSpacing: "-0.5px",
            }}
          >
            {cmsDraw?.title ?? "100 Birr Ticket. 10 Guaranteed Cash Winners."}
          </h1>

          <p
            style={{
              color: "var(--text-muted)",
              fontSize: "1.0625rem",
              lineHeight: 1.6,
              maxWidth: 540,
              marginBottom: 24,
            }}
          >
            {cmsDraw?.description ??
              "Choose your pool size (1K, 2K, 3K, or 5K people), pick your lucky number, and win up to 160,000 ETB in guaranteed cash prizes with 100% cryptographic fairness."}
          </p>

          {/* Value Highlights */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--teal-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CheckCircle2 size={16} color="var(--teal)" />
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--blue-navy)", fontWeight: 700 }}>
                10 Winners Every Draw
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--blue-bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ShieldCheck size={16} color="#2A65E6" />
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--blue-navy)", fontWeight: 700 }}>
                Provably Fair Algorithm
              </span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#FEF9C3", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap size={16} color="var(--gold-deep)" />
              </div>
              <span style={{ fontSize: "0.8125rem", color: "var(--blue-navy)", fontWeight: 700 }}>
                Instant Mobile Payouts
              </span>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/enter"
              className="btn-base btn-primary"
              style={{ padding: "13px 28px", fontSize: "1rem" }}
            >
              <Ticket size={18} /> Buy Ticket (100 ETB)
            </Link>

            <Link
              href="#draws-catalog"
              className="btn-base btn-secondary"
              style={{ padding: "13px 22px", fontSize: "0.9375rem" }}
            >
              <Trophy size={16} color="#2A65E6" /> Explore Draws
            </Link>
          </div>
        </div>

        {/* Right Column: Hero Image & Countdown Card */}
        <div style={{ position: "relative" }}>
          <div
            className="card-base"
            style={{
              overflow: "hidden",
              borderRadius: "var(--radius-xl)",
              border: "2px solid #FDE047",
              boxShadow: "0 16px 36px -6px rgba(42, 101, 230, 0.16)",
              background: "#FFFFFF",
              position: "relative",
            }}
          >
            {/* Optimized Visual Hero Banner Graphic */}
            <div style={{ position: "relative", width: "100%", height: 280 }}>
              <Image
                src="/images/hero-lottery.jpg"
                alt="PrimeDraws Gold and Blue Lottery Jackpot"
                fill
                priority
                style={{ objectFit: "cover" }}
              />
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(180deg, rgba(12, 38, 102, 0.15) 0%, rgba(12, 38, 102, 0.65) 100%)",
                }}
              />
              <div style={{ position: "absolute", bottom: 14, left: 16, right: 16, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                <span className="badge" style={{ background: "rgba(255, 255, 255, 0.95)", color: "var(--blue-navy)", fontWeight: 800 }}>
                  <Trophy size={13} color="var(--gold-dark)" /> 500,000 ETB Top Pool
                </span>
                <span className="mono" style={{ fontSize: "0.75rem", color: "#FFFFFF", fontWeight: 700 }}>
                  100% Auditable
                </span>
              </div>
            </div>

            {/* Countdown bar attached underneath the image */}
            <div style={{ padding: "18px 20px", background: "#FFFFFF" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Clock size={15} color="#2A65E6" />
                  <span className="mono" style={{ fontSize: "0.75rem", color: "var(--blue-navy)", textTransform: "uppercase", fontWeight: 800 }}>
                    Live Draw Countdown
                  </span>
                </div>
                <span className="badge badge-gold" style={{ fontSize: "0.6875rem" }}>
                  Active Pool
                </span>
              </div>
              <CountdownTimer target={deadline} />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. Featured Events, Deals & Sponsored Ads ──────────────────── */}
      <PromoEventBanner promotions={promos} />

      {/* ── 3. Official Flagship Draws Catalog (Tickets) ──────────────── */}
      <DrawsExplorer initialDraws={allDraws} />

      {/* ── 4. Verified Recent Winners Feed ────────────────────────────── */}
      <WinnersFeed />

      {/* ── 5. How It Works (Simple 3-Step Guide) ──────────────────────── */}
      <HowItWorks />

      {/* ── 6. FAQ Section ─────────────────────────────────────────────── */}
      <FAQSection />
    </div>
  );
}
