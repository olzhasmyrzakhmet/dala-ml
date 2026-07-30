import type { Metadata } from 'next'
import { DevTool } from '../DevTool'

/**
 * Служебная витрина восьми интерактивов.
 * На проде закрыта: robots noindex здесь + редирект `/dev/*` → `/` в vercel.json
 * + Disallow в app/robots.ts. Локально доступна всегда.
 */
export const metadata: Metadata = {
  title: '/dev/widgets',
  robots: { index: false, follow: false, nocache: true },
}

export default function Page() {
  return <DevTool tool="widgets" />
}
