"use client";

import React from "react";
import type { Entry } from "@/lib/api";
import { Trophy, CheckCircle2, Clock, ShieldCheck, Ticket } from "lucide-react";

interface EntryTicketProps {
  entry: Entry;
  prizes?: Array<{ rank: number; label: string; prizeTitle: string }>;
  winningNumbers?: Record<number, string>;
}

export function EntryTicket({ entry, prizes, winningNumbers }: EntryTicketProps) {
  const wonRank = winningNumbers
    ? Object.entries(winningNumbers).find(
        ([, num]) => num === entry.number && entry.status === "confirmed"
      )
    : null;

  const wonPrize = wonRank && prizes?.find((p) => String(p.rank) === wonRank[0]);

  const isConfirmed = entry.status === "confirmed";
  const isRejected = entry.status === "rejected";

  return (
    <div
      role="article"
      style={{
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(24px) saturate(190%)",
        WebkitBackdropFilter: "blur(24px) saturate(190%)",
        borderRadius: "18px",
        border: isConfirmed ? "2px solid rgba(253, 224, 71, 0.8)" : "1.5px solid rgba(255, 255, 255, 0.15)",
        boxShadow: "0 14px 40px rgba(0, 0, 0, 0.6), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
        padding: "20px 22px",
        color: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Ticket size={14} color="#FDE047" />
          <span style={{ fontSize: "0.75rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
            TICKET #{entry.id.slice(0, 8).toUpperCase()}
          </span>
        </div>

        <span
          style={{
            background: isConfirmed ? "rgba(16, 185, 129, 0.2)" : isRejected ? "rgba(239, 68, 68, 0.2)" : "rgba(245, 158, 11, 0.2)",
            border: `1px solid ${isConfirmed ? "#10B981" : isRejected ? "#EF4444" : "#F59E0B"}`,
            color: isConfirmed ? "#6EE7B7" : isRejected ? "#FCA5A5" : "#FEF08A",
            padding: "3px 10px",
            borderRadius: "14px",
            fontSize: "0.6875rem",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            gap: 4,
          }}
        >
          {isConfirmed ? <CheckCircle2 size={12} /> : <Clock size={12} />}
          {isConfirmed ? "Confirmed in Draw" : isRejected ? "Payment Failed" : "Pending Verification"}
        </span>
      </div>

      {/* Main Ticket Info */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#FFFFFF" }}>
            {entry.user_name ?? "You"}
          </div>
          <div style={{ fontSize: "0.8125rem", color: "#CBD5E1", marginTop: 2 }}>
            {entry.amount} ETB · Paid via {entry.method.toUpperCase()}
          </div>
          <div style={{ fontSize: "0.6875rem", color: "#94A3B8", marginTop: 4 }}>
            Entered on {new Date(entry.created_at).toLocaleDateString()}
          </div>
        </div>

        {/* Lucky Number Badge */}
        <div
          className="display"
          style={{
            fontSize: "2.4rem",
            fontWeight: 900,
            color: "#FDE047",
            lineHeight: 1,
            background: "rgba(0, 0, 0, 0.4)",
            border: "1.5px solid #FDE047",
            borderRadius: "14px",
            padding: "6px 16px",
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
            textShadow: "0 2px 10px rgba(0,0,0,0.8)",
          }}
        >
          #{entry.number}
        </div>
      </div>

      {/* Winner Banner if Won */}
      {wonPrize && (
        <div
          style={{
            background: "rgba(16, 185, 129, 0.25)",
            border: "1.5px solid #10B981",
            borderRadius: "12px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "#6EE7B7",
            fontWeight: 800,
            fontSize: "0.875rem",
          }}
        >
          <Trophy size={18} color="#34D399" />
          <span>Winner! {wonPrize.label}: {wonPrize.prizeTitle}</span>
        </div>
      )}
    </div>
  );
}
