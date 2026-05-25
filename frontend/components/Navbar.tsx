"use client";

import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import LanguageSwitcher from "./LanguageSwitcher";
import { Orbit, Sparkles, Sun, Moon, Star } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <header className="sticky top-0 z-50 border-b border-[#D4C4A8]/50 bg-[#FFF8DC]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="flex items-center gap-4">
          {/* Logo - 融合莲花和星象元素 */}
          <div className="relative flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-[#F4C430]/20 to-[#6B2D91]/20 border border-[#D4AF37]/30">
            <Orbit className="h-6 w-6 text-[#6B2D91]" />
            <Star className="absolute top-1 right-1 h-3 w-3 text-[#F4C430] fill-[#F4C430]" />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[#6B2D91] font-medium">
              {t.siteName}
            </p>
            <p className="mt-1 text-sm text-[#2C1810]/60">
              {t.siteTagline}
            </p>
          </div>
        </div>
        
        <nav className="flex items-center gap-4">
          {/* 定价按钮 */}
          <a href="/pricing" className="flex items-center gap-2 text-sm text-[#2C1810]/58 hover:text-[#CC7722] transition-colors">
            <Sparkles className="h-4 w-4 text-[#F4C430]" />
            <span>{t.pricing.title}</span>
          </a>
          
          {/* 语言切换器 */}
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}