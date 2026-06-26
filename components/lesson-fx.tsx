'use client'

/**
 * Visual "juice" for the interactive lessons — all pure CSS / canvas-free,
 * zero dependencies. These are the small rewards that make answering feel like
 * a game: number count-ups, combo pops, spark bursts, star ratings.
 */

import { useEffect, useRef, useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { cn } from '@/lib/utils'
import { isSfxMuted, setSfxMuted, SFX_MUTE_EVENT } from '@/lib/lesson-sfx'

/* ── Count-up number (replaces reactbits "Count Up", no deps) ───────────── */

export function CountUp({
  to,
  durationMs = 900,
  className
}: {
  to: number
  durationMs?: number
  className?: string
}) {
  const [value, setValue] = useState(0)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / durationMs)
      // easeOutCubic — fast then settle, feels rewarding
      const eased = 1 - Math.pow(1 - t, 3)
      setValue(Math.round(eased * to))
      if (t < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [to, durationMs])

  return <span className={className}>{value.toLocaleString()}</span>
}

/* ── Combo popup — flies up and fades on streak milestones ──────────────── */

export function ComboPopup({ streak }: { streak: number }) {
  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 top-1/3 z-50 flex justify-center">
        <div
          className="select-none text-center"
          style={{ animation: 'combo-pop 1100ms cubic-bezier(.2,.7,.3,1) forwards' }}
        >
          <div className="bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-300 bg-clip-text text-6xl font-black tracking-tight text-transparent drop-shadow-[0_2px_18px_rgba(251,146,60,0.5)] sm:text-7xl">
            ×{streak}
          </div>
          <div className="mt-1 text-lg font-bold uppercase tracking-[0.3em] text-orange-300 sm:text-xl">
            🔥 Combo
          </div>
        </div>
      </div>
      <style>{`
        @keyframes combo-pop {
          0%   { transform: translateY(20px) scale(.6); opacity: 0; }
          25%  { transform: translateY(0) scale(1.15); opacity: 1; }
          40%  { transform: translateY(0) scale(1); opacity: 1; }
          80%  { transform: translateY(-6px) scale(1); opacity: 1; }
          100% { transform: translateY(-40px) scale(.95); opacity: 0; }
        }
      `}</style>
    </>
  )
}

/* ── XP gain floater — small "+N XP" that drifts up near the score ───────── */

export function XpFloat({ amount }: { amount: number }) {
  return (
    <>
      <span
        className="pointer-events-none absolute -top-1 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap text-sm font-bold text-amber-300"
        style={{ animation: 'xp-float 900ms ease-out forwards' }}
      >
        +{amount} XP
      </span>
      <style>{`
        @keyframes xp-float {
          0%   { transform: translate(-50%, 0) scale(.8); opacity: 0; }
          20%  { transform: translate(-50%, -6px) scale(1.1); opacity: 1; }
          100% { transform: translate(-50%, -26px) scale(1); opacity: 0; }
        }
      `}</style>
    </>
  )
}

/* ── Spark burst — radial sparks from center (reactbits "Click Spark" idea) ─ */

export function SparkBurst() {
  // Lazy initial state: random spark vectors computed once at mount (the
  // useState initializer is exempt from the render-purity rule).
  const [sparks] = useState(() =>
    Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.3
      const dist = 90 + Math.random() * 70
      return {
        dx: Math.cos(angle) * dist,
        dy: Math.sin(angle) * dist,
        dur: 480 + Math.random() * 260,
        hue: i % 2 === 0
      }
    })
  )
  return (
    <>
      <div className="pointer-events-none fixed left-1/2 top-1/2 z-40">
        {sparks.map((s, i) => (
          <span
            key={i}
            className={cn(
              'absolute h-1.5 w-1.5 rounded-full',
              s.hue ? 'bg-amber-300' : 'bg-primary'
            )}
            style={{
              ['--sx' as string]: `${s.dx}px`,
              ['--sy' as string]: `${s.dy}px`,
              boxShadow: '0 0 8px currentColor',
              animation: `spark-fly ${s.dur}ms cubic-bezier(.15,.6,.4,1) forwards`
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes spark-fly {
          0%   { transform: translate(0, 0) scale(1); opacity: 1; }
          100% { transform: translate(var(--sx), var(--sy)) scale(0); opacity: 0; }
        }
      `}</style>
    </>
  )
}

/* ── Star rating — 3 stars filled by accuracy ───────────────────────────── */

export function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {[0, 1, 2].map((i) => {
        const filled = i < value
        return (
          <span
            key={i}
            className={cn(
              'text-4xl transition-all sm:text-5xl',
              filled ? 'text-amber-300 drop-shadow-[0_0_12px_rgba(252,211,77,0.6)]' : 'text-muted-foreground/30'
            )}
            style={
              filled
                ? { animation: `star-in 500ms cubic-bezier(.2,.8,.3,1) ${i * 180}ms both` }
                : undefined
            }
          >
            ★
          </span>
        )
      })}
      <style>{`
        @keyframes star-in {
          0%   { transform: scale(0) rotate(-40deg); opacity: 0; }
          60%  { transform: scale(1.3) rotate(8deg); opacity: 1; }
          100% { transform: scale(1) rotate(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}

/* ── Click spark — sparks fly from the cursor on every tap (reactbits) ──── */

function ClickSpark({ x, y }: { x: number; y: number }) {
  // Lazy initial state: the random spark offsets are computed once at mount.
  // (useState initializer is exempt from the render-purity rule; a useMemo with
  // Math.random() is not, and would also be free to recompute on re-render.)
  const [parts] = useState(() =>
    Array.from({ length: 8 }, (_, i) => {
      const a = (i / 8) * Math.PI * 2
      const d = 18 + Math.random() * 16
      return { dx: Math.cos(a) * d, dy: Math.sin(a) * d, dur: 380 + Math.random() * 180 }
    })
  )
  return (
    <div className="absolute" style={{ left: x, top: y }}>
      {parts.map((p, i) => (
        <span
          key={i}
          className="absolute h-1 w-1 rounded-full bg-primary"
          style={{
            ['--csx' as string]: `${p.dx}px`,
            ['--csy' as string]: `${p.dy}px`,
            boxShadow: '0 0 6px currentColor',
            animation: `click-spark-fly ${p.dur}ms cubic-bezier(.15,.6,.4,1) forwards`
          }}
        />
      ))}
    </div>
  )
}

/** Mounts once inside the lesson player; sparks at the pointer on every click. */
export function ClickSparkLayer() {
  const [bursts, setBursts] = useState<Array<{ id: number; x: number; y: number }>>([])

  useEffect(() => {
    let seq = 0
    const onClick = (e: MouseEvent) => {
      const id = ++seq
      setBursts((b) => [...b, { id, x: e.clientX, y: e.clientY }])
      window.setTimeout(() => setBursts((b) => b.filter((p) => p.id !== id)), 640)
    }
    window.addEventListener('click', onClick)
    return () => window.removeEventListener('click', onClick)
  }, [])

  return (
    <div className="pointer-events-none fixed inset-0 z-[45]">
      {bursts.map((b) => (
        <ClickSpark key={b.id} x={b.x} y={b.y} />
      ))}
      <style>{`
        @keyframes click-spark-fly {
          0%   { transform: translate(0, 0) scale(1); opacity: .9; }
          100% { transform: translate(var(--csx), var(--csy)) scale(0); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

/* ── Mute toggle — single source of truth is localStorage + window event ── */

export function SfxToggle({ className }: { className?: string }) {
  const [muted, setMuted] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    setMuted(isSfxMuted())
    const sync = (e: Event) => setMuted((e as CustomEvent).detail as boolean)
    window.addEventListener(SFX_MUTE_EVENT, sync)
    return () => window.removeEventListener(SFX_MUTE_EVENT, sync)
  }, [])

  if (!mounted) return null

  return (
    <button
      type="button"
      onClick={() => setSfxMuted(!muted)}
      aria-label={muted ? '打开音效' : '关闭音效'}
      className={cn(
        'shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground',
        className
      )}
    >
      {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
    </button>
  )
}
