'use client'

import type { ReactNode, RefObject } from 'react'
import { IconCheck, IconClose, IconReset, IconWarn } from '@/components/ui/icons'
import type { StatusTone } from './palette'

interface WidgetFrameProps {
  /** Название виджета — казахское, без эмодзи. */
  title: string
  /** Одна строка: что здесь трогать. */
  hint?: string
  /** Верхняя панель — метафора (вода, отара, юрта). */
  metaphor: ReactNode
  /** Нижняя панель — настоящий график/цифры. На широком экране встаёт справа. */
  science: ReactNode
  /** Ползунки и кнопки. */
  controls: ReactNode
  /** Итог: что сейчас происходит и почему. */
  status?: { tone: StatusTone; title: string; text: string }
  onReset?: () => void
  /** Цифры под графиком: [подпись, значение]. */
  readouts?: { label: string; value: string; tone?: StatusTone }[]
  /** Ссылка на корень — по ней виджет узнаёт, виден ли он на экране. */
  rootRef?: RefObject<HTMLDivElement>
}

const toneRing: Record<StatusTone, string> = {
  ok: 'border-dala-water/40 bg-dala-water/10 text-dala-water',
  warn: 'border-dala-gold/40 bg-dala-gold/10 text-dala-gold',
  bad: 'border-dala-alert/40 bg-dala-alert/10 text-dala-alert',
}

const toneText: Record<StatusTone, string> = {
  ok: 'text-dala-water',
  warn: 'text-dala-gold',
  bad: 'text-dala-alert',
}

function ToneIcon({ tone }: { tone: StatusTone }) {
  if (tone === 'ok') return <IconCheck size={16} />
  if (tone === 'warn') return <IconWarn size={16} />
  return <IconClose size={16} />
}

/**
 * Общая оболочка всех восьми интерактивов: двухпанельный принцип из SPEC §4.
 * Сверху метафора, снизу наука; на ≥640px — рядом.
 */
export function WidgetFrame({
  title,
  hint,
  metaphor,
  science,
  controls,
  status,
  onReset,
  readouts,
  rootRef,
}: WidgetFrameProps) {
  return (
    <div ref={rootRef} className="w-full overflow-hidden rounded-xl border border-dala-gold/20 bg-dala-surface">
      <header className="flex items-center justify-between gap-3 border-b border-dala-gold/15 px-4 py-3">
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold leading-tight text-dala-text">{title}</h3>
          {hint && <p className="mt-0.5 text-xs leading-snug text-dala-muted">{hint}</p>}
        </div>
        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="flex h-11 min-w-[44px] shrink-0 items-center gap-1.5 rounded-lg border border-dala-gold/25 px-3 text-xs font-medium text-dala-gold transition-colors duration-200 hover:bg-dala-gold/10 active:scale-[0.98]"
          >
            <IconReset size={15} />
            Қайтадан
          </button>
        )}
      </header>

      <div className="grid gap-px bg-dala-gold/10 sm:grid-cols-2">
        <figure className="m-0 bg-dala-bg p-3">
          <figcaption className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-dala-water/80">
            <span className="h-1.5 w-1.5 rounded-full bg-dala-water" />
            Метафора
          </figcaption>
          {metaphor}
        </figure>
        <figure className="m-0 bg-dala-bg p-3">
          <figcaption className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-dala-gold/80">
            <span className="h-1.5 w-1.5 rounded-full bg-dala-gold" />
            Ғылым
          </figcaption>
          {science}
        </figure>
      </div>

      {readouts && readouts.length > 0 && (
        <dl className="grid grid-cols-3 gap-px border-t border-dala-gold/15 bg-dala-gold/10">
          {readouts.map((r) => (
            <div key={r.label} className="bg-dala-surface px-3 py-2.5 text-center">
              {/* Без uppercase: он ломает θ и казахские глифы в подписях. */}
              <dt className="text-[11px] tracking-wide text-dala-muted">{r.label}</dt>
              <dd className={`font-mono text-sm tabular-nums ${r.tone ? toneText[r.tone] : 'text-dala-text'}`}>
                {r.value}
              </dd>
            </div>
          ))}
        </dl>
      )}

      <div className="space-y-4 border-t border-dala-gold/15 px-4 py-4">{controls}</div>

      {status && (
        <div
          role="status"
          aria-live="polite"
          className={`flex items-start gap-2.5 border-t px-4 py-3 ${toneRing[status.tone]}`}
        >
          <span className="mt-0.5 shrink-0">
            <ToneIcon tone={status.tone} />
          </span>
          <p className="text-sm leading-snug">
            <span className="font-semibold">{status.title}. </span>
            <span className="text-dala-text/85">{status.text}</span>
          </p>
        </div>
      )}
    </div>
  )
}
