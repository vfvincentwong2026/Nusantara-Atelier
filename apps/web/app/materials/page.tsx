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

      <section className="mx-auto max-w-[1200px] px-6 pb-24 pt-32">
        <div className="mb-10 text-center">
          <p className="section-eyebrow">{mp.eyebrow}</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-balance text-ink md:text-4xl">
            {mp.title}
          </h1>
          <p className="mt-2 text-sm tracking-widest text-ink-3">{mp.sub}</p>
          <p className="mx-auto mt-6 max-w-2xl border border-line bg-paper-soft px-5 py-2.5 text-xs leading-relaxed text-ink-2">
            {mp.disclaimer}
          </p>
        </div>

        <MaterialsLibrary />
      </section>
    </main>
  );
}
