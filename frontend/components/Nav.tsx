"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, ListChecks, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n/LanguageContext";

export function Nav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  if (pathname?.startsWith("/studio")) {
    return null;
  }

  const navItems = [
    { href: "/",        label: t.nav.draws,       short: t.nav.draws,     icon: Home },
    { href: "/enter",   label: t.nav.enter,       short: t.nav.enter,     icon: Ticket },
    { href: "/entries", label: t.nav.myEntries,   short: t.nav.myEntries, icon: ListChecks },
    { href: "/results", label: t.nav.results,     short: t.nav.results,   icon: ShieldCheck },
    { href: "/admin",   label: t.nav.admin,       short: "Admin",         icon: Trophy },
  ];

  return (
    <>
      {/* ── Desktop top nav (Light Theme) ───────────────────── */}
      <nav
        aria-label="Main navigation"
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 36px",
          borderBottom: "1px solid var(--gray-line)",
          position: "sticky",
          top: 0,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
          zIndex: 100,
        }}
        id="nav-desktop"
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--radius-sm)",
              background: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 6px rgba(217, 119, 6, 0.28)",
            }}
          >
            <Ticket size={18} color="#FFFFFF" />
          </div>
          <div>
            <span className="display" style={{ fontSize: "1.25rem", color: "var(--text-main)", fontWeight: 800 }}>
              {t.appName}
            </span>
          </div>
        </Link>

        {/* Center links */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  background: active ? "var(--gold-bg)" : "transparent",
                  border: active ? "1px solid var(--gold-border)" : "1px solid transparent",
                  borderRadius: 10,
                  padding: "8px 14px",
                  color: active ? "var(--gold-dark)" : "var(--text-muted)",
                  fontSize: "0.875rem",
                  fontWeight: active ? 700 : 500,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  textDecoration: "none",
                  position: "relative",
                  transition: "all var(--transition-fast)",
                }}
              >
                <Icon size={16} color={active ? "var(--gold-dark)" : "var(--text-muted)"} />
                {label}
                {href === "/admin" && pendingCount > 0 && (
                  <span
                    aria-label={`${pendingCount} pending`}
                    style={{
                      position: "absolute",
                      top: 4,
                      right: 6,
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--rust)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side: Language Switcher + Quick Action */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSwitcher />
          <Link
            href="/enter"
            className="btn-base btn-primary"
            style={{ padding: "9px 18px", fontSize: "0.875rem" }}
          >
            <Sparkles size={14} /> {t.nav.enter}
          </Link>
        </div>
      </nav>

      {/* ── Mobile top bar (Brand + Language Switcher) ── */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "14px 18px",
          background: "#FFFFFF",
          borderBottom: "1px solid var(--gray-line)",
          position: "sticky",
          top: 0,
          zIndex: 90,
        }}
        id="header-mobile"
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              background: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ticket size={16} color="#FFFFFF" />
          </div>
          <span className="display" style={{ fontSize: "1.125rem", color: "var(--text-main)", fontWeight: 800 }}>
            {t.appName}
          </span>
        </Link>
        <LanguageSwitcher />
      </header>

      {/* ── Mobile bottom tab bar ──────────────────────────── */}
      <nav
        aria-label="Main navigation"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          background: "#FFFFFF",
          borderTop: "1px solid var(--gray-line)",
          padding: "8px 4px",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
          boxShadow: "0 -2px 10px rgba(0,0,0,0.04)",
          zIndex: 100,
        }}
        id="nav-mobile"
      >
        {navItems.map(({ href, short, icon: Icon }) => {
          const active = pathname === href || (href !== "/" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              style={{
                background: "transparent",
                border: "none",
                color: active ? "var(--gold-dark)" : "var(--text-muted)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                fontSize: "0.6875rem",
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                position: "relative",
                padding: "4px 8px",
                textDecoration: "none",
                transition: "color var(--transition-fast)",
              }}
            >
              <Icon size={18} color={active ? "var(--gold-dark)" : "var(--text-muted)"} />
              {short}
              {href === "/admin" && pendingCount > 0 && (
                <span
                  aria-label={`${pendingCount} pending`}
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 4,
                    width: 7,
                    height: 7,
                    borderRadius: "50%",
                    background: "var(--rust)",
                  }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      <style>{`
        @media (min-width: 860px) {
          #nav-desktop   { display: flex !important; }
          #header-mobile { display: none !important; }
          #nav-mobile    { display: none !important; }
        }
      `}</style>
    </>
  );
}
