'use client'

import { useState, useCallback } from 'react'
import { Canvas } from './_shared/Canvas'
import { Slider } from './_shared/Slider'

export function TangbaClassify({ width = 340, height = 200 }: { width?: number; height?: number }) {
  const [strictness, setStrictness] = useState(0.5)
  const [points, setPoints] = useState<{ x: number; y: number; type: 'A' | 'B' }[]>([
    { x: 80, y: 60, type: 'A' },
    { x: 120, y: 80, type: 'A' },
    { x: 100, y: 100, type: 'A' },
    { x: 200, y: 70, type: 'B' },
    { x: 240, y: 90, type: 'B' },
    { x: 220, y: 110, type: 'B' },
  ])

  const draw = useCallback((ctx: CanvasRenderingContext2D, dpr: number) => {
    const w = width
    const h = height

    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(0, 0, w, h)

    // Граница решения (диагональ с изгибом от strictness)
    const midX = w / 2 + (strictness - 0.5) * 100
    ctx.beginPath()
    ctx.moveTo(midX - 100, h)
    ctx.lineTo(midX, 20)
    ctx.lineTo(midX + 100, h)
    ctx.strokeStyle = '#D9A441'
    ctx.lineWidth = 3
    ctx.stroke()

    // Точки (тавро)
    points.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 10, 0, Math.PI * 2)
      ctx.fillStyle = p.type === 'A' ? '#3FA9A0' : '#D9614C'
      ctx.fill()
      ctx.strokeStyle = '#EDEAE2'
      ctx.lineWidth = 2
      ctx.stroke()

      // Буква
      ctx.fillStyle = '#EDEAE2'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(p.type, p.x, p.y)
    })

    // Подписи
    ctx.fillStyle = '#9A9B90'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Таңба (классификация)', w / 2, h - 10)
  }, [width, height, strictness, points])

  const addPoint = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const type = x < width / 2 ? 'A' : 'B'
    setPoints([...points, { x, y, type }])
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4 mb-4">
        <Canvas width={width} height={height} onDraw={draw} className="rounded-lg cursor-crosshair" />
        <p className="text-xs text-dala-muted mt-2 text-center">Басып қой таңба (кликни для добавления)</p>
      </div>
      
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4">
        <Slider
          label="Қаттылық (regularization)"
          value={strictness}
          min={0.1}
          max={0.9}
          step={0.05}
          onChange={setStrictness}
          formatValue={(v) => v.toFixed(2)}
        />
      </div>

      <div className="mt-4 text-sm text-dala-muted">
        <p>Таңба = классификация. Шекара екі классты бөледі.</p>
      </div>
    </div>
  )
}
