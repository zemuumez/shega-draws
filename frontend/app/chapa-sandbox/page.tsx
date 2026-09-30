"use client";

import React, { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

function ChapaSandboxContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const depositId = searchParams.get("id") || "";
  const amountMinor = parseInt(searchParams.get("amount") || "0", 10);
  const currency = searchParams.get("currency") || "ETB";
  const ref = searchParams.get("ref") || "";

  const [selectedMethod, setSelectedMethod] = useState<"telebirr" | "cbe" | "awash">("telebirr");
  const [phoneNumber, setPhoneNumber] = useState("0911234567");
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [stepMessage, setStepMessage] = useState("");

  const formattedAmount = (amountMinor / 100).toFixed(2);

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

      setStepMessage(`Simulating ${selectedMethod.toUpperCase()} authorization...`);
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
      backgroundColor: "#0B0F19",
      color: "#F9FAFB",
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
        maxWidth: "480px",
        backgroundColor: "#111827",
        borderRadius: "16px",
        border: "1px solid #1F2937",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
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
          <span>⚡ Chapa Sandbox Simulator</span>
          <span style={{
            backgroundColor: "#047857",
            padding: "2px 8px",
            borderRadius: "9999px",
            fontSize: "0.7rem"
          }}>Test Mode</span>
        </div>

        {/* Chapa Header */}
        <div style={{
          padding: "24px 24px 16px",
          borderBottom: "1px solid #1F2937",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
              <span style={{
                fontSize: "1.25rem",
                fontWeight: 800,
                color: "#10B981",
                letterSpacing: "-0.03em"
              }}>chapa</span>
              <span style={{
                fontSize: "0.75rem",
                color: "#9CA3AF",
                backgroundColor: "#1F2937",
                padding: "2px 6px",
                borderRadius: "4px"
              }}>Checkout</span>
            </div>
            <p style={{ margin: 0, fontSize: "0.8125rem", color: "#9CA3AF" }}>
              Rimna International Lottery
            </p>
          </div>
          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>Amount</span>
            <div style={{ fontSize: "1.375rem", fontWeight: 800, color: "#F9FAFB" }}>
              {formattedAmount} <span style={{ fontSize: "0.875rem", color: "#10B981" }}>{currency}</span>
            </div>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: "24px" }}>
          {status === "idle" && (
            <>
              {/* Payment Methods */}
              <label style={{ display: "block", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "10px", fontWeight: 600 }}>
                SELECT TEST PAYMENT METHOD
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "20px" }}>
                {[
                  { id: "telebirr", name: "Telebirr", badge: "📱 Popular", color: "#0284C7" },
                  { id: "cbe", name: "CBE Birr", badge: "🏦 Bank", color: "#7C3AED" },
                  { id: "awash", name: "Awash", badge: "💳 Birr", color: "#D97706" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMethod(m.id as any)}
                    style={{
                      padding: "12px 8px",
                      borderRadius: "10px",
                      border: selectedMethod === m.id ? "2px solid #10B981" : "1px solid #374151",
                      backgroundColor: selectedMethod === m.id ? "rgba(16, 185, 129, 0.1)" : "#1F2937",
                      color: "#F9FAFB",
                      cursor: "pointer",
                      textAlign: "center",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", color: m.color, fontWeight: 700, marginBottom: "2px" }}>
                      {m.badge}
                    </div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700 }}>{m.name}</div>
                  </button>
                ))}
              </div>

              {/* Phone input simulation */}
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "0.8125rem", color: "#9CA3AF", marginBottom: "6px" }}>
                  Mock {selectedMethod === "cbe" ? "CBE Account / Phone" : "Phone Number"}
                </label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0911234567"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    borderRadius: "8px",
                    backgroundColor: "#1F2937",
                    border: "1px solid #374151",
                    color: "#F9FAFB",
                    fontSize: "0.9375rem",
                    boxSizing: "border-box"
                  }}
                />
              </div>

              {/* Sandbox Reference Details */}
              <div style={{
                backgroundColor: "#1F2937",
                borderRadius: "8px",
                padding: "12px 14px",
                marginBottom: "24px",
                fontSize: "0.75rem",
                color: "#9CA3AF"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span>Deposit ID:</span>
                  <span style={{ color: "#E5E7EB", fontFamily: "monospace" }}>{depositId}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>Provider Reference:</span>
                  <span style={{ color: "#E5E7EB", fontFamily: "monospace", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{ref}</span>
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
                  fontWeight: 800,
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
              <p style={{ fontSize: "0.875rem", color: "#9CA3AF", margin: 0 }}>{stepMessage}</p>
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
              <p style={{ fontSize: "0.875rem", color: "#D1D5DB", margin: "0 0 4px" }}>
                {formattedAmount} {currency} deposited into your wallet.
              </p>
              <p style={{ fontSize: "0.75rem", color: "#9CA3AF" }}>
                Redirecting back to your profile wallet...
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
              <p style={{ fontSize: "0.875rem", color: "#9CA3AF", marginBottom: "20px" }}>
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
                    backgroundColor: "#1F2937",
                    color: "#F9FAFB",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    border: "1px solid #374151",
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
                    color: "#9CA3AF",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                    border: "1px solid #374151",
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
          backgroundColor: "#0D1117",
          borderTop: "1px solid #1F2937",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: "0.75rem",
          color: "#6B7280"
        }}>
          <span>Secured by Chapa Sandbox</span>
          <Link href="/profile#wallet" style={{ color: "#9CA3AF", textDecoration: "none" }}>
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
      <div style={{ minHeight: "100vh", backgroundColor: "#0B0F19", display: "flex", alignItems: "center", justifyContent: "center", color: "#9CA3AF" }}>
        Loading Chapa Sandbox Simulator...
      </div>
    }>
      <ChapaSandboxContent />
    </Suspense>
  );
}
