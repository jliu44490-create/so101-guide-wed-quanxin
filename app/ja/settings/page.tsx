import type { Metadata } from 'next'

// Japanese route — reuses the shared (locale-aware) settings page.
export const metadata: Metadata = {
  title: 'アカウント設定',
  description:
    'アバター・ユーザー名・パスワード・AI 学習パートナーなど、アカウント設定を管理します。',
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/ja/settings',
    languages: { 'zh-CN': '/settings', 'ja-JP': '/ja/settings' }
  }
}

export { default } from '../../settings/page'
