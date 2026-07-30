/**
 * Мелкие помощники рисования для canvas-виджетов.
 * Всё в CSS-пикселях: масштаб DPR уже применён в <Canvas>.
 */

import { P, alpha } from './palette'

export type Ctx = CanvasRenderingContext2D

/**
 * Семейство шрифта страницы. next/font регистрирует Inter под хешированным
 * именем, поэтому строку «Inter» в canvas писать бесполезно — подписи рисовались
 * системным фолбэком, и казахские глифы в них никто не проверял.
 * Читаем фактическое семейство у <body> один раз.
 */
let uiFont: string | null = null

export function fontFamily(): string {
  if (uiFont) return uiFont
  if (typeof document === 'undefined') return 'system-ui, sans-serif'
  const resolved = getComputedStyle(document.body).fontFamily
  uiFont = resolved && resolved.trim() ? resolved : 'system-ui, sans-serif'
  return uiFont
}

/** Шрифт подписи: размер не меньше 12px (DESIGN.md §3, Caption). */
export function labelFont(weight = 500, size = 12): string {
  return `${weight} ${Math.max(12, size)}px ${fontFamily()}`
}

/** Прямоугольник со скруглением (Safari 15 не знает roundRect). */
export function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + rr, y)
  ctx.arcTo(x + w, y, x + w, y + h, rr)
  ctx.arcTo(x + w, y + h, x, y + h, rr)
  ctx.arcTo(x, y + h, x, y, rr)
  ctx.arcTo(x, y, x + w, y, rr)
  ctx.closePath()
}

/** Фон панели: вертикальный градиент «неба» + виньетка. */
export function panelBackground(ctx: Ctx, w: number, h: number) {
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, P.skyTop)
  g.addColorStop(1, P.skyBottom)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
}

/** Сетка координат. step — шаг в пикселях. */
export function grid(ctx: Ctx, x: number, y: number, w: number, h: number, stepX: number, stepY: number) {
  ctx.save()
  ctx.strokeStyle = P.grid
  ctx.lineWidth = 1
  ctx.beginPath()
  for (let gx = x; gx <= x + w + 0.5; gx += stepX) {
    ctx.moveTo(Math.round(gx) + 0.5, y)
    ctx.lineTo(Math.round(gx) + 0.5, y + h)
  }
  for (let gy = y; gy <= y + h + 0.5; gy += stepY) {
    ctx.moveTo(x, Math.round(gy) + 0.5)
    ctx.lineTo(x + w, Math.round(gy) + 0.5)
  }
  ctx.stroke()
  ctx.restore()
}

/** Светящаяся точка: мягкий ореол + ядро + обводка. */
export function glowDot(ctx: Ctx, x: number, y: number, r: number, color: string, glow: string) {
  ctx.save()
  const g = ctx.createRadialGradient(x, y, 0, x, y, r * 4)
  g.addColorStop(0, glow)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.arc(x, y, r * 4, 0, Math.PI * 2)
  ctx.fill()

  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = color
  ctx.fill()
  ctx.lineWidth = 2
  ctx.strokeStyle = alpha.text(0.85)
  ctx.stroke()
  ctx.restore()
}

/** Мелкая подпись оси. */
export function axisLabel(ctx: Ctx, text: string, x: number, y: number, align: CanvasTextAlign = 'center') {
  ctx.save()
  ctx.font = labelFont(500, 12)
  ctx.fillStyle = P.muted
  ctx.textAlign = align
  ctx.textBaseline = 'middle'
  ctx.fillText(text, x, y)
  ctx.restore()
}

/** Полилиния по массиву точек. */
export function polyline(ctx: Ctx, pts: { x: number; y: number }[], stroke: string, width: number, dash: number[] = []) {
  if (pts.length < 2) return
  ctx.save()
  ctx.setLineDash(dash)
  ctx.strokeStyle = stroke
  ctx.lineWidth = width
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.beginPath()
  ctx.moveTo(pts[0].x, pts[0].y)
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y)
  ctx.stroke()
  ctx.restore()
}

/** Заливка под кривой — мягкий градиент к нулю. */
export function areaUnder(ctx: Ctx, pts: { x: number; y: number }[], baseY: number, top: string) {
  if (pts.length < 2) return
  ctx.save()
  const g = ctx.createLinearGradient(0, Math.min(...pts.map((p) => p.y)), 0, baseY)
  g.addColorStop(0, top)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(pts[0].x, baseY)
  for (const p of pts) ctx.lineTo(p.x, p.y)
  ctx.lineTo(pts[pts.length - 1].x, baseY)
  ctx.closePath()
  ctx.fill()
  ctx.restore()
}

export interface Plot {
  x: (v: number) => number
  y: (v: number) => number
  left: number
  top: number
  w: number
  h: number
  bottom: number
  right: number
}

/**
 * Готовая система координат для панели «наука»: рамка, сетка, оси, подписи.
 * Возвращает функции перевода данных в пиксели.
 */
export function makePlot(
  ctx: Ctx,
  w: number,
  h: number,
  opts: {
    xRange: [number, number]
    yRange: [number, number]
    xLabel?: string
    yLabel?: string
    padL?: number
    padR?: number
    padT?: number
    padB?: number
    gridX?: number
    gridY?: number
    /** Для тепловых карт сетку выключаем: поверх заливки она только мешает. */
    showGrid?: boolean
  }
): Plot {
  const padL = opts.padL ?? 34
  const padR = opts.padR ?? 10
  const padT = opts.padT ?? 12
  const padB = opts.padB ?? 24
  const iw = Math.max(1, w - padL - padR)
  const ih = Math.max(1, h - padT - padB)
  const [x0, x1] = opts.xRange
  const [y0, y1] = opts.yRange

  panelBackground(ctx, w, h)
  if (opts.showGrid !== false) {
    grid(ctx, padL, padT, iw, ih, iw / (opts.gridX ?? 4), ih / (opts.gridY ?? 4))
  }

  ctx.save()
  ctx.strokeStyle = P.gridStrong
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(padL + 0.5, padT)
  ctx.lineTo(padL + 0.5, padT + ih + 0.5)
  ctx.lineTo(padL + iw, padT + ih + 0.5)
  ctx.stroke()
  ctx.restore()

  if (opts.xLabel) axisLabel(ctx, opts.xLabel, padL + iw / 2, h - 9)
  if (opts.yLabel) {
    ctx.save()
    ctx.translate(11, padT + ih / 2)
    ctx.rotate(-Math.PI / 2)
    axisLabel(ctx, opts.yLabel, 0, 0)
    ctx.restore()
  }

  return {
    x: (v) => padL + ((v - x0) / (x1 - x0 || 1)) * iw,
    y: (v) => padT + ih - ((v - y0) / (y1 - y0 || 1)) * ih,
    left: padL,
    top: padT,
    w: iw,
    h: ih,
    bottom: padT + ih,
    right: padL + iw,
  }
}

/** Точка-маркер данных. */
export function dot(ctx: Ctx, x: number, y: number, r: number, fill: string, stroke?: string) {
  ctx.save()
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  if (stroke) {
    ctx.lineWidth = 1.5
    ctx.strokeStyle = stroke
    ctx.stroke()
  }
  ctx.restore()
}

/** Небо и земля — общий фон «степной» панели-метафоры. */
export function steppe(ctx: Ctx, w: number, h: number, horizon = 0.55) {
  const sky = ctx.createLinearGradient(0, 0, 0, h * horizon)
  sky.addColorStop(0, '#151912')
  sky.addColorStop(1, '#20261A')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h * horizon)

  const gnd = ctx.createLinearGradient(0, h * horizon, 0, h)
  gnd.addColorStop(0, P.ground)
  gnd.addColorStop(1, P.groundDeep)
  ctx.fillStyle = gnd
  ctx.fillRect(0, h * horizon, w, h - h * horizon)

  ctx.save()
  ctx.strokeStyle = alpha.gold(0.18)
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, Math.round(h * horizon) + 0.5)
  ctx.lineTo(w, Math.round(h * horizon) + 0.5)
  ctx.stroke()
  ctx.restore()
}

/**
 * Затухающий след. Раньше каждый отрезок был отдельным beginPath+stroke —
 * девяносто вызовов отрисовки на кадр, и на дешёвом Android это съедало
 * весь бюджет. Группируем отрезки в несколько уровней прозрачности:
 * визуально то же самое, вызовов в двадцать раз меньше.
 */
export function fadingTrail(
  ctx: Ctx,
  pts: { x: number; y: number }[],
  color: (a: number) => string,
  maxAlpha = 0.5,
  widthMax = 2.5,
  buckets = 4
) {
  if (pts.length < 2) return
  ctx.save()
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  for (let b = 0; b < buckets; b++) {
    const from = Math.floor(((pts.length - 1) * b) / buckets)
    const to = Math.floor(((pts.length - 1) * (b + 1)) / buckets)
    if (to <= from) continue
    const f = (b + 1) / buckets
    ctx.strokeStyle = color(maxAlpha * f * f)
    ctx.lineWidth = 0.8 + widthMax * f
    ctx.beginPath()
    ctx.moveTo(pts[from].x, pts[from].y)
    for (let i = from + 1; i <= to; i++) ctx.lineTo(pts[i].x, pts[i].y)
    ctx.stroke()
  }
  ctx.restore()
}

export function clamp(v: number, lo: number, hi: number) {
  return v < lo ? lo : v > hi ? hi : v
}

