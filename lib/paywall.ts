/**
 * Paywall configuration — single source of truth for what's free vs locked.
 *
 * The entire paywall is gated behind NEXT_PUBLIC_PAYWALL_ENABLED. While that is
 * not exactly 'true', the site behaves exactly as before: every lesson and the
 * whole community are free. This lets us ship all the paywall code without
 * changing the live experience until the owner has Stripe + Supabase wired up
 * and deliberately flips the switch.
 */

export const PAYWALL_ENABLED = process.env.NEXT_PUBLIC_PAYWALL_ENABLED === 'true'

/** Chapters that stay free forever as a trial — chapters 1 and 2 are the taster. */
export const FREE_CHAPTER_IDS = [1, 2] as const

export function isChapterFree(chapterId: number): boolean {
  return FREE_CHAPTER_IDS.includes(chapterId as (typeof FREE_CHAPTER_IDS)[number])
}

/**
 * Whether a given chapter requires entitlement to access.
 * Free for everyone when the paywall is disabled OR the chapter is in the free list.
 */
export function chapterRequiresAccess(chapterId: number): boolean {
  if (!PAYWALL_ENABLED) return false
  return !isChapterFree(chapterId)
}

/** Display prices. Real charge amounts live in Stripe (price IDs), not here. */
export const PRICING = {
  cny: { label: '¥99', amount: 99, currency: 'CNY', note: '人民币' },
  jpy: { label: '¥2,400', amount: 2400, currency: 'JPY', note: '日元' }
} as const

export type PriceCurrency = keyof typeof PRICING

/** Everything a paid user gets — shown on the /unlock page. */
export const UNLOCK_BENEFITS = [
  '解锁全部 9 节互动课程（含逐课讲解、动手练习、自测）',
  '解锁全部 9 章完整文档版',
  '社区发帖、提问、回答、点赞权限',
  '一次性买断，永久有效，后续新增章节免费同步',
  '错误诊断库 + AI 助手全功能'
] as const
