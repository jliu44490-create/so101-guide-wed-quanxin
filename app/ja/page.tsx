import Link from 'next/link'
import {
  ArrowRight,
  Bot,
  BookOpenCheck,
  Brain,
  ChevronRight,
  Database,
  PlayCircle,
  Rocket,
  Terminal,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from '@/components/ui/accordion'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { HeroStats } from '@/components/hero-stats'
import { BrandCard } from '@/components/brand-card'
import { ChapterStatusBadges } from '@/components/chapter-status-badges'
import { HomeLearningPathCards } from '@/components/home-learning-path-cards'
import {
  AuroraBackground,
  ConicBorder,
  FloatingOrbs,
  GlowBeam,
  InteractiveGrid,
  Magnetic,
  Marquee,
  ParticleField,
  Reveal,
  ShimmerText,
  SpotlightCard,
  TextReveal,
  TiltCard
} from '@/components/effects'
import { siteConfigJa } from '@/lib/site-config-ja'
import { chaptersJa } from '@/lib/course-data-ja'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: BookOpenCheck,
    title: '段階的に学べる 9 章構成',
    description:
      '模倣学習の概念から ACT モデルのデプロイまで、各章に学習目標・原理・コマンド・チェックポイントを用意。',
    accent: 'from-primary/30 via-primary/5 to-transparent',
    iconColor: 'text-primary'
  },
  {
    icon: Terminal,
    title: 'すぐ実行できる実践コマンド',
    description:
      'Leader / Follower 双腕ワークフローに沿って整理。コピーしてターミナルで即実行できます。',
    accent: 'from-accent/30 via-accent/5 to-transparent',
    iconColor: 'text-accent'
  },
  {
    icon: Zap,
    title: 'エラー診断ナレッジベース',
    description:
      '頻発するエラーの原因・解決策・次の一手をインデックス化。Stack Overflow を行き来する手間を削減します。',
    accent: 'from-orange-500/30 via-orange-500/5 to-transparent',
    iconColor: 'text-orange-500'
  },
  {
    icon: Bot,
    title: 'AI 模倣学習アシスタント',
    description:
      'ACT、CVAE、データ収集、推論デプロイなどをいつでも質問可能。会話履歴はローカルに保存されます。',
    accent: 'from-emerald-500/30 via-emerald-500/5 to-transparent',
    iconColor: 'text-emerald-500'
  }
]

const stack = [
  'Next.js 16',
  'React 19',
  'Tailwind v4',
  'TypeScript 5.7',
  'shadcn/ui',
  'Radix Primitives',
  'LeRobot',
  'Hugging Face',
  'ACT · CVAE',
  'PyTorch',
  'Hydra Config',
  'Wandb',
  'OKLCH',
  'next/og',
  'Vercel'
]

const workflow = [
  {
    step: '01',
    icon: Database,
    title: 'データ収集',
    description: 'Leader / Follower 遠隔操作 → parquet + 動画 + meta',
    href: '/ja/learn/5',
    code: `lerobot-record \
  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \
  --teleop.type=so101_leader --teleop.port=/dev/ttyACM1 \
  --dataset.repo_id=you/pick-place \
  --dataset.num_episodes=50 --dataset.fps=30 \
  --display_data=true`
  },
  {
    step: '02',
    icon: Brain,
    title: '学習',
    description: 'ACT (CVAE + Transformer) を自前データセットでファインチューニング',
    href: '/ja/learn/7',
    code: `lerobot-train \
  --dataset.repo_id=you/pick-place \
  --policy.type=act \
  --output_dir=outputs/train/act_so101`
  },
  {
    step: '03',
    icon: Rocket,
    title: '推論',
    description:
      'チェックポイントをロード → 実機制御 → fps と EMA で滑らかに調整',
    href: '/ja/learn/8',
    code: `lerobot-record \
  --robot.type=so101_follower --robot.port=/dev/ttyACM0 \
  --policy.path=outputs/.../last \
  --dataset.fps=30`
  }
]

const faqs = [
  {
    q: 'ロボットアームが手元になくても学習を始められますか？',
    a: 'はい、可能です。最初の 3 章は概念解説とソフトウェア環境の準備が中心で、模倣学習の考え方と LeRobot 環境を一通り押さえられます。実機が届いたあとに実機演習の章へ進んでください。'
  },
  {
    q: 'このサイトと LeRobot の関係は？',
    a: '本サイトは HuggingFace の LeRobot フレームワークをベースに、日本語の実践ガイド・エラーベース・運用ノウハウをまとめたものです。公式ドキュメントを置き換えるのではなく、実際に手を動かせる手順へ「翻訳」する位置付けです。'
  },
  {
    q: 'なぜ他のロボットアームではなく SO101 に焦点を絞っているのですか？',
    a: 'SO101（SO-100 / SO-ARM100 の派生）は安価で再現性が高く、身体性 AI の入門に最適なハードウェアの一つです。本サイトの方法論は LeRobot 互換の他のアームにも応用できます。'
  },
  {
    q: 'データ収集で問題が出た場合の調べ方は？',
    a: 'まず「トラブル診断」でエラーキーワードを検索してください。該当が無ければ「AI アシスタント」に状況を添えて聞くと、初学者がつまずく問題の大半はすでに収録されています。'
  }
]

export default function HomePageJa() {
  const totalChapters = chaptersJa.length
  const previewCount = 6
  return (
    <div className="min-h-screen">
      <Header />

      <main>
      {/* ═══════════════════════ HERO ═══════════════════════ */}
      <section className="relative overflow-hidden">
        <AuroraBackground intensity="normal" withGrid={false} />
        <InteractiveGrid />
        <FloatingOrbs count={5} />
        <ParticleField count={50} interactive baseHue={260} />

        <div className="relative mx-auto max-w-7xl px-4 pb-24 pt-20 sm:px-6 sm:pt-28 lg:px-8 lg:pt-32">
          <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div className="text-center lg:text-left">
              <Reveal>
                <Magnetic strength={0.2} range={140}>
                  <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-1.5 text-xs backdrop-blur-md">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <span className="text-muted-foreground">
                      LeRobot · SO101 · ACT 実践ガイド
                    </span>
                  </div>
                </Magnetic>
              </Reveal>

              <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                <TextReveal
                  text={`SO101\n模倣学習`}
                  as="span"
                  className="block whitespace-pre-line"
                  staggerMs={80}
                />
                <span className="mt-2 block">
                  <TextReveal
                    text="ゼロから踏まない"
                    as="span"
                    className="block"
                    staggerMs={70}
                    baseDelay={600}
                  />
                </span>
              </h1>

              <Reveal delay={800}>
                <p className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                  {siteConfigJa.description}
                </p>
              </Reveal>

              <Reveal delay={1000}>
                <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
                  <Magnetic strength={0.5} range={140}>
                    <Button
                      asChild
                      size="lg"
                      className="relative h-12 overflow-hidden glow-primary glow-primary-hover px-6"
                    >
                      <Link href="/ja/learn">
                        <PlayCircle className="mr-1.5 h-4 w-4" />
                        学習を始める
                        <ChevronRight className="ml-0.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </Magnetic>
                  <Magnetic strength={0.5} range={140}>
                    <Button asChild variant="outline" size="lg" className="h-12">
                      <Link href="/ja/assistant">
                        <Bot className="mr-1.5 h-4 w-4" />
                        AI アシスタントに質問
                      </Link>
                    </Button>
                  </Magnetic>
                </div>
              </Reveal>

              <HeroStats locale="ja" />
            </div>

            <Reveal direction="scale" delay={400}>
              <div className="relative flex items-center justify-center lg:justify-end">
                <BrandCard
                  className="max-w-full"
                  title="LVJIN ROBOTICS"
                  subtitle="Embodied AI · 身体性 AI 学習プラットフォーム"
                  tags={['Hardware', 'Software', 'Education']}
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ═══════════════════════ MARQUEE ═══════════════════════ */}
      <section className="relative border-y border-border/40 bg-card/30 py-7">
        <Marquee
          duration={40}
          items={stack.map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-4 py-1.5 font-mono text-xs text-muted-foreground"
            >
              <span className="h-1 w-1 rounded-full bg-primary" />
              {item}
            </div>
          ))}
        />
      </section>


      {/* ═══════════════════════ FEATURES ═══════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-12 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              このサイトを選ぶ理由
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              <ShimmerText>模倣学習を始める方のための</ShimmerText>
              <br />
              <span className="text-foreground">実践ハンドブック</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              論文の概念羅列ではなく、各ステップを最小限のコマンドと明確なチェックポイントへ凝縮しました。
            </p>
          </div>
        </Reveal>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, i) => (
            <Reveal key={feature.title} delay={i * 80}>
              <TiltCard
                spotlight
                className="group relative h-full overflow-hidden rounded-xl border border-border/60 bg-card/60"
              >
                <div
                  className={cn(
                    'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
                    feature.accent
                  )}
                />
                <div className="relative flex h-full flex-col gap-3 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-border/60 transition-transform group-hover:scale-110">
                    <feature.icon className={cn('h-5 w-5', feature.iconColor)} />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </section>

      <GlowBeam />

      {/* ═══════════════════════ LEARNING PATH (placeholder until JP chapters are translated) ═══════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                学習パス
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                <span className="text-foreground">概念からデプロイまで</span>{' '}
                <ShimmerText>9 つのマイルストーン</ShimmerText>
              </h2>
              <p className="mt-4 text-muted-foreground">
                各章に学習目標、原理、操作手順、コマンド、チェックポイントを用意しています。
              </p>
            </div>
            <ChapterStatusBadges locale="ja" />
          </div>
        </Reveal>

        <HomeLearningPathCards />

        <Reveal>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              さらに {totalChapters - previewCount} 章の応用コンテンツが控えています
            </p>
            <Magnetic strength={0.4} range={120}>
              <Button asChild variant="outline" size="lg">
                <Link href="/ja/learn">
                  全章カリキュラムを見る
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </Magnetic>
          </div>
        </Reveal>
      </section>

      <GlowBeam />

      {/* ═══════════════════════ WORKFLOW ═══════════════════════ */}
      <section className="relative overflow-hidden border-y border-border/40 bg-card/30 py-24">
        <FloatingOrbs count={3} />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-14 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                ワークフロー
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                <span className="text-foreground">データ → 学習 → 推論</span>{' '}
                <ShimmerText>のクローズドループ</ShimmerText>
              </h2>
              <p className="mt-4 text-muted-foreground">
                LeRobot ワークフローの各工程はサイト内の章に対応しています。コマンド、データセット構造、典型的なエラーまで一気通貫で確認できます。
              </p>
            </div>
          </Reveal>

          <div className="grid min-w-0 gap-6 lg:grid-cols-3">
            {workflow.map((step, i) => (
              <Reveal key={step.step} delay={i * 120} className="min-w-0">
                <Link href={step.href} className="group block h-full min-w-0">
                  <ConicBorder className="h-full min-w-0">
                    <SpotlightCard className="relative h-full min-w-0 overflow-hidden rounded-2xl border border-border/40 bg-card/80 backdrop-blur p-6">
                      <div className="flex items-start justify-between gap-3">
                        <span className="font-mono text-2xl font-bold text-muted-foreground/50">
                          {step.step}
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                          <step.icon className="h-5 w-5" />
                        </div>
                      </div>
                      <h3 className="mt-5 text-lg font-semibold">{step.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground">{step.description}</p>
                      <pre className="mt-5 min-w-0 max-w-full overflow-x-auto rounded-lg border border-border/50 bg-[oklch(0.12_0.01_270)] p-3 font-mono text-[11px] leading-relaxed text-white/85">
                        <code className="block min-w-max">{step.code}</code>
                      </pre>
                      <div className="mt-5 flex min-w-0 items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        章へ進む
                        <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </SpotlightCard>
                  </ConicBorder>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════ FAQ ═══════════════════════ */}
      <section className="relative mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-12 text-center">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              よくある質問
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              <ShimmerText>はじめる前に</ShimmerText>
            </h2>
          </div>
        </Reveal>

        <Reveal>
          <Accordion type="single" collapsible className="space-y-2">
            {faqs.map((faq, i) => (
              <AccordionItem
                key={i}
                value={`faq-${i}`}
                className="overflow-hidden rounded-xl border border-border/60 bg-card/40 px-4 last:border-b"
              >
                <AccordionTrigger className="py-4 text-left text-sm font-medium hover:no-underline">
                  {faq.q}
                </AccordionTrigger>
                <AccordionContent className="pb-4 text-sm text-muted-foreground">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </section>

      {/* ═══════════════════════ CTA ═══════════════════════ */}
      <section className="relative overflow-hidden border-t border-border/40">
        <FloatingOrbs count={4} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <Reveal direction="scale">
            <ConicBorder className="rounded-3xl">
              <Card className="relative overflow-hidden border-0 bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-3xl">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -left-12 top-0 h-64 w-64 rounded-full bg-primary/15 blur-3xl" />
                  <div className="absolute -right-12 bottom-0 h-64 w-64 rounded-full bg-accent/15 blur-3xl" />
                </div>
                <CardContent className="relative p-10 text-center sm:p-14">
                  <h2 className="text-3xl font-bold sm:text-4xl">
                    <ShimmerText>始める</ShimmerText>準備はできましたか？
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                    9 つのインタラクティブレッスンで SO101 模倣学習をゼロから。
                    詰まったらコミュニティで質問 —— みんなで学ぶ方が速い。
                  </p>
                  <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Magnetic strength={0.5} range={140}>
                      <Button asChild size="lg" className="h-12 glow-primary px-6">
                        <Link href="/ja/learn">今すぐ学習を始める</Link>
                      </Button>
                    </Magnetic>
                    <Magnetic strength={0.5} range={140}>
                      <Button asChild variant="ghost" size="lg" className="h-12">
                        <Link href="/ja/diagnose">困ったときは</Link>
                      </Button>
                    </Magnetic>
                  </div>
                </CardContent>
              </Card>
            </ConicBorder>
          </Reveal>
        </div>
      </section>

      </main>
      <Footer />
    </div>
  )
}
