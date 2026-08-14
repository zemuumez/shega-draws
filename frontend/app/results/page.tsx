import type { Metadata } from "next";
import { getActiveDraw } from "@/lib/api";
import { sanityClient } from "@/lib/sanity/client";
import { ACTIVE_DRAW_QUERY, type ActiveDraw } from "@/lib/sanity/queries";
import { ResultsVerifier } from "@/components/ResultsVerifier";
import { PrizeTable } from "@/components/PrizeTable";
import { Card } from "@/components/ui/Card";
import { ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Draw Results & Fairness Verification",
  description: "Verify the draw outcome yourself using the commit-reveal protocol. SHA-256 client-side verification.",
};

export const revalidate = 30;

export default async function ResultsPage() {
  const [cms, draw] = await Promise.allSettled([
    sanityClient.fetch<ActiveDraw>(ACTIVE_DRAW_QUERY).catch(() => null),
    getActiveDraw().catch(() => null),
  ]);

  const cmsData   = cms.status === "fulfilled"  ? cms.value  : null;
  const drawState = draw.status === "fulfilled"  ? draw.value : null;

  const prizes         = cmsData?.prizes ?? [];
  const winningNumbers = drawState?.winning_numbers;
  const isRevealed     = drawState?.status === "revealed";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 28 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            background: "rgba(31,111,92,0.18)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <ShieldCheck size={18} color="var(--teal-soft)" />
        </div>
        <div>
          <h1 className="display" style={{ fontSize: "1.5rem", color: "var(--paper)", lineHeight: 1.1 }}>
            {isRevealed ? "The draw has been run" : "Fairness commitment"}
          </h1>
          <p style={{ color: "var(--gray)", fontSize: "0.875rem", marginTop: 4 }}>
            {isRevealed
              ? "Verify the outcome with the client-side SHA-256 check below."
              : "The draw hasn't happened yet. The commitment below proves the result was pre-determined and cannot be changed."}
          </p>
        </div>
      </div>

      {/* Commitment + verifier */}
      {drawState && (
        <div style={{ marginBottom: 20 }}>
          <ResultsVerifier
            commitment={drawState.commitment}
            seed={isRevealed ? (drawState as any).seed : undefined}
            revealed={isRevealed}
          />
        </div>
      )}

      {/* Results / prize table */}
      {prizes.length > 0 && (
        <Card>
          <PrizeTable
            prizes={prizes}
            winningNumbers={winningNumbers}
          />
        </Card>
      )}

      {/* Algorithm explanation */}
      <Card style={{ marginTop: 20 }}>
        <h2 className="display" style={{ fontSize: "1rem", color: "var(--paper)", marginBottom: 12 }}>
          How the winning number is derived
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: "0.875rem", color: "var(--gray)", lineHeight: 1.65 }}>
          <p>
            <strong style={{ color: "var(--paper)" }}>Before entries close</strong>, we generate a random 32-byte secret seed and publish{" "}
            <code style={{ color: "var(--gold-soft)", fontFamily: "var(--font-mono)" }}>SHA-256(seed)</code> as the commitment above. This fingerprint locks in the seed without revealing it.
          </p>
          <p>
            <strong style={{ color: "var(--paper)" }}>On draw day</strong>, we reveal the seed. The winning number for each rank is computed as:
          </p>
          <pre
            className="mono"
            style={{
              background: "var(--ink)",
              border: "1px solid var(--gray-line)",
              borderRadius: 8,
              padding: "12px 14px",
              color: "var(--gold-soft)",
              fontSize: "0.75rem",
              overflowX: "auto",
            }}
          >
{`winning_number = parseInt(SHA256(seed + ":" + drawID + ":" + rank).slice(0, 8), 16) % 100`}
          </pre>
          <p>
            You can run this in your browser&apos;s DevTools console to confirm the published winning numbers match.
          </p>
        </div>
      </Card>
    </div>
  );
}
