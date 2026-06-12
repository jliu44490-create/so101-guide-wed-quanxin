/**
 * Backend selector. Resolves the active AuthBackend from the build's region.
 *
 * Consumers import `authBackend` (not a specific SDK) so the React layer is
 * backend-agnostic. See lib/backend/types.ts for the contract.
 */

import { backendKind } from '@/lib/region'
import { supabaseAuthBackend } from './supabase-backend'
import { cloudbaseAuthBackend } from './cloudbase-backend'
import type { AuthBackend } from './types'

export const authBackend: AuthBackend =
  backendKind === 'cloudbase' ? cloudbaseAuthBackend : supabaseAuthBackend

export type {
  AuthBackend,
  BackendUser,
  BackendSession,
  ActionResult,
  SignUpResult
} from './types'
