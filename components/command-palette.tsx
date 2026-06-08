'use client'

import { useCallback, useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import {
  AlertTriangle,
  BookOpen,
  Bot,
  Home,
  Info,
  LayoutGrid,
  Layers,
  Library,
  Sparkles,
  Zap
} from 'lucide-react'
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator
} from '@/components/ui/command'
import { chapters } from '@/lib/course-data'
import { chaptersJa } from '@/lib/course-data-ja'
import { siteConfig } from '@/lib/site-config'
import { siteConfigJa } from '@/lib/site-config-ja'

const commandLabels = {
  zh: {
    title: '命令面板',
    description: '搜索章节、错误和站内页面。',
    placeholder: '搜索章节、错误、页面…',
    empty: '没有找到匹配项 · 试试别的关键词',
    nav: '导航',
    chapters: '章节',
    errors: '常见错误',
    actions: '操作',
    askAssistant: '询问 AI 助手'
  },
  ja: {
    title: 'コマンドパレット',
    description: '章、エラー、サイト内ページを検索します。',
    placeholder: '章、エラー、ページを検索…',
    empty: '一致する項目がありません · 別のキーワードを試してください',
    nav: 'ナビゲーション',
    chapters: '章',
    errors: 'よくあるエラー',
    actions: '操作',
    askAssistant: 'AI アシスタントに質問'
  }
} as const

export function CommandPalette() {
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const isJa = pathname?.startsWith('/ja') ?? false
  const config = isJa ? siteConfigJa : siteConfig
  const chapterList = isJa ? chaptersJa : chapters
  const t = isJa ? commandLabels.ja : commandLabels.zh

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isCmdK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k'
      const isSlash = e.key === '/' && !['INPUT', 'TEXTAREA'].includes(
        (e.target as HTMLElement)?.tagName ?? ''
      )
      if (isCmdK || isSlash) {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    const onOpen = () => setOpen(true)
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('open-command-palette', onOpen as EventListener)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('open-command-palette', onOpen as EventListener)
    }
  }, [])

  const go = useCallback(
    (href: string, external = false) => {
      setOpen(false)
      if (external) {
        window.open(href, '_blank', 'noopener,noreferrer')
      } else {
        router.push(href)
      }
    },
    [router]
  )

  const navIcons: Record<string, React.ComponentType<{ className?: string }>> = {
    '/': Home,
    '/learn': LayoutGrid,
    '/diagnose': Zap,
    '/assistant': Bot,
    '/glossary': Library,
    '/resources': Layers,
    '/about': Info
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title={t.title}
      description={t.description}
    >
      <CommandInput placeholder={t.placeholder} />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>
          <div className="py-6 text-center text-sm text-muted-foreground">
            {t.empty}
          </div>
        </CommandEmpty>

        <CommandGroup heading={t.nav}>
          {[...config.nav, ...config.navExtra].map((item) => {
            const normalizedHref = item.href === '/ja' ? '/' : item.href.replace(/^\/ja/, '')
            const Icon = navIcons[normalizedHref] ?? BookOpen
            return (
              <CommandItem
                key={item.href}
                value={`nav-${item.label}-${item.href}`}
                onSelect={() => go(item.href)}
              >
                <Icon className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{item.label}</span>
                <span className="ml-auto font-mono text-xs text-muted-foreground/70">
                  {item.href}
                </span>
              </CommandItem>
            )
          })}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t.chapters}>
          {chapterList.map((chapter) => (
            <CommandItem
              key={chapter.id}
              value={`chapter-${chapter.title}-${chapter.titleEn}`}
              onSelect={() => go(isJa ? `/ja/learn/${chapter.id}` : `/learn/${chapter.id}`)}
            >
              <BookOpen className="mr-2 h-4 w-4 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm">
                  <span className="text-muted-foreground">CH {chapter.id}</span>{' '}
                  {chapter.title}
                </span>
                <span className="text-[11px] text-muted-foreground/80">
                  {chapter.titleEn} · {chapter.duration}
                </span>
              </div>
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t.errors}>
          {chapterList
            .flatMap((c) => c.errors.map((e) => ({ chapter: c, error: e })))
            .slice(0, 6)
            .map(({ chapter, error }, i) => (
              <CommandItem
                key={`${chapter.id}-${i}`}
                value={`error-${error.error}`}
                onSelect={() =>
                  go(`${isJa ? '/ja' : ''}/diagnose?q=${encodeURIComponent(error.error)}`)
                }
              >
                <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                <span className="font-mono text-sm">{error.error}</span>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading={t.actions}>
          <CommandItem
            value="action-ai-assistant"
            onSelect={() => go(isJa ? '/ja/assistant' : '/assistant')}
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span>{t.askAssistant}</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
