import type { Metadata } from "next";
import { getActiveDraw, listDraws, type DrawState, type Currency, type PoolOption } from "@/lib/api";
import { sanityClient } from "@/lib/sanity/client";
import {
  ALL_DRAWS_QUERY,
  SITE_SETTINGS_QUERY,
  TESTIMONIALS_QUERY,
  ADVERTISEMENTS_QUERY,
  type CMSSiteSettings,
  type CMSTestimonial,
  type CMSAdvertisement,
} from "@/lib/sanity/queries";
import { CinematicStadiumHero } from "@/components/CinematicStadiumHero";
import { AdvertisementCarousel } from "@/components/AdvertisementCarousel";
import { InteractiveTicketConfigurator } from "@/components/InteractiveTicketConfigurator";
import { TestimonialsNewsletter } from "@/components/TestimonialsNewsletter";

export const metadata: Metadata = {
  title: "Rimna International Digital Lottery — 100% Live Video Draws & Real Payouts",
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
    total_prize_value: `${pools[pools.length - 1].pool}`,
    commitment: s.commitment || "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    prizes: [],
    custom_pools: pools,
  };
}

export default async function HomePage() {
  const [cmsDrawsRes, activeDrawState, fallbackDrawsRes, siteSettingsRes, testimonialsRes, adsRes] =
    await Promise.allSettled([
      sanityClient.fetch<any[]>(ALL_DRAWS_QUERY).catch(() => null),
      getActiveDraw().catch(() => null),
      listDraws().catch(() => []),
      sanityClient.fetch<CMSSiteSettings>(SITE_SETTINGS_QUERY).catch(() => null),
      sanityClient.fetch<CMSTestimonial[]>(TESTIMONIALS_QUERY).catch(() => null),
      sanityClient.fetch<CMSAdvertisement[]>(ADVERTISEMENTS_QUERY).catch(() => null),
    ]);

  const rawCmsDraws = cmsDrawsRes.status === "fulfilled" ? cmsDrawsRes.value : null;
  const drawState = activeDrawState.status === "fulfilled" ? activeDrawState.value : null;
  const fallbackDraws = fallbackDrawsRes.status === "fulfilled" ? fallbackDrawsRes.value : [];
  const siteSettings = siteSettingsRes.status === "fulfilled" ? siteSettingsRes.value : null;
  const testimonials = testimonialsRes.status === "fulfilled" ? testimonialsRes.value : null;
  const ads = adsRes.status === "fulfilled" ? adsRes.value : null;

  // Convert CMS draws to DrawState
  const mappedCmsDraws = rawCmsDraws && rawCmsDraws.length > 0
    ? rawCmsDraws.map(mapSanityDraw)
    : [];

  const cmsIds = new Set(mappedCmsDraws.map((d) => d.draw_id));
  const combinedDraws = [
    ...mappedCmsDraws,
    ...fallbackDraws.filter((d) => !cmsIds.has(d.draw_id)),
  ];

  const allDraws = combinedDraws.length > 0 ? combinedDraws : fallbackDraws;
  const approvedOpenDraws = allDraws.filter((d) => d.status === "open");
  const currentApprovedDraw =
    approvedOpenDraws.find((d) => d.id === drawState?.id) ||
    approvedOpenDraws[0] ||
    drawState ||
    allDraws[0];

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* ── 1. Section: Screenful Cinematic Hero (Stadium Atmosphere / Deep Navy & 3D Gold Particles) ── */}
      <CinematicStadiumHero />

      {/* ── 2. Section: Promotional Advertisements & Teasers (Soft Warm Champagne Surface) ── */}
      <section
        style={{
          background: "#FAF8F2",
          borderTop: "1px solid #EFE8D8",
          borderBottom: "1px solid #EFE8D8",
          padding: "48px 0 36px",
          width: "100%",
        }}
      >
        <AdvertisementCarousel cmsAds={ads} />
      </section>

      {/* ── 3. Section: Centerpiece Interactive Ticket Configurator (Crisp White Banknote Surface) ── */}
      <section
        id="choose-ticket"
        style={{
          background: "#FFFFFF",
          borderBottom: "1.5px solid #E5E7EB",
          padding: "56px 0 60px",
          width: "100%",
        }}
      >
        <div className="page-inner-container">
          <InteractiveTicketConfigurator />
        </div>
      </section>

      {/* ── 4. Section: Winner Testimonials & Community Alerts (Sleek Dark VIP Lounge Surface) ── */}
      <section
        style={{
          background: "linear-gradient(180deg, #111827 0%, #1F2937 50%, #0B0F19 100%)",
          borderTop: "2px solid #FDE047",
          padding: "56px 0 72px",
          width: "100%",
        }}
      >
        <div className="page-inner-container">
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <span
              style={{
                background: "rgba(253, 224, 71, 0.15)",
                border: "1px solid #FDE047",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "0.75rem",
                fontWeight: 900,
                color: "#FEF08A",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              ⭐ 100% TRANSPARENT PLAYER PROOFS
            </span>
            <h2
              className="display"
              style={{
                fontSize: "clamp(1.5rem, 3.2vw, 2.2rem)",
                fontWeight: 900,
                color: "#FFFFFF",
                margin: "8px 0 4px",
              }}
            >
              Real Winners. Instant Video Payouts.
            </h2>
            <p style={{ color: "#94A3B8", fontSize: "0.9375rem", margin: 0 }}>
              Hear directly from verified Ethiopian & Diaspora winners who watched their numbers drawn live.
            </p>
          </div>

          <TestimonialsNewsletter cmsTestimonials={testimonials} />
        </div>
      </section>
    </div>
  );
}
