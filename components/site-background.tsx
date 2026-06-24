'use client'

/**
 * Site-wide backdrop for the logged-in pages — a dimmed, scrimmed Dark Veil
 * fixed behind all content. Hidden on the auth pages (login/signup/…) so the
 * existing login design is left untouched.
 *
 * Sits at -z-10 over the body's solid dark base and behind page content; the
 * logged-in page roots are transparent so it shows through.
 */

import { usePathname } from 'next/navigation'
import DarkVeil from '@/components/effects/dark-veil'

const HIDE_PREFIXES = ['/login', '/signup', '/forgot-password', '/reset-password']

export function SiteBackground() {
  const pathname = usePathname() ?? ''
  const hidden = HIDE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  if (hidden) return null

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 bg-background" aria-hidden>
      {/* Default Dark Veil hue (deep blue-violet) like the reactbits demo. */}
      <div className="absolute inset-0 opacity-[0.6]">
        <DarkVeil hueShift={0} speed={0.8} warpAmount={0} resolutionScale={1} />
      </div>
      {/* Light scrim — keeps cards/text readable while the colour still reads. */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/10 to-background/45" />
    </div>
  )
}
