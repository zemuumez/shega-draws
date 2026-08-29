"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Ticket, Sparkles, ChevronRight, CheckCircle2, DollarSign } from "lucide-react";

export function InteractiveQuickPlay() {
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([7, 21]);
  const [selectedCurrency, setSelectedCurrency] = useState<"ETB" | "USD">("ETB");

  const toggleNumber = (num: number) => {
    setSelectedNumbers((prev) => {
      if (prev.includes(num)) {
        return prev.filter((n) => n !== num);
      }
      if (prev.length >= 6) {
        return [...prev.slice(1), num];
      }
      return [...prev, num];
    });
  };

  const sampleNumbers = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 16,
        marginBottom: 32,
      }}
    >
      {/* Step 1 Box: Choose Numbers (Red Header Box) */}
      <div
        className="card-base"
        style={{
          border: "2px solid #DC2626",
          borderRadius: "14px",
          overflow: "hidden",
          background: "#FFFFFF",
          boxShadow: "0 4px 16px rgba(220, 38, 38, 0.12)",
        }}
      >
        {/* Red Ribbon Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
            color: "#FFFFFF",
            padding: "10px 14px",
            fontSize: "0.8125rem",
            fontWeight: 800,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          1. Choose Your Lucky Numbers
        </div>

        <div style={{ padding: "16px" }}>
          {/* Numbers Grid (01 to 12) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 14 }}>
            {sampleNumbers.map((n) => {
              const isSelected = selectedNumbers.includes(n);
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => toggleNumber(n)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: "8px",
                    border: isSelected ? "2px solid #DC2626" : "1.5px solid #E2E8F0",
                    background: isSelected ? "#FEE2E2" : "#FFFFFF",
                    color: isSelected ? "#DC2626" : "var(--blue-navy)",
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.875rem",
                    fontWeight: 900,
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    boxShadow: isSelected ? "0 2px 6px rgba(220, 38, 38, 0.25)" : "none",
                  }}
                >
                  {String(n).padStart(2, "0")}
                </button>
              );
            })}
          </div>

          <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", lineHeight: 1.4 }}>
            <span style={{ fontWeight: 800, color: "var(--blue-navy)" }}>Selected: </span>
            {selectedNumbers.length === 0 ? "None" : selectedNumbers.map((n) => `#${n}`).join(", ")}
          </div>
        </div>
      </div>

      {/* Step 2 Box: Confirm & Play (Red Header Box) */}
      <div
        className="card-base"
        style={{
          border: "2px solid #DC2626",
          borderRadius: "14px",
          overflow: "hidden",
          background: "#FFFFFF",
          boxShadow: "0 4px 16px rgba(220, 38, 38, 0.12)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        {/* Red Ribbon Header */}
        <div
          style={{
            background: "linear-gradient(135deg, #DC2626 0%, #B91C1C 100%)",
            color: "#FFFFFF",
            padding: "10px 14px",
            fontSize: "0.8125rem",
            fontWeight: 800,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: "0.5px",
          }}
        >
          2. Play Now with Chosen Numbers
        </div>

        <div style={{ padding: "16px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block", marginBottom: 2 }}>
              TOTAL REVEALED PRIZES PAID
            </span>
            <div className="display" style={{ fontSize: "1.5rem", color: "var(--gold-deep)", fontWeight: 900, marginBottom: 8 }}>
              3,850,000 ETB + $450,000
            </div>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: 12 }}>
              Select a pool size in the ticket catalog below to claim your ticket before capacity closes.
            </p>
          </div>

          <Link
            href={`/enter?num=${selectedNumbers[0] || 7}`}
            className="btn-base"
            style={{
              background: "linear-gradient(135deg, #FDE047 0%, #EAB308 100%)",
              color: "#0C2666",
              fontSize: "0.875rem",
              fontWeight: 900,
              padding: "10px 16px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(234, 179, 8, 0.4)",
              textDecoration: "none",
              border: "1px solid #FEF08A",
              width: "100%",
              justifyContent: "center",
            }}
          >
            <Ticket size={16} /> Enter Draw with Selected Numbers <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
