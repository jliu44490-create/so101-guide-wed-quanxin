import { cn } from '@/lib/utils'

interface FloatingOrbsProps {
  className?: string
  /** 球体数量 */
  count?: number
}

/** 漂浮的发光球，纯 CSS 实现，超轻量 */
export function FloatingOrbs({ className, count = 5 }: FloatingOrbsProps) {
  const orbs = Array.from({ length: count }, (_, i) => i)
  const stableRandom = (seed: number) => {
    const x = Math.sin(seed * 997.3) * 10000
    return x - Math.floor(x)
  }

  return (
    <div className={cn('pointer-events-none absolute inset-0 overflow-hidden [overflow:clip]', className)} aria-hidden>
      {orbs.map((i) => {
        const size = 70 + stableRandom(i + 1) * 120
        const left = stableRandom(i + 11) * 100
        const top = stableRandom(i + 21) * 100
        const delay = -stableRandom(i + 31) * 8
        const duration = 9 + stableRandom(i + 41) * 7
        const isAccent = i % 2 === 0
        return (
          <div
            key={i}
            className="absolute rounded-full mix-blend-screen animate-float"
            style={{
              width: size,
              height: size,
              left: `${left}%`,
              top: `${top}%`,
              background: isAccent
                ? 'radial-gradient(circle, oklch(from var(--primary) l c h / 0.5) 0%, transparent 70%)'
                : 'radial-gradient(circle, oklch(from var(--accent) l c h / 0.5) 0%, transparent 70%)',
              filter: 'blur(40px)',
              animationDelay: `${delay}s`,
              animationDuration: `${duration}s`
            }}
          />
        )
      })}
    </div>
  )
}
