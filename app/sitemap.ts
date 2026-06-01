import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/site-config'
import { chapters } from '@/lib/course-data'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  const base = siteConfig.url.replace(/\/$/, '')

  const zhStatic: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/learn`, lastModified, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${base}/community`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/diagnose`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/assistant`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/glossary`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/resources`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/about`, lastModified, changeFrequency: 'yearly', priority: 0.5 }
  ]

  const jaStatic: MetadataRoute.Sitemap = [
    { url: `${base}/ja`, lastModified, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${base}/ja/learn`, lastModified, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${base}/ja/diagnose`, lastModified, changeFrequency: 'monthly', priority: 0.75 },
    { url: `${base}/ja/assistant`, lastModified, changeFrequency: 'monthly', priority: 0.65 },
    { url: `${base}/ja/glossary`, lastModified, changeFrequency: 'monthly', priority: 0.55 },
    { url: `${base}/ja/resources`, lastModified, changeFrequency: 'monthly', priority: 0.55 },
    { url: `${base}/ja/about`, lastModified, changeFrequency: 'yearly', priority: 0.45 }
  ]

  const chapterRoutes: MetadataRoute.Sitemap = chapters.flatMap((chapter) => [
    {
      url: `${base}/learn/${chapter.id}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7
    },
    {
      url: `${base}/ja/learn/${chapter.id}`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.65
    }
  ])

  return [...zhStatic, ...jaStatic, ...chapterRoutes]
}
