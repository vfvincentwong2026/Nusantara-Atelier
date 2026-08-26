'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';
import { LOCALES } from '@/lib/i18n';

/**
 * 全站共享导航栏（规范 §5）：白底 + 底部 1px line，品牌无衬线 600，
 * 语言切换器为文字按钮，激活态 2px accent 下划线。
 * 锚点统一用绝对路径 /#xxx，非首页点击时回首页定位。
 */
export default function SiteHeader() {
  const { locale, setLocale, t } = useLanguage();

  const anchors = [
    { href: '/#services', label: t.nav.services },
    { href: '/#cases', label: t.nav.cases },
    { href: '/#pricing', label: t.nav.pricing },
    { href: '/materials/', label: t.nav.materials },
    { href: '/#team', label: t.nav.team },
  ];

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-[1200px] items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-base font-semibold tracking-wide text-ink"
        >
          Nusantara Atelier
        </Link>
        <div className="flex items-center gap-6">
          <nav className="hidden items-center gap-8 text-sm text-ink-2 md:flex">
            {anchors.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="transition-colors hover:text-ink"
              >
                {a.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="bg-accent px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              {t.nav.book}
            </Link>
          </nav>
          <div className="flex items-center gap-4 text-[11px] tracking-wider">
            {LOCALES.map((l) => (
              <button
                key={l.code}
                onClick={() => setLocale(l.code)}
                className={`-mb-px border-b-2 pb-1 transition-colors ${
                  locale === l.code
                    ? 'border-accent text-ink'
                    : 'border-transparent text-ink-3 hover:text-ink'
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
