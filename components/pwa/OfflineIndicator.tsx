'use client'

import { useEffect, useState } from 'react'
import { IconWifiOff } from '@/components/ui/icons'

export function OfflineIndicator() {
  const [offline, setOffline] = useState(false)

  useEffect(() => {
    const sync = () => setOffline(!navigator.onLine)
    sync()
    window.addEventListener('offline', sync)
    window.addEventListener('online', sync)
    return () => {
      window.removeEventListener('offline', sync)
      window.removeEventListener('online', sync)
    }
  }, [])

  if (!offline) return null

  return (
    <div
      role="status"
      className="dala-rise fixed inset-x-0 bottom-0 z-[100] flex items-center justify-center gap-2 bg-dala-gold px-4 py-2 text-sm font-medium text-dala-bg"
    >
      <IconWifiOff size={16} />
      Интернет жоқ — жүктелген модульдер жұмыс істейді
    </div>
  )
}
