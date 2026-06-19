/**
 * Supabase browser client.
 *
 * The whole community layer (auth + discussions) is gated behind two env vars.
 * If they're absent — e.g. before the project owner has provisioned a Supabase
 * project — `supabase` is null and `isSupabaseConfigured` is false. Every
 * community component checks this and degrades to a friendly "即将开放"
 * placeholder instead of crashing. This keeps the static build green on Vercel
 * even with zero backend configured.
 *
 * Setup: see /supabase/README.md
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Browser client. We use the implicit flow so the entire OAuth / magic-link
 * round-trip happens client-side and we don't need a server callback route for
 * v1. `detectSessionInUrl` lets the client pick up the session from the URL
 * hash after the provider redirects back.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'implicit'
      }
    })
  : null

// ── Shared types for the community layer ──────────────────────────────────

export interface Profile {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  /** Plus-only opt-in: show the cross-site 电子学习伴侣. Default false. */
  companion_enabled?: boolean
}

export interface CommentRow {
  id: string
  thread_key: string
  author_id: string
  body: string
  parent_id: string | null
  created_at: string
  updated_at: string
  /** Joined from profiles. */
  author?: Pick<Profile, 'username' | 'avatar_url'> | null
  /** Aggregated like count (from a view or count query). */
  like_count?: number
  /** Whether the current user has liked it. */
  liked_by_me?: boolean
}
