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
import { chapters } from '@/lib/course-data'
import { siteConfig } from '@/lib/site-config'
import { cn } from '@/lib/utils'

const features = [
  {
    icon: BookOpenCheck,
    title: '9 章渐进式课程',
    description: '从模仿学习概念到 ACT 模型部署，每章都有目标、原理、命令和检查点。',
    accent: 'from-primary/30 via-primary/5 to-transparent',
    iconColor: 'text-primary'
  },
  {
    icon: Terminal,
    title: '可复制的实战命令',
    description: '每条命令都按 Leader/Follower 双臂工作流组织，一键复制即可在终端运行。',
    accent: 'from-accent/30 via-accent/5 to-transparent',
    iconColor: 'text-accent'
  },
  {
    icon: Zap,
    title: '错误诊断知识库',
    description: '常见报错的原因、解决方案与下一步建议都已索引，再也不用 Stack Overflow 反复折腾。',
    accent: 'from-orange-500/30 via-orange-500/5 to-transparent',
    iconColor: 'text-orange-500'
  },
  {
    icon: Bot,
    title: 'AI 模仿学习助手',
    description: '随时提问 ACT、CVAE、数据采集、推理部署等问题，对话历史本地保存。',
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
    title: '采集',
    description: 'Leader/Follower 遥操作 → parquet + 视频 + meta',
    href: '/learn/5',
    code: `python lerobot/scripts/control_robot.py record \\
  --robot-path lerobot/configs/robot/so100.yaml \\
  --repo-id you/pick_place \\
  --num-episodes 50`
  },
  {
    step: '02',
    icon: Brain,
    title: '训练',
    description: 'ACT (CVAE + Transformer) 在你的数据集上 fine-tune',
    href: '/learn/7',
    code: `python lerobot/scripts/train.py \\
  policy=act env=so100 \\
  dataset_repo_id=you/pick_place`
  },
  {
    step: '03',
    icon: Rocket,
    title: '推理',
    description: '加载 checkpoint → 实机控制 → 调 fps + EMA 平滑',
    href: '/learn/8',
    code: `python lerobot/scripts/control_robot.py record \\
  --policy-path outputs/.../last \\
  --fps 30`
  }
]

const faqs = [
  {
    q: '我需要先有机械臂才能开始学习吗？',
    a: '不需要。前 3 章纯理论 + 软件准备，可以先把模仿学习的概念和 LeRobot 环境打通；硬件到位后再进入实操章节。'
  },
  {
    q: '这个站和 LeRobot 是什么关系？',
    a: '本站完全基于 HuggingFace 的 LeRobot 框架，提供中文化的实战路径、错误库和经验总结，不替代官方文档，而是把它"翻译"成可上手的步骤。'
  },
  {
    q: '为什么聚焦 SO101 而不是其他机械臂？',
    a: 'SO101（SO-100/SO-ARM100 衍生）便宜、易复现，是入门具身智能的最佳硬件之一。本站方法论对其他 LeRobot 兼容机械臂同样适用。'
  },
  {
    q: '我的数据采集出问题，找不到原因怎么办？',
    a: '先用「报错诊断」搜索错误关键字，匹配不到再去「AI 助手」描述上下文。绝大多数初学者问题都已经被收录。'
  }
]

export default function HomePage() {
  const totalChapters = chapters.length
  const previewCount = 6

  return (
    <div className="min-h-screen bg-background">
      <Header />

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
                      LeRobot · SO101 · ACT 完整实战路径
                    </span>
                  </div>
                </Magnetic>
              </Reveal>

              <h1 className="mt-6 text-balance text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                <TextReveal
                  text={`SO101\n模仿学习`}
                  as="span"
                  className="block whitespace-pre-line"
                  staggerMs={80}
                />
                <span className="mt-2 block">
                  <TextReveal
                    text="不再从零踩坑"
                    as="span"
                    className="block"
                    staggerMs={70}
                    baseDelay={600}
                  />
                </span>
              </h1>

              <Reveal delay={800}>
                <p className="mx-auto mt-7 max-w-2xl text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg lg:mx-0">
                  {siteConfig.description}
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
                      <Link href="/learn">
                        <PlayCircle className="mr-1.5 h-4 w-4" />
                        开始学习
                        <ChevronRight className="ml-0.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </Magnetic>
                  <Magnetic strength={0.5} range={140}>
                    <Button asChild variant="outline" size="lg" className="h-12">
                      <Link href="/assistant">
                        <Bot className="mr-1.5 h-4 w-4" />
                        询问 AI 助手
                      </Link>
                    </Button>
                  
                  </Magnetic>
                </div>
              </Reveal>

              <HeroStats />
            </div>

            <Reveal direction="scale" delay={400}>
              <div className="relative flex items-center justify-center lg:justify-end">
                <BrandCard className="max-w-full" />
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
              为什么选这里
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              <ShimmerText>专为模仿学习初学者</ShimmerText>
              <br />
              <span className="text-foreground">打造的实战手册</span>
            </h2>
            <p className="mt-4 text-muted-foreground">
              抛开学术论文的概念堆砌，本站把每一步压缩成最少的命令、最清晰的检查点。
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

      {/* ═══════════════════════ LEARNING PATH ═══════════════════════ */}
      <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <Reveal>
          <div className="mb-12 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                学习路径
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                <span className="text-foreground">从概念到部署的</span>{' '}
                <ShimmerText>9 个里程碑</ShimmerText>
              </h2>
              <p className="mt-4 text-muted-foreground">
                每个章节配套学习目标、原理、操作步骤、命令和检查点。
              </p>
            </div>
            <ChapterStatusBadges />
          </div>
        </Reveal>

        <HomeLearningPathCards />

        <Reveal>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              还有 {totalChapters - previewCount} 个进阶章节等待解锁
            </p>
            <Magnetic strength={0.4} range={120}>
              <Button asChild variant="outline" size="lg">
                <Link href="/learn">
                  查看完整路径
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
                工作流
              </p>
              <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
                <span className="text-foreground">数据 → 训练 → 推理</span>{' '}
                <ShimmerText>的闭环</ShimmerText>
              </h2>
              <p className="mt-4 text-muted-foreground">
                LeRobot 工作流的每个环节都对应站内一节课。点开章节就能看到对应的命令、数据集结构和典型报错。
              </p>
            </div>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-3">
            {workflow.map((step, i) => (
              <Reveal key={step.step} delay={i * 120}>
                <Link href={step.href} className="group block h-full">
                  <ConicBorder className="h-full">
                    <SpotlightCard className="relative h-full rounded-2xl border border-border/40 bg-card/80 backdrop-blur p-6">
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
                      <pre className="mt-5 overflow-x-auto rounded-lg border border-border/50 bg-[oklch(0.12_0.01_270)] p-3 font-mono text-[11px] leading-relaxed text-white/85">
                        <code>{step.code}</code>
                      </pre>
                      <div className="mt-5 flex items-center gap-1.5 text-xs font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">
                        前往章节
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
              常见疑问
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              <ShimmerText>在开始之前</ShimmerText>
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
                    准备好<ShimmerText>开始</ShimmerText>了吗？
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
                    跟着 9 节互动课从零跑通 SO101 模仿学习，遇到问题就去社区提问 ——
                    一群人一起学，比一个人啃文档快得多。
                  </p>
                  <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Magnetic strength={0.5} range={140}>
                      <Button asChild size="lg" className="h-12 glow-primary px-6">
                        <Link href="/learn">立即开始学习</Link>
                      </Button>
                    </Magnetic>
                    <Magnetic strength={0.5} range={140}>
                      <Button asChild variant="outline" size="lg" className="h-12">
                        <Link href="/community">逛逛社区</Link>
                      </Button>
                    </Magnetic>
                    <Magnetic strength={0.5} range={140}>
                      <Button asChild variant="ghost" size="lg" className="h-12">
                        <Link href="/diagnose">遇到问题？</Link>
                      </Button>
                    </Magnetic>
                  </div>
                </CardContent>
              </Card>
            </ConicBorder>
          </Reveal>
        </div>
      </section>

      <Footer />
    </div>
  )
}
