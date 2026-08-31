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
    { href: "/",              label: "Tickets & Play",  icon: Home },
    { href: "/how-it-works",  label: "How It Works",    icon: Sparkles },
    { href: "/results",       label: t.nav.results,     icon: ShieldCheck },
    { href: "/about",         label: "Why Rimna",       icon: Award },
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

      {/* ── 1. Top Utility Header Ribbon (High-End Dark Navy & Gold Theme) ─── */}
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
            className="top-ribbon-telegram"
            style={{ display: "flex", alignItems: "center", gap: 5, color: "#FDE047", fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            <Send size={12} color="#FDE047" /> <span className="hide-on-mobile">Official Telegram:</span> @RimnaLottery
          </a>
          <span className="hide-on-mobile" style={{ color: "#4B5563" }}>|</span>
          <span className="top-ribbon-hotline" style={{ display: "flex", alignItems: "center", gap: 5, color: "#D1D5DB", fontWeight: 700, whiteSpace: "nowrap" }}>
            <Phone size={12} color="#10B981" /> <span className="hide-on-mobile">24/7 Hotline:</span> +251 911 000 000
          </span>
        </div>

        {/* Quick Login & Language */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <LanguageSwitcher />
          <span style={{ color: "#4B5563" }}>|</span>
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

      {/* ── 2. Main Symmetrical Navigation Bar (Left Links · Center Logo · Right Actions) ───── */}
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
        {/* Left Side: Navigation Links */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", justifySelf: "start" }}>
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
                  fontWeight: active ? 900 : 700,
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

        {/* Center: Brand Logo Ribbon Badge (Centered) */}
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", justifySelf: "center" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <div
              className="brand-badge"
              style={{
                padding: "4px clamp(10px, 2vw, 18px)",
                borderRadius: "24px",
                background: "linear-gradient(135deg, #FDE047 0%, #EAB308 50%, #CA8A04 100%)",
                boxShadow: "0 3px 10px rgba(234, 179, 8, 0.45)",
                border: "1.5px solid #FEF08A",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Image
                src="/images/rimna-logo.png"
                alt="Rimna Logo"
                width={26}
                height={26}
                style={{ borderRadius: "50%", objectFit: "cover" }}
              />
              <span
                className="display brand-text"
                style={{
                  fontSize: "clamp(0.95rem, 2vw, 1.2rem)",
                  color: "#111827",
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
        </div>

        {/* Right Side: Contact Us CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, justifySelf: "end" }}>
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
      </nav>
    </>
  );
}
