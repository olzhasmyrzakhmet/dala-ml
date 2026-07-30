import { describe, it, expect, beforeEach, vi } from 'vitest'

/** Минимальный localStorage: тесты идут в node-окружении. */
class MemoryStorage {
  private map = new Map<string, string>()
  getItem(k: string) {
    return this.map.has(k) ? this.map.get(k)! : null
  }
  setItem(k: string, v: string) {
    this.map.set(k, String(v))
  }
  removeItem(k: string) {
    this.map.delete(k)
  }
  clear() {
    this.map.clear()
  }
}

const storage = new MemoryStorage()
vi.stubGlobal('window', { localStorage: storage, addEventListener() {}, removeEventListener() {} })
vi.stubGlobal('localStorage', storage)

import {
  STORAGE_KEY,
  completeLesson,
  downloadModule,
  exportProgress,
  forgetModule,
  getProgress,
  importProgress,
  resetProgress,
  visitLesson,
  __resetStoreForTests,
} from '@/lib/progress'

beforeEach(() => {
  storage.clear()
  __resetStoreForTests()
})

describe('Прогресс: хранение (SPEC §5)', () => {
  it('использует ключ dala:progress:v1', () => {
    completeLesson('module-1-lesson-1', 80)
    expect(storage.getItem(STORAGE_KEY)).not.toBeNull()
    expect(STORAGE_KEY).toBe('dala:progress:v1')
  })

  it('у нового пользователя пусто, но структура валидна', () => {
    const p = getProgress()
    expect(p.lessons).toEqual({})
    expect(p.lastSlug).toBeNull()
    expect(p.downloadedModules).toEqual([])
  })

  it('открытие урока запоминает lastSlug', () => {
    visitLesson('module-2-lesson-1')
    const p = getProgress()
    expect(p.lastSlug).toBe('module-2-lesson-1')
    expect(p.lessons['module-2-lesson-1'].done).toBe(false)
    expect(p.lessons['module-2-lesson-1'].seenAt).toBeTruthy()
  })

  it('прохождение урока пишет отметку, балл и дату', () => {
    completeLesson('module-3-lesson-1', 80, { q1: 'a' })
    const l = getProgress().lessons['module-3-lesson-1']
    expect(l.done).toBe(true)
    expect(l.score).toBe(80)
    expect(l.answers).toEqual({ q1: 'a' })
    expect(Number.isNaN(Date.parse(l.at))).toBe(false)
  })

  it('повторное открытие пройденного урока не сбрасывает отметку', () => {
    completeLesson('module-1-lesson-1', 100)
    visitLesson('module-1-lesson-1')
    expect(getProgress().lessons['module-1-lesson-1'].done).toBe(true)
    expect(getProgress().lessons['module-1-lesson-1'].score).toBe(100)
  })

  it('балл зажимается в 0…100', () => {
    completeLesson('a-1', 140)
    completeLesson('b-1', -20)
    expect(getProgress().lessons['a-1'].score).toBe(100)
    expect(getProgress().lessons['b-1'].score).toBe(0)
  })

  it('состояние переживает «перезагрузку» — чтение из хранилища заново', () => {
    completeLesson('module-1-lesson-2', 60)
    __resetStoreForTests() // как будто страница открыта заново
    expect(getProgress().lessons['module-1-lesson-2'].done).toBe(true)
  })

  it('скачанные модули не дублируются и снимаются', () => {
    downloadModule(3)
    downloadModule(3)
    expect(getProgress().downloadedModules).toEqual([3])
    forgetModule(3)
    expect(getProgress().downloadedModules).toEqual([])
  })

  it('сброс очищает всё', () => {
    completeLesson('module-1-lesson-1', 100)
    downloadModule(1)
    resetProgress()
    expect(getProgress()).toEqual({ lessons: {}, lastSlug: null, downloadedModules: [] })
  })
})

describe('Прогресс: экспорт и импорт', () => {
  it('экспорт даёт валидный JSON, импорт его восстанавливает', () => {
    completeLesson('module-2-lesson-3', 75)
    downloadModule(2)
    const dump = exportProgress()
    expect(() => JSON.parse(dump)).not.toThrow()

    resetProgress()
    expect(getProgress().lessons).toEqual({})

    expect(importProgress(dump)).toBe(true)
    expect(getProgress().lessons['module-2-lesson-3'].score).toBe(75)
    expect(getProgress().downloadedModules).toEqual([2])
  })

  it('битый или чужой файл отвергается, текущий прогресс цел', () => {
    completeLesson('module-1-lesson-1', 90)
    expect(importProgress('{это не json')).toBe(false)
    expect(importProgress('{"lessons": 5}')).toBe(false)
    expect(importProgress('[]')).toBe(false)
    expect(getProgress().lessons['module-1-lesson-1'].score).toBe(90)
  })

  it('повреждённое хранилище не роняет приложение', () => {
    storage.setItem(STORAGE_KEY, '{"lessons": сломано')
    __resetStoreForTests()
    expect(() => getProgress()).not.toThrow()
    expect(getProgress().lessons).toEqual({})
  })

  it('лишние поля в файле отбрасываются, а не протекают внутрь', () => {
    expect(
      importProgress(
        JSON.stringify({ lessons: {}, lastSlug: null, downloadedModules: [], hack: 'evil' })
      )
    ).toBe(true)
    expect('hack' in getProgress()).toBe(false)
  })
})
