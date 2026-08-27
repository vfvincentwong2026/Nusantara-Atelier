import type { Metadata } from 'next';

/** /materials 为 client component，独立元数据由本 server layout 提供（静态 HTML head 可见） */
export const metadata: Metadata = {
  title: 'Pustaka Material & Harga Transparan',
  description:
    'Pustaka material Nusantara Atelier: harga pasar Indonesia per SKU untuk lantai, dinding, sanitary, pencahayaan, dan custom cabinetry — standar, luxury, hingga ultra. Transparent material pricing library for luxury villa fit-out in Indonesia.',
  alternates: { canonical: '/materials/' },
  openGraph: {
    title: 'Pustaka Material & Harga Transparan | Nusantara Atelier',
    description:
      'Harga material pasar Indonesia per SKU: lantai, dinding, sanitary, pencahayaan, cabinetry.',
    url: '/materials/',
  },
};

export default function MaterialsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
