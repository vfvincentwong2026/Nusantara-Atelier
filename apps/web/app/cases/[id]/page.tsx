import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CaseDetail from '@/components/CaseDetail';
import { cases } from '@/lib/cases';
import { dictionaries } from '@/lib/i18n';
import { SITE_URL } from '@/lib/site';
import type { ProjectCase } from '@/lib/types';

export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((c) => ({ id: c.id }));
}

/** 印尼语描述句：项目名 + 风格 + 地点 + 面积（面向 Google Indonesia） */
function caseDescription(item: ProjectCase): string {
  const styleId = dictionaries.id.styles[item.style] ?? item.style;
  const parts = [
    `${item.project_name} — portofolio desain interior gaya ${styleId}`,
    item.location ? `di ${item.location}` : null,
    item.area !== null ? `${item.area} m²` : null,
  ].filter(Boolean);
  return (
    parts.join(' ') +
    `. Galeri foto lengkap dengan anotasi ruang oleh Nusantara Atelier.`
  );
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const item = cases.find((c) => c.id === params.id);
  if (!item) return { title: 'Case Study' };
  const description = caseDescription(item);
  const ogImage = item.images[0] ? `${SITE_URL}${item.images[0]}` : undefined;
  return {
    title: item.project_name,
    description,
    alternates: { canonical: `/cases/${item.id}/` },
    openGraph: {
      title: `${item.project_name} | Nusantara Atelier`,
      description,
      url: `/cases/${item.id}/`,
      images: ogImage
        ? [{ url: ogImage, alt: `${item.project_name} — foto interior` }]
        : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${item.project_name} | Nusantara Atelier`,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

/** 案例页 JSON-LD（CreativeWork，静态注入） */
function caseJsonLd(item: ProjectCase) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: item.project_name,
    description: caseDescription(item),
    image: item.images.map((src) => `${SITE_URL}${src}`),
    url: `${SITE_URL}/cases/${item.id}/`,
    areaServed: 'Indonesia',
    creator: {
      '@type': 'Organization',
      name: 'Nusantara Atelier',
      url: SITE_URL,
    },
  };
}

export default function CasePage({ params }: { params: { id: string } }) {
  const item = cases.find((c) => c.id === params.id);
  if (!item) notFound();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(caseJsonLd(item)) }}
      />
      <CaseDetail item={item} />
    </>
  );
}
