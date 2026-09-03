"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Trophy, CheckCircle2, Sparkles, Play, ArrowRight, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface HeroJackpotSectionProps {
  onBuyNowClick?: () => void;
  deadline?: string;
}

export function HeroJackpotSection({
  onBuyNowClick,
  deadline = new Date(Date.now() + 2 * 86400000 + 12 * 3600000 + 27 * 60000).toISOString(),
}: HeroJackpotSectionProps) {
  const { language } = useLanguage();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 12, minutes: 27, seconds: 24 });

  useEffect(() => {
    function calculateTime() {
      const diff = Math.max(0, new Date(deadline).getTime() - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [deadline]);

  const pad = (n: number) => String(n).padStart(2, "0");

  const scrollToTickets = () => {
    if (onBuyNowClick) {
      onBuyNowClick();
      return;
    }
    const el = document.getElementById("choose-ticket");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section
      style={{
        maxWidth: 1200,
        margin: "0 auto 28px",
        padding: "clamp(12px, 2vw, 24px) clamp(14px, 3vw, 24px)",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "clamp(24px, 4vw, 48px)",
          alignItems: "center",
        }}
      >
        {/* ── Left Column: Headline & Action CTAs ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Top Trust Badges */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span
              style={{
                background: "#FEF9C3",
                border: "1.5px solid #FDE047",
                borderRadius: "20px",
                padding: "4px 12px",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#92400E",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                letterSpacing: "0.3px",
              }}
            >
              <Trophy size={13} color="#D97706" /> 10 GUARANTEED WINNERS PER DRAW
            </span>

            <span
              style={{
                background: "transparent",
                border: "1px solid transparent",
                padding: "4px 8px",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#059669",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <CheckCircle2 size={14} color="#10B981" /> PUBLIC VIDEO BROADCAST
            </span>
          </div>

          {/* Main Title */}
          <h1
            className="display"
            style={{
              fontSize: "clamp(2rem, 4.2vw, 3.2rem)",
              lineHeight: 1.08,
              fontWeight: 900,
              color: "#111827",
              margin: "4px 0 0",
              letterSpacing: "-0.5px",
            }}
          >
            100 Birr Classic Multi-Pool Draw
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: "clamp(0.95rem, 1.8vw, 1.0625rem)",
              lineHeight: 1.55,
              color: "#4B5563",
              margin: 0,
              maxWidth: 520,
            }}
          >
            Pick your lucky number, choose your pool capacity, and watch our founders draw the 10 winning numbers live on video stream.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", marginTop: 8 }}>
            <button
              type="button"
              onClick={scrollToTickets}
              style={{
                background: "linear-gradient(135deg, #FDE047 0%, #EAB308 50%, #CA8A04 100%)",
                color: "#111827",
                fontWeight: 900,
                fontSize: "1rem",
                padding: "14px 34px",
                borderRadius: "10px",
                border: "1.5px solid #FEF08A",
                boxShadow: "0 6px 18px rgba(234, 179, 8, 0.4)",
                cursor: "pointer",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                transition: "transform 150ms ease, box-shadow 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 8px 24px rgba(234, 179, 8, 0.5)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(234, 179, 8, 0.4)";
              }}
            >
              BUY NOW
            </button>

            <Link
              href="/results"
              style={{
                background: "#0F172A",
                color: "#F8FAFC",
                fontWeight: 800,
                fontSize: "0.9375rem",
                padding: "14px 24px",
                borderRadius: "10px",
                border: "1.5px solid #334155",
                boxShadow: "0 4px 14px rgba(15, 23, 42, 0.25)",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                textDecoration: "none",
                transition: "background 150ms ease, transform 150ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#1E293B";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#0F172A";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              <Trophy size={16} color="#FACC15" /> View Results & Live Stream
            </Link>
          </div>
        </div>

        {/* ── Right Column: Featured Banner Graphic & Countdown Box ── */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div
            style={{
              width: "100%",
              maxWidth: 490,
              background: "#FFFFFF",
              borderRadius: "16px",
              border: "2px solid #E5E7EB",
              boxShadow: "0 16px 36px -8px rgba(0, 0, 0, 0.12)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Image Banner Top with Overlays */}
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "16 / 9",
                background: "linear-gradient(135deg, #0B1936 0%, #152B5E 100%)",
                overflow: "hidden",
              }}
            >
              <Image
                src="/images/rimna-lottery-card.jpg"
                alt="Rimna Digital Lottery Official Banner Artwork"
                fill
                priority
                style={{ objectFit: "cover" }}
              />

              {/* Bottom Overlays */}
              <div
                style={{
                  position: "absolute",
                  bottom: 10,
                  left: 10,
                  right: 10,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    background: "rgba(255, 255, 255, 0.95)",
                    color: "#111827",
                    fontSize: "0.6875rem",
                    fontWeight: 800,
                    padding: "3px 8px",
                    borderRadius: "20px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                  }}
                >
                  <Trophy size={11} color="#D97706" /> 100% Guaranteed Payouts
                </span>

                <span
                  style={{
                    color: "#FFFFFF",
                    fontSize: "0.6875rem",
                    fontWeight: 800,
                    textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
                  Live Video Draw
                </span>
              </div>
            </div>

            {/* Countdown Clock Grid */}
            <div
              style={{
                padding: "16px 18px",
                background: "#FFFFFF",
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 10,
                textAlign: "center",
                borderTop: "1px solid #F3F4F6",
              }}
            >
              {[
                { val: pad(timeLeft.days), label: "DAYS" },
                { val: pad(timeLeft.hours), label: "HRS" },
                { val: pad(timeLeft.minutes), label: "MIN" },
                { val: pad(timeLeft.seconds), label: "SEC" },
              ].map((item, idx) => (
                <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    className="mono"
                    style={{
                      fontSize: "clamp(1.45rem, 3vw, 1.85rem)",
                      fontWeight: 900,
                      color: "#111827",
                      lineHeight: 1,
                    }}
                  >
                    {item.val}
                  </div>
                  <span
                    style={{
                      fontSize: "0.6875rem",
                      fontWeight: 800,
                      color: "#6B7280",
                      letterSpacing: "0.5px",
                      marginTop: 4,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
