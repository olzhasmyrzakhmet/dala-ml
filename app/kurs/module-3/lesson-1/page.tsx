'use client'

import { LessonShell, Metaphor, Intuition, Formal } from '@/components/lesson/LessonShell'
import { Quiz } from '@/components/lesson/Quiz'
import { AryqGradient } from '@/components/interactive/AryqGradient'
import { useProgress } from '@/lib/progress'

const frontmatter = {
  module: 3,
  lesson: 1,
  slug: 'module-3-lesson-1',
  title: 'Арық: модель қалай оқиды',
  titleRu: 'Арык: как модель учится',
  minutes: 11,
  concepts: ['gradient_descent', 'learning_rate'],
  terms: ['градиенттік түсу', 'оқу жылдамдығы'],
}

const quizQuestions = [
  {
    id: 'q1',
    question: 'Су арықпен неге төмен ағады?',
    options: [
      { id: 'a', text: 'Салмақтың әсерінен', explanation: 'Су әрқашан төмен қарай ағады — бұл градиент!' },
      { id: 'b', text: 'Желдің әсерінен', explanation: 'Жел суды әр жерге шашуы мүмкін, бұл шуға ұқсайды' },
      { id: 'c', text: 'Қысымның әсерінен', explanation: 'Бұл дұрыс емес' },
    ],
    correctId: 'a',
  },
  {
    id: 'q2',
    question: 'Learning rate тым үлкен болса не болады?',
    options: [
      { id: 'a', text: 'Модель тез үйренеді', explanation: 'Жоқ, модель «бұзылады»' },
      { id: 'b', text: 'Модель шектен шығып кетеді', explanation: 'Дұрыс! Су арықтан асып кетеді' },
      { id: 'c', text: 'Ештеңе болмайды', explanation: 'Қате жауап' },
    ],
    correctId: 'b',
  },
  {
    id: 'q3',
    question: 'Локалды минимум деген не?',
    options: [
      { id: 'a', text: 'Шұңқырдағы су', explanation: 'Дұрыс! Су шұңқырда тұрып қалуы мүмкін' },
      { id: 'b', text: 'Табанға жеткен су', explanation: 'Бұл глобалды минимум' },
      { id: 'c', text: 'Асып кеткен су', explanation: 'Бұл расходимость' },
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
      prevLesson={{ slug: 'module-2-lesson-3', title: 'Модуль 2 аяқталды' }}
      nextLesson={{ slug: 'module-3-lesson-2', title: 'Градиентті есептеу' }}
      widget={<AryqGradient />}
      quiz={<Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
    >
      <Metaphor>
        <p className="mb-4">
          Степте су арықпен төмен қарай ағады. Неге? Себебі ол жерге қарай үйірленген
          жер — <strong>градиент</strong> бар. Су градиент бойыша қозғалады.
        </p>
        <p>
          Модель де дәл солай үйренеді — параметрлер градиент бойынша өзгеріп,
          қателікті кемітуге тырысады.
        </p>
      </Metaphor>

      <Intuition>
        <p className="mb-4">
          Көз алдыңа шұңқыр тартқан арықты елестет. Су үстінен түссе, қайда барады?
          Төменге! Егер көп су ағып түссе — тез, аз су — баяу.
        </p>
        <p>
          Learning rate = ағымның күші. Тым күшті болса — су асып кетеді.
          Тым әлсіз болса — шұңқырда тұрып қалады.
        </p>
      </Intuition>

      <Formal term="Градиенттік түсу (Gradient Descent)">
        <p className="mb-4">
          Бұл оптимизация алгоритмі. Модель қателік функциясының ең кішкентай
          мәнін табуға тырысады.
        </p>
        <code className="block p-3 bg-dala-surface rounded text-sm font-mono">
          θ = θ - α · ∇J(θ)
        </code>
        <p className="mt-4 text-sm text-dala-muted">
          Мұнда θ — параметрлер, α — learning rate, ∇J — градиент.
        </p>
      </Formal>
    </LessonShell>
  )
}
