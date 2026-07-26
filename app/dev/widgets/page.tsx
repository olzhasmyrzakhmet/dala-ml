import { AryqGradient } from '@/components/interactive/AryqGradient'
import { OverfitField } from '@/components/interactive/OverfitField'
import { ZhailauQystau } from '@/components/interactive/ZhailauQystau'
import { TangbaClassify } from '@/components/interactive/TangbaClassify'
import { OtarBatch } from '@/components/interactive/OtarBatch'
import { KiizUiLayers } from '@/components/interactive/KiizUiLayers'
import { DalaZheliNoise } from '@/components/interactive/DalaZheliNoise'
import { FeaturePrimeta } from '@/components/interactive/FeaturePrimeta'

export default function WidgetsPage() {
  const widgets = [
    {
      name: 'AryqGradient',
      title: 'Арық және градиент',
      desc: 'Градиентті түсу — су арықпен төмен ағады',
      component: AryqGradient,
    },
    {
      name: 'OverfitField',
      title: 'Өрісті үйрену',
      desc: 'Overfitting — модель шуылды үйреніп жатыр',
      component: OverfitField,
    },
    {
      name: 'ZhailauQystau',
      title: 'Жайлау мен қыстау',
      desc: 'Train/test split — отарды көшіру',
      component: ZhailauQystau,
    },
    {
      name: 'TangbaClassify',
      title: 'Таңба',
      desc: 'Классификация — малды белгілеу',
      component: TangbaClassify,
    },
    {
      name: 'OtarBatch',
      title: 'Отар',
      desc: 'Batch size — отардың өлшемі',
      component: OtarBatch,
    },
    {
      name: 'KiizUiLayers',
      title: 'Киіз үй',
      desc: 'Нейрондық желі қабаттары',
      component: KiizUiLayers,
    },
    {
      name: 'DalaZheliNoise',
      title: 'Дала желі',
      desc: 'Шу (noise) — жел деректерді шайқайды',
      component: DalaZheliNoise,
    },
    {
      name: 'FeaturePrimeta',
      title: 'Приметалар',
      desc: 'Features — ауа-райын болжау',
      component: FeaturePrimeta,
    },
  ]

  return (
    <main className="min-h-screen px-4 py-8 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-dala-gold mb-4">
        /dev/widgets — Барлық интерактивтер (8)
      </h1>
      <p className="text-dala-muted mb-8">
        Стептік метафоралар арқылы машиналық оқу түсініктері
      </p>

      <div className="grid gap-8">
        {widgets.map((Widget) => (
          <section key={Widget.name} className="mb-8">
            <h2 className="text-xl font-semibold text-dala-text mb-2">
              {Widget.title}
            </h2>
            <p className="text-dala-muted text-sm mb-4">{Widget.desc}</p>
            <Widget.component />
          </section>
        ))}
      </div>
    </main>
  )
}
