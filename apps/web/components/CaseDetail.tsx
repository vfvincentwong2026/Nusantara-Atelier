'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import SiteHeader from '@/components/SiteHeader';
import { IconChevronLeft, IconChevronRight, IconClose } from '@/components/icons';
import type { ProjectCase, RoomAnnotation, RoomType } from '@/lib/types';

interface GalleryItem {
  src: string;
  annotation?: RoomAnnotation;
}

export default function CaseDetail({ item }: { item: ProjectCase }) {
  const { t, locale } = useLanguage();
  const [spaceFilter, setSpaceFilter] = useState<RoomType | 'all'>('all');
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  /** 图片 + 标注配对（annotations 按文件名索引） */
  const allItems = useMemo<GalleryItem[]>(
    () =>
      item.images.map((src) => {
        const fname = src.split('/').pop() ?? '';
        return { src, annotation: item.annotations?.[fname] };
      }),
    [item]
  );

  /** 空间 chips：按 room 聚合计数（含 plan），按数量降序 */
  const spaceChips = useMemo<[RoomType, number][]>(() => {
    const counts = new Map<RoomType, number>();
    for (const it of allItems) {
      if (!it.annotation) continue;
      const r = it.annotation.room;
      counts.set(r, (counts.get(r) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [allItems]);

  const filtered = useMemo(
    () =>
      spaceFilter === 'all'
        ? allItems
        : allItems.filter((it) => it.annotation?.room === spaceFilter),
    [allItems, spaceFilter]
  );

  const safeIndex = Math.min(index, filtered.length - 1);
  const current = filtered[safeIndex];

  const go = useCallback(
    (delta: number) => {
      setIndex((i) => {
        const base = Math.min(i, filtered.length - 1);
        return (base + delta + filtered.length) % filtered.length;
      });
    },
    [filtered.length]
  );

  // 灯箱键盘交互：← / → / Esc
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, go]);

  const applyFilter = (f: RoomType | 'all') => {
    setSpaceFilter(f);
    setIndex(0);
  };

  /** 详情页 meta（规范 §5）：ArchDaily 式定义行 —— 标签 ink-3 + 值 ink，行间 1px 线 */
  const metaRows: [string, string][] = (
    [
      item.location ? [t.bookingForm.location, item.location] : null,
      [t.bookingForm.style, t.styles[item.style] ?? item.style],
      item.area !== null ? [t.bookingForm.area, `${item.area} ㎡`] : null,
      item.hard_cost_per_sqm !== null
        ? [
            t.pricing.hardCost,
            `¥${item.hard_cost_per_sqm.toLocaleString()}/㎡`,
          ]
        : null,
      item.soft_cost_per_sqm !== null
        ? [
            t.pricing.softCost,
            `¥${item.soft_cost_per_sqm.toLocaleString()}/㎡`,
          ]
        : null,
    ] as ([string, string] | null)[]
  ).filter((r): r is [string, string] => r !== null);

  const chipCls = (active: boolean) =>
    `shrink-0 border px-4 py-1.5 text-sm tracking-wider transition-colors ${
      active
        ? 'border-accent text-accent'
        : 'border-line text-ink-2 hover:border-accent hover:text-accent'
    }`;

  return (
    <main className="min-h-screen bg-paper pb-24">
      <SiteHeader />

      {/* ========== 头部 ========== */}
      <div className="mx-auto max-w-[1200px] px-6 pt-28">
        <Link
          href="/#cases"
          className="text-sm tracking-widest text-ink-3 transition-colors hover:text-accent"
        >
          {t.detail.back}
        </Link>
        <h1 className="mt-6 text-3xl font-semibold tracking-[-0.02em] text-balance text-ink md:text-[40px]">
          {item.project_name}
        </h1>
        <dl className="mt-8 max-w-2xl border-t border-line">
          {metaRows.map(([k, v]) => (
            <div
              key={k}
              className="flex gap-6 border-b border-line py-2.5 text-sm"
            >
              <dt className="w-20 shrink-0 text-ink-3">{k}</dt>
              <dd className="tabular-nums text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        {item.description && (
          <p className="mt-4 text-sm text-ink-2">{item.description}</p>
        )}
      </div>

      {/* ========== 空间筛选 ========== */}
      {spaceChips.length > 0 && (
        <div className="mx-auto mt-10 max-w-[1200px] px-6">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button onClick={() => applyFilter('all')} className={chipCls(spaceFilter === 'all')}>
              {t.detail.allSpaces} · {allItems.length}
            </button>
            {spaceChips.map(([room, n]) => (
              <button
                key={room}
                onClick={() => applyFilter(room)}
                className={chipCls(spaceFilter === room)}
              >
                {t.rooms[room]} · {n}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========== 主图 + 标注 ========== */}
      {current && (
        <div className="mx-auto mt-8 max-w-[1200px] px-6">
          <button
            onClick={() => setLightbox(true)}
            className="group relative block w-full overflow-hidden border border-line bg-paper-soft"
            aria-label="open lightbox"
          >
            <img
              src={current.src}
              alt={item.project_name}
              className="max-h-[70vh] w-full object-cover transition-transform duration-500 group-hover:scale-[1.01]"
            />
          </button>

          <div className="mt-4 flex items-start justify-between gap-4">
            <div className="min-h-[3rem]">
              {current.annotation && (
                <>
                  <span className="border border-line bg-paper px-3 py-1 text-[11px] tracking-widest text-ink-2">
                    {t.rooms[current.annotation.room]}
                  </span>
                  <p className="mt-2 text-sm leading-relaxed text-ink-2">
                    {current.annotation.desc[locale]}
                  </p>
                </>
              )}
            </div>
            <span className="shrink-0 font-mono text-xs tracking-widest tabular-nums text-ink-3">
              {safeIndex + 1} / {filtered.length}
            </span>
          </div>

          {/* 缩略图条 */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">
            {filtered.map((it, i) => (
              <button
                key={it.src}
                onClick={() => setIndex(i)}
                className={`h-16 w-24 shrink-0 overflow-hidden border transition-all ${
                  i === safeIndex
                    ? 'border-accent'
                    : 'border-line opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={it.src}
                  alt=""
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ========== 底部 CTA ========== */}
      <div className="mx-auto mt-24 max-w-3xl px-6 text-center">
        <h2 className="text-2xl font-semibold text-ink md:text-3xl">
          {t.detail.likeTitle}
        </h2>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/booking"
            className="w-full bg-accent px-8 py-3 text-sm font-medium tracking-widest text-white transition-colors hover:bg-accent-dark sm:w-auto"
          >
            {t.booking.title}
          </Link>
          <Link
            href="/upload"
            className="w-full border border-ink px-8 py-3 text-sm tracking-widest text-ink transition-colors hover:border-accent hover:text-accent sm:w-auto"
          >
            {t.estimate.cta}
          </Link>
        </div>
      </div>

      {/* ========== 灯箱（媒体 overlay，保留深色底） ========== */}
      {lightbox && current && (
        <div
          className="fixed inset-0 z-[60] flex flex-col bg-black/95"
          onClick={() => setLightbox(false)}
        >
          <div className="flex items-center justify-between px-6 py-4">
            <span className="font-mono text-xs tracking-widest tabular-nums text-white/60">
              {safeIndex + 1} / {filtered.length}
            </span>
            <button
              onClick={() => setLightbox(false)}
              className="border border-white/25 p-2 text-white/80 transition-colors hover:border-accent hover:text-accent"
              aria-label="close"
            >
              <IconClose className="h-4 w-4" />
            </button>
          </div>

          <div
            className="relative flex flex-1 items-center justify-center px-14"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => go(-1)}
              className="absolute left-3 border border-white/25 p-2 text-white/80 transition-colors hover:border-accent hover:text-accent md:left-6"
              aria-label="previous"
            >
              <IconChevronLeft className="h-5 w-5" />
            </button>
            <img
              src={current.src}
              alt={item.project_name}
              className="max-h-[70vh] max-w-full object-contain"
            />
            <button
              onClick={() => go(1)}
              className="absolute right-3 border border-white/25 p-2 text-white/80 transition-colors hover:border-accent hover:text-accent md:right-6"
              aria-label="next"
            >
              <IconChevronRight className="h-5 w-5" />
            </button>
          </div>

          {current.annotation && (
            <div
              className="px-6 pb-8 pt-2 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="border border-accent/70 px-3 py-1 text-[11px] tracking-widest text-accent">
                {t.rooms[current.annotation.room]}
              </span>
              <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
                {current.annotation.desc[locale]}
              </p>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
