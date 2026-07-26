'use client'

import { LessonShell, Metaphor, Intuition, Formal } from '@/components/lesson/LessonShell'
import { Quiz } from '@/components/lesson/Quiz'
import { AryqGradient } from '@/components/interactive/AryqGradient'
import { useProgress } from '@/lib/progress'

const frontmatter = {
  module: 3,
  lesson: 3,
  slug: 'module-3-lesson-3',
  title: 'Оқу жылдамдығы',
  titleRu: 'Скорость обучения',
  minutes: 10,
  concepts: ['learning_rate', 'convergence'],
  terms: ['оқу жылдамдығы', 'конвергенция'],
}

const quizQuestions = [
  {
    id: 'q1',
    question: 'Learning rate тым үлкен болса?',
    options: [
      { id: 'a', text: 'Модель тез үйренеді', explanation: 'Жоқ, модель шектен шығып кетеді' },
      { id: 'b', text: 'Модель шектен шығып кетеді', explanation: 'Дұрыс! Арықтан су асып кетеді' },
      { id: 'c', text: 'Модель баяу үйренеді', explanation: 'Бұл тым кішкене кезде болады' },
    ],
    correctId: 'b',
  },
  {
    id: 'q2',
    question: 'Learning rate тым кішкентай болса?',
    options: [
      { id: 'a', text: 'Модель жерге жетпей қалуы мүмкін', explanation: 'Дұрыс! Уақыт бітіп кетеді' },
      { id: 'b', text: 'Модель тез үйренеді', explanation: 'Керісінше, баяу' },
      { id: 'c', text: 'Ештеңе болмайды', explanation: 'Бұл дұрыс емес' },
    ],
    correctId: 'a',
  },
  {
    id: 'q3',
    question: 'Конвергенция деген не?',
    options: [
      { id: 'a', text: 'Модельдің шектен шығуы', explanation: 'Бұл дивергенция' },
      { id: 'b', text: 'Модельдің ең кішкентай қателікті табуы', explanation: 'Дұрыс! Минимумға жету' },
      { id: 'c', text: 'Модельдің тоқтап қалуы', explanation: 'Бұл дұрыс емес' },
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
      prevLesson={{ slug: 'module-3-lesson-2', title: 'Градиентті есептеу' }}
      nextLesson={{ slug: 'module-3-lesson-4', title: 'Эпохалар мен батчтер' }}
      widget={<AryqGradient />}
      quiz={<Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
    >
      <Metaphor>
        <p className="mb-4">
          Арыққа су ағызғанда құйылғың ағымын реттей аласың. Тым күшті ағыс — 
          су асып кетеді. Тым әлсіз — су шұңқырда қалып қояды.
        </p>
        <p>
          Learning rate — бұл арықтың ағысының күші. Дұрыс таңдау керек.
        </p>
      </Metaphor>

      <Intuition>
        <p className="mb-4">
          Көз алдыңа велосипедпен жырадан түсуді елестет. Тым тездесең — 
          аударылып кетесің. Тым баяуласаң — жыраның ортасында қалуың мүмкін.
        </p>
        <p>
          Learning rate 0.01-0.1 аралығында жақсы жұмыс істейді. Әр есепке
          өзіндік мән керек.
        </p>
      </Intuition>

      <Formal term="Оқу жылдамдығы (Learning Rate)">
        <p className="mb-4">
          Learning rate (α) — градиенттік түсудің қадам өлшемі. 
          Параметрлерді қаншалықты өзгерту керектігін анықтайды.
        </p>
        <code className="block p-3 bg-dala-surface rounded text-sm font-mono">
          # Тым үлкен — расходимость{'\n'}
          α = 1.0  → θ бұзылады{'\n'}
          {'\n'}
          # Тым кішкентай — баяу{'\n'}
          α = 0.0001  → ғасыр ұзарады{'\n'}
          {'\n'}
          # Оптималды{'\n'}
          α = 0.01  → тез және дәл
        </code>
        <p className="mt-4 text-sm text-dala-muted">
          Конвергенция — модельдің минимумға жетуі. Дивергенция — шектен шығуы.
        </p>
      </Formal>
    </LessonShell>
  )
}
