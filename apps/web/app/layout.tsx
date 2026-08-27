import type { Metadata } from 'next';
import LanguageProvider from '@/components/LanguageProvider';
import { SITE_URL } from '@/lib/site';
import './globals.css';

/** 首页 OG 分享卡：玺园首图（Hero 同款素材，绝对 URL） */
const OG_IMAGE = `${SITE_URL}/cases/shaoxing-xiyuan/p36-0.jpg`;

const DESCRIPTION =
  'Jasa desain interior, renovasi, dan furnishing villa mewah di Jakarta, Bali, dan seluruh Indonesia — satu tim, satu kontrak, anggaran transparan hingga per meter persegi. Full-service luxury villa design & build in Indonesia, from concept to handover.';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Nusantara Atelier · Jasa Desain Interior & Villa Mewah Indonesia',
    template: '%s | Nusantara Atelier',
  },
  description: DESCRIPTION,
  keywords: [
    'desain interior villa mewah',
    'jasa desain villa Jakarta',
    'kontraktor interior Bali',
    'renovasi villa mewah',
    'luxury villa design Indonesia',
    'interior design Jakarta',
    '豪宅设计',
    '别墅装修',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    siteName: 'Nusantara Atelier',
    type: 'website',
    locale: 'id_ID',
    alternateLocale: ['en_US', 'zh_CN'],
    url: '/',
    title: 'Nusantara Atelier · Jasa Desain Interior & Villa Mewah Indonesia',
    description: DESCRIPTION,
    images: [{ url: OG_IMAGE, width: 1200, height: 800, alt: 'Nusantara Atelier — portfolio villa mewah' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nusantara Atelier · Jasa Desain Interior & Villa Mewah Indonesia',
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
