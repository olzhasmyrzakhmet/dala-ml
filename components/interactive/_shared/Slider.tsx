'use client'

import { useId } from 'react'

interface SliderProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  /** Как показать значение справа от подписи. */
  format?: (v: number) => string
  /** Подсказка под ползунком: что произойдёт, если тянуть влево/вправо. */
  hint?: string
  /** Подписи краёв шкалы. */
  minLabel?: string
  maxLabel?: string
  tone?: 'water' | 'gold' | 'alert'
  disabled?: boolean
}

/**
 * Нативный input[type=range]. Сознательно не свой div-ползунок:
 * нативный бесплатно даёт палец, клавиатуру, скринридер и системные настройки.
 */
export function Slider({
  label,
  value,
  min,
  max,
  step = 0.01,
  onChange,
  format = (v) => v.toFixed(2),
  hint,
  minLabel,
  maxLabel,
  tone = 'water',
  disabled = false,
}: SliderProps) {
  const id = useId()
  const pct = ((value - min) / (max - min)) * 100
  const valueColor =
    tone === 'gold' ? 'text-dala-gold' : tone === 'alert' ? 'text-dala-alert' : 'text-dala-water'

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-medium text-dala-text">
          {label}
        </label>
        <output htmlFor={id} className={`font-mono text-sm tabular-nums ${valueColor}`}>
          {format(value)}
        </output>
      </div>

      <input
        id={id}
        type="range"
        className={`dala-range dala-range--${tone} mt-0.5`}
        style={{ ['--pct' as string]: `${pct}%` }}
        value={value}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        onChange={(e) => onChange(parseFloat(e.target.value))}
      />

      {(minLabel || maxLabel || hint) && (
        <div className="-mt-1 flex items-start justify-between gap-3 text-[11px] leading-tight text-dala-muted">
          <span>{minLabel}</span>
          {hint && <span className="text-center">{hint}</span>}
          <span className="text-right">{maxLabel}</span>
        </div>
      )}
    </div>
  )
}

interface SegmentedProps<T extends string | number> {
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
}

/** Дискретный выбор там, где ползунок не к месту (число слоёв, набор признаков). */
export function Segmented<T extends string | number>({ label, value, options, onChange }: SegmentedProps<T>) {
  return (
    <fieldset className="w-full">
      <legend className="mb-2 text-sm font-medium text-dala-text">{label}</legend>
      <div className="flex gap-2" role="radiogroup">
        {options.map((o) => {
          const active = o.value === value
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(o.value)}
              className={`min-h-[44px] flex-1 rounded-lg border px-2 text-sm font-medium transition-colors duration-200 active:scale-[0.98] ${
                active
                  ? 'border-dala-water bg-dala-water text-dala-bg'
                  : 'border-dala-gold/20 bg-dala-bg text-dala-muted hover:border-dala-water/50 hover:text-dala-text'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </fieldset>
  )
}
