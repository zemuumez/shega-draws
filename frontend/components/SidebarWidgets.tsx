"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Phone, Send, MessageSquare, Award, Sparkles, Trophy, CheckCircle2 } from "lucide-react";

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
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* ── Widget 1: Winning Number Results (Classic Red Header) ── */}
      <div
        className="card-base"
        style={{
          overflow: "hidden",
          borderRadius: "14px",
          border: "2px solid #E2E8F0",
          background: "#FFFFFF",
          boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
        }}
      >
        {/* Red Header Bar */}
        <div
          style={{
            background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
            color: "#FFFFFF",
            padding: "12px 16px",
            fontSize: "0.9375rem",
            fontWeight: 800,
            letterSpacing: "0.5px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Winning Number Results</span>
          <Trophy size={16} />
        </div>

        {/* List of recent results */}
        <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 12 }}>
          {results.map((res, i) => (
            <div
              key={i}
              style={{
                borderBottom: i < results.length - 1 ? "1px solid #F1F5F9" : "none",
                paddingBottom: i < results.length - 1 ? 10 : 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              {/* Date Box */}
              <div
                style={{
                  background: "#EFF6FF",
                  borderRadius: "8px",
                  padding: "6px 8px",
                  textAlign: "center",
                  minWidth: 46,
                  border: "1px solid #DBEAFE",
                }}
              >
                <span className="mono" style={{ fontSize: "1.125rem", fontWeight: 900, color: "#2A65E6", lineHeight: 1, display: "block" }}>
                  {res.date.split(" ")[0]}
                </span>
                <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)", textTransform: "uppercase" }}>
                  {res.date.split(" ")[1]}
                </span>
              </div>

              {/* Draw Title & Number Balls */}
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", display: "block", marginBottom: 4 }}>
                  {res.title}
                </span>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
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

          <Link
            href="/results"
            className="btn-base btn-secondary"
            style={{ fontSize: "0.75rem", padding: "8px 12px", width: "100%", justifyContent: "center", marginTop: 4 }}
          >
            <Trophy size={14} /> View All Live Draw Results
          </Link>
        </div>
      </div>

      {/* ── Widget 2: 24/7 Live Customer Support Box ── */}
      <div
        className="card-base"
        style={{
          borderRadius: "14px",
          border: "2px solid #FDE047",
          background: "linear-gradient(135deg, #FFFDF5 0%, #FEF9C3 100%)",
          padding: "18px 18px",
          boxShadow: "0 6px 20px rgba(234, 179, 8, 0.2)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gold-deep)", textTransform: "uppercase", fontWeight: 800, display: "block" }}>
              INSTANT ASSISTANCE
            </span>
            <h4 className="display" style={{ fontSize: "1.125rem", color: "var(--blue-navy)", fontWeight: 900 }}>
              Live Support 24/7
            </h4>
          </div>

          <span
            style={{
              background: "#22C55E",
              color: "#FFFFFF",
              fontSize: "0.6875rem",
              fontWeight: 800,
              padding: "4px 8px",
              borderRadius: "12px",
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFFFFF" }} /> Online
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.8125rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--blue-navy)", fontWeight: 800 }}>
            <Phone size={16} color="#2A65E6" /> +251 911 000 000
          </div>
          <a
            href="https://t.me/RimnaLotteryOfficial"
            target="_blank"
            rel="noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 8, color: "#2A65E6", fontWeight: 800, textDecoration: "none" }}
          >
            <Send size={16} /> @RimnaLotteryOfficial (Telegram)
          </a>
        </div>
      </div>

      {/* ── Widget 3: Prize Spotlight Promo Card ── */}
      <div
        className="card-base"
        style={{
          borderRadius: "14px",
          border: "2px solid #E2E8F0",
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          color: "#FFFFFF",
          padding: "20px 18px",
          textAlign: "center",
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        }}
      >
        <span className="badge badge-gold" style={{ marginBottom: 8, fontSize: "0.6875rem" }}>
          <Sparkles size={12} /> SPECIAL HOLIDAY EVENT
        </span>
        <h4 className="display" style={{ fontSize: "1.25rem", color: "#FDE047", fontWeight: 900, marginBottom: 4 }}>
          Luxury EV Car & Villa Jackpot
        </h4>
        <p style={{ fontSize: "0.75rem", color: "#94A3B8", marginBottom: 14 }}>
          Top 10 winners guaranteed luxury asset payouts or cash equivalent.
        </p>
        <Link
          href="/enter?currency=USD&price=200"
          className="btn-base btn-primary"
          style={{ width: "100%", fontSize: "0.8125rem", padding: "10px" }}
        >
          Enter Grand Draw
        </Link>
      </div>
    </div>
  );
}
