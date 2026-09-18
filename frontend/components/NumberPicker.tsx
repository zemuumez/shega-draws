"use client";
import { useLanguage } from "@/lib/i18n/LanguageContext";


import React, { useState, useMemo, useEffect } from "react";
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
  const { text } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const isRolling = false;

  const PAGE_SIZE = 100;
  const totalPages = Math.ceil(poolSize / PAGE_SIZE);

  // Availability comes from the active draw; an empty list means no reservations.
  const effectiveTaken = useMemo(() => new Set(takenNumbers.map(n => String(Number(n)).padStart(2, "0"))), [takenNumbers]);

  // Current page numbers
  const pageNumbers = useMemo(() => {
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      const results: number[] = [];
      for (let i = 1; i <= poolSize; i++) {
        if (String(i).padStart(2, "0").includes(q)) {
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

  useEffect(() => { setCurrentPage(0); setSearchQuery(""); }, [poolSize]);
  const availableNumbers = useMemo(() => Array.from({length: poolSize}, (_, i) => i + 1).filter(n => !effectiveTaken.has(String(n).padStart(2, "0"))), [poolSize, effectiveTaken]);

  const rollRandom = () => {
    if (!availableNumbers.length) return;
    const chosen = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
    onChange(String(chosen).padStart(2, "0"));
    setSearchQuery("");
    setCurrentPage(Math.floor((chosen - 1) / PAGE_SIZE));
  };

  // Sync currentPage whenever valid value changes
  useEffect(() => {
    if (value && Number(value) >= 1 && Number(value) <= poolSize) {
      setCurrentPage(Math.floor((Number(value) - 1) / PAGE_SIZE));
    }
  }, [value, poolSize, PAGE_SIZE]);

  // If current value is missing or taken, auto-select a random available number
  useEffect(() => {
    if (availableNumbers.length > 0) {
      const isTaken = effectiveTaken.has(String(Number(value)).padStart(2, "0"));
      const isInvalid = !value || Number(value) < 1 || Number(value) > poolSize;
      if (isTaken || isInvalid) {
        const chosen = availableNumbers[Math.floor(Math.random() * availableNumbers.length)];
        onChange(String(chosen).padStart(2, "0"));
      }
    }
  }, [availableNumbers, effectiveTaken, poolSize, value, onChange]);

  const isCurrentValueTaken = effectiveTaken.has(String(Number(value)).padStart(2, "0"));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, width: "100%", boxSizing: "border-box" }}>
      {/* ── Top Wheel & Selected Number Display ───────────────────── */}
      <div
        style={{
          background: "rgba(0, 0, 0, 0.45)",
          border: "1.5px solid rgba(253, 224, 71, 0.75)",
          borderRadius: "16px",
          padding: "clamp(12px, 3.5vw, 18px)",
          display: "flex",
          flexDirection: "column",
          gap: 12,
          boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.15)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ width: "100%" }}>
          <span
            style={{
              fontSize: "0.6875rem",
              color: "#FEF08A",
              textTransform: "uppercase",
              fontWeight: 900,
              letterSpacing: "0.8px",
              display: "block",
              marginBottom: 6,
            }}
          >
            {text("SELECTED LUCKY TICKET NUMBER")}
          </span>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div
              className="display"
              style={{
                fontSize: "clamp(1.5rem, 5vw, 2.2rem)",
                fontWeight: 900,
                color: isCurrentValueTaken ? "#FCA5A5" : "#FDE047",
                background: "rgba(0, 0, 0, 0.6)",
                border: isCurrentValueTaken ? "2px solid #EF4444" : "2px solid #FDE047",
                borderRadius: 12,
                padding: "4px 14px",
                boxShadow: isCurrentValueTaken ? "0 0 14px rgba(239, 68, 68, 0.4)" : "0 0 16px rgba(253, 224, 71, 0.35)",
                lineHeight: 1.15,
                textAlign: "center",
                textShadow: "0 2px 10px rgba(0,0,0,0.8)",
                display: "inline-block",
              }}
            >
              #{value || "---"}
            </div>

            <div style={{ minWidth: 0, textAlign: "right" }}>
              {value && !isCurrentValueTaken ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#6EE7B7", fontSize: "0.8125rem", fontWeight: 800 }}>
                  <Check size={15} color="#34D399" /> {text("Available to Pick")}
                </div>
              ) : value && isCurrentValueTaken ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#FCA5A5", fontSize: "0.8125rem", fontWeight: 800 }}>
                  <Lock size={14} color="#EF4444" /> {text("Already Taken")}
                </div>
              ) : null}
              <span style={{ fontSize: "0.6875rem", color: "#CBD5E1", display: "block", marginTop: 2 }}>
                {text("Pool Range: #1 to #")}{poolSize.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action: Pick Random */}
        <button
          type="button"
          onClick={rollRandom}
          disabled={isRolling || !availableNumbers.length}
          className="casino-btn-gold"
          style={{
            width: "100%",
            padding: "11px 16px",
            fontSize: "0.875rem",
            fontWeight: 900,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            boxSizing: "border-box",
          }}
        >
          <Dice5 size={18} className={isRolling ? "animate-spin" : ""} color="#111827" />
          {text("Pick Random Number")}
        </button>
      </div>

      {/* ── Search & Range Jump Filter ────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <div style={{ position: "relative", minWidth: 200, flex: 1 }}>
          <Search size={14} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            aria-label={text("Search number")}
            placeholder={`${text("Search number")} (1 - ${poolSize})`}
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
              aria-label={text("Previous range")}
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
              aria-label={text("Next range")}
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10, fontSize: "0.6875rem", color: "#CBD5E1" }}>
          <span style={{ fontWeight: 800, color: "#FEF08A" }}> {text("SELECTABLE NUMBERS (")}{poolSize.toLocaleString()} {text("TOTAL POOL SLOTS)")} </span>
          <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255, 255, 255, 0.2)" }} /> {text("Available")} </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#FCA5A5" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444" }} /> {text("Taken")} </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: "#FEF08A" }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#FDE047" }} /> {text("Selected")} </span>
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
            const isSelected = Number(num) === Number(value);
            const isTaken = effectiveTaken.has(String(num).padStart(2, "0"));

            return (
              <button
                key={String(num).padStart(2, "0")}
                type="button"
                disabled={isTaken}
                onClick={() => onChange(String(num).padStart(2, "0"))}
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
                {String(num).padStart(2, "0")}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
