"use client";

import React, { useEffect, useState, useMemo } from "react";
import { getActiveDraw, getMyEntries, getUser, loginPlayer, registerPlayer, clearTokens, type Entry, type StoredUser } from "@/lib/api";
import { EntryTicket } from "@/components/EntryTicket";
import {
  Ticket,
  Loader2,
  LogIn,
  LogOut,
  UserCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Sparkles,
  Trophy,
  Phone,
  User,
  PlusCircle,
  RefreshCw,
  Award,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CMSSiteSettings } from "@/lib/sanity/queries";

interface EntriesViewProps {
  siteSettings?: CMSSiteSettings | null;
}

export function EntriesView({ siteSettings }: EntriesViewProps) {
  const { t, language } = useLanguage();
  const pageT = t.entriesPage;

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUserState] = useState<StoredUser | null>(null);

  // Active filter tab: 'all' | 'confirmed' | 'pending' | 'won'
  const [activeTab, setActiveTab] = useState<"all" | "confirmed" | "pending" | "won">("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Login / Register Form state (when unauthenticated)
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [loginPhone, setLoginPhone] = useState("");
  const [loginName, setLoginName] = useState("");
  const [loginPin, setLoginPin] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const loadEntries = async (currentUser: StoredUser, isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const active = await getActiveDraw().catch(() => null);
      const userEntries = await getMyEntries(active?.id, currentUser.phone);
      setEntries(userEntries);
    } catch (e: any) {
      console.warn("Could not load remote entries:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
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

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginPhone.trim()) {
      setAuthError(
        language === "ti"
          ? "በጃኹም ቁጽሪ ስልክኹም ኣእትዉ"
          : language === "am"
          ? "እባክዎ ስልክ ቁጥርዎን ያስገቡ"
          : "Please enter your mobile phone number"
      );
      return;
    }

    if (!loginPin.trim() || loginPin.trim().length < 4) {
      setAuthError(
        language === "ti"
          ? "በጃኹም እንተወሓደ ናይ 4 ድጂት ናይ ድሕንነት ፒን (PIN) ኣእትዉ"
          : language === "am"
          ? "እባክዎ ቢያንስ የ4 ዲጂት የደህንነት ፒን (PIN) ያስገቡ"
          : "Please enter your 4-digit Security PIN."
      );
      return;
    }

    setAuthLoading(true);
    setAuthError("");

    try {
      let res;
      if (isRegisterMode) {
        res = await registerPlayer({
          name: loginName.trim() || "Verified Player",
          phone: loginPhone.trim(),
          pin: loginPin.trim(),
        });
      } else {
        res = await loginPlayer(loginPhone.trim(), loginPin.trim());
      }

      setUserState(res.user);
      await loadEntries(res.user);
    } catch (err: any) {
      setAuthError(
        err.message ||
          (language === "ti"
            ? "ምእታው ኣይተኻእለን። በጃኹም ደጊምኩም ፈትኑ።"
            : language === "am"
            ? "መግባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
            : "Failed to authenticate. Please verify your phone number and PIN.")
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    clearTokens();
    setUserState(null);
    setEntries([]);
  };

  // Stats calculation
  const totalCount = entries.length;
  const confirmedCount = entries.filter((e) => e.status === "confirmed").length;
  const pendingCount = entries.filter((e) => e.status !== "confirmed" && e.status !== "rejected").length;
  const rejectedCount = entries.filter((e) => e.status === "rejected").length;

  // Filtered entries
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Tab filter
      if (activeTab === "confirmed" && entry.status !== "confirmed") return false;
      if (activeTab === "pending" && (entry.status === "confirmed" || entry.status === "rejected")) return false;

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesNumber = entry.number.includes(query);
        const matchesDraw = (entry.draw_id || "").toLowerCase().includes(query);
        const matchesMethod = (entry.method || "").toLowerCase().includes(query);
        if (!matchesNumber && !matchesDraw && !matchesMethod) return false;
      }

      return true;
    });
  }, [entries, activeTab, searchQuery]);

  return (
    <div style={{ position: "relative", zIndex: 2, paddingBottom: 90 }}>
      {/* ── 1. Dashboard Header Banner ─────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1220,
          margin: "0 auto",
          padding: "clamp(40px, 5vw, 64px) clamp(16px, 3.5vw, 32px) clamp(20px, 2.5vw, 32px)",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "inline-flex", marginBottom: 12 }}>
          <span
            style={{
              background: "rgba(15, 23, 42, 0.85)",
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
              boxShadow: "0 4px 16px rgba(234, 179, 8, 0.25)",
            }}
          >
            <Ticket size={14} color="#FACC15" /> {pageT?.badge || "MY OFFICIAL LOTTERY TICKETS"}
          </span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1
              className="display"
              style={{
                fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)",
                fontWeight: 900,
                lineHeight: 1.1,
                color: "#FFFFFF",
                letterSpacing: "-0.8px",
                margin: "0 0 10px",
                textShadow: "0 2px 20px rgba(0, 0, 0, 0.8)",
              }}
            >
              {pageT?.title || "My Purchased Tickets"}
            </h1>
            <p style={{ fontSize: "clamp(0.95rem, 2vw, 1.05rem)", color: "#F1F5F9", maxWidth: 640, margin: 0 }}>
              {pageT?.subtitle || "Track your active tickets, verified lucky numbers, and live draw winning statuses."}
            </p>
          </div>

          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => loadEntries(user, true)}
                disabled={refreshing}
                style={{
                  background: "rgba(255, 255, 255, 0.12)",
                  border: "1.5px solid rgba(253, 224, 71, 0.5)",
                  color: "#FEF08A",
                  borderRadius: "30px",
                  padding: "10px 16px",
                  fontSize: "0.8125rem",
                  fontWeight: 900,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  transition: "all var(--transition-fast)",
                }}
              >
                <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
                {pageT?.refreshBtn || "Refresh"}
              </button>

              <Link href="/#choose-ticket" className="casino-btn-red" style={{ padding: "10px 20px", textDecoration: "none" }}>
                <PlusCircle size={15} /> {language === "ti" ? "ተወሳኺ ቲኬት ዓድጉ" : language === "am" ? "ተጨማሪ ቲኬት ይግዙ" : "Buy More Tickets"}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid #EF4444",
                  color: "#FCA5A5",
                  borderRadius: "30px",
                  padding: "10px 16px",
                  fontSize: "0.8125rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <LogOut size={14} /> {pageT?.signOutBtn || "Sign Out"}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── 2. Dashboard Content ────────────────────────────────────────── */}
      <section
        style={{
          maxWidth: 1220,
          margin: "0 auto",
          padding: "0 clamp(16px, 3.5vw, 32px)",
          boxSizing: "border-box",
        }}
      >
        {!user ? (
          /* ── Unauthenticated Sign In / Register Card ── */
          <div
            style={{
              maxWidth: 480,
              margin: "20px auto 0",
              background: "rgba(15, 23, 42, 0.75)",
              backdropFilter: "blur(24px) saturate(190%)",
              WebkitBackdropFilter: "blur(24px) saturate(190%)",
              borderRadius: "24px",
              border: "2px solid #FDE047",
              padding: "clamp(24px, 4vw, 36px)",
              boxShadow: "0 24px 60px rgba(0, 0, 0, 0.7)",
              color: "#FFFFFF",
            }}
          >
            {/* Top Icon */}
            <div style={{ textAlign: "center", marginBottom: 20 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "16px",
                  background: "rgba(254, 240, 138, 0.2)",
                  border: "1.5px solid #FDE047",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 12px",
                }}
              >
                <LogIn size={26} color="#FDE047" />
              </div>
              <h2 className="display" style={{ fontSize: "1.45rem", fontWeight: 900, color: "#FFFFFF", margin: "0 0 6px" }}>
                {isRegisterMode
                  ? language === "ti" ? "ሓድሽ ሕሳብ ክፈቱ" : language === "am" ? "አዲስ የተጫዋች መለያ ይክፈቱ" : "Create Player Account"
                  : pageT?.loginTitle || "Sign In to View Your Tickets"}
              </h2>
              <p style={{ fontSize: "0.875rem", color: "#CBD5E1", margin: 0 }}>
                {isRegisterMode
                  ? language === "ti" ? "ቲኬት ንምዕዳግን ታሪክኩም ንምርኣይን ተመዝገቡ።" : language === "am" ? "የገዟቸውን ቲኬቶች ለመከታተል እና የቀጥታ እጣዎችን ለማየት ይመዝገቡ።" : "Register with your phone number to access your confirmed ticket slips."
                  : pageT?.loginDesc || "Enter your phone number used during ticket purchase to view all your confirmed entries."}
              </p>
            </div>

            {/* Error banner */}
            {authError && (
              <div
                style={{
                  background: "rgba(239, 68, 68, 0.2)",
                  border: "1px solid #EF4444",
                  color: "#FCA5A5",
                  padding: "10px 14px",
                  borderRadius: "12px",
                  fontSize: "0.8125rem",
                  marginBottom: 16,
                }}
              >
                {authError}
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleAuthSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {isRegisterMode && (
                <div>
                  <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                    {language === "ti" ? "ምሉእ ስም" : language === "am" ? "ሙሉ ስም" : "Full Name"}
                  </label>
                  <div style={{ position: "relative" }}>
                    <User size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                    <input
                      type="text"
                      value={loginName}
                      onChange={(e) => setLoginName(e.target.value)}
                      placeholder={language === "ti" ? "ንኣብነት ኣበበ ቢቂላ" : language === "am" ? "ለምሳሌ አበበ ቢቂላ" : "e.g. Abebe Bikila"}
                      style={{
                        width: "100%",
                        padding: "12px 14px 12px 38px",
                        background: "rgba(0, 0, 0, 0.5)",
                        border: "1.5px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "12px",
                        color: "#FFFFFF",
                        fontSize: "0.9375rem",
                        boxSizing: "border-box",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {pageT?.phoneLabel || "Phone Number (Telebirr / CBE)"}
                </label>
                <div style={{ position: "relative" }}>
                  <Phone size={16} color="#94A3B8" style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="tel"
                    value={loginPhone}
                    onChange={(e) => setLoginPhone(e.target.value)}
                    placeholder="0911 234 567"
                    required
                    style={{
                      width: "100%",
                      padding: "12px 14px 12px 38px",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1.5px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "12px",
                      color: "#FFFFFF",
                      fontSize: "0.9375rem",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {isRegisterMode
                    ? language === "ti" ? "ናይ ድሕንነት ፒን ፍጠሩ (4 ድጂት)" : language === "am" ? "የደህንነት ፒን ይፍጠሩ (4 ዲጂት)" : "Create 4-Digit Security PIN"
                    : language === "ti" ? "ናይ ድሕንነት ፒን (PIN)" : language === "am" ? "የደህንነት ፒን (PIN)" : "4-Digit Security PIN"}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  value={loginPin}
                  onChange={(e) => setLoginPin(e.target.value)}
                  placeholder="••••"
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: "1.5px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    color: "#FFFFFF",
                    fontSize: "1rem",
                    letterSpacing: "2px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="casino-btn-red"
                style={{
                  padding: "14px",
                  fontSize: "0.9375rem",
                  cursor: authLoading ? "not-allowed" : "pointer",
                  marginTop: 6,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderRadius: "12px",
                }}
              >
                {authLoading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                {authLoading
                  ? language === "ti" ? "ይረጋገጽ ኣሎ..." : language === "am" ? "በማረጋገጥ ላይ..." : "Verifying..."
                  : isRegisterMode
                  ? language === "ti" ? "ተመዝገቡ" : language === "am" ? "ይመዝገቡ" : "Register Account"
                  : pageT?.signInBtn || "View My Tickets"}
              </button>

              <div style={{ textAlign: "center", marginTop: 6 }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setAuthError("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#60A5FA",
                    fontSize: "0.8125rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  {isRegisterMode
                    ? language === "ti" ? "ሕሳብ ኣለኩም ዶ? እተዉ" : language === "am" ? "መለያ አለዎት? ይግቡ" : "Already have an account? Sign in"
                    : language === "ti" ? "ሓድሽ ኢኹም? ተመዝገቡ" : language === "am" ? "አዲስ ነዎት? ይመዝገቡ" : "New to Rimna? Create an account"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ── Authenticated Player Dashboard ── */
          <div>
            {/* ── 2.1 Player Profile Card & Summary ── */}
            <div
              style={{
                background: "linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(30, 41, 59, 0.85) 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "22px",
                border: "2px solid rgba(253, 224, 71, 0.6)",
                padding: "clamp(20px, 3vw, 28px)",
                boxShadow: "0 16px 48px rgba(0, 0, 0, 0.5)",
                marginBottom: 28,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
                {/* Profile Identity */}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <div
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: "50%",
                      background: "radial-gradient(circle at 35% 30%, #FEF08A 0%, #EAB308 50%, #854D0E 100%)",
                      border: "2px solid #FFFBEB",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.4rem",
                      fontWeight: 900,
                      color: "#111827",
                      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.4)",
                    }}
                  >
                    {(user.name || "P").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                      <h3 className="display" style={{ fontSize: "1.35rem", fontWeight: 900, color: "#FFFFFF", margin: 0 }}>
                        {user.name || "Verified Player"}
                      </h3>
                      <span
                        style={{
                          background: "rgba(16, 185, 129, 0.2)",
                          border: "1px solid #10B981",
                          color: "#6EE7B7",
                          padding: "2px 8px",
                          borderRadius: "12px",
                          fontSize: "0.6875rem",
                          fontWeight: 900,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <UserCheck size={12} color="#10B981" /> {pageT?.verifiedBadge || "Verified Ticket Holder"}
                      </span>
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "#CBD5E1", marginTop: 4, display: "flex", alignItems: "center", gap: 6 }}>
                      <Phone size={13} color="#94A3B8" />
                      <span className="mono" style={{ color: "#FEF08A", fontWeight: 700 }}>{user.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Action Link */}
                <Link
                  href="/results"
                  style={{
                    background: "rgba(255, 255, 255, 0.08)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "14px",
                    padding: "8px 16px",
                    color: "#FFFFFF",
                    fontSize: "0.8125rem",
                    fontWeight: 800,
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Trophy size={14} color="#FDE047" /> {language === "ti" ? "ናይ ቀጥታ ውጽኢት ርኣዩ" : language === "am" ? "የቀጥታ እጣ ውጤት ይመልከቱ" : "Check Live Draw Results"}
                </Link>
              </div>

              {/* ── 2.2 Stats Grid ── */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: 12,
                  marginTop: 20,
                  borderTop: "1px solid rgba(255, 255, 255, 0.1)",
                  paddingTop: 18,
                }}
              >
                {/* Total Tickets */}
                <div
                  style={{
                    background: "rgba(0, 0, 0, 0.35)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    borderRadius: "14px",
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 800, textTransform: "uppercase" }}>
                    {pageT?.statsTotal || "Total Tickets"}
                  </div>
                  <div className="display" style={{ fontSize: "1.75rem", fontWeight: 900, color: "#FFFFFF", marginTop: 2 }}>
                    {totalCount}
                  </div>
                </div>

                {/* Confirmed / Active */}
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.4)",
                    borderRadius: "14px",
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#6EE7B7", fontWeight: 800, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                    <CheckCircle2 size={13} color="#10B981" /> {pageT?.statsActive || "Active in Live Draw"}
                  </div>
                  <div className="display" style={{ fontSize: "1.75rem", fontWeight: 900, color: "#6EE7B7", marginTop: 2 }}>
                    {confirmedCount}
                  </div>
                </div>

                {/* Pending Verification */}
                <div
                  style={{
                    background: "rgba(245, 158, 11, 0.15)",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                    borderRadius: "14px",
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#FEF08A", fontWeight: 800, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                    <Clock size={13} color="#F59E0B" /> {pageT?.statsPending || "Pending Review"}
                  </div>
                  <div className="display" style={{ fontSize: "1.75rem", fontWeight: 900, color: "#FEF08A", marginTop: 2 }}>
                    {pendingCount}
                  </div>
                </div>

                {/* Guaranteed 10 Cash Ranks */}
                <div
                  style={{
                    background: "rgba(234, 179, 8, 0.15)",
                    border: "1px solid rgba(234, 179, 8, 0.4)",
                    borderRadius: "14px",
                    padding: "12px 16px",
                  }}
                >
                  <div style={{ fontSize: "0.75rem", color: "#FDE047", fontWeight: 800, textTransform: "uppercase", display: "flex", alignItems: "center", gap: 5 }}>
                    <Award size={13} color="#FDE047" /> {pageT?.statsWins || "Guaranteed Payouts"}
                  </div>
                  <div className="display" style={{ fontSize: "1.75rem", fontWeight: 900, color: "#FDE047", marginTop: 2 }}>
                    10 Ranks
                  </div>
                </div>
              </div>
            </div>

            {/* ── 2.3 Filter Tabs & Search Bar ── */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: 12,
                marginBottom: 20,
              }}
            >
              {/* Filter Tabs */}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[
                  { id: "all", label: `${pageT?.tabAll || "All Tickets"} (${totalCount})` },
                  { id: "confirmed", label: `🟢 ${pageT?.tabActive || "Confirmed"} (${confirmedCount})` },
                  { id: "pending", label: `🟡 ${pageT?.tabPending || "Pending"} (${pendingCount})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id as any)}
                    style={{
                      background: activeTab === tab.id ? "#FDE047" : "rgba(255, 255, 255, 0.08)",
                      border: activeTab === tab.id ? "1.5px solid #FDE047" : "1.5px solid rgba(255, 255, 255, 0.15)",
                      color: activeTab === tab.id ? "#111827" : "#CBD5E1",
                      borderRadius: "20px",
                      padding: "8px 16px",
                      fontSize: "0.8125rem",
                      fontWeight: 900,
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div style={{ position: "relative", minWidth: 240 }}>
                <Search size={15} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={pageT?.searchPlaceholder || "Search by Draw ID or lucky number..."}
                  style={{
                    width: "100%",
                    padding: "8px 12px 8px 34px",
                    background: "rgba(0, 0, 0, 0.4)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "20px",
                    color: "#FFFFFF",
                    fontSize: "0.8125rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>
            </div>

            {/* ── 2.4 Tickets Grid ── */}
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: "#FEF08A" }}>
                <Loader2 size={36} className="animate-spin" style={{ margin: "0 auto 12px" }} />
                <p style={{ fontSize: "1rem", fontWeight: 700 }}>
                  {language === "ti" ? "ቲኬታት ይጽዓን ኣሎ..." : language === "am" ? "ቲኬቶችዎ በመጫን ላይ ናቸው..." : "Loading your confirmed draw tickets..."}
                </p>
              </div>
            ) : filteredEntries.length === 0 ? (
              <div
                style={{
                  maxWidth: 500,
                  margin: "40px auto",
                  background: "rgba(15, 23, 42, 0.75)",
                  backdropFilter: "blur(24px)",
                  borderRadius: "22px",
                  border: "2px solid rgba(253, 224, 71, 0.75)",
                  padding: "36px 24px",
                  textAlign: "center",
                  color: "#FFFFFF",
                }}
              >
                <Ticket size={44} color="#FDE047" style={{ margin: "0 auto 14px" }} />
                <h3 className="display" style={{ fontSize: "1.35rem", fontWeight: 900, margin: "0 0 8px" }}>
                  {pageT?.emptyTitle || "No Tickets Found"}
                </h3>
                <p style={{ fontSize: "0.875rem", color: "#CBD5E1", marginBottom: 20 }}>
                  {pageT?.emptyDesc || "You have not purchased any tickets yet. Pick your lucky number in our active draw and win big!"}
                </p>
                <Link href="/#choose-ticket" className="casino-btn-red" style={{ padding: "12px 24px", textDecoration: "none" }}>
                  <Ticket size={16} /> {pageT?.buyFirstBtn || "Buy Your First Ticket"}
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
                {filteredEntries.map((entry) => (
                  <EntryTicket key={entry.id} entry={entry} />
                ))}
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
