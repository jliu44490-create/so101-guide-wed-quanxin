import type { Metadata } from 'next'

// Japanese route — reuses the shared (locale-aware) reset-password page.
export const metadata: Metadata = {
  title: 'パスワードの再設定',
  description: '新しいパスワードを設定してアカウントを復旧します。',
  robots: { index: false, follow: false },
  alternates: {
    canonical: '/ja/reset-password',
    languages: {
      'zh-CN': '/reset-password',
      'ja-JP': '/ja/reset-password'
    }
  }
}

export { default } from '../../reset-password/page'
