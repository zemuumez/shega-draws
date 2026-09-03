"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Home, Ticket, ListChecks, ShieldCheck, LogIn, Phone, Send, Menu, X, Award, Sparkles } from "lucide-react";
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
    { href: "/",         label: "Draws",       icon: Home },
    { href: "/entries",  label: "My Tickets",  icon: ListChecks },
    { href: "/results",  label: "Results",     icon: ShieldCheck },
    { href: "/about",    label: "Why Rimna",   icon: Award },
  ];

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

      {/* ── 1. Top Utility Header Ribbon (Dark Navy & Gold Theme) ─── */}
      <div
        className="top-utility-ribbon"
        style={{
          background: "linear-gradient(90deg, #111827 0%, #1F2937 50%, #111827 100%)",
          borderBottom: "1px solid rgba(253, 224, 71, 0.3)",
          padding: "6px clamp(12px, 3vw, 32px)",
          fontSize: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "#E5E7EB",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Support & Community */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "nowrap", overflow: "hidden" }}>
          <a
            href="https://t.me/RimnaLotteryOfficial"
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 5, color: "#FDE047", fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            <Send size={12} color="#FDE047" /> <span className="hide-on-mobile">Official Telegram:</span> @RimnaLottery
          </a>
          <span className="hide-on-mobile" style={{ color: "#4B5563" }}>|</span>
          <span className="hide-on-mobile" style={{ display: "flex", alignItems: "center", gap: 5, color: "#D1D5DB", fontWeight: 700, whiteSpace: "nowrap" }}>
            <Phone size={12} color="#10B981" /> 24/7 Hotline: +251 911 000 000
          </span>
        </div>

        {/* Quick Login & Language */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          <div className="hide-on-mobile">
            <LanguageSwitcher />
          </div>
          <span className="hide-on-mobile" style={{ color: "#4B5563" }}>|</span>
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span className="mono" style={{ color: "#FDE047", fontWeight: 800, fontSize: "0.6875rem" }}>
                {currentUser.name || currentUser.phone}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                style={{ background: "none", border: "none", color: "#F87171", cursor: "pointer", fontSize: "0.6875rem", fontWeight: 800 }}
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
                color: "#FDE047",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontWeight: 800,
                display: "flex",
                alignItems: "center",
                gap: 4,
                whiteSpace: "nowrap",
              }}
            >
              <LogIn size={13} color="#FDE047" /> Login / Register
            </button>
          )}
        </div>
      </div>

      {/* ── 2. Main Navigation Bar (Desktop Grid · Mobile Flex with Breadcrumb) ───── */}
      <nav
        aria-label="Main navigation"
        className="main-navbar"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto 1fr",
          alignItems: "center",
          padding: "8px clamp(12px, 3vw, 32px)",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 100%)",
          borderBottom: "2px solid #FDE047",
          position: "sticky",
          top: 0,
          boxShadow: "0 4px 12px rgba(234, 179, 8, 0.12)",
          zIndex: 100,
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Desktop Left: Navigation Links */}
        <div className="desktop-nav-links">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  background: active ? "#FEF9C3" : "transparent",
                  border: active ? "1.5px solid #FDE047" : "1.5px solid transparent",
                  borderRadius: 8,
                  padding: "6px 12px",
                  color: "#111827",
                  fontSize: "0.8125rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  textDecoration: "none",
                  whiteSpace: "nowrap",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icon size={15} color={active ? "#D97706" : "#4B5563"} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Center / Brand Logo (Full Logo Image with Integrated Text) */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <Link
            href="/"
            style={{
              display: "flex",
              alignItems: "center",
              textDecoration: "none",
              padding: "2px 0",
            }}
          >
            <Image
              src="/images/rimna-brand-logo.png"
              alt="Rimna International Digital Lottery"
              width={240}
              height={56}
              priority
              style={{
                height: "clamp(38px, 4.5vw, 48px)",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </Link>
        </div>

        {/* Desktop Right: Contact Us Button */}
        <div className="desktop-contact-btn" style={{ justifySelf: "end" }}>
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="casino-btn-gold"
            style={{
              padding: "6px clamp(10px, 1.5vw, 16px)",
              fontSize: "0.8125rem",
              fontWeight: 900,
            }}
          >
            <Phone size={13} /> <span className="contact-btn-text">Contact Us</span>
          </button>
        </div>

        {/* Mobile Right: Breadcrumb Hamburger Menu Button */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          className="mobile-breadcrumb-btn"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={20} color="#111827" /> : <Menu size={20} color="#111827" />}
        </button>
      </nav>

      {/* ── 3. Mobile Slide-Down Breadcrumb Menu Drawer ───── */}
      {isMobileMenuOpen && (
        <div className="mobile-menu-drawer animate-fade">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {navItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href || (href !== "/" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  style={{
                    background: active ? "#FEF9C3" : "#FAFAFA",
                    border: active ? "1.5px solid #FDE047" : "1px solid #E5E7EB",
                    borderRadius: 8,
                    padding: "10px 14px",
                    color: "#111827",
                    fontSize: "0.9375rem",
                    fontWeight: active ? 900 : 700,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    textDecoration: "none",
                  }}
                >
                  <Icon size={18} color={active ? "#D97706" : "#4B5563"} />
                  {label}
                </Link>
              );
            })}

            {/* Mobile Language Switcher */}
            <div style={{ padding: "8px 0 4px", borderTop: "1px solid #E5E7EB", marginTop: 4 }}>
              <span style={{ fontSize: "0.75rem", color: "#6B7280", fontWeight: 700, display: "block", marginBottom: 6 }}>
                🌐 Choose Language / ቋንቋ ምረጡ
              </span>
              <LanguageSwitcher />
            </div>

            {/* Mobile Hotline */}
            <a
              href="tel:+251911000000"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#111827",
                fontSize: "0.875rem",
                fontWeight: 700,
                textDecoration: "none",
                background: "#F9FAFB",
                border: "1px solid #E5E7EB",
                padding: "8px 12px",
                borderRadius: 8,
              }}
            >
              <Phone size={15} color="#10B981" /> 24/7 Hotline: +251 911 000 000
            </a>

            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsContactOpen(true);
              }}
              className="casino-btn-gold"
              style={{
                marginTop: 4,
                padding: "11px 16px",
                fontSize: "0.9375rem",
                width: "100%",
                justifyContent: "center",
              }}
            >
              <Phone size={16} /> Contact Us
            </button>
          </div>
        </div>
      )}
    </>
  );
}
