'use client'

import Link from 'next/link'
import { ReactNode } from 'react'
import { LessonFrontmatter } from '@/lib/content'
import { useProgress } from '@/lib/progress'

interface LessonShellProps {
  frontmatter: LessonFrontmatter
  prevLesson: { slug: string; title: string } | null
  nextLesson: { slug: string; title: string } | null
  children: ReactNode
  widget?: ReactNode
  quiz?: ReactNode
}

export function LessonShell({
  frontmatter,
  prevLesson,
  nextLesson,
  children,
  widget,
  quiz,
}: LessonShellProps) {
  const { getProgressFor } = useProgress()
  const progress = getProgressFor(frontmatter.slug)

  return (
    <div className="min-h-screen">
      {/* Progress bar */}
      <div className="sticky top-0 z-50 bg-dala-bg border-b border-dala-gold/20">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-dala-muted">
              Модуль {frontmatter.module} · Сабақ {frontmatter.lesson}
            </span>
            <span className="text-sm text-dala-muted">{frontmatter.minutes} мин</span>
          </div>
          <div className="h-1 bg-dala-surface rounded-full">
            <div
              className="h-full bg-dala-water rounded-full transition-all"
              style={{ width: progress?.done ? '100%' : '0%' }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-dala-gold mb-2">{frontmatter.title}</h1>
        {frontmatter.titleRu && (
          <p className="text-dala-muted text-sm mb-6">{frontmatter.titleRu}</p>
        )}

        {/* Content sections */}
        <div className="space-y-8">
          {children}
        </div>

        {/* Widget section */}
        {widget && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-dala-text mb-4">Интерактив</h2>
            {widget}
          </section>
        )}

        {/* Quiz section */}
        {quiz && (
          <section className="mt-12">
            <h2 className="text-xl font-semibold text-dala-text mb-4">Тексеру</h2>
            {quiz}
          </section>
        )}

        {/* Navigation */}
        <nav className="mt-12 flex gap-4">
          {prevLesson ? (
            <Link
              href={`/kurs/module-${frontmatter.module}/lesson-${frontmatter.lesson - 1}`}
              className="flex-1 p-4 bg-dala-surface rounded-xl border border-dala-gold/20 hover:border-dala-gold/40 transition-all"
            >
              <span className="text-xs text-dala-muted">Алдыңғы</span>
              <p className="text-dala-text font-medium">← {prevLesson.title}</p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
          
          {nextLesson ? (
            <Link
              href={`/kurs/module-${frontmatter.module}/lesson-${frontmatter.lesson + 1}`}
              className="flex-1 p-4 bg-dala-surface rounded-xl border border-dala-gold/20 hover:border-dala-gold/40 transition-all text-right"
            >
              <span className="text-xs text-dala-muted">Келесі</span>
              <p className="text-dala-text font-medium">{nextLesson.title} →</p>
            </Link>
          ) : (
            <div className="flex-1" />
          )}
        </nav>
      </main>
    </div>
  )
}

// Section components
export function Metaphor({ children }: { children: ReactNode }) {
  return (
    <section className="p-6 bg-dala-surface rounded-xl border border-dala-water/30">
      <h3 className="text-lg font-semibold text-dala-water mb-3">Метафора</h3>
      <div className="text-dala-text">{children}</div>
    </section>
  )
}

export function Intuition({ children }: { children: ReactNode }) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-dala-text mb-3">Интуиция</h3>
      <div className="text-dala-text leading-relaxed">{children}</div>
    </section>
  )
}

export function Formal({ children, term }: { children: ReactNode; term?: string }) {
  return (
    <section className="p-6 bg-dala-bg rounded-xl border border-dala-gold/20">
      <h3 className="text-lg font-semibold text-dala-gold mb-3">
        {term && <span className="text-dala-water">{term}</span>}
      </h3>
      <div className="text-dala-text">{children}</div>
    </section>
  )
}

export function Code({ children, language = 'python' }: { children: string; language?: string }) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-dala-text mb-3">Код</h3>
      <pre className="p-4 bg-dala-bg rounded-xl overflow-x-auto">
        <code className="text-sm font-mono text-dala-text">{children}</code>
      </pre>
    </section>
  )
}
