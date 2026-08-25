'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { LOCALES } from '@/lib/i18n';

/**
 * 全站共享导航栏：品牌 + 首页锚点导航 + 语言切换器（ID / EN / 中文）。
 * 锚点统一用绝对路径 /#xxx，非首页点击时回首页定位。
 */
export default function SiteHeader() {
  const { locale, setLocale, t } = useLanguage();

  const anchors = [
    { href: '/#services', label: t.nav.services },
    { href: '/#cases', label: t.nav.cases },
    { href: '/#pricing', label: t.nav.pricing },
    { href: '/#team', label: t.nav.team },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-ivory/5 bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-lg tracking-widest">
          <span className="text-gold-dark">Nusantara</span>{' '}
          <span className="text-ivory">Atelier</span>
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-8 text-sm text-ivory-dim md:flex">
            {anchors.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="transition-colors hover:text-gold-dark"
              >
                {a.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="rounded-full border border-gold px-4 py-1.5 text-gold-dark transition-colors hover:bg-gold hover:text-white"
            >
              {t.nav.book}
            </Link>
          </nav>
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
        </div>
      </div>
    </header>
  );
}
