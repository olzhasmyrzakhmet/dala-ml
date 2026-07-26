export default function CoursePage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <h1 className="text-3xl font-bold text-dala-gold mb-6">
        Курс: Машиналық оқу
      </h1>
      <p className="text-dala-muted mb-8">
        8 модуль, 22 апта. Стептік метафоралар арқылы.
      </p>
      
      <div className="grid gap-4">
        {[
          { id: 1, title: 'Мәліметтер', status: 'жасалуда' },
          { id: 2, title: 'Заңдылық іздеу', status: 'жасалуда' },
          { id: 3, title: 'Арық: оқыту', status: 'жасалуда' },
          { id: 4, title: 'Таңба: жіктеу', status: 'жасалуда' },
          { id: 5, title: 'Жайлау мен қыстау', status: 'жасалуда' },
          { id: 6, title: 'Киіз үй: нейрондық желі', status: 'жасалуда' },
          { id: 7, title: 'Көру', status: 'жасалуда' },
          { id: 8, title: 'Жоба', status: 'жасалуда' },
        ].map((module) => (
          <div
            key={module.id}
            className="p-4 bg-dala-surface rounded-lg border border-dala-gold/20"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-dala-water text-sm">Модуль {module.id}</span>
                <h2 className="text-lg font-semibold text-dala-text">{module.title}</h2>
              </div>
              <span className="text-xs text-dala-muted px-2 py-1 bg-dala-bg rounded">
                {module.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
