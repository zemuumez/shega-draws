"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Plus,
  Wallet,
  LayoutDashboard,
  KeyRound,
  History,
} from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n/LanguageContext";
import { authClient } from "@/lib/auth-client";
import { accountAPI } from "@/lib/account-api";
import type { WalletData } from "@/lib/wallet";
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
  const { data: session } = authClient.useSession();
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [isStaff, setIsStaff] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live wallet balance and check staff permissions
  useEffect(() => {
    if (!session?.user?.id) {
      setWalletBalance(null);
      setIsStaff(false);
      return;
    }
    let cancelled = false;

    accountAPI<WalletData>("/wallet?currency=ETB")
      .then((w) => {
        if (!cancelled && w?.balances) {
          const bal = w.balances.find((b) => b.currency === "ETB");
          setWalletBalance(bal ? bal.availableMinor : 0);
        }
      })
      .catch(() => {});

    accountAPI<{ role: string; userId: string }>("/admin/session")
      .then((v) => {
        if (!cancelled && v.role === "admin") {
          setIsStaff(true);
        } else if (!cancelled) {
          setIsStaff(false);
        }
      })
      .catch(() => {
        if (!cancelled) setIsStaff(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id, pathname]);

  const contactPhone = siteSettings?.contactPhone || "+251 911 000 000";
  const telegramHandle = siteSettings?.telegramHandle || "@RimnaLotteryOfficial";
  const telegramUrl =
    siteSettings?.telegramUrl ||
    (telegramHandle.startsWith("http") ? telegramHandle : `https://t.me/${telegramHandle.replace("@", "")}`);
  const siteName = getLocalized(siteSettings, "siteName", "Rimna International Digital Lottery");
  const logoImage = siteSettings?.logoImageUrl || "/images/rimna-brand-logo.png";

  const isDashboardMode =
    pathname === "/profile" ||
    pathname?.startsWith("/profile/") ||
    pathname === "/dashboard" ||
    pathname?.startsWith("/dashboard/") ||
    pathname === "/my-tickets" ||
    pathname?.startsWith("/my-tickets/");

  if (
    pathname?.startsWith("/studio") ||
    pathname === "/admin" ||
    pathname?.startsWith("/admin/") ||
    isDashboardMode
  ) {
    return null;
  }

  // Left desktop links: Home (Home page is home not draws), How It Works, Results
  const leftNavItems = [
    { href: "/",            label: text("Home"),       icon: Home },
    { href: "/how-it-works", label: t.nav.howItWorks,   icon: Sparkles },
    { href: "/results",     label: t.nav.results,      icon: ShieldCheck },
  ];

  // Right desktop links: Dashboard (if logged in), My Tickets, Why Rimna
  const myTicketsHref = session
    ? "/profile?tab=tickets"
    : `/login?redirect=${encodeURIComponent("/profile?tab=tickets")}`;

  const rightNavItems = [
    ...(session
      ? [{ href: "/profile?tab=dashboard", label: text("Dashboard"), icon: LayoutDashboard }]
      : []),
    { href: myTicketsHref,     label: text("My tickets"), icon: Ticket },
    { href: "/about",          label: t.nav.whyRimna || "Why Rimna", icon: Award },
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

        {/* Language Selector & Auth Entry */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, position: "relative" }}>
          <LanguageSwitcher />

          {!session ? (
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname || "/")}`}
              className="top-ribbon-login-btn"
              title={text("Sign in or create account")}
            >
              <LogIn size={13} />
              <span>{t.nav.signIn || text("Log In")}</span>
            </Link>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {/* Show live Balance instead of static deposit button */}
              <Link
                href="/profile?tab=wallet"
                className="top-ribbon-balance-btn"
                title={text("Available Balance — Click to manage wallet or deposit")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "rgba(16, 185, 129, 0.15)",
                  border: "1px solid rgba(16, 185, 129, 0.4)",
                  borderRadius: "9999px",
                  padding: "4px 10px",
                  color: "#34D399",
                  fontWeight: 800,
                  fontSize: "0.75rem",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <Wallet size={13} color="#34D399" />
                <span>
                  {walletBalance !== null ? `${(walletBalance / 100).toFixed(2)} ETB` : text("Balance…")}
                </span>
                <span
                  style={{
                    backgroundColor: "#10B981",
                    color: "#064E3B",
                    borderRadius: "9999px",
                    width: "16px",
                    height: "16px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    marginLeft: "2px",
                  }}
                >
                  +
                </span>
              </Link>

              <div style={{ position: "relative" }} ref={profileDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsProfileOpen((prev) => !prev)}
                  className="top-ribbon-profile-btn"
                  aria-expanded={isProfileOpen}
                  aria-haspopup="menu"
                >
                  <div className="top-ribbon-avatar-circle">
                    {session.user.name ? session.user.name.trim().charAt(0).toUpperCase() : "U"}
                  </div>
                  <span style={{ maxWidth: 110, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {session.user.name?.split(" ")[0] || text("Profile")}
                  </span>
                  <ChevronDown
                    size={12}
                    style={{
                      transition: "transform 0.2s ease",
                      transform: isProfileOpen ? "rotate(180deg)" : "rotate(0deg)",
                    }}
                  />
                </button>

                {isProfileOpen && (
                  <div className="top-ribbon-dropdown-menu" role="menu">
                    <div className="dropdown-user-header">
                      <div className="top-ribbon-avatar-circle" style={{ width: 34, height: 34, fontSize: "1rem" }}>
                        {session.user.name ? session.user.name.trim().charAt(0).toUpperCase() : "U"}
                      </div>
                      <div>
                        <div className="user-name">{session.user.name}</div>
                        <div className="user-email">{session.user.email}</div>
                      </div>
                    </div>

                    <Link
                      href="/profile?tab=dashboard"
                      className="dropdown-item-link"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <LayoutDashboard size={15} color="#38BDF8" />
                      <span style={{ fontWeight: 800, color: "#38BDF8" }}>{text("User Dashboard")}</span>
                    </Link>

                    <Link
                      href="/profile?tab=profile"
                      className="dropdown-item-link"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={15} color="#FDE047" />
                      <span>{text("Profile & Settings")}</span>
                    </Link>

                    <Link
                      href="/profile?tab=wallet"
                      className="dropdown-item-link"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Wallet size={15} color="#34D399" />
                      <span>{text("My Wallet & Balances")}</span>
                      {walletBalance !== null && (
                        <span style={{ marginLeft: "auto", fontSize: "0.6875rem", color: "#34D399", fontWeight: 800 }}>
                          {(walletBalance / 100).toFixed(2)} ETB
                        </span>
                      )}
                    </Link>

                    <Link
                      href="/deposit"
                      className="dropdown-item-link deposit-item"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Plus size={15} strokeWidth={3} color="#34D399" />
                      <span style={{ fontWeight: 800, color: "#34D399" }}>{text("Deposit Funds")}</span>
                      <span style={{ marginLeft: "auto", fontSize: "0.6875rem", backgroundColor: "rgba(16, 185, 129, 0.2)", color: "#A7F3D0", padding: "1px 6px", borderRadius: "9999px", fontWeight: 700 }}>Chapa</span>
                    </Link>

                    <Link
                      href="/profile?tab=history"
                      className="dropdown-item-link"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <History size={15} color="#FDE047" />
                      <span>{text("Deposit & Balance History")}</span>
                    </Link>

                    <Link
                      href="/profile?tab=tickets"
                      className="dropdown-item-link"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <Ticket size={15} color="#FDE047" />
                      <span>{text("My Tickets")}</span>
                    </Link>

                    <Link
                      href="/profile?tab=security"
                      className="dropdown-item-link"
                      role="menuitem"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <KeyRound size={15} color="#F59E0B" />
                      <span>{text("Security & 2FA")}</span>
                    </Link>

                    {/* Only show Staff Portal if authorized */}
                    {isStaff && (
                      <Link
                        href="/admin"
                        className="dropdown-item-link"
                        role="menuitem"
                        onClick={() => setIsProfileOpen(false)}
                      >
                        <ShieldCheck size={15} color="#60A5FA" />
                        <span>{text("Staff Portal")}</span>
                      </Link>
                    )}

                    <button
                      type="button"
                      className="dropdown-item-link signout-item"
                      role="menuitem"
                      onClick={async () => {
                        setIsProfileOpen(false);
                        await authClient.signOut();
                        window.location.href = "/";
                      }}
                    >
                      <LogOut size={15} />
                      <span>{t.nav.signOut || text("Sign Out")}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
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
