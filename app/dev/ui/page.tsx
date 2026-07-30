import type { Metadata } from 'next'
import { DevTool } from '../DevTool'

/** Служебная страница примитивов. На проде закрыта — см. app/dev/widgets/page.tsx. */
export const metadata: Metadata = {
  title: '/dev/ui',
  robots: { index: false, follow: false, nocache: true },
}

export default function Page() {
  return <DevTool tool="ui" />
}
