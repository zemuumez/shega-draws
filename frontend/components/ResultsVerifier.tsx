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
  const short = `${hex.slice(0, 16)}…${hex.slice(-12)}`;

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
        background: "#F8FAFC",
        border: "1px solid var(--gray-line)",
        borderRadius: 8,
        padding: "10px 14px",
        color: "var(--text-main)",
        fontSize: "0.8125rem",
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        cursor: "pointer",
        wordBreak: "break-all",
        textAlign: "left",
        width: "100%",
      }}
      title="Click to copy hash"
    >
      <span style={{ flex: 1 }}>{full ? hex : short}</span>
      <Copy size={14} color="var(--text-subtle)" style={{ flexShrink: 0 }} />
      {copied && <span style={{ color: "var(--teal-dark)", fontSize: "0.75rem", fontWeight: 700 }}>Copied!</span>}
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
    <Card style={{ background: "#FFFFFF", padding: "28px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        {revealed
          ? <Unlock size={20} color="var(--teal)" />
          : <Lock size={20} color="var(--gold-dark)" />
        }
        <span className="display" style={{ fontSize: "1.25rem", color: "var(--text-main)", fontWeight: 700 }}>
          {revealed ? "Draw Seed Revealed & Auditable" : "Locked Cryptographic Commitment"}
        </span>
      </div>

      <div style={{ marginBottom: 16 }}>
        <p className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>
          Published SHA-256 Fingerprint (Locked before draw opened)
        </p>
        <CopyableHash hex={commitment} />
      </div>

      {revealed && seed ? (
        <>
          <div style={{ marginBottom: 16 }}>
            <p className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", marginBottom: 6, textTransform: "uppercase", fontWeight: 700 }}>
              Revealed Secret Seed
            </p>
            <CopyableHash hex={seed} full />
          </div>

          <Button
            variant="primary"
            icon={verifying ? undefined : ShieldCheck}
            loading={verifying}
            onClick={verify}
          >
            {verifying ? "Checking SHA-256..." : "Verify Hash In Your Browser"}
          </Button>

          {result !== null && (
            <div
              role="status"
              style={{
                marginTop: 16,
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                fontSize: "0.875rem",
                fontWeight: 600,
                color: result ? "var(--teal-dark)" : "var(--rust-dark)",
                background: result ? "var(--teal-bg)" : "var(--rust-bg)",
                border: `1px solid ${result ? "var(--teal-border)" : "var(--rust-border)"}`,
                padding: "12px 14px",
                borderRadius: 8,
              }}
            >
              {result ? <Check size={18} style={{ flexShrink: 0 }} /> : <X size={18} style={{ flexShrink: 0 }} />}
              {result
                ? "Match Confirmed (100% Provably Fair). The revealed seed generates the exact cryptographic fingerprint published before ticket sales opened."
                : "Mismatch Detected. The revealed seed does not match the published commitment."}
            </div>
          )}
        </>
      ) : (
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
          This cryptographic fingerprint was generated and locked before tickets went on sale. Once the countdown ends, the secret seed will be made public so you can mathematically verify the results yourself.
        </p>
      )}
    </Card>
  );
}
