"use client";

import React, { useState, useEffect, useCallback } from "react";
import JSZip from "jszip";

interface ScreenshotItem {
  _id: string;
  playerName: string;
  playerPhone: string;
  drawId?: string;
  luckyNumber?: string;
  poolCapacity?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  submittedAt?: string;
  status?: "pending" | "confirmed" | "rejected";
  assetId?: string;
  imageUrl?: string;
  assetSize?: number;
  mimeType?: string;
  originalFilename?: string;
}

interface StatsData {
  draws: string[];
  poolSizes: string[];
  prices: number[];
  totalStorageBytes: number;
}

export function ScreenshotManagerTool() {
  const [items, setItems] = useState<ScreenshotItem[]>([]);
  const [stats, setStats] = useState<StatsData>({
    draws: [],
    poolSizes: [],
    prices: [],
    totalStorageBytes: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Filters
  const [selectedDraw, setSelectedDraw] = useState<string>("all");
  const [selectedPool, setSelectedPool] = useState<string>("all");
  const [selectedPrice, setSelectedPrice] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Selection for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Lightbox preview modal
  const [previewImage, setPreviewImage] = useState<{ url: string; title: string } | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDraw !== "all") params.set("drawId", selectedDraw);
      if (selectedPool !== "all") params.set("poolCapacity", selectedPool);
      if (selectedPrice !== "all") params.set("amount", selectedPrice);
      if (selectedStatus !== "all") params.set("status", selectedStatus);

      const res = await fetch(`/api/admin/screenshots?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.entries || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (err: any) {
      console.error("Error loading screenshots:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedDraw, selectedPool, selectedPrice, selectedStatus]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const toggleSelectAll = () => {
    if (selectedIds.size === items.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((i) => i._id)));
    }
  };

  const toggleSelectItem = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  // Bulk Download using JSZip
  const handleBulkDownload = async (targetItems: ScreenshotItem[]) => {
    if (targetItems.length === 0) {
      alert("No screenshots selected or matching current filter to download.");
      return;
    }

    const itemsWithImages = targetItems.filter((i) => i.imageUrl);
    if (itemsWithImages.length === 0) {
      alert("None of the selected entries have an uploaded screenshot image.");
      return;
    }

    setActionLoading(true);
    setActionMessage(`Downloading and packaging ${itemsWithImages.length} screenshots into ZIP...`);

    try {
      const zip = new JSZip();
      const folder = zip.folder("rimna_payment_screenshots");

      let count = 0;
      for (const item of itemsWithImages) {
        if (!item.imageUrl) continue;
        try {
          const resp = await fetch(item.imageUrl);
          const blob = await resp.blob();
          const ext = item.mimeType?.includes("png") ? "png" : item.mimeType?.includes("webp") ? "webp" : "jpg";
          const filename = `${item.drawId || "DRAW"}_${item.luckyNumber || "NUM"}_${item.playerName.replace(/[^a-zA-Z0-9]/g, "_")}_${item._id.slice(0, 8)}.${ext}`;
          folder?.file(filename, blob);
          count++;
          setActionMessage(`Packaging ${count} / ${itemsWithImages.length} images...`);
        } catch (fetchErr) {
          console.warn("Failed to fetch image for zip:", item.imageUrl);
        }
      }

      const zipContent = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipContent);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const dateStr = new Date().toISOString().slice(0, 10);
      link.download = `rimna_screenshots_${selectedDraw !== "all" ? selectedDraw : "bulk"}_${dateStr}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      setActionMessage(`🎉 Successfully downloaded ${count} screenshots!`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert(`ZIP Download failed: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Bulk Delete
  const handleBulkDelete = async (payload: { ids?: string[]; drawId?: string; poolCapacity?: string; amount?: string }) => {
    const isIds = payload.ids && payload.ids.length > 0;
    const confirmPrompt = isIds
      ? `Permanently delete ${payload.ids?.length} selected receipts AND purge their image files from Sanity storage? This cannot be undone.`
      : `Permanently delete all receipts matching this filter and delete their image assets to free server storage? This cannot be undone.`;

    if (!window.confirm(confirmPrompt)) return;

    setActionLoading(true);
    setActionMessage("Deleting documents and purging image assets from storage...");

    try {
      const res = await fetch("/api/admin/screenshots", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          deleteAssets: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        setSelectedIds(new Set());
        await fetchData();
        setTimeout(() => setActionMessage(null), 5000);
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err: any) {
      alert(`Error during deletion: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatBytes = (bytes: number) => {
    if (!bytes || bytes === 0) return "0 MB";
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div
      style={{
        padding: "24px",
        maxWidth: 1300,
        margin: "0 auto",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#F8FAFC",
        minHeight: "100vh",
      }}
    >
      {/* Lightbox Modal */}
      {previewImage && (
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.85)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1E293B",
              borderRadius: 16,
              padding: 16,
              maxWidth: 700,
              width: "100%",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
              border: "1.5px solid #FDE047",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontWeight: 800, color: "#FEF08A", fontSize: "0.9375rem" }}>{previewImage.title}</div>
              <button
                onClick={() => setPreviewImage(null)}
                style={{
                  background: "#334155",
                  border: "none",
                  borderRadius: "50%",
                  width: 32,
                  height: 32,
                  color: "#FFFFFF",
                  cursor: "pointer",
                  fontWeight: 900,
                }}
              >
                ✕
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage.url}
              alt="Payment proof high resolution"
              style={{
                width: "100%",
                maxHeight: "70vh",
                objectFit: "contain",
                borderRadius: 8,
                background: "#0F172A",
              }}
            />
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          border: "1.5px solid #334155",
          borderRadius: 16,
          padding: "24px 28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          marginBottom: 20,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.75rem" }}>📸</span>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: "#FDE047", letterSpacing: "-0.5px" }}>
                Screenshot & Storage Manager
              </h1>
            </div>
            <p style={{ margin: "6px 0 0 0", color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.5 }}>
              Manage, filter, bulk download receipts as ZIP, and permanently delete screenshot assets from completed draws or specific pools to save server disk and cloud storage.
            </p>
          </div>

          {/* Storage Metric Pill */}
          <div
            style={{
              background: "rgba(253, 224, 71, 0.1)",
              border: "1.5px solid #FDE047",
              borderRadius: 12,
              padding: "10px 18px",
              textAlign: "right",
            }}
          >
            <div style={{ fontSize: "0.6875rem", color: "#FEF08A", fontWeight: 800, textTransform: "uppercase" }}>
              Total Storage In Use
            </div>
            <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#FFFFFF" }}>
              {formatBytes(stats.totalStorageBytes)}
            </div>
          </div>
        </div>
      </div>

      {/* Action Notification Banner */}
      {actionMessage && (
        <div
          style={{
            background: "linear-gradient(90deg, #1E3A8A 0%, #1D4ED8 100%)",
            border: "1px solid #60A5FA",
            borderRadius: 12,
            padding: "12px 20px",
            color: "#EFF6FF",
            fontWeight: 700,
            fontSize: "0.875rem",
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{actionMessage}</span>
          {actionLoading && <span className="animate-spin">⏳</span>}
        </div>
      )}

      {/* Filter & Bulk Action Toolbar */}
      <div
        style={{
          background: "#1E293B",
          border: "1px solid #334155",
          borderRadius: 14,
          padding: "16px 20px",
          marginBottom: 20,
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Filter Dropdowns */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          {/* Draw Filter */}
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", color: "#94A3B8", fontWeight: 700, marginBottom: 4 }}>
              FILTER BY DRAW
            </label>
            <select
              value={selectedDraw}
              onChange={(e) => setSelectedDraw(e.target.value)}
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                border: "1px solid #475569",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              <option value="all">All Draws</option>
              {stats.draws.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Pool Size Filter */}
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", color: "#94A3B8", fontWeight: 700, marginBottom: 4 }}>
              FILTER BY POOL SIZE
            </label>
            <select
              value={selectedPool}
              onChange={(e) => setSelectedPool(e.target.value)}
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                border: "1px solid #475569",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              <option value="all">All Pool Sizes</option>
              {stats.poolSizes.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Price Filter */}
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", color: "#94A3B8", fontWeight: 700, marginBottom: 4 }}>
              FILTER BY PRICE TIER
            </label>
            <select
              value={selectedPrice}
              onChange={(e) => setSelectedPrice(e.target.value)}
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                border: "1px solid #475569",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              <option value="all">All Prices</option>
              {stats.prices.map((pr) => (
                <option key={pr} value={pr.toString()}>
                  {pr}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label style={{ display: "block", fontSize: "0.6875rem", color: "#94A3B8", fontWeight: 700, marginBottom: 4 }}>
              FILTER BY STATUS
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                border: "1px solid #475569",
                borderRadius: 8,
                padding: "6px 12px",
                fontSize: "0.8125rem",
                fontWeight: 700,
              }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">🟡 Pending Verification</option>
              <option value="confirmed">🟢 Confirmed</option>
              <option value="rejected">🔴 Rejected</option>
            </select>
          </div>
        </div>

        {/* Bulk Action Buttons */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          {/* Download Filtered ZIP */}
          <button
            type="button"
            disabled={actionLoading || items.length === 0}
            onClick={() => {
              const targets = selectedIds.size > 0 ? items.filter((i) => selectedIds.has(i._id)) : items;
              handleBulkDownload(targets);
            }}
            style={{
              background: "#10B981",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              color: "#FFFFFF",
              fontSize: "0.8125rem",
              fontWeight: 800,
              cursor: actionLoading || items.length === 0 ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              opacity: items.length === 0 ? 0.6 : 1,
            }}
          >
            📦 Download {selectedIds.size > 0 ? `Selected (${selectedIds.size})` : "All"} as ZIP
          </button>

          {/* Delete Selected or Filtered */}
          {selectedIds.size > 0 ? (
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => handleBulkDelete({ ids: Array.from(selectedIds) })}
              style={{
                background: "#EF4444",
                border: "none",
                borderRadius: 8,
                padding: "8px 16px",
                color: "#FFFFFF",
                fontSize: "0.8125rem",
                fontWeight: 800,
                cursor: actionLoading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              🗑️ Delete {selectedIds.size} Selected & Purge Storage
            </button>
          ) : (
            selectedDraw !== "all" || selectedPool !== "all" || selectedPrice !== "all" ? (
              <button
                type="button"
                disabled={actionLoading || items.length === 0}
                onClick={() =>
                  handleBulkDelete({
                    drawId: selectedDraw,
                    poolCapacity: selectedPool,
                    amount: selectedPrice,
                  })
                }
                style={{
                  background: "#DC2626",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  color: "#FFFFFF",
                  fontSize: "0.8125rem",
                  fontWeight: 800,
                  cursor: actionLoading || items.length === 0 ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  opacity: items.length === 0 ? 0.6 : 1,
                }}
              >
                🗑️ Purge All in Filter ({items.length}) & Free Storage
              </button>
            ) : null
          )}
        </div>
      </div>

      {/* Items Table / Cards */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#94A3B8" }}>
          <div style={{ fontSize: "1.5rem", marginBottom: 10 }}>⏳</div>
          Loading player receipts and screenshots...
        </div>
      ) : items.length === 0 ? (
        <div
          style={{
            background: "#1E293B",
            border: "1px dashed #475569",
            borderRadius: 16,
            padding: "48px 24px",
            textAlign: "center",
            color: "#94A3B8",
          }}
        >
          <div style={{ fontSize: "2rem", marginBottom: 8 }}>📭</div>
          <div style={{ fontSize: "1.125rem", fontWeight: 800, color: "#F8FAFC" }}>No Screenshot Receipts Found</div>
          <p style={{ fontSize: "0.875rem", margin: "6px 0 0 0" }}>
            No player entries match the selected filters ({selectedDraw}, {selectedPool}, {selectedPrice}, {selectedStatus}).
          </p>
        </div>
      ) : (
        <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 16, overflow: "hidden" }}>
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "40px 100px 1.5fr 1fr 1fr 100px 100px 110px",
              padding: "12px 18px",
              background: "#0F172A",
              borderBottom: "1px solid #334155",
              fontSize: "0.6875rem",
              fontWeight: 900,
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              alignItems: "center",
            }}
          >
            <div>
              <input
                type="checkbox"
                checked={selectedIds.size === items.length && items.length > 0}
                onChange={toggleSelectAll}
                style={{ cursor: "pointer" }}
              />
            </div>
            <div>Proof</div>
            <div>Player / Phone</div>
            <div>Draw ID</div>
            <div>Pool / Number</div>
            <div>Amount</div>
            <div>Status</div>
            <div style={{ textAlign: "right" }}>Action</div>
          </div>

          {/* Table Body */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {items.map((item) => {
              const isSelected = selectedIds.has(item._id);
              const statusColor =
                item.status === "confirmed" ? "#10B981" : item.status === "rejected" ? "#EF4444" : "#F59E0B";

              return (
                <div
                  key={item._id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "40px 100px 1.5fr 1fr 1fr 100px 100px 110px",
                    padding: "12px 18px",
                    borderBottom: "1px solid #334155",
                    background: isSelected ? "rgba(253, 224, 71, 0.05)" : "transparent",
                    alignItems: "center",
                    fontSize: "0.8125rem",
                    transition: "background 150ms ease",
                  }}
                >
                  <div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectItem(item._id)}
                      style={{ cursor: "pointer" }}
                    />
                  </div>

                  {/* Screenshot Thumbnail */}
                  <div>
                    {item.imageUrl ? (
                      <button
                        type="button"
                        onClick={() =>
                          setPreviewImage({
                            url: item.imageUrl!,
                            title: `Screenshot: ${item.playerName} (#${item.luckyNumber})`,
                          })
                        }
                        style={{
                          background: "none",
                          border: "1.5px solid #FDE047",
                          borderRadius: 8,
                          padding: 0,
                          cursor: "pointer",
                          overflow: "hidden",
                          display: "inline-block",
                          width: 52,
                          height: 52,
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.imageUrl}
                          alt="Thumbnail"
                          style={{ width: "100%", height: "100%", objectFit: "cover" }}
                        />
                      </button>
                    ) : (
                      <span style={{ fontSize: "0.6875rem", color: "#64748B" }}>No image</span>
                    )}
                  </div>

                  {/* Player Name & Phone */}
                  <div>
                    <div style={{ fontWeight: 800, color: "#FFFFFF" }}>{item.playerName}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>{item.playerPhone}</div>
                  </div>

                  {/* Draw ID */}
                  <div>
                    <span
                      style={{
                        background: "#0F172A",
                        border: "1px solid #334155",
                        borderRadius: 6,
                        padding: "3px 8px",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "#FEF08A",
                      }}
                    >
                      {item.drawId || "N/A"}
                    </span>
                  </div>

                  {/* Pool & Lucky Number */}
                  <div>
                    <div style={{ fontWeight: 800, color: "#FDE047" }}>#{item.luckyNumber || "??"}</div>
                    <div style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>{item.poolCapacity || "Standard"}</div>
                  </div>

                  {/* Amount Paid */}
                  <div style={{ fontWeight: 800, color: "#34D399" }}>
                    {item.amount || 0} {item.currency || "ETB"}
                  </div>

                  {/* Status */}
                  <div>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 8px",
                        borderRadius: 6,
                        fontSize: "0.6875rem",
                        fontWeight: 900,
                        textTransform: "uppercase",
                        background: `${statusColor}20`,
                        color: statusColor,
                        border: `1px solid ${statusColor}`,
                      }}
                    >
                      {item.status || "pending"}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    {item.imageUrl && (
                      <a
                        href={item.imageUrl}
                        download
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          background: "#334155",
                          border: "none",
                          borderRadius: 6,
                          padding: "5px 8px",
                          color: "#F8FAFC",
                          fontSize: "0.6875rem",
                          fontWeight: 700,
                          textDecoration: "none",
                        }}
                      >
                        ⬇️
                      </a>
                    )}
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => handleBulkDelete({ ids: [item._id] })}
                      style={{
                        background: "rgba(239, 68, 68, 0.2)",
                        border: "1px solid #EF4444",
                        borderRadius: 6,
                        padding: "4px 8px",
                        color: "#FCA5A5",
                        fontSize: "0.6875rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
