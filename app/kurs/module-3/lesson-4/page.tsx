'use client'

import { LessonShell, Metaphor, Intuition, Formal } from '@/components/lesson/LessonShell'
import { Quiz } from '@/components/lesson/Quiz'
import { OtarBatch } from '@/components/interactive/OtarBatch'
import { useProgress } from '@/lib/progress'

const frontmatter = {
  module: 3,
  lesson: 4,
  slug: 'module-3-lesson-4',
  title: 'Эпохалар мен батчтер',
  titleRu: 'Эпохи и батчи',
  minutes: 12,
  concepts: ['epoch', 'batch', 'batch_size'],
  terms: ['эпоха', 'батч', 'батч өлшемі'],
}

const quizQuestions = [
  {
    id: 'q1',
    question: 'Эпоха деген не?',
    options: [
      { id: 'a', text: 'Бір күн ішіндегі уақыт', explanation: 'Бұл дұрыс емес' },
      { id: 'b', text: 'Барлық деректерді бір рет өңдеу', explanation: 'Дұрыс! Барлық отарды бір рет айдау' },
      { id: 'c', text: 'Бір қойды жаю', explanation: 'Бұл батч' },
    ],
    correctId: 'b',
  },
  {
    id: 'q2',
    question: 'Batch size неге керек?',
    options: [
      { id: 'a', text: 'Барлық деректерді бірден жүктеу', explanation: 'Бұл дұрыс емес' },
      { id: 'b', text: 'Қолайлы топпен жұмыс істеу', explanation: 'Дұрыс! Отарды топтарға бөлу' },
      { id: 'c', text: 'Модельді тездету', explanation: 'Бұл дұрыс емес' },
    ],
    correctId: 'b',
  },
  {
    id: 'q3',
    question: 'Batch size = 1 болса?',
    options: [
      { id: 'a', text: 'SGD — стохастикалық градиенттік түсу', explanation: 'Дұрыс! Бір қойды бір уақытта жаю' },
      { id: 'b', text: 'Batch Gradient Descent', explanation: 'Бұл барлық деректер' },
      { id: 'c', text: 'Mini-batch', explanation: 'Бұл орташа мән' },
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
      prevLesson={{ slug: 'module-3-lesson-3', title: 'Оқу жылдамдығы' }}
      nextLesson={{ slug: 'module-4-lesson-1', title: 'Модуль 4: Таңба' }}
      widget={<OtarBatch />}
      quiz={<Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
    >
      <Metaphor>
        <p className="mb-4">
          Малшы отарды жаюға шығарда, барлық қойды бірден жаймайды. 
          Оларды топтарға бөліп, рет-ретімен жаяды.
        </p>
        <p>
          Эпоха = бір күнгі жайылт. Батч = бір топ қой. 
          Batch size = топтағы қой саны.
        </p>
      </Metaphor>

      <Intuition>
        <p className="mb-4">
          1000 суретті үйрету керек. Барлығын бірден жүктесең — компьютер 
          «шаршайды». Бірақ бір суретпен үйретсең — баяу.
        </p>
        <p>
          Шешім: 32 суреттік топтар (batch size = 32). 
          1000/32 ≈ 32 итерация = 1 эпоха.
        </p>
      </Intuition>

      <Formal term="Эпоха мен Батч (Epoch & Batch)">
        <p className="mb-4">
          <strong>Эпоха</strong> — бүкіл жаттықтыру жиынтығын бір рет өңдеу.
          <strong>Батч</strong> — бір градиент есептеуіне қолданылатын үлгі саны.
        </p>
        <code className="block p-3 bg-dala-surface rounded text-sm font-mono">
          # Мысал: 1000 сурет, batch_size=32{'\n'}
          batches_per_epoch = 1000 // 32 = 31{'\n'}
          {'\n'}
          # 10 эпоха = 10 рет барлық суретті көру{'\n'}
          total_iterations = 10 * 31 = 310{'\n'}
          {'\n'}
          # Batch size түрлері:{'\n'}
          # 1 = SGD (стохастикалық){'\n'}
          # n = Mini-batch (көбірек қолданылады){'\n'}
          # N = Batch GD (барлығы)
        </code>
        <p className="mt-4 text-sm text-dala-muted">
          Batch size үлкен болса — тез, бірақ көп жады керек. 
          Кішкентай болса — баяу, бірақ аз жады.
        </p>
      </Formal>
    </LessonShell>
  )
}
