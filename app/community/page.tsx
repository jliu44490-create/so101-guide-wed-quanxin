import type { Metadata } from 'next'
import Link from 'next/link'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { ArrowRight, MessageCircle, Sparkles, TrendingUp, Users } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AuroraBackground, FloatingOrbs, Reveal, ShimmerText } from '@/components/effects'
import { Prose } from '@/components/prose'
import {
  getRecentComments,
  getTopContributors,
  describeThread,
  isSupabaseConfigured
} from '@/lib/community'
import { chapters } from '@/lib/course-data'

export const metadata: Metadata = {
  title: '社区',
  description: 'SO101 模仿学习的中文社区 — 最新讨论、活跃贡献者、答疑现场。',
  alternates: {
    canonical: '/community'
  }
}

// Pre-build a chapter-id → title lookup that can be passed to describeThread
const chapterTitleByIdEntries = chapters.map((c) => [c.id, c.title] as const)
const chapterTitleById = new Map<number, string>(chapterTitleByIdEntries)
const titleLookup = (id: number) => chapterTitleById.get(id)

const starterTopics = [
  {
    title: '我该怎么确认 Leader / Follower 端口？',
    body: '适合贴出 `ls /dev/tty*` 的结果和你的接线方式，让别人帮你快速判断端口。',
    href: '/learn/4'
  },
  {
    title: '数据采集 50 条够不够？',
    body: '适合讨论任务难度、物体摆放变化、失败样本是否保留这些采集策略。',
    href: '/learn/5'
  },
  {
    title: '训练 loss 变 NaN 或 OOM',
    body: '适合贴出 GPU、batch_size、命令和前几百步 loss，方便定位训练配置。',
    href: '/diagnose?q=CUDA%20out%20of%20memory'
  }
]

export const revalidate = 60 // ISR — refresh community page every minute

export default async function CommunityPage() {
  // Both queries run in parallel. They degrade to [] if Supabase is unconfigured.
  const [recent, contributors] = await Promise.all([
    getRecentComments(20),
    getTopContributors(10)
  ])

  const isLive = isSupabaseConfigured && recent.length > 0

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        {/* HERO */}
        <section className="relative overflow-hidden border-b border-border/40">
          <AuroraBackground intensity="subtle" />
          <FloatingOrbs count={3} />
          <div className="relative mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                社区
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                <ShimmerText>SO101 中文社区</ShimmerText>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-3 max-w-2xl text-muted-foreground sm:text-lg">
                这里是中文区做 LeRobot + SO101 + 具身智能入门的人聚集的地方。
                提问、答疑、晒成果、分享经验 —— 不再去英文 Discord 受罪。
              </p>
            </Reveal>
            {!isSupabaseConfigured && (
              <Reveal delay={300}>
                <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-yellow-500/40 bg-yellow-500/10 px-4 py-1.5 text-xs text-yellow-700 dark:text-yellow-300">
                  <Sparkles className="h-3 w-3" />
                  社区互动即将开放
                </div>
              </Reveal>
            )}
          </div>
        </section>

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

function ComingSoon() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Card className="border-dashed border-border/60">
        <CardContent className="space-y-4 py-10 text-center">
          <p className="text-2xl">💬</p>
          <h2 className="text-xl font-semibold">即将开放</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            评论、点赞等社区互动正在搭建中，很快和你见面。<br />
            可以先从下面的热门话题，去对应章节看看。
          </p>
        </CardContent>
      </Card>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: MessageCircle, title: '每章 / 每个报错', body: '都有独立讨论区' },
          { icon: TrendingUp, title: '热门讨论流', body: '一眼看出大家在卡哪儿' },
          { icon: Users, title: '贡献者主页', body: '帮助别人多的人会被看见' }
        ].map((f, i) => (
          <div
            key={i}
            className="rounded-xl border border-border/60 bg-card/40 p-5 text-center"
          >
            <f.icon className="mx-auto h-6 w-6 text-primary" />
            <p className="mt-2 text-sm font-semibold">{f.title}</p>
            <p className="mt-1 text-xs text-muted-foreground">{f.body}</p>
          </div>
        ))}
      </div>

      <StarterTopics />
    </section>
  )
}

function SeedState() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <Card className="border-dashed border-primary/30 bg-primary/5">
        <CardContent className="space-y-4 py-10 text-center">
          <p className="text-2xl">🌱</p>
          <h2 className="text-xl font-semibold">这里还没有讨论</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            社区刚开张，目前还没人发言。<br />
            <strong className="text-foreground">第一条评论会有特别荣誉</strong> —— 现在去任意章节底部发一条试试。
          </p>
          <Button asChild size="lg" className="glow-primary">
            <Link href="/learn/1">
              去第 1 课的讨论区
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>

      <StarterTopics />
    </section>
  )
}

function StarterTopics() {
  return (
    <div className="mt-10">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        可以先从这些话题开始
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {starterTopics.map((topic) => (
          <Link
            key={topic.title}
            href={topic.href}
            className="group rounded-xl border border-border/60 bg-card/40 p-4 text-left transition-colors hover:border-primary/30 hover:bg-card/70"
          >
            <p className="text-sm font-semibold">{topic.title}</p>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {topic.body}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-primary">
              去相关章节
              <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
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
        {/* ── Activity feed ─────────────────────────────────────────── */}
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <MessageCircle className="h-5 w-5 text-primary" />
            最近讨论
            <Badge variant="outline" className="ml-1 border-border/60 font-mono text-[10px]">
              {recent.length}
            </Badge>
          </h2>
          <div className="mt-5 space-y-4">
            {recent.map((c) => {
              const thread = describeThread(c.thread_key, titleLookup)
              const truncated = c.body.length > 200 ? c.body.slice(0, 200) + '…' : c.body
              return (
                <div
                  key={c.id}
                  className="group rounded-xl border border-border/60 bg-card/40 p-4 transition-colors hover:border-primary/30 hover:bg-card/60"
                >
                  <div className="flex items-start gap-3">
                    <Link href={`/u/${c.author_username}`} className="shrink-0">
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
                          href={`/u/${c.author_username}`}
                          className="font-semibold text-foreground hover:underline"
                        >
                          {c.author_username}
                        </Link>
                        <span className="text-muted-foreground">在</span>
                        <Link
                          href={thread.href}
                          className="rounded-full bg-secondary px-2 py-0.5 font-medium text-foreground/80 hover:bg-primary/20 hover:text-primary"
                        >
                          {thread.label}
                        </Link>
                        <span className="text-muted-foreground">
                          ·{' '}
                          {formatDistanceToNow(new Date(c.created_at), {
                            addSuffix: true,
                            locale: zhCN
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

        {/* ── Top contributors ──────────────────────────────────────── */}
        <aside>
          <h2 className="flex items-center gap-2 text-xl font-bold">
            <TrendingUp className="h-5 w-5 text-accent" />
            活跃贡献者
          </h2>
          <div className="mt-5 space-y-2">
            {contributors.map((u, i) => (
              <Link
                key={u.id}
                href={`/u/${u.username}`}
                className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3 transition-colors hover:border-primary/30 hover:bg-card/80"
              >
                <span className="w-4 text-center font-mono text-xs text-muted-foreground">
                  {i + 1}
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
                    {u.comment_count} 评论 · {u.likes_received} 赞
                  </p>
                </div>
              </Link>
            ))}
            {contributors.length === 0 && (
              <p className="rounded-xl border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                还没有贡献者上榜
              </p>
            )}
          </div>

          <div className="mt-8 rounded-xl border border-primary/30 bg-primary/5 p-5 text-center">
            <p className="text-sm font-semibold">想上榜？</p>
            <p className="mt-1 text-xs text-muted-foreground">
              去任意章节底部回答别人的问题，每收到一个赞都会让你更接近榜首。
            </p>
            <Button asChild size="sm" variant="outline" className="mt-3">
              <Link href="/learn">
                看学习路径
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          </div>
        </aside>
      </div>
    </section>
  )
}
