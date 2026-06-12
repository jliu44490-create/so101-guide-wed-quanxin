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

  /** Current session, or null if signed out. */
  getSession(): Promise<{ user: BackendUser; session: BackendSession } | null>

  /** Subscribe to auth changes. Returns an unsubscribe handle. */
  onAuthStateChange(
    cb: (user: BackendUser | null, session: BackendSession | null) => void
  ): AuthSubscription

  /** Fetch the public profile row for a user. */
  loadProfile(userId: string): Promise<Profile | null>

  /** Redirect-based social sign-in. No-op where unsupported (e.g. CN). */
  signInWithOAuth(provider: OAuthProvider, redirectTo?: string): Promise<void>

  /** Passwordless email magic-link sign-in. */
  signInWithEmailLink(email: string): Promise<ActionResult>

  signInWithPassword(email: string, password: string): Promise<ActionResult>
  signUp(email: string, password: string): Promise<SignUpResult>
  resetPasswordForEmail(email: string): Promise<ActionResult>
  updatePassword(password: string): Promise<ActionResult>
  signOut(): Promise<void>
}
