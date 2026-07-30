'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useInView, useLayer, useReducedMotion, useTelemetry } from './_shared/Canvas'
import { Slider } from './_shared/Slider'
import { WidgetFrame } from './_shared/WidgetFrame'
import { P, alpha, toneAlpha, toneColor, type StatusTone } from './_shared/palette'
import { axisLabel, clamp, dot, fadingTrail, glowDot, makePlot, polyline, steppe } from './_shared/draw'
import { OTAR_BEST, otarInit, otarJitter, otarLoss, otarStep } from '@/lib/sim/lessons'
import { rng } from '@/lib/sim/ml'

const STEPS_PER_SEC = 30
const HERD = 64
const GRID = 22

/** Овцы на пастбище: положение фиксировано, чтобы стадо не мельтешило. */
const HERD_POS = (() => {
  const rnd = rng(19)
  return Array.from({ length: HERD }, () => ({ x: 0.06 + rnd() * 0.88, y: 0.12 + rnd() * 0.76 }))
})()

/**
 * Ландшафт потерь зависит только от статических данных отары, поэтому считается
 * один раз. Значения берём на сетке GRID×GRID, а рисуем сразу в нужном размере:
 * растягивание крошечной картинки со сглаживанием на каждый кадр стоило дороже,
 * чем сам расчёт, и вдобавок мылило картинку.
 */
let lossGrid: { vals: number[][]; lo: number; hi: number } | null = null

function getLossGrid() {
  if (lossGrid) return lossGrid
  const vals: number[][] = []
  let lo = Infinity
  let hi = -Infinity
  for (let i = 0; i < GRID; i++) {
    vals.push([])
    for (let j = 0; j < GRID; j++) {
      const w0 = -1 + ((i + 0.5) / GRID) * 2.4
      const w1 = 1.4 - ((j + 0.5) / GRID) * 2.4
      const v = Math.sqrt(otarLoss(w0, w1))
      vals[i].push(v)
      lo = Math.min(lo, v)
      hi = Math.max(hi, v)
    }
  }
  lossGrid = { vals, lo, hi }
  return lossGrid
}

export function OtarBatch() {
  const [batch, setBatch] = useState(8)
  const [rate, setRate] = useState(0.06)
  const [run, setRun] = useState(0)
  const reduced = useReducedMotion()
  const { ref: rootRef, inView } = useInView<HTMLDivElement>()
  const herdLayer = useLayer()
  const plotLayer = useLayer()

  const params = useRef({ batch, rate })
  params.current = { batch, rate }

  const sim = useRef({ s: otarInit(), rnd: rng(101), acc: 0, picked: [] as number[] })

  const reset = useCallback(() => {
    sim.current = { s: otarInit(), rnd: rng(101), acc: 0, picked: [] }
    setRun((n) => n + 1)
  }, [])

  const step = useCallback(() => {
    const c = sim.current
    const b = Math.max(1, Math.min(HERD, Math.round(params.current.batch)))
    c.picked = Array.from({ length: b }, () => Math.floor(c.rnd() * HERD) % HERD)
    otarStep(c.s, b, params.current.rate, c.rnd)
  }, [])

  useEffect(() => {
    // prefers-reduced-motion: прогоняем обучение разом и останавливаемся.
    if (reduced) {
      for (let i = 0; i < 400; i++) step()
      return
    }

    let raf = 0
    let last = performance.now()
    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 1 / 20)
      last = t
      if (!inView.current) {
        raf = requestAnimationFrame(tick)
        return
      }
      const c = sim.current
      c.acc += dt
      const stepTime = 1 / STEPS_PER_SEC
      let guard = 0
      while (c.acc >= stepTime && guard++ < 4) {
        c.acc -= stepTime
        step()
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reduced, step, inView, run])

  const tele = useTelemetry(
    () => {
      const s = sim.current.s
      return { steps: s.steps, loss: s.loss, jitter: otarJitter(s), w0: s.w0, w1: s.w1 }
    },
    { steps: 0, loss: otarLoss(-0.8, -0.75), jitter: 0, w0: -0.8, w1: -0.75 }
  )

  const drawHerd = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      /* Пастбище и вся отара неподвижны — они уходят в слой.
         Каждый кадр рисуются только те овцы, которых сейчас спросили:
         радиальный градиент и 64 эллипса на кадр съедали бюджет целиком. */
      const layer = herdLayer('otar-herd', w, h, (c) => {
        steppe(c, w, h, 0.22)
        const bx = w * 0.5
        const by = h * 0.55
        const g = c.createRadialGradient(bx, by, 0, bx, by, Math.min(w, h) * 0.42)
        g.addColorStop(0, alpha.water(0.22))
        g.addColorStop(1, 'rgba(0,0,0,0)')
        c.fillStyle = g
        c.beginPath()
        c.arc(bx, by, Math.min(w, h) * 0.42, 0, Math.PI * 2)
        c.fill()

        c.globalAlpha = 0.3
        c.fillStyle = P.muted
        for (const p of HERD_POS) {
          c.beginPath()
          c.ellipse(8 + p.x * (w - 16), h * 0.22 + p.y * (h * 0.7), 4, 3, 0, 0, Math.PI * 2)
          c.fill()
        }
        c.globalAlpha = 1
      })
      if (layer) ctx.drawImage(layer, 0, 0, w, h)

      const picked = sim.current.picked
      ctx.save()
      ctx.fillStyle = P.text
      ctx.strokeStyle = alpha.water(0.85)
      ctx.lineWidth = 1.5
      for (const i of picked) {
        const p = HERD_POS[i]
        if (!p) continue
        ctx.beginPath()
        ctx.ellipse(8 + p.x * (w - 16), h * 0.22 + p.y * (h * 0.7), 5.5, 4, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.stroke()
      }
      ctx.restore()

      axisLabel(ctx, `бір қадамда ${picked.length} қой сұралды`, w / 2, h - 10)
    },
    [herdLayer]
  )

  const drawLandscape = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // Рамка, оси, ландшафт и отметка оптимума неподвижны — рисуем их один раз.
      const layer = plotLayer('otar-plot', w, h, (c) => {
        const p = makePlot(c, w, h, {
          xRange: [-1, 1.4],
          yRange: [-1, 1.4],
          xLabel: 'ығысу w₀',
          yLabel: 'салмақ w₁',
          padL: 32,
          padT: 10,
          showGrid: false,
        })

        /* Заливка непрозрачная: полупрозрачные ячейки на стыках давали
           фальшивую сетку. Чем ближе к цели, тем светлее — «хорошая трава»
           видна сразу, а не выводится из легенды. */
        const { vals, lo, hi } = getLossGrid()
        const edgeX = (i: number) => Math.round(p.left + (i / GRID) * p.w)
        const edgeY = (j: number) => Math.round(p.top + (j / GRID) * p.h)
        for (let i = 0; i < GRID; i++) {
          for (let j = 0; j < GRID; j++) {
            const n = (vals[i][j] - lo) / (hi - lo || 1)
            const near = Math.pow(1 - n, 1.8) // резче подсвечиваем дно чаши
            const r = Math.round(24 + near * 175)
            const g = Math.round(27 + near * 137)
            const b = Math.round(20 + near * 45)
            c.fillStyle = `rgb(${r}, ${g}, ${b})`
            c.fillRect(edgeX(i), edgeY(j), edgeX(i + 1) - edgeX(i) + 1, edgeY(j + 1) - edgeY(j) + 1)
          }
        }

        // Оптимум по всем данным — перекрестие, его должно быть видно сразу.
        const ox = p.x(OTAR_BEST.intercept)
        const oy = p.y(OTAR_BEST.slope)
        c.strokeStyle = alpha.water(0.9)
        c.lineWidth = 1.5
        c.beginPath()
        c.arc(ox, oy, 9, 0, Math.PI * 2)
        c.moveTo(ox - 13, oy)
        c.lineTo(ox + 13, oy)
        c.moveTo(ox, oy - 13)
        c.lineTo(ox, oy + 13)
        c.stroke()

        // Легенда внутри рамки, чтобы не залезала на границу панели.
        const ly = p.bottom - 10
        polyline(c, [{ x: p.left + 8, y: ly }, { x: p.left + 20, y: ly }], alpha.water(0.9), 2)
        axisLabel(c, 'мақсат', p.left + 24, ly, 'left')
      })
      if (layer) ctx.drawImage(layer, 0, 0, w, h)

      // Геометрия панели нужна и для подвижной части — считаем её без отрисовки.
      const padL = 32
      const padT = 10
      const iw = Math.max(1, w - padL - 10)
      const ih = Math.max(1, h - padT - 24)
      const plot = {
        x: (v: number) => padL + ((v + 1) / 2.4) * iw,
        y: (v: number) => padT + ih - ((v + 1) / 2.4) * ih,
        left: padL,
        top: padT,
        right: padL + iw,
        bottom: padT + ih,
      }

    const s = sim.current.s
    fadingTrail(
      ctx,
      s.path.map((pt) => ({
        x: clamp(plot.x(pt.w0), plot.left, plot.right),
        y: clamp(plot.y(pt.w1), plot.top, plot.bottom),
      })),
      alpha.water,
      0.55
    )

    const jitter = otarJitter(s)
    const tone: StatusTone = jitter > 0.035 ? 'bad' : jitter > 0.012 ? 'warn' : 'ok'
    glowDot(
      ctx,
      clamp(plot.x(s.w0), plot.left, plot.right),
      clamp(plot.y(s.w1), plot.top, plot.bottom),
      5,
      toneColor[tone],
      toneAlpha[tone](0.4)
    )

    },
    [plotLayer]
  )

  const tone: StatusTone = tele.jitter > 0.035 ? 'bad' : tele.jitter > 0.012 ? 'warn' : 'ok'
  const status =
    tone === 'bad'
      ? {
          tone,
          title: 'Кіші отар — дірілдеген жол',
          text: 'Бірнеше қой бүкіл отарды дәл көрсете алмайды: қадам шулы, жол қисық. Есесіне бір қадам арзан.',
        }
      : tone === 'warn'
        ? {
            tone,
            title: 'Орташа отар',
            text: 'Жылдамдық пен тұрақтылық арасындағы теңгерім — тәжірибеде ең жиі таңдау.',
          }
        : {
            tone,
            title: 'Үлкен отар — тегіс жол',
            text: 'Бүкіл отарды сұрағанда қадам дәл, бірақ әр қадам қымбат: бәрін санау керек.',
          }

  return (
    <WidgetFrame
      title="Отар: батч өлшемі"
      hint="Отарды кішірейт — жол дірілдейді; үлкейт — тегістеледі"
      rootRef={rootRef}
      onReset={reset}
      metaphor={
        <Canvas draw={drawHerd} ratio={0.62} minHeight={124} maxHeight={200} label="Отар: бір қадамда сұралатын қойлар белгіленген" />
      }
      science={
        <Canvas draw={drawLandscape} ratio={0.62} minHeight={124} maxHeight={200} label="Салмақтар кеңістігіндегі оқу траекториясы" />
      }
      readouts={[
        { label: 'Қадам', value: String(tele.steps) },
        { label: 'Қателік', value: tele.loss.toFixed(4) },
        { label: 'Дірілдеу', value: tele.jitter.toFixed(3), tone },
      ]}
      controls={
        <>
          <Slider
            label="Отар өлшемі (batch)"
            value={batch}
            min={1}
            max={HERD}
            step={1}
            onChange={(v) => setBatch(Math.round(v))}
            format={(v) => String(v)}
            minLabel="1 қой"
            maxLabel="бүкіл отар"
            hint="бір қадамға қанша дерек"
          />
          <Slider
            label="Оқу жылдамдығы"
            value={rate}
            min={0.01}
            max={0.2}
            step={0.005}
            onChange={setRate}
            format={(v) => v.toFixed(3)}
            minLabel="ұсақ"
            maxLabel="ірі"
            hint="қадам ұзындығы"
            tone="gold"
          />
        </>
      }
      status={status}
    />
  )
}
