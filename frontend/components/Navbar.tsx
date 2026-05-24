"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "./LanguageProvider";
import LanguageSwitcher from "./LanguageSwitcher";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const isActive = (path: string) => pathname === path;
  
  return (
    <header className="sticky top-0 z-50 border-b border-black/10 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
        <Link href="/" className="flex flex-col">
          <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
            {t.siteName}
          </p>
          <p className="mt-1 text-sm text-black/58">
            {t.siteTagline}
          </p>
        </Link>
        
        <nav className="flex items-center gap-3">
          <Link
            href="/"
            className={`focus-ring rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive("/") 
                ? "bg-[#1C1917] text-white" 
                : "text-black/70 hover:bg-black/5"
            }`}
          >
            {t.pricing.free.name.split(" ")[0]}
          </Link>
          <Link
            href="/pricing"
            className={`focus-ring rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              isActive("/pricing") 
                ? "bg-[#1C1917] text-white" 
                : "text-black/70 hover:bg-black/5"
            }`}
          >
            {t.pricing.title}
          </Link>
          <Link
            href="/natal"
            className="focus-ring rounded-full bg-[#A16207] px-4 py-2 text-sm font-medium text-white soft-rise"
          >
            {t.natal.submit}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  );
}
