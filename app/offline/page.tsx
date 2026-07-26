import Link from 'next/link'

export default function OfflinePage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="text-center">
        <div className="text-6xl mb-4">🔌</div>
        <h1 className="text-2xl font-bold text-dala-gold mb-4">
          Офлайн режимі
        </h1>
        <p className="text-dala-muted mb-8 max-w-md">
          Интернет байланысы жоқ. Бірақ сіз жүктеген модульдерді оқи аласыз.
        </p>
        
        <div className="space-y-3">
          <Link
            href="/kurs"
            className="block px-6 py-3 bg-dala-water text-dala-bg rounded-lg font-medium hover:brightness-110 transition-all"
          >
            Курсқа өту
          </Link>
          <p className="text-dala-muted text-sm">
            Жүктеген модульдеріңізге кіріңіз
          </p>
        </div>
      </div>
    </main>
  )
}
