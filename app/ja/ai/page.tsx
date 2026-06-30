'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  ArrowUp,
  Bot,
  Gauge,
  Loader2,
  MessageSquarePlus,
  PanelLeftClose,
  Plus,
  Sparkles,
  Trash2,
  User as UserIcon,
  Wrench
} from 'lucide-react'
import { toast } from 'sonner'
import { Header } from '@/components/header'
import { BinaryField } from '@/components/binary-field'
import { SetupWizard } from '@/components/setup-wizard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Textarea } from '@/components/ui/textarea'
import { Prose } from '@/components/prose'
import { useAuth } from '@/lib/use-auth'
import { useEntitlement } from '@/lib/use-entitlement'
import { AI_OVERAGE } from '@/lib/ai-config'
import {
  type Conversation,
  createConversation,
  deleteConversation,
  listConversations,
  loadMessages,
  saveMessage,
  titleFromText
} from '@/lib/ai-conversations'
import { getUsage, type UsageInfo } from '@/lib/ai-usage'
import { cn } from '@/lib/utils'

interface Msg {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
}

/** Grouped starter prompts — the "interactive choices" shown on a fresh chat. */
const INTRO_GROUPS: { label: string; items: string[] }[] = [
  { label: '🔧 セットアップ · キャリブレーション', items: ['SO-101 の初回キャリブレーションは？', 'ロボットアームのシリアルポートの探し方は？'] },
  { label: '🎥 データ収集', items: ['データセット収録のコマンドは？', '1 タスクで何エピソードくらい必要？'] },
  { label: '🧠 モデル学習', items: ['ACT と Diffusion Policy はどう選ぶ？', '学習中に loss が NaN になったら？'] },
  { label: '🚀 デプロイ · 評価', items: ['学習したポリシーの評価方法は？', '推論時にアームが動かない原因は？'] }
]

const uid = () => Math.random().toString(36).slice(2)

function relTime(iso: string): string {
  const d = Date.now() - new Date(iso).getTime()
  const m = Math.floor(d / 60000)
  if (m < 1) return 'たった今'
  if (m < 60) return `${m} 分前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 時間前`
  const day = Math.floor(h / 24)
  if (day < 30) return `${day} 日前`
  return new Date(iso).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })
}

/** Compact token formatter: 8200 → 8.2k, 50000 → 50k, 1000000 → 1M. */
function fmtTok(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n % 1000 && n < 10_000 ? 1 : 0)}k`
  return `${n}`
}

const APPROX_TOKENS_PER_QA = 3150 // for a friendly "≈ N 回" estimate

/** Today's quota meter shown at the bottom of the sidebar. */
function QuotaBar({ usage }: { usage: UsageInfo | null }) {
  if (!usage) return null
  const pct = usage.limit ? Math.min(100, Math.round((usage.used / usage.limit) * 100)) : 0
  const near = pct >= 80
  const remainingQA = Math.floor((usage.remaining + usage.credits) / APPROX_TOKENS_PER_QA)
  return (
    <div className="shrink-0 rounded-xl border border-border/50 bg-card/40 p-3">
      <div className="mb-1.5 flex items-center justify-between text-xs">
        <span className="flex items-center gap-1 font-medium text-muted-foreground">
          <Gauge className="size-3.5" /> 本日の利用枠
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">
          {fmtTok(usage.used)}/{fmtTok(usage.limit)}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-secondary">
        <div
          className={cn(
            'h-full rounded-full transition-all',
            near ? 'bg-amber-500' : 'bg-gradient-to-r from-primary to-accent'
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>残り {fmtTok(usage.remaining)} · 約 {remainingQA} 回</span>
        {usage.credits > 0 && (
          <span className="font-medium text-primary">追加 {fmtTok(usage.credits)}</span>
        )}
      </div>
    </div>
  )
}

/** Glowing AI avatar orb — the assistant's identity across the page. */
function Orb({ size = 'sm', live = false }: { size?: 'sm' | 'lg'; live?: boolean }) {
  const box = size === 'lg' ? 'size-16' : 'size-7'
  const icon = size === 'lg' ? 'size-7' : 'size-4'
  return (
    <span className={cn('relative inline-flex shrink-0 items-center justify-center', box)}>
      <span
        className={cn(
          'absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-60 blur-md',
          live && 'animate-pulse'
        )}
      />
      {size === 'lg' && (
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/30 [animation-duration:3s]" />
      )}
      <span className="relative flex size-full items-center justify-center rounded-full bg-gradient-to-br from-primary via-accent to-primary text-white ring-1 ring-white/20">
        <Bot className={icon} />
      </span>
    </span>
  )
}

export default function AiPageJa() {
  const { ready, isLoggedIn, session, profile, user } = useAuth()
  const { hasAccess } = useEntitlement()
  const isPlus = hasAccess
  const userId = user?.id ?? null

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Msg[]>([])
  const [loadingConvo, setLoadingConvo] = useState(false)
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [quotaReached, setQuotaReached] = useState(false)
  const [buying, setBuying] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false) // mobile drawer
  const [usage, setUsage] = useState<UsageInfo | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Load the conversation list + quota once we know the user.
  useEffect(() => {
    if (!userId) return
    listConversations(userId).then(setConversations)
    getUsage(userId).then(setUsage)
  }, [userId])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, streaming])

  // Handle return-from-purchase and a ?q= handoff (e.g. from エラー診断).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('topup') === 'success') {
      toast.success('追加の利用枠が反映されました。続けて質問できます')
    }
    const q = params.get('q')
    if (q) setInput(q)
    if (params.get('topup') || q) window.history.replaceState({}, '', '/ja/ai')
  }, [])

  const newChat = useCallback(() => {
    setActiveId(null)
    setMessages([])
    setQuotaReached(false)
    setSidebarOpen(false)
  }, [])

  const openConversation = useCallback(
    async (id: string) => {
      if (id === activeId) {
        setSidebarOpen(false)
        return
      }
      setActiveId(id)
      setSidebarOpen(false)
      setQuotaReached(false)
      setLoadingConvo(true)
      const rows = await loadMessages(id)
      setMessages(
        rows.map((m) => ({ id: m.id, role: m.role, content: m.content, model: m.model ?? undefined }))
      )
      setLoadingConvo(false)
    },
    [activeId]
  )

  const removeConversation = useCallback(
    async (id: string) => {
      setConversations((prev) => prev.filter((c) => c.id !== id))
      await deleteConversation(id)
      if (id === activeId) newChat()
    },
    [activeId, newChat]
  )

  const buyCredits = async () => {
    if (!session || buying) return
    setBuying(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ product: 'ai_credits', locale: 'ja' })
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok && data.url) {
        window.location.href = data.url
      } else {
        toast.error(data.error ?? '購入導線は現在利用できません')
        setBuying(false)
      }
    } catch {
      toast.error('ネットワークエラーです。もう一度お試しください')
      setBuying(false)
    }
  }

  const send = async (text: string) => {
    const q = text.trim()
    if (!q || streaming || !session || !userId) return
    setInput('')
    setQuotaReached(false)

    // Ensure there's a conversation to attach this turn to.
    let convId = activeId
    let isNew = false
    if (!convId) {
      convId = await createConversation(userId, q)
      if (!convId) {
        toast.error('会話を作成できませんでした。もう一度お試しください')
        return
      }
      isNew = true
      setActiveId(convId)
    }

    const userMsg: Msg = { id: uid(), role: 'user', content: q }
    const aiMsg: Msg = { id: uid(), role: 'assistant', content: '' }
    const history = [...messages, userMsg]
    setMessages([...history, aiMsg])
    setStreaming(true)

    // Persist the question immediately, and reflect the conversation in the sidebar.
    void saveMessage(convId, userId, 'user', q)
    const nowIso = new Date().toISOString()
    if (isNew) {
      setConversations((prev) => [
        { id: convId!, title: titleFromText(q), created_at: nowIso, updated_at: nowIso },
        ...prev
      ])
    } else {
      setConversations((prev) => {
        const hit = prev.find((c) => c.id === convId)
        if (!hit) return prev
        return [{ ...hit, updated_at: nowIso }, ...prev.filter((c) => c.id !== convId)]
      })
    }

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ messages: history.map((m) => ({ role: m.role, content: m.content })) })
      })

      if (res.status === 429) {
        setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
        setQuotaReached(true)
        toast.error('本日の利用枠を使い切りました')
        return
      }
      if (!res.ok || !res.body) {
        setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
        toast.error('応答に失敗しました。しばらくして再度お試しください')
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
      if (acc.trim()) {
        void saveMessage(convId, userId, 'assistant', acc, usedModel)
      } else {
        setMessages((prev) =>
          prev.map((m) => (m.id === aiMsg.id ? { ...m, content: '（応答がありませんでした。もう一度お試しください）' } : m))
        )
      }
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== aiMsg.id))
      toast.error('ネットワークエラーです。もう一度お試しください')
    } finally {
      setStreaming(false)
      if (userId) getUsage(userId).then(setUsage)
    }
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!isLoggedIn) {
    // Public landing for logged-out / crawler visits (page is now SEO-crawlable).
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="relative flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.16] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,black,transparent)]">
            <BinaryField />
          </div>
          <div className="relative w-full max-w-2xl">
            <div className="flex justify-center">
              <Orb size="lg" live />
            </div>
            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                LVJIN AI
              </span>{' '}
              · SO-101 模倣学習アシスタント
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground sm:text-base">
              環境構築、キャリブレーション、データ収集、ACT 学習、推論デプロイ、エラー対処——いつでも質問できます。
              回答はサイト内の講座とエラーベースに基づくので、英語ドキュメントを探し回る必要はありません。
            </p>

            <div className="mt-7 grid gap-3 text-left sm:grid-cols-2">
              {INTRO_GROUPS.map((g) => (
                <div
                  key={g.label}
                  className="rounded-2xl border border-border/50 bg-card/40 p-3 backdrop-blur-sm"
                >
                  <p className="px-1 pb-2 text-xs font-semibold text-muted-foreground">{g.label}</p>
                  <ul className="space-y-1.5">
                    {g.items.map((s) => (
                      <li key={s} className="rounded-lg bg-background/40 px-2.5 py-2 text-[13px]">
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-3 text-left sm:grid-cols-3">
              {[
                {
                  icon: Wrench,
                  title: '答えられること',
                  body: '環境構築 · キャリブレーション · データ収集 · ACT 学習 · 推論デプロイ · エラー対処'
                },
                {
                  icon: Sparkles,
                  title: '回答の根拠',
                  body: 'サイト内 9 章の講座 + エラー診断ベース + 用語集 + リソースセンター、出典つき'
                },
                {
                  icon: Gauge,
                  title: '利用枠とご注意',
                  body: '毎日無料枠あり、Plus は利用枠を拡大し全講座を利用可能。重要なハード操作は公式ドキュメントを優先してください'
                }
              ].map((c) => (
                <div
                  key={c.title}
                  className="rounded-2xl border border-border/50 bg-card/40 p-3 backdrop-blur-sm"
                >
                  <div className="flex items-center gap-1.5 px-1 pb-1.5 text-xs font-semibold text-foreground">
                    <c.icon className="h-3.5 w-3.5 text-primary" />
                    {c.title}
                  </div>
                  <p className="px-1 text-[12.5px] leading-relaxed text-muted-foreground">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button asChild size="lg" className="glow-primary">
                <Link href="/login?next=%2Fja%2Fai">ログインして会話を始める</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/ja/signup">アカウントが無い？無料登録</Link>
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const name = profile?.username ?? user?.email?.split('@')[0] ?? 'みなさん'

  const sidebar = (
    <div className="flex h-full flex-col gap-3 p-3">
      <Button
        onClick={newChat}
        className="glow-primary h-10 justify-start gap-2 bg-gradient-to-r from-primary to-accent text-primary-foreground"
      >
        <Plus className="size-4" /> 新しい会話
      </Button>

      <div className="px-1 pt-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/70">
        会話履歴
      </div>

      <div className="-mr-1 flex-1 space-y-1 overflow-y-auto pr-1">
        {conversations.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-muted-foreground">
            まだ会話がありません。<br />何か聞くと、ここに記録が出ます。
          </p>
        ) : (
          conversations.map((c) => (
            <div
              key={c.id}
              className={cn(
                'group/item flex items-center gap-2 rounded-lg border px-2.5 py-2 text-sm transition-colors',
                c.id === activeId
                  ? 'border-primary/40 bg-primary/10 text-foreground'
                  : 'border-transparent text-muted-foreground hover:border-border/60 hover:bg-card/75 backdrop-blur-md hover:text-foreground'
              )}
            >
              <button
                onClick={() => openConversation(c.id)}
                className="flex min-w-0 flex-1 flex-col items-start text-left"
              >
                <span className="line-clamp-1 w-full font-medium">{c.title}</span>
                <span className="text-[10px] text-muted-foreground/70">{relTime(c.updated_at)}</span>
              </button>
              <button
                onClick={() => removeConversation(c.id)}
                aria-label="会話を削除"
                className="shrink-0 rounded-md p-1 text-muted-foreground/50 opacity-0 transition hover:bg-rose-500/10 hover:text-rose-500 group-hover/item:opacity-100"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

      <QuotaBar usage={usage} />
    </div>
  )

  return (
    <div className="flex h-screen flex-col">
      <Header />

      <div className="relative flex min-h-0 flex-1">
        {/* Desktop sidebar */}
        <aside className="hidden w-64 shrink-0 border-r border-border/40 bg-card/20 backdrop-blur-xl md:block">
          {sidebar}
        </aside>

        {/* Mobile sidebar drawer */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 border-border/40 bg-card/95 p-0 backdrop-blur-xl">
            <SheetTitle className="sr-only">会話履歴</SheetTitle>
            {sidebar}
          </SheetContent>
        </Sheet>

        {/* Chat column */}
        <main className="relative flex min-w-0 flex-1 flex-col">
          {/* Chat header strip */}
          <div className="flex items-center gap-2.5 border-b border-border/40 px-4 py-2.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="size-8 md:hidden"
              aria-label="会話履歴"
            >
              <PanelLeftClose className="size-4" />
            </Button>
            <Orb />
            <div className="min-w-0 flex-1 leading-tight">
              <h1 className="flex items-center gap-1.5 text-sm font-bold tracking-tight">
                LVJIN AI
                <span className="hidden text-[10px] font-normal text-muted-foreground sm:inline">
                  · SO-101 専門チューター
                </span>
              </h1>
            </div>
            {usage && (
              <button
                onClick={() => setSidebarOpen(true)}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full border border-border/50 bg-card/75 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-muted-foreground md:hidden"
                aria-label="本日の利用枠"
              >
                <Gauge className="size-3" />本日の残り {fmtTok(usage.remaining + usage.credits)}
              </button>
            )}
            {isPlus ? (
              <Badge className="gap-1 bg-gradient-to-r from-primary to-accent text-primary-foreground">
                <Sparkles className="size-3" /> Plus
              </Badge>
            ) : (
              <Button asChild size="sm" variant="outline" className="h-7 gap-1">
                <Link href="/ja/unlock">
                  <Sparkles className="size-3" /> Plus にアップグレード
                </Link>
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={newChat}
              className="size-8 md:hidden"
              aria-label="新しい会話"
            >
              <MessageSquarePlus className="size-4" />
            </Button>
          </div>

          {/* Messages / intro */}
          <div ref={scrollRef} className="relative flex-1 overflow-y-auto">
            {loadingConvo ? (
              <div className="flex h-full items-center justify-center">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              /* ── Self-introduction + interactive choices ── */
              <div className="relative flex min-h-full flex-col items-center justify-center px-4 py-10">
                <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-[0.18] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_45%,black,transparent)]">
                  <BinaryField />
                </div>
                <div className="relative w-full max-w-2xl text-center">
                  <div className="flex justify-center">
                    <Orb size="lg" live />
                  </div>
                  <h2 className="mt-5 text-2xl font-bold tracking-tight">
                    こんにちは、{name} 👋 私は <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">LVJIN AI</span>
                  </h2>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                    SO-101 / LeRobot 模倣学習の専属アシスタントです。キャリブレーション、収集、学習、デプロイ——
                    1 つのコマンドから 1 つのエラーまで、何でも聞いてください。下の候補から選ぶか、質問を直接入力してください：
                  </p>

                  <div className="mt-5 flex justify-center">
                    <SetupWizard
                      onAskAi={(t) => send(t)}
                      trigger={
                        <button className="group flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:bg-primary/15">
                          <Wrench className="size-4 text-primary" />
                          初めて？「環境ウィザード」でまとめてセットアップ
                          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                        </button>
                      }
                    />
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-2">
                    {INTRO_GROUPS.map((g) => (
                      <div
                        key={g.label}
                        className="rounded-2xl border border-border/50 bg-card/40 p-3 text-left backdrop-blur-sm"
                      >
                        <p className="px-1 pb-2 text-xs font-semibold text-muted-foreground">{g.label}</p>
                        <div className="space-y-1.5">
                          {g.items.map((s) => (
                            <button
                              key={s}
                              onClick={() => send(s)}
                              className="flex w-full items-center gap-1.5 rounded-lg border border-transparent bg-background/40 px-2.5 py-2 text-left text-[13px] transition-colors hover:border-primary/40 hover:bg-primary/5"
                            >
                              <span className="line-clamp-1">{s}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <p className="mt-6 text-[11px] text-muted-foreground/70">
                    {isPlus
                      ? 'Plus：全講座を利用可能・1 日あたりの AI 利用上限を拡大'
                      : 'Free · Plus にアップグレードすると全講座を利用でき、毎日の利用枠も増えます'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-3xl space-y-5 px-4 py-6">
                {messages.map((m) => (
                  <div key={m.id} className={cn('flex gap-3', m.role === 'user' && 'flex-row-reverse')}>
                    {m.role === 'assistant' ? (
                      <Orb live={streaming && !m.content} />
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
                          : 'border border-border/50 bg-card/50 backdrop-blur-sm'
                      )}
                    >
                      {m.role === 'assistant' ? (
                        <>
                          {m.content ? (
                            <Prose content={m.content} size="sm" />
                          ) : (
                            <span className="flex items-center gap-2 text-muted-foreground">
                              <Loader2 className="size-3.5 animate-spin" /> 考え中…
                            </span>
                          )}
                          {m.model && (
                            <p className="mt-1.5 text-[10px] text-muted-foreground/70">{m.model} が回答</p>
                          )}
                        </>
                      ) : (
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quota-reached → buy overage */}
          {quotaReached && (
            <div className="mx-auto mb-2 flex w-full max-w-3xl flex-col items-center gap-2 rounded-xl border border-primary/30 bg-primary/5 p-4 text-center sm:flex-row sm:justify-between sm:text-left">
              <p className="text-sm">
                本日の利用枠を使い切りました。{!isPlus && 'Plus にアップグレードすると枠が増えます。または'}追加の利用枠を購入できます（
                {AI_OVERAGE.priceLabel} / 100 万 token、約 320 回、無期限）。
              </p>
              <div className="flex shrink-0 gap-2">
                {!isPlus && (
                  <Button asChild size="sm" variant="outline">
                    <Link href="/ja/unlock">Plus にアップグレード</Link>
                  </Button>
                )}
                <Button size="sm" onClick={buyCredits} disabled={buying} className="gap-1.5">
                  {buying ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
                  追加の利用枠 {AI_OVERAGE.priceLabel}
                </Button>
              </div>
            </div>
          )}

          {/* Composer */}
          <div className="border-t border-border/40 bg-background/80 px-4 py-3 backdrop-blur">
            <div className="mx-auto w-full max-w-3xl">
              <div className="relative rounded-2xl border border-border/60 bg-card/75 backdrop-blur-md shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/25">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      send(input)
                    }
                  }}
                  placeholder="LVJIN AI に質問…（Enter で送信、Shift+Enter で改行）"
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
                LVJIN AI は誤ることがあります。重要な操作は公式ドキュメントと講座内容で確認してください。
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
