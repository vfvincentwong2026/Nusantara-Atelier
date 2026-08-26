'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import { useLanguage } from '@/components/LanguageProvider';
import { STYLES } from '@/lib/types';
import { API_BASE, MAX_UPLOAD_MB } from '@/lib/site';
import {
  computeQuote,
  isValidArea,
  type RegionKey,
  type TierKey,
} from '@/lib/quote';

const STYLE_OPTIONS = STYLES.filter((s) => s !== '全部' && s !== '更多');
const REGION_KEYS: RegionKey[] = ['jakarta', 'bali', 'surabaya', 'other'];
const TIER_KEYS: TierKey[] = ['standard', 'luxury', 'ultra'];

function formatIdr(n: number) {
  return `Rp ${Math.round(n).toLocaleString('id-ID')}`;
}
function formatUsd(n: number) {
  return `US$ ${Math.round(n).toLocaleString('en-US')}`;
}
function formatRmb(n: number) {
  return `¥${Math.round(n).toLocaleString('zh-CN')}`;
}

const inputCls =
  'w-full rounded-md border border-ivory/15 bg-white px-4 py-2.5 text-sm text-ivory outline-none transition-colors focus:border-gold';
const labelCls = 'mb-1.5 block text-xs tracking-widest text-ivory-mute';

export default function UploadPage() {
  const { t, locale } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState<string>('现代');
  const [areaText, setAreaText] = useState('');
  const [rooms, setRooms] = useState('3');
  const [floors, setFloors] = useState('2');
  const [tier, setTier] = useState<TierKey>('standard');
  const [region, setRegion] = useState<RegionKey>('jakarta');
  const [pool, setPool] = useState(false);
  const [garden, setGarden] = useState(false);

  // DXF 解析结果
  const [dxfRooms, setDxfRooms] = useState<
    { name: string; width: number; depth: number; area: number }[] | null
  >(null);
  const [dxfError, setDxfError] = useState(false);
  const [fileTooBig, setFileTooBig] = useState(false);

  // AI 设计建议
  const [designStatus, setDesignStatus] = useState<
    'idle' | 'loading' | 'ok' | 'error'
  >('idle');
  const [designText, setDesignText] = useState('');

  /** 文件选择：>10MB 直接拒绝；dxf 走解析接口并自动填面积；其余本地预览 */
  const handleFile = async (f: File | null) => {
    setDxfRooms(null);
    setDxfError(false);
    setFileTooBig(false);
    if (f && f.size > MAX_UPLOAD_MB * 1024 * 1024) {
      setFile(null);
      setFileTooBig(true);
      return;
    }
    setFile(f);
    if (!f || !f.name.toLowerCase().endsWith('.dxf')) return;
    try {
      const text = await f.text();
      const res = await fetch(`${API_BASE}/parse-dxf`, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain' },
        body: text,
      });
      const json = await res.json();
      if (!json.success || !json.data.rooms.length) throw new Error('parse failed');
      setDxfRooms(json.data.rooms);
      setAreaText(String(Math.round(json.data.total_area)));
      setRooms(String(Math.min(Math.max(json.data.rooms.length, 1), 10)));
    } catch {
      setDxfError(true);
    }
  };

  const area = Number(areaText);
  const areaValid = areaText !== '' && isValidArea(area);
  const areaInvalid = areaText !== '' && !isValidArea(area);

  const previewUrl = useMemo(
    () =>
      file && file.type.startsWith('image/')
        ? URL.createObjectURL(file)
        : null,
    [file]
  );

  const quote = useMemo(
    () =>
      areaValid
        ? computeQuote({ area, style, tier, region, pool, garden })
        : null,
    [areaValid, area, style, tier, region, pool, garden]
  );

  // AI 设计建议：输入稳定 2s 后调 POST /design（失败静默，不显示板块）
  useEffect(() => {
    if (!areaValid) {
      setDesignStatus('idle');
      return;
    }
    setDesignStatus('loading');
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/design`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            style,
            area,
            rooms: Number(rooms),
            floors: Number(floors),
            tier,
            locale,
          }),
        });
        const json = await res.json();
        if (!json.success) throw new Error('design failed');
        setDesignText(json.data.design_description);
        setDesignStatus('ok');
      } catch {
        setDesignStatus('error');
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [areaValid, area, style, rooms, floors, tier, locale]);
  useEffect(() => {
    if (!areaValid) return;
    const timer = setTimeout(() => {
      fetch(`${API_BASE}/quote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          area,
          style,
          tier,
          location: region,
          rooms: Number(rooms),
          floors: Number(floors),
          has_pool: pool,
          has_garden: garden,
          locale,
        }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, [areaValid, area, style, tier, region, rooms, floors, pool, garden, locale]);

  return (
    <main className="min-h-screen bg-ink pb-24">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 pt-28">
        <p className="section-eyebrow">{t.quote.eyebrow}</p>
        <h1 className="mt-4 font-serif text-3xl text-balance text-ivory md:text-4xl">
          {t.quote.title}
        </h1>
        <p className="mt-3 text-pretty text-sm text-ivory-dim">{t.quote.pageSub}</p>
        <div className="gold-divider mt-6" />

        <div className="mt-10 grid gap-8 lg:grid-cols-5">
          {/* ========== 表单 ========== */}
          <div className="space-y-6 lg:col-span-3">
            {/* 文件上传（纯本地预览） */}
            <div>
              <label className={labelCls}>{t.quote.uploadLabel}</label>
              <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border border-dashed border-ivory/20 bg-ink-800 px-6 py-8 text-center transition-colors hover:border-gold/60">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="preview"
                    className="max-h-48 rounded object-contain"
                  />
                ) : file ? (
                  <p className="text-sm text-ivory-dim">📄 {file.name}</p>
                ) : (
                  <p className="text-sm text-ivory-mute">
                    {t.quote.uploadButton}
                  </p>
                )}
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,.dxf"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-2 text-xs text-ivory-mute">
                🔒 {t.quote.uploadHint}
              </p>
              {fileTooBig && (
                <p className="mt-2 text-xs text-red-700">
                  {t.quote.fileTooBig}
                </p>
              )}
              {dxfError && (
                <p className="mt-2 text-xs text-red-700">{t.dxf.failed}</p>
              )}
              {dxfRooms && (
                <div className="mt-3 rounded-md border border-gold/30 bg-white p-4">
                  <p className="text-xs text-gold-dark">
                    {t.dxf.parsed(
                      dxfRooms.length,
                      dxfRooms.reduce((s, r) => s + r.area, 0)
                    )}
                  </p>
                  <ul className="mt-2 space-y-1 text-xs text-ivory-dim">
                    {dxfRooms.map((r, i) => (
                      <li key={i}>
                        {r.name} — {r.width} × {r.depth} m · {r.area} ㎡
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className={labelCls}>{t.quote.styleLabel}</label>
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className={inputCls}
                >
                  {STYLE_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {t.styles[s] ?? s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.quote.areaLabel}</label>
                <input
                  type="number"
                  min={50}
                  max={5000}
                  value={areaText}
                  placeholder={t.quote.areaPlaceholder}
                  onChange={(e) => setAreaText(e.target.value)}
                  className={inputCls}
                />
                {areaInvalid && (
                  <p className="mt-1.5 text-xs text-red-700">
                    {t.quote.areaError}
                  </p>
                )}
              </div>
              <div>
                <label className={labelCls}>{t.quote.roomsLabel}</label>
                <select
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className={inputCls}
                >
                  {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.quote.floorsLabel}</label>
                <select
                  value={floors}
                  onChange={(e) => setFloors(e.target.value)}
                  className={inputCls}
                >
                  {Array.from({ length: 5 }, (_, i) => i + 1).map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.quote.tierLabel}</label>
                <select
                  value={tier}
                  onChange={(e) => setTier(e.target.value as TierKey)}
                  className={inputCls}
                >
                  {TIER_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {t.quote.tiers[k]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{t.quote.regionLabel}</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value as RegionKey)}
                  className={inputCls}
                >
                  {REGION_KEYS.map((k) => (
                    <option key={k} value={k}>
                      {t.quote.regions[k]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelCls}>{t.quote.extrasLabel}</label>
              <div className="flex flex-wrap gap-3">
                {(
                  [
                    [pool, setPool, t.quote.pool],
                    [garden, setGarden, t.quote.garden],
                  ] as const
                ).map(([checked, setter, text]) => (
                  <button
                    key={text}
                    type="button"
                    onClick={() => setter(!checked)}
                    className={`rounded-full border px-4 py-1.5 text-sm tracking-wider transition-colors ${
                      checked
                        ? 'border-gold bg-gold text-white'
                        : 'border-ivory/20 text-ivory-dim hover:border-gold/60 hover:text-gold-dark'
                    }`}
                  >
                    {text}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ========== 结果区 ========== */}
          <div className="lg:col-span-2">
            <div className="rounded-xl border border-gold/25 bg-gradient-to-br from-ink-800 to-ink-700 p-8 lg:sticky lg:top-24">
              <p className="section-eyebrow">{t.quote.resultTitle}</p>
              {quote ? (
                <>
                  <p className="mt-4 font-serif text-3xl text-gold-dark md:text-4xl">
                    {formatIdr(quote.totalIdr)}
                  </p>
                  <p className="mt-2 text-sm text-ivory-dim">
                    ≈ {formatUsd(quote.totalUsd)} · {formatRmb(quote.totalRmb)}
                  </p>

                  <div className="mt-6 border-t border-ivory/10 pt-6">
                    <p className="mb-3 text-xs tracking-widest text-ivory-mute">
                      {t.quote.breakdownTitle}
                    </p>
                    <div className="space-y-3">
                      {quote.breakdown.map((b) => (
                        <div key={b.key}>
                          <div className="flex items-baseline justify-between text-xs">
                            <span className="text-ivory-dim">
                              {t.quote.breakdown[b.key]}
                            </span>
                            <span className="text-right">
                              <span className="text-ivory">
                                {formatIdr(b.amountIdr)}
                              </span>
                              <span className="ml-2 text-[10px] text-ivory-mute">
                                {formatRmb(b.amountRmb)}
                              </span>
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-ivory/10">
                            <div
                              className="h-full rounded-full bg-gold"
                              style={{
                                width: `${(b.amountRmb / quote.totalRmb) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {quote.referenceCase && (
                    <Link
                      href={`/cases/${quote.referenceCase.id}/`}
                      className="mt-6 flex items-center gap-4 rounded-lg border border-ivory/10 bg-white p-3 transition-colors hover:border-gold/50"
                    >
                      {quote.referenceCase.images[0] && (
                        <img
                          src={quote.referenceCase.images[0]}
                          alt={quote.referenceCase.project_name}
                          loading="lazy"
                          className="h-14 w-20 rounded object-cover"
                        />
                      )}
                      <div>
                        <p className="text-xs text-ivory-mute">
                          {t.quote.refCase(quote.referenceCase.project_name)}
                        </p>
                        <p className="mt-1 text-xs text-gold-dark">
                          {t.quote.viewCase}
                        </p>
                      </div>
                    </Link>
                  )}

                  <p className="mt-6 text-pretty text-xs leading-relaxed text-ivory-mute">
                    {t.quote.disclaimer}
                  </p>
                  <Link
                    href="/booking"
                    className="mt-6 block rounded-full bg-gold px-8 py-3 text-center text-sm font-medium tracking-widest text-white transition-colors hover:bg-gold-light"
                  >
                    {t.quote.ctaBook}
                  </Link>
                </>
              ) : (
                <p className="mt-6 text-sm text-ivory-mute">
                  {t.quote.resultHint}
                </p>
              )}
            </div>

            {/* ========== AI 设计建议 ========== */}
            {designStatus === 'loading' && (
              <div className="mt-6 rounded-xl border border-ivory/10 bg-ink-800 p-8">
                <p className="section-eyebrow">{t.design.title}</p>
                <p className="mt-4 flex items-center gap-3 text-sm text-ivory-mute">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gold border-t-transparent" />
                  {t.design.loading}
                </p>
              </div>
            )}
            {designStatus === 'ok' && (
              <div className="mt-6 rounded-xl border border-ivory/10 bg-ink-800 p-8">
                <p className="section-eyebrow">{t.design.title}</p>
                <div className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ivory-dim">
                  {designText}
                </div>
              </div>
            )}
            {designStatus === 'error' && (
              <p className="mt-6 text-xs text-ivory-mute">{t.design.failed}</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
