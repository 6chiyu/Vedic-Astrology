"use client";

import { useState } from "react";
import { useLanguage } from "./LanguageProvider";
import { Language } from "@/types/translations";
import { Globe, Check } from "lucide-react";

const languages: { code: Language; name: string; nativeName: string }[] = [
  { code: "zh", name: "Chinese", nativeName: "中文" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
];

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/80 backdrop-blur-sm border border-black/10 hover:bg-white transition-all"
        title={t.language.switch}
      >
        <Globe className="h-4 w-4 text-black/60" />
        <span className="text-sm font-medium text-black/80">
          {languages.find((l) => l.code === language)?.nativeName}
        </span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white shadow-2xl border border-black/10 z-50 overflow-hidden">
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t.language.switch}
              </p>
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                    language === lang.code
                      ? "bg-amber-50 text-amber-800"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base">{lang.code === "zh" ? "🇨🇳" : lang.code === "en" ? "🇬🇧" : "🇮🇳"}</span>
                    <div className="text-left">
                      <div className="text-sm font-medium">{lang.nativeName}</div>
                      <div className="text-xs text-gray-500">{lang.name}</div>
                    </div>
                  </div>
                  {language === lang.code && (
                    <Check className="h-4 w-4 text-amber-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
