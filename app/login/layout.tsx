import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '登录',
  description: '登录 LVJIN 社区,参与提问、答疑、点赞。',
  robots: { index: false, follow: false }
}

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children
}
