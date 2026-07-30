import { describe, it, expect } from 'vitest'
import {
  MAX_DEGREE,
  OTAR_BEST,
  TANGBA_START,
  TRUE_SLOPE,
  ZHAILAU_MAX,
  ZHAILAU_MIN,
  fitLine,
  netParams,
  otarInit,
  otarJitter,
  otarStep,
  overfit,
  primeta,
  tangbaFit,
  tangbaScore,
  zhailau,
  zheli,
} from '@/lib/sim/lessons'
import { PRIMETA_KEYS } from '@/lib/sim/datasets'
import { forward, makeNet, netAccuracy, polyEval, polyFit, rng, trainStep } from '@/lib/sim/ml'
import { sampleRings } from '@/lib/sim/datasets'

describe('Полиномиальная подгонка', () => {
  it('точно восстанавливает полином той же степени', () => {
    const xs = [-1, -0.5, 0, 0.5, 1]
    const ys = xs.map((x) => 2 - 3 * x + 4 * x * x)
    const c = polyFit(xs, ys, 2, 0)
    expect(c[0]).toBeCloseTo(2, 4)
    expect(c[1]).toBeCloseTo(-3, 4)
    expect(c[2]).toBeCloseTo(4, 4)
  })
})

describe('OverfitField: переобучение — настоящее', () => {
  const r = overfit(6, 0.22)

  it('ошибка на обучении падает с ростом сложности', () => {
    for (let i = 1; i < MAX_DEGREE; i++) {
      expect(r.curveTrain[i]).toBeLessThanOrEqual(r.curveTrain[i - 1] + 1e-6)
    }
  })

  it('ошибка на тесте сначала падает, потом растёт', () => {
    const best = r.bestDegree
    expect(best).toBeGreaterThan(1)
    expect(best).toBeLessThan(MAX_DEGREE)
    expect(r.curveTest[best - 1]).toBeLessThan(r.curveTest[0])
    expect(r.curveTest[MAX_DEGREE - 1]).toBeGreaterThan(r.curveTest[best - 1])
  })

  it('слишком сложная модель проходит через точки обучения почти точно', () => {
    const hard = overfit(MAX_DEGREE, 0.22)
    expect(hard.trainError).toBeLessThan(hard.testError)
  })

  it('без шума переобучаться нечем — разрыв мал', () => {
    const clean = overfit(MAX_DEGREE, 0)
    expect(clean.testError).toBeLessThan(0.05)
  })
})

describe('ZhailauQystau: больше данных — лучше обобщение', () => {
  it('тестовая ошибка при 40 овцах меньше, чем при 4', () => {
    const few = zhailau(ZHAILAU_MIN)
    const many = zhailau(ZHAILAU_MAX)
    expect(many.testError).toBeLessThan(few.testError)
  })

  it('разрыв между жайлау и қыстау сокращается', () => {
    expect(zhailau(ZHAILAU_MAX).gap).toBeLessThan(zhailau(6).gap)
  })

  it('кривая обучения имеет нужную длину', () => {
    expect(zhailau(10).curveTest).toHaveLength(ZHAILAU_MAX - ZHAILAU_MIN + 1)
  })
})

describe('DalaZheliNoise: ветер портит оценку', () => {
  it('без ветра прямая восстанавливается точно', () => {
    const r = zheli(0, 30)
    expect(r.slope).toBeCloseTo(TRUE_SLOPE, 6)
    expect(r.r2).toBeGreaterThan(0.99)
  })

  it('сильный ветер увеличивает ошибку наклона', () => {
    expect(zheli(0.7, 20).slopeError).toBeGreaterThan(zheli(0.05, 20).slopeError)
  })

  it('больше данных компенсирует ветер', () => {
    const small = zheli(0.5, 8).slopeError
    const big = zheli(0.5, 80).slopeError
    expect(big).toBeLessThan(small)
  })

  it('R² падает с ростом шума', () => {
    expect(zheli(0.6, 40).r2).toBeLessThan(zheli(0.1, 40).r2)
  })

  it('fitLine на точных данных даёт точные коэффициенты', () => {
    const f = fitLine([
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
    ])
    expect(f.slope).toBeCloseTo(2, 8)
    expect(f.intercept).toBeCloseTo(1, 8)
  })
})

describe('OtarBatch: маленький батч — дрожащая траектория', () => {
  const run = (batch: number) => {
    const rnd = rng(4)
    const s = otarInit()
    for (let i = 0; i < 400; i++) otarStep(s, batch, 0.08, rnd)
    return s
  }

  it('обучение приходит к оптимуму по всем данным', () => {
    const s = run(64)
    expect(Math.abs(s.w1 - OTAR_BEST.slope)).toBeLessThan(0.05)
    expect(Math.abs(s.w0 - OTAR_BEST.intercept)).toBeLessThan(0.05)
  })

  it('шум траектории падает с ростом батча', () => {
    expect(otarJitter(run(1))).toBeGreaterThan(otarJitter(run(32)))
  })

  it('маленький батч не мешает прийти примерно туда же', () => {
    const s = run(2)
    expect(Math.abs(s.w1 - OTAR_BEST.slope)).toBeLessThan(0.25)
  })
})

describe('TangbaClassify: граница решения и регуляризация', () => {
  it('разделяет стартовые тавро', () => {
    expect(tangbaFit(TANGBA_START, 0.01).accuracy).toBeGreaterThanOrEqual(0.85)
  })

  it('сильная регуляризация делает границу прямее', () => {
    const soft = tangbaFit(TANGBA_START, 0.001).curviness
    const hard = tangbaFit(TANGBA_START, 3).curviness
    expect(hard).toBeLessThan(soft)
  })

  it('одного класса недостаточно — модель честно ничего не выдумывает', () => {
    const r = tangbaFit(
      TANGBA_START.map((b) => ({ ...b, cls: 0 as const })),
      0.01
    )
    expect(r.accuracy).toBe(0)
    expect(r.w.every((v) => v === 0)).toBe(true)
  })

  it('знак решающей функции совпадает с классом', () => {
    const r = tangbaFit(TANGBA_START, 0.01)
    const ok = TANGBA_START.filter((b) => (tangbaScore(r.w, b.x, b.y) > 0 ? 1 : 0) === b.cls)
    expect(ok.length / TANGBA_START.length).toBeGreaterThanOrEqual(0.85)
  })
})

describe('FeaturePrimeta: приметы решают больше, чем модель', () => {
  it('облака дают наибольший прирост точности', () => {
    const g = primeta([]).gains
    const best = PRIMETA_KEYS.reduce((a, b) => (g[a] >= g[b] ? a : b))
    expect(best).toBe('bult')
  })

  it('суеверная примета не помогает', () => {
    const g = primeta(['bult', 'mal']).gains
    expect(g.qus).toBeLessThan(0.02)
    expect(g.qus).toBeLessThan(g.zhel)
  })

  it('полный набор примет лучше пустого', () => {
    const none = primeta([]).accuracy
    const all = primeta([...PRIMETA_KEYS]).accuracy
    expect(all).toBeGreaterThan(none)
  })

  it('точность всегда в допустимых пределах', () => {
    const r = primeta(['bult'])
    expect(r.accuracy).toBeGreaterThan(0.5)
    expect(r.accuracy).toBeLessThanOrEqual(1)
  })
})

describe('KiizUiLayers: слои дают более сложную границу', () => {
  const trainNet = (hidden: number[]) => {
    const { X, y } = sampleRings(120, 0.25, 9)
    const net = makeNet(hidden, 3)
    for (let i = 0; i < 1500; i++) trainStep(net, X, y, 1.2)
    return netAccuracy(net, X, y)
  }

  it('без скрытых слоёв кольца не разделяются', () => {
    expect(trainNet([])).toBeLessThan(0.75)
  })

  it('со скрытым слоем разделяются заметно лучше', () => {
    expect(trainNet([6])).toBeGreaterThan(0.85)
  })

  it('число параметров растёт со слоями', () => {
    expect(netParams([4])).toBeLessThan(netParams([4, 4]))
    expect(netParams([])).toBe(3)
  })

  it('прямой проход даёт вероятность в [0,1]', () => {
    const net = makeNet([4], 1)
    const out = forward(net, [0.3, -0.2]).out
    expect(out).toBeGreaterThan(0)
    expect(out).toBeLessThan(1)
  })

  it('полином вычисляется схемой Горнера верно', () => {
    expect(polyEval([1, 2, 3], 2)).toBe(1 + 4 + 12)
  })
})
