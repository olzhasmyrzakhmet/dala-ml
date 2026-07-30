import { defineConfig, devices } from '@playwright/test'

/**
 * Замеры кадра — только последовательно и в один воркер.
 * Параллельные браузеры делят один процессор, и троттлинг ×6 в каждом из них
 * даёт числа, которые говорят о загрузке машины, а не о продукте.
 *
 *   npm run e2e:perf
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: /perf\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  timeout: 120000,
  reporter: 'list',
  use: {
    baseURL: 'http://127.0.0.1:4173',
    ...devices['Pixel 5'],
  },
  webServer: {
    command: 'node scripts/serve-dist.mjs 4173',
    url: 'http://127.0.0.1:4173/',
    reuseExistingServer: true,
    timeout: 60000,
  },
})
