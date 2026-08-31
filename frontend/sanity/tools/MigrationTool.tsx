import React, { useState } from "react";
import { useClient } from "sanity";
import { ALL_INITIAL_DOCUMENTS } from "../data/initialContent";

export function MigrationTool() {
  const client = useClient({ apiVersion: "2024-01-01" });
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);
  const [totalCount] = useState(ALL_INITIAL_DOCUMENTS.length);
  const [logs, setLogs] = useState<string[]>([]);

  const handleSync = async () => {
    setStatus("running");
    setProgress(0);
    setLogs(["⏳ Starting content sync to Sanity dataset..."]);

    let completed = 0;
    for (const doc of ALL_INITIAL_DOCUMENTS) {
      try {
        await client.createOrReplace(doc as any);
        completed++;
        setProgress(completed);
        setLogs((prev) => [
          `✅ [${doc._type}] ${doc._id || (doc as any).key || "doc"} synced`,
          ...prev.slice(0, 40),
        ]);
      } catch (err: any) {
        setLogs((prev) => [
          `❌ Error on ${doc._id || doc._type}: ${err.message}`,
          ...prev.slice(0, 40),
        ]);
      }
    }

    setStatus("success");
    setLogs((prev) => [
      `🎉 Migration Finished! Successfully synced ${completed} / ${totalCount} documents to your CMS dataset.`,
      ...prev,
    ]);
  };

  return (
    <div
      style={{
        padding: "32px 24px",
        maxWidth: 900,
        margin: "0 auto",
        fontFamily: "Inter, system-ui, sans-serif",
        color: "#F8FAFC",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, #1E293B 0%, #0F172A 100%)",
          border: "1.5px solid #334155",
          borderRadius: 16,
          padding: "28px 32px",
          boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <span style={{ fontSize: "2rem" }}>🚀</span>
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 800, color: "#FACC15" }}>
              Rimna Content Sync & Migration Tool
            </h2>
            <p style={{ margin: "4px 0 0", color: "#94A3B8", fontSize: "0.875rem" }}>
              Sync all hard-coded website content (tickets, draws, testimonials, sections, translations) directly into your Sanity Studio dataset.
            </p>
          </div>
        </div>

        <div
          style={{
            background: "rgba(250, 204, 21, 0.08)",
            border: "1px solid rgba(250, 204, 21, 0.3)",
            borderRadius: 10,
            padding: "12px 16px",
            margin: "18px 0",
            fontSize: "0.875rem",
            color: "#FEF08A",
            lineHeight: 1.5,
          }}
        >
          💡 <strong>What this does:</strong> Populates <strong>{totalCount} core items</strong> into your CMS:
          <ul style={{ margin: "8px 0 0 18px", padding: 0 }}>
            <li>🎟️ All 11 Lottery Draws (100, 150, 200, 50 Birr + Diaspora $25–$250)</li>
            <li>🌟 3 Featured Hero Jackpot Cards & Promotions</li>
            <li>📝 6 Editable Page Sections (Why Rimna, Live Broadcast, How It Works, Fairness)</li>
            <li>⭐ 4 Customer Testimonials & Winner Quotes</li>
            <li>💬 5 FAQs & Answers</li>
            <li>🌐 Global Site Settings & Complete Multilingual Translations Dictionary</li>
          </ul>
        </div>

        <button
          onClick={handleSync}
          disabled={status === "running"}
          style={{
            background:
              status === "running"
                ? "#475569"
                : "linear-gradient(135deg, #F59E0B 0%, #D97706 100%)",
            color: "#0F172A",
            border: "none",
            borderRadius: 10,
            padding: "14px 28px",
            fontSize: "1rem",
            fontWeight: 800,
            cursor: status === "running" ? "not-allowed" : "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            boxShadow: "0 4px 14px rgba(245, 158, 11, 0.35)",
            transition: "all 0.2s ease",
          }}
        >
          {status === "running" ? (
            <>⏳ Syncing ({progress} / {totalCount})...</>
          ) : status === "success" ? (
            <>🔄 Re-Sync All Content ({totalCount} items)</>
          ) : (
            <>⚡ Sync All Website Content to CMS Now</>
          )}
        </button>

        {status === "running" && (
          <div style={{ marginTop: 20 }}>
            <div
              style={{
                width: "100%",
                height: 8,
                background: "#334155",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(progress / totalCount) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #F59E0B, #10B981)",
                  transition: "width 0.15s ease",
                }}
              />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#94A3B8", marginTop: 6 }}>
              <span>Syncing documents...</span>
              <span>{Math.round((progress / totalCount) * 100)}%</span>
            </div>
          </div>
        )}
      </div>

      {logs.length > 0 && (
        <div
          style={{
            background: "#090D16",
            border: "1px solid #1E293B",
            borderRadius: 12,
            padding: "16px 20px",
            fontSize: "0.8125rem",
            fontFamily: "monospace",
          }}
        >
          <div style={{ fontWeight: 700, color: "#94A3B8", marginBottom: 8 }}>Activity Log:</div>
          <div style={{ maxHeight: 260, overflowY: "auto", display: "flex", flexDirection: "column", gap: 4 }}>
            {logs.map((log, i) => (
              <div key={i} style={{ color: log.startsWith("✅") ? "#34D399" : log.startsWith("❌") ? "#F87171" : "#E2E8F0" }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
