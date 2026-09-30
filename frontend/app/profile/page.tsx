"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import {
  User,
  ShieldCheck,
  ShieldAlert,
  Wallet,
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  LogOut,
  Mail,
  Ticket,
  History,
  Home,
  LayoutDashboard,
  CreditCard,
  Plus,
  Coins,
  Trophy,
  ExternalLink,
  ChevronRight,
  Compass,
  Clock,
  Flame,
  Calendar,
  Layers,
  TrendingUp,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearAccountToken, accountAPI } from "@/lib/account-api";
import { publicAPI, type BackendDraw, type Order } from "@/lib/backend";
import { WalletPanel } from "@/components/WalletPanel";
import { type WalletData, type Deposit, type WalletPage } from "@/lib/wallet";
import { money } from "@/lib/admin";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function getTotpSecret(uri: string): string {
  try {
    const url = new URL(uri);
    return url.searchParams.get("secret") || uri;
  } catch {
    const match = uri.match(/[?&]secret=([A-Z0-9]+)/i);
    return match ? match[1] : uri;
  }
}

type PortalTab =
  | "dashboard"
  | "tickets"
  | "wallet"
  | "deposit"
  | "history"
  | "profile"
  | "security";

function UserPortalContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { text } = useLanguage();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Active section tab
  const [activeTab, setActiveTab] = useState<PortalTab>("dashboard");

  // Portal user data
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [draws, setDraws] = useState<BackendDraw[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingData, setLoadingData] = useState(true);

  // Profile edit state
  const [name, setName] = useState("");
  const [isUpdatingName, setIsUpdatingName] = useState(false);
  const [nameSuccess, setNameSuccess] = useState("");
  const [nameError, setNameError] = useState("");

  // Email verification resend state
  const [resendStatus, setResendStatus] = useState("");

  // 2FA state
  const [twoFaPassword, setTwoFaPassword] = useState("");
  const [totpUri, setTotpUri] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [verifyTotpCode, setVerifyTotpCode] = useState("");
  const [twoFaMsg, setTwoFaMsg] = useState("");
  const [twoFaError, setTwoFaError] = useState("");
  const [isSettingUp2Fa, setIsSettingUp2Fa] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackups, setCopiedBackups] = useState(false);

  // Change password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStatus, setPasswordStatus] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Sync initial name from session
  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
  }, [session?.user?.name]);

  // Handle URL query parameters or hash changes (?tab=wallet, ?tab=profile, etc.)
  useEffect(() => {
    const tabFromUrl = searchParams.get("tab") as PortalTab | null;
    const validTabs: PortalTab[] = [
      "dashboard",
      "tickets",
      "wallet",
      "deposit",
      "history",
      "profile",
      "security",
    ];

    if (tabFromUrl && validTabs.includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "") as PortalTab;
      if (validTabs.includes(hash)) {
        setActiveTab(hash);
      }
    }
  }, [searchParams]);

  // Load backend stats, orders, and wallet
  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;

    async function loadPortalData() {
      setLoadingData(true);
      try {
        const [walletRes, ordersRes, depositsRes, drawsRes] =
          await Promise.allSettled([
            accountAPI<WalletData>("/wallet?currency=ETB"),
            accountAPI<Order[]>("/orders?offset=0"),
            accountAPI<WalletPage<Deposit>>("/deposits?offset=0"),
            publicAPI<BackendDraw[]>("/draws"),
          ]);

        if (cancelled) return;

        if (walletRes.status === "fulfilled") {
          setWallet(walletRes.value);
        }
        if (ordersRes.status === "fulfilled") {
          setOrders(ordersRes.value || []);
        }
        if (depositsRes.status === "fulfilled") {
          setDeposits(depositsRes.value?.items || []);
        }
        if (drawsRes.status === "fulfilled") {
          setDraws(drawsRes.value || []);
        }
      } catch (err) {
        console.error("Error loading user portal stats:", err);
      } finally {
        if (!cancelled) setLoadingData(false);
      }

      // Check if user is strictly admin
      try {
        const staffRes = await accountAPI<{ role: string; userId: string }>(
          "/admin/session"
        );
        if (!cancelled && staffRes.role === "admin") {
          setIsAdmin(true);
        } else if (!cancelled) {
          setIsAdmin(false);
        }
      } catch {
        if (!cancelled) setIsAdmin(false);
      }
    }

    loadPortalData();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace(
        `/login?redirect=${encodeURIComponent("/profile?tab=dashboard")}`
      );
    }
  }, [sessionLoading, session, router]);

  if (sessionLoading || !session) {
    return (
      <div className="auth-page-container">
        <div
          className="auth-card"
          style={{ textAlign: "center", padding: "48px 24px" }}
        >
          <Sparkles
            size={36}
            color="#FDE047"
            style={{
              margin: "0 auto 16px",
              animation: "spin 2s linear infinite",
            }}
          />
          <p style={{ color: "#D1D5DB" }}>{text("Loading your portal…")}</p>
        </div>
      </div>
    );
  }

  // Switch tab and sync with browser URL
  function switchTab(tab: PortalTab) {
    setActiveTab(tab);
    window.history.replaceState(null, "", `/profile?tab=${tab}`);
  }

  // Profile Information update handler
  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setIsUpdatingName(true);
    setNameSuccess("");
    setNameError("");

    try {
      const res = await authClient.updateUser({
        name: name.trim(),
      });
      if (res?.error) {
        throw new Error(res.error.message || "Failed to update profile name.");
      }
      setNameSuccess("Profile name updated successfully.");
      setTimeout(() => setNameSuccess(""), 4000);
      router.refresh();
    } catch (err: any) {
      setNameError(err.message || "Failed to update profile name.");
    } finally {
      setIsUpdatingName(false);
    }
  }

  // Change Password handler
  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPasswordStatus("");
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current account password.");
      return;
    }
    if (newPassword.length < 12) {
      setPasswordError("New password must be at least 12 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match. Please re-enter.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });

      if (res?.error) {
        throw new Error(res.error.message || "Failed to update password.");
      }

      setPasswordStatus("Your password has been securely updated.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus(""), 5000);
    } catch (err: any) {
      setPasswordError(
        err.message || "Could not change password. Please verify current password."
      );
    } finally {
      setIsChangingPassword(false);
    }
  }

  // 2FA Initial Setup
  async function handleInitTwoFa() {
    setTwoFaError("");
    setTwoFaMsg("");
    if (!twoFaPassword) {
      setTwoFaError("Please enter your current account password to begin 2FA setup.");
      return;
    }

    try {
      setIsSettingUp2Fa(true);
      const res = await authClient.twoFactor.enable({
        password: twoFaPassword,
        issuer: "Shega Draws Lottery",
      });

      if (res?.error) {
        throw new Error(res.error.message || "Could not initiate 2FA setup.");
      }

      if (res?.data) {
        const uri = (res.data as any).totpURI;
        const backups = (res.data as any).backupCodes || [];
        setTotpUri(uri);
        setBackupCodes(backups);

        const qr = await QRCode.toDataURL(uri, {
          width: 220,
          margin: 2,
          color: { dark: "#0F172A", light: "#FFFFFF" },
        });
        setQrCodeDataUrl(qr);
      }
    } catch (err: any) {
      setTwoFaError(err.message || "Failed to initiate 2FA setup.");
    }
  }

  // 2FA Final Verification
  async function handleVerifyTwoFa() {
    setTwoFaMsg("");
    setTwoFaError("");
    if (!verifyTotpCode.trim()) {
      setTwoFaError("Please enter the 6-digit code from your authenticator app.");
      return;
    }

    try {
      const res = await authClient.twoFactor.verifyTotp({
        code: verifyTotpCode.trim(),
      });

      if (res?.error) {
        throw new Error(
          res.error.message || "Invalid authenticator code. Please check your app."
        );
      }

      setTwoFaMsg("Two-factor authentication successfully verified and enabled!");
      setTotpUri("");
      setQrCodeDataUrl("");
      setBackupCodes([]);
      setTwoFaPassword("");
      setVerifyTotpCode("");
      setIsSettingUp2Fa(false);
    } catch (err: any) {
      setTwoFaError(err.message || "Failed to verify 2FA code.");
    }
  }

  // 2FA Disable
  async function handleDisableTwoFa() {
    if (
      !confirm(
        "Are you sure you want to disable two-factor authentication? This reduces your account security."
      )
    ) {
      return;
    }
    const pwd = prompt(
      "Enter your current password to confirm disabling two-factor authentication:"
    );
    if (!pwd) return;

    try {
      const res = await authClient.twoFactor.disable({ password: pwd });
      if (res?.error) {
        throw new Error(res.error.message || "Could not disable 2FA.");
      }
      setTwoFaMsg("Two-factor authentication has been disabled.");
      setTimeout(() => setTwoFaMsg(""), 4000);
    } catch (err: any) {
      setTwoFaError(err.message || "Failed to disable 2FA.");
    }
  }

  const isVerified = session.user.emailVerified;
  const is2FaEnabled = (session.user as any).twoFactorEnabled;

  // Compute live dashboard metrics
  const etbBalance =
    wallet?.balances?.find((b) => b.currency === "ETB")?.availableMinor ?? 0;
  const totalBalanceDisplay = money(etbBalance, "ETB");

  // Sum of completed deposits
  const totalDepositMinor = deposits.reduce((sum, d) => {
    if (d.status === "completed" || d.status === "credited") {
      return sum + d.amountMinor;
    }
    return sum;
  }, 0);
  const totalDepositDisplay = money(totalDepositMinor, "ETB");

  // Filter tickets that are waiting for draw
  const waitingForDrawTickets = orders.filter((o) => {
    if (o.refunded) return false;
    const d = draws.find((item) => item.id === o.drawId);
    return !d || d.status === "open" || d.status === "closed";
  });

  const tabNames: Record<PortalTab, string> = {
    dashboard: text("Dashboard"),
    tickets: text("Purchased Tickets"),
    wallet: text("My Wallet & Balances"),
    deposit: text("Deposit Funds"),
    history: text("Deposit & History"),
    profile: text("Profile Information"),
    security: text("Security & 2FA"),
  };

  return (
    <div className="user-portal-container">
      {/* ── 1. Modern User Portal Sidebar ──────────────────────────────────── */}
      <aside className="portal-sidebar" aria-label="Portal Navigation">
        {/* Brand Logo Header (Using homepage logo without home button) */}
        <div className="portal-sidebar-brand">
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <Image
              src="/images/rimna-brand-logo.png"
              alt="Shega Draws"
              width={180}
              height={46}
              priority
              style={{
                height: "38px",
                width: "auto",
                objectFit: "contain",
              }}
            />
          </Link>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="portal-nav-list">
          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => switchTab("dashboard")}
          >
            <LayoutDashboard size={18} color={activeTab === "dashboard" ? "#FDE047" : "#94A3B8"} />
            <span>{text("Dashboard")}</span>
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "tickets" ? "active" : ""}`}
            onClick={() => switchTab("tickets")}
          >
            <Ticket size={18} color={activeTab === "tickets" ? "#FDE047" : "#94A3B8"} />
            <span>{text("Purchased Tickets")}</span>
            {orders.length > 0 && (
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.6875rem",
                  fontWeight: 800,
                  background: "#1F2937",
                  color: "#FDE047",
                  padding: "1px 7px",
                  borderRadius: 9999,
                }}
              >
                {orders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => switchTab("wallet")}
          >
            <Wallet size={18} color={activeTab === "wallet" ? "#34D399" : "#94A3B8"} />
            <span>{text("My Wallet & Balances")}</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.6875rem",
                fontWeight: 800,
                color: "#34D399",
              }}
            >
              {(etbBalance / 100).toFixed(0)} ETB
            </span>
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "deposit" ? "active" : ""}`}
            onClick={() => switchTab("deposit")}
          >
            <CreditCard size={18} color={activeTab === "deposit" ? "#34D399" : "#94A3B8"} />
            <span>{text("Deposit Funds")}</span>
            <span
              style={{
                marginLeft: "auto",
                fontSize: "0.625rem",
                fontWeight: 800,
                background: "rgba(16, 185, 129, 0.2)",
                color: "#A7F3D0",
                padding: "1px 6px",
                borderRadius: 9999,
              }}
            >
              Chapa
            </span>
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => switchTab("history")}
          >
            <History size={18} color={activeTab === "history" ? "#FDE047" : "#94A3B8"} />
            <span>{text("Deposit & History")}</span>
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => switchTab("profile")}
          >
            <User size={18} color={activeTab === "profile" ? "#FDE047" : "#94A3B8"} />
            <span>{text("Profile Information")}</span>
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => switchTab("security")}
          >
            <ShieldCheck size={18} color={activeTab === "security" ? "#F59E0B" : "#94A3B8"} />
            <span>{text("Security & 2FA")}</span>
          </button>

          {/* Quick link to Home Lotteries */}
          <Link
            href="/#available-lotteries"
            className="portal-nav-btn"
            style={{ marginTop: 12, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}
          >
            <Flame size={18} color="#F97316" />
            <span>{text("Explore Lotteries")}</span>
            <ExternalLink size={14} style={{ marginLeft: "auto", opacity: 0.6 }} />
          </Link>

          {/* Only render Staff Admin Portal if strictly ADMIN */}
          {isAdmin && (
            <Link
              href="/admin"
              className="portal-nav-btn"
              style={{ color: "#2563EB", background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(37, 99, 235, 0.2)" }}
            >
              <ShieldAlert size={18} color="#2563EB" />
              <span>{text("Staff Admin Portal")}</span>
            </Link>
          )}

          {/* Sign Out at bottom of sidebar */}
          <div style={{ marginTop: "auto", paddingTop: 16 }}>
            <button
              type="button"
              className="portal-nav-btn"
              style={{ color: "#FCA5A5", background: "rgba(239, 68, 68, 0.08)" }}
              onClick={async () => {
                await authClient.signOut();
                clearAccountToken();
                window.location.href = "/";
              }}
            >
              <LogOut size={16} />
              <span>{text("Sign Out")}</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* ── 2. Portal Main Content Area ────────────────────────────────────── */}
      <main className="portal-main-content" style={{ display: "flex", flexDirection: "column", padding: 0 }}>
        {/* Sleek Portal Topbar Header */}
        <header className="portal-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: "#F1F5F9",
                border: "1px solid #E2E8F0",
                borderRadius: 10,
                color: "#334155",
                fontSize: "0.8125rem",
                fontWeight: 700,
                textDecoration: "none",
                transition: "all 0.2s ease",
              }}
            >
              <Home size={15} color="#D97706" />
              <span>{text("Home")}</span>
            </Link>

            <div className="portal-topbar-breadcrumb">
              <ChevronRight size={14} style={{ color: "#94A3B8" }} />
              <strong>{tabNames[activeTab]}</strong>
            </div>
          </div>

          {/* Right corner of header: Balance + Profile Overview */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              type="button"
              onClick={() => switchTab("wallet")}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                background: "rgba(16, 185, 129, 0.1)",
                border: "1px solid rgba(16, 185, 129, 0.3)",
                borderRadius: 10,
                color: "#059669",
                fontSize: "0.8125rem",
                fontWeight: 800,
                cursor: "pointer",
              }}
            >
              <Wallet size={15} color="#059669" />
              <span>{totalBalanceDisplay}</span>
            </button>

            {/* Profile Overview at the corner in the header */}
            <div
              onClick={() => switchTab("profile")}
              title={text("Profile & Settings")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "4px 12px 4px 5px",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: 12,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FDE047 0%, #D97706 100%)",
                  color: "#111827",
                  fontWeight: 900,
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(234, 179, 8, 0.25)",
                  flexShrink: 0,
                }}
              >
                {session.user.name ? session.user.name.trim().charAt(0).toUpperCase() : "U"}
              </div>

              <div style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: 1.25 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <strong style={{ color: "#0F172A", fontSize: "0.8125rem", fontWeight: 800 }}>
                    {session.user.name || "Lottery Player"}
                  </strong>
                  {isVerified ? (
                    <span
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 800,
                        background: "#ECFDF5",
                        color: "#059669",
                        padding: "1px 5px",
                        borderRadius: 9999,
                        border: "1px solid #A7F3D0",
                      }}
                    >
                      ✓ {text("Verified")}
                    </span>
                  ) : (
                    <span
                      style={{
                        fontSize: "0.625rem",
                        fontWeight: 800,
                        background: "#FFFBEB",
                        color: "#D97706",
                        padding: "1px 5px",
                        borderRadius: 9999,
                        border: "1px solid #FDE68A",
                      }}
                    >
                      ! {text("Unverified")}
                    </span>
                  )}
                </div>
                <span style={{ color: "#64748B", fontSize: "0.6875rem" }}>
                  {session.user.email}
                </span>
              </div>
            </div>
          </div>
        </header>

        <div style={{ flex: 1, padding: "clamp(20px, 3vw, 36px) clamp(16px, 3vw, 48px)", overflowY: "auto" }}>
          {/* Unverified Email Warning Bar if applicable */}
        {!isVerified && (
          <div
            style={{
              background: "rgba(245, 158, 11, 0.12)",
              border: "1.5px solid #F59E0B",
              borderRadius: "14px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "12px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <AlertCircle size={20} color="#FBBF24" style={{ flexShrink: 0 }} />
              <div>
                <strong style={{ color: "#FDE047", display: "block", fontSize: "0.95rem" }}>
                  {text("Please verify your email address")}
                </strong>
                <span style={{ color: "#D1D5DB", fontSize: "0.8125rem" }}>
                  {text(
                    "A verified email is required for secure wallet deposits, ticket participation, and prize settlement."
                  )}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  setResendStatus("Sending verification email…");
                  await authClient.sendVerificationEmail({
                    email: session.user.email,
                    callbackURL: "/profile?tab=dashboard",
                  });
                  setResendStatus("Verification email sent! Check your inbox.");
                } catch (e: any) {
                  setResendStatus("Could not send email. Please try again.");
                }
              }}
              style={{
                padding: "7px 14px",
                background: "#F59E0B",
                border: "none",
                borderRadius: "8px",
                color: "#111827",
                fontWeight: 800,
                fontSize: "0.8125rem",
                cursor: "pointer",
              }}
            >
              {resendStatus || text("Resend verification email")}
            </button>
          </div>
        )}

        {/* ── VIEW 1: DASHBOARD (Concept from User's Reference Images) ────── */}
        {activeTab === "dashboard" && (
          <div>
            {/* Top Greeting & Quick Action Banner */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#F9FAFB", margin: 0 }}>
                  {text("Player Dashboard")}
                </h1>
                <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: "4px 0 0" }}>
                  {text("Welcome back,")} <strong style={{ color: "#FDE047" }}>{session.user.name}</strong>. {text("Here is your lottery activity and active tickets.")}
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => switchTab("deposit")}
                  className="casino-btn-gold"
                  style={{ padding: "8px 16px", fontSize: "0.8125rem", display: "inline-flex", alignItems: "center", gap: 6 }}
                >
                  <Plus size={15} strokeWidth={3} />
                  <span>{text("Deposit Funds")}</span>
                </button>

                <Link
                  href="/#available-lotteries"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    background: "#1F2937",
                    border: "1px solid rgba(253, 224, 71, 0.4)",
                    borderRadius: 10,
                    color: "#FDE047",
                    fontSize: "0.8125rem",
                    fontWeight: 800,
                    textDecoration: "none",
                  }}
                >
                  <Ticket size={15} />
                  <span>{text("Buy Tickets")}</span>
                </Link>
              </div>
            </div>

            {/* 4 Metric Cards (Matching User's Reference Images 1 & 3) */}
            <div className="portal-metrics-grid">
              {/* Card 1: Total Balance (Vibrant Cyan Card from Image 1) */}
              <div className="portal-metric-card cyan-card">
                <div className="portal-metric-top">
                  <span className="portal-metric-title">{text("Total Balance")}</span>
                  <button
                    type="button"
                    onClick={() => switchTab("deposit")}
                    className="portal-metric-btn"
                  >
                    <span>+ Deposit</span>
                  </button>
                </div>
                <div className="portal-metric-val">{totalBalanceDisplay}</div>
                <div className="portal-metric-sub" style={{ color: "#0B192C", fontWeight: 700 }}>
                  ETB Available Wallet Balance
                </div>
                <Wallet className="portal-watermark" style={{ color: "#000000", opacity: 0.12 }} />
              </div>

              {/* Card 2: Total Wins */}
              <div className="portal-metric-card">
                <div className="portal-metric-top">
                  <span className="portal-metric-title">{text("Total Wins")}</span>
                  <button
                    type="button"
                    onClick={() => switchTab("tickets")}
                    className="portal-metric-btn"
                  >
                    <span>{text("View log")}</span>
                  </button>
                </div>
                <div className="portal-metric-val" style={{ color: "#FDE047" }}>
                  0.00 ETB
                </div>
                <div className="portal-metric-sub">{text("0 winning ticket draws")}</div>
                <Trophy className="portal-watermark" />
              </div>

              {/* Card 3: Total Deposit */}
              <div className="portal-metric-card">
                <div className="portal-metric-top">
                  <span className="portal-metric-title">{text("Total Deposit")}</span>
                  <button
                    type="button"
                    onClick={() => switchTab("history")}
                    className="portal-metric-btn"
                  >
                    <span>{text("View log")}</span>
                  </button>
                </div>
                <div className="portal-metric-val" style={{ color: "#34D399" }}>
                  {totalDepositDisplay}
                </div>
                <div className="portal-metric-sub">
                  {deposits.length} {text("completed deposits")}
                </div>
                <Coins className="portal-watermark" />
              </div>

              {/* Card 4: Purchased Tickets */}
              <div className="portal-metric-card">
                <div className="portal-metric-top">
                  <span className="portal-metric-title">{text("Purchased Tickets")}</span>
                  <button
                    type="button"
                    onClick={() => switchTab("tickets")}
                    className="portal-metric-btn"
                  >
                    <span>{text("View log")}</span>
                  </button>
                </div>
                <div className="portal-metric-val">{orders.length}</div>
                <div className="portal-metric-sub">
                  {waitingForDrawTickets.length} {text("currently active")}
                </div>
                <Ticket className="portal-watermark" />
              </div>
            </div>

            {/* Waiting for Draw Table Section (Matching User's Reference Image 1 & 3) */}
            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Clock size={20} color="#00E5FF" />
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#F9FAFB", margin: 0 }}>
                    {text("Waiting for Draw")}
                  </h2>
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#94A3B8" }}>
                  {waitingForDrawTickets.length} {text("tickets registered")}
                </span>
              </div>

              <div className="portal-table-container">
                <table className="portal-table">
                  <thead>
                    <tr>
                      <th style={{ width: "80px" }}>{text("S.N.")}</th>
                      <th>{text("Lottery Name")}</th>
                      <th>{text("Phase Number")}</th>
                      <th>{text("Ticket")}</th>
                      <th style={{ textAlign: "right" }}>{text("Result")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {waitingForDrawTickets.length > 0 ? (
                      waitingForDrawTickets.map((order, idx) => {
                        const matchedDraw = draws.find((d) => d.id === order.drawId);
                        const drawTitle =
                          matchedDraw?.title || `Draw #${order.drawId.slice(0, 8)}`;
                        const phaseNumber = `#PHASE-${order.drawId.slice(0, 6).toUpperCase()}`;
                        const ticketNumber = `#${String(order.number).padStart(5, "0")}`;

                        return (
                          <tr key={order.id || idx}>
                            <td style={{ fontWeight: 800, color: "#94A3B8" }}>{idx + 1}</td>
                            <td style={{ fontWeight: 800, color: "#F9FAFB" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: "#10B981",
                                    boxShadow: "0 0 8px #10B981",
                                  }}
                                />
                                <span>{drawTitle}</span>
                              </div>
                            </td>
                            <td style={{ fontFamily: "monospace", color: "#38BDF8" }}>
                              {phaseNumber}
                            </td>
                            <td style={{ fontFamily: "monospace", fontWeight: 900, color: "#FDE047" }}>
                              {ticketNumber}
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <span className="portal-status-pill waiting">
                                <Clock size={11} />
                                <span>{text("Waiting for Draw")}</span>
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          style={{
                            textAlign: "center",
                            padding: "60px 20px",
                            background: "#0E1626",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <Ticket
                              size={44}
                              color="#00E5FF"
                              style={{ opacity: 0.6, animation: "bounce 2s infinite" }}
                            />
                            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#E2E8F0" }}>
                              {text("Data not found")}
                            </div>
                            <p
                              style={{
                                color: "#94A3B8",
                                fontSize: "0.875rem",
                                margin: 0,
                                maxWidth: 420,
                              }}
                            >
                              {text(
                                "You do not have any active tickets waiting for the next draw. Pick a ticket from our open lotteries to participate!"
                              )}
                            </p>
                            <Link
                              href="/#available-lotteries"
                              className="casino-btn-gold"
                              style={{
                                marginTop: 12,
                                padding: "9px 20px",
                                fontSize: "0.8125rem",
                                textDecoration: "none",
                              }}
                            >
                              <span>{text("Browse Open Lotteries")}</span>
                              <ArrowRight size={14} />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── VIEW 2: PURCHASED TICKETS ──────────────────────────────────────── */}
        {activeTab === "tickets" && (
          <div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div>
                <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#F9FAFB", margin: 0 }}>
                  {text("My Purchased Tickets")}
                </h1>
                <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: "4px 0 0" }}>
                  {text("All your active and historical lottery tickets with serial codes and draw records.")}
                </p>
              </div>

              <Link
                href="/#available-lotteries"
                className="casino-btn-gold"
                style={{
                  padding: "8px 18px",
                  fontSize: "0.8125rem",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Plus size={15} strokeWidth={3} />
                <span>{text("Buy More Tickets")}</span>
              </Link>
            </div>

            {orders.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {orders.map((o) => {
                  const draw = draws.find((d) => d.id === o.drawId);
                  const title = draw?.title || `Lottery Draw #${o.drawId.slice(0, 8)}`;
                  const isWon = o.status === "won";
                  const isWaiting = !o.refunded && (!draw || draw.status === "open" || draw.status === "closed");

                  return (
                    <div key={o.id} className="ticket-item-card">
                      <div className="ticket-number-badge">
                        <span className="label">{text("Ticket No.")}</span>
                        <span className="number">#{String(o.number).padStart(5, "0")}</span>
                      </div>

                      <div className="ticket-meta-info">
                        <div className="draw-title">{title}</div>
                        <div className="meta-subtext">
                          <span>
                            {text("Purchased:")} {new Date(o.createdAt).toLocaleDateString()}
                          </span>
                          <span>•</span>
                          <span>
                            {text("Order Ref:")} <code>{o.id.slice(0, 10)}...</code>
                          </span>
                        </div>
                      </div>

                      <div className="ticket-action-col">
                        <div className="ticket-price-display">{money(o.amountMinor, o.currency)}</div>
                        {isWon ? (
                          <span className="portal-status-pill won">🏆 {text("WINNER")}</span>
                        ) : isWaiting ? (
                          <span className="portal-status-pill waiting">
                            <Clock size={11} /> {text("WAITING FOR DRAW")}
                          </span>
                        ) : (
                          <span className="portal-status-pill running">{o.status.toUpperCase()}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="tickets-empty-card">
                <Ticket size={48} color="#FDE047" style={{ margin: "0 auto 16px" }} />
                <h3 style={{ color: "#F9FAFB", fontSize: "1.25rem", margin: "0 0 8px" }}>
                  {text("No tickets purchased yet")}
                </h3>
                <p style={{ color: "#9CA3AF", fontSize: "0.875rem", margin: "0 auto 20px", maxWidth: 440 }}>
                  {text("Participate in one of our running lotteries for a chance to win the jackpot!")}
                </p>
                <Link
                  href="/#available-lotteries"
                  className="casino-btn-gold"
                  style={{ padding: "10px 24px", fontSize: "0.875rem", textDecoration: "none" }}
                >
                  {text("Explore Lotteries")} &rarr;
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW 3: MY WALLET & BALANCES ───────────────────────────────────── */}
        {activeTab === "wallet" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#F9FAFB", margin: 0 }}>
                {text("My Wallet & Balances")}
              </h1>
              <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: "4px 0 0" }}>
                {text("Manage your multi-currency player balances, view available funds, and top up your account.")}
              </p>
            </div>

            {isVerified ? (
              <WalletPanel
                key={session.user.id + "-wallet"}
                userId={session.user.id}
                view="balances"
                onGoToHistory={() => switchTab("history")}
              />
            ) : (
              <div className="profile-card-section" style={{ textAlign: "center", padding: "40px 20px" }}>
                <Lock size={36} color="#FBBF24" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ color: "#F9FAFB", fontSize: "1.2rem", margin: "0 0 8px" }}>
                  {text("Wallet Locked — Email Verification Required")}
                </h3>
                <p style={{ color: "#9CA3AF", fontSize: "0.875rem", maxWidth: "440px", margin: "0 auto 20px" }}>
                  {text(
                    "Please verify your email address to unlock your multi-currency wallet, deposit capabilities, and balance tracking."
                  )}
                </p>
                <button
                  type="button"
                  onClick={async () => {
                    await authClient.sendVerificationEmail({
                      email: session.user.email,
                      callbackURL: "/profile?tab=wallet",
                    });
                    alert("Verification email resent!");
                  }}
                  className="casino-btn-gold"
                  style={{ padding: "8px 18px", fontSize: "0.875rem" }}
                >
                  {text("Resend verification email")}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW 4: DEPOSIT FUNDS (FAST CHAPA FLOW) ────────────────────────── */}
        {activeTab === "deposit" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#F9FAFB", margin: 0 }}>
                {text("Deposit Funds")}
              </h1>
              <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: "4px 0 0" }}>
                {text("Instantly deposit funds into your player wallet via Chapa (Telebirr, CBE Birr, Awash, Cards).")}
              </p>
            </div>

            {isVerified ? (
              <WalletPanel
                key={session.user.id + "-deposit"}
                userId={session.user.id}
                view="balances"
                onGoToHistory={() => switchTab("history")}
              />
            ) : (
              <div className="profile-card-section" style={{ textAlign: "center", padding: "40px 20px" }}>
                <Lock size={36} color="#FBBF24" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ color: "#F9FAFB", fontSize: "1.2rem", margin: "0 0 8px" }}>
                  {text("Deposit Locked — Email Verification Required")}
                </h3>
                <p style={{ color: "#9CA3AF", fontSize: "0.875rem", maxWidth: "440px", margin: "0 auto 20px" }}>
                  {text("Please click the verification link sent to your email to enable deposits.")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW 5: DEPOSIT & TRANSACTION HISTORY ──────────────────────────── */}
        {activeTab === "history" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#F9FAFB", margin: 0 }}>
                {text("Deposit & Transaction History")}
              </h1>
              <p style={{ color: "#94A3B8", fontSize: "0.875rem", margin: "4px 0 0" }}>
                {text("Comprehensive audit log of all your deposits, ticket debit entries, and winning payouts.")}
              </p>
            </div>

            {isVerified ? (
              <WalletPanel
                key={session.user.id + "-history"}
                userId={session.user.id}
                view="history"
              />
            ) : (
              <div className="profile-card-section" style={{ textAlign: "center", padding: "40px 20px" }}>
                <Lock size={36} color="#FBBF24" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ color: "#F9FAFB", fontSize: "1.2rem", margin: "0 0 8px" }}>
                  {text("History Locked — Email Verification Required")}
                </h3>
                <p style={{ color: "#9CA3AF", fontSize: "0.875rem", maxWidth: "440px", margin: "0 auto 20px" }}>
                  {text("Please verify your email address to review your transaction ledger.")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW 6: PERSONAL PROFILE INFORMATION ───────────────────────────── */}
        {activeTab === "profile" && (
          <div className="profile-card-section">
            <h2>
              <User size={20} color="#FDE047" />
              <span>{text("Personal Profile Information")}</span>
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: "0.875rem", marginBottom: "20px" }}>
              {text("Manage your display name and view your registered lottery account details.")}
            </p>

            <form onSubmit={handleUpdateProfile} style={{ maxWidth: "540px" }}>
              <div className="auth-form-group">
                <label htmlFor="edit-name">{text("Full Legal Name")}</label>
                <input
                  id="edit-name"
                  type="text"
                  required
                  maxLength={120}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={text("Full Name")}
                />
                <small style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>
                  {text("Ensure your name matches your government ID for prize settlement verification.")}
                </small>
              </div>

              <div className="auth-form-group">
                <label htmlFor="display-email">
                  <span>{text("Email Address")}</span>
                  <span style={{ fontSize: "0.75rem", color: isVerified ? "#34D399" : "#FBBF24" }}>
                    {isVerified ? text("Verified") : text("Unverified")}
                  </span>
                </label>
                <input
                  id="display-email"
                  type="email"
                  disabled
                  value={session.user.email}
                  style={{ opacity: 0.7, cursor: "not-allowed", background: "#0B111E" }}
                />
                <small style={{ color: "#9CA3AF", fontSize: "0.75rem" }}>
                  {text("To change your email address, contact platform security support.")}
                </small>
              </div>

              <div className="auth-form-group">
                <label>{text("Account ID")}</label>
                <code
                  style={{
                    background: "#0B111E",
                    padding: "10px",
                    borderRadius: "8px",
                    color: "#FDE047",
                    fontSize: "0.8125rem",
                    border: "1px solid #374151",
                    display: "block",
                  }}
                >
                  {session.user.id}
                </code>
              </div>

              <button
                type="submit"
                disabled={isUpdatingName || name === session.user.name}
                className="casino-btn-gold"
                style={{ marginTop: "12px", padding: "10px 20px", fontSize: "0.875rem" }}
              >
                {isUpdatingName ? text("Saving…") : text("Save Changes")}
              </button>

              {nameSuccess && (
                <div className="auth-alert-message success" style={{ marginTop: "16px" }}>
                  <CheckCircle2 size={16} />
                  <span>{nameSuccess}</span>
                </div>
              )}
              {nameError && (
                <div className="auth-alert-message error" style={{ marginTop: "16px" }}>
                  <AlertCircle size={16} />
                  <span>{nameError}</span>
                </div>
              )}
            </form>
          </div>
        )}

        {/* ── VIEW 7: SECURITY & 2-FACTOR AUTH ───────────────────────────────── */}
        {activeTab === "security" && (
          <div>
            {/* Two-Factor Authentication Card */}
            <div className="profile-card-section">
              <h2>
                <ShieldCheck size={20} color="#FDE047" />
                <span>{text("Two-Factor Authentication (2FA / TOTP)")}</span>
              </h2>
              <p style={{ color: "#9CA3AF", fontSize: "0.875rem", marginBottom: "20px" }}>
                {text(
                  "Add a time-based authenticator (Google Authenticator, Authy, or Microsoft Authenticator) to protect your lottery wallet, purchases, and winnings."
                )}
              </p>

              {is2FaEnabled ? (
                <div
                  style={{
                    background: "rgba(16, 185, 129, 0.1)",
                    border: "1.5px solid #10B981",
                    borderRadius: "14px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      marginBottom: "12px",
                    }}
                  >
                    <CheckCircle2 size={24} color="#10B981" />
                    <div>
                      <strong style={{ color: "#34D399", fontSize: "1rem" }}>
                        {text("Two-Factor Authentication is Active")}
                      </strong>
                      <p style={{ color: "#D1D5DB", fontSize: "0.8125rem", margin: "2px 0 0" }}>
                        {text(
                          "Your account is secured with a TOTP authenticator app. Sign-ins and sensitive transactions require a 6-digit code."
                        )}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleDisableTwoFa}
                    style={{
                      padding: "8px 16px",
                      background: "rgba(239, 68, 68, 0.2)",
                      border: "1px solid #EF4444",
                      borderRadius: "8px",
                      color: "#FCA5A5",
                      fontSize: "0.8125rem",
                      fontWeight: 800,
                      cursor: "pointer",
                    }}
                  >
                    {text("Disable Two-Factor Authentication")}
                  </button>
                </div>
              ) : (
                <div>
                  {!isSettingUp2Fa ? (
                    <div style={{ maxWidth: "480px" }}>
                      <p style={{ color: "#D1D5DB", fontSize: "0.875rem", marginBottom: "16px" }}>
                        {text("Enter your current account password to begin authenticator setup:")}
                      </p>
                      <div className="auth-form-group">
                        <label htmlFor="twofa-pwd">{text("Current Password")}</label>
                        <input
                          id="twofa-pwd"
                          type="password"
                          placeholder="••••••••••••"
                          value={twoFaPassword}
                          onChange={(e) => setTwoFaPassword(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleInitTwoFa}
                        className="casino-btn-gold"
                        style={{ padding: "10px 20px", fontSize: "0.875rem" }}
                      >
                        {text("Set Up Authenticator")}
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: "rgba(15, 23, 42, 0.8)",
                        border: "1.5px solid rgba(253, 224, 71, 0.4)",
                        borderRadius: "16px",
                        padding: "24px",
                      }}
                    >
                      <h3 style={{ color: "#FDE047", fontSize: "1.1rem", margin: "0 0 12px" }}>
                        {text("1. Scan QR Code in Your Authenticator")}
                      </h3>
                      <p style={{ color: "#D1D5DB", fontSize: "0.8125rem", marginBottom: "16px" }}>
                        {text("Open Google Authenticator, Authy, or 1Password and scan the QR code below:")}
                      </p>

                      {qrCodeDataUrl ? (
                        <div
                          style={{
                            display: "inline-block",
                            padding: "10px",
                            background: "#FFFFFF",
                            borderRadius: "10px",
                            marginBottom: "20px",
                          }}
                        >
                          <img
                            src={qrCodeDataUrl}
                            alt="2FA QR Code"
                            width={180}
                            height={180}
                            style={{ display: "block" }}
                          />
                        </div>
                      ) : (
                        <p style={{ color: "#9CA3AF" }}>{text("Generating code…")}</p>
                      )}

                      <h4 style={{ color: "#FDE047", fontSize: "0.95rem", margin: "0 0 8px" }}>
                        {text("Or Enter Secret Key Manually:")}
                      </h4>
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "20px",
                        }}
                      >
                        <code
                          style={{
                            background: "#0B111E",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            color: "#FDE047",
                            fontSize: "0.95rem",
                            letterSpacing: "1px",
                            border: "1px solid rgba(253, 224, 71, 0.3)",
                          }}
                        >
                          {getTotpSecret(totpUri)}
                        </code>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(getTotpSecret(totpUri));
                            setCopiedSecret(true);
                            setTimeout(() => setCopiedSecret(false), 2500);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            padding: "8px 12px",
                            background: "#1F2937",
                            border: "1px solid #374151",
                            borderRadius: "8px",
                            color: "#F9FAFB",
                            fontSize: "0.8125rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {copiedSecret ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                          <span>{copiedSecret ? text("Copied!") : text("Copy Secret Key")}</span>
                        </button>
                      </div>

                      <h3 style={{ color: "#FDE047", fontSize: "1.1rem", margin: "0 0 12px" }}>
                        {text("2. Save Your Recovery Backup Codes")}
                      </h3>
                      <p style={{ color: "#9CA3AF", fontSize: "0.8125rem", marginBottom: "12px" }}>
                        {text(
                          "Keep these single-use recovery codes in a secure place. If you lose access to your authenticator, they can restore your account:"
                        )}
                      </p>
                      <div
                        style={{
                          background: "#0B111E",
                          padding: "12px",
                          borderRadius: "8px",
                          border: "1px solid rgba(255, 255, 255, 0.08)",
                          marginBottom: "10px",
                        }}
                      >
                        <pre
                          style={{
                            margin: 0,
                            color: "#93C5FD",
                            fontFamily: "monospace",
                            fontSize: "0.8125rem",
                            lineHeight: "1.8",
                          }}
                        >
                          {backupCodes.join("   ·   ")}
                        </pre>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(backupCodes.join("\n"));
                          setCopiedBackups(true);
                          setTimeout(() => setCopiedBackups(false), 2500);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "6px 12px",
                          background: "#1F2937",
                          border: "1px solid #374151",
                          borderRadius: "8px",
                          color: "#F9FAFB",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          marginBottom: "24px",
                        }}
                      >
                        {copiedBackups ? <Check size={13} color="#10B981" /> : <Copy size={13} />}
                        <span>{copiedBackups ? text("Copied All Codes!") : text("Copy All Codes")}</span>
                      </button>

                      <h3 style={{ color: "#FDE047", fontSize: "1.1rem", margin: "0 0 12px" }}>
                        {text("3. Enter 6-digit Code to Finalize")}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          alignItems: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        <input
                          type="text"
                          placeholder="123456"
                          maxLength={6}
                          value={verifyTotpCode}
                          onChange={(e) => setVerifyTotpCode(e.target.value)}
                          style={{
                            width: "140px",
                            textAlign: "center",
                            fontSize: "1.2rem",
                            letterSpacing: "4px",
                            padding: "10px",
                            background: "#0B111E",
                            border: "1.5px solid #FDE047",
                            borderRadius: "8px",
                            color: "#FDE047",
                            fontWeight: 800,
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyTwoFa}
                          className="casino-btn-gold"
                          style={{ padding: "10px 20px", fontSize: "0.875rem" }}
                        >
                          {text("Verify and Enable 2FA")}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {twoFaMsg && (
                <div className="auth-alert-message success" style={{ marginTop: "16px" }}>
                  <CheckCircle2 size={16} />
                  <span>{twoFaMsg}</span>
                </div>
              )}
              {twoFaError && (
                <div className="auth-alert-message error" style={{ marginTop: "16px" }}>
                  <AlertCircle size={16} />
                  <span>{twoFaError}</span>
                </div>
              )}
            </div>

            {/* Change Password Card */}
            <div className="profile-card-section">
              <h2>
                <Lock size={20} color="#FDE047" />
                <span>{text("Change Account Password")}</span>
              </h2>
              <p style={{ color: "#9CA3AF", fontSize: "0.875rem", marginBottom: "20px" }}>
                {text("Ensure your password is at least 12 characters long and not used on other websites.")}
              </p>

              <form onSubmit={handleChangePassword} style={{ maxWidth: "480px" }}>
                <div className="auth-form-group">
                  <label htmlFor="cur-pwd">{text("Current Password")}</label>
                  <input
                    id="cur-pwd"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••••••"
                  />
                </div>

                <div className="auth-form-group">
                  <label htmlFor="new-pwd">{text("New Password")}</label>
                  <input
                    id="new-pwd"
                    type="password"
                    required
                    minLength={12}
                    maxLength={128}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder={text("Minimum 12 characters")}
                  />
                </div>

                <div className="auth-form-group">
                  <label htmlFor="confirm-pwd">{text("Confirm New Password")}</label>
                  <input
                    id="confirm-pwd"
                    type="password"
                    required
                    minLength={12}
                    maxLength={128}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={text("Re-type new password")}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="casino-btn-gold"
                  style={{ marginTop: "10px", padding: "10px 20px", fontSize: "0.875rem" }}
                >
                  {isChangingPassword ? text("Updating…") : text("Update Password")}
                </button>

                {passwordStatus && (
                  <div className="auth-alert-message success" style={{ marginTop: "16px" }}>
                    <CheckCircle2 size={16} />
                    <span>{passwordStatus}</span>
                  </div>
                )}
                {passwordError && (
                  <div className="auth-alert-message error" style={{ marginTop: "16px" }}>
                    <AlertCircle size={16} />
                    <span>{passwordError}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page-container">
          <div className="auth-card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <Sparkles size={36} color="#FDE047" style={{ margin: "0 auto 16px" }} />
            <p style={{ color: "#D1D5DB" }}>Loading portal…</p>
          </div>
        </div>
      }
    >
      <UserPortalContent />
    </Suspense>
  );
}
