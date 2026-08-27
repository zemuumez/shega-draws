"use client";

import React from "react";
import { CheckCircle2, Trophy } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function WinnersFeed() {
  const { t } = useLanguage();

  const mockWinners = [
    {
      id: "w-1",
      phone: "+251 911 ••• 842",
      name: "Solomon T.",
      prize: "80,000 ETB Cash (1st Place)",
      drawId: "PD-2026-07Z",
      ticket: "42",
      rank: "1st Place",
      date: "Aug 10, 2026",
    },
    {
      id: "w-2",
      phone: "+251 929 ••• 115",
      name: "Hanna G.",
      prize: "65,000 ETB Cash (2nd Place)",
      drawId: "PD-2026-07Z",
      ticket: "89",
      rank: "2nd Place",
      date: "Aug 10, 2026",
    },
    {
      id: "w-3",
      phone: "+251 944 ••• 390",
      name: "Abdi K.",
      prize: "40,000 ETB Cash (3rd Place)",
      drawId: "PD-2026-07Z",
      ticket: "07",
      rank: "3rd Place",
      date: "Aug 10, 2026",
    },
    {
      id: "w-4",
      phone: "+251 912 ••• 677",
      name: "Tigist M.",
      prize: "25,000 ETB Cash (4th Place)",
      drawId: "PD-2026-06Y",
      ticket: "04",
      rank: "4th Place",
      date: "Jul 28, 2026",
    }
  ];

  return (
    <section style={{ margin: "48px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="badge badge-teal" style={{ marginBottom: 6 }}>
            <CheckCircle2 size={12} /> {t.winners.liveTicker}
          </div>
          <h2 className="display" style={{ fontSize: "clamp(1.375rem, 3vw, 1.875rem)", color: "var(--text-main)" }}>
            {t.winners.title}
          </h2>
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
          {t.winners.subtitle}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {mockWinners.map((winner) => (
          <div
            key={winner.id}
            className="card-base"
            style={{
              padding: "20px 22px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "#FFFFFF",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-main)", fontWeight: 700 }}>
                  {winner.name} ({winner.phone})
                </span>
                <span className="badge badge-teal" style={{ fontSize: "0.625rem", padding: "2px 8px" }}>
                  <CheckCircle2 size={10} /> {t.winners.verifiedPayout}
                </span>
              </div>

              <div className="display" style={{ fontSize: "1.0625rem", color: "var(--gold-dark)", fontWeight: 800, marginBottom: 4 }}>
                {winner.prize}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--gray-line)", paddingTop: 10, marginTop: 12 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)" }}>
                {winner.drawId} · {t.winners.ticket} <strong>#{winner.ticket}</strong>
              </span>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)" }}>
                {winner.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
