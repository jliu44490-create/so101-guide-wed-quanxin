import type { Metadata } from 'next'
import type { ReactNode } from 'react'

// app/ja/ai/page.tsx is a client component (can't export metadata itself), so the
// route's SEO metadata lives here — mirrors app/ai/layout.tsx for the JA locale.
export const metadata: Metadata = {
  title: 'LVJIN AI · 模倣学習アシスタント',
  description:
    'LVJIN AI —— SO-101 / LeRobot 模倣学習の AI アシスタント。環境構築、キャリブレーション、データ収集、ACT 学習、推論デプロイ、エラー対処をいつでも質問でき、回答はサイト内の講座とエラーベース（RAG）に基づきます。',
  alternates: {
    canonical: '/ja/ai',
    languages: {
      'zh-CN': '/ai',
      'ja-JP': '/ja/ai'
    }
  },
  openGraph: {
    type: 'website',
    url: '/ja/ai',
    title: 'LVJIN AI · SO-101 模倣学習アシスタント',
    description: 'SO-101 / LeRobot 模倣学習の AI アシスタント。サイト内の講座とエラーベースに基づき回答します。'
  }
}

export default function AiLayoutJa({ children }: { children: ReactNode }) {
  return children
}
