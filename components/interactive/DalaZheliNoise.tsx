'use client'

import { useCallback, useMemo, useRef, useState } from 'react'
import { Canvas, useReducedMotion } from './_shared/Canvas'
import { Slider } from './_shared/Slider'
import { WidgetFrame } from './_shared/WidgetFrame'
import { P, alpha } from './_shared/palette'
import { axisLabel, clamp, dot, labelFont, makePlot, polyline, steppe } from './_shared/draw'
import { TRUE_INTERCEPT, TRUE_SLOPE, zheli } from '@/lib/sim/lessons'

export function DalaZheliNoise() {
  const [wind, setWind] = useState(0.25)
  const [count, setCount] = useState(24)
  const reduced = useReducedMotion()

  const r = useMemo(() => zheli(wind, count), [wind, count])
  const state = useRef({ wind, reduced })
  state.current = { wind, reduced }

  const drawSteppe = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
      steppe(ctx, w, h, 0.34)
      const padX = 14
      const toX = (x: number) => padX + ((x + 1) / 2) * (w - 2 * padX)
      const toY = (y: number) => h * 0.6 - y * (h * 0.3)
      const { wind: v, reduced: still } = state.current
      const phase = still ? 0 : t * 0.0022

      // Ветровые струи: чем сильнее ветер, тем их больше и быстрее.
      ctx.save()
      ctx.lineCap = 'round'
      const streaks = Math.round(3 + v * 12)
      for (let i = 0; i < streaks; i++) {
        const y = (h * 0.08) + ((i * 37) % Math.max(1, h * 0.5))
        const off = ((phase * (60 + i * 9)) % (w + 90)) - 45
        ctx.strokeStyle = alpha.gold(0.06 + v * 0.16)
        ctx.lineWidth = 1 + (i % 2)
        ctx.beginPath()
        ctx.moveTo(off, y)
        ctx.quadraticCurveTo(off + 22, y - 4, off + 44, y)
        ctx.stroke()
      }
      ctx.restore()

      // Истинная закономерность — то, что есть в природе.
      polyline(
        ctx,
        [
          { x: toX(-1), y: toY(TRUE_INTERCEPT - TRUE_SLOPE) },
          { x: toX(1), y: toY(TRUE_INTERCEPT + TRUE_SLOPE) },
        ],
        alpha.muted(0.55),
        2,
        [5, 5]
      )

      // Трава, треплемая ветром — то же значение шума, что и в данных.
      ctx.save()
      ctx.strokeStyle = alpha.water(0.25)
      ctx.lineWidth = 1
      for (let x = 8; x < w - 6; x += 13) {
        const sway = still ? 0 : Math.sin(phase * 3 + x * 0.15) * v * 7
        ctx.beginPath()
        ctx.moveTo(x, h - 4)
        ctx.quadraticCurveTo(x + sway * 0.5, h - 12, x + sway, h - 20)
        ctx.stroke()
      }
      ctx.restore()

      for (const p of r.points) dot(ctx, toX(p.x), clamp(toY(p.y), 4, h - 4), 4, P.gold, alpha.black(0.4))

      axisLabel(ctx, v > 0.45 ? 'жел деректі шайқап тұр' : 'дала тыныш', w / 2, h - 10)
    },
    [r]
  )

  const drawFit = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const span = Math.max(1.2, ...r.points.map((p) => Math.abs(p.y) + 0.15))
      const plot = makePlot(ctx, w, h, {
        xRange: [-1, 1],
        yRange: [-span, span],
        xLabel: 'белгі',
        yLabel: 'жауап',
        padL: 34,
      })

      polyline(
        ctx,
        [
          { x: plot.x(-1), y: plot.y(TRUE_INTERCEPT - TRUE_SLOPE) },
          { x: plot.x(1), y: plot.y(TRUE_INTERCEPT + TRUE_SLOPE) },
        ],
        alpha.muted(0.6),
        2,
        [5, 5]
      )

      // Остатки: вертикальные отрезки от точки до подогнанной прямой.
      ctx.save()
      ctx.strokeStyle = alpha.alert(0.35)
      ctx.lineWidth = 1
      for (const p of r.points) {
        ctx.beginPath()
        ctx.moveTo(plot.x(p.x), clamp(plot.y(p.y), plot.top, plot.bottom))
        ctx.lineTo(plot.x(p.x), clamp(plot.y(r.intercept + r.slope * p.x), plot.top, plot.bottom))
        ctx.stroke()
      }
      ctx.restore()

      for (const p of r.points) {
        dot(ctx, plot.x(p.x), clamp(plot.y(p.y), plot.top, plot.bottom), 3, P.gold)
      }

      polyline(
        ctx,
        [
          { x: plot.x(-1), y: clamp(plot.y(r.intercept - r.slope), plot.top, plot.bottom) },
          { x: plot.x(1), y: clamp(plot.y(r.intercept + r.slope), plot.top, plot.bottom) },
        ],
        P.water,
        2.5
      )

      ctx.save()
      ctx.font = labelFont(600, 12)
      ctx.textBaseline = 'middle'
      ctx.fillStyle = P.muted
      ctx.fillText('- - шын заңдылық', plot.left + 6, plot.top + 8)
      ctx.fillStyle = P.water
      ctx.fillText('— модель тапқаны', plot.left + 6, plot.top + 21)
      ctx.restore()
    },
    [r]
  )

  const status =
    r.slopeError > 0.18
      ? {
          tone: 'bad' as const,
          title: 'Жел жеңді',
          text: 'Шу тым күшті: модель шын еңісті таба алмай тұр. Дерек санын арттыр — қате орташаланады.',
        }
      : r.slopeError > 0.07
        ? {
            tone: 'warn' as const,
            title: 'Жел кедергі жасайды',
            text: 'Модель бағытты дұрыс тапты, бірақ дәлдігі жетпейді.',
          }
        : {
            tone: 'ok' as const,
            title: 'Заңдылық көрініп тұр',
            text: 'Шу аз немесе дерек жеткілікті — модель шын еңісті дәл тапты.',
          }

  return (
    <WidgetFrame
      title="Дала желі: шу"
      hint="Желді күшейт — модель адасады; дерек қос — қайта табады"
      onReset={() => {
        setWind(0.25)
        setCount(24)
      }}
      metaphor={
        <Canvas draw={drawSteppe} ratio={0.6} minHeight={124} maxHeight={200} label="Дала желі деректерді шайқап тұр" />
      }
      science={
        <Canvas draw={drawFit} animate={false} ratio={0.6} minHeight={124} maxHeight={200} label="Шулы деректер бойынша сызықтық регрессия" />
      }
      readouts={[
        { label: 'Шын еңіс', value: TRUE_SLOPE.toFixed(2) },
        { label: 'Табылған', value: r.slope.toFixed(2), tone: status.tone },
        { label: 'R²', value: r.r2.toFixed(2) },
      ]}
      controls={
        <>
          <Slider
            label="Жел күші"
            value={wind}
            min={0}
            max={0.8}
            step={0.02}
            onChange={setWind}
            format={(v) => `${Math.round(v * 100)}%`}
            minLabel="тыныш"
            maxLabel="дауыл"
            hint="деректегі шу"
            tone="gold"
          />
          <Slider
            label="Дерек саны"
            value={count}
            min={6}
            max={80}
            step={1}
            onChange={(v) => setCount(Math.round(v))}
            format={(v) => `${v}`}
            minLabel="аз"
            maxLabel="көп"
            hint="бақылау саны"
          />
        </>
      }
      status={status}
    />
  )
}
