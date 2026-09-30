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
  const [walletTab, setWalletTab] = useState<"breakdown" | "ledger">("breakdown");
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

  const quickPresets = currency === "ETB" ? [50, 100, 250, 500, 1000, 2000] : [5, 10, 25, 50, 100];

  return (
    <section className="wallet-panel" aria-label={text("Wallet and payments")}>
      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 1: MY WALLET & BALANCES (Tabs: Breakdown & Recent Ledger)
         ════════════════════════════════════════════════════════════════════════ */}
      {(view === "balances" || view === "all") && (
        <div style={{ marginBottom: view === "all" ? 40 : 0 }}>
          {/* Sub-Tabs: Balances & Breakdown vs Recent Ledger */}
          <div className="wallet-tab-bar" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={walletTab === "breakdown"}
              className={`wallet-tab-btn ${walletTab === "breakdown" ? "active" : ""}`}
              onClick={() => setWalletTab("breakdown")}
            >
              <Wallet size={15} />
              <span>{text("Balances & Currency Breakdown")}</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={walletTab === "ledger"}
              className={`wallet-tab-btn ${walletTab === "ledger" ? "active" : ""}`}
              onClick={() => setWalletTab("ledger")}
            >
              <FileText size={15} />
              <span>{text("Recent Ledger")}</span>
            </button>
          </div>

          {/* TAB 1: Balances Overview & Multi-Currency Breakdown */}
          {walletTab === "breakdown" && (
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

              {data?.mode === "test" && (
                <p className="wallet-notice">
                  {text("Test environment — balances and payments are for testing only.")}
                </p>
              )}

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

                <button
                  type="button"
                  onClick={() => setWalletTab("ledger")}
                  className="wallet-secondary-btn"
                >
                  <FileText size={14} />
                  <span>{text("View Balance Ledger")}</span>
                </button>

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
          )}

          {/* TAB 2: Recent Ledger Preview */}
          {walletTab === "ledger" && (
            <div>
              <div className="wallet-heading">
                <div>
                  <h3>{text("Recent Balance Ledger")}</h3>
                  <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "0.8125rem" }}>
                    {text("Detailed ledger audit trail of ticket debits, deposit credits, and winning settlements.")}
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

              {!history ? (
                <p role="status">{text("Loading balance history…")}</p>
              ) : (
                <>
                  {!history.items.length && <p>{text("No balance entries recorded for this currency.")}</p>}
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

      {/* ════════════════════════════════════════════════════════════════════════
          VIEW 2: DEDICATED DEPOSIT FUNDS CHECKOUT FLOW
         ════════════════════════════════════════════════════════════════════════ */}
      {(view === "deposit" || view === "all") && (
        <div style={{ marginTop: view === "all" ? 40 : 0 }}>
          <div className="wallet-heading">
            <div>
              <h3>{text("Deposit Funds")}</h3>
              <p style={{ margin: "4px 0 0", color: "#64748B", fontSize: "0.8125rem" }}>
                {text("Fast & secure player account funding via Telebirr, CBE Birr, Awash, and Bank Cards.")}
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

          {/* Current Available Balance Mini Card */}
          <div className="wallet-current-bal-badge">
            <div>
              <small>{text("Current Wallet Balance")} ({currency})</small>
              <strong>{formatBalance(money(balance?.availableMinor || 0, currency), currency)}</strong>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.75rem", color: "#059669", fontWeight: 700 }}>
              <ShieldCheck size={16} />
              <span>{text("Instant Automatic Credit")}</span>
            </div>
          </div>

          {/* Payment Provider Badges */}
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>
              {text("Supported Payment Channels")}:
            </span>
            <div className="wallet-provider-badges">
              <span className="provider-badge telebirr">Telebirr</span>
              <span className="provider-badge cbe">CBE Birr</span>
              <span className="provider-badge awash">Awash Birr</span>
              <span className="provider-badge cards">Bank Cards</span>
            </div>
          </div>

          {data?.mode === "test" && (
            <p className="wallet-notice">
              {text("Test environment — use phone 0900123456 to simulate successful test deposits.")}
            </p>
          )}

          {attempt ? (
            <form onSubmit={deposit}>
              <p>
                {text(
                  "A previous deposit request needs a response. Retrying uses the same payment request.",
                )}{" "}
                {formatBalance(money(attempt.input.amountMinor, attempt.input.currency), attempt.input.currency)}
              </p>
              <button disabled={busy} className="wallet-submit-btn">
                {text(busy ? "Please wait…" : "Retry same deposit")}
              </button>
            </form>
          ) : enabled && !balance?.restricted ? (
            <form onSubmit={deposit} className="wallet-form">
              {/* Quick Select Amount Presets */}
              <div>
                <label style={{ marginBottom: 6 }}>
                  {text("Select Quick Amount")} ({currency})
                </label>
                <div className="wallet-quick-amounts">
                  {quickPresets.map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className={`quick-amount-btn ${amount === String(preset) ? "active" : ""}`}
                      onClick={() => setAmount(String(preset))}
                    >
                      {preset} {currency}
                    </button>
                  ))}
                </div>
              </div>

              <label>
                {text("Custom Deposit Amount")} ({currency})
                <input
                  aria-label="Deposit amount"
                  inputMode="decimal"
                  required
                  placeholder={currency === "ETB" ? "250.00" : "25.00"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  maxLength={12}
                />
              </label>

              <label>
                {text("Phone Number")}
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
                <small style={{ color: "#64748B", fontSize: "0.75rem" }}>
                  {text("Required for Telebirr / CBE Birr instant payment prompt notification.")}
                </small>
              </label>

              <small>
                {text("Permitted deposit range:")} {money(data!.depositPolicy.minMinor, currency)} –{" "}
                {money(data!.depositPolicy.maxMinor, currency)}
              </small>

              <button disabled={busy} className="wallet-submit-btn">
                <Zap size={16} />
                <span>{text(busy ? "Processing Checkout…" : "Continue to Payment")}</span>
                <ArrowRight size={15} />
              </button>
            </form>
          ) : (
            <p>{text("New deposits are currently unavailable for this currency.")}</p>
          )}

          {error && <p role="alert">{text(error)}</p>}
          {message && <p role="status">{text(message)}</p>}

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
