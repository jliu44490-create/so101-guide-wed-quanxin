import type { Metadata } from 'next'
import { GraduationCap } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { ChapterFilter } from '@/components/chapter-filter'
import { LearnStats } from '@/components/learn-stats'
import {
  AuroraBackground,
  FloatingOrbs,
  Reveal,
  ShimmerText
} from '@/components/effects'
import { chaptersJa } from '@/lib/course-data-ja'

export const metadata: Metadata = {
  title: '学習パス',
  description:
    'SO101 模倣学習の体系的なカリキュラム。概念、ハードウェア、環境構築、ACT 学習、実機デプロイまで 9 章で完結します。',
  alternates: {
    canonical: '/ja/learn',
    languages: {
      'zh-CN': '/learn',
      'ja-JP': '/ja/learn'
    }
  }
}

const totalMinutes = chaptersJa.reduce((acc, c) => {
  const m = parseInt(c.duration)
  return acc + (isNaN(m) ? 0 : m)
}, 0)

const totalCommands = chaptersJa.reduce((acc, c) => acc + c.commands.length, 0)

export default function LearnPageJa() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="relative overflow-hidden border-b border-border/40">
          <AuroraBackground intensity="subtle" />
          <FloatingOrbs count={3} />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5" />
                学習パス
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                <ShimmerText>SO101 模倣学習</ShimmerText>
                <span className="ml-2 text-foreground">全章カリキュラム</span>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                {chaptersJa.length} 章、{totalMinutes} 分、{totalCommands} 件の実践コマンド。
                状態やキーワードで現在の進捗をフィルタできます。
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <LearnStats />
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <Reveal>
            <ChapterFilter chapters={chaptersJa} />
          </Reveal>
        </section>
      </main>

      <Footer />
    </div>
  )
}
