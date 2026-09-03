"use client";

import React from "react";
import { Trophy, Users, Award, Tv, Send, CheckCircle2, Ticket, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import type { CMSSectionContent } from "@/lib/sanity/queries";

interface WhyRimnaLotteryProps {
  cmsContent?: CMSSectionContent | null;
}

export function WhyRimnaLottery({ cmsContent }: WhyRimnaLotteryProps) {
  const { language } = useLanguage();

  const title =
    (language === "am" && cmsContent?.titleAm) ||
    (language === "om" && cmsContent?.titleOm) ||
    cmsContent?.title ||
    "Why Rimna Digital Lottery?";

  const body =
    (language === "am" && cmsContent?.bodyAm) ||
    (language === "om" && cmsContent?.bodyOm) ||
    cmsContent?.body;

  const features = cmsContent?.features && cmsContent.features.length > 0 ? cmsContent.features : null;

  return (
    <div
      style={{
        background: "rgba(15, 23, 42, 0.62)",
        backdropFilter: "blur(24px) saturate(190%)",
        WebkitBackdropFilter: "blur(24px) saturate(190%)",
        borderRadius: "22px",
        border: "2px solid rgba(253, 224, 71, 0.75)",
        padding: "clamp(24px, 3.5vw, 36px)",
        boxShadow:
          "0 24px 60px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(254, 240, 138, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.2)",
        color: "#FFFFFF",
      }}
    >
      <div style={{ display: "inline-flex", marginBottom: 12 }}>
        <span
          style={{
            background: "rgba(254, 240, 138, 0.2)",
            border: "1px solid #FDE047",
            color: "#FEF08A",
            fontSize: "0.6875rem",
            fontWeight: 900,
            padding: "3px 10px",
            borderRadius: "14px",
            textTransform: "uppercase",
            letterSpacing: "0.6px",
          }}
        >
          OUR ETHICAL CORE VALUES
        </span>
      </div>

      <h2
        className="display"
        style={{
          fontSize: "clamp(1.4rem, 2.8vw, 2rem)",
          color: "#FFFFFF",
          fontWeight: 900,
          marginBottom: 12,
        }}
      >
        {title}
      </h2>

      <div style={{ color: "#E2E8F0", fontSize: "0.9375rem", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 14 }}>
        {body ? (
          <div style={{ whiteSpace: "pre-line" }}>{body}</div>
        ) : (
          <>
            <p>
              Unlike automated lotteries with hidden black-box algorithms, <strong>Rimna Digital Lottery</strong> is built entirely on genuine public transparency. All winning tickets are drawn live on video by company founders during scheduled public broadcasts, where every single winning number is held up and announced in real time.
            </p>

            <p>
              Every ticket tier operates with fixed, capped participant pools (1,000, 2,000, 3,000, or 5,000 people). This guarantees that your odds of winning remain high, and <strong>every single draw awards guaranteed cash prizes to the Top 10 winning ranks</strong> without rollover delays.
            </p>
          </>
        )}

        {/* Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14, marginTop: 10 }}>
          {features ? (
            features.map((f, i) => {
              const fTitle = (language === "am" && f.titleAm) || (language === "om" && f.titleOm) || f.title;
              const fDesc = (language === "am" && f.descriptionAm) || (language === "om" && f.descriptionOm) || f.description;
              const isGold = f.color === "gold" || i === 0;
              const isBlue = f.color === "blue" || i === 1;

              return (
                <div
                  key={i}
                  style={{
                    background: "rgba(0, 0, 0, 0.4)",
                    border: `1.5px solid ${isGold ? "#FDE047" : isBlue ? "#60A5FA" : "#34D399"}`,
                    padding: "16px 14px",
                    borderRadius: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: isGold ? "#FEF08A" : isBlue ? "#93C5FD" : "#6EE7B7",
                      fontWeight: 800,
                      fontSize: "0.875rem",
                      marginBottom: 6,
                    }}
                  >
                    {isGold ? <Trophy size={16} /> : isBlue ? <Tv size={16} /> : <Users size={16} />} {fTitle}
                  </div>
                  <span style={{ fontSize: "0.8125rem", color: "#CBD5E1", lineHeight: 1.5, display: "block" }}>
                    {fDesc}
                  </span>
                </div>
              );
            })
          ) : (
            <>
              <div
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1.5px solid #FDE047",
                  padding: "16px 14px",
                  borderRadius: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#FEF08A", fontWeight: 800, fontSize: "0.875rem", marginBottom: 6 }}>
                  <Trophy size={16} color="#FDE047" /> 10 Guaranteed Winners
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#CBD5E1", lineHeight: 1.5, display: "block" }}>
                  Every draw awards guaranteed cash payouts to the Top 10 ranks without rollover delays.
                </span>
              </div>

              <div
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1.5px solid #60A5FA",
                  padding: "16px 14px",
                  borderRadius: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#93C5FD", fontWeight: 800, fontSize: "0.875rem", marginBottom: 6 }}>
                  <Tv size={16} color="#60A5FA" /> 100% Live Streamed Draws
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#CBD5E1", lineHeight: 1.5, display: "block" }}>
                  Numbers drawn live on video broadcast so every participant sees the real outcome.
                </span>
              </div>

              <div
                style={{
                  background: "rgba(0, 0, 0, 0.4)",
                  border: "1.5px solid #34D399",
                  padding: "16px 14px",
                  borderRadius: "14px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#6EE7B7", fontWeight: 800, fontSize: "0.875rem", marginBottom: 6 }}>
                  <Users size={16} color="#34D399" /> Fixed Capped Pools
                </div>
                <span style={{ fontSize: "0.8125rem", color: "#CBD5E1", lineHeight: 1.5, display: "block" }}>
                  Pools are capped at 1K, 2K, 3K, and 5K tickets for transparent, fair 1-in-100 odds.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
