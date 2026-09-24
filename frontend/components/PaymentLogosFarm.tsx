"use client";
import { ShieldCheck } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
export function PaymentLogosFarm() {
  const { text } = useLanguage();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 12,
        padding: "20px",
        color: "#0f172a",
      }}
    >
      <ShieldCheck size={30} aria-hidden="true" />
      <div>
        <strong style={{ fontSize: 20 }}>Chapa</strong>
        <p style={{ margin: 0, fontSize: 13 }}>
          {text("Available payment methods are shown at secure checkout.")}
        </p>
      </div>
    </div>
  );
}
