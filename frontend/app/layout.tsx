import type { Metadata } from "next";
import "../styles/globals.css";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { LanguageProvider } from "@/lib/i18n/LanguageContext";

export const metadata: Metadata = {
  title: { default: "PrimeDraws — Cryptographic Digital Lottery & Raffles", template: "%s · PrimeDraws" },
  description: "A transparent, cryptographically verifiable digital raffle platform. Pick a number, pay securely, and verify the outcome yourself.",
  keywords: ["lottery", "raffle", "digital draw", "Ethiopia", "Telebirr", "CBE Birr", "PrimeDraws", "provably fair raffle"],
  openGraph: {
    type: "website",
    siteName: "PrimeDraws",
    title: "PrimeDraws — Provably Fair Digital Lottery",
    description: "Pick your number, pay via Telebirr or CBE, and verify the cryptographic seed on draw day.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="bg-subtle-mesh">
        <LanguageProvider>
          <Nav />
          <main id="main-content" className="page-content">
            {children}
          </main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
