'use client'

import Link from 'next/link'
import { modules, getModuleLessons } from '@/lib/content'
import { useProgress } from '@/lib/progress'

export default function CoursePage() {
  const { progress, isModuleDownloaded, download } = useProgress()

  const getModuleProgress = (moduleId: number) => {
    const lessons = getModuleLessons(moduleId)
    const completed = lessons.filter((l) => progress.lessons[l.slug]?.done).length
    return { completed, total: lessons.length }
  }

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-dala-gold mb-2">Курс: Машиналық оқу</h1>
      <p className="text-dala-muted mb-8">8 модуль, 22 апта. Стептік метафоралар арқылы.</p>

      {/* Continue card */}
      {progress.lastSlug && (
        <Link
          href={`/kurs/${progress.lastSlug}`}
          className="block mb-8 p-4 bg-dala-water/10 rounded-xl border border-dala-water/30 hover:border-dala-water transition-all"
        >
          <span className="text-xs text-dala-water">Жалғастыру</span>
          <p className="text-dala-text font-medium">→ {progress.lastSlug}</p>
        </Link>
      )}

      {/* Modules */}
      <div className="space-y-4">
        {modules.map((module) => {
          const { completed, total } = getModuleProgress(module.id)
          const isDownloaded = isModuleDownloaded(module.id)

          return (
            <div
              key={module.id}
              className="p-4 bg-dala-surface rounded-xl border border-dala-gold/20"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-dala-water text-sm">Модуль {module.id}</span>
                  <h2 className="text-lg font-semibold text-dala-text">{module.title}</h2>
                  <p className="text-dala-muted text-sm">{module.titleRu}</p>
                </div>
                <button
                  onClick={() => download(module.id)}
                  className={`px-3 py-1 rounded text-xs font-medium transition-all ${
                    isDownloaded
                      ? 'bg-dala-water/20 text-dala-water'
                      : 'bg-dala-bg text-dala-muted hover:bg-dala-water/10'
                  }`}
                >
                  {isDownloaded ? '✓ Жүктелді' : 'Жүктеу'}
                </button>
              </div>

              {/* Progress bar */}
              <div className="h-1 bg-dala-bg rounded-full mb-3">
                <div
                  className="h-full bg-dala-water rounded-full transition-all"
                  style={{ width: `${(completed / total) * 100}%` }}
                />
              </div>

              {/* Lessons */}
              <div className="flex gap-2">
                {Array.from({ length: module.lessons }, (_, i) => {
                  const lessonSlug = `module-${module.id}-lesson-${i + 1}`
                  const isDone = progress.lessons[lessonSlug]?.done

                  return (
                    <Link
                      key={i}
                      href={`/kurs/module-${module.id}/lesson-${i + 1}`}
                      className={`flex-1 py-2 rounded text-center text-sm font-medium transition-all ${
                        isDone
                          ? 'bg-dala-water text-dala-bg'
                          : 'bg-dala-bg text-dala-muted hover:bg-dala-water/20'
                      }`}
                    >
                      {isDone ? '✓' : i + 1}
                    </Link>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </main>
  )
}
