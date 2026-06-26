'use client'

import { ChevronDown, Lightbulb, Sparkles, Target, TriangleAlert } from 'lucide-react'
import { useState } from 'react'
import { usePathname } from 'next/navigation'
import { Prose } from '@/components/prose'
import { CodeBlock } from '@/components/code-block'
import { cn } from '@/lib/utils'
import type { Exercise, Pitfall, QuizItem, WalkthroughStep } from '@/lib/types'

/** Locale-aware labels for the callout chrome (zh default, ja mirror). */
function useCalloutT() {
  const isJa = usePathname()?.startsWith('/ja') ?? false
  return isJa
    ? {
        expected: '出力例',
        tip: 'ヒント',
        warning: '注意',
        cause: '根本的な原因',
        fix: '正しい理解',
        showHint: 'ヒントを見る',
        hideHint: 'ヒントを隠す',
        showAnswer: '答えを確認',
        hideAnswer: '答えを隠す',
        hint: 'ヒント',
        expectedResult: '期待される結果'
      }
    : {
        expected: '你应该看到',
        tip: '小提示',
        warning: '注意',
        cause: '根本原因',
        fix: '正确认识',
        showHint: '看一下提示',
        hideHint: '隐藏提示',
        showAnswer: '对一下答案',
        hideAnswer: '隐藏答案',
        hint: '提示',
        expectedResult: '预期结果'
      }
}

/**
 * Small visual primitives used by the new chapter sections.
 * Kept all in one file because each is short and they all share callout vibes.
 */

interface CalloutProps {
  tone: 'tip' | 'warning' | 'expected' | 'note'
  label: string
  children: React.ReactNode
}

function Callout({ tone, label, children }: CalloutProps) {
  const palette = {
    tip: {
      ring: 'border-yellow-500/30 bg-yellow-500/5',
      icon: <Lightbulb className="h-4 w-4 text-yellow-500" />,
      text: 'text-yellow-700 dark:text-yellow-300'
    },
    warning: {
      ring: 'border-rose-500/30 bg-rose-500/5',
      icon: <TriangleAlert className="h-4 w-4 text-rose-500" />,
      text: 'text-rose-700 dark:text-rose-300'
    },
    expected: {
      ring: 'border-emerald-500/30 bg-emerald-500/5',
      icon: <Sparkles className="h-4 w-4 text-emerald-500" />,
      text: 'text-emerald-700 dark:text-emerald-300'
    },
    note: {
      ring: 'border-border/60 bg-card/40',
      icon: <Target className="h-4 w-4 text-primary" />,
      text: 'text-foreground'
    }
  }[tone]

  return (
    <div className={cn('mt-3 rounded-lg border px-4 py-3', palette.ring)}>
      <div className={cn('mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider', palette.text)}>
        {palette.icon}
        {label}
      </div>
      <div className="text-sm leading-relaxed">{children}</div>
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Walkthrough — richer version of <Steps>                                 */
/* ────────────────────────────────────────────────────────────────────── */

export function WalkthroughBlock({ steps }: { steps: WalkthroughStep[] }) {
  const t = useCalloutT()
  return (
    <div className="space-y-7">
      {steps.map((step, i) => (
        <div key={i} className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white shadow-md shadow-primary/20">
              {i + 1}
            </div>
            {i < steps.length - 1 && (
              <div className="my-1 h-full w-px bg-gradient-to-b from-primary/50 to-transparent" />
            )}
          </div>
          <div className="min-w-0 flex-1 pb-3">
            <h4 className="text-base font-semibold">{step.title}</h4>
            <div className="mt-2">
              <Prose content={step.body} />
            </div>
            {step.command && (
              <div className="mt-3">
                <CodeBlock
                  code={step.command.code}
                  description={step.command.description}
                  language="bash"
                />
              </div>
            )}
            {step.expectedOutput && (
              <Callout tone="expected" label={t.expected}>
                <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-xs leading-relaxed">
                  {step.expectedOutput}
                </pre>
              </Callout>
            )}
            {step.tip && (
              <Callout tone="tip" label={t.tip}>
                <Prose content={step.tip} size="sm" />
              </Callout>
            )}
            {step.warning && (
              <Callout tone="warning" label={t.warning}>
                <Prose content={step.warning} size="sm" />
              </Callout>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Pitfalls                                                                */
/* ────────────────────────────────────────────────────────────────────── */

export function PitfallList({ items }: { items: Pitfall[] }) {
  const t = useCalloutT()
  return (
    <div className="space-y-3">
      {items.map((p, i) => (
        <div
          key={i}
          className="rounded-lg border border-rose-500/20 bg-rose-500/5 p-4"
        >
          <p className="font-medium leading-relaxed">{p.symptom}</p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                {t.cause}
              </p>
              <div className="mt-1 text-sm text-muted-foreground">
                <Prose content={p.cause} size="sm" />
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-500">
                {t.fix}
              </p>
              <div className="mt-1 text-sm">
                <Prose content={p.fix} size="sm" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Exercises                                                               */
/* ────────────────────────────────────────────────────────────────────── */

function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const t = useCalloutT()
  const [showHint, setShowHint] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
      <div className="flex items-start gap-2">
        <Target className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
        <h4 className="text-base font-semibold">{exercise.title}</h4>
      </div>
      <div className="mt-3 text-sm leading-relaxed">
        <Prose content={exercise.instructions} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {exercise.hint && (
          <button
            type="button"
            onClick={() => setShowHint((s) => !s)}
            className="inline-flex items-center gap-1 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-700 transition-colors hover:bg-yellow-500/15 dark:text-yellow-300"
          >
            <Lightbulb className="h-3 w-3" />
            {showHint ? t.hideHint : t.showHint}
          </button>
        )}
        {exercise.expectedResult && (
          <button
            type="button"
            onClick={() => setShowAnswer((s) => !s)}
            className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-700 transition-colors hover:bg-emerald-500/15 dark:text-emerald-300"
          >
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform',
                showAnswer && 'rotate-180'
              )}
            />
            {showAnswer ? t.hideAnswer : t.showAnswer}
          </button>
        )}
      </div>
      {showHint && exercise.hint && (
        <Callout tone="tip" label={t.hint}>
          <Prose content={exercise.hint} size="sm" />
        </Callout>
      )}
      {showAnswer && exercise.expectedResult && (
        <Callout tone="expected" label={t.expectedResult}>
          <Prose content={exercise.expectedResult} size="sm" />
        </Callout>
      )}
    </div>
  )
}

export function ExerciseList({ items }: { items: Exercise[] }) {
  return (
    <div className="space-y-4">
      {items.map((ex, i) => (
        <ExerciseCard key={i} exercise={ex} />
      ))}
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────── */
/* Self-check quiz                                                         */
/* ────────────────────────────────────────────────────────────────────── */

function QuizRow({ item, index }: { item: QuizItem; index: number }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-lg border border-border/60 bg-card/40">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-card/80"
        aria-expanded={open}
      >
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-semibold text-primary">
          {index + 1}
        </span>
        <span className="flex-1 text-sm font-medium leading-snug">{item.question}</span>
        <ChevronDown
          className={cn(
            'mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform',
            open && 'rotate-180'
          )}
        />
      </button>
      {open && (
        <div className="border-t border-border/40 px-4 py-3 text-sm text-muted-foreground">
          <Prose content={item.answer} size="sm" />
        </div>
      )}
    </div>
  )
}

export function QuizList({ items }: { items: QuizItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <QuizRow key={i} item={item} index={i} />
      ))}
    </div>
  )
}
