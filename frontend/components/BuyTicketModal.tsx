"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Users, ShieldCheck, Ticket } from "lucide-react";
import { NumberPicker } from "./NumberPicker";
import { PaymentProofUploader } from "./PaymentProofUploader";
import { submitEntry, type Currency } from "@/lib/api";
import { paymentMethods, validNumber } from "@/lib/tickets";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CMSSiteSettings } from "@/lib/sanity/queries";

interface BuyTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialCurrency?: Currency;
  initialPrice?: number;
  initialPoolSize?: number;
  siteSettings?: CMSSiteSettings | null;
}

export function BuyTicketModal({
  isOpen,
  onClose,
  initialCurrency = "ETB",
  initialPrice = 100,
  initialPoolSize = 1000,
  siteSettings,
}: BuyTicketModalProps) {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);

  const STEP_LABELS = [
    language === "ti" ? "ናይ ተሳታፊ ዝርዝር" : language === "am" ? "የተሳታፊ መረጃ" : "Player Details",
    language === "ti" ? "ዕድለኛ ቁጽሪ" : language === "am" ? "እድለኛ ቁጥር" : "Lucky Number",
    language === "ti" ? "ክፍሊትን ደረሰኝን" : language === "am" ? "ክፍያና ደረሰኝ" : "Payment & Proof",
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  const currency: Currency = initialCurrency;
  const ticketPrice: number = initialPrice;
  const poolSize = initialPoolSize;
  const [takenNumbers, setTakenNumbers] = useState<string[]>([]);
  const [submissionId, setSubmissionId] = useState("");
  const [receiptId, setReceiptId] = useState("");
  const [checking, setChecking] = useState(true);
  const [unavailable, setUnavailable] = useState("");
  const [selectionKey, setSelectionKey] = useState("");
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0);

  // Step state (0: Player Info, 1: Pick Number, 2: Pay & Confirm, 3: Success)
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [number, setNumber] = useState("7");
  const [method, setMethod] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");

  // Each new purchase has a stable retry reference.
  useEffect(() => {
    if (isOpen) {
      setStep(0);
      setError("");
      setProofFile(null);
      setProofPreview("");
      setPaymentReference("");
      setSubmissionId(crypto.randomUUID());
      setReceiptId("");
      setMethod(paymentMethods(siteSettings, currency)[0]?.id || "");
      setNumber("7");

      setName("");
      setPhone("");
    }
  }, [isOpen, currency, siteSettings]);

  useEffect(() => {
    if (!isOpen) return;
    let cancelled = false;
    setChecking(true); setUnavailable(""); setTakenNumbers([]); setSelectionKey("");
    async function refresh() {
      try {
        const params = new URLSearchParams({currency: initialCurrency, price: String(initialPrice), pool: String(initialPoolSize)});
        const res = await fetch(`/api/entries/availability?${params}`, {cache: "no-store"});
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Unable to check availability.");
        if (data.price !== initialPrice || data.currency !== initialCurrency || data.poolSize !== initialPoolSize) throw new Error("Ticket settings changed. Close and refresh the page.");
        if (!cancelled) { setTakenNumbers(data.takenNumbers); setSelectionKey(data.selectionKey); setUnavailable(""); }
      } catch (error) { if (!cancelled) setUnavailable(error instanceof Error ? error.message : "Unable to check availability."); }
      finally { if (!cancelled) setChecking(false); }
    }
    void refresh();
    const timer = setInterval(refresh, 15000);
    return () => { cancelled = true; clearInterval(timer); };
  }, [isOpen, initialCurrency, initialPrice, initialPoolSize, availabilityAttempt]);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape" && !loading) onClose(); };
    window.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previousOverflow; window.removeEventListener("keydown", onKey); };
  }, [isOpen, loading, onClose]);

  const isUSD = currency === "USD";

  const availableMethods = paymentMethods(siteSettings, currency);
  const numberAvailable = validNumber(number, poolSize) && !takenNumbers.some(n => Number(n) === Number(number));
  const canAdvance = [
    name.trim().length >= 2 && name.trim().length <= 120 && /^\+?[\d ()-]{7,30}$/.test(phone.trim()) && phone.replace(/\D/g, "").length >= 7,
    numberAvailable,
    !!proofFile && !!method && paymentReference.trim().length >= 6 && numberAvailable && !unavailable,
  ];

  function handleProof(file: File) {
    setProofFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setProofPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function submit() {
    if (!canAdvance[2] || !proofFile) return;
    setLoading(true);
    setError("");

    try {
      const form = new FormData();
      form.append("number", String(Number(number)));
      form.append("submission_id", submissionId);
      form.append("currency", currency);
      form.append("pool_capacity", String(poolSize));
      form.append("amount", String(ticketPrice));
      form.append("method", method);
      form.append("payment_reference", paymentReference.trim().toUpperCase());
      form.append("proof", proofFile);
      form.append("user_name", name.trim());
      form.append("user_phone", phone.trim());

      const receipt = await submitEntry(form);
      setReceiptId(receipt.id);
      setStep(3); // Success step
    } catch (e: any) {
      setError(e.message ?? (language === "ti" ? "ጌጋ ኣጋጢሙ። በጃኹም ደጊምኩም ፈትኑ።" : language === "am" ? "ስህተት ተከስቷል። እባክዎ እንደገና ይሞክሩ።" : "Something went wrong. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || !isOpen) return null;
  if (step !== 3 && (checking || unavailable)) return createPortal(
    <div role="dialog" aria-modal="true" aria-label="Buy a ticket" className="ticket-availability-overlay">
      <div className="ticket-availability-card">
        <button aria-label="Close ticket form" className="ticket-availability-close" onClick={onClose}><X size={20}/></button>
        <Ticket size={32} color="#FDE047" aria-hidden="true"/>
        <h2>{checking ? "Checking your ticket…" : "Ticket availability"}</h2>
        <p className="ticket-selection-summary">{ticketPrice} {currency} · {poolSize.toLocaleString()} pool</p>
        <p role={checking ? "status" : "alert"}>{checking ? "Finding available numbers for your selection." : unavailable}</p>
        {checking ? <Loader2 className="animate-spin" aria-hidden="true"/> : <div className="ticket-availability-actions">
          <button className="casino-btn-red" onClick={onClose}>Choose another ticket</button>
          <button className="ticket-availability-retry" onClick={() => setAvailabilityAttempt(n => n + 1)}>Check again</button>
        </div>}
      </div>
    </div>, document.body);


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
        if (e.target === e.currentTarget && step !== 3 && !loading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-label="Buy a ticket"
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
            aria-label="Close ticket form"
            disabled={loading}
            onClick={() => { if (!loading) onClose(); }}
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
            {isUSD
              ? (language === "ti" ? "ናይ ዲያስፖራ ዶላር ቲኬት" : language === "am" ? "የዲያስፖራ ዶላር ቲኬት" : "DIASPORA USD TICKET")
              : (language === "ti" ? "ናይ ኢትዮጵያ ብር ቲኬት" : language === "am" ? "የኢትዮጵያ ብር ቲኬት" : "ETHIOPIA NATIONAL ETB TIER")} · #{selectionKey}
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
            {isUSD ? `$${ticketPrice} USD` : `${ticketPrice} ETB`} {language === "ti" ? "ናይ ዕጫ ቲኬት" : language === "am" ? "የእጣ ቲኬት" : "Entry Ticket"}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: "0.75rem", color: "#CBD5E1" }}>
            <span style={{ color: "#6EE7B7", fontWeight: 800, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Users size={12} /> {poolSize.toLocaleString()} {language === "ti" ? "ውሱን ተሳተፍቲ" : language === "am" ? "የተገደበ ተሳታፊ" : "Capped Pool"}
            </span>
            <span>•</span>
            <span style={{ color: "#FEF08A", fontWeight: 800 }}>
              {language === "ti" ? "10 ውሑሳት ተዓወትቲ" : language === "am" ? "10 የተረጋገጡ አሸናፊዎች" : "10 Guaranteed Winners"}
            </span>
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
                  {language === "ti" ? `ደረጃ ${step + 1} ካብ 3:` : language === "am" ? `ደረጃ ${step + 1} ከ 3:` : `Step ${step + 1} of 3:`}{" "}
                  <strong style={{ color: "#FFFFFF" }}>{STEP_LABELS[step]}</strong>
                </span>
                <span style={{ color: "#FEF08A", fontWeight: 800, fontSize: "0.6875rem" }}>
                  {language === "ti" ? "10 ውሑሳት ተዓወትቲ" : language === "am" ? "10 የተረጋገጡ አሸናፊዎች" : "10 Winners Guaranteed"}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Body ────────────────────────────────────────────── */}
        <div style={{ padding: "20px 24px", maxHeight: "calc(85vh - 160px)", overflowY: "auto" }}>
          {(error || (step !== 3 && unavailable)) && (
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
              {error || unavailable}
            </div>
          )}

          {/* STEP 1: Player Details */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <p style={{ fontSize: "0.875rem", color: "#CBD5E1", margin: 0 }}>
                {language === "ti"
                  ? "ዕጫ ምስ ተዛዘመ ሽልማትኩም ቀጥታ ክለኣኸልኩም ናይ ተሳታፊ ዝርዝርኩም ኣእትዉ:"
                  : language === "am"
                  ? "እጣው እንደተጠናቀቀ የሽልማት ገንዘብዎ በቀጥታ እንዲተላለፍ የተሳታፊ መረጃዎን ያስገቡ:"
                  : "Enter your player details so your winning cash payout can be transferred immediately upon live draw completion:"}
              </p>

              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {t.ticketModal?.fullName || "Full Legal Name (as on Bank / ID)"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  maxLength={120}
                  aria-label="Full name"
                  autoComplete="name"
                  placeholder={language === "ti" ? "ንኣብነት ኣበበ ቢቂላ" : language === "am" ? "ለምሳሌ አበበ ቢቂላ" : "e.g. Abebe Bikila"}
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
                  {t.ticketModal?.phoneNumber || "Phone Number (for Telebirr / CBE / Instant Payouts)"}
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  maxLength={30}
                  aria-label="Phone number"
                  autoComplete="tel"
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


            </div>
          )}

          {/* STEP 2: Lucky Number Selection */}
          {step === 1 && (
            <div>
              <p style={{ fontSize: "0.875rem", color: "#CBD5E1", margin: "0 0 14px" }}>
                Choose a number from 1 to {poolSize.toLocaleString()}. Submitted numbers are disabled.
              </p>
              <NumberPicker value={number.padStart(2, "0")} onChange={setNumber} poolSize={poolSize} takenNumbers={takenNumbers} />
            </div>
          )}

          {step === 2 && !numberAvailable && <p role="alert" style={{color: "#FCA5A5"}}>This number is now taken. Go back and choose another available number. Keep your payment reference and screenshot.</p>}

          {/* STEP 3: Payment & Proof Verification */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Payment Method Selector */}
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                  {t.ticketModal?.paymentMethod || "Choose Payment Method"}
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 8 }}>
                  {availableMethods.map((m) => (
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
                        Manual review
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
                  {language === "ti" ? "ልክዕ መጠን ዝውውር ግበሩ:" : language === "am" ? "ትክክለኛውን መጠን ያስተላልፉ:" : "Transfer Exact Amount:"}{" "}
                  <span style={{ fontSize: "1rem", color: "#FFFFFF" }}>{isUSD ? `$${ticketPrice} USD` : `${ticketPrice} ETB`}</span>
                </div>
                {method === "telebirr" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div>
                      Telebirr Merchant Code: <strong style={{ color: "#FDE047", fontSize: "0.9375rem" }}>{siteSettings?.telebirrMerchantCode}</strong>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                      Merchant: {siteSettings?.siteName || "Rimna International Digital Lottery"} • Hotline: {siteSettings?.contactPhone || "+251 911 000 000"}
                    </div>
                  </div>
                )}
                {method === "cbe" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                    <div>
                      Commercial Bank of Ethiopia (CBE) Account: <strong style={{ color: "#FDE047", fontSize: "0.9375rem" }}>{siteSettings?.cbeAccountNumber}</strong>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                      Account Holder: <strong style={{ color: "#FFFFFF" }}>{siteSettings?.cbeAccountName || "Rimna International Digital Lottery PLC"}</strong>
                    </div>
                  </div>
                )}
                {method === "wire" && <div style={{whiteSpace: "pre-line"}}>{siteSettings?.diasporaWireInstructions}</div>}
                {availableMethods.length === 0 && <p role="alert">Payment instructions have not been configured for this currency. Please contact support.</p>}

              </div>

              {/* Transaction Reference (TxID) Input */}
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {language === "ti" ? "ናይ ዝውውር መፍለዪ ቁጽሪ (TxID / Receipt #)" : language === "am" ? "የዝውውር መለያ ቁጥር (TxID / ደረሰኝ ቁጥር)" : "Transaction Reference (TxID / Receipt #)"}
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  aria-label="Payment reference"
                  maxLength={120}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder={method === "telebirr" ? "e.g. TF240822.0911.A34981" : method === "cbe" ? "e.g. FT242319082" : "e.g. TXN-98472910"}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: paymentReference.trim().length >= 6 ? "1.5px solid #10B981" : "1.5px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    color: "#FFFFFF",
                    fontSize: "0.9375rem",
                    fontFamily: "monospace",
                    letterSpacing: "0.5px",
                    boxSizing: "border-box",
                    outline: "none",
                  }}
                />
                <span style={{ fontSize: "0.6875rem", color: "#94A3B8", marginTop: 4, display: "block" }}>
                  {language === "ti"
                    ? "ካብ ቴሌብር ወይ ሲቢኢ ዝመጸልኩም ናይ ደረሰኝ መፍለዪ ኮድ ኣብዚ ኣእትዉ"
                    : language === "am"
                    ? "ከቴሌብር ወይም ንግድ ባንክ የመጣሎትን የደረሰኝ መለያ ኮድ እዚህ ያስገቡ"
                    : "Enter the unique reference code from your payment SMS/receipt for manual review."}
                </span>
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
                PAYMENT RECEIPT SUBMITTED
              </span>

              <h3 className="display" style={{ fontSize: "1.75rem", fontWeight: 900, color: "#FFFFFF", margin: "6px 0 10px" }}>
                {language === "ti" ? `ቲኬት #${number} ተላኢኹ። ክፍሊት ምርግጋጽ ይጽበ ኣሎ።` : language === "am" ? `ቲኬት #${number} ተልኳል። የክፍያ ማረጋገጫ በመጠባበቅ ላይ።` : `Ticket #${number.padStart(2, "0")} submitted`}
              </h3>

              <p style={{ fontSize: "0.875rem", color: "#CBD5E1", maxWidth: 440, margin: "0 auto 20px" }}>
                Your screenshot is saved and your number is reserved. Our team will manually check your payment before confirming your ticket. Save this reference for support.
              </p>

              <p style={{overflowWrap: "anywhere", fontSize: 12}}>Reference: {receiptId}</p>
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
                  <span style={{ fontSize: "0.6875rem", color: "#94A3B8" }}>
                    {language === "ti" ? "ዝተመዝገበ ተሳታፊ" : language === "am" ? "የተመዘገበ ተሳታፊ" : "PLAYER DETAILS"}
                  </span>
                  <div style={{ fontSize: "1rem", fontWeight: 800, color: "#FFFFFF" }}>{name}</div>
                  <div style={{ fontSize: "0.75rem", color: "#CBD5E1" }}>{phone}</div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "0.6875rem", color: "#FEF08A" }}>
                    {language === "ti" ? "ዕድለኛ ቁጽሪ" : language === "am" ? "እድለኛ ቁጥር" : "LUCKY NUMBER"}
                  </span>
                  <div className="display" style={{ fontSize: "2rem", fontWeight: 900, color: "#FDE047", lineHeight: 1 }}>
                    #{number}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => { if (!loading) onClose(); }}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    color: "#E2E8F0",
                    borderRadius: "10px",
                    padding: "12px 22px",
                    fontSize: "0.875rem",
                    fontWeight: 800,
                    cursor: "pointer",
                  }}
                >
                  {language === "ti" ? "ዕጾ" : language === "am" ? "ዝጋ" : "Close"}
                </button>
              </div>
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
                disabled={loading}
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
                <ChevronLeft size={16} /> {language === "ti" ? "ንድሕሪት" : language === "am" ? "ወደኋላ" : "Back"}
              </button>
            ) : (
              <div />
            )}

            {step < 2 ? (
              <button
                type="button"
                disabled={!canAdvance[step] || !!unavailable}
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
                {language === "ti" ? "ቀጽል" : language === "am" ? "ቀጥል" : "Continue"} <ChevronRight size={16} />
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
                {loading
                  ? (language === "ti" ? "ቲኬት ይረጋገጽ ኣሎ..." : language === "am" ? "ቲኬት በማረጋገጥ ላይ..." : "Submitting receipt...")
                  : (language === "ti" ? `ኣረጋግጽን እተውን — ${isUSD ? `$${ticketPrice}` : `${ticketPrice} ብር`}` : language === "am" ? `አረጋግጥና ግባ — ${isUSD ? `$${ticketPrice}` : `${ticketPrice} ብር`}` : `Submit for review — ${isUSD ? `$${ticketPrice}` : `${ticketPrice} ETB`}`)}
              </button>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
