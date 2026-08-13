import type { Prize } from "@/lib/sanity/queries";
import { Trophy } from "lucide-react";

interface PrizeTableProps {
  prizes: Prize[];
  confirmedCount?: number;
  winningNumbers?: Record<number, string>;
}

export function PrizeTable({ prizes, confirmedCount, winningNumbers }: PrizeTableProps) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <span className="display" style={{ fontSize: "1.25rem", color: "var(--paper)" }}>
          Prize table
        </span>
        {confirmedCount !== undefined && (
          <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gray)" }}>
            {confirmedCount} confirmed {confirmedCount === 1 ? "entry" : "entries"} so far
          </span>
        )}
      </div>

      <div role="list">
        {prizes.map((prize, i) => {
          const winner = winningNumbers?.[prize.rank];
          return (
            <div
              key={prize.rank}
              role="listitem"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "13px 4px",
                borderTop: i === 0 ? "none" : "1px solid var(--gray-line)",
                animation: "fadeIn 300ms ease both",
                animationDelay: `${i * 40}ms`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span className="mono" style={{ color: "var(--gray)", fontSize: "0.75rem", width: 20 }}>
                  {prize.rank}
                </span>
                {prize.rank <= 2 && (
                  <Trophy size={14} color="var(--gold)" aria-hidden="true" />
                )}
                <span style={{ color: "var(--paper)", fontSize: "0.875rem" }}>{prize.label}</span>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  className="display"
                  style={{ color: prize.rank <= 2 ? "var(--gold)" : "var(--paper)", fontSize: "0.9375rem" }}
                >
                  {prize.prizeTitle}
                </div>
                {winner && (
                  <div className="mono" style={{ fontSize: "0.6875rem", color: "var(--gold)", marginTop: 2 }}>
                    Winner: #{winner}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
