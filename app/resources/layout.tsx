import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '资源中心',
  description: '收集 SO101、LeRobot、Hugging Face、ACT 论文、代码、视频和硬件资料。',
  alternates: {
    canonical: '/resources',
    languages: {
      'zh-CN': '/resources',
      'ja-JP': '/ja/resources'
    }
  },
  openGraph: {
    title: 'SO101 资源中心',
    description: '集中查看模仿学习入门和实战所需的官方资料与延伸阅读。',
    url: '/resources'
  }
}

export default function ResourcesLayout({ children }: { children: ReactNode }) {
  return children
}
