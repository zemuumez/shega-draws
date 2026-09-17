"use client";

import React, { useState } from "react";
import { Star, Send, CheckCircle2, ChevronLeft, ChevronRight, MessageSquare, BellRing } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CMSTestimonial } from "@/lib/sanity/queries";

interface TestimonialsNewsletterProps {
  cmsTestimonials?: CMSTestimonial[] | null;
}

export function TestimonialsNewsletter({ cmsTestimonials }: TestimonialsNewsletterProps) {
  const { text, language, t, getLocalized } = useLanguage();
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [subscribeError, setSubscribeError] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  const testimonials = cmsTestimonials || [];

  const handleNext = () => {
    if (testimonials.length) setTestimonialIdx((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    if (testimonials.length) setTestimonialIdx((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[testimonialIdx % (testimonials.length || 1)];
  const currentQuote = getLocalized(current, "quote", current?.quote || "");
  const currentLocation = getLocalized(current, "location", current?.location || "");
  const currentPrize = getLocalized(current, "prizeWon", current?.prizeWon || "");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !email.trim()) return;
    setSaving(true); setSubscribeError("");
    try {
      const response = await fetch("/api/subscribe", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({contact:email})});
      if (!response.ok) throw new Error("save failed");
      setSubscribed(true);
    } catch {setSubscribeError("Subscription could not be saved. Please try again.");}
    finally {setSaving(false);}
  };

  return (
    <div>
      {/* ── Section Header (Fully Localized) ── */}
      <div style={{ textAlign: "center", marginBottom: "clamp(28px, 4vw, 44px)" }}>
        <span
          style={{
            background: "rgba(253, 224, 71, 0.15)",
            border: "1px solid #FDE047",
            borderRadius: "20px",
            padding: "4px 12px",
            fontSize: "0.75rem",
            fontWeight: 900,
            color: "#FEF08A",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          ⭐ {t.winners?.badge || "100% TRANSPARENT PLAYER PROOFS"}
        </span>
        <h2
          className="display"
          style={{
            fontSize: "clamp(1.5rem, 3.2vw, 2.2rem)",
            fontWeight: 900,
            color: "#FFFFFF",
            margin: "10px 0 6px",
          }}
        >
          {t.winners?.title || "Real Winners. Instant Video Payouts."}
        </h2>
        <p style={{ color: "#94A3B8", fontSize: "0.9375rem", margin: 0 }}>
          {t.winners?.subtitle || "Hear directly from verified Ethiopian & Diaspora winners who watched their numbers drawn live."}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 20,
          margin: "0",
        }}
      >
        {/* ── 1. Verified Winner Stories Card ────────────────────── */}
        {current && <div
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
                {t.testimonialsSection?.winnerStoriesTitle || "Winner Testimonials"}
              </h4>
            </div>

            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                aria-label={text("Previous testimonial")}
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
                aria-label={text("Next testimonial")}
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
                {current.name} · {currentLocation}
              </strong>
              <span className="mono" style={{ fontSize: "0.8125rem", color: "#FDE047", fontWeight: 800 }}>
                🏆 {currentPrize}
                {current.drawTitle ? ` — ${current.drawTitle}` : ""}
              </span>
            </div>
          </div>
        </div>}

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
                {t.testimonialsSection?.communityTitle || "Official Community & Alerts"}
              </h4>
            </div>
            <p style={{ fontSize: "0.875rem", color: "#CBD5E1", lineHeight: 1.55, margin: "8px 0 20px" }}>
              {text("Register your email or Telegram handle for community draw updates.")}
            </p>
          </div>

          {subscribeError && <p role="alert">{text(subscribeError)}</p>}
          {subscribed ? (
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#34D399", fontWeight: 800, fontSize: "0.9375rem", padding: "10px 0" }}>
              <CheckCircle2 size={20} color="#34D399" /> {text("Registration saved. Our team will use your contact for community updates.")}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <input
                type="text"
                placeholder={t.testimonialsSection?.inputPlaceholder || "Enter email or Telegram @handle"}
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
                disabled={saving}
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
                {saving ? text("Saving…") : t.testimonialsSection?.joinAlertsBtn || "Join Alerts"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
