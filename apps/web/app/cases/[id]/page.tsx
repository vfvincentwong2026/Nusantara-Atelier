import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CaseDetail from '@/components/CaseDetail';
import { cases } from '@/lib/cases';

export const dynamicParams = false;

export function generateStaticParams() {
  return cases.map((c) => ({ id: c.id }));
}

export function generateMetadata({
  params,
}: {
  params: { id: string };
}): Metadata {
  const item = cases.find((c) => c.id === params.id);
  return {
    title: item
      ? `${item.project_name} · Nusantara Atelier`
      : 'Nusantara Atelier',
  };
}

export default function CasePage({ params }: { params: { id: string } }) {
  const item = cases.find((c) => c.id === params.id);
  if (!item) notFound();
  return <CaseDetail item={item} />;
}
