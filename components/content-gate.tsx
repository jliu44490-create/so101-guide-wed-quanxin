'use client'

/**
 * Wraps paid content. Renders children when the user may see it, otherwise the
 * PaywallGate. Free chapters (and the whole site when the paywall is off) pass
 * straight through.
 *
 * NOTE: this is a *soft* gate — locked lesson/article data still travels to the
 * browser in the RSC payload because auth is client-side. For a 99元 course
 * that's an accepted tradeoff for v1. Hardening to a server-enforced gate would
 * require moving content behind an authenticated API (tracked as a follow-up).
 */

import type { ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { chapterRequiresAccess } from '@/lib/paywall'
import { useEntitlement } from '@/lib/use-entitlement'
import { PaywallGate } from '@/components/paywall-gate'

interface ContentGateProps {
  chapterId: number
  what?: string
  children: ReactNode
}

export function ContentGate({ chapterId, what, children }: ContentGateProps) {
  const requires = chapterRequiresAccess(chapterId)
  const { hasAccess, loading } = useEntitlement()
  const isJa = usePathname()?.startsWith('/ja') ?? false

  if (!requires) return <>{children}</>

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        {isJa ? 'アクセス権を確認中…' : '正在检查访问权限…'}
      </div>
    )
  }

  if (!hasAccess) return <PaywallGate what={what} />

  return <>{children}</>
}
