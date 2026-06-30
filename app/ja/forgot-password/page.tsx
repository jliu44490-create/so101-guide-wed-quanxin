import type { Metadata } from 'next'

// Japanese route — reuses the shared (locale-aware) forgot-password page.
export const metadata: Metadata = {
  title: 'パスワードをお忘れの方へ',
  description:
    '登録メールアドレスを入力すると、パスワード再設定リンクをお送りします。',
  robots: { index: false, follow: true },
  alternates: {
    canonical: '/ja/forgot-password',
    languages: {
      'zh-CN': '/forgot-password',
      'ja-JP': '/ja/forgot-password'
    }
  }
}

export { default } from '../../forgot-password/page'
