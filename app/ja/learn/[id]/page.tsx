import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Lightbulb,
  ListChecks,
  Target,
  Terminal,
  Trophy
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CodeBlock } from '@/components/code-block'
import { ChapterToc } from '@/components/chapter-toc'
import { ReadingProgress } from '@/components/reading-progress'
import { ChapterProgressActions } from '@/components/chapter-progress-actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { chaptersJa } from '@/lib/course-data-ja'
import { siteConfigJa } from '@/lib/site-config-ja'

interface ChapterPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: ChapterPageProps
): Promise<Metadata> {
  const { id } = await params
  const chapter = chaptersJa.find((c) => c.id === parseInt(id))
  if (!chapter) return { title: '章が見つかりません' }
  return {
    title: `第 ${chapter.id} 章 · ${chapter.title}`,
    description: chapter.description,
    openGraph: {
      title: `${chapter.title} | ${siteConfigJa.shortName}`,
      description: chapter.description,
      type: 'article',
      locale: 'ja_JP'
    },
    alternates: {
      canonical: `/ja/learn/${chapter.id}`,
      languages: {
        'zh-CN': `/learn/${chapter.id}`,
        'ja-JP': `/ja/learn/${chapter.id}`
      }
    }
  }
}

export function generateStaticParams() {
  return chaptersJa.map((chapter) => ({ id: chapter.id.toString() }))
}

export default async function ChapterPageJa({ params }: ChapterPageProps) {
  const { id } = await params
  const chapterId = parseInt(id)
  const chapter = chaptersJa.find((c) => c.id === chapterId)

  if (!chapter) {
    notFound()
  }

  const prevChapter = chaptersJa.find((c) => c.id === chapterId - 1)
  const nextChapter = chaptersJa.find((c) => c.id === chapterId + 1)

  const sections: { id: string; label: string; available: boolean }[] = [
    { id: 'overview', label: '概要', available: true },
    { id: 'objectives', label: '学習目標', available: chapter.objectives.length > 0 },
    { id: 'principles', label: '原理解説', available: chapter.principles.length > 0 },
    { id: 'steps', label: '手順', available: chapter.steps.length > 0 },
    { id: 'commands', label: 'コマンド', available: chapter.commands.length > 0 },
    { id: 'checkpoints', label: 'チェックポイント', available: chapter.checkpoints.length > 0 },
    { id: 'errors', label: 'よくあるエラー', available: chapter.errors.length > 0 }
  ].filter((s) => s.available)

  return (
    <div className="min-h-screen">
      <ReadingProgress />
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <nav
          aria-label="パンくず"
          className="mb-6 flex flex-wrap items-center gap-1 text-sm text-muted-foreground"
        >
          <Link href="/ja" className="hover:text-foreground">
            ホーム
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href="/ja/learn" className="hover:text-foreground">
            学習パス
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">第 {chapter.id} 章</span>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_240px]">
          <article className="min-w-0">
            <header id="overview" className="mb-8 scroll-mt-24">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  Chapter {chapter.id}
                </Badge>
                <Badge variant="outline" className="border-border/60">
                  <Clock className="mr-1 h-3 w-3" />
                  {chapter.duration}
                </Badge>
              </div>
              <h1 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
                {chapter.title}
              </h1>
              <p className="mt-2 font-mono text-sm uppercase tracking-wider text-muted-foreground">
                {chapter.titleEn}
              </p>
              <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
                {chapter.description}
              </p>

              <div className="mt-6">
                <ChapterProgressActions
                  chapterId={chapter.id}
                  baseStatus={chapter.status}
                  baseProgress={chapter.progress}
                />
              </div>
            </header>

            <div className="space-y-6">
              {chapter.objectives.length > 0 && (
                <Card id="objectives" className="scroll-mt-24 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-primary" />
                      学習目標
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2.5">
                      {chapter.objectives.map((obj, index) => (
                        <li key={index} className="flex items-start gap-2.5">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                          <span className="text-sm leading-relaxed">{obj}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {chapter.principles.length > 0 && (
                <Card id="principles" className="scroll-mt-24 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      原理解説
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {chapter.principles.map((principle, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-500/15 text-xs font-medium text-yellow-600 ring-1 ring-yellow-500/30 dark:text-yellow-300">
                            {index + 1}
                          </span>
                          <span className="text-sm leading-relaxed">{principle}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {chapter.steps.length > 0 && (
                <Card id="steps" className="scroll-mt-24 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <ListChecks className="h-5 w-5 text-primary" />
                      手順
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {chapter.steps.map((step, index) => (
                        <div key={index} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white shadow-md shadow-primary/20">
                              {index + 1}
                            </div>
                            {index < chapter.steps.length - 1 && (
                              <div className="my-1 h-full w-px bg-gradient-to-b from-primary/50 to-transparent" />
                            )}
                          </div>
                          <div className="flex-1 pb-5">
                            <h4 className="font-semibold">{step.title}</h4>
                            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                              {step.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {chapter.commands.length > 0 && (
                <Card id="commands" className="scroll-mt-24 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Terminal className="h-5 w-5 text-[var(--color-success)]" />
                      コマンド
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {chapter.commands.map((cmd, index) => (
                      <CodeBlock
                        key={index}
                        code={cmd.code}
                        description={cmd.description}
                        language="bash"
                      />
                    ))}
                  </CardContent>
                </Card>
              )}

              {chapter.checkpoints.length > 0 && (
                <Card id="checkpoints" className="scroll-mt-24 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
                      チェックポイント
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {chapter.checkpoints.map((checkpoint, index) => (
                        <li
                          key={index}
                          className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-background/30 px-3 py-2 transition-colors hover:border-success/30 hover:bg-success/5"
                        >
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" />
                          <span className="text-sm leading-relaxed">{checkpoint}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {chapter.errors.length > 0 && (
                <Card id="errors" className="scroll-mt-24 border-destructive/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5 text-destructive" />
                      よくあるエラー
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {chapter.errors.map((error, index) => (
                      <div
                        key={index}
                        className="rounded-lg border border-destructive/20 bg-destructive/5 p-4"
                      >
                        <p className="font-mono text-sm font-medium text-destructive">
                          {error.error}
                        </p>
                        <Separator className="my-3 bg-destructive/20" />
                        <dl className="space-y-2 text-sm">
                          <div>
                            <dt className="inline font-medium">原因：</dt>
                            <dd className="inline text-muted-foreground">
                              {' '}
                              {error.cause}
                            </dd>
                          </div>
                          <div>
                            <dt className="inline font-medium">対処：</dt>
                            <dd className="inline text-muted-foreground">
                              {' '}
                              {error.solution}
                            </dd>
                          </div>
                        </dl>
                        {error.command && (
                          <CodeBlock code={error.command} className="mt-3" />
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>

            <Separator className="my-12" />

            <div className="grid gap-4 sm:grid-cols-2">
              {prevChapter ? (
                <Link
                  href={`/ja/learn/${prevChapter.id}`}
                  className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:bg-card/80"
                >
                  <ArrowLeft className="mt-1 h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">前の章 · {prevChapter.duration}</p>
                    <p className="mt-1 truncate font-medium">{prevChapter.title}</p>
                  </div>
                </Link>
              ) : (
                <div />
              )}
              {nextChapter ? (
                <Link
                  href={`/ja/learn/${nextChapter.id}`}
                  className="group flex items-start gap-3 rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 to-accent/10 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50 sm:text-right"
                >
                  <div className="min-w-0 flex-1 sm:order-1">
                    <p className="text-xs text-primary/80">次の章 · {nextChapter.duration}</p>
                    <p className="mt-1 truncate font-medium">{nextChapter.title}</p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                </Link>
              ) : (
                <Link
                  href="/ja/learn"
                  className="group flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 transition-all hover:-translate-y-0.5 hover:border-primary/50"
                >
                  <Trophy className="mt-1 h-4 w-4 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground">全章クリア</p>
                    <p className="mt-1 truncate font-medium">学習パスに戻る</p>
                  </div>
                </Link>
              )}
            </div>
          </article>

          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <ChapterToc items={sections.map((s) => ({ id: s.id, label: s.label }))} />
              <Separator className="my-6" />
              <div className="rounded-xl border border-border/60 bg-card/40 p-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  クイック操作
                </p>
                <div className="mt-3 space-y-2">
                  <Button asChild variant="outline" size="sm" className="w-full justify-start">
                    <Link href="/ja/diagnose">
                      <AlertTriangle className="mr-2 h-3.5 w-3.5" />
                      トラブル診断
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="w-full justify-start">
                    <Link href="/ja/assistant">
                      <ChevronRight className="mr-2 h-3.5 w-3.5" />
                      AI アシスタントに質問
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  )
}
