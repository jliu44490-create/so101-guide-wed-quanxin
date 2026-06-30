import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BookMarked,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Gamepad2,
  GraduationCap,
  HelpCircle,
  Lightbulb,
  ListChecks,
  Sparkles,
  Target,
  Terminal,
  Trophy,
  Wand2
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CodeBlock } from '@/components/code-block'
import { ChapterToc } from '@/components/chapter-toc'
import { ReadingProgress } from '@/components/reading-progress'
import { ChapterProgressActions } from '@/components/chapter-progress-actions'
import { Prose } from '@/components/prose'
import { Mermaid } from '@/components/mermaid'
import { Discussion } from '@/components/discussion'
import { ContentGate } from '@/components/content-gate'
import { CompanionExplainButton } from '@/components/companion-explain-button'
import {
  ExerciseList,
  PitfallList,
  QuizList,
  WalkthroughBlock
} from '@/components/callouts'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { chaptersJa } from '@/lib/course-data-ja'
import { hasLessonJa } from '@/lib/lessons-ja'
import { siteConfigJa } from '@/lib/site-config-ja'

/**
 * 日本語の章ページ。中国語版 (app/learn/[id]/page.tsx) と同じリッチ項目を
 * すべて描画する。**両ページは表示内容を揃えて保守すること**（片方だけ更新しない）。
 * 将来的には共有コンポーネントへの抽出を推奨（中日の乖離を構造的に防ぐため）。
 *
 * ペイウォール：ContentGate 適用済み（最初の 2 章無料、以降は /ja/unlock）。
 * インタラクティブ講座バナーは lessons-ja に該当章がある場合のみ表示（順次拡充）。
 */

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

  const hasWalkthrough = (chapter.walkthrough?.length ?? 0) > 0
  const showLegacySteps = !hasWalkthrough && chapter.steps.length > 0

  const sections: { id: string; label: string; available: boolean }[] = [
    { id: 'overview', label: '概要', available: true },
    { id: 'introduction', label: '導入', available: !!chapter.introduction },
    { id: 'why', label: 'なぜ重要か', available: !!chapter.whyItMatters },
    { id: 'objectives', label: '学習目標', available: chapter.objectives.length > 0 },
    { id: 'principles', label: '基本原理', available: chapter.principles.length > 0 },
    { id: 'diagrams', label: 'アーキテクチャ図', available: (chapter.diagrams?.length ?? 0) > 0 },
    { id: 'walkthrough', label: 'ステップ解説', available: hasWalkthrough },
    { id: 'steps', label: '手順', available: showLegacySteps },
    { id: 'commands', label: 'コマンド', available: chapter.commands.length > 0 },
    { id: 'pitfalls', label: 'よくある誤解', available: (chapter.pitfalls?.length ?? 0) > 0 },
    { id: 'checkpoints', label: 'チェックポイント', available: chapter.checkpoints.length > 0 },
    { id: 'exercises', label: 'ハンズオン演習', available: (chapter.exercises?.length ?? 0) > 0 },
    { id: 'self-check', label: '理解度チェック', available: (chapter.selfCheck?.length ?? 0) > 0 },
    { id: 'errors', label: 'よくあるエラー', available: chapter.errors.length > 0 },
    { id: 'further', label: '参考リンク', available: (chapter.furtherReading?.length ?? 0) > 0 },
    { id: 'summary', label: 'まとめ', available: !!chapter.summary }
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

        {hasLessonJa(chapter.id) && (
          <div className="mb-8 overflow-hidden rounded-2xl border border-accent/30 bg-gradient-to-br from-accent/10 via-primary/5 to-background">
            <div className="flex flex-col items-start gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
              <div className="flex items-start gap-3 sm:items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 ring-1 ring-accent/30">
                  <Gamepad2 className="h-6 w-6 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-accent">
                    この章にはインタラクティブ講座があります
                  </p>
                  <p className="mt-1 text-sm leading-relaxed sm:text-base">
                    <strong>文章を読むのが大変？</strong>7 分のインタラクティブ版を試そう —— カードをめくりながら学べて、読むより身につきます。
                  </p>
                </div>
              </div>
              <Button
                asChild
                size="lg"
                className="glow-primary h-12 w-full px-6 sm:w-auto sm:shrink-0"
              >
                <Link href={`/ja/learn/${chapter.id}/play`}>
                  🎮 インタラクティブ講座を始める
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="border-t border-accent/20 bg-background/30 px-5 py-2 text-[11px] text-muted-foreground sm:px-6">
              いま読んでいるのは <strong className="text-foreground">完全なドキュメント版</strong> —— 復習や深掘りに最適。インタラクティブ講座は初学習に向いています。
            </div>
          </div>
        )}

        <ContentGate chapterId={chapter.id} what={`第 ${chapter.id} 章`}>
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
              {chapter.introduction && (
                <Card id="introduction" className="scroll-mt-24 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookMarked className="h-5 w-5 text-primary" />
                      導入
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Prose content={chapter.introduction} />
                  </CardContent>
                </Card>
              )}

              {chapter.whyItMatters && (
                <Card
                  id="why"
                  className="scroll-mt-24 border-primary/30 bg-gradient-to-br from-primary/5 via-background to-accent/5"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Sparkles className="h-5 w-5 text-primary" />
                      なぜ重要か
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Prose content={chapter.whyItMatters} />
                  </CardContent>
                </Card>
              )}

              {chapter.keyTerms && chapter.keyTerms.length > 0 && (
                <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/60 bg-card/40 p-4">
                  <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    この章のキーワード
                  </span>
                  {chapter.keyTerms.map((term) => (
                    <Link
                      key={term}
                      href={`/ja/glossary#${encodeURIComponent(term)}`}
                      className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs text-primary transition-colors hover:bg-primary/20"
                    >
                      {term}
                    </Link>
                  ))}
                </div>
              )}

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
                      基本原理
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

              {chapter.diagrams && chapter.diagrams.length > 0 && (
                <Card id="diagrams" className="scroll-mt-24 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Brain className="h-5 w-5 text-accent" />
                      アーキテクチャ図
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {chapter.diagrams.map((d, i) => (
                      <div key={i}>
                        {d.title && (
                          <p className="mb-1 text-sm font-semibold">{d.title}</p>
                        )}
                        <Mermaid source={d.source} caption={d.caption} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {hasWalkthrough && chapter.walkthrough && (
                <Card id="walkthrough" className="scroll-mt-24 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Wand2 className="h-5 w-5 text-primary" />
                      ステップ解説
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <WalkthroughBlock steps={chapter.walkthrough} />
                  </CardContent>
                </Card>
              )}

              {showLegacySteps && (
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

              {chapter.pitfalls && chapter.pitfalls.length > 0 && (
                <Card id="pitfalls" className="scroll-mt-24 border-rose-500/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <AlertTriangle className="h-5 w-5 text-rose-500" />
                      よくある誤解
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <PitfallList items={chapter.pitfalls} />
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

              {chapter.exercises && chapter.exercises.length > 0 && (
                <Card
                  id="exercises"
                  className="scroll-mt-24 border-primary/30 bg-primary/[0.02]"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <GraduationCap className="h-5 w-5 text-primary" />
                      ハンズオン演習
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ExerciseList items={chapter.exercises} />
                  </CardContent>
                </Card>
              )}

              {chapter.selfCheck && chapter.selfCheck.length > 0 && (
                <Card id="self-check" className="scroll-mt-24 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <HelpCircle className="h-5 w-5 text-accent" />
                      理解度チェック
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <QuizList items={chapter.selfCheck} />
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

              {chapter.furtherReading && chapter.furtherReading.length > 0 && (
                <Card id="further" className="scroll-mt-24 border-border/60">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <BookMarked className="h-5 w-5 text-accent" />
                      参考リンク
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {chapter.furtherReading.map((r, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm font-medium text-primary hover:underline"
                            >
                              {r.title}
                            </a>
                            {r.note && (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {r.note}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {chapter.summary && (
                <Card
                  id="summary"
                  className="scroll-mt-24 border-[oklch(from_var(--success)_l_c_h/0.3)] bg-success/5"
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <CheckCircle2 className="h-5 w-5 text-[var(--color-success)]" />
                      まとめ
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Prose content={chapter.summary} />
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

            <Discussion threadKey={`chapter:${chapter.id}`} title="この章のディスカッション" />
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
                    <Link href="/ja/ai">
                      <ChevronRight className="mr-2 h-3.5 w-3.5" />
                      LVJIN AI に質問
                    </Link>
                  </Button>
                  <CompanionExplainButton
                    topic={`第 ${chapter.id} 章：${chapter.title}`}
                    context={chapter.description}
                    label="LVJIN に解説してもらう"
                  />
                </div>
              </div>
            </div>
          </aside>
        </div>
        </ContentGate>
      </main>

      <Footer />
    </div>
  )
}
