import type { Metadata } from "next";
import Link from "next/link";
import { Ticket, ShieldCheck, Sparkles, CheckCircle2, Trophy, Clock } from "lucide-react";
import { sanityClient } from "@/lib/sanity/client";
import {
  ACTIVE_DRAW_QUERY,
  ALL_DRAWS_QUERY,
  PROMOTIONS_QUERY,
  FAQS_QUERY,
  type ActiveDraw,
  type CMSPromotion,
  type CMSFAQ,
} from "@/lib/sanity/queries";
import { getActiveDraw, listDraws, type DrawState } from "@/lib/api";
import { CountdownTimer } from "@/components/CountdownTimer";
import { PromoEventBanner } from "@/components/PromoEventBanner";
import { DrawsExplorer, type ExtendedDrawItem } from "@/components/DrawsExplorer";
import { PrizeSpotlight } from "@/components/PrizeSpotlight";
import { QuickPickTester } from "@/components/QuickPickTester";
import { FairnessDiagram } from "@/components/FairnessDiagram";
import { WinnersFeed } from "@/components/WinnersFeed";
import { HowItWorks } from "@/components/HowItWorks";
import { FAQSection } from "@/components/FAQSection";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export const metadata: Metadata = {
  title: "PrimeDraws — Provably Fair Digital Raffle & Lottery",
  description: "Browse live prize pools, upcoming holiday jackpots, and verified historical draws. Pick a number, pay securely, and audit the results in your browser.",
};

// Revalidate every 30 seconds for live entries & draw updates
export const revalidate = 30;

export default async function HomePage() {
  // Fetch CMS data and API state concurrently
  const [cmsDrawRes, allCmsDrawsRes, promosRes, faqsRes, activeDrawApiRes, allDrawsApiRes] = await Promise.allSettled([
    sanityClient.fetch<ActiveDraw>(ACTIVE_DRAW_QUERY).catch(() => null),
    sanityClient.fetch<any[]>(ALL_DRAWS_QUERY).catch(() => null),
    sanityClient.fetch<CMSPromotion[]>(PROMOTIONS_QUERY).catch(() => null),
    sanityClient.fetch<CMSFAQ[]>(FAQS_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
    listDraws().catch(() => []),
  ]);

  const cmsDraw     = cmsDrawRes.status === "fulfilled" ? cmsDrawRes.value : null;
  const allCmsDraws = allCmsDrawsRes.status === "fulfilled" && allCmsDrawsRes.value ? allCmsDrawsRes.value : [];
  const promos      = promosRes.status === "fulfilled" && promosRes.value ? promosRes.value : undefined;
  const faqs        = faqsRes.status === "fulfilled" && faqsRes.value ? faqsRes.value : undefined;
  const activeDraw  = activeDrawApiRes.status === "fulfilled" ? activeDrawApiRes.value : null;
  const allDraws    = allDrawsApiRes.status === "fulfilled" && allDrawsApiRes.value ? allDrawsApiRes.value : [];

  // Intelligently merge CMS draws + Go backend DB draws
  const drawsMap = new Map<string, ExtendedDrawItem>();

  // 1. Add DB draws
  for (const d of allDraws) {
    drawsMap.set(d.draw_id, {
      ...d,
      id: d.id,
      draw_id: d.draw_id,
      status: d.status as any,
      deadline: d.deadline,
    });
  }

  // 2. Overlay / Add CMS draws (rich titles, localized descriptions, prize tiers, hero images)
  for (const c of allCmsDraws) {
    const existing = drawsMap.get(c.drawId);
    drawsMap.set(c.drawId, {
      id: existing?.id ?? c._id,
      draw_id: c.drawId,
      title: c.title,
      titleAm: c.titleAm,
      titleOm: c.titleOm,
      description: c.description,
      descriptionAm: c.descriptionAm,
      descriptionOm: c.descriptionOm,
      status: (existing?.status ?? c.status ?? "open") as any,
      deadline: existing?.deadline ?? c.deadline ?? new Date(Date.now() + 86400000 * 7).toISOString(),
      ticket_price: c.ticketPrice ?? existing?.ticket_price ?? 100,
      totalPrizeValue: c.totalPrizeValue,
      heroImage: c.heroImage,
      prizes: c.prizes ?? existing?.prizes,
      winning_numbers: existing?.winning_numbers ?? c.winningNumbers,
      seed: existing?.seed ?? c.seed,
      commitment: existing?.commitment ?? c.commitment,
    });
  }

  // If both empty, fallback gracefully with initial flagship draw
  if (drawsMap.size === 0) {
    drawsMap.set("PD-2026-08A", {
      id: "draw-1",
      draw_id: "PD-2026-08A",
      title: "Grand Meskel & Holiday Jackpot",
      description: "Pick your lucky number (00–99), pay conveniently via Telebirr or CBE Birr, and verify the cryptographic seed on draw day.",
      status: "open",
      deadline: new Date(Date.now() + 86400000 * 5).toISOString(),
      ticket_price: 100,
      totalPrizeValue: "ETB 25,000,000+",
      prizes: [
        { rank: 1, label: "1st Prize · Grand Jackpot", prizeTitle: "Luxury 4-Bedroom Villa in Bole Bulbula", valueAmount: "ETB 15,000,000" },
        { rank: 2, label: "2nd Prize · Luxury EV", prizeTitle: "2026 Toyota bZ4X Electric SUV", valueAmount: "ETB 5,500,000" },
      ],
    });
  }

  const catalogDraws = Array.from(drawsMap.values());
  const deadline = cmsDraw?.deadline ?? activeDraw?.deadline ?? catalogDraws[0]?.deadline;

  return (
    <div className="container" style={{ paddingTop: 28 }}>
      {/* ── 1. Hero Section ────────────────────────────────────────────── */}
      <section
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 32,
          padding: "36px 0 24px",
        }}
      >
        <div style={{ maxWidth: 660 }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            <span className="badge badge-gold">
              <Sparkles size={11} /> {activeDraw?.draw_id ?? cmsDraw?.drawId ?? "PD-2026-08A"} · LIVE RAFFLE OPEN
            </span>
            <span className="badge badge-teal" style={{ display: "none" }}>
              <CheckCircle2 size={11} /> Verified Fair
            </span>
          </div>

          <h1
            className="display"
            style={{
              fontSize: "clamp(2.15rem, 5.5vw, 3.25rem)",
              color: "var(--paper)",
              lineHeight: 1.08,
              marginBottom: 16,
              letterSpacing: "-0.02em",
            }}
          >
            {cmsDraw?.title ?? "One Dream Villa. One Electric SUV. Eight More Life-Changing Rewards."}
          </h1>

          <p
            style={{
              color: "var(--paper-muted)",
              fontSize: "1.0625rem",
              lineHeight: 1.68,
              maxWidth: 580,
              marginBottom: 28,
            }}
          >
            {cmsDraw?.description ??
              "Choose your lucky number (00–99), pay conveniently via Telebirr or CBE Birr, and verify the cryptographic seed on draw day. 100% transparent and provably fair."}
          </p>

          {/* Quick CTA Actions */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: "center" }}>
            <Link
              href="/enter"
              className="btn-base btn-primary"
              style={{ padding: "14px 28px", fontSize: "1rem" }}
            >
              <Ticket size={18} /> Enter Active Draw
            </Link>

            <Link
              href="#draws-catalog"
              className="btn-base btn-secondary"
              style={{ padding: "14px 22px", fontSize: "0.9375rem" }}
            >
              <Trophy size={17} /> Explore All Draws
            </Link>

            <Link
              href="/results"
              style={{
                color: "var(--gray)",
                fontSize: "0.875rem",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "8px 12px",
              }}
            >
              <ShieldCheck size={16} color="var(--teal-soft)" /> Audit Fairness
            </Link>
          </div>
        </div>

        {/* Live Draw Ticker Card */}
        {deadline && (
          <div
            className="glass-card-gold animate-fade"
            style={{
              padding: "24px 28px",
              borderRadius: "var(--radius-lg)",
              minWidth: 260,
              alignSelf: "center",
              margin: "0 auto",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <Clock size={16} color="var(--gold)" />
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gold-soft)", textTransform: "uppercase", letterSpacing: 1 }}>
                Entries Close In
              </span>
            </div>
            <CountdownTimer target={deadline} />
            <div
              className="mono"
              style={{
                fontSize: "0.6875rem",
                color: "var(--gray)",
                marginTop: 16,
                borderTop: "1px solid var(--gray-line)",
                paddingTop: 10,
                textAlign: "center",
              }}
            >
              Draw ID: #{activeDraw?.draw_id ?? cmsDraw?.drawId ?? "PD-2026-08A"}
            </div>
          </div>
        )}
      </section>

      {/* ── 2. Featured Events, Deals & Sponsored Ads Section ──────────── */}
      <ScrollReveal delay={100}>
        <PromoEventBanner promotions={promos} />
      </ScrollReveal>

      {/* ── 3. Flagship Draws Catalog (Current, Upcoming, Past Filters) ─── */}
      <ScrollReveal delay={150}>
        <DrawsExplorer initialDraws={catalogDraws} />
      </ScrollReveal>

      {/* ── 4. Grand Prize Showcase ────────────────────────────────────── */}
      <ScrollReveal delay={200}>
        <PrizeSpotlight prizes={cmsDraw?.prizes} />
      </ScrollReveal>

      {/* ── 5. Interactive Quick-Pick Tester ───────────────────────────── */}
      <ScrollReveal delay={200}>
        <QuickPickTester />
      </ScrollReveal>

      {/* ── 6. Cryptographic Fairness Explainer ────────────────────────── */}
      <ScrollReveal delay={200}>
        <FairnessDiagram />
      </ScrollReveal>

      {/* ── 7. Verified Recent Winners Feed ────────────────────────────── */}
      <ScrollReveal delay={200}>
        <WinnersFeed />
      </ScrollReveal>

      {/* ── 8. How It Works 3-Step Guide ───────────────────────────────── */}
      <ScrollReveal delay={200}>
        <HowItWorks />
      </ScrollReveal>

      {/* ── 9. Interactive FAQ Accordion ───────────────────────────────── */}
      <ScrollReveal delay={200}>
        <FAQSection faqs={faqs} />
      </ScrollReveal>
    </div>
  );
}
