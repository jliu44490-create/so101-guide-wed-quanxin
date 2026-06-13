/**
 * Backend abstraction for the community data layer (comments / votes /
 * entitlements), parallel to the AuthBackend.
 *
 * Operations are domain-level (not query builders) so both a Supabase adapter
 * (PostgREST, global) and a CloudBase adapter (data-model ORM, cn) can implement
 * them. Keeping the surface coarse-grained is what lets the two very different
 * backends share one UI.
 */

import type { CommentRow } from '@/lib/supabase'

/** A comment row enriched with the joined author + like count for rendering. */
export interface UIComment extends CommentRow {
  author_username?: string
  author_avatar_url?: string | null
}

export interface ThreadData {
  comments: UIComment[]
  /** Ids of comments the current user has liked. */
  likedIds: string[]
}

export interface CommunityResult {
  error: string | null
}

export interface CommunityBackend {
  /** Whether the community backend is wired up at all. */
  readonly isConfigured: boolean

  /** All comments for a thread (oldest first) + which the current user liked. */
  listThread(threadKey: string, userId?: string): Promise<ThreadData>

  /** Post a new comment. */
  postComment(threadKey: string, authorId: string, body: string): Promise<CommunityResult>

  /** Delete a comment by id (RLS / rules enforce ownership). */
  deleteComment(commentId: string): Promise<CommunityResult>

  /** Like (liked=true) or unlike (liked=false) a comment for a user. */
  setLike(commentId: string, userId: string, liked: boolean): Promise<CommunityResult>

  /** Whether the user holds an all-access entitlement (paywall). */
  hasEntitlement(userId: string): Promise<boolean>
}
