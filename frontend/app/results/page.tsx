import type { Metadata } from "next";
import { getActiveDraw, listDraws } from "@/lib/api";
import { sanityClient } from "@/lib/sanity/client";
import { LATEST_RESULTS_QUERY, type CMSDrawResult } from "@/lib/sanity/queries";
import { Trophy, CheckCircle2, Phone, Send, ShieldCheck } from "lucide-react";
import { LiveBroadcastBanner } from "@/components/LiveBroadcastBanner";

export const metadata: Metadata = {
  title: "Draw Results & Live Broadcast — Rimna Digital Lottery",
  description: "Official audited live draw winning numbers announced on public broadcast stream.",
};

export const revalidate = 0;

export default async function ResultsPage() {
  const [cmsResultsRes, draw, allDrawsRes] = await Promise.allSettled([
    sanityClient.fetch<CMSDrawResult[]>(LATEST_RESULTS_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
    listDraws().catch(() => []),
  ]);

  const cmsResults = cmsResultsRes.status === "fulfilled" ? cmsResultsRes.value : null;
  const drawState = draw.status === "fulfilled" ? draw.value : null;

  const latestResult = (cmsResults && cmsResults.length > 0) ? cmsResults[0] : null;

  const defaultWinningNumbers = { 1: "42", 2: "89", 3: "07", 4: "15", 5: "63", 6: "77", 7: "21", 8: "94", 9: "38", 10: "50" };

  const winningNumbersList = latestResult?.winningNumbers?.length
    ? latestResult.winningNumbers.map((w) => ({
        rank: String(w.rank),
        num: w.luckyNumber,
        prize: w.prizeAmount,
        winner: w.winnerName,
      }))
    : Object.entries(drawState?.winning_numbers ?? defaultWinningNumbers).map(([rank, num]) => ({
        rank,
        num: String(num),
        prize: rank === "1" ? "Jackpot" : `Rank #${rank}`,
        winner: undefined,
      }));

  return (
    <div className="page-inner-container" style={{ padding: "32px clamp(14px, 3vw, 24px)", maxWidth: 1040, margin: "0 auto" }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "10px",
            background: "#FEF9C3",
            border: "1.5px solid #FDE047",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Trophy size={22} color="#D97706" />
        </div>
        <div>
          <h1 className="display" style={{ fontSize: "clamp(1.35rem, 3vw, 1.85rem)", color: "#111827", fontWeight: 900, lineHeight: 1.15 }}>
            Official Live Draw Results & Broadcast
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 2 }}>
            All winning numbers are drawn live on video stream by the lottery founders during our scheduled public broadcast.
          </p>
        </div>
      </div>

      {/* ── 1. Live Public Winner Drawing Section ── */}
      <div style={{ marginBottom: 28 }}>
        <LiveBroadcastBanner />
      </div>

      {/* ── 2. Top 10 Winning Numbers Audited Grid ── */}
      <div
        className="card-base"
        style={{
          background: "#FFFFFF",
          border: "1.5px solid #E5E7EB",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: 28,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
          <div>
            <span style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#D97706", textTransform: "uppercase", display: "block" }}>
              LATEST COMPLETED DRAW
            </span>
            <h2 className="display" style={{ fontSize: "1.25rem", color: "#111827", fontWeight: 900 }}>
              Top 10 Winning Numbers (#{latestResult?.drawId || drawState?.draw_id || "RDL-2026-07"})
            </h2>
          </div>
          <span className="badge badge-gold">
            <CheckCircle2 size={13} /> 10 Guaranteed Winners Audited
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8, marginBottom: 16 }}>
          {winningNumbersList.map((item) => (
            <div
              key={item.rank}
              style={{
                background: item.rank === "1" ? "#FEF9C3" : "#FAFAFA",
                border: item.rank === "1" ? "1.5px solid #F59E0B" : "1px solid #E5E7EB",
                borderRadius: 8,
                padding: "10px 8px",
                textAlign: "center",
              }}
            >
              <span className="mono" style={{ fontSize: "0.6875rem", color: item.rank === "1" ? "#D97706" : "#6B7280", fontWeight: 800, textTransform: "uppercase", display: "block" }}>
                {item.rank === "1" ? "🥇 1st Place" : item.rank === "2" ? "🥈 2nd Place" : item.rank === "3" ? "🥉 3rd Place" : `Rank ${item.rank}`}
              </span>
              <span className="display" style={{ fontSize: "1.35rem", fontWeight: 900, color: "#DC2626", margin: "2px 0", display: "block" }}>
                #{item.num}
              </span>
              <span className="mono" style={{ fontSize: "0.625rem", color: "#4B5563", fontWeight: 700 }}>
                {item.prize || `Rank #${item.rank}`}
              </span>
            </div>
          ))}
        </div>

        <div style={{ padding: "10px 14px", background: "#F8FAFC", borderRadius: 8, border: "1px solid #E5E7EB", display: "flex", alignItems: "center", gap: 8, fontSize: "0.75rem", color: "#4B5563" }}>
          <ShieldCheck size={16} color="#059669" />
          <span>All payouts are transferred within 30 minutes of live draw completion to the winner&apos;s CBE or Telebirr account.</span>
        </div>
      </div>

      {/* ── 3. Live Support 24/7 & Direct Helpline ── */}
      <div
        className="card-base"
        style={{
          borderRadius: "14px",
          border: "2px solid #F59E0B",
          background: "#FFFBEB",
          padding: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span style={{ fontSize: "0.6875rem", color: "#D97706", textTransform: "uppercase", fontWeight: 800, display: "block" }}>
            NEED ASSISTANCE WITH WINNING CLAIMS?
          </span>
          <h3 className="display" style={{ fontSize: "1.25rem", color: "#111827", fontWeight: 900 }}>
            Live Support 24/7 Hotline
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "#4B5563", marginTop: 2 }}>
            Our customer care team verifies winning tickets and assists with Telebirr and CBE bank payouts around the clock.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a
            href="tel:+251911000000"
            className="casino-btn-dark"
            style={{ padding: "9px 16px", textDecoration: "none" }}
          >
            <Phone size={14} color="#10B981" /> Call +251 911 000 000
          </a>
          <a
            href="https://t.me/RimnaLotteryOfficial"
            target="_blank"
            rel="noreferrer"
            className="casino-btn-red"
            style={{ padding: "9px 16px", textDecoration: "none" }}
          >
            <Send size={14} /> Telegram @RimnaLottery
          </a>
        </div>
      </div>
    </div>
  );
}
