"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";
import { accountAPI, clearAccountToken } from "@/lib/account-api";
import type { Order } from "@/lib/backend";
import { useLanguage } from "@/lib/i18n/LanguageContext";
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
                      setTotp(r.data.totpURI);
                      setBackups(r.data.backupCodes);
                    }
                  }}
                >
                  {text("Set up authenticator")}
                </button>
                {totp && (
                  <>
                    <p>
                      {text(
                        "Add this setup URI to your authenticator. Save the recovery codes privately.",
                      )}
                    </p>
                    <code style={{ overflowWrap: "anywhere" }}>{totp}</code>
                    <pre>{backups.join("\n")}</pre>
                    <input
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder="6-digit code"
                    />
                    <button
                      onClick={async () => {
                        const r = await authClient.twoFactor.verifyTotp({
                          code,
                        });
                        setMessage(
                          r.error?.message ||
                            "Two-factor authentication enabled.",
                        );
                        if (!r.error) {
                          setTotp("");
                          setBackups([]);
                        }
                      }}
                    >
                      {text("Verify code")}
                    </button>
                  </>
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
