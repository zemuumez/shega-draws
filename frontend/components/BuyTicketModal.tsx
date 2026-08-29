"use client";

import React, { useState, useEffect, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Ticket, Users, Tag, CreditCard, ShieldCheck, Globe } from "lucide-react";
import { NumberPicker } from "./NumberPicker";
import { PaymentProofUploader } from "./PaymentProofUploader";
import { registerPlayer, submitEntry, type Currency, USD_TICKET_CONFIGS, ETB_TICKET_CONFIGS, type DrawState } from "@/lib/api";

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
  const [currency, setCurrency] = useState<Currency>(initialCurrency);
  const [ticketPrice, setPrice] = useState<number>(initialPrice);
  const [drawId, setDrawId] = useState<string>(initialDrawId);

  useEffect(() => {
    if (isOpen) {
      setCurrency(initialCurrency);
      setPrice(initialPrice);
      setDrawId(initialDrawId);
      setStep(0);
    }
  }, [isOpen, initialCurrency, initialPrice, initialDrawId]);

  // Available pools for active currency and price
  const activeTicketConfig = useMemo(() => {
    if (currency === "USD") {
      return USD_TICKET_CONFIGS.find((c) => c.price === ticketPrice) || USD_TICKET_CONFIGS[0];
    }
    return ETB_TICKET_CONFIGS.find((c) => c.price === ticketPrice) || ETB_TICKET_CONFIGS[0];
  }, [currency, ticketPrice]);

  const availablePools = activeTicketConfig.pools;
  const [selectedSize, setSize] = useState<number>(availablePools[availablePools.length > 1 ? 1 : 0].size);

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

  const currSymbol = currency === "USD" ? "$" : "ETB";

  const handleSelectCurrency = (curr: Currency) => {
    setCurrency(curr);
    const newPrice = curr === "USD" ? 25 : 100;
    setPrice(newPrice);
    const config = curr === "USD" ? USD_TICKET_CONFIGS[0] : ETB_TICKET_CONFIGS[0];
    setSize(config.pools[1]?.size || config.pools[0].size);
    setMethod(curr === "USD" ? "card" : "telebirr");
  };

  const handleSelectPrice = (p: number) => {
    setPrice(p);
    const config = currency === "USD" 
      ? USD_TICKET_CONFIGS.find((c) => c.price === p) || USD_TICKET_CONFIGS[0]
      : ETB_TICKET_CONFIGS.find((c) => c.price === p) || ETB_TICKET_CONFIGS[0];
    setSize(config.pools[1]?.size || config.pools[0].size);
  };

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

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(12, 38, 102, 0.75)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        className="card-base animate-fade"
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: 620,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "28px 24px",
          position: "relative",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.35)",
          border: "2px solid #FDE047",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
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

        {/* ── Currency Toggle (Top Bar in Modal) ── */}
        {step === 0 && (
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 20 }}>
            <button
              type="button"
              onClick={() => handleSelectCurrency("ETB")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: "0.8125rem",
                fontWeight: 800,
                cursor: "pointer",
                border: currency === "ETB" ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
                background: currency === "ETB" ? "var(--blue-bg)" : "#FFFFFF",
                color: currency === "ETB" ? "#2A65E6" : "var(--text-muted)",
              }}
            >
              Ethiopian Birr (ETB)
            </button>

            <button
              type="button"
              onClick={() => handleSelectCurrency("USD")}
              style={{
                padding: "8px 16px",
                borderRadius: 8,
                fontSize: "0.8125rem",
                fontWeight: 800,
                cursor: "pointer",
                border: currency === "USD" ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
                background: currency === "USD" ? "var(--blue-bg)" : "#FFFFFF",
                color: currency === "USD" ? "#2A65E6" : "var(--text-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Globe size={13} /> Diaspora USD ($)
            </button>
          </div>
        )}

        {/* Progress bar (4 Steps) */}
        {step < 4 && (
          <nav aria-label="Progress" style={{ display: "flex", gap: 6, marginBottom: 20 }}>
            {STEPS.map((s, i) => (
              <div key={s} style={{ flex: 1 }}>
                <div
                  style={{
                    height: 5,
                    borderRadius: 4,
                    background: i <= step ? "#2A65E6" : "#E2E8F0",
                    transition: "all 300ms ease",
                  }}
                />
                <span
                  className="mono"
                  style={{
                    fontSize: "0.625rem",
                    color: i === step ? "var(--blue-navy)" : "var(--text-subtle)",
                    fontWeight: i === step ? 800 : 600,
                    display: "block",
                    marginTop: 4,
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </nav>
        )}

        {/* ── Step 0: Choose Ticket Price & Pool Size ── */}
        {step === 0 && (
          <div>
            <span className="badge badge-blue" style={{ marginBottom: 8, fontSize: "0.6875rem" }}>
              <Users size={11} /> Step 1 of 4: Ticket & Pool
            </span>
            <h3 className="display" style={{ fontSize: "1.25rem", color: "var(--blue-navy)", fontWeight: 800, marginBottom: 4 }}>
              Select Ticket Tier for {currency}
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginBottom: 14 }}>
              Every pool guarantees top 10 cash winners drawn live on broadcast.
            </p>

            {/* Price Selection */}
            <div style={{ marginBottom: 14 }}>
              <label style={{ fontSize: "0.6875rem", fontWeight: 800, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Select Ticket Price:
              </label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {(currency === "USD" ? USD_TICKET_CONFIGS : ETB_TICKET_CONFIGS).map((tc) => {
                  const isSelected = ticketPrice === tc.price;
                  return (
                    <button
                      key={tc.price}
                      type="button"
                      onClick={() => handleSelectPrice(tc.price)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: isSelected ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
                        background: isSelected ? "var(--blue-bg)" : "#FFFFFF",
                        color: isSelected ? "#2A65E6" : "var(--text-main)",
                        fontFamily: "var(--font-mono)",
                        fontSize: "0.8125rem",
                        fontWeight: 800,
                        cursor: "pointer",
                      }}
                    >
                      {currency === "USD" ? `$${tc.price}` : `${tc.price} ETB`}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Pool Selector */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: "0.6875rem", fontWeight: 800, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Select Participant Pool Capacity:
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(110px, 1fr))", gap: 8 }}>
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
                      }}
                    >
                      <span className="mono" style={{ fontSize: "0.75rem", fontWeight: 800, color: isSelected ? "#2A65E6" : "var(--blue-navy)", display: "block" }}>
                        {p.label}
                      </span>
                      <span className="display" style={{ fontSize: "1.1rem", fontWeight: 800, color: isSelected ? "var(--gold-deep)" : "var(--text-main)", margin: "2px 0", display: "block" }}>
                        {p.pool}
                      </span>
                      <span className="mono" style={{ fontSize: "0.625rem", color: "var(--teal-dark)", fontWeight: 700, display: "block" }}>
                        1st: {p.jackpot}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── Step 1: Player Information ── */}
        {step === 1 && (
          <div>
            <span className="badge badge-blue" style={{ marginBottom: 8, fontSize: "0.6875rem" }}>
              <Users size={11} /> Step 2 of 4: Player Info
            </span>
            <h3 className="display" style={{ fontSize: "1.25rem", color: "var(--blue-navy)", fontWeight: 800, marginBottom: 4 }}>
              Enter Your Contact Details
            </h3>
            <p style={{ color: "var(--text-muted)", fontSize: "0.8125rem", marginBottom: 14 }}>
              Your payout notification and transfer will be sent to this number.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", display: "block", marginBottom: 4 }}>
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
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", display: "block", marginBottom: 4 }}>
                  {currency === "USD" ? "Phone Number / WhatsApp (+Country Code)" : "Mobile Phone Number (Telebirr / CBE)"}
                </label>
                <input
                  type="tel"
                  className="input-base"
                  placeholder={currency === "USD" ? "+1 555 123 4567" : "+251 9xx xxx xxx"}
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
            <span className="badge badge-blue" style={{ marginBottom: 8, fontSize: "0.6875rem" }}>
              <Ticket size={11} /> Step 3 of 4: Lucky Number
            </span>
            <h3 className="display" style={{ fontSize: "1.25rem", color: "var(--blue-navy)", fontWeight: 800, marginBottom: 4 }}>
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
            <span className="badge badge-gold" style={{ marginBottom: 8, fontSize: "0.6875rem" }}>
              <ShieldCheck size={11} /> Step 4 of 4: Payment & Receipt
            </span>
            <h3 className="display" style={{ fontSize: "1.25rem", color: "var(--blue-navy)", fontWeight: 800, marginBottom: 4 }}>
              Transfer {currency === "USD" ? `$${ticketPrice} USD` : `${ticketPrice} ETB`} for Ticket #{number}
            </h3>

            {/* Payment Method Selector */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", margin: "12px 0 10px" }}>
              {currency === "USD" ? (
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
                      color: method === m.id ? "#2A65E6" : "var(--text-main)",
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
                      color: method === m.id ? "#2A65E6" : "var(--text-main)",
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
              <p className="mono" style={{ color: "var(--blue-navy)", fontSize: "0.875rem", fontWeight: 800 }}>
                {currency === "USD" ? (
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
            <h3 className="display" style={{ fontSize: "1.35rem", color: "var(--blue-navy)", fontWeight: 900, marginBottom: 6 }}>
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
    </div>
  );
}
