'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Canvas, useInView, useLayer, useReducedMotion, useTelemetry } from './_shared/Canvas'
import { Slider } from './_shared/Slider'
import { WidgetFrame } from './_shared/WidgetFrame'
import { P, alpha, toneAlpha, toneColor, type StatusTone } from './_shared/palette'
import { areaUnder, axisLabel, clamp, glowDot, grid, panelBackground, polyline } from './_shared/draw'
import {
  BARRIER_X,
  GLOBAL_X,
  START_X,
  X_MAX,
  X_MIN,
  advance,
  initialDescent,
  shape,
  type Phase,
} from '@/lib/sim/aryq'

const STEPS_PER_SEC = 22
const HISTORY = 32

const STATUS: Record<Phase, { tone: StatusTone; title: string; text: string }> = {
  run: {
    tone: 'ok',
    title: 'Су ағып барады',
    text: 'Әр қадамда су еңіс бойымен төмен түседі — модель параметрін түзетіп жатыр.',
  },
  converged: {
    tone: 'ok',
    title: 'Жинақталды',
    text: 'Су арықтың ең терең жеріне жетті. Қателік ең кіші мәнде — модель үйренді.',
  },
  stuck: {
    tone: 'warn',
    title: 'Локалды минимумда',
    text: 'Су кішкене шұңқырға түсіп қалды. Оқу жылдамдығын арттыр — су секіріп шығады.',
  },
  diverged: {
    tone: 'bad',
    title: 'Шектен шықты',
    text: 'Қадам тым үлкен: су арықтан асып кетті. Оқу жылдамдығын азайт немесе еңісті жайлат.',
  },
}

/** Верх видимой шкалы: выше — только стенки русла, они нам не нужны. */
const J_LO = shape(GLOBAL_X)
const J_HI = J_LO + 1.75 * (shape(BARRIER_X) - J_LO)

export function AryqGradient({ compact = false }: { compact?: boolean }) {
  const [slope, setSlope] = useState(1.0)
  const [rate, setRate] = useState(0.35)
  const [run, setRun] = useState(0)
  const reduced = useReducedMotion()
  const { ref: rootRef, inView } = useInView<HTMLDivElement>()
  // Неподвижная часть сцены рисуется один раз на каждый уклон, а не 60 раз в секунду.
  const metaphorLayer = useLayer()
  const scienceLayer = useLayer()

  const params = useRef({ slope, rate, reduced })
  params.current = { slope, rate, reduced }

  const sim = useRef({
    d: initialDescent(),
    prevX: START_X,
    acc: 0,
    sub: 0,
    frozen: 0,
    history: [START_X],
  })

  const reset = useCallback(() => {
    sim.current = { d: initialDescent(), prevX: START_X, acc: 0, sub: 0, frozen: 0, history: [START_X] }
    setRun((n) => n + 1)
  }, [])

  const push = (x: number) => {
    const s = sim.current
    s.history.push(x)
    if (s.history.length > HISTORY) s.history.shift()
  }

  // Симуляция живёт в своём кадре: холсты только читают её состояние.
  useEffect(() => {
    // prefers-reduced-motion: не крутим анимацию, а сразу доводим модель
    // до устойчивого исхода. Ученик видит результат, но ничего не движется.
    if (reduced) {
      const s = sim.current
      for (let i = 0; i < 800 && s.d.phase === 'run'; i++) {
        s.prevX = s.d.x
        advance(s.d, slope, rate)
        push(s.d.x)
      }
      s.sub = 1
      return
    }

    let raf = 0
    let last = performance.now()

    const tick = (t: number) => {
      const dt = Math.min((t - last) / 1000, 1 / 20)
      last = t
      const s = sim.current

      // Вне экрана модель не считаем: урок длинный, батарея одна.
      if (!inView.current) {
        raf = requestAnimationFrame(tick)
        return
      }

      if (s.d.phase === 'diverged') {
        s.frozen += dt
        if (s.frozen > 1.2) reset()
        raf = requestAnimationFrame(tick)
        return
      }

      const stepTime = 1 / STEPS_PER_SEC
      s.acc += dt
      let guard = 0
      while (s.acc >= stepTime && guard++ < 6) {
        s.acc -= stepTime
        s.prevX = s.d.x
        const { phase } = advance(s.d, slope, rate)
        push(s.d.x)
        if (phase === 'diverged') break
      }
      s.sub = clamp(s.acc / stepTime, 0, 1)
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [reset, reduced, slope, rate, run, inView])

  // Цифры обновляем 12 раз в секунду — без 60 ре-рендеров.
  const tele = useTelemetry(
    () => {
      const d = sim.current.d
      return { x: d.x, loss: params.current.slope * shape(d.x), steps: d.steps, phase: d.phase }
    },
    { x: START_X, loss: shape(START_X), steps: 0, phase: 'run' as Phase }
  )

  /* ----------------------- Метафора: арык ----------------------- */
  const drawMetaphor = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => {
    const a = params.current.slope
    const aVis = 0.6 + 0.4 * a
    const mid = (J_HI + J_LO) / 2
    const K = (h * 0.4) / ((J_HI - J_LO) / 2)
    // Метафоре достаточно чуть более узкого участка: стенки не должны съедать кадр.
    const mX0 = -1.42
    const mX1 = 1.5
    const toY = (x: number) => h * 0.52 - (shape(x) - mid) * aVis * K
    const toX = (x: number) => ((x - mX0) / (mX1 - mX0)) * w
    const poolY = toY(GLOBAL_X) - h * 0.11

    // Рельеф, земля, озеро и трава зависят только от уклона — кладём их в слой.
    const layer = metaphorLayer(`aryq-m|${a.toFixed(2)}`, w, h, (c) => {
      const sky = c.createLinearGradient(0, 0, 0, h)
      sky.addColorStop(0, '#141810')
      sky.addColorStop(0.55, '#1E2418')
      sky.addColorStop(1, '#232A1C')
      c.fillStyle = sky
      c.fillRect(0, 0, w, h)

      // Дальние холмы — глубина сцены, а не украшение.
      c.fillStyle = 'rgba(52, 58, 44, 0.55)'
      c.beginPath()
      c.moveTo(0, h)
      for (let px = 0; px <= w; px += 6) {
        const n = px / w
        c.lineTo(px, h * 0.46 + Math.sin(n * 5.1 + 0.7) * h * 0.05 + Math.sin(n * 11.3) * h * 0.02)
      }
      c.lineTo(w, h)
      c.closePath()
      c.fill()

      // Профиль рельефа = та же функция потерь, только это берег арыка.
      const ridge: { x: number; y: number }[] = []
      for (let px = 0; px <= w; px += 2) {
        const x = mX0 + (px / w) * (mX1 - mX0)
        ridge.push({ x: px, y: toY(x) })
      }

      c.beginPath()
      c.moveTo(0, h + 2)
      ridge.forEach((pt) => c.lineTo(pt.x, pt.y))
      c.lineTo(w, h + 2)
      c.closePath()
      const gnd = c.createLinearGradient(0, h * 0.1, 0, h)
      gnd.addColorStop(0, '#3A3F2E')
      gnd.addColorStop(0.45, P.ground)
      gnd.addColorStop(1, P.groundDeep)
      c.fillStyle = gnd
      c.fill()

      polyline(c, ridge, alpha.gold(0.8), 2)

      /* Озеро на дне русла: заливаем только там, где берег ниже уровня воды.
         Прямоугольная заливка выглядела бы «водой поверх степи». */
      let pool: { x: number; y: number }[] = []
      const flush = () => {
        if (pool.length < 2) {
          pool = []
          return
        }
        c.beginPath()
        c.moveTo(pool[0].x, poolY)
        pool.forEach((pt) => c.lineTo(pt.x, pt.y))
        c.lineTo(pool[pool.length - 1].x, poolY)
        c.closePath()
        const wg = c.createLinearGradient(0, poolY, 0, Math.max(...pool.map((pt) => pt.y)))
        wg.addColorStop(0, alpha.water(0.62))
        wg.addColorStop(1, alpha.water(0.16))
        c.fillStyle = wg
        c.fill()
        pool = []
      }
      for (const pt of ridge) {
        if (pt.y > poolY) pool.push(pt)
        else flush()
      }
      flush()

      // Трава на сухих берегах — сцена читается как степь, а не как график.
      c.strokeStyle = alpha.water(0.22)
      c.lineWidth = 1
      for (let px = 6; px < w - 4; px += 17) {
        const pt = ridge[Math.round(px / 2)]
        if (!pt || pt.y > poolY || pt.y > h - 3 || pt.y < 6) continue
        c.beginPath()
        c.moveTo(px, pt.y)
        c.quadraticCurveTo(px + 1, pt.y - 5, px + 2, pt.y - 9)
        c.stroke()
      }
    })

    if (layer) ctx.drawImage(layer, 0, 0, w, h)

    // Рябь по воде — единственное, что действительно должно двигаться.
    const waterLeft = toX(-0.1)
    const waterRight = toX(1.5)
    if (waterRight > waterLeft) {
      ctx.save()
      ctx.strokeStyle = alpha.water(0.5)
      ctx.lineWidth = 1
      for (let i = 0; i < 2; i++) {
        ctx.beginPath()
        for (let px = waterLeft; px <= waterRight; px += 8) {
          const y = poolY + 3 + i * 4 + Math.sin(px * 0.07 + t * 0.0016 + i) * 1.4
          if (px === waterLeft) ctx.moveTo(px, y)
          else ctx.lineTo(px, y)
        }
        ctx.stroke()
      }
      ctx.restore()
    }

    const s = sim.current
    const u = params.current.reduced ? 1 : s.sub

    // След пройденного пути — ручеёк, который уже протёк.
    if (s.history.length > 1) {
      ctx.save()
      ctx.lineCap = 'round'
      for (let i = 1; i < s.history.length; i++) {
        const f = i / s.history.length
        ctx.beginPath()
        ctx.strokeStyle = alpha.water(0.04 + f * 0.38)
        ctx.lineWidth = 1 + f * 2.4
        ctx.moveTo(toX(s.history[i - 1]), toY(s.history[i - 1]) - 3)
        ctx.lineTo(toX(s.history[i]), toY(s.history[i]) - 3)
        ctx.stroke()
      }
      ctx.restore()
    }

    // Капля летит между шагами по дуге — виден сам «қадам».
    const xNow = s.prevX + (s.d.x - s.prevX) * u
    const jump = Math.min(Math.abs(s.d.x - s.prevX) * 24, h * 0.2)
    const lift = Math.sin(Math.PI * u) * jump
    const dx = clamp(toX(xNow), 6, w - 6)
    const dy = clamp(toY(xNow) - 9 - lift, 6, h - 6)
    const r = clamp(h * 0.045 + 4, 6, 11)

    ctx.save()
    ctx.beginPath()
    ctx.ellipse(dx, clamp(toY(xNow) - 2, 6, h - 4), r * 1.1, r * 0.35, 0, 0, Math.PI * 2)
    ctx.fillStyle = alpha.black(0.35)
    ctx.fill()
    ctx.restore()

    const tone: StatusTone = s.d.phase === 'diverged' ? 'bad' : s.d.phase === 'stuck' ? 'warn' : 'ok'
    glowDot(ctx, dx, dy, r, toneColor[tone], toneAlpha[tone](0.35))
    ctx.save()
    ctx.beginPath()
    ctx.arc(dx - r * 0.3, dy - r * 0.35, r * 0.28, 0, Math.PI * 2)
    ctx.fillStyle = alpha.text(0.5)
    ctx.fill()
    ctx.restore()

    // Брызги при перелёте через берег.
    if (s.d.phase === 'diverged') {
      ctx.save()
      ctx.strokeStyle = alpha.alert(0.7)
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      for (let i = 0; i < 7; i++) {
        const ang = -Math.PI / 2 + (i - 3) * 0.3
        const len = 9 + (i % 3) * 7
        ctx.beginPath()
        ctx.moveTo(dx, dy)
        ctx.lineTo(dx + Math.cos(ang) * len, dy + Math.sin(ang) * len)
        ctx.stroke()
      }
      ctx.restore()
    }
  }, [metaphorLayer])

  /* ----------------------- Наука: кривая потерь ----------------------- */
  const drawScience = useCallback((ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const a = params.current.slope
    const s = sim.current

    const padL = 36
    const padR = 10
    const padT = 12
    const padB = 24
    const iw = w - padL - padR
    const ih = h - padT - padB

    const lo = a * J_LO
    const hi = a * J_HI
    const toY = (v: number) => padT + ih - ((v - lo) / (hi - lo)) * ih
    const toX = (x: number) => padL + ((x - X_MIN) / (X_MAX - X_MIN)) * iw

    /* Фон, сетка, оси и сама кривая потерь зависят только от уклона.
       Раньше это была пара сотен вызовов shape() и три градиента на каждый кадр. */
    const layer = scienceLayer(`aryq-s|${a.toFixed(2)}`, w, h, (c) => {
      panelBackground(c, w, h)
      grid(c, padL, padT, iw, ih, iw / 4, ih / 4)

      c.strokeStyle = P.gridStrong
      c.lineWidth = 1
      c.beginPath()
      c.moveTo(padL + 0.5, padT)
      c.lineTo(padL + 0.5, padT + ih + 0.5)
      c.lineTo(padL + iw, padT + ih + 0.5)
      c.stroke()

      /* Точки выше рамки выбрасываем, а не прижимаем к краю:
         иначе стенки русла превращаются в фальшивую горизонтальную полку. */
      const segments: { x: number; y: number }[][] = []
      let seg: { x: number; y: number }[] = []
      for (let px = 0; px <= iw; px += 2) {
        const x = X_MIN + (px / iw) * (X_MAX - X_MIN)
        const y = toY(a * shape(x))
        if (y >= padT && y <= padT + ih) seg.push({ x: padL + px, y })
        else if (seg.length) {
          segments.push(seg)
          seg = []
        }
      }
      if (seg.length) segments.push(seg)

      for (const s2 of segments) {
        areaUnder(c, s2, padT + ih, alpha.gold(0.15))
        polyline(c, s2, P.gold, 2)
      }

      const gy = toY(a * shape(GLOBAL_X))
      polyline(c, [{ x: padL, y: gy }, { x: padL + iw, y: gy }], alpha.water(0.35), 1, [3, 4])
      axisLabel(c, 'ең төмен', padL + iw - 2, gy - 8, 'right')

      axisLabel(c, 'параметр θ', padL + iw / 2, h - 9)
      c.save()
      c.translate(12, padT + ih / 2)
      c.rotate(-Math.PI / 2)
      axisLabel(c, 'қателік J', 0, 0)
      c.restore()
      axisLabel(c, hi.toFixed(1), padL - 5, padT + 5, 'right')
      axisLabel(c, lo.toFixed(1), padL - 5, padT + ih - 5, 'right')
    })

    if (layer) ctx.drawImage(layer, 0, 0, w, h)

    // Траектория параметра
    if (s.history.length > 1) {
      ctx.save()
      for (let i = 1; i < s.history.length; i++) {
        const f = i / s.history.length
        const x0 = s.history[i - 1]
        const x1 = s.history[i]
        ctx.beginPath()
        ctx.strokeStyle = alpha.water(0.05 + f * 0.45)
        ctx.lineWidth = 1 + f * 1.6
        ctx.moveTo(toX(x0), clamp(toY(a * shape(x0)), padT, padT + ih))
        ctx.lineTo(toX(x1), clamp(toY(a * shape(x1)), padT, padT + ih))
        ctx.stroke()
      }
      ctx.restore()
    }

    const tone: StatusTone = s.d.phase === 'diverged' ? 'bad' : s.d.phase === 'stuck' ? 'warn' : 'ok'
    const cx = clamp(toX(s.d.x), padL, padL + iw)
    const cy = clamp(toY(a * shape(s.d.x)), padT + 4, padT + ih)

    // Стрелка градиента: куда именно тянет модель.
    const step = s.d.x - s.prevX
    if (Math.abs(step) > 0.004 && s.d.phase !== 'diverged') {
      const dir = Math.sign(step)
      const len = clamp(Math.abs(step) * 90, 12, 48)
      ctx.save()
      ctx.strokeStyle = alpha.water(0.85)
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.beginPath()
      ctx.moveTo(cx, cy - 17)
      ctx.lineTo(cx + dir * len, cy - 17)
      ctx.moveTo(cx + dir * len, cy - 17)
      ctx.lineTo(cx + dir * len - dir * 5, cy - 21)
      ctx.moveTo(cx + dir * len, cy - 17)
      ctx.lineTo(cx + dir * len - dir * 5, cy - 13)
      ctx.stroke()
      ctx.restore()
    }

    glowDot(ctx, cx, cy, 5, toneColor[tone], toneAlpha[tone](0.4))
  }, [scienceLayer])

  const status = STATUS[tele.phase]

  return (
    <WidgetFrame
      title="Арық: градиенттік түсу"
      hint="Тұтқаны сүйре — су да, қисықтағы нүкте де бірге өзгереді"
      rootRef={rootRef}
      onReset={reset}
      metaphor={
        <Canvas
          draw={drawMetaphor}
          ratio={compact ? 0.42 : 0.6}
          minHeight={compact ? 104 : 124}
          maxHeight={compact ? 142 : 210}
          label="Арық метафорасы: су еңіс бойымен төмен ағып, ең терең жерге жетуге тырысады"
        />
      }
      science={
        <Canvas
          draw={drawScience}
          ratio={compact ? 0.42 : 0.6}
          minHeight={compact ? 104 : 124}
          maxHeight={compact ? 142 : 210}
          label="Қателік қисығы: ағымдағы параметр нүктесі және қадам бағыты"
        />
      }
      readouts={[
        { label: 'Қадам', value: String(tele.steps) },
        { label: 'Параметр θ', value: tele.x.toFixed(3) },
        { label: 'Қателік J', value: tele.loss.toFixed(3), tone: status.tone },
      ]}
      controls={
        <>
          <Slider
            label="Жер еңісі"
            value={slope}
            min={0.4}
            max={2.4}
            step={0.05}
            onChange={setSlope}
            format={(v) => `×${v.toFixed(2)}`}
            minLabel="жайпақ"
            maxLabel="тік"
            hint="жер қаншалық тік"
            tone="gold"
          />
          <Slider
            label="Оқу жылдамдығы"
            value={rate}
            min={0.02}
            max={0.8}
            step={0.01}
            onChange={setRate}
            format={(v) => v.toFixed(2)}
            minLabel="ұсақ қадам"
            maxLabel="ірі қадам"
            hint="бір қадамның ұзындығы"
          />
        </>
      }
      status={status}
    />
  )
}
