'use client'

/**
 * 蓝图边轨 — decorative engineering-blueprint rails in the side gutters of the
 * logged-in pages. Frames the centered content column on wide screens so the
 * empty margins read as intentional design (vertical guide line + measurement
 * ticks + a faint vertical label + a soft edge glow). Pure decoration:
 * pointer-events-none, lg+ only, hidden on the auth pages.
 */

import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const HIDE_PREFIXES = ['/login', '/signup', '/forgot-password', '/reset-password']

const FADE = 'linear-gradient(to bottom, transparent, black 14%, black 86%, transparent)'

function Rail({ side, label }: { side: 'left' | 'right'; label: string }) {
  const isLeft = side === 'left'
  return (
    <div className={cn('absolute inset-y-0', isLeft ? 'left-6 xl:left-10' : 'right-6 xl:right-10')}>
      {/* vertical guide line */}
      <div
        className={cn('absolute inset-y-0 w-px bg-border', isLeft ? 'left-0' : 'right-0')}
        style={{ maskImage: FADE, WebkitMaskImage: FADE }}
      />
      {/* measurement ticks */}
      <div
        className={cn('absolute inset-y-0 w-2.5', isLeft ? 'left-0' : 'right-0')}
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, var(--color-border) 0 1px, transparent 1px 56px)',
          maskImage: FADE,
          WebkitMaskImage: FADE
        }}
      />
      {/* a brighter tick + dot every ~224px (a "major" gridline marker) */}
      <div
        className={cn('absolute inset-y-0 w-4', isLeft ? 'left-0' : 'right-0')}
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, color-mix(in oklab, var(--color-primary) 60%, transparent) 0 2px, transparent 2px 224px)',
          maskImage: FADE,
          WebkitMaskImage: FADE
        }}
      />
      {/* vertical label */}
      <span
        className={cn(
          'absolute bottom-16 text-[10px] uppercase tracking-[0.4em] text-muted-foreground/45 select-none',
          isLeft ? 'left-4' : 'right-4'
        )}
        style={{ writingMode: 'vertical-rl', transform: isLeft ? 'rotate(180deg)' : undefined }}
      >
        {label}
      </span>
    </div>
  )
}

export function SideRails() {
  const pathname = usePathname() ?? ''
  if (HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) return null

  return (
    <div className="pointer-events-none fixed inset-0 -z-[5] hidden lg:block" aria-hidden>
      {/* soft ambient glow hugging the viewport edges */}
      <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-primary/[0.06] to-transparent" />
      <div className="absolute inset-y-0 right-0 w-40 bg-gradient-to-l from-accent/[0.06] to-transparent" />

      {/* rails hug the viewport sides at any resolution */}
      <Rail side="left" label="SO-101 · IMITATION LEARNING" />
      <Rail side="right" label="LVJIN · EMBODIED AI" />
    </div>
  )
}
