'use client'

/**
 * The "locked" screen shown in place of paid content for users without access.
 * Used by locked lessons (play mode) and locked articles.
 */

import Link from 'next/link'
import { ArrowRight, Lock, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UNLOCK_BENEFITS } from '@/lib/paywall'

interface PaywallGateProps {
  /** What the user was trying to open, e.g. "第 3 课". */
  what?: string
  /** Where the locale-correct unlock page lives. */
  unlockHref?: string
}

export function PaywallGate({ what = '本节内容', unlockHref = '/unlock' }: PaywallGateProps) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 text-center sm:py-24">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border/60">
        <Lock className="h-7 w-7 text-primary" />
      </div>
      <h1 className="mt-6 text-2xl font-bold sm:text-3xl">{what}已锁定</h1>
      <p className="mx-auto mt-3 max-w-md text-muted-foreground">
        前两章永久免费，可随时体验。解锁后即可学习全部 9 节课、查看完整文档，并参与社区讨论。
      </p>

      <div className="mx-auto mt-8 max-w-md rounded-2xl border border-border/60 bg-card/40 p-6 text-left">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="h-4 w-4 text-primary" />
          一次性解锁，永久有效
        </p>
        <ul className="mt-4 space-y-2">
          {UNLOCK_BENEFITS.map((b) => (
            <li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
              <span className="mt-0.5 text-emerald-500">✓</span>
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Button asChild size="lg" className="glow-primary h-12 px-8">
          <Link href={unlockHref}>
            解锁全部内容
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-12 px-8">
          <Link href="/learn/1/play">先免费体验第 1 课</Link>
        </Button>
      </div>
    </div>
  )
}
