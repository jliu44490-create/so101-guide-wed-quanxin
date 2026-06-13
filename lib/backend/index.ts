/**
 * Backend selector. Resolves the active Auth + Community backends from the
 * build's region.
 *
 * Consumers import `authBackend` / `communityBackend` (not a specific SDK) so the
 * React layer is backend-agnostic. See ./types.ts and ./community-types.ts.
 */

import { backendKind } from '@/lib/region'
import { supabaseAuthBackend } from './supabase-backend'
import { cloudbaseAuthBackend } from './cloudbase-backend'
import { supabaseCommunityBackend } from './supabase-community'
import { cloudbaseCommunityBackend } from './cloudbase-community'
import type { AuthBackend } from './types'
import type { CommunityBackend } from './community-types'

const isCloudbase = backendKind === 'cloudbase'

export const authBackend: AuthBackend = isCloudbase
  ? cloudbaseAuthBackend
  : supabaseAuthBackend

export const communityBackend: CommunityBackend = isCloudbase
  ? cloudbaseCommunityBackend
  : supabaseCommunityBackend

export type {
  AuthBackend,
  BackendUser,
  BackendSession,
  ActionResult,
  SignUpResult
} from './types'
export type { CommunityBackend, UIComment, ThreadData, CommunityResult } from './community-types'
