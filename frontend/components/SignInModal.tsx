"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Phone, User, Loader2, CheckCircle2, KeyRound } from "lucide-react";
import { loginPlayer, registerPlayer, type StoredUser } from "@/lib/api";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: StoredUser) => void;
}

export function SignInModal({ isOpen, onClose, onSuccess }: SignInModalProps) {
  const { t, language } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError(
        language === "ti"
          ? "በጃኹም ቁጽሪ ስልክኹም ኣእትዉ"
          : language === "am"
          ? "እባክዎ ስልክ ቁጥርዎን ያስገቡ"
          : "Please enter your mobile phone number."
      );
      return;
    }

    if (!pin.trim() || pin.trim().length < 4) {
      setError(
        language === "ti"
          ? "በጃኹም እንተወሓደ ናይ 4 ድጂት ናይ ድሕንነት ፒን (PIN) ኣእትዉ"
          : language === "am"
          ? "እባክዎ ቢያንስ የ4 ዲጂት የደህንነት ፒን (PIN) ያስገቡ"
          : "Please enter your 4-digit Security PIN."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isRegistering) {
        const res = await registerPlayer({
          name: name.trim() || "Verified Player",
          phone: phone.trim(),
          pin: pin.trim(),
        });
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.(res.user);
          onClose();
        }, 700);
      } else {
        const res = await loginPlayer(phone.trim(), pin.trim());
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.(res.user);
          onClose();
        }, 700);
      }
    } catch (err: any) {
      setError(
        err.message ||
          (language === "ti"
            ? "ምእታው ኣይተኻእለን። በጃኹም ደጊምኩም ፈትኑ።"
            : language === "am"
            ? "መግባት አልተቻለም። እባክዎ እንደገና ይሞክሩ።"
            : "Failed to authenticate. Please check your phone number and PIN.")
      );
    } finally {
      setLoading(false);
    }
  };

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(10, 25, 59, 0.8)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div
        className="card-base animate-fade"
        style={{
          background: "#FFFFFF",
          borderRadius: "22px",
          width: "100%",
          maxWidth: 420,
          padding: "clamp(22px, 4vw, 32px)",
          position: "relative",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.4)",
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
            color: "#64748B",
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: "center", marginBottom: 18 }}>
          <div
            style={{
              width: 50,
              height: 50,
              borderRadius: "50%",
              background: "rgba(254, 240, 138, 0.4)",
              border: "1.5px solid #FDE047",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            <Lock size={22} color="#B45309" />
          </div>

          {/* Tab Switcher */}
          <div
            style={{
              display: "flex",
              background: "#F1F5F9",
              borderRadius: "30px",
              padding: 3,
              margin: "0 auto 14px",
              maxWidth: 280,
            }}
          >
            <button
              type="button"
              onClick={() => {
                setIsRegistering(false);
                setError("");
              }}
              style={{
                flex: 1,
                padding: "6px 12px",
                borderRadius: "26px",
                border: "none",
                background: !isRegistering ? "#FFFFFF" : "transparent",
                color: !isRegistering ? "#111827" : "#64748B",
                fontWeight: 900,
                fontSize: "0.8125rem",
                cursor: "pointer",
                boxShadow: !isRegistering ? "0 2px 6px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {language === "ti" ? "እተዉ" : language === "am" ? "ይግቡ" : "Sign In"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegistering(true);
                setError("");
              }}
              style={{
                flex: 1,
                padding: "6px 12px",
                borderRadius: "26px",
                border: "none",
                background: isRegistering ? "#FFFFFF" : "transparent",
                color: isRegistering ? "#111827" : "#64748B",
                fontWeight: 900,
                fontSize: "0.8125rem",
                cursor: "pointer",
                boxShadow: isRegistering ? "0 2px 6px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {language === "ti" ? "ተመዝገቡ" : language === "am" ? "ይመዝገቡ" : "Register"}
            </button>
          </div>

          <h3 className="display" style={{ fontSize: "1.35rem", color: "#111827", fontWeight: 900, margin: "0 0 4px" }}>
            {isRegistering
              ? language === "ti" ? "ሓድሽ ሕሳብ ክፈቱ" : language === "am" ? "አዲስ መለያ ይክፈቱ" : "Create Player Account"
              : language === "ti" ? "ናብ መለያኹም እተዉ" : language === "am" ? "ወደ መለያዎ ይግቡ" : "Sign In to Your Account"}
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "#4B5563", margin: 0 }}>
            {isRegistering
              ? language === "ti" ? "ቲኬት ንምዕዳግን ሽልማት ንምርካብን ዝርዝርኩም ኣእትዉ።" : language === "am" ? "ቲኬቶችን ለመግዛት እና ሽልማቶችን ለመቀበል መረጃዎን ያስገቡ።" : "Register with your phone number and security PIN to protect your tickets."
              : language === "ti" ? "ዝዓደግክዎም ቲኬታት ንምርኣይ ቁጽሪ ስልክኹምን ፒንኩምን ኣእትዉ።" : language === "am" ? "የገዟቸውን ቲኬቶች ለማየት ስልክ ቁጥርዎንና ፒንዎን ያስገቡ።" : "Enter your phone number and 4-digit security PIN."}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "#FEE2E2",
              border: "1px solid #FCA5A5",
              color: "#991B1B",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "0.8125rem",
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "#059669" }}>
            <CheckCircle2 size={38} color="#059669" style={{ margin: "0 auto 8px" }} />
            <h4 style={{ fontSize: "1.125rem", fontWeight: 800, margin: 0 }}>
              {language === "ti" ? "ብዓወት ተመዝጊብኩም!" : language === "am" ? "በተሳካ ሁኔታ ገብተዋል!" : "Welcome to Rimna Lottery!"}
            </h4>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isRegistering && (
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111827", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                  {language === "ti" ? "ምሉእ ስም" : language === "am" ? "ሙሉ ስም" : "Full Name"}
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    className="input-base"
                    placeholder={language === "ti" ? "ንኣብነት ኣበበ ቢቂላ" : language === "am" ? "ለምሳሌ አበበ ቢቂላ" : "e.g. Abebe Bikila"}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: 36, fontSize: "0.875rem" }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111827", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                {language === "ti" ? "ቁጽሪ ስልኪ (ቴሌብር / CBE)" : language === "am" ? "ስልክ ቁጥር (ቴሌብር / ሲቢኢ)" : "Mobile Phone Number"}
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="tel"
                  className="input-base"
                  placeholder="0911 234 567 / +251 9..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{ paddingLeft: 36, fontSize: "0.875rem" }}
                />
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 800, color: "#111827", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                {isRegistering
                  ? language === "ti" ? "ናይ ድሕንነት ፒን ፍጠሩ (4 ድጂት)" : language === "am" ? "የደህንነት ፒን ይፍጠሩ (4 ዲጂት)" : "Create 4-Digit Security PIN"
                  : language === "ti" ? "ናይ ድሕንነት ፒን (PIN)" : language === "am" ? "የደህንነት ፒን (PIN)" : "4-Digit Security PIN"}
              </label>
              <div style={{ position: "relative" }}>
                <KeyRound size={16} color="#94A3B8" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  className="input-base"
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                  style={{ paddingLeft: 36, fontSize: "1rem", letterSpacing: "2px" }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="casino-btn-red"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "0.9375rem",
                fontWeight: 900,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 6,
                borderRadius: "10px",
              }}
            >
              {loading && <Loader2 size={16} className="animate-spin" />}
              {isRegistering
                ? language === "ti" ? "ተመዝገቡ" : language === "am" ? "ይመዝገቡ" : "Register Account"
                : language === "ti" ? "እተዉ" : language === "am" ? "ግባ" : "Sign In"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
