'use client'

import { useCallback, useRef, useState, useEffect } from 'react'

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  onChange: (value: number) => void
  label?: string
  showValue?: boolean
  formatValue?: (v: number) => string
}

export function Slider({
  value,
  min,
  max,
  step = 0.01,
  onChange,
  label,
  showValue = true,
  formatValue = (v) => v.toFixed(2),
}: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const percentage = ((value - min) / (max - min)) * 100

  const handleInteraction = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return
      const rect = trackRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      const pct = Math.max(0, Math.min(1, x / rect.width))
      const newValue = min + pct * (max - min)
      const steppedValue = Math.round(newValue / step) * step
      onChange(Math.max(min, Math.min(max, steppedValue)))
    },
    [min, max, step, onChange]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    handleInteraction(e.clientX)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    handleInteraction(e.touches[0].clientX)
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => handleInteraction(e.clientX)
    const handleTouchMove = (e: TouchEvent) => handleInteraction(e.touches[0].clientX)
    const handleEnd = () => setIsDragging(false)

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleTouchMove)
    window.addEventListener('touchend', handleEnd)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, handleInteraction])

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between mb-2">
          <label className="text-sm text-dala-muted">{label}</label>
          {showValue && (
            <span className="text-sm text-dala-water font-mono">
              {formatValue(value)}
            </span>
          )}
        </div>
      )}
      <div
        ref={trackRef}
        className="relative h-6 cursor-pointer touch-none"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        {/* Track */}
        <div className="absolute top-1/2 -translate-y-1/2 w-full h-1.5 bg-dala-surface rounded-full" />
        {/* Filled track */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 bg-dala-water rounded-full"
          style={{ width: `${percentage}%` }}
        />
        {/* Thumb - 44px touch target */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-11 h-11 flex items-center justify-center"
          style={{ left: `${percentage}%` }}
        >
          <div
            className={`w-6 h-6 bg-dala-water rounded-full shadow-lg transition-transform ${
              isDragging ? 'scale-110' : ''
            }`}
          />
        </div>
      </div>
    </div>
  )
}
