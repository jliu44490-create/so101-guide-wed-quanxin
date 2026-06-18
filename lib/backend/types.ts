/**
 * Backend abstraction for the community layer.
 *
 * The UI talks to an `AuthBackend` interface instead of importing a specific
 * SDK. `global` is backed by Supabase; `cn` will be backed by Tencent
 * CloudBase. Swapping backends is a matter of providing another adapter — the
 * React layer (use-auth, auth pages) stays untouched.
 */

import type { OAuthProvider } from '@/lib/region'
import type { Profile } from '@/lib/supabase'

export interface BackendUser {
  id: string
  email?: string
}

export interface BackendSession {
  access_token: string
}

export interface AuthSubscription {
  unsubscribe(): void
}

/** Result shape for actions that can surface a user-facing error string. */
export interface ActionResult {
  /** null on success; a message (or 'not_configured') otherwise. */
  error: string | null
}

export interface SignUpResult extends ActionResult {
  /** True when the backend created the user but requires email confirmation. */
  needsConfirmation: boolean
}

export interface AuthBackend {
  /** Whether this backend has the env/config it needs to operate. */
  readonly isConfigured: boolean

  /**
   * How a freshly-signed-up email gets confirmed:
   *  - 'link' → the backend emails a clickable confirmation link (Supabase).
   *  - 'otp'  → the backend emails a one-time code to enter (CloudBase).
   * The signup UI branches on this.
   */
  readonly confirmationMethod: 'link' | 'otp'

  /** Current session, or null if signed out. */
  getSession(): Promise<{ user: BackendUser; session: BackendSession } | null>

  /** Subscribe to auth changes. Returns an unsubscribe handle. */
  onAuthStateChange(
    cb: (user: BackendUser | null, session: BackendSession | null) => void
  ): AuthSubscription

  /** Fetch the public profile row for a user. */
  loadProfile(userId: string): Promise<Profile | null>

  /** Update the current user's editable profile fields. */
  updateProfile(
    userId: string,
    patch: { username?: string; bio?: string; avatar_url?: string }
  ): Promise<ActionResult>

  /** Upload an avatar image; returns its public URL on success. */
  uploadAvatar(userId: string, file: File): Promise<{ url: string | null; error: string | null }>

  /** Redirect-based social sign-in. No-op where unsupported (e.g. CN). */
  signInWithOAuth(provider: OAuthProvider, redirectTo?: string): Promise<void>

  /** Passwordless email magic-link sign-in. */
  signInWithEmailLink(email: string): Promise<ActionResult>

  signInWithPassword(email: string, password: string): Promise<ActionResult>
  signUp(email: string, password: string): Promise<SignUpResult>

  /** Confirm a signup with the one-time code emailed to the user (OTP backends). */
  verifyOtp(email: string, token: string): Promise<ActionResult>
  /** Resend the signup one-time code (OTP backends). */
  resendOtp(email: string): Promise<ActionResult>

  resetPasswordForEmail(email: string): Promise<ActionResult>
  updatePassword(password: string): Promise<ActionResult>
  signOut(): Promise<void>
}
