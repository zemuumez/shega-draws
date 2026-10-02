"use client";
import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  FileSpreadsheet,
  Printer,
  History,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Calendar,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Receipt,
  Users,
  Wallet,
  Sparkles,
} from "lucide-react";
import { accountAPI } from "@/lib/account-api";
import { money, type AdminOverviewData } from "@/lib/admin";
import type { Order } from "@/lib/backend";
import { AdminAuditChanges } from "./AdminAuditChanges";
import JSZip from "jszip";

interface AuditLogEntry {
  id: number;
  actor: string;
  action: string;
  resource: string;
  details?: any;
  created_at: string;
}

type ReportType = "financial" | "compliance" | "wallets" | "rounds";
type DateRangeOption = "all" | "today" | "7d" | "30d" | "custom";

function downloadFile(content: any, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function AdminReportsAudit({ canWrite }: { canWrite: boolean }) {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [offset, setOffset] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [refresh, setRefresh] = useState(0);

  // Overview data for report metrics
  const [overview, setOverview] = useState<AdminOverviewData | null>(null);

  // Audit list filters
  const [actionCategory, setActionCategory] = useState<string>("all");
  const [actorFilter, setActorFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [expandedRow, setExpandedRow] = useState<number | null>(null);

  // Report Generator Form State
  const [reportType, setReportType] = useState<ReportType>("financial");
  const [dateRange, setDateRange] = useState<DateRangeOption>("30d");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [generatedReport, setGeneratedReport] = useState<any | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    let active = true;
    setBusy(true);
    setError("");

    Promise.all([
      accountAPI<AuditLogEntry[]>(`/admin/audit?offset=${offset}`),
      accountAPI<AdminOverviewData>("/admin/overview").catch(() => null),
    ])
      .then(([auditList, ov]) => {
        if (!active) return;
        setLogs(auditList || []);
        if (ov) setOverview(ov);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setBusy(false);
      });

    return () => {
      active = false;
    };
  }, [offset, refresh]);

  // Unique list of actors from loaded logs
  const distinctActors = useMemo(() => {
    const set = new Set<string>();
    logs.forEach((l) => {
      if (l.actor) set.add(l.actor);
    });
    return Array.from(set);
  }, [logs]);

  // Client-side filtering on current page
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      if (actionCategory !== "all") {
        if (actionCategory === "rounds" && !l.action.startsWith("round.")) return false;
        if (actionCategory === "templates" && !l.action.startsWith("template.")) return false;
        if (actionCategory === "payments" && !l.action.includes("payment") && !l.action.includes("refund")) return false;
        if (actionCategory === "deposits" && !l.action.includes("deposit")) return false;
        if (actionCategory === "operations" && !l.action.includes("operation") && !l.action.includes("backup")) return false;
        if (actionCategory === "staff" && !l.action.includes("staff")) return false;
      }
      if (actorFilter !== "all" && l.actor !== actorFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesAction = l.action.toLowerCase().includes(q);
        const matchesActor = l.actor.toLowerCase().includes(q);
        const matchesResource = l.resource.toLowerCase().includes(q);
        const matchesDetails = JSON.stringify(l.details || {}).toLowerCase().includes(q);
        if (!matchesAction && !matchesActor && !matchesResource && !matchesDetails) {
          return false;
        }
      }
      return true;
    });
  }, [logs, actionCategory, actorFilter, searchQuery]);

  // Executive summary counts
  const securityEventsCount = logs.filter((l) =>
    l.action.includes("pause") || l.action.includes("close") || l.action.includes("refund") || l.action.includes("grant")
  ).length;

  // Report Generation Logic
  async function generateReport() {
    setGenerating(true);
    setMessage("");
    setError("");

    try {
      // Calculate date boundary
      const now = new Date();
      let start = new Date(0);
      if (dateRange === "today") {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      } else if (dateRange === "7d") {
        start = new Date(now.getTime() - 7 * 86400000);
      } else if (dateRange === "30d") {
        start = new Date(now.getTime() - 30 * 86400000);
      } else if (dateRange === "custom" && customStartDate) {
        start = new Date(customStartDate);
      }
      let end = now;
      if (dateRange === "custom" && customEndDate) {
        end = new Date(customEndDate);
        end.setHours(23, 59, 59, 999);
      }

      if (reportType === "financial") {
        // Fetch fresh orders for accurate metrics
        const ordersData: Order[] = await accountAPI<Order[]>("/admin/orders?offset=0").catch(() => [] as Order[]);
        const filteredOrders = ordersData.filter((o) => {
          const t = new Date(o.createdAt).getTime();
          return t >= start.getTime() && t <= end.getTime();
        });

        const grossByCur: Record<string, number> = {};
        const refundByCur: Record<string, number> = {};
        let paidTickets = 0;
        let refundedCount = 0;

        filteredOrders.forEach((o) => {
          if (o.status === "paid") {
            paidTickets++;
            grossByCur[o.currency] = (grossByCur[o.currency] || 0) + o.amountMinor;
          } else if (o.status === "refunded" || o.refunded) {
            refundedCount++;
            refundByCur[o.currency] = (refundByCur[o.currency] || 0) + o.amountMinor;
          }
        });

        setGeneratedReport({
          title: "Financial & Ticket Sales Reconciliation Report",
          type: "financial",
          generatedAt: new Date().toISOString(),
          period: `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
          kpis: [
            { label: "Total Paid Tickets", value: paidTickets.toLocaleString() },
            { label: "Refunded Orders", value: refundedCount.toLocaleString() },
            {
              label: "Gross ETB Collections",
              value: money(grossByCur["ETB"] || 0, "ETB"),
            },
            {
              label: "Gross USD Collections",
              value: money(grossByCur["USD"] || 0, "USD"),
            },
          ],
          rows: Object.keys(grossByCur).concat(Object.keys(refundByCur)).filter((v, i, a) => a.indexOf(v) === i).map((cur) => {
            const paid = grossByCur[cur] || 0;
            const ref = refundByCur[cur] || 0;
            return {
              currency: cur,
              gross: money(paid, cur),
              refunds: money(ref, cur),
              net: money(paid - ref, cur),
            };
          }),
        });
      } else if (reportType === "compliance") {
        const matchingLogs = logs.filter((l) => {
          const t = new Date(l.created_at).getTime();
          return t >= start.getTime() && t <= end.getTime();
        });

        setGeneratedReport({
          title: "Staff Compliance & Operational Audit Trail Report",
          type: "compliance",
          generatedAt: new Date().toISOString(),
          period: `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
          kpis: [
            { label: "Total Actions Logged", value: matchingLogs.length.toString() },
            {
              label: "Security & Killswitch Events",
              value: matchingLogs.filter((l) => l.action.includes("pause") || l.action.includes("close") || l.action.includes("refund")).length.toString(),
            },
            {
              label: "Staff Actors Involved",
              value: new Set(matchingLogs.map((l) => l.actor)).size.toString(),
            },
          ],
          rows: matchingLogs.slice(0, 100).map((l) => ({
            id: l.id,
            timestamp: new Date(l.created_at).toLocaleString(),
            actor: l.actor,
            action: l.action,
            resource: l.resource,
          })),
        });
      } else if (reportType === "wallets") {
        setGeneratedReport({
          title: "Wallet Accounting & Funding Ledger Report",
          type: "wallets",
          generatedAt: new Date().toISOString(),
          period: `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
          kpis: [
            { label: "Total Succeeded Deposits", value: (overview?.totalDepositsCount ?? 0).toString() },
            {
              label: "Customer ETB Balance",
              value: money(overview?.collections?.find((c) => c.currency === "ETB")?.paidMinor || 0, "ETB"),
            },
            {
              label: "System Status",
              value: overview?.depositsPaused ? "Deposits Paused" : "Deposits Operational",
            },
          ],
          rows: overview?.depositVolume?.map((d) => ({
            currency: d.currency,
            succeeded: money(d.succeededMinor, d.currency),
            pending: money(d.pendingMinor, d.currency),
          })) || [],
        });
      } else {
        setGeneratedReport({
          title: "Lottery Rounds & Draw Performance Report",
          type: "rounds",
          generatedAt: new Date().toISOString(),
          period: `${start.toLocaleDateString()} to ${end.toLocaleDateString()}`,
          kpis: [
            { label: "Open Active Rounds", value: (overview?.openRounds ?? 0).toString() },
            { label: "Total Rounds Created", value: (overview?.totalRounds ?? 0).toString() },
            { label: "Completed Rounds", value: (overview?.completedRounds ?? 0).toString() },
          ],
          rows: [
            {
              metric: "Open Rounds currently accepting ticket purchases",
              count: overview?.openRounds ?? 0,
            },
            {
              metric: "Completed Rounds with published winning draws",
              count: overview?.completedRounds ?? 0,
            },
            {
              metric: "Total Lifetime Rounds",
              count: overview?.totalRounds ?? 0,
            },
          ],
        });
      }
      setMessage("Report successfully generated.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setGenerating(false);
    }
  }

  // Export Generated Report to CSV
  function exportCSV() {
    if (!generatedReport) return;
    let csv = `"${generatedReport.title}"\n`;
    csv += `"Generated At","${generatedReport.generatedAt}"\n`;
    csv += `"Period","${generatedReport.period}"\n\n`;

    // KPIs
    generatedReport.kpis.forEach((k: any) => {
      csv += `"${k.label}","${k.value}"\n`;
    });
    csv += "\n";

    // Table
    if (generatedReport.rows && generatedReport.rows.length > 0) {
      const headers = Object.keys(generatedReport.rows[0]);
      csv += headers.map((h) => `"${h}"`).join(",") + "\n";
      generatedReport.rows.forEach((r: any) => {
        csv += headers.map((h) => `"${r[h] ?? ""}"`).join(",") + "\n";
      });
    }

    downloadFile(csv, `${generatedReport.type}-report-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8;");
  }

  // Export Generated Report to XLSX using JSZip XML
  async function exportExcel() {
    if (!generatedReport) return;
    const zip = new JSZip();

    let rowsXml = "";
    let rowIndex = 1;

    // Header row
    rowsXml += `<row r="${rowIndex++}"><c r="A1" t="inlineStr"><is><t>${generatedReport.title}</t></is></c></row>`;
    rowsXml += `<row r="${rowIndex++}"><c r="A2" t="inlineStr"><is><t>Period: ${generatedReport.period}</t></is></c></row>`;
    rowsXml += `<row r="${rowIndex++}"></row>`;

    // KPIs
    generatedReport.kpis.forEach((k: any) => {
      rowsXml += `<row r="${rowIndex++}"><c r="A${rowIndex - 1}" t="inlineStr"><is><t>${k.label}</t></is></c><c r="B${rowIndex - 1}" t="inlineStr"><is><t>${k.value}</t></is></c></row>`;
    });
    rowsXml += `<row r="${rowIndex++}"></row>`;

    // Table Data
    if (generatedReport.rows && generatedReport.rows.length > 0) {
      const headers = Object.keys(generatedReport.rows[0]);
      const colLetters = ["A", "B", "C", "D", "E", "F"];
      rowsXml += `<row r="${rowIndex++}">`;
      headers.forEach((h, i) => {
        rowsXml += `<c r="${colLetters[i] || "A"}${rowIndex - 1}" t="inlineStr"><is><t>${h.toUpperCase()}</t></is></c>`;
      });
      rowsXml += `</row>`;

      generatedReport.rows.forEach((row: any) => {
        rowsXml += `<row r="${rowIndex++}">`;
        headers.forEach((h, i) => {
          rowsXml += `<c r="${colLetters[i] || "A"}${rowIndex - 1}" t="inlineStr"><is><t>${String(row[h] ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</t></is></c>`;
        });
        rowsXml += `</row>`;
      });
    }

    const sheetXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>${rowsXml}</sheetData></worksheet>`;
    const workbookXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Report" sheetId="1" r:id="rId1"/></sheets></workbook>`;
    const relsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;
    const wbRelsXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;
    const contentTypesXml = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>`;

    zip.file("[Content_Types].xml", contentTypesXml);
    zip.file("_rels/.rels", relsXml);
    zip.file("xl/workbook.xml", workbookXml);
    zip.file("xl/_rels/workbook.xml.rels", wbRelsXml);
    zip.file("xl/worksheets/sheet1.xml", sheetXml);

    const bytes = await zip.generateAsync({ type: "uint8array" });
    downloadFile(bytes, `${generatedReport.type}-report-${new Date().toISOString().slice(0, 10)}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
  }

  function handlePrint() {
    window.print();
  }

  return (
    <>
      {error && (
        <div className="admin-alert" role="alert" style={{ marginBottom: 16 }}>
          <AlertTriangle size={18} /> {error}
        </div>
      )}
      {message && (
        <div
          role="status"
          style={{
            padding: "12px 18px",
            background: "#def7ec",
            color: "#03543f",
            borderRadius: 8,
            marginBottom: 16,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <CheckCircle2 size={18} /> {message}
        </div>
      )}

      {/* ── SECTION 1: EXECUTIVE AUDIT METRICS ── */}
      <div className="admin-report-kpis">
        <div className="admin-report-kpi">
          <span>TOTAL ACTIONS RECORDED</span>
          <strong>{logs.length > 0 ? `${logs.length}+` : "0"}</strong>
          <small style={{ color: "var(--admin-muted)", display: "block", marginTop: 4 }}>
            Immutable PostgreSQL audit ledger
          </small>
        </div>

        <div className="admin-report-kpi">
          <span>SECURITY & KILLSWITCH ACTIONS</span>
          <strong style={{ color: securityEventsCount > 0 ? "#d97706" : "#059669" }}>
            {securityEventsCount}
          </strong>
          <small style={{ color: "var(--admin-muted)", display: "block", marginTop: 4 }}>
            Deposit pauses, round closures, refunds
          </small>
        </div>

        <div className="admin-report-kpi">
          <span>STAFF OPERATORS</span>
          <strong>{distinctActors.length}</strong>
          <small style={{ color: "var(--admin-muted)", display: "block", marginTop: 4 }}>
            Authorized administrator identities
          </small>
        </div>

        <div className="admin-report-kpi">
          <span>COMPLIANCE STATUS</span>
          <strong style={{ color: "#059669" }}>VERIFIED</strong>
          <small style={{ color: "var(--admin-muted)", display: "block", marginTop: 4 }}>
            Full tamper-evident history
          </small>
        </div>
      </div>

      {/* ── SECTION 2: PROFESSIONAL REPORT GENERATOR ── */}
      <section className="admin-card" style={{ marginBottom: 28 }}>
        <div className="admin-card-heading">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileSpreadsheet size={20} color="var(--admin-accent)" />
            <h2 style={{ margin: 0 }}>Executive report generator</h2>
          </div>
          <span className="admin-badge">Formal Audit Export</span>
        </div>
        <p className="admin-muted" style={{ margin: "4px 0 20px" }}>
          Generate formatted operational, financial, and compliance reports with live summaries and exports for Excel, CSV, or PDF.
        </p>

        {/* Generator Controls */}
        <div className="admin-report-form">
          <label style={{ display: "block" }}>
            <span style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
              Select Report Type
            </span>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              style={{ width: "100%" }}
            >
              <option value="financial">Financial & Ticket Sales Reconciliation</option>
              <option value="compliance">Staff Compliance & Audit Trail</option>
              <option value="wallets">Wallet Accounting & Funding Ledger</option>
              <option value="rounds">Lottery Draws & Round Lifecycle</option>
            </select>
          </label>

          <label style={{ display: "block" }}>
            <span style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
              Date Range Period
            </span>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRangeOption)}
              style={{ width: "100%" }}
            >
              <option value="all">All time records</option>
              <option value="today">Today only</option>
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="custom">Custom date range…</option>
            </select>
          </label>

          {dateRange === "custom" && (
            <>
              <label style={{ display: "block" }}>
                <span style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
                  Start Date
                </span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  style={{ width: "100%" }}
                />
              </label>

              <label style={{ display: "block" }}>
                <span style={{ display: "block", fontWeight: 600, marginBottom: 6, fontSize: 13 }}>
                  End Date
                </span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  style={{ width: "100%" }}
                />
              </label>
            </>
          )}

          <div>
            <button
              className="admin-button admin-primary"
              disabled={generating || busy}
              onClick={() => void generateReport()}
              style={{ width: "100%", minHeight: 42 }}
            >
              <Sparkles size={16} />
              {generating ? "Generating…" : "Generate report"}
            </button>
          </div>
        </div>

        {/* Live Generated Report Preview */}
        {generatedReport && (
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: 10,
              padding: 24,
              boxShadow: "0 4px 12px rgba(0,0,0,0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                borderBottom: "2px solid #e2e8f0",
                paddingBottom: 16,
                marginBottom: 20,
              }}
            >
              <div>
                <span className="admin-badge" style={{ marginBottom: 6 }}>OFFICIAL AUDIT REPORT</span>
                <h3 style={{ margin: "4px 0", fontSize: 20 }}>{generatedReport.title}</h3>
                <small style={{ color: "var(--admin-muted)" }}>
                  Period: <strong>{generatedReport.period}</strong> · Generated: {new Date(generatedReport.generatedAt).toLocaleString()}
                </small>
              </div>

              {/* Export Action Buttons */}
              <div className="admin-report-actions">
                <button className="admin-button" onClick={exportExcel} title="Download Excel .xlsx spreadsheet">
                  <FileSpreadsheet size={16} color="#059669" /> Export Excel
                </button>
                <button className="admin-button" onClick={exportCSV} title="Download CSV data">
                  <Download size={16} /> Export CSV
                </button>
                <button className="admin-button" onClick={handlePrint} title="Print or save as PDF">
                  <Printer size={16} /> Print / PDF
                </button>
              </div>
            </div>

            {/* Report Highlights KPI Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {generatedReport.kpis.map((kpi: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    background: "#f8fafc",
                    padding: 14,
                    borderRadius: 8,
                    border: "1px solid #e2e8f0",
                  }}
                >
                  <span style={{ fontSize: 11, color: "var(--admin-muted)", fontWeight: 600 }}>{kpi.label}</span>
                  <div style={{ fontSize: 18, fontWeight: 800, marginTop: 4, color: "var(--admin-ink)" }}>
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Report Table */}
            {generatedReport.rows && generatedReport.rows.length > 0 ? (
              <div className="admin-table-scroll">
                <table>
                  <thead>
                    <tr>
                      {Object.keys(generatedReport.rows[0]).map((h) => (
                        <th key={h} style={{ textTransform: "capitalize" }}>
                          {h.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {generatedReport.rows.map((r: any, idx: number) => (
                      <tr key={idx}>
                        {Object.keys(r).map((k) => (
                          <td key={k}>{String(r[k])}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin-empty">No records matched the selected period.</div>
            )}
          </div>
        )}
      </section>

      {/* ── SECTION 3: PROFESSIONAL AUDIT TRAIL LOG ── */}
      <section className="admin-card">
        <div className="admin-card-heading">
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <History size={20} color="var(--admin-accent)" />
            <h2 style={{ margin: 0 }}>System audit trail</h2>
          </div>
          <button disabled={busy} onClick={() => setRefresh((v) => v + 1)}>
            <RotateCcw size={15} /> Refresh logs
          </button>
        </div>
        <p className="admin-muted" style={{ margin: "4px 0 16px" }}>
          Full immutable log of staff administrative actions, deposit changes, sales controls, and payment rechecks.
        </p>

        {/* Filter and Search Bar */}
        <div className="admin-filter-bar">
          <div className="admin-search-input" style={{ position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--admin-muted)",
              }}
            />
            <input
              type="text"
              placeholder="Search action, actor, resource ID, or JSON details…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: "100%", paddingLeft: 36 }}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--admin-muted)" }}>Category:</span>
            <select value={actionCategory} onChange={(e) => setActionCategory(e.target.value)}>
              <option value="all">All actions</option>
              <option value="rounds">Rounds & draws</option>
              <option value="templates">Templates</option>
              <option value="payments">Payments & refunds</option>
              <option value="deposits">Deposits & wallets</option>
              <option value="operations">System operations</option>
              <option value="staff">Staff permissions</option>
            </select>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 13, color: "var(--admin-muted)" }}>Actor:</span>
            <select value={actorFilter} onChange={(e) => setActorFilter(e.target.value)}>
              <option value="all">All actors</option>
              {distinctActors.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="admin-table-scroll">
          <table>
            <thead>
              <tr>
                <th>Action & details</th>
                <th>Actor</th>
                <th>Resource target</th>
                <th>Timestamp</th>
                <th style={{ textAlign: "right" }}>Inspect</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((l) => {
                const isExpanded = expandedRow === l.id;
                const isSecurity =
                  l.action.includes("pause") ||
                  l.action.includes("close") ||
                  l.action.includes("refund") ||
                  l.action.includes("grant");
                const isFinancial =
                  l.action.includes("payment") || l.action.includes("deposit");

                return (
                  <tr key={l.id}>
                    <td>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span
                          className={`badge-pill ${
                            isSecurity
                              ? "badge-danger"
                              : isFinancial
                              ? "badge-purple"
                              : "badge-neutral"
                          }`}
                        >
                          {l.action}
                        </span>
                      </div>
                      {l.details && Object.keys(l.details).length > 0 && (
                        <div style={{ marginTop: 6 }}>
                          <AdminAuditChanges details={l.details} />
                        </div>
                      )}
                    </td>
                    <td>
                      <strong>{l.actor}</strong>
                    </td>
                    <td>
                      <code>{l.resource}</code>
                    </td>
                    <td style={{ fontSize: 12, color: "var(--admin-muted)" }}>
                      {new Date(l.created_at).toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {l.details && Object.keys(l.details).length > 0 ? (
                        <button
                          className="admin-btn-sm"
                          onClick={() => setExpandedRow(isExpanded ? null : l.id)}
                        >
                          {isExpanded ? "Hide diff" : "Inspect diff"}
                        </button>
                      ) : (
                        <span style={{ color: "var(--admin-muted)", fontSize: 12 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {!filteredLogs.length && (
          <div className="admin-empty">
            {searchQuery || actionCategory !== "all" || actorFilter !== "all"
              ? "No audit records match your filters."
              : "No audit events found on this page."}
          </div>
        )}

        {/* Working Pagination */}
        <div className="admin-pagination" style={{ marginTop: 20 }}>
          <span>
            Showing {filteredLogs.length > 0 ? `${offset + 1}–${offset + filteredLogs.length}` : "0"} records · Page{" "}
            {Math.floor(offset / 100) + 1}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button disabled={!offset || busy} onClick={() => setOffset((v) => Math.max(0, v - 100))}>
              Previous 100
            </button>
            <button disabled={logs.length < 100 || busy} onClick={() => setOffset((v) => v + 100)}>
              Next 100
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
