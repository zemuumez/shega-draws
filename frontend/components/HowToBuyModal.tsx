"use client";

import React, { useState, useEffect } from "react";
import { X, ChevronRight, ChevronLeft, Ticket, Users, UserCheck, CreditCard, CheckCircle2, Play, Pause } from "lucide-react";
import Link from "next/link";

interface HowToBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const STEPS = [
  {
    stepNum: 1,
    title: "Choose Your Ticket & Pool Size",
    desc: "Pick your preferred ticket price (in ETB or USD) and select the participant pool size (e.g. 1,000, 2,000, 3,000, or 5,000 people).",
    icon: Users,
    color: "#2A65E6",
    bg: "#EFF6FF",
    border: "#BFDBFE",
    highlight: "Fixed Pool Capacity · 10 Guaranteed Winners",
  },
  {
    stepNum: 2,
    title: "Enter Your Contact Info",
    desc: "Fill in your full name and mobile phone number (Telebirr/CBE or WhatsApp for diaspora). This is where your cash prize payout will be sent!",
    icon: UserCheck,
    color: "#EAB308",
    bg: "#FEF9C3",
    border: "#FDE047",
    highlight: "Fast Verification · Optional Promo Code",
  },
  {
    stepNum: 3,
    title: "Pick Your Lucky Number",
    desc: "Explore the live scrollable number board and select your lucky number from #1 up to your pool limit. Red numbers are taken, so pick any open green/white slot!",
    icon: Ticket,
    color: "#10B981",
    bg: "#ECFDF5",
    border: "#A7F3D0",
    highlight: "Live Dynamic Board · 1st Come 1st Served",
  },
  {
    stepNum: 4,
    title: "Pay & Confirm Your Entry",
    desc: "Send your payment via Telebirr, CBE Birr, Bank Transfer, or International Card/PayPal. Upload your receipt screenshot and your ticket is locked in for the Live Draw!",
    icon: CreditCard,
    color: "#8B5CF6",
    bg: "#F5F3FF",
    border: "#DDD6FE",
    highlight: "Watch the Live Draw Broadcast & Win!",
  },
];

export function HowToBuyModal({ isOpen, onClose }: HowToBuyModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Auto-advance slides every 3.5 seconds when open
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen, isAutoPlaying]);

  if (!isOpen) return null;

  const stepData = STEPS[currentStep];
  const StepIcon = stepData.icon;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(12, 38, 102, 0.7)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="card-base animate-fade"
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: 520,
          padding: "32px 28px 26px",
          position: "relative",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.35)",
          border: "2px solid #FDE047",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "#F1F5F9",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-muted)",
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Top Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span className="badge badge-gold" style={{ marginBottom: 6, fontSize: "0.75rem" }}>
            📖 SIMPLE 4-STEP GUIDE
          </span>
          <h3 className="display" style={{ fontSize: "1.45rem", color: "var(--blue-navy)", fontWeight: 900 }}>
            How to Buy a Ticket
          </h3>
        </div>

        {/* Step Progress Indicators */}
        <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
          {STEPS.map((s, idx) => (
            <button
              key={s.stepNum}
              type="button"
              onClick={() => setCurrentStep(idx)}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 6,
                background: idx === currentStep ? "#2A65E6" : idx < currentStep ? "#93C5FD" : "#E2E8F0",
                border: "none",
                cursor: "pointer",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>

        {/* Active Step Content Slide */}
        <div
          style={{
            background: stepData.bg,
            border: `1.5px solid ${stepData.border}`,
            borderRadius: "16px",
            padding: "24px 20px",
            textAlign: "center",
            marginBottom: 24,
            minHeight: 210,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 54,
              height: 54,
              borderRadius: "50%",
              background: "#FFFFFF",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: `0 4px 12px ${stepData.border}`,
              marginBottom: 12,
            }}
          >
            <StepIcon size={26} color={stepData.color} />
          </div>

          <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 800, color: stepData.color, textTransform: "uppercase", marginBottom: 4 }}>
            STEP {stepData.stepNum} OF 4
          </span>

          <h4 className="display" style={{ fontSize: "1.2rem", color: "var(--blue-navy)", fontWeight: 900, marginBottom: 8 }}>
            {stepData.title}
          </h4>

          <p style={{ color: "var(--text-main)", fontSize: "0.875rem", lineHeight: 1.5, maxWidth: 420 }}>
            {stepData.desc}
          </p>

          <span
            style={{
              marginTop: 10,
              fontSize: "0.75rem",
              fontWeight: 800,
              color: stepData.color,
              background: "#FFFFFF",
              padding: "4px 10px",
              borderRadius: "12px",
              border: `1px solid ${stepData.border}`,
            }}
          >
            ✓ {stepData.highlight}
          </span>
        </div>

        {/* Modal Controls & CTA */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              disabled={currentStep === 0}
              onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
              className="btn-base btn-secondary"
              style={{ padding: "8px 12px", fontSize: "0.8125rem", opacity: currentStep === 0 ? 0.4 : 1 }}
            >
              <ChevronLeft size={16} /> Prev
            </button>
            <button
              type="button"
              disabled={currentStep === STEPS.length - 1}
              onClick={() => setCurrentStep((prev) => Math.min(STEPS.length - 1, prev + 1))}
              className="btn-base btn-secondary"
              style={{ padding: "8px 12px", fontSize: "0.8125rem", opacity: currentStep === STEPS.length - 1 ? 0.4 : 1 }}
            >
              Next <ChevronRight size={16} />
            </button>
          </div>

          <Link
            href="/enter"
            onClick={onClose}
            className="btn-base btn-primary"
            style={{ padding: "10px 20px", fontSize: "0.875rem", fontWeight: 800 }}
          >
            <Ticket size={16} /> Buy Ticket Now
          </Link>
        </div>
      </div>
    </div>
  );
}
