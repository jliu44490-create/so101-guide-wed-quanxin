import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '术语表',
  description: '查询模仿学习、LeRobot、ACT、CVAE、SO101 硬件和数据集相关术语。',
  alternates: {
    canonical: '/glossary',
    languages: {
      'zh-CN': '/glossary',
      'ja-JP': '/ja/glossary'
    }
  },
  openGraph: {
    title: 'SO101 模仿学习术语表',
    description: '把模仿学习与 LeRobot 工作流中的核心概念讲清楚。',
    url: '/glossary'
  }
}

export default function GlossaryLayout({ children }: { children: ReactNode }) {
  return children
}
