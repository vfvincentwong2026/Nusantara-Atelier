'use client';

import type { BomResult, BomLine } from '@/lib/bom';
import { useLanguage } from '@/components/LanguageProvider';
import type { Locale } from '@/lib/i18n';

function fmtIdr(n: number) {
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
}
function fmtQty(n: number) {
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}
function pickName(l: BomLine, locale: Locale): string {
  if (locale === 'zh') return l.name.zh;
  if (locale === 'en') return l.name.en;
  return l.name.id;
}

/** BOM 精确物料清单视图（/upload 结果区「BOM 精报」标签页） */
export default function BomView({ bom }: { bom: BomResult }) {
  const { t, locale } = useLanguage();
  const tb = t.bom;

  // 按大类分组（保持引擎输出顺序）
  const groups: { cat: string; items: BomLine[] }[] = [];
  for (const l of bom.bom) {
    const g = groups.find((x) => x.cat === l.category);
    if (g) g.items.push(l);
    else groups.push({ cat: l.category, items: [l] });
  }
  const catLabel = (c: string) =>
    c === 'extras' ? tb.extrasLabel : t.materialsPage.categories[c] ?? c;

  const diff = bom.estimate_anchor.diff_pct;
  const diffText =
    diff > 0 ? tb.anchorHigher(diff) : diff < 0 ? tb.anchorLower(diff) : null;

  return (
    <div className="mt-4">
      {groups.map((g) => {
        const groupSub = g.items.reduce((s, l) => s + l.subtotal_idr, 0);
        return (
          <details
            key={g.cat}
            open
            className="mb-3 rounded-lg border border-ivory/10 bg-white/60"
          >
            <summary className="flex cursor-pointer items-baseline justify-between px-4 py-2.5 text-xs tracking-widest text-ivory-dim hover:text-gold-dark">
              <span>
                {catLabel(g.cat)}
                <span className="ml-2 text-[10px] text-ivory-mute">
                  {tb.itemCount(g.items.length)}
                </span>
              </span>
              <span className="text-gold-dark">{fmtIdr(groupSub)}</span>
            </summary>
            <div className="divide-y divide-ivory/5 border-t border-ivory/10">
              {g.items.map((l, i) => (
                <div
                  key={i}
                  className="flex items-baseline justify-between gap-3 px-4 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-ivory">
                      {pickName(l, locale)}
                    </p>
                    <p className="mt-0.5 text-[10px] text-ivory-mute">
                      {[l.brand, l.spec].filter(Boolean).join(' · ')}
                      {' · '}
                      {tb.scopes[l.room_scope] ?? l.room_scope}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-ivory-mute">
                      {fmtQty(l.quantity)} {l.unit} × {fmtIdr(l.unit_price_idr)}
                    </p>
                    <p className="text-xs font-medium text-ivory">
                      {fmtIdr(l.subtotal_idr)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </details>
        );
      })}

      {/* 人工 + 合计 + 估算对照 */}
      <div className="mt-4 space-y-2 border-t border-ivory/10 pt-4 text-xs">
        <div className="flex items-baseline justify-between">
          <span className="text-ivory-dim">{tb.labor}</span>
          <span className="text-ivory">{fmtIdr(bom.labor.total_idr)}</span>
        </div>
        <div className="flex items-baseline justify-between border-t border-ivory/10 pt-3">
          <span className="tracking-widest text-ivory-dim">{tb.total}</span>
          <span className="font-serif text-xl text-gold-dark">
            {fmtIdr(bom.total_idr)}
          </span>
        </div>
        {diffText && (
          <p className="text-[11px] text-ivory-mute">
            {diffText}
            {Math.abs(diff) > 25 && (
              <span className="mt-1 block text-gold-dark">{tb.surveyHint}</span>
            )}
          </p>
        )}
        <p className="pt-2 text-pretty text-[11px] leading-relaxed text-ivory-mute">
          {tb.disclaimer}
        </p>
      </div>
    </div>
  );
}
