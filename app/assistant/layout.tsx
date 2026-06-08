import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'AI 助手',
  description: '面向 SO101 模仿学习的本地知识库问答助手，覆盖章节、术语、资源和错误诊断。',
  alternates: {
    canonical: '/assistant',
    languages: {
      'zh-CN': '/assistant',
      'ja-JP': '/ja/assistant'
    }
  },
  openGraph: {
    title: 'SO101 AI 助手',
    description: '用站内知识库回答 ACT、LeRobot、数据采集和推理部署问题。',
    url: '/assistant'
  }
}

export default function AssistantLayout({ children }: { children: ReactNode }) {
  return children
}
