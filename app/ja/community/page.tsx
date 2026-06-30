import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import { ArrowRight, MessageCircle, Sparkles, TrendingUp, Users } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Reveal, ShimmerText, SpotlightCard } from '@/components/effects'
import { HeroAura } from '@/components/hero-aura'
import { Prose } from '@/components/prose'
import {
  getRecentComments,
  getTopContributors,
  describeThread,
  isSupabaseConfigured
} from '@/lib/community'
import { chaptersJa } from '@/lib/course-data-ja'

export const metadata: Metadata = {
  title: 'コミュニティ',
  description: 'SO101 模倣学習の日本語コミュニティ —— 最新のディスカッション、活躍する貢献者、Q&A の現場。',
  alternates: {
    canonical: '/ja/community',
    languages: { 'zh-CN': '/community', 'ja-JP': '/ja/community' }
  },
  openGraph: { title: 'コミュニティ | LVJIN', type: 'website', locale: 'ja_JP', url: '/ja/community' }
}

const chapterTitleByIdEntries = chaptersJa.map((c) => [c.id, c.title] as const)
const chapterTitleById = new Map<number, string>(chapterTitleByIdEntries)
const titleLookup = (id: number) => chapterTitleById.get(id)

// JA labels + /ja prefix for thread links.
const threadOpts = {
  base: '/ja',
  chapterLabel: (id: number, title?: string) =>
    title ? `第 ${id} 章 · ${title}` : `第 ${id} 章`,
  errorLabel: (err: string) => `エラー: ${err}`
}

const starterTopics = [
  {
    title: 'Leader / Follower のポートはどう確認する？',
    body: '`ls /dev/tty*` の結果と配線を貼ると、ポート判定を手伝ってもらえます。',
    href: '/ja/learn/4'
  },
  {
    title: 'データ収集は 50 件で足りる？',
    body: 'タスクの難易度、物体配置の変化、失敗サンプルを残すかなど、収集戦略の議論に向きます。',
    href: '/ja/learn/5'
  },
  {
    title: '学習 loss が NaN / OOM になる',
    body: 'GPU、batch_size、コマンド、最初の数百ステップの loss を貼ると、学習設定の特定が進みます。',
    href: '/ja/diagnose?q=CUDA%20out%20of%20memory'
  }
]

export const revalidate = 60 // ISR

export default async function CommunityPageJa() {
  const [recent, contributors] = await Promise.all([
    getRecentComments(20),
    getTopContributors(10)
  ])

  const isLive = isSupabaseConfigured && recent.length > 0

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="relative overflow-hidden">
          <HeroAura />
          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                コミュニティ
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                <ShimmerText>SO101 日本語コミュニティ</ShimmerText>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-3 max-w-2xl text-muted-foreground sm:text-lg">
                LeRobot + SO101 + 身体性 AI（Embodied AI）を学ぶ人が集まる場所。
                質問・回答・成果の共有・経験の共有 —— もう英語の Discord で苦労しなくていい。
              </p>
            </Reveal>
            {!isSupabaseConfigured && (
              <Reveal delay={300}>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-1.5 text-xs text-yellow-700 dark:text-yellow-300">
                  <Sparkles className="h-3 w-3" />
                  コミュニティ機能は近日公開
                </div>
              </Reveal>
            )}
          </div>
        </section>

        <ParticipateCTA />

        {!isSupabaseConfigured ? (
          <ComingSoon />
        ) : !isLive ? (
          <SeedState />
        ) : (
          <LiveContent recent={recent} contributors={contributors} />
        )}
      </main>

      <Footer />
    </div>
  )
}

/* ────────────────────────────────────────────────────────────────────── */

function ParticipateCTA() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-primary/25 bg-card/70 p-6 backdrop-blur-md sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <h2 className="flex items-center gap-2 text-lg font-bold sm:text-xl">
              <MessageCircle className="h-5 w-5 text-primary" />
              質問・投稿はこちらから
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              ディスカッションは<strong className="text-foreground">各章</strong>と
              <strong className="text-foreground">各エラー</strong>のディスカッション欄で行います。
              ログインして章を選び、ページ下部から質問・成果の共有・回答ができます —— もらった「いいね」で貢献者ランキングに載れます。
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2.5">
            <Button asChild className="glow-primary">
              <Link href="/ja/learn">
                章を見て質問する
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/ja/diagnose">エラー相談</Link>
            </Button>
          </div>
        </div>

        <div className="mt-5 border-t border-border/50 pt-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            章を直接選んで投稿
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {chaptersJa.map((c) => (
              <Link
                key={c.id}
                href={`/ja/learn/${c.id}`}
                className="group inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/50 px-3 py-1.5 text-xs text-foreground/80 transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
              >
                <span className="font-mono text-[10px] text-muted-foreground group-hover:text-primary">
                  {String(c.id).padStart(2, '0')}
                </span>
                {c.title}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ComingSoon() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Card className="border-dashed border-border/60">
        <CardContent className="space-y-4 py-10 text-center">
          <p className="text-2xl">💬</p>
          <h2 className="text-xl font-semibold">近日公開</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            コメント・いいねなどのコミュニティ機能は準備中です。まもなく公開します。<br />
            それまでは下の人気トピックから、対応する章をのぞいてみてください。
          </p>
        </CardContent>
      </Card>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: MessageCircle, title: '各章 / 各エラー', body: 'それぞれにディスカッション欄' },
          { icon: TrendingUp, title: '人気ディスカッション', body: 'みんなが詰まる所が一目で分かる' },
          { icon: Users, title: '貢献者プロフィール', body: '人を助けた人が見える' }
        ].map((f, i) => (
          <Reveal key={i} delay={i * 80}>
            <SpotlightCard className="group block h-full rounded-xl">
              <div className="h-full rounded-xl border border-border/60 bg-card/70 backdrop-blur-md p-5 text-center transition-all duration-300 hover:-translate-y-1 hover:border-primary/40">
                <f.icon className="mx-auto h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                <p className="mt-2 text-sm font-semibold">{f.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
              </div>
            </SpotlightCard>
          </Reveal>
        ))}
      </div>

      <StarterTopics />
    </section>
  )
}

function SeedState() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Reveal direction="scale">
        <Card className="border-dashed border-primary/30 bg-primary/5">
          <CardContent className="space-y-4 py-10 text-center">
            <p className="animate-bounce text-3xl">🌱</p>
            <h2 className="text-xl font-semibold">まだディスカッションがありません</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              コミュニティは始まったばかりで、まだ誰も発言していません。<br />
              <strong className="text-foreground">最初のコメントには特別な名誉</strong> —— どれかの章の下部で 1 件投稿してみましょう。
            </p>
            <Button asChild size="lg" className="glow-primary">
              <Link href="/ja/learn/1">
                第 1 章のディスカッション欄へ
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </Reveal>

      <StarterTopics />
    </section>
  )
}

function StarterTopics() {
  return (
    <div className="mt-10">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        まずはこんなトピックから
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {starterTopics.map((topic, i) => (
          <Reveal key={topic.title} delay={i * 80} className="h-full">
            <Link
              href={topic.href}
              className="group flex h-full flex-col rounded-xl border border-border/60 bg-card/70 backdrop-blur-md p-4 text-left transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:bg-card/70 hover:shadow-lg hover:shadow-primary/5"
            >
              <p className="text-sm font-semibold">{topic.title}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                {topic.body}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
                関連する章へ
                <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  )
}

interface LiveProps {
  recent: Awaited<ReturnType<typeof getRecentComments>>
  contributors: Awaited<ReturnType<typeof getTopContributors>>
}

function LiveContent({ recent, contributors }: LiveProps) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-[1.7fr_1fr]">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <MessageCircle className="h-5 w-5 text-primary" />
            最近のディスカッション
            <Badge variant="outline" className="ml-1 border-border/60 font-mono text-[10px]">
              {recent.length}
            </Badge>
          </h2>
          <div className="mt-5 space-y-4">
            {recent.map((c) => {
              const thread = describeThread(c.thread_key, titleLookup, threadOpts)
              const truncated = c.body.length > 200 ? c.body.slice(0, 200) + '…' : c.body
              return (
                <div
                  key={c.id}
                  className="group rounded-xl border border-border/60 bg-card/70 backdrop-blur-md p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card/60 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="flex items-start gap-3">
                    <Link href={`/ja/u/${c.author_username}`} className="shrink-0">
                      <Avatar className="h-8 w-8">
                        {c.author_avatar_url && (
                          <AvatarImage src={c.author_avatar_url} alt={c.author_username} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xs">
                          {c.author_username.slice(0, 1).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs">
                        <Link
                          href={`/ja/u/${c.author_username}`}
                          className="font-semibold text-foreground hover:underline"
                        >
                          {c.author_username}
                        </Link>
                        <span className="text-muted-foreground">が</span>
                        <Link
                          href={thread.href}
                          className="rounded-full bg-secondary px-2 py-0.5 font-medium text-foreground/80 hover:bg-primary/20 hover:text-primary"
                        >
                          {thread.label}
                        </Link>
                        <span className="text-muted-foreground">
                          で ·{' '}
                          {formatDistanceToNow(new Date(c.created_at), {
                            addSuffix: true,
                            locale: ja
                          })}
                        </span>
                      </div>
                      <Link href={thread.href} className="mt-2 block text-sm leading-relaxed">
                        <Prose content={truncated} size="sm" />
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <aside>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="h-5 w-5 text-accent" />
            活躍する貢献者
          </h2>
          <div className="mt-5 space-y-2">
            {contributors.map((u, i) => (
              <Link
                key={u.id}
                href={`/ja/u/${u.username}`}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/70 backdrop-blur-md p-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:bg-card/80"
              >
                <span className="w-5 shrink-0 text-center text-sm">
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (
                    <span className="font-mono text-xs text-muted-foreground">{i + 1}</span>
                  )}
                </span>
                <Avatar className="h-8 w-8 shrink-0">
                  {u.avatar_url && <AvatarImage src={u.avatar_url} alt={u.username} />}
                  <AvatarFallback className="bg-gradient-to-br from-primary/30 to-accent/30 text-xs">
                    {u.username.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{u.username}</p>
                  <p className="text-[11px] text-muted-foreground">
                    コメント {u.comment_count} · いいね {u.likes_received}
                  </p>
                </div>
              </Link>
            ))}
            {contributors.length === 0 && (
              <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                まだ貢献者がいません
              </p>
            )}
          </div>

          <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
            <p className="text-sm font-semibold">ランクインしたい？</p>
            <p className="mt-1 text-xs text-muted-foreground">
              どれかの章の下部で人の質問に答えましょう。もらった「いいね」のたびに首位へ近づきます。
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href="/ja/learn">
                学習パスを見る
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </section>
  )
}
