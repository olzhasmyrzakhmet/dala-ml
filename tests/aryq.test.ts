import { describe, it, expect } from 'vitest'
import {
  BARRIER_X,
  DIVERGE_LIMIT,
  GLOBAL_X,
  LOCAL_X,
  START_X,
  advance,
  curvature,
  gradientStep,
  initialDescent,
  loss,
  runDescent,
  shape,
  stableRateLimit,
} from '@/lib/sim/aryq'

/** Детерминированный генератор: тест не должен зависеть от удачи. */
const seeded = (seed = 7) => {
  let s = seed
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

describe('Арық: рельеф функции потерь', () => {
  it('обе ямы — настоящие минимумы', () => {
    for (const m of [LOCAL_X, GLOBAL_X]) {
      expect(shape(m)).toBeLessThan(shape(m - 0.12))
      expect(shape(m)).toBeLessThan(shape(m + 0.12))
      expect(curvature(m)).toBeGreaterThan(0)
    }
  })

  it('глобальный минимум глубже локального', () => {
    expect(shape(GLOBAL_X)).toBeLessThan(shape(LOCAL_X))
  })

  it('между ямами есть барьер — иначе застревать негде', () => {
    expect(shape(BARRIER_X)).toBeGreaterThan(shape(LOCAL_X))
    expect(shape(BARRIER_X)).toBeGreaterThan(shape(GLOBAL_X))
    expect(BARRIER_X).toBeGreaterThan(LOCAL_X)
    expect(BARRIER_X).toBeLessThan(GLOBAL_X)
  })

  it('локальная яма узкая, глобальная широкая — на этом держатся все три сценария', () => {
    expect(curvature(LOCAL_X)).toBeGreaterThan(curvature(GLOBAL_X))
    // Значит порог устойчивости шага для узкой ямы ниже:
    expect(stableRateLimit(LOCAL_X, 1)).toBeLessThan(stableRateLimit(GLOBAL_X, 1))
  })

  it('старт лежит на склоне, ведущем в локальную яму', () => {
    expect(START_X).toBeLessThan(LOCAL_X)
    expect(shape(START_X)).toBeGreaterThan(shape(LOCAL_X))
  })

  it('масштабирует потери уклоном', () => {
    expect(loss(0.2, 2)).toBeCloseTo(2 * shape(0.2), 10)
  })
})

describe('Арық: три сценария воспроизводятся ползунками', () => {
  it('малый шаг → застревает в локальном минимуме', () => {
    const r = runDescent(1.0, 0.08, { rnd: seeded() })
    expect(r.phase).toBe('stuck')
    expect(Math.abs(r.x - LOCAL_X)).toBeLessThan(0.2)
  })

  it('средний шаг → выпрыгивает и сходится к глобальному минимуму', () => {
    const r = runDescent(1.0, 0.35, { rnd: seeded() })
    expect(r.phase).toBe('converged')
    expect(Math.abs(r.x - GLOBAL_X)).toBeLessThan(0.35)
  })

  it('большой шаг → расходится', () => {
    const r = runDescent(1.0, 0.7, { rnd: seeded() })
    expect(r.phase).toBe('diverged')
  })

  it('значение по умолчанию на главной сходится', () => {
    expect(runDescent(1.0, 0.35, { rnd: seeded(11) }).phase).toBe('converged')
  })

  it('каждый уклон даёт все три исхода — ползунок всегда что-то меняет', () => {
    for (const s of [0.6, 0.8, 1.0, 1.2, 1.6, 2.0]) {
      const phases = new Set(
        [0.03, 0.06, 0.1, 0.15, 0.2, 0.25, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8].map(
          (lr) => runDescent(s, lr, { rnd: seeded() }).phase
        )
      )
      expect(phases.has('stuck'), `уклон ${s}: нет «застрял»`).toBe(true)
      expect(phases.has('converged'), `уклон ${s}: нет «сошёлся»`).toBe(true)
      expect(phases.has('diverged'), `уклон ${s}: нет «разошёлся»`).toBe(true)
    }
  })

  it('чем круче уклон, тем меньше допустимый шаг', () => {
    const firstDiverging = (s: number) => {
      for (let lr = 0.05; lr <= 1; lr += 0.05) {
        if (runDescent(s, +lr.toFixed(2), { rnd: seeded() }).phase === 'diverged') return lr
      }
      return Infinity
    }
    expect(firstDiverging(2.0)).toBeLessThan(firstDiverging(1.0))
    expect(firstDiverging(1.0)).toBeLessThan(firstDiverging(0.6))
  })
})

describe('Арық: пошаговая механика', () => {
  it('двигает параметр против градиента', () => {
    const next = gradientStep(START_X, 1, 0.1)
    expect(next).toBeGreaterThan(START_X) // градиент здесь отрицательный
  })

  it('шаг нулевой длины оставляет параметр на месте', () => {
    expect(gradientStep(0.3, 1, 0)).toBeCloseTo(0.3, 12)
  })

  it('состояние «разошёлся» фиксируется и не сбрасывается само', () => {
    const s = initialDescent()
    for (let i = 0; i < 400; i++) advance(s, 2.4, 0.9, 1e-6, seeded())
    expect(s.phase).toBe('diverged')
    const x = s.x
    advance(s, 2.4, 0.9, 1e-6, seeded())
    expect(s.x).toBe(x)
    expect(Math.abs(s.x)).toBeLessThanOrEqual(DIVERGE_LIMIT)
  })

  it('считает шаги', () => {
    const s = initialDescent()
    for (let i = 0; i < 5; i++) advance(s, 1, 0.05, 0, () => 0.5)
    expect(s.steps).toBe(5)
  })
})
