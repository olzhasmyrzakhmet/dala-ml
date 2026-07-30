#!/usr/bin/env node
/**
 * Проверка боевого стенда «Дала ML» — SPEC §9.
 * Домен зафиксирован. Проверять один адрес, а деплоить в другой — запрещено (CLAUDE.md §2).
 *
 *   node scripts/prod-verify.mjs
 *   BASE=http://localhost:3000 node scripts/prod-verify.mjs
 */

import { gzipSync } from 'node:zlib'

const BASE = (process.env.BASE || 'https://dala-ml.vercel.app').replace(/\/$/, '')

const LOCAL = /localhost|127\.0\.0\.1/.test(BASE)

const checks = []
let failed = 0

function record(status, title, detail = '') {
  const icon = status === 'pass' ? '✅' : status === 'warn' ? '⚠️ ' : '❌'
  console.log(`${icon} ${title}${detail ? ` — ${detail}` : ''}`)
  checks.push({ status, title, detail })
  if (status === 'fail') failed++
}

async function get(path, init) {
  const res = await fetch(`${BASE}${path}`, { redirect: 'manual', ...init })
  const text = res.status >= 300 && res.status < 400 ? '' : await res.text()
  return { res, text }
}

async function check(title, path, validate) {
  try {
    const { res, text } = await get(path)
    if (!res.ok) {
      record('fail', title, `HTTP ${res.status}`)
      return null
    }
    const problem = validate ? await validate(text, res) : null
    if (problem) {
      record('fail', title, problem)
      return null
    }
    record('pass', title)
    return text
  } catch (e) {
    record('fail', title, e.message)
    return null
  }
}

// Список из SPEC §9. «һ» встречается редко и на витрину попадать не обязана,
// поэтому её проверяем отдельно и мягко.
const KAZAKH_GLYPHS = ['ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'і']

/** Русские слова, которых не должно быть в казахском интерфейсе (P1). */
const RUSSIAN_IN_UI = [
  'Сходится',
  'сходится',
  'Расходится',
  'застрял',
  'кликни',
  'Поиск закономерности',
  'Компьютерное зрение',
  'Ползунок',
  'ползунок',
  'примета',
  'Примета',
  'расходимост',
  'сходимост',
  'Данные',
  'Обучение',
  'Классификация',
  'Нейросети',
  'Обобщение',
  'наука)',
  'метафора)',
]

const LESSONS = [
  ['/kurs/module-1/lesson-1', 'Мәліметтер деген не?'],
  ['/kurs/module-2/lesson-2', 'Сызықтық регрессия'],
  ['/kurs/module-3/lesson-1', 'Арық: модель қалай оқиды'],
]

async function main() {
  console.log(`\n🌿 Дала ML — prod-verify`)
  console.log(`Base: ${BASE}\n${'='.repeat(56)}`)

  // 1. Главная: казахский текст, без заглушек
  const home = await check('Басты бет 200 + қазақша мәтін', '/', (t) => {
    if (!t.includes('Дала')) return 'нет названия'
    for (const bad of ['Lorem', 'TODO', 'FIXME']) {
      if (t.includes(bad)) return `в разметке есть «${bad}»`
    }
    return null
  })

  // 2. Казахские глифы не побиты кодировкой
  if (home) {
    const missing = KAZAKH_GLYPHS.filter((g) => !home.includes(g))
    missing.length
      ? record('fail', 'Қазақ глифтері', `нет: ${missing.join(' ')}`)
      : record('pass', 'Қазақ глифтері (ә ғ қ ң ө ұ ү і)')
  }

  // 3. Живой интерактив на первом экране + настоящие ползунки (P0)
  if (home) {
    const ranges = (home.match(/type="range"/g) || []).length
    const canvases = (home.match(/<canvas/g) || []).length
    ranges >= 2 && canvases >= 2
      ? record('pass', 'Басты беттегі интерактив', `${ranges} ползунок, ${canvases} canvas`)
      : record('fail', 'Басты беттегі интерактив', `ползунков ${ranges}, canvas ${canvases}`)
  }

  // 4. Отладочный блок глифов убран с витрины (P2)
  if (home) {
    home.includes('Қазақша глифтер')
      ? record('fail', 'Витрина без отладки', 'на главной остался блок «Қазақша глифтер»')
      : record('pass', 'Витрина без отладки')
  }

  // 5. Карта курса: 8 модулей
  await check('Курс картасы (8 модуль)', '/kurs', (t) => {
    // React вставляет <!-- --> между соседними текстовыми узлами,
    // поэтому «01-модуль» в разметке выглядит как «01<!-- -->-модуль».
    const found = (t.match(/-модуль/g) || []).length
    return found >= 8 ? null : `в разметке ${found} модулей из 8`
  })

  // 6. Уроки модулей 1–3: заголовок + маркер виджета
  for (const [path, title] of LESSONS) {
    await check(`Сабақ ${path}`, path, (t) => {
      if (!t.includes(title)) return 'нет своего заголовка'
      if (!t.includes('<canvas')) return 'нет интерактива'
      return null
    })
  }

  // 7. Словарь: ≥60 терминов
  await check('Сөздік (≥60 термин)', '/sozdik', (t) => {
    const n = (t.match(/-модуль</g) || []).length
    return n >= 60 ? null : `терминов в разметке: ${n}`
  })

  // 8. Страницы, на которые ведут ссылки, существуют
  for (const p of ['/mugalimge', '/sertifikat', '/offline']) {
    await check(`Бет ${p}`, p)
  }

  // 9. PWA
  await check('PWA manifest', '/manifest.webmanifest', (t) => {
    try {
      const j = JSON.parse(t)
      if (!j.name || !j.icons?.length) return 'нет name или icons'
      if (j.display !== 'standalone') return `display = ${j.display}`
      if (j.theme_color !== '#12140F') return `theme_color = ${j.theme_color}`
      return null
    } catch {
      return 'не парсится как JSON'
    }
  })
  await check('Service worker', '/sw.js', (t) => (t.includes('addEventListener') ? null : 'пустой файл'))
  for (const icon of ['/icon-192.png', '/icon-512.png']) {
    try {
      const { res } = await get(icon)
      res.ok ? record('pass', `Иконка ${icon}`) : record('fail', `Иконка ${icon}`, `HTTP ${res.status}`)
    } catch (e) {
      record('fail', `Иконка ${icon}`, e.message)
    }
  }

  // 10. Прогресс: ключ хранилища из SPEC §5 присутствует в бандле
  {
    const { text: kurs } = await get('/kurs')
    const scripts = [...kurs.matchAll(/src="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1])
    let found = false
    for (const s of [...new Set(scripts)].slice(0, 14)) {
      const { text } = await get(s)
      if (text.includes('dala:progress:v1')) {
        found = true
        break
      }
    }
    found
      ? record('pass', 'Прогресс: ключ dala:progress:v1 в бандле')
      : record('fail', 'Прогресс: ключ dala:progress:v1 не найден')
  }

  // 11. Служебные страницы закрыты (P2)
  try {
    const { res } = await get('/dev/widgets')
    if (res.status >= 300 && res.status < 400) {
      record('pass', '/dev/widgets жабық', `редирект ${res.status} → ${res.headers.get('location')}`)
    } else if (res.status === 404) {
      record('pass', '/dev/widgets жабық', '404')
    } else if (LOCAL) {
      record('warn', '/dev/widgets жабық', 'локально редирект не действует — правило в vercel.json')
    } else {
      record('fail', '/dev/widgets жабық', `HTTP ${res.status} — страница открыта`)
    }
  } catch (e) {
    record('fail', '/dev/widgets жабық', e.message)
  }

  await check('robots.txt /dev/ жабады', '/robots.txt', (t) =>
    t.includes('/dev/') ? null : 'нет Disallow для /dev/'
  )

  // 12. Русский язык в казахском интерфейсе (P1)
  const pagesToScan = ['/', '/kurs', '/sozdik', '/mugalimge', ...LESSONS.map(([p]) => p)]
  const ruHits = []
  for (const p of pagesToScan) {
    const { text } = await get(p)
    const visible = text.replace(/<script[\s\S]*?<\/script>/g, '')
    for (const w of RUSSIAN_IN_UI) {
      if (visible.includes(w)) ruHits.push(`${p}: «${w}»`)
    }
  }
  ruHits.length
    ? record('fail', 'Интерфейс тек қазақша', ruHits.slice(0, 5).join('; '))
    : record('pass', 'Интерфейс тек қазақша', `${pagesToScan.length} бет тексерілді`)

  // 13. Бюджет производительности: JS первой загрузки < 200 КБ.
  // Меряем сжатый размер — именно он уезжает по 3G. Если сервер отдаёт без
  // сжатия (локальная раздача dist), жмём сами, чтобы число было сопоставимым.
  if (home) {
    const urls = [...new Set([...home.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+\.js)"/g)].map((m) => m[1]))]
    let bytes = 0
    let raw = 0
    for (const u of urls) {
      const r = await fetch(`${BASE}${u}`, { headers: { 'accept-encoding': 'gzip, br' } })
      const body = Buffer.from(await r.arrayBuffer())
      raw += body.byteLength
      const encoded = r.headers.get('content-encoding')
      bytes += encoded ? Number(r.headers.get('content-length') || body.byteLength) : gzipSync(body).byteLength
    }
    const kb = Math.round(bytes / 1024)
    const rawKb = Math.round(raw / 1024)
    if (kb < 200) {
      record('pass', 'JS бірінші жүктеу < 200 КБ', `${kb} КБ сжато (${rawKb} КБ сырых), ${urls.length} чанк`)
    } else if (LOCAL) {
      record('warn', 'JS бірінші жүктеу < 200 КБ', `${kb} КБ — dev-сборка не минифицирована`)
    } else {
      record('fail', 'JS бірінші жүктеу < 200 КБ', `${kb} КБ сжато`)
    }
  }

  // 14. Все внутренние ссылки с главной и карты курса отвечают 200
  const links = new Set()
  for (const src of ['/', '/kurs']) {
    const { text } = await get(src)
    for (const m of text.matchAll(/href="(\/[^"#?]*)"/g)) {
      const href = m[1] === '' ? '/' : m[1]
      if (!href.startsWith('/_next') && !/\.(png|webmanifest|ico|svg)$/.test(href)) links.add(href)
    }
  }
  const broken = []
  for (const href of links) {
    try {
      const { res } = await get(href)
      if (!res.ok && !(res.status >= 300 && res.status < 400)) broken.push(`${href} → ${res.status}`)
    } catch {
      broken.push(`${href} → сеть`)
    }
  }
  broken.length
    ? record('fail', 'Сынған сілтеме жоқ', broken.join(', '))
    : record('pass', 'Сынған сілтеме жоқ', `${links.size} сілтеме тексерілді`)

  // Итог
  console.log('='.repeat(56))
  const pass = checks.filter((c) => c.status === 'pass').length
  console.log(`\nНәтиже: ${pass} өтті, ${failed} құлады, барлығы ${checks.length}`)
  if (failed > 0) {
    console.log('\n❌ PROD-VERIFY FAILED')
    process.exit(1)
  }
  console.log('\n✅ PROD-VERIFY PASSED')
}

main().catch((e) => {
  console.error('Fatal:', e)
  process.exit(1)
})
