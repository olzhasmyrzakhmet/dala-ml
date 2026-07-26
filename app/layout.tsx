import type { Metadata } from 'next'
import './globals.css'

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
      <body className="bg-dala-bg text-dala-text min-h-screen">
        {children}
      </body>
    </html>
  )
}
