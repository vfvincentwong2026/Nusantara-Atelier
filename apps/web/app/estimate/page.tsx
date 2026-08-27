'use client';

/* P1 quick_estimate 内部演示页（/estimate）
 * 纯前端即时计算：quickEstimate 是纯函数，随 bundle 打包，无 API 依赖。
 * 视觉语言延续 upload 页：paper/ink/line/accent + section-eyebrow。
 * 注意：本页为内部演示，顶部琥珀色条明示「数据校对中」，不对外。
 */
import { useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import { useLanguage } from '@/components/LanguageProvider';
import { quickEstimate, getProcess, getLabor } from '@/lib/estimate';
import type { EstimateOutput } from '@/lib/estimate';
import { IDR_USD } from '@/lib/quote';
import type { Locale } from '@/lib/i18n';

const STYLE_IDS = ['french', 'modern', 'wabi-sabi', 'italian-minimal', 'modern-cream'];
const SPACE_IDS = ['living', 'dining', 'kitchen', 'bedroom', 'bathroom', 'study'];
const LOCATION_IDS = ['jakarta', 'bali'];
const TIER_IDS = ['standard', 'premium', 'luxury'];

/** 部位元素名（内部演示页小字典，量级太小不入 i18n 主文件） */
const ELEMENT_NAMES: Record<Locale, Record<string, string>> = {
  zh: { floor: '地面', wall: '墙面', ceiling: '吊顶', bathroom: '卫浴墙地', feature_wall: '背景墙' },
  en: { floor: 'Floor', wall: 'Wall', ceiling: 'Ceiling', bathroom: 'Bath F&W', feature_wall: 'Feature wall' },
  id: { floor: 'Lantai', wall: 'Dinding', ceiling: 'Plafon', bathroom: 'KM L&D', feature_wall: 'Dinding fokus' },
};

function formatIdr(n: number) {
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
}
function formatUsd(n: number) {
  return `US$ ${Math.round(n / IDR_USD).toLocaleString('en-US')}`;
}

const inputCls =
  'w-full border border-line bg-white px-4 py-2.5 text-sm text-ink outline-none transition-colors focus:border-accent';
const labelCls = 'mb-1.5 block text-xs tracking-widest text-ink-3';

export default function EstimateDemoPage() {
  const { t, locale } = useLanguage();
  const d = t.estimateDemo;

  const [style, setStyle] = useState('french');
  const [area, setArea] = useState(200);
  const [spaces, setSpaces] = useState<string[]>([
    'living',
    'dining',
    'kitchen',
    'bedroom',
    'bathroom',
  ]);
  const [location, setLocation] = useState('jakarta');
  const [tier, setTier] = useState('premium');
  const [ramadan, setRamadan] = useState(false);

  const [result, setResult] = useState<EstimateOutput | null>(null);
  const [error, setError] = useState('');

  const toggleSpace = (s: string) =>
    setSpaces((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );

  const run = () => {
    try {
      setError('');
      setResult(
        quickEstimate({
          style,
          area,
          spaces,
          location,
          tier: tier as 'standard' | 'premium' | 'luxury',
          ramadan,
        })
      );
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  /** 工序显示名：KG 节点中文/英文名，缺节点回落 id */
  const processName = (id: string) => {
    const p = getProcess(id);
    if (!p) return id;
    return locale === 'zh' ? p.name.zh ?? p.name.en ?? id : p.name.en ?? id;
  };
  const crewName = (id: string | null) => {
    if (!id) return '—';
    const l = getLabor(id);
    if (!l) return id;
    return locale === 'zh' ? l.name.zh ?? id : l.name.en ?? id;
  };
  const elementName = (el: string) => {
    const prereq = el.includes('前置') || el.includes('prereq');
    const base = el.replace(/\(.*\)/, '');
    const name = ELEMENT_NAMES[locale][base] ?? base;
    return prereq ? `${name}${d.prereqMark}` : name;
  };

  return (
    <main className="min-h-screen bg-paper pb-24">
      <SiteHeader />

      {/* 内部演示警示条（琥珀色，明示数据校对中） */}
      <div className="border-b border-amber-300 bg-amber-50 px-6 py-2.5 pt-24 text-center text-xs tracking-widest text-amber-800">
        ⚠ {d.badge}
      </div>

      <div className="mx-auto max-w-[1200px] px-6 pt-10">
        <p className="section-eyebrow">{d.eyebrow}</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.02em] text-ink md:text-4xl">
          {d.title}
        </h1>
        <p className="mt-3 max-w-3xl text-pretty text-sm leading-relaxed text-ink-2">
          {d.pageSub}
        </p>

        {/* ========== 输入区 ========== */}
        <div className="mt-10 border border-line bg-paper-soft p-6 md:p-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelCls}>{d.styleLabel}</label>
              <select value={style} onChange={(e) => setStyle(e.target.value)} className={inputCls}>
                {STYLE_IDS.map((s) => (
                  <option key={s} value={s}>
                    {d.styleNames[s] ?? s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>
                {d.areaLabel} — {area} ㎡
              </label>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={area}
                onChange={(e) => setArea(Number(e.target.value))}
                className="mt-3 w-full accent-accent"
              />
            </div>
            <div>
              <label className={labelCls}>{d.locationLabel}</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)} className={inputCls}>
                {LOCATION_IDS.map((l) => (
                  <option key={l} value={l}>
                    {d.locationNames[l] ?? l}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>{d.tierLabel}</label>
              <select value={tier} onChange={(e) => setTier(e.target.value)} className={inputCls}>
                {TIER_IDS.map((k) => (
                  <option key={k} value={k}>
                    {d.tierNames[k] ?? k}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6">
            <label className={labelCls}>{d.spacesLabel}</label>
            <div className="flex flex-wrap gap-3">
              {SPACE_IDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSpace(s)}
                  className={`border px-4 py-1.5 text-sm tracking-wider transition-colors ${
                    spaces.includes(s)
                      ? 'border-accent text-accent'
                      : 'border-line text-ink-2 hover:border-accent hover:text-accent'
                  }`}
                >
                  {d.spaceNames[s] ?? s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-2">
              <input
                type="checkbox"
                checked={ramadan}
                onChange={(e) => setRamadan(e.target.checked)}
                className="h-4 w-4 accent-accent"
              />
              {d.ramadanLabel}
            </label>
            <button
              type="button"
              onClick={run}
              disabled={spaces.length === 0}
              className="bg-accent px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-accent-dark disabled:cursor-not-allowed disabled:opacity-40"
            >
              {d.submit}
            </button>
          </div>
          {error && (
            <p className="mt-4 text-sm text-accent">
              {d.errorGeneric}
              {error}
            </p>
          )}
        </div>

        {/* ========== 结果区 ========== */}
        {result ? (
          <div className="mt-10 space-y-8">
            {/* 总价区间卡 + 工期 + 置信度 */}
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="border border-line bg-paper p-8 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <p className="section-eyebrow">{d.totalRange}</p>
                  <span
                    className={`border px-2.5 py-1 text-xs tracking-widest ${
                      result.confidence === 'low'
                        ? 'border-amber-300 bg-amber-50 text-amber-800'
                        : 'border-line text-ink-2'
                    }`}
                  >
                    {d.confidenceLabel}：{result.confidence === 'low' ? d.confidenceLow : d.confidenceMedium}
                  </span>
                </div>
                <p className="mt-4 text-3xl font-semibold tabular-nums text-ink md:text-4xl">
                  {formatIdr(result.total_idr.mid)}
                </p>
                <p className="mt-2 text-sm tabular-nums text-ink-2">
                  {formatIdr(result.total_idr.low)} — {formatIdr(result.total_idr.high)}
                </p>
                <p className="mt-1 text-xs tabular-nums text-ink-3">
                  ≈ {formatUsd(result.total_idr.mid)}（{d.usdRef}）
                </p>
                <div className="mt-6 border-t border-line pt-4">
                  <p className="text-xs tracking-widest text-ink-3">{d.perSqm}</p>
                  <p className="mt-1 text-lg tabular-nums text-ink">
                    {formatIdr(result.per_sqm_idr.mid)}
                    <span className="ml-2 text-sm text-ink-3">
                      {formatIdr(result.per_sqm_idr.low)} — {formatIdr(result.per_sqm_idr.high)}
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* 工期条 */}
                <div className="border border-line bg-paper p-6">
                  <p className="section-eyebrow">{d.timelineTitle}</p>
                  <p className="mt-4 text-2xl font-semibold tabular-nums text-ink">
                    {result.timeline_days.likely}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-xs tabular-nums text-ink-2">
                    <span>{d.timelineMin} {result.timeline_days.min}</span>
                    <div className="relative h-1 flex-1 bg-line">
                      <div className="absolute left-1/2 top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 bg-accent" />
                    </div>
                    <span>{d.timelineMax} {result.timeline_days.max}</span>
                  </div>
                </div>
                {/* 班组配置 */}
                <div className="border border-line bg-paper p-6">
                  <p className="section-eyebrow">{d.crewTitle}</p>
                  <ul className="mt-4 space-y-2">
                    {result.crew_plan.map((c) => (
                      <li key={c.labor} className="flex items-baseline justify-between text-sm">
                        <span className="text-ink-2">{crewName(c.labor)}</span>
                        <span className="tabular-nums text-ink">{d.crewDays(c.days)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* 逐工序明细表 */}
            <div className="border border-line bg-paper p-6 md:p-8">
              <p className="section-eyebrow">{d.breakdownTitle}</p>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[880px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-line text-ink-3">
                      <th className="py-2 pr-3 font-medium">{d.colSpace}</th>
                      <th className="py-2 pr-3 font-medium">{d.colElement}</th>
                      <th className="py-2 pr-3 text-right font-medium">{d.colQty}</th>
                      <th className="py-2 pr-3 text-right font-medium">{d.colMaterial}</th>
                      <th className="py-2 pr-3 text-right font-medium">{d.colLabor}</th>
                      <th className="py-2 pr-3 text-right font-medium">{d.colAux}</th>
                      <th className="py-2 pr-3 text-right font-medium">{d.colDays}</th>
                      <th className="py-2 font-medium">{d.colCrew}</th>
                    </tr>
                  </thead>
                  <tbody className="tabular-nums text-ink-2">
                    {result.breakdown.map((b, i) => (
                      <tr key={i} className="border-b border-line/60">
                        <td className="py-2 pr-3">{d.spaceNames[b.space] ?? b.space}</td>
                        <td className="py-2 pr-3">
                          {elementName(b.element)} · {processName(b.process)}
                        </td>
                        <td className="py-2 pr-3 text-right">
                          {b.qty} {b.unit}
                        </td>
                        <td className="py-2 pr-3 text-right">{formatIdr(b.material_cost_idr)}</td>
                        <td className="py-2 pr-3 text-right">{formatIdr(b.labor_cost_idr)}</td>
                        <td className="py-2 pr-3 text-right">{formatIdr(b.aux_cost_idr)}</td>
                        <td className="py-2 pr-3 text-right">{b.days}</td>
                        <td className="py-2">{crewName(b.crew)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* data_gaps 警示区（琥珀色，诚实卖点） */}
            {result.data_gaps.length > 0 && (
              <div className="border border-amber-300 bg-amber-50 p-6 md:p-8">
                <p className="text-xs font-medium uppercase tracking-[0.12em] text-amber-800">
                  ⚠ {d.gapsTitle}
                </p>
                <p className="mt-2 text-xs text-amber-700">{d.gapsSub}</p>
                <ul className="mt-4 list-inside list-disc space-y-1.5 text-sm text-amber-900">
                  {result.data_gaps.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          !error && <p className="mt-10 text-sm text-ink-3">{d.resultHint}</p>
        )}
      </div>
    </main>
  );
}
