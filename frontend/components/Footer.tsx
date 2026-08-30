"use client";

import React from "react";
import Link from "next/link";
import { Ticket, ShieldCheck, Phone, Mail, Send, Award, Users } from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n/LanguageContext";
import type { CMSSiteSettings } from "@/lib/sanity/queries";

interface FooterProps {
  siteSettings?: CMSSiteSettings | null;
}

export function Footer({ siteSettings }: FooterProps) {
  const { language, t } = useLanguage();

  // CMS values with hardcoded fallbacks
  const siteName = siteSettings?.siteName || t.appName;
  const footerDesc =
    (language === "am" && siteSettings?.footerDescriptionAm) ||
    (language === "om" && siteSettings?.footerDescriptionOm) ||
    siteSettings?.footerDescription ||
    t.footer.description;
  const phone1 = siteSettings?.contactPhone || "+251 911 000 000";
  const phone2 = siteSettings?.contactPhoneSecondary || "0912 345 678";
  const email = siteSettings?.supportEmail || "support@rimnalottery.com";
  const telegramHandle = siteSettings?.telegramHandle || "@RimnaLotteryOfficial";
  const copyrightText = siteSettings?.copyrightText || t.footer.rights;
  const complianceText = siteSettings?.complianceText || t.footer.compliance;

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
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "var(--radius-sm)",
                  background: "linear-gradient(135deg, #FACC15 0%, #EAB308 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid #FDE047",
                }}
              >
                <Ticket size={18} color="#1E3A8A" />
              </div>
              <span className="display" style={{ fontSize: "1.25rem", color: "var(--blue-navy)", fontWeight: 800 }}>
                {siteName}
              </span>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: 18 }}>
              {footerDesc}
            </p>

            <LanguageSwitcher />
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--blue-navy)", textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.5px", fontWeight: 800 }}>
              {t.footer.quickLinks}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.875rem" }}>
              <Link href="/#draws-catalog" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t.nav.draws}</Link>
              <Link href="/enter" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t.nav.enter}</Link>
              <Link href="/entries" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t.nav.myEntries}</Link>
              <Link href="/results" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t.nav.results}</Link>
              <Link href="/admin/login" style={{ color: "var(--text-muted)", textDecoration: "none" }}>{t.nav.admin}</Link>
            </div>
          </div>

          {/* Pool Sizes & Transparency */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--blue-navy)", textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.5px", fontWeight: 800 }}>
              Pool Sizes & Transparency
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Users size={14} color="var(--blue-royal)" /> 1K, 2K, 3K, and 5K Ticket Capacities
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={14} color="var(--teal)" /> 100% Live Video Broadcast Draws
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={14} color="var(--gold-dark)" /> 10-Tier Fixed Guaranteed Prizes
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--blue-navy)", textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.5px", fontWeight: 800 }}>
              Customer Support
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={14} color="var(--blue-navy)" /> {phone1} / {phone2}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={14} color="var(--blue-navy)" /> {email}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Send size={14} color="#2A65E6" /> Official Telegram: {telegramHandle}
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
