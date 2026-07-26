import { test, expect } from '@playwright/test'

test.describe('Home page', () => {
  test('should load with Kazakh text', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('h1')).toContainText('Дала')
  })

  test('should have Kazakh glyphs', async ({ page }) => {
    await page.goto('/')
    const body = await page.locator('body').textContent()
    expect(body).toContain('ә')
    expect(body).toContain('ғ')
    expect(body).toContain('қ')
    expect(body).toContain('ң')
  })
})
