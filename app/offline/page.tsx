import Link from 'next/link'
import { IconArrowRight, IconWifiOff } from '@/components/ui/icons'

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center px-4">
      <IconWifiOff size={32} className="text-dala-gold" />
      <h1 className="mt-4 text-2xl font-bold text-dala-gold">Интернет жоқ</h1>
      <p className="mt-2 text-dala-muted">
        Бұл бет әлі жүктелмеген. Бұрын ашқан немесе «Жүктеу» түймесімен сақтаған модульдер
        интернетсіз де ашылады.
      </p>

      <div className="mt-6 space-y-2">
        <Link
          href="/kurs"
          className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-lg bg-dala-water font-medium text-dala-bg transition-all hover:brightness-110 active:scale-[0.98]"
        >
          Курс картасы
          <IconArrowRight size={17} />
        </Link>
        <Link
          href="/"
          className="flex min-h-[44px] items-center justify-center rounded-lg border border-dala-gold/30 font-medium text-dala-gold transition-colors hover:bg-dala-gold/10"
        >
          Басты бет
        </Link>
      </div>
    </main>
  )
}
