"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
  Pause,
  Play,
  ArrowRight,
} from "lucide-react";
import type { CMSAdvertisement } from "@/lib/sanity/queries";

interface AdItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  estimatedValue: string;
  imageUrl: string;
  statusTag: string;
}

const DEFAULT_ADS: AdItem[] = [
  {
    id: "ad-car",
    badge: "🚗 GRAND LUXURY SUV",
    title: "2026 Electric Luxury SUV",
    subtitle: "100% Guaranteed delivery or full cash equivalent. Featured grand reward in upcoming pool.",
    estimatedValue: "4,500,000 ETB",
    imageUrl: "/images/ad-luxury-car.jpg",
    statusTag: "⏳ COMING SOON",
  },
  {
    id: "ad-villa",
    badge: "🏡 3-BEDROOM DREAM VILLA",
    title: "Contemporary Luxury Villa",
    subtitle: "Architectural masterpiece with private pool and panoramic mountain views. Live video drawn.",
    estimatedValue: "12,000,000 ETB",
    imageUrl: "/images/ad-luxury-villa.jpg",
    statusTag: "⏳ COMING SOON",
  },
  {
    id: "ad-appliances",
    badge: "⚡ SMART HOME APPLIANCES",
    title: "Smart Kitchen & Tech Bundle",
    subtitle: "4-Door French Smart Refrigerator, 85\" 4K OLED TV, and Flagship Tech Pack.",
    estimatedValue: "1,500,000 ETB",
    imageUrl: "/images/ad-smart-appliances.jpg",
    statusTag: "⏳ COMING SOON",
  },
  {
    id: "ad-cash-jackpot",
    badge: "💎 DIASPORA CASH JACKPOT",
    title: "$1,250,000 USD High Prize",
    subtitle: "Exclusive diaspora dollar pool with instant international bank wire transfer.",
    estimatedValue: "$1,250,000 USD",
    imageUrl: "/images/rimna-stadium-hero.jpg",
    statusTag: "⏳ COMING SOON",
  },
  {
    id: "ad-holiday-special",
    badge: "🎉 HOLIDAY MEGA DRAW",
    title: "1,000,000 ETB Cash Reward",
    subtitle: "Top 10 winners guaranteed. Zero rollover delay with live verified broadcast.",
    estimatedValue: "1,000,000 ETB",
    imageUrl: "/images/rimna-official-hero.jpg",
    statusTag: "⏳ COMING SOON",
  },
];

interface AdvertisementCarouselProps {
  cmsAds?: CMSAdvertisement[] | null;
}

export function AdvertisementCarousel({ cmsAds }: AdvertisementCarouselProps) {
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Map CMS ads or fallback to default
  const baseAds: AdItem[] =
    cmsAds && cmsAds.length > 0
      ? cmsAds.map((ad, idx) => ({
          id: ad._id || `ad-${idx}`,
          badge: ad.badge || "📢 FEATURED REWARD",
          title: ad.title,
          subtitle: ad.subtitle,
          estimatedValue: ad.estimatedValue || "Upcoming Reward",
          imageUrl: ad.imageUrl || DEFAULT_ADS[idx % DEFAULT_ADS.length].imageUrl,
          statusTag: "⏳ COMING SOON",
        }))
      : DEFAULT_ADS;

  // Quadruple the items to ensure a seamless infinite seamless continuous loop
  const infiniteAds = [...baseAds, ...baseAds, ...baseAds, ...baseAds];

  return (
    <section
      style={{
        maxWidth: 1360,
        margin: "0 auto",
        padding: "0 clamp(12px, 3vw, 24px)",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes smoothInfiniteAdScroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .ad-continuous-track {
          display: flex;
          gap: 16px;
          width: max-content;
          animation: smoothInfiniteAdScroll 38s linear infinite;
          will-change: transform;
        }
        .ad-continuous-track:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ── Header Row: Title & Smooth Autoscroll Status ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
            <span
              style={{
                background: "rgba(254, 240, 138, 0.9)",
                border: "1px solid #EAB308",
                borderRadius: "20px",
                padding: "2px 9px",
                fontSize: "0.6875rem",
                fontWeight: 900,
                color: "#854D0E",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Sparkles size={11} color="#B45309" /> UPCOMING LOTTERIES & SPONSOR SHOWCASE
            </span>
          </div>
          <h2
            className="display"
            style={{
              fontSize: "clamp(1.3rem, 2.6vw, 1.75rem)",
              fontWeight: 900,
              color: "#111827",
              margin: 0,
              lineHeight: 1.15,
            }}
          >
            Major Grand Prizes & Coming Soon Draws
          </h2>
        </div>

        {/* Hover status hint / Pause toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "20px",
              padding: "4px 12px",
              fontSize: "0.6875rem",
              fontWeight: 800,
              color: "#475569",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              cursor: "pointer",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
          >
            {isPaused ? (
              <>
                <Play size={11} color="#059669" /> Resume Scroll
              </>
            ) : (
              <>
                <Pause size={11} color="#D97706" /> Hover to Pause
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Continuous Smooth Marquee Track with Fade Masks ── */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          position: "relative",
          width: "100%",
          overflow: "hidden",
          padding: "6px 0",
          maskImage: "linear-gradient(to right, transparent, black 2.5%, black 97.5%, transparent)",
          WebkitMaskImage: "linear-gradient(to right, transparent, black 2.5%, black 97.5%, transparent)",
        }}
      >
        <div
          className="ad-continuous-track"
          style={{
            animationPlayState: isPaused ? "paused" : "running",
          }}
        >
          {infiniteAds.map((ad, idx) => (
            <div
              key={`${ad.id}-${idx}`}
              style={{
                width: "clamp(290px, 28vw, 360px)",
                flexShrink: 0,
                background: "rgba(255, 253, 245, 0.95)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                borderRadius: "18px",
                border: "2px solid #F59E0B",
                boxShadow: "0 6px 18px rgba(245, 158, 11, 0.16), 0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxSizing: "border-box",
                transition: "transform 180ms ease, box-shadow 180ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-4px)";
                e.currentTarget.style.boxShadow = "0 12px 28px rgba(245, 158, 11, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "0 6px 18px rgba(245, 158, 11, 0.16)";
              }}
            >
              {/* Card Image with Overlaid Badges */}
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  height: 180,
                  background: "#0F172A",
                  overflow: "hidden",
                }}
              >
                <Image
                  src={ad.imageUrl}
                  alt={ad.title}
                  fill
                  style={{
                    objectFit: "cover",
                    objectPosition: "center center",
                  }}
                />

                {/* Top Category Badge */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "rgba(17, 24, 39, 0.88)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    border: "1px solid rgba(253, 224, 71, 0.6)",
                    borderRadius: "14px",
                    padding: "3px 8px",
                    fontSize: "0.6875rem",
                    fontWeight: 900,
                    color: "#FEF08A",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  {ad.badge}
                </div>

                {/* Top Right "Coming Soon" Pill */}
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "rgba(220, 38, 38, 0.92)",
                    backdropFilter: "blur(6px)",
                    WebkitBackdropFilter: "blur(6px)",
                    border: "1px solid #FCA5A5",
                    borderRadius: "14px",
                    padding: "3px 8px",
                    fontSize: "0.625rem",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 3,
                  }}
                >
                  <Clock size={10} /> COMING SOON
                </div>

                {/* Bottom Left Estimated Value Pill */}
                <div
                  style={{
                    position: "absolute",
                    bottom: 10,
                    left: 10,
                    background: "rgba(255, 255, 255, 0.95)",
                    border: "1.5px solid #FDE047",
                    borderRadius: "8px",
                    padding: "3px 8px",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
                  }}
                >
                  <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 900, color: "#111827" }}>
                    {ad.estimatedValue}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div
                style={{
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  flex: 1,
                  gap: 10,
                  background: "linear-gradient(180deg, #FFFDF5 0%, #FEF9C3 100%)",
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                    <CheckCircle2 size={12} color="#059669" />
                    <span style={{ fontSize: "0.6875rem", color: "#059669", fontWeight: 900, textTransform: "uppercase" }}>
                      Upcoming Official Pool
                    </span>
                  </div>

                  <h3
                    className="display"
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 900,
                      color: "#111827",
                      lineHeight: 1.25,
                      margin: "2px 0 6px",
                    }}
                  >
                    {ad.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "0.8125rem",
                      color: "#4B5563",
                      lineHeight: 1.45,
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {ad.subtitle}
                  </p>
                </div>

                {/* Bottom Status Footer (No Buy Buttons) */}
                <div
                  style={{
                    paddingTop: 8,
                    borderTop: "1px dashed #FDE047",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "#92400E",
                    fontWeight: 800,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Calendar size={12} /> Stay Tuned
                  </span>
                  <span style={{ color: "#B45309" }}>100% Video Draw</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
