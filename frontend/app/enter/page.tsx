"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, Ticket, ShieldCheck, Users, Tag, Sparkles, Globe, CreditCard, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NumberPicker } from "@/components/NumberPicker";
import { PaymentProofUploader } from "@/components/PaymentProofUploader";
import { registerPlayer, submitEntry, listDraws, type DrawState, type Currency, USD_TICKET_CONFIGS, ETB_TICKET_CONFIGS } from "@/lib/api";

const STEPS = ["1. Pool Size", "2. Player Info", "3. Pick Number", "4. Pay & Confirm"];

export default function EnterPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: "center", padding: "60px 20px" }}><Loader2 className="animate-spin" /></div>}>
      <EnterWizard />
    </Suspense>
  );
}

function EnterWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialCurrency = (searchParams.get("currency") as Currency) || "ETB";
  const initialPrice = parseInt(searchParams.get("price") || (initialCurrency === "USD" ? "25" : "100"), 10);
  const initialNum = searchParams.get("num") || "7";
  const initialDrawParam = searchParams.get("draw") || "";

  // Currency & ticket price state
  const [currency, setCurrency]     = useState<Currency>(initialCurrency);
  const [ticketPrice, setPrice]     = useState<number>(initialPrice);
  const [allDraws, setAllDraws]     = useState<DrawState[]>([]);
  const [activeDraw, setActiveDraw] = useState<DrawState | null>(null);

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
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Form fields
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [number, setNumber]       = useState(initialNum);
  const [method, setMethod]       = useState(currency === "USD" ? "card" : "telebirr");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");

  useEffect(() => {
    listDraws()
      .then((draws) => {
        setAllDraws(draws);
        const match = draws.find((d) => (initialDrawParam && d.id === initialDrawParam)) || draws[0];
        if (match) {
          setActiveDraw(match);
          if (match.currency) setCurrency(match.currency);
          if (match.ticket_price) setPrice(match.ticket_price);
        }
      })
      .catch(() => {});
  }, [initialDrawParam]);

  // Current active pool selection
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
    selectedSize > 0, // Step 0: pool chosen
    name.trim().length >= 2 && phone.trim().length >= 7, // Step 1: info
    number.trim().length > 0 && parseInt(number, 10) >= 1 && parseInt(number, 10) <= selectedSize, // Step 2: number within pool
    !!proofFile && !!method, // Step 3: pay proof
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
      form.append("draw_id", activeDraw?.id || `draw-${currency}-${ticketPrice}`);
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

  return (
    <div style={{ maxWidth: 660, margin: "0 auto", padding: "32px 20px" }}>
      {/* ── Currency Toggle (Top Bar) ─────────────────────────── */}
      {step === 0 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 24 }}>
          <button
            type="button"
            onClick={() => handleSelectCurrency("ETB")}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              fontWeight: 800,
              cursor: "pointer",
              border: currency === "ETB" ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
              background: currency === "ETB" ? "var(--blue-bg)" : "#FFFFFF",
              color: currency === "ETB" ? "#2A65E6" : "var(--text-muted)",
              transition: "all var(--transition-fast)",
            }}
          >
            🇪🇹 Ethiopian Birr (ETB)
          </button>

          <button
            type="button"
            onClick={() => handleSelectCurrency("USD")}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              fontFamily: "var(--font-body)",
              fontSize: "0.875rem",
              fontWeight: 800,
              cursor: "pointer",
              border: currency === "USD" ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
              background: currency === "USD" ? "var(--blue-bg)" : "#FFFFFF",
              color: currency === "USD" ? "#2A65E6" : "var(--text-muted)",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              transition: "all var(--transition-fast)",
            }}
          >
            <Globe size={16} /> 🌐 International Diaspora (USD $)
          </button>
        </div>
      )}

      {/* ── Progress bar (4 Steps) ───────────────────────────── */}
      {step < 4 && (
        <nav aria-label="Progress" style={{ display: "flex", gap: 8, marginBottom: 26 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 6,
                  background: i <= step ? "#2A65E6" : "#E2E8F0",
                  transition: "all 300ms ease",
                }}
              />
              <span
                className="mono"
                style={{
                  fontSize: "0.6875rem",
                  color: i === step ? "var(--blue-navy)" : "var(--text-subtle)",
                  fontWeight: i === step ? 800 : 600,
                  display: "block",
                  marginTop: 6,
                }}
              >
                {s}
              </span>
            </div>
          ))}
        </nav>
      )}

      {/* ── Step 0: Choose Ticket Price & Available Pools ───── */}
      {step === 0 && (
        <Card style={{ padding: "32px 28px" }}>
          <div className="badge badge-blue" style={{ marginBottom: 10 }}>
            <Users size={12} /> Step 1: Choose Ticket Price & Pool Size
          </div>
          <h1 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", marginBottom: 6, fontWeight: 800 }}>
            Select Your {currency === "USD" ? "USD Diaspora" : "ETB"} Ticket Tier
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 18 }}>
            {currency === "USD"
              ? "International draws starting from $25 with massive cash prize pools."
              : "Local Ethiopian Birr draws with fixed ticket pricing and guaranteed 10 winner cash prizes."}
          </p>

          {/* Ticket Price Tier Selection */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Select Ticket Price ({currSymbol}):
            </label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {(currency === "USD" ? USD_TICKET_CONFIGS : ETB_TICKET_CONFIGS).map((tc) => {
                const isSelected = ticketPrice === tc.price;
                return (
                  <button
                    key={tc.price}
                    type="button"
                    onClick={() => handleSelectPrice(tc.price)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: isSelected ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
                      background: isSelected ? "var(--blue-bg)" : "#FFFFFF",
                      color: isSelected ? "#2A65E6" : "var(--text-main)",
                      fontFamily: "var(--font-mono)",
                      fontSize: "0.875rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                  >
                    {currency === "USD" ? `$${tc.price}` : `${tc.price} ETB`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* People Pool Size Selector */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
              Select Participant Pool Size for {currency === "USD" ? `$${ticketPrice}` : `${ticketPrice} ETB`}:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(auto-fit, minmax(130px, 1fr))`, gap: 10 }}>
              {availablePools.map((p) => {
                const isSelected = selectedSize === p.size;
                return (
                  <button
                    key={p.size}
                    type="button"
                    onClick={() => setSize(p.size)}
                    style={{
                      padding: "16px 12px",
                      borderRadius: "var(--radius-md)",
                      border: isSelected ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
                      background: isSelected ? "var(--blue-bg)" : "#FFFFFF",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                      boxShadow: isSelected ? "0 4px 12px rgba(42, 101, 230, 0.18)" : "none",
                    }}
                  >
                    <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 800, color: isSelected ? "#2A65E6" : "var(--blue-navy)", display: "block" }}>
                      👥 {p.label}
                    </span>
                    <span className="display" style={{ fontSize: "1.25rem", fontWeight: 800, color: isSelected ? "var(--gold-deep)" : "var(--text-main)", margin: "4px 0 2px", display: "block" }}>
                      {p.pool}
                    </span>
                    <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--teal-dark)", fontWeight: 700, display: "block" }}>
                      1st: {p.jackpot}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Pool Overview Box */}
          <div
            style={{
              background: "#FEF9C3",
              border: "1px solid #FDE047",
              borderRadius: "var(--radius-sm)",
              padding: "16px 18px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
              <div>
                <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gold-deep)", textTransform: "uppercase", fontWeight: 800, display: "block" }}>
                  GUARANTEED 1ST PLACE JACKPOT
                </span>
                <span className="display" style={{ fontSize: "1.25rem", color: "var(--gold-deep)", fontWeight: 800 }}>
                  {currentPool.jackpot}
                </span>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--gold-deep)", textTransform: "uppercase", fontWeight: 800, display: "block" }}>
                  TOTAL CASH PRIZE POOL
                </span>
                <span className="mono" style={{ fontSize: "1.125rem", color: "var(--blue-navy)", fontWeight: 800 }}>
                  {currentPool.pool}
                </span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* ── Step 1: Player Information & Optional Promo Code ───── */}
      {step === 1 && (
        <Card style={{ padding: "32px 28px" }}>
          <div className="badge badge-blue" style={{ marginBottom: 10 }}>
            <Users size={12} /> Step 2: Player Information
          </div>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", marginBottom: 6, fontWeight: 800 }}>
            Your Contact & Payout Details
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 20 }}>
            We use your contact number to verify your {currency} ticket payment and transfer your cash prize payout.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              label="Full Name"
              id="entry-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abebe Bikila"
              autoComplete="name"
              required
              minLength={2}
            />
            <Input
              label={currency === "USD" ? "Phone Number / WhatsApp (+Country Code)" : "Phone Number (Mobile Transfer Account)"}
              id="entry-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={currency === "USD" ? "+1 555 123 4567" : "+251 9xx xxx xxx"}
              autoComplete="tel"
              type="tel"
              required
            />

            {/* Optional Promo Code Input */}
            <div style={{ background: "#FEF9C3", padding: "14px 16px", borderRadius: "var(--radius-sm)", border: "1px solid #FDE047", marginTop: 6 }}>
              <label htmlFor="promo-code" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--gold-deep)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Tag size={14} /> Have a Promo Code? (Optional)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="promo-code"
                  type="text"
                  className="input-base"
                  placeholder="e.g. RIMNA2026"
                  value={promoCode}
                  onChange={(e) => {
                    setPromoCode(e.target.value);
                    setPromoApplied(false);
                  }}
                  style={{ textTransform: "uppercase", background: "#FFFFFF", fontSize: "0.875rem" }}
                />
                <button
                  type="button"
                  onClick={handleApplyPromo}
                  className="btn-base btn-secondary"
                  style={{ fontSize: "0.8125rem", padding: "8px 16px", flexShrink: 0 }}
                >
                  Apply
                </button>
              </div>

              {promoApplied && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 8, color: "var(--teal-dark)", fontSize: "0.75rem", fontWeight: 700 }}>
                  <CheckCircle2 size={13} /> Promo code &ldquo;{promoCode.toUpperCase()}&rdquo; applied successfully!
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── Step 2: Pick Number (Scrollable Number Board sized to Pool) ── */}
      {step === 2 && (
        <Card style={{ padding: "32px 28px" }}>
          <div className="badge badge-blue" style={{ marginBottom: 10 }}>
            <Ticket size={12} /> Step 3: Number Selection
          </div>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", marginBottom: 6, fontWeight: 800 }}>
            Pick Number in {currentPool.label} ({currentPool.pool} Pool)
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 20 }}>
            Choose any available lucky number from <strong>#1 to #{selectedSize.toLocaleString()}</strong>. Red numbers are already taken and disabled.
          </p>

          <NumberPicker
            value={number}
            onChange={setNumber}
            poolSize={selectedSize}
            takenNumbers={[]}
          />
        </Card>
      )}

      {/* ── Step 3: Pay & Confirm ────────────────────────────── */}
      {step === 3 && (
        <Card style={{ padding: "32px 28px" }}>
          <div className="badge badge-gold" style={{ marginBottom: 10 }}>
            <ShieldCheck size={12} /> Step 4: Payment & Receipt
          </div>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", marginBottom: 6, fontWeight: 800 }}>
            Transfer Payment & Upload Receipt
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 18 }}>
            Send exactly <strong style={{ color: "var(--gold-deep)", fontSize: "1.125rem" }}>{currency === "USD" ? `$${ticketPrice} USD` : `${ticketPrice} ETB`}</strong> for ticket <strong style={{ color: "#2A65E6", fontSize: "1.125rem" }}>#{number}</strong> in the {currentPool.label} ({currentPool.pool}).
          </p>

          {/* Payment Method Selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {currency === "USD" ? (
              [
                { id: "card",   name: "Credit / Debit Card", accountDetail: "Stripe Secure Card Checkout (Instant Confirmation)" },
                { id: "paypal", name: "PayPal",               accountDetail: "payments@rimnalottery.com (PayPal Global)" },
                { id: "wire",   name: "Swift / Wire Transfer", accountDetail: "Swift: RIMNAUS33 · Account: 9876543210 (Rimna Lottery LLC)" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="btn-base"
                  onClick={() => setMethod(m.id)}
                  style={{
                    padding: "10px 16px",
                    border: method === m.id ? "2px solid #2A65E6" : "1px solid var(--gray-line)",
                    background: method === m.id ? "var(--blue-bg)" : "#FFFFFF",
                    color: method === m.id ? "#2A65E6" : "var(--text-main)",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                  }}
                >
                  {m.name}
                </button>
              ))
            ) : (
              [
                { id: "telebirr", name: "Telebirr",      accountDetail: "0911 22 33 44 (Rimna Digital Lottery PLC)" },
                { id: "cbebirr",  name: "CBE Birr",      accountDetail: "0911 22 33 44 (Rimna Digital Lottery PLC)" },
                { id: "bank",     name: "Bank Transfer", accountDetail: "CBE Account: 1000456789012 (Rimna Digital Lottery PLC)" },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  className="btn-base"
                  onClick={() => setMethod(m.id)}
                  style={{
                    padding: "10px 16px",
                    border: method === m.id ? "2px solid #2A65E6" : "1px solid var(--gray-line)",
                    background: method === m.id ? "var(--blue-bg)" : "#FFFFFF",
                    color: method === m.id ? "#2A65E6" : "var(--text-main)",
                    fontSize: "0.875rem",
                    fontWeight: 700,
                  }}
                >
                  {m.name}
                </button>
              ))
            )}
          </div>

          {/* Account Details Box */}
          <div
            style={{
              background: "#F8FAFC",
              border: "1.5px solid var(--gray-line)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 16px",
              marginBottom: 20,
            }}
          >
            <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block", marginBottom: 4, fontWeight: 700 }}>
              TRANSFER DETAILS ({method.toUpperCase()})
            </span>
            <p className="mono" style={{ color: "var(--blue-navy)", fontSize: "0.9375rem", fontWeight: 800 }}>
              {currency === "USD" ? (
                method === "card"   ? "Card: Visa, Mastercard, Amex, Apple Pay via Stripe" :
                method === "paypal" ? "PayPal ID: payments@rimnalottery.com" :
                                      "Swift Wire: Bank of America · Account 9876543210 (Rimna Lottery LLC)"
              ) : (
                method === "telebirr" ? "Telebirr: 0911 22 33 44 (Rimna Digital Lottery PLC)" :
                method === "cbebirr"  ? "CBE Birr: 0911 22 33 44 (Rimna Digital Lottery PLC)" :
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
            <p role="alert" style={{ color: "var(--rust-dark)", background: "var(--rust-bg)", padding: "10px", borderRadius: 8, fontSize: "0.875rem", marginTop: 14 }}>
              {error}
            </p>
          )}
        </Card>
      )}

      {/* ── Step 4: Success Screen ───────────────────────────── */}
      {step === 4 && (
        <Card style={{ textAlign: "center", padding: "40px 24px" }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: "var(--teal-bg)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            <CheckCircle2 size={32} color="var(--teal)" />
          </div>

          <h1 className="display" style={{ fontSize: "1.5rem", color: "var(--blue-navy)", marginBottom: 8, fontWeight: 800 }}>
            Ticket Confirmed for {currentPool.label}!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", maxWidth: 460, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Your entry for ticket number <strong style={{ color: "var(--gold-deep)", fontSize: "1.125rem" }}>#{number}</strong> in the <strong style={{ color: "#2A65E6" }}>{currentPool.label} ({currentPool.pool})</strong> is submitted. Our team will verify your receipt and confirm your slot.
          </p>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Button variant="primary" onClick={() => router.push("/entries")}>
              <Ticket size={16} /> View My Tickets
            </Button>
            <Button variant="secondary" onClick={() => router.push("/")}>
              Back to Home
            </Button>
          </div>
        </Card>
      )}

      {/* Wizard navigation buttons */}
      {step < 4 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <Button
            variant="secondary"
            icon={ChevronLeft}
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              variant="primary"
              disabled={!canAdvance[step]}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              variant="primary"
              disabled={!canAdvance[3] || loading}
              loading={loading}
              onClick={submit}
            >
              Submit Ticket ({currency === "USD" ? `$${ticketPrice}` : `${ticketPrice} ETB`})
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
