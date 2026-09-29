"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Mail,
  User,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearAccountToken } from "@/lib/account-api";
import { useLanguage } from "@/lib/i18n/LanguageContext";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/profile";
  const { text, t } = useLanguage();

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "two-factor">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [isRecoveryCode, setIsRecoveryCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (session && !sessionLoading) {
      router.replace(redirectTarget);
    }
  }, [session, sessionLoading, router, redirectTarget]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      if (mode === "signin") {
        const res: any = await authClient.signIn.email({
          email: email.trim().toLowerCase(),
          password,
          callbackURL: redirectTarget,
        });

        if (res.error) {
          throw new Error(res.error.message || "Failed to sign in. Check your credentials.");
        }

        clearAccountToken();

        if (res.data?.twoFactorRedirect) {
          setMode("two-factor");
          setSuccessMsg("Please enter your 2-Step Authenticator code to continue.");
          return;
        }

        router.replace(redirectTarget);
      } else if (mode === "signup") {
        if (password.length < 12) {
          throw new Error("Password must be at least 12 characters long.");
        }

        const res = await authClient.signUp.email({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
          callbackURL: redirectTarget,
        });

        if (res.error) {
          throw new Error(res.error.message || "Could not create account.");
        }

        clearAccountToken();
        setSuccessMsg(
          "Account created successfully! We sent a verification email to your address. Please check your inbox (and spam folder) to verify your account."
        );
      } else if (mode === "forgot") {
        const res = await authClient.requestPasswordReset({
          email: email.trim().toLowerCase(),
          redirectTo: "/account/reset-password",
        });

        if (res.error) {
          throw new Error(res.error.message || "Could not request password reset.");
        }

        setSuccessMsg("If an account exists with this email, a password reset link has been dispatched.");
      } else if (mode === "two-factor") {
        const res = isRecoveryCode
          ? await authClient.twoFactor.verifyBackupCode({ code: totpCode.trim() })
          : await authClient.twoFactor.verifyTotp({ code: totpCode.trim() });

        if (res.error) {
          throw new Error(res.error.message || "Invalid authenticator code.");
        }

        clearAccountToken();
        router.replace(redirectTarget);
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (sessionLoading) {
    return (
      <div className="auth-page-container">
        <div className="auth-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Sparkles size={36} color="#FDE047" style={{ margin: "0 auto 16px", animation: "spin 2s linear infinite" }} />
          <p style={{ color: "#D1D5DB" }}>{text("Loading session…")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page-container">
      <div className="auth-card">
        {/* Header / Brand */}
        <div className="auth-header">
          <Link href="/" style={{ display: "inline-block", marginBottom: "12px" }}>
            <Image
              src="/images/rimna-brand-logo.png"
              alt="Rimna Digital Lottery"
              width={180}
              height={42}
              priority
              style={{ height: "38px", width: "auto", objectFit: "contain" }}
            />
          </Link>
          <h1>
            {mode === "signin" && (t.nav.signIn || text("Sign In"))}
            {mode === "signup" && text("Create Account")}
            {mode === "forgot" && text("Reset Password")}
            {mode === "two-factor" && text("2-Step Verification")}
          </h1>
          <p>
            {mode === "signin" && text("Access your tickets, wallet balances, and prize settlements.")}
            {mode === "signup" && text("Join thousands of players in transparent live video lottery draws.")}
            {mode === "forgot" && text("Enter your email address to receive a secure password reset link.")}
            {mode === "two-factor" && text("Enter the 6-digit code generated by your Authenticator app.")}
          </p>
        </div>

        {/* Tab switcher (only when not in 2fa mode) */}
        {mode !== "two-factor" && (
          <div className="auth-tabs" role="tablist">
            <button
              type="button"
              className={`auth-tab-btn ${mode === "signin" ? "active" : ""}`}
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
            >
              {text("Sign In")}
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === "signup" ? "active" : ""}`}
              onClick={() => {
                setMode("signup");
                setErrorMsg("");
                setSuccessMsg("");
              }}
            >
              {text("Sign Up")}
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${mode === "forgot" ? "active" : ""}`}
              onClick={() => {
                setMode("forgot");
                setErrorMsg("");
                setSuccessMsg("");
              }}
            >
              {text("Forgot?")}
            </button>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Sign Up: Name field */}
          {mode === "signup" && (
            <div className="auth-form-group">
              <label htmlFor="auth-name">
                <span>{text("Full Name")}</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="auth-name"
                  type="text"
                  required
                  maxLength={120}
                  placeholder={text("e.g. Abebe Bikila")}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  style={{ paddingLeft: "38px" }}
                />
                <User size={16} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "14px" }} />
              </div>
            </div>
          )}

          {/* Email field (for signin, signup, forgot) */}
          {mode !== "two-factor" && (
            <div className="auth-form-group">
              <label htmlFor="auth-email">
                <span>{text("Email Address")}</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="auth-email"
                  type="email"
                  required
                  placeholder={text("you@example.com")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  style={{ paddingLeft: "38px" }}
                />
                <Mail size={16} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "14px" }} />
              </div>
            </div>
          )}

          {/* Password field (for signin, signup) */}
          {(mode === "signin" || mode === "signup") && (
            <div className="auth-form-group">
              <label htmlFor="auth-password">
                <span>{text("Password")}</span>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: "#FDE047",
                      fontSize: "0.75rem",
                      cursor: "pointer",
                      padding: 0,
                    }}
                  >
                    {text("Forgot password?")}
                  </button>
                )}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="auth-password"
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={mode === "signup" ? 12 : undefined}
                  maxLength={128}
                  placeholder={mode === "signup" ? text("Min 12 characters") : "••••••••••••"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "signup" ? "new-password" : "current-password"}
                  style={{ paddingLeft: "38px", paddingRight: "38px" }}
                />
                <Lock size={16} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "14px" }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "14px",
                    background: "none",
                    border: "none",
                    color: "#9CA3AF",
                    cursor: "pointer",
                    padding: 0,
                  }}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {mode === "signup" && (
                <small style={{ color: "#9CA3AF", fontSize: "0.75rem", marginTop: "2px" }}>
                  {text("Must be at least 12 characters long.")}
                </small>
              )}
            </div>
          )}

          {/* 2-Step TOTP Verification */}
          {mode === "two-factor" && (
            <div className="auth-form-group">
              <label htmlFor="auth-totp">
                <span>{isRecoveryCode ? text("Recovery Backup Code") : text("6-Digit Authenticator Code")}</span>
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="auth-totp"
                  type="text"
                  required
                  placeholder={isRecoveryCode ? "XXXXX-XXXXX" : "123456"}
                  maxLength={isRecoveryCode ? 32 : 6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  autoComplete="one-time-code"
                  style={{
                    textAlign: isRecoveryCode ? "left" : "center",
                    letterSpacing: isRecoveryCode ? "1px" : "4px",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    paddingLeft: isRecoveryCode ? "38px" : "14px",
                  }}
                />
                {isRecoveryCode && (
                  <KeyRound size={16} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "14px" }} />
                )}
              </div>

              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                <input
                  type="checkbox"
                  id="use-backup"
                  checked={isRecoveryCode}
                  onChange={(e) => {
                    setIsRecoveryCode(e.target.checked);
                    setTotpCode("");
                  }}
                />
                <label htmlFor="use-backup" style={{ fontSize: "0.8125rem", color: "#D1D5DB", cursor: "pointer" }}>
                  {text("Use a single-use backup recovery code")}
                </label>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" disabled={busy} className="auth-submit-btn">
            {busy ? (
              <span>{text("Please wait…")}</span>
            ) : (
              <>
                <span>
                  {mode === "signin" && (t.nav.signIn || text("Sign In"))}
                  {mode === "signup" && text("Create Free Account")}
                  {mode === "forgot" && text("Send Reset Link")}
                  {mode === "two-factor" && text("Verify & Proceed")}
                </span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {/* Alerts / Feedback */}
        {errorMsg && (
          <div className="auth-alert-message error" role="alert">
            <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="auth-alert-message success" role="status">
            <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
            <div>
              <p style={{ margin: 0 }}>{successMsg}</p>
              {mode === "signup" && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await authClient.sendVerificationEmail({
                        email: email.trim().toLowerCase(),
                        callbackURL: redirectTarget,
                      });
                      setSuccessMsg("Verification email resent! Please check your inbox.");
                    } catch {
                      setErrorMsg("Could not resend email. Please try again shortly.");
                    }
                  }}
                  style={{
                    marginTop: "8px",
                    padding: "4px 10px",
                    background: "rgba(16, 185, 129, 0.2)",
                    border: "1px solid #10B981",
                    borderRadius: "6px",
                    color: "#A7F3D0",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  {text("Resend verification email")}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Footer links */}
        {mode === "forgot" && (
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              style={{
                background: "none",
                border: "none",
                color: "#FDE047",
                fontSize: "0.8125rem",
                cursor: "pointer",
                fontWeight: 700,
              }}
            >
              ← {text("Back to Sign In")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page-container">
          <div className="auth-card" style={{ textAlign: "center", padding: "48px" }}>
            <p style={{ color: "#9CA3AF" }}>Loading…</p>
          </div>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
