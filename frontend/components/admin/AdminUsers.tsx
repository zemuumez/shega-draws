"use client";

import { useEffect, useState, useTransition } from "react";
import {
  Search,
  User,
  ShieldCheck,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  X,
  Wallet,
  Ticket,
  Mail,
  RefreshCw,
  SlidersHorizontal,
  ChevronRight,
  ExternalLink,
  Copy,
  Check,
} from "lucide-react";
import { accountAPI } from "@/lib/account-api";
import type { AdminUser } from "@/lib/admin";

type Page = { items: AdminUser[]; hasMore: boolean };

interface DetailedUserStats {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    twoFactorEnabled: boolean;
    createdAt: string;
  };
  staff: { role: string; enabled: boolean } | null;
  role: "admin" | "reviewer" | "player";
  wallets: { currency: string; balance_minor: string }[];
  totalOrders: number;
}

export function AdminUsers() {
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "reviewer" | "player">("all");
  const [verificationFilter, setVerificationFilter] = useState<"all" | "verified" | "unverified">("all");
  const [offset, setOffset] = useState(0);
  const [page, setPage] = useState<Page | null>(null);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  // User Drawer / Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userDetails, setUserDetails] = useState<DetailedUserStats | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionSuccess, setActionSuccess] = useState("");
  const [actionError, setActionError] = useState("");
  const [pendingRole, setPendingRole] = useState<"admin" | "reviewer" | "player">("player");
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(query.trim());
      setOffset(0);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  useEffect(() => {
    const c = new AbortController();
    setPage(null);
    setError("");
    accountAPI<Page>(
      `/admin/users?q=${encodeURIComponent(search)}&offset=${offset}`,
      { signal: c.signal }
    )
      .then((v) => {
        if (!c.signal.aborted) setPage(v);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [search, offset, revision]);

  // Load detailed info when a user is selected
  async function openUserModal(u: AdminUser) {
    setSelectedUser(u);
    setPendingRole((u.role as any) || "player");
    setActionSuccess("");
    setActionError("");
    setLoadingDetails(true);

    try {
      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "get-details",
          targetUserId: u.id,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Could not load user profile details.");
      }

      setUserDetails(data);
      setPendingRole(data.role || "player");
    } catch (err: any) {
      setActionError(err.message || "Failed to load detailed profile.");
    } finally {
      setLoadingDetails(false);
    }
  }

  // Handle Role Update
  async function handleRoleUpdate() {
    if (!selectedUser) return;
    setActionBusy(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-role",
          targetUserId: selectedUser.id,
          payload: { newRole: pendingRole },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update role.");
      }

      setActionSuccess(`Role successfully updated to "${pendingRole}".`);
      setRevision((v) => v + 1);
      if (userDetails) {
        setUserDetails({ ...userDetails, role: pendingRole });
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to update role.");
    } finally {
      setActionBusy(false);
    }
  }

  // Handle Email Verification Toggle
  async function handleToggleVerification() {
    if (!selectedUser) return;
    setActionBusy(true);
    setActionSuccess("");
    setActionError("");

    const targetStatus = !userDetails?.user.emailVerified;

    try {
      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle-verification",
          targetUserId: selectedUser.id,
          payload: { verified: targetStatus },
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to update verification status.");
      }

      setActionSuccess(`Email status updated to ${targetStatus ? "Verified" : "Unverified"}.`);
      setRevision((v) => v + 1);
      if (userDetails) {
        setUserDetails({
          ...userDetails,
          user: { ...userDetails.user, emailVerified: targetStatus },
        });
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to update verification status.");
    } finally {
      setActionBusy(false);
    }
  }

  // Handle 2FA Reset
  async function handleReset2FA() {
    if (!selectedUser) return;
    if (!confirm("Are you sure you want to reset 2-Factor Authentication for this user? This will remove their enrolled authenticator.")) {
      return;
    }

    setActionBusy(true);
    setActionSuccess("");
    setActionError("");

    try {
      const res = await fetch("/api/admin/users/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reset-2fa",
          targetUserId: selectedUser.id,
          payload: {},
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to reset 2FA.");
      }

      setActionSuccess("2-Factor Authentication has been reset. The user can log in with password/social without an OTP code.");
      setRevision((v) => v + 1);
      if (userDetails) {
        setUserDetails({
          ...userDetails,
          user: { ...userDetails.user, twoFactorEnabled: false },
        });
      }
    } catch (err: any) {
      setActionError(err.message || "Failed to reset 2FA.");
    } finally {
      setActionBusy(false);
    }
  }

  function copyUserId(id: string) {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  }

  // Client filtering on top of server search
  const filteredItems = (page?.items || []).filter((u) => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (verificationFilter === "verified" && !u.emailVerified) return false;
    if (verificationFilter === "unverified" && u.emailVerified) return false;
    return true;
  });

  return (
    <section className="admin-card">
      <div className="admin-card-heading">
        <div>
          <h2>User Directory & Access Control</h2>
          <p className="admin-muted" style={{ margin: "4px 0 0" }}>
            Search registered accounts, modify administrative roles, manage verification status, and reset security credentials.
          </p>
        </div>
        <span className="admin-badge" style={{ background: "rgba(100, 41, 239, 0.1)", color: "#6429ef", fontWeight: 700 }}>
          Administrator Controls Active
        </span>
      </div>

      {/* Search & Filter Toolbar */}
      <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", margin: "16px 0", alignItems: "center" }}>
        <label className="admin-search" style={{ flex: 1, minWidth: "260px", margin: 0 }}>
          <Search size={18} />
          <input
            aria-label="Search users by name, email, or ID"
            placeholder="Search by name, email, or user ID…"
            maxLength={100}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>

        {/* Role Filter Chips */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--admin-muted)", fontWeight: 600 }}>Role:</span>
          {(["all", "admin", "reviewer", "player"] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0.15s ease",
                borderColor: roleFilter === r ? "#6429ef" : "var(--admin-line)",
                background: roleFilter === r ? "#6429ef" : "transparent",
                color: roleFilter === r ? "#ffffff" : "var(--admin-muted)",
              }}
            >
              {r === "all" ? "All" : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        {/* Verification Filter */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <span style={{ fontSize: "12px", color: "var(--admin-muted)", fontWeight: 600 }}>Status:</span>
          {(["all", "verified", "unverified"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setVerificationFilter(v)}
              style={{
                padding: "6px 12px",
                borderRadius: "20px",
                fontSize: "12px",
                fontWeight: 700,
                border: "1px solid",
                cursor: "pointer",
                transition: "all 0.15s ease",
                borderColor: verificationFilter === v ? "#10b981" : "var(--admin-line)",
                background: verificationFilter === v ? "rgba(16, 185, 129, 0.12)" : "transparent",
                color: verificationFilter === v ? "#059669" : "var(--admin-muted)",
              }}
            >
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {error ? (
        <div role="alert" style={{ padding: "16px", background: "rgba(239, 68, 68, 0.08)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "8px", color: "#dc2626", margin: "16px 0" }}>
          {error}{" "}
          <button onClick={() => setRevision((v) => v + 1)} style={{ marginLeft: "8px", fontWeight: 700, textDecoration: "underline" }}>
            Try again
          </button>
        </div>
      ) : !page ? (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--admin-muted)" }}>
          <RefreshCw size={24} style={{ animation: "spin 1s linear infinite", margin: "0 auto 12px" }} />
          <p role="status" style={{ margin: 0 }}>Loading user directory…</p>
        </div>
      ) : (
        <>
          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>User Profile</th>
                  <th>Email / Identifier</th>
                  <th>Role</th>
                  <th>Email Verified</th>
                  <th>Security (2FA)</th>
                  <th>Registration Date</th>
                  <th style={{ textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((u) => {
                  const isTg = u.email.endsWith("@telegram.rimna.local");
                  const isPhone = u.email.endsWith("@phone.rimna.local");

                  return (
                    <tr key={u.id} style={{ transition: "background 0.15s" }}>
                      <th scope="row" style={{ display: "flex", alignItems: "center", gap: "10px", fontWeight: 700 }}>
                        <div
                          style={{
                            width: "34px",
                            height: "34px",
                            borderRadius: "50%",
                            background: u.role === "admin" ? "linear-gradient(135deg, #6429ef, #8b5cf6)" : "#e5e8f1",
                            color: u.role === "admin" ? "#ffffff" : "#4b5563",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "14px",
                            fontWeight: 800,
                            flexShrink: 0,
                          }}
                        >
                          {u.name ? u.name.slice(0, 1).toUpperCase() : u.email.slice(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ color: "var(--admin-ink)" }}>{u.name || "Unnamed account"}</div>
                          <div style={{ fontSize: "11px", color: "var(--admin-muted)", fontFamily: "monospace" }}>
                            {u.id.slice(0, 10)}…
                          </div>
                        </div>
                      </th>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span>{u.email}</span>
                          {isTg && (
                            <span style={{ fontSize: "10px", background: "#e0f2fe", color: "#0284c7", padding: "2px 6px", borderRadius: "10px", fontWeight: 700 }}>
                              Telegram
                            </span>
                          )}
                          {isPhone && (
                            <span style={{ fontSize: "10px", background: "#fef3c7", color: "#d97706", padding: "2px 6px", borderRadius: "10px", fontWeight: 700 }}>
                              Phone SMS
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span
                          className={`admin-badge ${
                            u.role === "admin" ? "positive" : u.role === "reviewer" ? "warning" : ""
                          }`}
                          style={{
                            textTransform: "capitalize",
                            fontWeight: 700,
                            ...(u.role === "admin"
                              ? { background: "rgba(100, 41, 239, 0.12)", color: "#6429ef" }
                              : {}),
                          }}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-badge ${u.emailVerified ? "positive" : "warning"}`}>
                          {u.emailVerified ? "Verified" : "Unverified"}
                        </span>
                      </td>
                      <td>
                        <span
                          style={{
                            fontSize: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            color: u.twoFactorEnabled ? "#059669" : "var(--admin-muted)",
                            fontWeight: u.twoFactorEnabled ? 700 : 500,
                          }}
                        >
                          {u.twoFactorEnabled ? (
                            <>
                              <ShieldCheck size={14} color="#059669" /> Enrolled
                            </>
                          ) : (
                            "Not enrolled"
                          )}
                        </span>
                      </td>
                      <td style={{ color: "var(--admin-muted)", fontSize: "13px" }}>
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => openUserModal(u)}
                          style={{
                            padding: "6px 14px",
                            background: "#6429ef",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "12px",
                            fontWeight: 700,
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            boxShadow: "0 2px 6px rgba(100, 41, 239, 0.2)",
                          }}
                        >
                          <SlidersHorizontal size={14} /> Manage
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredItems.length === 0 && (
            <div className="admin-empty" style={{ padding: "40px 20px" }}>
              {search ? "No accounts match your search filter." : "No registered accounts found."}
            </div>
          )}

          <div className="admin-pagination">
            <span>
              {filteredItems.length ? `${offset + 1}–${offset + filteredItems.length}` : "0"} accounts displayed · Page{" "}
              {Math.floor(offset / 50) + 1}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button disabled={!offset} onClick={() => setOffset((v) => Math.max(0, v - 50))}>
                Previous 50
              </button>
              <button disabled={!page.hasMore} onClick={() => setOffset((v) => v + 50)}>
                Next 50
              </button>
            </div>
          </div>
        </>
      )}

      {/* ── USER MANAGEMENT MODAL / DRAWER ─────────────────────────────────── */}
      {selectedUser && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-modal-title"
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedUser(null);
          }}
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              width: "100%",
              maxWidth: "640px",
              maxHeight: "90vh",
              overflowY: "auto",
              boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              border: "1px solid var(--admin-line)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: "20px 24px",
                borderBottom: "1px solid var(--admin-line)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#f8fafc",
                borderTopLeftRadius: "16px",
                borderTopRightRadius: "16px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #6429ef, #8b5cf6)",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "18px",
                    fontWeight: 800,
                  }}
                >
                  {selectedUser.name ? selectedUser.name.slice(0, 1).toUpperCase() : "U"}
                </div>
                <div>
                  <h3 id="user-modal-title" style={{ margin: 0, fontSize: "17px", fontWeight: 800, color: "var(--admin-ink)" }}>
                    {selectedUser.name || "Unnamed Account"}
                  </h3>
                  <div style={{ fontSize: "12px", color: "var(--admin-muted)", marginTop: "2px" }}>
                    {selectedUser.email}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--admin-muted)",
                  padding: "6px",
                  borderRadius: "8px",
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Feedback Alert Banners */}
              {actionSuccess && (
                <div style={{ padding: "12px 16px", background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", borderRadius: "8px", color: "#065f46", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle2 size={16} color="#10b981" />
                  <span>{actionSuccess}</span>
                </div>
              )}

              {actionError && (
                <div style={{ padding: "12px 16px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid #ef4444", borderRadius: "8px", color: "#991b1b", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <AlertCircle size={16} color="#ef4444" />
                  <span>{actionError}</span>
                </div>
              )}

              {/* User ID & Registration Details */}
              <div style={{ background: "#f8fafc", padding: "14px", borderRadius: "10px", border: "1px solid var(--admin-line)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <span style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--admin-muted)", fontWeight: 700, display: "block" }}>
                    Account User ID
                  </span>
                  <code style={{ fontSize: "13px", color: "var(--admin-ink)", fontWeight: 600 }}>{selectedUser.id}</code>
                </div>
                <button
                  type="button"
                  onClick={() => copyUserId(selectedUser.id)}
                  style={{
                    padding: "6px 10px",
                    background: "#ffffff",
                    border: "1px solid var(--admin-line)",
                    borderRadius: "6px",
                    fontSize: "12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {copiedId ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  {copiedId ? "Copied" : "Copy ID"}
                </button>
              </div>

              {/* Financial & Activity Stats Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--admin-line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#d97706", fontSize: "12px", fontWeight: 700 }}>
                    <Wallet size={15} /> ETB Wallet
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "6px", color: "var(--admin-ink)" }}>
                    {loadingDetails ? (
                      <span style={{ color: "var(--admin-muted)", fontSize: "13px" }}>Loading…</span>
                    ) : (
                      `${((Number(userDetails?.wallets.find((w) => w.currency === "ETB")?.balance_minor || 0)) / 100).toFixed(2)} ETB`
                    )}
                  </div>
                </div>

                <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--admin-line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#2563eb", fontSize: "12px", fontWeight: 700 }}>
                    <Wallet size={15} /> USD Wallet
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "6px", color: "var(--admin-ink)" }}>
                    {loadingDetails ? (
                      <span style={{ color: "var(--admin-muted)", fontSize: "13px" }}>Loading…</span>
                    ) : (
                      `$${((Number(userDetails?.wallets.find((w) => w.currency === "USD")?.balance_minor || 0)) / 100).toFixed(2)}`
                    )}
                  </div>
                </div>

                <div style={{ padding: "14px", background: "#f8fafc", borderRadius: "10px", border: "1px solid var(--admin-line)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#6429ef", fontSize: "12px", fontWeight: 700 }}>
                    <Ticket size={15} /> Tickets Bought
                  </div>
                  <div style={{ fontSize: "18px", fontWeight: 800, marginTop: "6px", color: "var(--admin-ink)" }}>
                    {loadingDetails ? (
                      <span style={{ color: "var(--admin-muted)", fontSize: "13px" }}>Loading…</span>
                    ) : (
                      userDetails?.totalOrders ?? 0
                    )}
                  </div>
                </div>
              </div>

              {/* ── SECTION 1: ROLE MANAGEMENT ─────────────────────────────── */}
              <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--admin-line)", background: "#ffffff" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "var(--admin-ink)" }}>
                  Administrative Role & Permissions
                </h4>
                <p style={{ margin: "0 0 14px 0", fontSize: "12px", color: "var(--admin-muted)" }}>
                  Promote this user to reviewer or administrator, or demote them to a standard player. Changes take effect on their next request.
                </p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "14px" }}>
                  {[
                    { id: "player", label: "Player", desc: "Lottery customer only" },
                    { id: "reviewer", label: "Reviewer", desc: "Staff audit & orders" },
                    { id: "admin", label: "Administrator", desc: "Full operations control" },
                  ].map((r) => (
                    <label
                      key={r.id}
                      style={{
                        flex: 1,
                        minWidth: "140px",
                        padding: "10px 12px",
                        borderRadius: "8px",
                        border: "2px solid",
                        borderColor: pendingRole === r.id ? "#6429ef" : "var(--admin-line)",
                        background: pendingRole === r.id ? "rgba(100, 41, 239, 0.04)" : "#ffffff",
                        cursor: "pointer",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", fontWeight: 700, fontSize: "13px" }}>
                        <input
                          type="radio"
                          name="user-role"
                          checked={pendingRole === r.id}
                          onChange={() => setPendingRole(r.id as any)}
                        />
                        {r.label}
                      </div>
                      <span style={{ fontSize: "11px", color: "var(--admin-muted)" }}>{r.desc}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={actionBusy || pendingRole === (userDetails?.role || selectedUser.role)}
                  onClick={handleRoleUpdate}
                  style={{
                    padding: "8px 16px",
                    background: pendingRole === (userDetails?.role || selectedUser.role) ? "#9ca3af" : "#6429ef",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: pendingRole === (userDetails?.role || selectedUser.role) ? "not-allowed" : "pointer",
                  }}
                >
                  {actionBusy ? "Saving Role…" : "Save Role Change"}
                </button>
              </div>

              {/* ── SECTION 2: SECURITY & VERIFICATION CONTROLS ────────────── */}
              <div style={{ padding: "16px", borderRadius: "12px", border: "1px solid var(--admin-line)", background: "#ffffff" }}>
                <h4 style={{ margin: "0 0 8px 0", fontSize: "14px", fontWeight: 800, color: "var(--admin-ink)" }}>
                  Security & Verification Actions
                </h4>
                <p style={{ margin: "0 0 14px 0", fontSize: "12px", color: "var(--admin-muted)" }}>
                  Override email verification manually or reset multi-factor authentication if a customer lost their device.
                </p>

                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  {/* Toggle Verification Button */}
                  <button
                    type="button"
                    disabled={actionBusy}
                    onClick={handleToggleVerification}
                    style={{
                      padding: "8px 14px",
                      background: userDetails?.user.emailVerified ? "#fef3c7" : "#ecfdf5",
                      color: userDetails?.user.emailVerified ? "#b45309" : "#047857",
                      border: "1px solid",
                      borderColor: userDetails?.user.emailVerified ? "#fde68a" : "#a7f3d0",
                      borderRadius: "6px",
                      fontSize: "12px",
                      fontWeight: 700,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                    }}
                  >
                    <Mail size={14} />
                    {userDetails?.user.emailVerified ? "Mark as Unverified" : "Manually Verify Email"}
                  </button>

                  {/* Reset 2FA Button */}
                  {userDetails?.user.twoFactorEnabled && (
                    <button
                      type="button"
                      disabled={actionBusy}
                      onClick={handleReset2FA}
                      style={{
                        padding: "8px 14px",
                        background: "#fef2f2",
                        color: "#b91c1c",
                        border: "1px solid #fecaca",
                        borderRadius: "6px",
                        fontSize: "12px",
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <KeyRound size={14} />
                      Reset 2-Step Authenticator (2FA)
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: "16px 24px",
                borderTop: "1px solid var(--admin-line)",
                background: "#f8fafc",
                borderBottomLeftRadius: "16px",
                borderBottomRightRadius: "16px",
                display: "flex",
                justifyContent: "flex-end",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedUser(null)}
                style={{
                  padding: "8px 18px",
                  background: "#ffffff",
                  border: "1px solid var(--admin-line)",
                  borderRadius: "6px",
                  fontWeight: 600,
                  fontSize: "13px",
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
