'use client'

import { useState } from 'react'
import { glossary, searchGlossary } from '@/lib/glossary'

export default function DictionaryPage() {
  const [query, setQuery] = useState('')
  const results = query ? searchGlossary(query) : glossary.slice(0, 10)

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-dala-gold mb-2">Сөздік</h1>
      <p className="text-dala-muted mb-6">
        Машиналық оқу терминдерінің қазақша түсіндірмесі (60+)
      </p>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Іздеу: градиент, арық, data..."
          className="w-full px-4 py-3 bg-dala-surface border border-dala-gold/20 rounded-lg text-dala-text placeholder:text-dala-muted focus:border-dala-water focus:outline-none"
        />
      </div>

      {/* Results */}
      <div className="space-y-4">
        {results.map((term, idx) => (
          <div
            key={idx}
            className="p-4 bg-dala-surface rounded-xl border border-dala-gold/20"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h2 className="text-lg font-semibold text-dala-text">{term.kk}</h2>
                <p className="text-sm text-dala-muted">
                  {term.en} · {term.ru}
                </p>
              </div>
              {term.moduleRef && (
                <span className="text-xs px-2 py-1 bg-dala-bg text-dala-muted rounded">
                  М{term.moduleRef}
                </span>
              )}
            </div>
            
            <p className="text-dala-text mb-2">{term.short}</p>
            
            <div className="p-3 bg-dala-bg rounded-lg">
              <p className="text-sm text-dala-water">
                Метафора: {term.metaphor}
              </p>
            </div>
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <p className="text-center text-dala-muted py-8">
          Ештеңе табылмады. Басқа сөз іздеңіз.
        </p>
      )}
    </main>
  )
}
