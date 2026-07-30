'use client'

import { useEffect } from 'react'

export function ServiceWorker() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    // Регистрируем после загрузки: SW не должен конкурировать за первый экран.
    const register = () => {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Приватный режим или http — приложение работает и без офлайна.
      })
    }
    if (document.readyState === 'complete') register()
    else window.addEventListener('load', register, { once: true })
  }, [])

  return null
}
