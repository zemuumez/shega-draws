import type { Metadata } from "next";
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
import { PaymentLogosFarm } from "@/components/PaymentLogosFarm";
import { AdvertisementCarousel } from "@/components/AdvertisementCarousel";
import { InteractiveTicketConfigurator } from "@/components/InteractiveTicketConfigurator";
import { TestimonialsNewsletter } from "@/components/TestimonialsNewsletter";

export const metadata: Metadata = {
  title: "Rimna International Digital Lottery — 100% Live Video Draws & Real Payouts",
  description:
    "Ethiopia & Diaspora's premier transparent digital lottery. Real cash prizes drawn live on video by company founders. Top 10 guaranteed winners per draw.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const [draws, siteSettings, testimonials, ads] = await Promise.all([
    sanityClient.fetch<import("@/lib/tickets").TicketDraw[]>(ALL_DRAWS_QUERY).catch(() => null),
    sanityClient.fetch<CMSSiteSettings>(SITE_SETTINGS_QUERY).catch(() => null),
    sanityClient.fetch<CMSTestimonial[]>(TESTIMONIALS_QUERY).catch(() => null),
    sanityClient.fetch<CMSAdvertisement[]>(ADVERTISEMENTS_QUERY).catch(() => null),
  ]);

  return (
    <div style={{ width: "100%", overflowX: "hidden" }}>
      {/* ── UNIFIED FIXED STILL PARALLAX BACKGROUND SECTION (Hero through Ticket Configurator) ── */}
      <div
        style={{
          position: "relative",
          backgroundImage: `url(${siteSettings?.heroBannerImageUrl || "/images/rimna-stadium-hero.jpg"})`,
          backgroundAttachment: "fixed",
          backgroundPosition: "center top",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          width: "100%",
        }}
      >
        {/* Continuous Dark & Warm Golden Radial Ambient Overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(15, 23, 42, 0.38) 35%, rgba(15, 23, 42, 0.65) 70%, rgba(15, 23, 42, 0.85) 100%)",
            pointerEvents: "none",
            zIndex: 1,
          }}
        />

        {/* 1. Screenful Cinematic Hero */}
        <div style={{ position: "relative", zIndex: 2 }}>
          <CinematicStadiumHero siteSettings={siteSettings} />
        </div>

        {/* 2. Promotional Advertisements & Teasers (Containing Payment Gateways at the Top) */}
        <section
          style={{
            position: "relative",
            zIndex: 2,
            background: "rgba(250, 248, 242, 0.85)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderTop: "1.5px solid rgba(239, 232, 216, 0.7)",
            borderBottom: "1.5px solid rgba(239, 232, 216, 0.7)",
            padding: "clamp(36px, 4.5vw, 56px) 0 clamp(48px, 6vw, 68px)",
            width: "100%",
          }}
        >
          {/* Top Payment Logos Farm */}
          <div data-page-reveal style={{ marginBottom: "clamp(36px, 5vw, 56px)" }}>
            <PaymentLogosFarm />
          </div>

          {/* Advertisement Showcase */}
          <div data-page-reveal><AdvertisementCarousel cmsAds={ads} /></div>
        </section>

        {/* 3. Centerpiece Interactive Ticket Configurator (Floating Translucent Glass Card Over The Still Background!) */}
        <section
          id="choose-ticket"
          style={{
            position: "relative",
            zIndex: 2,
            padding: "clamp(48px, 6vw, 84px) 0 clamp(64px, 8vw, 104px)",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <div className="page-inner-container">
            <InteractiveTicketConfigurator siteSettings={siteSettings} draws={draws || []} />
          </div>
        </section>
      </div>

      {/* ── 4. Section: Winner Testimonials & Community Alerts (Sleek Dark VIP Lounge Surface with Generous Separation) ── */}
      <section
        style={{
          background: "linear-gradient(180deg, #111827 0%, #1F2937 50%, #0B0F19 100%)",
          borderTop: "2px solid #FDE047",
          padding: "clamp(64px, 8vw, 96px) 0 clamp(72px, 9vw, 112px)",
          width: "100%",
        }}
      >
        <div className="page-inner-container">
          <div data-page-reveal><TestimonialsNewsletter cmsTestimonials={testimonials} /></div>
        </div>
      </section>
    </div>
  );
}
