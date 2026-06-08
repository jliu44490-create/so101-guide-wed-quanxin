import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'トラブル診断',
  description: 'SO101、LeRobot、ACT 学習、推論デプロイで起きやすいエラーの原因と対処を検索できます。',
  alternates: {
    canonical: '/ja/diagnose',
    languages: {
      'zh-CN': '/diagnose',
      'ja-JP': '/ja/diagnose'
    }
  },
  openGraph: {
    title: 'SO101 トラブル診断',
    description: 'LeRobot と ACT 模倣学習ワークフローのよくある問題をすばやく確認。',
    url: '/ja/diagnose'
  }
}

export default function DiagnoseLayoutJa({ children }: { children: ReactNode }) {
  return children
}
