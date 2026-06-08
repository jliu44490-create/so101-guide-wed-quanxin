/**
 * Japanese AI assistant response engine.
 * Mirror of assistant-engine.ts with:
 *   - JP intent patterns
 *   - JP response templates
 *   - imports from course-data-ja / glossary-ja / knowledge-base-ja
 */

import { errorDatabaseJa, chaptersJa } from './course-data-ja'
import {
  knowledgeBaseJa,
  searchJa,
  tokenizeJa,
  type KBItemJa,
  type SearchResultJa
} from './knowledge-base-ja'

// --------------------------------------------------
// Intent classification (JP)
// --------------------------------------------------

export type IntentJa =
  | 'greeting'
  | 'thanks'
  | 'concept'
  | 'compare'
  | 'howto'
  | 'troubleshoot'
  | 'command'
  | 'resource'
  | 'followup'
  | 'general'

interface IntentMatchJa {
  intent: IntentJa
  matched: string[]
}

const intentPatternsJa: { intent: IntentJa; patterns: RegExp[] }[] = [
  {
    intent: 'greeting',
    patterns: [
      /^(?:こんにちは|こんばんは|おはよう|はじめまして|よろしく|hi|hello|hey|やあ)[!！。.\s]*$/i
    ]
  },
  {
    intent: 'thanks',
    patterns: [/^(?:ありがとう|ありがと|感謝|助かりました|thx|thanks|thank you)[!！。.\s]*$/i]
  },
  {
    intent: 'compare',
    patterns: [
      /(.{1,40})(?:と|VS|vs|の違い|を比較|の比較|との違い)(.{1,40})/i,
      /(?:違い|差|比較)(?:は|が|を|について)/,
      /(.{1,30})\s+vs\s+(.{1,30})/i
    ]
  },
  {
    intent: 'troubleshoot',
    patterns: [
      /(?:エラー|失敗|落ちる|クラッシュ|不具合|例外|bug|error|exception|fail|crash|traceback)/i,
      /(?:なぜ|どうして|何で).{0,20}(?:動かない|失敗|できない|だめ|うまくいかない|無理)/,
      /(?:解決|fix|対処|デバッグ|直し方|直す)/i,
      /not found|denied|cannot|can\'t|missing|invalid|undefined/i,
      /CUDA|cuda|OOM|oom|メモリ不足|VRAM/
    ]
  },
  {
    intent: 'command',
    patterns: [
      /(?:コマンド|命令|スクリプト|script|command)(?:の書き方|の使い方|は何|は\?)?/,
      /(?:どう|どのように|どうやって).{0,20}(?:実行|起動|動かす|走らせる|学習|収集|録画|推論)/,
      /^(?:python|pip|conda|git|sudo|wandb|cd|ls|mkdir)/i
    ]
  },
  {
    intent: 'howto',
    patterns: [
      /(?:どうやって|どのように|やり方|手順|方法|どう　?すれば|how to|how do i)/i,
      /(?:ステップ|流れ|プロセス|進め方)/
    ]
  },
  {
    intent: 'concept',
    patterns: [
      /(?:とは|とは何|について|定義|意味|を解説|を教えて|を説明)(.{0,30})/,
      /(.{1,30})(?:とは|って何|について|の意味)/,
      /^(?:what is|define)/i
    ]
  },
  {
    intent: 'resource',
    patterns: [
      /(?:論文|paper|文献)/i,
      /(?:資料|チュートリアル|ドキュメント|動画|コミュニティ|参考|reference|リソース)/,
      /(?:どこに|どこで|どこから|where can i find)/
    ]
  },
  {
    intent: 'followup',
    patterns: [
      /^(?:もっと|もう少し|さらに|詳しく|続き|それから|次は)/,
      /^(?:他に(?:は|も)|別の|ほかは)/,
      /^(?:その|これ).{0,8}(?:は|どう|なぜ)/
    ]
  }
]

export function classifyIntentJa(query: string): IntentMatchJa {
  const trimmed = query.trim()
  if (!trimmed) return { intent: 'general', matched: [] }

  for (const { intent, patterns } of intentPatternsJa) {
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
// Context
// --------------------------------------------------

export interface ConversationContextJa {
  lastTopic?: string
  lastQuery?: string
  lastTopItemId?: string
}

// --------------------------------------------------
// Compose
// --------------------------------------------------

export interface ComposeResultJa {
  content: string
  sources: { title: string; url: string; type: string }[]
  nextContext: ConversationContextJa
  intent: IntentJa
}

const SUGGESTION_FALLBACK_JA = `言い換えるとヒットしやすくなります。以下もお試しください：
- **SO101 のキャリブレーション方法は？**
- **ACT と BC の違いは？**
- **データ収集のコマンドを教えて**
- **CUDA out of memory の対処は？**`

export function composeResponseJa(
  query: string,
  context: ConversationContextJa = {}
): ComposeResultJa {
  const { intent, matched } = classifyIntentJa(query)

  if (intent === 'greeting') {
    return {
      intent,
      content:
        'こんにちは！**SO101 模倣学習アシスタント** です 🤖\n\n環境構築、データ収集、ACT 学習、エラー対処などをご質問いただけます。例：「**ACT と BC の違いは？**」「**CUDA out of memory の対処は？**」',
      sources: [],
      nextContext: context
    }
  }

  if (intent === 'thanks') {
    return {
      intent,
      content: 'どういたしまして！引き続きご質問ください。学習がうまく進みますように 🎉',
      sources: [],
      nextContext: context
    }
  }

  let effectiveQuery = query
  if (intent === 'followup' && context.lastQuery) {
    effectiveQuery = `${context.lastQuery} ${query}`
  }

  if (intent === 'compare' && matched.length >= 2) {
    return composeComparisonJa(matched[0], matched[1], context)
  }

  const typeFilter = intentToTypes(intent)
  const results = searchJa(effectiveQuery, {
    types: typeFilter,
    limit: 6,
    threshold: 5
  })

  let finalResults = results
  if (finalResults.length === 0) {
    finalResults = searchJa(effectiveQuery, { limit: 6, threshold: 4 })
  }

  if (finalResults.length === 0) {
    return {
      intent,
      content: `ナレッジベースで「${query}」に該当する強い項目は見つかりませんでした。\n\n${SUGGESTION_FALLBACK_JA}`,
      sources: [],
      nextContext: context
    }
  }

  switch (intent) {
    case 'concept':
      return composeConceptJa(query, finalResults, context)
    case 'troubleshoot':
      return composeTroubleshootJa(query, finalResults, context)
    case 'command':
      return composeCommandJa(query, finalResults, context)
    case 'howto':
      return composeHowtoJa(query, finalResults, context)
    case 'resource':
      return composeResourceJa(query, finalResults, context)
    default:
      return composeGeneralJa(query, finalResults, intent, context)
  }
}

function intentToTypes(intent: IntentJa) {
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

function bestFaq(results: SearchResultJa[]): KBItemJa | undefined {
  return results.find((r) => r.item.type === 'faq')?.item
}

function buildSourceList(results: SearchResultJa[]): {
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

const typeLabelMapJa: Record<string, string> = {
  chapter: '章',
  objective: '学習目標',
  principle: '原理',
  step: '手順',
  command: 'コマンド',
  checkpoint: 'チェックポイント',
  error: 'エラー',
  glossary: '用語',
  faq: 'FAQ',
  resource: 'リソース'
}

function formatItemAsBullet(r: SearchResultJa): string {
  const item = r.item
  const link = item.url ? ` → [詳細](${item.url})` : ''
  const typeLabel = typeLabelMapJa[item.type] ?? item.type
  return `- **[${typeLabel}]** ${item.title}${link}\n  ${item.snippet.trim().slice(0, 160)}`
}

function composeConceptJa(
  query: string,
  results: SearchResultJa[],
  context: ConversationContextJa
): ComposeResultJa {
  const top = results[0]
  const faqHit = bestFaq(results)

  const lines: string[] = []

  if (faqHit) {
    lines.push(faqHit.body.replace(faqHit.title, '').trim())
  } else if (top.item.type === 'glossary') {
    lines.push(`**${top.item.title}**\n\n${top.item.snippet}`)
  } else {
    lines.push(`「${query}」に関連する項目はこちらです：`)
    lines.push('')
    lines.push(formatItemAsBullet(top))
  }

  const related = results.slice(1, 4).filter((r) => r.item.id !== top.item.id)
  if (related.length > 0) {
    lines.push('')
    lines.push('**関連項目**')
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

function composeTroubleshootJa(
  query: string,
  results: SearchResultJa[],
  context: ConversationContextJa
): ComposeResultJa {
  const errs = results.filter((r) => r.item.type === 'error')
  const faq = bestFaq(results)
  const lines: string[] = []

  if (faq) {
    lines.push(faq.body.replace(faq.title, '').trim())
  } else if (errs.length > 0) {
    const top = errs[0].item
    lines.push(`### 該当する可能性のあるエラー：${top.title}`)
    lines.push('')
    const detail = findErrorDetail(top.id)
    if (detail) {
      lines.push(`**原因**：${detail.cause}`)
      lines.push('')
      lines.push(`**対処**：${detail.solution}`)
      if (detail.command) {
        lines.push('')
        lines.push('```bash')
        lines.push(detail.command)
        lines.push('```')
      }
      if (detail.nextStep) {
        lines.push('')
        lines.push(`> 次の一手：${detail.nextStep}`)
      }
    } else {
      lines.push(top.snippet)
    }
  } else {
    lines.push(`エラーには直接該当しませんでしたが、以下の項目が関連していそうです：`)
    lines.push('')
    lines.push(formatItemAsBullet(results[0]))
  }

  if (errs.length > 1) {
    lines.push('')
    lines.push('**関連するエラー**')
    errs.slice(1, 4).forEach((r) => lines.push(formatItemAsBullet(r)))
  }

  lines.push('')
  lines.push(
    `> キーワードで素早く検索したい場合は [トラブル診断ページ](/ja/diagnose?q=${encodeURIComponent(query)}) もご利用ください。`
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

function composeCommandJa(
  query: string,
  results: SearchResultJa[],
  context: ConversationContextJa
): ComposeResultJa {
  const cmds = results.filter((r) => r.item.type === 'command')
  const faq = bestFaq(results)
  const lines: string[] = []

  if (faq) {
    lines.push(faq.body.replace(faq.title, '').trim())
  } else if (cmds.length > 0) {
    lines.push(`関連するコマンドはこちらです：`)
    lines.push('')
    cmds.slice(0, 3).forEach((r) => {
      lines.push(`**${r.item.title.replace(/^コマンド：/, '')}**`)
      lines.push('```bash')
      lines.push(r.item.snippet)
      lines.push('```')
      if (r.item.url) {
        lines.push(`→ [該当章を開く](${r.item.url})`)
      }
      lines.push('')
    })
  } else {
    lines.push(`コマンドの完全一致は見つかりませんでしたが、以下の手順が関連していそうです：`)
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

function composeHowtoJa(
  query: string,
  results: SearchResultJa[],
  context: ConversationContextJa
): ComposeResultJa {
  const faq = bestFaq(results)
  const lines: string[] = []

  if (faq) {
    lines.push(faq.body.replace(faq.title, '').trim())
  } else {
    const top = results[0].item
    const chapterId = top.chapterId
    if (chapterId) {
      const chapter = chaptersJa.find((c) => c.id === chapterId)
      if (chapter) {
        lines.push(`この内容は **第 ${chapter.id} 章 · ${chapter.title}** に対応しています：`)
        lines.push(`> ${chapter.description}`)
        lines.push('')
        const steps = results
          .filter((r) => r.item.type === 'step' && r.item.chapterId === chapterId)
          .slice(0, 5)
        if (steps.length === 0) {
          chapter.steps.slice(0, 5).forEach((s, i) =>
            lines.push(`${i + 1}. **${s.title}** — ${s.content}`)
          )
        } else {
          steps.forEach((s, i) =>
            lines.push(`${i + 1}. ${s.item.title.replace(/^手順：/, '')} — ${s.item.snippet}`)
          )
        }
        if (chapter.commands.length > 0) {
          lines.push('')
          lines.push('**主なコマンド**')
          chapter.commands.slice(0, 2).forEach((c) => {
            lines.push(`- ${c.description}`)
            lines.push('```bash')
            lines.push(c.code)
            lines.push('```')
          })
        }
        lines.push('')
        lines.push(`→ [章全文を開く](/ja/learn/${chapter.id})`)
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

function composeResourceJa(
  query: string,
  results: SearchResultJa[],
  context: ConversationContextJa
): ComposeResultJa {
  const res = results.filter((r) => r.item.type === 'resource').slice(0, 5)
  const lines: string[] = []
  if (res.length === 0) {
    lines.push(
      `リソースには完全一致が見つかりませんでした。[リソースセンター](/ja/resources) には論文・ドキュメント・動画・コミュニティが揃っています。`
    )
  } else {
    lines.push('関連リソースはこちらです：')
    lines.push('')
    res.forEach((r) => {
      lines.push(`- [${r.item.title}](${r.item.url}) — ${r.item.snippet}`)
    })
    lines.push('')
    lines.push(`→ [リソースセンター全体を開く](/ja/resources)`)
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

function composeGeneralJa(
  query: string,
  results: SearchResultJa[],
  intent: IntentJa,
  context: ConversationContextJa
): ComposeResultJa {
  const lines: string[] = []
  const faq = bestFaq(results)

  if (faq) {
    lines.push(faq.body.replace(faq.title, '').trim())
    const others = results.filter((r) => r.item.type !== 'faq').slice(0, 3)
    if (others.length > 0) {
      lines.push('')
      lines.push('**関連項目**')
      others.forEach((r) => lines.push(formatItemAsBullet(r)))
    }
  } else {
    lines.push(`ナレッジベースから関連する項目を見つけました：`)
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

function composeComparisonJa(
  termA: string,
  termB: string,
  context: ConversationContextJa
): ComposeResultJa {
  const resA = searchJa(termA, { limit: 3, threshold: 4 })
  const resB = searchJa(termB, { limit: 3, threshold: 4 })

  const combinedQ = `${termA} ${termB}`
  const faqHit = searchJa(combinedQ, { types: ['faq'], limit: 1, threshold: 3 })

  const lines: string[] = []
  if (faqHit.length > 0) {
    lines.push(faqHit[0].item.body.replace(faqHit[0].item.title, '').trim())
  } else if (resA[0] && resB[0]) {
    lines.push(`**${termA.trim()}** vs **${termB.trim()}** の比較：`)
    lines.push('')
    lines.push(`### ${resA[0].item.title}`)
    lines.push(resA[0].item.snippet)
    if (resA[0].item.url) lines.push(`→ [詳細](${resA[0].item.url})`)
    lines.push('')
    lines.push(`### ${resB[0].item.title}`)
    lines.push(resB[0].item.snippet)
    if (resB[0].item.url) lines.push(`→ [詳細](${resB[0].item.url})`)
  } else {
    lines.push(`「${termA}」と「${termB}」の直接比較は出せませんでしたが、関連する項目があります：`)
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

function findErrorDetail(itemId: string) {
  if (itemId.startsWith('err-')) {
    const key = itemId.slice(4)
    return errorDatabaseJa[key]
  }
  if (itemId.startsWith('cherr-')) {
    const [, chId, idx] = itemId.split('-')
    const chapter = chaptersJa.find((c) => c.id === parseInt(chId))
    const err = chapter?.errors[parseInt(idx)]
    if (err) {
      return {
        cause: err.cause,
        solution: err.solution,
        command: err.command,
        nextStep: '完整な章を確認すると追加の文脈が得られます。'
      }
    }
  }
  return null
}

export { knowledgeBaseJa, searchJa, tokenizeJa }
export type { KBItemJa, SearchResultJa }
