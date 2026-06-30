'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { CheckCircle2, Play, RotateCcw, Trophy } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { deriveStatus, useProgress } from '@/lib/use-progress'
import { cn } from '@/lib/utils'

interface ChapterProgressActionsProps {
  chapterId: number
  /** course-data 里的基础状态，仅用于第一次未访问时回显 */
  baseStatus: 'locked' | 'in-progress' | 'completed'
  baseProgress: number
}

const i18n = {
  zh: {
    completedTitle: '已完成本章 🎉',
    inProgressTitle: '学习中',
    lockedTitle: '未开始',
    completedAtPrefix: '完成于',
    syncNote: '完成后会同步到学习路径和首页统计',
    markCompleted: '标记为完成',
    markCompletedToast: '🎉 本章已标记完成',
    reset: '重置',
    resetToast: '已重置本章进度',
    dateLocale: 'zh-CN'
  },
  ja: {
    completedTitle: 'この章を完了しました 🎉',
    inProgressTitle: '進行中',
    lockedTitle: '未開始',
    completedAtPrefix: '完了日:',
    syncNote: '完了すると学習パスとホームの統計に反映されます',
    markCompleted: '完了にする',
    markCompletedToast: '🎉 この章を完了しました',
    reset: 'リセット',
    resetToast: 'この章の進捗をリセットしました',
    dateLocale: 'ja-JP'
  }
}

export function ChapterProgressActions({
  chapterId,
  baseStatus,
  baseProgress
}: ChapterProgressActionsProps) {
  const pathname = usePathname()
  const isJa = pathname?.startsWith('/ja') ?? false
  const t = isJa ? i18n.ja : i18n.zh
  const { map, markVisited, markCompleted, resetChapter, hydrated } = useProgress()
  const entry = map[chapterId]
  const progress = entry?.progress ?? baseProgress
  const status = deriveStatus(progress)

  // 首次访问自动标 in-progress（base 已经完成的不动）
  useEffect(() => {
    if (!hydrated) return
    if (!entry && baseStatus !== 'completed') {
      markVisited(chapterId)
    }
  }, [chapterId, entry, baseStatus, hydrated, markVisited])

  const isCompleted = status === 'completed'

  return (
    <div className="rounded-2xl border border-border/60 bg-card/40 p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-xl ring-1 ring-border/60',
              isCompleted
                ? 'bg-success/10 text-[var(--color-success)]'
                : status === 'in-progress'
                  ? 'bg-primary/10 text-primary'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {isCompleted ? (
              <Trophy className="h-5 w-5" />
            ) : status === 'in-progress' ? (
              <Play className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </div>
          <div>
            <p className="text-sm font-semibold">
              {isCompleted ? t.completedTitle : status === 'in-progress' ? t.inProgressTitle : t.lockedTitle}
            </p>
            <p className="text-xs text-muted-foreground">
              {isCompleted && entry?.completedAt
                ? `${t.completedAtPrefix} ${new Date(entry.completedAt).toLocaleDateString(t.dateLocale)}`
                : t.syncNote}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className={cn(
              'border-border/60 font-mono text-[10px] uppercase tracking-wider',
              isCompleted &&
                'border-[oklch(from_var(--success)_l_c_h/0.3)] bg-success/10 text-[var(--color-success)]'
            )}
          >
            {progress}%
          </Badge>
          {isCompleted ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetChapter(chapterId)
                toast.success(t.resetToast)
              }}
            >
              <RotateCcw className="mr-1 h-3.5 w-3.5" />
              {t.reset}
            </Button>
          ) : (
            <Button
              size="sm"
              className="glow-primary"
              onClick={() => {
                markCompleted(chapterId)
                toast.success(t.markCompletedToast)
              }}
            >
              <CheckCircle2 className="mr-1 h-3.5 w-3.5" />
              {t.markCompleted}
            </Button>
          )}
        </div>
      </div>

      <Progress
        value={progress}
        className={cn(
          'mt-4 h-1.5',
          isCompleted && '[&>[data-slot=progress-indicator]]:bg-[var(--color-success)]'
        )}
      />
    </div>
  )
}
