"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Wallet,
  ArrowRight,
  ShieldCheck,
  Zap,
  Lock,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Phone,
  LogIn,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { accountAPI } from "@/lib/account-api";
import { checkoutLink, type Deposit, type WalletData, type WalletPage } from "@/lib/wallet";
import { useLanguage } from "@/lib/i18n/LanguageContext";

export default function DepositPage() {
  const router = useRouter();
  const { text } = useLanguage();
  const { data: session, isPending: sessionLoading } = authClient.useSession();

  const [currency, setCurrency] = useState("ETB");
  const [amount, setAmount] = useState("100");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [deposits, setDeposits] = useState<WalletPage<Deposit> | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [revision, setRevision] = useState(0);

  const presets = currency === "ETB" ? [50, 100, 250, 500, 1000, 2500] : [5, 10, 25, 50, 100];

  useEffect(() => {
    if (!session?.user) return;
    let cancelled = false;

    async function fetchData() {
      try {
        setLoading(true);
        const [w, d] = await Promise.all([
          accountAPI<WalletData>(`/wallet?currency=${currency}`),
          accountAPI<WalletPage<Deposit>>(`/deposits?offset=0`),
        ]);
        if (!cancelled) {
          setWalletData(w);
          setDeposits(d);
          setError("");
        }
      } catch (err: unknown) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load wallet data");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchData();
    return () => {
      cancelled = true;
    };
  }, [session?.user, currency, revision]);

  const activeBalance = walletData?.balances.find((b) => b.currency === currency);
  const currentBalanceFormatted = activeBalance
    ? (activeBalance.availableMinor / 100).toFixed(2)
    : "0.00";

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || !session?.user) return;

    setError("");
    setMessage("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid deposit amount.");
      return;
    }

    const amountMinor = Math.round(parsedAmount * 100);
    const minMinor = walletData?.depositPolicy.minMinor || 5000;
    const maxMinor = walletData?.depositPolicy.maxMinor || 10000000;

    if (amountMinor < minMinor) {
      setError(`Minimum deposit amount is ${(minMinor / 100).toFixed(2)} ${currency}.`);
      return;
    }
    if (amountMinor > maxMinor) {
      setError(`Maximum deposit amount is ${(maxMinor / 100).toFixed(2)} ${currency}.`);
      return;
    }

    try {
      setSubmitting(true);
      const idempotencyKey = crypto.randomUUID();

      const res = await accountAPI<Deposit>("/deposits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          currency,
          amountMinor,
          provider: currency === "ETB" ? "chapa" : "stripe",
          phone: phoneNumber.trim() || undefined,
        }),
      });

      if (res.checkoutUrl) {
        // Redirect directly to Chapa or sandbox checkout
        window.location.href = res.checkoutUrl;
        return;
      }

      setMessage("Deposit recorded. Please follow instructions or check your history.");
      setRevision((v) => v + 1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Deposit failed to initialize");
    } finally {
      setSubmitting(false);
    }
  };

  if (sessionLoading) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
        {text("Loading wallet…")}
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
        <div style={{
          backgroundColor: "#111827",
          border: "1px solid rgba(253, 224, 71, 0.3)",
          borderRadius: "16px",
          padding: "36px 28px",
          maxWidth: "420px",
          textAlign: "center",
          boxShadow: "0 20px 40px rgba(0,0,0,0.5)"
        }}>
          <Wallet size={44} color="#FDE047" style={{ margin: "0 auto 16px" }} />
          <h2 style={{ fontSize: "1.375rem", fontWeight: 800, color: "#F9FAFB", margin: "0 0 10px" }}>
            {text("Sign in to Deposit")}
          </h2>
          <p style={{ fontSize: "0.875rem", color: "#9CA3AF", margin: "0 0 24px" }}>
            {text("You need an active Shega Draws player account to securely deposit ETB or USD funds.")}
          </p>
          <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
            <Link
              href="/login?redirect=/deposit"
              className="casino-btn-gold"
              style={{ padding: "10px 20px", textDecoration: "none", fontSize: "0.875rem" }}
            >
              <LogIn size={14} />
              <span>{text("Sign In")}</span>
            </Link>
            <Link
              href="/signup?redirect=/deposit"
              style={{
                padding: "10px 18px",
                borderRadius: "10px",
                border: "1px solid #374151",
                color: "#E5E7EB",
                textDecoration: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                display: "inline-flex",
                alignItems: "center"
              }}
            >
              <span>{text("Create Account")}</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: "860px",
      margin: "0 auto",
      padding: "32px 16px 64px",
      color: "#F9FAFB",
      fontFamily: "system-ui, -apple-system, sans-serif"
    }}>
      {/* ── Top Header ── */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "16px",
        marginBottom: "28px"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <h1 style={{ margin: 0, fontSize: "1.75rem", fontWeight: 900, color: "#F9FAFB", letterSpacing: "-0.02em" }}>
              {text("Deposit Funds")}
            </h1>
            <span style={{
              backgroundColor: "rgba(16, 185, 129, 0.15)",
              color: "#34D399",
              border: "1px solid rgba(16, 185, 129, 0.4)",
              fontSize: "0.75rem",
              fontWeight: 800,
              padding: "2px 8px",
              borderRadius: "9999px"
            }}>
              ⚡ {text("Instant")}
            </span>
          </div>
          <p style={{ margin: 0, fontSize: "0.875rem", color: "#9CA3AF" }}>
            {text("Fund your digital lottery wallet securely via Chapa (Telebirr, CBE Birr) or International Cards.")}
          </p>
        </div>

        <Link
          href="/profile#wallet"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 14px",
            backgroundColor: "#1F2937",
            border: "1px solid #374151",
            borderRadius: "10px",
            color: "#D1D5DB",
            fontSize: "0.8125rem",
            fontWeight: 700,
            textDecoration: "none"
          }}
        >
          <Wallet size={14} color="#FDE047" />
          <span>{text("View Wallet Ledger")}</span>
        </Link>
      </div>

      {/* ── Balance Ribbon Card ── */}
      <div style={{
        backgroundColor: "#111827",
        border: "1px solid rgba(253, 224, 71, 0.25)",
        borderRadius: "14px",
        padding: "18px 24px",
        marginBottom: "24px",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.6) 100%)"
      }}>
        <div>
          <span style={{ fontSize: "0.75rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
            {text("Current Available Balance")}
          </span>
          <div style={{ fontSize: "1.75rem", fontWeight: 900, color: "#FDE047", display: "flex", alignItems: "baseline", gap: "6px" }}>
            <span>{currentBalanceFormatted}</span>
            <span style={{ fontSize: "1rem", color: "#9CA3AF" }}>{currency}</span>
          </div>
        </div>

        {/* Currency Switcher */}
        <div style={{ display: "flex", gap: "6px", backgroundColor: "#1F2937", padding: "4px", borderRadius: "10px" }}>
          {["ETB", "USD"].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setCurrency(c);
                setAmount(c === "ETB" ? "100" : "10");
              }}
              style={{
                padding: "6px 14px",
                borderRadius: "8px",
                border: "none",
                backgroundColor: currency === c ? "#FDE047" : "transparent",
                color: currency === c ? "#111827" : "#9CA3AF",
                fontWeight: 800,
                fontSize: "0.8125rem",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              {c} {c === "ETB" ? "(Chapa)" : "(Stripe)"}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main Deposit Form Box ── */}
      <div style={{
        backgroundColor: "#111827",
        border: "1px solid #1F2937",
        borderRadius: "16px",
        padding: "28px",
        marginBottom: "32px",
        boxShadow: "0 10px 30px rgba(0,0,0,0.3)"
      }}>
        {error && (
          <div style={{
            backgroundColor: "rgba(239, 68, 68, 0.12)",
            border: "1px solid #EF4444",
            color: "#FCA5A5",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div style={{
            backgroundColor: "rgba(16, 185, 129, 0.12)",
            border: "1px solid #10B981",
            color: "#A7F3D0",
            borderRadius: "10px",
            padding: "12px 16px",
            marginBottom: "20px",
            fontSize: "0.875rem",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}>
            <CheckCircle2 size={18} style={{ flexShrink: 0 }} />
            <span>{message}</span>
          </div>
        )}

        <form onSubmit={handleDeposit}>
          {/* Quick Presets */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "8px", fontWeight: 700 }}>
              {text("Select Quick Amount")}
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {presets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setAmount(preset.toString())}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "8px",
                    border: amount === preset.toString() ? "2px solid #FDE047" : "1px solid #374151",
                    backgroundColor: amount === preset.toString() ? "rgba(253, 224, 71, 0.12)" : "#1F2937",
                    color: amount === preset.toString() ? "#FDE047" : "#E5E7EB",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer"
                  }}
                >
                  {preset} {currency}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Amount Input */}
          <div style={{ marginBottom: "20px" }}>
            <label htmlFor="deposit-amount" style={{ display: "block", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "6px", fontWeight: 700 }}>
              {text("Deposit Amount")} ({currency})
            </label>
            <div style={{ position: "relative" }}>
              <input
                id="deposit-amount"
                type="number"
                step="any"
                min="50"
                max="100000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="50.00"
                required
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: "10px",
                  backgroundColor: "#1F2937",
                  border: "1px solid #374151",
                  color: "#F9FAFB",
                  fontSize: "1.125rem",
                  fontWeight: 700,
                  boxSizing: "border-box"
                }}
              />
              <span style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                fontWeight: 800,
                color: "#9CA3AF"
              }}>
                {currency}
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#6B7280", marginTop: "4px", display: "block" }}>
              {currency === "ETB" ? "Min: 50.00 ETB · Max: 100,000.00 ETB" : "Min: $5.00 · Max: $1,000.00"}
            </span>
          </div>

          {/* Optional Phone Number */}
          {currency === "ETB" && (
            <div style={{ marginBottom: "24px" }}>
              <label htmlFor="deposit-phone" style={{ display: "block", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "6px", fontWeight: 700 }}>
                {text("Phone Number (Telebirr / CBE Birr)")}
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="deposit-phone"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0911234567 or +251911234567"
                  style={{
                    width: "100%",
                    padding: "12px 16px 12px 40px",
                    borderRadius: "10px",
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    color: "#F9FAFB",
                    fontSize: "0.9375rem",
                    boxSizing: "border-box"
                  }}
                />
                <Phone size={16} color="#9CA3AF" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              </div>
            </div>
          )}

          {/* Payment Gateway Provider Banner */}
          <div style={{
            backgroundColor: "#1F2937",
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "28px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid #374151"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{
                width: "40px",
                height: "40px",
                borderRadius: "8px",
                backgroundColor: "#065F46",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#10B981",
                fontWeight: 900,
                fontSize: "1.125rem"
              }}>
                CH
              </div>
              <div>
                <strong style={{ display: "block", fontSize: "0.9375rem", color: "#F9FAFB" }}>
                  {currency === "ETB" ? "Chapa Payment Gateway" : "Stripe International"}
                </strong>
                <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                  {currency === "ETB"
                    ? "Telebirr · CBE Birr · Awash · Visa / Mastercard"
                    : "International Credit & Debit Cards"}
                </span>
              </div>
            </div>
            <span style={{
              backgroundColor: "rgba(16, 185, 129, 0.2)",
              color: "#34D399",
              padding: "4px 8px",
              borderRadius: "6px",
              fontSize: "0.75rem",
              fontWeight: 700
            }}>
              {text("Verified")}
            </span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={submitting}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "12px",
              backgroundColor: "#10B981",
              color: "#064E3B",
              fontSize: "1.0625rem",
              fontWeight: 900,
              border: "none",
              cursor: submitting ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 18px rgba(16, 185, 129, 0.4)",
              transition: "all 0.2s ease",
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? (
              <span>{text("Connecting to Chapa…")}</span>
            ) : (
              <>
                <span>{text("Proceed to Payment")} ({amount || "0"} {currency})</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* ── Recent Deposits History ── */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h2 style={{ fontSize: "1.125rem", fontWeight: 800, margin: 0, color: "#F9FAFB" }}>
            {text("Recent Deposit Records")}
          </h2>
          <button
            type="button"
            onClick={() => setRevision((v) => v + 1)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              backgroundColor: "transparent",
              border: "none",
              color: "#9CA3AF",
              fontSize: "0.75rem",
              cursor: "pointer"
            }}
          >
            <RefreshCw size={12} />
            <span>{text("Refresh")}</span>
          </button>
        </div>

        {!deposits || deposits.items.length === 0 ? (
          <div style={{
            backgroundColor: "#111827",
            borderRadius: "12px",
            padding: "24px",
            textAlign: "center",
            color: "#6B7280",
            border: "1px solid #1F2937",
            fontSize: "0.875rem"
          }}>
            {text("No deposits recorded yet. Make your first deposit above!")}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {deposits.items.map((d) => (
              <div
                key={d.id}
                style={{
                  backgroundColor: "#111827",
                  border: "1px solid #1F2937",
                  borderRadius: "10px",
                  padding: "14px 18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <strong style={{ fontSize: "0.9375rem", color: "#F9FAFB" }}>
                      {(d.amountMinor / 100).toFixed(2)} {d.currency}
                    </strong>
                    <span style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "9999px",
                      backgroundColor:
                        d.status === "succeeded" || d.status === "confirmed"
                          ? "rgba(16, 185, 129, 0.15)"
                          : d.status === "review"
                          ? "rgba(239, 68, 68, 0.15)"
                          : "rgba(245, 158, 11, 0.15)",
                      color:
                        d.status === "succeeded" || d.status === "confirmed"
                          ? "#34D399"
                          : d.status === "review"
                          ? "#F87171"
                          : "#FBBF24"
                    }}>
                      {d.status}
                    </span>
                  </div>
                  <small style={{ color: "#6B7280", fontSize: "0.75rem" }}>
                    {new Date(d.createdAt).toLocaleString()} · ID: {d.id}
                  </small>
                </div>

                {checkoutLink(d) && (
                  <a
                    href={checkoutLink(d)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#FDE047",
                      fontSize: "0.8125rem",
                      fontWeight: 700,
                      textDecoration: "underline"
                    }}
                  >
                    <span>{text("Continue payment")}</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
