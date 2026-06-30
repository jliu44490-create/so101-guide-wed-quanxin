'use client'

/**
 * Explainer dialog for the 电子学习伴侣 / 電子学習パートナー. Controlled. Reused by:
 *   - the account-settings toggle (shown when switching the feature ON), and
 *   - a one-time auto-prompt for Plus members who haven't decided yet.
 *
 * It only explains + collects a yes/no; the caller owns persistence.
 * Locale-aware via the pathname (/ja → Japanese).
 */

import { usePathname } from 'next/navigation'
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

const POINTS_ZH = [
  '答题时它会在一旁陪你：答对了发来祝贺，答错了顺手帮你讲清楚。',
  '看复杂文档时，点「让 LVJIN 讲讲」，它用大白话给你讲明白。',
  '它的讲解会消耗你的 AI 每日配额（与对话页共用同一份额度）。',
  '随时可在「账号设置」里关闭，不影响其他功能。'
]

const POINTS_JA = [
  '回答時にそばで応援：正解にはお祝い、間違えたらその場で分かりやすく解説。',
  '複雑なドキュメントでは「LVJIN に解説してもらう」を押すと、やさしい言葉で説明。',
  '解説は AI の 1 日の利用枠を消費します（対話ページと共通の枠）。',
  'いつでも「アカウント設定」でオフにでき、他の機能には影響しません。'
]

export function CompanionIntroDialog({
  open,
  onOpenChange,
  onEnable,
  busy = false,
  dismissLabel
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onEnable: () => void
  busy?: boolean
  dismissLabel?: string
}) {
  const isJa = usePathname()?.startsWith('/ja') ?? false
  const t = isJa
    ? {
        points: POINTS_JA,
        title: '電子学習パートナーを有効化？',
        desc: 'サイト全体で付き添う AI パートナー（Plus 専用）。有効化すると、こう手伝います：',
        dismiss: 'あとで',
        enable: '有効化する'
      }
    : {
        points: POINTS_ZH,
        title: '开启电子学习伴侣？',
        desc: '一个会全站陪你的 AI 伙伴（Plus 专享）。开启后它会这样帮你：',
        dismiss: '以后再说',
        enable: '开启伴侣'
      }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/25">
            <MessagesSquare className="size-5" />
          </div>
          <DialogTitle>{t.title}</DialogTitle>
          <DialogDescription>{t.desc}</DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5 py-1 text-sm">
          {t.points.map((p) => (
            <li key={p} className="flex items-start gap-2.5">
              <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
              <span className="leading-relaxed text-muted-foreground">{p}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={busy}>
            {dismissLabel ?? t.dismiss}
          </Button>
          <Button onClick={onEnable} disabled={busy} className="gap-1.5">
            {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
            {t.enable}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
