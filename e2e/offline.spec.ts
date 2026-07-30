import { test, expect } from '@playwright/test'

/**
 * Офлайн-проверка из SPEC §6: скачал модуль → выключил сеть → перезагрузил →
 * урок и интерактив работают.
 *
 * Запускать против собранного `dist/`, а не dev-сервера:
 *   npm run build
 *   node scripts/serve-dist.mjs 4173
 *   BASE_URL=http://127.0.0.1:4173 npx playwright test --project="Mobile Chrome" e2e/offline.spec.ts
 */

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4173'

test.describe('Офлайн', () => {
  test.skip(({ browserName }) => browserName !== 'chromium', 'service worker: только Chromium')

  test('жүктелген модуль интернетсіз ашылады', async ({ page, context }) => {
    test.setTimeout(90000)

    await page.goto(`${BASE}/kurs`)

    // Ждём, пока service worker возьмёт страницу под контроль.
    await page.waitForFunction(
      () => navigator.serviceWorker?.controller !== null || navigator.serviceWorker?.ready !== undefined,
      undefined,
      { timeout: 30000 }
    )
    await page.evaluate(() => navigator.serviceWorker.ready)

    // Скачиваем третий модуль — тот, где живёт «Арық».
    const card = page.locator('li', { hasText: 'Арық: оқыту' }).first()
    await card.getByRole('button', { name: 'Жүктеу' }).click()
    // Сообщение, а не подпись кнопки: после нажатия кнопка тоже называется «Жүктелді».
    await expect(page.getByText(/Енді интернетсіз де оқи аласың|бетті бір рет жаңарт/)).toBeVisible({
      timeout: 20000,
    })

    // Прогреваем страницу урока, чтобы её чанки попали в кэш.
    await page.goto(`${BASE}/kurs/module-3/lesson-1`)
    await page.locator('canvas').first().waitFor()
    await page.waitForTimeout(1500)

    // Выключаем сеть и перезагружаемся — как в DevTools Network Offline.
    await context.setOffline(true)
    await page.reload({ waitUntil: 'domcontentloaded' })

    // Урок на месте
    await expect(page.getByRole('heading', { name: 'Арық: модель қалай оқиды' })).toBeVisible({
      timeout: 20000,
    })

    // Интерактив живой: ползунки есть и симуляция идёт
    await expect(page.locator('input[type=range]')).toHaveCount(2)
    await page.locator('canvas').first().scrollIntoViewIfNeeded()
    const steps = page.locator('dl dd').first()
    const before = Number(await steps.textContent())
    await page.waitForTimeout(1500)
    expect(Number(await steps.textContent())).toBeGreaterThan(before)

    // И квиз тоже доступен
    await expect(page.locator('div[role=radiogroup]').first()).toBeVisible()

    await context.setOffline(false)
  })

  test('нежүктелген бет офлайнда /offline көрсетеді', async ({ page, context }) => {
    test.setTimeout(60000)
    await page.goto(`${BASE}/`)
    await page.evaluate(() => navigator.serviceWorker.ready)
    await page.waitForTimeout(800)

    await context.setOffline(true)
    await page.goto(`${BASE}/kurs/module-2/lesson-3`, { waitUntil: 'domcontentloaded' })

    // Либо страница из кэша, либо честная заглушка — но не ошибка браузера.
    const body = (await page.locator('body').textContent()) ?? ''
    expect(body.length).toBeGreaterThan(50)
    expect(body).toMatch(/Интернет жоқ|Ең кіші квадраттар|Курс/)

    await context.setOffline(false)
  })
})
