import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '找回密码',
  description: '通过邮箱重置你的 LVJIN 账号密码。',
  robots: { index: false, follow: false }
}

export default function ForgotPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
