/**
 * Генераторы данных для виджетов. Всё детерминировано по seed,
 * чтобы картинка не дрожала между кадрами и тесты были воспроизводимы.
 */

import { gauss, rng } from './ml'

export interface XY {
  x: number
  y: number
}

/** Истинная закономерность, которую модель должна найти. x ∈ [-1, 1]. */
export function trueCurve(x: number): number {
  return 0.75 * Math.sin(2.6 * x) - 0.15 * x
}

export function sampleCurve(n: number, noise: number, seed: number): XY[] {
  const rnd = rng(seed)
  const out: XY[] = []
  for (let i = 0; i < n; i++) {
    const x = -1 + (2 * i) / Math.max(1, n - 1)
    out.push({ x, y: trueCurve(x) + gauss(rnd) * noise })
  }
  return out
}

/** Случайные (не равномерные) точки — для кривых обучения. */
export function sampleCurveRandom(n: number, noise: number, seed: number): XY[] {
  const rnd = rng(seed)
  const out: XY[] = []
  for (let i = 0; i < n; i++) {
    const x = -1 + 2 * rnd()
    out.push({ x, y: trueCurve(x) + gauss(rnd) * noise })
  }
  return out.sort((a, b) => a.x - b.x)
}

/** Прямая с шумом — для «дала желі». */
export function sampleLine(n: number, noise: number, seed: number, slope = 0.85, intercept = -0.05): XY[] {
  const rnd = rng(seed)
  const out: XY[] = []
  for (let i = 0; i < n; i++) {
    const x = -1 + (2 * i) / Math.max(1, n - 1)
    out.push({ x, y: intercept + slope * x + gauss(rnd) * noise })
  }
  return out
}

/** Два кольца: линейно неразделимы, нужна хотя бы одна скрытая прослойка. */
export function sampleRings(n: number, noise: number, seed: number): { X: number[][]; y: number[] } {
  const rnd = rng(seed)
  const X: number[][] = []
  const y: number[] = []
  for (let i = 0; i < n; i++) {
    const inner = i % 2 === 0
    const r = (inner ? 0.28 : 0.72) + gauss(rnd) * noise * 0.18
    const a = rnd() * Math.PI * 2
    X.push([Math.cos(a) * r, Math.sin(a) * r])
    y.push(inner ? 1 : 0)
  }
  return { X, y }
}

/**
 * Погодные «приметы». Каждая примета связана с дождём по-разному:
 * облака решают почти всё, поведение скота помогает заметно,
 * а «птица пролетела» — чистое суеверие и не помогает вовсе.
 */
export const PRIMETA_KEYS = ['bult', 'zhel', 'mal', 'shop', 'qus'] as const
export type PrimetaKey = (typeof PRIMETA_KEYS)[number]

/** Вес приметы в истинной модели дождя. */
export const PRIMETA_WEIGHT: Record<PrimetaKey, number> = {
  bult: 2.6, // бұлт — облачность
  zhel: 1.1, // жел — ветер
  mal: 1.6, // мал — поведение скота
  shop: 0.5, // шөп — влага в траве
  qus: 0.0, // құс — суеверие, не работает
}

export function sampleWeather(n: number, seed: number): { X: Record<PrimetaKey, number>[]; y: number[] } {
  const rnd = rng(seed)
  const X: Record<PrimetaKey, number>[] = []
  const y: number[] = []
  for (let i = 0; i < n; i++) {
    const row = {
      bult: rnd() * 2 - 1,
      zhel: rnd() * 2 - 1,
      mal: rnd() * 2 - 1,
      shop: rnd() * 2 - 1,
      qus: rnd() * 2 - 1,
    }
    // Скот реагирует на облака — примета работает, но частично дублирует бұлт.
    row.mal = 0.55 * row.bult + 0.45 * row.mal
    let z = -0.15
    for (const k of PRIMETA_KEYS) z += PRIMETA_WEIGHT[k] * row[k]
    const p = 1 / (1 + Math.exp(-z))
    X.push(row)
    y.push(rnd() < p ? 1 : 0)
  }
  return { X, y }
}
