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
        background: "var(--ink-deep)",
        borderTop: "1px solid var(--gray-line)",
        padding: "56px 20px 32px",
        marginTop: 64,
      }}
    >
      <div className="container" style={{ maxWidth: 1160 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 36, marginBottom: 48 }}>
          {/* Brand Col */}
          <div style={{ maxWidth: 360 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
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
                <Ticket size={18} color="var(--ink-deep)" />
              </div>
              <span className="display" style={{ fontSize: "1.25rem", color: "var(--paper)", fontWeight: 800 }}>
                {t.appName}
              </span>
            </div>

            <p style={{ color: "var(--paper-muted)", fontSize: "0.8125rem", lineHeight: 1.65, marginBottom: 20 }}>
              {t.footer.description}
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <LanguageSwitcher />
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--gold-soft)", textTransform: "uppercase", marginBottom: 16, letterSpacing: 1 }}>
              {t.footer.quickLinks}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.875rem" }}>
              <Link href="/#draws-catalog" style={{ color: "var(--gray)", textDecoration: "none" }}>{t.nav.draws}</Link>
              <Link href="/enter" style={{ color: "var(--gray)", textDecoration: "none" }}>{t.nav.enter}</Link>
              <Link href="/entries" style={{ color: "var(--gray)", textDecoration: "none" }}>{t.nav.myEntries}</Link>
              <Link href="/results" style={{ color: "var(--gray)", textDecoration: "none" }}>{t.nav.results}</Link>
              <Link href="/admin/login" style={{ color: "var(--gray)", textDecoration: "none" }}>{t.nav.admin}</Link>
            </div>
          </div>

          {/* Trust & Transparency */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--gold-soft)", textTransform: "uppercase", marginBottom: 16, letterSpacing: 1 }}>
              {t.footer.transparency}
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.8125rem", color: "var(--gray)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <ShieldCheck size={14} color="var(--teal-soft)" /> SHA-256 Commit-Reveal Protocol
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Award size={14} color="var(--gold)" /> 100% Client-Side Auditable Math
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Ticket size={14} color="var(--gold-soft)" /> Append-Only Immutable Audit Log
              </div>
            </div>
          </div>

          {/* Contact & Support */}
          <div>
            <h4 className="mono" style={{ fontSize: "0.75rem", color: "var(--gold-soft)", textTransform: "uppercase", marginBottom: 16, letterSpacing: 1 }}>
              Support & Inquiries
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.8125rem", color: "var(--gray)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Phone size={14} color="var(--paper)" /> +251 911 000 000 / 0912 345 678
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Mail size={14} color="var(--paper)" /> support@primedraws.com
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Send size={14} color="var(--teal-soft)" /> Official Telegram: @PrimeDrawsOfficial
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            borderTop: "1px solid var(--gray-line)",
            paddingTop: 24,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            fontSize: "0.75rem",
            color: "var(--gray)",
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
