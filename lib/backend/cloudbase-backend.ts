/**
 * Tencent CloudBase implementation of AuthBackend (powers the `cn` region).
 *
 * ─── STATUS: scaffold ───────────────────────────────────────────────────────
 * Not wired yet. The CN deployment needs a CloudBase environment provisioned
 * first (env id + region), after which this adapter gets fleshed out against
 * `@cloudbase/js-sdk`:
 *
 *   import cloudbase from '@cloudbase/js-sdk'
 *   const app = cloudbase.init({ env: process.env.NEXT_PUBLIC_CLOUDBASE_ENV! })
 *   const auth = app.auth()
 *   // signIn:  auth.signIn({ username/email, password })
 *   // signUp:  auth.signUp(...) or the email-verification flow
 *   // session: auth.getLoginState() / auth.onLoginStateChanged(...)
 *   // profile: app.database().collection('profiles').doc(uid).get()
 *
 * Until `NEXT_PUBLIC_CLOUDBASE_ENV` is set, `isConfigured` is false and every
 * consumer degrades to the same "community not configured" placeholder used
 * when Supabase is absent — so a half-set-up CN build never crashes.
 *
 * Phase 1 surfaces email/password only (see lib/region.ts → oauthProviders is
 * empty for CN). WeChat QR sign-in is a later addition once a 微信开放平台
 * 网站应用 is registered.
 */

import type { Profile } from '@/lib/supabase'
import type { OAuthProvider } from '@/lib/region'
import type {
  ActionResult,
  AuthBackend,
  AuthSubscription,
  SignUpResult
} from './types'

const CLOUDBASE_ENV = process.env.NEXT_PUBLIC_CLOUDBASE_ENV
const configured = Boolean(CLOUDBASE_ENV)

const notReady: ActionResult = { error: 'not_configured' }

/* eslint-disable @typescript-eslint/no-unused-vars */
export const cloudbaseAuthBackend: AuthBackend = {
  isConfigured: configured,

  async getSession() {
    // TODO(cn): return app.auth().getLoginState() mapped to BackendUser/Session.
    return null
  },

  onAuthStateChange(_cb): AuthSubscription {
    // TODO(cn): wire app.auth().onLoginStateChanged → cb; return its disposer.
    return { unsubscribe() {} }
  },

  async loadProfile(_userId: string): Promise<Profile | null> {
    // TODO(cn): read from the `profiles` collection in CloudBase database.
    return null
  },

  async signInWithOAuth(_provider: OAuthProvider, _redirectTo?: string) {
    // No social OAuth in CN phase 1. WeChat QR sign-in lands here later.
  },

  async signInWithEmailLink(_email: string): Promise<ActionResult> {
    return notReady
  },

  async signInWithPassword(_email: string, _password: string): Promise<ActionResult> {
    // TODO(cn): app.auth().signIn({ username: email, password }).
    return notReady
  },

  async signUp(_email: string, _password: string): Promise<SignUpResult> {
    // TODO(cn): CloudBase email sign-up + verification flow.
    return { error: 'not_configured', needsConfirmation: false }
  },

  async resetPasswordForEmail(_email: string): Promise<ActionResult> {
    // TODO(cn): app.auth().sendPasswordResetEmail(...) equivalent.
    return notReady
  },

  async updatePassword(_password: string): Promise<ActionResult> {
    return notReady
  },

  async signOut() {
    // TODO(cn): app.auth().signOut().
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */
