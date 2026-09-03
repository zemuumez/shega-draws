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
    { size: 2000, label: "2,000 (2K)", pool: isUSD ? `$${price * 2000}` : `${(price * 2000).toLocaleString()} ETB`, jackpot: isUSD ? `$${Math.round(price * 1000 * 0.30)} (1st)` : `${Math.round(price * 1000 * 0.30).toLocaleString()} ETB (1st)`, totalSum: price * 2000 },
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
    <div style={{ paddingBottom: 80, width: "100%", overflowX: "hidden" }}>
      {/* ── 1. Screenful Cinematic Hero (Stadium / Arena Concept with Floating 3D Particles & Bottom Tier Selector) ── */}
      <CinematicStadiumHero />

      {/* ── 2. Promotional Advertisements Carousel (Cars, Real Estate Villa, Smart Appliances) ── */}
      <div style={{ marginTop: 44 }}>
        <AdvertisementCarousel cmsAds={ads} />
      </div>

      {/* ── 3. Page Inner Container for Centerpiece Interactive Configurator & Testimonials ── */}
      <div className="page-inner-container" style={{ marginTop: 28 }}>
        {/* Interactive Ticket Configurator (Centerpiece) */}
        <div style={{ marginBottom: 56 }}>
          <InteractiveTicketConfigurator />
        </div>

        {/* Testimonials Section */}
        <div style={{ marginBottom: 48 }}>
          <TestimonialsNewsletter cmsTestimonials={testimonials} />
        </div>
      </div>
    </div>
  );
}
