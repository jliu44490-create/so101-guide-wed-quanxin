'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Cpu,
  Database,
  PackageOpen,
  Rocket,
  Search,
  Sparkles,
  Terminal,
  Wrench,
  X,
  Zap
} from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { RouteLoadingShell } from '@/components/route-loading-shell'
import { CodeBlock } from '@/components/code-block'
import {
  AuroraBackground,
  FloatingOrbs,
  Reveal,
  ShimmerText
} from '@/components/effects'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { errorDatabaseJa } from '@/lib/course-data-ja'
import type { DiagnosticCategory, DiagnosticResult } from '@/lib/types'
import { cn } from '@/lib/utils'

const categoryConfig: Record<
  DiagnosticCategory,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  environment: { label: '環境', icon: PackageOpen, color: 'text-blue-500' },
  hardware: { label: 'ハードウェア', icon: Cpu, color: 'text-orange-500' },
  data: { label: 'データ', icon: Database, color: 'text-emerald-500' },
  training: { label: '学習', icon: Sparkles, color: 'text-purple-500' },
  inference: { label: '推論', icon: Rocket, color: 'text-rose-500' },
  misc: { label: 'その他', icon: Wrench, color: 'text-muted-foreground' }
}

type EntryWithKey = { key: string; result: DiagnosticResult }

const errorEntries: EntryWithKey[] = Object.entries(errorDatabaseJa).map(
  ([key, result]) => ({ key, result })
)

export default function DiagnosePageJa() {
  return (
    <Suspense fallback={<RouteLoadingShell label="診断ツールを読み込んでいます..." />}>
      <DiagnoseContent />
    </Suspense>
  )
}

function DiagnoseContent() {
  const searchParams = useSearchParams()
  const initialQuery = searchParams.get('q') ?? ''
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<DiagnosticCategory | 'all'>('all')
  const [activeKey, setActiveKey] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return errorEntries.filter(({ key, result }) => {
      if (category !== 'all' && result.category !== category) return false
      if (!q) return true
      return (
        key.includes(q) ||
        result.error.toLowerCase().includes(q) ||
        result.cause.toLowerCase().includes(q) ||
        result.solution.toLowerCase().includes(q)
      )
    })
  }, [query, category])

  const active = useMemo(() => {
    if (activeKey) return errorEntries.find((e) => e.key === activeKey)
    if (filtered.length === 1) return filtered[0]
    if (query.trim().length > 2 && filtered.length > 0) return filtered[0]
    return null
  }, [activeKey, filtered, query])

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery)
  }, [initialQuery])

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: errorEntries.length }
    for (const entry of errorEntries) {
      const cat = entry.result.category ?? 'misc'
      map[cat] = (map[cat] ?? 0) + 1
    }
    return map
  }, [])

  const cats: (DiagnosticCategory | 'all')[] = [
    'all',
    'environment',
    'hardware',
    'data',
    'training',
    'inference',
    'misc'
  ]

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
                <Zap className="h-3.5 w-3.5" />
                トラブル診断
              </div>
            </Reveal>
            <Reveal delay={100}>
              <h1 className="mt-3 text-4xl font-bold sm:text-5xl">
                <ShimmerText>エラーを道標に変える</ShimmerText>
              </h1>
            </Reveal>
            <Reveal delay={200}>
              <p className="mt-3 max-w-3xl text-muted-foreground">
                エラーメッセージから根本原因、解決策、次の一手まで素早く検索できます。LeRobot / ACT のよくあるエラーを{' '}
                <span className="font-medium text-foreground">{errorEntries.length}</span> 件収録しています。
              </p>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Card className="border-border/60 bg-card/60">
            <CardContent className="space-y-4 p-5">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value)
                    setActiveKey(null)
                  }}
                  placeholder='エラーキーワードを入力 (例: "CUDA out of memory" や "permission denied")'
                  className="h-11 pl-9"
                />
                {query && (
                  <button
                    type="button"
                    aria-label="クリア"
                    onClick={() => {
                      setQuery('')
                      setActiveKey(null)
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-secondary"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cats.map((c) => {
                  const cfg = c === 'all' ? null : categoryConfig[c as DiagnosticCategory]
                  const label = c === 'all' ? 'すべて' : cfg!.label
                  return (
                    <Button
                      key={c}
                      variant={category === c ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setCategory(c)}
                      className="h-8 gap-1.5 px-2.5 text-xs"
                    >
                      {cfg && <cfg.icon className={cn('h-3 w-3', cfg.color)} />}
                      {label}
                      <Badge
                        variant="outline"
                        className={cn(
                          'ml-0.5 h-4 border-border/50 bg-background/60 px-1 font-mono text-[10px]',
                          category === c &&
                            'border-primary-foreground/30 bg-primary-foreground/10 text-primary-foreground'
                        )}
                      >
                        {counts[c] ?? 0}
                      </Badge>
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="mt-8 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
            <div className="min-w-0 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                該当するエラー ({filtered.length})
              </p>
              <div className="grid gap-2">
                {filtered.length === 0 ? (
                  <Card className="border-dashed border-border/60">
                    <CardContent className="flex flex-col items-center py-10 text-center">
                      <Search className="h-8 w-8 text-muted-foreground/50" />
                      <p className="mt-3 font-medium">該当するエラーがありません</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        キーワードを変えるか、{' '}
                        <Link href="/ja/assistant" className="text-primary hover:underline">
                          AI アシスタントに質問
                        </Link>
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  filtered.map(({ key, result }) => {
                    const cfg = categoryConfig[result.category ?? 'misc']
                    const isActive = active?.key === key
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveKey(key)}
                        className={cn(
                          'group flex w-full min-w-0 items-start gap-3 rounded-xl border bg-card/60 p-3.5 text-left transition-all',
                          isActive
                            ? 'border-primary/40 bg-primary/5 shadow-md shadow-primary/5'
                            : 'border-border/60 hover:border-primary/30 hover:bg-card'
                        )}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                          <cfg.icon className={cn('h-4 w-4', cfg.color)} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-mono text-sm font-medium">
                            {result.error}
                          </p>
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {result.cause}
                          </p>
                        </div>
                        <ChevronRight
                          className={cn(
                            'mt-1 h-4 w-4 shrink-0 transition-transform',
                            isActive ? 'text-primary' : 'text-muted-foreground/40'
                          )}
                        />
                      </button>
                    )
                  })
                )}
              </div>
            </div>

            <div className="min-w-0 space-y-4">
              {active ? (
                <ErrorDetail entry={active} onSelect={(k) => setActiveKey(k)} />
              ) : (
                <Card className="border-dashed border-border/60 bg-card/30">
                  <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-accent/15 ring-1 ring-border/60">
                      <Terminal className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-medium">エラーを選択して詳細を表示</p>
                    <p className="mt-1 max-w-sm text-xs text-muted-foreground">
                      左のリストから任意のエラーを選ぶと、原因・対処・推奨コマンド・次の一手が表示されます。
                    </p>
                  </CardContent>
                </Card>
              )}

              <Card className="border-border/60 bg-card/30">
                <CardContent className="flex flex-col items-start gap-3 p-5 sm:flex-row">
                  <Bot className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="font-medium">該当が無い場合は AI に相談</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      完整なエラースタックや実行コマンドを添えて AI アシスタントに送ると精度が上がります。
                    </p>
                  </div>
                  <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                    <Link href={query ? `/ja/assistant?q=${encodeURIComponent(query)}` : '/ja/assistant'}>
                      質問する
                      <ArrowRight className="ml-1 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

function ErrorDetail({
  entry,
  onSelect
}: {
  entry: EntryWithKey
  onSelect: (key: string) => void
}) {
  const cfg = categoryConfig[entry.result.category ?? 'misc']
  const { result } = entry
  return (
    <div className="min-w-0 space-y-4">
      <Card className="border-destructive/30">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-border/60">
                  <cfg.icon className={cn('mr-1 h-3 w-3', cfg.color)} />
                  {cfg.label}
                </Badge>
              </div>
              <CardTitle className="mt-1 text-base">エラーメッセージ</CardTitle>
              <CardDescription className="mt-1 break-words font-mono text-sm text-destructive">
                {result.error}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Search className="h-4 w-4 text-primary" />
            根本原因
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {result.cause}
          </p>
        </CardContent>
      </Card>

      <Card className="border-success/30">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <CheckCircle2 className="h-4 w-4 text-[var(--color-success)]" />
            対処方法
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {result.solution}
          </p>
          {result.command && <CodeBlock code={result.command} description="推奨コマンド" />}
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="flex items-start gap-3 p-5">
          <ArrowRight className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0">
            <p className="font-medium">次の一手</p>
            <p className="mt-1 text-sm text-muted-foreground">{result.nextStep}</p>
          </div>
        </CardContent>
      </Card>

      {result.related && result.related.length > 0 && (
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">関連するエラー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {result.related.map((k) => {
                const exists = Boolean(errorDatabaseJa[k])
                return (
                  <Badge
                    key={k}
                    variant="outline"
                    onClick={() => exists && onSelect(k)}
                    className={cn(
                      'border-border/60',
                      exists ? 'cursor-pointer hover:bg-secondary' : 'opacity-50'
                    )}
                  >
                    {k}
                  </Badge>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
