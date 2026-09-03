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
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [isRolling, setIsRolling] = useState(false);

  const PAGE_SIZE = 100;
  const totalPages = Math.ceil(poolSize / PAGE_SIZE);

  // Generate simulated realistic taken numbers if none passed (e.g. ~20% sold)
  const effectiveTaken = useMemo(() => {
    if (takenNumbers.length > 0) return new Set(takenNumbers);
    const mockSet = new Set<string>();
    const sample = [3, 7, 13, 21, 42, 77, 88, 99, 107, 142, 200, 250, 333, 404, 500, 666, 777, 888, 999, 1000, 1234, 1500, 1777, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
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
        let finalNum = Math.floor(Math.random() * poolSize) + 1;
        while (effectiveTaken.has(String(finalNum)) && effectiveTaken.size < poolSize) {
          finalNum = Math.floor(Math.random() * poolSize) + 1;
        }
        onChange(String(finalNum));
        setCurrentPage(Math.floor((finalNum - 1) / PAGE_SIZE));
      }
    }, 45);
  };

  const isCurrentValueTaken = effectiveTaken.has(value);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {/* ── Top Wheel & Selected Number Display ───────────────────── */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.45)",
          border: "1.5px solid rgba(253, 224, 71, 0.75)",
          borderRadius: "16px",
          padding: "16px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
        }}
      >
        <div>
          <span
            style={{
              fontSize: "0.6875rem",
              color: "#FEF08A",
              textTransform: "uppercase",
              fontWeight: 900,
              letterSpacing: "0.8px",
              display: "block",
            }}
          >
            SELECTED LUCKY TICKET NUMBER
          </span>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 4 }}>
            <div
              className="display"
              style={{
                fontSize: "2.4rem",
                fontWeight: 900,
                color: isCurrentValueTaken ? "#FCA5A5" : "#FDE047",
                background: "rgba(0, 0, 0, 0.6)",
                border: isCurrentValueTaken ? "2px solid #EF4444" : "2px solid #FDE047",
                borderRadius: 12,
                padding: "2px 16px",
                boxShadow: isCurrentValueTaken ? "0 0 14px rgba(239, 68, 68, 0.4)" : "0 0 16px rgba(253, 224, 71, 0.35)",
                lineHeight: 1.15,
                minWidth: 90,
                textAlign: "center",
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
              }}
            >
              #{value || "---"}
            </div>

            <div>
              {value && !isCurrentValueTaken ? (
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#6EE7B7", fontSize: "0.8125rem", fontWeight: 800 }}>
                  <Check size={15} color="#34D399" /> Available to Pick
                </div>
              ) : value && isCurrentValueTaken ? (
                <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#FCA5A5", fontSize: "0.8125rem", fontWeight: 800 }}>
                  <Lock size={14} color="#EF4444" /> Already Taken
                </div>
              ) : null}
              <span style={{ fontSize: "0.6875rem", color: "#CBD5E1", display: "block", marginTop: 2 }}>
                Pool Range: #1 to #{poolSize.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action: Pick Random */}
        <button
          type="button"
          onClick={rollRandom}
          disabled={isRolling}
          className="casino-btn-gold"
          style={{
            padding: "10px 18px",
            fontSize: "0.875rem",
            fontWeight: 900,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <Dice5 size={17} className={isRolling ? "animate-spin" : ""} color="#111827" />
          Pick Random Number
        </button>
      </div>

      {/* ── Search & Range Jump Filter ────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ position: "relative", minWidth: 200, flex: 1 }}>
          <Search size={14} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder={`Type specific number (1 - ${poolSize.toLocaleString()})...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 34px",
              background: "rgba(0, 0, 0, 0.45)",
              border: "1.5px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "10px",
              color: "#FFFFFF",
              fontSize: "0.8125rem",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>

        {/* Page / Range Jump */}
        {!searchQuery && totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(0, p - 1))}
              disabled={currentPage === 0}
              style={{
                width: 34,
                height: 34,
                padding: 0,
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: currentPage === 0 ? "not-allowed" : "pointer",
                opacity: currentPage === 0 ? 0.4 : 1,
              }}
              aria-label="Previous range"
            >
              <ChevronLeft size={16} />
            </button>

            <span style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", padding: "0 6px" }}>
              #{currentPage * PAGE_SIZE + 1} – #{Math.min(poolSize, (currentPage + 1) * PAGE_SIZE)}
            </span>

            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={currentPage >= totalPages - 1}
              style={{
                width: 34,
                height: 34,
                padding: 0,
                background: "rgba(0, 0, 0, 0.4)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "8px",
                color: "#FFFFFF",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: currentPage >= totalPages - 1 ? "not-allowed" : "pointer",
                opacity: currentPage >= totalPages - 1 ? 0.4 : 1,
              }}
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
          background: "rgba(0, 0, 0, 0.45)",
          border: "1.5px solid rgba(255, 255, 255, 0.12)",
          borderRadius: "14px",
          padding: "14px",
          maxHeight: 250,
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, fontSize: "0.6875rem", color: "#CBD5E1" }}>
          <span style={{ fontWeight: 800, color: "#FEF08A" }}>
            SELECTABLE NUMBERS ({poolSize.toLocaleString()} TOTAL POOL SLOTS)
          </span>
          <div style={{ display: "flex", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255, 255, 255, 0.2)" }} /> Available
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#FCA5A5" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} /> Taken
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#FEF08A" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FDE047" }} /> Selected
            </span>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(44px, 1fr))",
            gap: 6,
          }}
        >
          {pageNumbers.map((num) => {
            const isSelected = String(num) === value;
            const isTaken = effectiveTaken.has(String(num));

            return (
              <button
                key={num}
                type="button"
                disabled={isTaken}
                onClick={() => onChange(String(num))}
                style={{
                  height: 38,
                  borderRadius: 8,
                  border: isSelected
                    ? "2px solid #FDE047"
                    : isTaken
                    ? "1px solid rgba(239, 68, 68, 0.3)"
                    : "1px solid rgba(255, 255, 255, 0.12)",
                  background: isSelected
                    ? "linear-gradient(180deg, #FDE047 0%, #EAB308 100%)"
                    : isTaken
                    ? "rgba(239, 68, 68, 0.12)"
                    : "rgba(255, 255, 255, 0.06)",
                  color: isSelected ? "#111827" : isTaken ? "#F87171" : "#FFFFFF",
                  fontWeight: isSelected ? 900 : 700,
                  fontSize: "0.8125rem",
                  cursor: isTaken ? "not-allowed" : "pointer",
                  textDecoration: isTaken ? "line-through" : "none",
                  boxShadow: isSelected ? "0 0 10px rgba(253, 224, 71, 0.6)" : "none",
                  transition: "all 150ms ease",
                }}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
