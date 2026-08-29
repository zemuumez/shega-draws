"use client";

import React, { useState } from "react";
import { X, Phone, Mail, Send, MapPin, CheckCircle2, MessageSquare, Clock } from "lucide-react";

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ContactUsModal({ isOpen, onClose }: ContactUsModalProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim() && message.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 2000);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(12, 38, 102, 0.7)",
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
          maxWidth: 480,
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
              background: "var(--blue-bg)",
              border: "1.5px solid var(--blue-border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
            }}
          >
            <Phone size={22} color="#2A65E6" />
          </div>
          <h3 className="display" style={{ fontSize: "1.375rem", color: "var(--blue-navy)", fontWeight: 900 }}>
            Contact Customer Support
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
            Our team is available 24/7 to assist with ticket purchases, draw questions, and winner payouts.
          </p>
        </div>

        {/* Direct Contact Channels */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 20 }}>
          <a
            href="tel:+251911000000"
            style={{
              background: "#F8FAFC",
              border: "1px solid var(--gray-line)",
              borderRadius: "10px",
              padding: "10px 12px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "var(--blue-navy)",
            }}
          >
            <Phone size={16} color="#2A65E6" />
            <div>
              <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)", display: "block" }}>
                PHONE HOTLINE
              </span>
              <strong style={{ fontSize: "0.75rem" }}>+251 911 000 000</strong>
            </div>
          </a>

          <a
            href="https://t.me/RimnaLotteryOfficial"
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "10px",
              padding: "10px 12px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#2A65E6",
            }}
          >
            <Send size={16} color="#2A65E6" />
            <div>
              <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)", display: "block" }}>
                TELEGRAM
              </span>
              <strong style={{ fontSize: "0.75rem" }}>@RimnaLottery</strong>
            </div>
          </a>
        </div>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--teal-dark)" }}>
            <CheckCircle2 size={36} color="var(--teal)" style={{ margin: "0 auto 8px" }} />
            <h4 style={{ fontSize: "1.125rem", fontWeight: 800 }}>Message Received!</h4>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Our support agent will contact you shortly.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                Your Name
              </label>
              <input
                type="text"
                className="input-base"
                placeholder="e.g. Abebe Bikila"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                Phone Number / Telegram Handle
              </label>
              <input
                type="text"
                className="input-base"
                placeholder="+251 9xx xxx xxx or @username"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                style={{ fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--blue-navy)", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                Message / Inquiring Ticket
              </label>
              <textarea
                className="input-base"
                rows={3}
                placeholder="How can we help you today?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ fontSize: "0.875rem", resize: "none" }}
              />
            </div>

            <button
              type="submit"
              className="btn-base btn-primary"
              style={{ width: "100%", padding: "11px", fontSize: "0.875rem", fontWeight: 800, justifyContent: "center", marginTop: 4 }}
            >
              Send Message
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
