import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin', 'cyrillic-ext'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Дала ML — Машиналық оқуды үйрену',
  description: 'Қазақ тіліндегі бірінші машиналық оқу платформасы. Стептік метафоралар арқылы түсіну.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="kk">
      <body className={`${inter.variable} font-sans bg-dala-bg text-dala-text min-h-screen`}>
        {children}
      </body>
    </html>
  )
}
