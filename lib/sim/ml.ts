/**
 * Маленькая честная ML-библиотека для виджетов.
 * Всё считается по-настоящему: цифры на экране — результат вычисления,
 * а не подобранная «на глаз» анимация.
 */

/** Детерминированный ГПСЧ — картинка не должна дрожать между кадрами. */
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Нормальное распределение из равномерного (Бокс — Мюллер). */
export function gauss(rnd: () => number): number {
  let u = 0
  let v = 0
  while (u === 0) u = rnd()
  while (v === 0) v = rnd()
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
}

export function mean(xs: number[]): number {
  return xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0
}

export function mse(pred: number[], real: number[]): number {
  if (!pred.length) return 0
  let s = 0
  for (let i = 0; i < pred.length; i++) s += (pred[i] - real[i]) ** 2
  return s / pred.length
}

/* ------------------------------------------------------------------ */
/* Линейная алгебра: решение нормальных уравнений методом Гаусса        */
/* ------------------------------------------------------------------ */

export function solve(A: number[][], b: number[]): number[] {
  const n = b.length
  const M = A.map((row, i) => [...row, b[i]])

  for (let col = 0; col < n; col++) {
    let pivot = col
    for (let r = col + 1; r < n; r++) if (Math.abs(M[r][col]) > Math.abs(M[pivot][col])) pivot = r
    if (Math.abs(M[pivot][col]) < 1e-12) continue
    ;[M[col], M[pivot]] = [M[pivot], M[col]]
    const d = M[col][col]
    for (let c = col; c <= n; c++) M[col][c] /= d
    for (let r = 0; r < n; r++) {
      if (r === col) continue
      const f = M[r][col]
      if (f === 0) continue
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c]
    }
  }
  return M.map((row) => row[n])
}

/* ------------------------------------------------------------------ */
/* Полиномиальная регрессия                                            */
/* ------------------------------------------------------------------ */

/**
 * Подгонка полинома степени `degree` методом наименьших квадратов
 * с крошечным гребневым слагаемым — иначе при высоких степенях
 * матрица вырождается и коэффициенты улетают в бесконечность.
 * x ожидается уже приведённым к [-1, 1].
 */
export function polyFit(xs: number[], ys: number[], degree: number, ridge = 1e-7): number[] {
  const m = degree + 1
  const A: number[][] = Array.from({ length: m }, () => new Array<number>(m).fill(0))
  const b = new Array<number>(m).fill(0)

  for (let i = 0; i < xs.length; i++) {
    const p: number[] = [1]
    for (let d = 1; d < m; d++) p.push(p[d - 1] * xs[i])
    for (let r = 0; r < m; r++) {
      b[r] += p[r] * ys[i]
      for (let c = 0; c < m; c++) A[r][c] += p[r] * p[c]
    }
  }
  for (let r = 0; r < m; r++) A[r][r] += ridge * Math.max(1, xs.length)
  return solve(A, b)
}

export function polyEval(coef: number[], x: number): number {
  let y = 0
  for (let i = coef.length - 1; i >= 0; i--) y = y * x + coef[i]
  return y
}

/* ------------------------------------------------------------------ */
/* Логистическая регрессия с L2                                        */
/* ------------------------------------------------------------------ */

export function sigmoid(z: number): number {
  return z >= 0 ? 1 / (1 + Math.exp(-z)) : Math.exp(z) / (1 + Math.exp(z))
}

/**
 * Логистическая регрессия, обучаемая полным градиентным спуском.
 * `lambda` — сила L2-регуляризации: чем больше, тем «спокойнее» граница.
 */
export function logregFit(
  X: number[][],
  y: number[],
  { lambda = 0.01, rate = 0.5, steps = 400 } = {}
): number[] {
  const dim = X[0]?.length ?? 0
  const w = new Array<number>(dim + 1).fill(0)
  const n = X.length
  if (n === 0) return w

  for (let it = 0; it < steps; it++) {
    const g = new Array<number>(dim + 1).fill(0)
    for (let i = 0; i < n; i++) {
      let z = w[0]
      for (let d = 0; d < dim; d++) z += w[d + 1] * X[i][d]
      const err = sigmoid(z) - y[i]
      g[0] += err
      for (let d = 0; d < dim; d++) g[d + 1] += err * X[i][d]
    }
    // Затухание весов применяем мультипликативно и с потолком:
    // при rate·lambda > 1 обычное вычитание переворачивает знак веса
    // и модель разносит до бесконечности.
    const decay = Math.min(0.5, rate * lambda)
    w[0] -= (rate * g[0]) / n
    for (let d = 0; d < dim; d++) {
      w[d + 1] = w[d + 1] * (1 - decay) - (rate * g[d + 1]) / n
    }
  }
  return w
}

/**
 * Логистическая регрессия методом Ньютона (IRLS).
 *
 * Полный градиентный спуск требовал больше тысячи проходов по выборке —
 * на дешёвом Android это давало заметный фриз при каждом тапе. Ньютон сходится
 * за десяток итераций, потому что использует вторую производную.
 * Размерность здесь маленькая (≤6), обращение матрицы стоит копейки.
 */
export function logregFitNewton(
  X: number[][],
  y: number[],
  { lambda = 0.01, steps = 12, tol = 1e-8 } = {}
): number[] {
  const n = X.length
  const dim = X[0]?.length ?? 0
  const m = dim + 1
  let w = new Array<number>(m).fill(0)
  if (n === 0) return w

  for (let it = 0; it < steps; it++) {
    const H: number[][] = Array.from({ length: m }, () => new Array<number>(m).fill(0))
    const g = new Array<number>(m).fill(0)

    for (let i = 0; i < n; i++) {
      const row = X[i]
      let z = w[0]
      for (let d = 0; d < dim; d++) z += w[d + 1] * row[d]
      const p = sigmoid(z)
      const s = Math.max(p * (1 - p), 1e-6) // вырожденный вес ломает матрицу
      const err = y[i] - p

      g[0] += err
      for (let d = 0; d < dim; d++) g[d + 1] += err * row[d]

      // H = Xᵀ·W·X, где столбец 0 — свободный член
      H[0][0] += s
      for (let a = 0; a < dim; a++) {
        H[0][a + 1] += s * row[a]
        H[a + 1][0] += s * row[a]
        for (let b = 0; b < dim; b++) H[a + 1][b + 1] += s * row[a] * row[b]
      }
    }

    // L2 применяется к весам, но не к свободному члену.
    for (let d = 0; d < dim; d++) {
      g[d + 1] -= lambda * n * w[d + 1]
      H[d + 1][d + 1] += lambda * n
    }
    H[0][0] += 1e-6

    const step = solve(H, g)
    if (step.some((v) => !Number.isFinite(v))) break

    const next = w.map((v, i) => v + step[i])
    if (next.some((v) => !Number.isFinite(v))) break
    const moved = step.reduce((s2, v) => s2 + Math.abs(v), 0)
    w = next
    if (moved < tol) break
  }
  return w
}

export function logregPredict(w: number[], x: number[]): number {
  let z = w[0]
  for (let d = 0; d < x.length; d++) z += w[d + 1] * x[d]
  return sigmoid(z)
}

export function accuracy(w: number[], X: number[][], y: number[]): number {
  if (!X.length) return 0
  let ok = 0
  for (let i = 0; i < X.length; i++) if ((logregPredict(w, X[i]) >= 0.5 ? 1 : 0) === y[i]) ok++
  return ok / X.length
}

/* ------------------------------------------------------------------ */
/* Крошечная нейросеть: 2 → скрытые слои (tanh) → 1 (сигмоида)         */
/* ------------------------------------------------------------------ */

export interface Net {
  sizes: number[]
  W: number[][][]
  b: number[][]
}

export function makeNet(hidden: number[], seed = 3): Net {
  const sizes = [2, ...hidden, 1]
  const rnd = rng(seed)
  const W: number[][][] = []
  const b: number[][] = []
  for (let l = 1; l < sizes.length; l++) {
    const scale = Math.sqrt(2 / sizes[l - 1])
    W.push(Array.from({ length: sizes[l] }, () => Array.from({ length: sizes[l - 1] }, () => gauss(rnd) * scale)))
    b.push(new Array<number>(sizes[l]).fill(0))
  }
  return { sizes, W, b }
}

export function forward(net: Net, input: number[]): { acts: number[][]; out: number } {
  const acts: number[][] = [input]
  let a = input
  for (let l = 0; l < net.W.length; l++) {
    const last = l === net.W.length - 1
    const z = net.W[l].map((row, i) => row.reduce((s, wij, j) => s + wij * a[j], net.b[l][i]))
    a = last ? z.map(sigmoid) : z.map(Math.tanh)
    acts.push(a)
  }
  return { acts, out: a[0] }
}

/** Один шаг обучения по всей выборке (обратное распространение). */
export function trainStep(net: Net, X: number[][], y: number[], rate: number): number {
  const L = net.W.length
  const gW = net.W.map((m) => m.map((r) => r.map(() => 0)))
  const gb = net.b.map((v) => v.map(() => 0))
  let lossSum = 0

  for (let n = 0; n < X.length; n++) {
    const { acts, out } = forward(net, X[n])
    const p = Math.min(1 - 1e-7, Math.max(1e-7, out))
    lossSum += -(y[n] * Math.log(p) + (1 - y[n]) * Math.log(1 - p))

    // delta последнего слоя для сигмоиды + бинарной кросс-энтропии
    let delta = [out - y[n]]
    for (let l = L - 1; l >= 0; l--) {
      const aPrev = acts[l]
      for (let i = 0; i < net.W[l].length; i++) {
        gb[l][i] += delta[i]
        for (let j = 0; j < aPrev.length; j++) gW[l][i][j] += delta[i] * aPrev[j]
      }
      if (l > 0) {
        const next = new Array<number>(aPrev.length).fill(0)
        for (let j = 0; j < aPrev.length; j++) {
          let s = 0
          for (let i = 0; i < net.W[l].length; i++) s += net.W[l][i][j] * delta[i]
          next[j] = s * (1 - aPrev[j] * aPrev[j]) // производная tanh
        }
        delta = next
      }
    }
  }

  const k = rate / Math.max(1, X.length)
  for (let l = 0; l < L; l++) {
    for (let i = 0; i < net.W[l].length; i++) {
      net.b[l][i] -= k * gb[l][i]
      for (let j = 0; j < net.W[l][i].length; j++) net.W[l][i][j] -= k * gW[l][i][j]
    }
  }
  return lossSum / Math.max(1, X.length)
}

export function netAccuracy(net: Net, X: number[][], y: number[]): number {
  if (!X.length) return 0
  let ok = 0
  for (let i = 0; i < X.length; i++) if ((forward(net, X[i]).out >= 0.5 ? 1 : 0) === y[i]) ok++
  return ok / X.length
}
