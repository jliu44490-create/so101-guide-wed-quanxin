import type { Metadata } from 'next'

// The /ja/unlock page itself is a Client Component and cannot export metadata,
// so this segment layout supplies an independent title/description/canonical
// (otherwise it would inherit the /ja homepage metadata from app/ja/layout.tsx).
export const metadata: Metadata = {
  title: '全コンテンツのアンロック',
  description:
    '一度の買い切りで、SO101 模倣学習の全 9 章（インタラクティブ講座 + 詳細ドキュメント）を永久にアンロックします。',
  alternates: {
    canonical: '/ja/unlock',
    languages: { 'zh-CN': '/unlock', 'ja-JP': '/ja/unlock' }
  }
}

export default function UnlockJaLayout({
  children
}: Readonly<{ children: React.ReactNode }>) {
  return <>{children}</>
}
