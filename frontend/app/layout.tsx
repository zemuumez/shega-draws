import type { Metadata } from "next";
import "../styles/globals.css";
import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: { default: "Shega Draws — Digital Lottery", template: "%s · Shega Draws" },
  description: "A transparent, cryptographically verifiable digital raffle. Pick your number, pay, and trust the outcome.",
  keywords: ["lottery", "raffle", "draw", "Ethiopia", "Telebirr", "shega draws"],
  openGraph: {
    type: "website",
    siteName: "Shega Draws",
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
      <body>
        <Nav />
        <main id="main-content" className="page-content">
          {children}
        </main>
      </body>
    </html>
  );
}
