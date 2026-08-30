"use client";

import React, { useState } from "react";
import { Star, Send, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

import { type CMSTestimonial } from "@/lib/sanity/queries";

interface TestimonialsNewsletterProps {
  cmsTestimonials?: CMSTestimonial[];
}

export function TestimonialsNewsletter({ cmsTestimonials }: TestimonialsNewsletterProps) {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const defaultTestimonials = [
    {
      name: "Tewodros Kassahun",
      location: "Addis Ababa",
      prize: "80,000 ETB (1st Place Winner)",
      quote: "I watched the live video broadcast when my number was drawn! The CBE transfer arrived in my account in less than 20 minutes!",
    },
    {
      name: "Helen Mengistu",
      location: "Washington, DC (Diaspora)",
      prize: "$15,000 USD (1st Place Winner)",
      quote: "Playing from the USA was so seamless with my card. The 10 guaranteed winners structure gives real winning chances!",
    },
    {
      name: "Yonas Birhane",
      location: "Hawassa",
      prize: "65,000 ETB (2nd Place Winner)",
      quote: "Rimna is truly the most transparent lottery platform. You see your ticket number on the board and verify the outcome yourself.",
    },
  ];

  const testimonials = (cmsTestimonials && cmsTestimonials.length > 0)
    ? cmsTestimonials.map((t) => ({
        name: t.name,
        location: t.location,
        prize: t.prize,
        quote: t.quote,
      }))
    : defaultTestimonials;

  const handleNext = () => {
    setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[testimonialIdx] || testimonials[0];

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
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 16,
        margin: "20px 0 24px",
      }}
    >
      {/* ── Testimonials Box ──────────────────────────────────── */}
      <div
        className="card-base"
        style={{
          background: "#FFFFFF",
          borderRadius: "14px",
          border: "1.5px solid var(--gray-line)",
          padding: "24px 22px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h4 className="display" style={{ fontSize: "1.125rem", color: "var(--blue-navy)", fontWeight: 900 }}>
            Winner Testimonials
          </h4>

          <div style={{ display: "flex", gap: 6 }}>
            <button
              type="button"
              onClick={handlePrev}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid var(--gray-line)",
                background: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              type="button"
              onClick={handleNext}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid var(--gray-line)",
                background: "#F8FAFC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <div style={{ display: "flex", gap: 3, marginBottom: 8 }}>
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={14} fill="#EAB308" color="#EAB308" />
            ))}
          </div>

          <p style={{ fontStyle: "italic", color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 12 }}>
            &ldquo;{current.quote}&rdquo;
          </p>

          <div>
            <strong style={{ color: "var(--blue-navy)", fontSize: "0.875rem", display: "block" }}>
              {current.name} · {current.location}
            </strong>
            <span className="mono" style={{ fontSize: "0.75rem", color: "var(--gold-deep)", fontWeight: 700 }}>
              Won {current.prize}
            </span>
          </div>
        </div>
      </div>

      {/* ── Join The Newsletter / Telegram Community Box ───────── */}
      <div
        className="card-base"
        style={{
          background: "#FFFFFF",
          borderRadius: "14px",
          border: "1.5px solid var(--gray-line)",
          padding: "24px 22px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
        }}
      >
        <div>
          <h4 className="display" style={{ fontSize: "1.125rem", color: "var(--blue-navy)", fontWeight: 900, marginBottom: 4 }}>
            Join The Community & Alerts
          </h4>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: 16 }}>
            Get instant SMS and Telegram alerts when new jackpot pools open or winning numbers are revealed.
          </p>
        </div>

        {subscribed ? (
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--teal-dark)", fontWeight: 700, fontSize: "0.875rem", padding: "10px 0" }}>
            <CheckCircle2 size={18} color="var(--teal)" /> Subscribed! You will receive draw notifications.
          </div>
        ) : (
          <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              className="input-base"
              placeholder="Enter email or Telegram handle"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ fontSize: "0.875rem", flex: 1 }}
            />
            <button
              type="submit"
              className="btn-base"
              style={{
                background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                color: "#FFFFFF",
                fontWeight: 800,
                fontSize: "0.8125rem",
                padding: "10px 18px",
                borderRadius: "8px",
                boxShadow: "0 2px 6px rgba(185, 28, 28, 0.3)",
              }}
            >
              Sign Up
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
