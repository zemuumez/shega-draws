"use client";

import { useState } from "react";
import { Dice5 } from "lucide-react";
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
          onClick={decrement}
          aria-label="Decrease number"
          style={{
            background: "transparent",
            border: "1px solid var(--gray-line)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            color: "var(--paper)",
            fontSize: "1.25rem",
            cursor: "pointer",
            transition: "border-color var(--transition-fast)",
          }}
        >
          −
        </button>

        <div
          className="display"
          aria-live="polite"
          aria-atomic="true"
          style={{
            fontSize: "3.5rem",
            width: 130,
            textAlign: "center",
            color: "var(--gold)",
            background: "var(--ink)",
            border: "1px solid var(--gray-line)",
            borderRadius: "var(--radius-md)",
            padding: "8px 0",
            boxShadow: "var(--shadow-gold)",
            lineHeight: 1.1,
          }}
        >
          {value}
        </div>

        <button
          onClick={increment}
          aria-label="Increase number"
          style={{
            background: "transparent",
            border: "1px solid var(--gray-line)",
            borderRadius: "50%",
            width: 44,
            height: 44,
            color: "var(--paper)",
            fontSize: "1.25rem",
            cursor: "pointer",
            transition: "border-color var(--transition-fast)",
          }}
        >
          +
        </button>
      </div>

      {/* Quick actions */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <Button variant="secondary" icon={Dice5} onClick={random}>
          Pick a random number
        </Button>
        <Button variant="ghost" onClick={() => setGridOpen((v) => !v)}>
          {gridOpen ? "Hide board" : "Browse all numbers"}
        </Button>
      </div>

      {/* Number grid */}
      {gridOpen && (
        <div
          style={{
            maxHeight: 224,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(10, 1fr)",
            gap: 5,
            padding: 12,
            background: "var(--ink)",
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
                className="mono"
                onClick={() => onChange(n)}
                title={isTaken ? "Already taken by a confirmed entry" : "Available"}
                style={{
                  fontSize: "0.6875rem",
                  padding: "7px 0",
                  borderRadius: 5,
                  cursor: "pointer",
                  border: isSelected ? "1px solid var(--gold)" : "1px solid transparent",
                  background: isSelected
                    ? "rgba(201,162,39,0.18)"
                    : isTaken
                    ? "rgba(180,67,45,0.10)"
                    : "rgba(255,255,255,0.03)",
                  color: isSelected ? "var(--gold)" : isTaken ? "var(--rust-soft)" : "var(--gray)",
                  transition: "background var(--transition-fast)",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      )}

      <p style={{ fontSize: "0.75rem", color: "var(--gray)", textAlign: "center" }}>
        Choose a number from 00 to 99. Numbers in&nbsp;
        <span style={{ color: "var(--rust-soft)" }}>red</span>&nbsp;are already taken by confirmed entries.
        If your number is drawn and two players hold it, the one confirmed first wins that rank.
      </p>
    </div>
  );
}
