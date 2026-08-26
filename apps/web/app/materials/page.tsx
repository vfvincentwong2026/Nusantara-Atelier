'use client';

import MaterialsLibrary from '@/components/MaterialsLibrary';
import SiteHeader from '@/components/SiteHeader';
import { useLanguage } from '@/components/LanguageProvider';

export default function MaterialsPage() {
  const { t } = useLanguage();
  const mp = t.materialsPage;

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <div className="mb-10 text-center">
          <p className="section-eyebrow">{mp.eyebrow}</p>
          <h1 className="mt-4 font-serif text-3xl text-balance text-ivory md:text-4xl">
            {mp.title}
          </h1>
          <p className="mt-2 text-sm tracking-widest text-ivory-mute">{mp.sub}</p>
          <div className="gold-divider mx-auto mt-6" />
          <p className="mx-auto mt-6 max-w-2xl rounded border border-gold/30 bg-ink-800 px-5 py-2.5 text-xs leading-relaxed text-gold-dark">
            {mp.disclaimer}
          </p>
        </div>

        <MaterialsLibrary />
      </section>
    </main>
  );
}
