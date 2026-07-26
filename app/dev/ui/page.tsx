export default function DevUIPage() {
  const glyphs = ['ә', 'ғ', 'қ', 'ң', 'ө', 'ұ', 'ү', 'һ', 'і']
  
  return (
    <main className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-dala-gold mb-8">
        /dev/ui — Компоненты и глифы
      </h1>
      
      {/* Section: Kazakh Glyphs Test */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-dala-text mb-4">
          1. Проверка казахских глифов (Inter + cyrillic-ext)
        </h2>
        <p className="text-dala-muted mb-4 text-sm">
          Все 9 букв должны отображаться в Inter, без «ряби»:
        </p>
        <div className="p-6 bg-dala-surface rounded-xl border border-dala-gold/20">
          <p className="text-3xl text-dala-text tracking-wider">
            {glyphs.join(' ')}
          </p>
          <p className="text-lg text-dala-muted mt-4">
            Тестовое слово: қазақ тілі (қазақ тілі)
          </p>
          <p className="text-lg text-dala-muted">
            Мәліметтер: мәңгі өңдеу ұғынық
          </p>
        </div>
      </section>

      {/* Section: Buttons */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-dala-text mb-4">
          2. Button
        </h2>
        <div className="flex flex-wrap gap-4">
          <button className="px-4 py-3 rounded-lg bg-dala-gold text-dala-bg font-medium min-h-[44px] hover:brightness-110 active:scale-[0.98] transition-all">
            Primary Button
          </button>
          <button className="px-4 py-3 rounded-lg border border-dala-gold/30 text-dala-gold font-medium min-h-[44px] hover:bg-dala-gold/10 active:scale-[0.98] transition-all">
            Secondary Button
          </button>
          <button className="px-4 py-3 rounded-lg bg-dala-gold/50 text-dala-bg font-medium min-h-[44px] opacity-50 cursor-not-allowed">
            Disabled
          </button>
        </div>
      </section>

      {/* Section: Cards */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-dala-text mb-4">
          3. Card
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="p-4 bg-dala-surface rounded-xl border border-dala-gold/20">
            <span className="text-dala-water text-sm">Модуль 1</span>
            <h3 className="text-lg font-semibold text-dala-text mt-1">Мәліметтер</h3>
            <p className="text-dala-muted text-sm mt-2">Деректермен жұмыс</p>
          </div>
          <div className="p-4 bg-dala-surface rounded-xl border border-dala-gold/20">
            <span className="text-dala-water text-sm">Модуль 3</span>
            <h3 className="text-lg font-semibold text-dala-text mt-1">Арық: оқыту</h3>
            <p className="text-dala-muted text-sm mt-2">Градиентті түсу</p>
          </div>
        </div>
      </section>

      {/* Section: Badge */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-dala-text mb-4">
          4. Badge
        </h2>
        <div className="flex gap-2">
          <span className="text-xs px-2 py-1 rounded bg-dala-bg text-dala-muted">
            дайындалуда
          </span>
          <span className="text-xs px-2 py-1 rounded bg-dala-water/20 text-dala-water">
            ашық
          </span>
          <span className="text-xs px-2 py-1 rounded bg-dala-gold/20 text-dala-gold">
            жаңа
          </span>
        </div>
      </section>

      {/* Section: Divider */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-dala-text mb-4">
          5. Divider
        </h2>
        <div className="border-t border-dala-gold/20"></div>
      </section>

      {/* Section: Slider */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-dala-text mb-4">
          6. Slider (тач-оптимизирован)
        </h2>
        <p className="text-dala-muted text-sm mb-4">
          Зона нажатия 44px по высоте
        </p>
        <div className="p-6 bg-dala-surface rounded-xl border border-dala-gold/20">
          <label className="text-sm text-dala-muted mb-2 block">
            Learning rate (оқу жылдамдығы)
          </label>
          <input
            type="range"
            min="0"
            max="100"
            defaultValue="50"
            className="w-full h-[44px] appearance-none bg-transparent cursor-pointer"
            style={{
              background: `linear-gradient(to right, #3FA9A0 50%, #1B1E17 50%)`,
            }}
          />
        </div>
      </section>

      {/* Section: Typography */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-dala-text mb-4">
          7. Типографика
        </h2>
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-dala-gold">
            H1: Дала ML платформасы
          </h1>
          <h2 className="text-xl font-semibold text-dala-text">
            H2: Модуль 3 — Арық
          </h2>
          <h3 className="text-lg font-semibold text-dala-text">
            H3: Градиентті түсу
          </h3>
          <p className="text-base text-dala-text">
            Body: Модель деректерден заңдылықты үйренеді. 
            Бұл процесс градиентті түсу арқылы жүзеге асырылады.
          </p>
          <p className="text-sm text-dala-muted">
            Small: Қосымша ақпарат
          </p>
          <p className="text-xs text-dala-muted">
            Caption: Түсініктеме
          </p>
        </div>
      </section>

      {/* Checklist */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-dala-text mb-4">
          8. Проверка (DESIGN.md §10)
        </h2>
        <ul className="space-y-2 text-sm">
          <li className="flex items-center gap-2">
            <span className="text-dala-water">□</span>
            <span className="text-dala-text">Без горизонтального скролла на 360px</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-dala-water">□</span>
            <span className="text-dala-text">Все казахские глифы отображаются корректно</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-dala-water">□</span>
            <span className="text-dala-text">Контраст текста ≥ AA (4.5:1)</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-dala-water">□</span>
            <span className="text-dala-text">Зоны нажатия ≥44px</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-dala-water">□</span>
            <span className="text-dala-text">Нет «ИИ-шного» вида</span>
          </li>
        </ul>
      </section>
    </main>
  )
}
