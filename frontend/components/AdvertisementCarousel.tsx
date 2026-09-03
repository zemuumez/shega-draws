"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Clock,
  CheckCircle2,
  Calendar,
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
    subtitle: "100% Guaranteed delivery or full cash equivalent. Featured grand reward in our upcoming luxury pool.",
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [visibleCount, setVisibleCount] = useState(3);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Map CMS ads or fallback to default
  const ads: AdItem[] =
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

  // Responsive items per view: 3 on Desktop, 2 on Tablet, 1 on Mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 680) {
        setVisibleCount(1);
      } else if (window.innerWidth < 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const maxIndex = Math.max(0, ads.length - visibleCount);

  // Auto-scroll every 4 seconds (pauses on hover)
  useEffect(() => {
    if (isPaused || maxIndex <= 0) return;

    timeoutRef.current = setTimeout(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentIndex, isPaused, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  return (
    <section
      style={{
        maxWidth: 1220,
        margin: "0 auto 36px",
        padding: "0 clamp(14px, 3.5vw, 32px)",
        boxSizing: "border-box",
      }}
    >
      {/* ── Header Row: Title & Manual Controls ── */}
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
                background: "#FEF9C3",
                border: "1px solid #FDE047",
                borderRadius: "20px",
                padding: "2px 9px",
                fontSize: "0.6875rem",
                fontWeight: 900,
                color: "#92400E",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Sparkles size={11} color="#D97706" /> UPCOMING LOTTERIES & ADVERTISEMENTS
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

        {/* Manual Arrow Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            type="button"
            aria-label="Previous advertisement"
            onClick={handlePrev}
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E5E7EB",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#111827",
              boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
              transition: "all 140ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEF9C3";
              e.currentTarget.style.borderColor = "#FDE047";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          >
            <ChevronLeft size={18} />
          </button>

          <button
            type="button"
            aria-label="Next advertisement"
            onClick={handleNext}
            style={{
              background: "#FFFFFF",
              border: "1.5px solid #E5E7EB",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#111827",
              boxShadow: "0 2px 5px rgba(0,0,0,0.06)",
              transition: "all 140ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FEF9C3";
              e.currentTarget.style.borderColor = "#FDE047";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#FFFFFF";
              e.currentTarget.style.borderColor = "#E5E7EB";
            }}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* ── 3-Card Carousel Track (Shows 3 Cards At A Time on Desktop) ── */}
      <div
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
        style={{
          overflow: "hidden",
          width: "100%",
          borderRadius: "20px",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: 16,
            transition: "transform 400ms cubic-bezier(0.25, 1, 0.5, 1)",
            transform: `translateX(calc(-${currentIndex} * (${100 / visibleCount}% + ${16 / visibleCount}px - ${16 / visibleCount}px)))`,
          }}
        >
          {ads.map((ad) => (
            <div
              key={ad.id}
              style={{
                flex: `0 0 calc(${100 / visibleCount}% - ${(16 * (visibleCount - 1)) / visibleCount}px)`,
                minWidth: 0,
                background: "#FFFDF5",
                borderRadius: "18px",
                border: "2px solid #F59E0B",
                boxShadow: "0 6px 18px rgba(245, 158, 11, 0.16), 0 1px 3px rgba(0,0,0,0.05)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                boxSizing: "border-box",
                transition: "transform 140ms ease, box-shadow 140ms ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-3px)";
                e.currentTarget.style.boxShadow = "0 12px 26px rgba(245, 158, 11, 0.28)";
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

                {/* Bottom Left Value Pill */}
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

              {/* Card Content (Clean Informational Ad Showcase Without Buttons) */}
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

                {/* Bottom Status Footer (No Buy Button) */}
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

      {/* ── Pagination Indicator Dots ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 6,
          marginTop: 14,
        }}
      >
        {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
          <button
            key={idx}
            type="button"
            aria-label={`Go to slide group ${idx + 1}`}
            onClick={() => setCurrentIndex(idx)}
            style={{
              width: idx === currentIndex ? 20 : 6,
              height: 6,
              borderRadius: 3,
              background: idx === currentIndex ? "#111827" : "#D1D5DB",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 200ms ease",
            }}
          />
        ))}
      </div>
    </section>
  );
}
