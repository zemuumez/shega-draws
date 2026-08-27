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
  if (status === "pending") return "Pending Verification";
  if (status === "confirmed") return "Confirmed in Draw";
  return "Rejected";
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
      className="card-base animate-fade"
      style={{
        display: "flex",
        borderRadius: "var(--radius-md)",
        overflow: "hidden",
        border: "1.5px solid #E2E8F0",
        background: "#FFFFFF",
      }}
    >
      <div style={{ padding: "20px 24px", flex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", fontWeight: 700 }}>
            TICKET #{entry.id.slice(0, 8).toUpperCase()} · {new Date(entry.created_at).toLocaleDateString()}
          </span>
          <Badge tone={statusTone(entry.status)}>{statusLabel(entry.status)}</Badge>
        </div>

        {/* Body */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <div style={{ color: "var(--text-main)", fontSize: "1rem", fontWeight: 700 }}>
              {entry.user_name ?? "You"}
            </div>
            <div className="mono" style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginTop: 4 }}>
              {entry.amount} ETB · Paid via {entry.method.toUpperCase()}
            </div>
          </div>
          <div
            className="display"
            aria-label={`Number ${entry.number}`}
            style={{
              fontSize: "2.75rem",
              fontWeight: 800,
              color: "var(--gold-dark)",
              lineHeight: 1,
              background: "#FEF3C7",
              border: "1px solid #FDE68A",
              borderRadius: 8,
              padding: "4px 12px",
            }}
          >
            #{entry.number}
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
              color: "var(--teal-dark)",
              fontSize: "0.875rem",
              fontWeight: 700,
              padding: "10px 14px",
              background: "var(--teal-bg)",
              border: "1px solid var(--teal-border)",
              borderRadius: "var(--radius-sm)",
            }}
          >
            <Trophy size={16} color="var(--teal)" /> Winner! {wonPrize.label} : {wonPrize.prizeTitle}
          </div>
        )}
      </div>
    </div>
  );
}
