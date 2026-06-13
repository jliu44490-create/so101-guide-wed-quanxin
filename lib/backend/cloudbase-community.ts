/**
 * Tencent CloudBase implementation of CommunityBackend (powers the `cn` region).
 *
 * ─── STATUS: scaffold ───────────────────────────────────────────────────────
 * CloudBase exposes PostgreSQL data through its "数据模型" ORM (app.models.*,
 * from @cloudbase/wx-cloud-client-sdk) — NOT a PostgREST/supabase-js surface.
 * Wiring this up needs, in the CloudBase console first:
 *   1. data models defined for profiles / comments / comment_votes /
 *      entitlements (mapping onto the PG tables migrated from supabase/schema.sql)
 *   2. read/write permission rules tied to the logged-in user
 *
 * Then each method below becomes an ORM call, roughly:
 *   const { app } = await getCloudbase()
 *   const { data } = await app.models.comments.list({
 *     filter: { where: { thread_key: { $eq: threadKey } } },
 *     orderBy: [{ created_at: 'asc' }],
 *   })
 *
 * Until models exist, `isConfigured` is false so the community UI shows the same
 * "即将开放" placeholder it shows when no backend is set.
 */

import type { CommunityBackend, CommunityResult, ThreadData } from './community-types'

/* eslint-disable @typescript-eslint/no-unused-vars */

// Gate on a dedicated flag the console step will set once models are ready, so
// auth (which only needs ENV + ACCESS_KEY) can be live before the data layer is.
const configured = false

const notReady: CommunityResult = { error: 'not_configured' }

export const cloudbaseCommunityBackend: CommunityBackend = {
  isConfigured: configured,

  async listThread(_threadKey: string, _userId?: string): Promise<ThreadData> {
    return { comments: [], likedIds: [] }
  },

  async postComment(): Promise<CommunityResult> {
    return notReady
  },

  async deleteComment(): Promise<CommunityResult> {
    return notReady
  },

  async setLike(): Promise<CommunityResult> {
    return notReady
  },

  async hasEntitlement(): Promise<boolean> {
    return false
  }
}
