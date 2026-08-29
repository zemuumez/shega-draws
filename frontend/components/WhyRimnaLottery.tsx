"use client";

import React from "react";
import { ShieldCheck, Trophy, Users, Award, Lock, Sparkles } from "lucide-react";

export function WhyRimnaLottery() {
  return (
    <div
      className="card-base"
      style={{
        padding: "28px 24px",
        background: "#FFFFFF",
        borderRadius: "14px",
        border: "1.5px solid var(--gray-line)",
        marginBottom: 32,
      }}
    >
      <h3 className="display" style={{ fontSize: "1.35rem", color: "var(--blue-navy)", fontWeight: 900, marginBottom: 12 }}>
        Why Rimna Digital Lottery?
      </h3>

      <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
        <p>
          Traditional lotteries rely on centralized black-box draws where participants have no ability to inspect or verify how numbers were drawn. <strong>Rimna Digital Lottery</strong> was built on a cryptographic foundation where <strong>provable fairness</strong> is guaranteed by mathematics rather than blind trust.
        </p>

        <p>
          Before any ticket sales commence, the system generates a 256-bit random seed and publishes its <strong>SHA-256 cryptographic hash</strong> publicly. Because a cryptographic hash cannot be reversed or modified after publication, the draw outcome is mathematically locked in advance. Once the draw closes, the secret seed is revealed so any participant can re-run the hash algorithm in their browser to verify 100% genuine fairness.
        </p>

        {/* Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 8 }}>
          <div style={{ background: "#FEF9C3", border: "1px solid #FDE047", padding: "12px 14px", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gold-deep)", fontWeight: 800, fontSize: "0.8125rem", marginBottom: 4 }}>
              <Trophy size={15} /> 10 Guaranteed Winners
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-main)" }}>
              Every pool guarantees cash payouts for the Top 10 ranks without rollover delays.
            </span>
          </div>

          <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "12px 14px", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#2A65E6", fontWeight: 800, fontSize: "0.8125rem", marginBottom: 4 }}>
              <ShieldCheck size={15} /> SHA-256 Commit-Reveal
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-main)" }}>
              Cryptographic verification ensures zero administrative tampering.
            </span>
          </div>

          <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "12px 14px", borderRadius: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#059669", fontWeight: 800, fontSize: "0.8125rem", marginBottom: 4 }}>
              <Users size={15} /> Fixed Pool Sizes
            </div>
            <span style={{ fontSize: "0.75rem", color: "var(--text-main)" }}>
              Pools are capped at 1K, 2K, 3K, and 5K tickets for transparent winning odds.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
