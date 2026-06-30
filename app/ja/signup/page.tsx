import type { Metadata } from 'next'

// Japanese route — reuses the shared (locale-aware) signup page.
export const metadata: Metadata = {
  title: '新規登録',
  description:
    'メールアドレスでアカウントを作成し、SO101 模倣学習の講座・コミュニティ・LVJIN AI を始めましょう。',
  alternates: {
    canonical: '/ja/signup',
    languages: { 'zh-CN': '/signup', 'ja-JP': '/ja/signup' }
  }
}

export { default } from '../../signup/page'
