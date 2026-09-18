"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ChevronLeft, ChevronRight, Loader2, CheckCircle2, Users, ShieldCheck, Ticket, Copy, Check, ChevronDown, Search, Tag, Globe } from "lucide-react";
import { NumberPicker } from "./NumberPicker";
import { PaymentProofUploader } from "./PaymentProofUploader";
import { submitEntry, type Currency } from "@/lib/api";
import { paymentMethods, validNumber } from "@/lib/tickets";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CMSSiteSettings } from "@/lib/sanity/queries";

interface CountryDialInfo {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

const COUNTRIES: CountryDialInfo[] = [
  { code: "ET", name: "Ethiopia", dial: "+251", flag: "🇪🇹" },
  { code: "US", name: "United States", dial: "+1", flag: "🇺🇸" },
  { code: "CA", name: "Canada", dial: "+1", flag: "🇨🇦" },
  { code: "GB", name: "United Kingdom", dial: "+44", flag: "🇬🇧" },
  { code: "SA", name: "Saudi Arabia", dial: "+966", flag: "🇸🇦" },
  { code: "AE", name: "United Arab Emirates", dial: "+971", flag: "🇦🇪" },
  { code: "SE", name: "Sweden", dial: "+46", flag: "🇸🇪" },
  { code: "DE", name: "Germany", dial: "+49", flag: "🇩🇪" },
  { code: "IT", name: "Italy", dial: "+39", flag: "🇮🇹" },
  { code: "IL", name: "Israel", dial: "+972", flag: "🇮🇱" },
  { code: "KE", name: "Kenya", dial: "+254", flag: "🇰🇪" },
  { code: "SD", name: "Sudan", dial: "+249", flag: "🇸🇩" },
  { code: "ER", name: "Eritrea", dial: "+291", flag: "🇪🇷" },
  { code: "AU", name: "Australia", dial: "+61", flag: "🇦🇺" },
  { code: "ZA", name: "South Africa", dial: "+27", flag: "🇿🇦" },
  { code: "NO", name: "Norway", dial: "+47", flag: "🇳🇴" },
  { code: "CH", name: "Switzerland", dial: "+41", flag: "🇨🇭" },
  { code: "NL", name: "Netherlands", dial: "+31", flag: "🇳🇱" },
  { code: "FR", name: "France", dial: "+33", flag: "🇫🇷" },
  { code: "BE", name: "Belgium", dial: "+32", flag: "🇧🇪" },
  { code: "QA", name: "Qatar", dial: "+974", flag: "🇶🇦" },
  { code: "KW", name: "Kuwait", dial: "+965", flag: "🇰🇼" },
  { code: "BH", name: "Bahrain", dial: "+973", flag: "🇧🇭" },
  { code: "OM", name: "Oman", dial: "+968", flag: "🇴🇲" },
  { code: "EG", name: "Egypt", dial: "+20", flag: "🇪🇬" },
  { code: "TR", name: "Turkey", dial: "+90", flag: "🇹🇷" },
  { code: "CN", name: "China", dial: "+86", flag: "🇨🇳" },
  { code: "IN", name: "India", dial: "+91", flag: "🇮🇳" },
  { code: "JP", name: "Japan", dial: "+81", flag: "🇯🇵" },
  { code: "BR", name: "Brazil", dial: "+55", flag: "🇧🇷" },
  { code: "MX", name: "Mexico", dial: "+52", flag: "🇲🇽" },
];

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
  const { text, t, language, getLocalized } = useLanguage();
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
  const [checking, setChecking] = useState(false);
  const [unavailable, setUnavailable] = useState("");
  const [selectionKey, setSelectionKey] = useState("");
  const [availabilityAttempt, setAvailabilityAttempt] = useState(0);

  // Step state (0: Player Info, 1: Pick Number, 2: Pay & Confirm, 3: Success)
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

function pickRandomAvailableNumber(pool: number, taken: string[]): string {
  const safePool = Math.max(1, pool || 1000);
  const takenSet = new Set(taken.map((n) => Number(n)));
  // If pool is large, try random sampling first
  if (safePool > 50) {
    for (let attempts = 0; attempts < 100; attempts++) {
      const candidate = Math.floor(Math.random() * safePool) + 1;
      if (!takenSet.has(candidate)) {
        return String(candidate);
      }
    }
  }
  // Fallback: collect all untaken numbers
  const available: number[] = [];
  for (let i = 1; i <= safePool; i++) {
    if (!takenSet.has(i)) available.push(i);
  }
  if (available.length === 0) return "1";
  return String(available[Math.floor(Math.random() * available.length)]);
}

  // Form fields
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneLocal, setPhoneLocal] = useState("");
  const [selectedCountry, setSelectedCountry] = useState<CountryDialInfo>(COUNTRIES[0]);
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [number, setNumber] = useState(() => pickRandomAvailableNumber(initialPoolSize, []));
  const [method, setMethod] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (value: string, fieldKey: string) => {
    if (!value) return;
    try {
      navigator.clipboard.writeText(value);
      setCopiedField(fieldKey);
      setTimeout(() => setCopiedField((cur) => (cur === fieldKey ? null : cur)), 2000);
    } catch {
      // Fallback
    }
  };

  const handlePhoneLocalChange = (val: string, country = selectedCountry) => {
    setPhoneLocal(val);
    const clean = val.trim();
    if (!clean) {
      setPhone("");
      return;
    }
    if (clean.startsWith("+")) {
      setPhone(clean);
    } else if (clean.startsWith("0") && country.dial === "+251") {
      setPhone(clean);
    } else {
      setPhone(`${country.dial} ${clean.replace(/^0+/, "")}`);
    }
  };

  const handleCountryChange = (country: CountryDialInfo) => {
    setSelectedCountry(country);
    handlePhoneLocalChange(phoneLocal, country);
  };

  const filteredCountries = COUNTRIES.filter((c) => {
    if (!countrySearch.trim()) return true;
    const q = countrySearch.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.dial.includes(q) ||
      c.code.toLowerCase().includes(q)
    );
  });

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
      setNumber(pickRandomAvailableNumber(initialPoolSize, takenNumbers));

      setName("");
      setPhone("");
      setPhoneLocal("");
      setPromoCode("");
      setSelectedCountry(currency === "USD" ? (COUNTRIES.find((c) => c.code === "US") || COUNTRIES[1]) : COUNTRIES[0]);
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
        if (!cancelled) {
          setTakenNumbers(data.takenNumbers);
          setSelectionKey(data.selectionKey);
          setUnavailable("");
          // Ensure current selected number is valid and available (not taken)
          setNumber((curr) => {
            const isTaken = data.takenNumbers.some((t: string) => Number(t) === Number(curr));
            const isOutOfBounds = Number(curr) < 1 || Number(curr) > (data.poolSize || initialPoolSize);
            if (!curr || isTaken || isOutOfBounds) {
              return pickRandomAvailableNumber(data.poolSize || initialPoolSize, data.takenNumbers);
            }
            return curr;
          });
        }
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
      if (promoCode.trim()) {
        form.append("promo_code", promoCode.trim().toUpperCase());
      }

      const receipt = await submitEntry(form);
      setReceiptId(receipt.id);
      setStep(3); // Success stepreceipt = await submitEntry(form);
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
    <div role="dialog" aria-modal="true" aria-label={text("Buy a ticket")} className="ticket-availability-overlay">
      <div className="ticket-availability-card">
        <button aria-label={text("Close ticket form")} className="ticket-availability-close" onClick={onClose}><X size={20}/></button>
        <Ticket size={32} color="#FDE047" aria-hidden="true"/>
        <h2>{checking ? text("Checking your ticket…") : text("Ticket availability")}</h2>
        <p className="ticket-selection-summary">{ticketPrice} {currency} · {poolSize.toLocaleString()} {text("pool")}</p>
        <p role={checking ? "status" : "alert"}>{checking ? text("Finding available numbers for your selection.") : text(unavailable)}</p>
        {checking ? <Loader2 className="animate-spin" aria-hidden="true"/> : <div className="ticket-availability-actions">
          <button className="casino-btn-red" onClick={onClose}>{text("Choose another ticket")}</button>
          <button className="ticket-availability-retry" onClick={() => setAvailabilityAttempt(n => n + 1)}>{text("Check again")}</button>
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
        aria-label={text("Buy a ticket")}
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
            aria-label={text("Close ticket form")}
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
                  aria-label={text("Full name")}
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

              {/* Phone Input with Country Code Selector */}
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {t.ticketModal?.phoneNumber || "Phone Number"}
                </label>
                <div style={{ display: "flex", gap: 8, position: "relative" }}>
                  {/* Country Selector Trigger */}
                  <div style={{ position: "relative" }}>
                    <button
                      type="button"
                      onClick={() => setCountryPickerOpen(!countryPickerOpen)}
                      style={{
                        height: "100%",
                        padding: "0 12px",
                        background: "rgba(0, 0, 0, 0.6)",
                        border: "1.5px solid rgba(255, 255, 255, 0.2)",
                        borderRadius: "10px",
                        color: "#FFFFFF",
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        cursor: "pointer",
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        whiteSpace: "nowrap",
                        minWidth: 100,
                        boxSizing: "border-box",
                      }}
                    >
                      <span style={{ fontSize: "1.1rem" }}>{selectedCountry.flag}</span>
                      <span style={{ fontFamily: "monospace", color: "#FEF08A" }}>{selectedCountry.dial}</span>
                      <ChevronDown size={14} color="#94A3B8" />
                    </button>

                    {/* Country Picker Dropdown */}
                    {countryPickerOpen && (
                      <div
                        style={{
                          position: "absolute",
                          top: "calc(100% + 6px)",
                          left: 0,
                          width: 290,
                          maxHeight: 280,
                          background: "#0F172A",
                          border: "1.5px solid rgba(253, 224, 71, 0.5)",
                          borderRadius: "12px",
                          boxShadow: "0 16px 40px rgba(0,0,0,0.85)",
                          zIndex: 99999,
                          display: "flex",
                          flexDirection: "column",
                          overflow: "hidden",
                        }}
                      >
                        {/* Search in Dropdown */}
                        <div style={{ padding: "8px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)", background: "rgba(0,0,0,0.3)" }}>
                          <input
                            type="text"
                            placeholder="Search country (+251, +1, Ethiopia)..."
                            value={countrySearch}
                            onChange={(e) => setCountrySearch(e.target.value)}
                            autoFocus
                            style={{
                              width: "100%",
                              padding: "6px 10px",
                              background: "rgba(255, 255, 255, 0.08)",
                              border: "1px solid rgba(255, 255, 255, 0.15)",
                              borderRadius: "6px",
                              color: "#FFFFFF",
                              fontSize: "0.8125rem",
                              outline: "none",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>

                        {/* Country List */}
                        <div style={{ overflowY: "auto", flex: 1 }}>
                          {filteredCountries.map((c) => (
                            <button
                              key={c.code + c.dial}
                              type="button"
                              onClick={() => {
                                handleCountryChange(c);
                                setCountryPickerOpen(false);
                                setCountrySearch("");
                              }}
                              style={{
                                width: "100%",
                                padding: "8px 12px",
                                background: selectedCountry.code === c.code && selectedCountry.dial === c.dial ? "rgba(253, 224, 71, 0.15)" : "transparent",
                                border: "none",
                                borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
                                color: "#FFFFFF",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                cursor: "pointer",
                                fontSize: "0.8125rem",
                                textAlign: "left",
                              }}
                            >
                              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                                <span style={{ fontSize: "1rem" }}>{c.flag}</span>
                                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                              </div>
                              <span style={{ fontFamily: "monospace", color: "#FEF08A", fontWeight: 700, marginLeft: 8 }}>{c.dial}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Local Phone Number Input */}
                  <input
                    type="tel"
                    value={phoneLocal}
                    onChange={(e) => handlePhoneLocalChange(e.target.value)}
                    maxLength={25}
                    aria-label={text("Phone number")}
                    autoComplete="tel"
                    placeholder={selectedCountry.dial === "+251" ? "911 23 45 67 or 0911..." : "202 555 0199"}
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
                </div>
              </div>

              {/* Promo Code Input (Optional) */}
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                  <span>🏷️ {language === "ti" ? "ናይ ፕሮሞሽን ኮድ" : language === "am" ? "የማስተዋወቂያ ኮድ" : "Promo Code"}</span>
                  <span style={{ fontSize: "0.6875rem", color: "#94A3B8", fontWeight: 600, textTransform: "none" }}>{language === "ti" ? "(ኣማራጺ)" : language === "am" ? "(አማራጭ)" : "(Optional)"}</span>
                </label>
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                  maxLength={25}
                  placeholder={language === "ti" ? "ንኣብነት ABEL2026 ወይ TIKTOK50" : language === "am" ? "ለምሳሌ ABEL2026 ወይም TIKTOK50" : "e.g. ABEL2026 or TIKTOK50"}
                  style={{
                    width: "100%",
                    padding: "12px 14px",
                    background: "rgba(0, 0, 0, 0.5)",
                    border: promoCode ? "1.5px solid #FDE047" : "1.5px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: "10px",
                    color: promoCode ? "#FEF08A" : "#FFFFFF",
                    fontSize: "0.9375rem",
                    fontFamily: promoCode ? "monospace" : "inherit",
                    fontWeight: promoCode ? 800 : 400,
                    letterSpacing: promoCode ? "1px" : "normal",
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
              <p style={{ fontSize: "0.875rem", color: "#CBD5E1", margin: "0 0 14px" }}> {text("Choose a number from 1 to")} {poolSize.toLocaleString()}{text(". Submitted numbers are disabled.")} </p>
              <NumberPicker value={number.padStart(2, "0")} onChange={setNumber} poolSize={poolSize} takenNumbers={takenNumbers} />
            </div>
          )}

          {step === 2 && !numberAvailable && <p role="alert" style={{color: "#FCA5A5"}}>{text("This number is now taken. Go back and choose another available number. Keep your payment reference and screenshot.")}</p>}

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
                      <span style={{ fontSize: "0.625rem", color: method === m.id ? "#FDE047" : "#94A3B8" }}> {text("Manual review")} </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Transfer Instructions Box */}
              <div
                style={{
                  background: "rgba(10, 18, 36, 0.75)",
                  border: "1.5px solid rgba(253, 224, 71, 0.45)",
                  borderRadius: "14px",
                  padding: "16px",
                  fontSize: "0.8125rem",
                  color: "#E2E8F0",
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                }}
              >
                {/* Header: Amount to Pay */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 8,
                    paddingBottom: 10,
                    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <span style={{ fontWeight: 800, color: "#FEF08A" }}>
                    {language === "ti" ? "ልክዕ መጠን ዝውውር ግበሩ:" : language === "am" ? "ትክክለኛውን መጠን ያስተላልፉ:" : "Transfer Exact Amount:"}
                  </span>
                  <span
                    style={{
                      fontSize: "1.125rem",
                      fontWeight: 900,
                      color: "#10B981",
                      background: "rgba(16, 185, 129, 0.15)",
                      border: "1px solid rgba(16, 185, 129, 0.4)",
                      padding: "3px 10px",
                      borderRadius: "8px",
                      fontFamily: "monospace",
                    }}
                  >
                    {isUSD ? `$${ticketPrice} USD` : `${ticketPrice} ETB`}
                  </span>
                </div>

                {/* Method 1: Telebirr */}
                {method === "telebirr" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8", lineHeight: 1.4 }}>
                      {language === "ti"
                        ? "ኣብ ቴሌብር መተግበሪኹም ገንዘብ ኣመሓላልፉ ወይ ብነጋዳይ ኮድ ብምጥቃም ክፍሊትኩም ፈጽሙ።"
                        : language === "am"
                        ? "በቴሌብር መተግበሪያዎ ገንዘብ ያስተላልፉ ወይም በነጋዴ ኮድ በመጠቀም ክፍያዎን ይፈጽሙ።"
                        : "Open your Telebirr app, select Send Money or Pay Merchant, and transfer using the details below:"}
                    </div>

                    {/* Telebirr Phone Number */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        background: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(253, 224, 71, 0.3)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "0.6875rem", color: "#FEF08A", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                          {language === "ti" ? "📱 ናይ ቴሌብር ተቐባሊ ስልኪ" : language === "am" ? "📱 የቴሌብር ተቀባይ ስልክ" : "📱 Telebirr Phone Number"}
                        </span>
                        <span style={{ fontSize: "1rem", color: "#FFFFFF", fontFamily: "monospace", fontWeight: 800 }}>
                          {siteSettings?.telebirrReceiverPhone || siteSettings?.contactPhone || "+251 911 000 000"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(siteSettings?.telebirrReceiverPhone || siteSettings?.contactPhone || "+251 911 000 000", "telebirrPhone")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          background: copiedField === "telebirrPhone" ? "rgba(16, 185, 129, 0.25)" : "rgba(253, 224, 71, 0.15)",
                          border: copiedField === "telebirrPhone" ? "1px solid #10B981" : "1px solid rgba(253, 224, 71, 0.4)",
                          borderRadius: "8px",
                          color: copiedField === "telebirrPhone" ? "#10B981" : "#FEF08A",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "telebirrPhone" ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedField === "telebirrPhone" ? (language === "ti" ? "ተቐዲሑ!" : language === "am" ? "ተቀድቷል!" : "Copied!") : (language === "ti" ? "ቅዳሕ" : language === "am" ? "ቅዳ" : "Copy")}</span>
                      </button>
                    </div>

                    {/* Recipient / Account Name */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        background: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "0.6875rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                          {language === "ti" ? "👤 ናይ ተቐባሊ ሽም" : language === "am" ? "👤 የተቀባይ ስም" : "👤 Recipient / Account Name"}
                        </span>
                        <span style={{ fontSize: "0.875rem", color: "#FFFFFF", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {siteSettings?.telebirrAccountName || siteSettings?.siteName || "Rimna International Digital Lottery PLC"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(siteSettings?.telebirrAccountName || siteSettings?.siteName || "Rimna International Digital Lottery PLC", "telebirrName")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          background: copiedField === "telebirrName" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.1)",
                          border: copiedField === "telebirrName" ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.25)",
                          borderRadius: "8px",
                          color: copiedField === "telebirrName" ? "#10B981" : "#FFFFFF",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "telebirrName" ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedField === "telebirrName" ? (language === "ti" ? "ተቐዲሑ!" : language === "am" ? "ተቀድቷል!" : "Copied!") : (language === "ti" ? "ቅዳሕ" : language === "am" ? "ቅዳ" : "Copy")}</span>
                      </button>
                    </div>

                    {/* Merchant Code (if available) */}
                    {siteSettings?.telebirrMerchantCode && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          background: "rgba(0, 0, 0, 0.4)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "10px",
                          padding: "10px 12px",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: "0.6875rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                            {language === "ti" ? "🏪 ናይ ነጋዳይ መፍለዪ ኮድ (Merchant Code)" : language === "am" ? "🏪 የነጋዴ መለያ ኮድ (Merchant Code)" : "🏪 Telebirr Merchant Code"}
                          </span>
                          <span style={{ fontSize: "0.9375rem", color: "#FDE047", fontFamily: "monospace", fontWeight: 800 }}>
                            {siteSettings.telebirrMerchantCode}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(siteSettings.telebirrMerchantCode!, "telebirrCode")}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 12px",
                            background: copiedField === "telebirrCode" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.1)",
                            border: copiedField === "telebirrCode" ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.25)",
                            borderRadius: "8px",
                            color: copiedField === "telebirrCode" ? "#10B981" : "#FFFFFF",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          {copiedField === "telebirrCode" ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedField === "telebirrCode" ? (language === "ti" ? "ተቐዲሑ!" : language === "am" ? "ተቀድቷል!" : "Copied!") : (language === "ti" ? "ቅዳሕ" : language === "am" ? "ቅዳ" : "Copy")}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Method 2: CBE Bank */}
                {method === "cbe" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8", lineHeight: 1.4 }}>
                      {language === "ti"
                        ? "ኣብ CBE ሞባይል ባንኪንግ ወይ ሲቢኢ ብር ብምጥቃም ናብዚ ዝስዕብ ናይ ሕሳብ ቁጽሪ ገንዘብ ኣመሓላልፉ:"
                        : language === "am"
                        ? "በCBE ሞባይል ባንኪንግ ወይም በሲቢኢ ብር በመጠቀም ወደሚከተለው የሂሳብ ቁጥር ገንዘብ ያስተላልፉ:"
                        : "Transfer to the official Commercial Bank of Ethiopia (CBE) account below:"}
                    </div>

                    {/* CBE Account Number */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        background: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(253, 224, 71, 0.3)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "0.6875rem", color: "#FEF08A", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                          {language === "ti" ? "💳 ናይ CBE ሕሳብ ቁጽሪ (Account Number)" : language === "am" ? "💳 የCBE ሂሳብ ቁጥር (Account Number)" : "💳 CBE Account Number"}
                        </span>
                        <span style={{ fontSize: "1rem", color: "#FFFFFF", fontFamily: "monospace", fontWeight: 800 }}>
                          {siteSettings?.cbeAccountNumber || "1000 1234 5678"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(siteSettings?.cbeAccountNumber || "1000 1234 5678", "cbeAccount")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          background: copiedField === "cbeAccount" ? "rgba(16, 185, 129, 0.25)" : "rgba(253, 224, 71, 0.15)",
                          border: copiedField === "cbeAccount" ? "1px solid #10B981" : "1px solid rgba(253, 224, 71, 0.4)",
                          borderRadius: "8px",
                          color: copiedField === "cbeAccount" ? "#10B981" : "#FEF08A",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "cbeAccount" ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedField === "cbeAccount" ? (language === "ti" ? "ተቐዲሑ!" : language === "am" ? "ተቀድቷል!" : "Copied!") : (language === "ti" ? "ቅዳሕ" : language === "am" ? "ቅዳ" : "Copy")}</span>
                      </button>
                    </div>

                    {/* Account Holder Name */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        background: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "0.6875rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                          {language === "ti" ? "👤 ናይ ሕሳብ ዋና ሽም (Account Holder)" : language === "am" ? "👤 የሂሳብ ባለቤት ስም (Account Holder)" : "👤 Account Holder Name"}
                        </span>
                        <span style={{ fontSize: "0.875rem", color: "#FFFFFF", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {siteSettings?.cbeAccountName || "Rimna International Digital Lottery PLC"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(siteSettings?.cbeAccountName || "Rimna International Digital Lottery PLC", "cbeName")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          background: copiedField === "cbeName" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.1)",
                          border: copiedField === "cbeName" ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.25)",
                          borderRadius: "8px",
                          color: copiedField === "cbeName" ? "#10B981" : "#FFFFFF",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "cbeName" ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedField === "cbeName" ? (language === "ti" ? "ተቐዲሑ!" : language === "am" ? "ተቀድቷል!" : "Copied!") : (language === "ti" ? "ቅዳሕ" : language === "am" ? "ቅዳ" : "Copy")}</span>
                      </button>
                    </div>

                    {/* Bank Name */}
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8" }}>
                      🏦 {siteSettings?.cbeBankName || "Commercial Bank of Ethiopia (CBE)"}
                    </div>
                  </div>
                )}

                {/* Method 3: International Transfer / USD Wire (IBAN, Name, SWIFT) */}
                {method === "wire" && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ fontSize: "0.75rem", color: "#94A3B8", lineHeight: 1.4 }}>
                      {language === "ti"
                        ? "ኣብ ናይ ባንክ መተግበሪኹም፣ ዌስተርን ዩንየን ወይ ሬሚትሊ ብምጥቃም በዚ ዝስዕብ ናይ IBAN ቁጽርን ሽምን ክፍሊትኩም ፈጽሙ:"
                        : language === "am"
                        ? "በሞባይል ባንኪንግዎ፣ በዌስተርን ዩኒየን ወይም በሬሚትሊ በመጠቀም በሚከተለው የIBAN ቁጥር እና ስም ክፍያዎን ይፈጽሙ:"
                        : "Use the recipient IBAN and name below in your banking app, Western Union, Remitly, or wire transfer:"}
                    </div>

                    {/* IBAN / International Account Number */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        background: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(253, 224, 71, 0.3)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "0.6875rem", color: "#FEF08A", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                          {language === "ti" ? "🌐 ናይ IBAN / ሕሳብ ቁጽሪ" : language === "am" ? "🌐 የIBAN / ሂሳብ ቁጥር" : "🌐 Recipient IBAN / Account #"}
                        </span>
                        <span style={{ fontSize: "0.9375rem", color: "#FFFFFF", fontFamily: "monospace", fontWeight: 800, wordBreak: "break-all" }}>
                          {siteSettings?.diasporaIban || "ET64CBET000100012345678"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(siteSettings?.diasporaIban || "ET64CBET000100012345678", "wireIban")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          background: copiedField === "wireIban" ? "rgba(16, 185, 129, 0.25)" : "rgba(253, 224, 71, 0.15)",
                          border: copiedField === "wireIban" ? "1px solid #10B981" : "1px solid rgba(253, 224, 71, 0.4)",
                          borderRadius: "8px",
                          color: copiedField === "wireIban" ? "#10B981" : "#FEF08A",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "wireIban" ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedField === "wireIban" ? (language === "ti" ? "ተቐዲሑ!" : language === "am" ? "ተቀድቷል!" : "Copied!") : (language === "ti" ? "ቅዳሕ" : language === "am" ? "ቅዳ" : "Copy")}</span>
                      </button>
                    </div>

                    {/* Recipient / Account Holder Name */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        background: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "0.6875rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                          {language === "ti" ? "👤 ናይ ተቐባሊ ሽም (Recipient Name)" : language === "am" ? "👤 የተቀባይ ስም (Recipient Name)" : "👤 Recipient / Account Holder Name"}
                        </span>
                        <span style={{ fontSize: "0.875rem", color: "#FFFFFF", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {siteSettings?.diasporaAccountName || siteSettings?.cbeAccountName || "Rimna International Digital Lottery PLC"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(siteSettings?.diasporaAccountName || siteSettings?.cbeAccountName || "Rimna International Digital Lottery PLC", "wireName")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          background: copiedField === "wireName" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.1)",
                          border: copiedField === "wireName" ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.25)",
                          borderRadius: "8px",
                          color: copiedField === "wireName" ? "#10B981" : "#FFFFFF",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "wireName" ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedField === "wireName" ? (language === "ti" ? "ተቐዲሑ!" : language === "am" ? "ተቀድቷል!" : "Copied!") : (language === "ti" ? "ቅዳሕ" : language === "am" ? "ቅዳ" : "Copy")}</span>
                      </button>
                    </div>

                    {/* Recipient Bank Name */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 8,
                        background: "rgba(0, 0, 0, 0.4)",
                        border: "1px solid rgba(255, 255, 255, 0.12)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "0.6875rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                          {language === "ti" ? "🏦 ተቐባሊ ባንክ" : language === "am" ? "🏦 ተቀባይ ባንክ" : "🏦 Recipient Bank"}
                        </span>
                        <span style={{ fontSize: "0.8125rem", color: "#FFFFFF", fontWeight: 600 }}>
                          {siteSettings?.diasporaBankName || "Commercial Bank of Ethiopia (International & Diaspora Banking)"}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(siteSettings?.diasporaBankName || "Commercial Bank of Ethiopia (International & Diaspora Banking)", "wireBank")}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          padding: "6px 12px",
                          background: copiedField === "wireBank" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.1)",
                          border: copiedField === "wireBank" ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.25)",
                          borderRadius: "8px",
                          color: copiedField === "wireBank" ? "#10B981" : "#FFFFFF",
                          fontSize: "0.75rem",
                          fontWeight: 800,
                          cursor: "pointer",
                          flexShrink: 0,
                        }}
                      >
                        {copiedField === "wireBank" ? <Check size={13} /> : <Copy size={13} />}
                        <span>{copiedField === "wireBank" ? (language === "ti" ? "ተቐዲሑ!" : language === "am" ? "ተቀድቷል!" : "Copied!") : (language === "ti" ? "ቅዳሕ" : language === "am" ? "ቅዳ" : "Copy")}</span>
                      </button>
                    </div>

                    {/* SWIFT / BIC Code (if available) */}
                    {siteSettings?.diasporaSwiftBic && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 8,
                          background: "rgba(0, 0, 0, 0.4)",
                          border: "1px solid rgba(255, 255, 255, 0.12)",
                          borderRadius: "10px",
                          padding: "10px 12px",
                        }}
                      >
                        <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: "0.6875rem", color: "#94A3B8", textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.5px" }}>
                            {language === "ti" ? "⚡ SWIFT / BIC ኮድ" : language === "am" ? "⚡ SWIFT / BIC ኮድ" : "⚡ SWIFT / BIC Code"}
                          </span>
                          <span style={{ fontSize: "0.9375rem", color: "#FDE047", fontFamily: "monospace", fontWeight: 800 }}>
                            {siteSettings.diasporaSwiftBic}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy(siteSettings.diasporaSwiftBic!, "wireSwift")}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                            padding: "6px 12px",
                            background: copiedField === "wireSwift" ? "rgba(16, 185, 129, 0.25)" : "rgba(255, 255, 255, 0.1)",
                            border: copiedField === "wireSwift" ? "1px solid #10B981" : "1px solid rgba(255, 255, 255, 0.25)",
                            borderRadius: "8px",
                            color: copiedField === "wireSwift" ? "#10B981" : "#FFFFFF",
                            fontSize: "0.75rem",
                            fontWeight: 800,
                            cursor: "pointer",
                            flexShrink: 0,
                          }}
                        >
                          {copiedField === "wireSwift" ? <Check size={13} /> : <Copy size={13} />}
                          <span>{copiedField === "wireSwift" ? (language === "ti" ? "ተቐዲሑ!" : language === "am" ? "ተቀድቷል!" : "Copied!") : (language === "ti" ? "ቅዳሕ" : language === "am" ? "ቅዳ" : "Copy")}</span>
                        </button>
                      </div>
                    )}

                    {/* Additional Transfer Notes */}
                    {getLocalized(siteSettings, "diasporaWireInstructions") && (
                      <div style={{ fontSize: "0.75rem", color: "#CBD5E1", background: "rgba(0, 0, 0, 0.3)", padding: "8px 10px", borderRadius: "8px", borderLeft: "3px solid #FDE047", whiteSpace: "pre-line" }}>
                        {getLocalized(siteSettings, "diasporaWireInstructions")}
                      </div>
                    )}
                  </div>
                )}

                {availableMethods.length === 0 && (
                  <p role="alert" style={{ color: "#F87171", margin: 0 }}>
                    {text("Payment instructions have not been configured for this currency. Please contact support.")}
                  </p>
                )}
              </div>

              {/* Transaction Reference (TxID) Input */}
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#FEF08A", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  {language === "ti" ? "ናይ ዝውውር መፍለዪ ቁጽሪ (TxID / Receipt #)" : language === "am" ? "የዝውውር መለያ ቁጥር (TxID / ደረሰኝ ቁጥር)" : "Transaction Reference (TxID / Receipt #)"}
                </label>
                <input
                  type="text"
                  value={paymentReference}
                  aria-label={text("Payment reference")}
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

              <span style={{ fontSize: "0.6875rem", fontWeight: 900, color: "#FEF08A", textTransform: "uppercase" }}> {text("PAYMENT RECEIPT SUBMITTED")} </span>

              <h3 className="display" style={{ fontSize: "1.75rem", fontWeight: 900, color: "#FFFFFF", margin: "6px 0 10px" }}>
                {language === "ti" ? `ቲኬት #${number} ተላኢኹ። ክፍሊት ምርግጋጽ ይጽበ ኣሎ።` : language === "am" ? `ቲኬት #${number} ተልኳል። የክፍያ ማረጋገጫ በመጠባበቅ ላይ።` : `Ticket #${number.padStart(2, "0")} submitted`}
              </h3>

              <p style={{ fontSize: "0.875rem", color: "#CBD5E1", maxWidth: 440, margin: "0 auto 20px" }}> {text("Your screenshot is saved and your number is reserved. Our team will manually check your payment before confirming your ticket. Save this reference for support.")} </p>

              <p style={{overflowWrap: "anywhere", fontSize: 12}}>{text("Reference:")} {receiptId}</p>
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
