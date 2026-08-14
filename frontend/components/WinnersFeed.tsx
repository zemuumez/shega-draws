"use client";

import React from "react";
import { Award, CheckCircle2, Trophy, Clock } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function WinnersFeed() {
  const { t } = useLanguage();

  const mockWinners = [
    {
      id: "w-1",
      phone: "+251 911 ••• 842",
      name: "Solomon T.",
      prize: "5,000,000 ETB Cash Grant",
      drawId: "PD-2026-07Z",
      ticket: "42",
      rank: "1st Place",
      date: "Aug 10, 2026",
    },
    {
      id: "w-2",
      phone: "+251 929 ••• 115",
      name: "Hanna G.",
      prize: "Toyota Rush 2025 SUV",
      drawId: "PD-2026-07Z",
      ticket: "89",
      rank: "2nd Place",
      date: "Aug 10, 2026",
    },
    {
      id: "w-3",
      phone: "+251 944 ••• 390",
      name: "Abdi K.",
      prize: "1,000,000 ETB Cash",
      drawId: "PD-2026-07Z",
      ticket: "07",
      rank: "3rd Place",
      date: "Aug 10, 2026",
    },
    {
      id: "w-4",
      phone: "+251 912 ••• 677",
      name: "Tigist M.",
      prize: "500,000 ETB Cash",
      drawId: "PD-2026-06Y",
      ticket: "04",
      rank: "4th Place",
      date: "Jul 28, 2026",
    }
  ];

  return (
    <section style={{ margin: "56px 0" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div className="badge badge-teal" style={{ marginBottom: 6 }}>
            <CheckCircle2 size={12} /> {t.winners.liveTicker}
          </div>
          <h2 className="display" style={{ fontSize: "clamp(1.375rem, 3vw, 1.875rem)", color: "var(--paper)" }}>
            {t.winners.title}
          </h2>
        </div>
        <p style={{ color: "var(--gray)", fontSize: "0.8125rem" }}>
          {t.winners.subtitle}
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
        {mockWinners.map((winner) => (
          <div
            key={winner.id}
            className="card-base"
            style={{
              padding: "18px 20px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              background: "linear-gradient(180deg, var(--ink-card) 0%, rgba(18, 24, 32, 0.95) 100%)",
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                <span className="mono" style={{ fontSize: "0.75rem", color: "var(--paper)", fontWeight: 600 }}>
                  {winner.name} ({winner.phone})
                </span>
                <span className="badge badge-teal" style={{ fontSize: "0.625rem", padding: "2px 8px" }}>
                  <CheckCircle2 size={10} /> {t.winners.verifiedPayout}
                </span>
              </div>

              <div className="display" style={{ fontSize: "1.0625rem", color: "var(--gold-soft)", fontWeight: 700, marginBottom: 4 }}>
                {winner.prize}
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--gray-line)", paddingTop: 10, marginTop: 12 }}>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gray)" }}>
                {winner.drawId} · {t.winners.ticket} <strong>#{winner.ticket}</strong>
              </span>
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gray)" }}>
                {winner.date}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
