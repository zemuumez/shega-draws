"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Ticket, Users, ShieldCheck, Globe, Trophy } from "lucide-react";
import { NumberPicker } from "./NumberPicker";
import { PaymentProofUploader } from "./PaymentProofUploader";
import { registerPlayer, submitEntry, type Currency, USD_TICKET_CONFIGS, ETB_TICKET_CONFIGS } from "@/lib/api";

interface BuyTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCurrency?: Currency;
  initialPrice?: number;
  initialDrawId?: string;
}

const STEP_LABELS = ["Pool Capacity", "Player Details", "Lucky Number", "Payment & Proof"];

export function BuyTicketModal({
  isOpen,
  onClose,
  initialCurrency = "ETB",
  initialPrice = 100,
  initialDrawId = "RDL-ACTIVE",
}: BuyTicketModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currency: Currency = initialCurrency;
  const ticketPrice: number = initialPrice;
  const drawId: string = initialDrawId;

  // Available pools for the chosen ticket
  const activeTicketConfig = useMemo(() => {
    if (currency === "USD") {
      return USD_TICKET_CONFIGS.find((c) => c.price === ticketPrice) || USD_TICKET_CONFIGS[0];
    }
    return ETB_TICKET_CONFIGS.find((c) => c.price === ticketPrice) || ETB_TICKET_CONFIGS[0];
  }, [currency, ticketPrice]);

  const availablePools = activeTicketConfig.pools;
  const [selectedSize, setSize] = useState<number>(availablePools[availablePools.length > 1 ? 1 : 0]?.size || availablePools[0].size);

  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setSize(availablePools[availablePools.length > 1 ? 1 : 0]?.size || availablePools[0].size);
    }
  }, [isOpen, availablePools]);

  // Step state (0: Pool Size, 1: Player Info, 2: Pick Number, 3: Pay & Confirm, 4: Success)
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

  const currentPool = useMemo(() => {
    return availablePools.find((p) => p.size === selectedSize) || availablePools[0];
  }, [availablePools, selectedSize]);

  const isUSD = currency === "USD";
  const currSymbol = isUSD ? "$" : "ETB";

  const handleApplyPromo = () => {
    if (promoCode.trim().length > 0) {
      setPromoApplied(true);
    }
  };

  const canAdvance = [
    selectedSize > 0,
    name.trim().length >= 2 && phone.trim().length >= 7,
    number.trim().length > 0 && parseInt(number, 10) >= 1 && parseInt(number, 10) <= selectedSize,
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
      form.append("pool_capacity", currentPool.label);
      form.append("method", method);
      if (promoCode.trim()) form.append("promo_code", promoCode.trim());
      if (proofFile) form.append("proof", proofFile);

      await submitEntry(form);
      setStep(4);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(17, 24, 39, 0.7)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "12px",
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade"
        style={{
          background: "#FFFFFF",
          borderRadius: "16px",
          width: "100%",
          maxWidth: 480,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px -10px rgba(0, 0, 0, 0.25)",
          border: "2px solid #F59E0B",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── 1. Clean Minimalist Header ── */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid #E5E7EB",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#FAFAFA",
          }}
        >
          <div>
            <span style={{ fontSize: "0.6875rem", fontWeight: 800, color: "#D97706", textTransform: "uppercase", letterSpacing: "0.5px", display: "block" }}>
              {isUSD ? "Diaspora USD Ticket" : "Official Raffle Ticket"} · #{drawId}
            </span>
            <h3 className="display" style={{ fontSize: "1.15rem", color: "#111827", fontWeight: 900, margin: "1px 0 0" }}>
              {isUSD ? `$${ticketPrice} USD Entry` : `${ticketPrice} ETB Fixed Price`}
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={{
              background: "#FFFFFF",
              border: "1px solid #E5E7EB",
              borderRadius: "50%",
              width: 32,
              height: 32,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "#6B7280",
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── 2. Clean 4-Step Progress Indicator ── */}
        {step < 4 && (
          <div style={{ padding: "10px 18px 0" }}>
            <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  style={{
                    flex: 1,
                    height: 4,
                    borderRadius: 2,
                    background: i <= step ? "#111827" : "#E5E7EB",
                    transition: "all 200ms ease",
                  }}
                />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.6875rem", color: "#6B7280", fontWeight: 700 }}>
              <span>Step {step + 1} of 4: {STEP_LABELS[step]}</span>
              <span className="mono" style={{ color: "#D97706", fontWeight: 800 }}>10 Winners Guaranteed</span>
            </div>
          </div>
        )}

        {/* ── 3. Scrollable Modal Body ── */}
        <div style={{ padding: "14px 18px", overflowY: "auto", flex: 1 }}>
          {/* ── Step 0: Choose Pool Capacity ── */}
          {step === 0 && (
            <div>
              <p style={{ color: "#4B5563", fontSize: "0.8125rem", marginBottom: 12 }}>
                Choose the participant capacity you wish to enter:
              </p>

              {/* 2x2 Responsive Pool Selector Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
                {availablePools.map((p) => {
                  const isSelected = selectedSize === p.size;
                  return (
                    <button
                      key={p.size}
                      type="button"
                      onClick={() => setSize(p.size)}
                      style={{
                        padding: "10px 8px",
                        borderRadius: 8,
                        border: isSelected ? "2px solid #F59E0B" : "1.5px solid #E5E7EB",
                        background: isSelected ? "#FFFBEB" : "#FAFAFA",
                        textAlign: "center",
                        cursor: "pointer",
                        transition: "all 120ms ease",
                      }}
                    >
                      <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 800, color: isSelected ? "#D97706" : "#111827", display: "block" }}>
                        {p.label}
                      </span>
                      <span className="display" style={{ fontSize: "1.05rem", fontWeight: 900, color: isSelected ? "#92400E" : "#111827", margin: "2px 0", display: "block" }}>
                        {p.pool}
                      </span>
                      <span className="mono" style={{ fontSize: "0.625rem", color: "#059669", fontWeight: 700, display: "block" }}>
                        1st: {p.jackpot}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Pool Capacity Sold Bar (Only Shown Inside Modal) */}
              <div style={{ background: "#F9FAFB", border: "1px solid #E5E7EB", borderRadius: 8, padding: "10px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, fontSize: "0.6875rem" }}>
                  <span className="mono" style={{ color: "#6B7280", textTransform: "uppercase", fontWeight: 700 }}>
                    POOL CAPACITY SOLD ({currentPool.label})
                  </span>
                  <span className="mono" style={{ color: "#111827", fontWeight: 800 }}>
                    {Math.round(selectedSize * 0.72).toLocaleString()} / {selectedSize.toLocaleString()} (72%)
                  </span>
                </div>
                <div style={{ height: 6, borderRadius: 4, background: "#E5E7EB", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: "72%",
                      borderRadius: 4,
                      background: "#F59E0B",
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Step 1: Player Contact Info ── */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <p style={{ color: "#4B5563", fontSize: "0.8125rem" }}>
                Enter your details so your winning payout can be transferred immediately:
              </p>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#111827", marginBottom: 4 }}>
                  Full Legal Name (as on Bank/ID)
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="e.g. Abebe Bikila"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ padding: "8px 12px", fontSize: "0.875rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#111827", marginBottom: 4 }}>
                  Phone Number (for Telebirr / CBE / Payouts)
                </label>
                <input
                  type="tel"
                  className="input-base"
                  placeholder="0911 00 00 00 or +1 202 555 0199"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ padding: "8px 12px", fontSize: "0.875rem" }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#111827", marginBottom: 4 }}>
                  Promo Code (Optional)
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="e.g. WINNER10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    style={{ padding: "8px 12px", fontSize: "0.875rem" }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="casino-btn-dark"
                    style={{ padding: "8px 14px", fontSize: "0.75rem" }}
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <span style={{ fontSize: "0.6875rem", color: "#059669", fontWeight: 700, marginTop: 4, display: "block" }}>
                    ✓ Promo code applied successfully!
                  </span>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Pick Lucky Number ── */}
          {step === 2 && (
            <div>
              <p style={{ color: "#4B5563", fontSize: "0.8125rem", marginBottom: 10 }}>
                Select your lucky number between <strong>1</strong> and <strong>{selectedSize.toLocaleString()}</strong>:
              </p>
              <NumberPicker
                poolSize={selectedSize}
                value={number}
                onChange={(n) => setNumber(n)}
              />
            </div>
          )}

          {/* ── Step 3: Payment & Proof ── */}
          {step === 3 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#111827", marginBottom: 6 }}>
                  Select Payment Method:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                  {isUSD ? (
                    <>
                      <button
                        type="button"
                        onClick={() => setMethod("card")}
                        style={{
                          padding: "8px",
                          borderRadius: 6,
                          border: method === "card" ? "2px solid #F59E0B" : "1px solid #E5E7EB",
                          background: method === "card" ? "#FFFBEB" : "#FAFAFA",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: "#111827",
                          cursor: "pointer",
                        }}
                      >
                        Credit / Debit Card
                      </button>
                      <button
                        type="button"
                        onClick={() => setMethod("wire")}
                        style={{
                          padding: "8px",
                          borderRadius: 6,
                          border: method === "wire" ? "2px solid #F59E0B" : "1px solid #E5E7EB",
                          background: method === "wire" ? "#FFFBEB" : "#FAFAFA",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: "#111827",
                          cursor: "pointer",
                        }}
                      >
                        Wire / Remittance
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => setMethod("telebirr")}
                        style={{
                          padding: "8px",
                          borderRadius: 6,
                          border: method === "telebirr" ? "2px solid #F59E0B" : "1px solid #E5E7EB",
                          background: method === "telebirr" ? "#FFFBEB" : "#FAFAFA",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: "#111827",
                          cursor: "pointer",
                        }}
                      >
                        Telebirr
                      </button>
                      <button
                        type="button"
                        onClick={() => setMethod("cbebirr")}
                        style={{
                          padding: "8px",
                          borderRadius: 6,
                          border: method === "cbebirr" ? "2px solid #F59E0B" : "1px solid #E5E7EB",
                          background: method === "cbebirr" ? "#FFFBEB" : "#FAFAFA",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          color: "#111827",
                          cursor: "pointer",
                        }}
                      >
                        CBE Birr / Bank
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Payment Account Details */}
              <div style={{ background: "#FAFAFA", border: "1px solid #E5E7EB", borderRadius: 8, padding: "8px 12px" }}>
                <span className="mono" style={{ fontSize: "0.625rem", color: "#6B7280", textTransform: "uppercase", display: "block" }}>
                  PAY TO ACCOUNT:
                </span>
                <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 800, color: "#111827" }}>
                  {isUSD ? "Rimna Diaspora Corp (USD Account)" : (method === "telebirr" ? "Telebirr: 0911 22 33 44" : "CBE Bank: 1000456789012")}
                </span>
              </div>

              {/* Payment Proof Upload */}
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 800, color: "#111827", marginBottom: 4 }}>
                  Upload Payment Screenshot / Receipt:
                </label>
                <PaymentProofUploader
                  onChange={handleProof}
                  preview={proofPreview}
                  fileName={proofFile?.name}
                />
              </div>

              {error && (
                <p style={{ color: "#DC2626", background: "#FEF2F2", padding: "8px", borderRadius: 6, fontSize: "0.75rem" }}>
                  {error}
                </p>
              )}
            </div>
          )}

          {/* ── Step 4: Confirmation Success Screen ── */}
          {step === 4 && (
            <div style={{ textAlign: "center", padding: "16px 6px" }}>
              <CheckCircle2 size={40} color="#059669" style={{ margin: "0 auto 10px" }} />
              <h3 className="display" style={{ fontSize: "1.25rem", color: "#111827", fontWeight: 900, marginBottom: 4 }}>
                Ticket Confirmed!
              </h3>
              <p style={{ color: "#4B5563", fontSize: "0.8125rem", marginBottom: 16 }}>
                Your lucky number <strong>#{number}</strong> for the <strong>{currentPool.label}</strong> pool has been submitted.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="casino-btn-red"
                style={{ width: "100%", padding: "10px", fontSize: "0.875rem" }}
              >
                Done & View Live Draws
              </button>
            </div>
          )}
        </div>

        {/* ── 4. Sticky Bottom Action Controls ── */}
        {step < 4 && (
          <div
            style={{
              padding: "12px 18px",
              borderTop: "1px solid #E5E7EB",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              background: "#FAFAFA",
            }}
          >
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              style={{
                background: "#FFFFFF",
                border: "1px solid #E5E7EB",
                borderRadius: 8,
                padding: "8px 14px",
                fontSize: "0.8125rem",
                fontWeight: 800,
                color: "#111827",
                cursor: step === 0 ? "not-allowed" : "pointer",
                opacity: step === 0 ? 0.35 : 1,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ChevronLeft size={14} /> Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                disabled={!canAdvance[step]}
                onClick={() => setStep((s) => s + 1)}
                className="casino-btn-red"
                style={{
                  padding: "8px 20px",
                  fontSize: "0.8125rem",
                  fontWeight: 900,
                  opacity: !canAdvance[step] ? 0.5 : 1,
                }}
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canAdvance[3] || loading}
                onClick={submit}
                className="casino-btn-red"
                style={{
                  padding: "9px 22px",
                  fontSize: "0.8125rem",
                  fontWeight: 900,
                  opacity: (!canAdvance[3] || loading) ? 0.5 : 1,
                }}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : `Submit (${currSymbol}${ticketPrice})`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
