'use client'

import { useCallback, useMemo, useState } from 'react'
import { Canvas } from './_shared/Canvas'
import { Slider } from './_shared/Slider'
import { WidgetFrame } from './_shared/WidgetFrame'
import { P, alpha } from './_shared/palette'
import { axisLabel, clamp, dot, glowDot, labelFont, makePlot, polyline, steppe } from './_shared/draw'
import { MAX_DEGREE, overfit } from '@/lib/sim/lessons'
import { polyEval } from '@/lib/sim/ml'
import { trueCurve } from '@/lib/sim/datasets'

export function OverfitField() {
  const [degree, setDegree] = useState(4)
  const [noise, setNoise] = useState(0.22)

  const r = useMemo(() => overfit(degree, noise), [degree, noise])

  const drawField = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      steppe(ctx, w, h, 0.18)
      const padX = 14
      const toX = (x: number) => padX + ((x + 1) / 2) * (w - 2 * padX)
      const toY = (y: number) => h * 0.55 - y * (h * 0.3)

      // Истинная закономерность — то, что на самом деле есть в степи.
      const truth: { x: number; y: number }[] = []
      for (let i = 0; i <= 80; i++) {
        const x = -1 + (2 * i) / 80
        truth.push({ x: toX(x), y: toY(trueCurve(x)) })
      }
      polyline(ctx, truth, alpha.muted(0.55), 2, [5, 5])

      // Что построила модель.
      const fitted: { x: number; y: number }[] = []
      for (let i = 0; i <= 160; i++) {
        const x = -1 + (2 * i) / 160
        fitted.push({ x: toX(x), y: clamp(toY(polyEval(r.coef, x)), -60, h + 60) })
      }
      const over = degree > r.bestDegree + 1
      polyline(ctx, fitted, over ? P.alert : P.water, 2.5)

      // Наблюдения — снопы на поле.
      for (const p of r.train) {
        const x = toX(p.x)
        const y = toY(p.y)
        ctx.save()
        ctx.strokeStyle = alpha.gold(0.5)
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(x, y)
        ctx.lineTo(x, toY(polyEval(r.coef, p.x)))
        ctx.stroke()
        ctx.restore()
        dot(ctx, x, y, 4, P.gold, alpha.black(0.4))
      }

      axisLabel(ctx, over ? 'модель шуды жаттап алды' : 'модель заңдылықты ұстады', w / 2, h - 10)
    },
    [r, degree]
  )

  const drawCurves = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const top = Math.max(...r.curveTest.slice(0, MAX_DEGREE), 0.001) * 1.1
      const plot = makePlot(ctx, w, h, {
        xRange: [1, MAX_DEGREE],
        yRange: [0, top],
        xLabel: 'күрделілік',
        yLabel: 'қателік',
        padL: 38,
      })

      const line = (vals: number[]) =>
        vals.map((v, i) => ({ x: plot.x(i + 1), y: clamp(plot.y(v), plot.top, plot.bottom) }))

      polyline(ctx, line(r.curveTrain), P.water, 2)
      polyline(ctx, line(r.curveTest), P.alert, 2)

      // Точка перелома — где тест начинает портиться.
      const bx = plot.x(r.bestDegree)
      polyline(ctx, [{ x: bx, y: plot.top }, { x: bx, y: plot.bottom }], alpha.gold(0.45), 1, [3, 4])
      axisLabel(ctx, 'ең жақсы', bx, plot.top + 8)

      // Текущая сложность.
      const cx = plot.x(degree)
      polyline(ctx, [{ x: cx, y: plot.top }, { x: cx, y: plot.bottom }], alpha.text(0.3), 1)
      glowDot(ctx, cx, clamp(plot.y(r.trainError), plot.top, plot.bottom), 4, P.water, alpha.water(0.4))
      glowDot(ctx, cx, clamp(plot.y(r.testError), plot.top, plot.bottom), 4, P.alert, alpha.alert(0.4))

      // Легенда
      ctx.save()
      ctx.font = labelFont(600, 12)
      ctx.textBaseline = 'middle'
      ctx.fillStyle = P.water
      ctx.fillText('— жайлау', plot.right - 66, plot.top + 8)
      ctx.fillStyle = P.alert
      ctx.fillText('— қыстау', plot.right - 66, plot.top + 21)
      ctx.restore()
    },
    [r, degree]
  )

  const status =
    degree > r.bestDegree + 1
      ? {
          tone: 'bad' as const,
          title: 'Артық үйрену (overfitting)',
          text: 'Модель әр нүктені жаттап алды, бірақ жалпы заңдылықты жоғалтты — жаңа деректе қателеседі.',
        }
      : degree < r.bestDegree - 1
        ? {
            tone: 'warn' as const,
            title: 'Жеткіліксіз үйрену (underfitting)',
            text: 'Модель тым қарапайым: заңдылықты толық қайталай алмай тұр.',
          }
        : {
            tone: 'ok' as const,
            title: 'Тепе-теңдік табылды',
            text: 'Күрделілік дәл қажетінше: модель заңдылықты ұстады, шуды жаттамады.',
          }

  return (
    <WidgetFrame
      title="Өріс: артық үйрену"
      hint="Күрделілікті арттыр — қателік алдымен азаяды, сосын өседі"
      onReset={() => {
        setDegree(4)
        setNoise(0.22)
      }}
      metaphor={
        <Canvas draw={drawField} animate={false} ratio={0.6} minHeight={124} maxHeight={200} label="Өрістегі бақылаулар және модель тартқан қисық" />
      }
      science={
        <Canvas draw={drawCurves} animate={false} ratio={0.6} minHeight={124} maxHeight={200} label="Оқу және тексеру қателіктерінің күрделілікке тәуелділігі" />
      }
      readouts={[
        { label: 'Жайлау қатесі', value: r.trainError.toFixed(3) },
        { label: 'Қыстау қатесі', value: r.testError.toFixed(3), tone: status.tone },
        { label: 'Ең жақсы дәреже', value: String(r.bestDegree) },
      ]}
      controls={
        <>
          <Slider
            label="Модель күрделілігі"
            value={degree}
            min={1}
            max={MAX_DEGREE}
            step={1}
            onChange={(v) => setDegree(Math.round(v))}
            format={(v) => String(v)}
            minLabel="қарапайым"
            maxLabel="күрделі"
            hint="полином дәрежесі"
          />
          <Slider
            label="Шу"
            value={noise}
            min={0}
            max={0.5}
            step={0.02}
            onChange={setNoise}
            format={(v) => v.toFixed(2)}
            minLabel="таза"
            maxLabel="шулы"
            hint="өлшеу қателігі"
            tone="gold"
          />
        </>
      }
      status={status}
    />
  )
}
