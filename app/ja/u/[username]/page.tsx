import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { formatDistanceToNow, format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ArrowLeft, Calendar, Heart, MessageCircle, Users } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Prose } from '@/components/prose'
import {
  getUserByUsername,
  getUserCommentsByUserId,
  describeThread,
  isSupabaseConfigured
} from '@/lib/community'
import { chaptersJa } from '@/lib/course-data-ja'

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata(
  { params }: ProfilePageProps
): Promise<Metadata> {
  const { username } = await params
  return {
    title: `${username} のプロフィール`,
    description: `SO101 コミュニティでの ${username} の貢献。`
  }
}

const titleLookup = (id: number) => chaptersJa.find((c) => c.id === id)?.title
const threadOpts = {
  base: '/ja',
  chapterLabel: (id: number, title?: string) =>
    title ? `第 ${id} 章 · ${title}` : `第 ${id} 章`,
  errorLabel: (err: string) => `エラー: ${err}`
}

export const revalidate = 60

export default async function ProfilePageJa({ params }: ProfilePageProps) {
  const { username } = await params

  if (!isSupabaseConfigured) {
    return <PlaceholderProfile username={username} />
  }

  const user = await getUserByUsername(username)
  if (!user) notFound()

  const comments = await getUserCommentsByUserId(user.id, 50)

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <nav
          aria-label="戻る"
          className="mb-6 flex items-center gap-1 text-sm text-muted-foreground"
        >
          <Link href="/ja/community" className="inline-flex items-center gap-1 hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            コミュニティ
          </Link>
        </nav>

        {/* Profile header */}
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <Avatar className="h-20 w-20 ring-2 ring-primary/20">
              {user.avatar_url && <AvatarImage src={user.avatar_url} alt={user.username} />}
              <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-2xl">
                {user.username.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold sm:text-3xl">{user.username}</h1>
              {user.bio && (
                <p className="mt-1 text-sm text-muted-foreground">{user.bio}</p>
              )}
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className="gap-1 border-border/60">
                  <Calendar className="h-3 w-3" />
                  参加：{format(new Date(user.created_at), 'yyyy年M月')}
                </Badge>
                {user.comment_count > 0 && (
                  <Badge variant="outline" className="gap-1 border-primary/30 bg-primary/10 text-primary">
                    <MessageCircle className="h-3 w-3" />
                    コメント {user.comment_count} 件
                  </Badge>
                )}
                {user.likes_received > 0 && (
                  <Badge variant="outline" className="gap-1 border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
                    <Heart className="h-3 w-3" />
                    いいね {user.likes_received}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contribution list */}
        <div className="mt-8">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <MessageCircle className="h-4 w-4 text-primary" />
            最近の投稿
            <span className="text-sm font-normal text-muted-foreground">
              · {comments.length} 件
            </span>
          </h2>

          {comments.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-border/60 bg-card/30 p-10 text-center text-sm text-muted-foreground">
              {user.username} はまだ投稿していません
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              {comments.map((c) => {
                const thread = describeThread(c.thread_key, titleLookup, threadOpts)
                const truncated = c.body.length > 280 ? c.body.slice(0, 280) + '…' : c.body
                return (
                  <Link
                    key={c.id}
                    href={thread.href}
                    className="block rounded-xl border border-border/60 bg-card/40 p-4 transition-colors hover:border-primary/30 hover:bg-card/80"
                  >
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="rounded-full bg-secondary px-2 py-0.5 font-medium text-foreground/80">
                        {thread.label}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground">
                        {c.like_count > 0 && (
                          <span className="inline-flex items-center gap-0.5 text-rose-500">
                            <Heart className="h-3 w-3 fill-current" />
                            {c.like_count}
                          </span>
                        )}
                        {formatDistanceToNow(new Date(c.created_at), {
                          addSuffix: true,
                          locale: ja
                        })}
                      </span>
                    </div>
                    <div className="mt-2 text-sm leading-relaxed">
                      <Prose content={truncated} size="sm" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function PlaceholderProfile({ username }: { username: string }) {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
        <Users className="h-10 w-10 text-muted-foreground" />
        <h1 className="mt-4 text-xl font-semibold">@{username}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          コミュニティ機能のバックエンドが未設定のため、プロフィールを表示できません。
        </p>
        <Button asChild size="sm" variant="outline" className="mt-5">
          <Link href="/ja/community">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            コミュニティへ戻る
          </Link>
        </Button>
      </main>
      <Footer />
    </div>
  )
}
