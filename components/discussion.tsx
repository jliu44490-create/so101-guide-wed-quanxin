'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { formatDistanceToNow } from 'date-fns'
import { zhCN, ja } from 'date-fns/locale'
import { Heart, MessageCircle, Reply, Send, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Prose } from '@/components/prose'
import { communityBackend, type UIComment } from '@/lib/backend'
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

export function Discussion({ threadKey, title, className }: DiscussionProps) {
  const { isLoggedIn, user } = useAuth()
  const { locked: postingLocked } = useEntitlement()
  const isJa = usePathname()?.startsWith('/ja') ?? false
  const [comments, setComments] = useState<UIComment[]>([])
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)

  const t = isJa
    ? {
        heading: 'ディスカッション',
        sendFail: '送信に失敗しました。もう一度お試しください',
        posted: '投稿しました',
        likeNeedsLogin: 'いいねするにはログインが必要です',
        confirmDelete: 'このコメントを削除しますか？',
        deleteFail: '削除に失敗しました',
        deleted: '削除しました',
        comingSoon: '💬 ディスカッションは近日公開',
        comingSoonSub: 'まもなくここで質問・回答・他の学習者との交流ができます。',
        loginPromptPre: 'ログインすると参加できます —— 右上の ',
        loginWord: 'ログイン',
        loginPromptPost: ' ボタンから',
        lockedPre: '投稿・質問・回答は',
        lockedWord: 'アンロック後',
        lockedPost: 'の権限です',
        unlockAll: 'すべてアンロック',
        placeholder: '質問したり、経験を共有しよう… **Markdown** 対応',
        rules: '友好的に · 連投なし · 広告なし',
        posting: '投稿中',
        post: '投稿',
        loading: '読み込み中…',
        empty: 'まだ投稿がありません。最初の一人になろう 🙋',
        anon: '匿名',
        like: 'いいね',
        reply: '返信',
        del: '削除'
      }
    : {
        heading: '讨论区',
        sendFail: '发送失败，请重试',
        posted: '已发布',
        likeNeedsLogin: '登录后才能点赞',
        confirmDelete: '确定删除这条评论？',
        deleteFail: '删除失败',
        deleted: '已删除',
        comingSoon: '💬 讨论区即将开放',
        comingSoonSub: '很快你就能在这里提问、回答、和其他学习者交流。',
        loginPromptPre: '登录后即可参与讨论 —— 点击右上角的 ',
        loginWord: '登录',
        loginPromptPost: ' 按钮',
        lockedPre: '发帖、提问、回答是',
        lockedWord: '解锁后',
        lockedPost: '的权限',
        unlockAll: '解锁全部内容',
        placeholder: '提个问题，或分享你的经验… 支持 **Markdown**',
        rules: '友善交流 · 不灌水 · 不发广告',
        posting: '发布中',
        post: '发布',
        loading: '加载中…',
        empty: '还没有人发言，来做第一个 🙋',
        anon: '匿名',
        like: '赞',
        reply: '回复',
        del: '删除'
      }

  const heading = title ?? t.heading
  const dateLocale = isJa ? ja : zhCN
  const unlockHref = isJa ? '/ja/unlock' : '/unlock'
  const userHref = (name: string) => (isJa ? `/ja/u/${name}` : `/u/${name}`)

  const load = useCallback(async () => {
    if (!communityBackend.isConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    const { comments: rows, likedIds: liked } = await communityBackend.listThread(
      threadKey,
      user?.id
    )
    setComments(rows)
    setLikedIds(new Set(liked))
    setLoading(false)
  }, [threadKey, user])

  useEffect(() => {
    load()
  }, [load])

  const post = async () => {
    const text = body.trim()
    if (!text || !user) return
    setPosting(true)
    const { error } = await communityBackend.postComment(threadKey, user.id, text)
    setPosting(false)
    if (error) {
      toast.error(t.sendFail)
      return
    }
    setBody('')
    toast.success(t.posted)
    load()
  }

  const toggleLike = async (c: UIComment) => {
    if (!user) {
      toast.error(t.likeNeedsLogin)
      return
    }
    const liked = likedIds.has(c.id)
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
    await communityBackend.setLike(c.id, user.id, !liked)
  }

  const remove = async (c: UIComment) => {
    if (!user) return
    if (!confirm(t.confirmDelete)) return
    const { error } = await communityBackend.deleteComment(c.id)
    if (error) {
      toast.error(t.deleteFail)
      return
    }
    setComments((prev) => prev.filter((x) => x.id !== c.id))
    toast.success(t.deleted)
  }

  const count = comments.length

  // ── Backend not configured → friendly placeholder ──────────────────────
  if (!communityBackend.isConfigured) {
    return (
      <section className={cn('mt-12 border-t border-border/40 pt-8', className)}>
        <h2 className="flex items-center gap-2 text-xl font-bold">
          <MessageCircle className="h-5 w-5 text-primary" />
          {heading}
        </h2>
        <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-card/30 p-8 text-center">
          <p className="text-sm font-medium">{t.comingSoon}</p>
          <p className="mt-1 text-sm text-muted-foreground">{t.comingSoonSub}</p>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('mt-12 border-t border-border/40 pt-8', className)}>
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <MessageCircle className="h-5 w-5 text-primary" />
        {heading}
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
              {t.loginPromptPre}
              <strong className="text-foreground">{t.loginWord}</strong>
              {t.loginPromptPost}
            </p>
          </div>
        ) : postingLocked ? (
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
            <p className="text-sm">
              {t.lockedPre}
              <strong className="text-foreground">{t.lockedWord}</strong>
              {t.lockedPost}
            </p>
            <Button asChild size="sm" className="glow-primary mt-3">
              <Link href={unlockHref}>{t.unlockAll}</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={t.placeholder}
              className="min-h-24 resize-y"
            />
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-muted-foreground">{t.rules}</p>
              <Button onClick={post} disabled={!body.trim() || posting} size="sm" className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                {posting ? t.posting : t.post}
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-6 space-y-4">
        {loading ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t.loading}</p>
        ) : count === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">{t.empty}</p>
        ) : (
          comments.map((c) => {
            const liked = likedIds.has(c.id)
            const isMine = user?.id === c.author_id
            const name = c.author_username ?? t.anon
            return (
              <div key={c.id} className="flex gap-3">
                <Link href={userHref(name)} className="shrink-0">
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
                      href={userHref(name)}
                      className="text-sm font-semibold hover:text-primary hover:underline"
                    >
                      {name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(c.created_at), {
                        addSuffix: true,
                        locale: dateLocale
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
                      {c.like_count ? c.like_count : t.like}
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
                        {t.reply}
                      </button>
                    )}
                    {isMine && (
                      <button
                        type="button"
                        onClick={() => remove(c)}
                        className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-rose-500"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        {t.del}
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
