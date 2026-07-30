/**
 * Математика виджета «Арық» — чистые функции, без React и canvas.
 * Вынесено сюда, чтобы три сценария обучения проверялись тестами,
 * а не «на глаз в браузере».
 */

/** Видимый участок русла. */
export const X_MIN = -1.5
export const X_MAX = 1.6
export const START_X = -1.3
/** Дальше вода считается ушедшей в степь. */
export const DIVERGE_LIMIT = 2.2

/**
 * Рельеф русла:
 *   J(θ) = 0.30·θ⁴ − 1.00·exp(−((θ−0.95)/0.80)²) − 0.32·exp(−((θ+0.90)/0.26)²)
 *
 * · Четвёртая степень, а не вторая: кривизна растёт с удалением, поэтому
 *   слишком крупный шаг действительно уводит параметр в бесконечность.
 *   С параболой спуск всегда сползал бы в устойчивый предельный цикл,
 *   и «расходимость» пришлось бы рисовать, а не получать честно.
 * · Узкая мелкая яма при θ ≈ −0.82 (кривизна ≈ 9) — локальный минимум.
 * · Широкая глубокая при θ ≈ +0.77 (кривизна ≈ 4.8) — глобальный минимум.
 *
 * Градиентный спуск неустойчив при lr·s > 2/кривизна, и кривизна узкой ямы
 * больше — поэтому из неё выпрыгиваешь раньше, чем ломается глубокая.
 * Это и даёт окно «шаг достаточно большой, чтобы выбраться, но не сломать».
 */
export function shape(x: number): number {
  return (
    0.3 * x ** 4 -
    1.0 * Math.exp(-(((x - 0.95) / 0.8) ** 2)) -
    0.32 * Math.exp(-(((x + 0.9) / 0.26) ** 2))
  )
}

/** Центральная разность: точности с избытком, а ошибиться в формуле негде. */
export function dShape(x: number, h = 1e-4): number {
  return (shape(x + h) - shape(x - h)) / (2 * h)
}

/** Кривизна рельефа — она и определяет предельный шаг обучения. */
export function curvature(x: number, h = 1e-3): number {
  return (shape(x + h) - 2 * shape(x) + shape(x - h)) / (h * h)
}

export function loss(x: number, slope: number): number {
  return slope * shape(x)
}

export function gradient(x: number, slope: number): number {
  return slope * dShape(x)
}

/** Один шаг градиентного спуска: θ ← θ − α·∇J(θ). */
export function gradientStep(x: number, slope: number, rate: number, dither = 0): number {
  return x - rate * gradient(x, slope) + dither
}

/** Ищет экстремум рельефа на отрезке — чтобы не хардкодить координаты. */
function findExtremum(from: number, to: number, sign: 1 | -1, samples = 1200): number {
  let best = from
  let bestV = Infinity
  for (let i = 0; i <= samples; i++) {
    const x = from + ((to - from) * i) / samples
    const v = sign * shape(x)
    if (v < bestV) {
      bestV = v
      best = x
    }
  }
  return best
}

export const LOCAL_X = findExtremum(-1.35, -0.6, 1)
export const GLOBAL_X = findExtremum(0.1, 1.4, 1)
export const BARRIER_X = findExtremum(LOCAL_X + 0.05, GLOBAL_X - 0.05, -1)

export type Phase = 'run' | 'converged' | 'stuck' | 'diverged'

/** Шаг, за которым спуск перестаёт быть спуском (порог устойчивости). */
export function stableRateLimit(x: number, slope: number): number {
  return 2 / (slope * Math.abs(curvature(x)))
}

interface DescentState {
  x: number
  steps: number
  phase: Phase
  calm: number
  /** Скользящая сумма модулей шага — по ней видно «болтанку». */
  churn: number
  restless: number
}

export function initialDescent(from = START_X): DescentState {
  return { x: from, steps: 0, phase: 'run', calm: 0, churn: 0, restless: 0 }
}

/**
 * Продвигает спуск на один шаг и переклассифицирует состояние.
 *
 * «Расходимость» — это не только вылет за берег. Шаг выше порога устойчивости
 * сначала даёт незатухающую болтанку с большой амплитудой: качественно это то
 * же самое — обучение не сходится. Ловим оба случая.
 */
export function advance(s: DescentState, slope: number, rate: number, dither = 1e-6, rnd = Math.random): DescentState {
  if (s.phase === 'diverged') return s

  const prev = s.x
  const next = gradientStep(s.x, slope, rate, (rnd() - 0.5) * dither)
  s.steps += 1

  if (!Number.isFinite(next) || Math.abs(next) > DIVERGE_LIMIT) {
    s.x = Math.sign(next || 1) * DIVERGE_LIMIT
    s.phase = 'diverged'
    return s
  }
  s.x = next

  const moved = Math.abs(next - prev)
  s.churn = s.churn * 0.9 + moved * 0.1
  s.calm = moved < 2e-3 ? s.calm + 1 : 0
  s.restless = s.churn > 0.22 ? s.restless + 1 : 0

  if (s.calm > 14) {
    s.phase = Math.abs(next - GLOBAL_X) < 0.35 ? 'converged' : 'stuck'
    // ~2.7 с болтанки при 22 шагах/с: переходный процесс успевает пройти,
    // а школьник не ждёт впустую, пока виджет признает расходимость.
  } else if (s.restless > 60) {
    s.phase = 'diverged'
  } else {
    s.phase = 'run'
  }
  return s
}

/** Прогоняет спуск до устойчивого исхода. Используется в тестах. */
export function runDescent(
  slope: number,
  rate: number,
  { maxSteps = 700, from = START_X, dither = 1e-6, rnd = Math.random } = {}
): { phase: Phase; x: number; steps: number } {
  const s = initialDescent(from)
  for (let i = 0; i < maxSteps; i++) {
    advance(s, slope, rate, dither, rnd)
    if (s.phase === 'converged' || s.phase === 'stuck' || s.phase === 'diverged') break
  }
  return { phase: s.phase, x: s.x, steps: s.steps }
}
