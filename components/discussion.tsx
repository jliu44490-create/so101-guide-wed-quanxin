'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Heart, MessageCircle, Reply, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Prose } from '@/components/prose'
import { supabase, isSupabaseConfigured, type CommentRow } from '@/lib/supabase'
import { useAuth } from '@/lib/use-auth'
import { useEntitlement } from '@/lib/use-entitlement'
import { cn } from '@/lib/utils'

interface DiscussionProps {
  /** Stable key for this thread, e.g. "chapter:1" or "error:cuda out of memory". */
  threadKey: string
  /** Optional heading shown above the thread. */
  title?: string
  className?: string
}

interface UIComment extends CommentRow {
  author_username?: string
  author_avatar_url?: string | null
}

export function Discussion({ threadKey, title = '讨论区', className }: DiscussionProps) {
  const { isLoggedIn, user } = useAuth()
  const { locked: postingLocked } = useEntitlement()
  const [comments, setComments] = useState<UIComment[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)

  const load = useCallback(async () => {
    if (!supabase) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { data, error } = await supabase
      .from('comments_with_meta')
      .select('*')
      .eq('thread_key', threadKey)
      .order('created_at', { ascending: true })

    if (error) {
      setLoading(false)
      return
    }
    const rows = (data as UIComment[]) ?? []
    setComments(rows)

    // Which of these did the current user like?
    if (user && rows.length > 0) {
      const ids = rows.map((r) => r.id)
      const { data: votes } = await supabase
        .from('comment_votes')
        .select('comment_id')
        .eq('user_id', user.id)
        .in('comment_id', ids)
      setLikedIds(new Set((votes ?? []).map((v: { comment_id: string }) => v.comment_id)))
    } else {
      setLikedIds(new Set())
    }
    setLoading(false)
  }, [threadKey, user])

  useEffect(() => {
    load()
  }, [load])

  const post = async () => {
    const text = body.trim()
    if (!text || !supabase || !user) return
    setPosting(true)
    const { error } = await supabase
      .from('comments')
      .insert({ thread_key: threadKey, author_id: user.id, body: text })
    setPosting(false)
    if (error) {
      toast.error('发送失败，请重试')
      return
    }
    setBody('')
    toast.success('已发布')
    load()
  }

  const toggleLike = async (c: UIComment) => {
    if (!supabase || !user) {
      toast.error('登录后才能点赞')
      return
    }
    const liked = likedIds.has(c.id)
    // optimistic
    setLikedIds((prev) => {
      const next = new Set(prev)
      if (liked) next.delete(c.id)
      else next.add(c.id)
      return next
    })
    setComments((prev) =>
      prev.map((x) =>
        x.id === c.id ? { ...x, like_count: (x.like_count ?? 0) + (liked ? -1 : 1) } : x
      )
    )
    if (liked) {
      await supabase.from('comment_votes').delete().eq('comment_id', c.id).eq('user_id', user.id)
    } else {
      await supabase.from('comment_votes').insert({ comment_id: c.id, user_id: user.id })
    }
  }

  const remove = async (c: UIComment) => {
    if (!supabase || !user) return
    if (!confirm('确定删除这条评论？')) return
    const { error } = await supabase.from('comments').delete().eq('id', c.id)
    if (error) {
      toast.error('删除失败')
      return
    }
    setComments((prev) => prev.filter((x) => x.id !== c.id))
    toast.success('已删除')
  }

  const count = comments.length

  // ── Backend not configured → friendly placeholder ──────────────────────
  if (!isSupabaseConfigured) {
    return (
      <section className={cn('mt-12 border-t border-border/40 pt-8', className)}>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <MessageCircle className="h-5 w-5 text-primary" />
          {title}
        </h2>
        <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
          <p className="text-sm font-medium">💬 讨论区即将开放</p>
          <p className="mt-1 text-sm text-muted-foreground">
            很快你就能在这里提问、回答、和其他学习者交流。
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('mt-12 border-t border-border/40 pt-8', className)}>
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <MessageCircle className="h-5 w-5 text-primary" />
        {title}
        {count > 0 && (
          <span className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        )}
      </h2>

      {/* Composer */}
      <div className="mt-5">
        {!isLoggedIn ? (
          <div className="rounded-xl border border-border/60 bg-card/40 p-5 text-center">
            <p className="text-sm text-muted-foreground">
              登录后即可参与讨论 —— 点击右上角的 <strong className="text-foreground">登录</strong> 按钮
            </p>
          </div>
        ) : postingLocked ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
            <p className="text-sm">
              发帖、提问、回答是<strong className="text-foreground">解锁后</strong>的权限
            </p>
            <Button asChild size="sm" className="glow-primary mt-3">
              <Link href="/unlock">解锁全部内容</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="提个问题，或分享你的经验… 支持 **Markdown**"
              className="min-h-24 resize-y"
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">友善交流 · 不灌水 · 不发广告</p>
              <Button onClick={post} disabled={!body.trim() || posting} size="sm" className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                {posting ? '发布中' : '发布'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">加载中…</p>
        ) : count === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            还没有人发言，来做第一个 🙋
          </p>
        ) : (
          comments.map((c) => {
            const liked = likedIds.has(c.id)
            const isMine = user?.id === c.author_id
            const name = c.author_username ?? '匿名'
            return (
              <div key={c.id} className="flex gap-3">
                <Link href={`/u/${name}`} className="shrink-0">
                  <Avatar className="mt-0.5 h-8 w-8">
                    {c.author_avatar_url && <AvatarImage src={c.author_avatar_url} alt={name} />}
                    <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xs">
                      {name.slice(0, 1).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/u/${name}`}
                      className="text-sm font-semibold hover:text-primary hover:underline"
                    >
                      {name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.created_at), {
                        addSuffix: true,
                        locale: zhCN
                      })}
                    </span>
                  </div>
                  <div className="mt-1 text-sm leading-relaxed">
                    <Prose content={c.body} size="sm" />
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleLike(c)}
                      className={cn(
                        'inline-flex items-center gap-1 text-xs transition-colors',
                        liked ? 'text-rose-500' : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Heart className={cn('h-3.5 w-3.5', liked && 'fill-rose-500')} />
                      {c.like_count ? c.like_count : '赞'}
                    </button>
                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={() => {
                          setBody((b) => (b ? b : `@${name} `))
                          document
                            .querySelector('textarea')
                            ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                        }}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <Reply className="h-3.5 w-3.5" />
                        回复
                      </button>
                    )}
                    {isMine && (
                      <button
                        type="button"
                        onClick={() => remove(c)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        删除
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>
    </section>
  )
}
