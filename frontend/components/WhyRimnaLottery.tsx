"use client";

import React from "react";
import { Trophy, Users, Award, Tv, Send, CheckCircle2, Ticket, CreditCard, ShieldCheck } from "lucide-react";
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
      className="card-base"
      style={{
        padding: "20px 20px",
        background: "#FFFFFF",
        borderRadius: "14px",
        border: "1.5px solid var(--gray-line)",
        marginBottom: 16,
      }}
    >
      <h3 className="display" style={{ fontSize: "1.25rem", color: "#111827", fontWeight: 900, marginBottom: 10 }}>
        {title}
      </h3>

      <div style={{ color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.7, display: "flex", flexDirection: "column", gap: 12 }}>
        {body ? (
          <div style={{ whiteSpace: "pre-line" }}>{body}</div>
        ) : (
          <>
            <p>
              Unlike automated lotteries with hidden black-box systems, <strong>Rimna Digital Lottery</strong> is built on genuine public transparency. All winning tickets are drawn live on video by the company founders during our scheduled public stream, where every selected number is held up and announced in real time for everyone to see.
            </p>

            <p>
              Every ticket tier operates with fixed, capped participant capacities (1,000, 2,000, 3,000, or 5,000 people). This guarantees that your odds of winning remain high, and <strong>every single draw awards guaranteed cash prizes to the Top 10 winning ranks</strong> without rollover delays.
            </p>
          </>
        )}

        {/* Feature Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginTop: 8 }}>
          {features ? (
            features.map((f, i) => {
              const fTitle = (language === "am" && f.titleAm) || (language === "om" && f.titleOm) || f.title;
              const fDesc = (language === "am" && f.descriptionAm) || (language === "om" && f.descriptionOm) || f.description;
              const isGold = f.color === "gold" || i === 0;
              const isBlue = f.color === "blue" || i === 1;
              const bg = isGold ? "#FEF9C3" : isBlue ? "#EFF6FF" : "#ECFDF5";
              const border = isGold ? "#FDE047" : isBlue ? "#BFDBFE" : "#A7F3D0";
              const color = isGold ? "var(--gold-deep)" : isBlue ? "#2A65E6" : "#059669";

              return (
                <div key={i} style={{ background: bg, border: `1px solid ${border}`, padding: "12px 14px", borderRadius: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: color, fontWeight: 800, fontSize: "0.8125rem", marginBottom: 4 }}>
                    {isGold ? <Trophy size={15} /> : isBlue ? <Tv size={15} /> : <Users size={15} />} {fTitle}
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-main)" }}>
                    {fDesc}
                  </span>
                </div>
              );
            })
          ) : (
            <>
              <div style={{ background: "#FEF9C3", border: "1px solid #FDE047", padding: "12px 14px", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--gold-deep)", fontWeight: 800, fontSize: "0.8125rem", marginBottom: 4 }}>
                  <Trophy size={15} /> 10 Guaranteed Winners
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-main)" }}>
                  Every pool guarantees cash payouts for the Top 10 ranks without rollover delays.
                </span>
              </div>

              <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "12px 14px", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#2A65E6", fontWeight: 800, fontSize: "0.8125rem", marginBottom: 4 }}>
                  <Tv size={15} /> 100% Live Streamed Draws
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-main)" }}>
                  Numbers drawn live on video broadcast so every participant sees the real outcome.
                </span>
              </div>

              <div style={{ background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "12px 14px", borderRadius: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#059669", fontWeight: 800, fontSize: "0.8125rem", marginBottom: 4 }}>
                  <Users size={15} /> Fixed Pool Sizes
                </div>
                <span style={{ fontSize: "0.75rem", color: "var(--text-main)" }}>
                  Pools are capped at 1K, 2K, 3K, and 5K tickets for transparent, fair odds.
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
