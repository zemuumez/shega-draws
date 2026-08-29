"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, ListChecks, ShieldCheck, User, LogIn, LogOut, HelpCircle, Phone, Send, Globe } from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n/LanguageContext";
import { getUser, logout, type StoredUser } from "@/lib/api";
import { SignInModal } from "./SignInModal";

export function Nav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [isSignInOpen, setIsSignInOpen] = useState(false);

  useEffect(() => {
    setCurrentUser(getUser());
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

      {/* ── Top Utility Header Ribbon (Classic Portal Style) ─── */}
      <div
        style={{
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          padding: "6px 24px",
          fontSize: "0.75rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "var(--text-muted)",
        }}
      >
        {/* Social / Community Links */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <a
            href="https://t.me/RimnaLotteryOfficial"
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 4, color: "#2A65E6", fontWeight: 700, textDecoration: "none" }}
          >
            <Send size={12} /> Telegram @RimnaLotteryOfficial
          </a>
          <span style={{ color: "#CBD5E1" }}>|</span>
          <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Phone size={12} color="var(--teal)" /> 24/7 Hotline: +251 911 000 000
          </span>
        </div>

        {/* Top Right Quick Login & Language */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSwitcher />
          {currentUser ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="mono" style={{ color: "var(--blue-navy)", fontWeight: 800 }}>
                👤 {currentUser.name || currentUser.phone}
              </span>
              <button
                type="button"
                onClick={handleSignOut}
                style={{ background: "none", border: "none", color: "var(--rust)", cursor: "pointer", fontSize: "0.75rem", fontWeight: 700 }}
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
              }}
            >
              <LogIn size={13} /> Login / Register
            </button>
          )}
        </div>
      </div>

      {/* ── Main Navigation Bar (With Center Gold Ribbon Badge) ───── */}
      <nav
        aria-label="Main navigation"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "10px 32px",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FFFDF5 100%)",
          borderBottom: "2px solid #FDE047",
          position: "sticky",
          top: 0,
          boxShadow: "0 4px 12px rgba(42, 101, 230, 0.08)",
          zIndex: 100,
        }}
        id="nav-desktop"
      >
        {/* Brand Logo Ribbon Badge */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div
            style={{
              padding: "6px 18px",
              borderRadius: "24px",
              background: "linear-gradient(135deg, #FDE047 0%, #EAB308 50%, #CA8A04 100%)",
              boxShadow: "0 3px 10px rgba(234, 179, 8, 0.45)",
              border: "1.5px solid #FEF08A",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ticket size={20} color="#0C2666" />
            <span
              className="display"
              style={{
                fontSize: "1.25rem",
                color: "#0C2666",
                fontWeight: 900,
                letterSpacing: "-0.5px",
                textTransform: "uppercase",
              }}
            >
              Rimna Lottery
            </span>
          </div>
        </Link>

        {/* Center Main Links */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
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
                  padding: "8px 16px",
                  color: active ? "#2A65E6" : "var(--blue-navy)",
                  fontSize: "0.875rem",
                  fontWeight: active ? 800 : 700,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  textDecoration: "none",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icon size={16} color={active ? "#2A65E6" : "var(--text-subtle)"} />
                {label}
              </Link>
            );
          })}
        </div>

        {/* Right side: Sign In Button (Replaced Buy Ticket CTA) */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {currentUser ? (
            <Link
              href="/entries"
              className="btn-base"
              style={{
                background: "var(--blue-bg)",
                border: "1.5px solid #2A65E6",
                color: "#2A65E6",
                padding: "8px 16px",
                fontSize: "0.8125rem",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                borderRadius: 8,
              }}
            >
              <Ticket size={15} /> My Tickets
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => setIsSignInOpen(true)}
              className="btn-base btn-primary"
              style={{
                padding: "9px 22px",
                fontSize: "0.875rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                fontWeight: 800,
              }}
            >
              <User size={16} /> Sign In
            </button>
          )}
        </div>
      </nav>

      {/* ── Responsive CSS ── */}
      <style>{`
        @media (max-width: 768px) {
          #nav-desktop {
            padding: 8px 16px !important;
          }
        }
      `}</style>
    </>
  );
}
