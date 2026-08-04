import { defineConfig, devices } from '@playwright/test'

/**
 * Конфигурация для проверок против СОБРАННОГО сайта (dist/), а не dev-сервера.
 * Офлайн и бюджет JS имеет смысл проверять только здесь.
 *
 *   npm run build
 *   npx playwright test -c playwright.dist.config.ts
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /offline\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: process.env.BASE_URL ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    ...devices['Pixel 5'],
  },
  // С внешним BASE_URL локальная раздача не нужна.
  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: 'node scripts/serve-dist.mjs 4173',
        env: { PROD_ROUTES: '1' },
        url: 'http://127.0.0.1:4173/',
        reuseExistingServer: true,
        timeout: 30000,
      },
})
