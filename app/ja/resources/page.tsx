'use client'

import { useMemo, useState } from 'react'
import {
  Book,
  Code,
  ExternalLink,
  FileText,
  Layers,
  PlayCircle,
  Search,
  Users,
  Wrench,
  X
} from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Reveal,
  ShimmerText,
  TiltCard
} from '@/components/effects'
import { HeroAura } from '@/components/hero-aura'
import { resourcesJa, resourceCategoriesJa } from '@/lib/resources-ja'
import { cn } from '@/lib/utils'

const categoryIcon: Record<string, React.ComponentType<{ className?: string }>> = {
  paper: FileText,
  docs: Book,
  video: PlayCircle,
  community: Users,
  hardware: Wrench,
  code: Code,
  all: Layers
}

const categoryStyle: Record<string, string> = {
  paper: 'text-purple-500',
  docs: 'text-blue-500',
  video: 'text-rose-500',
  community: 'text-emerald-500',
  hardware: 'text-orange-500',
  code: 'text-foreground'
}

export default function ResourcesPageJa() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return resourcesJa
      .filter((r) => (category === 'all' ? true : r.category === category))
      .filter((r) => {
        if (!q) return true
        return (
          r.title.toLowerCase().includes(q) ||
          r.description.toLowerCase().includes(q) ||
          r.tags?.some((t) => t.toLowerCase().includes(q))
        )
      })
  }, [query, category])

  return (
    <div className="min-h-screen">
      <Header />

      <main>
        <section className="relative overflow-hidden">
          <HeroAura />
          <div className="relative mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <Layers className="h-3.5 w-3.5" />
                リソース
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                <ShimmerText>厳選学習リソース</ShimmerText>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                後で何度も参照することになる論文・ドキュメント・コード・コミュニティをまとめて掲載しています。
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="space-y-3 p-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="リソース名、タグ、説明文から検索"
                  className="h-10 pl-9"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="クリア"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {resourceCategoriesJa.map((c) => {
                  const Icon = categoryIcon[c.id] ?? Layers
                  return (
                    <Button
                      key={c.id}
                      variant={category === c.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategory(c.id)}
                      className="h-8 gap-1.5 px-3 text-xs"
                    >
                      <Icon
                        className={cn(
                          'h-3 w-3',
                          c.id !== 'all' && categoryStyle[c.id]
                        )}
                      />
                      {c.label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <Card className="border-dashed border-border/60">
              <CardContent className="py-16 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 font-medium">該当するリソースがありません</p>
                <p className="mt-1 text-sm text-muted-foreground">キーワードを変えてお試しください</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((res, i) => {
                const Icon = categoryIcon[res.category] ?? Layers
                return (
                  <Reveal key={res.url} delay={Math.min(i * 40, 320)}>
                    <a
                      href={res.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block h-full"
                    >
                      <TiltCard spotlight maxTilt={5} className="h-full rounded-xl">
                        <Card className="h-full border-border/60 bg-card/60">
                          <CardContent className="flex h-full flex-col gap-3 p-5">
                            <div className="flex items-start justify-between">
                              <div
                                className={cn(
                                  'flex h-10 w-10 items-center justify-center rounded-xl bg-secondary',
                                  categoryStyle[res.category]
                                )}
                              >
                                <Icon className="h-5 w-5" />
                              </div>
                              <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                            </div>
                            <h3 className="font-semibold leading-snug">{res.title}</h3>
                            <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
                              {res.description}
                            </p>
                            {res.tags && res.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 pt-1">
                                {res.tags.map((t) => (
                                  <Badge
                                    key={t}
                                    variant="outline"
                                    className="border-border/60 text-[10px]"
                                  >
                                    {t}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </TiltCard>
                    </a>
                  </Reveal>
                )
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
