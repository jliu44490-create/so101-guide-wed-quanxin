import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '设置新密码',
  description: '为你的 LVJIN 账号设置新密码。',
  robots: { index: false, follow: false }
}

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children
}
