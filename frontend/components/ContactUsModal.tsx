"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Phone, Send, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CMSSiteSettings } from "@/lib/sanity/queries";

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings?: CMSSiteSettings | null;
}

export function ContactUsModal({ isOpen, onClose, siteSettings }: ContactUsModalProps) {
  const { t, language, text } = useLanguage();
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const contactPhone = siteSettings?.contactPhone || "+251 911 000 000";
  const telegramHandle = siteSettings?.telegramHandle || "@RimnaLotteryOfficial";
  const telegramUrl = siteSettings?.telegramUrl || (telegramHandle.startsWith("http") ? telegramHandle : `https://t.me/${telegramHandle.replace("@", "")}`);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (sending || !phone.trim() || !message.trim()) return;
    setSending(true); setError("");
    try {
      const response = await fetch("/api/contact", {method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({name,phone,message})});
      if (!response.ok) throw new Error("save failed");
      setSubmitted(true);
    } catch {setError("Your message could not be saved. Please try again.");}
    finally {setSending(false);}

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
          maxWidth: 480,
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "clamp(16px, 4vw, 28px)",
          position: "relative",
          boxShadow: "0 24px 48px -12px rgba(0,0,0,0.35)",
          border: "2px solid #FDE047",
          boxSizing: "border-box",
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
            zIndex: 2,
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
          <h3 className="display" style={{ fontSize: "clamp(1.125rem, 3vw, 1.375rem)", color: "#111827", fontWeight: 900, margin: "0 0 4px" }}>
            {language === "ti" ? "ናይ ዓማዊል ደገፍ ርኸቡ" : language === "am" ? "የደንበኞች አገልግሎትን ያነጋግሩ" : "Contact Customer Support"}
          </h3>
          <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", margin: 0, lineHeight: 1.4 }}>
            {language === "ti"
              ? "ጉጅለና ብዛዕባ ዕዳጋ ቲኬትን ክፍሊት ሽልማትን ንምሕጋዝ 24/7 ድሉው እዩ።"
              : language === "am"
              ? "ቡድናችን ስለ ቲኬት ግዢ እና የሽልማት ክፍያዎች ለማገዝ በ24/7 ዝግጁ ነው።"
              : "Our team is available 24/7 to assist with ticket purchases, draw questions, and winner payouts."}
          </p>
        </div>

        {/* Direct Contact Channels */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 10,
            marginBottom: 20,
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <a
            href={`tel:${contactPhone.replace(/\s+/g, "")}`}
            style={{
              background: "#F8FAFC",
              border: "1px solid var(--gray-line)",
              borderRadius: "12px",
              padding: "10px 12px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#111827",
              minWidth: 0,
              width: "100%",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                background: "rgba(42, 101, 230, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Phone size={16} color="#2A65E6" />
            </div>
            <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)", display: "block", textTransform: "uppercase", fontWeight: 700 }}>
                {language === "ti" ? "ናይ ስልኪ መስመር" : language === "am" ? "የስልክ መስመር" : "PHONE HOTLINE"}
              </span>
              <strong style={{ fontSize: "0.8125rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {contactPhone}
              </strong>
            </div>
          </a>

          <a
            href={telegramUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              borderRadius: "12px",
              padding: "10px 12px",
              textDecoration: "none",
              display: "flex",
              alignItems: "center",
              gap: 10,
              color: "#2A65E6",
              minWidth: 0,
              width: "100%",
              overflow: "hidden",
              boxSizing: "border-box",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "8px",
                background: "rgba(42, 101, 230, 0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <Send size={16} color="#2A65E6" />
            </div>
            <div style={{ minWidth: 0, flex: 1, overflow: "hidden" }}>
              <span className="mono" style={{ fontSize: "0.625rem", color: "var(--text-subtle)", display: "block", textTransform: "uppercase", fontWeight: 700 }}>
                TELEGRAM
              </span>
              <strong style={{ fontSize: "0.8125rem", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {telegramHandle}
              </strong>
            </div>
          </a>
        </div>

        {error && <p role="alert">{text(error)}</p>}
        {submitted ? (
          <div style={{ textAlign: "center", padding: "24px 0", color: "var(--teal-dark)" }}>
            <CheckCircle2 size={36} color="var(--teal)" style={{ margin: "0 auto 8px" }} />
            <h4 style={{ fontSize: "1.125rem", fontWeight: 800 }}>
              {language === "ti" ? "መልእኽትኹም በጺሑና ኣሎ!" : language === "am" ? "መልእክትዎ ደርሶናል!" : "Message Received!"}
            </h4>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              {language === "ti" ? "ናይ ደገፍ ወኪልና ኣብ ቀረባ ግዜ ክድውለልኩም እዩ።" : language === "am" ? "የድጋፍ ባለሙያችን በቅርቡ ያነጋግርዎታል።" : "Our support agent will contact you shortly."}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                {language === "ti" ? "ስምኩም" : language === "am" ? "የእርስዎ ስም" : "Your Name"}
              </label>
              <input
                type="text"
                className="input-base"
                placeholder={language === "ti" ? "ንኣብነት ኣበበ ቢቂላ" : language === "am" ? "ለምሳሌ አበበ ቢቂላ" : "e.g. Abebe Bikila"}
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ fontSize: "0.875rem" }}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                {language === "ti" ? "ቁጽሪ ስልኪ / ቴሌግራም" : language === "am" ? "ስልክ ቁጥር / የቴሌግራም አድራሻ" : "Phone Number / Telegram Handle"}
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
              <label style={{ fontSize: "0.75rem", fontWeight: 700, color: "#111827", textTransform: "uppercase", display: "block", marginBottom: 4 }}>
                {language === "ti" ? "መልእኽቲ / ሕቶ" : language === "am" ? "መልእክት / ጥያቄ" : "Message / Inquiring Ticket"}
              </label>
              <textarea
                className="input-base"
                rows={3}
                placeholder={language === "ti" ? "ብኸመይ ክንሕግዘኩም ንኽእል?" : language === "am" ? "እንዴት ልንረዳዎ እንችላለን?" : "How can we help you today?"}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{ fontSize: "0.875rem", resize: "none" }}
              />
            </div>

            <button
              disabled={sending}
              type="submit"
              className="btn-base btn-primary"
              style={{ width: "100%", padding: "11px", fontSize: "0.875rem", fontWeight: 800, justifyContent: "center", marginTop: 4 }}
            >
              {sending ? text("Saving…") : language === "ti" ? "መልእኽቲ ስደዱ" : language === "am" ? "መልእክት ይላኩ" : "Send Message"}
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body
  );
}
