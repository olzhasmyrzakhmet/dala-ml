'use client'

import { useState, useCallback } from 'react'
import { Canvas } from './_shared/Canvas'

export function FeaturePrimeta({ width = 340, height = 200 }: { width?: number; height?: number }) {
  const [features, setFeatures] = useState({
    clouds: true,
    wind: false,
    cattle: false,
    grass: true,
  })

  const accuracy = Object.values(features).filter(Boolean).length * 25

  const draw = useCallback((ctx: CanvasRenderingContext2D, dpr: number) => {
    const w = width
    const h = height

    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(0, 0, w, h)

    // Sky
    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(0, 0, w, h / 2)

    // Clouds (if feature enabled)
    if (features.clouds) {
      ctx.fillStyle = 'rgba(154, 155, 144, 0.5)'
      ctx.beginPath()
      ctx.arc(80, 50, 25, 0, Math.PI * 2)
      ctx.arc(110, 55, 30, 0, Math.PI * 2)
      ctx.arc(140, 50, 25, 0, Math.PI * 2)
      ctx.fill()
    }

    // Wind lines (if feature enabled)
    if (features.wind) {
      ctx.strokeStyle = 'rgba(63, 169, 160, 0.4)'
      ctx.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        ctx.moveTo(200 + i * 20, 40 + i * 10)
        ctx.lineTo(260 + i * 20, 45 + i * 10)
        ctx.stroke()
      }
    }

    // Ground
    ctx.fillStyle = '#2a2d24'
    ctx.fillRect(0, h / 2, w, h / 2)

    // Cattle (if feature enabled)
    if (features.cattle) {
      ctx.fillStyle = '#EDEAE2'
      // Cow 1
      ctx.fillRect(60, h / 2 + 30, 30, 20)
      ctx.beginPath()
      ctx.arc(55, h / 2 + 35, 10, 0, Math.PI * 2)
      ctx.fill()
      // Cow 2
      ctx.fillRect(110, h / 2 + 40, 30, 20)
      ctx.beginPath()
      ctx.arc(105, h / 2 + 45, 10, 0, Math.PI * 2)
      ctx.fill()
    }

    // Grass (if feature enabled)
    if (features.grass) {
      ctx.strokeStyle = '#3FA9A0'
      ctx.lineWidth = 2
      for (let x = 200; x < w - 20; x += 15) {
        ctx.beginPath()
        ctx.moveTo(x, h - 20)
        ctx.lineTo(x + 5, h - 40)
        ctx.stroke()
      }
    }

    // Accuracy bar
    const barWidth = 200
    const barHeight = 12
    const barX = (w - barWidth) / 2
    const barY = 15

    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(barX, barY, barWidth, barHeight)

    ctx.fillStyle = accuracy > 75 ? '#3FA9A0' : accuracy > 50 ? '#D9A441' : '#D9614C'
    ctx.fillRect(barX, barY, barWidth * (accuracy / 100), barHeight)

    ctx.strokeStyle = '#9A9B90'
    ctx.lineWidth = 1
    ctx.strokeRect(barX, barY, barWidth, barHeight)

    // Label
    ctx.fillStyle = '#EDEAE2'
    ctx.font = '11px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText(`Ақылдығы: ${accuracy}%`, w / 2, 40)

    // Bottom label
    ctx.fillStyle = '#9A9B90'
    ctx.font = '12px system-ui'
    ctx.fillText('Приметалар (features)', w / 2, h - 5)
  }, [width, height, features, accuracy])

  const toggleFeature = (key: keyof typeof features) => {
    setFeatures((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4 mb-4">
        <Canvas width={width} height={height} onDraw={draw} className="rounded-lg" />
      </div>

      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4">
        <p className="text-sm text-dala-muted mb-3">Приметаларды таңда:</p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'clouds', label: 'Бұлттар' },
            { key: 'wind', label: 'Жел' },
            { key: 'cattle', label: 'Мал' },
            { key: 'grass', label: 'Шөп' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggleFeature(key as keyof typeof features)}
              className={`py-2 px-3 rounded-lg text-sm font-medium transition-all ${
                features[key as keyof typeof features]
                  ? 'bg-dala-water text-dala-bg'
                  : 'bg-dala-bg text-dala-muted hover:bg-dala-water/20'
              }`}
            >
              {features[key as keyof typeof features] ? '✓ ' : ''}{label}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-sm text-dala-muted">
        {accuracy < 50
          ? '⚠️ Аз примета — болжам нашар'
          : accuracy < 75
          ? '✅ Жақсы, бірақ тағы қосуға болады'
          : '✨ Керемет! Көп примета — дәл болжам'}
      </p>
    </div>
  )
}
