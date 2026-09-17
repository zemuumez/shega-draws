"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShieldCheck, Phone, Mail, Send, Award, Users } from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n/LanguageContext";
import type { CMSSiteSettings } from "@/lib/sanity/queries";

interface FooterProps {
  siteSettings?: CMSSiteSettings | null;
}

export function Footer({ siteSettings }: FooterProps) {
  const pathname = usePathname();
  const { language, t, getLocalized } = useLanguage();

  if (pathname?.startsWith("/studio")) {
    return null;
  }

  // CMS values with localized fallbacks
  const siteName = getLocalized(siteSettings, "siteName", t.appName);
  const footerDesc = getLocalized(siteSettings, "footerDescription", t.footer.description);
  const quickLinksTitle = getLocalized(siteSettings, "footerQuickLinksTitle", t.footer.quickLinks);
  const poolTransparencyTitle = getLocalized(siteSettings, "footerPoolTransparencyTitle", t.footer.poolTransparencyTitle);
  const poolFeature1 = getLocalized(siteSettings, "footerFeature1", t.footer.poolFeature1);
  const poolFeature2 = getLocalized(siteSettings, "footerFeature2", t.footer.poolFeature2);
  const poolFeature3 = getLocalized(siteSettings, "footerFeature3", t.footer.poolFeature3);
  const supportTitle = getLocalized(siteSettings, "footerSupportTitle", t.footer.customerSupportTitle);
  const telegramLabel = getLocalized(siteSettings, "footerTelegramLabel", t.footer.officialTelegramLabel);
  const phone1 = siteSettings?.contactPhone || "+251 911 000 000";
  const phone2 = siteSettings?.contactPhoneSecondary || "+251 920 000 000";
  const email = siteSettings?.supportEmail || "support@rimnalottery.com";
  const telegramHandle = siteSettings?.telegramHandle || "@RimnaLotteryOfficial";
  const copyrightText = getLocalized(siteSettings, "copyrightText", t.footer.rights);
  const complianceText = getLocalized(siteSettings, "complianceText", t.footer.compliance);

  return (
    <footer
      style={{
        background: "#FFFFFF",
        borderTop: "1.5px solid var(--blue-border)",
        padding: "48px 20px 32px",
        marginTop: 56,
      }}
    >
      <div className="container" style={{ maxWidth: 1160 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32, marginBottom: 40 }}>
          {/* Brand Column */}
          <div style={{ maxWidth: 340 }}>
            <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
              <Image
                src="/images/rimna-brand-logo.png"
                alt="Rimna International Digital Lottery"
                width={200}
                height={50}
                style={{ height: "46px", width: "auto", objectFit: "contain" }}
              />
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: 18 }}>
              {footerDesc}
            </p>

            <LanguageSwitcher />
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--blue-navy)", textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.5px", fontWeight: 800 }}>
              {quickLinksTitle}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.875rem" }}>
              <Link href="/#choose-ticket" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t.nav.draws}</Link>
              <Link href="/how-it-works" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t.nav.howItWorks}</Link>
              <Link href="/results" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t.nav.results}</Link>
              <Link href="/about" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t.nav.whyRimna}</Link>
            </div>
          </div>

          {/* Pool Sizes & Transparency */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--blue-navy)", textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.5px", fontWeight: 800 }}>
              {poolTransparencyTitle}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={14} color="var(--blue-royal)" /> {poolFeature1}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={14} color="var(--teal)" /> {poolFeature2}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={14} color="var(--gold-dark)" /> {poolFeature3}
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--blue-navy)", textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.5px", fontWeight: 800 }}>
              {supportTitle}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={14} color="var(--blue-navy)" /> {phone1} / {phone2}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={14} color="var(--blue-navy)" /> {email}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Send size={14} color="#2A65E6" /> {telegramLabel} {telegramHandle}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--gray-line)",
            paddingTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontSize: "0.75rem",
            color: "var(--text-subtle)",
          }}
        >
          <div>
            © {new Date().getFullYear()} {siteName}. {copyrightText}
          </div>
          <div>
            {complianceText}
          </div>
        </div>
      </div>
    </footer>
  );
}
