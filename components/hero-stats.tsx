'use client'

import { AnimatedCounter } from '@/components/animated-counter'
import { Reveal, ShimmerText, SpotlightCard } from '@/components/effects'
import { useChapterStats } from '@/lib/use-progress'

type Locale = 'zh' | 'ja'

const labels = {
  zh: { chapters: '总章节', duration: '预计时长', progress: '完成率', errors: '错误条目', chapterSuffix: ' 章', minSuffix: ' 分钟' },
  ja: { chapters: '章数', duration: '予想所要時間', progress: '完了率', errors: 'エラー事例', chapterSuffix: ' 章', minSuffix: ' 分' }
}

export function HeroStats({
  errorCount = 30,
  locale = 'zh'
}: { errorCount?: number; locale?: Locale }) {
  const { total, totalProgress, totalMinutes } = useChapterStats()
  const t = labels[locale]

  const stats = [
    { label: t.chapters, value: total, suffix: t.chapterSuffix },
    { label: t.duration, value: totalMinutes, suffix: t.minSuffix },
    { label: t.progress, value: totalProgress, suffix: '%' },
    { label: t.errors, value: errorCount, suffix: '+' }
  ]

  return (
    <Reveal delay={1200}>
      <div className="mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
        {stats.map((stat) => (
          <SpotlightCard
            key={stat.label}
            className="rounded-2xl border border-border/60 bg-card/60 px-4 py-4 text-left backdrop-blur-md transition-colors hover:border-primary/30"
          >
            <div className="text-2xl font-bold tracking-tight sm:text-3xl">
              <ShimmerText>
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </ShimmerText>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{stat.label}</p>
          </SpotlightCard>
        ))}
      </div>
    </Reveal>
  )
}
