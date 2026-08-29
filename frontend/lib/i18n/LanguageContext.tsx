"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type Language, type Translations, translations } from "./translations";
import { Globe } from "lucide-react";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("rimnalottery_lang") as Language | null;
    if (saved && (saved === "en" || saved === "am" || saved === "om")) {
      setLangState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem("rimnalottery_lang", lang);
  };

  const t = translations[language] ?? translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  const options: { code: Language; label: string; flag: string }[] = [
    { code: "en", label: "English", flag: "EN" },
    { code: "am", label: "አማርኛ", flag: "አማ" },
    { code: "om", label: "Afaan Oromoo", flag: "OM" },
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.04)",
        border: "1px solid var(--gray-line)",
        borderRadius: "var(--radius-sm)",
        padding: "3px",
        gap: "2px",
      }}
      role="group"
      aria-label="Language Selector"
    >
      <Globe size={14} color="var(--gold)" style={{ marginLeft: 6, marginRight: 2 }} />
      {options.map((opt) => {
        const active = language === opt.code;
        return (
          <button
            key={opt.code}
            onClick={() => setLanguage(opt.code)}
            style={{
              background: active ? "var(--gold)" : "transparent",
              color: active ? "var(--ink)" : "var(--gray)",
              border: "none",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: "0.75rem",
              fontWeight: active ? 700 : 500,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
            }}
            title={opt.label}
          >
            {opt.flag}
          </button>
        );
      })}
    </div>
  );
}
