'use client'

import { Check, Copy, Terminal as TerminalIcon } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  code: string
  language?: string
  description?: string
  filename?: string
  className?: string
  showLineNumbers?: boolean
}

const promptTokens = ['$', '#', '>']

function highlightLine(line: string) {
  if (!line.trim()) return <span>&nbsp;</span>

  const trimmed = line.trimStart()
  const indent = line.slice(0, line.length - trimmed.length)
  const firstChar = trimmed[0]
  const isComment = trimmed.startsWith('#') && !trimmed.match(/^#!\//)

  if (isComment) {
    return (
      <span>
        {indent}
        <span className="text-muted-foreground">{trimmed}</span>
      </span>
    )
  }

  if (promptTokens.includes(firstChar) && trimmed[1] === ' ') {
    return (
      <span>
        {indent}
        <span className="text-primary">{firstChar}</span>
        <span>{trimmed.slice(1)}</span>
      </span>
    )
  }

  return <span>{line}</span>
}

export function CodeBlock({
  code,
  language = 'bash',
  description,
  filename,
  className,
  showLineNumbers = false
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('已复制到剪贴板', { duration: 1500 })
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('复制失败，请手动选择')
    }
  }

  const lines = code.split('\n')

  return (
    <div className={cn('group relative min-w-0', className)}>
      {description && (
        <p className="mb-2 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="relative min-w-0 overflow-hidden rounded-xl border border-border/70 bg-[oklch(0.12_0.012_270)] shadow-lg shadow-black/5">
        <div className="flex items-center justify-between border-b border-white/5 bg-black/30 px-3.5 py-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
            </div>
            <div className="ml-2 flex items-center gap-1.5 text-xs text-white/60">
              <TerminalIcon className="h-3 w-3" />
              <span className="font-mono uppercase tracking-wide">
                {filename ?? language}
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-white/60 hover:bg-white/10 hover:text-white"
            onClick={copyToClipboard}
            aria-label="复制代码"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-green-400" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <pre className="max-w-full overflow-x-auto p-4 text-sm leading-relaxed text-white/85">
          <code className="font-mono">
            {lines.map((line, i) => (
              <div key={i} className="flex">
                {showLineNumbers && (
                  <span className="w-8 shrink-0 select-none text-right text-white/30">
                    {i + 1}
                  </span>
                )}
                <span className={cn('whitespace-pre', showLineNumbers && 'pl-4')}>
                  {highlightLine(line)}
                </span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
