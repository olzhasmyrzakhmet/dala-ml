'use client'

import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'
import { READY_MODULES, getModuleLessons, lessonHref, nextUnfinished } from '@/lib/content'
import { useProgress } from '@/lib/progress'
import { IconArrowLeft, IconArrowRight, IconAward, IconCheck, IconDownload } from '@/components/ui/icons'
import { fontFamily } from '@/components/interactive/_shared/draw'

const W = 1200
const H = 850

export default function CertificatePage() {
  const { isDone, averageScore } = useProgress()
  const [name, setName] = useState('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const required = READY_MODULES.flatMap((m) => getModuleLessons(m))
  const doneCount = required.filter((l) => isDone(l.slug)).length
  const earned = doneCount === required.length && required.length > 0
  const next = nextUnfinished(isDone)

  /** Сертификат рисуется прямо на устройстве: бэкенда у проекта нет. */
  const draw = useCallback(
    (ctx: CanvasRenderingContext2D) => {
      ctx.fillStyle = '#12140F'
      ctx.fillRect(0, 0, W, H)

      // Рамка с орнаментом
      ctx.strokeStyle = 'rgba(217,164,65,0.55)'
      ctx.lineWidth = 3
      ctx.strokeRect(38, 38, W - 76, H - 76)
      ctx.strokeStyle = 'rgba(217,164,65,0.25)'
      ctx.lineWidth = 1
      ctx.strokeRect(52, 52, W - 104, H - 104)

      ctx.save()
      ctx.strokeStyle = 'rgba(217,164,65,0.35)'
      ctx.lineWidth = 2
      for (let x = 90; x < W - 90; x += 26) {
        ctx.beginPath()
        ctx.moveTo(x, 92)
        ctx.lineTo(x + 9, 80)
        ctx.lineTo(x + 18, 92)
        ctx.stroke()
      }
      ctx.restore()

      // Русло арыка и капля — тот же знак, что и у приложения
      ctx.save()
      ctx.strokeStyle = '#D9A441'
      ctx.lineWidth = 5
      ctx.beginPath()
      for (let x = 0; x <= 260; x += 4) {
        const n = (x - 130) / 130
        const y = 250 - 52 * (1 - n * n)
        if (x === 0) ctx.moveTo(W / 2 - 130 + x, y)
        else ctx.lineTo(W / 2 - 130 + x, y)
      }
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(W / 2, 250 - 52 - 22, 22, 0, Math.PI * 2)
      ctx.fillStyle = '#3FA9A0'
      ctx.fill()
      ctx.restore()

      ctx.textAlign = 'center'

      ctx.fillStyle = '#D9A441'
      ctx.font = `700 54px ${fontFamily()}`
      ctx.fillText('Дала ML', W / 2, 350)

      ctx.fillStyle = '#9A9B90'
      ctx.font = `400 24px ${fontFamily()}`
      ctx.fillText('машиналық оқу негіздері курсын аяқтады', W / 2, 392)

      ctx.fillStyle = '#EDEAE2'
      ctx.font = `700 60px ${fontFamily()}`
      ctx.fillText(name.trim() || 'Оқушының аты-жөні', W / 2, 500)

      ctx.strokeStyle = 'rgba(63,169,160,0.6)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(W / 2 - 260, 528)
      ctx.lineTo(W / 2 + 260, 528)
      ctx.stroke()

      ctx.fillStyle = '#9A9B90'
      ctx.font = `400 22px ${fontFamily()}`
      ctx.fillText(`${required.length} сабақ · ${READY_MODULES.length} модуль · орташа балл ${averageScore}%`, W / 2, 578)

      const date = new Date().toLocaleDateString('kk-KZ', { year: 'numeric', month: 'long', day: 'numeric' })
      ctx.fillText(date, W / 2, 616)

      ctx.fillStyle = 'rgba(154,155,144,0.7)'
      ctx.font = `400 18px ${fontFamily()}`
      ctx.fillText('Су арықпен төмен ағады — модель де солай үйренеді', W / 2, 700)
      ctx.fillText('dala-ml.vercel.app', W / 2, 742)
    },
    [name, averageScore, required.length]
  )

  const download = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.width = W
    canvas.height = H
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    draw(ctx)
    const a = document.createElement('a')
    a.href = canvas.toDataURL('image/png')
    a.download = 'dala-ml-sertifikat.png'
    a.click()
  }

  return (
    <div className="min-h-dvh pb-12">
      <header className="sticky top-0 z-40 border-b border-dala-gold/15 bg-dala-bg/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center gap-2 px-4 py-2.5">
          <Link
            href="/kurs"
            className="-ml-2 flex h-11 w-11 items-center justify-center rounded-lg text-dala-muted transition-colors hover:text-dala-text"
            aria-label="Курс картасына оралу"
          >
            <IconArrowLeft size={20} />
          </Link>
          <span className="font-medium text-dala-text">Сертификат</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-6">
        <IconAward size={30} className="text-dala-gold" />
        <h1 className="mt-2 text-2xl font-bold text-dala-gold">Курс сертификаты</h1>
        <p className="mt-2 text-dala-muted">
          Дайын модульдердің барлық сабағын аяқтасаң, сертификат осы телефонда жасалады және
          суретке сақталады. Сервер де, тіркелу де қажет емес.
        </p>

        <div className="mt-5 rounded-xl border border-dala-gold/20 bg-dala-surface p-4">
          <div className="flex items-baseline justify-between gap-3">
            <span className="font-medium text-dala-text">Аяқталған сабақ</span>
            <span className="font-mono tabular-nums text-dala-gold">
              {doneCount} / {required.length}
            </span>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-dala-bg">
            <div
              className="h-full rounded-full bg-dala-water transition-[width] duration-500"
              style={{ width: `${required.length ? (doneCount / required.length) * 100 : 0}%` }}
            />
          </div>

          {earned ? (
            <p className="mt-3 flex items-center gap-1.5 text-sm text-dala-water">
              <IconCheck size={16} />
              Бәрі дайын. Атыңды жазып, сертификатты жүктеп ал.
            </p>
          ) : (
            <p className="mt-3 text-sm text-dala-muted">
              Тағы {required.length - doneCount} сабақ қалды.
            </p>
          )}
        </div>

        {earned ? (
          <section className="mt-5">
            <label htmlFor="cert-name" className="text-sm font-medium text-dala-text">
              Аты-жөнің
            </label>
            <input
              id="cert-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 40))}
              placeholder="Мысалы: Айгерім Сағынова"
              className="mt-1.5 min-h-[44px] w-full rounded-lg border border-dala-gold/20 bg-dala-surface px-4 text-dala-text placeholder:text-dala-muted focus:border-dala-water focus:outline-none"
            />
            <p className="mt-1.5 text-xs text-dala-muted">
              Аты-жөнің ешқайда жіберілмейді: сертификат телефонның өзінде салынады.
            </p>

            <button
              type="button"
              onClick={download}
              className="mt-4 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-dala-gold font-semibold text-dala-bg transition-all hover:brightness-110 active:scale-[0.98]"
            >
              <IconDownload size={18} />
              Сертификатты жүктеу (PNG)
            </button>
            <canvas ref={canvasRef} className="hidden" aria-hidden />
          </section>
        ) : (
          next && (
            <Link
              href={lessonHref(next)}
              className="mt-5 flex items-center gap-3 rounded-xl border border-dala-water/35 bg-dala-water/10 p-4 transition-colors hover:border-dala-water"
            >
              <div className="min-w-0 flex-1">
                <span className="text-xs font-medium text-dala-water">Келесі сабақ</span>
                <p className="truncate font-semibold text-dala-text">{next.title}</p>
              </div>
              <IconArrowRight size={22} className="shrink-0 text-dala-water" />
            </Link>
          )
        )}
      </main>
    </div>
  )
}
