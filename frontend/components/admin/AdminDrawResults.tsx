"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Video,
  Ticket,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  Plus,
  Trash2,
  Play,
  Film,
  Award,
} from "lucide-react";
import { accountAPI } from "@/lib/account-api";
import { money } from "@/lib/admin";
import type { AdminRound, LotteryPage } from "@/lib/lotteries";

interface WinnerEntry {
  rank: number;
  luckyNumber: string;
  prizeAmount: string;
  winnerName: string;
  payoutStatus: "pending" | "paid";
}

interface PublishedResult {
  drawId: string;
  drawDate?: string;
  broadcastVideoUrl?: string;
  winningNumbers: WinnerEntry[];
}

export function AdminDrawResults({ canWrite }: { canWrite: boolean }) {
  const [rounds, setRounds] = useState<AdminRound[]>([]);
  const [publishedResults, setPublishedResults] = useState<PublishedResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [revision, setRevision] = useState(0);

  // Tab filter for draw selector: "closed" | "all" | "completed" | "open"
  const [drawTab, setDrawTab] = useState<"closed" | "all" | "completed" | "open">("closed");

  // Active form state
  const [selectedDrawId, setSelectedDrawId] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [winners, setWinners] = useState<WinnerEntry[]>([
    { rank: 1, luckyNumber: "", prizeAmount: "", winnerName: "", payoutStatus: "pending" },
    { rank: 2, luckyNumber: "", prizeAmount: "", winnerName: "", payoutStatus: "pending" },
    { rank: 3, luckyNumber: "", prizeAmount: "", winnerName: "", payoutStatus: "pending" },
  ]);

  // Load rounds and published results
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");

    Promise.all([
      accountAPI<LotteryPage<AdminRound>>("/admin/rounds?offset=0"),
      accountAPI<PublishedResult[]>("/admin/results?offset=0"),
    ])
      .then(([roundsPage, resultsList]) => {
        if (!active) return;
        setRounds(roundsPage.items || []);
        setPublishedResults(resultsList || []);

        // If there is a closed draw and none selected yet, default to the first closed draw
        const closedDraws = (roundsPage.items || []).filter((r) => r.state === "closed");
        if (closedDraws.length > 0 && !selectedDrawId) {
          selectDraw(closedDraws[0]);
        }
      })
      .catch((err: any) => {
        if (!active) return;
        setError(err.message || "Failed to load rounds.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [revision]);

  function selectDraw(r: AdminRound) {
    setSelectedDrawId(r.id);
    setSuccessMsg("");
    setError("");

    // Check if results were already published for this draw
    const existing = publishedResults.find((p) => p.drawId === r.id);
    if (existing) {
      setVideoUrl(existing.broadcastVideoUrl || "");
      if (existing.winningNumbers && existing.winningNumbers.length > 0) {
        setWinners(
          existing.winningNumbers.map((w, idx) => ({
            rank: w.rank || idx + 1,
            luckyNumber: w.luckyNumber || "",
            prizeAmount: w.prizeAmount || "",
            winnerName: w.winnerName || "",
            payoutStatus: (w.payoutStatus as any) || "pending",
          }))
        );
      }
    } else {
      setVideoUrl(r.liveVideoUrl || "");
      setWinners([
        { rank: 1, luckyNumber: "", prizeAmount: "", winnerName: "", payoutStatus: "pending" },
        { rank: 2, luckyNumber: "", prizeAmount: "", winnerName: "", payoutStatus: "pending" },
        { rank: 3, luckyNumber: "", prizeAmount: "", winnerName: "", payoutStatus: "pending" },
      ]);
    }
  }

  const selectedRound = rounds.find((r) => r.id === selectedDrawId);

  // Add / Remove prize ranks
  function addRank() {
    if (winners.length >= 10) return;
    setWinners((prev) => [
      ...prev,
      {
        rank: prev.length + 1,
        luckyNumber: "",
        prizeAmount: "",
        winnerName: "",
        payoutStatus: "pending",
      },
    ]);
  }

  function removeRank(index: number) {
    if (winners.length <= 1) return;
    setWinners((prev) =>
      prev
        .filter((_, i) => i !== index)
        .map((w, i) => ({ ...w, rank: i + 1 }))
    );
  }

  // Submit outcome to backend
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedDrawId) {
      setError("Please select a closed draw first.");
      return;
    }

    const validWinners = winners.filter((w) => w.luckyNumber.trim() !== "");
    if (validWinners.length === 0) {
      setError("Please enter at least one winning ticket number.");
      return;
    }

    setBusy(true);
    setError("");
    setSuccessMsg("");

    try {
      const payload = {
        _id: selectedDrawId,
        drawId: selectedDrawId,
        drawDate: new Date().toISOString(),
        broadcastVideoUrl: videoUrl.trim(),
        winningNumbers: validWinners.map((w, idx) => ({
          rank: idx + 1,
          luckyNumber: w.luckyNumber.trim(),
          prizeAmount: w.prizeAmount.trim() || `Rank ${idx + 1} Prize`,
          winnerName: w.winnerName.trim() || "Anonymous Participant",
          payoutStatus: w.payoutStatus || "pending",
        })),
      };

      await accountAPI(`/admin/results`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedDrawId, value: payload }),
      });

      setSuccessMsg(
        `Results for draw "${selectedRound?.title || selectedDrawId}" published successfully! Draw status marked as completed.`
      );
      setRevision((v) => v + 1);
    } catch (err: any) {
      setError(err.message || "Failed to publish draw outcome.");
    } finally {
      setBusy(false);
    }
  }

  // Filter rounds for selector tabs
  const filteredRounds = rounds.filter((r) => {
    if (drawTab === "closed") return r.state === "closed";
    if (drawTab === "open") return r.state === "open";
    if (drawTab === "completed") return r.state === "completed";
    return true;
  });

  // Extract video embed if valid YouTube / Vimeo URL
  function getVideoEmbed(url: string) {
    if (!url) return null;
    try {
      if (url.includes("youtube.com/watch?v=")) {
        const id = new URL(url).searchParams.get("v");
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes("youtu.be/")) {
        const id = url.split("youtu.be/")[1]?.split("?")[0];
        return `https://www.youtube.com/embed/${id}`;
      }
      if (url.includes("vimeo.com/")) {
        const id = url.split("vimeo.com/")[1]?.split("?")[0];
        return `https://player.vimeo.com/video/${id}`;
      }
    } catch {
      return null;
    }
    return null;
  }

  const embedUrl = getVideoEmbed(videoUrl);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* ── CARD 1: DRAW SELECTION DIRECTORY ─────────────────────────────────── */}
      <section className="admin-card">
        <div className="admin-card-heading">
          <div>
            <h2>1. Select Lottery Draw for Outcome Verification</h2>
            <p className="admin-muted" style={{ margin: "4px 0 0" }}>
              Choose a closed lottery round to record and broadcast its verified live draw results. Only closed rounds with resolved reservations can be published.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setRevision((v) => v + 1)}
            style={{
              padding: "6px 12px",
              background: "#ffffff",
              border: "1px solid var(--admin-line)",
              borderRadius: "6px",
              fontSize: "12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontWeight: 600,
            }}
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh Draws
          </button>
        </div>

        {/* Tab Filters */}
        <div style={{ display: "flex", gap: "8px", margin: "16px 0 20px 0", flexWrap: "wrap" }}>
          {[
            { id: "closed", label: `Ready for Results (${rounds.filter((r) => r.state === "closed").length})` },
            { id: "all", label: `All Rounds (${rounds.length})` },
            { id: "open", label: `Active Sales (${rounds.filter((r) => r.state === "open").length})` },
            { id: "completed", label: `Published (${rounds.filter((r) => r.state === "completed").length})` },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setDrawTab(t.id as any)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                border: "1px solid",
                borderColor: drawTab === t.id ? "#6429ef" : "var(--admin-line)",
                background: drawTab === t.id ? "#6429ef" : "#ffffff",
                color: drawTab === t.id ? "#ffffff" : "var(--admin-muted)",
                transition: "all 0.15s ease",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Draws Grid */}
        {loading ? (
          <div style={{ padding: "30px", textAlign: "center", color: "var(--admin-muted)" }}>
            <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 10px" }} />
            <p style={{ margin: 0 }}>Loading lottery rounds…</p>
          </div>
        ) : filteredRounds.length === 0 ? (
          <div className="admin-empty" style={{ padding: "30px 20px", textAlign: "center" }}>
            {drawTab === "closed"
              ? "No closed draws currently awaiting results. When a round finishes sales, it will appear here."
              : "No rounds found in this category."}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "14px" }}>
            {filteredRounds.map((r) => {
              const isSelected = r.id === selectedDrawId;
              const isClosed = r.state === "closed";
              const isCompleted = r.state === "completed";

              return (
                <div
                  key={r.id}
                  onClick={() => selectDraw(r)}
                  style={{
                    padding: "16px",
                    borderRadius: "12px",
                    border: "2px solid",
                    borderColor: isSelected ? "#6429ef" : "var(--admin-line)",
                    background: isSelected ? "rgba(100, 41, 239, 0.03)" : "#ffffff",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                    transition: "all 0.15s ease",
                    position: "relative",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px" }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: "15px", fontWeight: 800, color: "var(--admin-ink)" }}>
                        {r.title}
                      </h4>
                      <code style={{ fontSize: "11px", color: "var(--admin-muted)", display: "block", marginTop: "3px" }}>
                        ID: {r.id}
                      </code>
                    </div>

                    <span
                      className={`admin-badge ${
                        isClosed ? "positive" : isCompleted ? "neutral" : "warning"
                      }`}
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        padding: "3px 8px",
                        borderRadius: "12px",
                        ...(isClosed
                          ? { background: "rgba(16, 185, 129, 0.15)", color: "#065f46", border: "1px solid #10b981" }
                          : {}),
                      }}
                    >
                      {isClosed ? "★ Ready for Results" : r.state}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--admin-muted)", borderTop: "1px dashed var(--admin-line)", paddingTop: "8px" }}>
                    <div>
                      Price: <strong>{money(r.priceMinor, r.currency)}</strong>
                    </div>
                    <div>
                      Capacity: <strong>{r.capacity.toLocaleString()} tickets</strong>
                    </div>
                  </div>

                  <button
                    type="button"
                    style={{
                      width: "100%",
                      padding: "8px",
                      borderRadius: "6px",
                      border: "none",
                      background: isSelected ? "#6429ef" : isClosed ? "#10b981" : "#f1f5f9",
                      color: isSelected || isClosed ? "#ffffff" : "#475569",
                      fontWeight: 700,
                      fontSize: "12px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                    }}
                  >
                    <Trophy size={14} />
                    {isSelected ? "Selected for Recording" : isClosed ? "Select & Record Results" : "View Draw Outcome"}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── CARD 2: RESULT RECORDING & BROADCAST STUDIO ─────────────────────── */}
      <section className="admin-card">
        <div className="admin-card-heading">
          <div>
            <h2>2. Record Verified Live Draw Outcome</h2>
            <p className="admin-muted" style={{ margin: "4px 0 0" }}>
              Input verified winning numbers, prize distributions, and the official live broadcast video recording.
            </p>
          </div>
          {selectedRound && (
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#6429ef", background: "rgba(100, 41, 239, 0.1)", padding: "4px 10px", borderRadius: "12px" }}>
              Active Target: {selectedRound.title}
            </span>
          )}
        </div>

        {error && (
          <div role="alert" style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "8px", color: "#991b1b", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", margin: "16px 0" }}>
            <AlertCircle size={16} color="#ef4444" style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div role="status" style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", borderRadius: "8px", color: "#065f46", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px", margin: "16px 0" }}>
            <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px", marginTop: "16px" }}>
          {/* Target Draw Selection Bar */}
          <div style={{ background: "#f8fafc", padding: "16px", borderRadius: "10px", border: "1px solid var(--admin-line)", display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: "240px" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--admin-ink)", display: "block", marginBottom: "4px" }}>
                Target Closed Draw ID <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <input
                required
                placeholder="Select from above or enter Draw ID…"
                value={selectedDrawId}
                onChange={(e) => setSelectedDrawId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-line)",
                  fontSize: "13px",
                  fontFamily: "monospace",
                  background: "#ffffff",
                }}
              />
            </div>

            {selectedRound && (
              <div style={{ display: "flex", gap: "16px", alignItems: "center", borderLeft: "2px solid var(--admin-line)", paddingLeft: "16px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--admin-muted)", display: "block" }}>Game</span>
                  <strong style={{ fontSize: "13px" }}>{selectedRound.title}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--admin-muted)", display: "block" }}>Price</span>
                  <strong style={{ fontSize: "13px" }}>{money(selectedRound.priceMinor, selectedRound.currency)}</strong>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--admin-muted)", display: "block" }}>Status</span>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: selectedRound.state === "closed" ? "#10b981" : "#d97706" }}>
                    {selectedRound.state.toUpperCase()}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Broadcast Recording Field with clear guidance */}
          <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid var(--admin-line)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
              <Film size={18} color="#6429ef" />
              <label style={{ fontSize: "14px", fontWeight: 800, color: "var(--admin-ink)", margin: 0 }}>
                Live Draw Broadcast Video Recording (URL)
              </label>
            </div>
            <p style={{ margin: "0 0 10px 0", fontSize: "12px", color: "var(--admin-muted)", lineHeight: 1.5 }}>
              Enter the publicly accessible link to the live broadcast video (e.g. YouTube Live, YouTube video, Vimeo, Facebook Video, or MP4 link). Players can watch this recording to independently audit the live draw ceremony.
            </p>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <input
                type="url"
                placeholder="https://www.youtube.com/watch?v=... or https://youtu.be/..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                style={{
                  flex: 1,
                  padding: "9px 12px",
                  borderRadius: "6px",
                  border: "1px solid var(--admin-line)",
                  fontSize: "13px",
                }}
              />
              {videoUrl && (
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "9px 14px",
                    background: "#f1f5f9",
                    borderRadius: "6px",
                    border: "1px solid var(--admin-line)",
                    fontSize: "12px",
                    fontWeight: 600,
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    color: "var(--admin-ink)",
                    textDecoration: "none",
                  }}
                >
                  <ExternalLink size={14} /> Test Link
                </a>
              )}
            </div>

            {/* Video Preview if supported embed */}
            {embedUrl && (
              <div style={{ marginTop: "14px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--admin-line)", maxWidth: "480px" }}>
                <iframe
                  src={embedUrl}
                  title="Broadcast Recording Preview"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ width: "100%", height: "240px", border: "none" }}
                />
              </div>
            )}
          </div>

          {/* Winning Numbers & Prize Allocation Grid */}
          <div style={{ background: "#ffffff", padding: "16px", borderRadius: "10px", border: "1px solid var(--admin-line)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 800, color: "var(--admin-ink)" }}>
                  Winning Tickets & Prize Distribution
                </h4>
                <p style={{ margin: "2px 0 0 0", fontSize: "12px", color: "var(--admin-muted)" }}>
                  Enter the verified winning ticket numbers. Ticket numbers must match actual issued, paid tickets.
                </p>
              </div>

              <button
                type="button"
                onClick={addRank}
                disabled={winners.length >= 10}
                style={{
                  padding: "6px 12px",
                  background: winners.length >= 10 ? "#f1f5f9" : "rgba(100, 41, 239, 0.1)",
                  color: winners.length >= 10 ? "#94a3b8" : "#6429ef",
                  border: "1px solid",
                  borderColor: winners.length >= 10 ? "var(--admin-line)" : "rgba(100, 41, 239, 0.2)",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: winners.length >= 10 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Plus size={14} /> Add Prize Rank
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {winners.map((w, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "80px 1.5fr 1.5fr 1.5fr 1fr 40px",
                    gap: "10px",
                    alignItems: "center",
                    padding: "10px",
                    borderRadius: "8px",
                    background: idx === 0 ? "rgba(254, 224, 71, 0.08)" : "#f8fafc",
                    border: "1px solid",
                    borderColor: idx === 0 ? "rgba(217, 119, 6, 0.3)" : "var(--admin-line)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", fontWeight: 800, fontSize: "12px" }}>
                    <Award size={15} color={idx === 0 ? "#d97706" : "#6429ef"} />
                    Rank {w.rank}
                  </div>

                  <input
                    required
                    placeholder="Ticket Number (e.g. 1042)"
                    value={w.luckyNumber}
                    onChange={(e) =>
                      setWinners((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, luckyNumber: e.target.value } : item))
                      )
                    }
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-line)",
                      fontSize: "13px",
                      background: "#ffffff",
                    }}
                  />

                  <input
                    placeholder="Prize Amount (e.g. 500,000 ETB)"
                    value={w.prizeAmount}
                    onChange={(e) =>
                      setWinners((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, prizeAmount: e.target.value } : item))
                      )
                    }
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-line)",
                      fontSize: "13px",
                      background: "#ffffff",
                    }}
                  />

                  <input
                    placeholder="Public Winner Name"
                    value={w.winnerName}
                    onChange={(e) =>
                      setWinners((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, winnerName: e.target.value } : item))
                      )
                    }
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-line)",
                      fontSize: "13px",
                      background: "#ffffff",
                    }}
                  />

                  <select
                    value={w.payoutStatus}
                    onChange={(e) =>
                      setWinners((prev) =>
                        prev.map((item, i) => (i === idx ? { ...item, payoutStatus: e.target.value as any } : item))
                      )
                    }
                    style={{
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "1px solid var(--admin-line)",
                      fontSize: "12px",
                      background: "#ffffff",
                      fontWeight: 600,
                    }}
                  >
                    <option value="pending">Payout Pending</option>
                    <option value="paid">Payout Settled</option>
                  </select>

                  <button
                    type="button"
                    onClick={() => removeRank(idx)}
                    disabled={winners.length <= 1}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: winners.length <= 1 ? "not-allowed" : "pointer",
                      color: winners.length <= 1 ? "#cbd5e1" : "#ef4444",
                      padding: "6px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", alignItems: "center" }}>
            <button
              type="submit"
              disabled={!canWrite || busy || !selectedDrawId}
              style={{
                padding: "12px 28px",
                background: !canWrite || !selectedDrawId ? "#9ca3af" : "#6429ef",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: 800,
                cursor: !canWrite || !selectedDrawId ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                boxShadow: "0 4px 12px rgba(100, 41, 239, 0.25)",
              }}
            >
              {busy ? (
                <>
                  <RefreshCw size={16} className="animate-spin" /> Publishing Outcome…
                </>
              ) : (
                <>
                  <Trophy size={16} /> Publish Verified Results
                </>
              )}
            </button>
          </div>
        </form>
      </section>

      {/* ── CARD 3: PUBLISHED RESULTS ARCHIVE ───────────────────────────────── */}
      <section className="admin-card">
        <div className="admin-card-heading">
          <div>
            <h2>Published Results Archive</h2>
            <p className="admin-muted" style={{ margin: "4px 0 0" }}>
              Permanent record of completed draw outcomes, winning numbers, and verified broadcast links.
            </p>
          </div>
          <span className="admin-badge positive">
            {publishedResults.length} Outcome{publishedResults.length === 1 ? "" : "s"} Published
          </span>
        </div>

        {publishedResults.length === 0 ? (
          <div className="admin-empty" style={{ padding: "30px 20px", textAlign: "center" }}>
            No draw results published yet. Select a closed draw above and record its results to publish your first verified outcome.
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Draw Identifier</th>
                  <th>Outcome Date</th>
                  <th>Top Winner & Prize</th>
                  <th>Winners Count</th>
                  <th>Broadcast Video</th>
                  <th style={{ textAlign: "right" }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {publishedResults.map((pr) => {
                  const matchingRound = rounds.find((r) => r.id === pr.drawId);
                  const firstWinner = pr.winningNumbers?.[0];

                  return (
                    <tr key={pr.drawId}>
                      <th scope="row">
                        <div style={{ fontWeight: 800, color: "var(--admin-ink)" }}>
                          {matchingRound?.title || pr.drawId}
                        </div>
                        <code style={{ fontSize: "11px", color: "var(--admin-muted)" }}>{pr.drawId}</code>
                      </th>
                      <td style={{ fontSize: "13px" }}>
                        {pr.drawDate ? new Date(pr.drawDate).toLocaleDateString() : "Recorded"}
                      </td>
                      <td>
                        {firstWinner ? (
                          <div>
                            <strong style={{ color: "#d97706" }}>#{firstWinner.luckyNumber}</strong> —{" "}
                            {firstWinner.prizeAmount} ({firstWinner.winnerName})
                          </div>
                        ) : (
                          <span style={{ color: "var(--admin-muted)" }}>None specified</span>
                        )}
                      </td>
                      <td>
                        <span className="admin-badge positive">
                          {pr.winningNumbers?.length || 0} Winner{pr.winningNumbers?.length === 1 ? "" : "s"}
                        </span>
                      </td>
                      <td>
                        {pr.broadcastVideoUrl ? (
                          <a
                            href={pr.broadcastVideoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px",
                              color: "#6429ef",
                              fontWeight: 700,
                              fontSize: "12px",
                              textDecoration: "none",
                            }}
                          >
                            <Play size={13} /> Watch Video
                          </a>
                        ) : (
                          <span style={{ color: "var(--admin-muted)", fontSize: "12px" }}>No video link</span>
                        )}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => {
                            const r = rounds.find((item) => item.id === pr.drawId);
                            if (r) selectDraw(r);
                            else setSelectedDrawId(pr.drawId);
                            window.scrollTo({ top: 300, behavior: "smooth" });
                          }}
                          style={{
                            padding: "6px 12px",
                            background: "#f1f5f9",
                            border: "1px solid var(--admin-line)",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          View / Edit
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
