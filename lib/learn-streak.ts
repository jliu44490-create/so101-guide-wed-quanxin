'use client'

/**
 * Daily study-streak tracking (localStorage only, zero deps).
 *
 * A "study day" is stamped whenever the learner is active (lands on the learn
 * hub or finishes a lesson). The streak is the number of consecutive calendar
 * days ending today — or yesterday, so a streak doesn't visually break until a
 * whole day is actually missed.
 */

import { useEffect, useState } from 'react'

const KEY = 'so101-study-days-v1'
export const STREAK_EVENT = 'so101-streak-change'

function dayStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`
}

function read(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}

export function recordStudyDay(): void {
  if (typeof window === 'undefined') return
  const days = read()
  const today = dayStr(new Date())
  if (days.includes(today)) return
  days.push(today)
  // Keep it bounded — only the last ~400 days matter.
  const trimmed = days.slice(-400)
  try {
    localStorage.setItem(KEY, JSON.stringify(trimmed))
    window.dispatchEvent(new CustomEvent(STREAK_EVENT))
  } catch {
    // storage full / disabled — streak is a nicety, never throw
  }
}

export function getStudyStreak(): number {
  const days = new Set(read())
  if (days.size === 0) return 0
  const cursor = new Date()
  // If today isn't stamped yet, the streak can still stand on yesterday.
  if (!days.has(dayStr(cursor))) {
    cursor.setDate(cursor.getDate() - 1)
    if (!days.has(dayStr(cursor))) return 0
  }
  let streak = 0
  while (days.has(dayStr(cursor))) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

/** Read the streak, and (optionally) stamp today as a study day on mount. */
export function useStudyStreak(record = false): number {
  const [streak, setStreak] = useState(0)
  useEffect(() => {
    if (record) recordStudyDay()
    setStreak(getStudyStreak())
    const sync = () => setStreak(getStudyStreak())
    window.addEventListener(STREAK_EVENT, sync)
    return () => window.removeEventListener(STREAK_EVENT, sync)
  }, [record])
  return streak
}
