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
  Eye,
  EyeOff,
  Dice5,
  Sun,
  Moon,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearAccountToken, accountAPI } from "@/lib/account-api";
import { publicAPI, type BackendDraw, type Order } from "@/lib/backend";
import { WalletPanel } from "@/components/WalletPanel";
import { BuyTicketFlowModal } from "@/components/BuyTicketFlowModal";
import { type WalletData, type Deposit, type WalletPage } from "@/lib/wallet";
import { money } from "@/lib/admin";
import { formatDisplayDate } from "@/lib/date";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { useBalanceVisibility } from "@/lib/balance-visibility";

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
  | "lotteries"
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
  const { showBalance, toggleBalance, formatBalance } = useBalanceVisibility();

  // In-portal ticket purchase modal state
  const [activeDrawForModal, setActiveDrawForModal] = useState<BackendDraw | null>(null);
  const [lotteriesCurrency, setLotteriesCurrency] = useState<"ALL" | "ETB" | "USD">("ALL");

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

  // Theme state: "dark" (default) or "light"
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("rimna-portal-theme");
      if (savedTheme === "light" || savedTheme === "dark") {
        setTheme(savedTheme);
      } else {
        setTheme("dark");
      }
    } catch {
      // localStorage may not be accessible in some environments
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    try {
      localStorage.setItem("rimna-portal-theme", nextTheme);
    } catch {
      // ignore
    }
  };

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
      "lotteries",
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
  const loadPortalData = React.useCallback(async () => {
    if (!session?.user?.id) return;
    setLoadingData(true);
    try {
      const [walletRes, ordersRes, depositsRes, drawsRes] =
        await Promise.allSettled([
          accountAPI<WalletData>("/wallet?currency=ETB"),
          accountAPI<Order[]>("/orders?offset=0"),
          accountAPI<WalletPage<Deposit>>("/deposits?offset=0"),
          publicAPI<BackendDraw[]>("/draws"),
        ]);

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
      setLoadingData(false);
    }

    // Check if user is strictly admin
    try {
      const staffRes = await accountAPI<{ role: string; userId: string }>(
        "/admin/session"
      );
      if (staffRes.role === "admin") {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    } catch {
      setIsAdmin(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

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
  const usdBalance =
    wallet?.balances?.find((b) => b.currency === "USD")?.availableMinor ?? 0;
  const etbBalanceDisplay = money(etbBalance, "ETB");
  const usdBalanceDisplay = money(usdBalance, "USD");
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

  // Calculate wins and losses
  const wonOrders = orders.filter((o) => o.status === "won" || o.status === "winner");
  const lostOrders = orders.filter((o) => {
    if (o.status === "lost") return true;
    const d = draws.find((item) => item.id === o.drawId);
    return d?.status === "completed" && o.status !== "won" && o.status !== "winner";
  });
  const totalWonMinor = wonOrders.reduce((sum, o) => sum + (o.amountMinor || 0), 0);
  const totalLostMinor = lostOrders.reduce((sum, o) => sum + (o.amountMinor || 0), 0);

  const tabNames: Record<PortalTab, string> = {
    dashboard: text("Dashboard"),
    lotteries: text("Explore Lotteries"),
    tickets: text("Purchased Tickets"),
    wallet: text("My Wallet & Balances"),
    deposit: text("Deposit Funds"),
    history: text("Deposit & History"),
    profile: text("Profile Information"),
    security: text("Security & 2FA"),
  };

  return (
    <div className={`user-portal-container ${theme === "dark" ? "dark-theme" : "light-theme"}`}>
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
            <LayoutDashboard size={18} />
            <span>{text("Dashboard")}</span>
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "tickets" ? "active" : ""}`}
            onClick={() => switchTab("tickets")}
          >
            <Ticket size={18} />
            <span>{text("Purchased Tickets")}</span>
            {orders.length > 0 && (
              <span className="portal-nav-badge">
                {orders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "wallet" ? "active" : ""}`}
            onClick={() => switchTab("wallet")}
          >
            <Wallet size={18} />
            <span>{text("My Wallet & Balances")}</span>
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "deposit" ? "active" : ""}`}
            onClick={() => switchTab("deposit")}
          >
            <CreditCard size={18} />
            <span>{text("Deposit Funds")}</span>
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "history" ? "active" : ""}`}
            onClick={() => switchTab("history")}
          >
            <History size={18} />
            <span>{text("Deposit & History")}</span>
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => switchTab("profile")}
          >
            <User size={18} />
            <span>{text("Profile Information")}</span>
          </button>

          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "security" ? "active" : ""}`}
            onClick={() => switchTab("security")}
          >
            <ShieldCheck size={18} />
            <span>{text("Security & 2FA")}</span>
          </button>

          {/* In-Portal Dedicated Explore Lotteries Tab */}
          <button
            type="button"
            className={`portal-nav-btn ${activeTab === "lotteries" ? "active" : ""}`}
            onClick={() => switchTab("lotteries")}
            style={{ marginTop: 10, borderTop: "1px solid rgba(255, 255, 255, 0.12)" }}
          >
            <Flame size={18} />
            <span>{text("Explore Lotteries")}</span>
            <span className="portal-nav-badge">
              {draws.filter((d) => d.status === "open").length}
            </span>
          </button>

          {/* Only render Staff Admin Portal if strictly ADMIN */}
          {isAdmin && (
            <Link
              href="/admin"
              className="portal-nav-btn"
              style={{
                marginTop: 4,
                background: "rgba(255, 255, 255, 0.15)",
                border: "1px solid rgba(255, 255, 255, 0.25)",
                color: "#FFFFFF",
              }}
            >
              <ShieldAlert size={18} />
              <span>{text("Staff Admin Portal")}</span>
            </Link>
          )}
        </nav>

        {/* Dedicated Fixed Sidebar Footer: Support Card & Sign Out */}
        <div className="portal-sidebar-footer">
          {/* 24/7 Support Card matching reference image */}
          <div className="portal-sidebar-support-card">
            <div className="portal-sidebar-support-icon">24/7</div>
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.25 }}>
              <strong style={{ fontSize: "0.8125rem", color: "#FFFFFF", fontWeight: 800 }}>
                {text("24/7 Support")}
              </strong>
              <span style={{ fontSize: "0.6875rem", color: "rgba(255, 255, 255, 0.75)" }}>
                {text("Live Player Helpdesk")}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="portal-nav-btn"
            style={{
              color: "#FECACA",
              background: "rgba(239, 68, 68, 0.15)",
            }}
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
      </aside>

      {/* ── 2. Portal Main Content Area ────────────────────────────────────── */}
      <main className="portal-main-content">
        {/* Sleek Portal Topbar Header */}
        <header className="portal-topbar">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Link
              href="/"
              className="portal-topbar-home-btn"
            >
              <Home size={15} color={theme === "dark" ? "#FDE047" : "#1B7A53"} />
              <span>{text("Home")}</span>
            </Link>

            <div className="portal-topbar-breadcrumb">
              <ChevronRight size={14} style={{ color: "#94A3B8" }} />
              <strong>{tabNames[activeTab]}</strong>
            </div>
          </div>

          {/* Right corner of header: Balance with Eye Toggle + Theme Toggle + Profile Overview */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div className="portal-topbar-balance-pill">
              <button
                type="button"
                onClick={() => switchTab("wallet")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  background: "transparent",
                  border: "none",
                  fontSize: "0.8125rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  padding: 0,
                }}
                title={text("My Wallet & Balances")}
              >
                <Wallet size={15} color={theme === "dark" ? "#FDE047" : "#1B7A53"} />
                <span>{formatBalance(totalBalanceDisplay, "ETB")}</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBalance();
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: theme === "dark" ? "#FDE047" : "#1B7A53",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.85,
                  borderRadius: 6,
                  transition: "opacity 0.2s",
                }}
                title={showBalance ? text("Hide balance") : text("Show balance")}
                aria-label={showBalance ? text("Hide balance") : text("Show balance")}
              >
                {showBalance ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
            </div>

            {/* Theme Toggle Button to the left of the user's component */}
            <button
              type="button"
              onClick={toggleTheme}
              className="portal-theme-toggle-btn"
              title={theme === "dark" ? text("Switch to Light Mode") : text("Switch to Dark Mode")}
              aria-label={theme === "dark" ? text("Switch to Light Mode") : text("Switch to Dark Mode")}
            >
              {theme === "dark" ? (
                <>
                  <Sun size={15} className="theme-toggle-sun" />
                  <span className="theme-toggle-label">{text("Light")}</span>
                </>
              ) : (
                <>
                  <Moon size={15} className="theme-toggle-moon" />
                  <span className="theme-toggle-label">{text("Dark")}</span>
                </>
              )}
            </button>

            {/* Profile Overview at the corner in the header */}
            <div
              className="portal-topbar-profile-btn"
              onClick={() => switchTab("profile")}
              title={text("Profile & Settings")}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FDE047 0%, #D97706 100%)",
                  color: "#111827",
                  fontWeight: 900,
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 2px 6px rgba(234, 179, 8, 0.25)",
                  flexShrink: 0,
                }}
              >
                {session?.user?.name ? session.user.name.trim().charAt(0).toUpperCase() : "U"}
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <strong style={{ fontSize: "0.8125rem", fontWeight: 800 }}>
                  {session?.user?.name || "Lottery Player"}
                </strong>
                {isVerified ? (
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 800,
                      background: theme === "dark" ? "rgba(16, 185, 129, 0.2)" : "#ECFDF5",
                      color: theme === "dark" ? "#34D399" : "#059669",
                      padding: "1px 6px",
                      borderRadius: 9999,
                      border: theme === "dark" ? "1px solid rgba(52, 211, 153, 0.4)" : "1px solid #A7F3D0",
                    }}
                  >
                    ✓ {text("Verified")}
                  </span>
                ) : (
                  <span
                    style={{
                      fontSize: "0.625rem",
                      fontWeight: 800,
                      background: theme === "dark" ? "rgba(245, 158, 11, 0.2)" : "#FFFBEB",
                      color: theme === "dark" ? "#FDE047" : "#D97706",
                      padding: "1px 6px",
                      borderRadius: 9999,
                      border: theme === "dark" ? "1px solid rgba(253, 224, 71, 0.4)" : "1px solid #FDE68A",
                    }}
                  >
                    ! {text("Unverified")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </header>

        <div className="portal-body-scroll">
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
                <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1E293B", margin: 0 }}>
                  {text("Player Dashboard")}
                </h1>
                <p style={{ color: "#64748B", fontSize: "0.875rem", margin: "4px 0 0" }}>
                  {text("Welcome back,")} <strong style={{ color: "#1B7A53" }}>{session.user.name}</strong>. {text("Here is your lottery activity and active tickets.")}
                </p>
              </div>

              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => switchTab("deposit")}
                  className="portal-btn-primary"
                  style={{ padding: "8px 16px", fontSize: "0.8125rem" }}
                >
                  <Plus size={15} strokeWidth={3} />
                  <span>{text("Deposit Funds")}</span>
                </button>

                <button
                  type="button"
                  onClick={() => switchTab("lotteries")}
                  className="portal-btn-secondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "8px 16px",
                    borderRadius: 10,
                    fontSize: "0.8125rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  <Ticket size={15} />
                  <span>{text("Buy Tickets")}</span>
                </button>
              </div>
            </div>

            {/* 4 Metric Cards: Box 1 (ETB + USD), Box 2 (Purchased Tickets), Box 3 (Total Wins), Box 4 (Total Losses) */}
            <div className="portal-metrics-grid">
              {/* Card 1: Balance in USD and ETB in one box */}
              <div className="portal-metric-card" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                <div className="portal-metric-top">
                  <span className="portal-metric-title">{text("Wallet Balances")}</span>
                  <div
                    className="portal-metric-icon-circle"
                    style={{
                      background: theme === "dark" ? "rgba(253, 224, 71, 0.12)" : "#ECFDF5",
                      color: theme === "dark" ? "#FDE047" : "#1B7A53",
                    }}
                  >
                    <Wallet size={18} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, margin: "6px 0" }}>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#64748B", fontWeight: 700 }}>🇪🇹 ETB</span>
                    <strong style={{ fontSize: "1.2rem", fontWeight: 900, color: theme === "dark" ? "#FDE047" : "#1B7A53", fontFamily: "var(--font-mono, monospace)" }}>
                      {formatBalance(etbBalanceDisplay, "ETB")}
                    </strong>
                  </div>
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                    <span style={{ fontSize: "0.8125rem", color: "#64748B", fontWeight: 700 }}>🇺🇸 USD</span>
                    <strong style={{ fontSize: "1.05rem", fontWeight: 800, color: theme === "dark" ? "#FFFFFF" : "#334155", fontFamily: "var(--font-mono, monospace)" }}>
                      {formatBalance(usdBalanceDisplay, "USD")}
                    </strong>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => switchTab("wallet")}
                  className="portal-metric-sub positive"
                  style={{ background: "transparent", border: "none", padding: 0, cursor: "pointer", textAlign: "left", width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", color: theme === "dark" ? "#FDE047" : "#15803D" }}
                >
                  <span>{text("Manage Balances")}</span>
                  <span>&rarr;</span>
                </button>
              </div>

              {/* Card 2: Purchased Tickets */}
              <div className="portal-metric-card">
                <div className="portal-metric-top">
                  <span className="portal-metric-title">{text("Purchased Tickets")}</span>
                  <div
                    className="portal-metric-icon-circle"
                    style={{
                      background: theme === "dark" ? "rgba(56, 189, 248, 0.12)" : "#EFF6FF",
                      color: theme === "dark" ? "#38BDF8" : "#2563EB",
                    }}
                  >
                    <Ticket size={18} />
                  </div>
                </div>
                <div className="portal-metric-val">{orders.length}</div>
                <div className="portal-metric-sub positive">
                  <span>↑</span>
                  <span>{waitingForDrawTickets.length} {text("Active in Upcoming Draws")}</span>
                </div>
              </div>

              {/* Card 3: Total Wins */}
              <div className="portal-metric-card">
                <div className="portal-metric-top">
                  <span className="portal-metric-title">{text("Total Wins")}</span>
                  <div
                    className="portal-metric-icon-circle"
                    style={{
                      background: theme === "dark" ? "rgba(253, 224, 71, 0.15)" : "#FEF9C3",
                      color: theme === "dark" ? "#FDE047" : "#D97706",
                    }}
                  >
                    <Trophy size={18} />
                  </div>
                </div>
                <div className="portal-metric-val">{wonOrders.length}</div>
                <div className="portal-metric-sub neutral">
                  <span>{wonOrders.length > 0 ? `${formatBalance(money(totalWonMinor, "ETB"), "ETB")} ${text("Won")}` : text("0 Winning Draws Settled")}</span>
                </div>
              </div>

              {/* Card 4: Total Losses */}
              <div className="portal-metric-card">
                <div className="portal-metric-top">
                  <span className="portal-metric-title">{text("Total Losses")}</span>
                  <div
                    className="portal-metric-icon-circle"
                    style={{
                      background: theme === "dark" ? "rgba(148, 163, 184, 0.12)" : "#F1F5F9",
                      color: theme === "dark" ? "#94A3B8" : "#64748B",
                    }}
                  >
                    <History size={18} />
                  </div>
                </div>
                <div className="portal-metric-val">{lostOrders.length}</div>
                <div className="portal-metric-sub neutral">
                  <span>{lostOrders.length > 0 ? `${formatBalance(money(totalLostMinor, "ETB"), "ETB")} ${text("Lost")}` : text("0 Losses Recorded")}</span>
                </div>
              </div>
            </div>

            {/* Waiting for Draw Table Section */}
            <div style={{ marginBottom: 24 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <Clock size={20} color={theme === "dark" ? "#FDE047" : "#1B7A53"} />
                  <h2 style={{ fontSize: "1.25rem", fontWeight: 800, margin: 0 }}>
                    {text("Waiting for Draw")}
                  </h2>
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#64748B", fontWeight: 600 }}>
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
                            <td style={{ fontWeight: 800, color: "#64748B" }}>{idx + 1}</td>
                            <td style={{ fontWeight: 800 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div
                                  style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: "50%",
                                    background: theme === "dark" ? "#FDE047" : "#1B7A53",
                                    boxShadow: theme === "dark" ? "0 0 8px rgba(253, 224, 71, 0.5)" : "0 0 6px rgba(27, 122, 83, 0.4)",
                                  }}
                                />
                                <span>{drawTitle}</span>
                              </div>
                            </td>
                            <td style={{ fontFamily: "monospace", color: "#0284C7", fontWeight: 700 }}>
                              {phaseNumber}
                            </td>
                            <td style={{ fontFamily: "monospace", fontWeight: 900, color: theme === "dark" ? "#FDE047" : "#1B7A53" }}>
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
                            padding: "50px 20px",
                            background: "#FFFFFF",
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
                              color="#1B7A53"
                              style={{ opacity: 0.6 }}
                            />
                            <div style={{ fontSize: "1.15rem", fontWeight: 800, color: "#1E293B" }}>
                              {text("No Tickets in Current Waiting Draw")}
                            </div>
                            <p
                              style={{
                                color: "#64748B",
                                fontSize: "0.875rem",
                                margin: 0,
                                maxWidth: 420,
                              }}
                            >
                              {text(
                                "You do not have any active tickets waiting for the next draw. Pick a lucky ticket from our open lotteries to participate!"
                              )}
                            </p>
                            <button
                              type="button"
                              onClick={() => switchTab("lotteries")}
                              className="portal-btn-primary"
                              style={{
                                marginTop: 8,
                                padding: "9px 20px",
                                fontSize: "0.8125rem",
                              }}
                            >
                              <span>{text("Browse Open Lotteries")}</span>
                              <ArrowRight size={14} />
                            </button>
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

        {/* ── VIEW: EXPLORE LOTTERIES (Dedicated Minimal Ticket Design) ────────── */}
        {activeTab === "lotteries" && (
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
                <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "#1E293B", margin: 0 }}>
                  {text("Available Lottery Draws")}
                </h1>
                <p style={{ color: "#64748B", fontSize: "0.875rem", margin: "4px 0 0" }}>
                  {text("Select an active lottery round, pick your lucky number, and enter to win guaranteed prizes.")}
                </p>
              </div>

              {/* Currency Filter Tabs */}
              <div
                role="group"
                aria-label={text("Filter by Currency")}
                style={{
                  display: "inline-flex",
                  padding: "4px",
                  borderRadius: "10px",
                  gap: "4px",
                }}
              >
                {(["ALL", "ETB", "USD"] as const).map((curr) => {
                  const count =
                    curr === "ALL"
                      ? draws.filter((d) => d.status === "open").length
                      : draws.filter((d) => d.status === "open" && d.currency === curr).length;

                  return (
                    <button
                      key={curr}
                      type="button"
                      onClick={() => setLotteriesCurrency(curr)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "7px",
                        fontSize: "0.8125rem",
                        fontWeight: 800,
                        border: "none",
                        cursor: "pointer",
                        transition: "all 0.15s ease",
                        background: lotteriesCurrency === curr ? (theme === "dark" ? "#FDE047" : "#1B7A53") : "transparent",
                        color: lotteriesCurrency === curr ? (theme === "dark" ? "#0F172A" : "#FFFFFF") : "#94A3B8",
                        boxShadow: lotteriesCurrency === curr ? (theme === "dark" ? "0 2px 8px rgba(253, 224, 71, 0.3)" : "0 2px 6px rgba(27, 122, 83, 0.2)") : "none",
                      }}
                    >
                      {curr === "ALL" ? text("All Draws") : curr} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lottery Cards Grid */}
            {(() => {
              const openDraws = draws.filter(
                (d) => d.status === "open" && (!d.deadline || new Date(d.deadline).getTime() > Date.now())
              );
              const filtered = openDraws.filter((d) => {
                if (lotteriesCurrency === "ALL") return true;
                return d.currency === lotteriesCurrency;
              });

              if (filtered.length === 0) {
                return (
                  <div className="tickets-empty-card">
                    <Ticket size={48} color={theme === "dark" ? "#FDE047" : "#1B7A53"} style={{ margin: "0 auto 16px" }} />
                    <h3 style={{ fontSize: "1.25rem", margin: "0 0 8px" }}>
                      {text("No Active Lotteries in this Category")}
                    </h3>
                    <p style={{ fontSize: "0.875rem", margin: "0 auto 20px", maxWidth: 440 }}>
                      {text("New rounds are scheduled regularly. Switch currency filter or check back shortly.")}
                    </p>
                    <button
                      type="button"
                      onClick={() => setLotteriesCurrency("ALL")}
                      className="portal-btn-primary"
                      style={{ padding: "8px 20px", fontSize: "0.8125rem" }}
                    >
                      {text("Show All Available Draws")}
                    </button>
                  </div>
                );
              }

              return (
                <div className="portal-lotteries-grid">
                  {filtered.map((d) => {
                    const totalPoolMinor = d.priceMinor * d.capacity;
                    const jackpotMinor = Math.round(totalPoolMinor * 0.1925);
                    const soldCount = (d as any).purchasedCount ?? Math.min(d.capacity, Math.max(1, Math.round(d.capacity * 0.35)));
                    const soldPercent = Math.min(100, Math.round((soldCount / d.capacity) * 100));

                    return (
                      <div key={d.id} className="portal-ticket-card">
                        {/* Perforation Left & Right Cutout Notches */}
                        <div className="portal-ticket-notch-left" aria-hidden="true" />
                        <div className="portal-ticket-notch-right" aria-hidden="true" />

                        {/* Top Ticket Body */}
                        <div className="portal-ticket-top">
                          {/* Ribbon: ID + Live Status + Currency */}
                          <div className="portal-ticket-ribbon">
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <span className="portal-ticket-badge-live">
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10B981" }} />
                                {text("LIVE ROUND")}
                              </span>
                              <span style={{ fontSize: "0.75rem", color: "#94A3B8", fontWeight: 700 }}>
                                #{d.id.slice(0, 8)}
                              </span>
                            </div>
                            <span className="portal-ticket-badge-currency">
                              {d.currency === "USD" ? "🇺🇸 USD" : "🇪🇹 ETB"}
                            </span>
                          </div>

                          {/* Draw Title */}
                          <h3 className="portal-ticket-title">{d.title}</h3>

                          {/* Jackpot Highlight Box */}
                          <div className="portal-ticket-jackpot-box">
                            <div className="portal-ticket-jackpot-label">
                              <Trophy size={13} />
                              <span>{text("Guaranteed 1st Prize Jackpot")}</span>
                            </div>
                            <div className="portal-ticket-jackpot-amount">
                              {formatBalance(money(jackpotMinor, d.currency), d.currency)}
                            </div>
                          </div>

                          {/* Ticket Price & Capacity Metrics */}
                          <div className="portal-ticket-info-row">
                            <span style={{ color: "#94A3B8", fontWeight: 600 }}>{text("Ticket Price")}:</span>
                            <strong style={{ color: theme === "dark" ? "#FDE047" : "#1B7A53", fontSize: "0.9375rem" }}>
                              {money(d.priceMinor, d.currency)}
                            </strong>
                          </div>

                          <div className="portal-ticket-info-row" style={{ marginBottom: 2 }}>
                            <span style={{ color: "#94A3B8", fontWeight: 600 }}>{text("Pool Participation")}:</span>
                            <span style={{ color: theme === "dark" ? "#FFFFFF" : "#0F172A", fontWeight: 700 }}>
                              {soldCount} / {d.capacity} {text("Tickets")}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="portal-ticket-progress-bar">
                            <div className="portal-ticket-progress-fill" style={{ width: `${soldPercent}%` }} />
                          </div>

                          {d.deadline && (
                            <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: "0.75rem", color: "#94A3B8", marginTop: 4 }}>
                              <Clock size={12} />
                              <span suppressHydrationWarning>{text("Draw Deadline")}: {formatDisplayDate(d.deadline)}</span>
                            </div>
                          )}
                        </div>

                        {/* Perforation Dashed Line */}
                        <div className="portal-ticket-perforation" />

                        {/* Bottom Action Stub */}
                        <div className="portal-ticket-bottom">
                          <div>
                            <span style={{ fontSize: "0.6875rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase" }}>
                              {text("Entry Fee")}
                            </span>
                            <div style={{ fontSize: "1rem", fontWeight: 900, color: "#1E293B", fontFamily: "var(--font-mono, monospace)" }}>
                              {money(d.priceMinor, d.currency)}
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setActiveDrawForModal(d)}
                            className="portal-btn-primary"
                            style={{ padding: "9px 16px", fontSize: "0.8125rem", gap: 6 }}
                          >
                            <Dice5 size={15} />
                            <span>{text("Pick Numbers & Buy")}</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
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
                <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: 0 }}>
                  {text("My Purchased Tickets")}
                </h1>
                <p style={{ fontSize: "0.875rem", margin: "4px 0 0" }}>
                  {text("All your active and historical lottery tickets with serial codes and draw records.")}
                </p>
              </div>

              <button
                type="button"
                onClick={() => switchTab("lotteries")}
                className="portal-btn-primary"
                style={{
                  padding: "8px 18px",
                  fontSize: "0.8125rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Plus size={15} strokeWidth={3} />
                <span>{text("Buy More Tickets")}</span>
              </button>
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
                          <span suppressHydrationWarning>
                            {text("Purchased:")} {formatDisplayDate(o.createdAt)}
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
                <Ticket size={48} color={theme === "dark" ? "#FDE047" : "#1B7A53"} style={{ margin: "0 auto 16px" }} />
                <h3 style={{ fontSize: "1.25rem", margin: "0 0 8px" }}>
                  {text("No tickets purchased yet")}
                </h3>
                <p style={{ fontSize: "0.875rem", margin: "0 auto 20px", maxWidth: 440 }}>
                  {text("Participate in one of our running lotteries for a chance to win the jackpot!")}
                </p>
                <button
                  type="button"
                  onClick={() => switchTab("lotteries")}
                  className="portal-btn-primary"
                  style={{ padding: "10px 24px", fontSize: "0.875rem" }}
                >
                  {text("Explore Lotteries")} &rarr;
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW 3: MY WALLET & BALANCES ───────────────────────────────────── */}
        {activeTab === "wallet" && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: 0 }}>
                {text("My Wallet & Balances")}
              </h1>
              <p style={{ fontSize: "0.875rem", margin: "4px 0 0" }}>
                {text("Manage your multi-currency player balances, view available funds, and top up your account.")}
              </p>
            </div>

            {isVerified ? (
              <WalletPanel
                key={session.user.id + "-wallet"}
                userId={session.user.id}
                view="balances"
                onGoToDeposit={() => switchTab("deposit")}
                onGoToHistory={() => switchTab("history")}
              />
            ) : (
              <div className="profile-card-section" style={{ textAlign: "center", padding: "40px 20px" }}>
                <Lock size={36} color="#D97706" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1.2rem", margin: "0 0 8px" }}>
                  {text("Wallet Locked — Email Verification Required")}
                </h3>
                <p style={{ fontSize: "0.875rem", maxWidth: "440px", margin: "0 auto 20px" }}>
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
                  className="portal-btn-primary"
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
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: 0 }}>
                {text("Deposit Funds")}
              </h1>
              <p style={{ fontSize: "0.875rem", margin: "4px 0 0" }}>
                {text("Instantly deposit funds into your player wallet via Telebirr, CBE Birr, Awash, and Bank Cards.")}
              </p>
            </div>

            {isVerified ? (
              <WalletPanel
                key={session.user.id + "-deposit"}
                userId={session.user.id}
                view="deposit"
                onGoToHistory={() => switchTab("history")}
              />
            ) : (
              <div className="profile-card-section" style={{ textAlign: "center", padding: "40px 20px" }}>
                <Lock size={36} color="#D97706" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1.2rem", margin: "0 0 8px" }}>
                  {text("Deposit Locked — Email Verification Required")}
                </h3>
                <p style={{ fontSize: "0.875rem", maxWidth: "440px", margin: "0 auto 20px" }}>
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
              <h1 style={{ fontSize: "1.75rem", fontWeight: 900, margin: 0 }}>
                {text("Deposit & Transaction History")}
              </h1>
              <p style={{ fontSize: "0.875rem", margin: "4px 0 0" }}>
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
                <Lock size={36} color="#D97706" style={{ margin: "0 auto 12px" }} />
                <h3 style={{ fontSize: "1.2rem", margin: "0 0 8px" }}>
                  {text("History Locked — Email Verification Required")}
                </h3>
                <p style={{ fontSize: "0.875rem", maxWidth: "440px", margin: "0 auto 20px" }}>
                  {text("Please verify your email address to review your transaction ledger.")}
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── VIEW 6: PERSONAL PROFILE INFORMATION ───────────────────────────── */}
        {activeTab === "profile" && (
          <div className="profile-card-section">
            <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <User size={20} color={theme === "dark" ? "#FDE047" : "#1B7A53"} />
              <span>{text("Personal Profile Information")}</span>
            </h2>
            <p style={{ fontSize: "0.875rem", marginBottom: "20px" }}>
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
                <small style={{ color: "#64748B", fontSize: "0.75rem" }}>
                  {text("Ensure your name matches your government ID for prize settlement verification.")}
                </small>
              </div>

              <div className="auth-form-group">
                <label htmlFor="display-email">
                  <span>{text("Email Address")}</span>
                  <span style={{ fontSize: "0.75rem", color: isVerified ? "#1B7A53" : "#D97706", fontWeight: 700 }}>
                    {isVerified ? text("Verified") : text("Unverified")}
                  </span>
                </label>
                <input
                  id="display-email"
                  type="email"
                  disabled
                  value={session.user.email}
                  style={{ opacity: 0.8, cursor: "not-allowed", background: "#F1F5F9", color: "#64748B" }}
                />
                <small style={{ color: "#64748B", fontSize: "0.75rem" }}>
                  {text("To change your email address, contact platform security support.")}
                </small>
              </div>

              <div className="auth-form-group">
                <label>{text("Account ID")}</label>
                <code
                  style={{
                    background: theme === "dark" ? "#080D1A" : "#F8FAFC",
                    padding: "10px 14px",
                    borderRadius: "10px",
                    color: theme === "dark" ? "#FDE047" : "#1B7A53",
                    fontSize: "0.8125rem",
                    fontWeight: 700,
                    border: theme === "dark" ? "1.5px solid #1E293B" : "1.5px solid #E2E8F0",
                    display: "block",
                  }}
                >
                  {session.user.id}
                </code>
              </div>

              <button
                type="submit"
                disabled={isUpdatingName || name === session.user.name}
                className="portal-btn-primary"
                style={{ marginTop: "12px" }}
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
              <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <ShieldCheck size={20} color={theme === "dark" ? "#FDE047" : "#1B7A53"} />
                <span>{text("Two-Factor Authentication (2FA / TOTP)")}</span>
              </h2>
              <p style={{ fontSize: "0.875rem", marginBottom: "20px" }}>
                {text(
                  "Add a time-based authenticator (Google Authenticator, Authy, or Microsoft Authenticator) to protect your lottery wallet, purchases, and winnings."
                )}
              </p>

              {is2FaEnabled ? (
                <div
                  style={{
                    background: "rgba(27, 122, 83, 0.08)",
                    border: "1.5px solid #1B7A53",
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
                    <CheckCircle2 size={24} color="#1B7A53" />
                    <div>
                      <strong style={{ color: "#1B7A53", fontSize: "1rem" }}>
                        {text("Two-Factor Authentication is Active")}
                      </strong>
                      <p style={{ color: "#334155", fontSize: "0.8125rem", margin: "2px 0 0" }}>
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
                      background: "rgba(239, 68, 68, 0.1)",
                      border: "1px solid #EF4444",
                      borderRadius: "8px",
                      color: "#DC2626",
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
                      <p style={{ color: "#334155", fontSize: "0.875rem", marginBottom: "16px" }}>
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
                        className="portal-btn-primary"
                      >
                        {text("Set Up Authenticator")}
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: theme === "dark" ? "#080D1A" : "#F8FAF9",
                        border: theme === "dark" ? "1.5px solid #1E293B" : "1.5px solid #E5EBE7",
                        borderRadius: "16px",
                        padding: "24px",
                      }}
                    >
                      <h3 style={{ fontSize: "1.1rem", margin: "0 0 12px" }}>
                        {text("1. Scan QR Code in Your Authenticator")}
                      </h3>
                      <p style={{ fontSize: "0.8125rem", marginBottom: "16px" }}>
                        {text("Open Google Authenticator, Authy, or 1Password and scan the QR code below:")}
                      </p>

                      {qrCodeDataUrl ? (
                        <div
                          style={{
                            display: "inline-block",
                            padding: "10px",
                            background: "#FFFFFF",
                            borderRadius: "12px",
                            border: "1px solid #E2E8F0",
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
                        <p>{text("Generating code…")}</p>
                      )}

                      <h4 style={{ fontSize: "0.95rem", margin: "0 0 8px" }}>
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
                            background: theme === "dark" ? "#0E1628" : "#FFFFFF",
                            padding: "8px 14px",
                            borderRadius: "8px",
                            color: theme === "dark" ? "#FDE047" : "#1B7A53",
                            fontSize: "0.95rem",
                            fontWeight: 800,
                            letterSpacing: "1px",
                            border: theme === "dark" ? "1.5px solid #1E293B" : "1.5px solid #CBD5E1",
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
                            padding: "8px 14px",
                            background: theme === "dark" ? "#0E1628" : "#FFFFFF",
                            border: theme === "dark" ? "1.5px solid #1E293B" : "1.5px solid #CBD5E1",
                            borderRadius: "8px",
                            color: theme === "dark" ? "#FFFFFF" : "#1E293B",
                            fontSize: "0.8125rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {copiedSecret ? <Check size={14} color={theme === "dark" ? "#FDE047" : "#1B7A53"} /> : <Copy size={14} />}
                          <span>{copiedSecret ? text("Copied!") : text("Copy Secret Key")}</span>
                        </button>
                      </div>

                      <h3 style={{ fontSize: "1.1rem", margin: "0 0 12px" }}>
                        {text("2. Save Your Recovery Backup Codes")}
                      </h3>
                      <p style={{ fontSize: "0.8125rem", marginBottom: "12px" }}>
                        {text(
                          "Keep these single-use recovery codes in a secure place. If you lose access to your authenticator, they can restore your account:"
                        )}
                      </p>
                      <div
                        style={{
                          background: theme === "dark" ? "#0E1628" : "#FFFFFF",
                          padding: "14px",
                          borderRadius: "10px",
                          border: theme === "dark" ? "1.5px solid #1E293B" : "1.5px solid #E2E8F0",
                          marginBottom: "12px",
                        }}
                      >
                        <pre
                          style={{
                            margin: 0,
                            color: theme === "dark" ? "#FDE047" : "#0F172A",
                            fontFamily: "monospace",
                            fontSize: "0.8125rem",
                            fontWeight: 700,
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
                          padding: "6px 14px",
                          background: theme === "dark" ? "#0E1628" : "#FFFFFF",
                          border: theme === "dark" ? "1.5px solid #1E293B" : "1.5px solid #CBD5E1",
                          borderRadius: "8px",
                          color: theme === "dark" ? "#FFFFFF" : "#1E293B",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                          marginBottom: "24px",
                        }}
                      >
                        {copiedBackups ? <Check size={13} color={theme === "dark" ? "#FDE047" : "#1B7A53"} /> : <Copy size={13} />}
                        <span>{copiedBackups ? text("Copied All Codes!") : text("Copy All Codes")}</span>
                      </button>

                      <h3 style={{ fontSize: "1.1rem", margin: "0 0 12px" }}>
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
                            background: theme === "dark" ? "#080D1A" : "#FFFFFF",
                            border: theme === "dark" ? "2px solid #FDE047" : "2px solid #1B7A53",
                            borderRadius: "8px",
                            color: theme === "dark" ? "#FDE047" : "#1B7A53",
                            fontWeight: 800,
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleVerifyTwoFa}
                          className="portal-btn-primary"
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
              <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Lock size={20} color={theme === "dark" ? "#FDE047" : "#1B7A53"} />
                <span>{text("Change Account Password")}</span>
              </h2>
              <p style={{ fontSize: "0.875rem", marginBottom: "20px" }}>
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
                  className="portal-btn-primary"
                  style={{ marginTop: "10px" }}
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

        {/* In-Portal Ticket Purchase Flow Modal */}
        {activeDrawForModal && (
          <BuyTicketFlowModal
            isOpen={!!activeDrawForModal}
            onClose={() => {
              setActiveDrawForModal(null);
              loadPortalData();
            }}
            draw={activeDrawForModal}
          />
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
