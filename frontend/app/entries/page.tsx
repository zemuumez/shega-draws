"use client";

import { useEffect, useState } from "react";
import { getActiveDraw, getMyEntries, getUser, type Entry } from "@/lib/api";
import { EntryTicket } from "@/components/EntryTicket";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import Link from "next/link";

export const metadata = { title: "My Entries" };

export default function EntriesPage() {
  const [drawID, setDrawID]   = useState<string>("");
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const user = getUser();

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    getActiveDraw()
      .then((d) => {
        setDrawID(d.id);
        return getMyEntries(d.id);
      })
      .then(setEntries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (!user) {
    return (
      <div style={{ maxWidth: 520, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
        <h1 className="display" style={{ fontSize: "1.5rem", color: "var(--paper)", marginBottom: 12 }}>
          Your entries
        </h1>
        <p style={{ color: "var(--gray)", marginBottom: 20 }}>
          You haven&apos;t signed up yet. Enter the current draw to create your account.
        </p>
        <Link href="/enter" className="btn-base" style={{ background: "var(--gold)", color: "var(--ink)", border: "none" }}>
          Enter the draw
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="display" style={{ fontSize: "1.5rem", color: "var(--paper)" }}>
          Your entries
        </h1>
        <p style={{ color: "var(--gray)", fontSize: "0.875rem", marginTop: 4 }}>
          Signed in as <span style={{ color: "var(--paper)" }}>{user.name}</span>
        </p>
      </div>

      {loading && (
        <p className="animate-pulse" style={{ color: "var(--gray)", textAlign: "center" }}>
          Loading your entries…
        </p>
      )}

      {error && (
        <p role="alert" style={{ color: "var(--rust-soft)", fontSize: "0.875rem" }}>
          {error}
        </p>
      )}

      {!loading && !error && entries.length === 0 && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <p style={{ color: "var(--gray)", marginBottom: 16 }}>
            No entries for the current draw yet.
          </p>
          <Link href="/enter" className="btn-base" style={{ background: "var(--gold)", color: "var(--ink)", border: "none" }}>
            Enter now
          </Link>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {entries.map((entry) => (
          <EntryTicket key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
