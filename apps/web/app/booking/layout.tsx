import type { Metadata } from 'next';

/** /booking 为 client component，独立元数据由本 server layout 提供（静态 HTML head 可见） */
export const metadata: Metadata = {
  title: 'Jadwalkan Konsultasi Desain',
  description:
    'Jadwalkan konsultasi desain interior villa Anda dengan tim Nusantara Atelier — survei lokasi, estimasi biaya transparan, dan pendampingan penuh dari desain hingga serah terima. Book a design consultation for your luxury villa in Indonesia.',
  alternates: { canonical: '/booking/' },
  openGraph: {
    title: 'Jadwalkan Konsultasi Desain | Nusantara Atelier',
    description:
      'Konsultasi desain interior villa: survei lokasi, estimasi transparan, pendampingan penuh.',
    url: '/booking/',
  },
};

export default function BookingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
