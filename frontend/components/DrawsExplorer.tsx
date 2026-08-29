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
    // Ensure all fallback USD and ETB draws are included if not present
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
    <section id="draws-catalog" style={{ margin: "40px 0" }}>
      {/* Section Header & Currency Switcher */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 20 }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: 8 }}>
            <Award size={13} /> {t.drawsExplorer.title}
          </div>
          <h2 className="display" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.125rem)", color: "var(--blue-navy)", lineHeight: 1.15, fontWeight: 800 }}>
            {t.drawsExplorer.subtitle}
          </h2>
        </div>

        {/* Currency Switcher Buttons */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button
            type="button"
            onClick={() => setSelectedCurrency("ETB")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              fontWeight: 800,
              cursor: "pointer",
              border: selectedCurrency === "ETB" ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
              background: selectedCurrency === "ETB" ? "var(--blue-bg)" : "#FFFFFF",
              color: selectedCurrency === "ETB" ? "#2A65E6" : "var(--text-muted)",
              transition: "all var(--transition-fast)",
            }}
          >
            🇪🇹 Local ETB (Birr)
          </button>

          <button
            type="button"
            onClick={() => setSelectedCurrency("USD")}
            style={{
              padding: "8px 16px",
              borderRadius: 8,
              fontFamily: "var(--font-body)",
              fontSize: "0.8125rem",
              fontWeight: 800,
              cursor: "pointer",
              border: selectedCurrency === "USD" ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
              background: selectedCurrency === "USD" ? "var(--blue-bg)" : "#FFFFFF",
              color: selectedCurrency === "USD" ? "#2A65E6" : "var(--text-muted)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all var(--transition-fast)",
            }}
          >
            <Globe size={14} /> 🌐 Diaspora USD ($25+)
          </button>
        </div>
      </div>

      {/* Tabs Filter Bar & Search */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div className="tab-filter-container">
          <button
            onClick={() => setActiveTab("open")}
            className={`tab-filter-btn ${activeTab === "open" ? "active" : ""}`}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeTab === "open" ? "var(--teal)" : "#94A3B8" }} />
            {t.drawsExplorer.tabCurrent} ({counts.open})
          </button>

          <button
            onClick={() => setActiveTab("upcoming")}
            className={`tab-filter-btn ${activeTab === "upcoming" ? "active" : ""}`}
          >
            <Clock size={14} />
            {t.drawsExplorer.tabUpcoming} ({counts.upcoming})
          </button>

          <button
            onClick={() => setActiveTab("revealed")}
            className={`tab-filter-btn ${activeTab === "revealed" ? "active" : ""}`}
          >
            <Trophy size={14} />
            {t.drawsExplorer.tabPast} ({counts.revealed})
          </button>
        </div>

        {/* Search filter */}
        <div style={{ position: "relative", minWidth: 240 }}>
          <Search size={15} color="var(--text-subtle)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="input-base"
            placeholder={t.drawsExplorer.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 38, minHeight: 40, fontSize: "0.8125rem" }}
          />
        </div>
      </div>

      {/* Physical Ticket Cards List */}
      {filteredDraws.length === 0 ? (
        <div className="card-base" style={{ padding: "48px 24px", textAlign: "center" }}>
          <Trophy size={32} color="var(--gray)" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>
            No {selectedCurrency} draws currently found for this tab.
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {filteredDraws.map((draw) => (
            <PhysicalDrawTicket key={draw.id} draw={draw} />
          ))}
        </div>
      )}
    </section>
  );
}
