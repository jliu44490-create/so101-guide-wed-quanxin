'use client'

/**
 * 电子学习伴侣 — a cross-site AI pet for opted-in Plus members.
 *
 * Mounted once in the root layout. Renders only when: logged in + Plus +
 * profile.companion_enabled. Floats bottom-right with an expressive orb that:
 *   - cheers (static, no tokens) when a lesson answer is correct,
 *   - offers to explain (one AI call) when an answer is wrong,
 *   - explains doc passages on request,
 *   - opens a mini-chat on click.
 *
 * Free reactions cost nothing; only the explicit "讲讲 / explain" actions spend
 * the user's daily AI quota (same /api/ai/chat route + metering as /ai).
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ArrowUpRight, Send, Sparkles, X } from 'lucide-react'
import { Prose } from '@/components/prose'
import { Button } from '@/components/ui/button'
import { CompanionIntroDialog } from '@/components/companion-intro-dialog'
import { useAuth } from '@/lib/use-auth'
import { useEntitlement } from '@/lib/use-entitlement'
import { onCompanion, type CompanionEvent } from '@/lib/companion-bus'
import { cn } from '@/lib/utils'

/** Pages where we don't auto-pop the intro prompt (auth / purchase / the chat itself). */
const INTRO_BLOCKED = ['/ai', '/login', '/signup', '/unlock', '/settings', '/reset-password', '/forgot-password']
const INTRODUCED_KEY = 'lvjin_companion_introduced'

type Mood = 'idle' | 'happy' | 'thinking' | 'talking'
interface Turn {
  id: string
  role: 'user' | 'assistant'
  content: string
}
interface Bubble {
  text: string
  cta?: { label: string; prompt: string; display: string }
}

const CELEBRATE = [
  '漂亮！这题拿下 🎉',
  '稳！就是这个思路 ✨',
  '太棒了，继续保持 🔥',
  'Nice～手感来了 💪',
  '完美，记住这一点 🌟'
]

const uid = () => Math.random().toString(36).slice(2)
const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

export function LearningCompanion() {
  const pathname = usePathname()
  const { ready, isLoggedIn, session, profile, updateProfile } = useAuth()
  const { hasAccess } = useEntitlement()

  const isPlus = ready && isLoggedIn && hasAccess
  const enabled = isPlus && !!profile?.companion_enabled

  const [open, setOpen] = useState(false)
  const [mood, setMood] = useState<Mood>('idle')
  const [bubble, setBubble] = useState<Bubble | null>(null)
  const [turns, setTurns] = useState<Turn[]>([])
  const [busy, setBusy] = useState(false)
  const [input, setInput] = useState('')

  // One-time intro prompt for Plus members who haven't turned the feature on.
  const [introOpen, setIntroOpen] = useState(false)
  const [enabling, setEnabling] = useState(false)

  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  const flashMood = useCallback((m: Mood, ms = 4000) => {
    setMood(m)
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
    bubbleTimer.current = setTimeout(() => setMood('idle'), ms)
  }, [])

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, busy])

  const ask = useCallback(
    async (prompt: string, display: string) => {
      if (!session || busy) return
      setOpen(true)
      setBubble(null)
      const u: Turn = { id: uid(), role: 'user', content: display }
      const a: Turn = { id: uid(), role: 'assistant', content: '' }
      setTurns((t) => [...t, u, a])
      setBusy(true)
      setMood('thinking')
      try {
        const res = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            authorization: `Bearer ${session.access_token}`
          },
          body: JSON.stringify({ messages: [{ role: 'user', content: prompt }] })
        })
        if (res.status === 429) {
          setTurns((t) =>
            t.map((m) =>
              m.id === a.id ? { ...m, content: '今日 AI 配额用完啦～到完整对话页可以充值继续。' } : m
            )
          )
          return
        }
        if (!res.ok || !res.body) {
          setTurns((t) => t.map((m) => (m.id === a.id ? { ...m, content: '出了点小问题，稍后再试试。' } : m)))
          return
        }
        setMood('talking')
        const reader = res.body.getReader()
        const decoder = new TextDecoder()
        let acc = ''
        for (;;) {
          const { done, value } = await reader.read()
          if (done) break
          acc += decoder.decode(value, { stream: true })
          setTurns((t) => t.map((m) => (m.id === a.id ? { ...m, content: acc } : m)))
        }
      } catch {
        setTurns((t) => t.map((m) => (m.id === a.id ? { ...m, content: '网络好像断了，待会儿再问我。' } : m)))
      } finally {
        setBusy(false)
        flashMood('idle', 0)
      }
    },
    [session, busy, flashMood]
  )

  // Subscribe to site-wide companion events.
  useEffect(() => {
    if (!enabled) return
    return onCompanion((e: CompanionEvent) => {
      if (e.type === 'lesson-correct') {
        setBubble({ text: pick(CELEBRATE) })
        flashMood('happy', 5000)
        if (bubbleTimer.current) clearTimeout(bubbleTimer.current)
        bubbleTimer.current = setTimeout(() => {
          setMood('idle')
          setBubble(null)
        }, 5000)
      } else if (e.type === 'lesson-wrong') {
        const q = e.question?.trim()
        const prompt = q
          ? `我在 SO-101 互动课${e.chapterId ? `第 ${e.chapterId} 课` : ''}答错了一题。题目是：「${q}」。${
              e.answer ? `我选/填的是：「${e.answer}」。` : ''
            }请用最多 3 句话、亲切鼓励地讲清楚正确思路，必要时给一句关键命令。`
          : '我刚在互动课答错了一题，请用一句话鼓励我，并提示我可以怎么想。'
        setBubble({
          text: '没关系，错了才学得牢～要我讲讲吗？',
          cta: { label: '讲讲为什么', prompt, display: '帮我讲讲这题' }
        })
        setMood('idle')
      } else if (e.type === 'explain') {
        ask(
          `请用生动、通俗、简短的话讲解这段课程内容，必要时打个比方：「${e.topic}」${
            e.context ? `。补充上下文：${e.context}` : ''
          }`,
          `帮我讲讲：${e.topic}`
        )
      } else if (e.type === 'open') {
        setOpen(true)
      }
    })
  }, [enabled, ask, flashMood])

  // Auto-offer the feature once to eligible-but-undecided Plus users.
  useEffect(() => {
    if (!isPlus || !profile || profile.companion_enabled) return
    if (INTRO_BLOCKED.some((p) => pathname.startsWith(p))) return
    if (typeof window !== 'undefined' && localStorage.getItem(INTRODUCED_KEY)) return
    const t = setTimeout(() => setIntroOpen(true), 2500)
    return () => clearTimeout(t)
  }, [isPlus, profile, pathname])

  const markIntroduced = () => {
    try {
      localStorage.setItem(INTRODUCED_KEY, '1')
    } catch {
      /* private mode — fine, prompt just may reappear */
    }
  }

  const enableFromIntro = async () => {
    setEnabling(true)
    const res = await updateProfile({ companion_enabled: true })
    setEnabling(false)
    if (res.error) return
    markIntroduced()
    setIntroOpen(false)
  }

  const dismissIntro = (next: boolean) => {
    if (!next) markIntroduced()
    setIntroOpen(next)
  }

  if (!isPlus) return null

  const showOrb = enabled && pathname !== '/ai'

  const eyeBase = 'block bg-white transition-all duration-200'
  const eye =
    mood === 'happy'
      ? 'h-1 w-2.5 rounded-full'
      : mood === 'thinking'
        ? 'size-1.5 rounded-full animate-pulse'
        : 'size-2 rounded-full'

  return (
    <>
      <CompanionIntroDialog
        open={introOpen}
        onOpenChange={dismissIntro}
        onEnable={enableFromIntro}
        busy={enabling}
      />

      {showOrb && (
        <>
          <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
        {/* Expanded mini-chat panel */}
        {open && (
          <div className="pointer-events-auto flex h-[26rem] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border/60 bg-card/95 shadow-2xl shadow-primary/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-2 border-b border-border/50 px-3 py-2.5">
              <CompanionOrb mood={mood} eyeBase={eyeBase} eye={eye} size="xs" />
              <div className="flex-1 leading-tight">
                <p className="text-sm font-semibold">学习伴侣</p>
                <p className="text-[10px] text-muted-foreground">陪你一起练 SO-101</p>
              </div>
              <Link
                href="/ai"
                className="rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="打开完整对话"
              >
                <ArrowUpRight className="size-4" />
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="rounded-md p-1 text-muted-foreground transition hover:bg-secondary hover:text-foreground"
                aria-label="收起"
              >
                <X className="size-4" />
              </button>
            </div>

            <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto p-3">
              {turns.length === 0 ? (
                <p className="px-1 py-8 text-center text-xs text-muted-foreground">
                  答题时我会冒出来帮你，
                  <br />
                  也可以直接在这儿问我一句。
                </p>
              ) : (
                turns.map((m) => (
                  <div key={m.id} className={cn('flex', m.role === 'user' && 'justify-end')}>
                    <div
                      className={cn(
                        'max-w-[88%] rounded-xl px-3 py-2 text-[13px]',
                        m.role === 'user'
                          ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground'
                          : 'border border-border/50 bg-background/60'
                      )}
                    >
                      {m.role === 'assistant' ? (
                        m.content ? (
                          <Prose content={m.content} size="sm" />
                        ) : (
                          <span className="inline-flex gap-1">
                            <Dot /> <Dot d={150} /> <Dot d={300} />
                          </span>
                        )
                      ) : (
                        <span className="whitespace-pre-wrap">{m.content}</span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                const q = input.trim()
                if (!q || busy) return
                setInput('')
                ask(q, q)
              }}
              className="flex items-center gap-2 border-t border-border/50 p-2"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="问伴侣一句…"
                className="h-9 flex-1 rounded-lg border border-border/60 bg-background/60 px-3 text-[13px] outline-none focus:border-primary/50"
              />
              <Button type="submit" size="icon" disabled={busy || !input.trim()} className="size-9 rounded-lg">
                <Send className="size-4" />
              </Button>
            </form>
          </div>
        )}

        {/* Transient speech bubble (when panel closed) */}
        {!open && bubble && (
          <div className="pointer-events-auto relative max-w-[16rem] rounded-2xl rounded-br-sm border border-border/60 bg-card/95 px-3.5 py-2.5 text-[13px] shadow-xl shadow-primary/10 backdrop-blur-xl animate-in fade-in slide-in-from-bottom-1 duration-200">
            <button
              onClick={() => setBubble(null)}
              className="absolute -right-1.5 -top-1.5 rounded-full border border-border/60 bg-background p-0.5 text-muted-foreground hover:text-foreground"
              aria-label="关闭"
            >
              <X className="size-3" />
            </button>
            <p>{bubble.text}</p>
            {bubble.cta && (
              <Button
                size="sm"
                onClick={() => ask(bubble.cta!.prompt, bubble.cta!.display)}
                className="mt-2 h-7 w-full gap-1 text-xs"
              >
                <Sparkles className="size-3" /> {bubble.cta.label}
              </Button>
            )}
          </div>
        )}

        {/* The orb itself */}
        <button
          onClick={() => {
            setOpen((o) => !o)
            setBubble(null)
          }}
          aria-label="学习伴侣"
          className="pointer-events-auto"
          style={{ animation: 'companion-bob 4.5s ease-in-out infinite' }}
        >
          <CompanionOrb mood={mood} eyeBase={eyeBase} eye={eye} size="lg" attention={!!bubble && !open} />
        </button>
      </div>

          <style>{`
            @keyframes companion-bob {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-5px); }
            }
            @keyframes companion-dot {
              0%, 80%, 100% { opacity: .25; }
              40% { opacity: 1; }
            }
          `}</style>
        </>
      )}
    </>
  )
}

function Dot({ d = 0 }: { d?: number }) {
  return (
    <span
      className="inline-block size-1.5 rounded-full bg-muted-foreground"
      style={{ animation: `companion-dot 1.2s ${d}ms ease-in-out infinite` }}
    />
  )
}

function CompanionOrb({
  mood,
  eyeBase,
  eye,
  size,
  attention = false
}: {
  mood: Mood
  eyeBase: string
  eye: string
  size: 'xs' | 'lg'
  attention?: boolean
}) {
  const box = size === 'lg' ? 'size-14' : 'size-8'
  return (
    <span className={cn('relative inline-flex items-center justify-center', box)}>
      <span className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-accent opacity-60 blur-md" />
      {(attention || mood === 'happy') && (
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/40 [animation-duration:1.8s]" />
      )}
      <span className="relative flex size-full items-center justify-center gap-1 rounded-full bg-gradient-to-br from-primary via-accent to-primary shadow-lg ring-1 ring-white/25">
        <span className={cn(eyeBase, eye)} />
        <span className={cn(eyeBase, eye)} />
        {mood === 'happy' && size === 'lg' && (
          <span className="absolute bottom-3 h-1 w-3 rounded-b-full border-b-2 border-white/80" />
        )}
      </span>
    </span>
  )
}
