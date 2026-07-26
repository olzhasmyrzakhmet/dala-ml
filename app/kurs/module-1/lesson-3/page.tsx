'use client'

import { LessonShell, Metaphor, Intuition, Formal } from '@/components/lesson/LessonShell'
import { Quiz } from '@/components/lesson/Quiz'
import { useProgress } from '@/lib/progress'

const frontmatter = {
  module: 1,
  lesson: 3,
  slug: 'module-1-lesson-3',
  title: 'Мәліметтерді тазалау',
  titleRu: 'Очистка данных',
  minutes: 10,
  concepts: ['cleaning', 'missing_values'],
  terms: ['тазалау', 'жоқ мәндер'],
}

const quizQuestions = [
  {
    id: 'q1',
    question: 'Жоқ мәнді қалай толтыруға болады?',
    options: [
      { id: 'a', text: 'Орташа мәнмен', explanation: 'Дұрыс! Егер жас белгісіз болса, орташа жас қоямыз' },
      { id: 'b', text: 'Өшіру керек', explanation: 'Кейде өшіреміз, бірақ әрқашан емес' },
      { id: 'c', text: 'Ұстап қалу керек', explanation: 'Жоқ мәнмен жұмыс істеу қиын' },
    ],
    correctId: 'a',
  },
  {
    id: 'q2',
    question: 'Қайталама деректер неге нашар?',
    options: [
      { id: 'a', text: 'Жадты асады', explanation: 'Бұл да дұрыс, бірақ негізгі себебі — модельді бұзады' },
      { id: 'b', text: 'Модельді бұзады', explanation: 'Дұрыс! Бір қой екі рет саналса, модель жаңылысады' },
      { id: 'c', text: 'Ештеңе етпейді', explanation: 'Қате, қайталамалар зиян' },
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
      prevLesson={{ slug: 'module-1-lesson-2', title: 'Мәліметтер түрлері' }}
      nextLesson={{ slug: 'module-2-lesson-1', title: 'Заңдылықты іздеу' }}
      quiz={<Quiz questions={quizQuestions} onComplete={handleQuizComplete} />}
    >
      <Metaphor>
        <p className="mb-4">
          Шопан малды жуып, тазалайды. <strong>Жоқ мәндер</strong> — бұл бос орындар,
          <strong>қайталамалар</strong> — екі рет жазылған қой.
        </p>
        <p>
          Таза мал ғана саулық болады. Таза деректер ғана жақсы модель береді.
        </p>
      </Metaphor>

      <Intuition>
        <p className="mb-4">
          Кейде деректерде қателер болады: жас белгісіз, салмақ минус болып тұр,
          бір қой екі рет жазылған.
        </p>
        <p>
          Бұл қателерді түзету керек. Жоқ мәнді орташа мәнмен толтырамыз,
          қайталамаларды өшіреміз.
        </p>
      </Intuition>

      <Formal term="Мәліметтерді тазалау (Data Cleaning)">
        <p className="mb-4">
          Мәліметтерді тазалау — бұл қателіктерді, жоқ мәндерді және
          қайталамаларды түзету процесі.
        </p>
        <code className="block p-3 bg-dala-surface rounded text-sm font-mono">
          # Жоқ мәнді орташа мәнмен толтыру{'\n'}
          орташа_жас = деректер['жас'].орташа(){'\n'}
          деректер['жас'].толтыру(орташа_жас){'\n'}
          {'\n'}
          # Қайталамаларды өшіру{'\n'}
          деректер = деректер.қайталамаларды_өшіру()
        </code>
      </Formal>
    </LessonShell>
  )
}
