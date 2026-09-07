"use client";

import React from "react";
import Link from "next/link";
import { Trophy, Tv, Users, ShieldCheck, Phone, Send, Ticket, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { WhyRimnaLottery } from "@/components/WhyRimnaLottery";
import type { CMSSiteSettings } from "@/lib/sanity/queries";

interface AboutViewProps {
  siteSettings?: CMSSiteSettings | null;
}

export function AboutView({ siteSettings }: AboutViewProps) {
  const { t, getLocalized } = useLanguage();
  const pageT = t.aboutPage;

  const contactPhone = siteSettings?.contactPhone || "+251 911 000 000";
  const telegramHandle = siteSettings?.telegramHandle || "@RimnaLotteryOfficial";
  const telegramUrl = siteSettings?.telegramUrl || `https://t.me/${telegramHandle.replace("@", "")}`;

  return (
    <div style={{ position: "relative", zIndex: 2, paddingBottom: 80 }}>
      {/* ── 1. Page Header ────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1220,
          margin: "0 auto",
          padding: "clamp(48px, 6vw, 72px) clamp(16px, 3.5vw, 32px) clamp(24px, 3vw, 40px)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "inline-flex", marginBottom: 14 }}>
          <span
            style={{
              background: "rgba(15, 23, 42, 0.8)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1.5px solid #FDE047",
              padding: "6px 14px",
              borderRadius: "30px",
              fontSize: "0.8125rem",
              fontWeight: 900,
              color: "#FEF08A",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 4px 16px rgba(234, 179, 8, 0.3)",
            }}
          >
            <ShieldCheck size={14} color="#FACC15" /> {pageT?.badge || "ETHIOPIA & DIASPORA TRANSPARENT LOTTERY"}
          </span>
        </div>

        <h1
          className="display"
          style={{
            fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            color: "#FFFFFF",
            letterSpacing: "-0.8px",
            margin: "0 0 14px",
            textShadow: "0 2px 20px rgba(0, 0, 0, 0.8)",
          }}
        >
          {pageT?.title || "Why Rimna Digital Lottery?"}
        </h1>

        <p
          style={{
            fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
            lineHeight: 1.6,
            color: "#F1F5F9",
            maxWidth: 700,
            margin: "0 0 24px",
            textShadow: "0 1px 8px rgba(0,0,0,0.8)",
          }}
        >
          {pageT?.subtitle || "Ethiopia and the Diaspora's premier digital lottery built on genuine public transparency, fixed capped participant pools, and 10 guaranteed winners per draw."}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link
            href="/#choose-ticket"
            className="casino-btn-red"
            style={{
              padding: "12px 24px",
              fontSize: "0.9375rem",
              textDecoration: "none",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Ticket size={17} /> {pageT?.pickNumberCta || "Pick Lucky Number Now"}
          </Link>
          <Link
            href="/how-it-works"
            style={{
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(12px)",
              border: "1.5px solid #FDE047",
              color: "#FEF08A",
              borderRadius: "30px",
              padding: "12px 20px",
              fontSize: "0.9375rem",
              textDecoration: "none",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Sparkles size={17} color="#FDE047" /> {pageT?.readGuideCta || "Read Full Guide"}
          </Link>
        </div>
      </section>

      {/* ── 2. Why Rimna Core Pillars Showcase ────────────────────── */}
      <section
        style={{
          maxWidth: 1220,
          margin: "0 auto 36px",
          padding: "0 clamp(16px, 3.5vw, 32px)",
          boxSizing: "border-box",
        }}
      >
        <WhyRimnaLottery />
      </section>

      {/* ── 3. 24/7 Dedicated Player Care Hub ─────────────────────── */}
      <section
        style={{
          maxWidth: 1220,
          margin: "0 auto",
          padding: "0 clamp(16px, 3.5vw, 32px)",
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            background: "rgba(15, 23, 42, 0.62)",
            backdropFilter: "blur(24px) saturate(190%)",
            WebkitBackdropFilter: "blur(24px) saturate(190%)",
            borderRadius: "22px",
            border: "2px solid rgba(253, 224, 71, 0.75)",
            padding: "clamp(20px, 3.5vw, 32px)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
            color: "#FFFFFF",
          }}
        >
          <div>
            <span
              style={{
                fontSize: "0.6875rem",
                color: "#FEF08A",
                textTransform: "uppercase",
                fontWeight: 900,
                letterSpacing: "0.8px",
                display: "block",
              }}
            >
              {pageT?.careBadge || "24/7 DEDICATED CUSTOMER CARE"}
            </span>
            <h3 className="display" style={{ fontSize: "1.35rem", color: "#FFFFFF", fontWeight: 900, margin: "2px 0 4px" }}>
              {pageT?.careTitle || "Official Player Assistance & Verification"}
            </h3>
            <p style={{ fontSize: "0.875rem", color: "#CBD5E1", margin: 0, maxWidth: 600 }}>
              {pageT?.careDesc || "Have questions about ticket verification, payment methods, or claiming cash payouts? Our team is available 24 hours a day."}
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <a
              href={`tel:${contactPhone.replace(/\s+/g, "")}`}
              className="casino-btn-gold"
              style={{
                padding: "11px 20px",
                textDecoration: "none",
                fontWeight: 900,
                fontSize: "0.875rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Phone size={15} color="#111827" /> {pageT?.callBtn || "Call Us"} {contactPhone}
            </a>
            <a
              href={telegramUrl}
              target="_blank"
              rel="noreferrer"
              className="casino-btn-red"
              style={{
                padding: "11px 20px",
                textDecoration: "none",
                fontWeight: 900,
                fontSize: "0.875rem",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Send size={15} /> {pageT?.telegramBtn || "Join Telegram"} {telegramHandle}
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
