"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Ticket, Users, Tag, ShieldCheck, Globe, Trophy } from "lucide-react";
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

const STEPS = ["1. Pool Size", "2. Player Info", "3. Pick Number", "4. Pay & Confirm"];

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
      form.append("draw_id", drawId);
      form.append("number", number);
      form.append("amount", String(ticketPrice));
      form.append("currency", currency);
      form.append("method", method);
      if (promoCode.trim()) form.append("promo_code", promoCode.trim());
      form.append("proof", proofFile!);

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
        backgroundColor: "rgba(10, 25, 59, 0.75)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        zIndex: 99999,
        overflowY: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="modal-container-card animate-fade"
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: 560,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "clamp(18px, 4vw, 28px)",
          position: "relative",
          boxShadow: "0 25px 60px -15px rgba(0, 0, 0, 0.4)",
          border: "2px solid #FDE047",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "#F1F5F9",
            border: "none",
            borderRadius: "50%",
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-muted)",
            zIndex: 10,
          }}
        >
          <X size={18} />
        </button>

        {/* ── Pre-populated Ticket Header Ribbon ── */}
        <div
          style={{
            background: "linear-gradient(135deg, #FFFDF5 0%, #EFF6FF 100%)",
            border: "1.5px solid #C3DAFE",
            borderRadius: 12,
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                background: isUSD ? "var(--blue-bg)" : "#FEF9C3",
                color: isUSD ? "#2A65E6" : "var(--gold-deep)",
                border: `1px solid ${isUSD ? "var(--blue-border)" : "#FDE047"}`,
                padding: "3px 8px",
                borderRadius: 6,
                fontSize: "0.6875rem",
                fontWeight: 800,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              {isUSD ? <Globe size={12} /> : <Ticket size={12} />}
              {isUSD ? "DIASPORA USD TICKET" : "LOCAL ETB TICKET"}
            </span>

            <span className="mono" style={{ fontSize: "0.75rem", color: "#111827", fontWeight: 800 }}>
              Fixed Price: {isUSD ? `$${ticketPrice}` : `${ticketPrice} ETB`}
            </span>
          </div>

          <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--teal-dark)", fontWeight: 800, display: "flex", alignItems: "center", gap: 4 }}>
            <Trophy size={12} color="var(--gold-dark)" /> 10 Guaranteed Winners
          </span>
        </div>

        {/* 4-Step Progress Indicator */}
        {step < 4 && (
          <nav aria-label="Progress" style={{ display: "flex", gap: 6, marginBottom: 18 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1 }}>
                <div
                  style={{
                    height: 4,
                    borderRadius: 4,
                    background: i <= step ? "#2A65E6" : "#E2E8F0",
                    transition: "all 300ms ease",
                  }}
                />
                <span
                  className="mono"
                  style={{
                    fontSize: "0.5625rem",
                    color: i === step ? "#111827" : "var(--text-subtle)",
                    fontWeight: i === step ? 800 : 600,
                    display: "block",
                    marginTop: 4,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </nav>
        )}

        {/* ── Step 0: Choose Pool Capacity ── */}
        {step === 0 && (
          <div>
            <span className="badge badge-blue" style={{ marginBottom: 6, fontSize: "0.6875rem" }}>
              <Users size={11} /> Step 1 of 4: Pool Size
            </span>
            <h3 className="display" style={{ fontSize: "1.25rem", color: "#111827", fontWeight: 800, marginBottom: 2 }}>
              Choose Participant Pool
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginBottom: 14 }}>
              Select pool capacity for this {isUSD ? `$${ticketPrice}` : `${ticketPrice} ETB`} ticket.
            </p>

            {/* Pool Selector Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8, marginBottom: 14 }}>
              {availablePools.map((p) => {
                const isSelected = selectedSize === p.size;
                return (
                  <button
                    key={p.size}
                    type="button"
                    onClick={() => setSize(p.size)}
                    style={{
                      padding: "12px 8px",
                      borderRadius: 8,
                      border: isSelected ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
                      background: isSelected ? "var(--blue-bg)" : "#FFFFFF",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 800, color: isSelected ? "#2A65E6" : "#111827", display: "block" }}>
                      {p.label}
                    </span>
                    <span className="display" style={{ fontSize: "1.1rem", fontWeight: 800, color: isSelected ? "var(--gold-deep)" : "#111827", margin: "2px 0", display: "block" }}>
                      {p.pool}
                    </span>
                    <span className="mono" style={{ fontSize: "0.625rem", color: "var(--teal-dark)", fontWeight: 700, display: "block" }}>
                      1st: {p.jackpot}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Live Tickets Confirmed Progress Bar */}
            <div style={{ background: "#F8FAFC", border: "1px solid var(--gray-line)", borderRadius: 10, padding: "10px 12px", marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, flexWrap: "wrap", gap: 4 }}>
                <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", textTransform: "uppercase", fontWeight: 700 }}>
                  TICKETS CONFIRMED ({currentPool.label})
                </span>
                <span className="mono" style={{ fontSize: "0.75rem", color: "#111827", fontWeight: 800 }}>
                  {Math.round(selectedSize * 0.72).toLocaleString()} / {selectedSize.toLocaleString()} Tickets (72%)
                </span>
              </div>
              <div className="progress-bar-track" style={{ height: 6, borderRadius: 4, background: "#E2E8F0", overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: "72%",
                    borderRadius: 4,
                    background: "linear-gradient(90deg, #EAB308 0%, #2A65E6 100%)",
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Player Contact Info ── */}
        {step === 1 && (
          <div>
            <span className="badge badge-blue" style={{ marginBottom: 6, fontSize: "0.6875rem" }}>
              <Users size={11} /> Step 2 of 4: Player Info
            </span>
            <h3 className="display" style={{ fontSize: "1.25rem", color: "#111827", fontWeight: 800, marginBottom: 2 }}>
              Enter Your Information
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginBottom: 14 }}>
              Winning tickets and prize cash notifications are delivered to this number.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827", display: "block", marginBottom: 4 }}>
                  Full Name
                </label>
                <input
                  type="text"
                  className="input-base"
                  placeholder="e.g. Abebe Bikila"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{ fontSize: "0.875rem" }}
                  required
                />
              </div>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827", display: "block", marginBottom: 4 }}>
                  {isUSD ? "Phone Number / WhatsApp (+Country Code)" : "Mobile Phone Number (Telebirr / CBE)"}
                </label>
                <input
                  type="tel"
                  className="input-base"
                  placeholder={isUSD ? "+1 555 123 4567" : "+251 9xx xxx xxx"}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{ fontSize: "0.875rem" }}
                  required
                />
              </div>

              {/* Promo code */}
              <div style={{ background: "#FEF9C3", padding: "10px 12px", borderRadius: 8, border: "1px solid #FDE047" }}>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--gold-deep)", display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                  <Tag size={12} /> Promo Code (Optional)
                </label>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="text"
                    className="input-base"
                    placeholder="e.g. RIMNA2026"
                    value={promoCode}
                    onChange={(e) => {
                      setPromoCode(e.target.value);
                      setPromoApplied(false);
                    }}
                    style={{ textTransform: "uppercase", background: "#FFFFFF", fontSize: "0.8125rem", padding: "6px 10px" }}
                  />
                  <button
                    type="button"
                    onClick={handleApplyPromo}
                    className="btn-base btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "6px 12px" }}
                  >
                    Apply
                  </button>
                </div>
                {promoApplied && (
                  <span style={{ color: "var(--teal-dark)", fontSize: "0.6875rem", fontWeight: 700, marginTop: 4, display: "block" }}>
                    ✓ Promo applied!
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Number Selection Board ── */}
        {step === 2 && (
          <div>
            <span className="badge badge-blue" style={{ marginBottom: 6, fontSize: "0.6875rem" }}>
              <Ticket size={11} /> Step 3 of 4: Lucky Number
            </span>
            <h3 className="display" style={{ fontSize: "1.25rem", color: "#111827", fontWeight: 800, marginBottom: 2 }}>
              Pick Number for {currentPool.label} ({currentPool.pool})
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginBottom: 14 }}>
              Choose your number from #1 up to #{selectedSize.toLocaleString()}. Red numbers are taken.
            </p>

            <NumberPicker
              value={number}
              onChange={setNumber}
              poolSize={selectedSize}
              takenNumbers={[]}
            />
          </div>
        )}

        {/* ── Step 3: Pay & Confirm ── */}
        {step === 3 && (
          <div>
            <span className="badge badge-gold" style={{ marginBottom: 6, fontSize: "0.6875rem" }}>
              <ShieldCheck size={11} /> Step 4 of 4: Payment & Receipt
            </span>
            <h3 className="display" style={{ fontSize: "1.25rem", color: "#111827", fontWeight: 800, marginBottom: 2 }}>
              Pay {isUSD ? `$${ticketPrice} USD` : `${ticketPrice} ETB`} for Ticket #{number}
            </h3>

            {/* Payment Method Selector */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0 10px" }}>
              {isUSD ? (
                [
                  { id: "card", name: "Credit / Debit Card" },
                  { id: "paypal", name: "PayPal" },
                  { id: "wire", name: "Swift / Wire Transfer" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="btn-base"
                    onClick={() => setMethod(m.id)}
                    style={{
                      padding: "8px 12px",
                      border: method === m.id ? "2px solid #2A65E6" : "1px solid var(--gray-line)",
                      background: method === m.id ? "var(--blue-bg)" : "#FFFFFF",
                      color: method === m.id ? "#2A65E6" : "#111827",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {m.name}
                  </button>
                ))
              ) : (
                [
                  { id: "telebirr", name: "Telebirr" },
                  { id: "cbebirr", name: "CBE Birr" },
                  { id: "bank", name: "Bank Transfer" },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    className="btn-base"
                    onClick={() => setMethod(m.id)}
                    style={{
                      padding: "8px 12px",
                      border: method === m.id ? "2px solid #2A65E6" : "1px solid var(--gray-line)",
                      background: method === m.id ? "var(--blue-bg)" : "#FFFFFF",
                      color: method === m.id ? "#2A65E6" : "#111827",
                      fontSize: "0.75rem",
                      fontWeight: 700,
                    }}
                  >
                    {m.name}
                  </button>
                ))
              )}
            </div>

            {/* Account Details Box */}
            <div style={{ background: "#F8FAFC", border: "1px solid var(--gray-line)", borderRadius: 8, padding: "10px 12px", marginBottom: 14 }}>
              <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block", marginBottom: 2 }}>
                TRANSFER ACCOUNT ({method.toUpperCase()})
              </span>
              <p className="mono" style={{ color: "#111827", fontSize: "0.875rem", fontWeight: 800 }}>
                {isUSD ? (
                  method === "card" ? "Instant Stripe Card Checkout" :
                  method === "paypal" ? "PayPal: payments@rimnalottery.com" :
                                        "Swift: Bank of America · Acc: 9876543210"
                ) : (
                  method === "telebirr" ? "Telebirr: 0911 22 33 44 (Rimna Digital Lottery PLC)" :
                  method === "cbebirr" ? "CBE Birr: 0911 22 33 44 (Rimna Digital Lottery PLC)" :
                                         "CBE Bank: 1000456789012 (Rimna Digital Lottery PLC)"
                )}
              </p>
            </div>

            <PaymentProofUploader
              onChange={handleProof}
              preview={proofPreview}
              fileName={proofFile?.name}
            />

            {error && (
              <p style={{ color: "var(--rust-dark)", background: "var(--rust-bg)", padding: "8px", borderRadius: 6, fontSize: "0.75rem", marginTop: 10 }}>
                {error}
              </p>
            )}
          </div>
        )}

        {/* ── Step 4: Success Screen ── */}
        {step === 4 && (
          <div style={{ textAlign: "center", padding: "24px 10px" }}>
            <CheckCircle2 size={44} color="var(--teal)" style={{ margin: "0 auto 12px" }} />
            <h3 className="display" style={{ fontSize: "1.35rem", color: "#111827", fontWeight: 900, marginBottom: 6 }}>
              Ticket Confirmed for {currentPool.label}!
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 20 }}>
              Your ticket number <strong>#{number}</strong> for the <strong>{currentPool.pool}</strong> pool has been submitted for live broadcast verification.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-base btn-primary"
              style={{ padding: "10px 24px", fontSize: "0.875rem", fontWeight: 800 }}
            >
              Done & View Live Draws
            </button>
          </div>
        )}

        {/* Modal Wizard Navigation */}
        {step < 4 && (
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
            <button
              type="button"
              disabled={step === 0}
              onClick={() => setStep((s) => s - 1)}
              className="btn-base btn-secondary"
              style={{ padding: "8px 16px", fontSize: "0.8125rem", opacity: step === 0 ? 0.4 : 1 }}
            >
              <ChevronLeft size={14} /> Back
            </button>

            {step < 3 ? (
              <button
                type="button"
                disabled={!canAdvance[step]}
                onClick={() => setStep((s) => s + 1)}
                className="btn-base btn-primary"
                style={{ padding: "8px 20px", fontSize: "0.8125rem", fontWeight: 800 }}
              >
                Continue <ChevronRight size={14} />
              </button>
            ) : (
              <button
                type="button"
                disabled={!canAdvance[3] || loading}
                onClick={submit}
                className="btn-base btn-primary"
                style={{ padding: "8px 20px", fontSize: "0.8125rem", fontWeight: 800 }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : `Submit Ticket (${currSymbol}${ticketPrice})`}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
