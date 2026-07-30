/**
 * Палитра для canvas-виджетов.
 * Источник истины — docs/DESIGN.md §2. Никаких «сырых» хексов в компонентах.
 */

export const P = {
  bg: '#12140F',
  surface: '#1B1E17',
  surfaceUp: '#22261C',
  text: '#EDEAE2',
  muted: '#9A9B90',
  gold: '#D9A441',
  water: '#3FA9A0',
  alert: '#D9614C',

  // Производные для рельефа и неба
  ground: '#2A2E23',
  groundDeep: '#191C15',
  skyTop: '#171B14',
  skyBottom: '#1E2318',
  grid: 'rgba(154, 155, 144, 0.14)',
  gridStrong: 'rgba(154, 155, 144, 0.28)',
} as const

/** Золото/вода/тревога с произвольной альфой. */
export const alpha = {
  gold: (a: number) => `rgba(217, 164, 65, ${a})`,
  water: (a: number) => `rgba(63, 169, 160, ${a})`,
  alert: (a: number) => `rgba(217, 97, 76, ${a})`,
  text: (a: number) => `rgba(237, 234, 226, ${a})`,
  muted: (a: number) => `rgba(154, 155, 144, ${a})`,
  black: (a: number) => `rgba(0, 0, 0, ${a})`,
}

export type StatusTone = 'ok' | 'warn' | 'bad'

export const toneColor: Record<StatusTone, string> = {
  ok: P.water,
  warn: P.gold,
  bad: P.alert,
}

export const toneAlpha: Record<StatusTone, (a: number) => string> = {
  ok: alpha.water,
  warn: alpha.gold,
  bad: alpha.alert,
}
