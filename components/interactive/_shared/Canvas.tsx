'use client'

import { useEffect, useRef, useCallback } from 'react'

interface CanvasProps {
  width: number
  height: number
  onDraw: (ctx: CanvasRenderingContext2D, dpr: number) => void
  className?: string
}

export function Canvas({ width, height, onDraw, className = '' }: CanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dprRef = useRef(1)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // DPR масштабирование для ретины
    const dpr = window.devicePixelRatio || 1
    dprRef.current = dpr

    // Устанавливаем физический размер canvas
    canvas.width = width * dpr
    canvas.height = height * dpr

    // CSS размер остаётся как задан
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Масштабируем контекст
    ctx.scale(dpr, dpr)

    // Очищаем и рисуем
    ctx.clearRect(0, 0, width, height)
    onDraw(ctx, dpr)
  }, [width, height, onDraw])

  useEffect(() => {
    draw()

    // Перерисовка при изменении размера окна
    const handleResize = () => draw()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      className={`block ${className}`}
      style={{ width, height }}
    />
  )
}
