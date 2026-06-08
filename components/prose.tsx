'use client'

import { cn } from '@/lib/utils'
import { ChatMessageRenderer } from '@/components/chat-message-renderer'

interface ProseProps {
  /** Markdown source. Supports headings, bold, inline code, links, lists, tables, code blocks. */
  content: string
  className?: string
  /** When true, applies a slightly larger base size suited for chapter body copy. */
  size?: 'sm' | 'md' | 'inherit'
}

/**
 * Thin wrapper around ChatMessageRenderer for static prose (chapter intros,
 * walkthroughs, exercise answers, etc).
 *
 * We deliberately reuse the existing renderer instead of pulling in
 * react-markdown — the custom one already handles every block type we use
 * and is one source of truth for typography across the site.
 */
export function Prose({ content, className, size = 'md' }: ProseProps) {
  return (
    <div
      className={cn(
        'prose-chapter',
        size === 'inherit'
          ? ''
          : size === 'md'
            ? 'text-[15px] leading-7'
            : 'text-sm leading-relaxed',
        className
      )}
    >
      <ChatMessageRenderer content={content} />
    </div>
  )
}
