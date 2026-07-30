/**
 * Расчёты для остальных семи виджетов.
 * Каждая функция чистая и покрыта тестами: цифры на экране — результат
 * настоящей подгонки модели, а не подобранная анимация.
 */

import {
  PRIMETA_KEYS,
  type PrimetaKey,
  type XY,
  sampleCurve,
  sampleCurveRandom,
  sampleLine,
  sampleWeather,
} from './datasets'
import { accuracy, logregFitNewton, mse, polyEval, polyFit, solve } from './ml'

/* ================================================================== */
/* OverfitField — переобучение                                        */
/* ================================================================== */

export const MAX_DEGREE = 12
const OVERFIT_TRAIN = 16
const OVERFIT_TEST = 120

export interface OverfitResult {
  train: XY[]
  test: XY[]
  coef: number[]
  trainError: number
  testError: number
  /** Ошибки по всем степеням — для графика двух кривых. */
  curveTrain: number[]
  curveTest: number[]
  /** Степень с минимальной тестовой ошибкой — точка перелома. */
  bestDegree: number
}

/**
 * Кэш кривых по уровню шума. Обе кривые (12 подгонок) не зависят от положения
 * ползунка сложности, а пересчитывались на каждое его движение — это была
 * основная стоимость кадра при перетаскивании.
 */
const overfitCache = new Map<string, Omit<OverfitResult, 'coef' | 'trainError' | 'testError'>>()

export function overfit(degree: number, noise: number, seed = 11): OverfitResult {
  const train = sampleCurve(OVERFIT_TRAIN, noise, seed)
  const test = sampleCurve(OVERFIT_TEST, noise, seed + 977)

  const fitFor = (d: number) => {
    const c = polyFit(
      train.map((p) => p.x),
      train.map((p) => p.y),
      Math.min(d, OVERFIT_TRAIN - 1)
    )
    return {
      c,
      tr: mse(train.map((p) => polyEval(c, p.x)), train.map((p) => p.y)),
      te: mse(test.map((p) => polyEval(c, p.x)), test.map((p) => p.y)),
    }
  }

  const key = `${noise}|${seed}`
  let curves = overfitCache.get(key)
  if (!curves) {
    const curveTrain: number[] = []
    const curveTest: number[] = []
    for (let d = 1; d <= MAX_DEGREE; d++) {
      const r = fitFor(d)
      curveTrain.push(r.tr)
      curveTest.push(r.te)
    }
    curves = {
      train,
      test,
      curveTrain,
      curveTest,
      bestDegree: curveTest.indexOf(Math.min(...curveTest)) + 1,
    }
    overfitCache.set(key, curves)
  }

  const now = fitFor(degree)
  return { ...curves, coef: now.c, trainError: now.tr, testError: now.te }
}

/* ================================================================== */
/* ZhailauQystau — сколько данных нужно, чтобы обобщать               */
/* ================================================================== */

export const ZHAILAU_MIN = 4
export const ZHAILAU_MAX = 40
const ZHAILAU_DEGREE = 4
/**
 * Заметный гребень. Без него подгонка по 5–8 случайным точкам даёт
 * коэффициенты в сотни: ошибка улетает до 500 и график становится нечитаемым.
 * Регуляризация — то, чем и в реальности лечат нехватку данных.
 */
const ZHAILAU_RIDGE = 2e-3

export interface ZhailauResult {
  train: XY[]
  test: XY[]
  coef: number[]
  trainError: number
  testError: number
  gap: number
  curveTrain: number[]
  curveTest: number[]
}

/** Кривая обучения зависит только от шума и seed — считаем её один раз. */
const zhailauCache = new Map<string, { curveTrain: number[]; curveTest: number[] }>()

export function zhailau(trainSize: number, noise = 0.16, seed = 5): ZhailauResult {
  const test = sampleCurveRandom(90, noise, seed + 4001)

  const fitFor = (n: number) => {
    const train = sampleCurveRandom(n, noise, seed)
    const c = polyFit(
      train.map((p) => p.x),
      train.map((p) => p.y),
      Math.min(ZHAILAU_DEGREE, Math.max(1, n - 1)),
      ZHAILAU_RIDGE
    )
    return {
      train,
      c,
      tr: mse(train.map((p) => polyEval(c, p.x)), train.map((p) => p.y)),
      te: mse(test.map((p) => polyEval(c, p.x)), test.map((p) => p.y)),
    }
  }

  const key = `${noise}|${seed}`
  let curves = zhailauCache.get(key)
  if (!curves) {
    const curveTrain: number[] = []
    const curveTest: number[] = []
    for (let n = ZHAILAU_MIN; n <= ZHAILAU_MAX; n++) {
      const r = fitFor(n)
      curveTrain.push(r.tr)
      curveTest.push(r.te)
    }
    curves = { curveTrain, curveTest }
    zhailauCache.set(key, curves)
  }
  const { curveTrain, curveTest } = curves

  const now = fitFor(trainSize)
  return {
    train: now.train,
    test,
    coef: now.c,
    trainError: now.tr,
    testError: now.te,
    gap: now.te - now.tr,
    curveTrain,
    curveTest,
  }
}

/* ================================================================== */
/* DalaZheliNoise — шум ломает оценку закономерности                  */
/* ================================================================== */

export const TRUE_SLOPE = 0.85
export const TRUE_INTERCEPT = -0.05

export interface ZheliResult {
  points: XY[]
  slope: number
  intercept: number
  slopeError: number
  residual: number
  r2: number
}

/** Обычный метод наименьших квадратов для прямой. */
export function fitLine(points: XY[]): { slope: number; intercept: number } {
  const n = points.length
  if (n < 2) return { slope: 0, intercept: 0 }
  let sx = 0
  let sy = 0
  let sxx = 0
  let sxy = 0
  for (const p of points) {
    sx += p.x
    sy += p.y
    sxx += p.x * p.x
    sxy += p.x * p.y
  }
  const den = n * sxx - sx * sx
  if (Math.abs(den) < 1e-12) return { slope: 0, intercept: sy / n }
  const slope = (n * sxy - sx * sy) / den
  return { slope, intercept: (sy - slope * sx) / n }
}

export function zheli(wind: number, count: number, seed = 23): ZheliResult {
  const points = sampleLine(count, wind, seed, TRUE_SLOPE, TRUE_INTERCEPT)
  const { slope, intercept } = fitLine(points)
  const pred = points.map((p) => intercept + slope * p.x)
  const ys = points.map((p) => p.y)
  const residual = mse(pred, ys)
  const my = ys.reduce((a, b) => a + b, 0) / Math.max(1, ys.length)
  const varY = mse(ys.map(() => my), ys)
  return {
    points,
    slope,
    intercept,
    slopeError: Math.abs(slope - TRUE_SLOPE),
    residual,
    r2: varY > 1e-9 ? Math.max(0, 1 - residual / varY) : 0,
  }
}

/* ================================================================== */
/* OtarBatch — размер батча и дрожание траектории                     */
/* ================================================================== */

export interface OtarState {
  w0: number
  w1: number
  path: { w0: number; w1: number }[]
  steps: number
  loss: number
}

const OTAR_N = 64
const otarData = sampleLine(OTAR_N, 0.22, 77, TRUE_SLOPE, TRUE_INTERCEPT)

export function otarInit(): OtarState {
  return { w0: -0.8, w1: -0.75, path: [{ w0: -0.8, w1: -0.75 }], steps: 0, loss: otarLoss(-0.8, -0.75) }
}

export function otarLoss(w0: number, w1: number): number {
  return mse(otarData.map((p) => w0 + w1 * p.x), otarData.map((p) => p.y))
}

/** Оптимум по всем данным — куда обучение обязано прийти. */
export const OTAR_BEST = fitLine(otarData)

/**
 * Один шаг стохастического градиентного спуска.
 * Батч выбирается случайно, поэтому чем он меньше, тем сильнее дрожит шаг —
 * это и есть весь смысл виджета, а не декоративный джиттер.
 */
export function otarStep(s: OtarState, batch: number, rate: number, rnd: () => number): OtarState {
  const b = Math.max(1, Math.min(OTAR_N, Math.round(batch)))
  let g0 = 0
  let g1 = 0
  for (let i = 0; i < b; i++) {
    const p = otarData[Math.floor(rnd() * OTAR_N) % OTAR_N]
    const err = s.w0 + s.w1 * p.x - p.y
    g0 += err
    g1 += err * p.x
  }
  s.w0 -= (rate * 2 * g0) / b
  s.w1 -= (rate * 2 * g1) / b
  s.steps += 1
  s.loss = otarLoss(s.w0, s.w1)
  s.path.push({ w0: s.w0, w1: s.w1 })
  if (s.path.length > 90) s.path.shift()
  return s
}

/** Средняя «дрожь» траектории за последние шаги — цифра под графиком. */
export function otarJitter(s: OtarState): number {
  if (s.path.length < 3) return 0
  let sum = 0
  for (let i = 1; i < s.path.length; i++) {
    sum += Math.hypot(s.path[i].w0 - s.path[i - 1].w0, s.path[i].w1 - s.path[i - 1].w1)
  }
  return sum / (s.path.length - 1)
}

/* ================================================================== */
/* TangbaClassify — граница решения и регуляризация                   */
/* ================================================================== */

export interface Brand {
  x: number
  y: number
  cls: 0 | 1
}

/** Квадратичные признаки: без них граница может быть только прямой. */
export function tangbaFeatures(x: number, y: number): number[] {
  return [x, y, x * x, y * y, x * y]
}

export interface TangbaResult {
  w: number[]
  accuracy: number
  /** Насколько граница «изогнута» — сумма квадратичных весов. */
  curviness: number
}

export function tangbaFit(brands: Brand[], lambda: number): TangbaResult {
  const both = new Set(brands.map((b) => b.cls))
  if (brands.length < 2 || both.size < 2) {
    return { w: new Array(6).fill(0), accuracy: 0, curviness: 0 }
  }
  const X = brands.map((b) => tangbaFeatures(b.x, b.y))
  const y = brands.map((b) => b.cls as number)
  const w = logregFitNewton(X, y, { lambda, steps: 14 })
  return {
    w,
    accuracy: accuracy(w, X, y),
    curviness: Math.abs(w[3]) + Math.abs(w[4]) + Math.abs(w[5]),
  }
}

export function tangbaScore(w: number[], x: number, y: number): number {
  const f = tangbaFeatures(x, y)
  let z = w[0]
  for (let i = 0; i < f.length; i++) z += w[i + 1] * f[i]
  return z
}

export const TANGBA_START: Brand[] = [
  { x: -0.55, y: 0.35, cls: 0 },
  { x: -0.32, y: 0.62, cls: 0 },
  { x: -0.68, y: -0.1, cls: 0 },
  { x: -0.15, y: -0.5, cls: 0 },
  { x: 0.52, y: -0.32, cls: 1 },
  { x: 0.28, y: 0.15, cls: 1 },
  { x: 0.66, y: 0.42, cls: 1 },
  { x: 0.18, y: -0.68, cls: 1 },
]

/* ================================================================== */
/* FeaturePrimeta — какие признаки реально помогают                   */
/* ================================================================== */

const PRIMETA_TRAIN = sampleWeather(600, 31)
const PRIMETA_TEST = sampleWeather(600, 8123)
/** Каждый набор примет считается один раз: перебор идёт на каждый тап. */
const primetaCache = new Map<string, number>()

export interface PrimetaResult {
  accuracy: number
  baseline: number
  /** Прирост точности от каждой приметы, если добавить её к выбранным. */
  gains: Record<PrimetaKey, number>
}

function accFor(keys: PrimetaKey[]): number {
  const cacheKey = PRIMETA_KEYS.filter((k) => keys.includes(k)).join(',')
  const hit = primetaCache.get(cacheKey)
  if (hit !== undefined) return hit

  let acc: number
  if (keys.length === 0) {
    // Без признаков остаётся только угадывать самый частый ответ.
    const ones = PRIMETA_TEST.y.filter((v) => v === 1).length
    acc = Math.max(ones, PRIMETA_TEST.y.length - ones) / PRIMETA_TEST.y.length
  } else {
    const X = PRIMETA_TRAIN.X.map((r) => keys.map((k) => r[k]))
    const w = logregFitNewton(X, PRIMETA_TRAIN.y, { lambda: 0.004, steps: 12 })
    acc = accuracy(
      w,
      PRIMETA_TEST.X.map((r) => keys.map((k) => r[k])),
      PRIMETA_TEST.y
    )
  }
  primetaCache.set(cacheKey, acc)
  return acc
}

export function primeta(selected: PrimetaKey[]): PrimetaResult {
  const acc = accFor(selected)
  const gains = {} as Record<PrimetaKey, number>
  for (const k of PRIMETA_KEYS) {
    if (selected.includes(k)) {
      gains[k] = acc - accFor(selected.filter((s) => s !== k))
    } else {
      gains[k] = accFor([...selected, k]) - acc
    }
  }
  return { accuracy: acc, baseline: accFor([]), gains }
}

/* ================================================================== */
/* KiizUiLayers — вспомогательное                                     */
/* ================================================================== */

/** Число обучаемых параметров сети 2 → hidden… → 1. */
export function netParams(hidden: number[]): number {
  const sizes = [2, ...hidden, 1]
  let n = 0
  for (let i = 1; i < sizes.length; i++) n += sizes[i - 1] * sizes[i] + sizes[i]
  return n
}

export { solve }
