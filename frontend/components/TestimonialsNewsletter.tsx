"use client";

import React, { useState } from "react";
import { Star, Send, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare, BellRing } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CMSTestimonial } from "@/lib/sanity/queries";

interface TestimonialsNewsletterProps {
  cmsTestimonials?: CMSTestimonial[] | null;
}

export function TestimonialsNewsletter({ cmsTestimonials }: TestimonialsNewsletterProps) {
  const { language } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  // Fallback hardcoded testimonials
  const fallbackTestimonials: CMSTestimonial[] = [
    {
      _id: "fb1",
      name: "Tewodros Kassahun",
      location: "Addis Ababa",
      prizeWon: "80,000 ETB (1st Place Winner)",
      quote: "I watched the live video broadcast when my number was drawn! The CBE transfer arrived in my account in less than 20 minutes!",
      rating: 5,
    },
    {
      _id: "fb2",
      name: "Helen Mengistu",
      location: "Washington, DC (Diaspora)",
      prizeWon: "$15,000 USD (1st Place Winner)",
      quote: "Playing from the USA was so seamless with my card. The 10 guaranteed winners structure gives real winning chances!",
      rating: 5,
    },
    {
      _id: "fb3",
      name: "Yonas Birhane",
      location: "Hawassa",
      prizeWon: "65,000 ETB (2nd Place Winner)",
      quote: "Rimna is truly the most transparent lottery platform. You see your ticket number on the board and verify the outcome yourself.",
      rating: 5,
    },
  ];

  const testimonials = cmsTestimonials && cmsTestimonials.length > 0 ? cmsTestimonials : fallbackTestimonials;

  const handleNext = () => {
    setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[testimonialIdx];
  const currentQuote =
    (language === "am" && current.quoteAm) ||
    (language === "om" && current.quoteOm) ||
    current.quote;

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
    }
  };

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: 20,
        margin: "0",
      }}
    >
      {/* ── 1. Verified Winner Stories Card ────────────────────── */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          border: "1.5px solid rgba(253, 224, 71, 0.35)",
          padding: "26px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
          color: "#FFFFFF",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "rgba(253, 224, 71, 0.15)",
                border: "1px solid #FDE047",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <MessageSquare size={16} color="#FDE047" />
            </div>
            <h4 className="display" style={{ fontSize: "1.2rem", color: "#FEF08A", fontWeight: 900, margin: 0 }}>
              Winner Testimonials
            </h4>
          </div>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              aria-label="Previous testimonial"
              onClick={handlePrev}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid rgba(253, 224, 71, 0.4)",
                background: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#FFFFFF",
                transition: "all 120ms ease",
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              aria-label="Next testimonial"
              onClick={handleNext}
              style={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                border: "1px solid rgba(253, 224, 71, 0.4)",
                background: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#FFFFFF",
                transition: "all 120ms ease",
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
            {[...Array(current.rating || 5)].map((_, i) => (
              <Star key={i} size={15} fill="#FACC15" color="#FACC15" />
            ))}
          </div>

          <p style={{ fontStyle: "italic", color: "#E2E8F0", fontSize: "0.9375rem", lineHeight: 1.65, margin: "0 0 16px" }}>
            &ldquo;{currentQuote}&rdquo;
          </p>

          <div style={{ borderTop: "1px solid rgba(255, 255, 255, 0.1)", paddingTop: 12 }}>
            <strong style={{ color: "#FFFFFF", fontSize: "0.9375rem", display: "block" }}>
              {current.name} · {current.location}
            </strong>
            <span className="mono" style={{ fontSize: "0.8125rem", color: "#FDE047", fontWeight: 800 }}>
              🏆 Won {current.prizeWon}
              {current.drawTitle ? ` — ${current.drawTitle}` : ""}
            </span>
          </div>
        </div>
      </div>

      {/* ── 2. Official Community & Live Alerts Box ─────────── */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.06)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderRadius: "20px",
          border: "1.5px solid rgba(253, 224, 71, 0.35)",
          padding: "26px 24px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
          color: "#FFFFFF",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                background: "rgba(16, 185, 129, 0.15)",
                border: "1px solid #34D399",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BellRing size={16} color="#34D399" />
            </div>
            <h4 className="display" style={{ fontSize: "1.2rem", color: "#FEF08A", fontWeight: 900, margin: 0 }}>
              Official Community & Alerts
            </h4>
          </div>
          <p style={{ fontSize: "0.875rem", color: "#CBD5E1", lineHeight: 1.55, margin: "8px 0 20px" }}>
            Get instant Telegram and SMS notifications when a new jackpot pool opens or winning numbers are drawn live on video.
          </p>
        </div>

        {subscribed ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#34D399", fontWeight: 800, fontSize: "0.9375rem", padding: "10px 0" }}>
            <CheckCircle2 size={20} color="#34D399" /> Subscribed! You will receive draw notifications.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Enter email or Telegram @handle"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{
                fontSize: "0.875rem",
                flex: 1,
                minWidth: 180,
                background: "rgba(15, 23, 42, 0.7)",
                border: "1.5px solid rgba(253, 224, 71, 0.4)",
                borderRadius: "10px",
                padding: "11px 14px",
                color: "#FFFFFF",
                outline: "none",
              }}
            />
            <button
              type="submit"
              className="casino-btn-red"
              style={{
                padding: "11px 20px",
                fontSize: "0.875rem",
                fontWeight: 900,
                borderRadius: "10px",
                whiteSpace: "nowrap",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(220, 38, 38, 0.4)",
              }}
            >
              Join Alerts
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
