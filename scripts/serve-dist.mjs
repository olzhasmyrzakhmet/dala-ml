#!/usr/bin/env node
/**
 * Статический сервер для собранного `dist/`.
 * Нужен, чтобы проверять офлайн и бюджет JS на настоящей сборке,
 * а не на dev-сервере с HMR и неминифицированными чанками.
 *
 *   npm run build && node scripts/serve-dist.mjs [порт]
 */

import { createServer } from 'node:http'
import { createReadStream, existsSync, statSync } from 'node:fs'
import { extname, join, normalize, resolve } from 'node:path'

const ROOT = resolve(process.cwd(), 'dist')
const PORT = Number(process.argv[2] || process.env.PORT || 4173)
const PROD_ROUTES = process.env.PROD_ROUTES === '1'

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

function resolveFile(pathname) {
  const clean = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '')
  const candidates = [
    join(ROOT, clean),
    join(ROOT, `${clean}.html`),
    join(ROOT, clean, 'index.html'),
  ]
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c
  }
  return null
}

createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost')

  // Повторяем правило хостинга: служебные страницы на проде закрыты.
  // Для e2e-прогонов витрина /dev нужна, поэтому редирект включается флагом.
  if (PROD_ROUTES && url.pathname.startsWith('/dev/')) {
    res.writeHead(307, { location: '/' })
    return res.end()
  }

  const file = resolveFile(url.pathname === '/' ? '/index.html' : url.pathname)
  if (!file) {
    const notFound = join(ROOT, '404.html')
    res.writeHead(404, { 'content-type': TYPES['.html'] })
    return existsSync(notFound) ? createReadStream(notFound).pipe(res) : res.end('404')
  }

  res.writeHead(200, {
    'content-type': TYPES[extname(file)] || 'application/octet-stream',
    'cache-control': file.includes('_next/static') ? 'public, max-age=31536000, immutable' : 'no-cache',
  })
  createReadStream(file).pipe(res)
  // Слушаем именно 127.0.0.1: с привязкой к «::» на Windows часть клиентов
  // (curl, Playwright) стучится по IPv4 и не находит сервер.
}).listen(PORT, '127.0.0.1', () => {
  console.log(`dist/ → http://127.0.0.1:${PORT}`)
})
