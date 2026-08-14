"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUser, getActiveDraw, listAllEntries, confirmEntry, rejectEntry, closeEntries, revealDraw, logout, type Entry, type DrawState } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EntryTicket } from "@/components/EntryTicket";
import { Check, X, Lock, Unlock, LogOut, ExternalLink, Sparkles, SlidersHorizontal, Layers } from "lucide-react";
import Link from "next/link";

const STATUS_OPTIONS = ["all", "pending", "confirmed", "rejected"] as const;

export default function AdminDashboard() {
  const router = useRouter();
  const user = typeof window !== "undefined" ? getUser() : null;

  const [draw, setDraw]       = useState<DrawState | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [filter, setFilter]   = useState<typeof STATUS_OPTIONS[number]>("pending");
  const [acting, setActing]   = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [drawLoading, setDrawLoading] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!user || !user.role.includes("admin")) {
      router.replace("/admin/login");
    }
  }, [user, router]);

  const loadData = useCallback(async () => {
    try {
      const d = await getActiveDraw().catch(() => null);
      setDraw(d);
      const status = filter === "all" ? undefined : filter;
      const all = await listAllEntries(d?.id, status);
      setEntries(all);
    } catch {
      /* handle gracefully */
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { loadData(); }, [loadData]);

  const pendingCount   = entries.filter((e) => e.status === "pending").length;
  const confirmedCount = entries.filter((e) => e.status === "confirmed").length;

  async function act(fn: () => Promise<unknown>, entryID?: string) {
    setActing(entryID ?? "draw");
    try { await fn(); await loadData(); }
    catch (e: any) { alert(e.message); }
    finally { setActing(null); }
  }

  if (!user) return null;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 className="display" style={{ fontSize: "1.5rem", color: "var(--paper)" }}>
            Admin dashboard
          </h1>
          <p style={{ color: "var(--gray)", fontSize: "0.8125rem", marginTop: 4 }}>
            {user.name} · <span style={{ textTransform: "capitalize" }}>{user.role}</span>
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link
            href="/studio"
            className="btn-base btn-secondary"
            style={{ padding: "8px 16px", fontSize: "0.8125rem", display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none" }}
          >
            <Sparkles size={14} color="var(--gold)" />
            Open CMS Studio
          </Link>
          <Button
            variant="ghost"
            icon={LogOut}
            onClick={() => logout().then(() => router.push("/admin/login"))}
          >
            Log out
          </Button>
        </div>
      </div>

      {/* CMS & Content Management Card */}
      <Card style={{ marginBottom: 20, background: "linear-gradient(135deg, rgba(212, 175, 55, 0.06) 0%, rgba(20, 26, 36, 0.7) 100%)", borderColor: "rgba(212, 175, 55, 0.25)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ maxWidth: 520 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span className="badge badge-gold" style={{ fontSize: "0.6875rem" }}>
                <Layers size={11} /> Headless CMS
              </span>
              <span style={{ color: "var(--paper)", fontWeight: 700, fontSize: "0.9375rem" }}>
                Sanity Content Management Studio
              </span>
            </div>
            <p style={{ color: "var(--paper-muted)", fontSize: "0.8125rem", lineHeight: 1.5, margin: 0 }}>
              Edit jackpots, prize showcases, multilingual translations (English / Amharic / Afaan Oromoo), sponsor promos, and platform bank accounts live.
            </p>
          </div>
          <Link
            href="/studio"
            className="btn-base btn-primary"
            style={{ padding: "9px 18px", fontSize: "0.84375rem", display: "inline-flex", alignItems: "center", gap: 8, textDecoration: "none" }}
          >
            <SlidersHorizontal size={14} /> Launch Studio Editor
          </Link>
        </div>
      </Card>

      {/* Draw state card */}
      {draw && (
        <Card style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <span className="display" style={{ fontSize: "1.125rem", color: "var(--paper)" }}>
                  {draw.draw_id}
                </span>
                <Badge tone={draw.status === "open" ? "gold" : draw.status === "revealed" ? "teal" : "gray"}>
                  {draw.status}
                </Badge>
              </div>
              <div className="mono" style={{ fontSize: "0.625rem", color: "var(--gray)" }}>
                {confirmedCount} confirmed entries &nbsp;·&nbsp; {pendingCount} pending
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {draw.status === "open" && (
                <Button
                  variant="secondary"
                  icon={Lock}
                  loading={acting === "draw"}
                  onClick={() => act(() => closeEntries(draw.id))}
                >
                  Close entries
                </Button>
              )}
              {draw.status === "closed" && (
                <Button
                  variant="confirm"
                  icon={Unlock}
                  loading={acting === "draw"}
                  onClick={() => {
                    if (!confirm("This is irreversible. Run the draw and reveal winning numbers?")) return;
                    act(() => revealDraw(draw.id));
                  }}
                >
                  Reveal & run draw
                </Button>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Entries filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            className="btn-base"
            onClick={() => setFilter(s)}
            style={{
              padding: "8px 14px",
              background: filter === s ? "var(--gold-glow)" : "transparent",
              border: filter === s ? "1px solid var(--gold)" : "1px solid var(--gray-line)",
              color: filter === s ? "var(--gold)" : "var(--gray)",
              fontSize: "0.8125rem",
              textTransform: "capitalize",
            }}
          >
            {s} {s === "pending" && pendingCount > 0 ? `(${pendingCount})` : ""}
          </button>
        ))}
      </div>

      {/* Entry list */}
      {loading ? (
        <p className="animate-pulse" style={{ color: "var(--gray)", textAlign: "center" }}>
          Loading entries…
        </p>
      ) : entries.length === 0 ? (
        <p style={{ color: "var(--gray)", textAlign: "center", padding: "24px 0" }}>
          No {filter === "all" ? "" : filter} entries.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {entries.map((entry) => (
            <div key={entry.id}>
              <EntryTicket entry={entry} />

              {/* Admin actions for pending entries */}
              {entry.status === "pending" && (
                <div style={{ display: "flex", gap: 8, marginTop: 8, justifyContent: "flex-end" }}>
                  {entry.proof_key && (
                    <a
                      href={entry.proof_key}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-base"
                      style={{
                        padding: "7px 12px",
                        background: "transparent",
                        border: "1px solid var(--gray-line)",
                        color: "var(--gray)",
                        fontSize: "0.75rem",
                        textDecoration: "none",
                      }}
                    >
                      <ExternalLink size={12} /> View proof
                    </a>
                  )}
                  <Button
                    variant="danger"
                    icon={X}
                    loading={acting === `reject-${entry.id}`}
                    onClick={() => act(() => rejectEntry(entry.id), `reject-${entry.id}`)}
                    style={{ fontSize: "0.75rem", padding: "7px 12px" }}
                  >
                    Reject
                  </Button>
                  <Button
                    variant="confirm"
                    icon={Check}
                    loading={acting === `confirm-${entry.id}`}
                    onClick={() => act(() => confirmEntry(entry.id), `confirm-${entry.id}`)}
                    style={{ fontSize: "0.75rem", padding: "7px 12px" }}
                  >
                    Confirm
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
