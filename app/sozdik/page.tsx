'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { glossary, searchGlossary } from '@/lib/glossary'
import { modules } from '@/lib/content'
import { IconArrowLeft, IconClose, IconSearch } from '@/components/ui/icons'

export default function DictionaryPage() {
  const [query, setQuery] = useState('')
  const [moduleFilter, setModuleFilter] = useState<number | null>(null)

  const results = useMemo(() => {
    const base = query.trim() ? searchGlossary(query) : glossary
    return moduleFilter ? base.filter((t) => t.moduleRef === moduleFilter) : base
  }, [query, moduleFilter])

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
          <span className="font-medium text-dala-text">Сөздік</span>
          <span className="ml-auto font-mono text-xs tabular-nums text-dala-muted">
            {glossary.length} термин
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6">
        <h1 className="text-2xl font-bold text-dala-gold">Терминдер сөздігі</h1>
        <p className="mt-1 text-dala-muted">
          Әр термин — қазақша түсіндірме, ағылшын атауы және дала метафорасы.
        </p>

        <div className="sticky top-[57px] z-30 -mx-4 mt-4 bg-dala-bg px-4 pb-3 pt-1">
          <div className="relative">
            <IconSearch
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-dala-muted"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Іздеу: градиент, арық, data…"
              aria-label="Термин іздеу"
              className="min-h-[48px] w-full rounded-lg border border-dala-gold/20 bg-dala-surface pl-10 pr-11 text-dala-text placeholder:text-dala-muted focus:border-dala-water focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Іздеуді тазалау"
                className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center text-dala-muted transition-colors hover:text-dala-text"
              >
                <IconClose size={18} />
              </button>
            )}
          </div>

          <div className="-mx-4 mt-2 flex gap-1.5 overflow-x-auto px-4 pb-1">
            <FilterChip active={moduleFilter === null} onClick={() => setModuleFilter(null)}>
              Барлығы
            </FilterChip>
            {modules.map((m) => (
              <FilterChip
                key={m.id}
                active={moduleFilter === m.id}
                onClick={() => setModuleFilter(moduleFilter === m.id ? null : m.id)}
              >
                {m.id}. {m.title}
              </FilterChip>
            ))}
          </div>
        </div>

        <p aria-live="polite" className="text-sm text-dala-muted">
          {results.length === 0
            ? 'Ештеңе табылмады'
            : `${results.length} термин табылды`}
        </p>

        <ul className="mt-3 space-y-2.5">
          {results.map((term) => (
            <li key={`${term.kk}-${term.en}`} className="rounded-xl border border-dala-gold/20 bg-dala-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-dala-text">{term.kk}</h2>
                  <p className="text-sm text-dala-muted">
                    <span className="font-mono">{term.en}</span>
                  </p>
                </div>
                {term.moduleRef && (
                  <span className="shrink-0 rounded border border-dala-gold/20 px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-dala-muted">
                    {term.moduleRef}-модуль
                  </span>
                )}
              </div>

              <p className="mt-2 text-[15px] text-dala-text">{term.short}</p>

              <p className="mt-2 border-l-2 border-dala-water/50 pl-3 text-sm text-dala-water">
                {term.metaphor}
              </p>
            </li>
          ))}
        </ul>

        {results.length === 0 && (
          <div className="mt-6 rounded-xl border border-dashed border-dala-gold/20 p-6 text-center">
            <p className="text-dala-text">«{query}» бойынша ештеңе табылмады.</p>
            <p className="mt-1 text-sm text-dala-muted">
              Басқа сөзбен көр: «градиент», «арық», «қателік» немесе ағылшынша атауы.
            </p>
            <button
              type="button"
              onClick={() => {
                setQuery('')
                setModuleFilter(null)
              }}
              className="mt-3 min-h-[44px] rounded-lg border border-dala-gold/25 px-4 text-sm font-medium text-dala-gold transition-colors hover:bg-dala-gold/10"
            >
              Барлық терминді көрсету
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`min-h-[44px] shrink-0 whitespace-nowrap rounded-full border px-3.5 text-xs font-medium transition-colors ${
        active
          ? 'border-dala-water bg-dala-water/15 text-dala-water'
          : 'border-dala-gold/20 text-dala-muted hover:border-dala-water/40 hover:text-dala-text'
      }`}
    >
      {children}
    </button>
  )
}
