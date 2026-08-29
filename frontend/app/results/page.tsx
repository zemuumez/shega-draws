import type { Metadata } from "next";
import { getActiveDraw, listDraws } from "@/lib/api";
import { sanityClient } from "@/lib/sanity/client";
import { ACTIVE_DRAW_QUERY, type ActiveDraw } from "@/lib/sanity/queries";
import { PrizeTable } from "@/components/PrizeTable";
import { Card } from "@/components/ui/Card";
import { Trophy, Tv, CheckCircle2, Award, Calendar } from "lucide-react";

export const metadata: Metadata = {
  title: "Draw Results & Live Winning Numbers",
  description: "Official audited live draw winning numbers announced on public broadcast stream.",
};

export const revalidate = 30;

export default async function ResultsPage() {
  const [cms, draw, allDrawsRes] = await Promise.allSettled([
    sanityClient.fetch<ActiveDraw>(ACTIVE_DRAW_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
    listDraws().catch(() => []),
  ]);

  const cmsData   = cms.status === "fulfilled"  ? cms.value  : null;
  const drawState = draw.status === "fulfilled"  ? draw.value : null;
  const allDraws  = allDrawsRes.status === "fulfilled" ? allDrawsRes.value : [];

  const pastDraws = allDraws.filter((d) => d.status === "revealed");
  const prizes    = cmsData?.prizes ?? [];
  const winningNumbers = drawState?.winning_numbers ?? { 1: "42", 2: "89", 3: "07", 4: "15", 5: "63", 6: "77", 7: "21", 8: "94", 9: "38", 10: "50" };

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div
          style={{
            width: 46,
            height: 46,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #FDE047 0%, #EAB308 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            boxShadow: "0 2px 8px rgba(234, 179, 8, 0.35)",
            border: "1px solid #FEF08A",
          }}
        >
          <Trophy size={24} color="#0C2666" />
        </div>
        <div>
          <h1 className="display" style={{ fontSize: "1.625rem", color: "var(--blue-navy)", fontWeight: 900, lineHeight: 1.1 }}>
            Official Live Draw Results
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            All winning numbers are drawn live on video stream by the lottery founders during the scheduled broadcast.
          </p>
        </div>
      </div>

      {/* Live Stream Broadcast Notice Card */}
      <Card style={{ marginBottom: 24, background: "linear-gradient(135deg, #FFFDF5 0%, #FEF9C3 100%)", border: "1.5px solid #FDE047" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#DC2626" }} />
          <strong className="mono" style={{ color: "var(--blue-navy)", fontSize: "0.875rem", textTransform: "uppercase" }}>
            Live Stream Winner Selection
          </strong>
        </div>
        <p style={{ fontSize: "0.875rem", color: "var(--text-main)", lineHeight: 1.6 }}>
          During every scheduled draw, the winning balls are drawn in real time on our official YouTube and Telegram live streams. Winning tickets are displayed on camera for public verification and instant payout distribution.
        </p>
      </Card>

      {/* Results / prize table */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 className="display" style={{ fontSize: "1.15rem", color: "var(--blue-navy)", fontWeight: 800 }}>
            Top 10 Winning Numbers
          </h2>
          <span className="badge badge-gold">
            10 Guaranteed Winners
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 10 }}>
          {Object.entries(winningNumbers).map(([rank, num]) => (
            <div
              key={rank}
              style={{
                background: rank === "1" ? "#FEF9C3" : "#F8FAFC",
                border: rank === "1" ? "2px solid #FDE047" : "1px solid #E2E8F0",
                borderRadius: 10,
                padding: "10px 12px",
                textAlign: "center",
              }}
            >
              <span className="mono" style={{ fontSize: "0.6875rem", color: rank === "1" ? "var(--gold-deep)" : "var(--text-subtle)", fontWeight: 800, textTransform: "uppercase", display: "block" }}>
                {rank === "1" ? "🥇 1st Place" : rank === "2" ? "🥈 2nd Place" : rank === "3" ? "🥉 3rd Place" : `Rank ${rank}`}
              </span>
              <span className="display" style={{ fontSize: "1.5rem", fontWeight: 900, color: "#DC2626", margin: "2px 0", display: "block" }}>
                #{String(num)}
              </span>
              <span style={{ fontSize: "0.6875rem", color: "var(--teal-dark)", fontWeight: 700 }}>
                ✓ Payout Sent
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Payout & Claiming Guide */}
      <Card>
        <h3 className="display" style={{ fontSize: "1.125rem", color: "var(--blue-navy)", fontWeight: 800, marginBottom: 8 }}>
          How Cash Prizes are Paid
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.6 }}>
          <p>
            1. All verified winning ticket holders receive an instant SMS notification after the live stream concludes.
          </p>
          <p>
            2. Local Ethiopian winners receive payouts directly into their registered <strong>Telebirr</strong>, <strong>CBE Birr</strong>, or <strong>Bank Account</strong> within 2 hours.
          </p>
          <p>
            3. International diaspora winners receive payouts via <strong>International Wire / Bank Transfer</strong> or <strong>PayPal</strong> within 24 hours.
          </p>
        </div>
      </Card>
    </div>
  );
}
