"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

interface BalanceVisibilityContextType {
  showBalance: boolean;
  toggleBalance: () => void;
  formatBalance: (amountDisplay: string, currency?: string) => string;
}

const BalanceVisibilityContext = createContext<BalanceVisibilityContextType>({
  showBalance: true,
  toggleBalance: () => {},
  formatBalance: (amountDisplay) => amountDisplay,
});

const STORAGE_KEY = "rimna_show_balance";

export function BalanceVisibilityProvider({ children }: { children: React.ReactNode }) {
  const [showBalance, setShowBalance] = useState<boolean>(true);

  // Read initial preference on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        setShowBalance(stored === "true");
      }
    } catch {
      // Storage unavailable
    }

    // Sync across browser tabs/windows
    function handleStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY && e.newValue !== null) {
        setShowBalance(e.newValue === "true");
      }
    }
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const toggleBalance = useCallback(() => {
    setShowBalance((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {
        // Storage unavailable
      }
      return next;
    });
  }, []);

  const formatBalance = useCallback(
    (amountDisplay: string, currency?: string) => {
      if (showBalance) return amountDisplay;

      // Extract currency if not provided
      let curr = currency;
      if (!curr) {
        if (amountDisplay.includes("USD") || amountDisplay.includes("$")) {
          curr = "USD";
        } else if (amountDisplay.includes("ETB")) {
          curr = "ETB";
        } else {
          curr = "ETB";
        }
      }
      return `** ${curr}`;
    },
    [showBalance]
  );

  return (
    <BalanceVisibilityContext.Provider value={{ showBalance, toggleBalance, formatBalance }}>
      {children}
    </BalanceVisibilityContext.Provider>
  );
}

export function useBalanceVisibility() {
  return useContext(BalanceVisibilityContext);
}
