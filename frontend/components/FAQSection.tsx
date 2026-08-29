"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageContext";

interface FAQItem {
  qEn: string;
  qAm: string;
  qOm: string;
  aEn: string;
  aAm: string;
  aOm: string;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    qEn: "How do I know the winning numbers are fair and transparent?",
    qAm: "የአሸናፊው ቁጥር ፍትሃዊና ግልጽ መሆኑን እንዴት ማወቅ እችላለሁ?",
    qOm: "Lakkoofsi mo'ate sirrii fi iftoomina qabaachuu akkamittiin beeka?",
    aEn: "All winning numbers are drawn live on video stream by the lottery founders during our scheduled public broadcast. Every drawn ticket is shown on camera in real time so all participants can watch and confirm live.",
    aAm: "ሁሉም አሸናፊ ቁጥሮች በይፋዊ የቀጥታ የቪዲዮ ስርጭት ላይ በእጣ አውጪዎች ፊት ለፊት ይወጣሉ፤ እያንዳንዱ አሸናፊ ቲኬት በካሜራ ፊት ለሁሉም ተመልካች በግልጽ ይታያል።",
    aOm: "Lakkoofsi mo'ate hundi tamsaasa viidiyoo kallattiin baafama; tikkeettiin mo'ate hundi kaameraa fuulduratti ifatti agarsiifama.",
  },
  {
    qEn: "How much does a ticket cost, and how many tickets are in a draw?",
    qAm: "የቲኬት ዋጋ ስንት ነው? በአንድ እጣ ውስጥ ስንት ቲኬት ይሸጣል?",
    qOm: "Gatiin tikkeettii meeqa? Carraa tokko keessatti tikkeettiin meeqa gurgurama?",
    aEn: "Every draw has a fixed ticket price (e.g. 100 ETB or 50 ETB) and a set limit of tickets (e.g. 1,000 or 2,000 tickets). Once all tickets are sold or the countdown ends, the draw takes place immediately.",
    aAm: "እያንዳንዱ እጣ ቋሚ የቲኬት ዋጋ (ለምሳሌ 100 ብር ወይም 50 ብር) እና የተወሰነ የተሳታፊ ገደብ (ለምሳሌ 1,000 ወይም 2,000 ሰዎች) አለው።",
    aOm: "Carraan hundi gatii murtaa'aa (fakkeenyaaf Qarshii 100 ykn 50) fi lakkoofsa tikkeettii daangeffame (fakkeenyaaf 1,000 ykn 2,000) qaba.",
  },
  {
    qEn: "How do the Top 10 prize payouts work?",
    qAm: "የምርጥ 10 አሸናፊዎች የሽልማት አከፋፈል እንዴት ነው?",
    qOm: "Kaffaltiin badhaasa sadarkaa 1ffaa hanga 10ffaa akkamitti hojjeta?",
    aEn: "Prizes are distributed to 10 winning numbers: 1st Place takes 80,000 ETB, 2nd Place takes 65,000 ETB, 3rd Place takes 40,000 ETB, and the rest receive tiered cash prizes directly via Telebirr or CBE Bank within 2 hours.",
    aAm: "ሽልማቱ ለ10 አሸናፊ ቁጥሮች ይከፋፈላል፡ 1ኛ የወጣው 80,000 ብር፣ 2ኛ 65,000 ብር፣ 3ኛ 40,000 ብር፣ እና እስከ 10ኛ ደረጃ ያሉት በ2 ሰዓት ውስጥ በቴሌብር ወይም በሲቢኢ ባንክ በቀጥታ ይላክላቸዋል።",
    aOm: "Badhaasni mo'attoota 10f qoodama: 1ffaan Qarshii 80,000, 2ffaan Qarshii 65,000, 3ffaan Qarshii 40,000 fi kanneen hafan Telebirr ykn Baankii CBE dhaan sa'aatii 2 keessatti kaffalamu.",
  },
  {
    qEn: "What happens if two people pick the same lucky number?",
    qAm: "ሁለት ሰዎች አንድ አይነት ቁጥር ቢመርጡ ምን ይሆናል?",
    qOm: "Namoonni lama yoo lakkoofsa walfakkaataa filatan maaltu ta'a?",
    aEn: "The person whose payment confirmation is approved first wins that specific prize rank. The second person remains eligible for other winning ranks.",
    aAm: "በስርዓቱ ቀድሞ ክፍያ የፈጸመውና የተረጋገጠለት ተሳታፊ የዚያን ደረጃ ሽልማት ያሸንፋል።",
    aOm: "Namni dura kaffaltii xumuree nagaheen isaa mirkanaa'e badhaasa sadarkaa sanaa fudhata.",
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
          const q = language === "am" ? item.qAm : language === "om" ? item.qOm : item.qEn;
          const a = language === "am" ? item.aAm : language === "om" ? item.aOm : item.aEn;

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
