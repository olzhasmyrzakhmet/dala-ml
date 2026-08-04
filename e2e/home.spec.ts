import { test, expect } from '@playwright/test'

test.describe('Басты бет', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('қазақша жүктеледі және глифтер дұрыс', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Машиналық оқуды')
    const body = (await page.locator('body').textContent()) ?? ''
    for (const g of ['ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'і']) {
      expect(body, `глиф ${g} жоқ`).toContain(g)
    }
  })

  test('бірінші экранда тірі интерактив тұр', async ({ page }) => {
    await expect(page.locator('input[type=range]')).toHaveCount(2)
    await expect(page.locator('canvas')).toHaveCount(2)
  })

  test('360px-те көлденең айналдыру жоқ', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 })
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth
    )
    expect(overflow).toBe(false)
  })

  test('жөндеу блогы витринада жоқ', async ({ page }) => {
    const body = (await page.locator('body').textContent()) ?? ''
    expect(body).not.toContain('Қазақша глифтер')
    expect(body).not.toContain('глифтер:')
  })

  test('сөздік пен мұғалімге сілтемелері жұмыс істейді', async ({ page }) => {
    await page.getByRole('link', { name: /Мұғалімге/ }).first().click()
    await expect(page).toHaveURL(/\/mugalimge/)
    await expect(page.locator('h1')).toBeVisible()
  })
})

test.describe('Интерфейс тілі', () => {
  const RU_WORDS = [
    'Сходится',
    'сходится',
    'Расходится',
    'расходится',
    'Застрял',
    'застрял',
    'кликни',
    'Данные',
    'Обучение',
    'Классификация',
    'Нейросети',
    'Поиск закономерности',
    'Обобщение',
    'Компьютерное зрение',
    'Проект',
    'провалила',
    'Ползунок',
    'примета',
    'Примета',
  ]

  for (const path of ['/', '/kurs', '/sozdik', '/mugalimge', '/kurs/module-3/lesson-1']) {
    test(`${path} — орыс сөздері жоқ`, async ({ page }) => {
      await page.goto(path)
      const body = (await page.locator('body').textContent()) ?? ''
      for (const w of RU_WORDS) {
        expect(body, `${path} бетінде «${w}» табылды`).not.toContain(w)
      }
    })
  }
})

test.describe('Қызметтік беттер', () => {
  test('/dev/widgets жабық немесе noindex', async ({ page }) => {
    await page.goto('/dev/widgets')
    // На проде правило хостинга уводит на главную; локально страница открыта,
    // но помечена noindex. Оба исхода допустимы, «просто открыта» — нет.
    if (new URL(page.url()).pathname === '/') return
    const robots = await page.locator('meta[name="robots"]').getAttribute('content')
    expect(robots).toContain('noindex')
  })
})
