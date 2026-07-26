import { z } from 'zod'

// Frontmatter schema for lessons
export const lessonSchema = z.object({
  module: z.number().int().min(1).max(8),
  lesson: z.number().int().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  titleRu: z.string().optional(),
  minutes: z.number().int().min(1).max(60),
  metaphor: z.enum(['aryq', 'overfit', 'zhailau', 'tangba', 'otar', 'kiiz', 'zheli', 'primeta']).optional(),
  concepts: z.array(z.string()).default([]),
  terms: z.array(z.string()).default([]),
})

export type LessonFrontmatter = z.infer<typeof lessonSchema>

export interface Lesson {
  slug: string
  frontmatter: LessonFrontmatter
  content: string
}

// Module info
export const modules = [
  { id: 1, title: 'Мәліметтер', titleRu: 'Данные', lessons: 3 },
  { id: 2, title: 'Заңдылық іздеу', titleRu: 'Поиск закономерности', lessons: 3 },
  { id: 3, title: 'Арық: оқыту', titleRu: 'Обучение', lessons: 4 },
  { id: 4, title: 'Таңба: жіктеу', titleRu: 'Классификация', lessons: 3 },
  { id: 5, title: 'Жайлау мен қыстау', titleRu: 'Обобщение', lessons: 3 },
  { id: 6, title: 'Киіз үй: нейрондық желі', titleRu: 'Нейросети', lessons: 4 },
  { id: 7, title: 'Көру', titleRu: 'Компьютерное зрение', lessons: 3 },
  { id: 8, title: 'Жоба', titleRu: 'Проект', lessons: 2 },
]

// Get module by id
export function getModule(id: number) {
  return modules.find((m) => m.id === id)
}

// Get all lessons for a module
export function getModuleLessons(moduleId: number): Lesson[] {
  // This will be populated from MDX files
  // For now, return mock data
  const module = getModule(moduleId)
  if (!module) return []
  
  return Array.from({ length: module.lessons }, (_, i) => ({
    slug: `module-${moduleId}-lesson-${i + 1}`,
    frontmatter: {
      module: moduleId,
      lesson: i + 1,
      slug: `module-${moduleId}-lesson-${i + 1}`,
      title: `${module.title} — сабақ ${i + 1}`,
      minutes: 10,
      concepts: [],
      terms: [],
    },
    content: '',
  }))
}

// Get lesson by slug
export function getLesson(slug: string): Lesson | null {
  // Parse slug: module-X-lesson-Y
  const match = slug.match(/module-(\d+)-lesson-(\d+)/)
  if (!match) return null
  
  const moduleId = parseInt(match[1])
  const lessonNum = parseInt(match[2])
  const module = getModule(moduleId)
  
  if (!module || lessonNum > module.lessons) return null
  
  return {
    slug,
    frontmatter: {
      module: moduleId,
      lesson: lessonNum,
      slug,
      title: `${module.title} — сабақ ${lessonNum}`,
      minutes: 10,
      concepts: [],
      terms: [],
    },
    content: '',
  }
}

// Get next/prev lesson
export function getAdjacentLessons(currentSlug: string): { prev: Lesson | null; next: Lesson | null } {
  const match = currentSlug.match(/module-(\d+)-lesson-(\d+)/)
  if (!match) return { prev: null, next: null }
  
  const moduleId = parseInt(match[1])
  const lessonNum = parseInt(match[2])
  const module = getModule(moduleId)
  
  if (!module) return { prev: null, next: null }
  
  const prev = lessonNum > 1 
    ? getLesson(`module-${moduleId}-lesson-${lessonNum - 1}`)
    : moduleId > 1 
      ? getLesson(`module-${moduleId - 1}-lesson-${getModule(moduleId - 1)?.lessons || 1}`)
      : null
      
  const next = lessonNum < module.lessons
    ? getLesson(`module-${moduleId}-lesson-${lessonNum + 1}`)
    : moduleId < 8
      ? getLesson(`module-${moduleId + 1}-lesson-1`)
      : null
  
  return { prev, next }
}
