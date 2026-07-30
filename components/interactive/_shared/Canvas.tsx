'use client'

import { useEffect, useRef, useState } from 'react'

export type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => void

interface CanvasProps {
  /** Отношение высоты к ширине. Холст всегда во всю ширину контейнера. */
  ratio?: number
  minHeight?: number
  maxHeight?: number
  /** Рисующая функция. Может меняться каждый рендер — берётся из ref. */
  draw: DrawFn
  /** Крутить requestAnimationFrame. Иначе перерисовка только по изменению размера/пропсов. */
  animate?: boolean
  /** Описание картинки для скринридера. */
  label: string
  className?: string
  onPointer?: (x: number, y: number, w: number, h: number, phase: 'down' | 'move' | 'up') => void
}

/**
 * Адаптивный холст: ширина = ширине контейнера (важно для 360px),
 * DPR-масштабирование, RAF с отменой на unmount и паузой вне экрана.
 */
export function Canvas({
  ratio = 0.62,
  minHeight = 120,
  maxHeight = 260,
  draw,
  animate = true,
  label,
  className = '',
  onPointer,
}: CanvasProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const drawRef = useRef(draw)
  const sizeRef = useRef({ w: 0, h: 0 })
  const rafRef = useRef<number | undefined>(undefined)
  const visibleRef = useRef(true)
  // Декоративное время. При prefers-reduced-motion оно замирает, поэтому рябь,
  // ветер и качание травы останавливаются, а сама модель продолжает считаться.
  const calmRef = useRef(false)
  const [, force] = useState(0)

  drawRef.current = draw

  // Одна функция отрисовки кадра — используется и RAF-циклом, и разовыми вызовами.
  const paintRef = useRef<(t: number, dt: number) => void>(() => {})
  paintRef.current = (t: number, dt: number) => {
    const canvas = canvasRef.current
    const { w, h } = sizeRef.current
    if (!canvas || w === 0 || h === 0) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
    ctx.scale(dpr, dpr)
    ctx.clearRect(0, 0, w, h)
    drawRef.current(ctx, w, h, calmRef.current ? 0 : t, dt)
  }

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => {
      calmRef.current = mq.matches
    }
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // Размер: ResizeObserver по контейнеру + пересчёт физических пикселей.
  useEffect(() => {
    const host = hostRef.current
    const canvas = canvasRef.current
    if (!host || !canvas) return

    const applySize = () => {
      const w = Math.max(1, Math.round(host.clientWidth))
      const h = Math.round(Math.min(maxHeight, Math.max(minHeight, w * ratio)))
      if (sizeRef.current.w === w && sizeRef.current.h === h) return
      sizeRef.current = { w, h }
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      force((n) => n + 1)
      paintRef.current(performance.now(), 0)
    }

    applySize()
    const ro = new ResizeObserver(applySize)
    ro.observe(host)
    window.addEventListener('orientationchange', applySize)
    return () => {
      ro.disconnect()
      window.removeEventListener('orientationchange', applySize)
    }
  }, [ratio, minHeight, maxHeight])

  // Пауза, когда холст вне экрана: восемь виджетов на /dev/widgets не должны жечь батарею.
  useEffect(() => {
    const host = hostRef.current
    if (!host || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      (entries) => {
        visibleRef.current = entries[0]?.isIntersecting ?? true
      },
      { rootMargin: '120px' }
    )
    io.observe(host)
    return () => io.disconnect()
  }, [])

  // Цикл анимации.
  useEffect(() => {
    if (!animate) {
      paintRef.current(performance.now(), 0)
      return
    }
    let last = performance.now()
    const loop = (t: number) => {
      const dt = Math.min((t - last) / 1000, 1 / 30)
      last = t
      if (visibleRef.current) paintRef.current(t, dt)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => {
      if (rafRef.current !== undefined) cancelAnimationFrame(rafRef.current)
      rafRef.current = undefined
    }
  }, [animate])

  // Статичный режим: перерисовываем на каждый рендер родителя.
  useEffect(() => {
    if (!animate) paintRef.current(performance.now(), 0)
  })

  // Указатель — общий обработчик для мыши и пальца.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !onPointer) return
    let active = false

    const local = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      return { x: e.clientX - rect.left, y: e.clientY - rect.top }
    }
    const down = (e: PointerEvent) => {
      active = true
      canvas.setPointerCapture(e.pointerId)
      const { x, y } = local(e)
      onPointer(x, y, sizeRef.current.w, sizeRef.current.h, 'down')
    }
    const move = (e: PointerEvent) => {
      if (!active) return
      e.preventDefault()
      const { x, y } = local(e)
      onPointer(x, y, sizeRef.current.w, sizeRef.current.h, 'move')
    }
    const up = (e: PointerEvent) => {
      if (!active) return
      active = false
      const { x, y } = local(e)
      onPointer(x, y, sizeRef.current.w, sizeRef.current.h, 'up')
    }

    canvas.addEventListener('pointerdown', down)
    canvas.addEventListener('pointermove', move)
    canvas.addEventListener('pointerup', up)
    canvas.addEventListener('pointercancel', up)
    return () => {
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
    }
  }, [onPointer])

  return (
    <div ref={hostRef} className={`w-full ${className}`}>
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={label}
        className={`block w-full rounded-lg ${onPointer ? 'touch-none cursor-crosshair' : ''}`}
      />
    </div>
  )
}

export type PaintLayer = (ctx: CanvasRenderingContext2D, w: number, h: number) => void

/**
 * Кэш «неподвижной» части картинки в закадровом холсте.
 *
 * Рельеф, сетка, оси, кривая потерь не меняются от кадра к кадру — меняются
 * только капля и след. Пересчитывать сотни вызовов shape() и заново создавать
 * градиенты 60 раз в секунду было главной статьёй расхода на дешёвом Android.
 * Слой перерисовывается только когда меняется `key` (обычно это параметры + размер).
 */
export function useLayer() {
  const cache = useRef<{ canvas: HTMLCanvasElement; key: string } | null>(null)

  return (key: string, w: number, h: number, paint: PaintLayer): HTMLCanvasElement | null => {
    if (typeof document === 'undefined' || w <= 0 || h <= 0) return null
    const full = `${key}|${w}x${h}`
    if (cache.current?.key === full) return cache.current.canvas

    const canvas = cache.current?.canvas ?? document.createElement('canvas')
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5)
    canvas.width = Math.round(w * dpr)
    canvas.height = Math.round(h * dpr)
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)
    paint(ctx, w, h)
    cache.current = { canvas, key: full }
    return canvas
  }
}

/**
 * Виден ли элемент. Циклы симуляции обязаны это учитывать: холст сам по себе
 * замирает вне экрана, но модель продолжала считаться и жгла батарею всё время,
 * пока школьник читает текст урока выше.
 */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const inView = useRef(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((e) => {
      inView.current = e[0]?.isIntersecting ?? true
    }, { rootMargin: '160px' })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return { ref, inView }
}

/** Уважение к prefers-reduced-motion — виджеты сами решают, что замедлить. */
export function useReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])
  return reduced
}

/**
 * Значения из симуляции (refs) → в React с частотой ~12 Гц.
 * Так цифры под ползунком живые, но нет 60 ре-рендеров в секунду.
 */
export function useTelemetry<T>(read: () => T, initial: T, hz = 12): T {
  const [value, setValue] = useState<T>(initial)
  const readRef = useRef(read)
  readRef.current = read
  useEffect(() => {
    const id = window.setInterval(() => setValue(readRef.current()), 1000 / hz)
    return () => window.clearInterval(id)
  }, [hz])
  return value
}
