'use client'

import { useState, useCallback } from 'react'
import { Canvas } from './_shared/Canvas'
import { Slider } from './_shared/Slider'

export function OverfitField({ width = 340, height = 200 }: { width?: number; height?: number }) {
  const [complexity, setComplexity] = useState(0.5)
  const [noise, setNoise] = useState(0.3)

  const drawField = useCallback((ctx: CanvasRenderingContext2D, dpr: number) => {
    const w = width
    const h = height
    const points = 20

    // Фон
    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(0, 0, w, h)

    // Генерируем точки данных
    const dataPoints: { x: number; y: number }[] = []
    for (let i = 0; i < points; i++) {
      const x = (i / (points - 1)) * (w - 40) + 20
      const trueY = h / 2 + Math.sin(i * 0.5) * 30
      const noisyY = trueY + (Math.random() - 0.5) * noise * 100
      dataPoints.push({ x, y: noisyY })
    }

    // Рисуем "истинную" линию (простую)
    ctx.beginPath()
    ctx.strokeStyle = '#9A9B90'
    ctx.lineWidth = 2
    ctx.setLineDash([5, 5])
    for (let i = 0; i < points; i++) {
      const x = (i / (points - 1)) * (w - 40) + 20
      const y = h / 2 + Math.sin(i * 0.5) * 30
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
    ctx.setLineDash([])

    // Рисуем модель (сложную кривую если overfit)
    ctx.beginPath()
    ctx.strokeStyle = complexity > 0.7 ? '#D9614C' : '#3FA9A0'
    ctx.lineWidth = 3
    
    const segments = complexity > 0.7 ? points : Math.max(3, Math.floor(points * (1 - complexity)))
    
    for (let i = 0; i < points; i++) {
      const x = dataPoints[i].x
      let y: number
      
      if (complexity > 0.7) {
        // Overfit — проходит через каждую точку
        y = dataPoints[i].y
      } else {
        // Smooth — усреднённая линия
        y = h / 2 + Math.sin(i * 0.5) * 30 * (1 - complexity * 0.5)
      }
      
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Точки данных
    dataPoints.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#D9A441'
      ctx.fill()
    })

    // Подпись
    ctx.fillStyle = '#9A9B90'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(
      complexity > 0.7 ? 'Шуылды үйреніп жатыр (overfit)' : 'Жақсы үйреніп жатыр',
      w / 2,
      h - 10
    )
  }, [width, height, complexity, noise])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4 mb-4">
        <Canvas
          width={width}
          height={height}
          onDraw={drawField}
          className="rounded-lg"
        />
      </div>
      
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4 space-y-4">
        <Slider
          label="Модель күрделілігі"
          value={complexity}
          min={0.1}
          max={1.0}
          step={0.05}
          onChange={setComplexity}
          formatValue={(v) => v.toFixed(2)}
        />
        <Slider
          label="Шу (noise)"
          value={noise}
          min={0}
          max={0.5}
          step={0.05}
          onChange={setNoise}
          formatValue={(v) => v.toFixed(2)}
        />
      </div>

      <div className="mt-4 text-sm">
        {complexity > 0.7 ? (
          <p className="text-dala-alert">
            ❌ Overfitting: Модель шуылды үйреніп, нақты заңдылықты өткізіп жіберді
          </p>
        ) : (
          <p className="text-dala-water">
            ✅ Жақсы: Модель негізгі заңдылықты үйреніп, шуылды елемейді
          </p>
        )}
      </div>
    </div>
  )
}
