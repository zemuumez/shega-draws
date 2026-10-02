"use client";
import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { accountAPI } from "@/lib/account-api";
import type { AdminUser } from "@/lib/admin";
type Page = { items: AdminUser[]; hasMore: boolean };
export function AdminUsers() {
  const [query, setQuery] = useState(""),
    [search, setSearch] = useState(""),
    [offset, setOffset] = useState(0),
    [page, setPage] = useState<Page | null>(null),
    [error, setError] = useState(""),
    [revision, setRevision] = useState(0);
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
      { signal: c.signal },
    )
      .then((v) => {
        if (!c.signal.aborted) setPage(v);
      })
      .catch((e) => {
        if (!c.signal.aborted) setError(e.message);
      });
    return () => c.abort();
  }, [search, offset, revision]);
  return (
    <section className="admin-card">
      <div className="admin-card-heading">
        <h2>User directory</h2>
        <span className="admin-badge">Administrator access</span>
      </div>
      <p className="admin-muted">
        Email verification and authenticator enrollment are shown separately.
        Identity checks, account restrictions and wallet management will be
        added with their approval controls.
      </p>
      <label className="admin-search">
        <Search size={18} />
        <input
          aria-label="Search users by name or email"
          placeholder="Search name or email…"
          maxLength={100}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>
      {error ? (
        <div role="alert">
          {error}{" "}
          <button onClick={() => setRevision((v) => v + 1)}>Try again</button>
        </div>
      ) : !page ? (
        <p role="status">Loading accounts…</p>
      ) : (
        <>
          <div className="admin-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Email verified</th>
                  <th>Authenticator</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {page.items.map((u) => (
                  <tr key={u.id}>
                    <th scope="row">{u.name || "Unnamed account"}</th>
                    <td>{u.email}</td>
                    <td>
                      <span className="admin-badge">{u.role}</span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${u.emailVerified ? "positive" : "warning"}`}
                      >
                        {u.emailVerified ? "Verified" : "Unverified"}
                      </span>
                    </td>
                    <td>{u.twoFactorEnabled ? "Enrolled" : "Not enrolled"}</td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {page.items.length === 0 && (
            <div className="admin-empty">
              {search
                ? "No accounts match your search."
                : "No registered accounts yet."}
            </div>
          )}
          <div className="admin-pagination">
            <span>
              {page.items.length
                ? `${offset + 1}–${offset + page.items.length}`
                : "0"}{" "}
              accounts on this page · Page {Math.floor(offset / 50) + 1}
            </span>
            <div style={{ display: "flex", gap: 8 }}>
              <button
                disabled={!offset}
                onClick={() => setOffset((v) => Math.max(0, v - 50))}
              >
                Previous 50
              </button>
              <button
                disabled={!page.hasMore}
                onClick={() => setOffset((v) => v + 50)}
              >
                Next 50
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
