'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
import { siteConfig } from '@/lib/site-config'

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

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
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="搜索章节、错误、页面…" />
      <CommandList className="max-h-[420px]">
        <CommandEmpty>
          <div className="py-6 text-center text-sm text-muted-foreground">
            没有找到匹配项 · 试试别的关键词
          </div>
        </CommandEmpty>

        <CommandGroup heading="导航">
          {[...siteConfig.nav, ...siteConfig.navExtra].map((item) => {
            const Icon = navIcons[item.href] ?? BookOpen
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

        <CommandGroup heading="章节">
          {chapters.map((chapter) => (
            <CommandItem
              key={chapter.id}
              value={`chapter-${chapter.title}-${chapter.titleEn}`}
              onSelect={() => go(`/learn/${chapter.id}`)}
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

        <CommandGroup heading="常见错误">
          {chapters
            .flatMap((c) => c.errors.map((e) => ({ chapter: c, error: e })))
            .slice(0, 6)
            .map(({ chapter, error }, i) => (
              <CommandItem
                key={`${chapter.id}-${i}`}
                value={`error-${error.error}`}
                onSelect={() => go(`/diagnose?q=${encodeURIComponent(error.error)}`)}
              >
                <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                <span className="font-mono text-sm">{error.error}</span>
              </CommandItem>
            ))}
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="操作">
          <CommandItem
            value="action-ai-assistant"
            onSelect={() => go('/assistant')}
          >
            <Sparkles className="mr-2 h-4 w-4 text-primary" />
            <span>询问 AI 助手</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
