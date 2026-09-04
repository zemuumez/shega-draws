"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Ticket, Users, ShieldCheck, Trophy, Sparkles, Check } from "lucide-react";
import { NumberPicker } from "./NumberPicker";
import { PaymentProofUploader } from "./PaymentProofUploader";
import { registerPlayer, submitEntry, getUser, type Currency, USD_TICKET_CONFIGS, ETB_TICKET_CONFIGS } from "@/lib/api";

import type { CMSSiteSettings } from "@/lib/sanity/queries";

interface BuyTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCurrency?: Currency;
  initialPrice?: number;
  initialPoolSize?: number;
  initialDrawId?: string;
  siteSettings?: CMSSiteSettings | null;
}

const STEP_LABELS = ["Player Details", "Lucky Number", "Payment & Proof"];

export function BuyTicketModal({
  isOpen,
  onClose,
  initialCurrency = "ETB",
  initialPrice = 100,
  initialPoolSize = 1000,
  initialDrawId = "RDL-ACTIVE",
  siteSettings,
}: BuyTicketModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currency: Currency = initialCurrency;
  const ticketPrice: number = initialPrice;
  const poolSize: number = initialPoolSize;
  const drawId: string = initialDrawId;

  // Step state (0: Player Info, 1: Pick Number, 2: Pay & Confirm, 3: Success)
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [number, setNumber] = useState("7");
  const [method, setMethod] = useState(currency === "USD" ? "card" : "telebirr");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");

  // Auto-fill logged in user info and reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setError("");
      setProofFile(null);
      setProofPreview("");
      setPromoCode("");
      setPromoApplied(false);
      setNumber("7");

      const currentUser = getUser();
      if (currentUser) {
        setName(currentUser.name || "");
        setPhone(currentUser.phone || "");
      } else {
        setName("");
        setPhone("");
      }
    }
  }, [isOpen]);

  const isUSD = currency === "USD";
  const currSymbol = isUSD ? "$" : "ETB";

  const handleApplyPromo = () => {
    if (promoCode.trim().length > 0) {
      setPromoApplied(true);
    }
  };

  const canAdvance = [
    name.trim().length >= 2 && phone.trim().length >= 7,
    number.trim().length > 0 && parseInt(number, 10) >= 1 && parseInt(number, 10) <= poolSize,
    !!proofFile && !!method,
  ];

  function handleProof(file: File) {
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setProofPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function submit() {
    setLoading(true);
    setError("");
    try {
      await registerPlayer({ name: name.trim(), phone: phone.trim() });

      const form = new FormData();
      form.append("name", name.trim());
      form.append("phone", phone.trim());
      form.append("draw_id", drawId);
      form.append("number", number);
      form.append("amount", String(ticketPrice));
      form.append("currency", currency);
      form.append("pool_capacity", `${poolSize.toLocaleString()} tickets`);
      form.append("method", method);
      if (promoCode.trim()) form.append("promo_code", promoCode.trim());
      if (proofFile) form.append("proof", proofFile);

      await submitEntry(form);
      setStep(3); // Success step
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || !isOpen) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(11, 15, 25, 0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && step !== 3) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: 620,
          background: "rgba(15, 23, 42, 0.82)",
          backdropFilter: "blur(28px) saturate(190%)",
          WebkitBackdropFilter: "blur(28px) saturate(190%)",
          borderRadius: "24px",
          border: "2px solid rgba(253, 224, 71, 0.75)",
          boxShadow:
            "0 32px 80px rgba(0, 0, 0, 0.85), 0 0 0 1px rgba(254, 240, 138, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          color: "#FFFFFF",
          overflow: "hidden",
          position: "relative",
          animation: "modalFadeIn 200ms ease-out",
        }}
      >
        <style>{`
          @keyframes modalFadeIn {
            from { opacity: 0; transform: scale(0.96) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
          }
        `}</style>

        {/* ── Modal Header: Persistent Lottery Customization Info ── */}
        <div
          style={{
            padding: "20px 24px 16px",
            borderBottom: "1.5px solid rgba(253, 224, 71, 0.35)",
            background: "linear-gradient(180deg, rgba(15, 23, 42, 0.6) 0%, rgba(0, 0, 0, 0.4) 100%)",
            position: "relative",
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 18,
              right: 20,
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#CBD5E1",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#FFFFFF";
              e.currentTarget.style.borderColor = "#FDE047";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#CBD5E1";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
            }}
          >
            <X size={16} />
          </button>

          <span
            style={{
              fontSize: "0.6875rem",
              fontWeight: 900,
              color: "#FEF08A",
              letterSpacing: "0.8px",
              textTransform: "uppercase",
              display: "block",
              marginBottom: 4,
            }}
          >
            {isUSD ? "DIASPORA USD TICKET" : "ETHIOPIA NATIONAL ETB TIER"} · #{drawId}
          </span>

          <h2
            className="display"
            style={{
              fontSize: "clamp(1.4rem, 2.5vw, 1.85rem)",
              fontWeight: 900,
              color: "#FFFFFF",
              margin: "0 0 4px",
              lineHeight: 1.15,
            }}
          >
            {isUSD ? `$${ticketPrice} USD` : `${ticketPrice} ETB`} Entry Ticket
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.75rem", color: "#CBD5E1" }}>
            <span style={{ color: "#6EE7B7", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Users size={12} /> {poolSize.toLocaleString()} Capped Pool
            </span>
            <span>•</span>
            <span style={{ color: "#FEF08A", fontWeight: 800 }}>10 Guaranteed Winners</span>
          </div>

          {/* 3-Step Luxury Progress Bar (Only during steps 0-2) */}
          {step < 3 && (
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                {STEP_LABELS.map((lbl, idx) => (
                  <div
                    key={lbl}
                    style={{
                      flex: 1,
                      height: 4,
                      borderRadius: 2,
                      background: idx <= step ? "linear-gradient(90deg, #FDE047, #EAB308)" : "rgba(255, 255, 255, 0.15)",
                      boxShadow: idx <= step ? "0 0 8px rgba(253, 224, 71, 0.6)" : "none",
                      transition: "all 250ms ease",
                    }}
                  />
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem" }}>
                <span style={{ color: "#CBD5E1", fontWeight: 700 }}>
                  Step {step + 1} of 3: <strong style={{ color: "#FFFFFF" }}>{STEP_LABELS[step]}</strong>
                </span>
                <span style={{ color: "#FEF08A", fontWeight: 800, fontSize: "0.6875rem" }}>
                  10 Winners Guaranteed
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Body ────────────────────────────────────────────── */}
        <div style={{ padding: "20px 24px", maxHeight: "calc(85vh - 160px)", overflowY: "auto" }}>
          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1.5px solid #EF4444",
                color: "#FCA5A5",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "0.8125rem",
                marginBottom: 16,
              }}
            >
              {error}
            </div>
          )}

          {/* STEP 1: Player Details */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: "0.875rem", color: "#CBD5E1", margin: 0 }}>
                Enter your player details so your winning cash payout can be transferred immediately upon live draw completion:
              </p>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Full Legal Name (as on Bank / ID)
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abebe Bikila"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: "1.5px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    color: "#FFFFFF",
                    fontSize: "0.9375rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Phone Number (for Telebirr / CBE / Instant Payouts)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0911 00 00 00 or +1 202 555 0199"
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: "1.5px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    color: "#FFFFFF",
                    fontSize: "0.9375rem",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#CBD5E1", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Promo / Referral Code (Optional)
                </label>
                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="e.g. WINNER10"
                    style={{
                      flex: 1,
                      padding: "12px 14px",
                      background: "rgba(0, 0, 0, 0.5)",
                      border: "1.5px solid rgba(255, 255, 255, 0.2)",
                      borderRadius: "10px",
                      color: "#FFFFFF",
                      fontSize: "0.9375rem",
                      boxSizing: "border-box",
                      outline: "none",
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    style={{
                      padding: "0 18px",
                      background: promoApplied ? "rgba(16, 185, 129, 0.3)" : "rgba(255, 255, 255, 0.15)",
                      border: promoApplied ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.25)",
                      color: promoApplied ? "#6EE7B7" : "#FFFFFF",
                      borderRadius: "10px",
                      fontWeight: 800,
                      fontSize: "0.8125rem",
                      cursor: "pointer",
                    }}
                  >
                    {promoApplied ? "Applied ✓" : "Apply"}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Lucky Number Selection */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: "0.875rem", color: "#CBD5E1", margin: "0 0 14px" }}>
                Select your lucky ticket number between <strong>1</strong> and <strong>{poolSize.toLocaleString()}</strong>:
              </p>
              <NumberPicker value={number} onChange={setNumber} poolSize={poolSize} />
            </div>
          )}

          {/* STEP 3: Payment & Proof Verification */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Payment Method Selector */}
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  Choose Payment Method
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                  {(isUSD
                    ? [
                        { id: "card", label: "Credit / Debit Card", badge: "Instant" },
                        { id: "paypal", label: "PayPal / Diaspora", badge: "Secure" },
                      ]
                    : [
                        { id: "telebirr", label: "Telebirr", badge: "Official" },
                        { id: "cbe", label: "CBE Birr / Bank", badge: "Official" },
                        { id: "chapa", label: "Chapa / Cards", badge: "All Banks" },
                      ]
                  ).map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMethod(m.id)}
                      style={{
                        padding: "12px 10px",
                        background: method === m.id ? "rgba(254, 240, 138, 0.2)" : "rgba(0, 0, 0, 0.4)",
                        border: method === m.id ? "2px solid #FDE047" : "1.5px solid rgba(255, 255, 255, 0.15)",
                        borderRadius: "12px",
                        color: method === m.id ? "#FEF08A" : "#FFFFFF",
                        fontWeight: 800,
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                        textAlign: "center",
                      }}
                    >
                      <div>{m.label}</div>
                      <span style={{ fontSize: "0.625rem", color: method === m.id ? "#FDE047" : "#94A3B8" }}>
                        {m.badge}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Transfer Instructions Box */}
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.45)",
                  border: "1.5px solid rgba(253, 224, 71, 0.4)",
                  borderRadius: "14px",
                  padding: "14px 16px",
                  fontSize: "0.8125rem",
                  color: "#E2E8F0",
                }}
              >
                <div style={{ fontWeight: 800, color: "#FEF08A", marginBottom: 4 }}>
                  Transfer Exact Amount: <span style={{ fontSize: "1rem", color: "#FFFFFF" }}>{isUSD ? `$${ticketPrice} USD` : `${ticketPrice} ETB`}</span>
                </div>
                {method === "telebirr" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div>
                      Telebirr Merchant Code: <strong style={{ color: "#FDE047", fontSize: "0.9375rem" }}>{siteSettings?.telebirrMerchantCode || "884729"}</strong>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                      Merchant: {siteSettings?.siteName || "Rimna International Digital Lottery"} • Hotline: {siteSettings?.contactPhone || "+251 911 000 000"}
                    </div>
                  </div>
                )}
                {method === "cbe" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div>
                      Commercial Bank of Ethiopia (CBE) Account: <strong style={{ color: "#FDE047", fontSize: "0.9375rem" }}>{siteSettings?.cbeAccountNumber || "1000 1234 5678"}</strong>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                      Account Holder: <strong style={{ color: "#FFFFFF" }}>{siteSettings?.cbeAccountName || "Rimna International Digital Lottery PLC"}</strong>
                    </div>
                  </div>
                )}
                {method === "card" && (
                  <div>
                    {isUSD && siteSettings?.diasporaWireInstructions ? (
                      <div style={{ whiteSpace: "pre-line" }}>{siteSettings.diasporaWireInstructions}</div>
                    ) : (
                      <div>Secure Visa / Mastercard clearing gateway with instant 256-bit SSL tokenization.</div>
                    )}
                  </div>
                )}
                {method === "paypal" && (
                  <div>
                    {siteSettings?.diasporaWireInstructions ? (
                      <div style={{ whiteSpace: "pre-line" }}>{siteSettings.diasporaWireInstructions}</div>
                    ) : (
                      <div>PayPal & Diaspora Wire instructions: Send to verified official clearing gateway.</div>
                    )}
                  </div>
                )}
                {method === "chapa" && (
                  <div>
                    Instant transfer supported across Awash, Dashen, Abyssinia, and all Ethiopian bank apps to {siteSettings?.siteName || "Rimna Digital Lottery"}.
                  </div>
                )}
              </div>

              {/* Payment Proof Uploader */}
              <PaymentProofUploader onChange={handleProof} preview={proofPreview} fileName={proofFile?.name} />
            </div>
          )}

          {/* STEP 4: Success & Verified Ticket Stub */}
          {step === 3 && (
            <div style={{ textAlign: "center", padding: "16px 0" }}>
              <div
                style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: "rgba(16, 185, 129, 0.2)",
                  border: "2px solid #10B981",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 16px",
                }}
              >
                <CheckCircle2 size={32} color="#34D399" />
              </div>

              <span style={{ fontSize: "0.6875rem", fontWeight: 900, color: "#FEF08A", textTransform: "uppercase" }}>
                ENTRY SUBMITTED SUCCESSFULLY
              </span>

              <h3 className="display" style={{ fontSize: "1.75rem", fontWeight: 900, color: "#FFFFFF", margin: "6px 0 10px" }}>
                Lucky Number #{number} Confirmed!
              </h3>

              <p style={{ fontSize: "0.875rem", color: "#CBD5E1", maxWidth: 440, margin: "0 auto 20px" }}>
                Your payment proof for <strong>{isUSD ? `$${ticketPrice} USD` : `${ticketPrice} ETB`}</strong> has been received. Our automated auditing team is verifying your ticket for the scheduled live video draw.
              </p>

              <div
                style={{
                  background: "rgba(0, 0, 0, 0.5)",
                  border: "1.5px solid rgba(253, 224, 71, 0.7)",
                  borderRadius: "16px",
                  padding: "16px",
                  marginBottom: 20,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textAlign: "left",
                }}
              >
                <div>
                  <span style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>REGISTERED PLAYER</span>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "#FFFFFF" }}>{name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#CBD5E1" }}>{phone}</div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.6875rem", color: "#FEF08A" }}>LUCKY NUMBER</span>
                  <div className="display" style={{ fontSize: "2rem", fontWeight: 900, color: "#FDE047", lineHeight: 1 }}>
                    #{number}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="casino-btn-gold"
                style={{ padding: "12px 32px", fontSize: "0.9375rem", fontWeight: 900, cursor: "pointer" }}
              >
                Done & View Dashboard
              </button>
            </div>
          )}
        </div>

        {/* ── Modal Footer: Navigation Controls ─────────────────────── */}
        {step < 3 && (
          <div
            style={{
              padding: "16px 24px",
              borderTop: "1.5px solid rgba(253, 224, 71, 0.3)",
              background: "rgba(0, 0, 0, 0.4)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {step > 0 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  color: "#CBD5E1",
                  borderRadius: "10px",
                  padding: "10px 18px",
                  fontSize: "0.875rem",
                  fontWeight: 800,
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <ChevronLeft size={16} /> Back
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                type="button"
                disabled={!canAdvance[step]}
                onClick={() => setStep((s) => s + 1)}
                className="casino-btn-red"
                style={{
                  padding: "11px 24px",
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  cursor: !canAdvance[step] ? "not-allowed" : "pointer",
                  opacity: !canAdvance[step] ? 0.5 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                Continue <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                disabled={loading || !canAdvance[2]}
                onClick={submit}
                className="casino-btn-red"
                style={{
                  padding: "11px 24px",
                  fontSize: "0.875rem",
                  fontWeight: 900,
                  cursor: loading || !canAdvance[2] ? "not-allowed" : "pointer",
                  opacity: loading || !canAdvance[2] ? 0.5 : 1,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <ShieldCheck size={16} />}
                {loading ? "Confirming Ticket..." : `Confirm & Enter — ${isUSD ? `$${ticketPrice}` : `${ticketPrice} ETB`}`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
