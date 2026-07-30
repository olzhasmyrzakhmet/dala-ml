import { test, expect } from '@playwright/test'

const LESSON = '/kurs/module-3/lesson-2'
const KEY = 'dala:progress:v1'

test.describe('Прогресс без регистрации', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.evaluate((k) => localStorage.removeItem(k), KEY)
  })

  test('открытый урок попадает в lastSlug', async ({ page }) => {
    await page.goto(LESSON)
    await page.waitForFunction((k) => localStorage.getItem(k) !== null, KEY)
    const raw = await page.evaluate((k) => localStorage.getItem(k), KEY)
    const data = JSON.parse(raw!)
    expect(data.lastSlug).toBe('module-3-lesson-2')
  })

  test('квиз сохраняет отметку, и она переживает перезагрузку', async ({ page }) => {
    await page.goto(LESSON)

    const cards = page.locator('div[role=radiogroup]')
    const total = await cards.count()
    expect(total).toBeGreaterThanOrEqual(3) // SPEC §8: 3–5 сұрақ

    for (let i = 0; i < total; i++) {
      await cards.nth(i).getByRole('radio').first().click()
      await page
        .getByRole('button', { name: 'Тексеру', exact: true })
        .first()
        .click()
    }

    await expect(page.getByText(/Нәтиже:/)).toBeVisible()

    const stored = JSON.parse((await page.evaluate((k) => localStorage.getItem(k), KEY))!)
    expect(stored.lessons['module-3-lesson-2'].done).toBe(true)
    expect(typeof stored.lessons['module-3-lesson-2'].score).toBe('number')
    expect(stored.lessons['module-3-lesson-2'].at).not.toBe('')

    await page.reload()
    await expect(page.getByText('Өтілді')).toBeVisible()
  })

  test('на главной появляется карточка «Жалғастыру»', async ({ page }) => {
    await page.goto(LESSON)
    await page.waitForFunction((k) => localStorage.getItem(k) !== null, KEY)
    await page.goto('/')
    await expect(page.getByText('Жалғастыру')).toBeVisible()
    await expect(page.getByText('Градиентті есептеу')).toBeVisible()
  })

  test('карта курса показывает прогресс модуля', async ({ page }) => {
    await page.goto(LESSON)
    await page.waitForFunction((k) => localStorage.getItem(k) !== null, KEY)
    await page.goto('/kurs')
    await expect(page.getByRole('heading', { name: 'Машиналық оқу' })).toBeVisible()
    await expect(page.getByText(/Өтілген|Өтілді/).first()).toBeVisible()
  })

  test('экспорт и импорт JSON восстанавливают прогресс', async ({ page }) => {
    await page.goto('/kurs')
    await page.evaluate(
      ([k, v]) => localStorage.setItem(k, v),
      [
        KEY,
        JSON.stringify({
          lessons: { 'module-1-lesson-1': { done: true, score: 100, at: '2026-01-01T00:00:00.000Z' } },
          lastSlug: 'module-1-lesson-1',
          downloadedModules: [1],
        }),
      ] as [string, string]
    )
    await page.reload()

    const download = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Файлға сақтау' }).click()
    const file = await download
    expect(file.suggestedFilename()).toBe('dala-ml-progress.json')

    // Чистим и восстанавливаем из файла
    await page.getByRole('button', { name: 'Тазалау' }).click()
    await expect(page.getByText('Прогресс тазаланды.')).toBeVisible()

    const path = await file.path()
    await page.locator('input[type=file]').setInputFiles(path!)
    await expect(page.getByText('Прогресс қалпына келтірілді.')).toBeVisible()

    const restored = JSON.parse((await page.evaluate((k) => localStorage.getItem(k), KEY))!)
    expect(restored.lessons['module-1-lesson-1'].done).toBe(true)
  })

  test('битый файл не ломает приложение', async ({ page }) => {
    await page.goto('/kurs')
    await page.evaluate((k) => localStorage.setItem(k, '{"lessons": сломано'), KEY)
    await page.reload()
    await expect(page.getByRole('heading', { name: 'Машиналық оқу' })).toBeVisible()
  })
})
