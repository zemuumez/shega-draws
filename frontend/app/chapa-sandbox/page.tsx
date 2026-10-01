"use client";

import React, { Suspense, useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

interface SandboxMethod {
  id: string;
  name: string;
  badge: string;
  color: string;
  desc: string;
}

const ETB_SANDBOX_METHODS: SandboxMethod[] = [
  { id: "telebirr", name: "Telebirr", badge: "📱 Mobile", color: "#0284C7", desc: "USSD / SMS prompt" },
  { id: "cbe", name: "CBE Birr", badge: "🏦 Commercial Bank", color: "#7C3AED", desc: "Commercial Bank debit" },
  { id: "boa", name: "Abyssinia", badge: "⚡ BoA Apollo", color: "#F59E0B", desc: "Bank of Abyssinia" },
  { id: "awash", name: "Awash Birr", badge: "💳 Awash Bank", color: "#D97706", desc: "Awash Birr debit" },
  { id: "dashen", name: "Dashen", badge: "📱 Amole", color: "#2563EB", desc: "Dashen Amole mobile" },
  { id: "coop", name: "Coop Bank", badge: "🌾 CoopPay", color: "#059669", desc: "Cooperative Bank" },
  { id: "card_local", name: "ATM Card", badge: "🏧 EthSwitch", color: "#DC2626", desc: "Local debit card" },
];

const USD_SANDBOX_METHODS: SandboxMethod[] = [
  { id: "card_intl", name: "Credit / Debit Card", badge: "💳 Visa • MC • Amex", color: "#2563EB", desc: "International Card" },
  { id: "apple_google_pay", name: "Apple & Google Pay", badge: "⚡ One-Touch", color: "#10B981", desc: "Device Wallet" },
  { id: "paypal_express", name: "PayPal / Express", badge: "🌐 Diaspora Express", color: "#0284C7", desc: "Diaspora PayPal" },
  { id: "wire_transfer", name: "SWIFT Wire", badge: "🏛️ Bank Wire", color: "#7C3AED", desc: "Direct SWIFT wire" },
];

function ChapaSandboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const depositId = searchParams.get("id") || "";
  const amountMinor = parseInt(searchParams.get("amount") || "0", 10);
  const currency = (searchParams.get("currency") || "ETB").toUpperCase();
  const ref = searchParams.get("ref") || "";
  const paramMethod = searchParams.get("method") || "";

  const availableMethods = useMemo(() => {
    return currency === "USD" ? USD_SANDBOX_METHODS : ETB_SANDBOX_METHODS;
  }, [currency]);

  const defaultMethod = useMemo(() => {
    if (paramMethod && availableMethods.some((m) => m.id === paramMethod)) {
      return paramMethod;
    }
    return availableMethods[0]?.id || (currency === "USD" ? "card_intl" : "telebirr");
  }, [paramMethod, availableMethods, currency]);

  const [selectedMethod, setSelectedMethod] = useState(defaultMethod);
  const [phoneNumber, setPhoneNumber] = useState("0911234567");
  const [cardNumber, setCardNumber] = useState("4242 •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("12/28");
  const [cardCvc, setCardCvc] = useState("888");
  const [cardHolder, setCardHolder] = useState("Player Name");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [stepMessage, setStepMessage] = useState("");

  const formattedAmount = (amountMinor / 100).toFixed(2);
  const currentMethodObj = availableMethods.find((m) => m.id === selectedMethod) || availableMethods[0];

  const handleSimulatePayment = async (simulateSuccess: boolean = true) => {
    setStatus("processing");
    setErrorMessage("");

    try {
      if (!simulateSuccess) {
        setStepMessage("Simulating user payment cancellation...");
        await new Promise((r) => setTimeout(r, 600));
        setStatus("error");
        setErrorMessage("Payment was cancelled by the customer in test sandbox.");
        return;
      }

      setStepMessage(`Simulating ${currentMethodObj?.name || selectedMethod} authorization...`);
      await new Promise((r) => setTimeout(r, 600));

      setStepMessage("Validating transaction with Chapa payment processor...");
      await new Promise((r) => setTimeout(r, 600));

      setStepMessage("Sending signed HMAC-SHA256 webhook to API server...");
      const res = await fetch("/api/chapa/simulate-complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: depositId,
          reference: ref,
          status: "success",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to complete simulated payment");
      }

      setStepMessage("Ledger reconciled & wallet balance credited!");
      setStatus("success");

      setTimeout(() => {
        router.push("/profile#wallet");
      }, 1500);
    } catch (err: unknown) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Simulation failed");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#080D1A",
      color: "#F8FAFC",
      fontFamily: "system-ui, -apple-system, sans-serif",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px 16px"
    }}>
      {/* Container */}
      <div style={{
        width: "100%",
        maxWidth: "520px",
        backgroundColor: "#0E1628",
        borderRadius: "18px",
        border: "1.5px solid #1E293B",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.7)",
        overflow: "hidden"
      }}>
        {/* Top Sandbox Notice Banner */}
        <div style={{
          backgroundColor: "#065F46",
          color: "#A7F3D0",
          fontSize: "0.75rem",
          fontWeight: 700,
          letterSpacing: "0.05em",
          textTransform: "uppercase",
          padding: "8px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center"
        }}>
          <span>⚡ Chapa International Gateway</span>
          <span style={{
            backgroundColor: "#047857",
            padding: "2px 8px",
            borderRadius: "9999px",
            fontSize: "0.7rem"
          }}>Sandbox Mode</span>
        </div>

        {/* Chapa Header */}
        <div style={{
          padding: "24px 24px 16px",
          borderBottom: "1px solid #1E293B",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{
                fontSize: "1.375rem",
                fontWeight: 900,
                color: "#10B981",
                letterSpacing: "-0.03em"
              }}>chapa</span>
              <span style={{
                fontSize: "0.75rem",
                color: "#94A3B8",
                backgroundColor: "#162032",
                border: "1px solid #1E293B",
                padding: "2px 8px",
                borderRadius: "6px",
                fontWeight: 700,
              }}>
                {currency === "USD" ? "Global Checkout" : "Ethiopia Checkout"}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#94A3B8" }}>
              Shega Draws International Lottery
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: "#94A3B8" }}>Pay Amount</span>
            <div style={{ fontSize: "1.375rem", fontWeight: 900, color: "#FDE047" }}>
              {formattedAmount} <span style={{ fontSize: "0.875rem", color: "#10B981" }}>{currency}</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: "24px" }}>
          {status === "idle" && (
            <>
              {/* Payment Methods */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <label style={{ fontSize: "0.75rem", color: "#FDE047", fontWeight: 800, letterSpacing: "0.5px", textTransform: "uppercase" }}>
                  {currency === "USD" ? "SELECT GLOBAL PAYMENT METHOD" : "SELECT ETHIOPIAN BANK / METHOD"}
                </label>
                <span style={{ fontSize: "0.7rem", color: "#94A3B8" }}>
                  {availableMethods.length} Channels Available
                </span>
              </div>

              <div style={{
                display: "grid",
                gridTemplateColumns: availableMethods.length > 4 ? "repeat(auto-fill, minmax(130px, 1fr))" : "repeat(2, 1fr)",
                gap: "8px",
                marginBottom: "20px"
              }}>
                {availableMethods.map((m) => {
                  const isSelected = selectedMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedMethod(m.id)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: "10px",
                        border: isSelected ? "2px solid #10B981" : "1px solid #1E293B",
                        backgroundColor: isSelected ? "rgba(16, 185, 129, 0.12)" : "#162032",
                        color: "#F8FAFC",
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 0.15s ease",
                        boxShadow: isSelected ? "0 0 0 1px #10B981, 0 4px 12px rgba(16, 185, 129, 0.2)" : "none"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                        <span style={{ fontSize: "0.6875rem", color: m.color, fontWeight: 800 }}>
                          {m.badge}
                        </span>
                        {isSelected && <span style={{ color: "#10B981", fontSize: "0.75rem", fontWeight: 900 }}>✓</span>}
                      </div>
                      <div style={{ fontSize: "0.8125rem", fontWeight: 800 }}>{m.name}</div>
                      <div style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>{m.desc}</div>
                    </button>
                  );
                })}
              </div>

              {/* Dynamic Input Simulator based on Method */}
              {currency === "USD" && selectedMethod === "card_intl" ? (
                <div style={{ marginBottom: "20px", display: "grid", gap: "10px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#CBD5E1", marginBottom: "4px", fontWeight: 600 }}>
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: "#080D1A",
                        border: "1.5px solid #1E293B",
                        color: "#F8FAFC",
                        fontSize: "0.875rem",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "0.75rem", color: "#CBD5E1", marginBottom: "4px", fontWeight: 600 }}>
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "10px 14px",
                        borderRadius: "8px",
                        backgroundColor: "#080D1A",
                        border: "1.5px solid #1E293B",
                        color: "#F8FAFC",
                        fontSize: "0.875rem",
                        fontFamily: "monospace",
                        boxSizing: "border-box"
                      }}
                    />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#CBD5E1", marginBottom: "4px", fontWeight: 600 }}>
                        Expires
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          backgroundColor: "#080D1A",
                          border: "1.5px solid #1E293B",
                          color: "#F8FAFC",
                          fontSize: "0.875rem",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: "block", fontSize: "0.75rem", color: "#CBD5E1", marginBottom: "4px", fontWeight: 600 }}>
                        CVC / CVV
                      </label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        maxLength={4}
                        style={{
                          width: "100%",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          backgroundColor: "#080D1A",
                          border: "1.5px solid #1E293B",
                          color: "#F8FAFC",
                          fontSize: "0.875rem",
                          boxSizing: "border-box"
                        }}
                      />
                    </div>
                  </div>
                </div>
              ) : currency === "USD" && selectedMethod === "apple_google_pay" ? (
                <div style={{
                  marginBottom: "20px",
                  padding: "16px",
                  backgroundColor: "#162032",
                  borderRadius: "10px",
                  border: "1px solid #1E293B",
                  textAlign: "center"
                }}>
                  <div style={{ fontSize: "1.5rem", marginBottom: "8px" }}>📱</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 800, color: "#F8FAFC" }}>
                    Apple Pay & Google Pay One-Touch Ready
                  </div>
                  <p style={{ margin: "4px 0 0", fontSize: "0.75rem", color: "#94A3B8" }}>
                    Click Authorize below to simulate biometric Face ID / fingerprint confirmation on your device.
                  </p>
                </div>
              ) : currency === "USD" && selectedMethod === "paypal_express" ? (
                <div style={{
                  marginBottom: "20px",
                  padding: "16px",
                  backgroundColor: "#162032",
                  borderRadius: "10px",
                  border: "1px solid #1E293B"
                }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#CBD5E1", marginBottom: "4px", fontWeight: 600 }}>
                    PayPal Account Email
                  </label>
                  <input
                    type="email"
                    defaultValue="player@example.com"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#080D1A",
                      border: "1.5px solid #1E293B",
                      color: "#F8FAFC",
                      fontSize: "0.875rem",
                      boxSizing: "border-box"
                    }}
                  />
                  <small style={{ color: "#94A3B8", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                    Simulates PayPal 1-Click checkout with Chapa Global merchant account.
                  </small>
                </div>
              ) : currency === "USD" && selectedMethod === "wire_transfer" ? (
                <div style={{
                  marginBottom: "20px",
                  padding: "16px",
                  backgroundColor: "#162032",
                  borderRadius: "10px",
                  border: "1px solid #1E293B",
                  fontSize: "0.8125rem"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#94A3B8" }}>Beneficiary Bank:</span>
                    <strong style={{ color: "#F8FAFC" }}>Chapa Global Clearing (ET)</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                    <span style={{ color: "#94A3B8" }}>SWIFT Code:</span>
                    <strong style={{ color: "#FDE047", fontFamily: "monospace" }}>CHAPAETAAXXX</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ color: "#94A3B8" }}>Transfer Reference:</span>
                    <strong style={{ color: "#10B981", fontFamily: "monospace" }}>{ref.slice(0, 16)}</strong>
                  </div>
                </div>
              ) : (
                /* Ethiopian Bank / Phone simulation */
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "0.75rem", color: "#CBD5E1", marginBottom: "6px", fontWeight: 600 }}>
                    Mock {currentMethodObj?.name || "Payment"} Account / Phone Number
                  </label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="0911234567 or account"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      borderRadius: "8px",
                      backgroundColor: "#080D1A",
                      border: "1.5px solid #1E293B",
                      color: "#F8FAFC",
                      fontSize: "0.9375rem",
                      boxSizing: "border-box"
                    }}
                  />
                  <small style={{ color: "#94A3B8", fontSize: "0.75rem", marginTop: "4px", display: "block" }}>
                    Instant USSD / SMS push prompt will be sent to this number to authorize the test payment.
                  </small>
                </div>
              )}

              {/* Sandbox Reference Details */}
              <div style={{
                backgroundColor: "#162032",
                borderRadius: "10px",
                padding: "12px 14px",
                marginBottom: "20px",
                fontSize: "0.75rem",
                color: "#94A3B8",
                border: "1px solid #1E293B"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Deposit ID:</span>
                  <span style={{ color: "#F8FAFC", fontFamily: "monospace" }}>{depositId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Provider Reference:</span>
                  <span style={{ color: "#F8FAFC", fontFamily: "monospace", maxWidth: "220px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ref}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <button
                type="button"
                onClick={() => handleSimulatePayment(true)}
                style={{
                  width: "100%",
                  padding: "14px",
                  borderRadius: "10px",
                  backgroundColor: "#10B981",
                  color: "#064E3B",
                  fontWeight: 900,
                  fontSize: "1rem",
                  border: "none",
                  cursor: "pointer",
                  marginBottom: "12px",
                  boxShadow: "0 4px 14px rgba(16, 185, 129, 0.4)",
                  transition: "background 0.2s"
                }}
              >
                ✓ Authorize Test Payment ({formattedAmount} {currency})
              </button>

              <button
                type="button"
                onClick={() => handleSimulatePayment(false)}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "8px",
                  backgroundColor: "transparent",
                  color: "#EF4444",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  cursor: "pointer",
                }}
              >
                ✕ Simulate Cancelled / Failed Payment
              </button>
            </>
          )}

          {status === "processing" && (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{
                width: "48px",
                height: "48px",
                border: "4px solid rgba(16, 185, 129, 0.2)",
                borderTopColor: "#10B981",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 20px"
              }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 8px" }}>Processing Payment</h3>
              <p style={{ fontSize: "0.875rem", color: "#94A3B8", margin: 0 }}>{stepMessage}</p>
            </div>
          )}

          {status === "success" && (
            <div style={{ textAlign: "center", padding: "32px 16px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#10B981",
                fontSize: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                border: "2px solid #10B981"
              }}>
                ✓
              </div>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 800, margin: "0 0 8px", color: "#10B981" }}>
                Payment Succeeded!
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#F8FAFC", margin: "0 0 4px" }}>
                {formattedAmount} {currency} deposited into your wallet via {currentMethodObj?.name || selectedMethod}.
              </p>
              <p style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                Redirecting back to your wallet...
              </p>
            </div>
          )}

          {status === "error" && (
            <div style={{ textAlign: "center", padding: "24px 16px" }}>
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "rgba(239, 68, 68, 0.15)",
                color: "#EF4444",
                fontSize: "2rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                border: "2px solid #EF4444"
              }}>
                ✕
              </div>
              <h3 style={{ fontSize: "1.125rem", fontWeight: 700, margin: "0 0 8px", color: "#EF4444" }}>
                Simulation Ended
              </h3>
              <p style={{ fontSize: "0.875rem", color: "#94A3B8", marginBottom: "20px" }}>
                {errorMessage}
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setStatus("idle")}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: "#162032",
                    color: "#F8FAFC",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    border: "1.5px solid #1E293B",
                    cursor: "pointer"
                  }}
                >
                  Try Again
                </button>
                <Link
                  href="/profile#wallet"
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: "8px",
                    backgroundColor: "transparent",
                    color: "#94A3B8",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    border: "1.5px solid #1E293B",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  Return to Wallet
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: "12px 24px",
          backgroundColor: "#080D1A",
          borderTop: "1px solid #1E293B",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.75rem",
          color: "#64748B"
        }}>
          <span>Secured by Chapa International</span>
          <Link href="/profile#wallet" style={{ color: "#94A3B8", textDecoration: "none" }}>
            ← Back to Wallet
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ChapaSandboxPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", backgroundColor: "#080D1A", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
        Loading Chapa Checkout Simulator...
      </div>
    }>
      <ChapaSandboxContent />
    </Suspense>
  );
}
