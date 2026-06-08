'use client'

import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface ChatMessageRendererProps {
  content: string
}

interface Block {
  type: 'code' | 'text'
  content: string
  language?: string
}

function parseBlocks(content: string): Block[] {
  const blocks: Block[] = []
  const lines = content.split('\n')
  let buffer: string[] = []
  let inCode = false
  let language = 'bash'

  const flushText = () => {
    if (buffer.length === 0) return
    blocks.push({ type: 'text', content: buffer.join('\n') })
    buffer = []
  }

  const flushCode = () => {
    if (buffer.length === 0) return
    blocks.push({ type: 'code', content: buffer.join('\n'), language })
    buffer = []
  }

  for (const line of lines) {
    if (line.trimStart().startsWith('```')) {
      if (inCode) {
        flushCode()
        inCode = false
      } else {
        flushText()
        language = line.trim().slice(3).trim() || 'bash'
        inCode = true
      }
      continue
    }
    buffer.push(line)
  }

  if (inCode) flushCode()
  else flushText()

  return blocks
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let key = 0

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(
        <strong key={key++} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>
      )
    } else if (token.startsWith('`')) {
      parts.push(
        <code
          key={key++}
          className="rounded bg-secondary/60 px-1.5 py-0.5 font-mono text-[0.85em]"
        >
          {token.slice(1, -1)}
        </code>
      )
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)
      if (linkMatch) {
        parts.push(
          <a
            key={key++}
            href={linkMatch[2]}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline-offset-2 hover:underline"
          >
            {linkMatch[1]}
          </a>
        )
      } else {
        parts.push(token)
      }
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return parts
}

function renderText(text: string): React.ReactNode {
  const lines = text.split('\n')
  const out: React.ReactNode[] = []
  let listItems: React.ReactNode[] = []
  let listType: 'ul' | 'ol' | null = null
  let inTable = false
  let tableRows: string[][] = []

  const flushList = (key: number) => {
    if (listItems.length === 0) return
    if (listType === 'ul') {
      out.push(
        <ul key={`ul-${key}`} className="my-1 list-disc space-y-0.5 pl-5">
          {listItems}
        </ul>
      )
    } else if (listType === 'ol') {
      out.push(
        <ol key={`ol-${key}`} className="my-1 list-decimal space-y-0.5 pl-5">
          {listItems}
        </ol>
      )
    }
    listItems = []
    listType = null
  }

  const flushTable = (key: number) => {
    if (!inTable || tableRows.length === 0) {
      inTable = false
      tableRows = []
      return
    }
    const [head, , ...rest] = tableRows
    out.push(
      <div key={`tbl-${key}`} className="my-2 overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="border-b border-border/60">
            <tr>
              {head.map((cell, i) => (
                <th key={i} className="px-2 py-1 text-left font-semibold">
                  {renderInline(cell.trim())}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rest.map((row, i) => (
              <tr key={i} className="border-b border-border/30 last:border-0">
                {row.map((cell, j) => (
                  <td key={j} className="px-2 py-1">
                    {renderInline(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
    inTable = false
    tableRows = []
  }

  lines.forEach((line, i) => {
    if (line.includes('|') && line.trim().startsWith('|')) {
      flushList(i)
      const cells = line.split('|').slice(1, -1)
      if (cells.length > 0) {
        inTable = true
        tableRows.push(cells)
        return
      }
    } else if (inTable) {
      flushTable(i)
    }

    if (/^#{1,4}\s/.test(line)) {
      flushList(i)
      const level = line.match(/^(#{1,4})/)?.[0].length ?? 3
      const text = line.replace(/^#{1,4}\s/, '')
      const Tag = (`h${Math.min(level + 2, 6)}`) as keyof React.JSX.IntrinsicElements
      out.push(
        <Tag key={i} className="mt-3 font-semibold first:mt-0">
          {renderInline(text)}
        </Tag>
      )
      return
    }

    const bullet = line.match(/^(\s*)([-*•])\s+(.*)$/)
    const numbered = line.match(/^(\s*)(\d+)\.\s+(.*)$/)
    if (bullet) {
      if (listType !== 'ul') flushList(i)
      listType = 'ul'
      listItems.push(<li key={i}>{renderInline(bullet[3])}</li>)
      return
    }
    if (numbered) {
      if (listType !== 'ol') flushList(i)
      listType = 'ol'
      listItems.push(<li key={i}>{renderInline(numbered[3])}</li>)
      return
    }

    flushList(i)

    if (line.trim()) {
      out.push(
        <p key={i} className="my-1 leading-relaxed">
          {renderInline(line)}
        </p>
      )
    } else {
      out.push(<div key={i} className="h-2" />)
    }
  })

  flushList(9999)
  flushTable(10000)

  return out
}

function CodeBubble({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('已复制', { duration: 1200 })
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error('复制失败')
    }
  }

  return (
    <div className="my-2 overflow-hidden rounded-lg border border-white/10 bg-[oklch(0.12_0.012_270)]">
      <div className="flex items-center justify-between border-b border-white/5 px-3 py-1.5">
        <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">
          {language || 'bash'}
        </span>
        <button
          type="button"
          onClick={copy}
          aria-label="复制"
          className="rounded p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
        >
          {copied ? <Check className="h-3 w-3 text-green-400" /> : <Copy className="h-3 w-3" />}
        </button>
      </div>
      <pre className="overflow-x-auto p-3 text-[12.5px] leading-relaxed text-white/90">
        <code className="font-mono">{code}</code>
      </pre>
    </div>
  )
}

export function ChatMessageRenderer({ content }: ChatMessageRendererProps) {
  const blocks = parseBlocks(content)
  return (
    <div className={cn('chat-prose text-sm')}>
      {blocks.map((block, i) =>
        block.type === 'code' ? (
          <CodeBubble key={i} code={block.content} language={block.language} />
        ) : (
          <div key={i}>{renderText(block.content)}</div>
        )
      )}
    </div>
  )
}
