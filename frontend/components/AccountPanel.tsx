"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { authClient } from "@/lib/auth-client";
import { accountAPI, clearAccountToken } from "@/lib/account-api";
import { WalletPanel } from "./WalletPanel";
import type { Order } from "@/lib/backend";
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
export function AccountPanel({ compact = false }: { compact?: boolean }) {
  const { text } = useLanguage();
  const { data: session, isPending } = authClient.useSession();
  const [mode, setMode] = useState<
    "login" | "register" | "reset" | "two-factor"
  >("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [recovery, setRecovery] = useState(false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [offset, setOffset] = useState(0);
  const [totp, setTotp] = useState("");
  const [backups, setBackups] = useState<string[]>([]);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackups, setCopiedBackups] = useState(false);
  useEffect(() => {
    clearAccountToken();
    setOrders([]);
    setOffset(0);
  }, [session?.user.id]);
  useEffect(() => {
    if (!session?.user.emailVerified || compact) return;
    let active = true;
    accountAPI<Order[]>(`/orders?offset=${offset}`)
      .then((v) => {
        if (active) setOrders(v);
      })
      .catch((e) => {
        if (active) setMessage(e.message);
      });
    return () => {
      active = false;
    };
  }, [session?.user.id, session?.user.emailVerified, compact, offset]);
  useEffect(() => {
    if (
      compact ||
      !session?.user.emailVerified ||
      !orders.some((o) => ["pending", "initializing"].includes(o.status))
    )
      return;
    const timer = setInterval(
      () => {
        if (document.visibilityState === "visible")
          accountAPI<Order[]>(`/orders?offset=${offset}`)
            .then(setOrders)
            .catch((e) => setMessage(e.message));
      },
      15000 + Math.random() * 5000,
    );
    return () => clearInterval(timer);
  }, [compact, session?.user.emailVerified, orders, offset]);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    try {
      let result: any;
      if (mode === "register")
        result = await authClient.signUp.email({
          email,
          password,
          name,
          callbackURL: "/account",
        });
      else if (mode === "reset")
        result = await authClient.requestPasswordReset({
          email,
          redirectTo: "/account/reset-password",
        });
      else if (mode === "two-factor")
        result = recovery
          ? await authClient.twoFactor.verifyBackupCode({ code })
          : await authClient.twoFactor.verifyTotp({ code });
      else
        result = await authClient.signIn.email({
          email,
          password,
          callbackURL: "/account",
        });
      if (result.error) throw new Error(result.error.message);
      clearAccountToken();
      if (result.data?.twoFactorRedirect) {
        setMode("two-factor");
        return;
      }
      if (mode === "register")
        setMessage("Check your email to verify your account.");
      if (mode === "reset")
        setMessage("If an account exists, a reset email has been sent.");
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  if (isPending) return <p role="status">{text("Loading account…")}</p>;
  return (
    <section className="account-panel">
      {session ? (
        <>
          <h2>
            {text("My account")} — {session.user.name}
          </h2>
          {!session.user.emailVerified && (
            <>
              <p>{text("Verify your email before buying tickets.")}</p>
              <button
                onClick={async () => {
                  const r = await authClient.sendVerificationEmail({
                    email: session.user.email,
                    callbackURL: "/account",
                  });
                  setMessage(r.error?.message || "Verification email sent.");
                }}
              >
                {text("Resend verification email")}
              </button>
            </>
          )}
          {!compact && (
            <>
              <Link href="/#choose-ticket">{text("Buy tickets")}</Link> ·{" "}
              <Link href="/admin">{text("Staff dashboard")}</Link>
              {session.user.emailVerified && (
                <WalletPanel key={session.user.id} userId={session.user.id} />
              )}
              <h3>{text("My tickets and payments")}</h3>
              {orders.length === 0 ? (
                <p>{text("No tickets on this page yet.")}</p>
              ) : (
                orders.map((o) => (
                  <article className="account-ticket" key={o.id}>
                    <strong>
                      #{o.number} · {o.currency}{" "}
                      {(o.amountMinor / 100).toLocaleString()}
                    </strong>
                    <p>
                      {o.drawId} · {text(o.refunded ? "Refunded" : o.status)} ·{" "}
                      {new Date(o.createdAt).toLocaleString()}
                    </p>
                    <small>{o.id}</small>
                    {o.checkoutUrl &&
                      o.status === "pending" &&
                      Date.parse(o.expiresAt) > Date.now() && (
                        <p>
                          <a href={o.checkoutUrl}>{text("Continue payment")}</a>
                        </p>
                      )}
                  </article>
                ))
              )}
              <button
                disabled={!offset}
                onClick={() => setOffset(Math.max(0, offset - 100))}
              >
                {text("Previous")}
              </button>
              <button
                disabled={orders.length < 100}
                onClick={() => setOffset(offset + 100)}
              >
                {text("Next")}
              </button>
              <details>
                <summary>{text("Two-factor authentication")}</summary>
                <p>
                  {text(
                    "Add an authenticator app to protect your account. Staff accounts require this.",
                  )}
                </p>
                <input
                  aria-label="Current password"
                  type="password"
                  placeholder="Current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  onClick={async () => {
                    const r = await authClient.twoFactor.enable({ password });
                    if (r.error)
                      setMessage(r.error.message || "Could not enable");
                    else if (r.data.method === "totp") {
                      const uri = r.data.totpURI;
                      setTotp(uri);
                      setBackups(r.data.backupCodes);
                      QRCode.toDataURL(uri, {
                        width: 200,
                        margin: 2,
                        color: { dark: "#0F172A", light: "#FFFFFF" },
                      })
                        .then(setQrCodeDataUrl)
                        .catch(() => {});
                    }
                  }}
                >
                  {text("Set up authenticator")}
                </button>
                {totp && (
                  <div style={{ marginTop: "16px", padding: "16px", background: "rgba(15, 23, 42, 0.6)", borderRadius: "12px", border: "1.5px solid rgba(253, 224, 71, 0.3)" }}>
                    <h4 style={{ color: "#FDE047", marginBottom: "8px", fontSize: "0.95rem" }}>
                      {text("1. Scan QR Code with Authenticator App")}
                    </h4>
                    <p style={{ fontSize: "0.8125rem", color: "#D1D5DB", marginBottom: "12px" }}>
                      {text("Open Google Authenticator, Authy, or Microsoft Authenticator and scan this code:")}
                    </p>
                    {qrCodeDataUrl ? (
                      <div style={{ display: "inline-block", padding: "8px", background: "#FFFFFF", borderRadius: "8px", marginBottom: "16px" }}>
                        <img src={qrCodeDataUrl} alt="2FA QR Code" width={180} height={180} style={{ display: "block" }} />
                      </div>
                    ) : (
                      <p style={{ fontSize: "0.8125rem", color: "#9CA3AF" }}>{text("Generating QR code…")}</p>
                    )}

                    <h4 style={{ color: "#FDE047", marginBottom: "6px", fontSize: "0.95rem" }}>
                      {text("Or Enter Secret Key Manually:")}
                    </h4>
                    <p style={{ fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "8px" }}>
                      {text("In your authenticator, choose 'Enter a setup key' and use this exact key (do NOT use the full URL):")}
                    </p>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                      <code style={{ background: "#0F172A", padding: "8px 12px", borderRadius: "6px", color: "#FDE047", fontSize: "0.9rem", letterSpacing: "1px", userSelect: "all", border: "1px solid rgba(253, 224, 71, 0.2)" }}>
                        {getTotpSecret(totp)}
                      </code>
                      <button
                        type="button"
                        style={{ padding: "6px 12px", fontSize: "0.8125rem" }}
                        onClick={() => {
                          navigator.clipboard.writeText(getTotpSecret(totp));
                          setCopiedSecret(true);
                          setTimeout(() => setCopiedSecret(false), 2500);
                        }}
                      >
                        {copiedSecret ? text("Copied!") : text("Copy Secret Key")}
                      </button>
                    </div>

                    <h4 style={{ color: "#FDE047", marginBottom: "6px", fontSize: "0.95rem" }}>
                      {text("2. Save Your Recovery Backup Codes")}
                    </h4>
                    <p style={{ fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "8px" }}>
                      {text("Save these single-use codes privately. They can recover your account if you lose your phone:")}
                    </p>
                    <div style={{ background: "#0B0F17", padding: "10px", borderRadius: "6px", marginBottom: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <pre style={{ margin: 0, color: "#93C5FD", fontFamily: "monospace", fontSize: "0.8125rem", lineHeight: "1.6" }}>
                        {backups.join("   ·   ")}
                      </pre>
                    </div>
                    <button
                      type="button"
                      style={{ padding: "4px 10px", fontSize: "0.75rem", marginBottom: "16px" }}
                      onClick={() => {
                        navigator.clipboard.writeText(backups.join("\n"));
                        setCopiedBackups(true);
                        setTimeout(() => setCopiedBackups(false), 2500);
                      }}
                    >
                      {copiedBackups ? text("Copied all codes!") : text("Copy Backup Codes")}
                    </button>

                    <h4 style={{ color: "#FDE047", marginBottom: "6px", fontSize: "0.95rem" }}>
                      {text("3. Enter 6-digit Code to Complete Setup")}
                    </h4>
                    <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                      <input
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        placeholder="123456"
                        maxLength={6}
                        style={{ width: "120px", textAlign: "center", fontSize: "1.1rem", letterSpacing: "3px" }}
                      />
                      <button
                        type="button"
                        onClick={async () => {
                          const r = await authClient.twoFactor.verifyTotp({
                            code,
                          });
                          setMessage(
                            r.error?.message ||
                              "Two-factor authentication enabled successfully.",
                          );
                          if (!r.error) {
                            setTotp("");
                            setQrCodeDataUrl("");
                            setBackups([]);
                          }
                        }}
                      >
                        {text("Verify code")}
                      </button>
                    </div>
                  </div>
                )}
              </details>
            </>
          )}
          <button
            onClick={async () => {
              await authClient.signOut();
              clearAccountToken();
              setOrders([]);
            }}
          >
            {text("Sign out")}
          </button>
        </>
      ) : (
        <form onSubmit={submit}>
          <h2>
            {text(
              mode === "register"
                ? "Create account"
                : mode === "reset"
                  ? "Reset password"
                  : mode === "two-factor"
                    ? "Authenticator code"
                    : "Sign in",
            )}
          </h2>
          {mode === "register" && (
            <label>
              {text("Full name")}
              <input
                required
                maxLength={120}
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
              />
            </label>
          )}
          {mode !== "two-factor" && (
            <label>
              {text("Email")}
              <input
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </label>
          )}
          {(mode === "register" || mode === "login") && (
            <label>
              {text("Password")}
              <input
                required
                minLength={12}
                maxLength={128}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
              />
            </label>
          )}
          {mode === "two-factor" && (
            <>
              <input
                aria-label={text("Authenticator code")}
                required
                autoComplete="one-time-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              <label>
                <input
                  type="checkbox"
                  checked={recovery}
                  onChange={(e) => {
                    setRecovery(e.target.checked);
                    setCode("");
                  }}
                />
                {text("Use a recovery code")}
              </label>
            </>
          )}
          <button disabled={busy}>
            {text(busy ? "Please wait…" : "Continue")}
          </button>
          <div>
            {(["login", "register", "reset"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => {
                  setMode(v);
                  setMessage("");
                }}
              >
                {text(
                  v === "login"
                    ? "Sign in"
                    : v === "register"
                      ? "Create account"
                      : "Forgot password?",
                )}
              </button>
            ))}
          </div>
        </form>
      )}
      {message && <p role="status">{text(message)}</p>}
    </section>
  );
}
