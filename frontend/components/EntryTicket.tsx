"use client";

import React, { useState } from "react";
import type { Entry } from "@/lib/api";
import { Trophy, CheckCircle2, Clock, XCircle, Ticket, Eye, ShieldCheck, Sparkles, X } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface EntryTicketProps {
  entry: Entry;
  prizes?: Array<{ rank: number; label: string; prizeTitle: string }>;
  winningNumbers?: Record<number, string>;
}

export function EntryTicket({ entry, prizes, winningNumbers }: EntryTicketProps) {
  const { t, language } = useLanguage();
  const pageT = t.entriesPage;
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  const wonRank = winningNumbers
    ? Object.entries(winningNumbers).find(
        ([, num]) => num === entry.number && entry.status === "confirmed"
      )
    : null;

  const wonPrize = wonRank && prizes?.find((p) => String(p.rank) === wonRank[0]);

  const isConfirmed = entry.status === "confirmed";
  const isRejected = entry.status === "rejected";
  const isPending = !isConfirmed && !isRejected;

  const statusText = isConfirmed
    ? pageT?.statusConfirmed || "Confirmed in Live Draw"
    : isRejected
    ? pageT?.statusRejected || "Payment Rejected"
    : pageT?.statusPending || "Pending Verification";

  const currencySymbol = entry.currency === "USD" ? "$" : "ETB";
  const formattedAmount = entry.currency === "USD" ? `$${entry.amount}` : `${entry.amount} ETB`;

  return (
    <>
      <div
        role="article"
        style={{
          background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.9) 100%)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderRadius: "20px",
          border: isConfirmed
            ? "2px solid #FDE047"
            : isRejected
            ? "1.5px solid #EF4444"
            : "1.5px solid rgba(254, 240, 138, 0.4)",
          boxShadow: isConfirmed
            ? "0 12px 36px rgba(234, 179, 8, 0.25), inset 0 1px 1px rgba(255, 255, 255, 0.2)"
            : "0 10px 30px rgba(0, 0, 0, 0.6)",
          padding: "22px",
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 16,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle Background Glow */}
        {isConfirmed && (
          <div
            style={{
              position: "absolute",
              top: -40,
              right: -40,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(234, 179, 8, 0.25) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
        )}

        {/* Top Header Strip: Ticket Code & Status Pill */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div
              style={{
                width: 26,
                height: 26,
                borderRadius: "50%",
                background: "rgba(253, 224, 71, 0.2)",
                border: "1px solid #FDE047",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ticket size={13} color="#FDE047" />
            </div>
            <span style={{ fontSize: "0.8125rem", color: "#FEF08A", fontWeight: 900, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {entry.draw_id || "RDL-ACTIVE"}
            </span>
          </div>

          <span
            style={{
              background: isConfirmed
                ? "rgba(16, 185, 129, 0.2)"
                : isRejected
                ? "rgba(239, 68, 68, 0.2)"
                : "rgba(245, 158, 11, 0.2)",
              border: `1.5px solid ${isConfirmed ? "#10B981" : isRejected ? "#EF4444" : "#F59E0B"}`,
              color: isConfirmed ? "#6EE7B7" : isRejected ? "#FCA5A5" : "#FEF08A",
              padding: "4px 12px",
              borderRadius: "20px",
              fontSize: "0.75rem",
              fontWeight: 900,
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {isConfirmed ? <CheckCircle2 size={13} color="#10B981" /> : isRejected ? <XCircle size={13} color="#EF4444" /> : <Clock size={13} color="#F59E0B" />}
            {statusText}
          </span>
        </div>

        {/* Main Content Body */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          {/* Left Details */}
          <div>
            <div style={{ fontSize: "1.125rem", fontWeight: 900, color: "#FFFFFF", display: "flex", alignItems: "center", gap: 6 }}>
              <span>{entry.user_name || "Verified Player"}</span>
              {isConfirmed && <ShieldCheck size={16} color="#10B981" />}
            </div>

            <div style={{ fontSize: "0.8125rem", color: "#E2E8F0", marginTop: 4, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              <span style={{ fontWeight: 800, color: "#FDE047" }}>{formattedAmount}</span>
              <span style={{ color: "#64748B" }}>•</span>
              <span style={{ textTransform: "capitalize", background: "rgba(255,255,255,0.08)", padding: "2px 8px", borderRadius: 6, fontSize: "0.75rem" }}>
                {entry.method}
              </span>
              {entry.pool_capacity && (
                <>
                  <span style={{ color: "#64748B" }}>•</span>
                  <span style={{ color: "#94A3B8", fontSize: "0.75rem" }}>{entry.pool_capacity}</span>
                </>
              )}
            </div>

            <div style={{ fontSize: "0.6875rem", color: "#94A3B8", marginTop: 6 }}>
              {new Date(entry.created_at).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>

          {/* Right: Golden 3D Lucky Number Ball */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "0.625rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", marginBottom: 4, letterSpacing: "0.5px" }}>
              {pageT?.luckyNumberBadge || "LUCKY #"}
            </span>
            <div
              className="display"
              style={{
                width: 58,
                height: 58,
                borderRadius: "50%",
                background: "radial-gradient(circle at 35% 30%, #FEF08A 0%, #F59E0B 45%, #B45309 85%, #78350F 100%)",
                boxShadow: "0 6px 18px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.8), inset 0 -3px 6px rgba(0, 0, 0, 0.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#111827",
                fontSize: "1.5rem",
                fontWeight: 900,
                border: "2px solid #FFFBEB",
                textShadow: "0 1px 1px rgba(255, 255, 255, 0.4)",
              }}
            >
              {entry.number}
            </div>
          </div>
        </div>

        {/* Status Explanation / Admin Notes */}
        {entry.admin_notes && (
          <div
            style={{
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "10px",
              padding: "8px 12px",
              fontSize: "0.75rem",
              color: "#CBD5E1",
            }}
          >
            <strong style={{ color: "#FEF08A" }}>Note:</strong> {entry.admin_notes}
          </div>
        )}

        {/* Footer Actions: Receipt View & Broadcast Notice */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            paddingTop: 12,
            marginTop: 4,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.6875rem", color: "#94A3B8" }}>
            <Sparkles size={12} color="#FDE047" />
            <span>{pageT?.liveBroadcastNotice || "100% Live Audited Video Broadcast"}</span>
          </div>

          {entry.proof_url && (
            <button
              type="button"
              onClick={() => setShowReceiptModal(true)}
              style={{
                background: "rgba(253, 224, 71, 0.15)",
                border: "1px solid rgba(253, 224, 71, 0.5)",
                color: "#FEF08A",
                padding: "4px 10px",
                borderRadius: "14px",
                fontSize: "0.6875rem",
                fontWeight: 800,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Eye size={12} /> {pageT?.receiptPreview || "View Slip"}
            </button>
          )}
        </div>

        {/* Winner Celebration Banner */}
        {wonPrize && (
          <div
            style={{
              background: "linear-gradient(90deg, rgba(234, 179, 8, 0.3) 0%, rgba(16, 185, 129, 0.3) 100%)",
              border: "1.5px solid #FDE047",
              borderRadius: "12px",
              padding: "10px 14px",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#FEF08A",
              fontWeight: 900,
              fontSize: "0.875rem",
            }}
          >
            <Trophy size={18} color="#FDE047" />
            <span>
              {language === "ti" ? "እንቋዕ ሓጎሰኩም! ተዓዊትኩም ኣለኹም:" : language === "am" ? "እንኳን ደስ አለዎት! አሸንፈዋል:" : "Congratulations! You won:"} {wonPrize.prizeTitle}
            </span>
          </div>
        )}
      </div>

      {/* Payment Receipt Image Modal */}
      {showReceiptModal && entry.proof_url && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(10, 15, 30, 0.85)",
            backdropFilter: "blur(16px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          onClick={() => setShowReceiptModal(false)}
        >
          <div
            style={{
              background: "#1E293B",
              borderRadius: "20px",
              border: "2px solid #FDE047",
              maxWidth: 460,
              width: "100%",
              padding: 20,
              color: "#FFFFFF",
              position: "relative",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowReceiptModal(false)}
              style={{
                position: "absolute",
                top: 14,
                right: 14,
                background: "rgba(255, 255, 255, 0.1)",
                border: "none",
                borderRadius: "50%",
                width: 32,
                height: 32,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "#FFFFFF",
              }}
            >
              <X size={18} />
            </button>

            <h4 style={{ fontSize: "1.1rem", fontWeight: 900, margin: "0 0 12px", color: "#FEF08A" }}>
              {pageT?.receiptPreview || "Payment Receipt Screenshot"}
            </h4>
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(255,255,255,0.15)", maxHeight: "65vh" }}>
              <img
                src={entry.proof_url}
                alt="Payment Slip Proof"
                style={{ width: "100%", height: "auto", display: "block", objectFit: "contain" }}
              />
            </div>
            <div style={{ marginTop: 12, fontSize: "0.75rem", color: "#94A3B8", textAlign: "center" }}>
              Ticket #{entry.number} · {formattedAmount} via {entry.method.toUpperCase()}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
