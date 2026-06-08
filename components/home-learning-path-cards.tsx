'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bot,
  Brain,
  Cpu,
  Database,
  HelpCircle,
  Rocket,
  Settings,
  Sparkles,
  Zap
} from 'lucide-react'
import { useMemo } from 'react'
import { Reveal, TiltCard } from '@/components/effects'
import { useProgress, applyUserProgress } from '@/lib/use-progress'
import { chapters as chaptersZh } from '@/lib/course-data'
import { chaptersJa } from '@/lib/course-data-ja'

const stepIcons = [Brain, Cpu, Settings, Database, Sparkles, Rocket, HelpCircle, Bot, Zap]

const i18n = {
  zh: { completed: '已完成 ✓', inProgress: '学习中', locked: '未开始' },
  ja: { completed: '完了 ✓', inProgress: '進行中', locked: '未開始' }
}

export function HomeLearningPathCards() {
  const pathname = usePathname()
  const isJa = pathname?.startsWith('/ja') ?? false
  const t = isJa ? i18n.ja : i18n.zh
  const learnBase = isJa ? '/ja/learn' : '/learn'
  const baseChapters = isJa ? chaptersJa : chaptersZh

  const { map } = useProgress()
  const chapters = useMemo(
    () => baseChapters.map((c) => applyUserProgress(c, map)),
    [baseChapters, map]
  )
  const learningPath = chapters.slice(0, 6)

  return (
    <div className="grid min-w-0 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {learningPath.map((chapter, index) => {
        const Icon = stepIcons[index % stepIcons.length]
        return (
          <Reveal key={chapter.id} delay={index * 60} className="min-w-0">
            <Link
              href={`${learnBase}/${chapter.id}`}
              className="group relative block min-w-0"
            >
              <TiltCard
                spotlight
                maxTilt={6}
                className="h-full min-w-0 max-w-full overflow-hidden rounded-xl border border-border/60 bg-card/60"
              >
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 font-mono text-base font-bold text-primary ring-1 ring-border/60 transition-all group-hover:scale-110">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary" />
                        <h3 className="truncate font-semibold">{chapter.title}</h3>
                      </div>
                      <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                        {chapter.description}
                      </p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{chapter.duration}</span>
                        <span>·</span>
                        <span>
                          {chapter.status === 'completed'
                            ? t.completed
                            : chapter.status === 'in-progress'
                              ? t.inProgress
                              : t.locked}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            </Link>
          </Reveal>
        )
      })}
    </div>
  )
}
