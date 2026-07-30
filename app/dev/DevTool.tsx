'use client'

import { WIDGETS } from '@/components/interactive/registry'
import { Slider, Segmented } from '@/components/interactive/_shared/Slider'
import { useState } from 'react'

const GLYPHS = ['ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'һ', 'і']

export function DevTool({ tool }: { tool: 'widgets' | 'ui' }) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="mb-4 rounded-lg border border-dala-alert/30 bg-dala-alert/10 px-3 py-2 text-sm text-dala-alert">
        Служебная страница разработчика. В продакшен-сборке не публикуется.
      </p>
      {tool === 'widgets' ? <WidgetGallery /> : <UiKit />}
    </main>
  )
}

function WidgetGallery() {
  return (
    <>
      <h1 className="text-2xl font-bold text-dala-gold">/dev/widgets — все восемь интерактивов</h1>
      <div className="mt-8 space-y-10">
        {WIDGETS.map(({ id, name, Component }) => (
          <section key={id} data-widget={id}>
            <h2 className="mb-3 font-mono text-sm text-dala-muted">{name}</h2>
            <Component />
          </section>
        ))}
      </div>
    </>
  )
}

function UiKit() {
  const [v, setV] = useState(0.4)
  const [seg, setSeg] = useState('a')

  return (
    <>
      <h1 className="text-2xl font-bold text-dala-gold">/dev/ui — примитивы и глифы</h1>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-dala-text">Казахские глифы</h2>
        <div className="rounded-xl border border-dala-gold/20 bg-dala-surface p-5">
          <p className="text-3xl tracking-wider text-dala-text">{GLYPHS.join(' ')}</p>
          <p className="mt-3 font-mono text-lg text-dala-muted">{GLYPHS.join(' ')}</p>
          <p className="mt-3 text-dala-muted">Мәңгі өңдеу ұғынық: қазақ тілі, шаңырақ, күнделік.</p>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-dala-text">Slider</h2>
        <div className="rounded-xl border border-dala-gold/20 bg-dala-surface p-4">
          <Slider label="Тест" value={v} min={0} max={1} step={0.01} onChange={setV} minLabel="0" maxLabel="1" />
          <div className="mt-4">
            <Segmented
              label="Segmented"
              value={seg}
              onChange={setSeg}
              options={[
                { value: 'a', label: 'Бірінші' },
                { value: 'b', label: 'Екінші' },
              ]}
            />
          </div>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-dala-text">Кнопки</h2>
        <div className="flex flex-wrap gap-3">
          <button className="min-h-[44px] rounded-lg bg-dala-gold px-4 font-medium text-dala-bg">Primary</button>
          <button className="min-h-[44px] rounded-lg border border-dala-gold/30 px-4 font-medium text-dala-gold">
            Secondary
          </button>
          <button disabled className="min-h-[44px] rounded-lg bg-dala-gold px-4 font-medium text-dala-bg opacity-40">
            Disabled
          </button>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold text-dala-text">Орнамент</h2>
        <div className="dala-ornament" />
      </section>
    </>
  )
}
