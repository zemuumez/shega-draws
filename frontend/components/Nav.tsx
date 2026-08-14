"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, ListChecks, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import { useLanguage, LanguageSwitcher } from "@/lib/i18n/LanguageContext";

export function Nav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();
  const { t } = useLanguage();

  const navItems = [
    { href: "/",        label: t.nav.draws,       short: t.nav.draws,     icon: Home },
    { href: "/enter",   label: t.nav.enter,       short: t.nav.enter,     icon: Ticket },
    { href: "/entries", label: t.nav.myEntries,   short: t.nav.myEntries, icon: ListChecks },
    { href: "/results", label: t.nav.results,     short: t.nav.results,   icon: ShieldCheck },
    { href: "/admin",   label: t.nav.admin,       short: "Admin",         icon: Trophy },
  ];

  return (
    <>
      {/* ── Desktop top nav ────────────────────────────────── */}
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
          background: "rgba(10, 14, 19, 0.92)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          zIndex: 100,
        }}
        id="nav-desktop"
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "var(--radius-sm)",
              background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-rich) 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(212, 175, 55, 0.35)",
            }}
          >
            <Ticket size={18} color="var(--ink-deep)" />
          </div>
          <div>
            <span className="display" style={{ fontSize: "1.25rem", color: "var(--paper)", fontWeight: 800, letterSpacing: "-0.5px" }}>
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
                  background: active ? "rgba(212, 175, 55, 0.12)" : "transparent",
                  border: active ? "1px solid rgba(212, 175, 55, 0.3)" : "1px solid transparent",
                  borderRadius: 10,
                  padding: "8px 14px",
                  color: active ? "var(--gold-soft)" : "var(--gray)",
                  fontSize: "0.84375rem",
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
                <Icon size={15} color={active ? "var(--gold)" : "var(--gray)"} />
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
                      background: "var(--rust-soft)",
                    }}
                  />
                )}
              </Link>
            );
          })}
        </div>

        {/* Right side: Language Switcher + Quick Enter */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSwitcher />
          <Link
            href="/enter"
            className="btn-base btn-primary"
            style={{ padding: "8px 16px", fontSize: "0.8125rem", borderRadius: "var(--radius-sm)" }}
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
          background: "var(--ink)",
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
            <Ticket size={16} color="var(--ink-deep)" />
          </div>
          <span className="display" style={{ fontSize: "1.125rem", color: "var(--paper)", fontWeight: 800 }}>
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
          background: "rgba(10, 14, 19, 0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid var(--gray-line)",
          padding: "8px 4px",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
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
                color: active ? "var(--gold)" : "var(--gray)",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 3,
                fontSize: "0.65rem",
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                position: "relative",
                padding: "4px 8px",
                textDecoration: "none",
                transition: "color var(--transition-fast)",
              }}
            >
              <Icon size={18} color={active ? "var(--gold)" : "var(--gray)"} />
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
                    background: "var(--rust-soft)",
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
