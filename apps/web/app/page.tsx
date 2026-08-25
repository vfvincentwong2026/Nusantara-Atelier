'use client';

import Link from 'next/link';
import CaseGallery from '@/components/CaseGallery';
import HeroCarousel from '@/components/HeroCarousel';
import { useLanguage } from '@/components/LanguageProvider';
import { cases, casesWithPricing } from '@/lib/cases';
import { LOCALES } from '@/lib/i18n';

/** Hero 轮播素材：汀岸晓庐 / 玺园 / 香格里拉 / 广州中建御溪谷 各取两张 */
const heroImages = [
  '/cases/tingan-xiaolu/p01-0.jpg',
  '/cases/shaoxing-xiyuan/p36-0.jpg',
  '/cases/hz-xianggelila/p17-0.jpg',
  '/cases/guangzhou-yuxigu/p30-0.jpg',
  '/cases/tingan-xiaolu/p05-0.jpg',
  '/cases/shaoxing-xiyuan/p44-0.jpg',
  '/cases/hz-xianggelila/p24-0.jpg',
  '/cases/guangzhou-yuxigu/p34-0.jpg',
];

function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();
  return (
    <div className="flex items-center rounded-full border border-ivory/15 p-0.5 text-[11px] tracking-wider">
      {LOCALES.map((l) => (
        <button
          key={l.code}
          onClick={() => setLocale(l.code)}
          className={`rounded-full px-2.5 py-1 transition-colors ${
            locale === l.code
              ? 'bg-gold text-white'
              : 'text-ivory-mute hover:text-gold-dark'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen">
      {/* ========== 导航 ========== */}
      <header className="fixed inset-x-0 top-0 z-50 border-b border-ivory/5 bg-ink/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-serif text-lg tracking-widest">
            <span className="text-gold">Nusantara</span>{' '}
            <span className="text-ivory">Atelier</span>
          </Link>
          <div className="flex items-center gap-6">
            <nav className="hidden items-center gap-8 text-sm text-ivory-dim md:flex">
              <a href="#services" className="hover:text-gold-dark">
                {t.nav.services}
              </a>
              <a href="#cases" className="hover:text-gold-dark">
                {t.nav.cases}
              </a>
              <a href="#pricing" className="hover:text-gold-dark">
                {t.nav.pricing}
              </a>
              <Link
                href="/booking"
                className="rounded-full border border-gold px-4 py-1.5 text-gold transition-colors hover:bg-gold hover:text-white"
              >
                {t.nav.book}
              </Link>
            </nav>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* ========== ① Hero ========== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <HeroCarousel images={heroImages} />
        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-24 text-center">
          <p className="section-eyebrow mb-6">{t.hero.eyebrow}</p>
          <h1 className="font-serif text-4xl leading-tight text-ivory sm:text-5xl md:text-6xl">
            {t.hero.titleA}
            <span className="text-gold">{t.hero.titleB}</span>
          </h1>
          <p className="mt-3 text-sm tracking-widest text-ivory-mute">
            {t.hero.tagline}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-ivory-dim">
            {t.hero.desc}
            <br />
            {t.hero.descChain}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="w-full rounded-full bg-gold px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-gold-light sm:w-auto"
            >
              {t.hero.ctaPrimary}
            </Link>
            <a
              href="#cases"
              className="w-full rounded-full border border-ivory/30 px-8 py-3 text-sm tracking-widest text-ivory transition-colors hover:border-gold hover:text-gold-dark sm:w-auto"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs tracking-widest text-ivory-mute">
          {t.hero.scroll}
        </div>
      </section>

      {/* ========== ② 服务链条（四段式） ========== */}
      <section id="services" className="border-t border-ivory/5 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-14 text-center">
            <p className="section-eyebrow">{t.services.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl text-ivory md:text-4xl">
              {t.services.title}
            </h2>
            <div className="gold-divider mx-auto mt-6" />
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.services.items.map((s) => (
              <div
                key={s.title}
                className="rounded-lg border border-ivory/10 bg-ink-800 p-8 transition-colors hover:border-gold/40"
              >
                <div className="text-3xl">{s.icon}</div>
                <h3 className="mt-4 font-serif text-xl text-ivory">{s.title}</h3>
                <p className="mt-1 text-xs tracking-widest text-gold-dark">
                  {s.subtitle}
                </p>
                <p className="mt-4 text-sm leading-relaxed text-ivory-dim">
                  {s.desc}
                </p>
                <p className="mt-3 text-xs leading-relaxed text-gold-dark">
                  {s.backup}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ③ 案例画廊 ========== */}
      <section id="cases" className="border-t border-ivory/5 bg-ink-800/40 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="section-eyebrow">{t.cases.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl text-ivory md:text-4xl">
              {t.cases.title}
            </h2>
            <p className="mt-2 text-sm tracking-widest text-ivory-mute">
              {t.cases.sub}
            </p>
            <div className="gold-divider mx-auto mt-6" />
          </div>
          <CaseGallery cases={cases} />
        </div>
      </section>

      {/* ========== ④ 透明造价带 ========== */}
      <section id="pricing" className="border-t border-ivory/5 py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-12 text-center">
            <p className="section-eyebrow">{t.pricing.eyebrow}</p>
            <h2 className="mt-4 font-serif text-3xl text-ivory md:text-4xl">
              {t.pricing.title}
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-ivory-dim">
              {t.pricing.body}
            </p>
            <p className="mt-4 inline-block rounded border border-gold/40 bg-ink-800 px-5 py-2 font-mono text-xs text-gold-dark md:text-sm">
              {t.pricing.formula}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {casesWithPricing.map((c) => (
              <div
                key={c.id}
                className="rounded-lg border border-ivory/10 bg-ink-800 p-8"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-serif text-lg text-ivory">
                    {c.project_name}
                  </h3>
                  {c.location && (
                    <span className="text-xs text-ivory-mute">{c.location}</span>
                  )}
                </div>
                <p className="mt-1 text-xs tracking-widest text-gold-dark">
                  {c.area} ㎡ · {t.styles[c.style] ?? c.style}
                </p>
                <div className="mt-5 space-y-2 border-t border-ivory/10 pt-5 text-sm">
                  <div className="flex justify-between text-ivory-dim">
                    <span>{t.pricing.hardCost}</span>
                    <span className="text-ivory">
                      ¥{c.hard_cost_per_sqm?.toLocaleString()}/㎡
                    </span>
                  </div>
                  <div className="flex justify-between text-ivory-dim">
                    <span>{t.pricing.softCost}</span>
                    <span className="text-ivory">
                      ¥{c.soft_cost_per_sqm?.toLocaleString()}/㎡
                    </span>
                  </div>
                </div>
                {c.description && (
                  <p className="mt-4 text-xs leading-relaxed text-gold-dark">
                    {c.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-ivory-mute">
            {t.pricing.note}
          </p>
        </div>
      </section>

      {/* ========== ⑤ 团队介绍 ========== */}
      <section className="border-t border-ivory/5 bg-ink-800/60 py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="section-eyebrow">{t.team.eyebrow}</p>
          <h2 className="mt-4 font-serif text-3xl text-ivory md:text-4xl">
            {t.team.title}
          </h2>
          <div className="gold-divider mx-auto mt-6" />
          <p className="mx-auto mt-8 max-w-3xl text-sm leading-loose text-ivory-dim md:text-base">
            {t.team.body}
          </p>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-6">
            {t.team.metrics.map((m) => (
              <div key={m.label}>
                <p className="font-serif text-3xl text-gold-dark md:text-4xl">
                  {m.value}
                </p>
                <p className="mt-2 text-xs tracking-widest text-ivory-mute">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ⑥ 快速估价入口 ========== */}
      <section className="border-t border-ivory/5 bg-ink-800/40 py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="rounded-xl border border-gold/25 bg-gradient-to-br from-ink-800 to-ink-700 p-10 text-center">
            <p className="section-eyebrow">{t.estimate.eyebrow}</p>
            <h2 className="mt-4 font-serif text-2xl text-ivory md:text-3xl">
              {t.estimate.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-ivory-dim">
              {t.estimate.body}
            </p>
            <Link
              href="/upload"
              className="mt-8 inline-block rounded-full bg-gold px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-gold-light"
            >
              {t.estimate.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ========== ⑦ 预约 CTA ========== */}
      <section className="border-t border-ivory/5 py-24">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="font-serif text-3xl text-ivory md:text-4xl">
            {t.booking.title}
          </h2>
          <p className="mt-2 text-sm tracking-widest text-ivory-mute">
            {t.booking.sub}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-ivory-dim">
            {t.booking.body}
          </p>
          <Link
            href="/booking"
            className="mt-8 inline-block rounded-full bg-gold px-10 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-gold-light"
          >
            {t.booking.cta}
          </Link>
        </div>
      </section>

      {/* ========== ⑧ 页脚 ========== */}
      <footer className="border-t border-ivory/10 py-12">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <p className="font-serif text-lg">
                <span className="text-gold">Nusantara</span>{' '}
                <span className="text-ivory">Atelier</span>
              </p>
              <p className="mt-2 text-sm text-ivory-dim">{t.footer.tagline}</p>
              <p className="text-xs text-ivory-mute">{t.footer.taglineSub}</p>
            </div>
            <div className="text-xs text-ivory-mute">
              <p>{t.footer.related}</p>
              <p className="mt-1">MIT © 2026 Nusantara Atelier Team</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
