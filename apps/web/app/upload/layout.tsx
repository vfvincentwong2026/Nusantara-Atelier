import type { Metadata } from 'next';

/** /upload 为 client component，独立元数据由本 server layout 提供（静态 HTML head 可见） */
export const metadata: Metadata = {
  title: 'Estimasi Biaya Renovasi & BOM Material',
  description:
    'Hitung estimasi biaya renovasi villa Anda secara instan: unggah denah (DXF/JPG/PDF), pilih gaya dan tier, dapatkan rincian BOM material dengan harga pasar Indonesia. Instant villa renovation cost estimate with transparent BOM pricing.',
  alternates: { canonical: '/upload/' },
  openGraph: {
    title: 'Estimasi Biaya Renovasi & BOM Material | Nusantara Atelier',
    description:
      'Hitung estimasi biaya renovasi villa secara instan dengan rincian BOM material transparan.',
    url: '/upload/',
  },
};

export default function UploadLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
