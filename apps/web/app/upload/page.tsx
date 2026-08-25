'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import SiteHeader from '@/components/SiteHeader';
import { useLanguage } from '@/components/LanguageProvider';
import { STYLES } from '@/lib/types';
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
  const { t } = useLanguage();

  const [file, setFile] = useState<File | null>(null);
  const [style, setStyle] = useState<string>('现代');
  const [areaText, setAreaText] = useState('');
  const [rooms, setRooms] = useState('3');
  const [floors, setFloors] = useState('2');
  const [tier, setTier] = useState<TierKey>('standard');
  const [region, setRegion] = useState<RegionKey>('jakarta');
  const [pool, setPool] = useState(false);
  const [garden, setGarden] = useState(false);

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

  return (
    <main className="min-h-screen bg-ink pb-24">
      <SiteHeader />

      <div className="mx-auto max-w-6xl px-6 pt-28">
        <p className="section-eyebrow">{t.quote.eyebrow}</p>
        <h1 className="mt-4 font-serif text-3xl text-ivory md:text-4xl">
          {t.quote.title}
        </h1>
        <p className="mt-3 text-sm text-ivory-dim">{t.quote.pageSub}</p>
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
                  accept=".jpg,.jpeg,.png,.pdf"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
              </label>
              <p className="mt-2 text-xs text-ivory-mute">
                🔒 {t.quote.uploadHint}
              </p>
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
                          <div className="flex justify-between text-xs text-ivory-dim">
                            <span>{t.quote.breakdown[b.key]}</span>
                            <span>{formatRmb(b.amountRmb)}</span>
                          </div>
                          <div className="mt-1 h-1.5 rounded-full bg-ivory/10">
                            <div
                              className="h-full rounded-full bg-gold"
                              style={{ width: `${b.ratio * 100}%` }}
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

                  <p className="mt-6 text-xs leading-relaxed text-ivory-mute">
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
          </div>
        </div>
      </div>
    </main>
  );
}
