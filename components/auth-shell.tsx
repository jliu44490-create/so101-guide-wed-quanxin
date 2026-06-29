'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Cpu, Sparkles } from 'lucide-react'
import { BinaryField } from '@/components/binary-field'
import { cn } from '@/lib/utils'

interface SpecItem {
  label: string
  value: string
}

interface AuthShellProps {
  /** Form panel content (the glass card). */
  children: React.ReactNode
  /** Small uppercase label above the brand title, e.g. "AUTHENTICATION". */
  eyebrow?: string
  /** Large headline on the brand side. */
  brandTitle?: string
  /** One-line subtitle under the brand title. */
  brandSubtitle?: string
  /** Tech-spec rows shown under the brand copy. */
  specs?: SpecItem[]
  className?: string
}

const defaultSpecs: SpecItem[] = [
  { label: 'CHAPTERS', value: '09' },
  { label: 'LESSONS', value: '24+' },
  { label: 'ARMS', value: 'SO-101 · LeKiwi' },
  { label: 'LICENSE', value: 'OPEN' }
]

/**
 * Shared shell for the auth pages (/login, /signup, /forgot-password, etc.).
 *
 * One immersive scene: a full-bleed binary sea (see BinaryField) covers the whole
 * screen, with the brand copy and a translucent glass login card floating on top
 * of it — no split panels, no hard divider. Soft scrims + drop shadows keep the
 * copy and form readable. Forces dark mode for a consistent auth identity.
 */
export function AuthShell({
  children,
  eyebrow = 'AUTHENTICATION',
  brandTitle,
  brandSubtitle,
  specs = defaultSpecs,
  className
}: AuthShellProps) {
  const isJa = usePathname()?.startsWith('/ja') ?? false
  const homeHref = isJa ? '/ja' : '/'
  const learnHref = isJa ? '/ja/learn' : '/learn'
  const privacyHref = isJa ? '/ja/privacy' : '/privacy'
  const resolvedTitle =
    brandTitle ?? (isJa ? 'LVJIN ロボットアーム学習者の輪に加わろう' : '加入 LVJIN 机械臂学习者圈子')
  const resolvedSubtitle =
    brandSubtitle ??
    (isJa
      ? '質問・回答・いいね —— 世界中の SO-101 / LeKiwi ユーザーと一緒に上達。'
      : '提问、答疑、点赞 —— 与全球 SO-101 / LeKiwi 用户一起精进')
  const tFooter = isJa
    ? { home: 'ホーム', learn: 'チュートリアル', privacy: 'プライバシー' }
    : { home: '首页', learn: '教程', privacy: '隐私' }
  return (
    <div
      className={cn(
        'dark relative isolate min-h-screen overflow-hidden bg-[oklch(0.1_0.016_265)] text-foreground',
        className
      )}
    >
      {/* Full-bleed binary sea */}
      <BinaryField className="absolute inset-0 z-0" />

      {/* Readability scrims — soft, no hard edges: gentle top/bottom darkening and
          a focus dim under the brand copy on the left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-b from-[oklch(0.1_0.016_265)]/75 via-transparent to-[oklch(0.1_0.016_265)]/85"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 [background:radial-gradient(42%_38%_at_36%_53%,oklch(0.08_0.016_265/0.9),oklch(0.08_0.016_265/0.45)_52%,transparent_80%)]"
      />

      {/* Content */}
      <div className="relative z-20 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 sm:px-10">
        {/* Header */}
        <header className="flex items-center justify-between py-6">
          <Link href={homeHref} className="group flex items-center gap-2.5">
            <div className="relative flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/25 ring-1 ring-white/20 ring-inset transition-transform group-hover:scale-105">
              <Sparkles className="size-4 text-white drop-shadow-sm" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-tight">LVJIN</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Imitation Learning
              </div>
            </div>
          </Link>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-md">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative size-1.5 rounded-full bg-emerald-400" />
            </span>
            Online
          </div>
        </header>

        {/* Main: brand copy + glass login card, both floating on the sea */}
        <main className="flex flex-1 flex-col items-center justify-center gap-10 py-8 lg:flex-row lg:justify-between lg:gap-16">
          {/* Brand copy */}
          <div className="w-full max-w-lg space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary backdrop-blur-md">
              <Cpu className="size-3" />
              {eyebrow}
            </div>
            <h1 className="text-balance text-3xl font-bold leading-[1.15] tracking-tight drop-shadow-[0_2px_16px_oklch(0.08_0.02_265/0.9)] xl:text-4xl">
              {resolvedTitle.split('LVJIN').map((part, i, arr) =>
                i < arr.length - 1 ? (
                  <span key={i}>
                    {part}
                    <span className="shimmer-text font-extrabold">LVJIN</span>
                  </span>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-foreground/85 drop-shadow-[0_1px_12px_oklch(0.06_0.02_265/1)] lg:mx-0">
              {resolvedSubtitle}
            </p>

            <div className="space-y-4 pt-2">
              <div className="glow-beam" />
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
                {specs.map((spec) => (
                  <div key={spec.label} className="min-w-0 space-y-1">
                    <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-foreground/60 drop-shadow-[0_1px_8px_oklch(0.06_0.02_265/0.95)]">
                      {spec.label}
                    </dt>
                    <dd className="truncate font-mono text-sm font-semibold tracking-tight drop-shadow-[0_1px_10px_oklch(0.06_0.02_265/1)]">
                      {spec.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Glass login card */}
          <div className="w-full max-w-md">
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[oklch(0.13_0.02_265/0.55)] p-6 shadow-2xl shadow-black/50 backdrop-blur-2xl sm:p-8">
              {/* top hairline accent */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent"
              />
              {children}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex flex-wrap items-center justify-between gap-3 py-5 text-[11px] text-muted-foreground">
          <span>© {new Date().getFullYear()} LVJIN · lvjin.online</span>
          <div className="flex items-center gap-4">
            <Link href={homeHref} className="transition-colors hover:text-foreground">
              {tFooter.home}
            </Link>
            <Link href={learnHref} className="transition-colors hover:text-foreground">
              {tFooter.learn}
            </Link>
            <Link href={privacyHref} className="transition-colors hover:text-foreground">
              {tFooter.privacy}
            </Link>
          </div>
        </footer>
      </div>
    </div>
  )
}
