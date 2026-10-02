"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Lock,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  Sparkles,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  Phone,
  Send,
  Smartphone,
  RefreshCw,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearAccountToken } from "@/lib/account-api";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { TelegramAuth } from "@/components/TelegramAuth";
import {
  isFirebaseConfigured,
  setupRecaptcha,
  sendFirebasePhoneOtp,
  parseFirebasePhoneError,
} from "@/lib/firebase";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTarget = searchParams.get("redirect") || "/profile";
  const { text, t } = useLanguage();

  const { data: session, isPending: sessionLoading } = authClient.useSession();

  // Mode: "signin" | "signup" | "forgot" | "two-factor"
  const [mode, setMode] = useState<"signin" | "signup" | "forgot" | "two-factor">("signin");

  // Auth Method: "email" | "phone" | "telegram"
  const [authMethod, setAuthMethod] = useState<"email" | "phone" | "telegram">("email");

  // Email form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [isRecoveryCode, setIsRecoveryCode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Phone (Firebase SMS) form state
  const [countryCode, setCountryCode] = useState("+251");
  const [localPhone, setLocalPhone] = useState("");
  const [phoneName, setPhoneName] = useState("");
  const [phoneStep, setPhoneStep] = useState<"enter-phone" | "verify-otp">("enter-phone");
  const [phoneOtp, setPhoneOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [resendTimer, setResendTimer] = useState(0);
  const [adblockDetected, setAdblockDetected] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Detect if Google reCAPTCHA is blocked by client adblocker
  useEffect(() => {
    if (mounted && authMethod === "phone") {
      fetch("https://www.google.com/recaptcha/api.js", { method: "HEAD", mode: "no-cors" })
        .then(() => setAdblockDetected(false))
        .catch(() => setAdblockDetected(true));
    }
  }, [mounted, authMethod]);

  // General State
  const [busy, setBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const recaptchaVerifierRef = useRef<any>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (session && !sessionLoading) {
      router.replace(redirectTarget);
    }
  }, [session, sessionLoading, router, redirectTarget]);

  // Display OAuth redirect errors if present
  useEffect(() => {
    const err = searchParams.get("error");
    if (err) {
      if (err === "state_not_found") {
        setErrorMsg("Session expired or domain mismatch during social login. Please try again.");
      } else if (err === "account_linking_disabled") {
        setErrorMsg("An account with this email already exists.");
      } else {
        setErrorMsg(`Authentication error: ${err}`);
      }
    }
  }, [searchParams]);

  // Resend countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Handle Social Sign-In (Google / Facebook)
  async function handleSocialSignIn(provider: "google" | "facebook") {
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res: any = await authClient.signIn.social({
        provider,
        callbackURL: redirectTarget,
      });

      if (res?.error) {
        if (
          res.error.message?.toLowerCase().includes("provider not found") ||
          res.error.status === 400 ||
          res.error.status === 404
        ) {
          throw new Error(
            `${provider === "google" ? "Google" : "Facebook"} Sign-In is not activated yet. Please configure ${provider === "google" ? "GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET" : "FACEBOOK_CLIENT_ID & FACEBOOK_CLIENT_SECRET"} in frontend/.env.local.`
          );
        }
        throw new Error(res.error.message || `Failed to sign in with ${provider}.`);
      }
    } catch (err: any) {
      setErrorMsg(
        err.message?.includes("provider not found")
          ? `${provider === "google" ? "Google" : "Facebook"} Sign-In requires API credentials in frontend/.env.local.`
          : err.message || `Could not sign in with ${provider}.`
      );
    } finally {
      setBusy(false);
    }
  }

  // Handle Email Form Submit
  async function handleEmailSubmit(e: React.FormEvent) {
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

  // Handle Real Phone SMS Dispatch via Firebase
  async function handleSendRealPhoneOtp(e?: React.FormEvent) {
    if (e) e.preventDefault();
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");

    const cleanLocal = localPhone.trim().replace(/^0+/, "");
    if (!cleanLocal || cleanLocal.length < 7) {
      setErrorMsg("Please enter a valid mobile number.");
      setBusy(false);
      return;
    }

    const fullPhoneNumber = `${countryCode}${cleanLocal}`;

    // Verify Firebase credentials are set in .env.local
    if (!isFirebaseConfigured()) {
      setErrorMsg(
        "Firebase is not configured yet in frontend/.env.local! To dispatch real SMS to phones, set NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID."
      );
      setBusy(false);
      return;
    }

    try {
      // Clear any prior verifier instance to prevent stale or failed reCAPTCHA state
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (_) {}
        recaptchaVerifierRef.current = null;
      }

      const verifier = setupRecaptcha("recaptcha-container");
      if (!verifier) {
        throw new Error("Could not initialize security verification. Please refresh the page.");
      }
      recaptchaVerifierRef.current = verifier;

      const confirmation = await sendFirebasePhoneOtp(fullPhoneNumber, verifier);
      setConfirmationResult(confirmation);
      setPhoneStep("verify-otp");
      setResendTimer(60);
      setSuccessMsg(`Verification code sent via SMS to ${fullPhoneNumber}.`);
    } catch (err: any) {
      console.error("Firebase Phone SMS Error:", err);
      setErrorMsg(parseFirebasePhoneError(err));
    } finally {
      setBusy(false);
    }
  }

  // Handle Real Phone SMS OTP Verification
  async function handleVerifyPhoneOtp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErrorMsg("");
    setSuccessMsg("");

    const cleanCode = phoneOtp.trim();
    if (cleanCode.length !== 6) {
      setErrorMsg("Please enter the 6-digit verification code received on your phone.");
      setBusy(false);
      return;
    }

    const cleanLocal = localPhone.trim().replace(/^0+/, "");
    const fullPhoneNumber = `${countryCode}${cleanLocal}`;

    try {
      if (!confirmationResult) {
        throw new Error("No active SMS session. Please request a new verification code.");
      }

      // Verify code with Firebase
      const userCredential = await confirmationResult.confirm(cleanCode);
      const idToken = await userCredential.user.getIdToken();

      // Exchange with Better Auth plugin to create session cookie
      const res = await fetch("/api/auth/phone/verify-and-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber: fullPhoneNumber,
          idToken,
          name: phoneName.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Phone verification could not establish a session.");
      }

      clearAccountToken();
      router.replace(redirectTarget);
    } catch (err: any) {
      setErrorMsg(parseFirebasePhoneError(err));
    } finally {
      setBusy(false);
    }
  }


  return (
    <div className="auth-page-container">
      {/* Invisible reCAPTCHA container for Firebase Phone Auth */}
      <div id="recaptcha-container"></div>

      {/* Dual-Panel Card (Reference Style) */}
      <div className="auth-split-wrapper">
        {/* Left Side: Welcome Hero Banner with Toggle Button */}
        <div className="auth-hero-panel">
          <Link href="/" style={{ marginBottom: "8px" }}>
            <Image
              src="/images/rimna-brand-logo.png"
              alt="Rimna Digital Lottery"
              width={160}
              height={38}
              priority
              style={{ height: "34px", width: "auto", objectFit: "contain" }}
            />
          </Link>

          {mode === "signin" ? (
            <>
              <h2>{text("Hello, Friend!")}</h2>
              <p>
                {text("Enter your personal details and start your journey with Rimna Digital Lottery.")}
              </p>
              <button
                type="button"
                className="auth-hero-toggle-btn"
                onClick={() => {
                  setMode("signup");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              >
                {text("Sign Up")}
              </button>
            </>
          ) : (
            <>
              <h2>{text("Welcome Back!")}</h2>
              <p>
                {text("To keep connected with us please login with your personal account info.")}
              </p>
              <button
                type="button"
                className="auth-hero-toggle-btn"
                onClick={() => {
                  setMode("signin");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              >
                {text("Sign In")}
              </button>
            </>
          )}
        </div>

        {/* Right Side: Active Form Panel */}
        <div className="auth-form-panel">
          <div className="auth-form-header">
            <h1>
              {mode === "signin" && (t.nav.signIn || text("Sign In"))}
              {mode === "signup" && text("Create Account")}
              {mode === "forgot" && text("Reset Password")}
              {mode === "two-factor" && text("2-Step Verification")}
            </h1>
            <p>
              {mode === "signin" && text("Sign in with email, verified phone SMS, or Telegram.")}
              {mode === "signup" && text("Create your official Rimna account to play and win.")}
              {mode === "forgot" && text("Enter your email address to receive a secure reset link.")}
              {mode === "two-factor" && text("Enter the 6-digit code from your Authenticator app.")}
            </p>
          </div>

          {/* Primary Method Selector Tabs: Email | Phone (SMS) | Telegram */}
          {mode !== "two-factor" && mode !== "forgot" && (
            <div className="auth-method-selector" role="tablist">
              <button
                type="button"
                className={`auth-method-btn ${authMethod === "email" ? "active" : ""}`}
                onClick={() => {
                  setAuthMethod("email");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              >
                <Mail size={15} />
                <span>{text("Email")}</span>
              </button>

              <button
                type="button"
                className={`auth-method-btn ${authMethod === "phone" ? "active" : ""}`}
                onClick={() => {
                  setAuthMethod("phone");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              >
                <Phone size={15} />
                <span>{text("Phone (SMS)")}</span>
              </button>

              <button
                type="button"
                className={`auth-method-btn ${authMethod === "telegram" ? "active" : ""}`}
                onClick={() => {
                  setAuthMethod("telegram");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
              >
                <Send size={15} />
                <span>{text("Telegram")}</span>
              </button>
            </div>
          )}

          {/* ── FORM 1: EMAIL SIGN IN / SIGN UP ────────────────────────────── */}
          {authMethod === "email" && (
            <form onSubmit={handleEmailSubmit} noValidate>
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

              {(mode === "signin" || mode === "signup") && (
                <div className="auth-form-group">
                  <label htmlFor="auth-password">
                    <span>{text("Password")}</span>
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
                </div>
              )}

              {/* Dedicated "Forgot Password" link directly below password in Sign In mode */}
              {mode === "signin" && (
                <div className="auth-forgot-link-wrapper">
                  <button
                    type="button"
                    className="auth-forgot-link"
                    onClick={() => {
                      setMode("forgot");
                      setErrorMsg("");
                      setSuccessMsg("");
                    }}
                  >
                    {text("Forgot your password?")}
                  </button>
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

              <button type="submit" disabled={busy} className="auth-primary-btn">
                {busy ? (
                  <span>{text("Please wait…")}</span>
                ) : (
                  <>
                    <span>
                      {mode === "signin" && (t.nav.signIn || text("Sign In"))}
                      {mode === "signup" && text("Sign Up")}
                      {mode === "forgot" && text("Send Reset Link")}
                      {mode === "two-factor" && text("Verify & Proceed")}
                    </span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── FORM 2: PHONE (SMS OTP) AUTH ───────────────────────────────── */}
          {authMethod === "phone" && (
            <div>
              {mounted && adblockDetected && (
                <div className="auth-alert-message error" style={{ marginBottom: "16px" }}>
                  <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                  <div>
                    <p style={{ margin: "0 0 3px 0", fontWeight: 700 }}>
                      {text("AdBlock Extension Active")}
                    </p>
                    <p style={{ margin: 0, fontSize: "0.75rem", lineHeight: 1.4 }}>
                      {text("Your browser extension is blocking Google reCAPTCHA. Click your AdBlock icon in the Chrome toolbar, select 'Pause on this site', and refresh to receive SMS.")}
                    </p>
                  </div>
                </div>
              )}

              {phoneStep === "enter-phone" ? (
                <form onSubmit={handleSendRealPhoneOtp}>
                  <div className="auth-form-group">
                    <label htmlFor="phone-name">
                      <span>{text("Your Name (Optional)")}</span>
                    </label>
                    <div style={{ position: "relative" }}>
                      <input
                        id="phone-name"
                        type="text"
                        maxLength={100}
                        placeholder={text("e.g. Almaz Bekele")}
                        value={phoneName}
                        onChange={(e) => setPhoneName(e.target.value)}
                        style={{ paddingLeft: "38px" }}
                      />
                      <User size={16} color="#9CA3AF" style={{ position: "absolute", left: "12px", top: "14px" }} />
                    </div>
                  </div>

                  <div className="auth-form-group">
                    <label htmlFor="phone-input">
                      <span>{text("Mobile Phone Number")}</span>
                    </label>
                    <div className="phone-input-row">
                      <select
                        className="country-code-select"
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        aria-label="Country Calling Code"
                      >
                        <option value="+251">🇪🇹 +251 (ET)</option>
                        <option value="+1">🇺🇸 +1 (US/CA)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+971">🇦🇪 +971 (UAE)</option>
                        <option value="+254">🇰🇪 +254 (KE)</option>
                        <option value="+234">🇳🇬 +234 (NG)</option>
                        <option value="+27">🇿🇦 +27 (ZA)</option>
                        <option value="+49">🇩🇪 +49 (DE)</option>
                      </select>

                      <div style={{ position: "relative", flex: 1 }}>
                        <input
                          id="phone-input"
                          type="tel"
                          required
                          placeholder="911 234 567"
                          value={localPhone}
                          onChange={(e) => setLocalPhone(e.target.value)}
                          autoComplete="tel-national"
                          style={{ paddingLeft: "38px" }}
                        />
                        <Smartphone
                          size={16}
                          color="#9CA3AF"
                          style={{ position: "absolute", left: "12px", top: "14px" }}
                        />
                      </div>
                    </div>
                    <small style={{ color: "#9CA3AF", fontSize: "0.75rem", marginTop: "4px" }}>
                      {text("We will send a 6-digit SMS verification code to your device.")}
                    </small>
                  </div>

                  <button type="submit" disabled={busy} className="auth-primary-btn" style={{ marginTop: "12px" }}>
                    {busy ? (
                      <span>{text("Dispatching SMS code…")}</span>
                    ) : (
                      <>
                        <span>{text("Send SMS Verification Code")}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyPhoneOtp}>
                  <div className="auth-form-group">
                    <label htmlFor="otp-input">
                      <span>
                        {text("Enter 6-Digit SMS Code sent to")} {countryCode} {localPhone}
                      </span>
                    </label>
                    <div className="otp-box-container">
                      <input
                        id="otp-input"
                        type="text"
                        required
                        maxLength={6}
                        autoFocus
                        placeholder="••••••"
                        className="otp-digit-input"
                        value={phoneOtp}
                        onChange={(e) => setPhoneOtp(e.target.value.replace(/[^0-9]/g, ""))}
                        autoComplete="one-time-code"
                      />
                    </div>

                    <div className="phone-action-links">
                      <button
                        type="button"
                        onClick={() => {
                          setPhoneStep("enter-phone");
                          setPhoneOtp("");
                          setErrorMsg("");
                        }}
                      >
                        ← {text("Change number")}
                      </button>

                      <button
                        type="button"
                        disabled={resendTimer > 0 || busy}
                        onClick={handleSendRealPhoneOtp}
                      >
                        {resendTimer > 0 ? (
                          <span>{text("Resend code in")} {resendTimer}s</span>
                        ) : (
                          <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <RefreshCw size={12} /> {text("Resend Code")}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={busy || phoneOtp.length !== 6}
                    className="auth-primary-btn"
                    style={{ marginTop: "12px" }}
                  >
                    {busy ? (
                      <span>{text("Verifying code…")}</span>
                    ) : (
                      <>
                        <span>{text("Verify & Sign In")}</span>
                        <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── FORM 3: TELEGRAM AUTH ──────────────────────────────────────── */}
          {authMethod === "telegram" && (
            <TelegramAuth
              onSuccess={() => router.replace(redirectTarget)}
              onError={(msg) => setErrorMsg(msg)}
            />
          )}

          {/* Alerts / Feedback Messages */}
          {errorMsg && (
            <div className="auth-alert-message error" role="alert" style={{ marginTop: "18px" }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="auth-alert-message success" role="status" style={{ marginTop: "18px" }}>
              <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <p style={{ margin: 0 }}>{successMsg}</p>
                {authMethod === "email" && mode === "signup" && (
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

          {/* Back to Sign In button for Forgot Password mode */}
          {mode === "forgot" && (
            <div style={{ textAlign: "center", marginTop: "16px" }}>
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

          {/* ── AT THE BOTTOM: SOCIAL PLATFORMS SECTION (Reference Style) ─── */}
          {mode !== "two-factor" && mode !== "forgot" && (
            <div className="auth-social-bottom">
              <div className="auth-social-bottom-text">
                {text("or login with social platforms")}
              </div>
              <div className="social-circle-row">
                {/* Google Circular Button */}
                <button
                  type="button"
                  className="social-circle-btn"
                  title="Sign in with Google"
                  onClick={() => handleSocialSignIn("google")}
                  disabled={busy}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      fill="#EA4335"
                      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
                    />
                    <path
                      fill="#4285F4"
                      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.1s.7 5.4 1.9 7.8l3.7-2.9z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"
                    />
                  </svg>
                </button>

                {/* Facebook Circular Button */}
                <button
                  type="button"
                  className="social-circle-btn"
                  title="Sign in with Facebook"
                  onClick={() => handleSocialSignIn("facebook")}
                  disabled={busy}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>

                {/* Telegram Circular Button */}
                <button
                  type="button"
                  className="social-circle-btn"
                  title="Sign in with Telegram"
                  onClick={() => {
                    setAuthMethod("telegram");
                    setErrorMsg("");
                  }}
                  disabled={busy}
                >
                  <Send size={18} color="#0088cc" />
                </button>
              </div>
            </div>
          )}
        </div>
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
