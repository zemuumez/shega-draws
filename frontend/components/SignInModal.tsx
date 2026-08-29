"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Lock, Phone, User, Loader2, CheckCircle2, ShieldCheck, Ticket } from "lucide-react";
import { loginPlayer, registerPlayer, setAccessToken, setUser, type StoredUser } from "@/lib/api";

interface SignInModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: StoredUser) => void;
}

export function SignInModal({ isOpen, onClose, onSuccess }: SignInModalProps) {
  const [mounted, setMounted] = useState(false);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
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
        padding: 16,
        zIndex: 99999,
      }}
      onClick={onClose}
    >
      <div
        className="card-base animate-fade"
        style={{
          background: "#FFFFFF",
          borderRadius: "20px",
          width: "100%",
          maxWidth: 420,
          padding: "clamp(20px, 4vw, 32px)",
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
          }}
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #FEF9C3 0%, #FDE047 100%)",
              border: "1.5px solid #EAB308",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            <Ticket size={24} color="#0C2666" />
          </div>
          <h3 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", fontWeight: 900 }}>
            {isRegistering ? "Create Player Account" : "Sign In to Rimna Lottery"}
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: 2 }}>
            {isRegistering ? "Register to track your purchased tickets & payouts" : "Enter your registered phone number to access My Tickets"}
          </p>
        </div>

        {success ? (
          <div style={{ textAlign: "center", padding: "20px 0", color: "var(--teal-dark)" }}>
            <CheckCircle2 size={36} color="var(--teal)" style={{ margin: "0 auto 8px" }} />
            <h4 style={{ fontSize: "1.125rem", fontWeight: 800 }}>Welcome!</h4>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Redirecting to your tickets dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {isRegistering && (
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                  Full Name
                </label>
                <div style={{ position: "relative" }}>
                  <User size={16} color="var(--text-subtle)" style={{ position: "absolute", left: 12, top: 12 }} />
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
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                Phone Number / Telegram
              </label>
              <div style={{ position: "relative" }}>
                <Phone size={16} color="var(--text-subtle)" style={{ position: "absolute", left: 12, top: 12 }} />
                <input
                  type="text"
                  className="input-base"
                  placeholder="+251 9xx xxx xxx or international number"
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
    </div>,
    document.body
  );
}
