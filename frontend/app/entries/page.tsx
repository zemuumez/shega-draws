import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { SITE_SETTINGS_QUERY, type CMSSiteSettings } from "@/lib/sanity/queries";
import { EntriesView } from "@/components/EntriesView";

export const metadata: Metadata = {
  title: "My Tickets & Entries — Rimna Digital Lottery",
  description: "View and verify your active lottery tickets, lucky numbers, and live draw winning payouts.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function EntriesPage() {
  const siteSettings = await sanityClient.fetch<CMSSiteSettings>(SITE_SETTINGS_QUERY).catch(() => null);

  const heroBannerUrl =
    siteSettings?.entriesHeroBannerImageUrl ||
    siteSettings?.heroBannerImageUrl ||
    "/images/rimna-stadium-hero.jpg";

  return (
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
        position: "relative",
        backgroundImage: `url(${heroBannerUrl})`,
        backgroundAttachment: "fixed",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* Background Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.6) 40%, rgba(15, 23, 42, 0.85) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <EntriesView siteSettings={siteSettings} />
    </div>
  );
}
