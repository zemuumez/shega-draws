"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { accountAPI } from "@/lib/account-api";
import { publicAPI, type BackendDraw, type Order } from "@/lib/backend";
import type { Currency } from "@/lib/api";
import type { CMSSiteSettings } from "@/lib/sanity/queries";
import { AccountPanel } from "./AccountPanel";
import { useLanguage } from "@/lib/i18n/LanguageContext";
interface Props {
  isOpen: boolean;
  onClose: () => void;
  initialCurrency?: Currency;
  initialPrice?: number;
  initialPoolSize?: number;
  siteSettings?: CMSSiteSettings | null;
}
export function BuyTicketModal({
  isOpen,
  onClose,
  initialCurrency = "ETB",
  initialPrice = 100,
  initialPoolSize = 1000,
}: Props) {
  const { text } = useLanguage();
  const { data: session } = authClient.useSession();
  const [mounted, setMounted] = useState(false);
  const [draw, setDraw] = useState<BackendDraw | null>(null);
  const [page, setPage] = useState(0);
  const [number, setNumber] = useState(0);
  const [taken, setTaken] = useState<number[]>([]);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [methods, setMethods] = useState<string[]>([]);
  const [provider, setProvider] = useState("chapa");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [key, setKey] = useState("");
  useEffect(() => {
    setMounted(true);
  }, []);
  useEffect(() => {
    if (!isOpen) return;
    setDraw(null);
    setOrder(null);
    setNumber(0);
    setPage(0);
    setError("");
    setKey(crypto.randomUUID());
    setChecking(true);
    let active = true;
    const controller = new AbortController();
    Promise.all([
      publicAPI<BackendDraw[]>("/draws", { signal: controller.signal }),
      publicAPI<string[]>(`/payment-methods?currency=${initialCurrency}`, {
        signal: controller.signal,
      }),
    ])
      .then(([ds, ms]) => {
        if (!active) return;
        const d = ds.find(
          (d) =>
            d.currency === initialCurrency &&
            d.priceMinor === Math.round(initialPrice * 100) &&
            d.capacity === initialPoolSize &&
            d.status === "open" &&
            Date.parse(d.deadline) > Date.now(),
        );
        if (!d) throw new Error("This draw is not open for sales.");
        setDraw(d);
        setMethods(ms);
        setProvider(ms[0] || "");
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [isOpen, initialCurrency, initialPrice, initialPoolSize]);
  useEffect(() => {
    if (!isOpen || !draw) return;
    let active = true;
    const controller = new AbortController();
    setChecking(true);
    setTaken([]);
    publicAPI<{ takenNumbers: number[]; remaining: number }>(
      `/draws/${encodeURIComponent(draw.id)}/availability?from=${page * 100 + 1}`,
      { signal: controller.signal },
    )
      .then((v) => {
        if (active) {
          setTaken(v.takenNumbers);
          setRemaining(v.remaining);
        }
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setChecking(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [isOpen, draw, page, attempt]);
  useEffect(() => {
    if (!isOpen) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      window.removeEventListener("keydown", key);
    };
  }, [isOpen, onClose, loading]);
  async function buy() {
    if (!draw) return;
    setLoading(true);
    setError("");
    try {
      const o = await accountAPI<Order>("/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({
          drawId: draw.id,
          number,
          provider,
          phone,
          promoCode,
        }),
      });
      setOrder(o);
      if (o.checkoutUrl && o.status === "pending")
        window.location.assign(o.checkoutUrl);
      else
        setError(
          "Your payment is being checked. View its status in My tickets before trying again.",
        );
    } catch (e) {
      setError((e as Error).message);
      setAttempt((v) => v + 1);
    } finally {
      setLoading(false);
    }
  }
  if (!mounted || !isOpen) return null;
  return createPortal(
    <div className="purchase-overlay">
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="purchase-title"
        className="purchase-dialog"
      >
        <button
          className="modal-close"
          aria-label="Close"
          disabled={loading}
          onClick={onClose}
        >
          <X />
        </button>
        <h2 id="purchase-title">{text("Buy ticket")}</h2>
        <p>
          {initialCurrency} {initialPrice.toLocaleString()} ·{" "}
          {initialPoolSize.toLocaleString()} {text("pool")}
        </p>
        {!session || !session.user.emailVerified ? (
          <AccountPanel compact />
        ) : (
          draw && (
            <>
              <p>
                {remaining !== null
                  ? `${remaining.toLocaleString()} ${text("places remaining")}`
                  : text("Checking availability…")}
              </p>
              <label>
                {text("Phone number")}
                <input
                  type="tel"
                  autoComplete="tel"
                  placeholder="+251911123456"
                  value={phone}
                  disabled={!!order}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    setKey(crypto.randomUUID());
                  }}
                />
              </label>
              <label>
                {text("Promo code (optional)")}
                <input
                  maxLength={25}
                  value={promoCode}
                  disabled={!!order}
                  onChange={(e) => {
                    setPromoCode(e.target.value.toUpperCase());
                    setKey(crypto.randomUUID());
                  }}
                />
              </label>
              <label>
                {text("Ticket number")}
                <input
                  type="number"
                  min={1}
                  max={draw.capacity}
                  value={number || ""}
                  disabled={!!order}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setNumber(n);
                    setKey(crypto.randomUUID());
                    if (n >= 1 && n <= draw.capacity)
                      setPage(Math.floor((n - 1) / 100));
                  }}
                />
              </label>
              <div className="ticket-number-grid">
                {Array.from(
                  { length: Math.min(100, draw.capacity - page * 100) },
                  (_, i) => page * 100 + i + 1,
                ).map((n) => (
                  <button
                    key={n}
                    type="button"
                    disabled={checking || taken.includes(n) || !!order}
                    aria-pressed={n === number}
                    onClick={() => {
                      setNumber(n);
                      setKey(crypto.randomUUID());
                    }}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="ticket-paging">
                <button
                  disabled={page === 0 || !!order}
                  onClick={() => setPage((p) => p - 1)}
                >
                  {text("Previous")}
                </button>
                <span>
                  {page + 1}/{Math.ceil(draw.capacity / 100)}
                </span>
                <button
                  disabled={(page + 1) * 100 >= draw.capacity || !!order}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {text("Next")}
                </button>
                <button
                  disabled={checking}
                  onClick={() => setAttempt((v) => v + 1)}
                >
                  {text("Refresh")}
                </button>
              </div>
              <label>
                {text("Payment method")}
                <select
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                >
                  {methods.map((m) => (
                    <option key={m} value={m}>
                      {m === "chapa" ? "Chapa" : m}
                    </option>
                  ))}
                </select>
              </label>
              {!methods.length && (
                <p role="status">
                  {text(
                    "Payments are not configured yet. Please check back soon.",
                  )}
                </p>
              )}
              <button
                className="primary-action"
                disabled={
                  loading ||
                  checking ||
                  !!order ||
                  !provider ||
                  !/^\+[1-9]\d{7,14}$/.test(phone) ||
                  number < 1 ||
                  number > draw.capacity ||
                  taken.includes(number)
                }
                onClick={buy}
              >
                {text(
                  loading ? "Preparing payment…" : "Continue to secure payment",
                )}
              </button>
              <p>
                <small>
                  {text(
                    "Your number is held for up to 15 minutes. A ticket is issued only after payment is verified.",
                  )}
                </small>
              </p>
            </>
          )
        )}
        {checking && <p role="status">{text("Checking availability…")}</p>}
        {error && <p role="alert">{text(error)}</p>}
        {order && (
          <a href="/account">{text("View my tickets and payment status")}</a>
        )}
      </section>
    </div>,
    document.body,
  );
}
