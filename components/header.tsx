'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, Search, X, ChevronRight, Languages } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { AuthButton } from '@/components/auth-button'
import { cn } from '@/lib/utils'
import { siteConfig } from '@/lib/site-config'
import { siteConfigJa } from '@/lib/site-config-ja'

/**
 * Strip the /ja prefix from a pathname.
 *   /ja             -> /
 *   /ja/product     -> /product
 *   /ja/learn/3     -> /learn/3
 */
function stripJaPrefix(pathname: string): string {
  if (pathname === '/ja') return '/'
  if (pathname.startsWith('/ja/')) return pathname.slice(3)
  return pathname
}

function addJaPrefix(pathname: string): string {
  if (pathname === '/') return '/ja'
  return `/ja${pathname}`
}

export function Header() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isJa = pathname?.startsWith('/ja') ?? false
  const config = isJa ? siteConfigJa : siteConfig
  const labels = useMemo(
    () =>
      isJa
        ? {
            search: '検索',
            menuOpen: 'メニューを開く',
            menuClose: 'メニューを閉じる',
            ctaStart: '学習を始める',
            githubAria: 'GitHub',
            switchLang: '中文',
            switchLangAria: '言語を中国語に切り替える'
          }
        : {
            search: '搜索',
            menuOpen: '打开菜单',
            menuClose: '关闭菜单',
            ctaStart: '开始学习',
            githubAria: 'GitHub',
            switchLang: '日本語',
            switchLangAria: '切换到日语'
          },
    [isJa]
  )

  const switchLocaleHref = useMemo(() => {
    if (!pathname) return isJa ? '/' : '/ja'
    return isJa ? stripJaPrefix(pathname) : addJaPrefix(pathname)
  }, [pathname, isJa])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const triggerCommandPalette = () => {
    window.dispatchEvent(new CustomEvent('open-command-palette'))
  }

  const homeHref = isJa ? '/ja' : '/'
  const learnHref = isJa ? '/ja/learn' : '/learn'

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        scrolled
          ? 'border-b border-border/60 bg-background/85 backdrop-blur-xl shadow-sm'
          : 'border-b border-transparent bg-background/40 backdrop-blur'
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href={homeHref} className="group flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 items-center justify-center transition-transform group-hover:scale-105">
            <Image
              src="/lvjin-logo.png"
              alt={config.brand}
              width={40}
              height={40}
              className="h-10 w-10 object-contain"
              priority
            />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight">{config.brand}</span>
            <span className="hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:inline">
              LVJIN · Embodied AI
            </span>
          </div>
        </Link>

        <nav className="hidden items-center gap-0.5 md:flex">
          {config.nav.map((item) => {
            const active =
              item.href === homeHref
                ? pathname === homeHref
                : pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.label}
                {active && (
                  <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-primary to-accent" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={triggerCommandPalette}
            className="hidden h-9 w-22 gap-2 px-2.5 text-xs text-muted-foreground sm:inline-flex"
            aria-label={labels.search}
          >
            <Search className="h-3.5 w-3.5" />
            <span>{labels.search}</span>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden h-9 gap-1 px-2 text-xs text-muted-foreground sm:inline-flex"
            aria-label={labels.switchLangAria}
          >
            <Link href={switchLocaleHref} prefetch={false}>
              <Languages className="h-3.5 w-3.5" />
              <span>{labels.switchLang}</span>
            </Link>
          </Button>
          <ThemeToggle />
          <AuthButton />
          <Button asChild size="sm" className="glow-primary hidden lg:inline-flex">
            <Link href={learnHref}>
              {labels.ctaStart}
              <ChevronRight className="ml-0.5 h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? labels.menuClose : labels.menuOpen}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background/95 backdrop-blur-xl md:hidden">
          <nav className="mx-auto flex max-w-7xl flex-col gap-1 p-4">
            {[...config.nav, ...config.navExtra].map((item) => {
              const active =
                item.href === homeHref
                  ? pathname === homeHref
                  : pathname === item.href || pathname?.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                    active
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 opacity-40" />
                </Link>
              )
            })}
            <Link
              href={switchLocaleHref}
              prefetch={false}
              className="mt-1 flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary/50 hover:text-foreground"
            >
              <span className="flex items-center gap-2">
                <Languages className="h-4 w-4" />
                {labels.switchLang}
              </span>
              <ChevronRight className="h-4 w-4 opacity-40" />
            </Link>
            <div className="mt-3">
              <Button asChild size="sm" className="glow-primary w-full">
                <Link href={learnHref}>{labels.ctaStart}</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
