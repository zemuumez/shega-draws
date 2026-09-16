"use client";

import { useEffect, useState } from "react";
import type { Currency } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export function PoolAvailability({ currency, price, capacity, enabled, checkoutOpen }: {
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
        const params = new URLSearchParams({ currency, price: String(price), pool: String(capacity) });
        const response = await fetch(`/api/entries/availability?${params}`, { cache: "no-store", signal: controller.signal });
        if (!response.ok) throw new Error("Availability unavailable");
        const data = await response.json();
        if (data.poolSize !== capacity || !Array.isArray(data.takenNumbers)) throw new Error("Invalid availability");
        const count = new Set(data.takenNumbers.map(Number).filter((number: number) => Number.isInteger(number) && number >= 1 && number <= capacity)).size;
        if (!disposed) { setReserved(count); setFailed(false); }
      } catch {
        if (!disposed) { setReserved(null); setFailed(true); }
      } finally {
        window.clearTimeout(timeout);
        pending = false;
      }
    };
    void refresh();
    const interval = window.setInterval(refresh, 15000);
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
      <div role="status" style={{ fontSize: "0.75rem", fontWeight: 800, color: enabled && reserved !== null ? "#6EE7B7" : "#CBD5E1" }}>
        {!enabled ? t.configurator.paused || "Paused" : reserved !== null
          ? `${(capacity - reserved).toLocaleString()} ${t.configurator.spotsRemaining}`
          : failed ? t.configurator.availabilityUnavailable : t.configurator.checkingAvailability}
      </div>
      {enabled && reserved !== null && <>
        <progress aria-label={t.configurator.spotsReserved} value={reserved} max={capacity}
          style={{ display: "block", width: "100%", height: 6, margin: "6px 0", accentColor: "#34D399" }} />
        <span style={{ display: "block", fontSize: "0.625rem", color: "#94A3B8" }}>
          {reserved.toLocaleString()} / {capacity.toLocaleString()} {t.configurator.spotsReserved}
        </span>
      </>}
    </div>
  );
}
