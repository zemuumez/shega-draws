"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Loader2, CheckCircle2, Ticket, ShieldCheck, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { NumberPicker } from "@/components/NumberPicker";
import { PaymentProofUploader } from "@/components/PaymentProofUploader";
import { registerPlayer, submitEntry, getActiveDraw, type DrawState } from "@/lib/api";

const STEPS = ["1. Your Info", "2. Pick Number", "3. Pay & Confirm"];

interface PayMethod { id: string; name: string; accountDetail: string; }

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

  // Draw state
  const [activeDraw, setActiveDraw] = useState<DrawState | null>(null);
  const [drawID, setDrawID]         = useState<string>("");
  const [methods, setMethods]       = useState<PayMethod[]>([]);

  // Step state (0: info, 1: number, 2: pay, 3: success)
  const [step, setStep]       = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  // Form fields
  const [name, setName]           = useState("");
  const [phone, setPhone]         = useState("");
  const [number, setNumber]       = useState(initialNum);
  const [method, setMethod]       = useState("telebirr");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");

  useEffect(() => {
    getActiveDraw()
      .then((d) => {
        setActiveDraw(d);
        setDrawID(d.id);
      })
      .catch(() => {});
  }, []);

  const fixedTicketPrice = activeDraw?.ticket_price || 100;

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
      form.append("draw_id", drawID);
      form.append("number", number);
      form.append("amount", String(fixedTicketPrice));
      form.append("method", method);
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
    <div style={{ maxWidth: 580, margin: "0 auto", padding: "32px 20px" }}>
      {/* Draw Header Pill */}
      {activeDraw && (
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <span className="badge badge-gold">
            #{activeDraw.draw_id} · Fixed Ticket Price: {fixedTicketPrice} ETB
          </span>
        </div>
      )}

      {/* Progress bar */}
      {step < 3 && (
        <nav aria-label="Progress" style={{ display: "flex", gap: 8, marginBottom: 28 }}>
          {STEPS.map((s, i) => (
            <div key={s} style={{ flex: 1 }}>
              <div
                style={{
                  height: 6,
                  borderRadius: 6,
                  background: i <= step ? "var(--gold)" : "#E2E8F0",
                  transition: "all 300ms ease",
                }}
              />
              <span
                className="mono"
                style={{
                  fontSize: "0.6875rem",
                  color: i === step ? "var(--gold-dark)" : "var(--text-muted)",
                  fontWeight: i === step ? 700 : 500,
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

      {/* ── Step 0: Sign up ─────────────────────────────────── */}
      {step === 0 && (
        <Card style={{ padding: "32px 28px" }}>
          <h1 className="display" style={{ fontSize: "1.375rem", color: "var(--text-main)", marginBottom: 6 }}>
            1. Player Information
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 24 }}>
            Please enter your name and phone number. We will use this number to verify your payment and send your winning prize.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Input
              label="Full name"
              id="entry-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Abebe Bikila"
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

      {/* ── Step 1: Pick a number ────────────────────────────── */}
      {step === 1 && (
        <Card style={{ padding: "32px 28px" }}>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--text-main)", marginBottom: 6 }}>
            2. Choose Your 2-Digit Number
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 20 }}>
            Select any lucky number from 00 to 99, or tap random.
          </p>
          <NumberPicker
            value={number}
            onChange={setNumber}
            takenNumbers={[]}
          />
        </Card>
      )}

      {/* ── Step 2: Pay & upload proof ───────────────────────── */}
      {step === 2 && (
        <Card style={{ padding: "32px 28px" }}>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--text-main)", marginBottom: 6 }}>
            3. Transfer Payment & Upload Receipt
          </h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.875rem", marginBottom: 18 }}>
            Send exactly <strong style={{ color: "var(--gold-dark)", fontSize: "1.0625rem" }}>{fixedTicketPrice} ETB</strong> for your chosen ticket number <strong style={{ color: "var(--text-main)" }}>#{number}</strong>.
          </p>

          {/* Payment method selector */}
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
                  border: method === m.id ? "1.5px solid var(--gold)" : "1px solid var(--gray-line)",
                  background: method === m.id ? "var(--gold-bg)" : "#FFFFFF",
                  color: method === m.id ? "var(--gold-dark)" : "var(--text-main)",
                  fontSize: "0.875rem",
                  fontWeight: 600,
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
              border: "1px solid var(--gray-line)",
              borderRadius: "var(--radius-sm)",
              padding: "14px 16px",
              marginBottom: 20,
            }}
          >
            <span className="mono" style={{ fontSize: "0.6875rem", color: "var(--text-subtle)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
              PAYMENT ACCOUNT DETAILS
            </span>
            <p className="mono" style={{ color: "var(--text-main)", fontSize: "0.9375rem", fontWeight: 700 }}>
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

      {/* ── Step 3: Success screen ──────────────────────────── */}
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

          <h1 className="display" style={{ fontSize: "1.5rem", color: "var(--text-main)", marginBottom: 8 }}>
            Entry Submitted Successfully!
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: "0.9375rem", maxWidth: 440, margin: "0 auto 24px", lineHeight: 1.6 }}>
            Your ticket for number <strong style={{ color: "var(--gold-dark)", fontSize: "1.125rem" }}>#{number}</strong> has been logged. Our team will verify your receipt and confirm your entry into the draw.
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
