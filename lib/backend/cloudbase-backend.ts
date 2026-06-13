/**
 * Tencent CloudBase implementation of AuthBackend (powers the `cn` region).
 *
 * CloudBase's web v3 auth API (@cloudbase/js-sdk ≥ 3.4) is deliberately
 * Supabase-shaped — `signInWithPassword({ email, password })`, `getSession()`,
 * `onAuthStateChange((event, session) => …)`, `{ data, error }` returns — so this
 * maps almost 1:1 onto our AuthBackend contract.
 *
 * The SDK is pulled in via a lazy dynamic import so it only ships in the CN
 * bundle: in the global build `backendKind === 'supabase'`, these methods are
 * never called and the import chunk is never loaded.
 *
 * Phase 1 surfaces email/password only. Two things are intentionally deferred:
 *   - loadProfile → null (the community/profiles data layer is a later slice)
 *   - updatePassword (the recovery-session flow lands with /reset-password)
 */

import type { Profile } from '@/lib/supabase'
import type { OAuthProvider } from '@/lib/region'
import type {
  ActionResult,
  AuthBackend,
  AuthSubscription,
  SignUpResult
} from './types'

// This adapter bridges to the dynamically-imported, loosely-typed CloudBase SDK
// and implements interface methods whose params aren't all used yet (CN phase 1).
/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

const ENV = process.env.NEXT_PUBLIC_CLOUDBASE_ENV
const REGION = process.env.NEXT_PUBLIC_CLOUDBASE_REGION
const ACCESS_KEY = process.env.NEXT_PUBLIC_CLOUDBASE_ACCESS_KEY
const configured = Boolean(ENV && ACCESS_KEY)

const notReady: ActionResult = { error: 'not_configured' }

// Minimal shapes we rely on from the SDK (kept local to avoid coupling to the
// SDK's large type surface; the instances themselves stay loosely typed).
interface CBUser {
  id: string
  email?: string | null
}
interface CBSession {
  access_token?: string
  user: CBUser
}

// CloudBase's signUp() returns a `verifyOtp` callback that closes over the
// pending verification context (message id etc.). We stash it so the separate
// "enter code" step can complete the confirmation.
let pendingVerifyOtp: ((p: { token: string }) => Promise<any>) | null = null

/** Lazy singleton auth instance — loaded in the browser on first use only. */
let authPromise: Promise<any> | null = null
async function getAuth(): Promise<any> {
  if (!authPromise) {
    authPromise = import('@cloudbase/js-sdk').then((mod) => {
      const cloudbase = (mod as any).default ?? mod
      const app = cloudbase.init({ env: ENV, region: REGION, accessKey: ACCESS_KEY })
      return app.auth({ persistence: 'local' })
    })
  }
  return authPromise
}

const errMsg = (error: any): string | null =>
  error ? (error.message ?? String(error)) : null

const mapUser = (u: CBUser) => ({ id: u.id, email: u.email ?? undefined })

export const cloudbaseAuthBackend: AuthBackend = {
  isConfigured: configured,
  confirmationMethod: 'otp',

  async getSession() {
    if (!configured) return null
    const auth = await getAuth()
    const { data } = await auth.getSession()
    const session: CBSession | undefined = data?.session
    if (!session?.user) return null
    return {
      user: mapUser(session.user),
      session: { access_token: session.access_token ?? '' }
    }
  },

  onAuthStateChange(cb): AuthSubscription {
    if (!configured) return { unsubscribe() {} }
    let subscription: { unsubscribe?: () => void } | undefined
    // getAuth resolves asynchronously; attach the listener once it's ready.
    getAuth().then((auth) => {
      const res = auth.onAuthStateChange((_event: string, session: CBSession | null) => {
        if (session?.user) {
          cb(mapUser(session.user), { access_token: session.access_token ?? '' })
        } else {
          cb(null, null)
        }
      })
      subscription = res?.data?.subscription
    })
    return { unsubscribe: () => subscription?.unsubscribe?.() }
  },

  async loadProfile(_userId: string): Promise<Profile | null> {
    // Profiles live in the CloudBase database; wired with the community slice.
    return null
  },

  async signInWithOAuth(_provider: OAuthProvider, _redirectTo?: string) {
    // No social login in the CN region (phase 1). WeChat QR sign-in lands later.
  },

  async signInWithEmailLink(email: string): Promise<ActionResult> {
    if (!configured) return notReady
    const auth = await getAuth()
    const { error } = await auth.signInWithOtp({ email, options: { shouldCreateUser: true } })
    return { error: errMsg(error) }
  },

  async signInWithPassword(email: string, password: string): Promise<ActionResult> {
    if (!configured) return notReady
    const auth = await getAuth()
    const { error } = await auth.signInWithPassword({ email, password })
    return { error: errMsg(error) }
  },

  async signUp(email: string, password: string): Promise<SignUpResult> {
    if (!configured) return { error: 'not_configured', needsConfirmation: false }
    const auth = await getAuth()
    const { data, error } = await auth.signUp({ email, password })
    if (error) return { error: errMsg(error), needsConfirmation: false }
    // CloudBase returns a `verifyOtp` callback (and no session) when the email
    // still needs to be confirmed with a one-time code.
    pendingVerifyOtp = typeof data?.verifyOtp === 'function' ? data.verifyOtp : null
    const needsConfirmation = !!data?.verifyOtp || !data?.session
    return { error: null, needsConfirmation }
  },

  async verifyOtp(email: string, token: string): Promise<ActionResult> {
    if (!configured) return notReady
    const auth = await getAuth()
    // Prefer the callback captured at signUp time (carries the message id);
    // fall back to the stateless top-level verify keyed by email.
    const res = pendingVerifyOtp
      ? await pendingVerifyOtp({ token })
      : await auth.verifyOtp({ email, token, type: 'signup' })
    const error = errMsg(res?.error)
    if (!error) pendingVerifyOtp = null
    return { error }
  },

  async resendOtp(email: string): Promise<ActionResult> {
    if (!configured) return notReady
    const auth = await getAuth()
    const { error } = await auth.resend({ email, type: 'signup' })
    return { error: errMsg(error) }
  },

  async resetPasswordForEmail(email: string): Promise<ActionResult> {
    if (!configured) return notReady
    const auth = await getAuth()
    const { error } = await auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    })
    return { error: errMsg(error) }
  },

  async updatePassword(_password: string): Promise<ActionResult> {
    // CloudBase updates the password through the callback returned by
    // resetPasswordForEmail()/verifyOtp(), which needs the recovery session.
    // Wired with the /reset-password slice.
    return { error: 'not_configured' }
  },

  async signOut() {
    if (!configured) return
    const auth = await getAuth()
    await auth.signOut()
  }
}
