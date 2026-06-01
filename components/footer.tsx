'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bot, Languages, Sparkles } from 'lucide-react'
import { siteConfig } from '@/lib/site-config'
import { siteConfigJa } from '@/lib/site-config-ja'

function stripJaPrefix(pathname: string): string {
  if (pathname === '/ja') return '/'
  if (pathname.startsWith('/ja/')) return pathname.slice(3)
  return pathname
}

function addJaPrefix(pathname: string): string {
  if (pathname === '/') return '/ja'
  return `/ja${pathname}`
}

type LinkItem = { label: string; href: string; external?: boolean }

const sectionsZh: { title: string; links: LinkItem[] }[] = [
  {
    title: '社区',
    links: [{ label: '社区首页', href: '/community' }]
  },
  {
    title: '学习',
    links: [
      { label: '学习路径', href: '/learn' },
      { label: '术语表', href: '/glossary' },
      { label: '资源中心', href: '/resources' }
    ]
  },
  {
    title: '工具',
    links: [
      { label: '报错诊断', href: '/diagnose' },
      { label: 'AI 助手', href: '/assistant' }
    ]
  },
  {
    title: '了解',
    links: [
      { label: '关于项目', href: '/about' },
      { label: 'LeRobot', href: siteConfig.links.lerobot, external: true },
      { label: 'HuggingFace', href: siteConfig.links.huggingface, external: true }
    ]
  }
]

const sectionsJa: { title: string; links: LinkItem[] }[] = [
  {
    title: '学習',
    links: [
      { label: '学習パス', href: '/ja/learn' },
      { label: '用語集', href: '/ja/glossary' },
      { label: 'リソース', href: '/ja/resources' }
    ]
  },
  {
    title: 'ツール',
    links: [
      { label: 'トラブル診断', href: '/ja/diagnose' },
      { label: 'AI アシスタント', href: '/ja/assistant' }
    ]
  },
  {
    title: 'プロジェクト',
    links: [
      { label: 'プロジェクトについて', href: '/ja/about' },
      { label: 'LeRobot', href: siteConfigJa.links.lerobot, external: true },
      { label: 'HuggingFace', href: siteConfigJa.links.huggingface, external: true }
    ]
  }
]

export function Footer() {
  const pathname = usePathname()
  const isJa = pathname?.startsWith('/ja') ?? false
  const config = isJa ? siteConfigJa : siteConfig
  const sections = isJa ? sectionsJa : sectionsZh
  const homeHref = isJa ? '/ja' : '/'
  const updatedLabel = isJa ? '継続更新中' : '持续更新'
  const year = new Date().getFullYear()
  const copyright = isJa
    ? `© ${year} LVJIN ROBOTICS. All rights reserved.`
    : `© ${year} 绿晋科技 LVJIN ROBOTICS. 保留所有权利。`
  const switchLocaleHref = !pathname
    ? isJa ? '/' : '/ja'
    : isJa ? stripJaPrefix(pathname) : addJaPrefix(pathname)
  const switchLabel = isJa ? '中文' : '日本語'
  const builtWithLabel = isJa
    ? 'Built with Next.js · Tailwind · LeRobot'
    : 'Built with Next.js · Tailwind · LeRobot'

  return (
    <footer className="border-t border-border/40 bg-card/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <Link href={homeHref} className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 ring-1 ring-border/60">
                <Bot className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold">{config.brand}</p>
                <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                  Embodied AI Platform
                </p>
              </div>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {config.description}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-background/60 px-2.5 py-1 text-[11px] text-muted-foreground">
                <Sparkles className="h-3 w-3 text-primary" />
                {updatedLabel}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:grid-cols-3 lg:flex lg:gap-x-16">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {section.title}
              </p>
              <ul className="mt-4 space-y-2.5 text-sm">
                {section.links.map((link) =>
                  link.external ? (
                    <li key={link.label}>
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label} ↗
                      </a>
                    </li>
                  ) : (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>
          ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/40 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>{copyright}</p>
          <div className="flex items-center gap-4">
            <span className="font-mono uppercase tracking-[0.12em] text-muted-foreground/70">
              {builtWithLabel}
            </span>
            <Link
              href={switchLocaleHref}
              prefetch={false}
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              <Languages className="h-3 w-3" />
              {switchLabel}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
