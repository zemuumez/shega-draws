import type { Metadata } from "next";
import "../styles/globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";
import { ScrollProgressBar } from "@/components/ui/ScrollProgressBar";
import { sanityClient } from "@/lib/sanity/client";
import { SITE_SETTINGS_QUERY, type CMSSiteSettings } from "@/lib/sanity/queries";

export const metadata: Metadata = {
  title: { default: "Rimna International Digital Lottery — 100% Live Public Draws", template: "%s · Rimna Digital Lottery" },
  description: "A transparent, physical live video draw digital lottery. Pick your lucky number, choose your pool capacity, and win guaranteed cash prizes.",
  keywords: ["lottery", "raffle", "digital draw", "Ethiopia", "Telebirr", "CBE Birr", "Rimna Digital Lottery", "transparent lottery"],
  openGraph: {
    type: "website",
    siteName: "Rimna Digital Lottery",
    title: "Rimna International Digital Lottery — 100% Live Video Draws",
    description: "Pick your number, pay via Telebirr or CBE, and watch founders draw winning numbers live on video.",
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
};

export const revalidate = 0;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteSettings = await sanityClient.fetch<CMSSiteSettings>(SITE_SETTINGS_QUERY).catch(() => null);

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-subtle-mesh">
        <LanguageProvider>
          <ScrollProgressBar />
          <Nav siteSettings={siteSettings} />
          <main id="main-content" className="page-content">
            {children}
          </main>
          <Footer siteSettings={siteSettings} />
        </LanguageProvider>
      </body>
    </html>
  );
}
