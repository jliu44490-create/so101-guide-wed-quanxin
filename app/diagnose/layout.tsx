import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: '报错诊断',
  description: '检索 SO101、LeRobot、ACT 训练和推理部署中的常见错误、根因与修复命令。',
  alternates: {
    canonical: '/diagnose',
    languages: {
      'zh-CN': '/diagnose',
      'ja-JP': '/ja/diagnose'
    }
  },
  openGraph: {
    title: 'SO101 报错诊断',
    description: '快速定位 LeRobot 与 ACT 模仿学习工作流中的常见错误。',
    url: '/diagnose'
  }
}

export default function DiagnoseLayout({ children }: { children: ReactNode }) {
  return children
}
