"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, ListChecks, ShieldCheck, LogIn, Phone, Send, Menu, X } from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n/LanguageContext";
import { getUser, logout, type StoredUser } from "@/lib/api";
import { SignInModal } from "./SignInModal";
import { ContactUsModal } from "./ContactUsModal";

export function Nav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getUser());
    setIsMobileMenuOpen(false);
  }, [pathname]);

  if (pathname?.startsWith("/studio")) {
    return null;
  }

  const handleSignOut = async () => {
    await logout();
    setCurrentUser(null);
    window.location.reload();
  };

  // Base navigation links
  const navItems = [
    { href: "/",        label: t.nav.draws,     icon: Home },
    { href: "/results", label: t.nav.results,   icon: ShieldCheck },
  ];

  // Add "My Tickets" ONLY if signed in
  if (currentUser) {
    navItems.splice(1, 0, { href: "/entries", label: t.nav.myEntries, icon: ListChecks });
  }

  return (
    <>
      <SignInModal
        isOpen={isSignInOpen}
        onClose={() => setIsSignInOpen(false)}
        onSuccess={(u) => setCurrentUser(u)}
      />

      <ContactUsModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      {/* ── Top Utility Header Ribbon ─── */}
      <div
        className="top-utility-ribbon"
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          padding: "5px clamp(8px, 2.5vw, 24px)",
          fontSize: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--text-muted)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Support & Community */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "nowrap", overflow: "hidden" }}>
          <a
            href="https://t.me/RimnaLotteryOfficial"
            target="_blank"
            rel="noreferrer"
            className="top-ribbon-telegram"
            style={{ display: "flex", alignItems: "center", gap: 4, color: "#2A65E6", fontWeight: 700, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            <Send size={12} /> <span className="hide-on-mobile">Telegram</span> @RimnaLottery
          </a>
          <span className="hide-on-mobile" style={{ color: "#CBD5E1" }}>|</span>
          <span className="top-ribbon-hotline" style={{ display: "flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}>
            <Phone size={12} color="var(--teal)" /> <span className="hide-on-mobile">24/7 Hotline:</span> +251 911 000 000
          </span>
        </div>

        {/* Quick Login & Language */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <LanguageSwitcher />
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="mono" style={{ color: "var(--blue-navy)", fontWeight: 800, fontSize: "0.6875rem" }}>
                {currentUser.name || currentUser.phone}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                style={{ background: "none", border: "none", color: "var(--rust)", cursor: "pointer", fontSize: "0.6875rem", fontWeight: 700 }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              style={{
                background: "none",
                border: "none",
                color: "#2A65E6",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
              }}
            >
              <LogIn size={13} /> Login / Register
            </button>
          )}
        </div>
      </div>

      {/* ── Main Navigation Bar ───── */}
      <nav
        aria-label="Main navigation"
        className="main-navbar"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px clamp(10px, 3vw, 32px)",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 100%)",
          borderBottom: "2px solid #FDE047",
          position: "sticky",
          top: 0,
          boxShadow: "0 4px 12px rgba(42, 101, 230, 0.08)",
          zIndex: 100,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Brand Logo Ribbon Badge */}
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <div
            className="brand-badge"
            style={{
              padding: "5px clamp(10px, 2vw, 18px)",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #FDE047 0%, #EAB308 50%, #CA8A04 100%)",
              boxShadow: "0 3px 10px rgba(234, 179, 8, 0.45)",
              border: "1.5px solid #FEF08A",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Ticket size={18} color="#0C2666" />
            <span
              className="display brand-text"
              style={{
                fontSize: "clamp(0.95rem, 2vw, 1.25rem)",
                color: "#0C2666",
                fontWeight: 900,
                letterSpacing: "-0.3px",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              Rimna Lottery
            </span>
          </div>
        </Link>

        {/* Center Main Links (Desktop / Tablet) */}
        <div className="nav-links-desktop" style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  background: active ? "var(--blue-bg)" : "transparent",
                  border: active ? "1.5px solid var(--blue-border)" : "1.5px solid transparent",
                  borderRadius: 8,
                  padding: "6px 12px",
                  color: active ? "#2A65E6" : "var(--blue-navy)",
                  fontSize: "0.8125rem",
                  fontWeight: active ? 800 : 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icon size={15} color={active ? "#2A65E6" : "var(--text-subtle)"} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side: Contact Us CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="btn-base contact-nav-btn"
            style={{
              background: "linear-gradient(135deg, #FDE047 0%, #EAB308 100%)",
              color: "#0C2666",
              border: "1px solid #FEF08A",
              padding: "6px clamp(8px, 1.5vw, 16px)",
              fontSize: "0.8125rem",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              borderRadius: 8,
              boxShadow: "0 2px 6px rgba(234, 179, 8, 0.3)",
              cursor: "pointer",
              whiteSpace: "nowrap",
            }}
          >
            <Phone size={13} /> <span className="contact-btn-text">Contact Us</span>
          </button>
        </div>
      </nav>

      {/* ── Responsive Styling Rules ── */}
      <style>{`
        @media (max-width: 640px) {
          .hide-on-mobile {
            display: none !important;
          }
          .top-ribbon-hotline {
            font-size: 0.6875rem !important;
          }
          .top-ribbon-telegram {
            font-size: 0.6875rem !important;
          }
          .brand-text {
            font-size: 0.875rem !important;
          }
          .nav-links-desktop {
            gap: 2px !important;
          }
          .nav-links-desktop a {
            padding: 5px 8px !important;
            font-size: 0.75rem !important;
          }
          .contact-nav-btn {
            padding: 5px 10px !important;
            font-size: 0.75rem !important;
          }
        }
        @media (max-width: 400px) {
          .nav-links-desktop a span,
          .nav-links-desktop a {
            font-size: 0.6875rem !important;
            padding: 4px 6px !important;
          }
          .brand-badge {
            padding: 4px 8px !important;
          }
          .contact-btn-text {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
