'use client'

/**
 * Interactive lesson player.
 *
 * Renders a Lesson as a sequence of single-screen cards. Reads exactly like
 * Duolingo / Brilliant: one new idea per card, click to advance, immediate
 * feedback on every interaction.
 *
 * Why all card types live in one file:
 *   They share a lot of helpers (CardShell, Prose wrapper, NextButton, the
 *   confetti hook). Splitting into 9 files would 3x the import noise without
 *   improving readability — each card view is ~30 LOC.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Gamepad2,
  X
} from 'lucide-react'
import { toast } from 'sonner'
import { Prose } from '@/components/prose'
import { Mermaid } from '@/components/mermaid'
import { CodeBlock } from '@/components/code-block'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useProgress } from '@/lib/use-progress'
import { emitCompanion } from '@/lib/companion-bus'
import { cn } from '@/lib/utils'
import type {
  Card,
  ChoiceCard,
  ChoiceOption,
  CommandCard,
  CompletionCard,
  IntroCard,
  Lesson,
  MCQCard,
  MatchCard,
  NumericCard,
  RecapCard,
  RevealCard,
  VizCard
} from '@/lib/lesson-types'

function seededRandom(seed: number) {
  let value = seed + 0x6d2b79f5
  value = Math.imul(value ^ (value >>> 15), value | 1)
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61)
  return ((value ^ (value >>> 14)) >>> 0) / 4294967296
}

function hashText(value: string) {
  let hash = 2166136261
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const CONFETTI_SYMBOLS = ['🎉', '✨', '🎊', '⭐', '💫', '🌟', '🎈']

/** Best-effort question text for a card, for the companion's "讲讲" prompt. */
function questionOf(card: Card): string | undefined {
  if ('question' in card && card.question) return card.question
  if ('prompt' in card && card.prompt) return card.prompt
  if ('title' in card && card.title) return card.title
  return undefined
}

/* ────────────────────────────────────────────────────────────────────── */
/* Confetti — pure CSS particles, no library                              */
/* ────────────────────────────────────────────────────────────────────── */

function Confetti() {
  const items = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        s: CONFETTI_SYMBOLS[i % CONFETTI_SYMBOLS.length],
        dx: (seededRandom(i + 11) - 0.5) * 800,
        dy: -200 - seededRandom(i + 29) * 400,
        rot: (seededRandom(i + 47) - 0.5) * 720,
        delay: i * 18,
        dur: 1200 + seededRandom(i + 71) * 600
      })),
    []
  )

  return (
    <>
      <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
        {items.map((p, i) => (
          <span
            key={i}
            className="absolute left-1/2 top-1/2 text-3xl will-change-transform"
            style={{
              ['--dx' as string]: `${p.dx}px`,
              ['--dy' as string]: `${p.dy}px`,
              ['--rot' as string]: `${p.rot}deg`,
              animation: `confetti-burst ${p.dur}ms cubic-bezier(.18,.65,.55,1) ${p.delay}ms forwards`
            }}
          >
            {p.s}
          </span>
        ))}
      </div>
      <style>{`
        @keyframes confetti-burst {
          0%   { transform: translate(-50%, -50%) rotate(0deg); opacity: 1; }
          70%  { opacity: 1; }
          100% { transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) + 600px)) rotate(var(--rot)); opacity: 0; }
        }
      `}</style>
    </>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Top-level player                                                        */
/* ────────────────────────────────────────────────────────────────────── */

interface LessonPlayerProps {
  lesson: Lesson
}

export function LessonPlayer({ lesson }: LessonPlayerProps) {
  const [index, setIndex] = useState(0)
  const [streak, setStreak] = useState(0)
  const [confettiKey, setConfettiKey] = useState(0)
  const { markCompleted } = useProgress()

  const total = lesson.cards.length
  const card = lesson.cards[index]
  const isLast = index === total - 1
  const progress = ((index + 1) / total) * 100

  const triggerConfetti = useCallback(() => {
    setConfettiKey((k) => k + 1)
  }, [])

  const next = useCallback(() => {
    if (index < total - 1) {
      setIndex((i) => i + 1)
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      markCompleted(lesson.chapterId)
      toast.success('🎉 这一课已完成')
    }
  }, [index, total, markCompleted, lesson.chapterId])

  const prev = useCallback(() => {
    if (index > 0) {
      setIndex((i) => i - 1)
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [index])

  const onCorrect = useCallback(() => {
    setStreak((s) => s + 1)
    triggerConfetti()
    // Cheer from the 学习伴侣 (no-op unless an opted-in Plus user is watching).
    emitCompanion({ type: 'lesson-correct' })
  }, [triggerConfetti])

  const onWrong = useCallback(() => {
    setStreak(0)
    emitCompanion({ type: 'lesson-wrong', chapterId: lesson.chapterId, question: questionOf(card) })
  }, [card, lesson.chapterId])

  // Keyboard nav: Enter / → to advance, ← to go back (when not in input).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prev])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar: mode switcher + progress + escape */}
      <header className="sticky top-0 z-30 border-b border-border/40 bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center gap-3 px-4 py-3 sm:gap-4 sm:px-6 lg:px-8">
          <Link
            href="/learn"
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            aria-label="退出本课"
          >
            <X className="h-4 w-4" />
          </Link>

          {/* Persistent mode switcher — works on any card */}
          <div className="hidden shrink-0 items-center gap-0.5 rounded-full border border-border/60 bg-card/60 p-0.5 sm:flex">
            <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
              <Gamepad2 className="h-3 w-3" />
              互动课
            </span>
            <Link
              href={`/learn/${lesson.chapterId}`}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <BookOpen className="h-3 w-3" />
              文档
            </Link>
          </div>

          <div className="flex-1">
            <div className="h-2 overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] uppercase tracking-wider text-muted-foreground">
              <span>
                第 {lesson.chapterId} 课 · {index + 1} / {total}
              </span>
              {streak >= 2 && (
                <span className="inline-flex items-center gap-0.5 text-orange-500">
                  🔥 {streak} 连对
                </span>
              )}
            </div>
          </div>

          {/* Mobile-only doc shortcut (icon button) */}
          <Link
            href={`/learn/${lesson.chapterId}`}
            className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:hidden"
            aria-label="查看文档"
          >
            <BookOpen className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12 lg:px-12 lg:py-20">
        <div
          key={card.id}
          className="w-full max-w-3xl animate-in fade-in slide-in-from-bottom-2 duration-300 lg:max-w-4xl"
        >
          <CardSwitch
            card={card}
            isLast={isLast}
            onNext={next}
            onCorrect={onCorrect}
            onWrong={onWrong}
          />
        </div>
      </main>

      <footer className="border-t border-border/40 bg-background/60 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={prev}
            disabled={index === 0}
            className="text-xs text-muted-foreground"
          >
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            上一卡
          </Button>
          <p className="hidden text-[10px] text-muted-foreground sm:block">
            ← / → 翻卡 · Esc 退出
          </p>
          <Link
            href={`/learn/${lesson.chapterId}`}
            className="hidden items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
          >
            <BookOpen className="h-3.5 w-3.5" />
            查看完整文档
          </Link>
        </div>
      </footer>

      {confettiKey > 0 && <Confetti key={confettiKey} />}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Card switch                                                             */
/* ────────────────────────────────────────────────────────────────────── */

interface CardCallbacks {
  isLast: boolean
  onNext: () => void
  onCorrect: () => void
  onWrong: () => void
}

function CardSwitch({ card, ...cb }: { card: Card } & CardCallbacks) {
  switch (card.type) {
    case 'intro':
      return <IntroCardView card={card} {...cb} />
    case 'reveal':
      return <RevealCardView card={card} {...cb} />
    case 'choice':
      return <ChoiceCardView card={card} {...cb} />
    case 'mcq':
      return <MCQCardView card={card} {...cb} />
    case 'match':
      return <MatchCardView card={card} {...cb} />
    case 'viz':
      return <VizCardView card={card} {...cb} />
    case 'numeric':
      return <NumericCardView card={card} {...cb} />
    case 'command':
      return <CommandCardView card={card} {...cb} />
    case 'recap':
      return <RecapCardView card={card} {...cb} />
    case 'completion':
      return <CompletionCardView card={card} {...cb} />
  }
}

/* ────────────────────────────────────────────────────────────────────── */
/* Shared bits                                                             */
/* ────────────────────────────────────────────────────────────────────── */

function NextButton({
  onClick,
  label = '继续',
  size = 'lg',
  variant = 'default'
}: {
  onClick: () => void
  label?: string
  size?: 'sm' | 'lg'
  variant?: 'default' | 'outline'
}) {
  return (
    <Button
      onClick={onClick}
      size={size}
      variant={variant}
      className={cn(
        'group h-12 px-8 text-base sm:h-14 sm:px-12 sm:text-lg',
        variant === 'default' && 'glow-primary'
      )}
    >
      {label}
      <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5 sm:h-5 sm:w-5" />
    </Button>
  )
}

function CardShell({ children }: { children: React.ReactNode }) {
  return <div className="space-y-6 sm:space-y-8 lg:space-y-10">{children}</div>
}

/* ────────────────────────────────────────────────────────────────────── */
/* Intro                                                                   */
/* ────────────────────────────────────────────────────────────────────── */

function IntroCardView({
  card,
  onNext
}: { card: IntroCard } & CardCallbacks) {
  return (
    <CardShell>
      {card.emoji && (
        <div className="text-center text-7xl sm:text-8xl lg:text-9xl">
          {card.emoji}
        </div>
      )}
      {card.title && (
        <h1 className="text-center text-3xl font-bold leading-tight sm:text-5xl lg:text-6xl">
          {card.title}
        </h1>
      )}
      <div className="mx-auto max-w-2xl text-center text-lg leading-relaxed text-muted-foreground sm:text-2xl lg:text-3xl lg:leading-snug">
        <Prose content={card.body} size="inherit" />
      </div>
      <div className="flex justify-center pt-2 sm:pt-4">
        <NextButton onClick={onNext} label={card.cta ?? '继续'} />
      </div>
    </CardShell>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Reveal                                                                  */
/* ────────────────────────────────────────────────────────────────────── */

function RevealCardView({
  card,
  onNext
}: { card: RevealCard } & CardCallbacks) {
  const [revealed, setRevealed] = useState(false)
  return (
    <CardShell>
      <div className="mx-auto max-w-2xl text-center text-xl leading-relaxed sm:text-2xl lg:text-3xl lg:leading-snug">
        <Prose content={card.prompt} size="inherit" />
      </div>

      {!revealed ? (
        <div className="flex justify-center pt-2">
          <NextButton onClick={() => setRevealed(true)} label={card.revealCta} />
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-6 sm:space-y-8">
          <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-accent/10 p-6 sm:p-10 lg:p-12">
            <div className="text-base leading-relaxed sm:text-lg lg:text-xl">
              <Prose content={card.reveal} size="inherit" />
            </div>
          </div>
          <div className="flex justify-center">
            <NextButton onClick={onNext} label={card.followCta ?? '继续'} />
          </div>
        </div>
      )}
    </CardShell>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Choice (soft branching, any answer can proceed)                         */
/* ────────────────────────────────────────────────────────────────────── */

function ChoiceCardView({
  card,
  onNext,
  onCorrect,
  onWrong
}: { card: ChoiceCard } & CardCallbacks) {
  const [picked, setPicked] = useState<ChoiceOption | null>(null)
  const anyCorrect = card.options.some((o) => o.correct)

  const handlePick = (opt: ChoiceOption) => {
    if (picked) return
    setPicked(opt)
    if (anyCorrect) {
      if (opt.correct) onCorrect()
      else onWrong()
    }
  }

  return (
    <CardShell>
      <div className="text-center text-xl font-semibold leading-snug sm:text-3xl lg:text-4xl lg:leading-snug">
        <Prose content={card.question} size="inherit" />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {card.options.map((opt) => {
          const isPicked = picked?.id === opt.id
          const showStateIcon = picked && opt.correct
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePick(opt)}
              disabled={!!picked}
              className={cn(
                'group flex w-full items-start gap-3 rounded-xl border bg-card/60 p-4 text-left transition-all sm:gap-4 sm:p-5 lg:p-6',
                !picked && 'hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card hover:shadow-md hover:shadow-primary/5',
                isPicked && opt.correct && 'border-emerald-500/60 bg-emerald-500/10',
                isPicked && !opt.correct && anyCorrect && 'border-rose-500/60 bg-rose-500/10',
                isPicked && !anyCorrect && 'border-primary/60 bg-primary/10',
                !isPicked && picked && 'opacity-40',
                'border-border/60'
              )}
            >
              {opt.emoji && <span className="text-2xl sm:text-3xl">{opt.emoji}</span>}
              <span className="flex-1 text-base font-medium leading-snug sm:text-lg lg:text-xl">
                {opt.label}
              </span>
              {showStateIcon && (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500 sm:h-6 sm:w-6" />
              )}
              {isPicked && !opt.correct && anyCorrect && (
                <X className="mt-0.5 h-5 w-5 shrink-0 text-rose-500 sm:h-6 sm:w-6" />
              )}
            </button>
          )
        })}
      </div>

      {picked && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 sm:space-y-6">
          <div
            className={cn(
              'rounded-xl border p-5 sm:p-7',
              anyCorrect && picked.correct && 'border-emerald-500/30 bg-emerald-500/5',
              anyCorrect && !picked.correct && 'border-rose-500/30 bg-rose-500/5',
              !anyCorrect && 'border-primary/30 bg-primary/5'
            )}
          >
            <div className="text-base leading-relaxed sm:text-lg">
              <Prose content={picked.feedback} size="inherit" />
            </div>
          </div>
          <div className="flex justify-center">
            <NextButton onClick={onNext} />
          </div>
        </div>
      )}
    </CardShell>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* MCQ (must pick correct to proceed efficiently, but soft on retry)       */
/* ────────────────────────────────────────────────────────────────────── */

function MCQCardView({
  card,
  onNext,
  onCorrect,
  onWrong
}: { card: MCQCard } & CardCallbacks) {
  const [picked, setPicked] = useState<string | null>(null)
  const correct = picked === card.correctOptionId

  const handlePick = (id: string) => {
    if (picked) return
    setPicked(id)
    if (id === card.correctOptionId) onCorrect()
    else onWrong()
  }

  return (
    <CardShell>
      <div className="text-center text-xl font-semibold leading-snug sm:text-3xl lg:text-4xl lg:leading-snug">
        <Prose content={card.question} size="inherit" />
      </div>

      <div className="space-y-3 sm:space-y-4">
        {card.options.map((opt, idx) => {
          const isPicked = picked === opt.id
          const isAnswer = picked && opt.id === card.correctOptionId
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => handlePick(opt.id)}
              disabled={!!picked}
              className={cn(
                'group flex w-full items-start gap-3 rounded-xl border bg-card/60 p-4 text-left transition-all sm:gap-4 sm:p-5 lg:p-6',
                !picked && 'hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card',
                isAnswer && 'border-emerald-500/60 bg-emerald-500/10',
                isPicked && !correct && 'border-rose-500/60 bg-rose-500/10',
                !isPicked && picked && !isAnswer && 'opacity-40',
                'border-border/60'
              )}
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs sm:h-8 sm:w-8 sm:text-sm">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="flex-1 text-base font-medium leading-snug sm:text-lg lg:text-xl">
                {opt.label}
              </span>
              {isAnswer && (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500 sm:h-6 sm:w-6" />
              )}
              {isPicked && !correct && (
                <X className="mt-0.5 h-5 w-5 shrink-0 text-rose-500 sm:h-6 sm:w-6" />
              )}
            </button>
          )
        })}
      </div>

      {picked && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 sm:space-y-6">
          <div
            className={cn(
              'rounded-xl border p-5 sm:p-7',
              correct
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-rose-500/30 bg-rose-500/5'
            )}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider sm:text-sm">
              {correct ? '✅ 答对了' : '🤔 别灰心 — 真正的答案是：'}
            </p>
            <div className="text-base leading-relaxed sm:text-lg">
              <Prose content={card.explanation} size="inherit" />
            </div>
          </div>
          <div className="flex justify-center">
            <NextButton onClick={onNext} />
          </div>
        </div>
      )}
    </CardShell>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Match — click left, then click right to pair                            */
/* ────────────────────────────────────────────────────────────────────── */

function MatchCardView({
  card,
  onNext,
  onCorrect
}: { card: MatchCard } & CardCallbacks) {
  // Shuffled right column. Generate once.
  const shuffledRights = useMemo(() => {
    const arr = card.pairs.map((p, i) => ({ value: p.right, originalIdx: i }))
    const seedBase = hashText(card.pairs.map((p) => `${p.left}:${p.right}`).join('|'))
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom(seedBase + i) * (i + 1))
      ;[arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }, [card.pairs])

  const [selectedLeft, setSelectedLeft] = useState<number | null>(null)
  const [matches, setMatches] = useState<Record<number, number>>({}) // left idx -> right originalIdx
  const [wrongFlash, setWrongFlash] = useState<{ left: number; right: number } | null>(null)
  const triggeredCelebration = useRef(false)

  const allMatched = Object.keys(matches).length === card.pairs.length

  useEffect(() => {
    if (allMatched && !triggeredCelebration.current) {
      triggeredCelebration.current = true
      onCorrect()
    }
  }, [allMatched, onCorrect])

  const handleLeftClick = (idx: number) => {
    if (idx in matches) return
    setSelectedLeft(idx)
  }

  const handleRightClick = (originalIdx: number) => {
    if (selectedLeft === null) return
    if (Object.values(matches).includes(originalIdx)) return
    if (selectedLeft === originalIdx) {
      setMatches((m) => ({ ...m, [selectedLeft]: originalIdx }))
      setSelectedLeft(null)
    } else {
      setWrongFlash({ left: selectedLeft, right: originalIdx })
      setTimeout(() => setWrongFlash(null), 600)
      setSelectedLeft(null)
    }
  }

  return (
    <CardShell>
      <div className="text-center text-xl font-semibold leading-snug sm:text-3xl lg:text-4xl">
        <Prose content={card.prompt} size="inherit" />
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-5">
        <div className="space-y-2 sm:space-y-3">
          {card.pairs.map((pair, leftIdx) => {
            const matched = leftIdx in matches
            const selected = selectedLeft === leftIdx
            const wrongHere = wrongFlash?.left === leftIdx
            return (
              <button
                key={leftIdx}
                type="button"
                onClick={() => handleLeftClick(leftIdx)}
                disabled={matched}
                className={cn(
                  'flex w-full items-center rounded-lg border p-3 text-left text-base font-medium transition-all sm:p-5 sm:text-lg lg:text-xl',
                  matched && 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                  !matched && selected && 'border-primary bg-primary/15 shadow-md shadow-primary/20',
                  !matched && !selected && 'border-border/60 bg-card/60 hover:border-primary/40',
                  wrongHere && 'animate-pulse border-rose-500 bg-rose-500/10'
                )}
              >
                {pair.left}
              </button>
            )
          })}
        </div>

        <div className="space-y-2 sm:space-y-3">
          {shuffledRights.map((right) => {
            const matched = Object.values(matches).includes(right.originalIdx)
            const wrongHere = wrongFlash?.right === right.originalIdx
            return (
              <button
                key={right.originalIdx}
                type="button"
                onClick={() => handleRightClick(right.originalIdx)}
                disabled={matched || selectedLeft === null}
                className={cn(
                  'flex w-full items-center rounded-lg border p-3 text-left text-base transition-all sm:p-5 sm:text-lg',
                  matched && 'border-emerald-500/60 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
                  !matched && selectedLeft !== null && 'border-border/60 bg-card/80 hover:border-primary/50 hover:-translate-y-0.5',
                  !matched && selectedLeft === null && 'border-border/40 bg-card/40 text-muted-foreground',
                  wrongHere && 'animate-pulse border-rose-500 bg-rose-500/10'
                )}
              >
                {right.value}
              </button>
            )
          })}
        </div>
      </div>

      {allMatched && (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 sm:space-y-6">
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5 text-center sm:p-7">
            <p className="text-lg font-semibold sm:text-xl">✨ 三对全配出来了</p>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              这三个词后面会反复出现，记住它们值。
            </p>
          </div>
          <div className="flex justify-center">
            <NextButton onClick={onNext} />
          </div>
        </div>
      )}
    </CardShell>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Viz — Mermaid or image                                                  */
/* ────────────────────────────────────────────────────────────────────── */

function VizCardView({
  card,
  onNext
}: { card: VizCard } & CardCallbacks) {
  return (
    <CardShell>
      {card.title && (
        <h2 className="text-center text-2xl font-bold sm:text-4xl lg:text-5xl">
          {card.title}
        </h2>
      )}
      {card.body && (
        <div className="mx-auto max-w-2xl text-center text-base text-muted-foreground sm:text-lg lg:text-xl">
          <Prose content={card.body} size="inherit" />
        </div>
      )}
      {card.mermaid && (
        <div className="text-lg sm:text-xl">
          <Mermaid source={card.mermaid} caption={card.caption} />
        </div>
      )}
      {card.imageSrc && (
        <figure className="overflow-hidden rounded-xl border border-border/60 bg-card/40">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={card.imageSrc}
            alt={card.imageAlt ?? ''}
            className="w-full"
            loading="lazy"
            decoding="async"
          />
          {card.caption && (
            <figcaption className="border-t border-border/40 bg-background/40 px-4 py-2 text-xs text-muted-foreground sm:px-6 sm:py-3 sm:text-sm">
              {card.caption}
            </figcaption>
          )}
        </figure>
      )}
      <div className="flex justify-center">
        <NextButton onClick={onNext} label="懂了 →" />
      </div>
    </CardShell>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Numeric                                                                 */
/* ────────────────────────────────────────────────────────────────────── */

function NumericCardView({
  card,
  onNext,
  onCorrect,
  onWrong
}: { card: NumericCard } & CardCallbacks) {
  const [value, setValue] = useState('')
  const [showHint, setShowHint] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const submit = () => {
    if (submitted || !value) return
    const num = parseFloat(value)
    if (Number.isNaN(num)) {
      toast.error('请输入一个数字')
      return
    }
    const tol = card.tolerance ?? 0
    const ok = Math.abs(num - card.answer) <= tol
    setCorrect(ok)
    setSubmitted(true)
    if (ok) onCorrect()
    else onWrong()
  }

  return (
    <CardShell>
      <div className="text-center text-xl font-semibold leading-snug sm:text-3xl lg:text-4xl lg:leading-snug">
        <Prose content={card.question} size="inherit" />
      </div>

      <div className="mx-auto flex max-w-md items-center gap-3">
        <Input
          ref={inputRef}
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          disabled={submitted}
          placeholder="输入数字"
          className="h-14 text-center text-xl sm:h-16 sm:text-2xl"
        />
        {card.unit && (
          <span className="text-base text-muted-foreground sm:text-lg">{card.unit}</span>
        )}
      </div>

      {!submitted ? (
        <div className="flex flex-col items-center gap-3 sm:gap-4">
          <Button
            onClick={submit}
            disabled={!value}
            size="lg"
            className="glow-primary h-12 px-8 text-base sm:h-14 sm:px-12 sm:text-lg"
          >
            <Check className="mr-1 h-4 w-4 sm:h-5 sm:w-5" />
            提交答案
          </Button>
          {card.hint && (
            <button
              type="button"
              onClick={() => setShowHint((s) => !s)}
              className="text-xs text-muted-foreground hover:text-foreground hover:underline sm:text-sm"
            >
              {showHint ? '收起提示' : '想不出来？看一下提示'}
            </button>
          )}
          {showHint && card.hint && (
            <div className="max-w-lg rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 text-sm text-yellow-700 dark:text-yellow-300 sm:p-5 sm:text-base">
              💡 {card.hint}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4 sm:space-y-6">
          <div
            className={cn(
              'rounded-xl border p-5 sm:p-7',
              correct
                ? 'border-emerald-500/30 bg-emerald-500/5'
                : 'border-rose-500/30 bg-rose-500/5'
            )}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wider sm:text-sm">
              {correct
                ? '✅ 答对了'
                : `❌ 你写了 ${value}，正确答案是 ${card.answer}${card.unit ?? ''}`}
            </p>
            <div className="text-base leading-relaxed sm:text-lg">
              <Prose content={card.explanation} size="inherit" />
            </div>
          </div>
          <div className="flex justify-center">
            <NextButton onClick={onNext} />
          </div>
        </div>
      )}
    </CardShell>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Command — bash/code block + expected output + tip                       */
/* ────────────────────────────────────────────────────────────────────── */

function CommandCardView({
  card,
  onNext
}: { card: CommandCard } & CardCallbacks) {
  return (
    <CardShell>
      <h2 className="text-center text-2xl font-bold sm:text-4xl lg:text-5xl">
        {card.title}
      </h2>
      {card.intro && (
        <div className="mx-auto max-w-2xl text-center text-base text-muted-foreground sm:text-lg lg:text-xl">
          <Prose content={card.intro} size="inherit" />
        </div>
      )}
      <div className="space-y-4">
        <p className="text-sm font-medium text-muted-foreground sm:text-base">
          {card.description}
        </p>
        <CodeBlock
          code={card.code}
          language={card.language ?? 'bash'}
        />
        {card.expectedOutput && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
              ✨ 你应该看到
            </p>
            <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed sm:text-sm">
              {card.expectedOutput}
            </pre>
          </div>
        )}
        {card.tip && (
          <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4 sm:p-5">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-yellow-700 dark:text-yellow-300">
              💡 小提示
            </p>
            <div className="text-sm leading-relaxed sm:text-base">
              <Prose content={card.tip} size="sm" />
            </div>
          </div>
        )}
        {card.warning && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-4 sm:p-5">
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-rose-700 dark:text-rose-300">
              ⚠️ 注意
            </p>
            <div className="text-sm leading-relaxed sm:text-base">
              <Prose content={card.warning} size="sm" />
            </div>
          </div>
        )}
      </div>
      <div className="flex justify-center pt-2">
        <NextButton onClick={onNext} label="懂了 →" />
      </div>
    </CardShell>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Recap                                                                   */
/* ────────────────────────────────────────────────────────────────────── */

function RecapCardView({
  card,
  onNext
}: { card: RecapCard } & CardCallbacks) {
  return (
    <CardShell>
      <h2 className="text-center text-2xl font-bold sm:text-4xl lg:text-5xl">{card.title}</h2>
      <ul className="space-y-3 sm:space-y-4">
        {card.bullets.map((b, i) => (
          <li
            key={i}
            className="animate-in fade-in slide-in-from-left-2 fill-mode-both rounded-lg border border-border/60 bg-card/40 p-4 text-base leading-relaxed sm:p-6 sm:text-lg lg:text-xl"
            style={{ animationDelay: `${i * 100}ms`, animationDuration: '400ms' }}
          >
            <Prose content={b} size="inherit" />
          </li>
        ))}
      </ul>
      <div className="flex justify-center pt-2">
        <NextButton onClick={onNext} label="完成本课 →" />
      </div>
    </CardShell>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Completion                                                              */
/* ────────────────────────────────────────────────────────────────────── */

function CompletionCardView({
  card,
  onNext
}: { card: CompletionCard } & CardCallbacks) {
  const triggeredRef = useRef(false)

  useEffect(() => {
    if (triggeredRef.current) return
    triggeredRef.current = true
    onNext() // marks chapter completed in useProgress + toast
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Chapter id for the article jump (we don't store it on the card, but
  // nextChapterId - 1 == current chapter id).
  const currentChapterId = card.nextChapterId ? card.nextChapterId - 1 : 1
  return (
    <CardShell>
      <div className="text-center text-7xl sm:text-9xl">🏆</div>
      <h1 className="text-center text-3xl font-bold sm:text-5xl lg:text-6xl">
        {card.title}
      </h1>
      <div className="mx-auto max-w-2xl text-center text-base text-muted-foreground sm:text-xl lg:text-2xl lg:leading-snug">
        <Prose content={card.body} size="inherit" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {card.nextChapterId && (
          <Button
            asChild
            size="lg"
            className="glow-primary h-14 px-4 text-base sm:h-16 sm:text-lg"
          >
            <Link href={`/learn/${card.nextChapterId}/play`}>
              🎮 第 {card.nextChapterId} 课
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-14 px-4 text-base sm:h-16 sm:text-lg"
        >
          <Link href={`/learn/${currentChapterId}`}>
            <BookOpen className="mr-1 h-4 w-4" />
            看本章文档
          </Link>
        </Button>
        <Button
          asChild
          size="lg"
          variant="ghost"
          className="h-14 px-4 text-base sm:h-16 sm:text-lg"
        >
          <Link href="/learn">回到学习路径</Link>
        </Button>
      </div>
    </CardShell>
  )
}
