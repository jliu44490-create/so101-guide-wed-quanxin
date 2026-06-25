'use client'

/**
 * Site-wide backdrop for the logged-in pages — a dimmed, scrimmed Dark Veil
 * fixed behind all content. Hidden on the auth pages (login/signup/…).
 *
 * Performance + a11y: the live WebGL veil only runs on a real pointer-capable
 * desktop with motion allowed. On small screens (battery) or for users who
 * prefer reduced motion, it falls back to a matching **static** violet gradient
 * — same mood, zero GPU cost, no animation. We default to the static fallback
 * until mounted so WebGL never spins up on the first paint (esp. on mobile).
 */

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { usePrefersReducedMotion } from '@/lib/hooks'
import DarkVeil from '@/components/effects/dark-veil'

const HIDE_PREFIXES = ['/login', '/signup', '/forgot-password', '/reset-password']

// Static approximation of the veil's deep blue-violet mood (no animation).
const STATIC_VEIL =
  'radial-gradient(70% 55% at 24% 10%, color-mix(in oklab, var(--color-primary) 30%, transparent), transparent 60%),' +
  'radial-gradient(60% 50% at 84% 6%, color-mix(in oklab, var(--color-accent) 24%, transparent), transparent 60%),' +
  'radial-gradient(85% 60% at 55% 108%, color-mix(in oklab, var(--color-primary) 16%, transparent), transparent 72%)'

export function SiteBackground() {
  const pathname = usePathname() ?? ''
  const reduce = usePrefersReducedMotion()
  const [mounted, setMounted] = useState(false)
  const [smallScreen, setSmallScreen] = useState(true) // assume small → no WebGL on first paint

  useEffect(() => {
    setMounted(true)
    const mq = window.matchMedia('(max-width: 767px)')
    setSmallScreen(mq.matches)
    const onChange = () => setSmallScreen(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  const hidden = HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (hidden) return null

  // Live WebGL only when it's worth it; otherwise a static gradient.
  const live = mounted && !reduce && !smallScreen

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-background" aria-hidden>
      <div className="absolute inset-0 opacity-[0.6]">
        {live ? (
          <DarkVeil hueShift={0} speed={0.8} warpAmount={0} resolutionScale={1} />
        ) : (
          <div className="absolute inset-0" style={{ background: STATIC_VEIL }} />
        )}
      </div>
      {/* Light scrim — keeps cards/text readable while the colour still reads. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background/45" />
    </div>
  )
}
