/**
 * Server-only Supabase admin client (service-role / secret key).
 *
 * ⚠️ NEVER import this from a client component. It uses the secret key
 * (`sb_secret_...` / service_role), which bypasses Row Level Security. It must
 * only ever run in API route handlers / server code.
 *
 * Used by the Stripe webhook to write entitlement rows that the user's own
 * browser session is forbidden (by RLS) from writing — that asymmetry is what
 * makes the paywall un-forgeable from the client.
 *
 * Env: SUPABASE_SERVICE_ROLE_KEY = the "Secret key" (sb_secret_...) from
 *      Supabase → Settings → API Keys. Server-only, never NEXT_PUBLIC_.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const isAdminConfigured = Boolean(url && serviceKey)

/**
 * Returns a privileged client, or null if not configured. Callers must handle
 * null (return 503) so a misconfigured deploy fails loudly rather than silently
 * granting/denying access.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!url || !serviceKey) return null
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false }
  })
}
