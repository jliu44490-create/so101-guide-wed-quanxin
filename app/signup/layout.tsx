import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '注册',
  description: '注册 LVJIN 社区账号,参与提问、答疑、点赞。',
  robots: { index: false, follow: false }
}

export default function SignupLayout({ children }: { children: React.ReactNode }) {
  return children
}
