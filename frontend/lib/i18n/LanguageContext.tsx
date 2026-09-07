"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { type Language, type Translations, translations } from "./translations";
import { Globe } from "lucide-react";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  /** Get a CMS translation by key, with fallback to hardcoded translations. */
  tc: (key: string, fallback?: string) => string;
  /** Resolve a localized field from a CMS document (e.g. title, titleAm, titleTi) */
  getLocalized: (doc: any, fieldPrefix: string, fallback?: string) => string;
}

// CMS translation cache (populated on mount)
let _cmsTranslations: Record<string, Record<string, string>> = {};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en,
  tc: () => "",
  getLocalized: () => "",
});

export function LanguageProvider({
  children,
  defaultLanguage = "en",
  cmsTranslations,
}: {
  children: React.ReactNode;
  defaultLanguage?: Language | string;
  cmsTranslations?: { key: string; en: string; am?: string; ti?: string }[];
}) {
  const initialLang: Language =
    defaultLanguage === "am" || defaultLanguage === "ti" || defaultLanguage === "en"
      ? (defaultLanguage as Language)
      : "en";

  const [language, setLangState] = useState<Language>(initialLang);

  useEffect(() => {
    const saved = localStorage.getItem("rimnalottery_lang") as Language | null;
    if (saved && (saved === "en" || saved === "am" || saved === "ti")) {
      setLangState(saved);
    } else if (defaultLanguage && (defaultLanguage === "en" || defaultLanguage === "am" || defaultLanguage === "ti")) {
      setLangState(defaultLanguage as Language);
    }
  }, [defaultLanguage]);

  // Build CMS lookup map once
  useEffect(() => {
    if (cmsTranslations && cmsTranslations.length > 0) {
      const map: Record<string, Record<string, string>> = {};
      for (const t of cmsTranslations) {
        map[t.key] = {
          en: t.en,
          ...(t.am ? { am: t.am } : {}),
          ...(t.ti ? { ti: t.ti } : {}),
        };
      }
      _cmsTranslations = map;
    }
  }, [cmsTranslations]);

  const setLanguage = (lang: Language) => {
    setLangState(lang);
    localStorage.setItem("rimnalottery_lang", lang);
  };

  const t = translations[language] ?? translations.en;

  /** Look up CMS translation by dot-path key, falling back to default translation or provided fallback. */
  const tc = (key: string, fallback?: string): string => {
    const cmsEntry = _cmsTranslations[key];
    if (cmsEntry) {
      if (language === "ti" && cmsEntry.ti) return cmsEntry.ti;
      if (language === "am" && cmsEntry.am) return cmsEntry.am;
      if (cmsEntry.en) return cmsEntry.en;
    }
    return fallback || "";
  };

  /** Helper to extract localized field from any CMS document based on current language */
  const getLocalized = (doc: any, fieldPrefix: string, fallback: string = ""): string => {
    if (!doc) return fallback;
    if (language === "ti" && doc[`${fieldPrefix}Ti`]) {
      return doc[`${fieldPrefix}Ti`];
    }
    if (language === "am" && doc[`${fieldPrefix}Am`]) {
      return doc[`${fieldPrefix}Am`];
    }
    return doc[fieldPrefix] || doc[`${fieldPrefix}En`] || fallback;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, tc, getLocalized }}>
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
    { code: "ti", label: "ትግርኛ", flag: "ትግ" },
  ];

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: "rgba(255, 255, 255, 0.05)",
        border: "1px solid rgba(255, 255, 255, 0.12)",
        borderRadius: "var(--radius-sm, 8px)",
        padding: "3px",
        gap: "3px",
      }}
      role="group"
      aria-label="Language Selector"
    >
      <Globe size={14} color="var(--gold, #FACC15)" style={{ marginLeft: 6, marginRight: 2 }} />
      {options.map((opt) => {
        const active = language === opt.code;
        return (
          <button
            key={opt.code}
            onClick={() => setLanguage(opt.code)}
            style={{
              background: active ? "var(--gold, #FACC15)" : "transparent",
              color: active ? "#0F172A" : "var(--gray, #94A3B8)",
              border: "none",
              borderRadius: 6,
              padding: "4px 8px",
              fontSize: "0.75rem",
              fontWeight: active ? 800 : 500,
              cursor: "pointer",
              transition: "all 0.15s ease",
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
