"use client";

import React, { createContext, useContext, useState, useEffect, useMemo } from "react";
import { type Language, type Translations, translations } from "./translations";
import { copyByEnglish } from "./uiCopy";
import { Globe } from "lucide-react";

interface LanguageContextType {
  language: Language;
  text: (english: string) => string;
  setLanguage: (lang: Language) => void;
  t: Translations;
  /** Get a CMS translation by key, with fallback to hardcoded translations. */
  tc: (key: string, fallback?: string) => string;
  /** Resolve a localized field from a CMS document (e.g. title, titleAm, titleTi) */
  getLocalized: (doc: any, fieldPrefix: string, fallback?: string) => string;
}

type CMSTranslation = { key: string; en: string; am?: string; ti?: string };
const LANGUAGE_PREFERENCE_KEY = "rimnalottery_language_preference";
const isLanguage = (value: unknown): value is Language => value === "en" || value === "am" || value === "ti";

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  text: (english) => english,
  setLanguage: () => {},
  t: translations.en,
  tc: () => "",
  getLocalized: () => "",
});

// Recursive dynamic proxy that checks CMS overrides before falling back to static translations
function createProxyTranslations(base: any, lang: Language, cms: Record<string, CMSTranslation>, prefix = ""): any {
  if (base === null || typeof base !== "object") return base;
  return new Proxy(base, {
    get(target, prop) {
      if (typeof prop !== "string") return Reflect.get(target, prop);
      const fullKey = prefix ? `${prefix}.${prop}` : prop;
      const cmsEntry = cms[fullKey];
      if (cmsEntry?.[lang]?.trim()) return cmsEntry[lang];
      const rawVal = Reflect.get(target, prop);
      if (typeof rawVal === "object" && rawVal !== null) {
        return createProxyTranslations(rawVal, lang, cms, fullKey);
      }
      return rawVal;
    },
  });
}

export function LanguageProvider({
  children,
  defaultLanguage = "en",
  cmsTranslations,
}: {
  children: React.ReactNode;
  defaultLanguage?: Language | string;
  cmsTranslations?: CMSTranslation[];
}) {
  const initialLang: Language = isLanguage(defaultLanguage) ? defaultLanguage : "en";
  // Bind an explicit visitor choice to the CMS default under which it was made.
  // A newly published default supersedes old preferences on the next page load.
  const [preference, setPreference] = useState<{ language: Language; defaultLanguage: Language } | null>(null);
  const language = preference?.defaultLanguage === initialLang ? preference.language : initialLang;
  const cms = useMemo(() => {
    const map: Record<string, CMSTranslation> = Object.create(null);
    for (const entry of cmsTranslations || []) map[entry.key] = entry;
    return map;
  }, [cmsTranslations]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LANGUAGE_PREFERENCE_KEY) || "null");
      if (isLanguage(saved?.language) && saved.defaultLanguage === initialLang) {
        setPreference(saved);
      } else {
        setPreference(null);
        localStorage.removeItem(LANGUAGE_PREFERENCE_KEY);
      }
      // Legacy preferences have no default attached and can mask CMS changes forever.
      localStorage.removeItem("rimnalottery_lang");
    } catch {
      setPreference(null);
    }
  }, [initialLang]);

  useEffect(() => { document.documentElement.lang = language; }, [language]);

  const setLanguage = (lang: Language) => {
    if (!isLanguage(lang)) return;
    const next = { language: lang, defaultLanguage: initialLang };
    setPreference(next);
    try { localStorage.setItem(LANGUAGE_PREFERENCE_KEY, JSON.stringify(next)); } catch {
      // Language switching still works when browser storage is blocked.
    }
  };

  const baseTranslations = translations[language];
  const t = createProxyTranslations(baseTranslations, language, cms) as Translations;

  const tc = (key: string, fallback?: string): string => {
    const localized = cms[key]?.[language];
    if (localized?.trim()) return localized;
    const builtIn = key.split(".").reduce((value: any, part) => value?.[part], baseTranslations);
    return (typeof builtIn === "string" ? builtIn : fallback) || cms[key]?.en || "";
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
    <LanguageContext.Provider value={{ language, setLanguage, t, tc, getLocalized, text: (english) => { const copy = copyByEnglish[english]; return copy ? tc(copy.key, copy[language]) : english; } }}>
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
            aria-pressed={active}
            title={opt.label}
          >
            {opt.flag}
          </button>
        );
      })}
    </div>
  );
}
