'use client'

import { useCallback, useMemo, useState } from 'react'
import { Canvas } from './_shared/Canvas'
import { WidgetFrame } from './_shared/WidgetFrame'
import { P, alpha } from './_shared/palette'
import { axisLabel, clamp, labelFont, roundRect, steppe } from './_shared/draw'
import { primeta } from '@/lib/sim/lessons'
import { PRIMETA_KEYS, type PrimetaKey } from '@/lib/sim/datasets'
import { IconCheck } from '@/components/ui/icons'

const LABELS: Record<PrimetaKey, string> = {
  bult: 'Бұлт',
  zhel: 'Жел',
  mal: 'Мал мінезі',
  shop: 'Шөп ылғалы',
  qus: 'Құс ұшуы',
}

const DEFAULT: PrimetaKey[] = ['bult']

export function FeaturePrimeta() {
  const [selected, setSelected] = useState<PrimetaKey[]>(DEFAULT)
  const r = useMemo(() => primeta(selected), [selected])

  const toggle = (k: PrimetaKey) =>
    setSelected((prev) => (prev.includes(k) ? prev.filter((s) => s !== k) : [...prev, k]))

  const drawSteppe = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      steppe(ctx, w, h, 0.56)
      const on = (k: PrimetaKey) => selected.includes(k)

      if (on('bult')) {
        ctx.save()
        ctx.fillStyle = 'rgba(154, 155, 144, 0.35)'
        const cx = w * 0.28 + Math.sin(t * 0.0004) * 6
        ctx.beginPath()
        ctx.arc(cx, h * 0.2, h * 0.09, 0, Math.PI * 2)
        ctx.arc(cx + h * 0.1, h * 0.23, h * 0.11, 0, Math.PI * 2)
        ctx.arc(cx + h * 0.21, h * 0.2, h * 0.08, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      if (on('zhel')) {
        ctx.save()
        ctx.strokeStyle = alpha.water(0.4)
        ctx.lineWidth = 1.6
        ctx.lineCap = 'round'
        for (let i = 0; i < 3; i++) {
          const off = ((t * 0.05 + i * 60) % (w + 80)) - 40
          const y = h * 0.14 + i * h * 0.09
          ctx.beginPath()
          ctx.moveTo(off, y)
          ctx.quadraticCurveTo(off + 18, y - 5, off + 36, y)
          ctx.stroke()
        }
        ctx.restore()
      }

      if (on('mal')) {
        ctx.save()
        ctx.fillStyle = P.text
        for (let i = 0; i < 3; i++) {
          const x = w * (0.2 + i * 0.14)
          const y = h * (0.72 + (i % 2) * 0.08)
          ctx.beginPath()
          ctx.ellipse(x, y, 8, 5, 0, 0, Math.PI * 2)
          ctx.fill()
          ctx.beginPath()
          ctx.arc(x - 8, y - 3, 3.4, 0, Math.PI * 2)
          ctx.fill()
        }
        ctx.restore()
      }

      if (on('shop')) {
        ctx.save()
        ctx.strokeStyle = alpha.water(0.5)
        ctx.lineWidth = 1.6
        for (let x = w * 0.55; x < w - 8; x += 11) {
          ctx.beginPath()
          ctx.moveTo(x, h - 8)
          ctx.quadraticCurveTo(x + 2, h - 16, x + 6, h - 24)
          ctx.stroke()
        }
        ctx.restore()
      }

      if (on('qus')) {
        ctx.save()
        ctx.strokeStyle = alpha.muted(0.75)
        ctx.lineWidth = 1.8
        ctx.lineCap = 'round'
        const bx = w * 0.7 + Math.sin(t * 0.0008) * 14
        const by = h * 0.18
        for (let i = 0; i < 2; i++) {
          const x = bx + i * 22
          const y = by + i * 9
          ctx.beginPath()
          ctx.moveTo(x - 7, y)
          ctx.quadraticCurveTo(x, y - 5, x + 7, y)
          ctx.stroke()
        }
        ctx.restore()
      }

      axisLabel(
        ctx,
        selected.length === 0 ? 'бірде-бір белгі таңдалмаған' : `${selected.length} белгі бақыланады`,
        w / 2,
        h - 10
      )
    },
    [selected]
  )

  const drawBars = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      ctx.fillStyle = P.skyTop
      ctx.fillRect(0, 0, w, h)

      const padL = 76
      const padT = 26
      const rowH = Math.min(20, (h - padT - 22) / PRIMETA_KEYS.length)
      const barW = w - padL - 44
      const maxGain = Math.max(0.06, ...PRIMETA_KEYS.map((k) => Math.abs(r.gains[k])))

      ctx.save()
      ctx.font = labelFont(600, 12)
      ctx.fillStyle = P.muted
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText('әр белгінің пайдасы', 8, 12)
      ctx.restore()

      PRIMETA_KEYS.forEach((k, i) => {
        const y = padT + i * rowH
        const gain = r.gains[k]
        const len = clamp((Math.abs(gain) / maxGain) * barW, 2, barW)
        const active = selected.includes(k)

        ctx.save()
        ctx.font = labelFont(active ? 600 : 400, 12)
        ctx.fillStyle = active ? P.text : P.muted
        ctx.textAlign = 'right'
        ctx.textBaseline = 'middle'
        ctx.fillText(LABELS[k], padL - 8, y + rowH / 2)
        ctx.restore()

        ctx.save()
        roundRect(ctx, padL, y + rowH / 2 - 5, len, 10, 5)
        ctx.fillStyle = gain > 0.005 ? alpha.water(active ? 0.85 : 0.4) : alpha.muted(active ? 0.6 : 0.25)
        ctx.fill()
        ctx.restore()

        ctx.save()
        ctx.font = labelFont(500, 12)
        ctx.fillStyle = P.muted
        ctx.textAlign = 'left'
        ctx.textBaseline = 'middle'
        ctx.fillText(`${gain >= 0 ? '+' : ''}${Math.round(gain * 100)}%`, padL + len + 6, y + rowH / 2)
        ctx.restore()
      })

      // Общая точность выбранного набора.
      const by = h - 14
      ctx.save()
      ctx.font = labelFont(600, 12)
      ctx.fillStyle = P.muted
      ctx.textAlign = 'left'
      ctx.textBaseline = 'middle'
      ctx.fillText('дәлдік', 8, by)
      ctx.restore()

      const track = w - 116
      roundRect(ctx, 56, by - 5, track, 10, 5)
      ctx.fillStyle = alpha.muted(0.2)
      ctx.fill()
      roundRect(ctx, 56, by - 5, Math.max(4, track * r.accuracy), 10, 5)
      ctx.fillStyle = r.accuracy > 0.8 ? P.water : r.accuracy > 0.65 ? P.gold : P.alert
      ctx.fill()

      ctx.save()
      ctx.font = labelFont(600, 12)
      ctx.fillStyle = P.text
      ctx.textAlign = 'right'
      ctx.textBaseline = 'middle'
      ctx.fillText(`${Math.round(r.accuracy * 100)}%`, w - 8, by)
      ctx.restore()
    },
    [r, selected]
  )

  const uselessOn = selected.includes('qus')
  const status = uselessOn
    ? {
        tone: 'warn' as const,
        title: 'Құс ұшуы ештеңе бермейді',
        text: 'Бұл белгі жаңбырмен байланыспаған: қосқаннан дәлдік өспейді. Ырым — белгі емес.',
      }
    : r.accuracy > 0.82
      ? {
          tone: 'ok' as const,
          title: 'Белгілер жақсы таңдалған',
          text: 'Модель күрделі емес — дұрыс белгілер оны күшті етті. Белгілер модельден маңыздырақ.',
        }
      : {
          tone: 'warn' as const,
          title: 'Белгі жетіспейді',
          text: 'Пайдасы бар белгілерді қос — дәлдік өседі. Ең күштісі бұлт.',
        }

  return (
    <WidgetFrame
      title="Дала белгілері: ерекшеліктер"
      hint="Белгіні қос немесе алып таста — дәлдік бірден өзгереді"
      onReset={() => setSelected(DEFAULT)}
      metaphor={
        <Canvas draw={drawSteppe} ratio={0.6} minHeight={124} maxHeight={200} label="Дала: таңдалған белгілер көрінеді" />
      }
      science={
        <Canvas draw={drawBars} animate={false} ratio={0.6} minHeight={124} maxHeight={200} label="Әр белгінің дәлдікке қосатын үлесі" />
      }
      readouts={[
        { label: 'Дәлдік', value: `${Math.round(r.accuracy * 100)}%`, tone: status.tone },
        { label: 'Бастапқы', value: `${Math.round(r.baseline * 100)}%` },
        { label: 'Таңдалды', value: `${selected.length} / ${PRIMETA_KEYS.length}` },
      ]}
      controls={
        <fieldset>
          <legend className="mb-2 text-sm font-medium text-dala-text">Белгілерді таңда</legend>
          <div className="grid grid-cols-2 gap-2">
            {PRIMETA_KEYS.map((k) => {
              const active = selected.includes(k)
              return (
                <button
                  key={k}
                  type="button"
                  role="switch"
                  aria-checked={active}
                  onClick={() => toggle(k)}
                  className={`flex min-h-[44px] items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors duration-200 active:scale-[0.98] ${
                    active
                      ? 'border-dala-water bg-dala-water/15 text-dala-text'
                      : 'border-dala-gold/20 bg-dala-bg text-dala-muted hover:border-dala-water/50'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border ${
                      active ? 'border-dala-water bg-dala-water text-dala-bg' : 'border-dala-muted/50'
                    }`}
                  >
                    {active && <IconCheck size={13} />}
                  </span>
                  {LABELS[k]}
                </button>
              )
            })}
          </div>
        </fieldset>
      }
      status={status}
    />
  )
}
