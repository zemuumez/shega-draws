"use client";

import React, { useState } from "react";
import { X, Lock, Phone, User, Loader2, CheckCircle2, ShieldCheck, Ticket } from "lucide-react";
import { loginPlayer, registerPlayer, setAccessToken, setUser, type StoredUser } from "@/lib/api";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: StoredUser) => void;
}

export function SignInModal({ isOpen, onClose, onSuccess }: SignInModalProps) {
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (isRegistering) {
        const res = await registerPlayer({ name: name.trim() || "Verified Player", phone: phone.trim() });
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.(res.user);
          onClose();
          window.location.reload();
        }, 800);
      } else {
        const res = await loginPlayer(phone.trim(), name.trim());
        setSuccess(true);
        setTimeout(() => {
          onSuccess?.(res.user);
          onClose();
          window.location.reload();
        }, 800);
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(12, 38, 102, 0.65)",
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
          borderRadius: "var(--radius-lg)",
          width: "100%",
          maxWidth: 420,
          padding: "28px 24px",
          position: "relative",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)",
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
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FACC15 0%, #EAB308 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 12px",
              boxShadow: "0 4px 14px rgba(234, 179, 8, 0.4)",
            }}
          >
            <Ticket size={26} color="#0C2666" />
          </div>
          <h2 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", fontWeight: 800, marginBottom: 4 }}>
            {isRegistering ? "Create Player Account" : "Sign In to Rimna"}
          </h2>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Access your purchased tickets, track draw outcomes, and claim cash payouts.
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={40} color="var(--teal)" style={{ margin: "0 auto 10px" }} />
            <p style={{ fontWeight: 800, color: "var(--blue-navy)", fontSize: "1.05rem" }}>
              Successfully Signed In!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isRegistering && (
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="var(--text-subtle)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                  <input
                    type="text"
                    className="input-base"
                    placeholder="e.g. Abebe Bikila"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    style={{ paddingLeft: 36, fontSize: "0.875rem" }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                Phone Number / Mobile Account
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={16} color="var(--text-subtle)" style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="tel"
                  className="input-base"
                  placeholder="+251 9xx xxx xxx or +1 555 123 4567"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  style={{ paddingLeft: 36, fontSize: "0.875rem" }}
                />
              </div>
            </div>

            {error && (
              <p style={{ color: "var(--rust-dark)", background: "var(--rust-bg)", padding: "8px 12px", borderRadius: 6, fontSize: "0.75rem" }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-base btn-primary"
              style={{ padding: "12px", fontSize: "0.9375rem", width: "100%", justifyContent: "center", marginTop: 4 }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : (isRegistering ? "Register & Enter" : "Sign In")}
            </button>

            <div style={{ textAlign: "center", marginTop: 8 }}>
              <button
                type="button"
                onClick={() => setIsRegistering(!isRegistering)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#2A65E6",
                  fontSize: "0.8125rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                {isRegistering ? "Already have an account? Sign In" : "New Player? Register Here"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
