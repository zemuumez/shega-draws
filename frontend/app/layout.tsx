import type { Metadata } from "next";
import "../styles/globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { sanityClient } from "@/lib/sanity/client";
import { TRANSLATIONS_QUERY, SITE_SETTINGS_QUERY, type CMSSiteSettings, type CMSTranslation } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: { default: "Rimna Digital Lottery — Cryptographic Digital Lottery & Raffles", template: "%s · Rimna Digital Lottery" },
  description: "A transparent, cryptographically verifiable digital raffle platform. Pick a number, pay securely, and verify the outcome yourself.",
  keywords: ["lottery", "raffle", "digital draw", "Ethiopia", "Telebirr", "CBE Birr", "Rimna Digital Lottery", "provably fair raffle"],
  openGraph: {
    type: "website",
    siteName: "Rimna Digital Lottery",
    title: "Rimna Digital Lottery — Provably Fair Digital Lottery",
    description: "Pick your number, pay via Telebirr or CBE, and verify the cryptographic seed on draw day.",
  },
};

export const revalidate = 60; // Revalidate layout data every 60 seconds

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Fetch CMS translations and site settings at the layout level
  const [cmsTranslationsRes, siteSettingsRes] = await Promise.allSettled([
    sanityClient.fetch<CMSTranslation[]>(TRANSLATIONS_QUERY).catch(() => null),
    sanityClient.fetch<CMSSiteSettings>(SITE_SETTINGS_QUERY).catch(() => null),
  ]);

  const cmsTranslations = cmsTranslationsRes.status === "fulfilled" ? cmsTranslationsRes.value : null;
  const siteSettings = siteSettingsRes.status === "fulfilled" ? siteSettingsRes.value : null;

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-subtle-mesh">
        <LanguageProvider cmsTranslations={cmsTranslations ?? undefined}>
          <ScrollProgressBar />
          <Nav />
          <main id="main-content" className="page-content">
            {children}
          </main>
          <Footer siteSettings={siteSettings} />
        </LanguageProvider>
      </body>
    </html>
  );
}
