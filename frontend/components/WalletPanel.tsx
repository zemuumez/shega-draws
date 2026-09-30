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
import { useBalanceVisibility } from "@/lib/balance-visibility";
import {
  Wallet,
  CreditCard,
  FileText,
  RotateCw,
  Coins,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
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
  onGoToDeposit,
  onGoToHistory,
}: {
  userId: string;
  view?: "balances" | "deposit" | "history" | "all";
  onGoToDeposit?: () => void;
  onGoToHistory?: () => void;
}) {
  const { text } = useLanguage();
  const { formatBalance } = useBalanceVisibility();
  const [currency, setCurrency] = useState("ETB");
  const [data, setData] = useState<WalletData | null>(null);
  const [history, setHistory] = useState<WalletPage<WalletEntry> | null>(null);
  const [deposits, setDeposits] = useState<WalletPage<Deposit> | null>(null);
  const [offset, setOffset] = useState(0);
  const [depositOffset, setDepositOffset] = useState(0);
  const [revision, setRevision] = useState(0);
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  // Sub-tab states
  const [historyTab, setHistoryTab] = useState<"deposits" | "ledger">("deposits");

  const sending = useRef(false);
  const alive = useRef(true);
  const storageKey = `rimna-deposit-attempt:${userId}`;

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
    let pending = false;
    let refreshing = false;

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
  const etbBalance = data?.balances.find((b) => b.currency === "ETB");
  const usdBalance = data?.balances.find((b) => b.currency === "USD");
  const enabled =
    !!data?.depositPolicy.enabled && currency === data.depositPolicy.currency;

  return (
    <section className="wallet-panel" aria-label={text("Wallet and payments")}>
      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 1: MY WALLET & BALANCES (Tabs: Breakdown & Recent Ledger)
         ════════════════════════════════════════════════════════════════════════ */}
      {(view === "balances" || view === "all") && (
        <div style={{ marginBottom: view === "all" ? 40 : 0 }}>
          <div>
              <div className="wallet-heading">
                <div>
                  <h3>{text("My Wallet & Balances")}</h3>
                  <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "0.8125rem" }}>
                    {text("ETB and USD are separate player balances. Switching currency does not convert money.")}
                  </p>
                </div>
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

              {/* 2 Primary Balance Metric Cards */}
              {balance && (
                <div className="wallet-balances">
                  <article>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <small>{text("Available balance")} ({currency})</small>
                      <span className="wallet-currency-tag">{text("Ready to Play")}</span>
                    </div>
                    <strong>{formatBalance(money(balance.availableMinor, currency), currency)}</strong>
                  </article>
                  <article>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <small>{text("Awaiting verification")}</small>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#D97706" }}>
                        {text("Pending Review")}
                      </span>
                    </div>
                    <strong>{formatBalance(money(balance.pendingMinor, currency), currency)}</strong>
                  </article>
                </div>
              )}

              {balance?.restricted && (
                <p role="alert">
                  {text("This wallet is restricted. Contact support to resolve its payment review.")}
                </p>
              )}

              {/* Multi-Currency Asset Overview Box */}
              <div className="wallet-breakdown-card">
                <div className="wallet-breakdown-header">
                  <h4>{text("Multi-Currency Asset Overview")}</h4>
                  <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 600 }}>
                    {text("2 Supported Currencies")}
                  </span>
                </div>

                <div className="wallet-breakdown-grid">
                  {/* ETB Card */}
                  <div className="wallet-currency-box">
                    <div className="wallet-currency-box-top">
                      <strong style={{ color: "#1E293B", fontSize: "0.9375rem" }}>
                        🇪🇹 Ethiopian Birr (ETB)
                      </strong>
                      <span className="wallet-currency-tag">{text("Primary")}</span>
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#1B7A53", fontFamily: "var(--font-mono, monospace)" }}>
                      {formatBalance(money(etbBalance?.availableMinor || 0, "ETB"), "ETB")}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      {text("Pending:")} {formatBalance(money(etbBalance?.pendingMinor || 0, "ETB"), "ETB")}
                    </div>
                  </div>

                  {/* USD Card */}
                  <div className="wallet-currency-box">
                    <div className="wallet-currency-box-top">
                      <strong style={{ color: "#1E293B", fontSize: "0.9375rem" }}>
                        🇺🇸 US Dollar (USD)
                      </strong>
                      <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", background: "#F1F5F9", padding: "2px 8px", borderRadius: 6 }}>
                        {text("Global")}
                      </span>
                    </div>
                    <div style={{ fontSize: "1.25rem", fontWeight: 900, color: "#1E293B", fontFamily: "var(--font-mono, monospace)" }}>
                      {formatBalance(money(usdBalance?.availableMinor || 0, "USD"), "USD")}
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#64748B" }}>
                      {text("Pending:")} {formatBalance(money(usdBalance?.pendingMinor || 0, "USD"), "USD")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap", alignItems: "center" }}>
                {onGoToDeposit && (
                  <button
                    type="button"
                    onClick={onGoToDeposit}
                    className="wallet-link-btn"
                  >
                    <CreditCard size={15} />
                    <span>{text("Deposit Funds")}</span>
                    <ArrowRight size={14} />
                  </button>
                )}

              {onGoToHistory && (
                <button
                  type="button"
                  onClick={onGoToHistory}
                  className="wallet-secondary-btn"
                >
                  <FileText size={14} />
                  <span>{text("View Balance Ledger & History")}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setRevision((v) => v + 1)}
                className="wallet-secondary-btn"
              >
                <RotateCw size={14} />
                <span>{text("Refresh Balances")}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 2: DEDICATED DEPOSIT FUNDS CHECKOUT FLOW
         ════════════════════════════════════════════════════════════════════════ */}
      {(view === "deposit" || view === "all") && (
        <div style={{ marginTop: view === "all" ? 40 : 0 }}>
          <div className="wallet-heading">
            <div>
              <h3>{text("Deposit Funds")}</h3>
              <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "0.8125rem" }}>
                {text("Top up your lottery wallet instantly. Funds are credited immediately for ticket purchases.")}
              </p>
            </div>
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

          <div
            style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "16px",
              padding: "24px",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
              maxWidth: "540px",
              margin: "16px 0",
            }}
          >
            {/* Header / Available Balance Strip */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "16px",
                marginBottom: "20px",
                borderBottom: "1px solid #F1F5F9",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <div>
                <span style={{ fontSize: "0.75rem", color: "#64748B", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                  {text("Current Available Balance")}
                </span>
                <div style={{ fontSize: "1.35rem", fontWeight: 900, color: "#1B7A53", fontFamily: "var(--font-mono, monospace)", marginTop: "2px" }}>
                  {formatBalance(money(balance?.availableMinor || 0, currency), currency)}
                </div>
              </div>

              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 10px",
                  background: "#ECFDF5",
                  border: "1px solid #A7F3D0",
                  borderRadius: 9999,
                  color: "#059669",
                  fontSize: "0.75rem",
                  fontWeight: 800,
                }}
              >
                <ShieldCheck size={15} />
                <span>{text("Instant Automatic Credit")}</span>
              </div>
            </div>

            {attempt ? (
              <form onSubmit={deposit} style={{ display: "grid", gap: "16px" }}>
                <div
                  style={{
                    padding: "14px",
                    background: "#FFFBEB",
                    border: "1px solid #FDE68A",
                    borderRadius: "10px",
                    fontSize: "0.8125rem",
                    color: "#92400E",
                  }}
                >
                  <p style={{ margin: 0 }}>
                    {text("A previous deposit request needs a response. Retrying uses the same payment request:")}{" "}
                    <strong>{formatBalance(money(attempt.input.amountMinor, attempt.input.currency), attempt.input.currency)}</strong>
                  </p>
                </div>
                <button
                  disabled={busy}
                  className="portal-btn-primary"
                  style={{ width: "100%", justifyContent: "center", padding: "12px", fontSize: "0.875rem" }}
                >
                  {text(busy ? "Please wait…" : "Retry same deposit")}
                </button>
              </form>
            ) : enabled && !balance?.restricted ? (
              <form onSubmit={deposit} style={{ display: "grid", gap: "18px" }}>
                {/* Clean Amount Input */}
                <div>
                  <label
                    htmlFor="deposit-amount-input"
                    style={{ display: "block", fontSize: "0.8125rem", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}
                  >
                    {text("Amount to Deposit")} ({currency})
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      border: "1.5px solid #CBD5E1",
                      borderRadius: "10px",
                      background: "#FFFFFF",
                      overflow: "hidden",
                      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
                    }}
                  >
                    <span
                      style={{
                        padding: "12px 14px",
                        background: "#F8FAFC",
                        borderRight: "1px solid #E2E8F0",
                        fontSize: "0.875rem",
                        fontWeight: 800,
                        color: "#475569",
                        userSelect: "none",
                      }}
                    >
                      {currency}
                    </span>
                    <input
                      id="deposit-amount-input"
                      aria-label="Deposit amount"
                      inputMode="decimal"
                      required
                      placeholder={currency === "ETB" ? "250.00" : "25.00"}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      maxLength={12}
                      style={{
                        flex: 1,
                        border: "none",
                        outline: "none",
                        padding: "12px 14px",
                        fontSize: "1rem",
                        fontWeight: 700,
                        color: "#0F172A",
                        background: "transparent",
                      }}
                    />
                  </div>
                  {data?.depositPolicy && (
                    <small style={{ display: "block", marginTop: "5px", color: "#64748B", fontSize: "0.75rem", fontWeight: 600 }}>
                      {text("Permitted range:")} {money(data.depositPolicy.minMinor, currency)} – {money(data.depositPolicy.maxMinor, currency)}
                    </small>
                  )}
                </div>

                {/* Clean Phone Input */}
                <div>
                  <label
                    htmlFor="deposit-phone-input"
                    style={{ display: "block", fontSize: "0.8125rem", fontWeight: 800, color: "#1E293B", marginBottom: "6px" }}
                  >
                    {text("Mobile Phone Number")}
                  </label>
                  <input
                    id="deposit-phone-input"
                    aria-label="Deposit phone number"
                    type="tel"
                    autoComplete="tel"
                    required
                    pattern="\+[1-9][0-9]{7,14}"
                    placeholder={currency === "USD" ? "+1…" : "+251…"}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={16}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      border: "1.5px solid #CBD5E1",
                      borderRadius: "10px",
                      padding: "12px 14px",
                      fontSize: "0.9375rem",
                      fontWeight: 600,
                      color: "#0F172A",
                      background: "#FFFFFF",
                      outline: "none",
                    }}
                  />
                  <small style={{ display: "block", marginTop: "5px", color: "#64748B", fontSize: "0.75rem", fontWeight: 600 }}>
                    {text("Used to send the instant payment prompt on your phone.")}
                  </small>
                </div>

                {error && (
                  <div
                    role="alert"
                    style={{
                      padding: "10px 14px",
                      background: "#FEF2F2",
                      border: "1px solid #FECACA",
                      borderRadius: "8px",
                      color: "#DC2626",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                    }}
                  >
                    {text(error)}
                  </div>
                )}
                {message && (
                  <div
                    role="status"
                    style={{
                      padding: "10px 14px",
                      background: "#F0FDF4",
                      border: "1px solid #BBF7D0",
                      borderRadius: "8px",
                      color: "#16A34A",
                      fontSize: "0.8125rem",
                      fontWeight: 600,
                    }}
                  >
                    {text(message)}
                  </div>
                )}

                {/* Primary CTA Submit Button */}
                <button
                  disabled={busy}
                  className="portal-btn-primary"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "14px 20px",
                    fontSize: "0.9375rem",
                    fontWeight: 800,
                    boxShadow: "0 4px 14px rgba(27, 122, 83, 0.25)",
                    cursor: busy ? "not-allowed" : "pointer",
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  <CreditCard size={18} />
                  <span>
                    {busy
                      ? text("Processing Checkout…")
                      : amount
                        ? `${text("Deposit")} ${amount} ${currency}`
                        : text("Continue to Payment")}
                  </span>
                  <ArrowRight size={16} />
                </button>

                {/* Subdued Supported Gateways Footer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    paddingTop: "12px",
                    borderTop: "1px solid #F1F5F9",
                    fontSize: "0.75rem",
                    color: "#64748B",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{text("Supported Payment Channels:")}</span>
                  <span style={{ fontWeight: 800, color: "#334155" }}>
                    Telebirr • CBE Birr • Awash Birr • Bank Cards
                  </span>
                </div>
              </form>
            ) : (
              <p style={{ color: "#64748B", fontSize: "0.875rem", margin: "16px 0 0" }}>
                {text("New deposits are currently unavailable for this currency.")}
              </p>
            )}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap" }}>
            {onGoToHistory && (
              <button
                type="button"
                onClick={onGoToHistory}
                className="wallet-secondary-btn"
              >
                <span>{text("View Deposit History")}</span>
                <span>→</span>
              </button>
            )}
            <button onClick={() => setRevision((v) => v + 1)} className="wallet-secondary-btn">
              {text("Refresh Status")}
            </button>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 3: DEPOSIT & BALANCE HISTORY
         ════════════════════════════════════════════════════════════════════════ */}
      {view === "history" && (
        <div>
          {/* Sub-Tabs: Deposits vs Balance Ledger */}
          <div className="wallet-tab-bar" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={historyTab === "deposits"}
              className={`wallet-tab-btn ${historyTab === "deposits" ? "active" : ""}`}
              onClick={() => setHistoryTab("deposits")}
            >
              <Coins size={15} />
              <span>{text("Deposit History")}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={historyTab === "ledger"}
              className={`wallet-tab-btn ${historyTab === "ledger" ? "active" : ""}`}
              onClick={() => setHistoryTab("ledger")}
            >
              <FileText size={15} />
              <span>{text("Balance Ledger")}</span>
            </button>
          </div>

          <div className="wallet-heading" style={{ marginBottom: "16px" }}>
            <h3>
              {historyTab === "deposits"
                ? text("Deposit Records")
                : text("Balance Ledger History")}
            </h3>
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

          {/* TAB 1: Deposit History */}
          {historyTab === "deposits" && (
            <div>
              {!deposits ? (
                <p role="status">{text("Loading deposits…")}</p>
              ) : (
                <>
                  {!deposits.items.length && <p>{text("No deposits recorded yet.")}</p>}
                  {deposits.items.map((d) => (
                    <article className="wallet-record" key={d.id}>
                      <div>
                        <div className="wallet-record-amount">
                          {formatBalance(money(d.amountMinor, d.currency), d.currency)}
                        </div>
                        <div className="wallet-record-meta">
                          <span>{new Date(d.createdAt).toLocaleString()}</span>
                          <span>•</span>
                          <span className="wallet-record-ref">ID: {d.id.slice(0, 16)}...</span>
                          {d.reviewReason && (
                            <span style={{ color: "#DC2626", fontWeight: 600 }}>
                              • {text(d.reviewReason)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                        <span className={`wallet-record-pill ${d.status}`}>
                          {d.status === "confirmed" || d.status === "succeeded"
                            ? "✓ "
                            : d.status === "failed"
                            ? "✕ "
                            : "⧗ "}
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
            </div>
          )}

          {/* TAB 2: Balance Ledger */}
          {historyTab === "ledger" && (
            <div>
              {!history ? (
                <p role="status">{text("Loading balance history…")}</p>
              ) : (
                <>
                  {!history.items.length && <p>{text("No balance entries yet.")}</p>}
                  {history.items.map((h) => (
                    <article className="wallet-record" key={h.id}>
                      <div>
                        <div
                          className="wallet-record-amount"
                          style={{ color: h.amountMinor > 0 ? "#059669" : "#DC2626" }}
                        >
                          {formatBalance((h.amountMinor > 0 ? "+" : "") + money(h.amountMinor, h.currency), h.currency)}
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
                          {text("Balance after")}:{" "}
                          <strong style={{ color: "#1E293B" }}>
                            {formatBalance(money(h.balanceAfterMinor, h.currency), h.currency)}
                          </strong>
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
        </div>
      )}
    </section>
  );
}
