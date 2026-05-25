"use client";

import { ReactNode } from "react";
import { LanguageProvider } from "./LanguageProvider";
import Navbar from "./Navbar";
import { Language } from "@/types/translations";

interface LanguageProviderWrapperProps {
  children: ReactNode;
}

export default function LanguageProviderWrapper({ children }: LanguageProviderWrapperProps) {
  // 读取 cookies 获取初始语言（服务端渲染时会从 cookies 读取）
  // 由于是客户端组件，我们使用 cookies 来确保 SSR 和 CSR 的一致性
  const getInitialLanguage = (): Language => {
    if (typeof window !== "undefined") {
      const cookies = document.cookie.split("; ");
      const langCookie = cookies.find((c) => c.startsWith("vedic_language="));
      if (langCookie) {
        const lang = langCookie.split("=")[1];
        if (["zh", "en", "hi"].includes(lang)) {
          return lang as Language;
        }
      }
    }
    return "zh";
  };

  return (
    <LanguageProvider initialLanguage={getInitialLanguage()}>
      <Navbar />
      {children}
    </LanguageProvider>
  );
}
