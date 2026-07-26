'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { Canvas } from './_shared/Canvas'
import { Slider } from './_shared/Slider'

interface AryqGradientProps {
  initialSlope?: number
  initialRate?: number
  width?: number
  height?: number
}

export function AryqGradient({
  initialSlope = 0.5,
  initialRate = 0.1,
  width = 340,
  height = 280,
}: AryqGradientProps) {
  const [slope, setSlope] = useState(initialSlope)
  const [rate, setRate] = useState(initialRate)
  const [scenario, setScenario] = useState<'converge' | 'stuck' | 'diverge'>('converge')
  const animationRef = useRef<number>()
  const waterPosRef = useRef(0.5)
  const [waterPos, setWaterPos] = useState(0.5)

  // Определяем сценарий на основе параметров
  useEffect(() => {
    if (rate > 0.8) {
      setScenario('diverge')
    } else if (slope < 0.2 && rate < 0.3) {
      setScenario('stuck')
    } else {
      setScenario('converge')
    }
  }, [slope, rate])

  // Анимация воды
  useEffect(() => {
    let lastTime = performance.now()
    
    const animate = (time: number) => {
      const dt = (time - lastTime) / 1000
      lastTime = time

      // Симуляция градиентного спуска
      const gradient = (waterPosRef.current - 0.5) * slope * 4
      let newPos = waterPosRef.current - gradient * rate * dt * 2

      // Добавляем шум для визуализации
      if (scenario === 'diverge') {
        newPos += (Math.random() - 0.5) * rate * 0.1
      }

      // Ограничиваем
      newPos = Math.max(0.1, Math.min(0.9, newPos))
      
      waterPosRef.current = newPos
      setWaterPos(newPos)

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [slope, rate, scenario])

  // Рисуем метафору (арык с водой)
  const drawMetaphor = useCallback((ctx: CanvasRenderingContext2D, dpr: number) => {
    const w = width
    const h = height / 2 - 10

    // Фон — земля
    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(0, 0, w, h)

    // Рельеф (парабола)
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 2) {
      const nx = x / w
      const y = h * (0.8 - slope * 4 * (nx - 0.5) ** 2)
      ctx.lineTo(x, y)
    }
    ctx.lineTo(w, h)
    ctx.closePath()
    ctx.fillStyle = '#2a2d24'
    ctx.fill()

    // Контур рельефа
    ctx.beginPath()
    ctx.moveTo(0, h)
    for (let x = 0; x <= w; x += 2) {
      const nx = x / w
      const y = h * (0.8 - slope * 4 * (nx - 0.5) ** 2)
      ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#D9A441'
    ctx.lineWidth = 2
    ctx.stroke()

    // Вода (круг)
    const waterX = waterPos * w
    const waterY = h * (0.8 - slope * 4 * (waterPos - 0.5) ** 2) - 8

    // Тень воды
    ctx.beginPath()
    ctx.ellipse(waterX, waterY + 4, 12, 4, 0, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0,0,0,0.3)'
    ctx.fill()

    // Вода
    ctx.beginPath()
    ctx.arc(waterX, waterY, 10, 0, Math.PI * 2)
    ctx.fillStyle = '#3FA9A0'
    ctx.fill()
    ctx.strokeStyle = '#5FC9C0'
    ctx.lineWidth = 2
    ctx.stroke()

    // Блик
    ctx.beginPath()
    ctx.arc(waterX - 3, waterY - 3, 3, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(255,255,255,0.4)'
    ctx.fill()

    // Подпись
    ctx.fillStyle = '#9A9B90'
    ctx.font = '12px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('Арық (метафора)', w / 2, h - 8)
  }, [width, height, slope, waterPos])

  // Рисуем науку (график потерь)
  const drawScience = useCallback((ctx: CanvasRenderingContext2D, dpr: number) => {
    const w = width
    const h = height / 2 - 10
    const padding = 30

    // Фон
    ctx.fillStyle = '#1B1E17'
    ctx.fillRect(0, 0, w, h)

    // Оси
    ctx.strokeStyle = '#9A9B90'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(padding, h - padding)
    ctx.lineTo(w - padding, h - padding)
    ctx.moveTo(padding, h - padding)
    ctx.lineTo(padding, padding)
    ctx.stroke()

    // Подписи осей
    ctx.fillStyle = '#9A9B90'
    ctx.font = '10px system-ui'
    ctx.textAlign = 'center'
    ctx.fillText('параметр', w / 2, h - 5)
    ctx.save()
    ctx.translate(10, h / 2)
    ctx.rotate(-Math.PI / 2)
    ctx.fillText('қателік', 0, 0)
    ctx.restore()

    // Кривая потерь (парабола)
    ctx.beginPath()
    ctx.strokeStyle = '#D9A441'
    ctx.lineWidth = 2
    for (let x = padding; x <= w - padding; x += 2) {
      const nx = (x - padding) / (w - 2 * padding)
      const loss = (nx - 0.5) ** 2 * 4
      const y = h - padding - loss * (h - 2 * padding) * 0.8
      if (x === padding) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()

    // Точка текущей позиции
    const pointX = padding + waterPos * (w - 2 * padding)
    const loss = (waterPos - 0.5) ** 2 * 4
    const pointY = h - padding - loss * (h - 2 * padding) * 0.8

    // Точка
    ctx.beginPath()
    ctx.arc(pointX, pointY, 6, 0, Math.PI * 2)
    ctx.fillStyle = '#3FA9A0'
    ctx.fill()
    ctx.strokeStyle = '#EDEAE2'
    ctx.lineWidth = 2
    ctx.stroke()

    // Статус
    ctx.fillStyle = scenario === 'converge' ? '#3FA9A0' : scenario === 'stuck' ? '#D9A441' : '#D9614C'
    ctx.font = '11px system-ui'
    ctx.textAlign = 'center'
    const statusText = scenario === 'converge' ? 'сходится' : scenario === 'stuck' ? 'застрял' : 'расходится'
    ctx.fillText(statusText, w / 2, 20)

    // Подпись
    ctx.fillStyle = '#9A9B90'
    ctx.font = '12px system-ui'
    ctx.fillText('Loss curve (наука)', w / 2, h - 8)
  }, [width, height, waterPos, scenario])

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Двухпанельный виджет */}
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4 mb-4">
        <div className="grid grid-cols-1 gap-4">
          {/* Метафора — Арык */}
          <div className="relative">
            <Canvas
              width={width}
              height={height / 2}
              onDraw={drawMetaphor}
              className="rounded-lg"
            />
          </div>
          
          {/* Наука — График */}
          <div className="relative">
            <Canvas
              width={width}
              height={height / 2}
              onDraw={drawScience}
              className="rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Управление */}
      <div className="bg-dala-surface rounded-xl border border-dala-gold/20 p-4 space-y-4">
        <Slider
          label="Үлкіндік (slope)"
          value={slope}
          min={0.1}
          max={1.0}
          step={0.05}
          onChange={setSlope}
          formatValue={(v) => v.toFixed(2)}
        />
        <Slider
          label="Оқу жылдамдығы (learning rate)"
          value={rate}
          min={0.01}
          max={1.2}
          step={0.01}
          onChange={setRate}
          formatValue={(v) => v.toFixed(2)}
        />
      </div>

      {/* Описание сценариев */}
      <div className="mt-4 text-sm text-dala-muted">
        {scenario === 'converge' && (
          <p>✅ <span className="text-dala-water">Сходится:</span> Су табанға жетті — модель үйреніп жатыр</p>
        )}
        {scenario === 'stuck' && (
          <p>⚠️ <span className="text-dala-gold">Застрял:</span> Су шұңқырда тұр — локалды минимум</p>
        )}
        {scenario === 'diverge' && (
          <p>❌ <span className="text-dala-alert">Расходится:</span> Су асып кетті — learning rate тым үлкен</p>
        )}
      </div>
    </div>
  )
}
