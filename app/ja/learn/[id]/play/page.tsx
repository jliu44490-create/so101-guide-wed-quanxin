import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LessonPlayer } from '@/components/lesson-player'
import { ContentGate } from '@/components/content-gate'
import { getLessonJa, lessonsJa } from '@/lib/lessons-ja'
import { chaptersJa } from '@/lib/course-data-ja'
import { siteConfigJa } from '@/lib/site-config-ja'

/**
 * 日本語のインタラクティブ講座（play モード）。中国語版 app/learn/[id]/play と対。
 * ContentGate（ペイウォール）適用：最初の 2 章は無料、それ以降は /ja/unlock でアンロック。
 */

interface PlayPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: PlayPageProps
): Promise<Metadata> {
  const { id } = await params
  const chapter = chaptersJa.find((c) => c.id === parseInt(id))
  if (!chapter) return { title: 'インタラクティブ講座が見つかりません' }
  return {
    title: `${chapter.title} · インタラクティブ講座`,
    description: `「${chapter.title}」をインタラクティブに素早く習得 —— ${chapter.description}`,
    openGraph: {
      title: `${chapter.title} インタラクティブ講座 | ${siteConfigJa.shortName}`,
      description: chapter.description,
      type: 'article',
      locale: 'ja_JP'
    },
    alternates: { canonical: `/ja/learn/${chapter.id}/play` }
  }
}

export function generateStaticParams() {
  return Object.keys(lessonsJa).map((id) => ({ id }))
}

export default async function PlayPageJa({ params }: PlayPageProps) {
  const { id } = await params
  const chapterId = parseInt(id)
  const chapter = chaptersJa.find((c) => c.id === chapterId)
  if (!chapter) notFound()

  const lesson = getLessonJa(chapterId)
  if (!lesson) {
    return <ComingSoon chapterId={chapterId} chapterTitle={chapter.title} />
  }

  return (
    <ContentGate chapterId={chapterId} what={`第 ${chapterId} 課`}>
      <LessonPlayer lesson={lesson} />
    </ContentGate>
  )
}

function ComingSoon({
  chapterId,
  chapterTitle
}: {
  chapterId: number
  chapterTitle: string
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md space-y-6 text-center">
        <div className="text-7xl">🚧</div>
        <h1 className="text-3xl font-bold">第 {chapterId} 課のインタラクティブ版は準備中</h1>
        <p className="text-muted-foreground">
          「<span className="text-foreground font-medium">{chapterTitle}</span>
          」のインタラクティブ講座は制作中です。それまでは本章の完全なドキュメント版をご覧ください。
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="glow-primary h-12 px-6">
            <Link href={`/ja/learn/${chapterId}`}>
              <BookOpen className="mr-1.5 h-4 w-4" />
              ドキュメントを見る
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6">
            <Link href="/ja/learn/1/play">
              第 1 課のインタラクティブ版を試す
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
