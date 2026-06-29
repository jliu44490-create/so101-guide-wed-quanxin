/**
 * Community query helpers.
 *
 * Every function returns a safe empty/default value when Supabase isn't
 * configured — community pages can use these without `if (!supabase)` checks
 * everywhere. Pages still want to show their own "即将开放" UI based on
 * `isSupabaseConfigured` for the empty-by-design case.
 */

import { supabase, isSupabaseConfigured } from './supabase'

// ── Shared types ──────────────────────────────────────────────────────────

export interface ThreadCount {
  thread_key: string
  comment_count: number
}

export interface RecentComment {
  id: string
  thread_key: string
  body: string
  created_at: string
  author_id: string
  author_username: string
  author_avatar_url: string | null
}

export interface UserContribution {
  id: string
  username: string
  avatar_url: string | null
  bio: string | null
  created_at: string
  comment_count: number
  likes_received: number
  last_active_at: string
}

export interface UserComment {
  id: string
  author_id: string
  thread_key: string
  body: string
  created_at: string
  like_count: number
}

// ── Thread-related queries ────────────────────────────────────────────────

/**
 * Get comment counts for many threads in one call. Returns Map<threadKey, count>.
 * Returns empty Map when backend not configured (callers just render 0 / hide).
 */
export async function getThreadCounts(threadKeys: string[]): Promise<Map<string, number>> {
  const empty = new Map<string, number>()
  if (!supabase || threadKeys.length === 0) return empty

  const { data, error } = await supabase
    .from('thread_counts')
    .select('thread_key, comment_count')
    .in('thread_key', threadKeys)

  if (error || !data) return empty
  const map = new Map<string, number>()
  for (const row of data as ThreadCount[]) {
    map.set(row.thread_key, row.comment_count)
  }
  return map
}

// ── Community feed queries ────────────────────────────────────────────────

export async function getRecentComments(limit = 20): Promise<RecentComment[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('recent_comments_with_thread')
    .select('*')
    .limit(limit)
  if (error || !data) return []
  return data as RecentComment[]
}

// ── Contributor queries ───────────────────────────────────────────────────

/**
 * Returns the top contributors by comment count. Excludes users with 0
 * comments so we don't pollute the wall with brand-new accounts.
 */
export async function getTopContributors(limit = 10): Promise<UserContribution[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('user_contributions')
    .select('*')
    .gt('comment_count', 0)
    .order('comment_count', { ascending: false })
    .order('likes_received', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data as UserContribution[]
}

// ── Per-user queries (profile page) ───────────────────────────────────────

export async function getUserByUsername(username: string): Promise<UserContribution | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('user_contributions')
    .select('*')
    .eq('username', username)
    .maybeSingle()
  if (error || !data) return null
  return data as UserContribution
}

export async function getUserCommentsByUserId(userId: string, limit = 50): Promise<UserComment[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('user_comments_with_thread')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error || !data) return []
  return data as UserComment[]
}

// ── Helpers ───────────────────────────────────────────────────────────────

/**
 * Maps a thread_key to a human-readable label + URL for linking.
 *   chapter:1 → "第 1 章 · 什么是模仿学习"  with link /learn/1
 *   error:cuda out of memory → "报错: CUDA out of memory"  with link /diagnose?q=...
 */
export interface DescribeThreadOpts {
  /** Link prefix, e.g. '/ja'. Defaults to '' (Chinese routes). */
  base?: string
  /** Label for a chapter thread. Defaults to Chinese. */
  chapterLabel?: (id: number, title?: string) => string
  /** Label for an error thread. Defaults to Chinese. */
  errorLabel?: (err: string) => string
}

export function describeThread(
  threadKey: string,
  chapterTitleLookup?: (id: number) => string | undefined,
  opts?: DescribeThreadOpts
): {
  label: string
  href: string
  kind: 'chapter' | 'error' | 'unknown'
} {
  const base = opts?.base ?? ''
  const chapterLabel =
    opts?.chapterLabel ?? ((id, title) => (title ? `第 ${id} 章 · ${title}` : `第 ${id} 章`))
  const errorLabel = opts?.errorLabel ?? ((err) => `报错: ${err}`)

  const chapterMatch = threadKey.match(/^chapter:(\d+)$/)
  if (chapterMatch) {
    const id = Number(chapterMatch[1])
    const title = chapterTitleLookup?.(id)
    return {
      label: chapterLabel(id, title),
      href: `${base}/learn/${id}`,
      kind: 'chapter'
    }
  }
  const errorMatch = threadKey.match(/^error:(.+)$/)
  if (errorMatch) {
    return {
      label: errorLabel(errorMatch[1]),
      href: `${base}/diagnose?q=${encodeURIComponent(errorMatch[1])}`,
      kind: 'error'
    }
  }
  return { label: threadKey, href: '#', kind: 'unknown' }
}

export { isSupabaseConfigured }
