"use client";

import { useEffect, useState } from "react";
import { publicAPI, type BackendDraw } from "@/lib/backend";
import type { Currency } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function PoolAvailability({
  currency,
  price,
  capacity,
  enabled,
  checkoutOpen,
}: {
  currency: Currency;
  price: number;
  capacity: number;
  enabled: boolean;
  checkoutOpen: boolean;
}) {
  const { t } = useLanguage();
  const [reserved, setReserved] = useState<number | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setReserved(null);
    setFailed(false);
    if (!enabled) return;
    let disposed = false;
    let pending = false;
    let controller: AbortController;
    const refresh = async () => {
      if (pending || document.visibilityState === "hidden") return;
      pending = true;
      controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 10000);
      try {
        const draws = await publicAPI<BackendDraw[]>("/draws", {
          signal: controller.signal,
        });
        const draw = draws.find(
          (d) =>
            d.currency === currency &&
            d.priceMinor === Math.round(price * 100) &&
            d.capacity === capacity &&
            d.status === "open",
        );
        if (!draw) throw new Error("No open draw");
        const data = await publicAPI<{ reserved: number }>(
          `/draws/${encodeURIComponent(draw.id)}/availability`,
          { signal: controller.signal },
        );
        const count = data.reserved;
        if (!disposed) {
          setReserved(count);
          setFailed(false);
        }
      } catch {
        if (!disposed) {
          setReserved(null);
          setFailed(true);
        }
      } finally {
        window.clearTimeout(timeout);
        pending = false;
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 30000 + Math.random() * 5000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      disposed = true;
      controller?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [currency, price, capacity, enabled, checkoutOpen]);

  return (
    <div data-pool-availability style={{ marginTop: 6 }}>
      <div
        role="status"
        style={{
          fontSize: "0.75rem",
          fontWeight: 800,
          color: enabled && reserved !== null ? "#6EE7B7" : "#CBD5E1",
        }}
      >
        {!enabled
          ? t.configurator.paused || "Paused"
          : reserved !== null
            ? `${(capacity - reserved).toLocaleString()} ${t.configurator.spotsRemaining}`
            : failed
              ? t.configurator.availabilityUnavailable
              : t.configurator.checkingAvailability}
      </div>
      {enabled && reserved !== null && (
        <>
          <progress
            aria-label={t.configurator.spotsReserved}
            value={reserved}
            max={capacity}
            style={{
              display: "block",
              width: "100%",
              height: 6,
              margin: "6px 0",
              accentColor: "#34D399",
            }}
          />
          <span
            style={{ display: "block", fontSize: "0.625rem", color: "#94A3B8" }}
          >
            {reserved.toLocaleString()} / {capacity.toLocaleString()}{" "}
            {t.configurator.spotsReserved}
          </span>
        </>
      )}
    </div>
  );
}
