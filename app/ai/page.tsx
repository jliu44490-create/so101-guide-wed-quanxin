'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowUp, Bot, Loader2, Sparkles, User as UserIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Prose } from '@/components/prose'
import { useAuth } from '@/lib/use-auth'
import { useEntitlement } from '@/lib/use-entitlement'
import { AI_OVERAGE } from '@/lib/ai-config'
import { cn } from '@/lib/utils'

interface Msg {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
}

const SUGGESTIONS = [
  'SO-101 怎么校准？',
  'ACT 和 BC 有什么区别？',
  '数据采集命令怎么写？',
  '训练 loss 变 NaN 怎么办？'
]

const uid = () => Math.random().toString(36).slice(2)

export default function AiPage() {
  const { ready, isLoggedIn, session, profile, user } = useAuth()
  const { hasAccess } = useEntitlement()
  const isPlus = hasAccess

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [quotaReached, setQuotaReached] = useState(false)
  const [buying, setBuying] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streaming])

  // Returning from a credit-pack purchase.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('topup') === 'success') {
      toast.success('额外配额已到账，可以继续提问了')
      window.history.replaceState({}, '', '/ai')
    }
  }, [])

  const buyCredits = async () => {
    if (!session || buying) return
    setBuying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ product: 'ai_credits' })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error ?? '购买入口暂不可用')
        setBuying(false)
      }
    } catch {
      toast.error('网络错误，请重试')
      setBuying(false)
    }
  }

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || streaming || !session) return
    setInput('')
    setQuotaReached(false)
    const userMsg: Msg = { id: uid(), role: 'user', content: q }
    const aiMsg: Msg = { id: uid(), role: 'assistant', content: '' }
    const history = [...messages, userMsg]
    setMessages([...history, aiMsg])
    setStreaming(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.content })) })
      })

      if (res.status === 429) {
        setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
        setQuotaReached(true)
        toast.error('今日配额已用完')
        return
      }
      if (!res.ok || !res.body) {
        setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
        toast.error('回复失败，请稍后重试')
        return
      }

      const usedModel = res.headers.get('x-ai-model') ?? undefined
      if (usedModel) {
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, model: usedModel } : m)))
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ''
      for (;;) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, content: acc } : m)))
      }
      if (!acc.trim()) {
        setMessages((prev) => prev.map((m) => (m.id === aiMsg.id ? { ...m, content: '（没有返回内容，请重试）' } : m)))
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
      toast.error('网络错误，请重试')
    } finally {
      setStreaming(false)
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!isLoggedIn) return null // AuthGate redirects

  const name = profile?.username ?? user?.email ?? '我'

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4">
        {/* Title */}
        <div className="flex items-center justify-between gap-3 py-5">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-white shadow-md shadow-primary/25">
              <Bot className="size-5" />
            </div>
            <div className="leading-tight">
              <h1 className="text-lg font-bold tracking-tight">LVJIN AI</h1>
              <p className="text-[11px] text-muted-foreground">SO-101 · LeRobot 专家助教</p>
            </div>
          </div>
          {isPlus ? (
            <Badge className="gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground">
              <Sparkles className="size-3" /> Plus
            </Badge>
          ) : (
            <Button asChild size="sm" variant="outline" className="h-7 gap-1">
              <Link href="/unlock">
                <Sparkles className="size-3" /> 升级 Plus
              </Link>
            </Button>
          )}
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-5 overflow-y-auto pb-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border/60">
                <Bot className="size-7 text-primary" />
              </div>
              <p className="mt-4 text-sm font-medium">问我任何关于 SO-101 / 模仿学习的问题</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {isPlus ? 'Plus：Claude Sonnet 4.6 · 更高用量' : 'Free：开源模型 · 升级 Plus 可用更强模型与更多用量'}
              </p>
              <div className="mt-6 grid w-full max-w-md gap-2 sm:grid-cols-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-xl border border-border/60 bg-card/40 px-3 py-2.5 text-left text-sm transition-colors hover:border-primary/40 hover:bg-card"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div key={m.id} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                {m.role === 'assistant' ? (
                  <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-white">
                    <Bot className="size-4" />
                  </div>
                ) : (
                  <Avatar className="mt-0.5 size-7 shrink-0">
                    {profile?.avatar_url && <AvatarImage src={profile.avatar_url} alt={name} />}
                    <AvatarFallback className="bg-secondary text-xs">
                      <UserIcon className="size-3.5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'min-w-0 max-w-[85%] rounded-2xl px-4 py-2.5 text-sm',
                    m.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
                      : 'border border-border/50 bg-card/50'
                  )}
                >
                  {m.role === 'assistant' ? (
                    <>
                      {m.content ? (
                        <Prose content={m.content} size="sm" />
                      ) : (
                        <Loader2 className="size-4 animate-spin text-muted-foreground" />
                      )}
                      {m.model && (
                        <p className="mt-1.5 text-[10px] text-muted-foreground/70">由 {m.model} 回答</p>
                      )}
                    </>
                  ) : (
                    <span className="whitespace-pre-wrap">{m.content}</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Quota-reached → buy overage */}
        {quotaReached && (
          <div className="mb-2 flex flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center sm:flex-row sm:justify-between sm:text-left">
            <p className="text-sm">
              今日配额已用完。{!isPlus && '升级 Plus 可获更高配额，或'}购买额外配额（{AI_OVERAGE.priceLabel} / 100 万 token，约 320 次，永久不过期）。
            </p>
            <div className="flex shrink-0 gap-2">
              {!isPlus && (
                <Button asChild size="sm" variant="outline">
                  <Link href="/unlock">升级 Plus</Link>
                </Button>
              )}
              <Button size="sm" onClick={buyCredits} disabled={buying} className="gap-1.5">
                {buying ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                额外配额 {AI_OVERAGE.priceLabel}
              </Button>
            </div>
          </div>
        )}

        {/* Composer */}
        <div className="sticky bottom-0 bg-background pb-5 pt-2">
          <div className="relative rounded-2xl border border-border/60 bg-card/60 shadow-sm focus-within:border-primary/50">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  send(input)
                }
              }}
              placeholder="问 LVJIN AI… (Enter 发送，Shift+Enter 换行)"
              className="max-h-40 min-h-12 resize-none border-0 bg-transparent pr-12 focus-visible:ring-0"
            />
            <Button
              size="icon"
              onClick={() => send(input)}
              disabled={streaming || !input.trim()}
              className="absolute bottom-2 right-2 size-8 rounded-lg"
            >
              {streaming ? <Loader2 className="size-4 animate-spin" /> : <ArrowUp className="size-4" />}
            </Button>
          </div>
          <p className="mt-1.5 px-1 text-center text-[10px] text-muted-foreground">
            LVJIN AI 可能出错，重要操作请对照官方文档与课程内容核实。
          </p>
        </div>
      </main>
    </div>
  )
}
