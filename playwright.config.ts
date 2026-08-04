import { defineConfig, devices } from '@playwright/test'

/**
 * e2e гоняем против СОБРАННОГО сайта, а не dev-сервера.
 *
 * next dev компилирует маршруты по первому обращению, и при нескольких воркерах
 * навигации отваливались по таймауту — тесты падали не из-за продукта.
 * Плюс так мы проверяем ровно то, что уезжает на прод.
 */
export default defineConfig({
  testDir: './e2e',
  testIgnore: /offline\.spec\.ts/,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 4,
  timeout: 45000,
  reporter: process.env.CI ? 'list' : 'html',
  use: {
    // BASE_URL позволяет прогнать те же тесты по боевому домену:
    //   BASE_URL=https://dala-ml.vercel.app npx playwright test --project="Mobile Chrome"
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Chrome', use: { ...devices['Pixel 5'] } },
  ],
  // Против внешнего адреса свой сервер поднимать не нужно.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'npm run build && node scripts/serve-dist.mjs 4173',
        url: 'http://127.0.0.1:4173/',
        reuseExistingServer: !process.env.CI,
        timeout: 300000,
      },
})
