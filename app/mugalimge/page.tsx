'use client'

import Link from 'next/link'
import { modules, getModuleLessons, lessonHref, TOTAL_MINUTES } from '@/lib/content'
import { glossary } from '@/lib/glossary'
import { IconArrowLeft, IconBook, IconCheck, IconDownload, IconWifiOff } from '@/components/ui/icons'

const SESSIONS = [
  {
    n: 1,
    title: 'Дерек деген не',
    module: 1,
    minutes: 45,
    plan: [
      ['5 мин', 'Сұрақ: «Шопан қойдың ауыратынын қайдан біледі?» Балалар айтсын.'],
      ['15 мин', '1-модульдің 1 және 2-сабағын телефоннан оқу. Жұппен.'],
      ['15 мин', '«Дала белгілері» интерактиві: әркім өз жиынын құрып, дәлдігін тақтаға жазады.'],
      ['10 мин', 'Талқылау: неге «құс ұшуы» көмектеспеді? Ырым мен белгінің айырмасы.'],
    ],
  },
  {
    n: 2,
    title: 'Заңдылық және түзу',
    module: 2,
    minutes: 45,
    plan: [
      ['5 мин', 'Өткенді еске түсіру: ерекшелік, мұндама.'],
      ['15 мин', '2-модульдің 1 және 2-сабағы.'],
      ['15 мин', '«Дала желі» интерактиві: жел күшін арттырып, табылған еңісті жазып отыру.'],
      ['10 мин', 'Тәжірибе: дерек санын 8-ден 80-ге дейін өсіріп, қатенің азаюын кестеге түсіру.'],
    ],
  },
  {
    n: 3,
    title: 'Арық: модель қалай оқиды',
    module: 3,
    minutes: 45,
    plan: [
      ['5 мин', 'Далада су қалай ағады? Еңіс туралы әңгіме.'],
      ['15 мин', '3-модульдің 1-сабағы.'],
      ['20 мин', '«Арық» интерактиві: үш сценарийді әркім өз қолымен шығарады. Тапсырма төменде.'],
      ['5 мин', 'Қорытынды: неге тік жерде қадам кіші болу керек?'],
    ],
  },
]

const TASKS = [
  'Оқу жылдамдығын 0.08-ге қой. Су қайда тұрып қалды? Неге?',
  'Оны 0.35-ке көтер. Су қалай құтылды? Неше қадам кетті?',
  '0.70-ке қой. Не болды? Қателік саны қалай өзгерді?',
  'Жер еңісін 2.0-ге қойып, үш шекараны қайта тап. Олар қай жаққа жылжыды?',
  'Қорытынды жаз: «Жер тік болса, қадам ... болуы керек».',
]

export default function TeacherPage() {
  const handlePrint = () => window.print()

  return (
    <div className="min-h-dvh pb-12">
      <header className="sticky top-0 z-40 border-b border-dala-gold/15 bg-dala-bg/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5">
          <Link
            href="/"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-dala-muted transition-colors hover:text-dala-text"
            aria-label="Басты бетке оралу"
          >
            <IconArrowLeft size={20} />
          </Link>
          <span className="font-medium text-dala-text">Мұғалімге</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6">
        <h1 className="text-2xl font-bold text-dala-gold">Үйірмені қалай өткізуге болады</h1>
        <p className="mt-2 text-dala-muted">
          Бұл курс сабақ үстінде де, үйде де оқуға жарайды. Төменде — 45 минуттық үш сабақтың
          дайын жоспары, тапсырмалар және интернетсіз өткізу нұсқауы.
        </p>

        <dl className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-xl border border-dala-gold/20 bg-dala-gold/15">
          <Stat label="Дайын сабақ" value={`${SESSIONS.length}`} />
          <Stat label="Оқу уақыты" value={`${TOTAL_MINUTES} мин`} />
          <Stat label="Сөздік" value={`${glossary.length}`} />
        </dl>

        <div className="dala-ornament mt-7" />

        <section className="mt-7">
          <h2 className="text-xl font-semibold text-dala-text">Не қажет</h2>
          <ul className="mt-3 space-y-2 text-dala-text">
            {[
              'Әр оқушыда (немесе әр жұпта) Android телефон немесе планшет.',
              'Бір рет интернет — модульдерді жүктеп алу үшін. Одан кейін қажет емес.',
              'Тақта немесе қағаз: сынып бойынша нәтижелерді салыстыру үшін.',
              'Тіркелу, аккаунт, парольдің қажеті жоқ.',
            ].map((t) => (
              <li key={t} className="flex gap-2.5">
                <IconCheck size={18} className="mt-0.5 shrink-0 text-dala-water" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-9">
          <h2 className="text-xl font-semibold text-dala-text">Сабақ жоспарлары</h2>
          <div className="mt-3 space-y-3">
            {SESSIONS.map((s) => {
              const mod = modules.find((m) => m.id === s.module)
              const lessons = getModuleLessons(s.module)
              return (
                <article key={s.n} className="rounded-xl border border-dala-gold/20 bg-dala-surface p-4">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-semibold text-dala-text">
                      {s.n}-сабақ. {s.title}
                    </h3>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-dala-muted">{s.minutes} мин</span>
                  </div>
                  <p className="mt-0.5 text-sm text-dala-muted">{mod?.title}</p>

                  <ol className="mt-3 space-y-1.5">
                    {s.plan.map(([time, what]) => (
                      <li key={what} className="flex gap-3 text-[15px]">
                        <span className="w-14 shrink-0 font-mono text-xs tabular-nums text-dala-water">{time}</span>
                        <span className="text-dala-text">{what}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="mt-3 flex flex-wrap gap-1.5 print:hidden">
                    {lessons.map((l) => (
                      <Link
                        key={l.slug}
                        href={lessonHref(l)}
                        className="flex min-h-[44px] items-center rounded-lg border border-dala-gold/20 px-3 text-xs text-dala-muted transition-colors hover:border-dala-water/50 hover:text-dala-text"
                      >
                        {l.title}
                      </Link>
                    ))}
                  </div>
                </article>
              )
            })}
          </div>
        </section>

        <section className="mt-9">
          <h2 className="text-xl font-semibold text-dala-text">Раздатка: «Арық» тапсырмасы</h2>
          <p className="mt-1 text-sm text-dala-muted">
            Оқушы интерактивті ашып, әр тармақты орындап, жауабын дәптерге жазады.
          </p>
          <ol className="mt-3 space-y-2 rounded-xl border border-dala-gold/20 bg-dala-surface p-4">
            {TASKS.map((t, i) => (
              <li key={t} className="flex gap-3 text-[15px] text-dala-text">
                <span className="font-mono text-sm text-dala-gold">{i + 1}.</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            onClick={handlePrint}
            className="mt-3 flex min-h-[44px] items-center gap-1.5 rounded-lg border border-dala-gold/25 px-4 text-sm font-medium text-dala-gold transition-colors hover:bg-dala-gold/10 print:hidden"
          >
            <IconDownload size={16} />
            Басып шығару
          </button>
        </section>

        <section className="mt-9">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-dala-text">
            <IconWifiOff size={20} className="text-dala-gold" />
            Интернетсіз өткізу
          </h2>
          <ol className="mt-3 space-y-2 text-[15px] text-dala-text">
            <li>
              <span className="font-medium text-dala-water">1.</span> Мектепте Wi-Fi бар кезде әр
              телефоннан <Link href="/kurs" className="text-dala-water underline">курс картасын</Link> ашыңыз.
            </li>
            <li>
              <span className="font-medium text-dala-water">2.</span> Керекті модульдің «Жүктеу»
              түймесін басыңыз — сабақтар мен интерактивтер телефонға сақталады.
            </li>
            <li>
              <span className="font-medium text-dala-water">3.</span> Интернетті өшіріп, бетті
              жаңартып көріңіз: сабақ та, интерактив те жұмыс істеуі керек.
            </li>
            <li>
              <span className="font-medium text-dala-water">4.</span> Оқушының прогресі телефонда
              сақталады. Телефон ауысса — «Файлға сақтау» арқылы көшіріп алуға болады.
            </li>
          </ol>
        </section>

        <section className="mt-9">
          <h2 className="text-xl font-semibold text-dala-text">Жиі қойылатын сұрақтар</h2>
          <div className="mt-3 space-y-3">
            <Faq q="Математиканы қаншалық білу керек?">
              7-сынып деңгейі жеткілікті. Формулалар бар, бірақ әрқайсысының алдында сурет пен
              метафора тұрады. Формуланы жаттаудың қажеті жоқ.
            </Faq>
            <Faq q="Оқушының нәтижесін қалай көремін?">
              Әр сабақтың соңында тексеру бар, нәтижесі пайызбен көрсетіледі. Курс картасында
              орташа балл тұрады — оқушы соны көрсете алады.
            </Faq>
            <Faq q="Бағдарламалауды білу керек пе?">
              Жоқ. Кодтың үзінділері бар, бірақ олар түсіндіру үшін ғана — теруге тура келмейді.
            </Faq>
            <Faq q="Телефон әлсіз болса ше?">
              Интерактивтер қарапайым графикамен жасалған және ауыр кітапханалар жүктелмейді.
              Экран көрінбей тұрса, бетті жаңартып көріңіз.
            </Faq>
          </div>
        </section>

        <div className="dala-ornament mt-9" />

        <Link
          href="/sozdik"
          className="mt-7 flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg border border-dala-gold/30 text-sm font-medium text-dala-gold transition-colors hover:bg-dala-gold/10 print:hidden"
        >
          <IconBook size={16} />
          Терминдер сөздігі ({glossary.length})
        </Link>
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

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details className="rounded-xl border border-dala-gold/20 bg-dala-surface">
      <summary className="flex min-h-[44px] cursor-pointer items-center px-4 font-medium text-dala-text">
        {q}
      </summary>
      <p className="px-4 pb-3 text-[15px] text-dala-muted">{children}</p>
    </details>
  )
}
