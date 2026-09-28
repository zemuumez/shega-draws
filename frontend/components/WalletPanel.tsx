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
export function WalletPanel({ userId }: { userId: string }) {
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
          accountAPI<WalletData>("/wallet", { signal: c.signal }),
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
      const request = attempt || {
        key: crypto.randomUUID(),
        input: {
          currency,
          amountMinor: hundredths(amount),
          provider: data.methods[0],
          phone: phone.trim(),
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
  return (
    <section className="wallet-panel" aria-label={text("My wallet")}>
      <div className="wallet-heading">
        <h3>{text("My wallet")}</h3>
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
      {!data?.walletPurchasesEnabled && (
        <p className="wallet-notice">
          {text(
            "Wallet ticket purchases are not available yet. Existing ticket checkout is paid separately.",
          )}
        </p>
      )}
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
          <button disabled={busy}>
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
          <button disabled={busy}>
            {text(busy ? "Please wait…" : "Continue to Chapa")}
          </button>
        </form>
      ) : (
        <p>
          {text("New deposits are currently unavailable for this currency.")}
        </p>
      )}
      {error && <p role="alert">{text(error)}</p>}
      {message && <p role="status">{text(message)}</p>}
      <button onClick={() => setRevision((v) => v + 1)}>
        {text("Refresh wallet")}
      </button>
      <h4>{text("Deposit history")}</h4>
      {!deposits ? (
        <p role="status">{text("Loading deposits…")}</p>
      ) : (
        <>
          {!deposits.items.length && <p>{text("No deposits yet.")}</p>}
          {deposits.items.map((d) => (
            <article className="wallet-record" key={d.id}>
              <strong>
                {money(d.amountMinor, d.currency)} · {text(d.status)}
              </strong>
              <small>
                {new Date(d.createdAt).toLocaleString()} · {d.id}
              </small>
              {d.reviewReason && <p>{text(d.reviewReason)}</p>}
              {checkoutLink(d) && (
                <a href={checkoutLink(d)}>{text("Continue payment")}</a>
              )}
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
      <h4>
        {text("Balance history")} · {currency}
      </h4>
      {!history ? (
        <p role="status">{text("Loading balance history…")}</p>
      ) : (
        <>
          {!history.items.length && <p>{text("No balance entries yet.")}</p>}
          {history.items.map((h) => (
            <article className="wallet-record" key={h.id}>
              <strong>
                {text(h.kind.replaceAll("_", " "))} ·{" "}
                {money(h.amountMinor, h.currency)}
              </strong>
              <small>
                {text("Balance after")}:{" "}
                {money(h.balanceAfterMinor, h.currency)} ·{" "}
                {new Date(h.createdAt).toLocaleString()}
              </small>
              <small>{h.reference}</small>
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
    </section>
  );
}
