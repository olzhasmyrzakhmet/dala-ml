'use client'

import type { ReactNode } from 'react'
import { LessonShell } from './LessonShell'
import { Quiz, type QuizQuestion } from './Quiz'
import { getLesson } from '@/lib/content'
import { useProgress } from '@/lib/progress'

/**
 * Обёртка страницы урока: frontmatter берётся из реестра курса,
 * поэтому карта курса и сам урок физически не могут разойтись.
 */
export function LessonPage({
  slug,
  widget,
  questions,
  children,
}: {
  slug: string
  widget?: ReactNode
  questions: QuizQuestion[]
  children: ReactNode
}) {
  const { complete } = useProgress()
  const frontmatter = getLesson(slug)

  if (!frontmatter) {
    throw new Error(`Урок «${slug}» отсутствует в реестре lib/content.ts`)
  }

  return (
    <LessonShell
      frontmatter={frontmatter}
      widget={widget}
      quiz={<Quiz questions={questions} onComplete={(score, answers) => complete(slug, score, answers)} />}
    >
      {children}
    </LessonShell>
  )
}
