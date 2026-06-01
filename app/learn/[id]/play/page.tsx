import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, BookOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LessonPlayer } from '@/components/lesson-player'
import { ContentGate } from '@/components/content-gate'
import { getLesson, lessons } from '@/lib/lessons'
import { chapters } from '@/lib/course-data'
import { siteConfig } from '@/lib/site-config'

interface PlayPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata(
  { params }: PlayPageProps
): Promise<Metadata> {
  const { id } = await params
  const chapter = chapters.find((c) => c.id === parseInt(id))
  if (!chapter) return { title: '互动课不存在' }
  return {
    title: `${chapter.title} · 互动课`,
    description: `通过互动方式快速掌握「${chapter.title}」—— ${chapter.description}`,
    openGraph: {
      title: `${chapter.title} 互动课 | ${siteConfig.shortName}`,
      description: chapter.description,
      type: 'article'
    }
  }
}

export function generateStaticParams() {
  return Object.keys(lessons).map((id) => ({ id }))
}

export default async function PlayPage({ params }: PlayPageProps) {
  const { id } = await params
  const chapterId = parseInt(id)
  const chapter = chapters.find((c) => c.id === chapterId)
  if (!chapter) notFound()

  const lesson = getLesson(chapterId)
  if (!lesson) {
    return <ComingSoon chapterId={chapterId} chapterTitle={chapter.title} />
  }

  return (
    <ContentGate chapterId={chapterId} what={`第 ${chapterId} 课`}>
      <LessonPlayer lesson={lesson} />
    </ContentGate>
  )
}

/**
 * Shown for chapters that have an article but don't yet have an interactive
 * lesson authored. Honest about the state, links to the article view.
 */
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
        <h1 className="text-3xl font-bold">第 {chapterId} 课的互动版本还在路上</h1>
        <p className="text-muted-foreground">
          「<span className="text-foreground font-medium">{chapterTitle}</span>
          」的互动课程正在制作中。在此之前，你可以先看本章的完整文档版。
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg" className="glow-primary h-12 px-6">
            <Link href={`/learn/${chapterId}`}>
              <BookOpen className="mr-1.5 h-4 w-4" />
              看完整文档
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="h-12 px-6">
            <Link href="/learn/1/play">
              先试第 1 课的互动版
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
