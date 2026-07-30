import type { SVGProps } from 'react'

/**
 * Один набор иконок: обводка 1.75, скруглённые концы, 24×24 viewBox.
 * Эмодзи в интерфейсе запрещены (CLAUDE.md §5), поэтому всё здесь.
 */
type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 20, ...props }: IconProps) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.75,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    focusable: false,
    ...props,
  }
}

export const IconCheck = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m4.5 12.5 5 5 10-11" />
  </svg>
)

export const IconClose = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
)

export const IconWarn = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.8 2.9 19.2h18.2L12 3.8Z" />
    <path d="M12 10v4" />
    <path d="M12 17h.01" />
  </svg>
)

export const IconReset = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3.5 12a8.5 8.5 0 1 1 2.6 6.1" />
    <path d="M3 6.5V12h5.5" />
  </svg>
)

export const IconPlay = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M8 5.5 18.5 12 8 18.5v-13Z" />
  </svg>
)

export const IconPause = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 5v14M15 5v14" />
  </svg>
)

export const IconArrowRight = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 12h15" />
    <path d="m13 6 6 6-6 6" />
  </svg>
)

export const IconArrowLeft = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M20 12H5" />
    <path d="m11 6-6 6 6 6" />
  </svg>
)

export const IconDownload = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5v11" />
    <path d="m7.5 10.5 4.5 4.5 4.5-4.5" />
    <path d="M4.5 19.5h15" />
  </svg>
)

export const IconBook = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H10a2.5 2.5 0 0 1 2 1 2.5 2.5 0 0 1 2-1h4.5A1.5 1.5 0 0 1 20 5.5v12a1.5 1.5 0 0 1-1.5 1.5H14a2.5 2.5 0 0 0-2 1 2.5 2.5 0 0 0-2-1H5.5A1.5 1.5 0 0 1 4 17.5Z" />
    <path d="M12 5v14" />
  </svg>
)

export const IconWater = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5c3.7 4.2 5.5 7.1 5.5 9.5a5.5 5.5 0 1 1-11 0c0-2.4 1.8-5.3 5.5-9.5Z" />
  </svg>
)

export const IconChart = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M4 4v16h16" />
    <path d="m7.5 14.5 3.5-4 3 2.5 4.5-6" />
  </svg>
)

export const IconWifiOff = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M3 3l18 18" />
    <path d="M8.2 15.2a5.5 5.5 0 0 1 7.6 0" />
    <path d="M4.8 11.4a10.5 10.5 0 0 1 4-2.5" />
    <path d="M19.2 11.4a10.5 10.5 0 0 0-6.6-2.9" />
    <path d="M12 19h.01" />
  </svg>
)

export const IconSearch = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m16 16 4 4" />
  </svg>
)

export const IconTeacher = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4Z" />
    <path d="M6.5 10.8v4.4c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.4" />
    <path d="M21.5 8.5V14" />
  </svg>
)

export const IconAward = (p: IconProps) => (
  <svg {...base(p)}>
    <circle cx="12" cy="9.5" r="5.5" />
    <path d="m8.5 14.5-1.5 6L12 18l4.5 2.5-1.5-6" />
  </svg>
)

export const IconSpark = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M12 3.5 13.8 9l5.7 1.8-5.7 1.8L12 18.3l-1.8-5.7L4.5 10.8 10.2 9 12 3.5Z" />
  </svg>
)

export const IconHand = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="M9 11.5V5.8a1.5 1.5 0 0 1 3 0v5" />
    <path d="M12 10.3V4.8a1.5 1.5 0 0 1 3 0v5.5" />
    <path d="M15 10.8V7.3a1.5 1.5 0 0 1 3 0v7.2a5.5 5.5 0 0 1-5.5 5.5h-1a5 5 0 0 1-3.7-1.7l-3-3.4a1.5 1.5 0 0 1 2.1-2.1L9 14.6" />
  </svg>
)

export const IconLayers = (p: IconProps) => (
  <svg {...base(p)}>
    <path d="m12 3.5 8.5 4.3L12 12 3.5 7.8 12 3.5Z" />
    <path d="m3.5 12.2 8.5 4.3 8.5-4.3" />
    <path d="m3.5 16.4 8.5 4.3 8.5-4.3" />
  </svg>
)
