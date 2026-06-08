import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'リソース',
  description: 'SO101、LeRobot、Hugging Face、ACT 論文、コード、動画、ハードウェア資料をまとめています。',
  alternates: {
    canonical: '/ja/resources',
    languages: {
      'zh-CN': '/resources',
      'ja-JP': '/ja/resources'
    }
  },
  openGraph: {
    title: 'SO101 リソース',
    description: '模倣学習の入門から実践までに役立つ公式資料と参考リンク。',
    url: '/ja/resources'
  }
}

export default function ResourcesLayoutJa({ children }: { children: ReactNode }) {
  return children
}
