import { z } from 'zod'

/**
 * Реестр курса. Единственный источник правды о том, какие уроки существуют,
 * как они называются и сколько читаются. Страницы уроков берут frontmatter
 * отсюда, поэтому карта курса и сам урок не могут разойтись.
 */

export const METAPHORS = ['aryq', 'overfit', 'zhailau', 'tangba', 'otar', 'kiiz', 'zheli', 'primeta'] as const
export type MetaphorId = (typeof METAPHORS)[number]

export const lessonSchema = z.object({
  module: z.number().int().min(1).max(8),
  lesson: z.number().int().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  /** Только для навигации разработчика. На сайте не показывается (SPEC §3). */
  titleRu: z.string().optional(),
  minutes: z.number().int().min(1).max(60),
  metaphor: z.enum(METAPHORS).optional(),
  concepts: z.array(z.string()).default([]),
  terms: z.array(z.string()).default([]),
})

export type LessonFrontmatter = z.infer<typeof lessonSchema>

export interface ModuleInfo {
  id: number
  title: string
  /** Казахский подзаголовок. Русский `titleRu` на витрину не выводится. */
  subtitle: string
  titleRu: string
  metaphor?: MetaphorId
  status: 'ready' | 'soon'
}

export const modules: ModuleInfo[] = [
  { id: 1, title: 'Мәліметтер', subtitle: 'Дерек деген не және оны қалай жинайды', titleRu: 'Данные', metaphor: 'primeta', status: 'ready' },
  { id: 2, title: 'Заңдылық іздеу', subtitle: 'Нүктелер арасынан сызық табу', titleRu: 'Поиск закономерности', metaphor: 'zheli', status: 'ready' },
  { id: 3, title: 'Арық: оқыту', subtitle: 'Модель қателігін қалай азайтады', titleRu: 'Обучение', metaphor: 'aryq', status: 'ready' },
  { id: 4, title: 'Таңба: жіктеу', subtitle: 'Екі класты бөлетін шекара', titleRu: 'Классификация', metaphor: 'tangba', status: 'soon' },
  { id: 5, title: 'Жайлау мен қыстау', subtitle: 'Жаңа деректе де жұмыс істеу', titleRu: 'Обобщение', metaphor: 'zhailau', status: 'soon' },
  { id: 6, title: 'Киіз үй: нейрондық желі', subtitle: 'Қабат-қабат күрделі шекара', titleRu: 'Нейросети', metaphor: 'kiiz', status: 'soon' },
  { id: 7, title: 'Көру', subtitle: 'Суреттен белгі табу', titleRu: 'Компьютерное зрение', metaphor: 'overfit', status: 'soon' },
  { id: 8, title: 'Жоба', subtitle: 'Өз деректеріңмен модель құру', titleRu: 'Проект', metaphor: 'otar', status: 'soon' },
]

export const lessons: LessonFrontmatter[] = [
  // ── Модуль 1. Мәліметтер
  { module: 1, lesson: 1, slug: 'module-1-lesson-1', title: 'Мәліметтер деген не?', titleRu: 'Что такое данные', minutes: 9, metaphor: 'primeta', concepts: ['data', 'feature', 'label'], terms: ['мәліметтер', 'ерекшелік', 'мұндама'] },
  { module: 1, lesson: 2, slug: 'module-1-lesson-2', title: 'Мәліметтер түрлері', titleRu: 'Типы данных', minutes: 9, metaphor: 'primeta', concepts: ['numerical', 'categorical'], terms: ['сандық', 'саптық', 'кесте'] },
  { module: 1, lesson: 3, slug: 'module-1-lesson-3', title: 'Мәліметтерді тазалау', titleRu: 'Очистка данных', minutes: 10, metaphor: 'zheli', concepts: ['cleaning', 'missing_value'], terms: ['тазалау', 'жоқ мән', 'қайталама'] },

  // ── Модуль 2. Заңдылық іздеу
  { module: 2, lesson: 1, slug: 'module-2-lesson-1', title: 'Заңдылықты іздеу', titleRu: 'Поиск закономерности', minutes: 11, metaphor: 'zheli', concepts: ['pattern', 'prediction'], terms: ['заңдылық', 'болжам', 'модель'] },
  { module: 2, lesson: 2, slug: 'module-2-lesson-2', title: 'Сызықтық регрессия', titleRu: 'Линейная регрессия', minutes: 12, metaphor: 'zheli', concepts: ['linear_regression', 'slope'], terms: ['сызықтық регрессия', 'бұрыш', 'кесінді'] },
  { module: 2, lesson: 3, slug: 'module-2-lesson-3', title: 'Ең кіші квадраттар', titleRu: 'Наименьшие квадраты', minutes: 10, metaphor: 'overfit', concepts: ['least_squares', 'error'], terms: ['ең кіші квадраттар', 'қателік'] },

  // ── Модуль 3. Арық: оқыту
  { module: 3, lesson: 1, slug: 'module-3-lesson-1', title: 'Арық: модель қалай оқиды', titleRu: 'Как модель учится', minutes: 11, metaphor: 'aryq', concepts: ['gradient_descent', 'learning_rate', 'local_minimum'], terms: ['градиенттік түсу', 'оқу жылдамдығы', 'локалды минимум'] },
  { module: 3, lesson: 2, slug: 'module-3-lesson-2', title: 'Градиентті есептеу', titleRu: 'Вычисление градиента', minutes: 11, metaphor: 'aryq', concepts: ['gradient', 'derivative'], terms: ['градиент', 'туынды', 'шығын функциясы'] },
  { module: 3, lesson: 3, slug: 'module-3-lesson-3', title: 'Оқу жылдамдығы', titleRu: 'Скорость обучения', minutes: 10, metaphor: 'aryq', concepts: ['learning_rate', 'divergence'], terms: ['оқу жылдамдығы', 'шектен шығу'] },
  { module: 3, lesson: 4, slug: 'module-3-lesson-4', title: 'Эпохалар мен батчтер', titleRu: 'Эпохи и батчи', minutes: 12, metaphor: 'otar', concepts: ['epoch', 'batch_size'], terms: ['эпоха', 'итерация'] },
]

export const READY_MODULES = modules.filter((m) => m.status === 'ready').map((m) => m.id)

export function getModule(id: number): ModuleInfo | undefined {
  return modules.find((m) => m.id === id)
}

export function getModuleLessons(moduleId: number): LessonFrontmatter[] {
  return lessons.filter((l) => l.module === moduleId).sort((a, b) => a.lesson - b.lesson)
}

export function getLesson(slug: string): LessonFrontmatter | undefined {
  return lessons.find((l) => l.slug === slug)
}

export function lessonHref(l: Pick<LessonFrontmatter, 'module' | 'lesson'>): string {
  return `/kurs/module-${l.module}/lesson-${l.lesson}`
}

/** Предыдущий и следующий уроки по сквозному порядку курса. */
export function getAdjacentLessons(slug: string): {
  prev: LessonFrontmatter | null
  next: LessonFrontmatter | null
} {
  const i = lessons.findIndex((l) => l.slug === slug)
  if (i < 0) return { prev: null, next: null }
  return { prev: lessons[i - 1] ?? null, next: lessons[i + 1] ?? null }
}

/** Первый непройденный урок — куда вести кнопку «Жалғастыру». */
export function nextUnfinished(done: (slug: string) => boolean): LessonFrontmatter | null {
  return lessons.find((l) => !done(l.slug)) ?? null
}

export const TOTAL_LESSONS = lessons.length
export const TOTAL_MINUTES = lessons.reduce((s, l) => s + l.minutes, 0)
