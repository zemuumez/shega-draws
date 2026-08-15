"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Ticket, ShieldCheck, Trophy, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface MobileBottomBarProps {
  activeDrawId?: string;
  ticketPrice?: number;
}

export function MobileBottomBar({ activeDrawId = "PD-2026-08A", ticketPrice = 100 }: MobileBottomBarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();

  // Hide on admin, studio, enter pages where custom flow takes over
  if (
    pathname?.startsWith("/studio") ||
    pathname?.startsWith("/admin") ||
    pathname === "/enter"
  ) {
    return null;
  }

  return (
    <div className="mobile-floating-bar">
      <div className="mobile-floating-inner">
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span className="live-pulse-dot" />
            <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gold)", fontWeight: 700 }}>
              #{activeDrawId}
            </span>
          </div>
          <span style={{ fontSize: "0.75rem", color: "var(--paper)", fontWeight: 600 }}>
            {ticketPrice} ETB / Ticket
          </span>
        </div>

        <Link
          href="/enter"
          className="btn-base btn-primary"
          style={{
            padding: "10px 18px",
            fontSize: "0.875rem",
            fontWeight: 700,
            borderRadius: "var(--radius-sm)",
            boxShadow: "0 4px 14px rgba(212, 175, 55, 0.4)",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            textDecoration: "none",
          }}
        >
          <Ticket size={16} /> {t.nav.enter}
        </Link>
      </div>
    </div>
  );
}
