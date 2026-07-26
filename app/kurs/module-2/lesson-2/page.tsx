'use client'

import { LessonShell, Metaphor, Intuition, Formal } from '@/components/lesson/LessonShell'
import { Quiz } from '@/components/lesson/Quiz'
import { TangbaClassify } from '@/components/interactive/TangbaClassify'
import { useProgress } from '@/lib/progress'

const frontmatter = {
  module: 2,
  lesson: 2,
  slug: 'module-2-lesson-2',
  title: 'Сызықтық регрессия',
  titleRu: 'Линейная регрессия',
  minutes: 12,
  concepts: ['linear_regression', 'slope', 'intercept'],
  terms: ['сызықтық регрессия', 'бұрыш', 'кесінді'],
}

const quizQuestions = [
  {
    id: 'q1',
    question: 'Сызықтық регрессия не істейді?',
    options: [
      { id: 'a', text: 'Түзу сызық сызады', explanation: 'Дұрыс! Екі нүктені қосатын ең жақсы түзу' },
      { id: 'b', text: 'Санаттарға бөледі', explanation: 'Бұл классификация' },
      { id: 'c', text: 'Шуды кетіреді', explanation: 'Бұл тазалау' },
    ],
    correctId: 'a',
  },
  {
    id: 'q2',
    question: 'Бұрыш не көрсетеді?',
    options: [
      { id: 'a', text: 'Жолдың басталуын', explanation: 'Бұл кесінді' },
      { id: 'b', text: 'Жолдың көтерілуін', explanation: 'Дұрыс! Қандай қарқынмен өседі' },
      { id: 'c', text: 'Жолдың ұзындығын', explanation: 'Бұл қателік' },
    ],
    correctId: 'b',
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
      prevLesson={{ slug: 'module-2-lesson-1', title: 'Заңдылықты іздеу' }}
      nextLesson={{ slug: 'module-2-lesson-3', title: 'Ең кіші квадраттар' }}
      widget={<TangbaClassify />}
      quiz={<Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
    >
      <Metaphor>
        <p className="mb-4">
          Степте екі нүкте arasýнда ең қысқа жол — <strong>түзу сызық</strong>.
          Сызықтық регрессия дәл солай: екі нүктені қосатын түзу табу.
        </p>
        <p>
          Бұрыш = жолдың көтерілуі. Кесінді = жолдың басталуы.
        </p>
      </Metaphor>

      <Intuition>
        <p className="mb-4">
          Көз алдыңда нүктелер шашырап тұр. Қай түзу оларды ең жақсын анықтайды?
          Сол түзуді табу керек.
        </p>
        <p>
          Бұрыш үлкен болса — өсу қарқынды. Кесінді = y = mx + b формуласындағы b.
        </p>
      </Intuition>

      <Formal term="Сызықтық регрессия (Linear Regression)">
        <p className="mb-4">
          Модель: y = mx + b, мұнда m — бұрыш (slope), b — кесінді (intercept).
        </p>
        <code className="block p-3 bg-dala-surface rounded text-sm font-mono">
          y = 2x + 5{'\n'}
          # Егер x = 3 → y = 2·3 + 5 = 11
        </code>
      </Formal>
    </LessonShell>
  )
}
