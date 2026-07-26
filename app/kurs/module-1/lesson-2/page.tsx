'use client'

import { LessonShell, Metaphor, Intuition, Formal } from '@/components/lesson/LessonShell'
import { Quiz } from '@/components/lesson/Quiz'
import { DalaZheliNoise } from '@/components/interactive/DalaZheliNoise'
import { useProgress } from '@/lib/progress'

const frontmatter = {
  module: 1,
  lesson: 2,
  slug: 'module-1-lesson-2',
  title: 'Мәліметтер түрлері',
  titleRu: 'Типы данных',
  minutes: 10,
  concepts: ['numerical', 'categorical'],
  terms: ['сандық', 'саптық'],
}

const quizQuestions = [
  {
    id: 'q1',
    question: 'Салмақ қай типке жатады?',
    options: [
      { id: 'a', text: 'Сандық', explanation: 'Дұрыс! Салмақ санмен өлшенеді (45 кг, 50 кг)' },
      { id: 'b', text: 'Саптық', explanation: 'Саптық — санаттар (түстер, атаулар)' },
      { id: 'c', text: 'Екеуі де', explanation: 'Жоқ, салмақ тек сандық' },
    ],
    correctId: 'a',
  },
  {
    id: 'q2',
    question: 'Түс қай типке жатады?',
    options: [
      { id: 'a', text: 'Сандық', explanation: 'Түс санмен өлшенбейді' },
      { id: 'b', text: 'Саптық', explanation: 'Дұрыс! Түс — санат: ақ, қара, қызыл' },
      { id: 'c', text: 'Екеуі де', explanation: 'Жоқ, түс тек саптық' },
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
      prevLesson={{ slug: 'module-1-lesson-1', title: 'Мәліметтер деген не?' }}
      nextLesson={{ slug: 'module-1-lesson-3', title: 'Мәліметтерді тазалау' }}
      widget={<DalaZheliNoise />}
      quiz={<Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
    >
      <Metaphor>
        <p className="mb-4">
          Шопан малды санайды: <strong>салмақ</strong> — сандармен (45 кг),
          <strong>түс</strong> — атаулармен (ақ, қара).
        </p>
        <p>
          Бізде де мәліметтер екі типті болады: сандармен және санаттармен.
        </p>
      </Metaphor>

      <Intuition>
        <p className="mb-4">
          <strong>Сандық</strong> — сандармен өлшенетін. Мысалы: жас, бой, температура.
          Бұл мәліметтермен арифметикалық амалдар жасай аламыз.
        </p>
        <p>
          <strong>Саптық</strong> — санаттармен сипатталатын. Мысалы: түс, қала, жыныс.
          Бұлармен тек салыстыру жасаймыз.
        </p>
      </Intuition>

      <Formal term="Сандық vs Саптық">
        <p className="mb-4">
          Сандық мәліметтер — үзіліссіз немесе дискретті сандар.
          Саптық мәліметтер — номиналды немесе реттік категориялар.
        </p>
        <code className="block p-3 bg-dala-surface rounded text-sm font-mono">
          сандық = [45, 50, 55]  # кг{'\n'}
          саптық = ['ақ', 'қара', 'қоңыр']  # түс
        </code>
      </Formal>
    </LessonShell>
  )
}
