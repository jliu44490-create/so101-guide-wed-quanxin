'use client'

/**
 * The "locked" screen shown in place of paid content for users without access.
 * Used by locked lessons (play mode) and locked articles. Locale-aware via the
 * pathname (/ja → Japanese), so /ja chapters point at /ja/unlock.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowRight, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UNLOCK_BENEFITS } from '@/lib/paywall'

interface PaywallGateProps {
  /** What the user was trying to open, e.g. "第 3 课" / "第 3 章". */
  what?: string
  /** Override the unlock page link. Defaults to the locale-correct page. */
  unlockHref?: string
}

const BENEFITS_JA = [
  '全 9 課のインタラクティブ講座をアンロック',
  '全 9 章の完全なドキュメント版をアンロック',
  'コミュニティでの投稿・質問・回答・いいね',
  '一度の買い切りで永久有効、新章も無料で同期',
  'エラー診断ライブラリ + AI アシスタントの全機能'
]

export function PaywallGate({ what, unlockHref }: PaywallGateProps) {
  const isJa = usePathname()?.startsWith('/ja') ?? false
  const t = isJa
    ? {
        title: `${what ?? 'このセクション'}はロックされています`,
        sub: '最初の 2 章は無料で体験できます。アンロックすると全 9 課の学習、完全なドキュメントの閲覧、コミュニティ参加が可能になります。',
        oneTime: '一度の買い切りで永久有効',
        benefits: BENEFITS_JA as readonly string[],
        unlock: 'すべてアンロック',
        tryFree: 'まず第 1 課を無料体験',
        unlockHref: unlockHref ?? '/ja/unlock',
        playHref: '/ja/learn/1/play'
      }
    : {
        title: `${what ?? '本节内容'}已锁定`,
        sub: '前两章永久免费，可随时体验。解锁后即可学习全部 9 节课、查看完整文档，并参与社区讨论。',
        oneTime: '一次性解锁，永久有效',
        benefits: UNLOCK_BENEFITS as readonly string[],
        unlock: '解锁全部内容',
        tryFree: '先免费体验第 1 课',
        unlockHref: unlockHref ?? '/unlock',
        playHref: '/learn/1/play'
      }

  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border/60">
        <Lock className="h-7 w-7 text-primary" />
      </div>
      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">{t.title}</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">{t.sub}</p>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border/60 bg-card/40 p-6 text-left">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          {t.oneTime}
        </p>
        <ul className="mt-4 space-y-2">
          {t.benefits.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-0.5 text-emerald-500">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="glow-primary h-12 px-8">
          <Link href={t.unlockHref}>
            {t.unlock}
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 px-8">
          <Link href={t.playHref}>{t.tryFree}</Link>
        </Button>
      </div>
    </div>
  )
}
