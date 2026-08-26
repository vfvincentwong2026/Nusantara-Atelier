import type { Metadata } from 'next';
import LanguageProvider from '@/components/LanguageProvider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Nusantara Atelier · 印尼豪宅全案服务商',
  description:
    '从设计到呈现，一步到位。中国顶级豪宅落地经验，服务印尼高端别墅市场：室内设计 · 精密装修 · 家具软装指导。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
