'use client'

import { LessonShell, Metaphor, Intuition, Formal } from '@/components/lesson/LessonShell'
import { Quiz } from '@/components/lesson/Quiz'
import { AryqGradient } from '@/components/interactive/AryqGradient'
import { useProgress } from '@/lib/progress'

const frontmatter = {
  module: 3,
  lesson: 2,
  slug: 'module-3-lesson-2',
  title: 'Градиентті есептеу',
  titleRu: 'Вычисление градиента',
  minutes: 11,
  concepts: ['gradient', 'derivative'],
  terms: ['градиент', 'туынды'],
}

const quizQuestions = [
  {
    id: 'q1',
    question: 'Градиент деген не?',
    options: [
      { id: 'a', text: 'Өзгеріс қарқыны', explanation: 'Дұрыс! Градиент — бұл функцияның өзгеріс қарқыны' },
      { id: 'b', text: 'Функцияның мәні', explanation: 'Бұл дұрыс емес' },
      { id: 'c', text: 'Нүктенің координатасы', explanation: 'Бұл дұрыс емес' },
    ],
    correctId: 'a',
  },
  {
    id: 'q2',
    question: 'Градиент неге керек?',
    options: [
      { id: 'a', text: 'Қай бағытта бару керектігін білу', explanation: 'Дұрыс! Градиент төменге бағыт көрсетеді' },
      { id: 'b', text: 'Жоғарыға шығу', explanation: 'Керісінше, төменге' },
      { id: 'c', text: 'Орында қалу', explanation: 'Бұл дұрыс емес' },
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
      prevLesson={{ slug: 'module-3-lesson-1', title: 'Арық: модель қалай оқиды' }}
      nextLesson={{ slug: 'module-3-lesson-3', title: 'Оқу жылдамдығы' }}
      widget={<AryqGradient />}
      quiz={<Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
    >
      <Metaphor>
        <p className="mb-4">
          Су арықпен неге төмен ағады? Себебі <strong>градиент</strong> бар — 
          жерге қарай үйірленген жер.
        </p>
        <p>
          Градиент = еңкейіс. Қандай бағытта еңкейіс зор болса, су сол жаққа ағады.
        </p>
      </Metaphor>

      <Intuition>
        <p className="mb-4">
          Функцияның графигін елестет. Қай жерде ең тік? Сол жерде градиент үлкен.
          Қай жерде тегіс? Сол жерде градиент нөлге тең.
        </p>
        <p>
          Градиентті есептеп, қай бағытта бару керектігін білеміз.
        </p>
      </Intuition>

      <Formal term="Градиент (Gradient)">
        <p className="mb-4">
          Градиент — бұл функцияның барлық айнымалылары бойынша туындыларының жиынтығы.
          Ол функцияның өсу бағытын көрсетеді.
        </p>
        <code className="block p-3 bg-dala-surface rounded text-sm font-mono">
          ∇f(x) = [df/dx₁, df/dx₂, ...]{'\n'}
          {'\n'}
          # Градиенттік түсу{'\n'}
          x = x - α · ∇f(x)
        </code>
      </Formal>
    </LessonShell>
  )
}
