"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Star, Wallet, Sun, Moon, Globe, Zap, Compass, User } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";

export default function Home() {
  const { t } = useLanguage();

  const highlights = t.home.highlights;

  const flow = t.home.flow.steps.map((step, index) => ({
    step: String(index + 1).padStart(2, '0'),
    title: step.title,
    body: step.body,
    icon: index === 0 ? <User className="h-6 w-6 text-[#A16207]" /> :
          index === 1 ? <Compass className="h-6 w-6 text-[#A16207]" /> :
          <Sparkles className="h-6 w-6 text-[#A16207]" />,
  }));

  const plans = [
    {
      name: t.pricing.free.name,
      price: t.pricing.free.price,
      detail: t.pricing.free.features[0],
    },
    {
      name: t.pricing.standard.name,
      price: t.pricing.standard.price,
      detail: t.pricing.standard.features[4],
    },
  ];

  const features = [
    {
      icon: <Sun className="h-6 w-6 text-[#A16207]" />,
      title: t.home.features.accurate.title,
      desc: t.home.features.accurate.desc,
    },
    {
      icon: <Moon className="h-6 w-6 text-[#A16207]" />,
      title: t.home.features.ai.title,
      desc: t.home.features.ai.desc,
    },
    {
      icon: <Globe className="h-6 w-6 text-[#A16207]" />,
      title: t.home.features.worldTimezone.title,
      desc: t.home.features.worldTimezone.desc,
    },
    {
      icon: <Zap className="h-6 w-6 text-[#A16207]" />,
      title: t.home.features.fastGeneration.title,
      desc: t.home.features.fastGeneration.desc,
    },
  ];

  const testimonials = t.home.testimonials.map((item) => ({
    quote: item.quote,
    author: item.author,
    role: item.role,
  }));

  return (
    <main className="min-h-screen flex flex-col">
      <section className="relative overflow-hidden px-4 pb-16 pt-8 md:px-8 md:pb-20">
        <div className="luxury-grid absolute inset-0 opacity-60" />
        <div className="hero-orbit left-[8%] top-20 h-40 w-40" />
        <div className="hero-orbit right-[10%] top-16 h-64 w-64" />
        <div className="hero-orbit bottom-8 left-1/2 h-72 w-72 -translate-x-1/2" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="max-w-3xl">
              <p className="inline-flex items-center gap-2 rounded-full border border-[#A16207]/20 bg-[#A16207]/8 px-3 py-1 text-sm font-medium text-[#A16207]">
                <Sparkles aria-hidden="true" className="h-4 w-4" />
                {t.vedicAstrology}
              </p>
              <h1 className="mt-6 text-5xl leading-[0.95] text-[#0C0A09] md:text-7xl">
                {t.heroTitle}
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-black/68">
                {t.heroSubtitle}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  className="focus-ring inline-flex h-12 items-center gap-2 rounded-full bg-[#A16207] px-6 text-sm font-semibold text-white soft-rise"
                  href="/natal"
                >
                  {t.cta}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
                <Link
                  className="focus-ring inline-flex h-12 items-center rounded-full border border-black/10 bg-white/70 px-6 text-sm font-semibold text-black/72 soft-rise"
                  href="/pricing"
                >
                  {t.pricing.title}
                </Link>
              </div>
            </div>

            <div className="glass-panel rounded-[32px] p-6 md:p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-[#A16207]">
                    {t.productFocus}
                  </p>
                  <h2 className="mt-3 text-3xl text-[#0C0A09]">{t.siteTagline}</h2>
                </div>
                <Star aria-hidden="true" className="h-6 w-6 text-[#A16207]" />
              </div>
              <div className="mt-6 grid gap-3">
                {highlights.map((item, index) => (
                  <div
                    className="rounded-2xl border border-black/8 bg-white/70 px-4 py-4 text-sm leading-7 text-black/72"
                    key={index}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">{t.features}</p>
          <h2 className="mt-4 text-4xl text-[#0C0A09]">{t.home.features.title}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-4">
          {features.map((feature, index) => (
            <article
              className="glass-panel soft-rise rounded-[28px] p-6"
              key={index}
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-medium text-[#0C0A09]">{feature.title}</h3>
              <p className="mt-2 text-sm leading-7 text-black/68">{feature.desc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">{t.howItWorks}</p>
          <h2 className="mt-4 text-4xl text-[#0C0A09]">{t.home.flow.title}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {flow.map((item) => (
            <article
              className="glass-panel soft-rise rounded-[28px] p-6"
              key={item.step}
            >
              <div className="flex items-center gap-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-[#A16207]/10">
                  {item.icon}
                </div>
                <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                  {item.step}
                </p>
              </div>
              <h2 className="mt-4 text-3xl text-[#0C0A09]">{item.title}</h2>
              <p className="mt-4 text-sm leading-7 text-black/68">
                {item.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 md:px-8">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">{t.testimonials}</p>
          <h2 className="mt-4 text-4xl text-[#0C0A09]">{t.result.exploreMore}</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {testimonials.map((item, index) => (
            <article
              className="glass-panel soft-rise rounded-[28px] p-6"
              key={index}
            >
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="h-4 w-4 text-[#A16207] fill-[#A16207]" />
                ))}
              </div>
              <p className="text-lg leading-8 text-black/72 italic">"{item.quote}"</p>
              <div className="mt-4">
                <p className="font-medium text-[#0C0A09]">{item.author}</p>
                <p className="text-sm text-black/58">{item.role}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <div className="glass-panel rounded-[36px] p-6 md:p-10">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
                {t.monetization}
              </p>
              <h2 className="mt-3 text-4xl text-[#0C0A09]">
                {t.home.pricingSection.title}
              </h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-black/68">
                {t.home.pricingSection.subtitle}
              </p>
            </div>
            <Link
              className="focus-ring inline-flex h-12 items-center gap-2 rounded-full bg-[#1C1917] px-6 text-sm font-semibold text-white soft-rise"
              href="/pricing"
            >
              <Wallet aria-hidden="true" className="h-4 w-4" />
              {t.home.pricingSection.cta}
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {plans.map((plan) => (
              <article
                className="rounded-[28px] border border-black/8 bg-white/72 p-6"
                key={plan.name}
              >
                <p className="text-sm font-medium uppercase tracking-[0.14em] text-[#A16207]">
                  {plan.name}
                </p>
                <p className="mt-4 text-4xl text-[#0C0A09]">{plan.price}</p>
                <p className="mt-4 text-sm leading-7 text-black/68">
                  {plan.detail}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20 md:px-8">
        <div className="glass-panel rounded-[36px] p-6 md:p-10 text-center">
          <p className="text-xs uppercase tracking-[0.24em] text-[#A16207]">
            {t.readyToStart}
          </p>
          <h2 className="mt-4 text-4xl text-[#0C0A09]">
            {t.heroTitle}
          </h2>
          <p className="mt-4 max-w-2xl mx-auto text-sm leading-7 text-black/68">
            {t.heroSubtitle}
          </p>
          <Link
            className="focus-ring mt-8 inline-flex h-12 items-center gap-2 rounded-full bg-[#A16207] px-6 text-sm font-semibold text-white soft-rise"
            href="/natal"
          >
            {t.cta}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
