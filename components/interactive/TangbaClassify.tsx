'use client'

import { useCallback, useMemo, useState } from 'react'
import { Canvas } from './_shared/Canvas'
import { Segmented, Slider } from './_shared/Slider'
import { WidgetFrame } from './_shared/WidgetFrame'
import { P, alpha } from './_shared/palette'
import { axisLabel, clamp, dot, makePlot, steppe } from './_shared/draw'
import { TANGBA_START, type Brand, tangbaFit, tangbaScore } from '@/lib/sim/lessons'

// Панели перерисовываются только при изменении, поэтому можно взять сетку помельче.
const GRID = 44

export function TangbaClassify() {
  const [brands, setBrands] = useState<Brand[]>(TANGBA_START)
  const [lambda, setLambda] = useState(0.05)
  const [pen, setPen] = useState<0 | 1>(0)

  const fit = useMemo(() => tangbaFit(brands, lambda), [brands, lambda])

  const addBrand = useCallback(
    (px: number, py: number, w: number, h: number, phase: 'down' | 'move' | 'up') => {
      if (phase !== 'down') return
      const x = clamp((px / w) * 2 - 1, -1, 1)
      const y = clamp(1 - (py / h) * 2, -1, 1)
      setBrands((prev) => [...prev.slice(-59), { x, y, cls: pen }])
    },
    [pen]
  )

  const drawField = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      steppe(ctx, w, h, 0.0)
      const toX = (x: number) => ((x + 1) / 2) * w
      const toY = (y: number) => ((1 - y) / 2) * h

      // Мягкая заливка предсказанных зон — «чьё это пастбище».
      if (fit.accuracy > 0) {
        const cw = w / GRID
        const ch = h / GRID
        for (let i = 0; i < GRID; i++) {
          for (let j = 0; j < GRID; j++) {
            const x = ((i + 0.5) / GRID) * 2 - 1
            const y = 1 - ((j + 0.5) / GRID) * 2
            const z = tangbaScore(fit.w, x, y)
            ctx.fillStyle = z > 0 ? alpha.alert(0.16) : alpha.water(0.16)
            ctx.fillRect(i * cw, j * ch, cw + 1, ch + 1)
          }
        }
      }

      for (const b of brands) {
        const x = toX(b.x)
        const y = toY(b.y)
        // Тавро: круг у одного класса, ромб у другого — не только цветом.
        ctx.save()
        ctx.fillStyle = b.cls === 0 ? P.water : P.alert
        ctx.strokeStyle = alpha.text(0.75)
        ctx.lineWidth = 1.5
        ctx.beginPath()
        if (b.cls === 0) {
          ctx.arc(x, y, 6, 0, Math.PI * 2)
        } else {
          ctx.moveTo(x, y - 7)
          ctx.lineTo(x + 7, y)
          ctx.lineTo(x, y + 7)
          ctx.lineTo(x - 7, y)
          ctx.closePath()
        }
        ctx.fill()
        ctx.stroke()
        ctx.restore()
      }

      axisLabel(ctx, 'таңба қою үшін бас', w / 2, h - 10)
    },
    [brands, fit]
  )

  const drawBoundary = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      const plot = makePlot(ctx, w, h, {
        xRange: [-1, 1],
        yRange: [-1, 1],
        xLabel: 'белгі 1',
        yLabel: 'белгі 2',
        padL: 30,
        padT: 10,
        showGrid: false,
      })

      if (fit.accuracy === 0) {
        axisLabel(ctx, 'екі түрлі таңба қажет', plot.left + plot.w / 2, plot.top + plot.h / 2)
        return
      }

      // Карта уверенности: насколько модель уверена в своём ответе.
      // Границы округляем, иначе перекрытие полупрозрачных ячеек рисует сетку.
      const ch = plot.h / GRID
      const edgeX = (i: number) => Math.round(plot.left + (i / GRID) * plot.w)
      const edgeY = (j: number) => Math.round(plot.top + (j / GRID) * plot.h)
      for (let i = 0; i < GRID; i++) {
        for (let j = 0; j < GRID; j++) {
          const x = ((i + 0.5) / GRID) * 2 - 1
          const y = 1 - ((j + 0.5) / GRID) * 2
          const z = tangbaScore(fit.w, x, y)
          const p = 1 / (1 + Math.exp(-z))
          const conf = Math.abs(p - 0.5) * 2
          ctx.fillStyle = z > 0 ? alpha.alert(0.08 + conf * 0.42) : alpha.water(0.08 + conf * 0.42)
          ctx.fillRect(edgeX(i), edgeY(j), edgeX(i + 1) - edgeX(i), edgeY(j + 1) - edgeY(j))
        }
      }

      // Сама граница — линия нулевого уровня, найденная по строкам сетки.
      ctx.save()
      ctx.strokeStyle = P.gold
      ctx.lineWidth = 2
      for (let j = 0; j < GRID; j++) {
        const y = 1 - ((j + 0.5) / GRID) * 2
        let prevZ = tangbaScore(fit.w, -1, y)
        for (let i = 1; i <= 120; i++) {
          const x = -1 + (2 * i) / 120
          const z = tangbaScore(fit.w, x, y)
          if (prevZ * z < 0) {
            const px = plot.left + ((x + 1) / 2) * plot.w
            const py = plot.top + ((1 - y) / 2) * plot.h
            ctx.beginPath()
            ctx.moveTo(px, py - ch / 2)
            ctx.lineTo(px, py + ch / 2)
            ctx.stroke()
          }
          prevZ = z
        }
      }
      ctx.restore()

      for (const b of brands) {
        dot(
          ctx,
          plot.left + ((b.x + 1) / 2) * plot.w,
          plot.top + ((1 - b.y) / 2) * plot.h,
          3,
          b.cls === 0 ? P.water : P.alert,
          alpha.text(0.6)
        )
      }
    },
    [brands, fit]
  )

  const status =
    fit.accuracy === 0
      ? {
          tone: 'warn' as const,
          title: 'Екі түрлі таңба керек',
          text: 'Модельге салыстыратын нәрсе жоқ: кемінде бір «А» және бір «Б» таңбасын қой.',
        }
      : lambda > 1.2
        ? {
            tone: 'warn' as const,
            title: 'Шекара тым қатты тартылған',
            text: 'Күшті регуляризация шекараны түзу сызыққа айналдырды — иілуге еркі жоқ.',
          }
        : fit.accuracy > 0.95 && fit.curviness > 9
          ? {
              tone: 'bad' as const,
              title: 'Шекара тым иілген',
              text: 'Модель әр таңбаны жеке орап алды. Қаттылықты арттыр — шекара жайлырақ болады.',
            }
          : {
              tone: 'ok' as const,
              title: 'Шекара орнында',
              text: 'Екі класс бөлінді, шекара шамадан тыс иілмеген.',
            }

  return (
    <WidgetFrame
      title="Таңба: жіктеу"
      hint="Далаға бас — таңба қой; қаттылықты өзгерт — шекара иіледі"
      onReset={() => {
        setBrands(TANGBA_START)
        setLambda(0.05)
        setPen(0)
      }}
      metaphor={
        <Canvas
          draw={drawField}
          animate={false}
          onPointer={addBrand}
          ratio={0.72}
          minHeight={140}
          maxHeight={210}
          label="Дала: екі түрлі таңба қойылған мал және болжанған аймақтар"
        />
      }
      science={
        <Canvas
          draw={drawBoundary}
          animate={false}
          ratio={0.72}
          minHeight={140}
          maxHeight={210}
          label="Шешім шекарасы және модельдің сенімділік картасы"
        />
      }
      readouts={[
        { label: 'Таңба саны', value: String(brands.length) },
        { label: 'Дәлдік', value: `${Math.round(fit.accuracy * 100)}%`, tone: status.tone },
        { label: 'Иілу', value: fit.curviness.toFixed(1) },
      ]}
      controls={
        <>
          <Segmented
            label="Қай таңбаны қоямыз"
            value={pen}
            onChange={setPen}
            options={[
              { value: 0, label: 'Таңба А' },
              { value: 1, label: 'Таңба Б' },
            ]}
          />
          <Slider
            label="Қаттылық (регуляризация)"
            value={lambda}
            min={0.001}
            max={3}
            step={0.001}
            onChange={setLambda}
            format={(v) => v.toFixed(3)}
            minLabel="еркін"
            maxLabel="қатаң"
            hint="шекараның иілуін тежейді"
            tone="gold"
          />
        </>
      }
      status={status}
    />
  )
}
