'use client';

import { useMemo, useState } from 'react';
import type { ProjectCase, StyleFilter } from '@/lib/types';
import { STYLES, STYLE_PENDING } from '@/lib/types';
import { useLanguage } from '@/components/LanguageProvider';

/** 每种风格对应的占位渐变（暖白 / 米色体系），用于无图兜底与图片加载背景 */
const STYLE_GRADIENTS: Record<string, string> = {
  法式: 'from-[#F4F1EA] via-[#E8DFCE] to-[#FAFAF8]',
  现代: 'from-[#F5F5F4] via-[#E9E9E7] to-[#FAFAF8]',
  侘寂: 'from-[#F5F3EE] via-[#E6E1D5] to-[#FAFAF8]',
  意式极简: 'from-[#F4F4F5] via-[#E7E7E9] to-[#FAFAF8]',
  现代奶油: 'from-[#F7F3EB] via-[#EDE4D3] to-[#FAFAF8]',
  法式轻奢: 'from-[#F4F2F0] via-[#E5DEE4] to-[#FAFAF8]',
  现代小法: 'from-[#F5F4F1] via-[#E8E3D8] to-[#FAFAF8]',
};
const DEFAULT_GRADIENT = 'from-[#F5F5F4] via-[#E9E9E7] to-[#FAFAF8]';

function CaseCard({ item }: { item: ProjectCase }) {
  const { t } = useLanguage();
  const gradient = STYLE_GRADIENTS[item.style] ?? DEFAULT_GRADIENT;
  const initial = item.project_name.charAt(0);
  const hasImage = item.images.length > 0;

  return (
    <article className="group overflow-hidden rounded-lg border border-ivory/10 bg-ink-800 transition-colors hover:border-gold/50">
      {/* 封面：有图用实景照，无图用渐变 + 首字占位 */}
      <div
        className={`relative h-52 overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        {hasImage ? (
          <img
            src={item.images[0]}
            alt={`${item.project_name} 实景照片`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="select-none font-serif text-6xl text-gold/25">
              {initial}
            </span>
          </div>
        )}

        {/* 底部轻微压暗，保证角标在照片上可读 */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/45 to-transparent" />

        <span className="absolute left-3 top-3 rounded-full border border-gold/50 bg-white/75 px-3 py-1 text-[11px] tracking-widest text-gold-dark backdrop-blur-sm">
          {item.style === STYLE_PENDING
            ? t.cases.moreStyle
            : t.styles[item.style] ?? item.style}
        </span>

        {hasImage ? (
          <span className="absolute bottom-3 right-3 rounded-full bg-white/80 px-2.5 py-0.5 text-[10px] tracking-widest text-ivory-dim backdrop-blur-sm">
            {t.cases.photoBadge(item.images.length)}
          </span>
        ) : (
          <span className="absolute bottom-3 right-3 rounded-full bg-white/70 px-2 py-0.5 text-[10px] tracking-widest text-ivory-mute">
            {t.cases.comingSoon}
          </span>
        )}
      </div>

      <div className="space-y-2 p-5">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-serif text-lg text-ivory group-hover:text-gold-dark">
            {item.project_name}
          </h3>
          {item.location && (
            <span className="shrink-0 text-xs text-ivory-mute">
              {item.location}
            </span>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ivory-dim">
          {item.area !== null && <span>{item.area} ㎡</span>}
          {item.hard_cost_per_sqm !== null && (
            <span>
              {t.pricing.hardCost} ¥{item.hard_cost_per_sqm.toLocaleString()}/㎡
            </span>
          )}
          {item.soft_cost_per_sqm !== null && (
            <span>
              {t.pricing.softCost} ¥{item.soft_cost_per_sqm.toLocaleString()}/㎡
            </span>
          )}
        </div>

        {item.description && (
          <p className="text-xs leading-relaxed text-gold-dark">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );
}

export default function CaseGallery({ cases }: { cases: ProjectCase[] }) {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<StyleFilter>('全部');

  const filtered = useMemo(() => {
    if (filter === '全部') return cases;
    if (filter === '更多') return cases.filter((c) => c.style === STYLE_PENDING);
    return cases.filter((c) => c.style === filter);
  }, [cases, filter]);

  const photoCount = filtered.reduce((n, c) => n + c.images.length, 0);

  return (
    <div>
      {/* 风格筛选器 */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-sm tracking-wider transition-colors ${
              filter === s
                ? 'border-gold bg-gold text-white'
                : 'border-ivory/20 text-ivory-dim hover:border-gold/60 hover:text-gold-dark'
            }`}
          >
            {t.styles[s] ?? s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CaseCard key={c.id} item={c} />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ivory-mute">
        {t.cases.stats(filtered.length, photoCount)}
      </p>
    </div>
  );
}
