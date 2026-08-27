"use client";

import { useEffect, useState } from "react";
import { getActiveDraw, getMyEntries, getUser, type Entry } from "@/lib/api";
import { EntryTicket } from "@/components/EntryTicket";
import { Ticket, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [user, setUser]       = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    setUser(currentUser);

    if (!currentUser) {
      setLoading(false);
      return;
    }

    getActiveDraw()
      .then((d) => getMyEntries(d.id))
      .then(setEntries)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (!user) {
    return (
      <div style={{ maxWidth: 540, margin: "60px auto", padding: "40px 24px", textAlign: "center" }} className="card-base">
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--gold-bg)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
          }}
        >
          <Ticket size={24} color="var(--gold-dark)" />
        </div>
        <h1 className="display" style={{ fontSize: "1.5rem", color: "var(--text-main)", marginBottom: 8 }}>
          No Active Tickets Yet
        </h1>
        <p style={{ color: "var(--text-muted)", marginBottom: 24, fontSize: "0.9375rem" }}>
          You haven&apos;t entered a draw yet. Choose your lucky number and buy your ticket to get started!
        </p>
        <Link href="/enter" className="btn-base btn-primary">
          Buy a Ticket Now <ArrowRight size={16} />
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 className="display" style={{ fontSize: "1.625rem", color: "var(--text-main)" }}>
          Your Official Lottery Tickets
        </h1>
        <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginTop: 4 }}>
          Signed in as <strong style={{ color: "var(--text-main)" }}>{user.name}</strong> ({user.phone})
        </p>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "40px 20px" }}>
          <Loader2 className="animate-spin" size={28} color="var(--gold-dark)" style={{ margin: "0 auto 10px" }} />
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>Loading your entries…</p>
        </div>
      )}

      {error && (
        <p role="alert" style={{ color: "var(--rust-dark)", background: "var(--rust-bg)", padding: "12px", borderRadius: 8, fontSize: "0.875rem" }}>
          {error}
        </p>
      )}

      {!loading && entries.length === 0 && (
        <div className="card-base" style={{ padding: "40px 24px", textAlign: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", marginBottom: 18 }}>
            You have no submitted tickets for the current draw.
          </p>
          <Link href="/enter" className="btn-base btn-primary">
            Buy a Ticket
          </Link>
        </div>
      )}

      {!loading && entries.length > 0 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {entries.map((entry) => (
            <EntryTicket key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
