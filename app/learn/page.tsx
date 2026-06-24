import type { Metadata } from 'next'
import { GraduationCap } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ChapterFilter } from '@/components/chapter-filter'
import { LearnHud } from '@/components/learn-hud'
import { LearnPath } from '@/components/learn-path'
import {
  AuroraBackground,
  FloatingOrbs,
  Reveal,
  ShimmerText
} from '@/components/effects'
import { chapters } from '@/lib/course-data'

export const metadata: Metadata = {
  title: '学习路径',
  description:
    '系统的 SO101 模仿学习课程路径：从概念、硬件、环境到 ACT 训练与实机部署的 9 个章节。',
  alternates: {
    canonical: '/learn',
    languages: {
      'zh-CN': '/learn',
      'ja-JP': '/ja/learn'
    }
  }
}

const totalMinutes = chapters.reduce((acc, c) => {
  const m = parseInt(c.duration)
  return acc + (isNaN(m) ? 0 : m)
}, 0)

const totalCommands = chapters.reduce((acc, c) => acc + c.commands.length, 0)

export default function LearnPage() {
  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border/40">
          <AuroraBackground intensity="subtle" />
          <FloatingOrbs count={3} />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" />
                学习路径
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                <ShimmerText>SO101 模仿学习</ShimmerText>
                <span className="ml-2 text-foreground">全景课程</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                {chapters.length} 个章节、{totalMinutes} 分钟、{totalCommands} 条实战命令。
                按状态、关键词筛选你的当前进度。
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <LearnHud />
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-4 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold sm:text-2xl">
              🗺️ 学习地图
              <span className="text-sm font-normal text-muted-foreground">
                沿路径逐关闯过 9 个章节
              </span>
            </h2>
          </Reveal>
          <LearnPath />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 lg:px-8">
          <Reveal>
            <h2 className="mb-6 text-xl font-bold sm:text-2xl">📚 全部章节</h2>
            <ChapterFilter chapters={chapters} />
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  )
}
