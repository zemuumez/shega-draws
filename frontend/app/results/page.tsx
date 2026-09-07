import type { Metadata } from "next";
import { getActiveDraw } from "@/lib/api";
import { sanityClient } from "@/lib/sanity/client";
import { LATEST_RESULTS_QUERY, SITE_SETTINGS_QUERY, type CMSDrawResult, type CMSSiteSettings } from "@/lib/sanity/queries";
import { ResultsView } from "@/components/ResultsView";

export const metadata: Metadata = {
  title: "Draw Results & Live Broadcast — Rimna Digital Lottery",
  description: "Official audited live draw winning numbers announced on public broadcast stream.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function ResultsPage() {
  const [cmsResultsRes, draw, siteSettingsRes] = await Promise.allSettled([
    sanityClient.fetch<CMSDrawResult[]>(LATEST_RESULTS_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
    sanityClient.fetch<CMSSiteSettings>(SITE_SETTINGS_QUERY).catch(() => null),
  ]);

  const cmsResults = cmsResultsRes.status === "fulfilled" ? cmsResultsRes.value : null;
  const drawState = draw.status === "fulfilled" ? draw.value : null;
  const siteSettings = siteSettingsRes.status === "fulfilled" ? siteSettingsRes.value : null;

  return (
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
        position: "relative",
        backgroundImage: `url(${siteSettings?.heroBannerImageUrl || "/images/rimna-stadium-hero.jpg"})`,
        backgroundAttachment: "fixed",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* Background Overlay for High Contrast */}
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

      <ResultsView cmsResults={cmsResults} drawState={drawState} siteSettings={siteSettings} />
    </div>
  );
}
