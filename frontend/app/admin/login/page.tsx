"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { loginAdmin, getUser, type StoredUser } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ShieldCheck } from "lucide-react";

export default function AdminLoginPage() {
  const [phone, setPhone]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [user, setUser]         = useState<StoredUser | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  if (user?.role === "admin" || user?.role === "superadmin") {
    return (
      <div style={{ maxWidth: 420, margin: "60px auto", padding: "0 20px", textAlign: "center" }}>
        <p style={{ color: "var(--gray)", marginBottom: 16 }}>
          Signed in as <strong style={{ color: "var(--paper)" }}>{user.name}</strong>
        </p>
        <Link href="/admin/dashboard" className="btn-base" style={{ background: "var(--gold)", color: "var(--ink)", border: "none" }}>
          Go to dashboard
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await loginAdmin({ phone, password });
      window.location.href = "/admin/dashboard";
    } catch (err: any) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "60px auto", padding: "0 20px" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div
          style={{
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "rgba(201,162,39,0.12)",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 14,
          }}
        >
          <ShieldCheck size={22} color="var(--gold)" />
        </div>
        <h1 className="display" style={{ fontSize: "1.5rem", color: "var(--paper)", marginBottom: 4 }}>
          Admin login
        </h1>
        <p style={{ color: "var(--gray)", fontSize: "0.875rem" }}>
          Restricted to organizers and superadmins
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Input
            label="Phone number"
            id="admin-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            autoComplete="username"
            required
          />
          <Input
            label="Password"
            id="admin-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          {error && (
            <p role="alert" style={{ color: "var(--rust-soft)", fontSize: "0.8125rem" }}>
              {error}
            </p>
          )}
          <Button type="submit" full loading={loading}>
            Sign in
          </Button>
        </form>
      </Card>
    </div>
  );
}
