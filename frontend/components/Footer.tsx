"use client";

import React from "react";
import Link from "next/link";
import { Ticket, ShieldCheck, Phone, Mail, Send, Award } from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n/LanguageContext";

export function Footer() {
  const { t } = useLanguage();

  return (
    <footer
      style={{
        background: "#FFFFFF",
        borderTop: "1px solid var(--gray-line)",
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
                  width: 32,
                  height: 32,
                  borderRadius: "var(--radius-sm)",
                  background: "var(--gold)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Ticket size={18} color="#FFFFFF" />
              </div>
              <span className="display" style={{ fontSize: "1.25rem", color: "var(--text-main)", fontWeight: 800 }}>
                {t.appName}
              </span>
            </div>

            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", lineHeight: 1.6, marginBottom: 18 }}>
              {t.footer.description}
            </p>

            <LanguageSwitcher />
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--gold-dark)", textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.5px", fontWeight: 700 }}>
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

          {/* Trust & Transparency */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--gold-dark)", textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.5px", fontWeight: 700 }}>
              {t.footer.transparency}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={14} color="var(--teal)" /> SHA-256 Commit-Reveal Protocol
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={14} color="var(--gold-dark)" /> 100% Client-Side Auditable Math
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Ticket size={14} color="var(--gold-dark)" /> 10-Tier Fixed Guaranteed Prizes
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--gold-dark)", textTransform: "uppercase", marginBottom: 14, letterSpacing: "0.5px", fontWeight: 700 }}>
              Customer Support
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={14} color="var(--text-main)" /> +251 911 000 000 / 0912 345 678
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={14} color="var(--text-main)" /> support@primedraws.com
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Send size={14} color="var(--teal)" /> Official Telegram: @PrimeDrawsOfficial
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
            © {new Date().getFullYear()} {t.appName}. {t.footer.rights}
          </div>
          <div>
            {t.footer.compliance}
          </div>
        </div>
      </div>
    </footer>
  );
}
