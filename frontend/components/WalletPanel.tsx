"use client";
import { useEffect, useRef, useState } from "react";
import { accountAPI } from "@/lib/account-api";
import { money } from "@/lib/admin";
import { hundredths } from "@/lib/lotteries";
import {
  checkoutLink,
  type Deposit,
  type WalletData,
  type WalletEntry,
  type WalletPage,
} from "@/lib/wallet";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import "./wallet.css";
type Attempt = {
  key: string;
  input: {
    currency: string;
    amountMinor: number;
    provider: string;
    phone: string;
  };
};

export function WalletPanel({
  userId,
  view = "all",
  onGoToHistory,
}: {
  userId: string;
  view?: "balances" | "history" | "all";
  onGoToHistory?: () => void;
}) {
  const { text } = useLanguage();
  const [currency, setCurrency] = useState("ETB"),
    [data, setData] = useState<WalletData | null>(null);
  const [history, setHistory] = useState<WalletPage<WalletEntry> | null>(null),
    [deposits, setDeposits] = useState<WalletPage<Deposit> | null>(null);
  const [offset, setOffset] = useState(0),
    [depositOffset, setDepositOffset] = useState(0),
    [revision, setRevision] = useState(0);
  const [amount, setAmount] = useState(""),
    [phone, setPhone] = useState(""),
    [busy, setBusy] = useState(false);
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [attempt, setAttempt] = useState<Attempt | null>(null);
  const sending = useRef(false),
    alive = useRef(true),
    storageKey = `rimna-deposit-attempt:${userId}`;
  useEffect(() => {
    alive.current = true;
    try {
      const saved = sessionStorage.getItem(storageKey);
      if (saved) setAttempt(JSON.parse(saved));
    } catch {
      /* Storage may be disabled. */
    }
    return () => {
      alive.current = false;
    };
  }, [storageKey]);
  useEffect(() => {
    const c = new AbortController();
    setData(null);
    setHistory(null);
    setDeposits(null);
    setError("");
    let pending = false,
      refreshing = false;
    async function refresh() {
      if (refreshing) return;
      refreshing = true;
      try {
        const [w, h, d] = await Promise.all([
          accountAPI<WalletData>(`/wallet?currency=${currency}`, { signal: c.signal }),
          accountAPI<WalletPage<WalletEntry>>(
            `/wallet/history?currency=${currency}&offset=${offset}`,
            { signal: c.signal },
          ),
          accountAPI<WalletPage<Deposit>>(`/deposits?offset=${depositOffset}`, {
            signal: c.signal,
          }),
        ]);
        if (!c.signal.aborted) {
          pending = d.items.some((item) =>
            ["initializing", "pending"].includes(item.status),
          );
          setData(w);
          setHistory(h);
          setDeposits(d);
          setError("");
        }
      } catch (e) {
        if (!c.signal.aborted) setError((e as Error).message);
      } finally {
        refreshing = false;
      }
    }
    void refresh();
    const timer = setInterval(
      () => {
        if (pending && document.visibilityState === "visible") void refresh();
      },
      20000 + Math.random() * 5000,
    );
    return () => {
      c.abort();
      clearInterval(timer);
    };
  }, [currency, offset, depositOffset, revision]);
  async function deposit(e: React.FormEvent) {
    e.preventDefault();
    if (sending.current || !data) return;
    sending.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let normPhone = phone.trim().replace(/[\s\-()]/g, "");
      if (normPhone.startsWith("09") || normPhone.startsWith("07")) {
        normPhone = "+251" + normPhone.slice(1);
      } else if ((normPhone.startsWith("9") || normPhone.startsWith("7")) && normPhone.length === 9) {
        normPhone = "+251" + normPhone;
      } else if (normPhone.startsWith("251")) {
        normPhone = "+" + normPhone;
      } else if (!normPhone.startsWith("+") && normPhone.length > 0) {
        normPhone = "+" + normPhone;
      }
      if (!normPhone && currency === "ETB") {
        normPhone = "+251911000000";
      }

      const request = attempt || {
        key: crypto.randomUUID(),
        input: {
          currency,
          amountMinor: hundredths(amount),
          provider: data.methods[0],
          phone: normPhone,
        },
      };
      if (!attempt) {
        if (
          request.input.amountMinor < data.depositPolicy.minMinor ||
          request.input.amountMinor > data.depositPolicy.maxMinor
        )
          throw new Error("Amount is outside the permitted deposit limits.");
        // Persist before sending: reloading after a network failure must reuse the same request.
        sessionStorage.setItem(storageKey, JSON.stringify(request));
        setAttempt(request);
      }
      const d = await accountAPI<Deposit>("/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": request.key,
        },
        body: JSON.stringify(request.input),
      });
      sessionStorage.removeItem(storageKey);
      if (alive.current) {
        setAttempt(null);
        setAmount("");
        setRevision((v) => v + 1);
        if (d.checkoutUrl) {
          window.location.href = d.checkoutUrl;
          return;
        }
        setMessage(
          d.status === "initializing"
            ? "Payment setup is being checked. Do not pay again; check your deposit history."
            : "Deposit recorded. Continue payment from your deposit history if it is still pending.",
        );
      }
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      sending.current = false;
      if (alive.current) setBusy(false);
    }
  }
  const balance = data?.balances.find((b) => b.currency === currency);
  const enabled =
    !!data?.depositPolicy.enabled && currency === data.depositPolicy.currency;

  const showBalances = view === "balances" || view === "all";
  const showHistory = view === "history" || view === "all";

  return (
    <section className="wallet-panel" aria-label={view === "history" ? text("Deposit & Balance History") : text("My wallet")}>
      {/* ── BALANCES & DEPOSIT SECTION ── */}
      {showBalances && (
        <>
          <div className="wallet-heading">
            <h3>{text("My Wallet & Balances")}</h3>
            <div role="group" aria-label={text("Wallet currency")}>
              {["ETB", "USD"].map((c) => (
                <button
                  key={c}
                  aria-pressed={currency === c}
                  onClick={() => {
                    setCurrency(c);
                    setOffset(0);
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {data?.mode === "test" && (
            <p className="wallet-notice">
              {text(
                "Test environment — balances and payments are for testing only.",
              )}
            </p>
          )}
          <p>
            {text(
              "ETB and USD are separate balances. Switching currency does not convert money.",
            )}
          </p>
          {balance && (
            <div className="wallet-balances">
              <article>
                <small>{text("Available balance")}</small>
                <strong>{money(balance.availableMinor, currency)}</strong>
              </article>
              <article>
                <small>{text("Awaiting verification")}</small>
                <strong>{money(balance.pendingMinor, currency)}</strong>
              </article>
            </div>
          )}
          {balance?.restricted && (
            <p role="alert">
              {text(
                "This wallet is restricted. Contact support to resolve its payment review.",
              )}
            </p>
          )}
          {attempt ? (
            <form onSubmit={deposit}>
              <p>
                {text(
                  "A previous deposit request needs a response. Retrying uses the same payment request.",
                )}{" "}
                {money(attempt.input.amountMinor, attempt.input.currency)}
              </p>
              <button disabled={busy} className="wallet-submit-btn">
                {text(busy ? "Please wait…" : "Retry same deposit")}
              </button>
            </form>
          ) : enabled && !balance?.restricted ? (
            <form onSubmit={deposit} className="wallet-form">
              <label>
                {text("Deposit amount")} ({currency})
                <input
                  aria-label="Deposit amount"
                  inputMode="decimal"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  maxLength={12}
                />
              </label>
              <label>
                {text("Phone number")}
                <input
                  aria-label="Deposit phone number"
                  type="tel"
                  autoComplete="tel"
                  required
                  pattern="\+[1-9][0-9]{7,14}"
                  placeholder="+251…"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={16}
                />
              </label>
              <small>
                {money(data!.depositPolicy.minMinor, currency)} –{" "}
                {money(data!.depositPolicy.maxMinor, currency)}
              </small>
              <button disabled={busy} className="wallet-submit-btn">
                {text(busy ? "Please wait…" : "Continue to payment")}
              </button>
            </form>
          ) : (
            <p>
              {text("New deposits are currently unavailable for this currency.")}
            </p>
          )}
          {error && <p role="alert">{text(error)}</p>}
          {message && <p role="status">{text(message)}</p>}
          <div style={{ display: "flex", gap: "10px", marginTop: "16px", flexWrap: "wrap" }}>
            <button onClick={() => setRevision((v) => v + 1)} className="wallet-secondary-btn">
              {text("Refresh wallet")}
            </button>
            {onGoToHistory && (
              <button
                type="button"
                onClick={onGoToHistory}
                className="wallet-link-btn"
              >
                <span>{text("View Deposit & Balance History")}</span>
                <span>→</span>
              </button>
            )}
          </div>
        </>
      )}

      {/* ── DEPOSIT & BALANCE HISTORY SECTION ── */}
      {showHistory && (
        <div style={{ marginTop: showBalances ? "32px" : "0" }}>
          <div className="wallet-heading" style={{ marginBottom: "16px" }}>
            <h3>{text("Deposit & Balance History")}</h3>
            <div role="group" aria-label={text("Wallet currency")}>
              {["ETB", "USD"].map((c) => (
                <button
                  key={c}
                  aria-pressed={currency === c}
                  onClick={() => {
                    setCurrency(c);
                    setOffset(0);
                    setDepositOffset(0);
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: 10 }}>
            <p style={{ margin: 0, color: "#64748B", fontSize: "0.875rem" }}>
              {text("Verified financial ledger records for your deposits and transactions.")}
            </p>
            <button onClick={() => setRevision((v) => v + 1)} className="wallet-secondary-btn" style={{ padding: "6px 14px", fontSize: "0.75rem" }}>
              {text("Refresh Ledger")}
            </button>
          </div>

          <h4>{text("Deposit history")}</h4>
          {!deposits ? (
            <p role="status">{text("Loading deposits…")}</p>
          ) : (
            <>
              {!deposits.items.length && <p>{text("No deposits recorded yet.")}</p>}
              {deposits.items.map((d) => (
                <article className="wallet-record" key={d.id}>
                  <div>
                    <div className="wallet-record-amount">
                      {money(d.amountMinor, d.currency)}
                    </div>
                    <div className="wallet-record-meta">
                      <span>{new Date(d.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span className="wallet-record-ref">ID: {d.id.slice(0, 14)}...</span>
                      {d.reviewReason && (
                        <span style={{ color: "#DC2626", fontWeight: 600 }}>• {text(d.reviewReason)}</span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <span className={`wallet-record-pill ${d.status}`}>
                      {d.status === "confirmed" || d.status === "succeeded" ? "✓ " : d.status === "failed" ? "✕ " : "⧗ "}
                      {text(d.status).toUpperCase()}
                    </span>
                    {checkoutLink(d) && (
                      <a href={checkoutLink(d)} className="wallet-pay-btn">
                        <span>{text("Continue payment")}</span>
                        <span>→</span>
                      </a>
                    )}
                  </div>
                </article>
              ))}
              <div className="wallet-pagination">
                <button
                  disabled={!depositOffset}
                  onClick={() => setDepositOffset((v) => Math.max(0, v - 50))}
                >
                  {text("Previous deposits")}
                </button>
                <button
                  disabled={!deposits.hasMore}
                  onClick={() => setDepositOffset((v) => v + 50)}
                >
                  {text("Next deposits")}
                </button>
              </div>
            </>
          )}

          <h4 style={{ marginTop: "28px" }}>
            {text("Balance history")} · {currency}
          </h4>
          {!history ? (
            <p role="status">{text("Loading balance history…")}</p>
          ) : (
            <>
              {!history.items.length && <p>{text("No balance entries yet.")}</p>}
              {history.items.map((h) => (
                <article className="wallet-record" key={h.id}>
                  <div>
                    <div className="wallet-record-amount" style={{ color: h.amountMinor > 0 ? "#059669" : "#DC2626" }}>
                      {h.amountMinor > 0 ? "+" : ""}{money(h.amountMinor, h.currency)}
                    </div>
                    <div className="wallet-record-meta">
                      <strong style={{ color: "#1E293B" }}>{text(h.kind.replaceAll("_", " "))}</strong>
                      <span>•</span>
                      <span>{new Date(h.createdAt).toLocaleString()}</span>
                      <span>•</span>
                      <span className="wallet-record-ref">Ref: {h.reference}</span>
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: "0.8125rem", color: "#64748B" }}>
                      {text("Balance after")}: <strong style={{ color: "#1E293B" }}>{money(h.balanceAfterMinor, h.currency)}</strong>
                    </span>
                  </div>
                </article>
              ))}
              <div className="wallet-pagination">
                <button
                  disabled={!offset}
                  onClick={() => setOffset((v) => Math.max(0, v - 50))}
                >
                  {text("Previous entries")}
                </button>
                <button
                  disabled={!history.hasMore}
                  onClick={() => setOffset((v) => v + 50)}
                >
                  {text("Next entries")}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </section>
  );
}
