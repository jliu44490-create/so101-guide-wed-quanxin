'use client'

import Link from 'next/link'
import { Activity, Cpu, Sparkles, Terminal } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SpecItem {
  label: string
  value: string
}

interface AuthShellProps {
  /** Form panel content (the right side on desktop). */
  children: React.ReactNode
  /** Small uppercase label above the brand title, e.g. "AUTHENTICATION". */
  eyebrow?: string
  /** Large headline on the brand side. */
  brandTitle?: string
  /** One-line subtitle under the brand title. */
  brandSubtitle?: string
  /** Tech-spec rows shown at the bottom of the brand panel. */
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
 * Industrial / tech-dark vibe: grid backdrop + aurora glow on the brand side,
 * minimal mono-tone form panel on the right. Forces dark mode regardless of
 * the site's current theme so the auth flow has a consistent identity.
 */
export function AuthShell({
  children,
  eyebrow = 'AUTHENTICATION',
  brandTitle = '加入 LVJIN 机械臂学习者圈子',
  brandSubtitle = '提问、答疑、点赞 —— 与全球 SO-101 / LeKiwi 用户一起精进',
  specs = defaultSpecs,
  className
}: AuthShellProps) {
  return (
    <div className={cn('dark min-h-screen bg-background text-foreground', className)}>
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[1.05fr_1fr]">
        {/* ============== Brand side ============== */}
        <aside className="relative isolate hidden flex-col justify-between overflow-hidden border-r border-border/40 bg-background p-10 lg:flex">
          {/* Grid + aurora backdrop */}
          <div
            aria-hidden
            className="grid-pattern pointer-events-none absolute inset-0 opacity-[0.35]"
          />
          <div
            aria-hidden
            className="aurora pointer-events-none absolute inset-0 opacity-60"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/30 to-background/90"
          />

          {/* Top: logo + status pill */}
          <header className="relative flex items-center justify-between">
            <Link href="/" className="group flex items-center gap-2.5">
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

            <div className="flex items-center gap-2 rounded-full border border-border/60 bg-card/50 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground backdrop-blur-sm">
              <span className="relative flex size-1.5">
                <span className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative size-1.5 rounded-full bg-emerald-400" />
              </span>
              Online
            </div>
          </header>

          {/* Middle: hero copy */}
          <div className="relative space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-primary backdrop-blur-sm">
              <Cpu className="size-3" />
              {eyebrow}
            </div>
            <h1 className="text-balance text-3xl font-bold leading-[1.15] tracking-tight xl:text-4xl">
              {brandTitle.split('LVJIN').map((part, i, arr) =>
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
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              {brandSubtitle}
            </p>
          </div>

          {/* Bottom: spec grid + terminal */}
          <div className="relative space-y-5">
            <div className="glow-beam" />

            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              {specs.map((spec) => (
                <div key={spec.label} className="min-w-0 space-y-1">
                  <dt className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    {spec.label}
                  </dt>
                  <dd className="truncate font-mono text-sm font-semibold tracking-tight">
                    {spec.value}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="terminal mt-2 text-xs">
              <div className="terminal-header">
                <div className="terminal-dot bg-rose-400/80" />
                <div className="terminal-dot bg-amber-400/80" />
                <div className="terminal-dot bg-emerald-400/80" />
                <span className="ml-2 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  <Terminal className="size-3" />
                  lvjin@so101 ~ %
                </span>
              </div>
              <div className="space-y-1 px-4 py-3 font-mono leading-relaxed">
                <div className="text-muted-foreground">
                  <span className="text-emerald-400">$</span> lerobot-record \
                </div>
                <div className="pl-4 text-muted-foreground">
                  <span className="text-primary">--repo_id</span>=you/so101_pickup \
                </div>
                <div className="pl-4 text-muted-foreground">
                  <span className="text-primary">--num_episodes</span>=50
                </div>
                <div className="flex items-center gap-2 text-foreground">
                  <Activity className="size-3 text-emerald-400" />
                  <span className="text-emerald-400">●</span> recording episode 12 / 50
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* ============== Form side ============== */}
        <main className="relative flex flex-col bg-background">
          {/* Subtle grid on mobile/right side */}
          <div
            aria-hidden
            className="grid-pattern pointer-events-none absolute inset-0 opacity-[0.18] lg:hidden"
          />

          {/* Mobile-only top bar with logo */}
          <header className="relative flex items-center justify-between border-b border-border/40 px-6 py-4 lg:hidden">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent">
                <Sparkles className="size-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold tracking-tight">LVJIN</span>
            </Link>
            <Link
              href="/"
              className="text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              返回首页
            </Link>
          </header>

          <div className="relative flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:py-16">
            <div className="w-full max-w-md">{children}</div>
          </div>

          <footer className="relative flex flex-wrap items-center justify-between gap-3 border-t border-border/40 px-6 py-4 text-[11px] text-muted-foreground sm:px-10">
            <span>© {new Date().getFullYear()} LVJIN · lvjin.online</span>
            <div className="flex items-center gap-4">
              <Link href="/" className="transition-colors hover:text-foreground">
                首页
              </Link>
              <Link href="/learn" className="transition-colors hover:text-foreground">
                教程
              </Link>
              <a href="#" className="transition-colors hover:text-foreground">
                隐私
              </a>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}
