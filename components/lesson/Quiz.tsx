'use client'

import { useState } from 'react'

interface QuizOption {
  id: string
  text: string
  explanation: string
}

interface QuizQuestion {
  id: string
  question: string
  options: QuizOption[]
  correctId: string
}

interface QuizProps {
  questions: QuizQuestion[]
  onComplete?: (score: number, answers: Record<string, string>) => void
}

export function Quiz({ questions, onComplete }: QuizProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({})

  const handleSelect = (questionId: string, optionId: string) => {
    if (submitted[questionId]) return
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }))
  }

  const handleSubmit = (questionId: string) => {
    if (!answers[questionId]) return
    setSubmitted((prev) => ({ ...prev, [questionId]: true }))
    
    // Check if all questions answered
    const allAnswered = questions.every((q) => submitted[q.id] || q.id === questionId)
    if (allAnswered) {
      const correct = questions.filter((q) => answers[q.id] === q.correctId).length
      const score = Math.round((correct / questions.length) * 100)
      onComplete?.(score, answers)
    }
  }

  const getOptionStyle = (questionId: string, optionId: string, correctId: string) => {
    const isSelected = answers[questionId] === optionId
    const isSubmitted = submitted[questionId]
    const isCorrect = optionId === correctId

    if (!isSubmitted) {
      return isSelected
        ? 'bg-dala-water/20 border-dala-water'
        : 'bg-dala-bg border-dala-gold/20 hover:border-dala-gold/40'
    }

    if (isCorrect) {
      return 'bg-dala-water/20 border-dala-water'
    }

    if (isSelected && !isCorrect) {
      return 'bg-dala-alert/20 border-dala-alert'
    }

    return 'bg-dala-bg border-dala-gold/20 opacity-50'
  }

  const correctCount = questions.filter((q) => answers[q.id] === q.correctId).length
  const allSubmitted = questions.every((q) => submitted[q.id])

  return (
    <div className="space-y-6">
      {allSubmitted && (
        <div className="p-4 bg-dala-surface rounded-xl border border-dala-gold/20">
          <p className="text-lg font-semibold text-dala-text">
            Нәтиже: {correctCount} / {questions.length} ({Math.round((correctCount / questions.length) * 100)}%)
          </p>
          <p className="text-dala-muted text-sm mt-1">
            {correctCount === questions.length
              ? '✨ Керемет! Барлығы дұрыс'
              : correctCount >= questions.length / 2
              ? '✅ Жақсы, бірақ тағы қара'
              : '⚠️ Қайтадан өтіңіз'}
          </p>
        </div>
      )}

      {questions.map((q, idx) => (
        <div key={q.id} className="p-4 bg-dala-surface rounded-xl border border-dala-gold/20">
          <p className="text-dala-text font-medium mb-4">
            {idx + 1}. {q.question}
          </p>

          <div className="space-y-2">
            {q.options.map((opt) => (
              <button
                key={opt.id}
                onClick={() => handleSelect(q.id, opt.id)}
                disabled={submitted[q.id]}
                className={`w-full p-3 rounded-lg border text-left transition-all ${getOptionStyle(
                  q.id,
                  opt.id,
                  q.correctId
                )}`}
              >
                <span className="text-dala-text">{opt.text}</span>
              </button>
            ))}
          </div>

          {!submitted[q.id] && answers[q.id] && (
            <button
              onClick={() => handleSubmit(q.id)}
              className="mt-3 px-4 py-2 bg-dala-water text-dala-bg rounded-lg font-medium hover:brightness-110 transition-all"
            >
              Тексеру
            </button>
          )}

          {submitted[q.id] && (
            <div className="mt-3 p-3 bg-dala-bg rounded-lg">
              <p className="text-sm text-dala-muted">
                {answers[q.id] === q.correctId ? (
                  <span className="text-dala-water">✅ Дұрыс!</span>
                ) : (
                  <span className="text-dala-alert">❌ Қате</span>
                )}
              </p>
              <p className="text-sm text-dala-text mt-1">
                {q.options.find((o) => o.id === answers[q.id])?.explanation}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
