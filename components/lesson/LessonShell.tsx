'use client'

import Link from 'next/link'
import { useEffect, useState, type ReactNode } from 'react'
import { getAdjacentLessons, lessonHref, type LessonFrontmatter } from '@/lib/content'
import { useProgress } from '@/lib/progress'
import { IconArrowLeft, IconArrowRight, IconCheck } from '@/components/ui/icons'

interface LessonShellProps {
  frontmatter: LessonFrontmatter
  children: ReactNode
  widget?: ReactNode
  quiz?: ReactNode
}

export function LessonShell({ frontmatter, children, widget, quiz }: LessonShellProps) {
  const { getProgressFor, visit } = useProgress()
  const done = getProgressFor(frontmatter.slug)?.done ?? false
  const { prev, next } = getAdjacentLessons(frontmatter.slug)
  const [read, setRead] = useState(0)

  // Отметка «урок открыт» — именно она питает карточку «Жалғастыру».
  useEffect(() => {
    visit(frontmatter.slug)
  }, [visit, frontmatter.slug])

  // Полоса вверху показывает, сколько урока прочитано.
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setRead(max > 0 ? Math.min(1, window.scrollY / max) : 1)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-dvh pb-10">
      <header className="sticky top-0 z-40 border-b border-dala-gold/15 bg-dala-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5">
          <Link
            href="/kurs"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-dala-muted transition-colors hover:text-dala-text"
            aria-label="Курс картасына оралу"
          >
            <IconArrowLeft size={20} />
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs text-dala-muted">
              {frontmatter.module}-модуль · {frontmatter.lesson}-сабақ · {frontmatter.minutes} мин
            </p>
          </div>
          {done && (
            <span className="flex items-center gap-1 rounded-full border border-dala-water/40 bg-dala-water/10 px-2.5 py-1 text-xs font-medium text-dala-water">
              <IconCheck size={13} />
              Өтілді
            </span>
          )}
        </div>
        <div className="h-0.5 bg-dala-surface">
          <div className="h-full bg-dala-water transition-[width] duration-150" style={{ width: `${read * 100}%` }} />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-7">
        <h1 className="text-[26px] font-bold leading-tight text-dala-gold">{frontmatter.title}</h1>

        {frontmatter.terms.length > 0 && (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {frontmatter.terms.map((t) => (
              <li
                key={t}
                className="rounded border border-dala-gold/20 bg-dala-surface px-2 py-0.5 text-xs text-dala-muted"
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        <div className="dala-ornament mt-5" />

        <div className="mt-7 space-y-9">{children}</div>

        {widget && (
          <section className="mt-11">
            <SectionTitle kicker="Интерактив">Қолмен тексер</SectionTitle>
            {widget}
          </section>
        )}

        {quiz && (
          <section className="mt-11">
            <SectionTitle kicker="Тексеру">Түсінгеніңді тексер</SectionTitle>
            {quiz}
          </section>
        )}

        <nav className="mt-12 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link
              href={lessonHref(prev)}
              className="group rounded-xl border border-dala-gold/20 bg-dala-surface p-4 transition-colors hover:border-dala-gold/45"
            >
              <span className="flex items-center gap-1.5 text-xs text-dala-muted">
                <IconArrowLeft size={13} />
                Алдыңғы
              </span>
              <p className="mt-1 font-medium text-dala-text">{prev.title}</p>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}

          {next ? (
            <Link
              href={lessonHref(next)}
              className="group rounded-xl border border-dala-water/30 bg-dala-water/5 p-4 text-right transition-colors hover:border-dala-water"
            >
              <span className="flex items-center justify-end gap-1.5 text-xs text-dala-water">
                Келесі
                <IconArrowRight size={13} />
              </span>
              <p className="mt-1 font-medium text-dala-text">{next.title}</p>
            </Link>
          ) : (
            <Link
              href="/sertifikat"
              className="rounded-xl border border-dala-gold/30 bg-dala-gold/5 p-4 text-right transition-colors hover:border-dala-gold"
            >
              <span className="text-xs text-dala-gold">Курстың соңы</span>
              <p className="mt-1 font-medium text-dala-text">Сертификат ал</p>
            </Link>
          )}
        </nav>
      </main>
    </div>
  )
}

function SectionTitle({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-dala-water/80">{kicker}</p>
      <h2 className="text-xl font-semibold text-dala-text">{children}</h2>
    </div>
  )
}

/* ------------------------- Секции урока ------------------------- */

export function Metaphor({ children }: { children: ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-xl border border-dala-water/25 bg-dala-surface p-5">
      <span aria-hidden className="absolute inset-y-0 left-0 w-1 bg-dala-water/60" />
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-dala-water">Метафора</h3>
      <div className="space-y-3 text-dala-text">{children}</div>
    </section>
  )
}

export function Intuition({ children }: { children: ReactNode }) {
  return (
    <section>
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-dala-muted">Түйсік</h3>
      <div className="space-y-3 leading-relaxed text-dala-text">{children}</div>
    </section>
  )
}

export function Formal({ children, term }: { children: ReactNode; term?: string }) {
  return (
    <section className="rounded-xl border border-dala-gold/25 bg-dala-surface/60 p-5">
      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-dala-gold">Ғылыми тілмен</h3>
      {term && <p className="mt-1 text-lg font-semibold text-dala-text">{term}</p>}
      <div className="mt-3 space-y-3 text-dala-text">{children}</div>
    </section>
  )
}

/** Формула отдельной строкой — на телефоне она не должна ломать вёрстку. */
export function Formula({ children, note }: { children: ReactNode; note?: string }) {
  return (
    <figure className="my-4">
      <div className="overflow-x-auto rounded-lg border border-dala-gold/15 bg-dala-bg px-4 py-3">
        <code className="whitespace-nowrap font-mono text-[15px] text-dala-text">{children}</code>
      </div>
      {note && <figcaption className="mt-2 text-sm text-dala-muted">{note}</figcaption>}
    </figure>
  )
}

export function Code({ children }: { children: string }) {
  return (
    <section>
      <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-dala-muted">Код</h3>
      <pre className="overflow-x-auto rounded-xl border border-dala-gold/15 bg-dala-bg p-4">
        <code className="font-mono text-sm leading-relaxed text-dala-text">{children}</code>
      </pre>
    </section>
  )
}

/** Короткая врезка «запомни» — разбивает длинный текст. */
export function Note({ children }: { children: ReactNode }) {
  return (
    <aside className="rounded-lg border-l-2 border-dala-gold/60 bg-dala-gold/5 px-4 py-3 text-[15px] text-dala-text">
      {children}
    </aside>
  )
}
