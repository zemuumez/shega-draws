"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useClient } from "sanity";
import {
  collectBackup,
  backupZIP,
  readBackup,
  restoreBackup,
  type PreparedBackup,
} from "@/lib/backup/cms";
import {
  Database,
  Download,
  Upload,
  Archive,
  FileCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Layers,
  FileSpreadsheet,
  HardDrive,
  XCircle,
  Clock,
} from "lucide-react";

function downloadBlob(data: BlobPart, name: string, type: string) {
  const url = URL.createObjectURL(new Blob([data], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
}

export function BackupView() {
  const studioClient = useClient({ apiVersion: "2024-01-01" });
  const client = useMemo(
    () => studioClient.withConfig({ perspective: "raw", useCdn: false }),
    [studioClient]
  );
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [prepared, setPrepared] = useState<PreparedBackup | null>(null);
  const [filename, setFilename] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const selection = useRef(0);

  const refresh = useCallback(async () => {
    const result = await client.fetch(
      `{"Content documents":count(*[!(_type match "sanity.*") && !(_id in path("_.**"))]), "Receipts":count(*[_type=="playerEntry"]), "Translations":count(*[_type=="uiTranslation"]), "Media files":count(*[_type in ["sanity.imageAsset","sanity.fileAsset"]])}`,
      {},
      { perspective: "raw", cache: "no-store" }
    );
    setStats(result);
  }, [client]);

  useEffect(() => {
    void refresh().catch(() =>
      setError("Could not load dataset counts. Check your Studio login and permissions.")
    );
  }, [refresh]);

  async function exportBackup(zip: boolean) {
    setBusy(true);
    setError("");
    setMessage("Collecting dataset documents and media assets...");
    try {
      const backup = await collectBackup(client);
      const stamp = new Date().toISOString().replace(/[:.]/g, "-");
      if (zip) {
        downloadBlob(
          new Uint8Array(
            await backupZIP(
              backup,
              setMessage,
              (url, options) =>
                fetch(url, {
                  ...options,
                  credentials: "include",
                  headers: client.config().token
                    ? { Authorization: `Bearer ${client.config().token}` }
                    : {},
                })
            )
          ),
          `rimna_full_cms_bundle_${stamp}.zip`,
          "application/zip"
        );
      } else {
        downloadBlob(
          JSON.stringify(backup, null, 2),
          `rimna_cms_backup_${stamp}.json`,
          "application/json"
        );
      }
      setMessage(
        `Backup generated: ${backup.documents.length} content documents and ${
          backup.assets.length
        } ${zip ? "media files" : "media references"}.`
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Backup failed. Please retry.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  async function selectFile(file?: File) {
    const attempt = ++selection.current;
    setPrepared(null);
    setConfirmed(false);
    setError("");
    setFilename(file?.name || "");
    if (!file) return;
    setBusy(true);
    setMessage("Validating backup file schema...");
    try {
      if (file.size > 500 * 1024 * 1024)
        throw new Error(
          "This browser restore supports files up to 500 MB. Use Sanity dataset tools for larger archives."
        );
      const parsed = await readBackup(
        await file.arrayBuffer(),
        file.name.toLowerCase().endsWith(".zip")
      );
      if (attempt === selection.current) {
        setPrepared(parsed);
        setMessage("Backup validated. Review contents before restoring.");
      }
    } catch (e) {
      if (attempt === selection.current) {
        setError(e instanceof Error ? e.message : "Invalid backup file.");
        setMessage("");
      }
    } finally {
      if (attempt === selection.current) setBusy(false);
    }
  }

  async function restore() {
    if (!prepared || !confirmed || busy) return;
    setBusy(true);
    setError("");
    setMessage("Restoring dataset documents and checking media...");
    try {
      const total = await restoreBackup(client, prepared, setMessage);
      setMessage(
        `Restore complete: ${total} documents successfully imported & replaced. Unrelated content was preserved.`
      );
      setConfirmed(false);
      await refresh().catch(() =>
        setError(
          "Restore succeeded, but counts could not refresh. Reload Studio to see updated counts."
        )
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Restore failed.");
      setMessage("");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        padding: "clamp(16px, 3vw, 32px)",
        maxWidth: 1100,
        margin: "0 auto",
        color: "#F8FAFC",
        minHeight: "100%",
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        boxSizing: "border-box",
      }}
    >
      {/* ── Header ──────────────────────────────────────────────────── */}
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
            <Sparkles size={13} color="#FACC15" /> CMS DISASTER RECOVERY & ARCHIVE SUITE
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
            CMS Backup & Restoration Manager
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
            Export complete snapshots of all site settings, UI translations, lottery draws, prize results, and player entries.
            Restore previous dataset states in 1-click directly from the browser.
          </p>
        </div>

        <button
          onClick={refresh}
          disabled={busy}
          style={{
            background: "rgba(30, 41, 59, 0.8)",
            border: "1.5px solid rgba(253, 224, 71, 0.4)",
            color: "#FEF08A",
            padding: "10px 18px",
            borderRadius: 10,
            fontWeight: 800,
            fontSize: "0.875rem",
            cursor: busy ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <RefreshCw size={15} /> Refresh Counts
        </button>
      </div>

      {/* ── Live Dataset KPI Stats ──────────────────────────────────── */}
      {stats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 14,
            marginBottom: 28,
          }}
        >
          {Object.entries(stats).map(([name, value]) => (
            <div
              key={name}
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
                  color: "#94A3B8",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  marginBottom: 4,
                }}
              >
                {name}
              </div>
              <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#FEF08A" }}>
                {value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

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
            marginBottom: 20,
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
            marginBottom: 20,
            display: "flex",
            alignItems: "center",
            gap: 10,
          }}
        >
          <XCircle size={18} color="#EF4444" />
          <span>{error}</span>
        </div>
      )}

      {/* ── Export Panels Grid ───────────────────────────────────────── */}
      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: 900,
          color: "#FFFFFF",
          margin: "0 0 14px",
        }}
      >
        1. Export Dataset Backup
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: 18,
          marginBottom: 32,
        }}
      >
        {/* Full ZIP Backup Card */}
        <section
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1.5px solid rgba(253, 224, 71, 0.3)",
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(245, 158, 11, 0.2)",
                  border: "1px solid #F59E0B",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Archive size={20} color="#FDE047" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#FFFFFF" }}>
                Complete ZIP Bundle Archive
              </h3>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.5, margin: "0 0 20px" }}>
              Includes all JSON content records AND full-resolution binary image files (logos, banners, and all player payment proof screenshots). Recommended for cold disaster recovery.
            </p>
          </div>

          <button
            disabled={busy}
            onClick={() => exportBackup(true)}
            style={{
              background: "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
              border: "1px solid #FDE047",
              color: "#111827",
              borderRadius: 10,
              padding: "13px 20px",
              fontWeight: 900,
              fontSize: "0.9375rem",
              cursor: busy ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              boxShadow: "0 4px 14px rgba(245, 158, 11, 0.3)",
            }}
          >
            <Download size={16} /> Download Full ZIP Bundle
          </button>
        </section>

        {/* Content JSON Card */}
        <section
          style={{
            background: "rgba(15, 23, 42, 0.8)",
            border: "1.5px solid rgba(255, 255, 255, 0.12)",
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  background: "rgba(59, 130, 246, 0.2)",
                  border: "1px solid #3B82F6",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FileCode size={20} color="#60A5FA" />
              </div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 900, color: "#FFFFFF" }}>
                Content JSON Snapshot
              </h3>
            </div>
            <p style={{ color: "#94A3B8", fontSize: "0.875rem", lineHeight: 1.5, margin: "0 0 20px" }}>
              Fast, lightweight JSON snapshot containing structured documents, prices, translations, and Sanity cloud asset references.
            </p>
          </div>

          <button
            disabled={busy}
            onClick={() => exportBackup(false)}
            style={{
              background: "rgba(30, 41, 59, 0.9)",
              border: "1.5px solid rgba(255, 255, 255, 0.2)",
              color: "#FFFFFF",
              borderRadius: 10,
              padding: "13px 20px",
              fontWeight: 900,
              fontSize: "0.9375rem",
              cursor: busy ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Download size={16} /> Download JSON Snapshot
          </button>
        </section>
      </div>

      {/* ── Restore Section ──────────────────────────────────────────── */}
      <h2
        style={{
          fontSize: "1.2rem",
          fontWeight: 900,
          color: "#FFFFFF",
          margin: "0 0 14px",
        }}
      >
        2. Restore Dataset from Backup
      </h2>
      <section
        style={{
          background: "rgba(15, 23, 42, 0.8)",
          border: "1.5px solid rgba(253, 224, 71, 0.3)",
          borderRadius: 16,
          padding: 24,
        }}
      >
        <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: "0 0 16px" }}>
          Select a valid Rimna `.json` snapshot or `.zip` archive to restore documents.
          Existing documents with matching IDs will be safely updated and replaced; unrelated content remains intact.
        </p>

        <div style={{ marginBottom: 20 }}>
          <input
            aria-label="Backup file"
            type="file"
            accept=".json,.zip,application/json,application/zip"
            disabled={busy}
            onChange={(e) => void selectFile(e.target.files?.[0])}
            style={{
              padding: "12px",
              background: "rgba(0, 0, 0, 0.4)",
              border: "1.5px dashed rgba(253, 224, 71, 0.4)",
              borderRadius: 10,
              color: "#FEF08A",
              width: "100%",
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          />
        </div>

        {prepared && (
          <div
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 12,
              padding: 18,
              marginTop: 16,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <CheckCircle2 size={16} color="#10B981" />
              <strong style={{ color: "#FFFFFF", fontSize: "0.9375rem" }}>
                {filename}
              </strong>
              <span style={{ color: "#FEF08A", fontSize: "0.8125rem", fontWeight: 800 }}>
                ({prepared.backup.documents.length} docs · {prepared.backup.assets.length} assets)
              </span>
            </div>

            <div style={{ fontSize: "0.8125rem", color: "#94A3B8", marginBottom: 14 }}>
              Target Dataset: <strong style={{ color: "#FEF08A" }}>{client.config().dataset}</strong> (Project: {client.config().projectId})
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "#FCD34D",
                fontSize: "0.8125rem",
                fontWeight: 800,
                marginBottom: 18,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                disabled={busy}
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                style={{ cursor: "pointer", transform: "scale(1.2)" }}
              />
              I understand that documents with matching IDs will be overwritten and replaced.
            </label>

            <button
              disabled={busy || !confirmed || !prepared.backup.documents.length}
              onClick={restore}
              style={{
                background:
                  !confirmed || busy
                    ? "rgba(100, 116, 139, 0.3)"
                    : "linear-gradient(135deg, #10B981 0%, #059669 100%)",
                border: "1px solid #10B981",
                color: "#FFFFFF",
                borderRadius: 10,
                padding: "12px 22px",
                fontWeight: 900,
                fontSize: "0.875rem",
                cursor: !confirmed || busy ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <Upload size={16} />
              {busy ? "Restoring Dataset..." : "Confirm & Restore Backup"}
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
