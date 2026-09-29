"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearAccountToken } from "@/lib/account-api";
import { WalletPanel } from "@/components/WalletPanel";
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

export default function ProfilePage() {
  const router = useRouter();
  const { text } = useLanguage();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Active section tab
  const [activeTab, setActiveTab] = useState<"wallet" | "history" | "profile" | "security">("wallet");

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

  // Handle URL hash navigation (e.g. /profile#wallet, /profile#history, /profile#profile, /profile#security)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash === "wallet" || hash === "history" || hash === "profile" || hash === "security") {
        setActiveTab(hash as any);
      }
    }
  }, []);

  // Redirect to login if unauthenticated
  useEffect(() => {
    if (!sessionLoading && !session) {
      router.replace(`/login?redirect=${encodeURIComponent("/profile")}`);
    }
  }, [sessionLoading, session, router]);

  if (sessionLoading || !session) {
    return (
      <div className="auth-page-container">
        <div className="auth-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Sparkles size={36} color="#FDE047" style={{ margin: "0 auto 16px", animation: "spin 2s linear infinite" }} />
          <p style={{ color: "#D1D5DB" }}>{text("Loading your profile…")}</p>
        </div>
      </div>
    );
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
      setPasswordError("New passwords do not match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: false,
      });

      if (res?.error) {
        throw new Error(res.error.message || "Failed to change password.");
      }

      setPasswordStatus("Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordStatus(""), 4000);
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password. Please verify your current password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  // 2FA Setup Initiation
  async function handleInitTwoFa() {
    setTwoFaMsg("");
    setTwoFaError("");
    if (!twoFaPassword) {
      setTwoFaError("Please enter your current password to set up two-factor authentication.");
      return;
    }

    try {
      const res = await authClient.twoFactor.enable({ password: twoFaPassword });
      if (res?.error) {
        throw new Error(res.error.message || "Could not initialize two-factor authentication.");
      }

      if (res.data?.method === "totp") {
        const uri = res.data.totpURI;
        setTotpUri(uri);
        setBackupCodes(res.data.backupCodes || []);
        setIsSettingUp2Fa(true);

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
        throw new Error(res.error.message || "Invalid authenticator code. Please check your app.");
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
    if (!confirm("Are you sure you want to disable two-factor authentication? This reduces your account security.")) {
      return;
    }
    const pwd = prompt("Enter your current password to confirm disabling two-factor authentication:");
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

  return (
    <div className="profile-page-wrapper">
      {/* ── 1. Hero Profile Banner ─── */}
      <div className="profile-hero-card">
        <div className="profile-hero-left">
          <div className="profile-avatar-large">
            {session.user.name ? session.user.name.trim().charAt(0).toUpperCase() : "U"}
          </div>
          <div className="profile-info-heading">
            <h1>{session.user.name}</h1>
            <p className="profile-email">{session.user.email}</p>
            <div className="profile-badges-row">
              {isVerified ? (
                <span className="status-badge-pill verified">
                  <CheckCircle2 size={13} /> {text("Email Verified")}
                </span>
              ) : (
                <span className="status-badge-pill unverified">
                  <AlertCircle size={13} /> {text("Email Unverified")}
                </span>
              )}

              {is2FaEnabled ? (
                <span className="status-badge-pill twofa-active">
                  <ShieldCheck size={13} /> {text("2FA Protected")}
                </span>
              ) : (
                <span className="status-badge-pill unverified">
                  <ShieldAlert size={13} /> {text("2FA Not Enabled")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick actions on the right */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <Link
            href="/my-tickets"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              background: "#1F2937",
              border: "1px solid rgba(253, 224, 71, 0.4)",
              borderRadius: "10px",
              color: "#FDE047",
              fontSize: "0.8125rem",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            <Ticket size={15} />
            <span>{text("My Tickets")}</span>
          </Link>

          <Link
            href="/#choose-ticket"
            className="casino-btn-gold"
            style={{ padding: "8px 16px", fontSize: "0.8125rem", textDecoration: "none" }}
          >
            <span>{text("Buy Tickets")}</span>
            <ArrowRight size={14} />
          </Link>

          <button
            type="button"
            onClick={async () => {
              await authClient.signOut();
              clearAccountToken();
              router.replace("/");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 14px",
              background: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              borderRadius: "10px",
              color: "#FCA5A5",
              fontSize: "0.8125rem",
              fontWeight: 800,
              cursor: "pointer",
            }}
          >
            <LogOut size={14} />
            <span>{text("Sign Out")}</span>
          </button>
        </div>
      </div>

      {/* Unverified Email Warning Bar */}
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
                {text("A verified email is required for secure wallet deposits, ticket participation, and prize notifications.")}
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
                  callbackURL: "/profile",
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

      {/* ── 2. Navigation Pills ─── */}
      <div className="profile-nav-pills" role="tablist">
        <button
          type="button"
          className={`profile-nav-pill-btn ${activeTab === "wallet" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("wallet");
            window.location.hash = "wallet";
          }}
        >
          <Wallet size={16} />
          <span>{text("My Wallet & Balances")}</span>
        </button>

        <button
          type="button"
          className={`profile-nav-pill-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("history");
            window.location.hash = "history";
          }}
        >
          <History size={16} />
          <span>{text("Deposit & Balance History")}</span>
        </button>

        <button
          type="button"
          className={`profile-nav-pill-btn ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("profile");
            window.location.hash = "profile";
          }}
        >
          <User size={16} />
          <span>{text("Profile Information")}</span>
        </button>

        <button
          type="button"
          className={`profile-nav-pill-btn ${activeTab === "security" ? "active" : ""}`}
          onClick={() => {
            setActiveTab("security");
            window.location.hash = "security";
          }}
        >
          <ShieldCheck size={16} />
          <span>{text("Security & 2-Factor Auth")}</span>
        </button>
      </div>

      {/* ── 3. Tab Contents ─── */}

      {/* TAB 1: WALLET & BALANCES */}
      {activeTab === "wallet" && (
        <div>
          {isVerified ? (
            <WalletPanel
              key={session.user.id + "-wallet"}
              userId={session.user.id}
              view="balances"
              onGoToHistory={() => {
                setActiveTab("history");
                window.location.hash = "history";
              }}
            />
          ) : (
            <div className="profile-card-section" style={{ textAlign: "center", padding: "40px 20px" }}>
              <Lock size={36} color="#FBBF24" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ color: "#F9FAFB", fontSize: "1.2rem", margin: "0 0 8px" }}>
                {text("Wallet Locked — Email Verification Required")}
              </h3>
              <p style={{ color: "#9CA3AF", fontSize: "0.875rem", maxWidth: "440px", margin: "0 auto 20px" }}>
                {text("Please click the verification link sent to your email to unlock your multi-currency wallet, deposit capabilities, and balance tracking.")}
              </p>
              <button
                type="button"
                onClick={async () => {
                  await authClient.sendVerificationEmail({
                    email: session.user.email,
                    callbackURL: "/profile",
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

      {/* TAB 2: DEPOSIT & BALANCE HISTORY */}
      {activeTab === "history" && (
        <div>
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
                {text("Please click the verification link sent to your email to view your financial transactions and deposit history.")}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PROFILE INFORMATION EDIT */}
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
              <code style={{ background: "#0B111E", padding: "10px", borderRadius: "8px", color: "#FDE047", fontSize: "0.8125rem", border: "1px solid #374151" }}>
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

      {/* TAB 3: SECURITY & 2-FACTOR AUTH */}
      {activeTab === "security" && (
        <div>
          {/* Two-Factor Authentication Card */}
          <div className="profile-card-section">
            <h2>
              <ShieldCheck size={20} color="#FDE047" />
              <span>{text("Two-Factor Authentication (2FA / TOTP)")}</span>
            </h2>
            <p style={{ color: "#9CA3AF", fontSize: "0.875rem", marginBottom: "20px" }}>
              {text("Add a time-based authenticator (Google Authenticator, Authy, or Microsoft Authenticator) to protect your lottery wallet, purchases, and winnings.")}
            </p>

            {is2FaEnabled ? (
              <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1.5px solid #10B981", borderRadius: "14px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <CheckCircle2 size={24} color="#10B981" />
                  <div>
                    <strong style={{ color: "#34D399", fontSize: "1rem" }}>
                      {text("Two-Factor Authentication is Active")}
                    </strong>
                    <p style={{ color: "#D1D5DB", fontSize: "0.8125rem", margin: "2px 0 0" }}>
                      {text("Your account is secured with a TOTP authenticator app. Sign-ins and sensitive transactions require a 6-digit code.")}
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
                  <div style={{ background: "rgba(15, 23, 42, 0.8)", border: "1.5px solid rgba(253, 224, 71, 0.4)", borderRadius: "16px", padding: "24px" }}>
                    <h3 style={{ color: "#FDE047", fontSize: "1.1rem", margin: "0 0 12px" }}>
                      {text("1. Scan QR Code in Your Authenticator")}
                    </h3>
                    <p style={{ color: "#D1D5DB", fontSize: "0.8125rem", marginBottom: "16px" }}>
                      {text("Open Google Authenticator, Authy, or 1Password and scan the QR code below:")}
                    </p>

                    {qrCodeDataUrl ? (
                      <div style={{ display: "inline-block", padding: "10px", background: "#FFFFFF", borderRadius: "10px", marginBottom: "20px" }}>
                        <img src={qrCodeDataUrl} alt="2FA QR Code" width={180} height={180} style={{ display: "block" }} />
                      </div>
                    ) : (
                      <p style={{ color: "#9CA3AF" }}>{text("Generating code…")}</p>
                    )}

                    <h4 style={{ color: "#FDE047", fontSize: "0.95rem", margin: "0 0 8px" }}>
                      {text("Or Enter Secret Key Manually:")}
                    </h4>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
                      <code style={{ background: "#0B111E", padding: "8px 14px", borderRadius: "8px", color: "#FDE047", fontSize: "0.95rem", letterSpacing: "1px", border: "1px solid rgba(253, 224, 71, 0.3)" }}>
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
                      {text("Keep these single-use recovery codes in a secure place. If you lose access to your authenticator, they can restore your account:")}
                    </p>
                    <div style={{ background: "#0B111E", padding: "12px", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: "10px" }}>
                      <pre style={{ margin: 0, color: "#93C5FD", fontFamily: "monospace", fontSize: "0.8125rem", lineHeight: "1.8" }}>
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
                    <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
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
  );
}
