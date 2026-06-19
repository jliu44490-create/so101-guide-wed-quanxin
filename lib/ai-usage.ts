'use client'

/**
 * Read the current user's LVJIN AI quota state for display.
 *
 * Everything is read straight from Supabase with the user's own session — RLS
 * lets a user read their own ai_usage / ai_credits / entitlements rows. We
 * mirror the /api/ai/chat tier logic exactly (entitlement row ⇒ plus) so the
 * number on screen matches what the route actually enforces — independent of
 * NEXT_PUBLIC_PAYWALL_ENABLED.
 */

import { supabase } from './supabase'
import { AI_TOKEN_LIMITS, type AiTier } from './ai-config'

export interface UsageInfo {
  tier: AiTier
  /** Tokens spent today (UTC). */
  used: number
  /** Daily token allowance for the tier. */
  limit: number
  /** Allowance left today (never negative). */
  remaining: number
  /** Prepaid overage tokens, spent only after the daily allowance runs out. */
  credits: number
}

const utcDay = () => new Date().toISOString().slice(0, 10)

export async function getUsage(userId: string): Promise<UsageInfo | null> {
  if (!supabase) return null
  const [entRes, usageRes, creditRes] = await Promise.all([
    supabase.from('entitlements').select('user_id').eq('user_id', userId).maybeSingle(),
    supabase
      .from('ai_usage')
      .select('tokens_used')
      .eq('user_id', userId)
      .eq('day', utcDay())
      .maybeSingle(),
    supabase.from('ai_credits').select('balance').eq('user_id', userId).maybeSingle()
  ])

  const tier: AiTier = entRes.data ? 'plus' : 'free'
  const limit = AI_TOKEN_LIMITS[tier]
  const used = Number(usageRes.data?.tokens_used ?? 0)
  const credits = Number(creditRes.data?.balance ?? 0)
  return { tier, used, limit, remaining: Math.max(0, limit - used), credits }
}
