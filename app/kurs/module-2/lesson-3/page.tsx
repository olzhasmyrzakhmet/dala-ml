'use client'

import { LessonShell, Metaphor, Intuition, Formal } from '@/components/lesson/LessonShell'
import { Quiz } from '@/components/lesson/Quiz'
import { useProgress } from '@/lib/progress'

const frontmatter = {
  module: 2,
  lesson: 3,
  slug: 'module-2-lesson-3',
  title: 'Ең кіші квадраттар',
  titleRu: 'Метод наименьших квадратов',
  minutes: 10,
  concepts: ['least_squares', 'error_minimization'],
  terms: ['ең кіші квадраттар', 'қателікті кеміту'],
}

const quizQuestions = [
  {
    id: 'q1',
    question: 'Ең кіші квадраттар не істейді?',
    options: [
      { id: 'a', text: 'Қателікті кемітеді', explanation: 'Дұрыс! Нүктелерден түзуге қашықтықты минимизациялайды' },
      { id: 'b', text: 'Нүктелерді өшіреді', explanation: 'Жоқ, нүктелерді сақтайды' },
      { id: 'c', text: 'Түзуды ұзартады', explanation: 'Бұл дұрыс емес' },
    ],
    correctId: 'a',
  },
  {
    id: 'q2',
    question: 'Қашықтық не үшін квадратталады?',
    options: [
      { id: 'a', text: 'Жақын нүктелер маңызды', explanation: 'Бұл да дұрыс, негізгі себебі — теріс қашықтықты болдырмау' },
      { id: 'b', text: 'Теріс сан болмас үшін', explanation: 'Дұрыс! Квадрат теріс санды оңға айналдырады' },
      { id: 'c', text: 'Тездету үшін', explanation: 'Бұл дұрыс емес' },
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
      prevLesson={{ slug: 'module-2-lesson-2', title: 'Сызықтық регрессия' }}
      nextLesson={{ slug: 'module-3-lesson-1', title: 'Арық: модель қалай оқиды' }}
      quiz={<Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
    >
      <Metaphor>
        <p className="mb-4">
          Шопан жолды туралағанда, ең қысқа жолды таңдайды. 
          <strong>Ең кіші квадраттар</strong> — нүктелерден ең жақын түзуды табу.
        </p>
        <p>
          Қашықтықты квадраттаймыз, теріс сан болмас үшін.
        </p>
      </Metaphor>

      <Intuition>
        <p className="mb-4">
          Әр нүктеден түзуге қашықтықты өлшейміз. Бұл қашықтықтардың квадраттарын
          қосамыз. Ең кіші санды беретін түзу — ең жақсысы.
        </p>
        <p>
          Неге квадрат? Себебі қашықтық оң да, теріс де болуы мүмкін.
          Квадрат екеуін де оңға айналдырады.
        </p>
      </Intuition>

      <Formal term="Ең кіші квадраттар (Least Squares)">
        <p className="mb-4">
          Мақсат: ∑(yᵢ - ŷᵢ)² → min, мұнда yᵢ — шынық мән, ŷᵢ — болжам.
        </p>
        <code className="block p-3 bg-dala-surface rounded text-sm font-mono">
          # Қателік = шынық - болжам{'\n'}
          қателік = y - (mx + b){'\n'}
          {'\n'}
          # Жиынтық квадрат қателік{'\n'}
          J = sum(қателік²){'\n'}
          {'\n'}
          # Мақсат: J кеміту
        </code>
      </Formal>
    </LessonShell>
  )
}
