"use client";

import React, { useState } from "react";
import { Tv, Send, Trophy, CheckCircle2, Ticket, Sparkles, ShieldCheck, Radio } from "lucide-react";
import { BuyTicketModal } from "./BuyTicketModal";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CMSSectionContent } from "@/lib/sanity/queries";

interface LiveBroadcastBannerProps {
  cmsContent?: CMSSectionContent | null;
}

export function LiveBroadcastBanner({ cmsContent }: LiveBroadcastBannerProps) {
  const { language } = useLanguage();
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);

  const title =
    (language === "am" && cmsContent?.titleAm) ||
    (language === "om" && cmsContent?.titleOm) ||
    cmsContent?.title ||
    "100% Live Video Winner Draws by Company Founders";

  const body =
    (language === "am" && cmsContent?.bodyAm) ||
    (language === "om" && cmsContent?.bodyOm) ||
    cmsContent?.body;

  return (
    <>
      <BuyTicketModal
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        initialCurrency="ETB"
        initialPrice={100}
        initialDrawId="RDL-ACTIVE"
      />

      <div
        style={{
          background: "rgba(15, 23, 42, 0.62)",
          backdropFilter: "blur(24px) saturate(190%)",
          WebkitBackdropFilter: "blur(24px) saturate(190%)",
          borderRadius: "22px",
          border: "2px solid rgba(253, 224, 71, 0.75)",
          padding: "clamp(20px, 3.5vw, 32px)",
          boxShadow:
            "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(254, 240, 138, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
          color: "#FFFFFF",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: 16,
            marginBottom: 16,
          }}
        >
          <div>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(220, 38, 38, 0.25)",
                border: "1px solid #EF4444",
                borderRadius: "20px",
                padding: "3px 10px",
                marginBottom: 8,
              }}
            >
              <Radio size={12} color="#EF4444" className="animate-pulse" />
              <span
                style={{
                  fontSize: "0.6875rem",
                  fontWeight: 900,
                  color: "#FCA5A5",
                  letterSpacing: "0.8px",
                  textTransform: "uppercase",
                }}
              >
                OFFICIAL PUBLIC BROADCAST
              </span>
            </div>

            <h2
              className="display"
              style={{
                fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                fontWeight: 900,
                color: "#FFFFFF",
                margin: 0,
                lineHeight: 1.2,
              }}
            >
              {title}
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setIsBuyModalOpen(true)}
            className="casino-btn-red"
            style={{
              fontSize: "0.875rem",
              padding: "10px 20px",
              cursor: "pointer",
            }}
          >
            <Ticket size={15} /> Enter Active Draw Now
          </button>
        </div>

        <p style={{ color: "#E2E8F0", fontSize: "0.9375rem", lineHeight: 1.65, margin: "0 0 20px" }}>
          {body || (
            <>
              There are no hidden algorithms or automated backdoors. The company founders host every scheduled live public draw on video, pulling each physical winning number from the illuminated lottery tumbler and showing every ticket directly to viewers in real time!
            </>
          )}
        </p>

        {/* Channels & Guarantees Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <div
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(254, 240, 138, 0.3)",
              borderRadius: "14px",
              padding: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#FEF08A", fontWeight: 800, fontSize: "0.875rem", marginBottom: 4 }}>
              <Tv size={16} color="#FDE047" /> Live Stream Schedule
            </div>
            <span style={{ fontSize: "0.75rem", color: "#CBD5E1" }}>
              Every Friday & Sunday at 8:00 PM EAT (Addis Ababa Time).
            </span>
          </div>

          <div
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(52, 211, 153, 0.3)",
              borderRadius: "14px",
              padding: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6EE7B7", fontWeight: 800, fontSize: "0.875rem", marginBottom: 4 }}>
              <CheckCircle2 size={16} color="#34D399" /> 10 Guaranteed Winners
            </div>
            <span style={{ fontSize: "0.75rem", color: "#CBD5E1" }}>
              100% of the player prize pool is awarded in every single draw without rollovers.
            </span>
          </div>

          <div
            style={{
              background: "rgba(0, 0, 0, 0.4)",
              border: "1px solid rgba(96, 165, 250, 0.3)",
              borderRadius: "14px",
              padding: "14px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#93C5FD", fontWeight: 800, fontSize: "0.875rem", marginBottom: 4 }}>
              <Send size={16} color="#60A5FA" /> Official Telegram Stream
            </div>
            <span style={{ fontSize: "0.75rem", color: "#CBD5E1" }}>
              Join @RimnaLottery to watch the live video and chat with fellow participants.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
