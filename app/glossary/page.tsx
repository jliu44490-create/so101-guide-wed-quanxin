'use client'

import { useMemo, useState } from 'react'
import { Library, Search, X } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  AuroraBackground,
  FloatingOrbs,
  Reveal,
  ShimmerText,
  TiltCard
} from '@/components/effects'
import { glossary, glossaryCategories } from '@/lib/glossary'
import { cn } from '@/lib/utils'

const categoryStyle: Record<string, string> = {
  concept: 'bg-primary/10 text-primary border-primary/30',
  algorithm: 'bg-accent/10 text-accent border-accent/30',
  hardware: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
  framework: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
  data: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30'
}

export default function GlossaryPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<string>('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return glossary
      .filter((g) => (category === 'all' ? true : g.category === category))
      .filter((g) => {
        if (!q) return true
        return (
          g.term.toLowerCase().includes(q) ||
          g.termEn?.toLowerCase().includes(q) ||
          g.definition.toLowerCase().includes(q)
        )
      })
  }, [query, category])

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
                <Library className="h-3.5 w-3.5" />
                术语表
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                <ShimmerText>概念词典</ShimmerText>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                模仿学习与 LeRobot 工作流里常见的 {glossary.length} 个术语，可按类别检索。
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
                  placeholder="搜索术语、英文名或定义"
                  className="h-10 pl-9"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="清空"
                    onClick={() => setQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {glossaryCategories.map((c) => (
                  <Button
                    key={c.id}
                    variant={category === c.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCategory(c.id)}
                    className="h-8 px-3 text-xs"
                  >
                    {c.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          {filtered.length === 0 ? (
            <Card className="border-dashed border-border/60">
              <CardContent className="py-16 text-center">
                <Search className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-3 font-medium">没有匹配的术语</p>
                <p className="mt-1 text-sm text-muted-foreground">换个关键词试试</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((term, i) => (
                <Reveal key={term.term} delay={Math.min(i * 30, 300)}>
                  <TiltCard spotlight maxTilt={4} className="h-full">
                <Card
                  id={term.term}
                  className="h-full border-border/60 bg-card/60"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-base font-semibold">{term.term}</h3>
                        {term.termEn && (
                          <p className="mt-0.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                            {term.termEn}
                          </p>
                        )}
                      </div>
                      <Badge
                        variant="outline"
                        className={cn('text-[10px]', categoryStyle[term.category])}
                      >
                        {glossaryCategories.find((c) => c.id === term.category)?.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {term.definition}
                    </p>
                    {term.related && term.related.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        <span className="text-[11px] text-muted-foreground/80">相关：</span>
                        {term.related.map((r) => {
                          const exists = glossary.find((g) => g.term === r)
                          return exists ? (
                            <a
                              key={r}
                              href={`#${r}`}
                              className="rounded-full border border-border/60 bg-background/60 px-2 py-0.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
                            >
                              {r}
                            </a>
                          ) : (
                            <span
                              key={r}
                              className="rounded-full border border-border/40 bg-background/30 px-2 py-0.5 text-[11px] text-muted-foreground/60"
                            >
                              {r}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
                  </TiltCard>
                </Reveal>
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  )
}
