import type { Metadata, Viewport } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { ServiceWorker } from '@/components/pwa/ServiceWorker'
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator'

// cyrillic-ext обязателен: без него ә ғ қ ң ө ұ ү һ і подменяются или падают в квадраты.
const inter = Inter({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-inter',
})

const mono = JetBrains_Mono({
  subsets: ['latin', 'cyrillic', 'cyrillic-ext'],
  display: 'swap',
  weight: ['400', '500'],
  variable: '--font-mono',
})

export const metadata: Metadata = {
  title: 'Дала ML — машиналық оқуды қазақша үйрен',
  description:
    'Қазақ тіліндегі машиналық оқу курсы. Әр ұғым — дала метафорасы және қолмен сүйрейтін интерактив. Тіркеусіз, офлайн жұмыс істейді.',
  manifest: '/manifest.webmanifest',
  applicationName: 'Дала ML',
  appleWebApp: { capable: true, title: 'Дала ML', statusBarStyle: 'black-translucent' },
  formatDetection: { telephone: false },
}

export const viewport: Viewport = {
  themeColor: '#12140F',
  width: 'device-width',
  initialScale: 1,
  // Зум не отключаем: это требование доступности.
  maximumScale: 5,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="kk" className={`${inter.variable} ${mono.variable}`}>
      <body className="min-h-dvh bg-dala-bg font-sans text-dala-text antialiased">
        <ServiceWorker />
        <OfflineIndicator />
        {children}
      </body>
    </html>
  )
}
