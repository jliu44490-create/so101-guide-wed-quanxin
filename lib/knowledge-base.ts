/**
 * 本地知识库 + 搜索引擎
 * --------------------------------------------------
 * 把 chapters / errorDatabase / glossary / aiResponses
 * 全部展开成统一可搜索条目，再做中英混合分词、同义词扩展、加权打分。
 *
 * 设计目标：在不引入任何后端 / 第三方 API 的前提下，把命中率从
 * "关键字字典" 提升到接近语义搜索的体验。
 */

import { chapters, aiResponses, errorDatabase } from './course-data'
import { glossary } from './glossary'
import { resources } from './resources'

// --------------------------------------------------
// 类型定义
// --------------------------------------------------

export type KBItemType =
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

export interface KBItem {
  /** 全局唯一 ID */
  id: string
  /** 条目类型 */
  type: KBItemType
  /** 标题（用于打分 + 展示） */
  title: string
  /** 正文/详细内容 */
  body: string
  /** 跳转链接，可选 */
  url?: string
  /** 别名 / 同义词 / 英文名 */
  aliases?: string[]
  /** 标签 */
  tags?: string[]
  /** 章节归属 */
  chapterId?: number
  /** 基础权重，影响最终分数 */
  weight: number
  /** 简短摘要（展示用） */
  snippet: string
}

export interface SearchResult {
  item: KBItem
  score: number
  matchedTokens: string[]
}

// --------------------------------------------------
// 同义词词典 / 别名扩展
// --------------------------------------------------
// 双向映射：用任意一边的词都能命中另一边
const synonymGroups: string[][] = [
  ['校准', 'calibration', 'calibrate', '零点', '标定'],
  ['抖动', '震荡', '振动', 'jitter', 'vibration', 'shake', 'tremor'],
  ['数据采集', '录制', 'record', 'recording', 'capture', 'collect', '采数据', '采集数据'],
  ['遥操作', '主从', 'teleop', 'teleoperation', 'master-slave'],
  ['训练', 'train', 'training', '炼丹', 'fit'],
  ['推理', 'inference', 'infer', '部署', 'deploy', 'rollout'],
  ['模型', 'model', 'policy', '策略', 'checkpoint', '权重'],
  ['报错', '错误', 'error', 'exception', '异常', '崩溃', 'crash', 'bug', '失败'],
  ['安装', 'install', 'setup', '配置', '环境', 'environment'],
  ['串口', 'serial', 'port', 'ttyUSB', 'usb', '端口'],
  ['权限', 'permission', 'denied', '没权限', '不让访问'],
  ['显存', 'gpu memory', 'cuda memory', 'oom', 'out of memory', '爆显存'],
  ['ACT', 'Action Chunking Transformer', '动作分块'],
  ['BC', 'Behavior Cloning', '行为克隆'],
  ['CVAE', 'Conditional VAE', '条件变分自编码器'],
  ['LeRobot', 'lerobot', 'HuggingFace LeRobot'],
  ['SO101', 'SO-101', 'SO100', 'SO-100', 'SO-ARM100', '机械臂'],
  ['Leader', '主臂', '主'],
  ['Follower', '从臂', '从'],
  ['数据集', 'dataset', '数据', 'parquet'],
  ['meta', 'info.json', '元数据', 'metadata'],
  ['fps', '帧率', 'frame rate', '控制频率'],
  ['EMA', '滑动平均', '指数平均', '平滑', 'smoothing'],
  ['学习率', 'lr', 'learning rate'],
  ['batch_size', 'batch', '批大小'],
  ['NaN', 'nan loss', '梯度爆炸', '梯度消失'],
  ['wandb', 'Weights and Biases', '可视化', 'tensorboard'],
  ['ffmpeg', '视频', 'video', '解码'],
  ['什么是', '是什么', 'what is', '解释', '介绍', '定义'],
  ['区别', '不同', '对比', 'vs', '比较', 'difference', 'compare'],
  ['怎么', '如何', 'how', '怎样', 'how to'],
  ['为什么', 'why', '为啥']
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

/** 把一个 token 展开成它所有的同义词 */
export function expandSynonyms(token: string): string[] {
  const lower = token.toLowerCase()
  return Array.from(synonymMap.get(lower) ?? [lower])
}

// --------------------------------------------------
// 分词
// --------------------------------------------------
// 策略：
//   1. 英文/数字：按 \W 分词
//   2. 中文：抽出连续汉字串，再用 bigram (2-gram) 切分
//   3. 标点/停用词剔除
// 这种朴素 bigram 在 9 章规模的语料下足够好，且零依赖。

const stopwords = new Set([
  // 中文
  '的', '了', '吗', '呢', '是', '在', '我', '你', '他', '她', '它', '们',
  '请问', '请', '一下', '怎么办', '怎么', '如何', '能否', '可以', '一个',
  '什么', '哪个', '哪些', '怎样', '是不是', '会不会', '能不能',
  '现在', '已经', '正在', '当前', '这个', '那个', '这里', '那里',
  // 英文
  'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'do', 'does', 'did', 'have', 'has', 'had', 'i', 'me', 'my', 'mine',
  'you', 'your', 'we', 'us', 'our', 'they', 'them', 'their', 'it', 'its',
  'to', 'of', 'in', 'on', 'at', 'for', 'and', 'or', 'but', 'so',
  'this', 'that', 'these', 'those', 'how', 'what', 'why', 'when', 'where',
  'can', 'could', 'will', 'would', 'should', 'shall', 'may', 'might'
])

const PUNCTUATION_REGEX = /[\s　，。？！；：、""''（）【】《》「」『』,.\?!;:()\[\]{}<>"'`~/\\|@#$%^&*+=\-_]+/g

export function tokenize(text: string): string[] {
  const lower = text.toLowerCase()
  // 按标点切大段
  const chunks = lower.split(PUNCTUATION_REGEX).filter(Boolean)
  const tokens: string[] = []

  for (const chunk of chunks) {
    // 中英混合：分别提取
    // 1. 英文/数字连续段
    const ascii = chunk.match(/[a-z0-9._-]+/g)
    if (ascii) tokens.push(...ascii)

    // 2. 中文连续段做 bigram
    const cjkMatches = chunk.match(/[一-鿿]+/g)
    if (cjkMatches) {
      for (const cjk of cjkMatches) {
        // 单字也保留（短查询友好）
        if (cjk.length === 1) {
          tokens.push(cjk)
          continue
        }
        // 2-gram + 整段
        for (let i = 0; i < cjk.length - 1; i++) {
          tokens.push(cjk.slice(i, i + 2))
        }
        if (cjk.length <= 6) {
          tokens.push(cjk) // 短词整体作为一个 token
        }
      }
    }
  }

  return Array.from(new Set(tokens.filter((t) => t && !stopwords.has(t))))
}

// --------------------------------------------------
// 知识库构建
// --------------------------------------------------

export const knowledgeBase: KBItem[] = (() => {
  const items: KBItem[] = []

  // 1. 章节本身
  for (const chapter of chapters) {
    items.push({
      id: `chapter-${chapter.id}`,
      type: 'chapter',
      title: `第 ${chapter.id} 章 · ${chapter.title}`,
      body: `${chapter.title} ${chapter.titleEn} ${chapter.description}`,
      url: `/learn/${chapter.id}`,
      aliases: [chapter.titleEn, `chapter ${chapter.id}`, `ch${chapter.id}`, `第${chapter.id}章`],
      chapterId: chapter.id,
      weight: 1.1,
      snippet: chapter.description
    })

    // 2. 学习目标
    chapter.objectives.forEach((obj, i) => {
      items.push({
        id: `obj-${chapter.id}-${i}`,
        type: 'objective',
        title: `学习目标：${obj.slice(0, 24)}`,
        body: obj,
        url: `/learn/${chapter.id}#objectives`,
        chapterId: chapter.id,
        weight: 0.7,
        snippet: obj
      })
    })

    // 3. 原理
    chapter.principles.forEach((p, i) => {
      items.push({
        id: `prin-${chapter.id}-${i}`,
        type: 'principle',
        title: `原理：${p.slice(0, 24)}`,
        body: p,
        url: `/learn/${chapter.id}#principles`,
        chapterId: chapter.id,
        weight: 1.0,
        snippet: p
      })
    })

    // 4. 步骤
    chapter.steps.forEach((step, i) => {
      items.push({
        id: `step-${chapter.id}-${i}`,
        type: 'step',
        title: `步骤：${step.title}`,
        body: `${step.title} ${step.content}`,
        url: `/learn/${chapter.id}#steps`,
        chapterId: chapter.id,
        weight: 1.0,
        snippet: step.content
      })
    })

    // 5. 命令
    chapter.commands.forEach((cmd, i) => {
      items.push({
        id: `cmd-${chapter.id}-${i}`,
        type: 'command',
        title: `命令：${cmd.description}`,
        body: `${cmd.description}\n${cmd.code}`,
        url: `/learn/${chapter.id}#commands`,
        chapterId: chapter.id,
        weight: 1.3,
        snippet: cmd.code
      })
    })

    // 6. 检查点
    chapter.checkpoints.forEach((cp, i) => {
      items.push({
        id: `cp-${chapter.id}-${i}`,
        type: 'checkpoint',
        title: `检查点：${cp.slice(0, 24)}`,
        body: cp,
        url: `/learn/${chapter.id}#checkpoints`,
        chapterId: chapter.id,
        weight: 0.6,
        snippet: cp
      })
    })

    // 7. 章节内错误
    chapter.errors.forEach((err, i) => {
      items.push({
        id: `cherr-${chapter.id}-${i}`,
        type: 'error',
        title: err.error,
        body: `${err.error} ${err.cause} ${err.solution}`,
        url: `/learn/${chapter.id}#errors`,
        chapterId: chapter.id,
        weight: 1.4,
        snippet: err.solution
      })
    })
  }

  // 8. 全局错误库
  for (const [key, err] of Object.entries(errorDatabase)) {
    items.push({
      id: `err-${key}`,
      type: 'error',
      title: err.error,
      body: `${err.error} ${err.cause} ${err.solution} ${err.command ?? ''}`,
      url: `/diagnose?q=${encodeURIComponent(err.error)}`,
      aliases: [key, ...(err.related ?? [])],
      tags: err.category ? [err.category] : undefined,
      weight: 1.5,
      snippet: err.solution
    })
  }

  // 9. 术语表
  for (const term of glossary) {
    items.push({
      id: `gloss-${term.term}`,
      type: 'glossary',
      title: term.term,
      body: `${term.term} ${term.termEn ?? ''} ${term.definition}`,
      url: `/glossary#${encodeURIComponent(term.term)}`,
      aliases: [term.termEn, ...(term.related ?? [])].filter(
        (x): x is string => Boolean(x)
      ),
      tags: [term.category],
      weight: 1.2,
      snippet: term.definition
    })
  }

  // 10. FAQ / 长答案（aiResponses 仍然作为高质量长答案保留）
  for (const [key, response] of Object.entries(aiResponses)) {
    items.push({
      id: `faq-${key}`,
      type: 'faq',
      title: `FAQ：${key}`,
      body: `${key} ${response}`,
      aliases: [key],
      weight: 1.4,
      snippet: response.slice(0, 120) + '…'
    })
  }

  // 11. 外部资源
  for (const res of resources) {
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
// 打分
// --------------------------------------------------

function fieldContains(field: string, needle: string): boolean {
  return field.toLowerCase().includes(needle.toLowerCase())
}

function scoreItem(item: KBItem, query: string, queryTokens: string[]): {
  score: number
  matched: string[]
} {
  let score = 0
  const matched = new Set<string>()
  const qLower = query.toLowerCase().trim()
  if (!qLower) return { score: 0, matched: [] }

  // 1. 整句精确匹配（重磅加分）
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

  // 2. Token 级匹配（核心）
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

  // 3. 多 token 全部命中加成
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

  // 4. 类型/基础权重
  score *= item.weight

  return { score, matched: Array.from(matched) }
}

// --------------------------------------------------
// 搜索入口
// --------------------------------------------------

export interface SearchOptions {
  /** 限制 type */
  types?: readonly KBItemType[]
  /** 最多返回多少条 */
  limit?: number
  /** 最低分数阈值 */
  threshold?: number
  /** 限定章节 */
  chapterId?: number
}

export function search(query: string, opts: SearchOptions = {}): SearchResult[] {
  const tokens = tokenize(query)
  if (tokens.length === 0) return []

  const limit = opts.limit ?? 8
  const threshold = opts.threshold ?? 5

  const candidates = knowledgeBase.filter((item) => {
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

// --------------------------------------------------
// 工具：取章节中文标题
// --------------------------------------------------

export function getChapterTitle(chapterId: number): string | null {
  const c = chapters.find((c) => c.id === chapterId)
  return c ? c.title : null
}
