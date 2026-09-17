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

  // Site name from siteSettings with fallback to appName
  const siteName = getLocalized(siteSettings, "siteName", t.appName);

  // Footer UI texts dynamically resolved via CMS UI Translations (category: footer) with local language fallbacks
  const footerDesc = t.footer.description;
  const quickLinksTitle = t.footer.quickLinks;
  const poolTransparencyTitle = t.footer.poolTransparencyTitle;
  const poolFeature1 = t.footer.poolFeature1;
  const poolFeature2 = t.footer.poolFeature2;
  const poolFeature3 = t.footer.poolFeature3;
  const supportTitle = t.footer.customerSupportTitle;
  const telegramLabel = t.footer.officialTelegramLabel;
  const copyrightText = t.footer.rights;
  const complianceText = t.footer.compliance;

  // Footer navigation links (customizable in UI Translations under footer or nav)
  const linkDraws = t.footer.linkDraws || t.nav.draws;
  const linkHowItWorks = t.footer.linkHowItWorks || t.nav.howItWorks;
  const linkResults = t.footer.linkResults || t.nav.results;
  const linkWhyRimna = t.footer.linkWhyRimna || t.nav.whyRimna;

  // Official contact information from siteSettings
  const phone1 = siteSettings?.contactPhone || "+251 911 000 000";
  const phone2 = siteSettings?.contactPhoneSecondary;
  const email = siteSettings?.supportEmail || "support@rimnalottery.com";
  const email2 = siteSettings?.supportEmailSecondary;
  const telegramHandle = siteSettings?.telegramHandle || "@RimnaLotteryOfficial";
  const telegramUrl = siteSettings?.telegramUrl || (telegramHandle.startsWith("http") ? telegramHandle : `https://t.me/${telegramHandle.replace(/^@/, "")}`);

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
              <Link href="/#choose-ticket" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{linkDraws}</Link>
              <Link href="/how-it-works" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{linkHowItWorks}</Link>
              <Link href="/results" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{linkResults}</Link>
              <Link href="/about" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{linkWhyRimna}</Link>
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
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              {phone1 && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <Phone size={14} color="var(--blue-navy)" style={{ flexShrink: 0, marginTop: 3 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <a
                      href={`tel:${phone1.replace(/[^+\d]/g, "")}`}
                      style={{ color: "var(--text-muted)", textDecoration: "none" }}
                    >
                      {phone1}
                    </a>
                    {phone2 && phone2.trim() !== "" && phone2 !== phone1 && (
                      <a
                        href={`tel:${phone2.replace(/[^+\d]/g, "")}`}
                        style={{ color: "var(--text-muted)", textDecoration: "none", opacity: 0.9 }}
                      >
                        {phone2}
                      </a>
                    )}
                  </div>
                </div>
              )}
              {email && (
                <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                  <Mail size={14} color="var(--blue-navy)" style={{ flexShrink: 0, marginTop: 3 }} />
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <a
                      href={`mailto:${email}`}
                      style={{ color: "var(--text-muted)", textDecoration: "none", wordBreak: "break-all" }}
                    >
                      {email}
                    </a>
                    {email2 && email2.trim() !== "" && email2 !== email && (
                      <a
                        href={`mailto:${email2}`}
                        style={{ color: "var(--text-muted)", textDecoration: "none", wordBreak: "break-all", opacity: 0.9 }}
                      >
                        {email2}
                      </a>
                    )}
                  </div>
                </div>
              )}
              {telegramHandle && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Send size={14} color="#2A65E6" style={{ flexShrink: 0 }} />
                  <a
                    href={telegramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: "#2A65E6", textDecoration: "none", fontWeight: 600 }}
                  >
                    {telegramLabel} {telegramHandle}
                  </a>
                </div>
              )}
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
