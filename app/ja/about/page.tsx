import type { Metadata } from 'next'
import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  Brain,
  ChevronRight,
  Code2,
  Cpu,
  Lightbulb,
  Mail,
  Rocket,
  Sparkles,
  Target,
  Users,
  Zap
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  AuroraBackground,
  FloatingOrbs,
  GlowBeam,
  Magnetic,
  Marquee,
  Reveal,
  ShimmerText,
  SpotlightCard,
  TiltCard
} from '@/components/effects'
import { siteConfigJa } from '@/lib/site-config-ja'

export const metadata: Metadata = {
  title: 'プロジェクトについて',
  description: 'SO101 模倣学習ガイドの目的、技術スタック、運営チームを紹介します。'
}

const values = [
  {
    icon: Target,
    title: '入門ハードルを下げる',
    description: '複雑な模倣学習プロセスを最小単位に分解し、1 日で LeRobot を実行できる状態にします。'
  },
  {
    icon: Code2,
    title: 'すぐ実行できる実践コマンド',
    description: '各コマンドはワークフローに沿って整理。公式リポジトリを行き来する必要がありません。'
  },
  {
    icon: Zap,
    title: 'エラー診断ナレッジベース',
    description: '頻発エラーの原因・修正コマンド・次のステップをインデックス化し、デバッグを辞書感覚に変えます。'
  },
  {
    icon: Bot,
    title: 'AI アシスタントによる伴走',
    description: 'ACT、CVAE、推論デプロイなどをいつでも質問可能。対話履歴はローカルに保存されます。'
  }
]

const stack = [
  { name: 'Next.js 16', tag: 'App Router · React 19', accent: 'from-foreground/20 to-transparent' },
  { name: 'Tailwind CSS 4', tag: 'oklch tokens', accent: 'from-cyan-500/30 to-transparent' },
  { name: 'shadcn/ui', tag: 'Radix · Lucide', accent: 'from-purple-500/30 to-transparent' },
  { name: 'LeRobot', tag: 'HuggingFace', accent: 'from-yellow-500/30 to-transparent' },
  { name: 'ACT', tag: 'Action Chunking', accent: 'from-rose-500/30 to-transparent' },
  { name: 'TypeScript 5.7', tag: 'Strict mode', accent: 'from-blue-500/30 to-transparent' }
]

const timeline = [
  {
    phase: 'Phase 01',
    title: '理解と準備',
    items: ['模倣学習の基礎概念', 'SO101 ハードウェア構成', 'LeRobot 環境構築'],
    chapters: '1 – 3'
  },
  {
    phase: 'Phase 02',
    title: '収集とキャリブレーション',
    items: ['シリアルポート識別とキャリブレーション', '遠隔操作', 'データ収集とディレクトリ構造'],
    chapters: '4 – 6'
  },
  {
    phase: 'Phase 03',
    title: '学習とデプロイ',
    items: ['ACT モデル学習', '実機推論', '調整とスムージング'],
    chapters: '7 – 9'
  }
]

const audience = [
  { icon: Lightbulb, title: 'ロボット愛好家', text: '安価なアームを買って模倣学習を一通り通したい方' },
  { icon: Brain, title: 'AI / ML 研究者', text: 'エンジニアリングで詰まらず、ポリシー学習を素早く検証したい方' },
  { icon: Cpu, title: '組込み / ロボット開発者', text: 'ACT アルゴリズムを自社ハードへ落とし込みたい方' },
  { icon: Rocket, title: '学生・初学者', text: '完結したプロジェクトを通して身体性 AI の感覚を掴みたい方' }
]

export default function AboutPageJa() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border/40">
          <AuroraBackground intensity="normal" />
          <FloatingOrbs count={4} />
          <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Reveal>
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  <Sparkles className="mr-1 h-3 w-3" />
                  プロジェクトについて
                </Badge>
              </Reveal>
              <Reveal delay={120}>
                <h1 className="mt-4 text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
                  <ShimmerText>身体性 AI</ShimmerText>に、もう障壁はいらない
                </h1>
              </Reveal>
              <Reveal delay={240}>
                <p className="mx-auto mt-5 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
                  私たちは信じています ── 一台の低コストなロボットアーム +
                  分かりやすい日本語の学習パス + 実際に動くコマンド集があれば、
                  ロボットに興味のある誰もが数時間で自分のポリシーを学習させられる、と。
                </p>
              </Reveal>
              <Reveal delay={360}>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Magnetic strength={0.4} range={140}>
                    <Button asChild size="lg" className="glow-primary">
                      <Link href="/ja/learn">
                        学習を始める
                        <ChevronRight className="ml-0.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </Magnetic>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Why this guide
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                <ShimmerText>このガイドが目指すもの</ShimmerText>
              </h2>
            </div>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <TiltCard
                  spotlight
                  maxTilt={5}
                  className="h-full rounded-2xl border border-border/60 bg-card/60"
                >
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border/60">
                      <v.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold">{v.title}</h3>
                    <p className="text-sm text-muted-foreground">{v.description}</p>
                  </CardContent>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        <GlowBeam />

        {/* TIMELINE */}
        <section className="border-y border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <Reveal>
              <div className="mb-12 max-w-2xl">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Roadmap
                </p>
                <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                  <ShimmerText>3 つのフェーズ</ShimmerText>で完結する学習設計
                </h2>
              </div>
            </Reveal>

            <div className="grid gap-5 lg:grid-cols-3">
              {timeline.map((phase, i) => (
                <Reveal key={phase.phase} delay={i * 120}>
                  <TiltCard
                    spotlight
                    maxTilt={5}
                    className="h-full rounded-2xl border border-border/60 bg-card/60"
                  >
                    <CardHeader>
                      <Badge variant="outline" className="w-fit border-primary/30 bg-primary/10 text-primary">
                        {phase.chapters}
                      </Badge>
                      <CardTitle className="mt-3 text-lg">{phase.title}</CardTitle>
                      <CardDescription>{phase.phase}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground">
                        {phase.items.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* STACK */}
        <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Tech stack
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                <ShimmerText>このサイトを支える技術</ShimmerText>
              </h2>
            </div>
          </Reveal>

          <div className="space-y-3">
            <Marquee
              duration={32}
              items={stack.map((tech) => (
                <div
                  key={tech.name}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3"
                >
                  <div className={`h-8 w-1 rounded-full bg-gradient-to-b ${tech.accent.replace('to-transparent', 'to-primary/40')}`} />
                  <div>
                    <p className="text-sm font-semibold">{tech.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{tech.tag}</p>
                  </div>
                </div>
              ))}
            />
            <Marquee
              duration={32}
              reverse
              items={stack.slice().reverse().map((tech) => (
                <div
                  key={`r-${tech.name}`}
                  className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-4 py-3"
                >
                  <div className={`h-8 w-1 rounded-full bg-gradient-to-b ${tech.accent.replace('to-transparent', 'to-accent/40')}`} />
                  <div>
                    <p className="text-sm font-semibold">{tech.name}</p>
                    <p className="font-mono text-[10px] text-muted-foreground">{tech.tag}</p>
                  </div>
                </div>
              ))}
            />
          </div>
        </section>

        {/* AUDIENCE */}
        <section className="border-y border-border/40 bg-card/30">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <Badge variant="outline" className="border-border/60">
              <Users className="mr-1 h-3 w-3" />
              対象ユーザー
            </Badge>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">このガイドはどなた向け？</h2>
            <p className="mt-3 text-muted-foreground">
              趣味でも研究でも、午後一回分の時間をいただければ、ACT を SO101 で動かすところまでお連れします。
            </p>
            <ul className="mt-6 space-y-3">
              {audience.map((a) => (
                <li key={a.title} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 ring-1 ring-primary/30">
                    <a.icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{a.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* CONTACT CTA */}
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <CardContent className="grid gap-6 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  協業・ご提案はこちら
                </h2>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  本プロジェクトは継続的にアップデート中です。ハードウェア互換性テスト、章の拡充、英語化、新規データセットなどに取り組んでいます。
                  メールでお気軽にご連絡ください。
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button asChild size="lg">
                  <a href={siteConfigJa.links.inquiry}>
                    <Mail className="mr-1.5 h-4 w-4" />
                    メールで連絡
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/ja/learn">
                    学習を始める
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-12" />

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              ご協業のご相談、バグ報告、章コンテンツの寄稿はメールにてお問い合わせください。
            </p>
            <Button asChild variant="ghost" size="sm">
              <a href={siteConfigJa.links.inquiry}>
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                メールでお問い合わせ
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
