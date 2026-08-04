import { test, expect, type Page } from '@playwright/test'

/**
 * Главная проверка продукта: интерактивы должны реально работать пальцем.
 * Здесь настоящий Chromium, поэтому requestAnimationFrame крутится
 * и симуляцию видно так же, как её увидит школьник.
 */

const ARYQ = '/kurs/module-3/lesson-1'

async function readouts(page: Page) {
  return page.locator('dl dd').allTextContents()
}

/** Устанавливает значение нативного ползунка так же, как это делает палец. */
async function setRange(page: Page, index: number, value: number) {
  await setRangeOn(page.locator('input[type=range]').nth(index), value)
}

async function setRangeOn(el: ReturnType<Page['locator']>, value: number) {
  await el.evaluate((node, v) => {
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
    setter.call(node, String(v))
    node.dispatchEvent(new Event('input', { bubbles: true }))
    node.dispatchEvent(new Event('change', { bubbles: true }))
  }, value)
}

test.describe('AryqGradient — эталонный интерактив', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(ARYQ)
    await page.locator('canvas').first().waitFor()
  })

  test('ползунки — нативные, с зоной нажатия не меньше 44px', async ({ page }) => {
    const ranges = page.locator('input[type=range]')
    await expect(ranges).toHaveCount(2)
    for (let i = 0; i < 2; i++) {
      const box = await ranges.nth(i).boundingBox()
      expect(box, 'ползунок не отрисован').not.toBeNull()
      expect(box!.height).toBeGreaterThanOrEqual(44)
    }
  })

  test('симуляция идёт: шаги растут сами по себе', async ({ page }) => {
    // Модель считается только когда виджет на экране — сначала доводим до видимости.
    await page.locator('canvas').first().scrollIntoViewIfNeeded()
    await page.waitForTimeout(200)
    const before = (await readouts(page))[0]
    await page.waitForTimeout(1200)
    const after = (await readouts(page))[0]
    expect(Number(after)).toBeGreaterThan(Number(before))
  })

  test('холст вне экрана не тратит кадры, а в экране рисует', async ({ page }) => {
    const canvas = page.locator('canvas').first()
    const snap = () => canvas.evaluate((c: HTMLCanvasElement) => c.toDataURL('image/png'))

    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(500)
    const offscreenA = await snap()
    await page.waitForTimeout(700)
    expect(await snap(), 'холст рисует, хотя его не видно').toBe(offscreenA)

    await canvas.scrollIntoViewIfNeeded()
    await page.waitForTimeout(400)
    const onscreenA = await snap()
    await page.waitForTimeout(500)
    expect(await snap(), 'холст в экране не перерисовывается').not.toBe(onscreenA)
  })

  test('движение ползунка меняет и цифры, и картинку', async ({ page }) => {
    // Вне экрана холсты сознательно замирают, поэтому сначала доводим до видимости.
    await page.locator('canvas').first().scrollIntoViewIfNeeded()
    await page.waitForTimeout(300)

    const snapshot = () =>
      page.locator('canvas').first().evaluate((c: HTMLCanvasElement) => c.toDataURL('image/png'))

    await setRange(page, 0, 0.4) // жайпақ жер
    await page.waitForTimeout(600)
    const flat = await snapshot()

    await setRange(page, 0, 2.4) // тік жер
    await page.waitForTimeout(600)
    const steep = await snapshot()

    expect(steep, 'рельеф не перерисовался при смене уклона').not.toBe(flat)

    // И цифры под графиком тоже живые.
    await page.locator('canvas').first().scrollIntoViewIfNeeded()
    const before = (await readouts(page))[1]
    await page.waitForTimeout(900)
    expect((await readouts(page))[1]).not.toBe(before)
  })

  test('три сценария воспроизводятся движением ползунка', async ({ page }) => {
    const status = page.getByRole('main').locator('p', { hasText: /Жинақталды|Локалды|Шектен|Су ағып/ })

    // 1. Маленький шаг → застревает в локальном минимуме
    await setRange(page, 0, 1.0)
    await setRange(page, 1, 0.08)
    await expect(page.getByText('Локалды минимумда')).toBeVisible({ timeout: 15000 })

    // 2. Средний шаг → выпрыгивает и сходится
    await page.getByRole('button', { name: 'Қайтадан' }).click()
    await setRange(page, 1, 0.35)
    await expect(page.getByText('Жинақталды')).toBeVisible({ timeout: 15000 })

    // 3. Большой шаг → расходится
    await page.getByRole('button', { name: 'Қайтадан' }).click()
    await setRange(page, 1, 0.75)
    await expect(page.getByText('Шектен шықты')).toBeVisible({ timeout: 15000 })

    await expect(status.first()).toBeVisible()
  })

  test('кадры идут стабильно (не ниже 30 fps)', async ({ page }) => {
    const fps = await page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let frames = 0
          const start = performance.now()
          const tick = () => {
            frames++
            if (performance.now() - start < 1000) requestAnimationFrame(tick)
            else resolve(frames)
          }
          requestAnimationFrame(tick)
        })
    )
    expect(fps).toBeGreaterThan(30)
  })

  test('RAF останавливается при уходе со страницы', async ({ page }) => {
    await page.evaluate(() => {
      const w = window as unknown as { __raf: number }
      w.__raf = 0
      const orig = window.requestAnimationFrame
      window.requestAnimationFrame = (cb) => {
        w.__raf++
        return orig(cb)
      }
    })
    await page.waitForTimeout(600)
    const withWidget = await page.evaluate(() => (window as unknown as { __raf: number }).__raf)
    expect(withWidget).toBeGreaterThan(0)

    // Уходим на страницу без интерактивов и считаем кадры заново.
    await page.getByRole('link', { name: /Курс картасына оралу/ }).click()
    await expect(page).toHaveURL(/\/kurs$/)
    await page.evaluate(() => ((window as unknown as { __raf: number }).__raf = 0))
    await page.waitForTimeout(800)
    const afterLeave = await page.evaluate(() => (window as unknown as { __raf: number }).__raf)
    expect(afterLeave, 'после ухода со страницы кадры продолжают запрашиваться').toBeLessThan(10)
  })
})

/** На проде /dev закрыт редиректом, поэтому берём публичную витрину. */
const GALLERY = process.env.BASE_URL ? '/interaktiv' : '/dev/widgets'

test.describe('Все восемь интерактивов', () => {
  test('у каждого есть обе панели и рабочее управление', async ({ page }) => {
    await page.goto(GALLERY)
    const sections = page.locator('section[data-widget]')
    await expect(sections).toHaveCount(8)

    for (let i = 0; i < 8; i++) {
      const s = sections.nth(i)
      const id = await s.getAttribute('data-widget')
      await expect(s.locator('canvas'), `${id}: нет двух панелей`).toHaveCount(2)
      const controls = await s.locator('input[type=range], button[role=radio], button[role=switch]').count()
      expect(controls, `${id}: нет управляющих элементов`).toBeGreaterThan(0)
    }
  })

  test('на 360px нет горизонтального скролла', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    await page.goto(GALLERY)
    await page.locator('canvas').first().waitFor()
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)
    expect(overflow).toBe(false)
  })

  test('OverfitField: сложность меняет обе ошибки', async ({ page }) => {
    await page.goto(GALLERY)
    const s = page.locator('section[data-widget="overfit"]')
    const before = await s.locator('dl dd').allTextContents()

    await setRangeOn(s.locator('input[type=range]').first(), 12)
    await expect
      .poll(async () => (await s.locator('dl dd').allTextContents()).join('|'), { timeout: 5000 })
      .not.toBe(before.join('|'))
  })

  test('TangbaClassify: тап по полю ставит тавро', async ({ page }) => {
    await page.goto(GALLERY)
    const s = page.locator('section[data-widget="tangba"]')
    const count = s.locator('dl dd').first()
    const before = Number(await count.textContent())

    const canvas = s.locator('canvas').first()
    await canvas.scrollIntoViewIfNeeded()
    const box = (await canvas.boundingBox())!
    // click() сам доводит элемент до видимой области — важнее mouse.click на длинной странице.
    await canvas.click({ position: { x: box.width * 0.7, y: box.height * 0.35 } })

    await expect.poll(async () => Number(await count.textContent()), { timeout: 5000 }).toBe(before + 1)
  })
})
