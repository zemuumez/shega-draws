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
    qEn: "How do I know the winning numbers were not rigged or changed after payment?",
    qAm: "የአሸናፊው ቁጥር ክፍያ ከተፈጸመ በኋላ እንዳልተቀየረ ወይም እንዳልተጭበረበረ እንዴት አውቃለሁ?",
    qOm: "Lakkoofsi mo'ate erga kaffaltiin raawwatamee booda akka hin jijjiiramne akkamittiin beeka?",
    aEn: "We publish a cryptographic SHA-256 fingerprint (commitment) of the secret seed BEFORE any tickets are sold. On draw day, we reveal the original seed. You can run the SHA-256 hash in your browser or any tool to verify that the seed matches the pre-published commitment perfectly.",
    aAm: "ቲኬት ሽያጭ ከመጀመሩ በፊት የ32-ባይት ሚስጥራዊ ኮዱን SHA-256 አሻራ በይፋ እናትማለን። በእጣው ቀን ሚስጥራዊው ኮድ ሲገለጽ በእራስዎ ብሮውዘር ላይ ኮዱ አስቀድሞ ከታተመው ጋር እንደሚገጥም በራስዎ ማረጋገጥ ይችላሉ።",
    aOm: "Duraan dursinee mallattoo SHA-256 ifatti baafna. Guyyaa carraa immoo koodichi ni ifooma; ofumaan akka inni wal simu mirkaneeffachuu dandeessu.",
  },
  {
    qEn: "What happens if two participants choose the same number?",
    qAm: "ሁለት ወይም ከዚያ በላይ ተሳታፊዎች አንድ አይነት ቁጥር ቢመርጡ ምን ይሆናል?",
    qOm: "Namoonni lama yoo lakkoofsa walfakkaataa filatan maaltu ta'a?",
    aEn: "The participant whose payment proof is verified and confirmed first in our system wins that prize rank. The second participant is eligible for secondary prize tiers or subsequent prize allocations.",
    aAm: "በስርዓታችን ቀድሞ ክፍያውን የፈጸመውና የተረጋገጠለት ተሳታፊ የዚያን ደረጃ ሽልማት ያሸንፋል። ቀጥሎ ክፍያ ያረጋገጠው ለቀጣይ የሽልማት ደረጃዎች ይገባል።",
    aOm: "Namni dura kaffaltii nagahee galchee sirnaan mirkanaa'e badhaasa sadarkaa sanaa fudhata.",
  },
  {
    qEn: "How are prizes disbursed to winners?",
    qAm: "አሸናፊዎች ሽልማታቸውን እንዴት ይቀበላሉ?",
    qOm: "Mo'attoonni badhaasa isaanii akkamitti fudhatu?",
    aEn: "Cash prizes are transferred directly to the winner's registered Telebirr or CBE Bank account within 2 hours of verification. Physical prizes (Villas, Vehicles) are officially handed over in Addis Ababa with legal registration papers.",
    aAm: "የገንዘብ ሽልማቶች አሸናፊው በተመዘገበበት የቴሌብር ወይም የኢትዮጵያ ንግድ ባንክ አካውንት በ2 ሰዓት ውስጥ ይተላለፋሉ። ተሸከርካሪዎች እና ቤቶች በህጋዊ ሰነድ ርክክብ ይፈጸማል።",
    aOm: "Badhaasni qarshii sa'aatii 2 keessatti gara Telebirr ykn herrega Baankii Daldala Itoophiyaa isaaniitti ni ergama. Manneeniifi konkolaataan seeraan dabarfamu.",
  },
  {
    qEn: "What payment methods are supported?",
    qAm: "የትኞቹ የክፍያ አማራጮች ይሰራሉ?",
    qOm: "Malleen kaffaltii kamtu hojjeta?",
    aEn: "We support Telebirr, CBE Birr, Commercial Bank of Ethiopia (CBE) Mobile Banking, and Bank of Abyssinia direct transfers.",
    aAm: "ቴሌብር፣ ሲቢኢ ብር፣ የኢትዮጵያ ንግድ ባንክ ሞባይል ባንኪንግ እና አቢሲንያ ባንክ እንቀበላለን።",
    aOm: "Telebirr, CBE Birr, Baankii Daldala Itoophiyaa fi Baankii Abisiiniyaa ni fudhanna.",
  }
];

export function FAQSection() {
  const { t, language } = useLanguage();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section style={{ margin: "56px 0" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <div className="badge badge-gold" style={{ marginBottom: 8 }}>
          <HelpCircle size={12} /> FAQ
        </div>
        <h2 className="display" style={{ fontSize: "clamp(1.5rem, 3.5vw, 2.25rem)", color: "var(--paper)", maxWidth: 580, margin: "0 auto" }}>
          {t.faq.title}
        </h2>
      </div>

      <div style={{ maxWidth: 800, margin: "0 auto", display: "flex", flexDirection: "column", gap: 12 }}>
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
                border: isOpen ? "1px solid var(--gold)" : "1px solid var(--gray-line)",
                background: isOpen ? "var(--ink-card-alt)" : "var(--ink-card)",
              }}
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                style={{
                  width: "100%",
                  padding: "18px 22px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "transparent",
                  border: "none",
                  color: "var(--paper)",
                  textAlign: "left",
                  fontSize: "1rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  gap: 16,
                }}
              >
                <span>{q}</span>
                <ChevronDown
                  size={18}
                  color={isOpen ? "var(--gold)" : "var(--gray)"}
                  style={{
                    transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform var(--transition-fast)",
                    flexShrink: 0,
                  }}
                />
              </button>

              {isOpen && (
                <div style={{ padding: "0 22px 20px", color: "var(--paper-muted)", fontSize: "0.875rem", lineHeight: 1.65 }}>
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
