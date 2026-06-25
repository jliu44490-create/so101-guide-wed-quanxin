'use client'

/**
 * Gamified header for the learn hub — level + XP bar, quick stats, and a badge
 * wall. XP is derived from chapter progress (completed = 100, in-progress = 50)
 * so it persists for free via the existing progress store; the day-streak comes
 * from learn-streak. No new persistence, no new dependencies.
 */

import { usePathname } from 'next/navigation'
import { Clock, Flame, Trophy, Zap } from 'lucide-react'
import { Reveal, SpotlightCard } from '@/components/effects'
import { CountUp } from '@/components/lesson-fx'
import { useChapterStats } from '@/lib/use-progress'
import { useStudyStreak } from '@/lib/learn-streak'
import { cn } from '@/lib/utils'

const XP_PER_LEVEL = 200

export function LearnHud() {
  const pathname = usePathname()
  const ja = pathname?.startsWith('/ja') ?? false
  const { completed, inProgress, total, totalMinutes, totalProgress } = useChapterStats()
  const streak = useStudyStreak(true)

  const xp = completed * 100 + inProgress * 50
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const intoLevel = xp % XP_PER_LEVEL
  const levelPct = Math.round((intoLevel / XP_PER_LEVEL) * 100)

  const t = ja
    ? { level: 'レベル', xp: 'XP', toNext: '次のレベルまで', cleared: 'クリア', days: '連続日数', mins: '総分', wall: 'バッジ' }
    : { level: '等级', xp: 'XP', toNext: '距下一级还差', cleared: '已通关', days: '连续天数', mins: '总分钟', wall: '徽章墙' }

  const badges = [
    { emoji: '🚀', label: ja ? 'スタート' : '起步', got: completed >= 1 },
    { emoji: '🎯', label: ja ? '折り返し' : '半程', got: total > 0 && completed >= Math.ceil(total / 2) },
    { emoji: '🏆', label: ja ? '全クリア' : '全通关', got: total > 0 && completed >= total },
    { emoji: '🔥', label: ja ? '3日連続' : '连续3天', got: streak >= 3 },
    { emoji: '📅', label: ja ? '7日連続' : '连续7天', got: streak >= 7 },
    { emoji: '💯', label: ja ? '満点' : '满分', got: totalProgress >= 100 }
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {/* Level + XP */}
      <Reveal className="lg:col-span-1">
        <SpotlightCard className="block h-full rounded-2xl">
          <div className="h-full rounded-2xl border border-amber-400/30 bg-card/75 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Zap className="h-4 w-4 text-amber-400" />
                {t.level}
              </span>
              <span className="text-3xl font-black text-amber-300">Lv.{level}</span>
            </div>
            <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-400 transition-all duration-500"
                style={{ width: `${levelPct}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-semibold text-amber-300">
                <CountUp to={xp} /> {t.xp}
              </span>{' '}
              · {t.toNext} {XP_PER_LEVEL - intoLevel}
            </p>
          </div>
        </SpotlightCard>
      </Reveal>

      {/* Quick stats */}
      <Reveal delay={80} className="lg:col-span-2">
        <div className="grid h-full grid-cols-3 gap-4">
          <StatChip icon={Trophy} color="text-emerald-400" value={`${completed}/${total}`} label={t.cleared} />
          <StatChip icon={Flame} color="text-orange-400" value={`${streak}`} label={t.days} />
          <StatChip icon={Clock} color="text-accent" value={`${totalMinutes}`} label={t.mins} />
        </div>
      </Reveal>

      {/* Badge wall */}
      <Reveal delay={160} className="lg:col-span-3">
        <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl p-4 sm:p-5">
          <p className="mb-3 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">
            <Trophy className="h-3.5 w-3.5" />
            {t.wall}
          </p>
          <div className="flex flex-wrap gap-3">
            {badges.map((b) => (
              <div
                key={b.label}
                className={cn(
                  'flex min-w-[68px] flex-col items-center gap-1 rounded-xl border px-3 py-3 transition-all',
                  b.got
                    ? 'border-amber-400/40 bg-amber-400/10 shadow-[0_0_16px_rgba(251,191,36,0.12)]'
                    : 'border-border/40 bg-card/30 opacity-40 grayscale'
                )}
                title={b.label}
              >
                <span className="text-2xl sm:text-3xl">{b.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </div>
  )
}

function StatChip({
  icon: Icon,
  color,
  value,
  label
}: {
  icon: React.ComponentType<{ className?: string }>
  color: string
  value: string
  label: string
}) {
  return (
    <SpotlightCard className="block h-full rounded-2xl">
      <div className="flex h-full flex-col justify-center rounded-2xl border border-border/60 bg-card/75 backdrop-blur-xl p-5">
        <Icon className={cn('h-5 w-5', color)} />
        <div className="mt-2 text-2xl font-bold leading-none tabular-nums">{value}</div>
        <div className="mt-1 text-xs text-muted-foreground">{label}</div>
      </div>
    </SpotlightCard>
  )
}
