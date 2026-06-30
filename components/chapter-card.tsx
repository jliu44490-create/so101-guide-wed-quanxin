'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, CheckCircle2, Clock, Gamepad2, Lock, Play } from 'lucide-react'
import { CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TiltCard } from '@/components/effects/tilt-card'
import { useProgress, applyUserProgress } from '@/lib/use-progress'
import { hasLesson } from '@/lib/lessons'
import { chapterRequiresAccess } from '@/lib/paywall'
import { useEntitlement } from '@/lib/use-entitlement'
import { CommentCountBadge } from '@/components/comment-count-badge'
import { cn } from '@/lib/utils'
import type { Chapter } from '@/lib/types'

interface ChapterCardProps {
  chapter: Chapter
}

const i18n = {
  zh: {
    completed: '已完成',
    inProgress: '学习中',
    locked: '未开始',
    progress: '学习进度',
    playLesson: '🎮 互动课',
    viewArticle: '📚 文档',
    lessonBadge: '互动课',
    onlyDoc: '只有文档'
  },
  ja: {
    completed: '完了',
    inProgress: '進行中',
    locked: '未開始',
    progress: '学習進捗',
    playLesson: '🎮 インタラクティブ',
    viewArticle: '📚 ドキュメント',
    lessonBadge: 'Interactive',
    onlyDoc: 'ドキュメントのみ'
  }
}

export function ChapterCard({ chapter: baseChapter }: ChapterCardProps) {
  const pathname = usePathname()
  const isJa = pathname?.startsWith('/ja') ?? false
  const t = isJa ? i18n.ja : i18n.zh
  const learnBase = isJa ? '/ja/learn' : '/learn'
  // Interactive lessons are CN-only for now. JP keeps article-only.
  const supportsLesson = !isJa && hasLesson(baseChapter.id)
  const playHref = `${learnBase}/${baseChapter.id}/play`
  const articleHref = `${learnBase}/${baseChapter.id}`

  const statusConfig = {
    completed: {
      icon: CheckCircle2,
      label: t.completed,
      badge:
        'bg-success/10 text-[var(--color-success)] border-[oklch(from_var(--success)_l_c_h/0.3)]'
    },
    'in-progress': {
      icon: Play,
      label: t.inProgress,
      badge: 'bg-primary/10 text-primary border-primary/30'
    },
    locked: {
      icon: Lock,
      label: t.locked,
      badge: 'bg-muted text-muted-foreground border-border'
    }
  } as const

  const { map } = useProgress()
  const { locked } = useEntitlement()
  const isPremiumLocked = chapterRequiresAccess(baseChapter.id) && locked
  const chapter = applyUserProgress(baseChapter, map)
  const status = statusConfig[chapter.status]
  const StatusIcon = status.icon

  return (
    // Not a Link — explicit action buttons live at the bottom. We deliberately
    // dropped the "whole card is clickable" pattern so the user is forced to
    // pick between interactive vs document on every chapter, rather than
    // getting routed somewhere by default.
    <TiltCard
      spotlight
      maxTilt={5}
      scale={1.01}
      className={cn(
        'h-full overflow-hidden rounded-xl border border-border/60 bg-card/60 transition-colors duration-300'
      )}
    >
      <CardContent className="relative flex h-full flex-col p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className={cn('text-xs font-medium', status.badge)}>
              <StatusIcon className="mr-1 h-3 w-3" />
              {status.label}
            </Badge>
            {supportsLesson && (
              <Badge
                variant="outline"
                className="border-accent/40 bg-accent/10 text-[10px] text-accent"
              >
                <Gamepad2 className="mr-0.5 h-2.5 w-2.5" />
                {t.lessonBadge}
              </Badge>
            )}
            {isPremiumLocked && (
              <Badge
                variant="outline"
                className="border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-600 dark:text-amber-400"
              >
                <Lock className="mr-0.5 h-2.5 w-2.5" />
                需解锁
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CommentCountBadge threadKey={`chapter:${baseChapter.id}`} />
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {chapter.duration}
            </span>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/15 to-accent/15 font-mono text-sm font-semibold text-primary ring-1 ring-border/60">
            {String(chapter.id).padStart(2, '0')}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold leading-snug">{chapter.title}</h3>
            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wide text-muted-foreground/80">
              {chapter.titleEn}
            </p>
          </div>
        </div>

        <p className="mt-3 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {chapter.description}
        </p>

        <div className="mt-5 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">{t.progress}</span>
            <span
              className={cn(
                'font-medium',
                chapter.progress === 100 && 'text-[var(--color-success)]',
                chapter.progress > 0 && chapter.progress < 100 && 'text-primary'
              )}
            >
              {chapter.progress}%
            </span>
          </div>
          <Progress
            value={chapter.progress}
            className={cn(
              'h-1.5',
              chapter.status === 'completed' &&
                '[&>[data-slot=progress-indicator]]:bg-[var(--color-success)]'
            )}
          />
        </div>

        {/* Dual-button action area — primary lesson + secondary doc.
           If no lesson exists, the doc button takes the full row. */}
        <div
          className={cn(
            'mt-4 grid gap-2',
            supportsLesson ? 'grid-cols-2' : 'grid-cols-1'
          )}
        >
          {supportsLesson && (
            <Button asChild size="sm" className="glow-primary h-10 text-xs sm:text-sm">
              <Link href={playHref}>
                <Gamepad2 className="mr-1 h-3.5 w-3.5" />
                {t.playLesson}
              </Link>
            </Button>
          )}
          <Button asChild size="sm" variant="outline" className="h-10 text-xs sm:text-sm">
            <Link href={articleHref}>
              <BookOpen className="mr-1 h-3.5 w-3.5" />
              {t.viewArticle}
            </Link>
          </Button>
        </div>
      </CardContent>
    </TiltCard>
  )
}
