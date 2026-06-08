/**
 * Japanese knowledge base + search.
 * Mirror of knowledge-base.ts but indexes Japanese data sources (chaptersJa,
 * errorDatabaseJa, glossaryJa, resourcesJa, aiResponsesJa).
 */

import { chaptersJa, aiResponsesJa, errorDatabaseJa } from './course-data-ja'
import { glossaryJa } from './glossary-ja'
import { resourcesJa } from './resources-ja'

export type KBItemTypeJa =
  | 'chapter'
  | 'objective'
  | 'principle'
  | 'step'
  | 'command'
  | 'checkpoint'
  | 'error'
  | 'glossary'
  | 'faq'
  | 'resource'

export interface KBItemJa {
  id: string
  type: KBItemTypeJa
  title: string
  body: string
  url?: string
  aliases?: string[]
  tags?: string[]
  chapterId?: number
  weight: number
  snippet: string
}

export interface SearchResultJa {
  item: KBItemJa
  score: number
  matchedTokens: string[]
}

// JP-leaning synonym groups (keeps CN + EN entries for cross-language match)
const synonymGroups: string[][] = [
  ['キャリブレーション', '校正', '校准', 'calibration', 'calibrate', '零点'],
  ['振動', '揺れ', '震え', 'jitter', 'vibration', 'shake', 'tremor', '抖动'],
  ['データ収集', '録画', '記録', 'record', 'recording', 'capture', 'collect', '采集'],
  ['遠隔操作', 'リモート操作', 'マスタースレーブ', 'teleop', 'teleoperation', 'master-slave', '遥操作'],
  ['学習', 'トレーニング', '訓練', 'train', 'training', 'fit'],
  ['推論', 'インファレンス', 'デプロイ', 'inference', 'infer', 'deploy', 'rollout', '推理'],
  ['モデル', 'ポリシー', 'model', 'policy', 'checkpoint', '重み', '权重', '模型'],
  ['エラー', '失敗', '不具合', 'error', 'exception', 'crash', 'bug', '报错'],
  ['インストール', 'セットアップ', 'install', 'setup', '構築', 'environment', '环境'],
  ['シリアル', 'シリアルポート', 'serial', 'port', 'ttyUSB', 'usb', '串口'],
  ['権限', 'permission', 'denied', 'アクセス権', '权限'],
  ['VRAM', 'GPU メモリ', 'cuda memory', 'oom', 'out of memory', 'メモリ不足', '显存'],
  ['ACT', 'Action Chunking Transformer', '行動分割'],
  ['BC', 'Behavior Cloning', '行動クローニング'],
  ['CVAE', 'Conditional VAE', '条件付き変分オートエンコーダ'],
  ['LeRobot', 'lerobot', 'HuggingFace LeRobot'],
  ['SO101', 'SO-101', 'SO100', 'SO-100', 'SO-ARM100', 'ロボットアーム', '机械臂'],
  ['Leader', 'マスター', 'リーダー', '主臂'],
  ['Follower', 'スレーブ', 'フォロワー', '从臂'],
  ['データセット', 'dataset', 'parquet', 'データ'],
  ['meta', 'info.json', 'メタデータ', 'metadata'],
  ['fps', 'フレームレート', 'frame rate', '制御周波数', '帧率'],
  ['EMA', '指数移動平均', '平滑化', 'smoothing'],
  ['学習率', 'lr', 'learning rate'],
  ['batch_size', 'batch', 'バッチサイズ'],
  ['NaN', 'nan loss', '勾配爆発'],
  ['wandb', 'Weights and Biases', 'tensorboard', '可視化'],
  ['ffmpeg', '動画', 'video', 'デコード'],
  ['とは', 'って何', 'について', 'what is', '何', '解説', '説明', '定義'],
  ['違い', '差', '比較', 'vs', 'compare', '区别'],
  ['どう', 'どのように', 'やり方', 'how', '怎么'],
  ['なぜ', 'why', 'どうして', '为什么']
]

const synonymMap: Map<string, Set<string>> = (() => {
  const map = new Map<string, Set<string>>()
  for (const group of synonymGroups) {
    const lower = group.map((s) => s.toLowerCase())
    for (const word of lower) {
      const existing = map.get(word) ?? new Set<string>()
      lower.forEach((w) => existing.add(w))
      map.set(word, existing)
    }
  }
  return map
})()

export function expandSynonyms(token: string): string[] {
  const lower = token.toLowerCase()
  return Array.from(synonymMap.get(lower) ?? [lower])
}

const stopwordsJa = new Set([
  // Japanese particles + light verbs
  'は', 'が', 'を', 'に', 'で', 'と', 'も', 'や', 'の', 'へ', 'から', 'まで',
  'です', 'ます', 'する', 'ある', 'いる', 'なる', 'できる',
  'これ', 'それ', 'あれ', 'この', 'その', 'あの',
  'どう', 'どの', 'どこ', 'どれ', 'いつ',
  'よう', 'こと', 'もの', 'ため', 'ので', 'ね', 'よ', 'か', 'な',
  // 中文残留
  '的', '了', '吗', '呢', '是', '在',
  // English
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be',
  'do', 'does', 'did', 'have', 'has', 'had', 'i', 'me', 'my',
  'you', 'your', 'we', 'us', 'it', 'its',
  'to', 'of', 'in', 'on', 'at', 'for', 'and', 'or',
  'this', 'that', 'how', 'what', 'why', 'when', 'where'
])

const PUNCTUATION_REGEX = /[\s　、。？！；：「」『』（）【】《》,.?!;:()\[\]{}<>"'`~/\\|@#$%^&*+=\-_]+/g

export function tokenizeJa(text: string): string[] {
  const lower = text.toLowerCase()
  const chunks = lower.split(PUNCTUATION_REGEX).filter(Boolean)
  const tokens: string[] = []

  for (const chunk of chunks) {
    // ASCII / numbers
    const ascii = chunk.match(/[a-z0-9._-]+/g)
    if (ascii) tokens.push(...ascii)

    // Hiragana / Katakana / Kanji — bigram pass + whole-chunk for short fragments.
    // ぀-ゟ: hiragana, ゠-ヿ: katakana, 一-鿿: CJK unified
    const jpMatches = chunk.match(/[぀-ゟ゠-ヿ一-鿿]+/g)
    if (jpMatches) {
      for (const jp of jpMatches) {
        if (jp.length === 1) {
          tokens.push(jp)
          continue
        }
        for (let i = 0; i < jp.length - 1; i++) {
          tokens.push(jp.slice(i, i + 2))
        }
        if (jp.length <= 6) {
          tokens.push(jp)
        }
      }
    }
  }

  return Array.from(new Set(tokens.filter((t) => t && !stopwordsJa.has(t))))
}

// --------------------------------------------------
// JP knowledge base construction
// --------------------------------------------------

const labels = {
  chapter: '第',
  objective: '学習目標',
  principle: '原理',
  step: '手順',
  command: 'コマンド',
  checkpoint: 'チェックポイント',
  faq: 'FAQ'
}

export const knowledgeBaseJa: KBItemJa[] = (() => {
  const items: KBItemJa[] = []

  for (const chapter of chaptersJa) {
    items.push({
      id: `chapter-${chapter.id}`,
      type: 'chapter',
      title: `${labels.chapter} ${chapter.id} 章 · ${chapter.title}`,
      body: `${chapter.title} ${chapter.titleEn} ${chapter.description}`,
      url: `/ja/learn/${chapter.id}`,
      aliases: [chapter.titleEn, `chapter ${chapter.id}`, `ch${chapter.id}`, `第${chapter.id}章`],
      chapterId: chapter.id,
      weight: 1.1,
      snippet: chapter.description
    })

    chapter.objectives.forEach((obj, i) => {
      items.push({
        id: `obj-${chapter.id}-${i}`,
        type: 'objective',
        title: `${labels.objective}：${obj.slice(0, 24)}`,
        body: obj,
        url: `/ja/learn/${chapter.id}#objectives`,
        chapterId: chapter.id,
        weight: 0.7,
        snippet: obj
      })
    })

    chapter.principles.forEach((p, i) => {
      items.push({
        id: `prin-${chapter.id}-${i}`,
        type: 'principle',
        title: `${labels.principle}：${p.slice(0, 24)}`,
        body: p,
        url: `/ja/learn/${chapter.id}#principles`,
        chapterId: chapter.id,
        weight: 1.0,
        snippet: p
      })
    })

    chapter.steps.forEach((step, i) => {
      items.push({
        id: `step-${chapter.id}-${i}`,
        type: 'step',
        title: `${labels.step}：${step.title}`,
        body: `${step.title} ${step.content}`,
        url: `/ja/learn/${chapter.id}#steps`,
        chapterId: chapter.id,
        weight: 1.0,
        snippet: step.content
      })
    })

    chapter.commands.forEach((cmd, i) => {
      items.push({
        id: `cmd-${chapter.id}-${i}`,
        type: 'command',
        title: `${labels.command}：${cmd.description}`,
        body: `${cmd.description}\n${cmd.code}`,
        url: `/ja/learn/${chapter.id}#commands`,
        chapterId: chapter.id,
        weight: 1.3,
        snippet: cmd.code
      })
    })

    chapter.checkpoints.forEach((cp, i) => {
      items.push({
        id: `cp-${chapter.id}-${i}`,
        type: 'checkpoint',
        title: `${labels.checkpoint}：${cp.slice(0, 24)}`,
        body: cp,
        url: `/ja/learn/${chapter.id}#checkpoints`,
        chapterId: chapter.id,
        weight: 0.6,
        snippet: cp
      })
    })

    chapter.errors.forEach((err, i) => {
      items.push({
        id: `cherr-${chapter.id}-${i}`,
        type: 'error',
        title: err.error,
        body: `${err.error} ${err.cause} ${err.solution}`,
        url: `/ja/learn/${chapter.id}#errors`,
        chapterId: chapter.id,
        weight: 1.4,
        snippet: err.solution
      })
    })
  }

  for (const [key, err] of Object.entries(errorDatabaseJa)) {
    items.push({
      id: `err-${key}`,
      type: 'error',
      title: err.error,
      body: `${err.error} ${err.cause} ${err.solution} ${err.command ?? ''}`,
      url: `/ja/diagnose?q=${encodeURIComponent(err.error)}`,
      aliases: [key, ...(err.related ?? [])],
      tags: err.category ? [err.category] : undefined,
      weight: 1.5,
      snippet: err.solution
    })
  }

  for (const term of glossaryJa) {
    items.push({
      id: `gloss-${term.term}`,
      type: 'glossary',
      title: term.term,
      body: `${term.term} ${term.termEn ?? ''} ${term.definition}`,
      url: `/ja/glossary#${encodeURIComponent(term.term)}`,
      aliases: [term.termEn, ...(term.related ?? [])].filter(
        (x): x is string => Boolean(x)
      ),
      tags: [term.category],
      weight: 1.2,
      snippet: term.definition
    })
  }

  for (const [key, response] of Object.entries(aiResponsesJa)) {
    items.push({
      id: `faq-${key}`,
      type: 'faq',
      title: `${labels.faq}：${key}`,
      body: `${key} ${response}`,
      aliases: [key],
      weight: 1.4,
      snippet: response.slice(0, 120) + '…'
    })
  }

  for (const res of resourcesJa) {
    items.push({
      id: `res-${res.url}`,
      type: 'resource',
      title: res.title,
      body: `${res.title} ${res.description} ${res.tags?.join(' ') ?? ''}`,
      url: res.url,
      tags: res.tags,
      weight: 0.8,
      snippet: res.description
    })
  }

  return items
})()

// --------------------------------------------------
// Scoring + search
// --------------------------------------------------

function fieldContains(field: string, needle: string): boolean {
  return field.toLowerCase().includes(needle.toLowerCase())
}

function scoreItem(item: KBItemJa, query: string, queryTokens: string[]): {
  score: number
  matched: string[]
} {
  let score = 0
  const matched = new Set<string>()
  const qLower = query.toLowerCase().trim()
  if (!qLower) return { score: 0, matched: [] }

  if (fieldContains(item.title, qLower)) {
    score += 80
    matched.add(qLower)
  }
  if (fieldContains(item.body, qLower)) {
    score += 40
    matched.add(qLower)
  }
  if (item.aliases?.some((a) => fieldContains(a, qLower))) {
    score += 60
    matched.add(qLower)
  }

  const expandedTokens = new Set<string>()
  for (const t of queryTokens) {
    for (const e of expandSynonyms(t)) {
      expandedTokens.add(e)
    }
  }

  for (const token of expandedTokens) {
    const inTitle = fieldContains(item.title, token)
    const inBody = fieldContains(item.body, token)
    const inAlias = item.aliases?.some((a) => fieldContains(a, token)) ?? false
    const inTag = item.tags?.some((t) => fieldContains(t, token)) ?? false

    if (inTitle) {
      score += 12
      matched.add(token)
    }
    if (inAlias) {
      score += 10
      matched.add(token)
    }
    if (inTag) {
      score += 8
      matched.add(token)
    }
    if (inBody) {
      score += 4
      matched.add(token)
    }
  }

  const allTokensMatched = queryTokens.length > 0 && queryTokens.every((t) =>
    expandSynonyms(t).some(
      (e) =>
        fieldContains(item.title, e) ||
        fieldContains(item.body, e) ||
        item.aliases?.some((a) => fieldContains(a, e))
    )
  )
  if (allTokensMatched && queryTokens.length >= 2) {
    score *= 1.3
  }

  score *= item.weight

  return { score, matched: Array.from(matched) }
}

export interface SearchOptionsJa {
  types?: readonly KBItemTypeJa[]
  limit?: number
  threshold?: number
  chapterId?: number
}

export function searchJa(query: string, opts: SearchOptionsJa = {}): SearchResultJa[] {
  const tokens = tokenizeJa(query)
  if (tokens.length === 0) return []

  const limit = opts.limit ?? 8
  const threshold = opts.threshold ?? 5

  const candidates = knowledgeBaseJa.filter((item) => {
    if (opts.types && !opts.types.includes(item.type)) return false
    if (opts.chapterId && item.chapterId !== opts.chapterId) return false
    return true
  })

  const ranked = candidates
    .map((item) => {
      const { score, matched } = scoreItem(item, query, tokens)
      return { item, score, matchedTokens: matched }
    })
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return ranked
}

export function getChapterTitleJa(chapterId: number): string | null {
  const c = chaptersJa.find((c) => c.id === chapterId)
  return c ? c.title : null
}
