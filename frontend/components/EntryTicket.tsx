import type { Entry } from "@/lib/api";
import { Badge } from "./ui/Badge";
import { Trophy } from "lucide-react";

interface EntryTicketProps {
  entry: Entry;
  prizes?: Array<{ rank: number; label: string; prizeTitle: string }>;
  winningNumbers?: Record<number, string>;
}

function statusTone(status: Entry["status"]) {
  if (status === "confirmed") return "teal" as const;
  if (status === "rejected")  return "rust" as const;
  return "gold" as const;
}

function statusLabel(status: Entry["status"]) {
  if (status === "pending") return "waiting for confirmation";
  return status;
}

export function EntryTicket({ entry, prizes, winningNumbers }: EntryTicketProps) {
  const wonRank = winningNumbers
    ? Object.entries(winningNumbers).find(
        ([, num]) => num === entry.number && entry.status === "confirmed"
      )
    : null;

  const wonPrize = wonRank && prizes?.find((p) => String(p.rank) === wonRank[0]);

  return (
    <div
      role="article"
      className="animate-fade"
      style={{ display: "flex", borderRadius: "var(--radius-lg)", overflow: "hidden", border: "1px solid var(--gray-line)" }}
    >
      <div style={{ background: "var(--ink)", padding: "18px 20px", flex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="mono" style={{ fontSize: "0.625rem", color: "var(--gray)" }}>
            {entry.id.slice(0, 8).toUpperCase()} · {new Date(entry.created_at).toLocaleDateString()}
          </span>
          <Badge tone={statusTone(entry.status)}>{statusLabel(entry.status)}</Badge>
        </div>

        {/* Body */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ color: "var(--paper)", fontSize: "0.9375rem", fontWeight: 600 }}>
              {entry.user_name ?? "You"}
            </div>
            <div style={{ color: "var(--gray)", fontSize: "0.8125rem", marginTop: 2 }}>
              {entry.amount} ETB · {entry.method}
            </div>
          </div>
          <div
            className="display"
            aria-label={`Number ${entry.number}`}
            style={{ fontSize: "2.5rem", color: "var(--gold)", lineHeight: 1 }}
          >
            {entry.number}
          </div>
        </div>

        {/* Winner banner */}
        {wonPrize && (
          <div
            style={{
              marginTop: 14,
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--gold)",
              fontSize: "0.8125rem",
              fontWeight: 600,
              padding: "8px 10px",
              background: "var(--gold-glow)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <Trophy size={14} /> Won {wonPrize.label} · {wonPrize.prizeTitle}
          </div>
        )}
      </div>

      {/* Torn edge */}
      <div className="ticket-edge" />
    </div>
  );
}
