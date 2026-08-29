"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronRight, ChevronLeft, Ticket, Users, UserCheck, CreditCard } from "lucide-react";

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
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-advance slides every 3.5 seconds when open
  useEffect(() => {
    if (!isOpen || !isAutoPlaying) return;
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % STEPS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, [isOpen, isAutoPlaying]);

  if (!isOpen || !mounted) return null;

  const stepData = STEPS[currentStep];
  const StepIcon = stepData.icon;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 25, 59, 0.75)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 99999,
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
          padding: "clamp(20px, 4vw, 32px)",
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
            top: 14,
            right: 14,
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

        {/* Modal Header with Progress Pills */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span
              style={{
                background: "var(--blue-bg)",
                color: "#2A65E6",
                border: "1px solid var(--blue-border)",
                padding: "3px 10px",
                borderRadius: "12px",
                fontSize: "0.6875rem",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "0.4px",
              }}
            >
              Step-by-Step Guide
            </span>

            <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontWeight: 700 }}>
              Step {currentStep + 1} of {STEPS.length}
            </span>
          </div>

          <h3 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", fontWeight: 900, lineHeight: 1.2 }}>
            How to Buy Your Lottery Ticket
          </h3>
          <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: 2 }}>
            Follow these 4 simple steps to secure your lucky numbers.
          </p>
        </div>

        {/* 4 Step Progress Indicators */}
        <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
          {STEPS.map((s, idx) => (
            <button
              key={s.stepNum}
              type="button"
              onClick={() => setCurrentStep(idx)}
              style={{
                flex: 1,
                height: 6,
                borderRadius: 4,
                border: "none",
                background: idx === currentStep ? "#2A65E6" : idx < currentStep ? "var(--teal)" : "#E2E8F0",
                cursor: "pointer",
                transition: "all 300ms ease",
              }}
            />
          ))}
        </div>

        {/* Active Step Content Card */}
        <div
          style={{
            background: stepData.bg,
            border: `1.5px solid ${stepData.border}`,
            borderRadius: "14px",
            padding: "20px 22px",
            marginBottom: 22,
            minHeight: 180,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#FFFFFF",
                  border: `1.5px solid ${stepData.border}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
                }}
              >
                <StepIcon size={18} color={stepData.color} />
              </div>
              <div>
                <span className="mono" style={{ fontSize: "0.6875rem", color: stepData.color, fontWeight: 800, textTransform: "uppercase", display: "block" }}>
                  Step {stepData.stepNum}
                </span>
                <h4 className="display" style={{ fontSize: "1.1rem", color: "var(--blue-navy)", fontWeight: 800, lineHeight: 1.2 }}>
                  {stepData.title}
                </h4>
              </div>
            </div>

            <p style={{ color: "var(--blue-navy)", fontSize: "0.875rem", lineHeight: 1.55 }}>
              {stepData.desc}
            </p>
          </div>

          <div
            style={{
              marginTop: 12,
              background: "rgba(255, 255, 255, 0.8)",
              padding: "6px 12px",
              borderRadius: "6px",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              alignSelf: "flex-start",
            }}
          >
            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: stepData.color }}>
              ✓ {stepData.highlight}
            </span>
          </div>
        </div>

        {/* Modal Controls */}
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

          <button
            type="button"
            onClick={onClose}
            className="btn-base btn-primary"
            style={{ padding: "10px 20px", fontSize: "0.875rem", fontWeight: 800 }}
          >
            <Ticket size={16} /> Got It & Buy Ticket
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
