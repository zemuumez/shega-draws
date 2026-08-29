"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, Trophy, Sparkles, ChevronRight, Globe, Ticket } from "lucide-react";

export function JackpotCardsSection() {
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 17,
    mins: 6,
    secs: 30,
  });

  useEffect(() => {
    setMounted(true);
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: prev.mins - 1, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const jackpotCards = [
    {
      id: "usd-25",
      ribbonTitle: "Diaspora $25 Jackpot",
      subtitle: "Next Jackpot (5,000 Pool)",
      amount: "$125,000",
      drawDate: "Friday 18th July",
      currency: "USD",
      price: 25,
      poolSize: "5,000 People",
    },
    {
      id: "etb-100",
      ribbonTitle: "100 ETB Classic Multi-Pool",
      subtitle: "Guaranteed 10 Winners Pool",
      amount: "500,000 ETB",
      drawDate: "Sunday 20th July",
      currency: "ETB",
      price: 100,
      poolSize: "5,000 People",
    },
    {
      id: "usd-200",
      ribbonTitle: "$200 Super Million",
      subtitle: "Grand International Tier",
      amount: "$1,000,000",
      drawDate: "Wednesday 23rd July",
      currency: "USD",
      price: 200,
      poolSize: "5,000 People",
    },
  ];

  return (
    <section style={{ margin: "32px 0 44px" }}>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 20 }}>
        {jackpotCards.map((card) => (
          <div
            key={card.id}
            className="scalloped-lottery-card"
            style={{
              background: "linear-gradient(180deg, #FFFDF5 0%, #FEF9C3 100%)",
              border: "2px solid #EAB308",
              borderRadius: "16px",
              padding: "0 0 18px 0",
              boxShadow: "0 12px 30px -8px rgba(234, 179, 8, 0.35)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              position: "relative",
            }}
          >
            {/* Top Red Ribbon Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                color: "#FFFFFF",
                padding: "10px 16px",
                textAlign: "center",
                fontWeight: 900,
                fontSize: "1.05rem",
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                boxShadow: "0 2px 6px rgba(185, 28, 28, 0.4)",
                borderBottom: "2px solid #FDE047",
              }}
            >
              {card.ribbonTitle}
            </div>

            <div style={{ padding: "20px 20px 0", textAlign: "center", flex: 1 }}>
              <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>
                {card.subtitle}
              </span>

              {/* Big Jackpot Display */}
              <div
                className="display"
                style={{
                  fontSize: "clamp(1.85rem, 3.5vw, 2.35rem)",
                  color: "#0C2666",
                  fontWeight: 900,
                  margin: "6px 0 2px",
                  textShadow: "0 1px 2px rgba(0,0,0,0.1)",
                }}
              >
                {card.amount}
              </div>

              <span className="mono" style={{ fontSize: "0.8125rem", color: "var(--gold-deep)", fontWeight: 700, display: "block", marginBottom: 14 }}>
                {card.drawDate}
              </span>

              {/* Countdown Timer Box */}
              <div
                style={{
                  background: "#FFFFFF",
                  border: "1.5px solid #FDE047",
                  borderRadius: "10px",
                  padding: "10px 12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                  boxShadow: "inset 0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  style={{
                    background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                    color: "#FFFFFF",
                    padding: "6px 10px",
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    fontSize: "0.6875rem",
                    fontWeight: 800,
                    textTransform: "uppercase",
                  }}
                >
                  <Clock size={12} /> Next Draw
                </div>

                <div style={{ display: "flex", gap: 6, textAlign: "center" }}>
                  {[
                    { val: String(timeLeft.days).padStart(2, "0"), lbl: "Days" },
                    { val: String(timeLeft.hours).padStart(2, "0"), lbl: "Hours" },
                    { val: String(timeLeft.mins).padStart(2, "0"), lbl: "Mins" },
                    { val: String(timeLeft.secs).padStart(2, "0"), lbl: "Secs" },
                  ].map((tUnit, idx) => (
                    <div key={idx} style={{ minWidth: 32 }}>
                      <span
                        className="mono"
                        suppressHydrationWarning
                        style={{ fontSize: "0.9375rem", fontWeight: 900, color: "#0C2666", lineHeight: 1, display: "block" }}
                      >
                        {mounted ? tUnit.val : "--"}
                      </span>
                      <span className="mono" style={{ fontSize: "0.5625rem", color: "var(--text-subtle)", textTransform: "uppercase" }}>
                        {tUnit.lbl}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <Link
                  href="#how-it-works"
                  className="btn-base"
                  style={{
                    background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                    color: "#FFFFFF",
                    fontSize: "0.8125rem",
                    fontWeight: 800,
                    padding: "10px 8px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 6px rgba(185, 28, 28, 0.3)",
                    textDecoration: "none",
                  }}
                >
                  How to Play
                </Link>

                <Link
                  href={`/enter?currency=${card.currency}&price=${card.price}`}
                  className="btn-base"
                  style={{
                    background: "linear-gradient(135deg, #FDE047 0%, #EAB308 100%)",
                    color: "#0C2666",
                    fontSize: "0.8125rem",
                    fontWeight: 900,
                    padding: "10px 8px",
                    borderRadius: "8px",
                    boxShadow: "0 2px 8px rgba(234, 179, 8, 0.4)",
                    textDecoration: "none",
                    border: "1px solid #FEF08A",
                  }}
                >
                  Play Now
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
