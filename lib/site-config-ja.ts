/**
 * Japanese (ja) mirror of site-config.
 *
 * Used by /ja routes. Keeps shape compatible with the original siteConfig so
 * shared components can swap to this at runtime via pathname detection.
 *
 * Brand name is intentionally kept as "LVJIN ROBOTICS" (no Japanese transliteration).
 * The `url` field depends on the CN config so both locales share the same
 * production origin and never inherit Vercel preview URLs.
 */

import { siteConfig } from './site-config'

export const siteConfigJa = {
  name: 'SO101 模倣学習ガイド',
  shortName: 'SO101 ガイド',
  brand: 'LVJIN ROBOTICS',
  brandEn: 'LVJIN ROBOTICS',
  url: `${siteConfig.url}/ja`,
  description:
    'SO101 ロボットアームの模倣学習を、環境構築から ACT モデルのデプロイまで一気通貫で習得できる実践ガイドです。開発者・研究者・愛好家の皆さまを対象としています。',
  keywords: [
    'SO101',
    'SO100',
    'ロボットアーム',
    '産業用ロボットアーム',
    '模倣学習',
    'Imitation Learning',
    'LeRobot',
    'ACT',
    'Action Chunking Transformer',
    '身体性 AI',
    'Embodied AI',
    'HuggingFace',
    'ロボット学習',
    'LVJIN ROBOTICS'
  ],
  authors: [{ name: 'LVJIN ROBOTICS', url: siteConfig.url }],
  creator: 'LVJIN ROBOTICS',
  links: {
    lerobot: 'https://github.com/huggingface/lerobot',
    huggingface: 'https://huggingface.co/lerobot',
    so101: 'https://github.com/TheRobotStudio/SO-ARM100',
    inquiry:
      'https://mail.google.com/mail/?view=cm&fs=1&to=jliu44490@gmail.com&su=SO101%20%E3%81%8A%E5%95%8F%E3%81%84%E5%90%88%E3%82%8F%E3%81%9B'
  },
  nav: [
    { href: '/ja', label: 'ホーム' },
    { href: '/ja/learn', label: '学習パス' },
    { href: '/ja/community', label: 'コミュニティ' },
    { href: '/ja/diagnose', label: 'トラブル診断' },
    { href: '/ja/ai', label: 'LVJIN AI' }
  ],
  navExtra: [
    { href: '/ja/glossary', label: '用語集' },
    { href: '/ja/resources', label: 'リソース' },
    { href: '/ja/about', label: 'プロジェクトについて' }
  ]
}

export type SiteConfigJa = typeof siteConfigJa
