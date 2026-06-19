'use client'

/**
 * Tiny window-event bus that lets any part of the site poke the 电子学习伴侣.
 *
 * The companion (components/learning-companion.tsx) is mounted once in the root
 * layout and subscribes via `onCompanion`. Feature surfaces — the lesson player,
 * a doc page — fire `emitCompanion(...)` without importing the component or
 * sharing React state. Decoupled by design: emitters don't care whether a
 * companion is even mounted (it only is for opted-in Plus users).
 */

export type CompanionEvent =
  | { type: 'lesson-correct'; streak?: number }
  | { type: 'lesson-wrong'; chapterId?: number; question?: string; answer?: string }
  | { type: 'explain'; topic: string; context?: string }
  | { type: 'open' }

const NAME = 'lvjin:companion'

export function emitCompanion(event: CompanionEvent): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent<CompanionEvent>(NAME, { detail: event }))
}

/** Subscribe; returns an unsubscribe fn. Safe to call only on the client. */
export function onCompanion(cb: (event: CompanionEvent) => void): () => void {
  const handler = (ev: Event) => cb((ev as CustomEvent<CompanionEvent>).detail)
  window.addEventListener(NAME, handler)
  return () => window.removeEventListener(NAME, handler)
}
