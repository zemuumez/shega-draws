import type { Metadata } from "next";
import { sanityClient } from "@/lib/sanity/client";
import { SITE_SETTINGS_QUERY, type CMSSiteSettings } from "@/lib/sanity/queries";
import { AboutView } from "@/components/AboutView";

export const metadata: Metadata = {
  title: "Why Rimna Digital Lottery — Public Transparency & Live Draws",
  description: "Learn why Rimna Digital Lottery is Ethiopia's most transparent lottery. 100% live video draws, fixed pools, and 10 guaranteed winners.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AboutPage() {
  const siteSettings = await sanityClient.fetch<CMSSiteSettings>(SITE_SETTINGS_QUERY).catch(() => null);

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

      <AboutView siteSettings={siteSettings} />
    </div>
  );
}
