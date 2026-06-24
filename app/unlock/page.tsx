'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Check, Loader2, Lock, PartyPopper, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import { AuroraBackground, FloatingOrbs, Reveal, ShimmerText } from '@/components/effects'
import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/lib/use-auth'
import { useEntitlement } from '@/lib/use-entitlement'
import { PAYWALL_ENABLED, PRICING, UNLOCK_BENEFITS, type PriceCurrency } from '@/lib/paywall'

export default function UnlockPage() {
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

  // Reflect the redirect back from Stripe.
  useEffect(() => {
    const status = params.get('status')
    if (status === 'success') {
      toast.success('支付成功！正在为你解锁…', { duration: 4000 })
    } else if (status === 'cancelled') {
      toast('支付已取消', { description: '随时可以再来解锁' })
    }
  }, [params])

  const startCheckout = async (currency: PriceCurrency) => {
    if (!isSupabaseConfigured || !supabase) {
      toast.error('后端尚未配置')
      return
    }
    if (!isLoggedIn || !session) {
      toast.error('请先登录（右上角）再购买')
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
        body: JSON.stringify({ currency })
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? '无法发起支付')
        setBusy(null)
        return
      }
      if (data.url) {
        window.location.href = data.url // jump to Stripe hosted checkout
      }
    } catch {
      toast.error('网络错误，请重试')
      setBusy(null)
    }
  }

  // ── Already unlocked ────────────────────────────────────────────────────
  if (PAYWALL_ENABLED && !loading && hasAccess && isLoggedIn) {
    return (
      <main className="mx-auto max-w-xl px-4 py-24 text-center">
        <PartyPopper className="mx-auto h-12 w-12 text-primary" />
        <h1 className="mt-4 text-3xl font-bold">你已解锁全部内容 🎉</h1>
        <p className="mt-3 text-muted-foreground">感谢支持！全部课程与社区功能已对你开放。</p>
        <Button asChild size="lg" className="glow-primary mt-8 h-12 px-8">
          <Link href="/learn">去学习</Link>
        </Button>
      </main>
    )
  }

  return (
    <main>
      <section className="relative overflow-hidden border-b border-border/40">
        <AuroraBackground intensity="subtle" />
        <FloatingOrbs count={3} />
        <div className="relative mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
          <Reveal>
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border/60">
              <Lock className="h-6 w-6 text-primary" />
            </div>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="mt-5 text-4xl font-bold sm:text-5xl">
              <ShimmerText>一次买断，永久解锁</ShimmerText>
            </h1>
          </Reveal>
          <Reveal delay={200}>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground sm:text-lg">
              前两章永久免费体验。解锁后,全部 9 节互动课、完整文档、社区发帖权限,
              一次付费,永久有效 —— 包括以后新增的章节。
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
              解锁后你将获得
            </p>
            <ul className="mt-5 space-y-3">
              {UNLOCK_BENEFITS.map((b) => (
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
            <p className="text-sm text-muted-foreground">全部内容 · 一次性</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="text-5xl font-bold tracking-tight">{PRICING.cny.label}</span>
              <span className="mb-1 text-sm text-muted-foreground">/ 永久</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              或 {PRICING.jpy.label}（日元）· 无订阅 · 无隐藏费用
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
                  <>用 ¥99 解锁（人民币）</>
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
                  <>用 ¥2,400 解锁（日元）</>
                )}
              </Button>
            </div>

            {!isLoggedIn && (
              <p className="mt-4 text-center text-xs text-muted-foreground">
                购买前请先用右上角的「登录」按钮登录,
                解锁会绑定到你的账号。
              </p>
            )}

            {!PAYWALL_ENABLED && (
              <p className="mt-4 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-center text-xs text-yellow-700 dark:text-yellow-300">
                付费功能配置中,目前全部内容免费开放 🎁
              </p>
            )}

            <p className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
              <Lock className="h-3 w-3" />
              支付由 Stripe 安全处理,支持卡 / 支付宝 / 微信
            </p>
          </div>
        </div>

        <p className="mx-auto mt-8 max-w-xl text-center text-xs text-muted-foreground">
          还在犹豫？先去免费玩{' '}
          <Link href="/learn/1/play" className="text-primary hover:underline">
            第 1 课互动版
          </Link>
          ，体验整套课程的风格再决定。
        </p>
      </section>
    </main>
  )
}
