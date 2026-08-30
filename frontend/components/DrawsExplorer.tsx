"use client";

import React, { useState, useMemo } from "react";
import { Trophy, Clock, Search, Award, Globe } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PhysicalDrawTicket } from "./PhysicalDrawTicket";
import { type DrawState, type Currency, FALLBACK_DRAWS } from "@/lib/api";

interface DrawsExplorerProps {
  initialDraws: DrawState[];
}

export function DrawsExplorer({ initialDraws }: DrawsExplorerProps) {
  const { t } = useLanguage();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("ETB");
  const [activeTab, setActiveTab] = useState<"open" | "upcoming" | "revealed">("open");
  const [searchQuery, setSearchQuery] = useState("");

  const allAvailableDraws = useMemo(() => {
    const combined = [...initialDraws];
    FALLBACK_DRAWS.forEach((fd) => {
      if (!combined.some((d) => d.id === fd.id)) {
        combined.push(fd);
      }
    });
    return combined;
  }, [initialDraws]);

  const filteredDraws = useMemo(() => {
    return allAvailableDraws.filter((draw) => {
      const drawCurr = draw.currency || "ETB";
      if (drawCurr !== selectedCurrency) return false;

      const matchTab = draw.status === activeTab;
      if (!matchTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (draw.title ?? "").toLowerCase().includes(q);
      const matchID = draw.draw_id.toLowerCase().includes(q);
      return matchTitle || matchID;
    });
  }, [allAvailableDraws, selectedCurrency, activeTab, searchQuery]);

  const counts = useMemo(() => {
    const currPool = allAvailableDraws.filter((d) => (d.currency || "ETB") === selectedCurrency);
    return {
      open: currPool.filter((d) => d.status === "open").length,
      upcoming: currPool.filter((d) => d.status === "upcoming").length,
      revealed: currPool.filter((d) => d.status === "revealed").length,
    };
  }, [allAvailableDraws, selectedCurrency]);

  return (
    <section id="draws-catalog" style={{ margin: "20px 0" }}>
      {/* Section Header & Currency Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: 6 }}>
            <Award size={13} /> {t.drawsExplorer.title}
          </div>
          <h2 className="display" style={{ fontSize: "clamp(1.375rem, 3vw, 1.875rem)", color: "#111827", lineHeight: 1.15, fontWeight: 800 }}>
            {t.drawsExplorer.subtitle}
          </h2>
        </div>

        {/* Currency Switcher Buttons */}
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setSelectedCurrency("ETB")}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              fontWeight: 800,
              cursor: "pointer",
              border: selectedCurrency === "ETB" ? "2px solid #F59E0B" : "1.5px solid var(--gray-line)",
              background: selectedCurrency === "ETB" ? "#FEF9C3" : "#FFFFFF",
              color: selectedCurrency === "ETB" ? "#111827" : "var(--text-muted)",
              transition: "all var(--transition-fast)",
            }}
          >
            Local ETB (Birr)
          </button>

          <button
            type="button"
            onClick={() => setSelectedCurrency("USD")}
            style={{
              padding: "7px 14px",
              borderRadius: 8,
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              fontWeight: 800,
              cursor: "pointer",
              border: selectedCurrency === "USD" ? "2px solid #F59E0B" : "1.5px solid var(--gray-line)",
              background: selectedCurrency === "USD" ? "#FEF9C3" : "#FFFFFF",
              color: selectedCurrency === "USD" ? "#111827" : "var(--text-muted)",
              display: "inline-flex",
              alignItems: "center",
              gap: 5,
              transition: "all var(--transition-fast)",
            }}
          >
            <Globe size={13} /> Diaspora USD ($)
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar & Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 14 }}>
        <div className="tab-filter-container">
          <button
            onClick={() => setActiveTab("open")}
            className={`tab-filter-btn ${activeTab === "open" ? "active" : ""}`}
          >
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: activeTab === "open" ? "var(--teal)" : "#94A3B8" }} />
            {t.drawsExplorer.tabCurrent} ({counts.open})
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`tab-filter-btn ${activeTab === "upcoming" ? "active" : ""}`}
          >
            <Clock size={13} />
            {t.drawsExplorer.tabUpcoming} ({counts.upcoming})
          </button>

          <button
            onClick={() => setActiveTab("revealed")}
            className={`tab-filter-btn ${activeTab === "revealed" ? "active" : ""}`}
          >
            <Trophy size={13} />
            {t.drawsExplorer.tabPast} ({counts.revealed})
          </button>
        </div>

        {/* Search filter */}
        <div style={{ position: "relative", minWidth: 220 }}>
          <Search size={14} color="var(--text-subtle)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="input-base"
            placeholder={t.drawsExplorer.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 34, minHeight: 38, fontSize: "0.8125rem" }}
          />
        </div>
      </div>

      {/* Physical Ticket Cards List */}
      {filteredDraws.length === 0 ? (
        <div className="card-base" style={{ padding: "36px 20px", textAlign: "center" }}>
          <Trophy size={28} color="var(--gray)" style={{ margin: "0 auto 10px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
            No {selectedCurrency} draws currently found for this tab.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filteredDraws.map((draw) => (
            <PhysicalDrawTicket key={draw.id} draw={draw} />
          ))}
        </div>
      )}
    </section>
  );
}
