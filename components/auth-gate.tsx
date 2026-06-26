'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/lib/use-auth'

// Auth-flow routes that must stay reachable without logging in.
// Auth-flow pages, plus the public marketing/content pages that should be
// crawlable for SEO. Paid chapter *content* stays gated by the paywall
// (use-entitlement), and account/AI-chat pages stay behind login below.
const PUBLIC_PREFIXES = [
  '/login',
  '/signup',
  '/forgot-password',
  '/reset-password',
  '/', // home only (exact match — see isPublicPath)
  '/learn',
  '/ai',
  '/diagnose',
  '/glossary',
  '/resources',
  '/about',
  '/unlock',
  '/community',
  '/ja'
]

const isPublicPath = (p: string) =>
  PUBLIC_PREFIXES.some((prefix) => p === prefix || p.startsWith(prefix + '/'))

/**
 * Site-wide client login wall. Unauthenticated visitors to any page (except the
 * auth-flow pages) are bounced to /login?next=<here>; the login page sends them
 * back after sign-in. If the auth backend isn't configured, it lets everything
 * through so the site never hard-locks with no way to sign in.
 *
 * Soft gate: pages are still server-rendered, then JS redirects — a UX login
 * wall, not a server-side hard block (Supabase sessions live in localStorage, so
 * a Next middleware can't see them without migrating auth to cookies).
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const { ready, isLoggedIn, enabled } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const allowed = isPublicPath(pathname)

  useEffect(() => {
    if (allowed || !enabled || !ready || isLoggedIn) return
    // Don't bounce while an OAuth / magic-link redirect is still being processed.
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) return
    router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [allowed, enabled, ready, isLoggedIn, pathname, router])

  if (allowed || !enabled || (ready && isLoggedIn)) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Loader2 className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}
