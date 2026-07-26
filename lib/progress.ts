import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'dala:progress:v1'

export interface LessonProgress {
  done: boolean
  score: number
  at: string // ISO date
  answers?: Record<string, string>
}

export interface ProgressData {
  lessons: Record<string, LessonProgress>
  lastSlug: string | null
  downloadedModules: number[]
}

const defaultProgress: ProgressData = {
  lessons: {},
  lastSlug: null,
  downloadedModules: [],
}

// Get progress from localStorage
export function getProgress(): ProgressData {
  if (typeof window === 'undefined') return defaultProgress
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return defaultProgress
    return { ...defaultProgress, ...JSON.parse(stored) }
  } catch {
    return defaultProgress
  }
}

// Save progress to localStorage
export function saveProgress(data: ProgressData): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('Failed to save progress:', e)
  }
}

// Mark lesson as completed
export function completeLesson(slug: string, score: number, answers?: Record<string, string>): void {
  const progress = getProgress()
  progress.lessons[slug] = {
    done: true,
    score,
    at: new Date().toISOString(),
    answers,
  }
  progress.lastSlug = slug
  saveProgress(progress)
}

// Get lesson progress
export function getLessonProgress(slug: string): LessonProgress | null {
  const progress = getProgress()
  return progress.lessons[slug] || null
}

// Get continue lesson (last incomplete or last completed)
export function getContinueLesson(): string | null {
  const progress = getProgress()
  return progress.lastSlug
}

// Export progress as JSON file
export function exportProgress(): string {
  const progress = getProgress()
  return JSON.stringify(progress, null, 2)
}

// Import progress from JSON
export function importProgress(json: string): boolean {
  try {
    const data = JSON.parse(json)
    // Validate structure
    if (data.lessons && typeof data.lessons === 'object') {
      saveProgress(data as ProgressData)
      return true
    }
    return false
  } catch {
    return false
  }
}

// Download module for offline
export function downloadModule(moduleId: number): void {
  const progress = getProgress()
  if (!progress.downloadedModules.includes(moduleId)) {
    progress.downloadedModules.push(moduleId)
    saveProgress(progress)
  }
}

// React hook for progress
export function useProgress() {
  const [progress, setProgress] = useState<ProgressData>(defaultProgress)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setProgress(getProgress())
    setIsLoaded(true)
  }, [])

  const complete = useCallback((slug: string, score: number, answers?: Record<string, string>) => {
    completeLesson(slug, score, answers)
    setProgress(getProgress())
  }, [])

  const getProgressFor = useCallback((slug: string) => {
    return progress.lessons[slug] || null
  }, [progress])

  const getContinue = useCallback(() => {
    return progress.lastSlug
  }, [progress])

  const isModuleDownloaded = useCallback((moduleId: number) => {
    return progress.downloadedModules.includes(moduleId)
  }, [progress])

  const download = useCallback((moduleId: number) => {
    downloadModule(moduleId)
    setProgress(getProgress())
  }, [])

  const exportData = useCallback(() => {
    return exportProgress()
  }, [])

  const importData = useCallback((json: string) => {
    const success = importProgress(json)
    if (success) {
      setProgress(getProgress())
    }
    return success
  }, [])

  return {
    progress,
    isLoaded,
    complete,
    getProgressFor,
    getContinue,
    isModuleDownloaded,
    download,
    exportData,
    importData,
  }
}
