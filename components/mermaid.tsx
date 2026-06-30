'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface MermaidProps {
  source: string
  caption?: string
  className?: string
}

/**
 * Client-only Mermaid diagram renderer.
 *
 * - Dynamically imports `mermaid` on mount so it never inflates the initial JS
 *   bundle. SSR/SSG produce a source-block fallback that's already readable
 *   for crawlers and no-JS users.
 * - Validates the source with `mermaid.parse` BEFORE calling `render`. In v11
 *   the renderer happily emits a "Syntax error in text" SVG when the source
 *   is broken — we'd rather catch that and show the raw source than embed a
 *   confusing bomb icon.
 * - Re-renders on theme change but waits for `resolvedTheme` to be defined,
 *   so the effect only fires once after hydration instead of twice
 *   (undefined → dark) which previously caused duplicate render attempts.
 * - If the `mermaid` package isn't installed, we surface the install hint
 *   instead of crashing the page.
 */
export function Mermaid({ source, caption, className }: MermaidProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const reactId = useId()
  const idRef = useRef(`mmd-${reactId.replace(/:/g, '')}`)
  const { resolvedTheme } = useTheme()
  const isJa = usePathname()?.startsWith('/ja') ?? false
  const [error, setError] = useState<string | null>(null)
  const [rendered, setRendered] = useState(false)

  useEffect(() => {
    // Wait for the theme to resolve (undefined on first render → dark/light on
    // hydration). Without this guard the effect would run twice and try to
    // render the same diagram twice with potentially different themes.
    if (!resolvedTheme) return

    let cancelled = false
    const node = containerRef.current
    if (!node) return

    ;(async () => {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({
          startOnLoad: false,
          theme: resolvedTheme === 'dark' ? 'dark' : 'default',
          fontFamily: 'var(--font-geist), system-ui, sans-serif',
          securityLevel: 'loose'
        })

        // Validate first — parse() throws on syntax errors, render() silently
        // produces an error-SVG that's worse than no diagram at all.
        await mermaid.parse(source)

        const { svg } = await mermaid.render(idRef.current, source)
        if (!cancelled && node) {
          node.innerHTML = svg
          setRendered(true)
          setError(null)
        }
      } catch (e) {
        if (!cancelled) {
          setRendered(false)
          setError(
            e instanceof Error
              ? e.message.split('\n')[0]
              : isJa
                ? 'Mermaid のレンダリングに失敗しました。図の構文を確認してください。'
                : 'Mermaid 渲染失败。请检查图源语法。'
          )
        }
      }
    })()

    return () => {
      cancelled = true
    }
  }, [source, resolvedTheme])

  return (
    <figure
      className={cn(
        'my-4 overflow-hidden rounded-xl border border-border/60 bg-card/40',
        className
      )}
    >
      <div className="overflow-x-auto px-4 py-5">
        {error ? (
          <pre className="font-mono text-xs text-muted-foreground whitespace-pre">
            {source}
          </pre>
        ) : (
          <>
            {!rendered && (
              <pre className="font-mono text-xs text-muted-foreground opacity-60 whitespace-pre">
                {source}
              </pre>
            )}
            <div
              ref={containerRef}
              className={cn(
                'mermaid-host flex items-center justify-center',
                rendered ? '' : 'hidden'
              )}
            />
          </>
        )}
      </div>
      {caption && (
        <figcaption className="border-t border-border/40 bg-background/40 px-4 py-2 text-xs text-muted-foreground">
          {caption}
        </figcaption>
      )}
      {error && (
        <p className="border-t border-yellow-500/30 bg-yellow-500/5 px-4 py-2 text-[10px] text-yellow-600 dark:text-yellow-400">
          {error}
        </p>
      )}
    </figure>
  )
}
