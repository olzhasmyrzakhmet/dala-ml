import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ServiceWorker } from '@/components/pwa/ServiceWorker'
import { OfflineIndicator } from '@/components/pwa/OfflineIndicator'

const inter = Inter({
  subsets: ['latin', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Дала ML — Машиналық оқуды үйрену',
  description: 'Қазақ тіліндегі бірінші машиналық оқу платформасы. Стептік метафоралар арқылы түсіну.',
  manifest: '/manifest.webmanifest',
  themeColor: '#12140F',
}

export const viewport: Viewport = {
  themeColor: '#12140F',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="kk">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="theme-color" content="#12140F" />
      </head>
      <body className={`${inter.variable} font-sans bg-dala-bg text-dala-text min-h-screen`}>
        <ServiceWorker />
        <OfflineIndicator />
        {children}
      </body>
    </html>
  )
}
