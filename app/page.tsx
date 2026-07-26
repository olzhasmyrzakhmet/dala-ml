'use client'

import Link from 'next/link'
import { useProgress } from '@/lib/progress'
import { AryqGradient } from '@/components/interactive/AryqGradient'

export default function Home() {
  const { getContinue } = useProgress()
  const continueSlug = getContinue()

  return (
    <main className="min-h-screen">
      {/* Hero with live widget */}
      <section className="px-4 py-12 max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-dala-gold mb-4 text-center">
          Дала ML
        </h1>
        <p className="text-lg text-dala-muted text-center mb-8 max-w-md mx-auto">
          Машиналық оқуды үйрену платформасы. Стептік метафоралар арқылы түсіну.
        </p>

        {/* Live widget preview */}
        <div className="mb-8">
          <p className="text-sm text-dala-muted text-center mb-4">
            Градиентті түсу — су арықпен төмен ағады:
          </p>
          <AryqGradient />
        </div>

        {/* CTA */}
        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          {continueSlug ? (
            <Link
              href={`/kurs/${continueSlug}`}
              className="block w-full py-3 px-4 bg-dala-water text-dala-bg rounded-lg font-medium text-center hover:brightness-110 transition-all"
            >
              Жалғастыру →
            </Link>
          ) : (
            <Link
              href="/kurs"
              className="block w-full py-3 px-4 bg-dala-gold text-dala-bg rounded-lg font-medium text-center hover:brightness-110 transition-all"
            >
              Курсқа кіру
            </Link>
          )}
          <Link
            href="/sozdik"
            className="block w-full py-3 px-4 border border-dala-gold/30 text-dala-gold rounded-lg font-medium text-center hover:bg-dala-gold/10 transition-all"
          >
            Сөздік
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-8 max-w-3xl mx-auto border-t border-dala-gold/10">
        <div className="grid gap-4">
          <div className="p-4 bg-dala-surface rounded-xl border border-dala-gold/20">
            <h3 className="text-dala-water font-medium mb-2">8 интерактив</h3>
            <p className="text-dala-muted text-sm">
              Әр түсінікті қолмен тексер — арық, отар, киіз үй...
            </p>
          </div>
          <div className="p-4 bg-dala-surface rounded-xl border border-dala-gold/20">
            <h3 className="text-dala-water font-medium mb-2">Қазақ тілінде</h3>
            <p className="text-dala-muted text-sm">
              Терминдер, түсіндірмелер, мысалдар — бәрі қазақша
            </p>
          </div>
          <div className="p-4 bg-dala-surface rounded-xl border border-dala-gold/20">
            <h3 className="text-dala-water font-medium mb-2">Офлайн жұмыс</h3>
            <p className="text-dala-muted text-sm">
              Модульді жүктеп, интернетсіз оқы
            </p>
          </div>
        </div>
      </section>

      {/* Glyphs test */}
      <section className="px-4 py-8 text-center border-t border-dala-gold/10">
        <p className="text-xs text-dala-muted mb-2">Қазақша глифтер:</p>
        <p className="text-dala-text text-lg tracking-wider">
          ә ғ қ ң ө ұ ү һ і
        </p>
      </section>
    </main>
  )
}
