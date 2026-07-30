'use client'

import { useCallback, useMemo, useState } from 'react'
import { Canvas } from './_shared/Canvas'
import { Segmented, Slider } from './_shared/Slider'
import { WidgetFrame } from './_shared/WidgetFrame'
import { P, alpha } from './_shared/palette'
import { axisLabel, clamp, dot, glowDot, labelFont, makePlot, polyline, steppe } from './_shared/draw'
import { ZHAILAU_MAX, ZHAILAU_MIN, zhailau } from '@/lib/sim/lessons'
import { polyEval } from '@/lib/sim/ml'
import { trueCurve } from '@/lib/sim/datasets'

type Season = 'zhailau' | 'qystau'

export function ZhailauQystau() {
  const [size, setSize] = useState(8)
  const [season, setSeason] = useState<Season>('zhailau')

  const r = useMemo(() => zhailau(size), [size])
  const showing = season === 'zhailau' ? r.train : r.test

  const drawPasture = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      steppe(ctx, w, h, season === 'zhailau' ? 0.3 : 0.42)
      const padX = 14
      const toX = (x: number) => padX + ((x + 1) / 2) * (w - 2 * padX)
      const toY = (y: number) => h * 0.62 - y * (h * 0.28)

      // Зимой степь бледнее — сезон читается без подписи.
      if (season === 'qystau') {
        ctx.fillStyle = 'rgba(237, 234, 226, 0.06)'
        ctx.fillRect(0, h * 0.42, w, h * 0.58)
      }

      const truth: { x: number; y: number }[] = []
      for (let i = 0; i <= 80; i++) {
        const x = -1 + (2 * i) / 80
        truth.push({ x: toX(x), y: toY(trueCurve(x)) })
      }
      polyline(ctx, truth, alpha.muted(0.5), 2, [5, 5])

      const fitted: { x: number; y: number }[] = []
      for (let i = 0; i <= 160; i++) {
        const x = -1 + (2 * i) / 160
        fitted.push({ x: toX(x), y: clamp(toY(polyEval(r.coef, x)), -60, h + 60) })
      }
      polyline(ctx, fitted, season === 'zhailau' ? P.water : P.gold, 2.5)

      const color = season === 'zhailau' ? P.water : P.gold
      for (const p of showing) {
        dot(ctx, toX(p.x), toY(p.y), season === 'zhailau' ? 4.5 : 3, color, alpha.black(0.35))
      }

      axisLabel(
        ctx,
        season === 'zhailau' ? `Жайлау: ${r.train.length} қой` : `Қыстау: ${r.test.length} қой`,
        w / 2,
        h - 10
      )
    },
    [r, season, showing]
  )

  const drawCurve = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const top = Math.max(...r.curveTest, 0.001) * 1.1
      const plot = makePlot(ctx, w, h, {
        xRange: [ZHAILAU_MIN, ZHAILAU_MAX],
        yRange: [0, top],
        xLabel: 'жайлаудағы қой саны',
        yLabel: 'қателік',
        padL: 38,
      })

      const line = (vals: number[]) =>
        vals.map((v, i) => ({ x: plot.x(ZHAILAU_MIN + i), y: clamp(plot.y(v), plot.top, plot.bottom) }))

      polyline(ctx, line(r.curveTrain), P.water, 2)
      polyline(ctx, line(r.curveTest), P.gold, 2)

      const cx = plot.x(size)
      polyline(ctx, [{ x: cx, y: plot.top }, { x: cx, y: plot.bottom }], alpha.text(0.3), 1)
      glowDot(ctx, cx, clamp(plot.y(r.trainError), plot.top, plot.bottom), 4, P.water, alpha.water(0.4))
      glowDot(ctx, cx, clamp(plot.y(r.testError), plot.top, plot.bottom), 4, P.gold, alpha.gold(0.4))

      ctx.save()
      ctx.font = labelFont(600, 12)
      ctx.textBaseline = 'middle'
      ctx.fillStyle = P.water
      ctx.fillText('— жайлау', plot.right - 66, plot.top + 8)
      ctx.fillStyle = P.gold
      ctx.fillText('— қыстау', plot.right - 66, plot.top + 21)
      ctx.restore()
    },
    [r, size]
  )

  const status =
    r.gap > 0.09
      ? {
          tone: 'bad' as const,
          title: 'Жайлауды ғана біледі',
          text: 'Қой аз — модель осы бірнеше нүктені жаттады. Қыстауда, яғни жаңа деректе, қателеседі.',
        }
      : r.gap > 0.035
        ? {
            tone: 'warn' as const,
            title: 'Айырма әлі бар',
            text: 'Жайлаудағы қате қыстаудағыдан айтарлықтай кіші. Тағы дерек қосып көр.',
          }
        : {
            tone: 'ok' as const,
            title: 'Жалпылай алды',
            text: 'Жайлау мен қыстаудағы қате жақын — модель жаттамай, заңдылықты үйренді.',
          }

  return (
    <WidgetFrame
      title="Жайлау мен қыстау"
      hint="Жайлауда үйрен, қыстауда тексер — дерек көбейген сайын айырма азаяды"
      onReset={() => {
        setSize(8)
        setSeason('zhailau')
      }}
      metaphor={
        <Canvas draw={drawPasture} animate={false} ratio={0.6} minHeight={124} maxHeight={200} label="Жайлау мен қыстаудағы отар және модель тартқан қисық" />
      }
      science={
        <Canvas draw={drawCurve} animate={false} ratio={0.6} minHeight={124} maxHeight={200} label="Оқу қисығы: қателіктің дерек көлеміне тәуелділігі" />
      }
      readouts={[
        { label: 'Жайлау қатесі', value: r.trainError.toFixed(3) },
        { label: 'Қыстау қатесі', value: r.testError.toFixed(3) },
        { label: 'Айырма', value: r.gap.toFixed(3), tone: status.tone },
      ]}
      controls={
        <>
          <Slider
            label="Жайлаудағы қой саны"
            value={size}
            min={ZHAILAU_MIN}
            max={ZHAILAU_MAX}
            step={1}
            onChange={(v) => setSize(Math.round(v))}
            format={(v) => String(v)}
            minLabel="аз дерек"
            maxLabel="көп дерек"
            hint="оқу деректерінің көлемі"
          />
          <Segmented
            label="Қай жерде тексереміз"
            value={season}
            onChange={setSeason}
            options={[
              { value: 'zhailau', label: 'Жайлау (оқу)' },
              { value: 'qystau', label: 'Қыстау (тексеру)' },
            ]}
          />
        </>
      }
      status={status}
    />
  )
}
