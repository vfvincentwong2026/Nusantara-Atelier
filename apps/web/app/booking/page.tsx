'use client';

import Link from 'next/link';
import { useLanguage } from '@/components/LanguageProvider';

export default function BookingPage() {
  const { t } = useLanguage();

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-6">
      <div className="text-center">
        <p className="section-eyebrow">{t.placeholder.bookingEyebrow}</p>
        <h1 className="mt-4 font-serif text-3xl text-ivory">
          {t.placeholder.bookingTitle}
        </h1>
        <p className="mt-2 text-sm tracking-widest text-ivory-mute">
          {t.placeholder.bookingSub}
        </p>
        <p className="mt-6 text-ivory-dim">{t.placeholder.comingSoon}</p>
        <Link
          href="/"
          className="mt-8 inline-block rounded-full border border-gold px-6 py-2 text-sm text-gold transition-colors hover:bg-gold hover:text-ink"
        >
          {t.placeholder.back}
        </Link>
      </div>
    </main>
  );
}
