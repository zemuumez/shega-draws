"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, Ticket, ShieldCheck, Users, Tag, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NumberPicker } from "@/components/NumberPicker";
import { PaymentProofUploader } from "@/components/PaymentProofUploader";
import { registerPlayer, submitEntry, getActiveDraw, listDraws, type DrawState } from "@/lib/api";

const STEPS = ["1. Pool Size & Info", "2. Pick Number", "3. Pay & Confirm"];

interface PayMethod { id: string; name: string; accountDetail: string; }

const POOL_OPTIONS = [
  { size: 1000, label: "1,000 People", price: 50,  pool: "100,000 ETB", jackpot: "35,000 ETB (1st)" },
  { size: 2000, label: "2,000 People", price: 100, pool: "300,000 ETB", jackpot: "80,000 ETB (1st)" },
  { size: 3000, label: "3,000 People", price: 150, pool: "600,000 ETB", jackpot: "180,000 ETB (1st)" },
  { size: 5000, label: "5,000 People", price: 200, pool: "1,200,000 ETB", jackpot: "400,000 ETB (1st)" },
];

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
  const initialNum = searchParams.get("num") || "07";
  const initialSize = parseInt(searchParams.get("size") || "2000", 10);
  const initialDrawParam = searchParams.get("draw") || "";

  // Draw state
  const [allDraws, setAllDraws]     = useState<DrawState[]>([]);
  const [selectedSize, setSize]     = useState<number>(initialSize);
  const [activeDraw, setActiveDraw] = useState<DrawState | null>(null);

  // Step state (0: info & pool, 1: number, 2: pay, 3: success)
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Form fields
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [number, setNumber]       = useState(initialNum);
  const [method, setMethod]       = useState("telebirr");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");

  useEffect(() => {
    listDraws()
      .then((draws) => {
        setAllDraws(draws);
        const match = draws.find((d) => (initialDrawParam && d.id === initialDrawParam) || (d.max_capacity === initialSize && d.status === "open")) || draws[0];
        if (match) {
          setActiveDraw(match);
          if (match.max_capacity) setSize(match.max_capacity);
        }
      })
      .catch(() => {});
  }, [initialDrawParam, initialSize]);

  // Update draw when user changes pool size
  const currentPool = useMemo(() => {
    return POOL_OPTIONS.find((p) => p.size === selectedSize) || POOL_OPTIONS[1];
  }, [selectedSize]);

  const fixedTicketPrice = currentPool.price;

  const handleSelectSize = (size: number) => {
    setSize(size);
    const matched = allDraws.find((d) => d.max_capacity === size && d.status === "open");
    if (matched) {
      setActiveDraw(matched);
    }
  };

  const handleApplyPromo = () => {
    if (promoCode.trim().length > 0) {
      setPromoApplied(true);
    }
  };

  const canAdvance = [
    name.trim().length >= 2 && phone.trim().length >= 9,
    number.length === 2,
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
      // Step 1: register player
      await registerPlayer({ name: name.trim(), phone: phone.trim() });

      // Step 2: submit entry
      const form = new FormData();
      form.append("draw_id", activeDraw?.id || `draw-${selectedSize}`);
      form.append("number", number);
      form.append("amount", String(fixedTicketPrice));
      form.append("method", method);
      if (promoCode.trim()) form.append("promo_code", promoCode.trim());
      form.append("proof", proofFile!);

      await submitEntry(form);
      setStep(3); // success
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 620, margin: "0 auto", padding: "32px 20px" }}>
      {/* Progress bar */}
      {step < 3 && (
        <nav aria-label="Progress" style={{ display: "flex", gap: 8, marginBottom: 26 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 6,
                  background: i <= step ? "var(--blue-royal)" : "#E2E8F0",
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

      {/* ── Step 0: Choose Pool Size & Player Info ─────────────── */}
      {step === 0 && (
        <Card style={{ padding: "32px 28px" }}>
          <div className="badge badge-blue" style={{ marginBottom: 10 }}>
            <Users size={12} /> Step 1: Select Draw & Information
          </div>
          <h1 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", marginBottom: 6 }}>
            Choose People Pool Size
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 20 }}>
            Select how many people are in the draw. Each pool size has a fixed ticket price and guaranteed top 10 prizes.
          </p>

          {/* People Pool Size Selector (1000, 2000, 3000, 5000) */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 10, marginBottom: 24 }}>
            {POOL_OPTIONS.map((p) => {
              const isSelected = selectedSize === p.size;
              return (
                <button
                  key={p.size}
                  type="button"
                  onClick={() => handleSelectSize(p.size)}
                  style={{
                    padding: "14px 12px",
                    borderRadius: "var(--radius-md)",
                    border: isSelected ? "2px solid #2A65E6" : "1.5px solid var(--gray-line)",
                    background: isSelected ? "var(--blue-bg)" : "#FFFFFF",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all var(--transition-fast)",
                    boxShadow: isSelected ? "0 4px 12px rgba(42, 101, 230, 0.18)" : "none",
                  }}
                >
                  <span className="mono" style={{ fontSize: "0.8125rem", fontWeight: 800, color: isSelected ? "var(--blue-royal)" : "var(--blue-navy)", display: "block" }}>
                    {p.label}
                  </span>
                  <span className="display" style={{ fontSize: "1.25rem", fontWeight: 800, color: isSelected ? "var(--gold-dark)" : "var(--text-main)", margin: "4px 0 2px", display: "block" }}>
                    {p.price} ETB
                  </span>
                  <span className="mono" style={{ fontSize: "0.625rem", color: isSelected ? "var(--blue-navy)" : "var(--text-subtle)", fontWeight: 600, display: "block" }}>
                    Pool: {p.pool}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Player Name & Phone */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16, borderTop: "1px solid var(--gray-line)", paddingTop: 20 }}>
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
              label="Phone Number (For Prize Verification)"
              id="entry-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 9xx xxx xxx"
              autoComplete="tel"
              type="tel"
              required
            />

            {/* Optional Promo Code Input */}
            <div style={{ background: "#FEF9C3", padding: "14px 16px", borderRadius: "var(--radius-sm)", border: "1px solid #FDE047" }}>
              <label htmlFor="promo-code" style={{ fontSize: "0.8125rem", fontWeight: 700, color: "var(--gold-deep)", display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                <Tag size={14} /> Have a Promo Code? (Optional)
              </label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  id="promo-code"
                  type="text"
                  className="input-base"
                  placeholder="e.g. PRIMEDRAW2026"
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
                  <CheckCircle2 size={13} /> Promo code &ldquo;{promoCode.toUpperCase()}&rdquo; applied!
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* ── Step 1: Pick Lucky 2-Digit Number ──────────────────── */}
      {step === 1 && (
        <Card style={{ padding: "32px 28px" }}>
          <div className="badge badge-blue" style={{ marginBottom: 10 }}>
            <Ticket size={12} /> Step 2: Choose Number
          </div>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", marginBottom: 6 }}>
            Select Your 2-Digit Lucky Number
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 20 }}>
            Selected Pool: <strong style={{ color: "var(--blue-royal)" }}>{currentPool.label}</strong> ({fixedTicketPrice} ETB). Choose any number from 00 to 99.
          </p>
          <NumberPicker
            value={number}
            onChange={setNumber}
            takenNumbers={[]}
          />
        </Card>
      )}

      {/* ── Step 2: Pay & Upload Proof ────────────────────────── */}
      {step === 2 && (
        <Card style={{ padding: "32px 28px" }}>
          <div className="badge badge-gold" style={{ marginBottom: 10 }}>
            <ShieldCheck size={12} /> Step 3: Payment & Receipt
          </div>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", marginBottom: 6 }}>
            Transfer Payment & Upload Receipt
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 18 }}>
            Send exactly <strong style={{ color: "var(--gold-deep)", fontSize: "1.125rem" }}>{fixedTicketPrice} ETB</strong> for <strong style={{ color: "var(--blue-royal)" }}>{currentPool.label}</strong> (Ticket Number <strong style={{ color: "var(--blue-navy)" }}>#{number}</strong>).
          </p>

          {/* Payment Method Selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {[
              { id: "telebirr", name: "Telebirr",      accountDetail: "0911 22 33 44 (Prime Draws PLC)" },
              { id: "cbebirr",  name: "CBE Birr",      accountDetail: "0911 22 33 44 (Prime Draws PLC)" },
              { id: "bank",     name: "Bank Transfer", accountDetail: "CBE Account: 1000456789012 (Prime Draws PLC)" },
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
                  color: method === m.id ? "var(--blue-royal)" : "var(--text-main)",
                  fontSize: "0.875rem",
                  fontWeight: 700,
                }}
              >
                {m.name}
              </button>
            ))}
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
              {method === "telebirr" ? "Telebirr: 0911 22 33 44 (Prime Draws PLC)" :
               method === "cbebirr"  ? "CBE Birr: 0911 22 33 44 (Prime Draws PLC)" :
                                       "CBE Bank: 1000456789012 (Prime Draws PLC)"}
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

      {/* ── Step 3: Success Screen ───────────────────────────── */}
      {step === 3 && (
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

          <h1 className="display" style={{ fontSize: "1.5rem", color: "var(--blue-navy)", marginBottom: 8 }}>
            Ticket Confirmed for {currentPool.label}!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", maxWidth: 460, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Your entry for lucky number <strong style={{ color: "var(--gold-deep)", fontSize: "1.125rem" }}>#{number}</strong> in the <strong style={{ color: "var(--blue-royal)" }}>{currentPool.label} ({fixedTicketPrice} ETB)</strong> draw is registered. Our team will verify your receipt and send SMS confirmation.
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
      {step < 3 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
          <Button
            variant="secondary"
            icon={ChevronLeft}
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
          {step < 2 ? (
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
              disabled={!canAdvance[2] || loading}
              loading={loading}
              onClick={submit}
            >
              Submit Ticket ({fixedTicketPrice} ETB)
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
