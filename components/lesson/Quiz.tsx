'use client'

import { useMemo, useState } from 'react'
import { IconCheck, IconClose, IconReset } from '@/components/ui/icons'

export interface QuizOption {
  id: string
  text: string
  /** Разбор именно этого варианта: почему верно или почему нет. */
  explanation: string
}

export interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  correctId: string
}

interface QuizProps {
  questions: QuizQuestion[]
  onComplete?: (score: number, answers: Record<string, string>) => void
}

/**
 * Порядок вариантов перемешивается детерминированно по тексту вопроса.
 *
 * Без этого правильный ответ почти везде оказывался первым: пройти квиз можно
 * было, не читая ни вопроса, ни разбора — а разбор здесь и есть учебная ценность.
 * Порядок стабилен между перерисовками, но у каждого вопроса свой.
 */
function shuffleOptions(q: QuizQuestion): QuizOption[] {
  let seed = 0
  for (const ch of q.id + q.question) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0
  const out = [...q.options]
  for (let i = out.length - 1; i > 0; i--) {
    seed = (seed * 1103515245 + 12345) >>> 0
    const j = seed % (i + 1)
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export function Quiz({ questions, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<Record<string, boolean>>({})
  const ordered = useMemo(
    () => new Map(questions.map((q) => [q.id, shuffleOptions(q)])),
    [questions]
  )

  const correctCount = useMemo(
    () => questions.filter((q) => checked[q.id] && answers[q.id] === q.correctId).length,
    [questions, answers, checked]
  )
  const allChecked = questions.every((q) => checked[q.id])
  const score = Math.round((correctCount / Math.max(1, questions.length)) * 100)

  const select = (qid: string, oid: string) => {
    if (checked[qid]) return
    setAnswers((prev) => ({ ...prev, [qid]: oid }))
  }

  const check = (qid: string) => {
    if (!answers[qid] || checked[qid]) return
    const nextChecked = { ...checked, [qid]: true }
    setChecked(nextChecked)

    if (questions.every((q) => nextChecked[q.id])) {
      const right = questions.filter((q) => answers[q.id] === q.correctId).length
      onComplete?.(Math.round((right / questions.length) * 100), answers)
    }
  }

  const retry = () => {
    setAnswers({})
    setChecked({})
  }

  return (
    <div className="space-y-4">
      {questions.map((q, idx) => {
        const isChecked = checked[q.id]
        const picked = answers[q.id]
        const right = picked === q.correctId

        return (
          <div key={q.id} className="rounded-xl border border-dala-gold/20 bg-dala-surface p-4">
            <p className="mb-1 text-xs text-dala-muted">
              Сұрақ {idx + 1} / {questions.length}
            </p>
            <p className="mb-4 font-medium text-dala-text">{q.question}</p>

            <div role="radiogroup" aria-label={q.question} className="space-y-2">
              {(ordered.get(q.id) ?? q.options).map((opt) => {
                const selected = picked === opt.id
                const isRight = opt.id === q.correctId

                let cls = 'border-dala-gold/20 bg-dala-bg hover:border-dala-water/50'
                if (!isChecked && selected) cls = 'border-dala-water bg-dala-water/15'
                else if (isChecked && isRight) cls = 'border-dala-water bg-dala-water/15'
                else if (isChecked && selected) cls = 'border-dala-alert bg-dala-alert/15'
                else if (isChecked) cls = 'border-dala-gold/10 bg-dala-bg opacity-55'

                return (
                  <button
                    key={opt.id}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => select(q.id, opt.id)}
                    disabled={isChecked}
                    className={`flex w-full min-h-[44px] items-start gap-2.5 rounded-lg border p-3 text-left transition-colors duration-200 active:scale-[0.99] ${cls}`}
                  >
                    <span
                      aria-hidden
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${
                        isChecked && isRight
                          ? 'border-dala-water bg-dala-water text-dala-bg'
                          : isChecked && selected
                            ? 'border-dala-alert bg-dala-alert text-dala-bg'
                            : selected
                              ? 'border-dala-water bg-dala-water text-dala-bg'
                              : 'border-dala-muted/50'
                      }`}
                    >
                      {isChecked && isRight && <IconCheck size={13} />}
                      {isChecked && selected && !isRight && <IconClose size={13} />}
                    </span>
                    <span className="text-[15px] text-dala-text">{opt.text}</span>
                  </button>
                )
              })}
            </div>

            {!isChecked && (
              <button
                type="button"
                onClick={() => check(q.id)}
                disabled={!picked}
                className="mt-3 min-h-[44px] rounded-lg bg-dala-water px-5 font-medium text-dala-bg transition-all duration-200 hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Тексеру
              </button>
            )}

            {isChecked && (
              <div className="mt-3 rounded-lg bg-dala-bg p-3" aria-live="polite">
                <p className={`flex items-center gap-1.5 text-sm font-medium ${right ? 'text-dala-water' : 'text-dala-alert'}`}>
                  {right ? <IconCheck size={15} /> : <IconClose size={15} />}
                  {right ? 'Дұрыс' : 'Қате'}
                </p>
                <p className="mt-1 text-[15px] text-dala-text">
                  {q.options.find((o) => o.id === picked)?.explanation}
                </p>
                {!right && (
                  <p className="mt-2 border-t border-dala-gold/15 pt-2 text-[15px] text-dala-muted">
                    <span className="text-dala-water">Дұрыс жауап: </span>
                    {q.options.find((o) => o.id === q.correctId)?.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        )
      })}

      {allChecked && (
        <div className="dala-rise rounded-xl border border-dala-gold/25 bg-dala-surface p-4">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-lg font-semibold text-dala-text">
              Нәтиже: {correctCount} / {questions.length}
            </p>
            <span className="font-mono text-xl tabular-nums text-dala-gold">{score}%</span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-dala-bg">
            <div
              className={`h-full rounded-full transition-[width] duration-500 ${
                score === 100 ? 'bg-dala-water' : score >= 60 ? 'bg-dala-gold' : 'bg-dala-alert'
              }`}
              style={{ width: `${score}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-dala-muted">
            {score === 100
              ? 'Бәрі дұрыс. Келесі сабаққа өтуге болады.'
              : score >= 60
                ? 'Жақсы. Қателескен сұрақтың талдауын оқып шық.'
                : 'Сабақты тағы бір қарап шық — асығыстың қажеті жоқ.'}
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-3 flex min-h-[44px] items-center gap-1.5 rounded-lg border border-dala-gold/25 px-4 text-sm font-medium text-dala-gold transition-colors hover:bg-dala-gold/10 active:scale-[0.98]"
          >
            <IconReset size={15} />
            Қайтадан өту
          </button>
        </div>
      )}
    </div>
  )
}
