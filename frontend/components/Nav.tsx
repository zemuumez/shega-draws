"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, ListChecks, ShieldCheck, Sparkles, UserCheck } from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n/LanguageContext";

export function Nav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname?.startsWith("/studio")) {
    return null;
  }

  // Clean, focused user navigation items
  const navItems = [
    { href: "/",        label: t.nav.draws,     short: t.nav.draws,     icon: Home },
    { href: "/enter",   label: t.nav.enter,     short: t.nav.enter,     icon: Ticket },
    { href: "/entries", label: t.nav.myEntries, short: t.nav.myEntries, icon: ListChecks },
    { href: "/results", label: t.nav.results,   short: t.nav.results,   icon: ShieldCheck },
  ];

  return (
    <>
      {/* ── Desktop Top Nav (Professional Header) ───── */}
      <nav
        aria-label="Main navigation"
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 32px",
          borderBottom: "1.5px solid var(--blue-border)",
          position: "sticky",
          top: 0,
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 2px 8px rgba(42, 101, 230, 0.06)",
          zIndex: 100,
        }}
        id="nav-desktop"
      >
        {/* Brand Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, #FACC15 0%, #EAB308 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 8px rgba(234, 179, 8, 0.35)",
              border: "1px solid #FDE047",
            }}
          >
            <Ticket size={22} color="#0C2666" />
          </div>
          <div>
            <span className="display" style={{ fontSize: "1.45rem", color: "var(--blue-navy)", fontWeight: 800, letterSpacing: "-0.5px" }}>
              {t.appName}
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
                  borderRadius: 10,
                  padding: "8px 16px",
                  color: active ? "#2A65E6" : "var(--text-muted)",
                  fontSize: "0.875rem",
                  fontWeight: active ? 800 : 600,
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

        {/* Right side: Language Switcher + Buy Ticket CTA */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <LanguageSwitcher />
          <Link
            href="/enter"
            className="btn-base btn-primary"
            style={{ padding: "9px 20px", fontSize: "0.875rem" }}
          >
            <Sparkles size={15} /> Buy Ticket
          </Link>
        </div>
      </nav>

      {/* ── Mobile Top Bar (Brand + Language Switcher + Fast Action) ── */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 18px",
          background: "#FFFFFF",
          borderBottom: "1.5px solid var(--blue-border)",
          position: "sticky",
          top: 0,
          zIndex: 90,
        }}
        id="header-mobile"
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "var(--radius-xs)",
              background: "linear-gradient(135deg, #FACC15 0%, #EAB308 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ticket size={18} color="#0C2666" />
          </div>
          <span className="display" style={{ fontSize: "1.25rem", color: "var(--blue-navy)", fontWeight: 800 }}>
            {t.appName}
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <LanguageSwitcher />
          <Link
            href="/enter"
            className="btn-base btn-primary"
            style={{ padding: "6px 14px", fontSize: "0.75rem" }}
          >
            Buy Ticket
          </Link>
        </div>
      </header>

      {/* ── Mobile Bottom Navigation Bar ─────────────────────────────── */}
      <nav
        aria-label="Mobile navigation"
        style={{
          display: "flex",
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "rgba(255, 255, 255, 0.98)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderTop: "1.5px solid var(--blue-border)",
          padding: "6px 8px env(safe-area-inset-bottom, 8px)",
          justifyContent: "space-around",
          alignItems: "center",
          zIndex: 90,
          boxShadow: "0 -2px 12px rgba(42, 101, 230, 0.08)",
        }}
        id="nav-mobile-bottom"
      >
        {navItems.map(({ href, short, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                padding: "6px 10px",
                borderRadius: 8,
                color: active ? "#2A65E6" : "var(--text-muted)",
                background: active ? "var(--blue-bg)" : "transparent",
                textDecoration: "none",
                fontSize: "0.6875rem",
                fontWeight: active ? 800 : 500,
                minWidth: 54,
                position: "relative",
              }}
            >
              <Icon size={18} color={active ? "#2A65E6" : "var(--text-muted)"} />
              <span>{short}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop/Mobile media query toggles */}
      <style>{`
        @media (min-width: 769px) {
          #nav-desktop { display: flex !important; }
          #header-mobile { display: none !important; }
          #nav-mobile-bottom { display: none !important; }
        }
        @media (max-width: 768px) {
          body { padding-bottom: 64px; }
        }
      `}</style>
    </>
  );
}
