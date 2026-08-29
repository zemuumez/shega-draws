"use client";

import React from "react";
import Link from "next/link";
import { Radio, Tv, Send, Trophy, CheckCircle2, Ticket, Sparkles, ShieldCheck } from "lucide-react";

export function LiveBroadcastBanner() {
  return (
    <div
      className="card-base"
      style={{
        background: "linear-gradient(135deg, #FFFDF5 0%, #FFFFFF 60%, #EFF6FF 100%)",
        border: "2px solid #FDE047",
        borderRadius: "16px",
        padding: "24px 26px",
        boxShadow: "0 6px 20px -4px rgba(42, 101, 230, 0.12)",
        marginBottom: 32,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <div>
          <span
            style={{
              background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
              color: "#FFFFFF",
              padding: "4px 10px",
              borderRadius: "14px",
              fontSize: "0.6875rem",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              marginBottom: 8,
            }}
          >
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#FFFFFF", animation: "pulse 1.5s infinite" }} />
            LIVE PUBLIC WINNER DRAWING
          </span>

          <h3 className="display" style={{ fontSize: "1.35rem", color: "var(--blue-navy)", fontWeight: 900, lineHeight: 1.2 }}>
            Numbers Drawn Live on Video for All Participants
          </h3>
        </div>

        <Link
          href="/enter"
          className="btn-base btn-primary"
          style={{ padding: "10px 20px", fontSize: "0.875rem", fontWeight: 800 }}
        >
          <Ticket size={16} /> Get Your Ticket
        </Link>
      </div>

      <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 18 }}>
        There are no hidden algorithms or automated backdoors. The founder and host of <strong>Rimna Digital Lottery</strong> pick each winning number live on camera during the scheduled broadcast and show every winning ticket directly to all viewers so you know instantly if you won!
      </p>

      {/* Broadcast Channels & Guarantees */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 10 }}>
        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FEE2E2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Tv size={18} color="#DC2626" />
          </div>
          <div>
            <strong style={{ fontSize: "0.8125rem", color: "var(--blue-navy)", display: "block" }}>
              YouTube Live Stream
            </strong>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-subtle)" }}>
              Watch live draw in HD
            </span>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Send size={18} color="#2A65E6" />
          </div>
          <div>
            <strong style={{ fontSize: "0.8125rem", color: "var(--blue-navy)", display: "block" }}>
              Telegram Live Channel
            </strong>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-subtle)" }}>
              @RimnaLotteryOfficial
            </span>
          </div>
        </div>

        <div style={{ background: "#FFFFFF", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#FEF9C3", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Trophy size={18} color="var(--gold-deep)" />
          </div>
          <div>
            <strong style={{ fontSize: "0.8125rem", color: "var(--blue-navy)", display: "block" }}>
              10 Instant Cash Winners
            </strong>
            <span style={{ fontSize: "0.6875rem", color: "var(--text-subtle)" }}>
              Paid via Telebirr / CBE / Bank
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
