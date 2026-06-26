import type { Metadata } from 'next'

// app/ai/page.tsx is a client component (can't export metadata itself), so the
// route's SEO metadata lives here. Fixes the generic title + home canonical that
// the audit flagged for /ai.
export const metadata: Metadata = {
  title: 'LVJIN AI · 模仿学习助教',
  description:
    'LVJIN AI —— SO-101 / LeRobot 模仿学习的中文 AI 助教。环境搭建、校准、数据采集、ACT 训练、推理部署、报错排查随时问,答案基于站内课程与错误库(RAG)。',
  alternates: { canonical: '/ai' },
  openGraph: {
    type: 'website',
    url: '/ai',
    title: 'LVJIN AI · SO-101 模仿学习助教',
    description: 'SO-101 / LeRobot 模仿学习的中文 AI 助教,基于站内课程与错误库回答。'
  }
}

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return children
}
