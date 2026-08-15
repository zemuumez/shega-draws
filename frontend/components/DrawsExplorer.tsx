"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Ticket, Trophy, Calendar, ShieldCheck, ArrowRight, Search, Clock, Award, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { DrawState } from "@/lib/api";

export interface ExtendedDrawItem extends Partial<DrawState> {
  id: string;
  draw_id: string;
  title?: string;
  titleAm?: string;
  titleOm?: string;
  description?: string;
  descriptionAm?: string;
  descriptionOm?: string;
  status: "open" | "upcoming" | "closed" | "revealed";
  deadline: string;
  ticket_price?: number;
  ticketPrice?: number;
  totalPrizeValue?: string;
  heroImage?: string;
  winning_numbers?: string[];
  winningNumbers?: string[];
  prizes?: Array<{
    rank: number;
    label: string;
    labelAm?: string;
    labelOm?: string;
    prizeTitle: string;
    prizeTitleAm?: string;
    prizeTitleOm?: string;
    valueAmount?: string;
    description?: string;
    image?: string;
  }>;
}

interface DrawsExplorerProps {
  initialDraws: ExtendedDrawItem[];
}

export function DrawsExplorer({ initialDraws }: DrawsExplorerProps) {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"open" | "upcoming" | "revealed">("open");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDraws = useMemo(() => {
    return initialDraws.filter((draw) => {
      const matchTab = draw.status === activeTab;
      if (!matchTab) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      const localizedTitle = (
        language === "am" && draw.titleAm ? draw.titleAm : language === "om" && draw.titleOm ? draw.titleOm : (draw.title ?? "")
      ).toLowerCase();
      const matchID = (draw.draw_id ?? "").toLowerCase().includes(q);
      const matchPrize = draw.prizes?.some((p) => (p.prizeTitle ?? "").toLowerCase().includes(q));
      return localizedTitle.includes(q) || matchID || matchPrize;
    });
  }, [initialDraws, activeTab, searchQuery, language]);

  const counts = useMemo(() => {
    return {
      open: initialDraws.filter((d) => d.status === "open").length,
      upcoming: initialDraws.filter((d) => d.status === "upcoming").length,
      revealed: initialDraws.filter((d) => d.status === "revealed").length,
    };
  }, [initialDraws]);

  return (
    <section id="draws-catalog" style={{ margin: "56px 0" }}>
      {/* Section Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 18,
          marginBottom: 26,
        }}
      >
        <div>
          <div className="badge badge-gold" style={{ marginBottom: 8 }}>
            <Award size={12} /> {t.drawsExplorer.title}
          </div>
          <h2 className="display" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.15rem)", color: "var(--paper)", lineHeight: 1.15 }}>
            {t.drawsExplorer.subtitle}
          </h2>
        </div>

        {/* Search box */}
        <div style={{ position: "relative", minWidth: 260, width: "100%", maxWidth: 340 }}>
          <Search size={15} color="var(--gray)" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="input-base"
            placeholder={t.drawsExplorer.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 38, minHeight: 44, fontSize: "0.875rem", width: "100%" }}
          />
        </div>
      </div>

      {/* Tabs Filter Bar (Mobile Touch Scrollable) */}
      <div style={{ display: "flex", gap: 8, marginBottom: 26, overflowX: "auto", paddingBottom: 6, WebkitOverflowScrolling: "touch" }}>
        <div className="tab-filter-container">
          <button
            onClick={() => setActiveTab("open")}
            className={`tab-filter-btn ${activeTab === "open" ? "active" : ""}`}
          >
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: activeTab === "open" ? "var(--ink)" : "var(--teal-soft)" }} />
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

      {/* Draws Grid */}
      {filteredDraws.length === 0 ? (
        <div className="card-base" style={{ padding: "48px 24px", textAlign: "center" }}>
          <Trophy size={32} color="var(--gray)" style={{ margin: "0 auto 12px" }} />
          <p style={{ color: "var(--gray)", fontSize: "0.9375rem" }}>{t.drawsExplorer.noDrawsFound}</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 320px), 1fr))", gap: 22 }}>
          {filteredDraws.map((draw) => {
            const localizedTitle =
              language === "am" && draw.titleAm ? draw.titleAm : language === "om" && draw.titleOm ? draw.titleOm : (draw.title || "The Grand Reward Raffle");
            const localizedDesc =
              language === "am" && draw.descriptionAm ? draw.descriptionAm : language === "om" && draw.descriptionOm ? draw.descriptionOm : draw.description;

            const topPrize = draw.prizes?.find((p) => p.rank === 1) || draw.prizes?.[0];
            const topPrizeTitle = topPrize
              ? (language === "am" && topPrize.prizeTitleAm ? topPrize.prizeTitleAm : language === "om" && topPrize.prizeTitleOm ? topPrize.prizeTitleOm : topPrize.prizeTitle)
              : null;
            const topPrizeLabel = topPrize
              ? (language === "am" && topPrize.labelAm ? topPrize.labelAm : language === "om" && topPrize.labelOm ? topPrize.labelOm : topPrize.label)
              : null;

            const isRevealed = draw.status === "revealed";
            const isUpcoming = draw.status === "upcoming";
            const isOpen = draw.status === "open";
            const winningNum = draw.winning_numbers?.[1] || draw.winningNumbers?.[0] || "42";
            const price = draw.ticket_price || draw.ticketPrice || 100;

            return (
              <div
                key={draw.id || draw.draw_id}
                className="physical-ticket card-interactive animate-fade"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  background: "linear-gradient(180deg, var(--ink-card) 0%, var(--ink-deep) 100%)",
                  border: isOpen ? "1.5px solid rgba(212, 175, 55, 0.45)" : "1px solid var(--gray-line)",
                }}
              >
                {/* Notches for tactile ticket feel */}
                <div className="ticket-notch-left" />
                <div className="ticket-notch-right" />

                <div style={{ padding: "24px 24px 16px" }}>
                  {/* Status Badge & Draw ID */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                    <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gold-soft)" }}>
                      #{draw.draw_id}
                    </span>
                    <span
                      className={`badge ${isOpen ? "badge-gold" : isUpcoming ? "badge-teal" : "badge-gray"}`}
                    >
                      {isOpen ? t.drawsExplorer.statusOpen : isUpcoming ? t.drawsExplorer.statusUpcoming : t.drawsExplorer.statusRevealed}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="display" style={{ fontSize: "1.25rem", color: "var(--paper)", lineHeight: 1.25, marginBottom: 8 }}>
                    {localizedTitle}
                  </h3>
                  <p style={{ color: "var(--paper-muted)", fontSize: "0.8125rem", lineHeight: 1.55, marginBottom: 16 }}>
                    {localizedDesc}
                  </p>

                  {/* Grand Prize Spotlight Box */}
                  {topPrize && topPrizeTitle && (
                    <div
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid rgba(212, 175, 55, 0.25)",
                        borderRadius: "var(--radius-sm)",
                        padding: "12px 14px",
                        marginBottom: 16,
                      }}
                    >
                      <div className="mono" style={{ fontSize: "0.625rem", color: "var(--gold-soft)", textTransform: "uppercase", marginBottom: 3 }}>
                        🏆 {t.prizes.rank1} : {topPrizeLabel ?? topPrize.label}
                      </div>
                      <div className="display" style={{ fontSize: "1.0625rem", color: "var(--paper)", fontWeight: 700 }}>
                        {topPrizeTitle}
                      </div>
                      {(topPrize.valueAmount || draw.totalPrizeValue) && (
                        <div className="mono" style={{ fontSize: "0.6875rem", color: "var(--teal-soft)", marginTop: 2 }}>
                          {t.drawsExplorer.prizePool}: {topPrize.valueAmount || draw.totalPrizeValue}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Key Metrics */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, fontSize: "0.75rem", marginBottom: 16 }}>
                    <div style={{ background: "var(--ink-soft)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--gray-line)" }}>
                      <span className="mono" style={{ color: "var(--gray)", display: "block", fontSize: "0.625rem", textTransform: "uppercase" }}>
                        {t.drawsExplorer.ticketPrice}
                      </span>
                      <strong style={{ color: "var(--paper)", fontSize: "0.875rem" }}>
                        {price} ETB
                      </strong>
                    </div>

                    <div style={{ background: "var(--ink-soft)", padding: "8px 10px", borderRadius: 8, border: "1px solid var(--gray-line)" }}>
                      <span className="mono" style={{ color: "var(--gray)", display: "block", fontSize: "0.625rem", textTransform: "uppercase" }}>
                        {isRevealed ? t.drawsExplorer.completedOn : t.drawsExplorer.drawDate}
                      </span>
                      <strong style={{ color: "var(--paper)", fontSize: "0.8125rem" }}>
                        {draw.deadline ? new Date(draw.deadline).toLocaleDateString(language === "am" ? "am-ET" : "en-US", { month: "short", day: "numeric", year: "numeric" }) : "TBA"}
                      </strong>
                    </div>
                  </div>

                  {/* Winning Numbers Pill if revealed */}
                  {isRevealed && (
                    <div
                      style={{
                        background: "rgba(43, 182, 148, 0.08)",
                        border: "1px dashed rgba(43, 182, 148, 0.4)",
                        borderRadius: "var(--radius-sm)",
                        padding: "10px 12px",
                        marginBottom: 16,
                      }}
                    >
                      <div className="mono" style={{ fontSize: "0.625rem", color: "var(--teal-soft)", textTransform: "uppercase", marginBottom: 4 }}>
                        {t.drawsExplorer.winningNumbers} (1st Place):
                      </div>
                      <div className="display" style={{ fontSize: "1.75rem", color: "var(--gold)", fontWeight: 800 }}>
                        #{winningNum}
                      </div>
                    </div>
                  )}
                </div>

                {/* Perforated Divider */}
                <hr className="ticket-divider-line" />

                {/* Ticket Footer Action */}
                <div style={{ padding: "12px 24px 20px" }}>
                  {isOpen && (
                    <Link
                      href="/enter"
                      className="btn-base btn-primary"
                      style={{ width: "100%", justifyContent: "center" }}
                    >
                      <Ticket size={16} /> {t.drawsExplorer.enterNow}
                    </Link>
                  )}

                  {isUpcoming && (
                    <button
                      className="btn-base btn-secondary"
                      style={{ width: "100%", justifyContent: "center" }}
                      onClick={() => alert(`Draw #${draw.draw_id} opens on ${new Date(draw.deadline).toLocaleDateString()}`)}
                    >
                      <Calendar size={15} /> {t.drawsExplorer.startsIn} {new Date(draw.deadline).toLocaleDateString()}
                    </button>
                  )}

                  {isRevealed && (
                    <Link
                      href="/results"
                      className="btn-base btn-secondary"
                      style={{ width: "100%", justifyContent: "center", borderColor: "var(--teal)" }}
                    >
                      <ShieldCheck size={16} color="var(--teal-soft)" /> {t.drawsExplorer.verifyResults}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
