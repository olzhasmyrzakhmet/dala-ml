'use client'

import { useState, useCallback } from 'react'
import { Canvas } from './_shared/Canvas'

export function ZhailauQystau({ width = 340, height = 200 }: { width?: number; height?: number }) {
  const [showTest, setShowTest] = useState(false)

  const draw = useCallback((ctx: CanvasRenderingContext2D, dpr: number) => {
    const w = width
    const h = height

    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(0, 0, w, h)

    // Train (Жайлау) - зелёная зона
    ctx.fillStyle = 'rgba(63, 169, 160, 0.2)'
    ctx.fillRect(20, 20, w / 2 - 30, h - 40)
    ctx.strokeStyle = '#3FA9A0'
    ctx.lineWidth = 2
    ctx.strokeRect(20, 20, w / 2 - 30, h - 40)

    // Test (Қыстау) - синяя зона
    ctx.fillStyle = 'rgba(217, 164, 65, 0.2)'
    ctx.fillRect(w / 2 + 10, 20, w / 2 - 30, h - 40)
    ctx.strokeStyle = '#D9A441'
    ctx.lineWidth = 2
    ctx.strokeRect(w / 2 + 10, 20, w / 2 - 30, h - 40)

    // Точки (овцы)
    const trainPoints = [
      { x: 50, y: 80 }, { x: 80, y: 100 }, { x: 110, y: 70 },
      { x: 60, y: 120 }, { x: 100, y: 130 }
    ]
    const testPoints = [
      { x: w / 2 + 40, y: 90 }, { x: w / 2 + 70, y: 110 }, { x: w / 2 + 100, y: 85 }
    ]

    // Рисуем точки
    trainPoints.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = '#3FA9A0'
      ctx.fill()
    })

    testPoints.forEach((p) => {
      ctx.beginPath()
      ctx.arc(p.x, p.y, 8, 0, Math.PI * 2)
      ctx.fillStyle = showTest ? '#D9614C' : '#9A9B90'
      ctx.fill()
    })

    // Подписи
    ctx.fillStyle = '#EDEAE2'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Жайлау (train)', w / 4, h - 5)
    ctx.fillText('Қыстау (test)', w * 3 / 4, h - 5)

    if (showTest) {
      ctx.fillStyle = '#D9614C'
      ctx.fillText('Модель нашла train, но провалила test!', w / 2, 15)
    }
  }, [width, height, showTest])

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4 mb-4">
        <Canvas width={width} height={height} onDraw={draw} className="rounded-lg" />
      </div>
      <button
        onClick={() => setShowTest(!showTest)}
        className="w-full px-4 py-3 rounded-lg bg-dala-water text-dala-bg font-medium min-h-[44px] hover:brightness-110 active:scale-[0.98] transition-all"
      >
        {showTest ? 'Жайлауға қайту' : 'Қыстауды тексеру'}
      </button>
      <p className="mt-4 text-sm text-dala-muted">
        {showTest 
          ? '❌ Модель жайлауды жақсы біледі, бірақ қыстауда нашар жұмыс істейді'
          : '✅ Жайлауда үйрен, қыстауда тексер — бұл generalization'
        }
      </p>
    </div>
  )
}
