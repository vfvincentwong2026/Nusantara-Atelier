'use client';

import { useMemo, useState } from 'react';
import type { Material, MaterialTier } from '@/lib/types';
import { materials, MATERIAL_CATEGORIES } from '@/lib/materials';
import { useLanguage } from '@/components/LanguageProvider';
import type { Locale } from '@/lib/i18n';

const TIER_ORDER: MaterialTier[] = ['standard', 'luxury', 'ultra'];

const TIER_BADGE: Record<MaterialTier, string> = {
  standard: 'border-ivory/25 text-ivory-dim',
  luxury: 'border-gold/50 text-gold-dark',
  ultra: 'border-gold bg-gold text-white',
};

function pickName(m: Material, locale: Locale): string {
  if (locale === 'zh') return m.name_zh || m.name_id;
  if (locale === 'en') return m.name_en || m.name_id;
  return m.name_id;
}

function fmtIdr(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

function MaterialCard({ m }: { m: Material }) {
  const { t, locale } = useLanguage();
  const mp = t.materialsPage;
  return (
    <article className="flex h-full flex-col rounded-lg border border-ivory/10 bg-ink-800 p-5 transition-colors hover:border-gold/40">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-medium leading-snug text-ivory">
          {pickName(m, locale)}
        </h3>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] tracking-widest ${TIER_BADGE[m.tier]}`}
        >
          {mp.tiers[m.tier]}
        </span>
      </div>
      <p className="mt-1 text-xs text-ivory-mute">
        {[m.brand, m.spec].filter(Boolean).join(' · ')}
      </p>
      <div className="mt-4 border-t border-ivory/10 pt-3">
        <p className="text-base font-medium text-gold-dark">
          {m.price_idr !== null ? fmtIdr(m.price_idr) : '—'}
          <span className="ml-1 text-xs text-ivory-mute">/ {m.unit ?? ''}</span>
        </p>
        <p className="mt-0.5 text-[11px] text-ivory-mute">
          {m.price_usd !== null && `≈ US$${m.price_usd.toLocaleString()}`}
          {m.price_rmb !== null && ` · ¥${m.price_rmb.toLocaleString()}`}
        </p>
        <p className="mt-1 text-[11px] text-ivory-dim">
          {m.labor_rate_idr
            ? `${mp.laborLabel} ${fmtIdr(m.labor_rate_idr)}/${m.unit ?? ''}`
            : mp.includedLabel}
        </p>
      </div>
      <div className="mt-auto pt-3">
        <p className="text-[11px] text-ivory-mute">
          {mp.supplierLabel}：{m.supplier ?? '—'}
        </p>
        <p className="mt-0.5 font-mono text-[10px] tracking-wider text-ivory-mute/70">
          {m.sku_id}
        </p>
      </div>
    </article>
  );
}

export default function MaterialsLibrary() {
  const { t } = useLanguage();
  const mp = t.materialsPage;
  const [category, setCategory] = useState<string | null>(null);
  const [tier, setTier] = useState<MaterialTier | null>(null);

  const groups = useMemo(() => {
    const cats = category ? [category] : MATERIAL_CATEGORIES;
    return cats
      .map((cat) => {
        const items = materials.filter(
          (m) => m.category === cat && (!tier || m.tier === tier)
        );
        items.sort(
          (a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
        );
        return { cat, items };
      })
      .filter((g) => g.items.length > 0);
  }, [category, tier]);

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  const chipCls = (active: boolean) =>
    `rounded-full border px-4 py-1.5 text-sm tracking-wider transition-colors ${
      active
        ? 'border-gold bg-gold text-white'
        : 'border-ivory/20 text-ivory-dim hover:border-gold/60 hover:text-gold-dark'
    }`;

  return (
    <div>
      {/* 大类筛选 */}
      <div className="mb-4 flex flex-wrap justify-center gap-2">
        <button onClick={() => setCategory(null)} className={chipCls(category === null)}>
          {mp.all}
        </button>
        {MATERIAL_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(category === cat ? null : cat)}
            className={chipCls(category === cat)}
          >
            {mp.categories[cat] ?? cat}
          </button>
        ))}
      </div>
      {/* 档次筛选 */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        <button
          onClick={() => setTier(null)}
          className={chipCls(tier === null)}
        >
          {mp.all}
        </button>
        {TIER_ORDER.map((tr) => (
          <button
            key={tr}
            onClick={() => setTier(tier === tr ? null : tr)}
            className={chipCls(tier === tr)}
          >
            {mp.tiers[tr]}
          </button>
        ))}
      </div>

      {groups.map((g) => (
        <section key={g.cat} className="mb-12">
          <h2 className="mb-5 flex items-baseline gap-3 font-serif text-xl text-ivory">
            {mp.categories[g.cat] ?? g.cat}
            <span className="text-xs tracking-widest text-ivory-mute">
              {g.items.length} SKU
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {g.items.map((m) => (
              <MaterialCard key={m.sku_id} m={m} />
            ))}
          </div>
        </section>
      ))}

      <p className="mt-4 text-center text-xs text-ivory-mute">
        {mp.stats(total, groups.length)}
      </p>
    </div>
  );
}
