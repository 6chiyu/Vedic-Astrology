"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="mt-auto border-t border-black/10 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-12 md:px-8">
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                {t.siteName}
              </p>
              <p className="mt-2 text-sm text-black/58">
                {t.footer.description}
              </p>
            </div>
            <p className="mt-4 text-sm text-black/48">
              © {new Date().getFullYear()} {t.siteName}. All rights reserved.
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-[#0C0A09]">{t.footer.quickLinks}</h3>
            <nav className="mt-4 grid gap-2 text-sm">
              <Link href="/" className="text-black/62 hover:text-[#A16207]">
                {t.footer.home}
              </Link>
              <Link href="/natal" className="text-black/62 hover:text-[#A16207]">
                {t.footer.chart}
              </Link>
              <Link href="/pricing" className="text-black/62 hover:text-[#A16207]">
                {t.footer.pricing}
              </Link>
            </nav>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-[#0C0A09]">{t.footer.about}</h3>
            <p className="mt-4 text-sm text-black/62 leading-7">
              {t.footer.aboutText}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
