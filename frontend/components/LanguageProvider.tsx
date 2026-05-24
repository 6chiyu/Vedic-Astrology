"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, TranslationKeys, zh, en, hi } from "@/types/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languageMap = {
  zh,
  en,
  hi,
} as const;

// 从 localStorage 读取语言的辅助函数
const getSavedLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("vedic_language");
    if (saved && ["zh", "en", "hi"].includes(saved)) {
      return saved as Language;
    }
  }
  return "zh";
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  // 初始化时直接从 localStorage 读取，避免首次渲染时的语言闪烁
  const [language, setLanguageState] = useState<Language>(getSavedLanguage);

  useEffect(() => {
    // 确保在 hydration 后同步 localStorage 中的语言
    const savedLanguage = getSavedLanguage();
    if (savedLanguage !== language) {
      setLanguageState(savedLanguage);
    }
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("vedic_language", lang);
  };

  const t = languageMap[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
