'use client'

import Link from 'next/link'
import { WIDGETS } from '@/components/interactive/registry'
import { getLesson, lessonHref } from '@/lib/content'
import { IconArrowLeft, IconArrowRight, IconHand } from '@/components/ui/icons'

/**
 * Витрина всех восьми интерактивов.
 *
 * Три из них (жайлау, таңба, киіз үй) относятся к модулям, которые ещё
 * готовятся. Без этой страницы они были бы доступны только за служебным
 * адресом, а счётчик «8 интерактивов» на главной оказался бы неправдой.
 */
export default function InteractivesPage() {
  return (
    <div className="min-h-dvh pb-12">
      <header className="sticky top-0 z-40 border-b border-dala-gold/15 bg-dala-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5">
          <Link
            href="/"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-dala-muted transition-colors hover:text-dala-text"
            aria-label="Басты бетке оралу"
          >
            <IconArrowLeft size={20} />
          </Link>
          <span className="font-medium text-dala-text">Интерактивтер</span>
          <span className="ml-auto font-mono text-xs tabular-nums text-dala-muted">{WIDGETS.length}</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6">
        <h1 className="text-2xl font-bold text-dala-gold">Сегіз интерактив</h1>
        <p className="mt-1.5 text-dala-muted">
          Әрқайсысының астында нағыз модель тұр: сандар осы жерде, телефоныңның өзінде
          есептеледі. Тұтқаны сүйре де, не өзгеретінін бақыла.
        </p>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-dala-water">
          <IconHand size={16} />
          Барлығы саусақпен жұмыс істейді
        </p>

        <div className="dala-ornament mt-6" />

        <div className="mt-6 space-y-10">
          {WIDGETS.map(({ id, title, about, lesson, Component }) => {
            const l = lesson ? getLesson(lesson) : undefined
            return (
              <section key={id} id={id} data-widget={id} className="scroll-mt-16">
                <h2 className="text-lg font-semibold text-dala-text">{title}</h2>
                <p className="mb-3 mt-0.5 text-sm text-dala-muted">{about}</p>
                <Component />
                {l ? (
                  <Link
                    href={lessonHref(l)}
                    className="mt-2 flex min-h-[44px] items-center justify-between gap-2 rounded-lg border border-dala-gold/20 px-4 text-sm text-dala-muted transition-colors hover:border-dala-water/50 hover:text-dala-text"
                  >
                    <span>
                      Сабақ: {l.title}
                    </span>
                    <IconArrowRight size={16} className="shrink-0 text-dala-water" />
                  </Link>
                ) : (
                  <p className="mt-2 rounded-lg border border-dashed border-dala-gold/20 px-4 py-2.5 text-sm text-dala-muted">
                    Бұл ұғымның сабағы дайындалып жатыр — әзірге интерактивпен танысуға болады.
                  </p>
                )}
              </section>
            )
          })}
        </div>
      </main>
    </div>
  )
}
