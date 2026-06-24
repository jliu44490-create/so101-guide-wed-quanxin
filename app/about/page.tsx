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
  TiltCard
} from '@/components/effects'
import { siteConfig } from '@/lib/site-config'

export const metadata: Metadata = {
  title: '关于项目',
  description: '了解 SO101 模仿学习指南的目标、技术栈与背后的团队。',
  alternates: {
    canonical: '/about',
    languages: {
      'zh-CN': '/about',
      'ja-JP': '/ja/about'
    }
  }
}

const values = [
  {
    icon: Target,
    title: '降低入门门槛',
    description: '把复杂的模仿学习流程拆成可执行的最小步骤，让你 1 天上手 LeRobot。'
  },
  {
    icon: Code2,
    title: '可复制的实战命令',
    description: '每条命令都按工作流组织，可直接复制使用，避免反复对照官方仓库找用法。'
  },
  {
    icon: Zap,
    title: '错误诊断知识库',
    description: '把常见报错的原因、修复命令和下一步建议都索引化，让排错过程变成查字典。'
  },
  {
    icon: Bot,
    title: 'AI 助手陪练',
    description: '随时提问 ACT、CVAE、推理部署等问题，对话历史在本地持久化保存。'
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
    phase: '阶段 01',
    title: '理解 & 准备',
    items: ['模仿学习概念', 'SO101 硬件结构', 'LeRobot 环境配置'],
    chapters: '1 – 3'
  },
  {
    phase: '阶段 02',
    title: '采集 & 校准',
    items: ['串口识别与校准', '遥操作', '数据采集与目录结构'],
    chapters: '4 – 6'
  },
  {
    phase: '阶段 03',
    title: '训练 & 部署',
    items: ['ACT 模型训练', '实机推理', '调试与平滑'],
    chapters: '7 – 9'
  }
]

const audience = [
  { icon: Lightbulb, title: '机器人爱好者', text: '想买一台便宜机械臂亲手跑通模仿学习流程' },
  { icon: Brain, title: 'AI / ML 研究者', text: '希望快速验证策略学习方法，不被工程细节卡住' },
  { icon: Cpu, title: '嵌入式 / 机器人开发者', text: '把 ACT 算法落地到自己的硬件平台' },
  { icon: Rocket, title: '学生与初学者', text: '通过完整闭环项目建立对具身智能的直觉' }
]

export default function AboutPage() {
  return (
    <div className="min-h-screen">
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
                  关于本项目
                </Badge>
              </Reveal>
              <Reveal delay={120}>
                <h1 className="mt-4 text-balance text-4xl font-bold sm:text-5xl lg:text-6xl">
                  让 <ShimmerText>具身智能</ShimmerText> 不再有门槛
                </h1>
              </Reveal>
              <Reveal delay={240}>
                <p className="mx-auto mt-5 max-w-2xl text-pretty text-muted-foreground sm:text-lg">
                  我们相信：一台低成本机械臂 + 清晰的中文学习路径 + 真实可用的命令库，
                  足以让任何一个对机器人感兴趣的人在几小时内动手训练自己的策略。
                </p>
              </Reveal>
              <Reveal delay={360}>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                  <Magnetic strength={0.4} range={140}>
                    <Button asChild size="lg" className="glow-primary">
                      <Link href="/learn">
                        开始学习
                        <ChevronRight className="ml-0.5 h-4 w-4" />
                      </Link>
                    </Button>
                  </Magnetic>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              项目价值
            </p>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              不是又一份「跑通了就完事」的教程
            </h2>
            <p className="mt-3 text-muted-foreground">
              这里把环境、硬件、数据、训练、推理压缩成一套可重复的工作流，并把踩过的坑都标在路上。
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v, i) => (
              <Reveal key={v.title} delay={i * 80}>
                <TiltCard
                  spotlight
                  maxTilt={5}
                  className="h-full rounded-xl border border-border/60 bg-card/60"
                >
                  <CardContent className="flex h-full flex-col gap-3 p-6">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-border/60">
                      <v.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-semibold">{v.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {v.description}
                    </p>
                  </CardContent>
                </TiltCard>
              </Reveal>
            ))}
          </div>
        </section>

        <GlowBeam />

        <section className="border-y border-border/40 bg-card/30">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                学习路线
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">三阶段循序渐进</h2>
            </div>
            <div className="relative grid gap-6 lg:grid-cols-3">
              <div
                aria-hidden
                className="pointer-events-none absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent lg:block"
              />
              {timeline.map((phase, idx) => (
                <Reveal key={phase.phase} delay={idx * 120}>
                  <TiltCard
                    spotlight
                    maxTilt={5}
                    className="relative h-full rounded-xl border border-border/60 bg-card/60"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent text-lg font-bold text-white shadow-md shadow-primary/30">
                          {idx + 1}
                        </div>
                        <Badge variant="outline" className="border-border/60 font-mono text-[10px]">
                          CH {phase.chapters}
                        </Badge>
                      </div>
                      <CardTitle className="mt-3 text-lg">{phase.title}</CardTitle>
                      <CardDescription>{phase.phase}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {phase.items.map((item) => (
                          <li key={item} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                            {item}
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

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-10 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                技术栈
              </p>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                <ShimmerText>现代、可读、易复用</ShimmerText>
              </h2>
            </div>
          </Reveal>

          <div className="space-y-3">
            <Marquee
              duration={28}
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

        <section className="border-y border-border/40 bg-card/30">
          <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
            <Badge variant="outline" className="border-border/60">
              <Users className="mr-1 h-3 w-3" />
              目标用户
            </Badge>
            <h2 className="mt-3 text-2xl font-bold sm:text-3xl">这份指南为谁而做？</h2>
            <p className="mt-3 text-muted-foreground">
              无论你是为兴趣还是为研究入坑，只要愿意花一个下午跟着走完，就能把 ACT 在 SO101 上跑起来。
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

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <Card className="relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/5 via-background to-accent/5">
            <CardContent className="grid gap-6 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">
                  想合作或提建议？
                </h2>
                <p className="mt-3 max-w-xl text-muted-foreground">
                  本项目持续迭代中：硬件兼容性测试、章节扩充、英文翻译、新数据集都在路上。
                  欢迎邮件联系，或在社区里和我们交流。
                </p>
              </div>
              <div className="flex flex-wrap gap-3 lg:justify-end">
                <Button asChild size="lg">
                  <a href={siteConfig.links.inquiry}>
                    <Mail className="mr-1.5 h-4 w-4" />
                    邮件联系
                  </a>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/community">
                    逛逛社区
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Separator className="my-12" />

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-sm text-muted-foreground">
              想合作、报错反馈或提供章节素材？欢迎邮件联系。
            </p>
            <Button asChild variant="ghost" size="sm">
              <a href={siteConfig.links.inquiry}>
                <Mail className="mr-1.5 h-3.5 w-3.5" />
                邮件联系
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
