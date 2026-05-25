"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Language, TranslationKeys, zh, en, hi } from "@/types/translations";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationKeys;
  isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const languageMap = {
  zh,
  en,
  hi,
} as const;

// 默认语言
const DEFAULT_LANGUAGE: Language = "zh";

// 从 cookies 读取语言的辅助函数（用于 SSR）
function getCookieLanguage(): Language {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/vedic_language=(zh|en|hi)/);
    if (match) {
      return match[1] as Language;
    }
  }
  return DEFAULT_LANGUAGE;
}

// 从 localStorage 读取语言的辅助函数（用于客户端）
const getSavedLanguage = (): Language => {
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("vedic_language");
    if (saved && ["zh", "en", "hi"].includes(saved)) {
      return saved as Language;
    }
  }
  return DEFAULT_LANGUAGE;
};

export function LanguageProvider({ children, initialLanguage }: { children: ReactNode; initialLanguage?: Language }) {
  // 使用服务端传递的初始语言或默认值
  const [language, setLanguageState] = useState<Language>(initialLanguage || DEFAULT_LANGUAGE);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // 在 hydration 后同步 localStorage 中的语言
    const savedLanguage = getSavedLanguage();
    if (savedLanguage !== language) {
      setLanguageState(savedLanguage);
    }
    setIsHydrated(true);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("vedic_language", lang);
    // 同时设置 cookie 以支持 SSR
    document.cookie = `vedic_language=${lang};path=/;max-age=31536000`;
  };

  const t = languageMap[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isHydrated }}>
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
