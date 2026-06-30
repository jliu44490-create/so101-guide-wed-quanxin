'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, Loader2, Lock, PartyPopper, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { Reveal, ShimmerText } from '@/components/effects'
import { HeroAura } from '@/components/hero-aura'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/lib/use-auth'
import { useEntitlement } from '@/lib/use-entitlement'
import { PAYWALL_ENABLED, PRICING, type PriceCurrency } from '@/lib/paywall'

/** Japanese mirror of /unlock. Benefits are translated locally; checkout sends
 *  locale:'ja' so Stripe returns the buyer to /ja/unlock. */
const BENEFITS_JA = [
  '全 9 章のインタラクティブ講座をアンロック（ステップ解説・ハンズオン・理解度チェック付き）',
  '全 9 章の詳細ドキュメント版をアンロック',
  '一度の買い切りで永久有効、今後追加される章も無料で同期',
  'エラー診断ライブラリ + AI アシスタントの全機能'
]

export default function UnlockPageJa() {
  return (
    <div className="min-h-screen">
      <Header />
      <Suspense fallback={null}>
        <UnlockContent />
      </Suspense>
      <Footer />
    </div>
  )
}

function UnlockContent() {
  const params = useSearchParams()
  const { isLoggedIn, session } = useAuth()
  const { hasAccess, loading } = useEntitlement()
  const [busy, setBusy] = useState<PriceCurrency | null>(null)

  useEffect(() => {
    const status = params.get('status')
    if (status === 'success') {
      toast.success('決済が完了しました！アンロック中…', { duration: 4000 })
    } else if (status === 'cancelled') {
      toast('お支払いをキャンセルしました', { description: 'いつでもまたアンロックできます' })
    }
  }, [params])

  const startCheckout = async (currency: PriceCurrency) => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('バックエンドが未設定です')
      return
    }
    if (!isLoggedIn || !session) {
      toast.error('購入前にログインしてください（右上）')
      return
    }
    setBusy(currency)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ currency, locale: 'ja' })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? '決済を開始できません')
        setBusy(null)
        return
      }
      if (data.url) {
        window.location.href = data.url
      }
    } catch {
      toast.error('ネットワークエラー。もう一度お試しください')
      setBusy(null)
    }
  }

  // ── Already unlocked ────────────────────────────────────────────────────
  if (PAYWALL_ENABLED && !loading && hasAccess && isLoggedIn) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <PartyPopper className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-bold">すべてのコンテンツをご利用いただけます 🎉</h1>
        <p className="mt-3 text-muted-foreground">ご支援ありがとうございます！全講座が利用可能です。</p>
        <Button asChild size="lg" className="glow-primary mt-8 h-12 px-8">
          <Link href="/ja/learn">学習を続ける</Link>
        </Button>
      </main>
    )
  }

  return (
    <main>
      <section className="relative overflow-hidden">
        <HeroAura />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <Reveal>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border/60">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 text-4xl font-bold sm:text-5xl">
              <ShimmerText>一度の買い切りで永久アンロック</ShimmerText>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">
              最初の 2 章は無料体験。アンロックすると、全 9 章のインタラクティブ講座と詳細ドキュメントが、一度の支払いで永久に —— 今後追加される章も含めて。
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* Benefits */}
          <div className="rounded-2xl border border-border/60 bg-card/40 p-6 sm:p-8">
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="h-4 w-4" />
              アンロックで得られるもの
            </p>
            <ul className="mt-5 space-y-3">
              {BENEFITS_JA.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm leading-relaxed sm:text-base">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/15">
                    <Check className="h-3 w-3 text-emerald-500" />
                  </span>
                  {b}
                </li>
              ))}
            </ul>
          </div>

          {/* Price + buy */}
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5 p-6 sm:p-8">
            <p className="text-sm text-muted-foreground">全コンテンツ · 一回限り</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-bold tracking-tight">{PRICING.cny.label}</span>
              <span className="mb-1 text-sm text-muted-foreground">/ 永久</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              または {PRICING.jpy.label}（日本円）· サブスクなし · 隠れた費用なし
            </p>

            <div className="mt-6 space-y-2.5">
              <Button
                onClick={() => startCheckout('cny')}
                disabled={busy !== null}
                size="lg"
                className="glow-primary h-12 w-full"
              >
                {busy === 'cny' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>¥99 でアンロック（人民元）</>
                )}
              </Button>
              <Button
                onClick={() => startCheckout('jpy')}
                disabled={busy !== null}
                size="lg"
                variant="outline"
                className="h-12 w-full"
              >
                {busy === 'jpy' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>¥2,400 でアンロック（日本円）</>
                )}
              </Button>
            </div>

            {!isLoggedIn && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                購入前に右上の「ログイン」からログインしてください。アンロックはアカウントに紐づきます。
              </p>
            )}

            {!PAYWALL_ENABLED && (
              <p className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-center text-xs text-yellow-700 dark:text-yellow-300">
                決済機能は設定中で、現在すべてのコンテンツが無料公開です 🎁
              </p>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" />
              決済は Stripe が安全に処理（カード / Alipay / WeChat 対応）
            </p>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs text-muted-foreground">
          まだ迷っていますか？ まず無料で{' '}
          <Link href="/ja/learn/1/play" className="text-primary hover:underline">
            第 1 課のインタラクティブ版
          </Link>
          を試して、講座の雰囲気を確かめてから決めましょう。
        </p>
      </section>
    </main>
  )
}
