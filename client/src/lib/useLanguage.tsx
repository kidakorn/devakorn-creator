"use client";
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { translations, Language, TranslationKey } from "./translations";

const STORAGE_KEY = "devakorn_language";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLang: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("th");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (saved === "th" || saved === "en") setLanguage(saved);
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => {
      const next: Language = prev === "th" ? "en" : "th";
      localStorage.setItem(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const setLang = useCallback((lang: Language) => {
    setLanguage(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      const entry = translations[key] as { en: string; th: string } | undefined;
      return entry?.[language] ?? entry?.en ?? String(key);
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    // Safe fallback when used outside LanguageProvider (e.g. LandingPage)
    return {
      language: "th",
      toggleLanguage: () => {},
      setLang: () => {},
      t: (key: TranslationKey): string => {
        const entry = translations[key] as { en: string; th: string } | undefined;
        return entry?.th ?? entry?.en ?? String(key);
      },
    };
  }
  return ctx;
}
