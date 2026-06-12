'use client'

import { useCallback, useEffect, useState } from 'react'
import { authBackend } from './backend'
import type { Profile } from './supabase'

/**
 * Auth state + actions for the community layer.
 *
 * Backend-agnostic: all calls go through `authBackend` (Supabase for `global`,
 * CloudBase for `cn` — see lib/backend). SSR-safe: when the backend isn't
 * configured, `ready` flips true immediately and `user` stays null, so consumers
 * render their logged-out / placeholder state without hanging.
 *
 * v2 auth methods:
 *   - GitHub / Google OAuth  → global region only (hidden in CN)
 *   - Email + password       → traditional sign-up / sign-in
 */

export interface AuthUser {
  id: string
  email?: string
}

export interface AuthSession {
  access_token: string
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [session, setSession] = useState<AuthSession | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!authBackend.isConfigured) {
      setReady(true)
      return
    }

    let active = true

    const loadProfile = async (userId: string) => {
      const p = await authBackend.loadProfile(userId)
      if (active) setProfile(p)
    }

    authBackend.getSession().then((res) => {
      if (!active) return
      if (res) {
        setUser(res.user)
        setSession(res.session)
        loadProfile(res.user.id)
      }
      setReady(true)
    })

    const sub = authBackend.onAuthStateChange((u, s) => {
      if (u) {
        setUser(u)
        setSession(s)
        loadProfile(u.id)
      } else {
        setUser(null)
        setSession(null)
        setProfile(null)
      }
    })

    return () => {
      active = false
      sub.unsubscribe()
    }
  }, [])

  const signInWithGitHub = useCallback(
    (redirectTo?: string) => authBackend.signInWithOAuth('github', redirectTo),
    []
  )

  const signInWithGoogle = useCallback(
    (redirectTo?: string) => authBackend.signInWithOAuth('google', redirectTo),
    []
  )

  const signInWithEmail = useCallback(
    (email: string) => authBackend.signInWithEmailLink(email),
    []
  )

  const signInWithPassword = useCallback(
    (email: string, password: string) => authBackend.signInWithPassword(email, password),
    []
  )

  const signUp = useCallback(
    (email: string, password: string) => authBackend.signUp(email, password),
    []
  )

  const resetPasswordForEmail = useCallback(
    (email: string) => authBackend.resetPasswordForEmail(email),
    []
  )

  const updatePassword = useCallback(
    (password: string) => authBackend.updatePassword(password),
    []
  )

  const signOut = useCallback(async () => {
    await authBackend.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }, [])

  return {
    /** true once we know whether the user is logged in (or backend is absent). */
    ready,
    /** Backwards-compatible loading alias used by entitlement/paywall flows. */
    loading: !ready,
    /** Whether the community backend is wired up at all. */
    enabled: authBackend.isConfigured,
    user,
    session,
    profile,
    isLoggedIn: !!user,
    signInWithGitHub,
    signInWithGoogle,
    signInWithEmail,
    signInWithPassword,
    signUp,
    resetPasswordForEmail,
    updatePassword,
    signOut
  }
}
