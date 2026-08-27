'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { ProjectCase, StyleFilter } from '@/lib/types';
import { STYLES, STYLE_PENDING } from '@/lib/types';
import { useLanguage } from '@/components/LanguageProvider';

/** 每种风格对应的占位渐变（中性灰体系，规范 §7），用于无图兜底与图片加载背景 */
const STYLE_GRADIENTS: Record<string, string> = {
  法式: 'from-[#F7F7F7] via-[#EDEDED] to-[#FAFAFA]',
  现代: 'from-[#F5F5F5] via-[#E9E9E9] to-[#FAFAFA]',
  侘寂: 'from-[#F6F6F5] via-[#ECECEA] to-[#FAFAFA]',
  意式极简: 'from-[#F4F4F5] via-[#E7E7E9] to-[#FAFAFA]',
  现代奶油: 'from-[#F7F7F5] via-[#EEEDE9] to-[#FAFAFA]',
  法式轻奢: 'from-[#F5F5F6] via-[#EBEBED] to-[#FAFAFA]',
  现代小法: 'from-[#F6F6F5] via-[#ECEBEA] to-[#FAFAFA]',
};
const DEFAULT_GRADIENT = 'from-[#F5F5F5] via-[#E9E9E9] to-[#FAFAFA]';

/** 案例卡片版式（规范 §5）：大图 → 项目名 → 地点·风格·面积 meta 行 → 造价行 */
function CaseCard({ item }: { item: ProjectCase }) {
  const { t } = useLanguage();
  const gradient = STYLE_GRADIENTS[item.style] ?? DEFAULT_GRADIENT;
  const initial = item.project_name.charAt(0);
  const hasImage = item.images.length > 0;

  const meta = [
    item.location,
    item.style === STYLE_PENDING
      ? t.cases.moreStyle
      : t.styles[item.style] ?? item.style,
    item.area !== null ? `${item.area} ㎡` : null,
  ]
    .filter(Boolean)
    .join(' · ');

  const cost = [
    item.hard_cost_per_sqm !== null
      ? `${t.pricing.hardCost} ¥${item.hard_cost_per_sqm.toLocaleString()}/㎡`
      : null,
    item.soft_cost_per_sqm !== null
      ? `${t.pricing.softCost} ¥${item.soft_cost_per_sqm.toLocaleString()}/㎡`
      : null,
  ]
    .filter(Boolean)
    .join(' · ');

  return (
    <Link href={`/cases/${item.id}/`} className="block h-full">
      <article className="group h-full border border-line bg-paper transition-colors hover:border-ink/30">
      {/* 封面：有图用实景照，无图用渐变 + 首字占位；hover 仅图片轻微缩放 1.03 */}
      <div
        className={`relative h-52 overflow-hidden bg-gradient-to-br ${gradient}`}
      >
        {hasImage ? (
          <img
            src={item.images[0]}
            alt={`${item.project_name} — ${item.style === STYLE_PENDING ? t.cases.moreStyle : t.styles[item.style] ?? item.style}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="select-none text-6xl font-semibold text-ink/10">
              {initial}
            </span>
          </div>
        )}

        {hasImage ? (
          <span className="absolute bottom-3 right-3 bg-white/85 px-2.5 py-0.5 text-[10px] tracking-widest text-ink-2">
            {t.cases.photoBadge(item.images.length)}
          </span>
        ) : (
          <span className="absolute bottom-3 right-3 bg-white/75 px-2 py-0.5 text-[10px] tracking-widest text-ink-3">
            {t.cases.comingSoon}
          </span>
        )}
      </div>

      <div className="p-5">
        <h3 className="text-base font-semibold text-ink transition-colors group-hover:text-accent">
          {item.project_name}
        </h3>
        <p className="mt-1 text-[13px] text-ink-2">{meta}</p>
        {cost && (
          <p className="mt-3 border-t border-line pt-3 text-[13px] tabular-nums text-ink">
            {cost}
          </p>
        )}
      </div>
      </article>
    </Link>
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
      {/* 风格筛选器（规范 §5 chips：1px line 直角小标签，激活 = accent 文字 + accent 描边，不填充） */}
      <div className="mb-10 flex flex-wrap justify-center gap-2">
        {STYLES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`border px-4 py-1.5 text-sm tracking-wider transition-colors ${
              filter === s
                ? 'border-accent text-accent'
                : 'border-line text-ink-2 hover:border-accent hover:text-accent'
            }`}
          >
            {t.styles[s] ?? s}
          </button>
        ))}
      </div>

      {/* 网格间距 24px（规范 §6） */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => (
          <CaseCard key={c.id} item={c} />
        ))}
      </div>

      <p className="mt-8 text-center text-xs text-ink-3">
        {t.cases.stats(filtered.length, photoCount)}
      </p>
    </div>
  );
}
