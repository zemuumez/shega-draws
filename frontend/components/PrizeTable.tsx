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
        <span className="display" style={{ fontSize: "1.25rem", color: "var(--text-main)", fontWeight: 700 }}>
          Top 10 Prize Schedule
        </span>
        {confirmedCount !== undefined && (
          <span className="mono" style={{ fontSize: "0.75rem", color: "var(--text-subtle)", fontWeight: 600 }}>
            {confirmedCount} confirmed {confirmedCount === 1 ? "entry" : "entries"}
          </span>
        )}
      </div>

      <div role="list">
        {prizes.map((prize, i) => {
          const winner = winningNumbers?.[prize.rank];
          const isTop3 = prize.rank <= 3;

          return (
            <div
              key={prize.rank}
              role="listitem"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "12px 6px",
                borderTop: i === 0 ? "none" : "1px solid var(--gray-line)",
                background: isTop3 ? "rgba(254, 243, 199, 0.25)" : "transparent",
                borderRadius: 6,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span className="mono" style={{ color: "var(--text-subtle)", fontSize: "0.8125rem", fontWeight: 700, width: 22 }}>
                  #{prize.rank}
                </span>
                {isTop3 && (
                  <Trophy size={15} color="var(--gold-dark)" aria-hidden="true" />
                )}
                <span style={{ color: "var(--text-main)", fontSize: "0.875rem", fontWeight: 600 }}>{prize.label}</span>
              </div>

              <div style={{ textAlign: "right" }}>
                <div
                  className="mono"
                  style={{ color: isTop3 ? "var(--gold-dark)" : "var(--text-main)", fontSize: "0.9375rem", fontWeight: 700 }}
                >
                  {prize.valueAmount || prize.prizeTitle}
                </div>
                {winner && (
                  <div className="mono" style={{ fontSize: "0.75rem", color: "var(--teal-dark)", marginTop: 2, fontWeight: 700 }}>
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
