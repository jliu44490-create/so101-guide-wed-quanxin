'use client'

/**
 * Explainer dialog for the 电子学习伴侣. Controlled. Reused by:
 *   - the account-settings toggle (shown when switching the feature ON), and
 *   - a one-time auto-prompt for Plus members who haven't decided yet.
 *
 * It only explains + collects a yes/no; the caller owns persistence.
 */

import { Loader2, MessagesSquare, Sparkles } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const POINTS = [
  '答题时它会在一旁陪你：答对了发来祝贺，答错了顺手帮你讲清楚。',
  '看复杂文档时，点「让 LVJIN 讲讲」，它用大白话给你讲明白。',
  '它的讲解会消耗你的 AI 每日配额（与对话页共用同一份额度）。',
  '随时可在「账号设置」里关闭，不影响其他功能。'
]

export function CompanionIntroDialog({
  open,
  onOpenChange,
  onEnable,
  busy = false,
  dismissLabel = '以后再说'
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEnable: () => void
  busy?: boolean
  dismissLabel?: string
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/25">
            <MessagesSquare className="size-5" />
          </div>
          <DialogTitle>开启电子学习伴侣？</DialogTitle>
          <DialogDescription>
            一个会全站陪你的 AI 伙伴（Plus 专享）。开启后它会这样帮你：
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5 py-1 text-sm">
          {POINTS.map((p) => (
            <li key={p} className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="leading-relaxed text-muted-foreground">{p}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            {dismissLabel}
          </Button>
          <Button onClick={onEnable} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            开启伴侣
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
