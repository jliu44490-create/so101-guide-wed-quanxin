/**
 * Supabase implementation of CommunityBackend (powers the `global` region).
 * Thin wrapper around the existing PostgREST queries that used to live inline
 * in discussion.tsx / use-entitlement.ts — behaviour is unchanged.
 */

import { supabase, isSupabaseConfigured } from '@/lib/supabase'
import type { CommunityBackend, CommunityResult, ThreadData, UIComment } from './community-types'

export const supabaseCommunityBackend: CommunityBackend = {
  isConfigured: isSupabaseConfigured,

  async listThread(threadKey: string, userId?: string): Promise<ThreadData> {
    if (!supabase) return { comments: [], likedIds: [] }

    const { data, error } = await supabase
      .from('comments_with_meta')
      .select('*')
      .eq('thread_key', threadKey)
      .order('created_at', { ascending: true })

    if (error) return { comments: [], likedIds: [] }
    const comments = (data as UIComment[]) ?? []

    let likedIds: string[] = []
    if (userId && comments.length > 0) {
      const { data: votes } = await supabase
        .from('comment_votes')
        .select('comment_id')
        .eq('user_id', userId)
        .in(
          'comment_id',
          comments.map((c) => c.id)
        )
      likedIds = (votes ?? []).map((v: { comment_id: string }) => v.comment_id)
    }
    return { comments, likedIds }
  },

  async postComment(threadKey, authorId, body): Promise<CommunityResult> {
    if (!supabase) return { error: 'not_configured' }
    const { error } = await supabase
      .from('comments')
      .insert({ thread_key: threadKey, author_id: authorId, body })
    return { error: error?.message ?? null }
  },

  async deleteComment(commentId): Promise<CommunityResult> {
    if (!supabase) return { error: 'not_configured' }
    const { error } = await supabase.from('comments').delete().eq('id', commentId)
    return { error: error?.message ?? null }
  },

  async setLike(commentId, userId, liked): Promise<CommunityResult> {
    if (!supabase) return { error: 'not_configured' }
    if (liked) {
      const { error } = await supabase
        .from('comment_votes')
        .insert({ comment_id: commentId, user_id: userId })
      return { error: error?.message ?? null }
    }
    const { error } = await supabase
      .from('comment_votes')
      .delete()
      .eq('comment_id', commentId)
      .eq('user_id', userId)
    return { error: error?.message ?? null }
  },

  async hasEntitlement(userId): Promise<boolean> {
    if (!supabase) return false
    const { data } = await supabase
      .from('entitlements')
      .select('user_id')
      .eq('user_id', userId)
      .maybeSingle()
    return !!data
  }
}
