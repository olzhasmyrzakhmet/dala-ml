import { describe, it, expect } from 'vitest'
import {
  METAPHORS,
  READY_MODULES,
  TOTAL_LESSONS,
  getAdjacentLessons,
  getLesson,
  getModule,
  getModuleLessons,
  lessonHref,
  lessonSchema,
  lessons,
  modules,
  nextUnfinished,
} from '@/lib/content'
import { glossary, searchGlossary } from '@/lib/glossary'
import { WIDGETS } from '@/components/interactive/registry'

describe('Реестр курса', () => {
  it('каждый урок проходит zod-схему frontmatter', () => {
    for (const l of lessons) {
      const parsed = lessonSchema.safeParse(l)
      expect(parsed.success, `${l.slug}: ${parsed.success ? '' : parsed.error.message}`).toBe(true)
    }
  })

  it('slug уникальны', () => {
    const slugs = lessons.map((l) => l.slug)
    expect(new Set(slugs).size).toBe(slugs.length)
  })

  it('slug совпадает с адресом страницы', () => {
    for (const l of lessons) {
      expect(l.slug).toBe(`module-${l.module}-lesson-${l.lesson}`)
      expect(lessonHref(l)).toBe(`/kurs/module-${l.module}/lesson-${l.lesson}`)
    }
  })

  it('уроки внутри модуля идут подряд с первого', () => {
    for (const m of modules) {
      const items = getModuleLessons(m.id)
      items.forEach((l, i) => expect(l.lesson).toBe(i + 1))
    }
  })

  it('готовые модули действительно содержат уроки, а «дайындалуда» — нет', () => {
    for (const m of modules) {
      const count = getModuleLessons(m.id).length
      if (m.status === 'ready') expect(count, `модуль ${m.id}`).toBeGreaterThan(0)
      else expect(count, `модуль ${m.id}`).toBe(0)
    }
    expect(READY_MODULES.length).toBeGreaterThanOrEqual(3)
  })

  it('заявленное время урока не нулевое и правдоподобное', () => {
    for (const l of lessons) {
      expect(l.minutes).toBeGreaterThanOrEqual(5)
      expect(l.minutes).toBeLessThanOrEqual(20)
    }
  })

  it('метафора урока — из списка восьми', () => {
    for (const l of lessons) {
      if (l.metaphor) expect(METAPHORS).toContain(l.metaphor)
    }
  })

  it('навигация вперёд-назад связная', () => {
    const first = lessons[0]
    const last = lessons[lessons.length - 1]
    expect(getAdjacentLessons(first.slug).prev).toBeNull()
    expect(getAdjacentLessons(last.slug).next).toBeNull()
    for (let i = 1; i < lessons.length; i++) {
      expect(getAdjacentLessons(lessons[i].slug).prev?.slug).toBe(lessons[i - 1].slug)
      expect(getAdjacentLessons(lessons[i - 1].slug).next?.slug).toBe(lessons[i].slug)
    }
  })

  it('«Жалғастыру» указывает на первый непройденный урок', () => {
    expect(nextUnfinished(() => false)?.slug).toBe(lessons[0].slug)
    const doneFirstTwo = (s: string) => s === lessons[0].slug || s === lessons[1].slug
    expect(nextUnfinished(doneFirstTwo)?.slug).toBe(lessons[2].slug)
    expect(nextUnfinished(() => true)).toBeNull()
  })

  it('getLesson и getModule не выдумывают несуществующее', () => {
    expect(getLesson('module-9-lesson-1')).toBeUndefined()
    expect(getModule(99)).toBeUndefined()
    expect(getLesson(lessons[0].slug)?.title).toBe(lessons[0].title)
  })

  it('TOTAL_LESSONS совпадает с реальным числом', () => {
    expect(TOTAL_LESSONS).toBe(lessons.length)
  })
})

describe('Интерфейс только на казахском', () => {
  /** Слова, по которым ловится русский текст, просочившийся в витрину. */
  const RU = [
    'Сходится',
    'сходится',
    'расходимость',
    'застрял',
    'кликни',
    'примета',
    'Примета',
    'ползунок',
    'Ползунок',
  ]

  it('в реестре курса нет русских слов в видимых полях', () => {
    for (const m of modules) {
      for (const w of RU) {
        expect(m.title, `модуль ${m.id}`).not.toContain(w)
        expect(m.subtitle, `модуль ${m.id}`).not.toContain(w)
      }
    }
    for (const l of lessons) {
      for (const w of RU) expect(l.title, l.slug).not.toContain(w)
    }
  })

  it('titleRu существует, но это поле для разработчика (SPEC §3)', () => {
    // Оно не должно попадать ни в один видимый заголовок.
    for (const l of lessons) {
      if (l.titleRu) expect(l.title).not.toBe(l.titleRu)
    }
  })
})

describe('Реестр интерактивов', () => {
  it('все восемь на месте и с уникальными id', () => {
    expect(WIDGETS).toHaveLength(8)
    expect(new Set(WIDGETS.map((w) => w.id)).size).toBe(8)
  })

  it('покрывает все метафоры из SPEC §4', () => {
    expect([...WIDGETS.map((w) => w.id)].sort()).toEqual([...METAPHORS].sort())
  })

  it('ссылка на урок ведёт на существующий урок', () => {
    for (const w of WIDGETS) {
      if (w.lesson) expect(getLesson(w.lesson), w.id).toBeDefined()
    }
  })

  it('у каждого есть казахское название и описание', () => {
    for (const w of WIDGETS) {
      expect(w.title.length).toBeGreaterThan(3)
      expect(w.about.length).toBeGreaterThan(10)
    }
  })
})

describe('Словарь', () => {
  it('не меньше 60 терминов (SPEC §3)', () => {
    expect(glossary.length).toBeGreaterThanOrEqual(60)
  })

  it('нет дублей по казахскому термину', () => {
    const kk = glossary.map((t) => t.kk)
    const dupes = kk.filter((v, i) => kk.indexOf(v) !== i)
    expect(dupes, `дубли: ${Array.from(new Set(dupes)).join(', ')}`).toHaveLength(0)
  })

  it('у каждого термина заполнены все обязательные поля', () => {
    for (const t of glossary) {
      expect(t.kk.trim(), JSON.stringify(t)).not.toBe('')
      expect(t.en.trim(), t.kk).not.toBe('')
      expect(t.short.trim(), t.kk).not.toBe('')
      expect(t.metaphor.trim(), t.kk).not.toBe('')
    }
  })

  it('moduleRef указывает на существующий модуль', () => {
    for (const t of glossary) {
      if (t.moduleRef !== undefined) expect(getModule(t.moduleRef), t.kk).toBeDefined()
    }
  })

  it('поиск находит по казахскому и по английскому', () => {
    expect(searchGlossary('градиент').length).toBeGreaterThan(0)
    expect(searchGlossary('арық').length).toBeGreaterThan(0)
    expect(searchGlossary('gradient').length).toBeGreaterThan(0)
  })

  it('поиск не падает на пустой строке и мусоре', () => {
    expect(() => searchGlossary('')).not.toThrow()
    expect(searchGlossary('zzzzzz')).toHaveLength(0)
  })
})
