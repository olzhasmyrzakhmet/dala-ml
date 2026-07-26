'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Canvas } from './_shared/Canvas'
import { Slider } from './_shared/Slider'

export function DalaZheliNoise({ width = 340, height = 180 }: { width?: number; height?: number }) {
  const [wind, setWind] = useState(0.2)
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])
  const animationRef = useRef<number>()

  useEffect(() => {
    // Generate base points
    const basePoints: { x: number; y: number }[] = []
    for (let i = 0; i < 10; i++) {
      basePoints.push({
        x: 40 + i * 26,
        y: 90 + Math.sin(i * 0.5) * 20,
      })
    }
    setPoints(basePoints)
  }, [])

  useEffect(() => {
    // Animate wind
    const animate = () => {
      setPoints((prev) =>
        prev.map((p, i) => ({
          x: p.x + (Math.random() - 0.5) * wind * 10,
          y: p.y + (Math.random() - 0.5) * wind * 5,
        }))
      )
      animationRef.current = requestAnimationFrame(animate)
    }
    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [wind])

  const draw = useCallback((ctx: CanvasRenderingContext2D, dpr: number) => {
    const w = width
    const h = height

    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(0, 0, w, h)

    // True line
    ctx.beginPath()
    ctx.strokeStyle = '#9A9B90'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    for (let i = 0; i < 10; i++) {
      const x = 40 + i * 26
      const y = 90 + Math.sin(i * 0.5) * 20
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.setLineDash([])

    // Wind lines
    ctx.strokeStyle = 'rgba(217, 164, 65, 0.3)'
    ctx.lineWidth = 1
    for (let i = 0; i < 5; i++) {
      const y = 30 + i * 25
      ctx.beginPath()
      ctx.moveTo(20, y)
      ctx.lineTo(w - 20, y + Math.sin(i) * 10)
      ctx.stroke()
    }

    // Noisy points
    points.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 6, 0, Math.PI * 2)
      ctx.fillStyle = wind > 0.5 ? '#D9614C' : '#3FA9A0'
      ctx.fill()
    })

    // Label
    ctx.fillStyle = '#9A9B90'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Дала желі (noise)', w / 2, h - 8)
  }, [width, height, wind, points])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4 mb-4">
        <Canvas width={width} height={height} onDraw={draw} className="rounded-lg" />
      </div>
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4">
        <Slider
          label="Жел күші (noise level)"
          value={wind}
          min={0}
          max={1}
          step={0.05}
          onChange={setWind}
          formatValue={(v) => `${(v * 100).toFixed(0)}%`}
        />
      </div>
      <p className="mt-4 text-sm text-dala-muted">
        {wind > 0.5 ? '❌ Күшті жел — модель шуылды үйреніп жатыр' : '✅ Тыныш — модель заңдылықты көріп тұр'}
      </p>
    </div>
  )
}
