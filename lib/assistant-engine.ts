/**
 * AI 助手回复引擎
 * --------------------------------------------------
 * 在知识库搜索之上加一层：
 *   1. 意图分类（问候 / 概念 / 步骤 / 排错 / 对比 / 资源）
 *   2. 对话上下文跟踪（处理 "再讲一下"、"这个怎么" 这类承接）
 *   3. 按意图组合回复（拼合 top-N 命中、添加引用链接）
 */

import { errorDatabase, chapters } from './course-data'
import {
  knowledgeBase,
  search,
  tokenize,
  type KBItem,
  type SearchResult
} from './knowledge-base'

// --------------------------------------------------
// 意图识别
// --------------------------------------------------

export type Intent =
  | 'greeting'
  | 'thanks'
  | 'concept' // 什么是 X / X 是什么 / 解释 X
  | 'compare' // X 和 Y 的区别
  | 'howto' // 如何 / 怎么做
  | 'troubleshoot' // 报错 / 出错
  | 'command' // 命令 / 怎么写
  | 'resource' // 论文 / 资源 / 链接
  | 'followup' // 继续 / 再说一下
  | 'general'

interface IntentMatch {
  intent: Intent
  matched: string[]
}

const intentPatterns: { intent: Intent; patterns: RegExp[] }[] = [
  {
    intent: 'greeting',
    patterns: [
      /^(?:你好|您好|hi|hello|hey|嗨|哈喽|早上好|下午好|晚上好)[!！。.\s]*$/i
    ]
  },
  {
    intent: 'thanks',
    patterns: [/^(?:谢谢|感谢|thank|thx|多谢)[!！。.\s]*$/i]
  },
  {
    intent: 'compare',
    patterns: [
      /(.{1,40})(?:和|与|vs|对比|比较)(.{1,40})(?:区别|不同|差别)/i,
      /(?:区别|不同|差别|对比)(?:是|有|在哪)/,
      /(.{1,30})\s+vs\s+(.{1,30})/i
    ]
  },
  {
    intent: 'troubleshoot',
    patterns: [
      /(?:报错|错误|出错|失败|崩溃|异常|bug|error|exception|fail|crash|traceback)/i,
      /(?:为什么|怎么会|怎么办).{0,20}(?:不行|失败|不能|无法|不对|错了)/,
      /(?:解决|fix|排查|定位)/i,
      /not found|denied|cannot|can\'t|missing|invalid|undefined/i,
      /CUDA|cuda|OOM|oom|内存|显存/
    ]
  },
  {
    intent: 'command',
    patterns: [
      /(?:命令|指令|脚本|script|command)(?:怎么写|怎么用|是什么|有哪些)?/,
      /(?:怎么|如何).{0,20}(?:运行|启动|跑|执行|训练|采集|推理)/,
      /^(?:python|pip|conda|git|sudo|wandb|cd|ls|mkdir)/i
    ]
  },
  {
    intent: 'howto',
    patterns: [
      /(?:怎么|如何|怎样|怎么样|how to|how do i)/i,
      /(?:步骤|流程|方法|过程)/
    ]
  },
  {
    intent: 'concept',
    patterns: [
      /(?:什么是|是什么|啥是|介绍一下|解释一下|讲一讲|讲讲|定义)(.{1,30})/,
      /(.{1,30})(?:是|指)(?:什么|啥)/,
      /^(?:what is|define)/i
    ]
  },
  {
    intent: 'resource',
    patterns: [
      /(?:论文|paper|文献)/i,
      /(?:资源|教程|文档|视频|社区|参考资料|reference)/,
      /(?:在哪里|哪里有|where can i find)/
    ]
  },
  {
    intent: 'followup',
    patterns: [
      /^(?:再(?:说|讲|多说|多讲)一(?:点|些|下)|继续|然后呢|接下来|更详细)/,
      /^(?:还有(?:呢|没|什么)|其他|别的)/,
      /^(?:那|这个).{0,8}(?:呢|怎么|为什么)/
    ]
  }
]

export function classifyIntent(query: string): IntentMatch {
  const trimmed = query.trim()
  if (!trimmed) return { intent: 'general', matched: [] }

  for (const { intent, patterns } of intentPatterns) {
    for (const re of patterns) {
      const m = trimmed.match(re)
      if (m) {
        return { intent, matched: m.slice(1).filter(Boolean) }
      }
    }
  }
  return { intent: 'general', matched: [] }
}

// --------------------------------------------------
// 对话上下文
// --------------------------------------------------

export interface ConversationContext {
  /** 上一轮关注的主要主题（章节 / 错误 / 术语） */
  lastTopic?: string
  /** 上一轮使用的查询 */
  lastQuery?: string
  /** 上一轮匹配到的 top item ID */
  lastTopItemId?: string
}

// --------------------------------------------------
// 回复组合
// --------------------------------------------------

export interface ComposeResult {
  /** Markdown 回复正文 */
  content: string
  /** 引用源（用于在 UI 上显示来源卡片） */
  sources: { title: string; url: string; type: string }[]
  /** 更新后的上下文 */
  nextContext: ConversationContext
  /** 命中的意图 */
  intent: Intent
}

const SUGGESTION_FALLBACK = `换一种说法可能会更准。你也可以试试：
- **SO101 如何校准？**
- **ACT 和 BC 有什么区别？**
- **数据采集命令怎么写？**
- **CUDA out of memory 怎么办？**`

export function composeResponse(
  query: string,
  context: ConversationContext = {}
): ComposeResult {
  const { intent, matched } = classifyIntent(query)

  // 1. 简单意图：直接走模板
  if (intent === 'greeting') {
    return {
      intent,
      content:
        '你好！我是 **SO101 模仿学习导师** 🤖\n\n你可以问我环境配置、数据采集、ACT 训练、报错排查等问题。试试问："**ACT 和 BC 有什么区别？**" 或 "**CUDA out of memory 怎么办？**"',
      sources: [],
      nextContext: context
    }
  }

  if (intent === 'thanks') {
    return {
      intent,
      content: '不客气！继续问，我会尽力帮你定位。祝训练顺利 🎉',
      sources: [],
      nextContext: context
    }
  }

  // 2. 承接问题：用上一轮主题增强查询
  let effectiveQuery = query
  if (intent === 'followup' && context.lastQuery) {
    effectiveQuery = `${context.lastQuery} ${query}`
  }

  // 3. 对比意图：尝试两个实体分别检索后拼接
  if (intent === 'compare' && matched.length >= 2) {
    return composeComparison(matched[0], matched[1], context)
  }

  // 4. 走通用检索 + 按意图筛选类型
  const typeFilter = intentToTypes(intent)
  const results = search(effectiveQuery, {
    types: typeFilter,
    limit: 6,
    threshold: 5
  })

  // 兜底：换一种过滤再试
  let finalResults = results
  if (finalResults.length === 0) {
    finalResults = search(effectiveQuery, { limit: 6, threshold: 4 })
  }

  if (finalResults.length === 0) {
    return {
      intent,
      content: `我没有在知识库里找到 "${query}" 的强相关条目。\n\n${SUGGESTION_FALLBACK}`,
      sources: [],
      nextContext: context
    }
  }

  // 5. 按 intent 组合
  switch (intent) {
    case 'concept':
      return composeConcept(query, finalResults, context)
    case 'troubleshoot':
      return composeTroubleshoot(query, finalResults, context)
    case 'command':
      return composeCommand(query, finalResults, context)
    case 'howto':
      return composeHowto(query, finalResults, context)
    case 'resource':
      return composeResource(query, finalResults, context)
    default:
      return composeGeneral(query, finalResults, intent, context)
  }
}

// --------------------------------------------------
// 各意图的组合函数
// --------------------------------------------------

function intentToTypes(intent: Intent) {
  switch (intent) {
    case 'concept':
      return ['glossary', 'chapter', 'principle', 'faq'] as const
    case 'troubleshoot':
      return ['error', 'faq'] as const
    case 'command':
      return ['command', 'step', 'faq'] as const
    case 'howto':
      return ['step', 'chapter', 'command', 'faq'] as const
    case 'resource':
      return ['resource', 'chapter'] as const
    default:
      return undefined
  }
}

function bestFaq(results: SearchResult[]): KBItem | undefined {
  return results.find((r) => r.item.type === 'faq')?.item
}

function buildSourceList(results: SearchResult[]): {
  title: string
  url: string
  type: string
}[] {
  const seen = new Set<string>()
  const sources: { title: string; url: string; type: string }[] = []
  for (const r of results) {
    if (!r.item.url) continue
    if (seen.has(r.item.url)) continue
    seen.add(r.item.url)
    sources.push({ title: r.item.title, url: r.item.url, type: r.item.type })
    if (sources.length >= 4) break
  }
  return sources
}

function formatItemAsBullet(r: SearchResult): string {
  const item = r.item
  const link = item.url ? ` → [查看](${item.url})` : ''
  const typeLabel = typeLabelMap[item.type] ?? item.type
  return `- **[${typeLabel}]** ${item.title}${link}\n  ${item.snippet.trim().slice(0, 160)}`
}

const typeLabelMap: Record<string, string> = {
  chapter: '章节',
  objective: '目标',
  principle: '原理',
  step: '步骤',
  command: '命令',
  checkpoint: '检查点',
  error: '错误',
  glossary: '术语',
  faq: '常见问题',
  resource: '资源'
}

function composeConcept(
  query: string,
  results: SearchResult[],
  context: ConversationContext
): ComposeResult {
  // 优先返回术语表
  const top = results[0]
  const faqHit = bestFaq(results)

  const lines: string[] = []

  if (faqHit) {
    lines.push(faqHit.body.replace(faqHit.title, '').trim())
  } else if (top.item.type === 'glossary') {
    lines.push(`**${top.item.title}**\n\n${top.item.snippet}`)
  } else {
    lines.push(`关于 "${query}"，下面是相关内容：`)
    lines.push('')
    lines.push(formatItemAsBullet(top))
  }

  // 关联条目
  const related = results.slice(1, 4).filter((r) => r.item.id !== top.item.id)
  if (related.length > 0) {
    lines.push('')
    lines.push('**继续了解**')
    related.forEach((r) => lines.push(formatItemAsBullet(r)))
  }

  return {
    intent: 'concept',
    content: lines.join('\n'),
    sources: buildSourceList(results),
    nextContext: {
      ...context,
      lastQuery: query,
      lastTopItemId: top.item.id,
      lastTopic: top.item.title
    }
  }
}

function composeTroubleshoot(
  query: string,
  results: SearchResult[],
  context: ConversationContext
): ComposeResult {
  const errs = results.filter((r) => r.item.type === 'error')
  const faq = bestFaq(results)
  const lines: string[] = []

  if (faq) {
    // FAQ 通常是完整长答案
    lines.push(faq.body.replace(faq.title, '').trim())
  } else if (errs.length > 0) {
    const top = errs[0].item
    lines.push(`### 可能的错误：${top.title}`)
    lines.push('')
    // 从原始数据库挖原因/解决方案
    const detail = findErrorDetail(top.id)
    if (detail) {
      lines.push(`**原因**：${detail.cause}`)
      lines.push('')
      lines.push(`**解决方案**：${detail.solution}`)
      if (detail.command) {
        lines.push('')
        lines.push('```bash')
        lines.push(detail.command)
        lines.push('```')
      }
      if (detail.nextStep) {
        lines.push('')
        lines.push(`> 下一步：${detail.nextStep}`)
      }
    } else {
      lines.push(top.snippet)
    }
  } else {
    lines.push(`没有直接匹配到错误，但下面这条内容看起来相关：`)
    lines.push('')
    lines.push(formatItemAsBullet(results[0]))
  }

  // 相关错误
  if (errs.length > 1) {
    lines.push('')
    lines.push('**相关错误**')
    errs.slice(1, 4).forEach((r) => lines.push(formatItemAsBullet(r)))
  }

  // 提示用户去诊断页
  lines.push('')
  lines.push(
    `> 想用关键字快速检索？打开 [报错诊断页](/diagnose?q=${encodeURIComponent(query)})。`
  )

  const top = results[0]
  return {
    intent: 'troubleshoot',
    content: lines.join('\n'),
    sources: buildSourceList(results),
    nextContext: {
      ...context,
      lastQuery: query,
      lastTopItemId: top.item.id,
      lastTopic: top.item.title
    }
  }
}

function composeCommand(
  query: string,
  results: SearchResult[],
  context: ConversationContext
): ComposeResult {
  const cmds = results.filter((r) => r.item.type === 'command')
  const faq = bestFaq(results)
  const lines: string[] = []

  if (faq) {
    lines.push(faq.body.replace(faq.title, '').trim())
  } else if (cmds.length > 0) {
    lines.push(`下面是相关命令：`)
    lines.push('')
    cmds.slice(0, 3).forEach((r) => {
      lines.push(`**${r.item.title.replace(/^命令：/, '')}**`)
      lines.push('```bash')
      lines.push(r.item.snippet)
      lines.push('```')
      if (r.item.url) {
        lines.push(`→ [前往章节](${r.item.url})`)
      }
      lines.push('')
    })
  } else {
    lines.push(`未找到精确匹配的命令，但下面这些步骤可能相关：`)
    lines.push('')
    results.slice(0, 3).forEach((r) => lines.push(formatItemAsBullet(r)))
  }

  const top = results[0]
  return {
    intent: 'command',
    content: lines.join('\n'),
    sources: buildSourceList(results),
    nextContext: {
      ...context,
      lastQuery: query,
      lastTopItemId: top.item.id,
      lastTopic: top.item.title
    }
  }
}

function composeHowto(
  query: string,
  results: SearchResult[],
  context: ConversationContext
): ComposeResult {
  const faq = bestFaq(results)
  const lines: string[] = []

  if (faq) {
    lines.push(faq.body.replace(faq.title, '').trim())
  } else {
    // 按 chapter 聚合
    const top = results[0].item
    const chapterId = top.chapterId
    if (chapterId) {
      const chapter = chapters.find((c) => c.id === chapterId)
      if (chapter) {
        lines.push(`这部分对应 **第 ${chapter.id} 章 · ${chapter.title}**：`)
        lines.push(`> ${chapter.description}`)
        lines.push('')
        // 取该章节的所有 step
        const steps = results
          .filter((r) => r.item.type === 'step' && r.item.chapterId === chapterId)
          .slice(0, 5)
        if (steps.length === 0) {
          // 回退：用 chapter.steps
          chapter.steps.slice(0, 5).forEach((s, i) =>
            lines.push(`${i + 1}. **${s.title}** —— ${s.content}`)
          )
        } else {
          steps.forEach((s, i) =>
            lines.push(`${i + 1}. ${s.item.title.replace(/^步骤：/, '')} —— ${s.item.snippet}`)
          )
        }
        if (chapter.commands.length > 0) {
          lines.push('')
          lines.push('**常用命令**')
          chapter.commands.slice(0, 2).forEach((c) => {
            lines.push(`- ${c.description}`)
            lines.push('```bash')
            lines.push(c.code)
            lines.push('```')
          })
        }
        lines.push('')
        lines.push(`→ [打开完整章节](/learn/${chapter.id})`)
      } else {
        results.slice(0, 4).forEach((r) => lines.push(formatItemAsBullet(r)))
      }
    } else {
      results.slice(0, 4).forEach((r) => lines.push(formatItemAsBullet(r)))
    }
  }

  const top = results[0]
  return {
    intent: 'howto',
    content: lines.join('\n'),
    sources: buildSourceList(results),
    nextContext: {
      ...context,
      lastQuery: query,
      lastTopItemId: top.item.id,
      lastTopic: top.item.title
    }
  }
}

function composeResource(
  query: string,
  results: SearchResult[],
  context: ConversationContext
): ComposeResult {
  const res = results.filter((r) => r.item.type === 'resource').slice(0, 5)
  const lines: string[] = []
  if (res.length === 0) {
    lines.push(
      `我在资源库里没找到精确匹配。可以直接看一下 [资源中心](/resources)，有论文、文档、视频和社区入口。`
    )
  } else {
    lines.push('以下是相关资源：')
    lines.push('')
    res.forEach((r) => {
      lines.push(`- [${r.item.title}](${r.item.url}) — ${r.item.snippet}`)
    })
    lines.push('')
    lines.push(`→ [打开完整资源中心](/resources)`)
  }
  const top = results[0]
  return {
    intent: 'resource',
    content: lines.join('\n'),
    sources: buildSourceList(results),
    nextContext: {
      ...context,
      lastQuery: query,
      lastTopItemId: top.item.id,
      lastTopic: top.item.title
    }
  }
}

function composeGeneral(
  query: string,
  results: SearchResult[],
  intent: Intent,
  context: ConversationContext
): ComposeResult {
  const lines: string[] = []
  const faq = bestFaq(results)

  if (faq) {
    lines.push(faq.body.replace(faq.title, '').trim())
    const others = results.filter((r) => r.item.type !== 'faq').slice(0, 3)
    if (others.length > 0) {
      lines.push('')
      lines.push('**相关内容**')
      others.forEach((r) => lines.push(formatItemAsBullet(r)))
    }
  } else {
    lines.push(`我在知识库里找到了几条相关条目：`)
    lines.push('')
    results.slice(0, 5).forEach((r) => lines.push(formatItemAsBullet(r)))
  }

  const top = results[0]
  return {
    intent,
    content: lines.join('\n'),
    sources: buildSourceList(results),
    nextContext: {
      ...context,
      lastQuery: query,
      lastTopItemId: top.item.id,
      lastTopic: top.item.title
    }
  }
}

// --------------------------------------------------
// 对比意图
// --------------------------------------------------

function composeComparison(
  termA: string,
  termB: string,
  context: ConversationContext
): ComposeResult {
  const resA = search(termA, { limit: 3, threshold: 4 })
  const resB = search(termB, { limit: 3, threshold: 4 })

  // 先看是否能命中 FAQ 里专门的对比答案
  const combinedQ = `${termA} ${termB}`
  const faqHit = search(combinedQ, { types: ['faq'], limit: 1, threshold: 3 })

  const lines: string[] = []
  if (faqHit.length > 0) {
    lines.push(faqHit[0].item.body.replace(faqHit[0].item.title, '').trim())
  } else if (resA[0] && resB[0]) {
    lines.push(`关于 **${termA.trim()}** vs **${termB.trim()}**：`)
    lines.push('')
    lines.push(`### ${resA[0].item.title}`)
    lines.push(resA[0].item.snippet)
    if (resA[0].item.url) lines.push(`→ [详情](${resA[0].item.url})`)
    lines.push('')
    lines.push(`### ${resB[0].item.title}`)
    lines.push(resB[0].item.snippet)
    if (resB[0].item.url) lines.push(`→ [详情](${resB[0].item.url})`)
  } else {
    lines.push(`我没法对 "${termA}" 和 "${termB}" 给出直接的对比，但知识库里有以下相关内容：`)
    lines.push('')
    ;[...resA, ...resB].slice(0, 4).forEach((r) => lines.push(formatItemAsBullet(r)))
  }

  const sources = [...resA, ...resB].slice(0, 4)
  return {
    intent: 'compare',
    content: lines.join('\n'),
    sources: buildSourceList(sources),
    nextContext: {
      ...context,
      lastQuery: `${termA} vs ${termB}`,
      lastTopic: `${termA} / ${termB}`
    }
  }
}

// --------------------------------------------------
// 工具函数
// --------------------------------------------------

function findErrorDetail(itemId: string) {
  // err-<key> 或 cherr-<chId>-<idx>
  if (itemId.startsWith('err-')) {
    const key = itemId.slice(4)
    return errorDatabase[key]
  }
  if (itemId.startsWith('cherr-')) {
    const [, chId, idx] = itemId.split('-')
    const chapter = chapters.find((c) => c.id === parseInt(chId))
    const err = chapter?.errors[parseInt(idx)]
    if (err) {
      return {
        cause: err.cause,
        solution: err.solution,
        command: err.command,
        nextStep: '查看完整章节获取更多上下文'
      }
    }
  }
  return null
}

// 导出供页面使用
export { knowledgeBase, search, tokenize }
export type { KBItem, SearchResult }
