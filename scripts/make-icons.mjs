#!/usr/bin/env node
/**
 * Генерирует иконки PWA без внешних зависимостей.
 * Манифест ссылался на icon-192.png и icon-512.png, которых в репозитории не было —
 * установка приложения на телефон из-за этого молча ломалась.
 *
 * Запуск: node scripts/make-icons.mjs
 */

import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const PUBLIC = resolve(HERE, '..', 'public')

const BG = [0x12, 0x14, 0x0f]
const GOLD = [0xd9, 0xa4, 0x41]
const WATER = [0x3f, 0xa9, 0xa0]
const GROUND = [0x2a, 0x2e, 0x23]

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

/** Мягкая граница: 0 снаружи, 1 внутри, плавно на ширине aa. */
function coverage(d, aa = 1.4) {
  return Math.max(0, Math.min(1, 0.5 - d / aa))
}

/**
 * Рисуем логотип: русло арыка (парабола) и капля воды на дне.
 * Полотно без полей — иконка используется и как maskable.
 */
function renderIcon(size) {
  const px = Buffer.alloc(size * size * 4)
  const s = size / 512

  // Профиль русла в координатах 512×512
  // Ось Y растёт вниз, поэтому дно русла — максимум, а берега — минимум.
  const ridgeY = (x) => {
    const n = (x - 256) / 256
    return 392 - 170 * n * n
  }

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const X = x / s
      const Y = y / s

      // Фон с лёгким вертикальным градиентом
      let c = mix(BG, [0x1b, 0x1e, 0x17], Y / 512)

      // Земля под линией русла
      const ry = ridgeY(X)
      if (Y > ry) c = GROUND

      // Сама линия берега — золото
      const dRidge = Math.abs(Y - ry) - 11
      const aRidge = coverage(dRidge * s, 2)
      if (aRidge > 0) c = mix(c, GOLD, aRidge)

      // Капля воды на дне русла
      const dropX = 256
      const dropY = ridgeY(dropX) - 46
      const dDrop = Math.hypot(X - dropX, Y - dropY) - 54
      const aDrop = coverage(dDrop * s, 2)
      if (aDrop > 0) c = mix(c, WATER, aDrop)

      // Блик на капле
      const dGlint = Math.hypot(X - (dropX - 18), Y - (dropY - 18)) - 16
      const aGlint = coverage(dGlint * s, 2)
      if (aGlint > 0) c = mix(c, [0xed, 0xea, 0xe2], aGlint * 0.55)

      const i = (y * size + x) * 4
      px[i] = c[0]
      px[i + 1] = c[1]
      px[i + 2] = c[2]
      px[i + 3] = 255
    }
  }
  return px
}

function crc32(buf) {
  let c
  const table = []
  for (let n = 0; n < 256; n++) {
    c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  let crc = 0xffffffff
  for (const b of buf) crc = table[(crc ^ b) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function toPng(size, rgba) {
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // бит на канал
  ihdr[9] = 6 // RGBA
  const raw = Buffer.alloc(size * (size * 4 + 1))
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0 // фильтр None
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4)
  }
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

mkdirSync(PUBLIC, { recursive: true })
for (const size of [192, 512]) {
  const file = resolve(PUBLIC, `icon-${size}.png`)
  writeFileSync(file, toPng(size, renderIcon(size)))
  console.log(`✓ ${file}`)
}

// Иконка для домашнего экрана iOS
writeFileSync(resolve(PUBLIC, 'apple-touch-icon.png'), toPng(180, renderIcon(180)))
console.log('✓ apple-touch-icon.png')
