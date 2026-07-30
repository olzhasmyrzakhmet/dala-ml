import { test, type Page } from '@playwright/test'
import { mkdirSync } from 'node:fs'

/**
 * Снимки для отчёта. Запуск:
 *   npx playwright test --project="Mobile Chrome" e2e/shots.spec.ts
 * Результат — docs/shots/*.png
 */

const DIR = 'docs/shots'

async function setRange(page: Page, index: number, value: number) {
  await page
    .locator('input[type=range]')
    .nth(index)
    .evaluate((node, v) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!
      setter.call(node, String(v))
      node.dispatchEvent(new Event('input', { bubbles: true }))
      node.dispatchEvent(new Event('change', { bubbles: true }))
    }, value)
}

test('снимки', async ({ page }) => {
  test.setTimeout(120000)
  mkdirSync(DIR, { recursive: true })
  await page.setViewportSize({ width: 390, height: 860 })

  // Главная
  await page.goto('/')
  await page.waitForTimeout(1200)
  await page.screenshot({ path: `${DIR}/01-home.png` })

  // AryqGradient — три сценария
  await page.goto('/kurs/module-3/lesson-1')
  const widget = page.locator('div.rounded-xl').filter({ hasText: 'Арық: градиенттік түсу' }).first()
  await widget.scrollIntoViewIfNeeded()

  // Параметры выставляем ДО сброса: иначе несколько первых кадров успевают
  // отработать на прежнем шаге и сценарий получается не тот.
  const shoot = async (name: string, rate: number, slope = 1.0) => {
    await setRange(page, 0, slope)
    await setRange(page, 1, rate)
    await page.getByRole('button', { name: 'Қайтадан' }).click()
    await page.waitForTimeout(3200)
    await widget.screenshot({ path: `${DIR}/${name}.png` })
  }

  await shoot('02-aryq-stuck', 0.08)
  await shoot('03-aryq-converged', 0.35)
  await shoot('04-aryq-diverged', 0.75)

  // Остальные интерактивы
  await page.goto('/dev/widgets')
  for (const id of ['overfit', 'zhailau', 'tangba', 'otar', 'kiiz', 'zheli', 'primeta']) {
    const s = page.locator(`section[data-widget="${id}"]`)
    await s.scrollIntoViewIfNeeded()
    await page.waitForTimeout(1400)
    await s.screenshot({ path: `${DIR}/w-${id}.png` })
  }

  // Остальные экраны
  for (const [name, url] of [
    ['05-kurs', '/kurs'],
    ['06-lesson', '/kurs/module-3/lesson-2'],
    ['07-sozdik', '/sozdik'],
    ['08-mugalimge', '/mugalimge'],
  ] as const) {
    await page.goto(url)
    await page.waitForTimeout(900)
    await page.screenshot({ path: `${DIR}/${name}.png` })
  }
})
