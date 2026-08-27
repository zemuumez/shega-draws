"use client";

import React, { useState, useMemo } from "react";
import { Trophy, Clock, Search, Award } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { PhysicalDrawTicket } from "./PhysicalDrawTicket";
import type { DrawState } from "@/lib/api";

interface DrawsExplorerProps {
  initialDraws: DrawState[];
}

export function DrawsExplorer({ initialDraws }: DrawsExplorerProps) {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"open" | "upcoming" | "revealed">("open");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDraws = useMemo(() => {
    return initialDraws.filter((draw) => {
      const matchTab = draw.status === activeTab;
      if (!matchTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const matchTitle = (draw.title ?? "").toLowerCase().includes(q);
      const matchID = draw.draw_id.toLowerCase().includes(q);
      const matchPrize = draw.prizes?.some((p) => p.prizeTitle.toLowerCase().includes(q));
      return matchTitle || matchID || matchPrize;
    });
  }, [initialDraws, activeTab, searchQuery]);

  const counts = useMemo(() => {
    return {
      open: initialDraws.filter((d) => d.status === "open").length,
      upcoming: initialDraws.filter((d) => d.status === "upcoming").length,
      revealed: initialDraws.filter((d) => d.status === "revealed").length,
    };
  }, [initialDraws]);

  return (
    <section id="draws-catalog" style={{ margin: "44px 0" }}>
      {/* Section Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16, marginBottom: 24 }}>
        <div>
          <div className="badge badge-gold" style={{ marginBottom: 8 }}>
            <Award size={13} /> {t.drawsExplorer.title}
          </div>
          <h2 className="display" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.125rem)", color: "var(--text-main)", lineHeight: 1.15 }}>
            {t.drawsExplorer.subtitle}
          </h2>
        </div>

        {/* Search filter */}
        <div style={{ position: "relative", minWidth: 260 }}>
          <Search size={15} color="var(--gray)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="input-base"
            placeholder={t.drawsExplorer.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 38, minHeight: 44, fontSize: "0.875rem" }}
          />
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, overflowX: "auto", paddingBottom: 6 }}>
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
      </div>

      {/* Physical Ticket Cards List */}
      {filteredDraws.length === 0 ? (
        <div className="card-base" style={{ padding: "48px 24px", textAlign: "center" }}>
          <Trophy size={32} color="var(--gray)" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem" }}>{t.drawsExplorer.noDrawsFound}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {filteredDraws.map((draw) => (
            <PhysicalDrawTicket key={draw.id} draw={draw} />
          ))}
        </div>
      )}
    </section>
  );
}
