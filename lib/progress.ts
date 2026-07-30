'use client'

import { useCallback, useEffect, useSyncExternalStore } from 'react'
import { z } from 'zod'

export const STORAGE_KEY = 'dala:progress:v1'

const lessonSchema = z.object({
  done: z.boolean().default(false),
  score: z.number().min(0).max(100).default(0),
  at: z.string().default(''),
  seenAt: z.string().optional(),
  answers: z.record(z.string()).optional(),
})

const progressSchema = z.object({
  lessons: z.record(lessonSchema).default({}),
  lastSlug: z.string().nullable().default(null),
  downloadedModules: z.array(z.number().int()).default([]),
})

export type LessonProgress = z.infer<typeof lessonSchema>
export type ProgressData = z.infer<typeof progressSchema>

const EMPTY: ProgressData = { lessons: {}, lastSlug: null, downloadedModules: [] }

/* ------------------------------------------------------------------ */
/* Маленький стор: без него каждый компонент держал бы свою копию      */
/* прогресса и «Жалғастыру» на главной не обновлялась бы после урока.  */
/* ------------------------------------------------------------------ */

let cache: ProgressData = EMPTY
let hydrated = false
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

function readStorage(): ProgressData {
  if (typeof window === 'undefined') return EMPTY
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return EMPTY
    const parsed = progressSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : EMPTY
  } catch {
    return EMPTY
  }
}

function writeStorage(next: ProgressData) {
  cache = next
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    } catch {
      // Приватный режим или переполнение — работаем дальше в памяти.
    }
  }
  emit()
}

function update(fn: (prev: ProgressData) => ProgressData) {
  if (!hydrated) {
    cache = readStorage()
    hydrated = true
  }
  writeStorage(fn(cache))
}

/* ------------------------------- API ------------------------------- */

export function getProgress(): ProgressData {
  if (!hydrated && typeof window !== 'undefined') {
    cache = readStorage()
    hydrated = true
  }
  return cache
}

/** Урок открыт. Именно это питает карточку «Жалғастыру». */
export function visitLesson(slug: string): void {
  update((prev) => {
    const existing = prev.lessons[slug]
    if (prev.lastSlug === slug && existing?.seenAt) return prev
    return {
      ...prev,
      lastSlug: slug,
      lessons: {
        ...prev.lessons,
        [slug]: {
          done: existing?.done ?? false,
          score: existing?.score ?? 0,
          at: existing?.at ?? '',
          answers: existing?.answers,
          seenAt: new Date().toISOString(),
        },
      },
    }
  })
}

/** Урок пройден: квиз сдан. */
export function completeLesson(slug: string, score: number, answers?: Record<string, string>): void {
  update((prev) => ({
    ...prev,
    lastSlug: slug,
    lessons: {
      ...prev.lessons,
      [slug]: {
        done: true,
        score: Math.round(Math.max(0, Math.min(100, score))),
        at: new Date().toISOString(),
        seenAt: prev.lessons[slug]?.seenAt ?? new Date().toISOString(),
        answers,
      },
    },
  }))
}

export function downloadModule(id: number): void {
  update((prev) =>
    prev.downloadedModules.includes(id)
      ? prev
      : { ...prev, downloadedModules: [...prev.downloadedModules, id] }
  )
}

export function forgetModule(id: number): void {
  update((prev) => ({ ...prev, downloadedModules: prev.downloadedModules.filter((m) => m !== id) }))
}

export function resetProgress(): void {
  update(() => EMPTY)
}

export function exportProgress(): string {
  return JSON.stringify(getProgress(), null, 2)
}

/** Импорт с проверкой схемы: чужой или битый файл не должен ломать приложение. */
export function importProgress(json: string): boolean {
  try {
    const parsed = progressSchema.safeParse(JSON.parse(json))
    if (!parsed.success) return false
    update(() => parsed.data)
    return true
  } catch {
    return false
  }
}

/* ------------------------------- Хук ------------------------------- */

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useProgress() {
  const progress = useSyncExternalStore(
    subscribe,
    () => cache,
    () => EMPTY
  )

  // Первое чтение только на клиенте: иначе разъедется серверная разметка.
  useEffect(() => {
    if (!hydrated) {
      cache = readStorage()
      hydrated = true
      emit()
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        cache = readStorage()
        emit()
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const getProgressFor = useCallback((slug: string) => progress.lessons[slug] ?? null, [progress])
  const isDone = useCallback((slug: string) => progress.lessons[slug]?.done === true, [progress])
  const isModuleDownloaded = useCallback(
    (id: number) => progress.downloadedModules.includes(id),
    [progress]
  )

  const doneCount = Object.values(progress.lessons).filter((l) => l.done).length
  const scores = Object.values(progress.lessons).filter((l) => l.done).map((l) => l.score)
  const averageScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0

  return {
    progress,
    doneCount,
    averageScore,
    lastSlug: progress.lastSlug,
    getProgressFor,
    isDone,
    isModuleDownloaded,
    complete: completeLesson,
    visit: visitLesson,
    download: downloadModule,
    forget: forgetModule,
    reset: resetProgress,
    exportJson: exportProgress,
    importJson: importProgress,
  }
}

/** Для тестов: сбрасывает и стор, и localStorage. */
export function __resetStoreForTests() {
  cache = EMPTY
  hydrated = false
  listeners.clear()
}
