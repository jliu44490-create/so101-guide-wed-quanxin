import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '用語集',
  description: '模倣学習、LeRobot、ACT、CVAE、SO101 ハードウェア、データセット関連の用語を確認できます。',
  alternates: {
    canonical: '/ja/glossary',
    languages: {
      'zh-CN': '/glossary',
      'ja-JP': '/ja/glossary'
    }
  },
  openGraph: {
    title: 'SO101 模倣学習 用語集',
    description: 'LeRobot ワークフローで出てくる主要概念を日本語で整理。',
    url: '/ja/glossary'
  }
}

export default function GlossaryLayoutJa({ children }: { children: ReactNode }) {
  return children
}
