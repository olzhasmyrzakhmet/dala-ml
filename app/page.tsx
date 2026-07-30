'use client'

import Link from 'next/link'
import { AryqGradient } from '@/components/interactive/AryqGradient'
import { glossary } from '@/lib/glossary'
import {
  METAPHORS,
  TOTAL_LESSONS,
  TOTAL_MINUTES,
  getLesson,
  lessonHref,
  lessons,
  modules,
  nextUnfinished,
} from '@/lib/content'
import { useProgress } from '@/lib/progress'
import { IconArrowRight, IconBook, IconHand, IconTeacher } from '@/components/ui/icons'

export default function Home() {
  const { isDone, doneCount, lastSlug } = useProgress()

  const last = lastSlug ? getLesson(lastSlug) : undefined
  const resume = last && !isDone(last.slug) ? last : (nextUnfinished(isDone) ?? lessons[0])
  const started = doneCount > 0 || Boolean(lastSlug)
  const readyModules = modules.filter((m) => m.status === 'ready').length

  return (
    <div className="min-h-dvh">
      <header className="mx-auto flex max-w-3xl items-center justify-between px-4 pt-5">
        <span className="text-lg font-bold tracking-tight text-dala-gold">Дала&nbsp;ML</span>
        <Link
          href="/sozdik"
          className="flex h-11 items-center gap-1.5 rounded-lg px-2 text-sm text-dala-muted transition-colors hover:text-dala-text"
        >
          <IconBook size={17} />
          Сөздік
        </Link>
      </header>

      <main className="mx-auto max-w-3xl px-4">
        {/* Ценность — одной фразой, без воды */}
        <section className="pt-6">
          <h1 className="text-[28px] font-bold leading-[1.15] text-dala-text sm:text-4xl">
            Машиналық оқуды <span className="text-dala-gold">далаға ұқсатып</span> түсін
          </h1>
          <p className="mt-2.5 max-w-xl text-[15px] leading-relaxed text-dala-muted">
            Су арықпен неге төмен ағады — модель де солай үйренеді. Әр ұғымды қолыңмен сүйресің.
          </p>
        </section>

        {/* Живой виджет — первый экран, а не картинка */}
        <section className="mt-6">
          <p className="mb-2 flex items-center gap-1.5 text-sm text-dala-water">
            <IconHand size={16} />
            Тұтқаны сүйре — бәрі бірден өзгереді
          </p>
          <AryqGradient compact />
        </section>

        {/* Продолжить / начать */}
        <section className="mt-6">
          <Link
            href={lessonHref(resume)}
            className="flex items-center gap-3 rounded-xl border border-dala-water/35 bg-dala-water/10 p-4 transition-colors hover:border-dala-water"
          >
            <div className="min-w-0 flex-1">
              <span className="text-xs font-medium text-dala-water">
                {started ? 'Жалғастыру' : 'Бірінші сабақтан баста'}
              </span>
              <p className="truncate font-semibold text-dala-text">{resume.title}</p>
              <p className="text-xs text-dala-muted">
                {resume.module}-модуль · {resume.lesson}-сабақ · {resume.minutes} мин
              </p>
            </div>
            <IconArrowRight size={22} className="shrink-0 text-dala-water" />
          </Link>

          {/* Никаких пустых состояний: цифры осмысленны и у новичка */}
          <dl className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-dala-gold/20 bg-dala-gold/15">
            <Stat label="Өтілген сабақ" value={`${doneCount} / ${TOTAL_LESSONS}`} />
            <Stat label="Интерактив" value={String(METAPHORS.length)} href="/interaktiv" />
            <Stat label="Сөздік" value={String(glossary.length)} href="/sozdik" />
          </dl>
        </section>

        <div className="dala-ornament mt-9" />

        {/* Карта курса — коротко, с честным статусом */}
        <section className="mt-8">
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-semibold text-dala-text">Курс</h2>
            <span className="text-sm text-dala-muted">
              {readyModules} модуль дайын · {TOTAL_MINUTES} мин оқу
            </span>
          </div>

          <ul className="space-y-2">
            {modules.map((m) => {
              const done = lessons.filter((l) => l.module === m.id && isDone(l.slug)).length
              const total = lessons.filter((l) => l.module === m.id).length
              return (
                <li key={m.id}>
                  <Link
                    href={m.status === 'ready' ? `/kurs#module-${m.id}` : '/kurs'}
                    className="flex items-center gap-3 rounded-xl border border-dala-gold/20 bg-dala-surface px-4 py-3 transition-colors hover:border-dala-gold/45"
                  >
                    <span className="w-6 shrink-0 font-mono text-sm tabular-nums text-dala-gold">
                      {String(m.id).padStart(2, '0')}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-dala-text">{m.title}</span>
                      <span className="block truncate text-xs text-dala-muted">{m.subtitle}</span>
                    </span>
                    {m.status === 'ready' ? (
                      <span className="shrink-0 font-mono text-xs tabular-nums text-dala-muted">
                        {done}/{total}
                      </span>
                    ) : (
                      <span className="shrink-0 rounded border border-dala-gold/25 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-dala-muted">
                        дайындалуда
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>

          <Link
            href="/kurs"
            className="mt-3 flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-dala-gold/30 text-sm font-medium text-dala-gold transition-colors hover:bg-dala-gold/10"
          >
            Толық карта және офлайн жүктеу
            <IconArrowRight size={16} />
          </Link>
        </section>

        <div className="dala-ornament mt-9" />

        <section className="mt-8 grid gap-3 sm:grid-cols-2">
          <Link
            href="/sozdik"
            className="rounded-xl border border-dala-gold/20 bg-dala-surface p-4 transition-colors hover:border-dala-gold/45"
          >
            <IconBook size={20} className="text-dala-water" />
            <p className="mt-2 font-medium text-dala-text">Сөздік</p>
            <p className="text-sm text-dala-muted">
              {glossary.length} термин: қазақша түсіндірме, ағылшын атауы және дала метафорасы.
            </p>
          </Link>
          <Link
            href="/mugalimge"
            className="rounded-xl border border-dala-gold/20 bg-dala-surface p-4 transition-colors hover:border-dala-gold/45"
          >
            <IconTeacher size={20} className="text-dala-gold" />
            <p className="mt-2 font-medium text-dala-text">Мұғалімге</p>
            <p className="text-sm text-dala-muted">
              Үйірме жоспары, әр сабаққа уақыт бөлінісі және интернетсіз өткізу нұсқауы.
            </p>
          </Link>
        </section>

        <footer className="mt-12 border-t border-dala-gold/10 py-6 text-sm text-dala-muted">
          <p>Тіркелудің қажеті жоқ. Прогресс осы телефонда сақталады.</p>
          <p className="mt-1">Модульді жүктеп алсаң, интернетсіз де оқи бересің.</p>
        </footer>
      </main>
    </div>
  )
}

function Stat({ label, value, href }: { label: string; value: string; href?: string }) {
  const body = (
    <>
      <dt className="text-[11px] tracking-wide text-dala-muted">{label}</dt>
      <dd className="font-mono text-lg tabular-nums text-dala-text">{value}</dd>
    </>
  )
  return href ? (
    <Link href={href} className="bg-dala-surface px-2 py-3 text-center transition-colors hover:bg-dala-water/10">
      {body}
    </Link>
  ) : (
    <div className="bg-dala-surface px-2 py-3 text-center">{body}</div>
  )
}
