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
    <div style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 28 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: "50%",
            background: "var(--teal-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            border: "1px solid var(--teal-border)",
          }}
        >
          <ShieldCheck size={22} color="var(--teal)" />
        </div>
        <div>
          <h1 className="display" style={{ fontSize: "1.625rem", color: "var(--text-main)", lineHeight: 1.1 }}>
            {isRevealed ? "Draw Results & Winning Numbers" : "Fairness & Cryptographic Proof"}
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
            {isRevealed
              ? "All 10 winning numbers derived publicly. Audit the seed in your browser below."
              : "The draw is locked with a SHA-256 cryptographic seed fingerprint before tickets are sold."}
          </p>
        </div>
      </div>

      {/* Commitment + verifier */}
      {drawState && (
        <div style={{ marginBottom: 24 }}>
          <ResultsVerifier
            commitment={drawState.commitment}
            seed={isRevealed ? (drawState as any).seed : undefined}
            revealed={isRevealed}
          />
        </div>
      )}

      {/* Results / prize table */}
      {prizes.length > 0 && (
        <Card style={{ marginBottom: 24 }}>
          <PrizeTable
            prizes={prizes}
            winningNumbers={winningNumbers}
          />
        </Card>
      )}

      {/* Algorithm explanation */}
      <Card>
        <h2 className="display" style={{ fontSize: "1.125rem", color: "var(--text-main)", marginBottom: 10 }}>
          How the winning numbers are calculated
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: "0.875rem", color: "var(--text-muted)", lineHeight: 1.65 }}>
          <p>
            <strong style={{ color: "var(--text-main)" }}>1. Before ticket sales start</strong>: We generate a 32-byte secret random seed and publish its SHA-256 fingerprint.
          </p>
          <p>
            <strong style={{ color: "var(--text-main)" }}>2. On draw day</strong>: We reveal the original seed. Each of the 10 winning numbers is calculated deterministically:
          </p>
          <pre
            className="mono"
            style={{
              background: "#F8FAFC",
              border: "1px solid var(--gray-line)",
              borderRadius: 8,
              padding: "12px 14px",
              color: "var(--gold-dark)",
              fontSize: "0.75rem",
              fontWeight: 700,
              overflowX: "auto",
            }}
          >
{`winning_number = parseInt(SHA256(seed + ":" + drawID + ":" + rank).slice(0, 8), 16) % 100`}
          </pre>
          <p>
            Because the hash function is one-way, no organizer or player could have predicted or changed the numbers in advance.
          </p>
        </div>
      </Card>
    </div>
  );
}
