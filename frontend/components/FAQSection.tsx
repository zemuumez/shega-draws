"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface FAQItem {
  qEn: string;
  qAm: string;
  qTi: string;
  aEn: string;
  aAm: string;
  aTi: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    qEn: "How do I know the winning numbers are fair and transparent?",
    qAm: "የአሸናፊው ቁጥር ፍትሃዊና ግልጽ መሆኑን እንዴት ማወቅ እችላለሁ?",
    qTi: "ናይ ተዓዋቲ ቁጽሪ ፍትሓውን ግልጽን ምዃኑ ብኸመይ ክፈልጥ ይኽእል?",
    aEn: "All winning numbers are drawn live on video stream by the lottery founders during our scheduled public broadcast. Every drawn ticket is shown on camera in real time so all participants can watch and confirm live.",
    aAm: "ሁሉም አሸናፊ ቁጥሮች በይፋዊ የቀጥታ የቪዲዮ ስርጭት ላይ በእጣ አውጪዎች ፊት ለፊት ይወጣሉ፤ እያንዳንዱ አሸናፊ ቲኬት በካሜራ ፊት ለሁሉም ተመልካች በግልጽ ይታያል።",
    aTi: "ኩሎም ተዓወቲ ቁጽርታት ብናይ ቀጥታ ቪድዮ ፈነወ ኣብ ቅድሚ ተዓዘብቲ ይወጹ፤ ነፍሲ ወከፍ ተዓዋቲ ቲኬት ድማ ኣብ ካሜራ ንኹሉ ብግልጺ ይርአ።",
  },
  {
    qEn: "How much does a ticket cost, and how many tickets are in a draw?",
    qAm: "የቲኬት ዋጋ ስንት ነው? በአንድ እጣ ውስጥ ስንት ቲኬት ይሸጣል?",
    qTi: "ዋጋ ቲኬት ክንደይ እዩ? ኣብ ሓደ ዕጫ ክንደይ ቲኬት ይሽየጥ?",
    aEn: "Every draw has a fixed ticket price (e.g. 100 ETB, 200 ETB, 500 ETB or $50 USD) and a set limit of tickets (e.g. 1,000 or 2,000 tickets). Once all tickets are sold or the countdown ends, the live draw takes place immediately.",
    aAm: "እያንዳንዱ እጣ ቋሚ የቲኬት ዋጋ (ለምሳሌ 100 ብር፣ 200 ብር፣ 500 ብር ወይም $50 ዶላር) እና የተወሰነ የተሳታፊ ገደብ (ለምሳሌ 1,000 ወይም 2,000 ሰዎች) አለው።",
    aTi: "ነፍሲ ወከፍ ዕጫ ቐዋሚ ናይ ቲኬት ዋጋ (ንኣብነት 100 ብር፣ 200 ብር፣ 500 ብር ወይ $50 ዶላር) ከምኡ'ውን ውሱን ናይ ተሳተፍቲ ገደብ (ንኣብነት 1,000 ወይ 2,000 ሰባት) ኣለዎ።",
  },
  {
    qEn: "How do the Top 10 prize payouts work?",
    qAm: "የምርጥ 10 አሸናፊዎች የሽልማት አከፋፈል እንዴት ነው?",
    qTi: "ናይ ቀዳሞት 10 ተዓወትቲ ናይ ሽልማት ኣከፋፍላ ብኸመይ ይሰርሕ?",
    aEn: "Prizes are distributed to 10 winning numbers: 1st Place takes 30% (Grand Jackpot), 2nd Place takes 20%, 3rd Place takes 15%, and the rest receive tiered cash prizes directly via Telebirr or CBE Bank within minutes.",
    aAm: "ሽልማቱ ለ10 አሸናፊ ቁጥሮች ይከፋፈላል፡ 1ኛ የወጣው 30% (ዋናው ጃክፖት)፣ 2ኛ 20%፣ 3ኛ 15%፣ እና እስከ 10ኛ ደረጃ ያሉት በደቂቃዎች ውስጥ በቴሌብር ወይም በሲቢኢ ባንክ በቀጥታ ይላክላቸዋል።",
    aTi: "ሽልማት ን10 ተዓወቲ ቁጽርታት ይከፋፈል፡ 1ይ ዝወጸ 30% (ዋና ጃክፖት)፣ 2ይ 20%፣ 3ይ 15%፣ ከምኡ'ውን ክሳብ 10ይ ደረጃ ዘለዉ ብደቒቕ ውሽጢ ብቴሌብር ወይ ሲቢኢ ባንክ ይለኣኸሎም።",
  },
  {
    qEn: "What happens if two people pick the same lucky number?",
    qAm: "ሁለት ሰዎች አንድ አይነት ቁጥር ቢመርጡ ምን ይሆናል?",
    qTi: "ክልተ ሰባት ሓደ ዓይነት ቁጽሪ እንተመሪጾም እንታይ ይኸውን?",
    aEn: "The person whose payment confirmation is approved first wins that specific prize rank. Earlier verified timestamp guarantees the winning priority.",
    aAm: "በስርዓቱ ቀድሞ ክፍያ የፈጸመውና የተረጋገጠለት ተሳታፊ የዚያን ደረጃ ሽልማት ያሸንፋል።",
    aTi: "ኣብ ስርዓት ቀዲሙ ክፍሊት ዝፈጸመን ዝተረጋገጸሉን ተሳታፊ ናይቲ ደረጃ ሽልማት ይዕወት።",
  }
];

export function FAQSection() {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section style={{ margin: "48px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 28 }}>
        <div className="badge badge-gold" style={{ marginBottom: 8 }}>
          <HelpCircle size={12} /> FAQ
        </div>
        <h2 className="display" style={{ fontSize: "clamp(1.375rem, 3.5vw, 2rem)", color: "var(--text-main)", maxWidth: 580, margin: "0 auto" }}>
          {t.faq.title}
        </h2>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 10 }}>
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          const q = language === "ti" ? item.qTi : language === "am" ? item.qAm : item.qEn;
          const a = language === "ti" ? item.aTi : language === "am" ? item.aAm : item.aEn;

          return (
            <div
              key={idx}
              className="card-base"
              style={{
                borderRadius: "var(--radius-md)",
                overflow: "hidden",
                border: isOpen ? "1.5px solid var(--gold)" : "1px solid var(--gray-line)",
                background: isOpen ? "#FFFDF9" : "#FFFFFF",
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                style={{
                  width: "100%",
                  padding: "16px 20px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "transparent",
                  border: "none",
                  color: "var(--text-main)",
                  textAlign: "left",
                  fontSize: "0.9375rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  gap: 16,
                }}
              >
                <span>{q}</span>
                <ChevronDown
                  size={18}
                  color={isOpen ? "var(--gold-dark)" : "var(--text-muted)"}
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform var(--transition-fast)",
                    flexShrink: 0,
                  }}
                />
              </button>

              {isOpen && (
                <div style={{ padding: "0 20px 18px", color: "var(--text-muted)", fontSize: "0.875rem", lineHeight: 1.6 }}>
                  {a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
