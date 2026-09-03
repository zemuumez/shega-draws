import type { Metadata } from "next";
import Link from "next/link";
import { getActiveDraw, listDraws } from "@/lib/api";
import { sanityClient } from "@/lib/sanity/client";
import { LATEST_RESULTS_QUERY, type CMSDrawResult } from "@/lib/sanity/queries";
import { Trophy, CheckCircle2, Phone, Send, ShieldCheck, Sparkles, Award, ExternalLink, Ticket } from "lucide-react";
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

  const latestResult = cmsResults && cmsResults.length > 0 ? cmsResults[0] : null;

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
        prize: rank === "1" ? "30% (Jackpot)" : rank === "2" ? "20% Cash" : rank === "3" ? "15% Cash" : `Rank #${rank} (4-8%)`,
        winner: undefined,
      }));

  return (
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
        position: "relative",
        backgroundImage: "url(/images/rimna-stadium-hero.jpg)",
        backgroundAttachment: "fixed",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* Background Overlay for High Contrast */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.6) 40%, rgba(15, 23, 42, 0.85) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", zIndex: 2, paddingBottom: 80 }}>
        {/* ── 1. Page Header ────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1220,
            margin: "0 auto",
            padding: "clamp(48px, 6vw, 72px) clamp(16px, 3.5vw, 32px) clamp(24px, 3vw, 40px)",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "inline-flex", marginBottom: 14 }}>
            <span
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid #FDE047",
                padding: "6px 14px",
                borderRadius: "30px",
                fontSize: "0.8125rem",
                fontWeight: 900,
                color: "#FEF08A",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(234, 179, 8, 0.3)",
              }}
            >
              <Trophy size={14} color="#FACC15" /> OFFICIAL AUDITED RESULTS & BROADCAST
            </span>
          </div>

          <h1
            className="display"
            style={{
              fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)",
              fontWeight: 900,
              lineHeight: 1.1,
              color: "#FFFFFF",
              letterSpacing: "-0.8px",
              margin: "0 0 14px",
              textShadow: "0 2px 20px rgba(0, 0, 0, 0.8)",
            }}
          >
            Official Live Draw Results
          </h1>

          <p
            style={{
              fontSize: "clamp(0.95rem, 2vw, 1.1rem)",
              lineHeight: 1.6,
              color: "#F1F5F9",
              maxWidth: 700,
              margin: 0,
              textShadow: "0 1px 8px rgba(0,0,0,0.8)",
            }}
          >
            All 10 winning ranks are drawn publicly on video stream by company founders. Explore official lucky numbers, guaranteed prize distributions, and live video replays.
          </p>
        </section>

        {/* ── 2. Live Broadcast Showcase ────────────────────────────── */}
        <section
          style={{
            maxWidth: 1220,
            margin: "0 auto 36px",
            padding: "0 clamp(16px, 3.5vw, 32px)",
            boxSizing: "border-box",
          }}
        >
          <LiveBroadcastBanner />
        </section>

        {/* ── 3. Top 10 Winning Numbers Glass Grid ──────────────────── */}
        <section
          style={{
            maxWidth: 1220,
            margin: "0 auto 36px",
            padding: "0 clamp(16px, 3.5vw, 32px)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.62)",
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
              borderRadius: "22px",
              border: "2px solid rgba(253, 224, 71, 0.75)",
              padding: "clamp(20px, 3.5vw, 32px)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
              color: "#FFFFFF",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: "0.6875rem",
                    fontWeight: 900,
                    color: "#FEF08A",
                    textTransform: "uppercase",
                    letterSpacing: "0.8px",
                    display: "block",
                  }}
                >
                  LATEST COMPLETED DRAW AUDIT
                </span>
                <h2
                  className="display"
                  style={{
                    fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                    color: "#FFFFFF",
                    fontWeight: 900,
                    margin: "4px 0 0",
                  }}
                >
                  Top 10 Winning Numbers (#{latestResult?.drawId || drawState?.draw_id || "RDL-2026-07"})
                </h2>
              </div>

              <span
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1px solid #10B981",
                  color: "#6EE7B7",
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  padding: "4px 12px",
                  borderRadius: "20px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <CheckCircle2 size={14} color="#34D399" /> 10 Guaranteed Winners Audited
              </span>
            </div>

            {/* Top 10 Luxury Rank Tiles */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {winningNumbersList.map((item) => {
                const isFirst = item.rank === "1";
                const isSecond = item.rank === "2";
                const isThird = item.rank === "3";

                return (
                  <div
                    key={item.rank}
                    style={{
                      background: isFirst
                        ? "rgba(254, 240, 138, 0.2)"
                        : isSecond
                        ? "rgba(226, 232, 240, 0.15)"
                        : isThird
                        ? "rgba(217, 119, 6, 0.2)"
                        : "rgba(0, 0, 0, 0.4)",
                      border: `1.5px solid ${
                        isFirst
                          ? "#FDE047"
                          : isSecond
                          ? "rgba(255, 255, 255, 0.4)"
                          : isThird
                          ? "#F59E0B"
                          : "rgba(255, 255, 255, 0.12)"
                      }`,
                      borderRadius: "14px",
                      padding: "16px 12px",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.6875rem",
                        color: isFirst ? "#FEF08A" : "#94A3B8",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      {isFirst ? "🥇 1st (Jackpot)" : isSecond ? "🥈 2nd Place" : isThird ? "🥉 3rd Place" : `Rank #${item.rank}`}
                    </span>

                    {/* Lucky Lottery Ball */}
                    <div
                      className="display"
                      style={{
                        fontSize: "1.75rem",
                        fontWeight: 900,
                        color: isFirst ? "#FDE047" : "#FFFFFF",
                        margin: "4px 0",
                        textShadow: "0 2px 10px rgba(0, 0, 0, 0.6)",
                      }}
                    >
                      #{item.num}
                    </div>

                    <span
                      style={{
                        fontSize: "0.75rem",
                        color: isFirst ? "#FEF08A" : "#CBD5E1",
                        fontWeight: 700,
                        display: "block",
                      }}
                    >
                      {item.prize || `Rank #${item.rank}`}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Payout Guarantee Banner */}
            <div
              style={{
                padding: "12px 16px",
                background: "rgba(0, 0, 0, 0.4)",
                borderRadius: "12px",
                border: "1px solid rgba(52, 211, 153, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: 10,
                fontSize: "0.8125rem",
                color: "#E2E8F0",
              }}
            >
              <ShieldCheck size={18} color="#34D399" style={{ flexShrink: 0 }} />
              <span>
                All payouts are automatically transferred within 30 minutes of live draw completion to the winner&apos;s verified CBE or Telebirr account.
              </span>
            </div>
          </div>
        </section>

        {/* ── 4. 24/7 Support Hotline ───────────────────────────────── */}
        <section
          style={{
            maxWidth: 1220,
            margin: "0 auto",
            padding: "0 clamp(16px, 3.5vw, 32px)",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.62)",
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
              borderRadius: "22px",
              border: "2px solid rgba(253, 224, 71, 0.75)",
              padding: "clamp(20px, 3.5vw, 28px)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 16,
              color: "#FFFFFF",
            }}
          >
            <div>
              <span
                style={{
                  fontSize: "0.6875rem",
                  color: "#FEF08A",
                  textTransform: "uppercase",
                  fontWeight: 900,
                  letterSpacing: "0.8px",
                  display: "block",
                }}
              >
                NEED ASSISTANCE WITH WINNING CLAIMS?
              </span>
              <h3 className="display" style={{ fontSize: "1.25rem", color: "#FFFFFF", fontWeight: 900, margin: "2px 0 4px" }}>
                Live Support 24/7 Hotline
              </h3>
              <p style={{ fontSize: "0.8125rem", color: "#CBD5E1", margin: 0 }}>
                Our customer care team verifies winning tickets and assists with Telebirr and CBE bank payouts around the clock.
              </p>
            </div>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <a
                href="tel:+251911000000"
                className="casino-btn-gold"
                style={{
                  padding: "10px 18px",
                  textDecoration: "none",
                  fontWeight: 900,
                  fontSize: "0.875rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Phone size={15} color="#111827" /> Call +251 911 000 000
              </a>
              <a
                href="https://t.me/RimnaLotteryOfficial"
                target="_blank"
                rel="noreferrer"
                className="casino-btn-red"
                style={{
                  padding: "10px 18px",
                  textDecoration: "none",
                  fontWeight: 900,
                  fontSize: "0.875rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Send size={15} /> Telegram @RimnaLottery
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
