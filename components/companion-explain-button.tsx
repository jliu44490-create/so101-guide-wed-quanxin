'use client'

/**
 * "让 LVJIN 讲讲" — hands a doc passage to the 电子学习伴侣 for a lively,
 * plain-language explanation. Self-gating: renders nothing unless the viewer is
 * an opted-in Plus member (so non-eligible users never see a dead button).
 */

import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/use-auth'
import { useEntitlement } from '@/lib/use-entitlement'
import { emitCompanion } from '@/lib/companion-bus'

interface Props {
  topic: string
  context?: string
  label?: string
}

export function CompanionExplainButton({ topic, context, label = '让 LVJIN 讲讲本章' }: Props) {
  const { ready, isLoggedIn, profile } = useAuth()
  const { hasAccess } = useEntitlement()

  if (!(ready && isLoggedIn && hasAccess && profile?.companion_enabled)) return null

  return (
    <Button
      variant="outline"
      size="sm"
      className="w-full justify-start border-primary/30 bg-primary/5 hover:bg-primary/10"
      onClick={() => emitCompanion({ type: 'explain', topic, context })}
    >
      <Sparkles className="mr-2 h-3.5 w-3.5 text-primary" />
      {label}
    </Button>
  )
}
