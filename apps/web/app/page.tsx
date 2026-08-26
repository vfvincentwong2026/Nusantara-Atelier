'use client';

import Link from 'next/link';
import CaseGallery from '@/components/CaseGallery';
import HeroCarousel from '@/components/HeroCarousel';
import SiteHeader from '@/components/SiteHeader';
import {
  IconBrickWall,
  IconKey,
  IconPencilRuler,
  IconSofa,
} from '@/components/icons';
import { useLanguage } from '@/components/LanguageProvider';
import { cases, casesWithPricing } from '@/lib/cases';

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

/** 服务四卡的线性图标（规范 §4）：设计=铅笔+尺、装修=砖墙、软装=沙发、整装=钥匙 */
const serviceIcons = [IconPencilRuler, IconBrickWall, IconSofa, IconKey];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main className="min-h-screen">
      {/* ========== 导航（共享组件） ========== */}
      <SiteHeader />

      {/* ========== ① Hero ========== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        <HeroCarousel images={heroImages} />
        <div className="relative z-10 mx-auto max-w-4xl px-6 pt-24 text-center">
          <p className="section-eyebrow mb-6">{t.hero.eyebrow}</p>
          <h1 className="text-[40px] font-semibold leading-[1.15] tracking-[-0.02em] text-balance text-ink sm:text-5xl md:text-[56px]">
            {t.hero.titleA}
            <span className="text-accent">{t.hero.titleB}</span>
          </h1>
          <p className="mt-3 text-sm tracking-widest text-ink-3">
            {t.hero.tagline}
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-[1.7] text-pretty text-ink-2">
            {t.hero.desc}
            <br />
            {t.hero.descChain}
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="w-full bg-accent px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-accent-dark sm:w-auto"
            >
              {t.hero.ctaPrimary}
            </Link>
            <a
              href="#cases"
              className="w-full border border-ink bg-white/70 px-8 py-3 text-sm tracking-widest text-ink transition-colors hover:border-accent hover:text-accent sm:w-auto"
            >
              {t.hero.ctaSecondary}
            </a>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-xs tracking-widest text-ink-3">
          {t.hero.scroll}
        </div>
      </section>

      {/* ========== ② 服务链条（四段式） ========== */}
      <section id="services" className="py-24 md:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-14">
            <p className="section-eyebrow">{t.services.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold text-balance text-ink md:text-4xl">
              {t.services.title}
            </h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {t.services.items.map((s, i) => {
              const Icon = serviceIcons[i % serviceIcons.length];
              return (
                <div
                  key={s.title}
                  className="border border-line bg-paper p-8 transition-colors hover:border-ink/30"
                >
                  <Icon className="h-7 w-7 text-ink" />
                  <h3 className="mt-5 text-lg font-semibold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs tracking-widest text-ink-3">
                    {s.subtitle}
                  </p>
                  <p className="mt-4 text-sm leading-[1.7] text-pretty text-ink-2">
                    {s.desc}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-ink-3">
                    {s.backup}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== ③ 案例画廊 ========== */}
      <section id="cases" className="py-24 md:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-12">
            <p className="section-eyebrow">{t.cases.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold text-balance text-ink md:text-4xl">
              {t.cases.title}
            </h2>
            <p className="mt-2 text-sm tracking-widest text-ink-3">
              {t.cases.sub}
            </p>
          </div>
          <CaseGallery cases={cases} />
        </div>
      </section>

      {/* ========== ④ 透明造价带 ========== */}
      <section id="pricing" className="py-24 md:py-32">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-12">
            <p className="section-eyebrow">{t.pricing.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-semibold text-balance text-ink md:text-4xl">
              {t.pricing.title}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-[1.7] text-pretty text-ink-2">
              {t.pricing.body}
            </p>
            <p className="mt-4 inline-block border border-line bg-paper-soft px-5 py-2 font-mono text-xs tabular-nums text-ink-2 md:text-sm">
              {t.pricing.formula}
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {casesWithPricing.map((c) => (
              <div
                key={c.id}
                className="border border-line bg-paper p-8"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="text-lg font-semibold text-ink">
                    {c.project_name}
                  </h3>
                  {c.location && (
                    <span className="text-xs text-ink-3">{c.location}</span>
                  )}
                </div>
                <p className="mt-1 text-xs tracking-widest text-ink-3">
                  {c.area} ㎡ · {t.styles[c.style] ?? c.style}
                </p>
                <div className="mt-5 space-y-2 border-t border-line pt-5 text-sm">
                  <div className="flex justify-between text-ink-2">
                    <span>{t.pricing.hardCost}</span>
                    <span className="tabular-nums text-ink">
                      ¥{c.hard_cost_per_sqm?.toLocaleString()}/㎡
                    </span>
                  </div>
                  <div className="flex justify-between text-ink-2">
                    <span>{t.pricing.softCost}</span>
                    <span className="tabular-nums text-ink">
                      ¥{c.soft_cost_per_sqm?.toLocaleString()}/㎡
                    </span>
                  </div>
                </div>
                {c.description && (
                  <p className="mt-4 text-xs leading-relaxed text-ink-3">
                    {c.description}
                  </p>
                )}
              </div>
            ))}
          </div>
          <p className="mt-8 text-center text-xs text-ink-3">
            {t.pricing.note}
          </p>
          <p className="mt-4 text-center">
            <Link
              href="/materials/"
              className="text-xs tracking-widest text-accent transition-colors hover:text-accent-dark"
            >
              {t.pricing.materialsLink}
            </Link>
          </p>
        </div>
      </section>

      {/* ========== ⑤ 团队介绍 ========== */}
      <section id="team" className="py-24 md:py-32">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="section-eyebrow">{t.team.eyebrow}</p>
          <h2 className="mt-4 text-3xl font-semibold text-balance text-ink md:text-4xl">
            {t.team.title}
          </h2>
          <p className="mx-auto mt-8 max-w-3xl text-pretty text-sm leading-[1.9] text-ink-2 md:text-base">
            {t.team.body}
          </p>
          <div className="mx-auto mt-12 grid max-w-2xl grid-cols-3 gap-6">
            {t.team.metrics.map((m) => (
              <div key={m.label}>
                <p className="text-3xl font-semibold tabular-nums text-ink md:text-4xl">
                  {m.value}
                </p>
                <p className="mt-2 text-xs tracking-widest text-ink-3">
                  {m.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== ⑥ 快速估价入口 ========== */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6">
          <div className="border border-line bg-paper-soft p-10 text-center">
            <p className="section-eyebrow">{t.estimate.eyebrow}</p>
            <h2 className="mt-4 text-2xl font-semibold text-balance text-ink md:text-3xl">
              {t.estimate.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-[1.7] text-pretty text-ink-2">
              {t.estimate.body}
            </p>
            <Link
              href="/upload"
              className="mt-8 inline-block bg-accent px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-accent-dark"
            >
              {t.estimate.cta}
            </Link>
          </div>
        </div>
      </section>

      {/* ========== ⑦ 预约 CTA ========== */}
      <section className="py-24 md:py-32">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-3xl font-semibold text-balance text-ink md:text-4xl">
            {t.booking.title}
          </h2>
          <p className="mt-2 text-sm tracking-widest text-ink-3">
            {t.booking.sub}
          </p>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-[1.7] text-pretty text-ink-2">
            {t.booking.body}
          </p>
          <Link
            href="/booking"
            className="mt-8 inline-block bg-accent px-10 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-accent-dark"
          >
            {t.booking.cta}
          </Link>
        </div>
      </section>

      {/* ========== ⑧ 页脚 ========== */}
      <footer className="border-t border-line py-12">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col items-center gap-6 text-center md:flex-row md:justify-between md:text-left">
            <div>
              <p className="text-lg font-semibold text-ink">
                Nusantara Atelier
              </p>
              <p className="mt-2 text-sm text-ink-2">{t.footer.tagline}</p>
              <p className="text-xs text-ink-3">{t.footer.taglineSub}</p>
            </div>
            <div className="text-xs text-ink-3">
              <p>{t.footer.related}</p>
              <p className="mt-1">MIT © 2026 Nusantara Atelier Team</p>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
