'use client'

import { usePathname } from 'next/navigation'
import { BookOpen, Clock, Sparkles, Trophy } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Reveal, SpotlightCard } from '@/components/effects'
import { useChapterStats } from '@/lib/use-progress'

const i18n = {
  zh: { totalChapters: '总课程数', completed: '已完成', duration: '预计时长', minutes: '分钟', overallProgress: '总体进度', inProgressNote: '个学习中', lockedNote: '个未开始' },
  ja: { totalChapters: '章数', completed: '完了', duration: '予想所要時間', minutes: '分', overallProgress: '全体の進捗', inProgressNote: ' 進行中', lockedNote: ' 未開始' }
}

export function LearnStats() {
  const pathname = usePathname()
  const locale = pathname?.startsWith('/ja') ? 'ja' : 'zh'
  const t = i18n[locale]
  const { total, completed, inProgress, locked, totalMinutes, totalProgress } =
    useChapterStats()

  const cards = [
    {
      icon: BookOpen,
      label: t.totalChapters,
      value: total,
      bg: 'bg-primary/10',
      color: 'text-primary'
    },
    {
      icon: Trophy,
      label: t.completed,
      value: completed,
      bg: 'bg-success/10',
      color: 'text-[var(--color-success)]'
    },
    {
      icon: Clock,
      label: t.duration,
      value: `${totalMinutes} ${t.minutes}`,
      bg: 'bg-accent/10',
      color: 'text-accent'
    }
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((stat, i) => (
        <Reveal key={stat.label} delay={i * 60}>
          <SpotlightCard className="rounded-xl">
            <Card className="border-border/60 bg-card/60">
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold leading-none">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          </SpotlightCard>
        </Reveal>
      ))}

      <Reveal delay={180}>
        <SpotlightCard className="rounded-xl">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="p-5">
              <div className="mb-3 flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  {t.overallProgress}
                </p>
                <p className="text-sm font-medium">{totalProgress}%</p>
              </div>
              <Progress value={totalProgress} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {locale === 'ja'
                  ? `進行中 ${inProgress} · 未開始 ${locked}`
                  : `${inProgress}${t.inProgressNote} · ${locked}${t.lockedNote}`}
              </p>
            </CardContent>
          </Card>
        </SpotlightCard>
      </Reveal>
    </div>
  )
}
