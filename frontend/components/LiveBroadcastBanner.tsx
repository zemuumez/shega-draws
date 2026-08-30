"use client";

import React, { useState } from "react";
import { Tv, Send, Trophy, CheckCircle2, Ticket } from "lucide-react";
import { BuyTicketModal } from "./BuyTicketModal";

export function LiveBroadcastBanner() {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  return (
    <>
      <BuyTicketModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        initialCurrency="ETB"
        initialPrice={100}
        initialDrawId="RDL-ACTIVE"
      />

      <div
        className="card-base interactive-ticket-card lottery-guilloche-bg"
        style={{
          background: "linear-gradient(135deg, #FFFDF5 0%, #FFFFFF 60%, #FEF9C3 100%)",
          border: "2px solid #FDE047",
          borderRadius: "16px",
          padding: "20px 22px",
          boxShadow: "0 6px 20px -4px rgba(234, 179, 8, 0.2)",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 12 }}>
          <div>
            <span className="casino-ribbon-badge">
              <span className="pulse-radar" style={{ width: 7, height: 7, borderRadius: "50%", background: "#FFFFFF", display: "inline-block" }} />
              LIVE PUBLIC WINNER DRAWING
            </span>

            <h3 className="display" style={{ fontSize: "1.25rem", color: "#111827", fontWeight: 900, lineHeight: 1.2 }}>
              Numbers Drawn Live on Video for All Participants
            </h3>
          </div>

          <button
            type="button"
            onClick={() => setIsBuyModalOpen(true)}
            className="casino-btn-red"
            style={{ fontSize: "0.8125rem", padding: "8px 14px" }}
          >
            <Ticket size={14} /> Enter Active Draw
          </button>
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
    </>
  );
}
