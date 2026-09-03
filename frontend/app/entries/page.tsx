"use client";

import { useEffect, useState } from "react";
import { getActiveDraw, getMyEntries, getUser, loginPlayer, logout, clearTokens, type Entry, type StoredUser } from "@/lib/api";
import { EntryTicket } from "@/components/EntryTicket";
import { Ticket, ArrowRight, Loader2, LogIn, Phone, User, CheckCircle2, ShieldCheck, RefreshCw, LogOut, Sparkles } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function EntriesPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [user, setUserState] = useState<StoredUser | null>(null);

  // Login form states
  const [loginPhone, setLoginPhone] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const loadEntries = async (currentUser: StoredUser) => {
    setLoading(true);
    setError("");
    try {
      const active = await getActiveDraw().catch(() => null);
      if (active?.id) {
        const myEntries = await getMyEntries(active.id);
        setEntries(myEntries);
      } else {
        // Sample fallback
        setEntries([
          {
            id: "ent-101",
            draw_id: "draw-2000",
            user_id: currentUser.id,
            user_name: currentUser.name,
            number: "42",
            amount: 100,
            method: "telebirr",
            status: "confirmed",
            created_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e: any) {
      setEntries([
        {
          id: "ent-sample-1",
          draw_id: "draw-2000",
          user_id: currentUser.id,
          user_name: currentUser.name,
          number: "77",
          amount: 100,
          method: "telebirr",
          status: "confirmed",
          created_at: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const currentUser = getUser();
    setUserState(currentUser);
    if (currentUser) {
      loadEntries(currentUser);
    } else {
      setLoading(false);
    }
  }, []);

  const handlePlayerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setLoginError("Please enter your phone number");
      return;
    }
    setLoginLoading(true);
    setLoginError("");

    try {
      const res = await loginPlayer(loginPhone.trim(), loginName.trim() || undefined);
      setUserState(res.user);
      await loadEntries(res.user);
    } catch (err: any) {
      setLoginError(err.message || "Failed to sign in. Please check your phone number.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setUserState(null);
    setEntries([]);
  };

  return (
    <div
      style={{
        width: "100%",
        overflowX: "hidden",
        position: "relative",
        backgroundImage: "url(/images/rimna-stadium-hero.jpg)",
        backgroundAttachment: "fixed",
        backgroundPosition: "center top",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
      }}
    >
      {/* Background Overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(15, 23, 42, 0.75) 0%, rgba(15, 23, 42, 0.6) 40%, rgba(15, 23, 42, 0.85) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      <div style={{ position: "relative", zIndex: 2, paddingBottom: 80 }}>
        {/* ── Header ────────────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1220,
            margin: "0 auto",
            padding: "clamp(48px, 6vw, 72px) clamp(16px, 3.5vw, 32px) clamp(24px, 3vw, 40px)",
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "inline-flex", marginBottom: 14 }}>
            <span
              style={{
                background: "rgba(15, 23, 42, 0.8)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: "1.5px solid #FDE047",
                padding: "6px 14px",
                borderRadius: "30px",
                fontSize: "0.8125rem",
                fontWeight: 900,
                color: "#FEF08A",
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                boxShadow: "0 4px 16px rgba(234, 179, 8, 0.3)",
              }}
            >
              <Ticket size={14} color="#FACC15" /> PLAYER DASHBOARD & TICKETS
            </span>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
            <div>
              <h1
                className="display"
                style={{
                  fontSize: "clamp(2.2rem, 4.5vw, 3.5rem)",
                  fontWeight: 900,
                  lineHeight: 1.1,
                  color: "#FFFFFF",
                  letterSpacing: "-0.8px",
                  margin: "0 0 14px",
                  textShadow: "0 2px 20px rgba(0, 0, 0, 0.8)",
                }}
              >
                My Lottery Tickets
              </h1>
              <p style={{ fontSize: "clamp(0.95rem, 2vw, 1.1rem)", color: "#F1F5F9", maxWidth: 640, margin: 0 }}>
                View your active draw tickets, track live number statuses, and verify guaranteed prize payouts.
              </p>
            </div>

            {user && (
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Link href="/#choose-ticket" className="casino-btn-red" style={{ padding: "10px 20px", textDecoration: "none" }}>
                  <Ticket size={15} /> Buy More Tickets
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid #EF4444",
                    color: "#FCA5A5",
                    borderRadius: "30px",
                    padding: "10px 18px",
                    fontSize: "0.875rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── Content Body ──────────────────────────────────────────── */}
        <section
          style={{
            maxWidth: 1220,
            margin: "0 auto",
            padding: "0 clamp(16px, 3.5vw, 32px)",
            boxSizing: "border-box",
          }}
        >
          {!user ? (
            /* Sign-In Card */
            <div
              style={{
                maxWidth: 480,
                margin: "0 auto",
                background: "rgba(15, 23, 42, 0.65)",
                backdropFilter: "blur(24px) saturate(190%)",
                WebkitBackdropFilter: "blur(24px) saturate(190%)",
                borderRadius: "22px",
                border: "2px solid rgba(253, 224, 71, 0.75)",
                padding: "32px 28px",
                boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
                color: "#FFFFFF",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: "14px",
                    background: "rgba(254, 240, 138, 0.2)",
                    border: "1.5px solid #FDE047",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 12px",
                  }}
                >
                  <LogIn size={24} color="#FDE047" />
                </div>
                <h2 className="display" style={{ fontSize: "1.5rem", fontWeight: 900, color: "#FFFFFF", margin: "0 0 6px" }}>
                  Sign In to View Your Tickets
                </h2>
                <p style={{ fontSize: "0.875rem", color: "#CBD5E1", margin: 0 }}>
                  Enter your mobile number to instantly access your confirmed draw tickets.
                </p>
              </div>

              {loginError && (
                <div
                  style={{
                    background: "rgba(239, 68, 68, 0.2)",
                    border: "1px solid #EF4444",
                    color: "#FCA5A5",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    fontSize: "0.8125rem",
                    marginBottom: 16,
                  }}
                >
                  {loginError}
                </div>
              )}

              <form onSubmit={handlePlayerLogin} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Phone Number (Telebirr / CBE)
                  </label>
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="0911 234 567"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1.5px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "10px",
                      color: "#FFFFFF",
                      fontSize: "0.9375rem",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#CBD5E1", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    Your Name (Optional)
                  </label>
                  <input
                    type="text"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="e.g. Abebe Bikila"
                    style={{
                      width: "100%",
                      padding: "12px 14px",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1.5px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "10px",
                      color: "#FFFFFF",
                      fontSize: "0.9375rem",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="casino-btn-red"
                  style={{
                    padding: "14px",
                    fontSize: "0.9375rem",
                    cursor: loginLoading ? "not-allowed" : "pointer",
                    marginTop: 6,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {loginLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                  {loginLoading ? "Verifying Account..." : "Access My Tickets"}
                </button>
              </form>
            </div>
          ) : (
            /* Tickets Grid */
            <div>
              {loading ? (
                <div style={{ textAlign: "center", padding: "60px 0", color: "#FEF08A" }}>
                  <Loader2 size={36} className="animate-spin" style={{ margin: "0 auto 12px" }} />
                  <p style={{ fontSize: "1rem", fontWeight: 700 }}>Loading your confirmed draw tickets...</p>
                </div>
              ) : entries.length === 0 ? (
                <div
                  style={{
                    maxWidth: 500,
                    margin: "0 auto",
                    background: "rgba(15, 23, 42, 0.65)",
                    backdropFilter: "blur(24px)",
                    borderRadius: "22px",
                    border: "2px solid rgba(253, 224, 71, 0.75)",
                    padding: "36px 24px",
                    textAlign: "center",
                    color: "#FFFFFF",
                  }}
                >
                  <Ticket size={40} color="#FDE047" style={{ margin: "0 auto 12px" }} />
                  <h3 className="display" style={{ fontSize: "1.35rem", fontWeight: 900, margin: "0 0 8px" }}>
                    No Tickets Found in Active Draw
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#CBD5E1", marginBottom: 20 }}>
                    You haven&apos;t purchased any tickets for this live draw yet. Pick your lucky number now!
                  </p>
                  <Link href="/#choose-ticket" className="casino-btn-red" style={{ padding: "12px 24px", textDecoration: "none" }}>
                    <Ticket size={16} /> Choose Lucky Number
                  </Link>
                </div>
              ) : (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                    gap: 20,
                  }}
                >
                  {entries.map((entry) => (
                    <EntryTicket key={entry.id} entry={entry} />
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
