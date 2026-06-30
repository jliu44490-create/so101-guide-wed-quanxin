'use client'

/**
 * 学习地图 — chapters laid out as a connected "level path". Each chapter is a
 * node on a glowing spine, coloured by progress state (completed / in-progress /
 * not-started), with quick links into the gamified lesson (闯关) or the article.
 *
 * Reads progress from the existing useChapters() store; no new persistence.
 */

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Check, Play } from 'lucide-react'
import { Reveal } from '@/components/effects'
import { useChapters } from '@/lib/use-progress'
import { hasLesson } from '@/lib/lessons'
import { cn } from '@/lib/utils'

export function LearnPath() {
  const pathname = usePathname()
  const ja = pathname?.startsWith('/ja') ?? false
  const { chapters } = useChapters()
  const base = ja ? '/ja' : ''

  const t = ja
    ? { level: 'ステージ', cleared: 'クリア', active: '進行中', play: '挑戦する', resume: '続ける', replay: 'もう一度', doc: 'ドキュメント' }
    : { level: '关', cleared: '已通关', active: '进行中', play: '开始闯关', resume: '继续闯关', replay: '再玩一次', doc: '看文档' }

  return (
    <ol className="relative space-y-4 sm:space-y-5">
      {/* glowing spine behind the nodes */}
      <span
        aria-hidden
        className="pointer-events-none absolute bottom-6 left-5 top-6 w-0.5 bg-gradient-to-b from-primary/50 via-border to-border sm:left-7"
      />
      {chapters.map((c, i) => {
        const done = c.status === 'completed'
        const active = c.status === 'in-progress'
        const playable = hasLesson(c.id)
        return (
          <li key={c.id} className="relative">
            <Reveal delay={i * 40}>
              <div className="flex items-stretch gap-3 sm:gap-5">
                {/* node */}
                <div
                  className={cn(
                    'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center self-start rounded-full border-2 text-sm font-bold transition-all sm:h-14 sm:w-14 sm:text-base',
                    done &&
                      'border-emerald-400/70 bg-emerald-500/15 text-emerald-300 shadow-[0_0_22px_rgba(16,185,129,0.4)]',
                    active &&
                      'animate-pulse border-primary/70 bg-primary/20 text-primary shadow-[0_0_22px_var(--ring)]',
                    !done && !active && 'border-border/60 bg-card/70 text-muted-foreground'
                  )}
                >
                  {done ? <Check className="h-5 w-5 sm:h-6 sm:w-6" /> : c.id}
                </div>

                {/* card */}
                <div
                  className={cn(
                    'group flex-1 rounded-2xl border bg-card/75 backdrop-blur-xl p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-lg hover:shadow-primary/5 sm:p-5',
                    active ? 'border-primary/40' : 'border-border/60'
                  )}
                >
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-muted-foreground">
                    <span>
                      {ja ? `${t.level} ${c.id}` : `第 ${c.id} ${t.level}`}
                    </span>
                    <span aria-hidden>·</span>
                    <span>{c.duration}</span>
                    {done && <span className="text-emerald-400">{t.cleared}</span>}
                    {active && <span className="text-primary">{t.active}</span>}
                  </div>

                  <h3 className="mt-1 text-lg font-bold sm:text-xl">{c.title}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{c.description}</p>

                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${c.progress}%` }}
                    />
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {playable && (
                      <Link
                        href={`${base}/learn/${c.id}/play`}
                        className="glow-primary inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-primary-foreground transition hover:opacity-90"
                      >
                        <Play className="h-3.5 w-3.5" />
                        {done ? t.replay : active ? t.resume : t.play}
                      </Link>
                    )}
                    <Link
                      href={`${base}/learn/${c.id}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border/60 px-4 py-1.5 text-xs font-medium text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      {t.doc}
                    </Link>
                  </div>
                </div>
              </div>
            </Reveal>
          </li>
        )
      })}
    </ol>
  )
}
