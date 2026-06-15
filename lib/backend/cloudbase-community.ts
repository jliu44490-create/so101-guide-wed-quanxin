/**
 * Tencent CloudBase implementation of CommunityBackend (powers the `cn` region).
 *
 * Calls the `community` cloud function (cloudbase/functions/community) via
 * app.callFunction — the function connects to PostgreSQL server-side and
 * enforces permissions from the caller's authenticated uid. Browser-direct PG
 * access isn't possible (CORS + the data API is plan-gated), hence the function.
 *
 * Gated by NEXT_PUBLIC_CLOUDBASE_COMMUNITY=1 so the community stays a "coming
 * soon" placeholder until the function is actually deployed.
 */

import { getCloudbaseApp, cloudbaseConfigured } from './cloudbase-app'
import type { CommunityBackend, CommunityResult, ThreadData } from './community-types'

/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */

const configured =
  cloudbaseConfigured && process.env.NEXT_PUBLIC_CLOUDBASE_COMMUNITY === '1'

const notReady: CommunityResult = { error: 'not_configured' }

interface FnResult {
  data: any
  error: string | null
}

async function call(action: string, args: Record<string, unknown> = {}): Promise<FnResult> {
  const app = await getCloudbaseApp()
  const res = await app.callFunction({ name: 'community', data: { action, ...args } })
  return (res?.result as FnResult) ?? { data: null, error: 'no_result' }
}

export const cloudbaseCommunityBackend: CommunityBackend = {
  isConfigured: configured,

  async listThread(threadKey: string, _userId?: string): Promise<ThreadData> {
    if (!configured) return { comments: [], likedIds: [] }
    try {
      const r = await call('listThread', { threadKey })
      if (r.error) return { comments: [], likedIds: [] }
      return { comments: r.data?.comments ?? [], likedIds: r.data?.likedIds ?? [] }
    } catch {
      return { comments: [], likedIds: [] }
    }
  },

  async postComment(threadKey: string, _authorId: string, body: string): Promise<CommunityResult> {
    // author_id is taken from the caller's auth context inside the function.
    if (!configured) return notReady
    const r = await call('postComment', { threadKey, body })
    return { error: r.error }
  },

  async deleteComment(commentId: string): Promise<CommunityResult> {
    if (!configured) return notReady
    const r = await call('deleteComment', { commentId })
    return { error: r.error }
  },

  async setLike(commentId: string, _userId: string, liked: boolean): Promise<CommunityResult> {
    if (!configured) return notReady
    const r = await call('setLike', { commentId, liked })
    return { error: r.error }
  },

  async hasEntitlement(_userId: string): Promise<boolean> {
    if (!configured) return false
    try {
      const r = await call('getEntitlement')
      return !!r.data?.hasEntitlement
    } catch {
      return false
    }
  }
}
