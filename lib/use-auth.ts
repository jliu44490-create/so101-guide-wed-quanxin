'use client'

import { useCallback, useEffect, useState } from 'react'
import { supabase, isSupabaseConfigured, type Profile } from './supabase'

/**
 * Auth state + actions for the community layer.
 *
 * SSR-safe: when Supabase isn't configured, `ready` flips true immediately and
 * `user` stays null, so consumers render their logged-out / placeholder state
 * without hanging.
 *
 * v2 auth methods:
 *   - GitHub OAuth     → one click for the technical audience
 *   - Google OAuth     → broadest reach
 *   - Email + password → traditional sign-up / sign-in
 *
 * Note: the implicit flow (see lib/supabase.ts) handles the OAuth round-trip
 * entirely client-side; no /auth/callback route is required.
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
    if (!supabase) {
      setReady(true)
      return
    }

    let active = true

    const loadProfile = async (userId: string) => {
      const { data } = await supabase!
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (active) setProfile((data as Profile) ?? null)
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      const u = data.session?.user
      if (u) {
        setUser({ id: u.id, email: u.email ?? undefined })
        setSession({ access_token: data.session!.access_token })
        loadProfile(u.id)
      }
      setReady(true)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      if (u) {
        setUser({ id: u.id, email: u.email ?? undefined })
        setSession({ access_token: session.access_token })
        loadProfile(u.id)
      } else {
        setUser(null)
        setSession(null)
        setProfile(null)
      }
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const signInWithGitHub = useCallback(async (redirectTo?: string) => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: { redirectTo: redirectTo ?? window.location.origin }
    })
  }, [])

  const signInWithGoogle = useCallback(async (redirectTo?: string) => {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: redirectTo ?? window.location.origin }
    })
  }, [])

  const signInWithEmail = useCallback(async (email: string) => {
    if (!supabase) return { error: 'not_configured' as const }
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href }
    })
    return { error: error?.message ?? null }
  }, [])

  const signInWithPassword = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'not_configured' as const }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'not_configured' as const, needsConfirmation: false }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` }
    })
    // When email confirmation is required, Supabase returns a user but no session.
    const needsConfirmation = !!data?.user && !data.session
    return { error: error?.message ?? null, needsConfirmation }
  }, [])

  const resetPasswordForEmail = useCallback(async (email: string) => {
    if (!supabase) return { error: 'not_configured' as const }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { error: error?.message ?? null }
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    if (!supabase) return { error: 'not_configured' as const }
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
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
    enabled: isSupabaseConfigured,
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
