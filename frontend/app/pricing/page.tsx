"use client";

import Link from "next/link";
import { Check, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function PricingPage() {
  const { t } = useLanguage();

  const plans = [
    {
      name: t.pricing.yearly.name,
      price: t.pricing.yearly.price,
      badge: t.pricing.yearly.badge,
      items: t.pricing.yearly.features,
      featured: false,
    },
    {
      name: t.pricing.standard.name,
      price: t.pricing.standard.price,
      badge: t.pricing.standard.badge,
      items: t.pricing.standard.features,
      featured: true,
    },
    {
      name: t.pricing.free.name,
      price: t.pricing.free.price,
      badge: t.pricing.free.badge,
      items: t.pricing.free.features,
      featured: false,
    },
  ];

  const faqs = t.faq.questions;

  return (
    <main className="min-h-screen px-4 py-6 md:px-8 md:py-8">
      <div className="mx-auto max-w-6xl">
        <section className="mt-6 glass-panel rounded-[36px] p-6 md:p-10">
          <div className="text-center mb-10">
            <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
              {t.pricingLabel}
            </p>
            <h1 className="mt-4 text-5xl leading-[0.96] text-[#0C0A09] md:text-6xl">
              {t.pricing.title}
            </h1>
            <p className="mt-5 max-w-3xl mx-auto text-sm leading-8 text-black/66">
              {t.pricing.subtitle}
            </p>
          </div>

          <div className="mt-8 grid gap-4 lg:grid-cols-3">
            {plans.map((plan, index) => (
              <article
                className={`rounded-[28px] border p-6 transition-all duration-300 ${
                  plan.featured
                    ? "border-[#A16207]/30 bg-[#1C1917] text-white transform scale-105 shadow-xl"
                    : "border-black/8 bg-white/74 text-[#0C0A09] hover:transform hover:scale-102"
                }`}
                key={plan.name}
              >
                <div className="flex items-center justify-between">
                  <p
                    className={`text-xs uppercase tracking-[0.18em] ${plan.featured ? "text-[#D6B66C]" : "text-[#A16207]"}`}
                  >
                    {plan.badge}
                  </p>
                  {plan.name !== t.pricing.free.name && (
                    <span className={`text-xs px-2 py-1 rounded-full ${plan.featured ? "bg-[#D6B66C]/20 text-[#D6B66C]" : "bg-[#A16207]/10 text-[#A16207]"}`}>
                      VIP
                    </span>
                  )}
                </div>
                <h2 className="mt-4 text-3xl">{plan.name}</h2>
                <p className="mt-4 text-4xl">{plan.price}</p>
                <div className="mt-6 grid gap-3">
                  {plan.items.map((item) => (
                    <div className="flex gap-3 text-sm leading-7" key={item}>
                      <Check
                        aria-hidden="true"
                        className={`mt-1 h-4 w-4 shrink-0 ${plan.featured ? "text-[#D6B66C]" : "text-[#A16207]"}`}
                      />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <Link
                  href="/natal"
                  className={`focus-ring mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all ${
                    plan.featured
                      ? "bg-[#D6B66C] text-[#1C1917] hover:bg-[#C9A85C]"
                      : "bg-[#A16207] text-white hover:bg-[#905806]"
                  }`}
                >
                  {plan.name === t.pricing.free.name ? t.pricing.free.cta : t.pricing.standard.cta}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>

          <div className="mt-8 rounded-[28px] border border-black/8 bg-white/74 p-6">
            <div className="flex items-center gap-3">
              <Sparkles aria-hidden="true" className="h-5 w-5 text-[#A16207]" />
              <p className="text-sm font-medium text-black/70">{t.faq.productSuggestion.title}</p>
            </div>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-black/66">
              {t.faq.productSuggestion.content}
            </p>
            <Link
              className="focus-ring mt-6 inline-flex h-12 items-center rounded-full bg-[#A16207] px-6 text-sm font-semibold text-white"
              href="/natal"
            >
              {t.faq.productSuggestion.cta}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
