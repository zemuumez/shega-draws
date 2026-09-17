"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Ticket,
  ListChecks,
  ShieldCheck,
  LogIn,
  Phone,
  Send,
  Award,
  Sparkles,
  User,
  LogOut,
  ChevronDown,
  UserCheck,
} from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n/LanguageContext";
import { ContactUsModal } from "./ContactUsModal";

import type { CMSSiteSettings } from "@/lib/sanity/queries";

export function Nav({
  pendingCount = 0,
  siteSettings,
}: {
  pendingCount?: number;
  siteSettings?: CMSSiteSettings | null;
}) {
  const pathname = usePathname();
  const { text, t, getLocalized } = useLanguage();
  const [isContactOpen, setIsContactOpen] = useState(false);

  const contactPhone = siteSettings?.contactPhone || "+251 911 000 000";
  const telegramHandle = siteSettings?.telegramHandle || "@RimnaLotteryOfficial";
  const telegramUrl =
    siteSettings?.telegramUrl ||
    (telegramHandle.startsWith("http") ? telegramHandle : `https://t.me/${telegramHandle.replace("@", "")}`);
  const siteName = getLocalized(siteSettings, "siteName", "Rimna International Digital Lottery");
  const logoImage = siteSettings?.logoImageUrl || "/images/rimna-brand-logo.png";

  if (pathname?.startsWith("/studio")) return null;

  // Left desktop links
  const leftNavItems = [
    { href: "/",            label: t.nav.draws,        icon: Home },
    { href: "/how-it-works", label: t.nav.howItWorks,   icon: Sparkles },
    { href: "/results",     label: t.nav.results,      icon: ShieldCheck },
  ];

  // Right desktop links
  const rightNavItems = [
    { href: "/#choose-ticket", label: "Buy Tickets",    icon: ListChecks },
    { href: "/about",       label: t.nav.whyRimna || "Why Rimna", icon: Award },
  ];

  // All navigation links for mobile dock
  const allNavItems = [
    ...leftNavItems,
    ...rightNavItems,
  ];

  return (
    <>
      <ContactUsModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        siteSettings={siteSettings}
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
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 5, color: "#FDE047", fontWeight: 800, textDecoration: "none", whiteSpace: "nowrap" }}
          >
            <Send size={12} color="#FDE047" /> <span className="hide-on-mobile">{t.nav?.officialTelegram || "Official Telegram:"}</span> {telegramHandle}
          </a>
          <span className="hide-on-mobile" style={{ color: "#4B5563" }}>|</span>
          <a
            href={`tel:${contactPhone.replace(/\s+/g, "")}`}
            className="hide-on-mobile"
            style={{ display: "flex", alignItems: "center", gap: 5, color: "#D1D5DB", fontWeight: 700, whiteSpace: "nowrap", textDecoration: "none" }}
          >
            <Phone size={12} color="#10B981" /> {t.nav?.hotline247 || "24/7 Hotline:"} {contactPhone}
          </a>
        </div>

        {/* Language Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, position: "relative" }}>
          <LanguageSwitcher />
        </div>
      </div>

      {/* ── 2. Main Navigation Bar (Desktop Split Grid · Mobile Left Logo / Right Breadcrumb) ───── */}
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
        {/* Desktop Left: Navigation Links (Draws, How It Works, Results) */}
        <div className="desktop-left-links" style={{ display: "flex", alignItems: "center", gap: 6, justifySelf: "start" }}>
          {leftNavItems.map(({ href, label, icon: Icon }) => {
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

        {/* Center / Brand Logo */}
        <div className="navbar-center-logo" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              src={logoImage}
              alt={siteName}
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

        {/* Desktop Right: Navigation Links (My Tickets, Why Rimna) + Contact Us Button */}
        <div className="desktop-right-links" style={{ display: "flex", alignItems: "center", gap: 8, justifySelf: "end" }}>
          {rightNavItems.map(({ href, label, icon: Icon }) => {
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

          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="casino-btn-gold"
            style={{
              padding: "6px clamp(10px, 1.5vw, 16px)",
              fontSize: "0.8125rem",
              fontWeight: 900,
              marginLeft: 4,
            }}
          >
            <Phone size={13} /> <span className="contact-btn-text">{t.nav.contact || "Contact Us"}</span>
          </button>
        </div>

        {/* Mobile Top Right: Quick Contact Us Pill */}
        <div className="mobile-contact-quick-btn" style={{ display: "none", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setIsContactOpen(true)}
            className="casino-btn-gold"
            style={{
              padding: "6px 12px",
              fontSize: "0.75rem",
              fontWeight: 900,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Phone size={12} /> {t.nav.contact || "Contact"}
          </button>
        </div>
      </nav>

      {/* ── 3. Mobile Bottom Navigation Dock (Fixed App-Like Bottom Bar) ───── */}
      <nav aria-label="Mobile Bottom Navigation" className="mobile-bottom-nav">
        {allNavItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={`mobile-bottom-nav-item ${active ? "active" : ""}`}
            >
              <div style={{ position: "relative", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={19} color={active ? "#FDE047" : "#9CA3AF"} />
              </div>
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
