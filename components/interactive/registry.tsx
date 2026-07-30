'use client'

import type { ComponentType } from 'react'
import { AryqGradient } from './AryqGradient'
import { DalaZheliNoise } from './DalaZheliNoise'
import { FeaturePrimeta } from './FeaturePrimeta'
import { KiizUiLayers } from './KiizUiLayers'
import { OtarBatch } from './OtarBatch'
import { OverfitField } from './OverfitField'
import { TangbaClassify } from './TangbaClassify'
import { ZhailauQystau } from './ZhailauQystau'
import type { MetaphorId } from '@/lib/content'

export interface WidgetEntry {
  id: MetaphorId
  /** Имя компонента — нужно только служебной странице разработчика. */
  name: string
  title: string
  /** Что этот интерактив объясняет, на казахском. */
  about: string
  /** Урок, где он встречается в курсе, если такой есть. */
  lesson?: string
  Component: ComponentType
}

/**
 * Единый список восьми интерактивов.
 * Отсюда его берут и витрина `/interaktiv`, и служебная `/dev/widgets`,
 * поэтому число «8» на главной не может разойтись с реальностью.
 */
export const WIDGETS: WidgetEntry[] = [
  {
    id: 'aryq',
    name: 'AryqGradient',
    title: 'Арық: градиенттік түсу',
    about: 'Модель қателікті қалай азайтады және оқу жылдамдығы неге шешуші',
    lesson: 'module-3-lesson-1',
    Component: AryqGradient,
  },
  {
    id: 'overfit',
    name: 'OverfitField',
    title: 'Өріс: артық үйрену',
    about: 'Күрделілік өскенде қателік неге алдымен азайып, сосын өседі',
    lesson: 'module-2-lesson-3',
    Component: OverfitField,
  },
  {
    id: 'zhailau',
    name: 'ZhailauQystau',
    title: 'Жайлау мен қыстау',
    about: 'Оқу мен тексеру арасындағы айырма және дерек көлемінің рөлі',
    Component: ZhailauQystau,
  },
  {
    id: 'tangba',
    name: 'TangbaClassify',
    title: 'Таңба: жіктеу',
    about: 'Екі класты бөлетін шекара және регуляризацияның әсері',
    Component: TangbaClassify,
  },
  {
    id: 'otar',
    name: 'OtarBatch',
    title: 'Отар: батч өлшемі',
    about: 'Бір қадамға қанша дерек алса, жол қаншалық дірілдейді',
    lesson: 'module-3-lesson-4',
    Component: OtarBatch,
  },
  {
    id: 'kiiz',
    name: 'KiizUiLayers',
    title: 'Киіз үй: қабаттар',
    about: 'Нейрондық желі қабаттары шекараны түзуден шеңберге қалай айналдырады',
    Component: KiizUiLayers,
  },
  {
    id: 'zheli',
    name: 'DalaZheliNoise',
    title: 'Дала желі: шу',
    about: 'Шу заңдылықты қалай бұзады және дерек саны оны қалай түзейді',
    lesson: 'module-2-lesson-2',
    Component: DalaZheliNoise,
  },
  {
    id: 'primeta',
    name: 'FeaturePrimeta',
    title: 'Дала белгілері: ерекшеліктер',
    about: 'Қай белгілер шынымен пайдалы, ал қайсысы — тек ырым',
    lesson: 'module-1-lesson-1',
    Component: FeaturePrimeta,
  },
]
