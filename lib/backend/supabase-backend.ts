/**
 * Supabase implementation of AuthBackend (powers the `global` region).
 *
 * This is a thin wrapper around the existing browser client — behaviour is
 * identical to the pre-abstraction code that lived inline in use-auth.ts.
 */

import { supabase, isSupabaseConfigured, type Profile } from '@/lib/supabase'
import type { OAuthProvider } from '@/lib/region'
import type {
  ActionResult,
  AuthBackend,
  AuthSubscription,
  SignUpResult
} from './types'

const notConfigured: ActionResult = { error: 'not_configured' }

export const supabaseAuthBackend: AuthBackend = {
  isConfigured: isSupabaseConfigured,
  confirmationMethod: 'link',

  async getSession() {
    if (!supabase) return null
    const { data } = await supabase.auth.getSession()
    const u = data.session?.user
    if (!u) return null
    return {
      user: { id: u.id, email: u.email ?? undefined },
      session: { access_token: data.session!.access_token }
    }
  },

  onAuthStateChange(cb): AuthSubscription {
    if (!supabase) return { unsubscribe() {} }
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user
      if (u) {
        cb({ id: u.id, email: u.email ?? undefined }, { access_token: session.access_token })
      } else {
        cb(null, null)
      }
    })
    return { unsubscribe: () => data.subscription.unsubscribe() }
  },

  async loadProfile(userId: string): Promise<Profile | null> {
    if (!supabase) return null
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single()
    return (data as Profile) ?? null
  },

  async updateProfile(userId, patch): Promise<ActionResult> {
    if (!supabase) return notConfigured
    const { error } = await supabase.from('profiles').update(patch).eq('id', userId)
    return { error: error?.message ?? null }
  },

  async uploadAvatar(userId, file) {
    if (!supabase) return { url: null, error: 'not_configured' }
    const ext = (file.name.split('.').pop() || 'png').toLowerCase()
    const path = `${userId}/avatar.${ext}`
    const { error } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, cacheControl: '3600' })
    if (error) return { url: null, error: error.message }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    return { url: `${data.publicUrl}?v=${Date.now()}`, error: null }
  },

  async signInWithOAuth(provider: OAuthProvider, redirectTo?: string) {
    if (!supabase) return
    await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: redirectTo ?? window.location.origin }
    })
  },

  async signInWithEmailLink(email: string): Promise<ActionResult> {
    if (!supabase) return notConfigured
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.href }
    })
    return { error: error?.message ?? null }
  },

  async signInWithPassword(email: string, password: string): Promise<ActionResult> {
    if (!supabase) return notConfigured
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  },

  async signUp(email: string, password: string): Promise<SignUpResult> {
    if (!supabase) return { error: 'not_configured', needsConfirmation: false }
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` }
    })
    // When email confirmation is required, Supabase returns a user but no session.
    const needsConfirmation = !!data?.user && !data.session
    return { error: error?.message ?? null, needsConfirmation }
  },

  // Supabase confirms signups with an email link, so OTP entry is never shown.
  async verifyOtp(): Promise<ActionResult> {
    return { error: 'not_supported' }
  },

  async resendOtp(): Promise<ActionResult> {
    return { error: 'not_supported' }
  },

  async resetPasswordForEmail(email: string): Promise<ActionResult> {
    if (!supabase) return notConfigured
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { error: error?.message ?? null }
  },

  async updatePassword(password: string): Promise<ActionResult> {
    if (!supabase) return notConfigured
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error?.message ?? null }
  },

  async signOut() {
    if (!supabase) return
    await supabase.auth.signOut()
  }
}
