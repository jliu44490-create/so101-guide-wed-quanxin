'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { chapters as baseChapters } from './course-data'
import type { Chapter } from './types'

/**
 * 学习进度跟踪系统
 * --------------------------------------------------
 * 进度全部存在 localStorage，跨组件用 storage 事件 + 自定义事件同步。
 *
 * - 用户首次访问一个章节详情 → 自动标 in-progress (50%)
 * - 用户手动点 "标记完成" → completed (100%)
 * - 重置后回到 base 数据里写死的初始状态（不再被卡在硬编码值）
 */

const STORAGE_KEY = 'so101-progress-v1'
const EVENT_NAME = 'so101-progress-change'

export type ChapterStatus = 'locked' | 'in-progress' | 'completed'

export interface UserProgressEntry {
  status: ChapterStatus
  progress: number // 0-100
  completedAt?: string
  visitedAt?: string
}

export type ProgressMap = Record<number, UserProgressEntry>

function readStorage(): ProgressMap {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as ProgressMap) : {}
  } catch {
    return {}
  }
}

function writeStorage(map: ProgressMap) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map))
    window.dispatchEvent(new CustomEvent(EVENT_NAME))
  } catch {
    // storage full / disabled
  }
}

/**
 * 把 base chapter 数据和用户进度合并，得到"有效"状态
 */
/** Status is always derived from progress so the badge and the bar can never disagree. */
export function deriveStatus(progress: number): ChapterStatus {
  if (progress >= 100) return 'completed'
  if (progress > 0) return 'in-progress'
  return 'locked'
}

export function applyUserProgress(chapter: Chapter, map: ProgressMap): Chapter {
  const entry = map[chapter.id]
  const progress = entry?.progress ?? chapter.progress
  return {
    ...chapter,
    status: deriveStatus(progress),
    progress
  }
}

export function useProgress() {
  const [map, setMap] = useState<ProgressMap>({})
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setMap(readStorage())
    setHydrated(true)
    const onChange = () => setMap(readStorage())
    window.addEventListener(EVENT_NAME, onChange)
    window.addEventListener('storage', onChange)
    return () => {
      window.removeEventListener(EVENT_NAME, onChange)
      window.removeEventListener('storage', onChange)
    }
  }, [])

  const markVisited = useCallback((chapterId: number) => {
    const current = readStorage()
    // 仅在没有任何进度时才升级为 in-progress，已完成的不回退
    if (!current[chapterId]) {
      current[chapterId] = {
        status: 'in-progress',
        progress: 50,
        visitedAt: new Date().toISOString()
      }
      writeStorage(current)
    }
  }, [])

  const markCompleted = useCallback((chapterId: number) => {
    const current = readStorage()
    current[chapterId] = {
      status: 'completed',
      progress: 100,
      visitedAt: current[chapterId]?.visitedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString()
    }
    writeStorage(current)
  }, [])

  const markInProgress = useCallback((chapterId: number) => {
    const current = readStorage()
    current[chapterId] = {
      status: 'in-progress',
      progress: 50,
      visitedAt: current[chapterId]?.visitedAt ?? new Date().toISOString()
    }
    writeStorage(current)
  }, [])

  const resetChapter = useCallback((chapterId: number) => {
    const current = readStorage()
    delete current[chapterId]
    writeStorage(current)
  }, [])

  const resetAll = useCallback(() => {
    writeStorage({})
  }, [])

  return {
    /** SSR-safe：是否已加载完 localStorage */
    hydrated,
    /** 原始进度 map（chapterId → entry） */
    map,
    markVisited,
    markCompleted,
    markInProgress,
    resetChapter,
    resetAll
  }
}

/**
 * 用 useProgress 把 baseChapters 转成"实际章节"
 */
export function useChapters() {
  const { map, hydrated } = useProgress()
  const chapters = useMemo(
    () => baseChapters.map((c) => applyUserProgress(c, map)),
    [map]
  )
  return { chapters, hydrated }
}

/**
 * 计算总体统计：completed / inProgress / locked / totalProgress / totalMinutes
 */
export function useChapterStats() {
  const { chapters, hydrated } = useChapters()
  return useMemo(() => {
    const completed = chapters.filter((c) => c.status === 'completed').length
    const inProgress = chapters.filter((c) => c.status === 'in-progress').length
    const locked = chapters.filter((c) => c.status === 'locked').length
    const totalProgress = Math.round(
      chapters.reduce((acc, c) => acc + c.progress, 0) / chapters.length
    )
    const totalMinutes = chapters.reduce((acc, c) => {
      const m = parseInt(c.duration)
      return acc + (isNaN(m) ? 0 : m)
    }, 0)
    return {
      hydrated,
      chapters,
      total: chapters.length,
      completed,
      inProgress,
      locked,
      totalProgress,
      totalMinutes
    }
  }, [chapters, hydrated])
}
