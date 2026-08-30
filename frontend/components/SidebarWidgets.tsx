"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Phone, Send, Trophy, Sparkles, Award, ArrowRight } from "lucide-react";

export function SidebarWidgets() {
  const results = [
    {
      title: "RDL - $25 Diaspora Draw",
      date: "17 July",
      numbers: ["05", "15", "18", "26", "32", "35"],
    },
    {
      title: "RDL - 100 ETB Classic",
      date: "17 July",
      numbers: ["06", "10", "27", "16", "17", "42"],
    },
    {
      title: "RDL - $100 Elite Global",
      date: "17 July",
      numbers: ["09", "12", "09", "20", "18", "32"],
    },
    {
      title: "RDL - 200 ETB Holiday",
      date: "17 July",
      numbers: ["07", "13", "17", "13", "25", "32"],
    },
  ];

  return (
    <section style={{ margin: "24px 0" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: 18,
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {/* ── Card 1: Winning Number Results ── */}
        <div
          className="card-base"
          style={{
            overflow: "hidden",
            borderRadius: "14px",
            border: "1.5px solid #E2E8F0",
            background: "#FFFFFF",
            boxShadow: "0 4px 16px rgba(0,0,0,0.04)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          {/* Header Bar */}
          <div>
            <div
              style={{
                background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
                color: "#FFFFFF",
                padding: "10px 14px",
                fontSize: "0.875rem",
                fontWeight: 900,
                letterSpacing: "0.4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Winning Number Results</span>
              <Trophy size={15} />
            </div>

            {/* List of recent results */}
            <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
              {results.slice(0, 3).map((res, i) => (
                <div
                  key={i}
                  style={{
                    borderBottom: i < 2 ? "1px solid #F1F5F9" : "none",
                    paddingBottom: i < 2 ? 8 : 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  {/* Date Box */}
                  <div
                    style={{
                      background: "#EFF6FF",
                      borderRadius: "6px",
                      padding: "4px 6px",
                      textAlign: "center",
                      minWidth: 42,
                      border: "1px solid #DBEAFE",
                    }}
                  >
                    <span className="mono" style={{ fontSize: "1rem", fontWeight: 900, color: "#2A65E6", lineHeight: 1, display: "block" }}>
                      {res.date.split(" ")[0]}
                    </span>
                    <span className="mono" style={{ fontSize: "0.5625rem", color: "var(--text-subtle)", textTransform: "uppercase" }}>
                      {res.date.split(" ")[1]}
                    </span>
                  </div>

                  {/* Draw Title & Number Balls */}
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827", display: "block", marginBottom: 2 }}>
                      {res.title}
                    </span>
                    <div style={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                      {res.numbers.map((n, idx) => (
                        <span
                          key={idx}
                          className="mono"
                          style={{
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            color: "#DC2626",
                            fontStyle: "italic",
                          }}
                        >
                          {n}{idx < res.numbers.length - 1 ? " |" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ padding: "0 14px 14px" }}>
            <Link
              href="/results"
              className="btn-base btn-secondary"
              style={{ fontSize: "0.75rem", padding: "8px 12px", width: "100%", justifyContent: "center" }}
            >
              <Trophy size={13} /> View Audited Results <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        {/* ── Card 2: Special Holiday Event / Mega Car & Villa Jackpot ── */}
        <div
          className="card-base"
          style={{
            borderRadius: "14px",
            border: "1.5px solid #374151",
            background: "linear-gradient(135deg, #111827 0%, #1F2937 100%)",
            padding: "16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            color: "#FFFFFF",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <span
                style={{
                  background: "linear-gradient(135deg, #FEF08A 0%, #EAB308 100%)",
                  color: "#111827",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  fontSize: "0.625rem",
                  fontWeight: 900,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                  textTransform: "uppercase",
                }}
              >
                <Sparkles size={11} /> Special Event
              </span>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "#9CA3AF" }}>
                Ends Sep 30
              </span>
            </div>

            <h4 className="display" style={{ fontSize: "1.125rem", color: "#FDE047", fontWeight: 900, marginBottom: 4 }}>
              Luxury EV & Villa Mega Draw
            </h4>
            <p style={{ fontSize: "0.75rem", color: "#D1D5DB", lineHeight: 1.45, marginBottom: 12 }}>
              Top 10 guaranteed luxury asset winners. Automatic VIP entry with any 200 ETB or $250 Diaspora ticket purchase.
            </p>
          </div>

          <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 10px" }}>
            <span className="mono" style={{ fontSize: "0.6875rem", color: "#9CA3AF", display: "block" }}>
              GUARANTEED 1ST PLACE VALUE:
            </span>
            <span className="display" style={{ fontSize: "1.25rem", fontWeight: 900, color: "#FFFFFF" }}>
              5,000,000 ETB <span style={{ fontSize: "0.75rem", color: "#FDE047" }}>(or $40,000 USD)</span>
            </span>
          </div>
        </div>

        {/* ── Card 3: 24/7 Live Support & Hotline ── */}
        <div
          className="card-base"
          style={{
            borderRadius: "14px",
            border: "2px solid #FDE047",
            background: "linear-gradient(135deg, #FFFDF5 0%, #FEF9C3 100%)",
            padding: "16px",
            boxShadow: "0 6px 20px rgba(234, 179, 8, 0.15)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div>
                <span className="mono" style={{ fontSize: "0.625rem", color: "var(--gold-deep)", textTransform: "uppercase", fontWeight: 800, display: "block" }}>
                  INSTANT ASSISTANCE
                </span>
                <h4 className="display" style={{ fontSize: "1.125rem", color: "#111827", fontWeight: 900 }}>
                  Live Support 24/7
                </h4>
              </div>

              <span
                style={{
                  background: "var(--teal-bg)",
                  color: "var(--teal-dark)",
                  border: "1px solid var(--teal-border)",
                  borderRadius: "12px",
                  padding: "2px 8px",
                  fontSize: "0.625rem",
                  fontWeight: 900,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--teal)" }} />
                Online
              </span>
            </div>

            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 12 }}>
              Need assistance with payment proofs, number selection, or prize payouts? We respond immediately.
            </p>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <a
              href="tel:+251911000000"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(17, 24, 39, 0.15)",
                borderRadius: "8px",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#111827",
                fontSize: "0.75rem",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              <Phone size={13} color="var(--teal)" /> +251 911 000 000
            </a>

            <a
              href="https://t.me/RimnaLotteryOfficial"
              target="_blank"
              rel="noreferrer"
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(17, 24, 39, 0.15)",
                borderRadius: "8px",
                padding: "7px 10px",
                display: "flex",
                alignItems: "center",
                gap: 8,
                color: "#2A65E6",
                fontSize: "0.75rem",
                fontWeight: 800,
                textDecoration: "none",
              }}
            >
              <Send size={13} /> @RimnaLotteryOfficial
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
