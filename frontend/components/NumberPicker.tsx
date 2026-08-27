"use client";

import { useState } from "react";
import { Dice5, Grid } from "lucide-react";
import { Button } from "./ui/Button";

interface NumberPickerProps {
  value: string;           // "00"–"99"
  onChange: (n: string) => void;
  takenNumbers?: string[]; // Numbers with confirmed entries
}

function toNum(s: string) { return parseInt(s, 10); }
function fmt(n: number)   { return String(((n % 100) + 100) % 100).padStart(2, "0"); }

export function NumberPicker({ value, onChange, takenNumbers = [] }: NumberPickerProps) {
  const [gridOpen, setGridOpen] = useState(false);

  const decrement = () => onChange(fmt(toNum(value) - 1));
  const increment = () => onChange(fmt(toNum(value) + 1));
  const random    = () => onChange(fmt(Math.floor(Math.random() * 100)));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Number wheel */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
        <button
          type="button"
          onClick={decrement}
          aria-label="Decrease number"
          style={{
            background: "#FFFFFF",
            border: "1.5px solid var(--gray-line)",
            borderRadius: "50%",
            width: 46,
            height: 46,
            color: "var(--text-main)",
            fontSize: "1.5rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          −
        </button>

        <div
          className="display"
          aria-live="polite"
          aria-atomic="true"
          style={{
            fontSize: "3.75rem",
            width: 140,
            textAlign: "center",
            color: "var(--gold-dark)",
            background: "linear-gradient(180deg, #FFFDF9 0%, #FEF3C7 100%)",
            border: "2px solid #FDE68A",
            borderRadius: "var(--radius-md)",
            padding: "8px 0",
            boxShadow: "0 4px 14px rgba(217, 119, 6, 0.15)",
            lineHeight: 1.1,
            fontWeight: 800,
          }}
        >
          {value}
        </div>

        <button
          type="button"
          onClick={increment}
          aria-label="Increase number"
          style={{
            background: "#FFFFFF",
            border: "1.5px solid var(--gray-line)",
            borderRadius: "50%",
            width: 46,
            height: 46,
            color: "var(--text-main)",
            fontSize: "1.5rem",
            fontWeight: 700,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          }}
        >
          +
        </button>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Button variant="secondary" icon={Dice5} onClick={random}>
          Pick Random Lucky Number
        </Button>
        <Button variant="ghost" onClick={() => setGridOpen((v) => !v)}>
          <Grid size={15} /> {gridOpen ? "Hide 00-99 Board" : "Show 00-99 Board"}
        </Button>
      </div>

      {/* Number grid */}
      {gridOpen && (
        <div
          style={{
            maxHeight: 220,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 5,
            padding: 12,
            background: "#F8FAFC",
            border: "1px solid var(--gray-line)",
            borderRadius: "var(--radius-md)",
          }}
        >
          {Array.from({ length: 100 }, (_, i) => fmt(i)).map((n) => {
            const isTaken    = takenNumbers.includes(n);
            const isSelected = value === n;
            return (
              <button
                key={n}
                type="button"
                className="mono"
                onClick={() => onChange(n)}
                title={isTaken ? "Already taken" : "Available"}
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  padding: "8px 0",
                  borderRadius: 6,
                  cursor: "pointer",
                  border: isSelected ? "1.5px solid var(--gold)" : "1px solid var(--gray-line)",
                  background: isSelected ? "var(--gold-bg)" : isTaken ? "var(--rust-bg)" : "#FFFFFF",
                  color: isSelected ? "var(--gold-dark)" : isTaken ? "var(--rust-dark)" : "var(--text-main)",
                  transition: "all var(--transition-fast)",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      )}

      <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", textAlign: "center" }}>
        Every number from 00 to 99 has an equal mathematical probability.
      </p>
    </div>
  );
}
