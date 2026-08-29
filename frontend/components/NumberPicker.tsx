"use client";

import React, { useState, useMemo } from "react";
import { Dice5, Grid, Search, Check, Lock, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface NumberPickerProps {
  value: string;
  onChange: (n: string) => void;
  poolSize?: number; // e.g. 1000, 2000, 3000, 5000
  takenNumbers?: string[];
}

export function NumberPicker({
  value,
  onChange,
  poolSize = 1000,
  takenNumbers = [],
}: NumberPickerProps) {
  const [gridOpen, setGridOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  const PAGE_SIZE = 100;
  const totalPages = Math.ceil(poolSize / PAGE_SIZE);

  // Generate simulated realistic taken numbers if none passed (e.g. ~25% sold)
  const effectiveTaken = useMemo(() => {
    if (takenNumbers.length > 0) return new Set(takenNumbers);
    const mockSet = new Set<string>();
    // Pre-populate some popular numbers as taken
    const sample = [3, 7, 13, 21, 42, 77, 88, 99, 107, 142, 200, 250, 333, 404, 500, 666, 777, 888, 999, 1000, 1234, 1500, 1777, 2000];
    sample.forEach((n) => {
      if (n <= poolSize) mockSet.add(String(n));
    });
    return mockSet;
  }, [takenNumbers, poolSize]);

  // Current page numbers
  const pageNumbers = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const results: number[] = [];
      for (let i = 1; i <= poolSize; i++) {
        if (String(i).includes(q)) {
          results.push(i);
          if (results.length >= 200) break;
        }
      }
      return results;
    }

    const start = currentPage * PAGE_SIZE + 1;
    const end = Math.min(poolSize, start + PAGE_SIZE - 1);
    const nums: number[] = [];
    for (let i = start; i <= end; i++) {
      nums.push(i);
    }
    return nums;
  }, [currentPage, poolSize, searchQuery]);

  // Roll random available number
  const rollRandom = () => {
    setIsRolling(true);
    let count = 0;
    const interval = setInterval(() => {
      const rand = Math.floor(Math.random() * poolSize) + 1;
      onChange(String(rand));
      count++;
      if (count >= 10) {
        clearInterval(interval);
        setIsRolling(false);
        // Find an actually untaken random number
        let finalNum = Math.floor(Math.random() * poolSize) + 1;
        while (effectiveTaken.has(String(finalNum)) && mockSetSize(effectiveTaken) < poolSize) {
          finalNum = Math.floor(Math.random() * poolSize) + 1;
        }
        onChange(String(finalNum));
        // Jump page to show selected number
        setCurrentPage(Math.floor((finalNum - 1) / PAGE_SIZE));
      }
    }, 50);
  };

  const handleManualInput = (val: string) => {
    const clean = val.replace(/\D/g, "");
    if (!clean) {
      onChange("");
      return;
    }
    const num = parseInt(clean, 10);
    if (num >= 1 && num <= poolSize) {
      onChange(String(num));
      setCurrentPage(Math.floor((num - 1) / PAGE_SIZE));
    }
  };

  const isCurrentValueTaken = effectiveTaken.has(value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* ── Top Wheel & Selected Number Display ───────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #FEF9C3 0%, #EFF5FF 100%)",
          border: "1.5px solid #FDE047",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--blue-navy)", textTransform: "uppercase", fontWeight: 800, letterSpacing: "0.5px" }}>
            SELECTED LUCKY TICKET NUMBER
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <div
              className="display"
              style={{
                fontSize: "2.75rem",
                fontWeight: 800,
                color: isCurrentValueTaken ? "var(--rust-dark)" : "var(--blue-navy)",
                background: "#FFFFFF",
                border: isCurrentValueTaken ? "2px solid var(--rust-border)" : "2px solid #2A65E6",
                borderRadius: 10,
                padding: "2px 18px",
                boxShadow: "0 4px 12px rgba(42, 101, 230, 0.12)",
                lineHeight: 1.15,
                minWidth: 110,
                textAlign: "center",
              }}
            >
              #{value || "---"}
            </div>

            <div>
              {value && !isCurrentValueTaken ? (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--teal-dark)", fontSize: "0.8125rem", fontWeight: 700 }}>
                  <Check size={16} /> Available to Pick
                </div>
              ) : value && isCurrentValueTaken ? (
                <div style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--rust-dark)", fontSize: "0.8125rem", fontWeight: 700 }}>
                  <Lock size={14} /> Already Taken
                </div>
              ) : null}
              <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", display: "block" }}>
                Range: #1 to #{poolSize.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action: Pick Random */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={rollRandom}
            disabled={isRolling}
            className="btn-base btn-primary"
            style={{ padding: "10px 18px", fontSize: "0.875rem" }}
          >
            <Dice5 size={18} className={isRolling ? "animate-spin" : ""} />
            Pick Random Number
          </button>
        </div>
      </div>

      {/* ── Search & Jump to Range Filter ─────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ position: "relative", minWidth: 220, flex: 1 }}>
          <Search size={14} color="var(--text-subtle)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="input-base"
            placeholder={`Type specific number (1 - ${poolSize.toLocaleString()})...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34, height: 40, fontSize: "0.8125rem" }}
          />
        </div>

        {/* Page / Range Jump */}
        {!searchQuery && totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              className="btn-base btn-secondary"
              style={{ width: 34, height: 34, padding: 0 }}
              aria-label="Previous range"
            >
              <ChevronLeft size={16} />
            </button>

            <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", padding: "0 6px" }}>
              #{currentPage * PAGE_SIZE + 1} – #{Math.min(poolSize, (currentPage + 1) * PAGE_SIZE)}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              className="btn-base btn-secondary"
              style={{ width: 34, height: 34, padding: 0 }}
              aria-label="Next range"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Interactive Scrollable Number Board ────────────────────── */}
      <div
        style={{
          background: "#FFFFFF",
          border: "1.5px solid var(--blue-border)",
          borderRadius: "var(--radius-md)",
          padding: "16px 14px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--blue-navy)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6 }}>
            <Grid size={14} color="#2A65E6" /> Interactive Numbers Board ({poolSize.toLocaleString()} Total Slots)
          </span>

          <div style={{ display: "flex", gap: 12, alignItems: "center", fontSize: "0.6875rem" }}>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--text-subtle)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#EFF5FF", border: "1px solid #C3DAFE" }} /> Available
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--rust-dark)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "var(--rust-bg)", border: "1px solid var(--rust-border)" }} /> Taken (Red)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "var(--blue-navy)", fontWeight: 700 }}>
              <span style={{ width: 10, height: 10, borderRadius: 2, background: "#2A65E6" }} /> Selected
            </span>
          </div>
        </div>

        {/* The Grid of Numbers */}
        <div
          style={{
            maxHeight: 280,
            overflowY: "auto",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(52px, 1fr))",
            gap: 6,
            padding: 4,
          }}
        >
          {pageNumbers.map((n) => {
            const strNum = String(n);
            const isTaken = effectiveTaken.has(strNum);
            const isSelected = value === strNum;

            return (
              <button
                key={n}
                type="button"
                disabled={isTaken}
                onClick={() => onChange(strNum)}
                title={isTaken ? `Number #${n} is already taken` : `Select Number #${n}`}
                style={{
                  height: 38,
                  borderRadius: 6,
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8125rem",
                  fontWeight: isSelected ? 800 : isTaken ? 600 : 700,
                  cursor: isTaken ? "not-allowed" : "pointer",
                  border: isSelected
                    ? "2px solid #2A65E6"
                    : isTaken
                    ? "1px solid var(--rust-border)"
                    : "1px solid #E2E8F0",
                  background: isSelected
                    ? "#2A65E6"
                    : isTaken
                    ? "var(--rust-bg)"
                    : "#EFF5FF",
                  color: isSelected
                    ? "#FFFFFF"
                    : isTaken
                    ? "var(--rust-dark)"
                    : "var(--blue-navy)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all var(--transition-fast)",
                  boxShadow: isSelected ? "0 2px 8px rgba(42, 101, 230, 0.35)" : "none",
                  opacity: isTaken ? 0.65 : 1,
                  textDecoration: isTaken ? "line-through" : "none",
                }}
              >
                {n}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function mockSetSize(s: Set<string>): number {
  return s.size;
}
