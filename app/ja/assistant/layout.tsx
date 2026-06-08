import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'AI アシスタント',
  description: 'SO101 模倣学習に特化したナレッジベース型 AI アシスタントです。',
  alternates: {
    canonical: '/ja/assistant',
    languages: {
      'zh-CN': '/assistant',
      'ja-JP': '/ja/assistant'
    }
  },
  openGraph: {
    title: 'SO101 AI アシスタント',
    description: 'ACT、LeRobot、データ収集、推論デプロイに関する質問に答えます。',
    url: '/ja/assistant'
  }
}

export default function AssistantLayoutJa({ children }: { children: ReactNode }) {
  return children
}
