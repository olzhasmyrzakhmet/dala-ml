'use client'

import Link from 'next/link'
import { useRef, useState } from 'react'
import {
  TOTAL_LESSONS,
  TOTAL_MINUTES,
  getModuleLessons,
  lessonHref,
  modules,
} from '@/lib/content'
import { useProgress } from '@/lib/progress'
import {
  IconArrowLeft,
  IconArrowRight,
  IconCheck,
  IconDownload,
  IconReset,
} from '@/components/ui/icons'

export default function CoursePage() {
  const { progress, isDone, doneCount, averageScore, isModuleDownloaded, download, forget, exportJson, importJson, reset } =
    useProgress()
  const fileRef = useRef<HTMLInputElement>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const handleExport = () => {
    const blob = new Blob([exportJson()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'dala-ml-progress.json'
    a.click()
    URL.revokeObjectURL(url)
    setNotice('Прогресс файлға сақталды.')
  }

  const handleImport = async (file: File) => {
    const ok = importJson(await file.text())
    setNotice(ok ? 'Прогресс қалпына келтірілді.' : 'Файл танылмады. Басқа файлды таңдап көр.')
  }

  const handleDownload = async (id: number) => {
    if (isModuleDownloaded(id)) {
      forget(id)
      setNotice(`${id}-модуль офлайн тізімінен алынды.`)
      return
    }
    download(id)
    /* Кладём страницы модуля в офлайн-кэш руками самого service worker.
       Открывать `caches.open('dala-ml-v2')` отсюда нельзя: имя кэша пришлось бы
       держать в двух местах, и после смены версии SW кнопка врала бы
       «Жүктелді» для модуля, которого в кэше уже нет. */
    const urls = ['/', '/kurs', '/sozdik', '/offline', ...getModuleLessons(id).map((l) => lessonHref(l))]
    try {
      const reg = await navigator.serviceWorker?.ready
      if (reg?.active) {
        reg.active.postMessage({ type: 'cache-urls', urls })
        setNotice(`${id}-модуль жүктелді. Енді интернетсіз де оқи аласың.`)
      } else {
        setNotice(`${id}-модуль белгіленді. Толық жүктеу үшін бетті бір рет жаңарт.`)
      }
    } catch {
      setNotice(`${id}-модуль белгіленді. Толық жүктеу үшін бетті бір рет жаңарт.`)
    }
  }

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
          <span className="font-medium text-dala-text">Курс картасы</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6">
        <h1 className="text-2xl font-bold text-dala-gold">Машиналық оқу</h1>
        <p className="mt-1 text-dala-muted">
          {modules.length} модуль · {TOTAL_LESSONS} сабақ дайын · шамамен {TOTAL_MINUTES} минут оқу.
        </p>

        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-dala-gold/20 bg-dala-gold/15">
          <Stat label="Өтілді" value={`${doneCount} / ${TOTAL_LESSONS}`} />
          <Stat label="Орташа балл" value={doneCount ? `${averageScore}%` : '—'} />
          <Stat label="Офлайн" value={`${progress.downloadedModules.length} модуль`} />
        </dl>

        {doneCount === 0 && (
          <p className="mt-2 text-sm text-dala-muted">
            Бірінші сабақты бітірсең, осында балл мен өткен сабақтар саны шығады.
          </p>
        )}

        {notice && (
          <p aria-live="polite" className="mt-3 rounded-lg border border-dala-water/30 bg-dala-water/10 px-3 py-2 text-sm text-dala-water">
            {notice}
          </p>
        )}

        <div className="dala-ornament mt-7" />

        <ol className="mt-6 space-y-3">
          {modules.map((m) => {
            const items = getModuleLessons(m.id)
            const done = items.filter((l) => isDone(l.slug)).length
            const pct = items.length ? (done / items.length) * 100 : 0
            const downloaded = isModuleDownloaded(m.id)

            return (
              <li
                key={m.id}
                id={`module-${m.id}`}
                className="scroll-mt-16 rounded-xl border border-dala-gold/20 bg-dala-surface p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <span className="font-mono text-xs tabular-nums text-dala-water">
                      {String(m.id).padStart(2, '0')}-модуль
                    </span>
                    <h2 className="text-lg font-semibold text-dala-text">{m.title}</h2>
                    <p className="text-sm text-dala-muted">{m.subtitle}</p>
                  </div>

                  {m.status === 'ready' ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(m.id)}
                      aria-pressed={downloaded}
                      className={`flex h-11 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium transition-colors ${
                        downloaded
                          ? 'border-dala-water/40 bg-dala-water/15 text-dala-water'
                          : 'border-dala-gold/25 text-dala-gold hover:bg-dala-gold/10'
                      }`}
                    >
                      {downloaded ? <IconCheck size={15} /> : <IconDownload size={15} />}
                      {downloaded ? 'Жүктелді' : 'Жүктеу'}
                    </button>
                  ) : (
                    <span className="shrink-0 rounded border border-dala-gold/25 px-2 py-1 text-[10px] uppercase tracking-wide text-dala-muted">
                      дайындалуда
                    </span>
                  )}
                </div>

                {items.length > 0 ? (
                  <>
                    <div className="mt-3 h-1 overflow-hidden rounded-full bg-dala-bg">
                      <div
                        className="h-full rounded-full bg-dala-water transition-[width] duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <ul className="mt-3 space-y-1.5">
                      {items.map((l) => {
                        const finished = isDone(l.slug)
                        return (
                          <li key={l.slug}>
                            <Link
                              href={lessonHref(l)}
                              className="flex min-h-[44px] items-center gap-3 rounded-lg border border-dala-gold/10 bg-dala-bg px-3 transition-colors hover:border-dala-water/40"
                            >
                              <span
                                aria-hidden
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${
                                  finished
                                    ? 'border-dala-water bg-dala-water text-dala-bg'
                                    : 'border-dala-muted/40 text-dala-muted'
                                }`}
                              >
                                {finished ? <IconCheck size={13} /> : l.lesson}
                              </span>
                              <span className="min-w-0 flex-1 truncate text-[15px] text-dala-text">{l.title}</span>
                              <span className="shrink-0 text-xs text-dala-muted">{l.minutes} мин</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </>
                ) : (
                  <p className="mt-3 rounded-lg border border-dashed border-dala-gold/20 px-3 py-2.5 text-sm text-dala-muted">
                    Бұл модульдің мазмұны жазылып жатыр. Алдыңғы модульдерді бітірсең, дайын болады.
                  </p>
                )}
              </li>
            )
          })}
        </ol>

        <div className="dala-ornament mt-9" />

        <section className="mt-8">
          <h2 className="text-lg font-semibold text-dala-text">Прогресті сақтау</h2>
          <p className="mt-1 text-sm text-dala-muted">
            Прогресс осы телефонның жадында тұр. Телефон ауыстырсаң немесе браузер тазаласаң —
            файлға сақтап қой.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-dala-gold/25 px-4 text-sm font-medium text-dala-gold transition-colors hover:bg-dala-gold/10"
            >
              <IconDownload size={16} />
              Файлға сақтау
            </button>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-dala-gold/25 px-4 text-sm font-medium text-dala-gold transition-colors hover:bg-dala-gold/10"
            >
              <IconArrowRight size={16} />
              Файлдан қалпына келтіру
            </button>
            <button
              type="button"
              onClick={() => {
                reset()
                setNotice('Прогресс тазаланды.')
              }}
              className="flex min-h-[44px] items-center gap-1.5 rounded-lg border border-dala-alert/30 px-4 text-sm font-medium text-dala-alert transition-colors hover:bg-dala-alert/10"
            >
              <IconReset size={16} />
              Тазалау
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) void handleImport(f)
                e.target.value = ''
              }}
            />
          </div>
        </section>
      </main>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-dala-surface px-2 py-3 text-center">
      <dt className="text-[10px] uppercase tracking-wide text-dala-muted">{label}</dt>
      <dd className="font-mono text-base tabular-nums text-dala-text">{value}</dd>
    </div>
  )
}
