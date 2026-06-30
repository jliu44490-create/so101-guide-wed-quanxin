import type { Metadata } from 'next'

// Japanese login route. Reuses the shared (locale-aware) login page — it detects
// /ja from the pathname and renders Japanese labels + /ja cross-links.
export const metadata: Metadata = {
  title: 'ログイン',
  description:
    'LVJIN ROBOTICS にログインして、SO101 模倣学習の講座・学習進捗・コミュニティ・LVJIN AI を利用します。',
  alternates: {
    canonical: '/ja/login',
    languages: { 'zh-CN': '/login', 'ja-JP': '/ja/login' }
  }
}

export { default } from '../../login/page'
