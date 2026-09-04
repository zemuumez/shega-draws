"use client";

import React, { useState, useEffect } from "react";
import { useClient } from "sanity";
import JSZip from "jszip";

interface BackupStats {
  siteSettings: number;
  draws: number;
  drawResults: number;
  playerEntries: number;
  advertisements: number;
  testimonials: number;
  contactMessages: number;
  totalDocuments: number;
}

export function BackupView() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [stats, setStats] = useState<BackupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);
  const [lastBackupTime, setLastBackupTime] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
    const savedLast = localStorage.getItem("rimna_last_backup_time");
    if (savedLast) setLastBackupTime(savedLast);
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const query = `{
        "siteSettings": count(*[_type == "siteSettings"]),
        "draws": count(*[_type == "draw"]),
        "drawResults": count(*[_type == "drawResult"]),
        "playerEntries": count(*[_type == "playerEntry"]),
        "advertisements": count(*[_type == "advertisement"]),
        "testimonials": count(*[_type == "testimonial"]),
        "contactMessages": count(*[_type == "contactMessage"]),
        "totalDocuments": count(*[!(_type match "sanity.*")])
      }`;
      const res = await client.fetch(query);
      setStats(res);
    } catch (err: any) {
      console.error("Failed to load backup stats:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Export Complete Dataset to JSON
  const handleExportJSON = async () => {
    setExporting(true);
    setExportMessage("Fetching all CMS documents from Sanity Content Lake...");

    try {
      // Fetch all non-system documents
      const allDocs = await client.fetch(`*[!(_type match "sanity.*")]`);

      const backupPayload = {
        platform: "Rimna International Digital Lottery",
        version: "2.4.0",
        exportedAt: new Date().toISOString(),
        dataset: client.config().dataset || "production",
        totalDocuments: allDocs.length,
        documents: allDocs,
      };

      const jsonStr = JSON.stringify(backupPayload, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `rimna_cms_backup_${timestamp}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      const now = new Date().toLocaleString();
      setLastBackupTime(now);
      localStorage.setItem("rimna_last_backup_time", now);

      setExportMessage(`🎉 Complete CMS Backup saved successfully (${allDocs.length} documents)!`);
      setTimeout(() => setExportMessage(null), 5000);
    } catch (err: any) {
      alert(`Export failed: ${err.message}`);
      setExportMessage(null);
    } finally {
      setExporting(false);
    }
  };

  // 2. Export Full Bundle with Media References (ZIP)
  const handleExportZIP = async () => {
    setExporting(true);
    setExportMessage("Generating comprehensive ZIP backup bundle with media assets...");

    try {
      const allDocs = await client.fetch(`*[!(_type match "sanity.*")] {
        ...,
        "resolvedImageUrl": select(
          defined(proofScreenshot.asset) => proofScreenshot.asset->url,
          defined(logoImage.asset) => logoImage.asset->url,
          defined(heroBannerImage.asset) => heroBannerImage.asset->url,
          defined(bannerImage.asset) => bannerImage.asset->url,
          defined(avatar.asset) => avatar.asset->url,
          null
        )
      }`);

      const zip = new JSZip();
      const backupPayload = {
        platform: "Rimna International Digital Lottery",
        version: "2.4.0",
        exportedAt: new Date().toISOString(),
        dataset: client.config().dataset || "production",
        totalDocuments: allDocs.length,
        documents: allDocs,
      };

      zip.file("cms_data_snapshot.json", JSON.stringify(backupPayload, null, 2));

      // Add README inside ZIP
      zip.file(
        "README_BACKUP.txt",
        `Rimna Digital Lottery - Full CMS Dataset Backup\nGenerated: ${new Date().toISOString()}\nTotal Documents: ${allDocs.length}\nDataset: ${client.config().dataset || "production"}\n`
      );

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const downloadUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.download = `rimna_full_cms_bundle_${timestamp}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(downloadUrl);

      const now = new Date().toLocaleString();
      setLastBackupTime(now);
      localStorage.setItem("rimna_last_backup_time", now);

      setExportMessage(`🎉 Complete CMS Bundle (.ZIP) downloaded successfully!`);
      setTimeout(() => setExportMessage(null), 5000);
    } catch (err: any) {
      alert(`ZIP Export failed: ${err.message}`);
      setExportMessage(null);
    } finally {
      setExporting(false);
    }
  };

  // 3. Restore Dataset from JSON Backup File
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoreDocs, setRestoreDocs] = useState<any[] | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreProgress, setRestoreProgress] = useState(0);
  const [restoreTotal, setRestoreTotal] = useState(0);
  const [restoreLogs, setRestoreLogs] = useState<string[]>([]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setRestoreFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        const docs = Array.isArray(parsed) ? parsed : parsed.documents || [];
        if (!Array.isArray(docs) || docs.length === 0) {
          alert("Invalid backup file: No documents found in JSON.");
          setRestoreDocs(null);
          return;
        }
        setRestoreDocs(docs);
        setRestoreLogs([`📁 Loaded ${file.name} with ${docs.length} documents ready to restore.`]);
      } catch (err: any) {
        alert(`Failed to parse backup JSON: ${err.message}`);
        setRestoreDocs(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = async () => {
    if (!restoreDocs || restoreDocs.length === 0) return;

    const confirmed = window.confirm(
      `Are you sure you want to restore ${restoreDocs.length} documents to your active CMS dataset? Existing documents with matching IDs will be updated.`
    );
    if (!confirmed) return;

    setRestoring(true);
    setRestoreProgress(0);
    setRestoreTotal(restoreDocs.length);
    setRestoreLogs(["⏳ Starting restoration to Sanity Content Lake..."]);

    let completed = 0;
    for (const doc of restoreDocs) {
      if (!doc._type || doc._type.startsWith("sanity.")) {
        continue;
      }
      try {
        await client.createOrReplace(doc);
        completed++;
        setRestoreProgress(completed);
        setRestoreLogs((prev) => [
          `✅ [${doc._type}] ${doc._id || "doc"} restored`,
          ...prev.slice(0, 30),
        ]);
      } catch (err: any) {
        setRestoreLogs((prev) => [
          `❌ Error restoring ${doc._id || doc._type}: ${err.message}`,
          ...prev.slice(0, 30),
        ]);
      }
    }

    setRestoring(false);
    setRestoreLogs((prev) => [
      `🎉 Restoration Complete! Successfully restored ${completed} documents to your CMS.`,
      ...prev,
    ]);
    await fetchStats();
  };

  return (
    <div
      style={{
        padding: "32px 24px",
        maxWidth: 960,
        margin: "0 auto",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#F8FAFC",
      }}
    >
      {/* Header Banner */}
      <div
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          border: "1.5px solid #334155",
          borderRadius: 16,
          padding: "24px 28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: "1.75rem" }}>💾</span>
              <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 900, color: "#FDE047", letterSpacing: "-0.5px" }}>
                CMS Complete Backup & Restore Manager
              </h1>
            </div>
            <p style={{ margin: "6px 0 0 0", color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.5 }}>
              Export an instant snapshot of your entire CMS dataset (settings, lottery pools, pricing models, receipts, active draws, results, ads, testimonials) or restore your dataset from a backup file in 1 click.
            </p>
          </div>

          {lastBackupTime && (
            <div
              style={{
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid #10B981",
                borderRadius: 10,
                padding: "8px 14px",
                fontSize: "0.75rem",
                color: "#6EE7B7",
                fontWeight: 700,
              }}
            >
              Last Backup: {lastBackupTime}
            </div>
          )}
        </div>
      </div>

      {/* Action Notification Banner */}
      {exportMessage && (
        <div
          style={{
            background: "linear-gradient(90deg, #065F46 0%, #047857 100%)",
            border: "1px solid #34D399",
            borderRadius: 12,
            padding: "14px 20px",
            color: "#FFFFFF",
            fontWeight: 800,
            fontSize: "0.875rem",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{exportMessage}</span>
          {exporting && <span className="animate-spin">⏳</span>}
        </div>
      )}

      {/* Dataset Statistics Grid */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
          📊 Live Dataset Content Breakdown
        </h2>

        {loading ? (
          <div style={{ textAlign: "center", padding: "30px 0", color: "#94A3B8" }}>
            Calculating dataset statistics...
          </div>
        ) : stats ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 14,
            }}
          >
            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 700 }}>Total Documents</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#FDE047", marginTop: 4 }}>
                {stats.totalDocuments}
              </div>
            </div>

            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 700 }}>Submitted Receipts</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#60A5FA", marginTop: 4 }}>
                {stats.playerEntries}
              </div>
            </div>

            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 700 }}>Active Draws & Results</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#34D399", marginTop: 4 }}>
                {stats.draws + stats.drawResults}
              </div>
            </div>

            <div style={{ background: "#1E293B", border: "1px solid #334155", borderRadius: 12, padding: "16px" }}>
              <div style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 700 }}>Ads & Testimonials</div>
              <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#F472B6", marginTop: 4 }}>
                {stats.advertisements + stats.testimonials}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {/* Backup Export Action Cards */}
      <h2 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
        ⬇️ 1. Export & Download Backup
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20, marginBottom: 36 }}>
        {/* JSON Backup Card */}
        <div
          style={{
            background: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
            border: "1.5px solid #FDE047",
            borderRadius: 16,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: "1.25rem" }}>📄</span>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 800, color: "#FFFFFF" }}>
                Complete JSON Backup
              </h3>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: 20 }}>
              Generates a clean, structured JSON file containing all platform settings, lottery pools, pricing models, receipts, and winner history. Ideal for quick archiving or migrations.
            </p>
          </div>

          <button
            type="button"
            disabled={exporting}
            onClick={handleExportJSON}
            style={{
              background: "linear-gradient(90deg, #FDE047 0%, #F59E0B 100%)",
              border: "none",
              borderRadius: 10,
              padding: "12px 20px",
              color: "#111827",
              fontSize: "0.875rem",
              fontWeight: 900,
              cursor: exporting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(234, 179, 8, 0.3)",
              transition: "transform 120ms ease",
            }}
          >
            <span>⬇️</span> Download Full JSON Backup
          </button>
        </div>

        {/* ZIP Archive Card */}
        <div
          style={{
            background: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
            border: "1.5px solid #334155",
            borderRadius: 16,
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <span style={{ fontSize: "1.25rem" }}>📦</span>
              <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 800, color: "#FFFFFF" }}>
                Full ZIP Archive Bundle
              </h3>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: 20 }}>
              Bundles the complete JSON dataset along with metadata documentation and media references into a single zipped archive for cold storage backups.
            </p>
          </div>

          <button
            type="button"
            disabled={exporting}
            onClick={handleExportZIP}
            style={{
              background: "#334155",
              border: "1px solid #475569",
              borderRadius: 10,
              padding: "12px 20px",
              color: "#F8FAFC",
              fontSize: "0.875rem",
              fontWeight: 900,
              cursor: exporting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              transition: "transform 120ms ease",
            }}
          >
            <span>📦</span> Download Full ZIP Archive
          </button>
        </div>
      </div>

      {/* 2. Restore from Backup Section */}
      <h2 style={{ fontSize: "0.9375rem", fontWeight: 800, color: "#60A5FA", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 12 }}>
        🔄 2. Restore Dataset from Backup File
      </h2>
      <div
        style={{
          background: "linear-gradient(180deg, #1E293B 0%, #0F172A 100%)",
          border: "1.5px solid #3B82F6",
          borderRadius: 16,
          padding: "24px 28px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
          <span style={{ fontSize: "1.25rem" }}>📂</span>
          <h3 style={{ margin: 0, fontSize: "1.125rem", fontWeight: 800, color: "#FFFFFF" }}>
            Upload & Restore JSON Backup
          </h3>
        </div>
        <p style={{ color: "#94A3B8", fontSize: "0.8125rem", lineHeight: 1.5, marginBottom: 16 }}>
          Select any previously exported JSON backup file (`rimna_cms_backup_*.json`). The system will parse the documents and safely restore them into your active Sanity dataset.
        </p>

        {/* File Input Box */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 20 }}>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleFileSelect}
            style={{
              background: "#0F172A",
              border: "1px solid #475569",
              borderRadius: 8,
              padding: "10px 14px",
              color: "#F8FAFC",
              fontSize: "0.8125rem",
              cursor: "pointer",
            }}
          />

          {restoreDocs && (
            <button
              type="button"
              disabled={restoring}
              onClick={handleExecuteRestore}
              style={{
                background: "linear-gradient(90deg, #2563EB 0%, #1D4ED8 100%)",
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                color: "#FFFFFF",
                fontSize: "0.875rem",
                fontWeight: 900,
                cursor: restoring ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 12px rgba(37, 99, 235, 0.4)",
              }}
            >
              {restoring ? "⏳ Restoring..." : `🚀 Restore ${restoreDocs.length} Documents Now`}
            </button>
          )}
        </div>

        {/* Progress Bar if Restoring */}
        {restoring && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", fontWeight: 700, color: "#60A5FA", marginBottom: 6 }}>
              <span>Restoring Dataset...</span>
              <span>
                {restoreProgress} / {restoreTotal} ({Math.round((restoreProgress / (restoreTotal || 1)) * 100)}%)
              </span>
            </div>
            <div style={{ background: "#0F172A", borderRadius: 8, height: 10, overflow: "hidden", border: "1px solid #334155" }}>
              <div
                style={{
                  background: "linear-gradient(90deg, #3B82F6 0%, #60A5FA 100%)",
                  height: "100%",
                  width: `${(restoreProgress / (restoreTotal || 1)) * 100}%`,
                  transition: "width 150ms ease",
                }}
              />
            </div>
          </div>
        )}

        {/* Live Logs */}
        {restoreLogs.length > 0 && (
          <div
            style={{
              background: "#0B0F17",
              border: "1px solid #1E293B",
              borderRadius: 10,
              padding: "12px 16px",
              fontFamily: "monospace",
              fontSize: "0.75rem",
              color: "#CBD5E1",
              maxHeight: 160,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 4,
            }}
          >
            {restoreLogs.map((log, index) => (
              <div key={index}>{log}</div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
