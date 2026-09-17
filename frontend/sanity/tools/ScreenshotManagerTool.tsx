"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useClient } from "sanity";
import {
  playersWorkbook,
  reviewArchive,
  type PlayerReceipt,
} from "@/lib/exports/players";
import {
  Search,
  RefreshCw,
  FileSpreadsheet,
  Archive,
  CheckCircle2,
  Clock,
  XCircle,
  Eye,
  Download,
  Copy,
  Check,
  Users,
  Ticket,
  Filter,
  X,
  Image as ImageIcon,
  ChevronDown,
  Layers,
  Sparkles,
  CreditCard,
  Hash,
} from "lucide-react";

function downloadBlob(data: Uint8Array, filename: string, type: string) {
  const blob = new Blob([new Uint8Array(data)], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function ScreenshotManagerTool() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [entries, setEntries] = useState<PlayerReceipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState({
    drawId: "",
    poolCapacity: "",
    amount: "",
    currency: "",
    status: "",
  });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(100);
  const [preview, setPreview] = useState<PlayerReceipt | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const all: PlayerReceipt[] = [];
      let after = "";
      const before = new Date().toISOString();
      for (;;) {
        const page = await client.fetch<PlayerReceipt[]>(
          `*[_type == "playerEntry" && !(_id in path("drafts.**")) && !(_id in path("versions.**")) && _id > $after && _createdAt <= $before] | order(_id asc)[0...1000]{
            _id,
            _rev,
            playerName,
            playerPhone,
            drawId,
            luckyNumber,
            poolCapacity,
            amount,
            currency,
            paymentMethod,
            paymentReference,
            submittedAt,
            status,
            adminNotes,
            "imageUrl": proofScreenshot.asset->url,
            "mimeType": proofScreenshot.asset->mimeType
          }`,
          { after, before },
          { perspective: "raw" }
        );
        all.push(...page);
        if (page.length < 1000) break;
        after = page[page.length - 1]._id;
      }
      setEntries(
        all.sort((a, b) =>
          (b.submittedAt || "").localeCompare(a.submittedAt || "")
        )
      );
      setSelected(new Set());
    } catch {
      setError(
        "Could not load receipts. Check your Sanity login and dataset permissions, then refresh."
      );
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [client]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  // Combined Search & Filters
  const filtered = useMemo(() => {
    return entries.filter((e) => {
      // 1. Dropdown filters
      const matchesDropdowns = Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        if (key === "status") {
          return (e.status || "pending") === value;
        }
        return String(e[key as keyof PlayerReceipt] ?? "") === value;
      });
      if (!matchesDropdowns) return false;

      // 2. Text Search Query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        (e.playerName || "").toLowerCase().includes(q) ||
        (e.playerPhone || "").toLowerCase().includes(q) ||
        (e.luckyNumber || "").toLowerCase().includes(q) ||
        (e.paymentReference || "").toLowerCase().includes(q) ||
        (e.drawId || "").toLowerCase().includes(q) ||
        (e.paymentMethod || "").toLowerCase().includes(q)
      );
    });
  }, [entries, filters, searchQuery]);

  useEffect(() => {
    setSelected(new Set());
    setVisibleCount(100);
  }, [filters, searchQuery]);

  const chosen = useMemo(() => {
    return filtered.filter((e) => selected.has(e._id));
  }, [filtered, selected]);

  // Metric counts
  const metrics = useMemo(() => {
    const total = entries.length;
    const pending = entries.filter(
      (e) => !e.status || e.status === "pending"
    ).length;
    const confirmed = entries.filter((e) => e.status === "confirmed").length;
    const rejected = entries.filter((e) => e.status === "rejected").length;
    const withScreenshot = entries.filter((e) => Boolean(e.imageUrl)).length;
    return { total, pending, confirmed, rejected, withScreenshot };
  }, [entries]);

  const hasActiveFilters =
    Boolean(searchQuery) || Object.values(filters).some(Boolean);

  const resetFilters = () => {
    setSearchQuery("");
    setFilters({
      drawId: "",
      poolCapacity: "",
      amount: "",
      currency: "",
      status: "",
    });
  };

  async function exportItems(items: PlayerReceipt[], withScreenshots: boolean) {
    if (!items.length) return;
    setBusy(true);
    setMessage("Preparing export package...");
    setError("");
    try {
      const date = new Date().toISOString().slice(0, 10);
      if (withScreenshots) {
        const result = await reviewArchive(items, (done, total) =>
          setMessage(`Downloading screenshot ${done} of ${total}...`)
        );
        downloadBlob(
          result.data,
          `rimna-review-${date}.zip`,
          "application/zip"
        );
        setMessage(
          `Successfully exported ${items.length} players with ${
            items.length - result.failures.length
          } screenshots.`
        );
        if (result.failures.length) {
          setError(
            `${result.failures.length} screenshots could not be retrieved. The Excel file and README inside the ZIP identify missing files.`
          );
        }
      } else {
        downloadBlob(
          await playersWorkbook(items),
          `rimna-players-${date}.xlsx`,
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        setMessage(`Successfully exported ${items.length} players to Excel.`);
      }
    } catch {
      setError("Export failed. Try a smaller selection or refresh and retry.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  // Helper for status badge
  const renderStatusBadge = (status?: string) => {
    const s = status || "pending";
    if (s === "confirmed") {
      return (
        <span
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid #10B981",
            color: "#6EE7B7",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            textTransform: "capitalize",
          }}
        >
          <CheckCircle2 size={12} color="#10B981" /> Confirmed
        </span>
      );
    }
    if (s === "rejected") {
      return (
        <span
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid #EF4444",
            color: "#FCA5A5",
            padding: "4px 10px",
            borderRadius: "20px",
            fontSize: "0.75rem",
            fontWeight: 800,
            display: "inline-flex",
            alignItems: "center",
            gap: 5,
            textTransform: "capitalize",
          }}
        >
          <XCircle size={12} color="#EF4444" /> Rejected
        </span>
      );
    }
    return (
      <span
        style={{
          background: "rgba(245, 158, 11, 0.15)",
          border: "1px solid #F59E0B",
          color: "#FCD34D",
          padding: "4px 10px",
          borderRadius: "20px",
          fontSize: "0.75rem",
          fontWeight: 800,
          display: "inline-flex",
          alignItems: "center",
          gap: 5,
          textTransform: "capitalize",
        }}
      >
        <Clock size={12} color="#F59E0B" /> Pending
      </span>
    );
  };

  return (
    <div
      style={{
        padding: "clamp(16px, 3vw, 32px)",
        minHeight: "100%",
        background: "linear-gradient(180deg, #0B0F19 0%, #111827 100%)",
        color: "#F8FAFC",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: "border-box",
      }}
    >
      {/* ── 1. Top Header & Title ────────────────────────────────────── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(253, 224, 71, 0.1)",
              border: "1px solid rgba(253, 224, 71, 0.35)",
              padding: "4px 12px",
              borderRadius: 20,
              fontSize: "0.75rem",
              fontWeight: 800,
              color: "#FEF08A",
              marginBottom: 8,
            }}
          >
            <Sparkles size={13} color="#FACC15" /> RIMNA LOTTERY AUDIT & EXPORT SUITE
          </div>
          <h1
            style={{
              fontSize: "clamp(1.5rem, 3vw, 2.1rem)",
              fontWeight: 900,
              margin: "0 0 6px",
              color: "#FFFFFF",
              letterSpacing: "-0.5px",
            }}
          >
            Players & Payment Receipts
          </h1>
          <p
            style={{
              margin: 0,
              color: "#94A3B8",
              fontSize: "0.875rem",
              maxWidth: 720,
              lineHeight: 1.5,
            }}
          >
            Search, filter, and audit all submitted lottery tickets and payment proofs.
            Export complete verified records to Excel or download bulk ZIP bundles with attached screenshots.
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={loading || busy}
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            border: "1.5px solid rgba(253, 224, 71, 0.4)",
            color: "#FEF08A",
            padding: "10px 18px",
            borderRadius: 10,
            fontWeight: 800,
            fontSize: "0.875rem",
            cursor: loading || busy ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            transition: "all 0.2s ease",
          }}
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          {loading ? "Refreshing..." : "Refresh Receipts"}
        </button>
      </div>

      {/* ── 2. Metric KPI Cards ──────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
          marginBottom: 24,
        }}
      >
        {/* Total Receipts */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.65)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 14,
            padding: "16px 18px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#94A3B8",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            <span>Total Submissions</span>
            <Users size={16} color="#94A3B8" />
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "#FFFFFF" }}>
            {metrics.total}
          </div>
        </div>

        {/* Pending Review */}
        <div
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            border: "1.5px solid rgba(245, 158, 11, 0.4)",
            borderRadius: 14,
            padding: "16px 18px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#FCD34D",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            <span>Pending Review</span>
            <Clock size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "#FDE047" }}>
            {metrics.pending}
          </div>
        </div>

        {/* Confirmed / Approved */}
        <div
          style={{
            background: "rgba(16, 185, 129, 0.08)",
            border: "1.5px solid rgba(16, 185, 129, 0.4)",
            borderRadius: 14,
            padding: "16px 18px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#6EE7B7",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            <span>Approved & Confirmed</span>
            <CheckCircle2 size={16} color="#10B981" />
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "#34D399" }}>
            {metrics.confirmed}
          </div>
        </div>

        {/* Rejected Proofs */}
        <div
          style={{
            background: "rgba(239, 68, 68, 0.08)",
            border: "1.5px solid rgba(239, 68, 68, 0.4)",
            borderRadius: 14,
            padding: "16px 18px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#FCA5A5",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            <span>Rejected</span>
            <XCircle size={16} color="#EF4444" />
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "#F87171" }}>
            {metrics.rejected}
          </div>
        </div>

        {/* Screenshot Attached */}
        <div
          style={{
            background: "rgba(59, 130, 246, 0.08)",
            border: "1.5px solid rgba(59, 130, 246, 0.4)",
            borderRadius: 14,
            padding: "16px 18px",
            backdropFilter: "blur(12px)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#93C5FD",
              fontSize: "0.75rem",
              fontWeight: 800,
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            <span>With Screenshot</span>
            <ImageIcon size={16} color="#3B82F6" />
          </div>
          <div style={{ fontSize: "1.65rem", fontWeight: 900, color: "#60A5FA" }}>
            {metrics.withScreenshot}{" "}
            <span style={{ fontSize: "0.85rem", color: "#94A3B8", fontWeight: 600 }}>
              / {metrics.total}
            </span>
          </div>
        </div>
      </div>

      {/* ── 3. Search & Filter Bar ───────────────────────────────────── */}
      <div
        style={{
          background: "rgba(15, 23, 42, 0.85)",
          border: "1.5px solid rgba(253, 224, 71, 0.3)",
          borderRadius: 16,
          padding: "18px 20px",
          marginBottom: 20,
          boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          backdropFilter: "blur(16px)",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
            gap: 12,
            alignItems: "flex-end",
          }}
        >
          {/* Search Input */}
          <div style={{ gridColumn: "span 2", minWidth: 260 }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#FEF08A",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Search Player, Phone, Lucky No, Ref
            </label>
            <div style={{ position: "relative" }}>
              <Search
                size={16}
                color="#94A3B8"
                style={{
                  position: "absolute",
                  left: 12,
                  top: "50%",
                  transform: "translateY(-50%)",
                }}
              />
              <input
                type="text"
                placeholder="Search name, phone, ref, or lucky #..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={busy}
                style={{
                  width: "100%",
                  padding: "10px 12px 10px 36px",
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1.5px solid rgba(255, 255, 255, 0.15)",
                  borderRadius: 8,
                  color: "#FFFFFF",
                  fontSize: "0.875rem",
                  boxSizing: "border-box",
                  outline: "none",
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "transparent",
                    border: "none",
                    color: "#94A3B8",
                    cursor: "pointer",
                    padding: 2,
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Draw ID Filter */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#CBD5E1",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Draw ID
            </label>
            <select
              aria-label="Draw"
              disabled={busy}
              value={filters.drawId}
              onChange={(e) => setFilters({ ...filters, drawId: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1.5px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 8,
                color: "#FFFFFF",
                fontSize: "0.875rem",
                boxSizing: "border-box",
                outline: "none",
              }}
            >
              <option value="">All Draws</option>
              {Array.from(new Set(entries.map((e) => e.drawId).filter(Boolean)))
                .sort()
                .map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
            </select>
          </div>

          {/* Pool Capacity */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#CBD5E1",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Pool Slots
            </label>
            <select
              aria-label="Pool capacity"
              disabled={busy}
              value={filters.poolCapacity}
              onChange={(e) =>
                setFilters({ ...filters, poolCapacity: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1.5px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 8,
                color: "#FFFFFF",
                fontSize: "0.875rem",
                boxSizing: "border-box",
                outline: "none",
              }}
            >
              <option value="">All Pools</option>
              {Array.from(
                new Set(entries.map((e) => e.poolCapacity).filter(Boolean))
              )
                .sort((a, b) => Number(a) - Number(b))
                .map((val) => (
                  <option key={val} value={val}>
                    {val} slots
                  </option>
                ))}
            </select>
          </div>

          {/* Currency */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#CBD5E1",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Currency
            </label>
            <select
              aria-label="Currency"
              disabled={busy}
              value={filters.currency}
              onChange={(e) =>
                setFilters({ ...filters, currency: e.target.value })
              }
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1.5px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 8,
                color: "#FFFFFF",
                fontSize: "0.875rem",
                boxSizing: "border-box",
                outline: "none",
              }}
            >
              <option value="">All Currencies</option>
              {Array.from(new Set(entries.map((e) => e.currency).filter(Boolean)))
                .sort()
                .map((val) => (
                  <option key={val} value={val}>
                    {val}
                  </option>
                ))}
            </select>
          </div>

          {/* Review Status */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 800,
                color: "#CBD5E1",
                textTransform: "uppercase",
                marginBottom: 6,
              }}
            >
              Status
            </label>
            <select
              aria-label="Review status"
              disabled={busy}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              style={{
                width: "100%",
                padding: "10px 12px",
                background: "rgba(0, 0, 0, 0.4)",
                border: "1.5px solid rgba(255, 255, 255, 0.15)",
                borderRadius: 8,
                color: "#FFFFFF",
                fontSize: "0.875rem",
                boxSizing: "border-box",
                outline: "none",
              }}
            >
              <option value="">All Statuses</option>
              <option value="pending">🟡 Pending Review</option>
              <option value="confirmed">🟢 Confirmed / Approved</option>
              <option value="rejected">🔴 Rejected</option>
            </select>
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <div>
              <button
                onClick={resetFilters}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  background: "rgba(239, 68, 68, 0.15)",
                  border: "1.5px solid #EF4444",
                  borderRadius: 8,
                  color: "#FCA5A5",
                  fontWeight: 800,
                  fontSize: "0.8125rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                <X size={14} /> Reset
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── 4. Action / Export Control Bar ───────────────────────────── */}
      <div
        style={{
          background: "rgba(30, 41, 59, 0.7)",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          borderRadius: 14,
          padding: "14px 18px",
          marginBottom: 20,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.875rem", fontWeight: 800, color: "#FFFFFF" }}>
            {filtered.length} matching receipts
          </span>
          {chosen.length > 0 && (
            <span
              style={{
                background: "rgba(253, 224, 71, 0.15)",
                border: "1px solid #FDE047",
                color: "#FEF08A",
                padding: "3px 10px",
                borderRadius: 12,
                fontSize: "0.75rem",
                fontWeight: 900,
              }}
            >
              {chosen.length} selected
            </span>
          )}
        </div>

        {/* Export Buttons Suite */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {/* Export Filtered Excel */}
          <button
            disabled={loading || busy || !filtered.length}
            onClick={() => exportItems(filtered, false)}
            style={{
              background: "linear-gradient(135deg, #059669 0%, #047857 100%)",
              border: "1px solid #10B981",
              color: "#FFFFFF",
              borderRadius: 8,
              padding: "9px 14px",
              fontSize: "0.8125rem",
              fontWeight: 800,
              cursor: loading || busy || !filtered.length ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(16, 185, 129, 0.3)",
            }}
          >
            <FileSpreadsheet size={15} />
            Excel ({filtered.length})
          </button>

          {/* Export Filtered ZIP Bundle */}
          <button
            disabled={loading || busy || !filtered.length}
            onClick={() => exportItems(filtered, true)}
            style={{
              background: "linear-gradient(135deg, #D97706 0%, #B45309 100%)",
              border: "1px solid #F59E0B",
              color: "#FFFFFF",
              borderRadius: 8,
              padding: "9px 14px",
              fontSize: "0.8125rem",
              fontWeight: 800,
              cursor: loading || busy || !filtered.length ? "not-allowed" : "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              boxShadow: "0 2px 8px rgba(245, 158, 11, 0.3)",
            }}
          >
            <Archive size={15} />
            ZIP Bundle (Excel + Screenshots)
          </button>

          {/* Export Selected buttons (if chosen) */}
          {chosen.length > 0 && (
            <>
              <button
                disabled={loading || busy}
                onClick={() => exportItems(chosen, false)}
                style={{
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "1.5px solid #10B981",
                  color: "#6EE7B7",
                  borderRadius: 8,
                  padding: "9px 14px",
                  fontSize: "0.8125rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <FileSpreadsheet size={15} />
                Selected Excel ({chosen.length})
              </button>
              <button
                disabled={loading || busy}
                onClick={() => exportItems(chosen, true)}
                style={{
                  background: "rgba(245, 158, 11, 0.2)",
                  border: "1.5px solid #FDE047",
                  color: "#FEF08A",
                  borderRadius: 8,
                  padding: "9px 14px",
                  fontSize: "0.8125rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Archive size={15} />
                Selected ZIP ({chosen.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Status Alerts ────────────────────────────────────────────── */}
      {message && (
        <div
          role="status"
          style={{
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid #10B981",
            color: "#6EE7B7",
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: "0.875rem",
            fontWeight: 700,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <CheckCircle2 size={18} color="#10B981" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div
          role="alert"
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            border: "1px solid #EF4444",
            color: "#FCA5A5",
            padding: "12px 16px",
            borderRadius: 10,
            fontSize: "0.875rem",
            fontWeight: 700,
            marginBottom: 16,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <XCircle size={18} color="#EF4444" />
          <span>{error}</span>
        </div>
      )}

      {/* ── 5. Receipts Table View ───────────────────────────────────── */}
      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 0",
            color: "#FEF08A",
            background: "rgba(15, 23, 42, 0.4)",
            borderRadius: 16,
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <RefreshCw
            size={36}
            className="animate-spin"
            style={{ margin: "0 auto 12px" }}
          />
          <p style={{ fontSize: "1rem", fontWeight: 800, margin: 0 }}>
            Loading player receipts dataset...
          </p>
        </div>
      ) : !filtered.length ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            background: "rgba(15, 23, 42, 0.4)",
            borderRadius: 16,
            border: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <Users size={40} color="#94A3B8" style={{ margin: "0 auto 12px" }} />
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: 800,
              color: "#FFFFFF",
              margin: "0 0 6px",
            }}
          >
            No receipts match your search filters
          </h3>
          <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: "0 0 16px" }}>
            Try adjusting or clearing your search filters to view player receipts.
          </p>
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              style={{
                background: "rgba(253, 224, 71, 0.15)",
                border: "1.5px solid #FDE047",
                color: "#FEF08A",
                padding: "8px 18px",
                borderRadius: 8,
                fontWeight: 800,
                fontSize: "0.8125rem",
                cursor: "pointer",
              }}
            >
              Clear All Filters
            </button>
          )}
        </div>
      ) : (
        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            border: "1.5px solid rgba(255, 255, 255, 0.1)",
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 12px 40px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                textAlign: "left",
                fontSize: "0.875rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "rgba(30, 41, 59, 0.9)",
                    borderBottom: "2px solid rgba(253, 224, 71, 0.3)",
                    color: "#FEF08A",
                    fontSize: "0.75rem",
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "0.5px",
                  }}
                >
                  <th style={{ padding: "14px 16px", width: 40 }}>
                    <input
                      type="checkbox"
                      aria-label="Select all filtered players"
                      disabled={busy || !filtered.length}
                      checked={
                        filtered.length > 0 && chosen.length === filtered.length
                      }
                      onChange={(e) =>
                        setSelected(
                          e.target.checked
                            ? new Set(filtered.map((x) => x._id))
                            : new Set()
                        )
                      }
                      style={{ cursor: "pointer", transform: "scale(1.15)" }}
                    />
                  </th>
                  <th style={{ padding: "14px 16px" }}>Player</th>
                  <th style={{ padding: "14px 16px" }}>Phone</th>
                  <th style={{ padding: "14px 16px" }}>Draw & Pool</th>
                  <th style={{ padding: "14px 16px" }}>Lucky #</th>
                  <th style={{ padding: "14px 16px" }}>Price & Gateway</th>
                  <th style={{ padding: "14px 16px" }}>Reference</th>
                  <th style={{ padding: "14px 16px" }}>Status</th>
                  <th style={{ padding: "14px 16px", textAlign: "right" }}>
                    Receipt Image
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, visibleCount).map((e, idx) => {
                  const isChecked = selected.has(e._id);
                  return (
                    <tr
                      key={e._id}
                      style={{
                        borderTop: "1px solid rgba(255, 255, 255, 0.08)",
                        background: isChecked
                          ? "rgba(253, 224, 71, 0.08)"
                          : idx % 2 === 0
                          ? "rgba(15, 23, 42, 0.3)"
                          : "transparent",
                        transition: "background 0.15s ease",
                      }}
                    >
                      {/* Checkbox */}
                      <td style={{ padding: "12px 16px" }}>
                        <input
                          type="checkbox"
                          disabled={busy}
                          aria-label={`Select ${e.playerName || e._id}`}
                          checked={isChecked}
                          onChange={() =>
                            setSelected((prev) => {
                              const next = new Set(prev);
                              next.has(e._id)
                                ? next.delete(e._id)
                                : next.add(e._id);
                              return next;
                            })
                          }
                          style={{ cursor: "pointer", transform: "scale(1.15)" }}
                        />
                      </td>

                      {/* Player Name */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 800, color: "#FFFFFF" }}>
                          {e.playerName || "Anonymous Player"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.6875rem",
                            color: "#64748B",
                            fontFamily: "monospace",
                          }}
                        >
                          {e._id.slice(0, 14)}...
                        </div>
                      </td>

                      {/* Phone Number */}
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            color: "#E2E8F0",
                            fontFamily: "monospace",
                            fontWeight: 700,
                          }}
                        >
                          <span>{e.playerPhone || "—"}</span>
                          {e.playerPhone && (
                            <button
                              onClick={() =>
                                copyToClipboard(e.playerPhone!, `phone-${e._id}`)
                              }
                              title="Copy phone"
                              style={{
                                background: "transparent",
                                border: "none",
                                color:
                                  copiedId === `phone-${e._id}`
                                    ? "#34D399"
                                    : "#64748B",
                                cursor: "pointer",
                                padding: 2,
                              }}
                            >
                              {copiedId === `phone-${e._id}` ? (
                                <Check size={13} />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          )}
                        </div>
                      </td>

                      {/* Draw & Pool */}
                      <td style={{ padding: "12px 16px" }}>
                        <div
                          style={{
                            display: "inline-block",
                            background: "rgba(255, 255, 255, 0.08)",
                            border: "1px solid rgba(255, 255, 255, 0.15)",
                            borderRadius: 6,
                            padding: "2px 8px",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            color: "#F1F5F9",
                            marginBottom: 2,
                          }}
                        >
                          {e.drawId || "RDL-CMS"}
                        </div>
                        <div style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>
                          {e.poolCapacity ? `${e.poolCapacity} slots` : "1,000 slots"}
                        </div>
                      </td>

                      {/* Lucky Number */}
                      <td style={{ padding: "12px 16px" }}>
                        <span
                          style={{
                            background: "rgba(253, 224, 71, 0.15)",
                            border: "1.5px solid #FDE047",
                            color: "#FEF08A",
                            padding: "4px 10px",
                            borderRadius: 8,
                            fontWeight: 900,
                            fontSize: "0.875rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Hash size={12} color="#FACC15" />
                          {e.luckyNumber || "—"}
                        </span>
                      </td>

                      {/* Price & Gateway */}
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontWeight: 800, color: "#FFFFFF" }}>
                          {e.amount} {e.currency}
                        </div>
                        <div
                          style={{
                            fontSize: "0.6875rem",
                            color: "#94A3B8",
                            textTransform: "uppercase",
                            fontWeight: 700,
                          }}
                        >
                          {e.paymentMethod || "telebirr"}
                        </div>
                      </td>

                      {/* Reference */}
                      <td style={{ padding: "12px 16px" }}>
                        {e.paymentReference ? (
                          <div
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              background: "rgba(0, 0, 0, 0.4)",
                              border: "1px solid rgba(255, 255, 255, 0.12)",
                              borderRadius: 6,
                              padding: "2px 8px",
                              fontFamily: "monospace",
                              fontSize: "0.75rem",
                              color: "#E2E8F0",
                            }}
                          >
                            <span>{e.paymentReference}</span>
                            <button
                              onClick={() =>
                                copyToClipboard(
                                  e.paymentReference!,
                                  `ref-${e._id}`
                                )
                              }
                              title="Copy reference"
                              style={{
                                background: "transparent",
                                border: "none",
                                color:
                                  copiedId === `ref-${e._id}`
                                    ? "#34D399"
                                    : "#64748B",
                                cursor: "pointer",
                                padding: 2,
                              }}
                            >
                              {copiedId === `ref-${e._id}` ? (
                                <Check size={12} />
                              ) : (
                                <Copy size={12} />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span style={{ color: "#64748B" }}>—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td style={{ padding: "12px 16px" }}>
                        {renderStatusBadge(e.status)}
                      </td>

                      {/* Screenshot / Action */}
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        {e.imageUrl ? (
                          <button
                            onClick={() => setPreview(e)}
                            style={{
                              background: "rgba(59, 130, 246, 0.15)",
                              border: "1.5px solid #3B82F6",
                              color: "#93C5FD",
                              borderRadius: 8,
                              padding: "6px 12px",
                              fontSize: "0.75rem",
                              fontWeight: 800,
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 5,
                            }}
                          >
                            <Eye size={13} /> View Proof
                          </button>
                        ) : (
                          <span
                            style={{
                              color: "#64748B",
                              fontSize: "0.75rem",
                              fontWeight: 700,
                            }}
                          >
                            No Image
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          {visibleCount < filtered.length && (
            <div
              style={{
                padding: "16px 20px",
                background: "rgba(30, 41, 59, 0.7)",
                borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                textAlign: "center",
              }}
            >
              <button
                onClick={() => setVisibleCount((n) => n + 100)}
                style={{
                  background: "rgba(253, 224, 71, 0.15)",
                  border: "1.5px solid #FDE047",
                  color: "#FEF08A",
                  borderRadius: 8,
                  padding: "10px 24px",
                  fontSize: "0.875rem",
                  fontWeight: 800,
                  cursor: "pointer",
                }}
              >
                Load Next 100 Receipts ({filtered.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── 6. Interactive Screenshot Lightbox Modal ─────────────────── */}
      {preview && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Payment screenshot"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            backdropFilter: "blur(16px)",
            zIndex: 99999,
            display: "grid",
            placeItems: "center",
            padding: 20,
            boxSizing: "border-box",
          }}
          onClick={() => setPreview(null)}
        >
          <div
            style={{
              maxWidth: "92vw",
              maxHeight: "92vh",
              background: "#0F172A",
              border: "2px solid rgba(253, 224, 71, 0.6)",
              borderRadius: 18,
              boxShadow: "0 24px 80px rgba(0, 0, 0, 0.9)",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "14px 20px",
                background: "rgba(30, 41, 59, 0.95)",
                borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 16,
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 2px", fontSize: "1rem", fontWeight: 800, color: "#FFFFFF" }}>
                  Payment Proof: {preview.playerName || "Player"}
                </h3>
                <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                  {preview.playerPhone} · {preview.amount} {preview.currency} ({preview.paymentMethod}) · Ref: {preview.paymentReference || "N/A"}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {preview.imageUrl && (
                  <a
                    href={preview.imageUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    style={{
                      background: "rgba(16, 185, 129, 0.2)",
                      border: "1px solid #10B981",
                      color: "#6EE7B7",
                      borderRadius: 8,
                      padding: "6px 12px",
                      fontSize: "0.75rem",
                      fontWeight: 800,
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    <Download size={13} /> Download
                  </a>
                )}
                <button
                  onClick={() => setPreview(null)}
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid #EF4444",
                    color: "#FCA5A5",
                    borderRadius: 8,
                    padding: "6px 12px",
                    fontSize: "0.75rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                  }}
                >
                  <X size={14} /> Close
                </button>
              </div>
            </div>

            {/* Modal Image Body */}
            <div
              style={{
                padding: 16,
                overflow: "auto",
                display: "grid",
                placeItems: "center",
                background: "#020617",
                maxHeight: "75vh",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview.imageUrl}
                alt={`Payment receipt for ${preview.playerName}`}
                style={{
                  maxWidth: "80vw",
                  maxHeight: "70vh",
                  objectFit: "contain",
                  borderRadius: 10,
                  boxShadow: "0 8px 30px rgba(0,0,0,0.8)",
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
