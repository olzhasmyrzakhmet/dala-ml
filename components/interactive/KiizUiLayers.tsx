'use client'

import { useState, useCallback } from 'react'
import { Canvas } from './_shared/Canvas'

export function KiizUiLayers({ width = 340, height = 220 }: { width?: number; height?: number }) {
  const [layers, setLayers] = useState(2)

  const draw = useCallback((ctx: CanvasRenderingContext2D, dpr: number) => {
    const w = width
    const h = height
    const centerX = w / 2
    const baseY = h - 30

    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(0, 0, w, h)

    // Decision boundary complexity based on layers
    const complexity = layers * 0.3

    // Draw decision regions
    for (let region = 0; region < Math.min(4, layers + 1); region++) {
      const angle = (region / 4) * Math.PI * 2
      const x = centerX + Math.cos(angle) * 60
      const y = baseY - 80

      ctx.beginPath()
      ctx.arc(x, y, 30 + complexity * 20, 0, Math.PI * 2)
      ctx.fillStyle = region % 2 === 0 
        ? `rgba(63, 169, 160, ${0.1 + region * 0.1})` 
        : `rgba(217, 164, 65, ${0.1 + region * 0.1})`
      ctx.fill()
    }

    // Yurt layers (from bottom)
    const layerColors = ['#5C4033', '#8B6914', '#D9A441', '#3FA9A0']
    
    for (let i = 0; i < layers && i < 4; i++) {
      const y = baseY - i * 25
      const width = 120 - i * 20
      const height = 20

      // Layer
      ctx.fillStyle = layerColors[i]
      ctx.fillRect(centerX - width / 2, y - height, width, height)

      // Pattern
      ctx.strokeStyle = '#1B1E17'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let x = centerX - width / 2 + 10; x < centerX + width / 2; x += 20) {
        ctx.moveTo(x, y - height)
        ctx.lineTo(x + 10, y)
      }
      ctx.stroke()
    }

    // Top (shanyrak)
    ctx.fillStyle = '#3FA9A0'
    ctx.beginPath()
    ctx.moveTo(centerX - 20, baseY - layers * 25)
    ctx.lineTo(centerX, baseY - layers * 25 - 20)
    ctx.lineTo(centerX + 20, baseY - layers * 25)
    ctx.closePath()
    ctx.fill()

    // Label
    ctx.fillStyle = '#9A9B90'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`${layers} қабат (layers)`, centerX, h - 5)

    // Complexity indicator
    ctx.fillStyle = '#EDEAE2'
    ctx.font = '11px system-ui'
    ctx.fillText(`Шешім шекарасы: ${complexity > 0.8 ? 'күрделі' : complexity > 0.5 ? 'орташа' : 'қарапайым'}`, centerX, 15)
  }, [width, height, layers])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4 mb-4">
        <Canvas width={width} height={height} onDraw={draw} className="rounded-lg" />
      </div>
      
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4">
        <div className="flex gap-2">
          {[1, 2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setLayers(n)}
              className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                layers === n
                  ? 'bg-dala-water text-dala-bg'
                  : 'bg-dala-bg text-dala-muted hover:bg-dala-water/20'
              }`}
            >
              {n} қабат
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-sm text-dala-muted">
        <p>Әр қабат күрделірек шекараларды бөліп білуге мүмкіндік береді</p>
      </div>
    </div>
  )
}
