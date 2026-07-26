export default function DictionaryPage() {
  return (
    <main className="min-h-screen px-4 py-8">
      <h1 className="text-3xl font-bold text-dala-gold mb-6">
        Сөздік
      </h1>
      <p className="text-dala-muted mb-8">
        Машиналық оқу терминдерінің қазақша түсіндірмесі.
      </p>
      
      <div className="p-8 bg-dala-surface rounded-lg border border-dala-gold/20 text-center">
        <p className="text-dala-muted">
          Сөздік жасалуда... (60+ термин)
        </p>
      </div>
    </main>
  )
}
