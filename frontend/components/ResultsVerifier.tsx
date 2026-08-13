"use client";

import { useState } from "react";
import { ShieldCheck, Check, X, Lock, Unlock, Copy } from "lucide-react";
import { Button } from "./ui/Button";
import { Card } from "./ui/Card";

interface ResultsVerifierProps {
  commitment: string;
  seed?: string;       // Only available after reveal
  revealed: boolean;
}

async function sha256Hex(input: string): Promise<string> {
  const enc = new TextEncoder().encode(input);
  const buf = await window.crypto.subtle.digest("SHA-256", enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function CopyableHash({ hex, full = false }: { hex: string; full?: boolean }) {
  const [copied, setCopied] = useState(false);
  const short = `${hex.slice(0, 12)}…${hex.slice(-10)}`;

  function copy() {
    navigator.clipboard.writeText(hex).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  }

  return (
    <button
      className="mono"
      onClick={copy}
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px dashed var(--gray-line)",
        borderRadius: 8,
        padding: "9px 12px",
        color: "var(--gold-soft)",
        fontSize: "0.75rem",
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        wordBreak: "break-all",
        textAlign: "left",
        width: "100%",
      }}
      title="Click to copy"
    >
      <span style={{ flex: 1 }}>{full ? hex : short}</span>
      <Copy size={12} color="var(--gray)" style={{ flexShrink: 0 }} />
      {copied && <span style={{ color: "var(--teal-soft)", fontSize: "0.625rem" }}>copied</span>}
    </button>
  );
}

export function ResultsVerifier({ commitment, seed, revealed }: ResultsVerifierProps) {
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<boolean | null>(null);

  async function verify() {
    if (!seed) return;
    setVerifying(true);
    const hash = await sha256Hex(seed);
    setResult(hash === commitment);
    setVerifying(false);
  }

  return (
    <Card>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        {revealed
          ? <Unlock size={18} color="var(--teal-soft)" />
          : <Lock size={18} color="var(--gold)" />
        }
        <span className="display" style={{ fontSize: "1.125rem", color: "var(--paper)" }}>
          {revealed ? "Draw revealed" : "Commitment published — draw not yet run"}
        </span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p className="mono" style={{ fontSize: "0.625rem", color: "var(--gray)", marginBottom: 8, textTransform: "uppercase" }}>
          Published commitment (SHA-256)
        </p>
        <CopyableHash hex={commitment} />
      </div>

      {revealed && seed ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <p className="mono" style={{ fontSize: "0.625rem", color: "var(--gray)", marginBottom: 8, textTransform: "uppercase" }}>
              Revealed secret seed
            </p>
            <CopyableHash hex={seed} full />
          </div>

          <Button
            variant="secondary"
            icon={verifying ? undefined : ShieldCheck}
            loading={verifying}
            onClick={verify}
          >
            {verifying ? "Verifying…" : "Verify seed matches commitment"}
          </Button>

          {result !== null && (
            <div
              role="status"
              style={{
                marginTop: 14,
                display: "flex",
                alignItems: "flex-start",
                gap: 8,
                fontSize: "0.875rem",
                color: result ? "var(--teal-soft)" : "var(--rust-soft)",
                animation: "fadeIn 200ms ease",
              }}
            >
              {result ? <Check size={16} style={{ flexShrink: 0, marginTop: 2 }} /> : <X size={16} style={{ flexShrink: 0, marginTop: 2 }} />}
              {result
                ? "Match confirmed. The revealed seed hashes to the exact commitment published before entries closed."
                : "Mismatch detected. The seed does not match the commitment — something is wrong."}
            </div>
          )}
        </>
      ) : (
        <p style={{ color: "var(--gray)", fontSize: "0.8125rem", lineHeight: 1.6 }}>
          The secret behind this fingerprint stays hidden until entries close and the organizer reveals it.
          Save this commitment now — once the seed is revealed, you can verify it yourself using the button above.
        </p>
      )}
    </Card>
  );
}
