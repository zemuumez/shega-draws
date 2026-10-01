"use client";
import { useEffect, useRef, useState } from "react";
import { accountAPI } from "@/lib/account-api";
import { money } from "@/lib/admin";
import { formatDisplayDateTime } from "@/lib/date";
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

export interface PaymentMethodOption {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  desc: string;
}

export const ETB_PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "telebirr",
    name: "Telebirr",
    badge: "Mobile Wallet",
    badgeColor: "#0284C7",
    desc: "Instant USSD prompt & SMS push to your mobile phone",
  },
  {
    id: "cbe",
    name: "CBE Birr / CBE",
    badge: "Commercial Bank",
    badgeColor: "#7C3AED",
    desc: "Direct debit from Commercial Bank of Ethiopia accounts",
  },
  {
    id: "boa",
    name: "Bank of Abyssinia",
    badge: "Apollo / BoA",
    badgeColor: "#F59E0B",
    desc: "Abyssinia digital banking & mobile transfer",
  },
  {
    id: "awash",
    name: "Awash Birr",
    badge: "Awash Bank",
    badgeColor: "#D97706",
    desc: "Awash Bank instant mobile account debit",
  },
  {
    id: "dashen",
    name: "Dashen / Amole",
    badge: "Dashen Bank",
    badgeColor: "#2563EB",
    desc: "Dashen Bank Amole payment checkout",
  },
  {
    id: "coop",
    name: "CoopPay / Coop Bank",
    badge: "Coop Bank",
    badgeColor: "#059669",
    desc: "Cooperative Bank of Oromia digital checkout",
  },
  {
    id: "card_local",
    name: "EthSwitch ATM Cards",
    badge: "Debit / ATM",
    badgeColor: "#DC2626",
    desc: "Local ATM / Debit cards issued by Ethiopian banks",
  },
];

export const USD_PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "card_intl",
    name: "Credit / Debit Card",
    badge: "Visa • Mastercard • Amex",
    badgeColor: "#2563EB",
    desc: "International cards via Chapa Global checkout",
  },
  {
    id: "apple_google_pay",
    name: "Apple & Google Pay",
    badge: "One-Touch Mobile",
    badgeColor: "#10B981",
    desc: "Fast contactless checkout from your mobile device",
  },
  {
    id: "paypal_express",
    name: "PayPal / Express",
    badge: "Diaspora Express",
    badgeColor: "#0284C7",
    desc: "International diaspora online wallet checkout",
  },
  {
    id: "wire_transfer",
    name: "International SWIFT",
    badge: "Bank Wire",
    badgeColor: "#7C3AED",
    desc: "Direct diaspora bank transfer to Chapa clearing",
  },
];

type Attempt = {
  key: string;
  depositId?: string;
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
  const [checkingId, setCheckingId] = useState<string | null>(null);

  // Sub-tab states
  const [historyTab, setHistoryTab] = useState<"deposits" | "ledger">("deposits");
  const [selectedMethod, setSelectedMethod] = useState("telebirr");

  useEffect(() => {
    if (currency === "ETB") {
      setSelectedMethod((prev) =>
        ETB_PAYMENT_METHODS.some((m) => m.id === prev) ? prev : "telebirr"
      );
    } else {
      setSelectedMethod((prev) =>
        USD_PAYMENT_METHODS.some((m) => m.id === prev) ? prev : "card_intl"
      );
    }
  }, [currency]);

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

  const discardAttempt = () => {
    try {
      sessionStorage.removeItem(storageKey);
    } catch {
      /* Storage may be disabled. */
    }
    setAttempt(null);
    setError("");
    setMessage("");
  };

  async function handleCheckDeposit(depId: string) {
    if (checkingId) return;
    setCheckingId(depId);
    setError("");
    setMessage("");
    try {
      const res = await accountAPI<Deposit>(`/deposits/${depId}/check`, {
        method: "POST",
      });
      setRevision((v) => v + 1);
      if (res.status === "succeeded" || res.creditedAt) {
        setMessage(
          `Deposit of ${money(res.amountMinor, res.currency)} confirmed! Balance updated successfully.`
        );
      } else if (res.status === "failed") {
        setError(res.reviewReason || "Deposit failed or expired.");
      } else {
        setMessage("Payment status checked: awaiting confirmation from your bank.");
      }
    } catch (err) {
      setRevision((v) => v + 1);
      setError((err as Error).message);
    } finally {
      setCheckingId(null);
    }
  }

  // Auto-dismiss unfinished attempt only if its specific deposit ID has resolved
  useEffect(() => {
    if (!attempt || !attempt.depositId || !deposits?.items) return;
    const matched = deposits.items.find((item) => item.id === attempt.depositId);
    if (!matched) return;
    if (matched.status === "succeeded" || matched.creditedAt !== null) {
      discardAttempt();
      setMessage(
        `Previous deposit of ${money(matched.amountMinor, matched.currency)} succeeded and was credited to your balance!`
      );
    } else if (matched.status === "failed" || matched.status === "review") {
      discardAttempt();
    }
  }, [deposits, attempt]);

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
          accountAPI<WalletPage<Deposit>>(
            `/deposits?currency=${currency}&offset=${depositOffset}`,
            { signal: c.signal },
          ),
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

    // Fast polling if pending deposits exist: 3s interval so status changes immediately
    const timer = setInterval(() => {
      if (pending && document.visibilityState === "visible") void refresh();
    }, 3000);

    // Refresh immediately whenever user comes back to the page/tab
    const onVisibilityOrFocus = () => {
      if (document.visibilityState === "visible") {
        void refresh();
      }
    };
    window.addEventListener("focus", onVisibilityOrFocus);
    window.addEventListener("visibilitychange", onVisibilityOrFocus);
    window.addEventListener("pageshow", onVisibilityOrFocus);

    return () => {
      c.abort();
      clearInterval(timer);
      window.removeEventListener("focus", onVisibilityOrFocus);
      window.removeEventListener("visibilitychange", onVisibilityOrFocus);
      window.removeEventListener("pageshow", onVisibilityOrFocus);
    };
  }, [currency, offset, depositOffset, revision]);

  async function resumeAttempt() {
    if (sending.current || !attempt) return;
    sending.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const d = await accountAPI<Deposit>("/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": attempt.key,
        },
        body: JSON.stringify(attempt.input),
      });

      if (d.status === "succeeded" || d.creditedAt) {
        discardAttempt();
        setMessage(
          `Deposit of ${money(d.amountMinor, d.currency)} has already been completed and credited to your wallet balance.`
        );
        setRevision((v) => v + 1);
        return;
      }

      if (d.status === "failed" || d.status === "review") {
        discardAttempt();
        setMessage(
          "Previous payment session has expired. You can start a new deposit below."
        );
        setRevision((v) => v + 1);
        return;
      }

      if (d.checkoutUrl) {
        sessionStorage.removeItem(storageKey);
        setAttempt(null);
        let url = d.checkoutUrl;
        if (url.includes("/chapa-sandbox")) {
          url += `${url.includes("?") ? "&" : "?"}method=${encodeURIComponent(selectedMethod)}`;
        }
        window.location.href = url;
        return;
      }

      setMessage(
        d.status === "initializing"
          ? "Payment session initialized. Please wait while the payment gateway connects, or check your Deposit History."
          : "Payment is currently in process with your bank/gateway. Check Deposit History for live status updates."
      );
      setRevision((v) => v + 1);
    } catch (e) {
      if (alive.current) setError((e as Error).message);
    } finally {
      sending.current = false;
      if (alive.current) setBusy(false);
    }
  }

  async function deposit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (sending.current || !data) return;
    sending.current = true;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      let normPhone = phone.trim().replace(/[\s\-()]/g, "");
      if (currency === "ETB") {
        if (normPhone.startsWith("09") || normPhone.startsWith("07")) {
          normPhone = "+251" + normPhone.slice(1);
        } else if ((normPhone.startsWith("9") || normPhone.startsWith("7")) && normPhone.length === 9) {
          normPhone = "+251" + normPhone;
        } else if (normPhone.startsWith("251") && (normPhone.startsWith("2519") || normPhone.startsWith("2517")) && normPhone.length === 12) {
          normPhone = "+" + normPhone;
        } else if (normPhone.startsWith("+251") && (normPhone.startsWith("+2519") || normPhone.startsWith("+2517")) && normPhone.length === 13) {
          // already in format
        } else if (!normPhone) {
          normPhone = "+251911000000";
        }
        const etPattern = /^\+251[79]\d{8}$/;
        if (!etPattern.test(normPhone)) {
          throw new Error("Please enter a valid Ethiopian mobile phone number starting with 09 or 07 (e.g. 0947859632).");
        }
      } else {
        if (!normPhone) {
          normPhone = "+12025550123";
        } else if (!normPhone.startsWith("+")) {
          normPhone = "+" + normPhone;
        }
      }

      const depositAmountMinor = hundredths(amount);
      if (
        depositAmountMinor < data.depositPolicy.minMinor ||
        depositAmountMinor > data.depositPolicy.maxMinor
      ) {
        throw new Error("Amount is outside the permitted deposit limits.");
      }

      const idempotencyKey = attempt?.key || crypto.randomUUID();
      const payload = {
        currency,
        amountMinor: depositAmountMinor,
        provider: "chapa",
        phone: normPhone,
      };

      const d = await accountAPI<Deposit>("/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify(payload),
      });

      if (alive.current) {
        setRevision((v) => v + 1);

        if (d.status === "failed" || d.status === "review") {
          discardAttempt();
          setError(d.reviewReason || "Payment session could not be established. Please try again.");
          return;
        }

        if (d.status === "succeeded" || d.creditedAt) {
          discardAttempt();
          setAmount("");
          setMessage(`Deposit of ${money(d.amountMinor, d.currency)} succeeded and was credited to your balance.`);
          return;
        }

        if (d.checkoutUrl) {
          discardAttempt();
          setAmount("");
          let url = d.checkoutUrl;
          if (url.includes("/chapa-sandbox")) {
            url += `${url.includes("?") ? "&" : "?"}method=${encodeURIComponent(selectedMethod)}`;
          }
          window.location.href = url;
          return;
        }

        const newAttempt: Attempt = { key: idempotencyKey, depositId: d.id, input: payload };
        setAttempt(newAttempt);
        try {
          sessionStorage.setItem(storageKey, JSON.stringify(newAttempt));
        } catch {
          /* Storage may be disabled */
        }
        setMessage("Deposit recorded. Processing with bank payment channel.");
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

          <div className="wallet-deposit-card">
            {/* Header / Available Balance Strip */}
            <div className="wallet-deposit-header">
              <div>
                <span className="wallet-deposit-balance-label">
                  {text("Current Available Balance")}
                </span>
                <div className="wallet-deposit-balance-val">
                  {formatBalance(money(balance?.availableMinor || 0, currency), currency)}
                </div>
              </div>

              <div className="wallet-deposit-badge">
                <ShieldCheck size={15} />
                <span>{text("Instant Automatic Credit")}</span>
              </div>
            </div>

            {/* Pending Attempt Banner (High-contrast dark mode compatible, with resume and discard buttons) */}
            {attempt && (
              <div className="wallet-pending-attempt-box">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
                  <div className="wallet-pending-attempt-icon">
                    <RotateCw size={18} className={busy ? "spin-icon" : ""} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="wallet-pending-attempt-title">
                      {text("Unfinished Deposit in Progress")}
                    </div>
                    <div className="wallet-pending-attempt-msg">
                      {text("You previously started a deposit of")}{" "}
                      <strong className="wallet-pending-amount">
                        {formatBalance(money(attempt.input.amountMinor, attempt.input.currency), attempt.input.currency)}
                      </strong>
                      . {text("You can resume and complete this payment, or discard it to start a new deposit.")}
                    </div>
                  </div>
                </div>

                <div className="wallet-pending-attempt-actions">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => resumeAttempt()}
                    className="portal-btn-primary"
                    style={{
                      padding: "10px 20px",
                      fontSize: "0.875rem",
                      fontWeight: 800,
                    }}
                  >
                    <ArrowRight size={15} />
                    <span>
                      {busy
                        ? text("Connecting…")
                        : `${text("Resume Payment")} (${formatBalance(money(attempt.input.amountMinor, attempt.input.currency), attempt.input.currency)})`}
                    </span>
                  </button>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={discardAttempt}
                    className="wallet-discard-btn"
                  >
                    <span>✕ {text("Discard & Start Fresh")}</span>
                  </button>
                </div>
              </div>
            )}

            {enabled && !balance?.restricted ? (
              <form onSubmit={deposit} style={{ display: "grid", gap: "20px" }}>
                {/* Clean Amount Input */}
                <div>
                  <label htmlFor="deposit-amount-input" className="wallet-form-label">
                    {text("Amount to Deposit")} ({currency})
                  </label>
                  <div className="wallet-input-group">
                    <span className="wallet-currency-prefix">
                      {currency}
                    </span>
                    <input
                      id="deposit-amount-input"
                      aria-label="Deposit amount"
                      inputMode="decimal"
                      required
                      placeholder={currency === "ETB" ? "250.00" : "25.00"}
                      value={amount}
                      onChange={(e) => {
                        setAmount(e.target.value);
                        setMessage("");
                        setError("");
                      }}
                      maxLength={12}
                      className="wallet-input-field"
                    />
                  </div>
                  {data?.depositPolicy && (
                    <small className="wallet-form-hint">
                      {text("Permitted range:")} {money(data.depositPolicy.minMinor, currency)} – {money(data.depositPolicy.maxMinor, currency)}
                    </small>
                  )}
                </div>

                {/* Quick Select Preset Amounts */}
                <div>
                  <label className="wallet-form-label">
                    {text("Preset Amounts")}
                  </label>
                  <div className="wallet-quick-amounts">
                    {(currency === "ETB"
                      ? [100, 250, 500, 1000, 2500, 5000]
                      : [10, 25, 50, 100, 250, 500]
                    ).map((presetVal) => {
                      const isSelected = amount === String(presetVal);
                      return (
                        <button
                          key={presetVal}
                          type="button"
                          className={`quick-amount-btn ${isSelected ? "active" : ""}`}
                          onClick={() => {
                            setAmount(String(presetVal));
                            setMessage("");
                            setError("");
                          }}
                        >
                          {currency === "ETB" ? `ETB ${presetVal}` : `$${presetVal}`}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Bank / Payment Method Selector (Horizontal layout across full width) */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                    <label className="wallet-form-label" style={{ margin: 0 }}>
                      {currency === "ETB"
                        ? text("Select Ethiopian Bank / Payment Channel")
                        : text("Select Global Payment Option (via Chapa)")}
                    </label>
                    <span style={{ fontSize: "0.75rem", color: "#10B981", fontWeight: 700 }}>
                      ⚡ {text("Instant Clearance")}
                    </span>
                  </div>
                  <div className={`wallet-methods-grid methods-count-${(currency === "ETB" ? ETB_PAYMENT_METHODS : USD_PAYMENT_METHODS).length}`}>
                    {(currency === "ETB" ? ETB_PAYMENT_METHODS : USD_PAYMENT_METHODS).map((m) => {
                      const isSelected = selectedMethod === m.id;
                      return (
                        <div
                          key={m.id}
                          role="button"
                          tabIndex={0}
                          aria-pressed={isSelected}
                          className={`wallet-method-card ${isSelected ? "active" : ""}`}
                          onClick={() => {
                            setSelectedMethod(m.id);
                            setMessage("");
                            setError("");
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              setSelectedMethod(m.id);
                              setMessage("");
                              setError("");
                            }
                          }}
                        >
                          <div className="wallet-method-card-top">
                            <span
                              className="wallet-method-badge"
                              style={{
                                color: m.badgeColor,
                                background: `${m.badgeColor}18`,
                              }}
                            >
                              {m.badge}
                            </span>
                            {isSelected && (
                              <span className="wallet-method-check">✓</span>
                            )}
                          </div>
                          <div>
                            <div className="wallet-method-name">{m.name}</div>
                            <div className="wallet-method-desc">{m.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Dynamic Phone / Contact Input Tailored to Method */}
                {(() => {
                  const methodConfig = (() => {
                    switch (selectedMethod) {
                      case "telebirr":
                        return {
                          label: text("Telebirr Mobile Number"),
                          placeholder: "+251911000000",
                          hint: text("You will receive an instant USSD prompt on your phone to approve payment with your PIN."),
                        };
                      case "cbe":
                        return {
                          label: text("CBE Account / CBE Birr Phone"),
                          placeholder: "1000... or 09...",
                          hint: text("Enter your Commercial Bank account number or registered CBE Birr phone."),
                        };
                      case "boa":
                        return {
                          label: text("Bank of Abyssinia Account / Phone"),
                          placeholder: "+2519... or BoA Account",
                          hint: text("Enter your BoA Apollo registered phone number or account number."),
                        };
                      case "awash":
                        return {
                          label: text("Awash Birr Mobile / Account"),
                          placeholder: "+251911000000",
                          hint: text("Enter your Awash Birr registered phone number for instant debit."),
                        };
                      case "dashen":
                        return {
                          label: text("Dashen / Amole Phone Number"),
                          placeholder: "+251911000000",
                          hint: text("Enter your Dashen Bank Amole registered phone number."),
                        };
                      case "coop":
                        return {
                          label: text("CoopPay Phone / Account Number"),
                          placeholder: "+251911000000",
                          hint: text("Enter your Cooperative Bank of Oromia CoopPay mobile or account."),
                        };
                      case "card_local":
                        return {
                          label: text("Cardholder Phone (for 3D-Secure SMS)"),
                          placeholder: "+251911000000",
                          hint: text("Used by EthSwitch to send the 3D-Secure one-time confirmation code (OTP)."),
                        };
                      case "card_intl":
                        return {
                          label: text("Mobile Phone Number (for 3D-Secure OTP)"),
                          placeholder: "+1 202 555 0123",
                          hint: text("International Visa/Mastercard 3D-Secure verification code will be sent to this number."),
                        };
                      case "apple_google_pay":
                        return {
                          label: text("Mobile Contact / Phone"),
                          placeholder: "+1 202 555 0123",
                          hint: text("Used for one-touch Apple Pay / Google Pay receipt and notification."),
                        };
                      case "paypal_express":
                        return {
                          label: text("Billing Contact Phone"),
                          placeholder: "+1 202 555 0123",
                          hint: text("Used to link your diaspora checkout with Chapa Global clearing."),
                        };
                      case "wire_transfer":
                        return {
                          label: text("Sender Contact Phone Number"),
                          placeholder: "+1 202 555 0123",
                          hint: text("Used by Chapa's international clearing desk for SWIFT transfer confirmation."),
                        };
                      default:
                        return {
                          label: text("Mobile Phone Number"),
                          placeholder: currency === "USD" ? "+1..." : "+251...",
                          hint: text("Used to send the instant payment prompt on your phone."),
                        };
                    }
                  })();

                  return (
                    <div>
                      <label htmlFor="deposit-phone-input" className="wallet-form-label">
                        {methodConfig.label}
                      </label>
                      <input
                        id="deposit-phone-input"
                        aria-label={methodConfig.label}
                        type="tel"
                        autoComplete="tel"
                        required
                        placeholder={methodConfig.placeholder}
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        maxLength={24}
                        className="wallet-phone-input"
                      />
                      <small className="wallet-form-hint">
                        {methodConfig.hint}
                      </small>
                    </div>
                  );
                })()}

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
                  type="submit"
                  disabled={busy}
                  className="portal-btn-primary wallet-submit-btn"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "14px 20px",
                    fontSize: "0.9375rem",
                    fontWeight: 800,
                    cursor: busy ? "not-allowed" : "pointer",
                    opacity: busy ? 0.7 : 1,
                  }}
                >
                  <CreditCard size={18} />
                  <span>
                    {busy
                      ? text("Processing Checkout…")
                      : amount
                        ? `${text("Deposit")} ${amount} ${currency} via ${(currency === "ETB" ? ETB_PAYMENT_METHODS : USD_PAYMENT_METHODS).find((m) => m.id === selectedMethod)?.name || "Chapa"}`
                        : text("Continue to Payment")}
                  </span>
                  <ArrowRight size={16} />
                </button>

                {/* Subdued Supported Gateways Footer */}
                <div className="wallet-deposit-footer">
                  <span className="wallet-deposit-footer-label">
                    {currency === "ETB"
                      ? text("Supported Ethiopian Banking Channels:")
                      : text("Supported Global Payment Rails:")}
                  </span>
                  <span className="wallet-deposit-footer-channels">
                    {currency === "ETB"
                      ? "Telebirr • Commercial Bank of Ethiopia (CBE) • Bank of Abyssinia • Awash Birr • Dashen Amole • Coop Bank • EthSwitch Cards"
                      : "Visa • Mastercard • American Express • Apple Pay • Google Pay • PayPal • SWIFT Wire (via Chapa Global)"}
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
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setRevision((v) => v + 1)}
                className="wallet-secondary-btn"
                style={{
                  padding: "6px 14px",
                  fontSize: "0.75rem",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  height: "36px",
                }}
                title={text("Refresh deposit records")}
              >
                <RotateCw size={13} className={busy ? "spin-icon" : ""} />
                <span>{text("Refresh Status")}</span>
              </button>
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
          </div>

          {/* TAB 1: Deposit History */}
          {historyTab === "deposits" && (
            <div>
              {!deposits ? (
                <p role="status">{text("Loading deposits…")}</p>
              ) : (() => {
                const filteredDeposits = (deposits.items || []).filter(
                  (d) => !currency || d.currency === currency,
                );
                return (
                  <>
                    {!filteredDeposits.length && (
                      <div
                        style={{
                          padding: "36px 16px",
                          textAlign: "center",
                          color: "#64748B",
                          background: "rgba(0,0,0,0.02)",
                          borderRadius: "12px",
                          margin: "12px 0",
                        }}
                      >
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9375rem" }}>
                          {text(`No ${currency} deposits recorded yet.`)}
                        </p>
                        <p style={{ margin: "6px 0 0", fontSize: "0.8125rem" }}>
                          {currency === "USD"
                            ? text("Global deposits via Chapa USD checkout will appear here.")
                            : text("Local deposits via Telebirr or Ethiopian banks will appear here.")}
                        </p>
                      </div>
                    )}
                    {filteredDeposits.map((d) => {
                      const isProcessing =
                        d.status === "initializing" || d.status === "pending";
                      return (
                        <article className="wallet-record" key={d.id}>
                          <div style={{ flex: 1 }}>
                            <div className="wallet-record-amount">
                              {formatBalance(money(d.amountMinor, d.currency), d.currency)}
                            </div>
                            <div className="wallet-record-meta">
                              <span suppressHydrationWarning>
                                {formatDisplayDateTime(d.createdAt)}
                              </span>
                              <span>•</span>
                              <span className="wallet-record-ref">
                                ID: {d.id.slice(0, 16)}...
                              </span>
                              {d.reviewReason && (
                                <span style={{ color: "#DC2626", fontWeight: 600 }}>
                                  • {text(d.reviewReason)}
                                </span>
                              )}
                            </div>
                          </div>

                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              flexWrap: "wrap",
                            }}
                          >
                            <span
                              className={`wallet-record-pill ${isProcessing ? "processing" : d.status}`}
                            >
                              {isProcessing ? (
                                <>
                                  <span className="wallet-processing-dot" />
                                  <span>{text("IN PROCESS")}</span>
                                </>
                              ) : d.status === "confirmed" || d.status === "succeeded" ? (
                                <>
                                  <span>✓</span>
                                  <span>{text("SUCCEEDED")}</span>
                                </>
                              ) : d.status === "failed" ? (
                                <>
                                  <span>✕</span>
                                  <span>{text("FAILED")}</span>
                                </>
                              ) : (
                                <>
                                  <span>⧗</span>
                                  <span>{text(d.status).toUpperCase()}</span>
                                </>
                              )}
                            </span>

                            {checkoutLink(d) && !isProcessing && (
                              <a href={checkoutLink(d)} className="wallet-pay-btn">
                                <span>{text("Continue payment")}</span>
                                <span>→</span>
                              </a>
                            )}
                            {checkoutLink(d) && isProcessing && (
                              <a
                                href={checkoutLink(d)}
                                className="wallet-resume-link"
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <span>{text("Re-open payment page")}</span>
                                <span>→</span>
                              </a>
                            )}
                          </div>

                          {/* Informative in-process notice banner */}
                          {isProcessing && (
                            <div className="wallet-record-processing-banner">
                              <RotateCw
                                size={14}
                                className="spin-icon"
                                style={{ flexShrink: 0, color: "#F59E0B" }}
                              />
                              <span>
                                {text(
                                  "Payment in process — waiting for bank confirmation. Funds credit automatically upon clearance.",
                                )}
                              </span>
                              <button
                                type="button"
                                disabled={checkingId === d.id}
                                onClick={() => handleCheckDeposit(d.id)}
                                className="wallet-record-refresh-btn"
                              >
                                <RotateCw
                                  size={12}
                                  className={checkingId === d.id ? "spin-icon" : ""}
                                />
                                <span>
                                  {checkingId === d.id
                                    ? text("Verifying…")
                                    : text("Check Now")}
                                </span>
                              </button>
                            </div>
                          )}
                        </article>
                      );
                    })}

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
                );
              })()}
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
                          <span suppressHydrationWarning>{formatDisplayDateTime(h.createdAt)}</span>
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
