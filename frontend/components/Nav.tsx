"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Ticket, ListChecks, ShieldCheck, Trophy } from "lucide-react";

const NAV_ITEMS = [
  { href: "/",        label: "Current draw",  short: "Draw",    icon: Home },
  { href: "/enter",   label: "Enter",          short: "Enter",   icon: Ticket },
  { href: "/entries", label: "My entries",     short: "Entries", icon: ListChecks },
  { href: "/results", label: "Results",        short: "Results", icon: ShieldCheck },
  { href: "/admin",   label: "Organizer",      short: "Admin",   icon: Trophy },
];

export function Nav({ pendingCount = 0 }: { pendingCount?: number }) {
  const pathname = usePathname();

  return (
    <>
      {/* ── Desktop top nav ────────────────────────────────── */}
      <nav
        aria-label="Main navigation"
        style={{
          display: "none",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 32px",
          borderBottom: "1px solid var(--gray-line)",
          position: "sticky",
          top: 0,
          background: "rgba(18,24,31,0.9)",
          backdropFilter: "blur(12px)",
          zIndex: 50,
        }}
        id="nav-desktop"
      >
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: 8,
              background: "var(--gold)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ticket size={15} color="var(--ink)" />
          </div>
          <span className="display" style={{ fontSize: "1.1875rem", color: "var(--paper)" }}>
            Shega Draws
          </span>
        </Link>

        <div style={{ display: "flex", gap: 4 }}>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                style={{
                  background: active ? "rgba(201,162,39,0.12)" : "transparent",
                  border: "none",
                  borderRadius: 10,
                  padding: "8px 14px",
                  color: active ? "var(--gold)" : "var(--gray)",
                  fontSize: "0.8125rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  textDecoration: "none",
                  position: "relative",
                  transition: "color var(--transition-fast), background var(--transition-fast)",
                }}
              >
                <Icon size={14} />
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
      </nav>

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
          background: "var(--ink-soft)",
          borderTop: "1px solid var(--gray-line)",
          padding: "8px 4px",
          paddingBottom: "calc(8px + env(safe-area-inset-bottom))",
          zIndex: 50,
        }}
        id="nav-mobile"
      >
        {NAV_ITEMS.map(({ href, short, icon: Icon }) => {
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
                fontSize: "0.625rem",
                cursor: "pointer",
                position: "relative",
                padding: "4px 10px",
                textDecoration: "none",
                transition: "color var(--transition-fast)",
              }}
            >
              <Icon size={18} />
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
          #nav-desktop { display: flex !important; }
          #nav-mobile  { display: none !important; }
        }
      `}</style>
    </>
  );
}
