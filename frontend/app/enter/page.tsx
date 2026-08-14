"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NumberPicker } from "@/components/NumberPicker";
import { PaymentProofUploader } from "@/components/PaymentProofUploader";
import { registerPlayer, submitEntry, getActiveDraw } from "@/lib/api";

const AMOUNT_PRESETS = [50, 100, 250, 500];
const STEPS = ["Sign up", "Pick a number", "Choose amount", "Pay & confirm"];

interface PayMethod { id: string; name: string; accountDetail: string; }

export default function EnterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialNum = searchParams.get("num") || "07";

  // Draw state
  const [drawID, setDrawID]     = useState<string>("");
  const [methods, setMethods]   = useState<PayMethod[]>([]);
  const [amountPresets, setPresets] = useState(AMOUNT_PRESETS);
  const [takenNums, setTaken]   = useState<string[]>([]);

  // Step state
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Form fields
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [number, setNumber]       = useState(initialNum);
  const [amount, setAmount]       = useState(100);
  const [customAmount, setCustom] = useState("");
  const [method, setMethod]       = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");

  useEffect(() => {
    getActiveDraw()
      .then((d) => {
        setDrawID(d.id);
      })
      .catch(() => {});
  }, []);

  const finalAmount = customAmount ? parseInt(customAmount, 10) : amount;

  const canAdvance = [
    name.trim().length >= 2 && phone.trim().length >= 9,
    true,
    finalAmount > 0,
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
      // Step 1: register player (creates account + JWT)
      await registerPlayer({ name: name.trim(), phone: phone.trim() });

      // Step 2: submit entry as multipart
      const form = new FormData();
      form.append("draw_id", drawID);
      form.append("number", number);
      form.append("amount", String(finalAmount));
      form.append("method", method);
      form.append("proof", proofFile!);

      await submitEntry(form);
      setStep(4); // success
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px" }}>
      {/* Progress bar */}
      {step < 4 && (
        <nav aria-label="Progress" style={{ display: "flex", gap: 6, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div
                className="progress-bar"
                role="progressbar"
                aria-valuenow={i <= step ? 100 : 0}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div className="progress-bar-fill" style={{ width: i <= step ? "100%" : "0%" }} />
              </div>
              <span
                className="mono"
                style={{
                  fontSize: "0.5625rem",
                  color: i === step ? "var(--gold)" : "var(--gray)",
                  textTransform: "uppercase",
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

      {/* ── Step 0: Sign up ─────────────────────────────────── */}
      {step === 0 && (
        <Card>
          <h1 className="display" style={{ fontSize: "1.375rem", color: "var(--paper)", marginBottom: 4 }}>
            Who&apos;s entering?
          </h1>
          <p style={{ color: "var(--gray)", fontSize: "0.875rem", marginBottom: 20 }}>
            We&apos;ll use your phone number to confirm your payment and reach you if you win.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <Input
              label="Full name"
              id="entry-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Betelhem Assefa"
              autoComplete="name"
              required
              minLength={2}
            />
            <Input
              label="Phone number"
              id="entry-phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+251 9xx xxx xxx"
              autoComplete="tel"
              type="tel"
              required
            />
          </div>
        </Card>
      )}

      {/* ── Step 1: Pick number ─────────────────────────────── */}
      {step === 1 && (
        <Card>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--paper)", marginBottom: 4, textAlign: "center" }}>
            Pick your number
          </h2>
          <p style={{ color: "var(--gray)", fontSize: "0.875rem", marginBottom: 20, textAlign: "center" }}>
            One number, 00 to 99. This is what gets checked against every rank on draw day.
          </p>
          <NumberPicker value={number} onChange={setNumber} takenNumbers={takenNums} />
        </Card>
      )}

      {/* ── Step 2: Amount ──────────────────────────────────── */}
      {step === 2 && (
        <Card>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--paper)", marginBottom: 4 }}>
            How much are you putting in?
          </h2>
          <p style={{ color: "var(--gray)", fontSize: "0.875rem", marginBottom: 20 }}>
            Higher amounts don&apos;t change your odds — every number has an equal chance. This is your ticket cost.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 }}>
            {amountPresets.map((a) => {
              const sel = amount === a && !customAmount;
              return (
                <button
                  key={a}
                  className="btn-base"
                  onClick={() => { setAmount(a); setCustom(""); }}
                  style={{
                    padding: "12px 4px",
                    border: sel ? "1px solid var(--gold)" : "1px solid var(--gray-line)",
                    background: sel ? "var(--gold-glow)" : "transparent",
                    color: sel ? "var(--gold)" : "var(--paper)",
                    fontSize: "0.875rem",
                  }}
                >
                  {a} ETB
                </button>
              );
            })}
          </div>
          <Input
            label="Or enter a custom amount (ETB)"
            id="entry-amount"
            value={customAmount}
            onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))}
            placeholder="e.g. 750"
            inputMode="numeric"
          />
        </Card>
      )}

      {/* ── Step 3: Pay & upload ─────────────────────────────── */}
      {step === 3 && (
        <Card>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--paper)", marginBottom: 4 }}>
            Pay and upload proof
          </h2>
          <p style={{ color: "var(--gray)", fontSize: "0.875rem", marginBottom: 16 }}>
            Send <strong style={{ color: "var(--paper)" }}>{finalAmount || 0} ETB</strong> using one of the methods below, then upload a screenshot of the confirmation.
          </p>

          {/* Payment method selector */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
            {(methods.length > 0
              ? methods
              : [
                  { id: "telebirr", name: "Telebirr",      accountDetail: "0911 22 33 44 (Prime Draws PLC)" },
                  { id: "cbebirr",  name: "CBE Birr",      accountDetail: "0911 22 33 44 (Prime Draws PLC)" },
                  { id: "bank",     name: "Bank transfer",  accountDetail: "CBE — 1000456789012 (Prime Draws PLC)" },
                ]
            ).map((m) => (
              <button
                key={m.id}
                className="btn-base"
                onClick={() => setMethod(m.id)}
                style={{
                  padding: "9px 14px",
                  border: method === m.id ? "1px solid var(--gold)" : "1px solid var(--gray-line)",
                  background: method === m.id ? "var(--gold-glow)" : "transparent",
                  color: method === m.id ? "var(--gold)" : "var(--paper)",
                  fontSize: "0.8125rem",
                }}
              >
                {m.name}
              </button>
            ))}
          </div>

          {method && (
            <div
              style={{
                background: "var(--ink)",
                border: "1px solid var(--gray-line)",
                borderRadius: "var(--radius-sm)",
                padding: "12px 14px",
                marginBottom: 18,
              }}
            >
              <p className="mono" style={{ fontSize: "0.625rem", color: "var(--gray)", marginBottom: 4 }}>
                SEND TO
              </p>
              <p style={{ color: "var(--paper)", fontSize: "0.9375rem" }}>
                {(methods.find((m2) => m2.id === method) ?? { accountDetail: "" }).accountDetail ||
                  (method === "telebirr" ? "0911 22 33 44 (Prime Draws PLC)" :
                   method === "cbebirr"  ? "0911 22 33 44 (Prime Draws PLC)" :
                                           "CBE — 1000456789012 (Prime Draws PLC)")}
              </p>
            </div>
          )}

          <PaymentProofUploader
            onChange={handleProof}
            preview={proofPreview}
            fileName={proofFile?.name}
          />

          {error && (
            <p role="alert" style={{ color: "var(--rust-soft)", fontSize: "0.875rem", marginTop: 12 }}>
              {error}
            </p>
          )}
        </Card>
      )}

      {/* ── Step 4: Success ──────────────────────────────────── */}
      {step === 4 && (
        <Card style={{ textAlign: "center" }}>
          <div
            className="animate-pulse"
            style={{
              display: "inline-flex",
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "rgba(201,162,39,0.15)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <Loader2 size={24} color="var(--gold)" />
          </div>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--paper)", marginBottom: 8 }}>
            Waiting for confirmation
          </h2>
          <p style={{ color: "var(--gray)", fontSize: "0.875rem", marginBottom: 20, lineHeight: 1.6 }}>
            Your entry for number <strong style={{ color: "var(--gold)" }}>{number}</strong> is saved. Our team checks
            payment proofs before an entry counts toward the draw. You&apos;ll see it move to &quot;confirmed&quot; in My Entries.
          </p>
          <Button onClick={() => router.push("/entries")}>Go to my entries</Button>
        </Card>
      )}

      {/* Navigation buttons */}
      {step < 4 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 22 }}>
          <Button
            variant="ghost"
            icon={ChevronLeft}
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
          >
            Back
          </Button>
          {step < 3 ? (
            <Button
              disabled={!canAdvance[step]}
              onClick={() => setStep((s) => s + 1)}
            >
              Continue <ChevronRight size={16} />
            </Button>
          ) : (
            <Button
              disabled={!canAdvance[3] || loading}
              loading={loading}
              onClick={submit}
            >
              Submit entry
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
