'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Canvas } from './_shared/Canvas'
import { Slider } from './_shared/Slider'

export function OtarBatch({ width = 340, height = 200 }: { width?: number; height?: number }) {
  const [batchSize, setBatchSize] = useState(0.3)
  const [sheep, setSheep] = useState<{ x: number; y: number }[]>([])
  const [center, setCenter] = useState({ x: 0.5, y: 0.5 })
  const animationRef = useRef<number>()

  useEffect(() => {
    // Generate random sheep
    const newSheep: { x: number; y: number }[] = []
    for (let i = 0; i < 30; i++) {
      newSheep.push({
        x: 0.3 + Math.random() * 0.4,
        y: 0.3 + Math.random() * 0.4,
      })
    }
    setSheep(newSheep)
  }, [])

  useEffect(() => {
    // Animate center movement (gradient descent)
    let lastTime = performance.now()
    const targetX = 0.5
    const targetY = 0.5

    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      const noise = batchSize < 0.3 ? 0.1 : batchSize > 0.7 ? 0.02 : 0.05
      
      setCenter((prev) => ({
        x: prev.x + (targetX - prev.x) * dt * (1 - batchSize) + (Math.random() - 0.5) * noise,
        y: prev.y + (targetY - prev.y) * dt * (1 - batchSize) + (Math.random() - 0.5) * noise,
      }))

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [batchSize])

  const draw = useCallback((ctx: CanvasRenderingContext2D, dpr: number) => {
    const w = width
    const h = height

    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(0, 0, w, h)

    // Pasture boundary
    ctx.strokeStyle = '#D9A441'
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, w - 40, h - 40)

    // Center point (best grass)
    const cx = 20 + center.x * (w - 40)
    const cy = 20 + center.y * (h - 40)

    // Gradient circle
    const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 40)
    gradient.addColorStop(0, 'rgba(63, 169, 160, 0.3)')
    gradient.addColorStop(1, 'transparent')
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(cx, cy, 40, 0, Math.PI * 2)
    ctx.fill()

    // Sheep
    const batchCount = Math.max(1, Math.floor(batchSize * 10))
    sheep.slice(0, batchCount).forEach((s, i) => {
      const sx = 20 + s.x * (w - 40)
      const sy = 20 + s.y * (h - 40)
      
      ctx.beginPath()
      ctx.arc(sx, sy, 6, 0, Math.PI * 2)
      ctx.fillStyle = '#EDEAE2'
      ctx.fill()
      
      // Movement trail
      if (i < 5) {
        ctx.beginPath()
        ctx.moveTo(sx, sy)
        ctx.lineTo(cx + (Math.random() - 0.5) * 20, cy + (Math.random() - 0.5) * 20)
        ctx.strokeStyle = 'rgba(63, 169, 160, 0.3)'
        ctx.lineWidth = 1
        ctx.stroke()
      }
    })

    // Center point
    ctx.beginPath()
    ctx.arc(cx, cy, 8, 0, Math.PI * 2)
    ctx.fillStyle = '#3FA9A0'
    ctx.fill()

    // Label
    ctx.fillStyle = '#9A9B90'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Отар (batch)', w / 2, h - 5)
  }, [width, height, sheep, center, batchSize])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4 mb-4">
        <Canvas width={width} height={height} onDraw={draw} className="rounded-lg" />
      </div>
      
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4">
        <Slider
          label="Оттегі (batch size)"
          value={batchSize}
          min={0.1}
          max={1.0}
          step={0.05}
          onChange={setBatchSize}
          formatValue={(v) => `${Math.floor(v * 10)} қой`}
        />
      </div>

      <div className="mt-4 text-sm text-dala-muted">
        {batchSize < 0.3 ? (
          <p>⚡ Кіші отар: жылдам, бірақ шуылды (SGD)</p>
        ) : batchSize > 0.7 ? (
          <p>🐌 Үлкен отар: баяу, бірақ тұрақты</p>
        ) : (
          <p>✅ Орташа: жылдамдық пен тұрақтылық теңгерімі</p>
        )}
      </div>
    </div>
  )
}
