'use client'

import { LessonShell, Metaphor, Intuition, Formal } from '@/components/lesson/LessonShell'
import { Quiz } from '@/components/lesson/Quiz'
import { useProgress } from '@/lib/progress'

const frontmatter = {
  module: 1,
  lesson: 1,
  slug: 'module-1-lesson-1',
  title: 'Мәліметтер деген не?',
  titleRu: 'Что такое данные?',
  minutes: 10,
  concepts: ['data', 'features'],
  terms: ['мәліметтер', 'ерекшеліктер'],
}

const quizQuestions = [
  {
    id: 'q1',
    question: 'Мәліметтер деген не?',
    options: [
      { id: 'a', text: 'Сандар мен мәтін', explanation: 'Дұрыс! Мәліметтер — бұл сандар, мәтін, суреттер...' },
      { id: 'b', text: 'Тек сандар', explanation: 'Мәліметтер тек сандар емес' },
      { id: 'c', text: 'Тек мәтін', explanation: 'Мәліметтер тек мәтін емес' },
    ],
    correctId: 'a',
  },
  {
    id: 'q2',
    question: 'Ерекшелік (feature) деген не?',
    options: [
      { id: 'a', text: 'Бір қасиет', explanation: 'Дұрыс! Ерекшелік — бұл бір қасиет' },
      { id: 'b', text: 'Бүкіл деректер', explanation: 'Бұл дұрыс емес' },
      { id: 'c', text: 'Модель', explanation: 'Бұл дұрыс емес' },
    ],
    correctId: 'a',
  },
]

export default function LessonPage() {
  const { complete } = useProgress()

  const handleQuizComplete = (score: number, answers: Record<string, string>) => {
    complete(frontmatter.slug, score, answers)
  }

  return (
    <LessonShell
      frontmatter={frontmatter}
      prevLesson={null}
      nextLesson={{ slug: 'module-1-lesson-2', title: 'Мәліметтер түрлері' }}
      quiz={<Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
    >
      <Metaphor>
        <p className="mb-4">
          Шопанның кітапшасында әр қой туралы ақпарат бар: жасы, түсі, салмағы.
          Бұл — <strong>мәліметтер</strong>.
        </p>
        <p>
          Әр қасиет (жас, түс, салмақ) — бұл <strong>ерекшелік</strong> (feature).
        </p>
      </Metaphor>

      <Intuition>
        <p className="mb-4">
          Мәліметтер — бұл біздің айналамыздағы нәрселер туралы ақпарат.
          Мысалы: ауа температурасы, машина бағасы, адам бойы.
        </p>
        <p>
          Ерекшеліктер — бұл мәліметтердің қасиеттері. Әр нәрсе бірнеше
          ерекшеліктен тұрады.
        </p>
      </Intuition>

      <Formal term="Мәліметтер (Data)">
        <p className="mb-4">
          Мәліметтер — бұл фактілер мен сандар жиынтығы, оларды талдауға
          және өңдеуге болады.
        </p>
        <code className="block p-3 bg-dala-surface rounded text-sm font-mono">
          қой = {'{'} жасы: 3, түсі: "ақ", салмақ: 45 {'}'}
        </code>
      </Formal>
    </LessonShell>
  )
}
