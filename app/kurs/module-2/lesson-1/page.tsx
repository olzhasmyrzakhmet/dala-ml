'use client'

import { LessonShell, Metaphor, Intuition, Formal } from '@/components/lesson/LessonShell'
import { Quiz } from '@/components/lesson/Quiz'
import { FeaturePrimeta } from '@/components/interactive/FeaturePrimeta'
import { useProgress } from '@/lib/progress'

const frontmatter = {
  module: 2,
  lesson: 1,
  slug: 'module-2-lesson-1',
  title: 'Заңдылықты іздеу',
  titleRu: 'Поиск закономерности',
  minutes: 12,
  concepts: ['pattern', 'prediction'],
  terms: ['заңдылық', 'болжам'],
}

const quizQuestions = [
  {
    id: 'q1',
    question: 'Заңдылық деген не?',
    options: [
      { id: 'a', text: 'Қайталанатын байланыс', explanation: 'Дұрыс! Заңдылық — бұл деректердегі қайталанатын байланыс' },
      { id: 'b', text: 'Кездейсоқ оқиға', explanation: 'Заңдылық кездейсоқ емес' },
      { id: 'c', text: 'Тек сандар', explanation: 'Заңдылық тек сандардан тұрмайды' },
    ],
    correctId: 'a',
  },
  {
    id: 'q2',
    question: 'Болжам деген не?',
    options: [
      { id: 'a', text: 'Болашақты болжау', explanation: 'Дұрыс! Болжам — бұл болашақты болжау' },
      { id: 'b', text: 'Өткенді талдау', explanation: 'Бұл ретроспектива' },
      { id: 'c', text: 'Деректерді жинау', explanation: 'Бұл жинау процесі' },
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
      prevLesson={{ slug: 'module-1-lesson-3', title: 'Модуль 1 аяқталды' }}
      nextLesson={{ slug: 'module-2-lesson-2', title: 'Сызықтық регрессия' }}
      widget={<FeaturePrimeta />}
      quiz={<Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
    >
      <Metaphor>
        <p className="mb-4">
          Ата-бабаларымыз ауа-райын болжау үшін бұлттарға, желге, малдың
          мінез-құлқына қарады. Бұл — <strong>приметалар</strong>.
        </p>
        <p>
          Қандай приметаларды қолданса, болжам дәлірек болады.
        </p>
      </Metaphor>

      <Intuition>
        <p className="mb-4">
          Деректерде заңдылықтар бар. Мысалы: қысқа түсе, температура төмендейді.
          Бұл заңдылықты үйреніп, болашақты болжай аламыз.
        </p>
        <p>
          Модель — бұл заңдылықты үйренетін бағдарлама.
        </p>
      </Intuition>

      <Formal term="Заңдылық (Pattern)">
        <p className="mb-4">
          Заңдылық — бұл деректердегі қайталанатын байланыс немесе құрылым.
          Модельдер осы заңдылықты үйреніп, жаңа деректер бойынша болжам жасайды.
        </p>
        <code className="block p-3 bg-dala-surface rounded text-sm font-mono">
          егер бұлт = көп → жаңбыр = иә
        </code>
      </Formal>
    </LessonShell>
  )
}
