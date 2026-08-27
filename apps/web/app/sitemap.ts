import type { MetadataRoute } from 'next';
import { cases } from '@/lib/cases';
import { SITE_URL } from '@/lib/site';

export const dynamic = 'force-static';

/** 全站 sitemap：首页 1.0 / 案例页 0.8 / 功能页 0.6，lastModified 取构建日期 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    ...(['/upload/', '/booking/', '/materials/'] as const).map((p) => ({
      url: `${SITE_URL}${p}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];

  const casePages: MetadataRoute.Sitemap = cases.map((c) => ({
    url: `${SITE_URL}/cases/${c.id}/`,
    lastModified,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticPages, ...casePages];
}
