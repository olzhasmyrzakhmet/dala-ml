'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useInView, useLayer, useReducedMotion, useTelemetry } from './_shared/Canvas'
import { Segmented, Slider } from './_shared/Slider'
import { WidgetFrame } from './_shared/WidgetFrame'
import { P, alpha } from './_shared/palette'
import { axisLabel, dot, makePlot, steppe } from './_shared/draw'
import { netParams } from '@/lib/sim/lessons'
import { forward, makeNet, netAccuracy, trainStep, type Net } from '@/lib/sim/ml'
import { sampleRings } from '@/lib/sim/datasets'

const DATA = sampleRings(140, 0.22, 9)
const GRID = 26
const STEPS_PER_FRAME = 6

const TRAIN_STEPS = 4000

export function KiizUiLayers() {
  const [layers, setLayers] = useState(1)
  const [width, setWidth] = useState(6)
  const [run, setRun] = useState(0)
  const reduced = useReducedMotion()
  const { ref: rootRef, inView } = useInView<HTMLDivElement>()
  const yurtLayer = useLayer()
  const fieldLayer = useLayer()
  const dataLayer = useLayer()
  const chromeLayer = useLayer()

  const arch = useRef<number[]>([])
  arch.current = Array.from({ length: layers }, () => width)

  const model = useRef<{ net: Net; steps: number; loss: number; acc: number; field: Float32Array }>({
    net: makeNet([6], 3),
    steps: 0,
    loss: 1,
    acc: 0,
    field: new Float32Array(GRID * GRID),
  })

  const rebuild = useCallback(() => {
    model.current.net = makeNet(arch.current, 3)
    model.current.steps = 0
    model.current.loss = 1
    model.current.acc = 0
    setRun((n) => n + 1)
  }, [])

  const fieldVersion = useRef(0)

  const refreshField = useCallback(() => {
    const m = model.current
    fieldVersion.current += 1
    m.acc = netAccuracy(m.net, DATA.X, DATA.y)
    for (let i = 0; i < GRID; i++) {
      for (let j = 0; j < GRID; j++) {
        const x = ((i + 0.5) / GRID) * 2 - 1
        const y = 1 - ((j + 0.5) / GRID) * 2
        m.field[j * GRID + i] = forward(m.net, [x, y]).out
      }
    }
  }, [])

  // Сеть обучается прямо на устройстве: это настоящий backprop, не анимация.
  // Цикл останавливается, как только обучение сошлось — вечный RAF ради
  // неизменной картинки просто грел бы телефон.
  useEffect(() => {
    const m = model.current
    m.net = makeNet(arch.current, 3)
    m.steps = 0
    m.loss = 1
    m.acc = 0

    if (reduced) {
      for (let i = 0; i < TRAIN_STEPS; i++) m.loss = trainStep(m.net, DATA.X, DATA.y, 1.4)
      m.steps = TRAIN_STEPS
      refreshField()
      return
    }

    let raf = 0
    let frame = 0
    const tick = () => {
      if (!inView.current) {
        raf = requestAnimationFrame(tick)
        return
      }
      if (m.steps < TRAIN_STEPS) {
        for (let i = 0; i < STEPS_PER_FRAME; i++) {
          m.loss = trainStep(m.net, DATA.X, DATA.y, 1.4)
          m.steps++
        }
        // Точность и карту решения считаем вчетверо реже, чем учим.
        if (frame++ % 4 === 0) refreshField()
        raf = requestAnimationFrame(tick)
      } else {
        refreshField() // финальный кадр — и останавливаемся
      }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [layers, width, reduced, refreshField, inView, run])

  const tele = useTelemetry(
    () => ({ steps: model.current.steps, acc: model.current.acc, loss: model.current.loss }),
    { steps: 0, acc: 0, loss: 1 }
  )

  const drawYurt = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const cached = yurtLayer(`kiiz-y|${arch.current.length}|${width}`, w, h, (c) => drawYurtInto(c, w, h))
      if (cached) {
        ctx.drawImage(cached, 0, 0, w, h)
        return
      }
      drawYurtInto(ctx, w, h)
    },
    [yurtLayer, width]
  )

  const drawYurtInto = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      steppe(ctx, w, h, 0.5)
      const cx = w / 2
      const base = h * 0.84
      const n = arch.current.length

      const wallW = w * 0.64
      const wallH = h * (n === 0 ? 0.04 : 0.1 + 0.09 * n)
      const domeH = h * 0.2

      // Тень на земле
      ctx.save()
      ctx.beginPath()
      ctx.ellipse(cx, base + 3, wallW * 0.56, h * 0.035, 0, 0, Math.PI * 2)
      ctx.fillStyle = alpha.black(0.4)
      ctx.fill()
      ctx.restore()

      // Кереге: каждый слой сети — своя полоса решётки.
      const bandColors = ['#4A4433', '#6B5A34', P.gold, P.water]
      for (let i = 0; i < Math.max(1, n); i++) {
        const bh = wallH / Math.max(1, n)
        const y1 = base - i * bh
        const y0 = y1 - bh
        ctx.save()
        ctx.beginPath()
        ctx.moveTo(cx - wallW / 2, y1)
        ctx.lineTo(cx + wallW / 2, y1)
        ctx.lineTo(cx + wallW / 2, y0)
        ctx.lineTo(cx - wallW / 2, y0)
        ctx.closePath()
        ctx.fillStyle = n === 0 ? '#33301F' : bandColors[Math.min(i, bandColors.length - 1)]
        ctx.globalAlpha = 0.92
        ctx.fill()
        ctx.restore()

        if (n > 0) {
          // Решётка кереге — косая сетка.
          ctx.save()
          ctx.beginPath()
          ctx.rect(cx - wallW / 2, y0, wallW, bh)
          ctx.clip()
          ctx.strokeStyle = alpha.black(0.4)
          ctx.lineWidth = 1.4
          for (let x = cx - wallW / 2 - bh; x < cx + wallW / 2 + bh; x += 13) {
            ctx.beginPath()
            ctx.moveTo(x, y1)
            ctx.lineTo(x + bh, y0)
            ctx.moveTo(x + bh, y1)
            ctx.lineTo(x, y0)
            ctx.stroke()
          }
          ctx.restore()
        }
      }

      const wallTop = base - wallH
      const apex = wallTop - domeH

      // Уық: купол из жердей, сходящихся к шаңырақ.
      ctx.save()
      ctx.strokeStyle = n === 0 ? 'rgba(154,155,144,0.35)' : alpha.gold(0.75)
      ctx.lineWidth = 2
      for (let i = -4; i <= 4; i++) {
        const x = cx + (i / 4) * (wallW / 2)
        ctx.beginPath()
        ctx.moveTo(x, wallTop)
        ctx.quadraticCurveTo(x * 0.5 + cx * 0.5, wallTop - domeH * 0.55, cx, apex)
        ctx.stroke()
      }
      ctx.restore()

      // Шаңырақ — выход сети.
      ctx.save()
      ctx.strokeStyle = n === 0 ? P.muted : P.water
      ctx.lineWidth = 2.5
      const rx = wallW * 0.16
      const ry = rx * 0.42
      ctx.beginPath()
      ctx.ellipse(cx, apex, rx, ry, 0, 0, Math.PI * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(cx - rx, apex)
      ctx.lineTo(cx + rx, apex)
      ctx.moveTo(cx, apex - ry)
      ctx.lineTo(cx, apex + ry)
      ctx.stroke()
      ctx.restore()

      axisLabel(
        ctx,
        n === 0 ? 'қабатсыз: тек түзу шекара' : `${n} жасырын қабат × ${width} нейрон`,
        w / 2,
        h - 8
      )
    },
    [width]
  )

  const drawBoundary = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      // Рамка и подписи неподвижны: рисовать их поверх кэша каждый кадр —
      // значит заново создавать градиент фона и раскладывать шрифт.
      const chrome = chromeLayer('kiiz-chrome', w, h, (c) =>
        makePlot(c, w, h, {
          xRange: [-1, 1],
          yRange: [-1, 1],
          xLabel: 'белгі 1',
          yLabel: 'белгі 2',
          padL: 30,
          padT: 10,
          showGrid: false,
        })
      )
      if (chrome) ctx.drawImage(chrome, 0, 0, w, h)

      const padL = 30
      const padT = 10
      const plot = {
        left: padL,
        top: padT,
        w: Math.max(1, w - padL - 10),
        h: Math.max(1, h - padT - 24),
      }

      /* Карта решения перерисовывается только когда сеть реально доучилась
         до следующего состояния, а не 60 раз в секунду. */
      const field = fieldLayer(`kiiz-f|${fieldVersion.current}`, w, h, (c) => {
        const f = model.current.field
        const edgeX = (i: number) => Math.round(plot.left + (i / GRID) * plot.w)
        const edgeY = (j: number) => Math.round(plot.top + (j / GRID) * plot.h)
        for (let i = 0; i < GRID; i++) {
          for (let j = 0; j < GRID; j++) {
            const p = f[j * GRID + i]
            const conf = Math.abs(p - 0.5) * 2
            c.fillStyle = p > 0.5 ? alpha.water(0.08 + conf * 0.45) : alpha.gold(0.08 + conf * 0.35)
            c.fillRect(edgeX(i), edgeY(j), edgeX(i + 1) - edgeX(i), edgeY(j + 1) - edgeY(j))
          }
        }
      })
      if (field) ctx.drawImage(field, 0, 0, w, h)

      // Сами кольца данных неподвижны — тоже в слой.
      const dots = dataLayer('kiiz-d', w, h, (c) => {
        for (let i = 0; i < DATA.X.length; i++) {
          dot(
            c,
            plot.left + ((DATA.X[i][0] + 1) / 2) * plot.w,
            plot.top + ((1 - DATA.X[i][1]) / 2) * plot.h,
            2.8,
            DATA.y[i] === 1 ? P.water : P.gold,
            alpha.black(0.5)
          )
        }
      })
      if (dots) ctx.drawImage(dots, 0, 0, w, h)
    },
    [fieldLayer, dataLayer, chromeLayer]
  )

  const status =
    layers === 0
      ? {
          tone: 'bad' as const,
          title: 'Қабатсыз — тек түзу',
          text: 'Жасырын қабатсыз модель тек түзу шекара сала алады, ал шеңберді түзумен бөлу мүмкін емес.',
        }
      : tele.acc > 0.92
        ? {
            tone: 'ok' as const,
            title: 'Шеңберді бөліп алды',
            text: 'Әр қабат шекараны иеді: түзуден доғаға, доғадан тұйық сызыққа.',
          }
        : {
            tone: 'warn' as const,
            title: 'Үйреніп жатыр',
            text: 'Желі әлі қалыптасуда — нейрон санын арттыр немесе біраз күт.',
          }

  return (
    <WidgetFrame
      title="Киіз үй: қабаттар"
      hint="Қабат қос — шекара түзуден доғаға, доғадан шеңберге айналады"
      rootRef={rootRef}
      onReset={rebuild}
      metaphor={
        <Canvas draw={drawYurt} ratio={0.62} minHeight={124} maxHeight={200} label="Киіз үй қабат-қабат тұрғызылады: әр қабат — желінің бір қабаты" />
      }
      science={
        <Canvas draw={drawBoundary} ratio={0.72} minHeight={140} maxHeight={210} label="Нейрондық желінің шешім шекарасы екі шеңберді бөліп жатыр" />
      }
      readouts={[
        { label: 'Дәлдік', value: `${Math.round(tele.acc * 100)}%`, tone: status.tone },
        { label: 'Параметр', value: String(netParams(arch.current)) },
        { label: 'Қадам', value: String(tele.steps) },
      ]}
      controls={
        <>
          <Segmented
            label="Жасырын қабат саны"
            value={layers}
            onChange={setLayers}
            options={[
              { value: 0, label: '0' },
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
            ]}
          />
          <Slider
            label="Қабаттағы нейрон саны"
            value={width}
            min={2}
            max={10}
            step={1}
            onChange={(v) => setWidth(Math.round(v))}
            format={(v) => String(v)}
            minLabel="жіңішке"
            maxLabel="қалың"
            hint="қабаттың ені"
          />
        </>
      }
      status={status}
    />
  )
}
