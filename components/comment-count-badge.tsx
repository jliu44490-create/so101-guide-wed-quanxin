'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle } from 'lucide-react'
import { getThreadCounts } from '@/lib/community'
import { isSupabaseConfigured } from '@/lib/supabase'
import { cn } from '@/lib/utils'

interface CommentCountBadgeProps {
  threadKey: string
  className?: string
  /**
   * If true, the badge is rendered even when count is 0 (shows "0 讨论" so
   * the visual slot stays stable). Default false — hides until someone
   * actually comments so the UI doesn't look populated with empty zeros.
   */
  alwaysShow?: boolean
}

/**
 * Tiny inline badge: "💬 N". Self-fetches the count for one thread.
 *
 *   - Hidden entirely when Supabase isn't configured (avoid promising
 *     features we don't have).
 *   - Hidden when count = 0 unless `alwaysShow`.
 *   - The count is cached per thread for the page session via a module-level
 *     map, so multiple badges referencing the same thread don't re-query.
 *
 * For bulk fetching (e.g. /learn list with 9 chapters), use the helper
 * `useThreadCountsMap` which makes one batched query.
 */
const cache = new Map<string, number>()

export function CommentCountBadge({ threadKey, className, alwaysShow = false }: CommentCountBadgeProps) {
  const isJa = usePathname()?.startsWith('/ja') ?? false
  const [count, setCount] = useState<number | null>(() => cache.get(threadKey) ?? null)

  useEffect(() => {
    if (!isSupabaseConfigured) return
    if (cache.has(threadKey)) {
      setCount(cache.get(threadKey)!)
      return
    }
    let alive = true
    getThreadCounts([threadKey]).then((map) => {
      if (!alive) return
      const v = map.get(threadKey) ?? 0
      cache.set(threadKey, v)
      setCount(v)
    })
    return () => {
      alive = false
    }
  }, [threadKey])

  if (!isSupabaseConfigured) return null
  if (count === null) return null
  if (count === 0 && !alwaysShow) return null

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border border-border/60 bg-card/60 px-2 py-0.5 text-[10px] font-medium text-muted-foreground',
        className
      )}
      title={isJa ? `${count} 件のコメント` : `${count} 条讨论`}
    >
      <MessageCircle className="h-2.5 w-2.5" />
      {count}
    </span>
  )
}

/**
 * Batched hook: pass all thread keys you need on a page, get back a Map.
 * Use this for /learn (9 chapters) instead of mounting 9 individual badges
 * that each fire a query.
 */
export function useThreadCountsMap(threadKeys: string[]): Map<string, number> {
  const [map, setMap] = useState<Map<string, number>>(new Map())

  useEffect(() => {
    if (!isSupabaseConfigured || threadKeys.length === 0) return
    let alive = true
    getThreadCounts(threadKeys).then((m) => {
      if (!alive) return
      // also seed the per-key cache for any standalone badges that mount later
      m.forEach((v, k) => cache.set(k, v))
      setMap(m)
    })
    return () => {
      alive = false
    }
    // We only care that the SET of keys changes — stringify for stability.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [threadKeys.join(',')])

  return map
}
