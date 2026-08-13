import type { Metadata } from "next";
import Link from "next/link";
import { Ticket, ShieldCheck, Info } from "lucide-react";
import { sanityClient } from "@/lib/sanity/client";
import { ACTIVE_DRAW_QUERY, type ActiveDraw } from "@/lib/sanity/queries";
import { getActiveDraw } from "@/lib/api";
import { PrizeTable } from "@/components/PrizeTable";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

export const metadata: Metadata = {
  title: "Current Draw",
  description: "See the active draw, prize table, and enter your number today.",
};

// Revalidate every 60 seconds for near-real-time entry count
export const revalidate = 60;

export default async function HomePage() {
  // Fetch from both Sanity (content) and Go API (live state) in parallel
  const [cmsData, apiDraw] = await Promise.allSettled([
    sanityClient.fetch<ActiveDraw>(ACTIVE_DRAW_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
  ]);

  const cms   = cmsData.status === "fulfilled" ? cmsData.value : null;
  const draw  = apiDraw.status === "fulfilled"  ? apiDraw.value  : null;

  const commitment = draw?.commitment;
  const deadline   = cms?.deadline ?? draw?.deadline;
  const prizes     = cms?.prizes ?? [];

  return (
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>

      {/* ── Hero ─────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 24, marginBottom: 28 }}>
        <div style={{ maxWidth: 520 }}>
          <Badge tone="gold">
            {draw?.draw_id ?? "SHEGA DRAWS"} · open for entries
          </Badge>
          <h1
            className="display"
            style={{ fontSize: "clamp(2rem, 5vw, 2.75rem)", color: "var(--paper)", margin: "12px 0 10px", lineHeight: 1.08 }}
          >
            {cms?.title ?? "One house. One car. Eight more reasons to check your number."}
          </h1>
          <p style={{ color: "var(--gray)", fontSize: "0.9375rem", lineHeight: 1.65, maxWidth: 460 }}>
            {cms?.description ??
              "Pick a number, pay by Telebirr or bank transfer, and wait for draw day. The winning numbers are produced from a commitment we publish before entries close — so you can verify nobody touched the result afterwards."}
          </p>
        </div>

        {/* Countdown */}
        {deadline && (
          <div style={{ textAlign: "right" }}>
            <p className="mono" style={{ fontSize: "0.625rem", color: "var(--gray)", textTransform: "uppercase", marginBottom: 8 }}>
              Entries close in
            </p>
            <CountdownTimer target={deadline} />
          </div>
        )}
      </div>

      {/* ── CTA Buttons ──────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <Link
          href="/enter"
          className="btn-base"
          style={{ background: "var(--gold)", color: "var(--ink)", border: "none", boxShadow: "0 2px 14px rgba(201,162,39,0.3)" }}
        >
          <Ticket size={16} aria-hidden="true" /> Enter this draw
        </Link>
        <Link
          href="/results"
          className="btn-base"
          style={{ background: "transparent", color: "var(--paper)", border: "1px solid var(--gray-line)" }}
        >
          <ShieldCheck size={16} aria-hidden="true" /> See the fairness proof
        </Link>
      </div>

      {/* ── Prize Table ───────────────────────────────────── */}
      <Card>
        {prizes.length > 0 ? (
          <PrizeTable prizes={prizes} />
        ) : (
          <p style={{ color: "var(--gray)", fontSize: "0.875rem" }}>
            Prize information is loading from the content system…
          </p>
        )}
      </Card>

      {/* ── Commitment Display ───────────────────────────── */}
      {commitment && (
        <Card style={{ marginTop: 20 }}>
          <p className="mono" style={{ fontSize: "0.625rem", color: "var(--gray)", textTransform: "uppercase", marginBottom: 6 }}>
            Published commitment (SHA-256)
          </p>
          <p
            className="mono"
            style={{
              color: "var(--gold-soft)",
              fontSize: "0.6875rem",
              wordBreak: "break-all",
              background: "rgba(255,255,255,0.03)",
              padding: "10px 12px",
              borderRadius: 8,
              border: "1px dashed var(--gray-line)",
            }}
          >
            {commitment}
          </p>
          <p style={{ fontSize: "0.75rem", color: "var(--gray)", marginTop: 8 }}>
            Save this fingerprint. Once draw day comes and the seed is revealed, you can verify it yourself on the Results page.
          </p>
        </Card>
      )}

      {/* ── Info banner ──────────────────────────────────── */}
      <div
        style={{ marginTop: 20, display: "flex", gap: 10, alignItems: "flex-start", color: "var(--gray)", fontSize: "0.8125rem" }}
      >
        <Info size={16} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
        <span>
          Every entry is verified by our team against a real payment before it counts. Entries marked{" "}
          <em>waiting for confirmation</em> are not yet in the draw.
        </span>
      </div>
    </div>
  );
}
