'use client'

/**
 * Client hook: does the current user have all-access?
 *
 * Resolution:
 *   - Paywall disabled            → always true (site is fully free).
 *   - Paywall enabled, logged out → false.
 *   - Paywall enabled, logged in  → true iff an entitlements row exists.
 *
 * Re-checks whenever the auth user changes. Backend-not-configured degrades to
 * the paywall-disabled behaviour (true) so a half-set-up deploy never traps
 * users behind an unbuyable wall.
 */

import { useEffect, useState } from 'react'
import { communityBackend } from './backend'
import { cachedRequest } from './request-cache'
import { useAuth } from './use-auth'
import { PAYWALL_ENABLED } from './paywall'

// Entitlement is stable within a session (changes only on purchase). Share one
// lookup across every gated component instead of one request per mount.
const ENTITLEMENT_TTL = 60_000

export interface UseEntitlementResult {
  /** True if the user may access locked content. */
  hasAccess: boolean
  /** Still resolving (auth or DB query in flight). */
  loading: boolean
  /** Convenience: paywall is on AND user lacks access (show upgrade prompts). */
  locked: boolean
}

export function useEntitlement(): UseEntitlementResult {
  const { user, loading: authLoading } = useAuth()
  const [hasEntitlement, setHasEntitlement] = useState(false)
  const [checking, setChecking] = useState(PAYWALL_ENABLED)

  useEffect(() => {
    // When paywall is off, or backend missing, there's nothing to check.
    if (!PAYWALL_ENABLED || !communityBackend.isConfigured) {
      setChecking(false)
      return
    }
    if (authLoading) return
    if (!user) {
      setHasEntitlement(false)
      setChecking(false)
      return
    }

    let alive = true
    setChecking(true)
    cachedRequest(`entitlement:${user.id}`, ENTITLEMENT_TTL, () =>
      communityBackend.hasEntitlement(user.id)
    ).then((has) => {
      if (!alive) return
      setHasEntitlement(has)
      setChecking(false)
    })
    return () => {
      alive = false
    }
  }, [user, authLoading])

  // Paywall off (or backend missing) → everyone has access.
  if (!PAYWALL_ENABLED || !communityBackend.isConfigured) {
    return { hasAccess: true, loading: false, locked: false }
  }

  const loading = authLoading || checking
  const hasAccess = hasEntitlement
  return { hasAccess, loading, locked: !loading && !hasAccess }
}
