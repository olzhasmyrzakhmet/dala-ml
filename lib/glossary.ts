export interface Term {
  kk: string
  en: string
  ru: string
  short: string
  metaphor: string
  moduleRef?: number
  lessonSlug?: string
}

export const glossary: Term[] = [
  // Module 1: Мәліметтер
  { kk: 'мәліметтер', en: 'data', ru: 'данные', short: 'Фактілер мен сандар жиынтығы', metaphor: 'Шопанның кітапшасындағы ақпарат', moduleRef: 1 },
  { kk: 'ерекшелік', en: 'feature', ru: 'признак', short: 'Нәрсенің бір қасиеті', metaphor: 'Қойдың жасы, түсі, салмағы', moduleRef: 1 },
  { kk: 'негізгі блок', en: 'data point', ru: 'объект данных', short: 'Жеке деректер жиынтығы', metaphor: 'Бір қой туралы ақпарат', moduleRef: 1 },
  { kk: 'кесте', en: 'table', ru: 'таблица', short: 'Деректердің ретті түрі', metaphor: 'Шопан кітабының парағы', moduleRef: 1 },
  { kk: 'мұндама', en: 'label', ru: 'метка', short: 'Негізгі блоктың жауабы', metaphor: 'Қойдың денсаулығы: сау/ауру', moduleRef: 1 },
  { kk: 'сандық', en: 'numerical', ru: 'числовой', short: 'Сандармен өлшенетін', metaphor: 'Салмақ, бой, жас — сандар', moduleRef: 1 },
  { kk: 'саптық', en: 'categorical', ru: 'категориальный', short: 'Санаттармен сипатталатын', metaphor: 'Түс: ақ, қара, қоңыр', moduleRef: 1 },
  { kk: 'тазалау', en: 'cleaning', ru: 'очистка', short: 'Қателіктерді түзету', metaphor: 'Малды жуып, тазалау', moduleRef: 1 },
  { kk: 'жоқ мән', en: 'missing value', ru: 'пропущенное значение', short: 'Белгісіз дерек', metaphor: 'Кітаптағы бос орын', moduleRef: 1 },
  { kk: 'қайталама', en: 'duplicate', ru: 'дубликат', short: 'Қайталанатын дерек', metaphor: 'Бір қой екі рет жазылған', moduleRef: 1 },
  
  // Module 2: Заңдылық іздеу
  { kk: 'заңдылық', en: 'pattern', ru: 'закономерность', short: 'Қайталанатын байланыс', metaphor: 'Қысқа түссе, қар жауады', moduleRef: 2 },
  { kk: 'болжам', en: 'prediction', ru: 'предсказание', short: 'Болашақты болжау', metaphor: 'Ауа-райын болжау', moduleRef: 2 },
  { kk: 'модель', en: 'model', ru: 'модель', short: 'Заңдылықты үйренетін бағдарлама', metaphor: 'Шопанның тәжірибесі', moduleRef: 2 },
  { kk: 'сызықтық регрессия', en: 'linear regression', ru: 'линейная регрессия', short: 'Түзу сызықпен болжау', metaphor: 'Екі нүктені қосатын жол', moduleRef: 2 },
  { kk: 'теңдеу', en: 'equation', ru: 'уравнение', short: 'Математикалық қатынас', metaphor: 'Жолдың сызбасы', moduleRef: 2 },
  { kk: 'бұрыш', en: 'slope', ru: 'наклон', short: 'Түзу сызықтың еңкейуі', metaphor: 'Жолдың көтерілуі', moduleRef: 2 },
  { kk: 'кесінді', en: 'intercept', ru: 'свободный член', short: 'Түзу сызықтың басқы нүктесі', metaphor: 'Жолдың басталуы', moduleRef: 2 },
  { kk: 'қателік', en: 'error', ru: 'ошибка', short: 'Болжам мен шындықтың айырмасы', metaphor: 'Жолдан ауытқу', moduleRef: 2 },
  { kk: 'түзету', en: 'correction', ru: 'коррекция', short: 'Қателікті түзету', metaphor: 'Жолды туралау', moduleRef: 2 },
  { kk: 'ең кіші квадраттар', en: 'least squares', ru: 'наименьшие квадраты', short: 'Ең жақсы сызықты табу', metaphor: 'Жолды екі қашықтыққа теңдеу', moduleRef: 2 },
  
  // Module 3: Арық
  { kk: 'оқыту', en: 'training', ru: 'обучение', short: 'Модельді деректерден үйрету', metaphor: 'Малға көз қиясу', moduleRef: 3 },
  { kk: 'градиенттік түсу', en: 'gradient descent', ru: 'градиентный спуск', short: 'Қателікті кеміту алгоритмі', metaphor: 'Су арықпен төмен ағуы', moduleRef: 3 },
  { kk: 'оқу жылдамдығы', en: 'learning rate', ru: 'скорость обучения', short: 'Градиент бойынша қозғалу қарқыны', metaphor: 'Арықтағы ағынның күші', moduleRef: 3 },
  { kk: 'итерация', en: 'iteration', ru: 'итерация', short: 'Бір қадам', metaphor: 'Судың бір тамшысын құю', moduleRef: 3 },
  { kk: 'эпоха', en: 'epoch', ru: 'эпоха', short: 'Барлық деректерді бір рет өткен', metaphor: 'Барлық малды бір рет қарау', moduleRef: 3 },
  { kk: 'функция', en: 'function', ru: 'функция', short: 'Кірісті шығысқа түрлендіру', metaphor: 'Малды салмақтау', moduleRef: 3 },
  { kk: 'шығын функциясы', en: 'loss function', ru: 'функция потерь', short: 'Қателікті өлшеу', metaphor: 'Жолдың ұзындығы', moduleRef: 3 },
  { kk: 'параметр', en: 'parameter', ru: 'параметр', short: 'Модельдің реттейтін саны', metaphor: 'Арықтың тереңдігі', moduleRef: 3 },
  { kk: 'салмақ', en: 'weight', ru: 'вес', short: 'Ерекшелікке берілген маңыздылық', metaphor: 'Дәнекердің күші', moduleRef: 3 },
  { kk: 'ету', en: 'bias', ru: 'смещение', short: 'Модельдің бастапқы болжамы', metaphor: 'Жолдың басталуы', moduleRef: 3 },
  { kk: 'локалды минимум', en: 'local minimum', ru: 'локальный минимум', short: 'Аймақтық ең төмен нүкте', metaphor: 'Шұңқырдағы су', moduleRef: 3 },
  { kk: 'глобалды минимум', en: 'global minimum', ru: 'глобальный минимум', short: 'Жалпы ең төмен нүкте', metaphor: 'Табанға жеткен су', moduleRef: 3 },
  { kk: 'сәйкестендіру', en: 'convergence', ru: 'сходимость', short: 'Модельдің тұрақтануы', metaphor: 'Су табанға жетуі', moduleRef: 3 },
  { kk: 'шектен шығу', en: 'divergence', ru: 'расходимость', short: 'Модельдің бұзылуы', metaphor: 'Су асып кетуі', moduleRef: 3 },
  
  // Module 4: Таңба
  { kk: 'жіктеу', en: 'classification', ru: 'классификация', short: 'Санаттарға бөлу', metaphor: 'Малды таңбалау', moduleRef: 4 },
  { kk: 'сынып', en: 'class', ru: 'класс', short: 'Бір топ нәрсе', metaphor: 'Бір түсті қойлар', moduleRef: 4 },
  { kk: 'шешім шекарасы', en: 'decision boundary', ru: 'граница решения', short: 'Екі сыныпты бөлетін шек', metaphor: 'Таңба шегі', moduleRef: 4 },
  { kk: 'логистикалық регрессия', en: 'logistic regression', ru: 'логистическая регрессия', short: 'Ықтималдықты болжау', metaphor: 'Жауапты иә/жоқ болжау', moduleRef: 4 },
  { kk: 'ықтималдық', en: 'probability', ru: 'вероятность', short: 'Болу ықтималдығы', metaphor: 'Жаңбыр жауу мүмкіндігі', moduleRef: 4 },
  { kk: 'порог', en: 'threshold', ru: 'порог', short: 'Шешім қабылдау шегі', metaphor: 'Таңба сызығы', moduleRef: 4 },
  { kk: 'точность', en: 'accuracy', ru: 'точность', short: 'Дұрыс болжамдар үлесі', metaphor: 'Дұрыс саналған мал', moduleRef: 4 },
  { kk: 'қате', en: 'false', ru: 'ошибка', short: 'Қате болжам', metaphor: 'Қате танылған мал', moduleRef: 4 },
  { kk: 'рұқсат қателігі', en: 'false positive', ru: 'ложное срабатывание', short: 'Нақты емес оң болжам', metaphor: 'Сауды ауру деп ойлау', moduleRef: 4 },
  { kk: 'тискендік қателігі', en: 'false negative', ru: 'ложное пропускание', short: 'Нақты емес теріс болжам', metaphor: 'Ауруды сау деп ойлау', moduleRef: 4 },
  
  // Module 5: Жайлау мен қыстау
  { kk: 'үйрену жиынтығы', en: 'training set', ru: 'обучающая выборка', short: 'Үйретуге арналған деректер', metaphor: 'Жайлау — жазғы жайылым', moduleRef: 5 },
  { kk: 'тексеру жиынтығы', en: 'test set', ru: 'тестовая выборка', short: 'Тексеруге арналған деректер', metaphor: 'Қыстау — қысқы жайылым', moduleRef: 5 },
  { kk: 'баптау жиынтығы', en: 'validation set', ru: 'валидационная выборка', short: 'Баптауға арналған деректер', metaphor: 'Күзгі көшу', moduleRef: 5 },
  { kk: 'баптау', en: 'validation', ru: 'валидация', short: 'Модельді тексеру', metaphor: 'Жолдың қауіпсіздігін тексеру', moduleRef: 5 },
  { kk: 'жалпылау', en: 'generalization', ru: 'обобщение', short: 'Жаңа деректерге қолдану', metaphor: 'Жайлауды қыстаудан тану', moduleRef: 5 },
  { kk: 'үстінен үйрену', en: 'overfitting', ru: 'переобучение', short: 'Деректерді жаттау', metaphor: 'Бір жерді жаттап алу', moduleRef: 5 },
  { kk: 'жетіспеушілік', en: 'underfitting', ru: 'недообучение', short: 'Тым қарапайым модель', metaphor: 'Малды алыстан бақылау', moduleRef: 5 },
  { kk: 'күрделілік', en: 'complexity', ru: 'сложность', short: 'Модельдің қиындығы', metaphor: 'Малдың санын көбейту', moduleRef: 5 },
  { kk: 'тегістеу', en: 'regularization', ru: 'регуляризация', short: 'Күрделілікті азайту', metaphor: 'Малды азайту', moduleRef: 5 },
  { kk: 'гиперпараметр', en: 'hyperparameter', ru: 'гиперпараметр', short: 'Үйрету баптаулары', metaphor: 'Жайылымның көлемі', moduleRef: 5 },
  { kk: 'айқас тексеру', en: 'cross-validation', ru: 'кросс-валидация', short: 'Бірнеше бөлікпен тексеру', metaphor: 'Малды айналып бақылау', moduleRef: 5 },
  
  // Module 6: Киіз үй
  { kk: 'нейрондық желі', en: 'neural network', ru: 'нейронная сеть', short: 'Көп қабатты модель', metaphor: 'Киіз үйдің құрылысы', moduleRef: 6 },
  { kk: 'қабат', en: 'layer', ru: 'слой', short: 'Желінің бір деңгейі', metaphor: 'Киіз үйдің бір қабаты', moduleRef: 6 },
  { kk: 'нейрон', en: 'neuron', ru: 'нейрон', short: 'Ақпаратты өңдеу бірлігі', metaphor: 'Киіз үйдің керегесі', moduleRef: 6 },
  { kk: 'баланс', en: 'weight', ru: 'вес', short: 'Байланыс күші', metaphor: 'Керегенің бекітілуі', moduleRef: 6 },
  { kk: 'тасушы', en: 'activation', ru: 'активация', short: 'Сигналды түрлендіру', metaphor: 'Есік ашылуы', moduleRef: 6 },
  { kk: 'relu', en: 'ReLU', ru: 'ReLU', short: 'Танымал тасушы', metaphor: 'Тек оңға жол', moduleRef: 6 },
  { kk: 'сигмойд', en: 'sigmoid', ru: 'сигмоида', short: 'Ықтималдық тасушы', metaphor: 'Есік айналуы', moduleRef: 6 },
  { kk: 'тамыр', en: 'backpropagation', ru: 'обратное распространение', short: 'Қатені артқа тарату', metaphor: 'Желіден кері қайту', moduleRef: 6 },
  { kk: 'шығыс қабаты', en: 'output layer', ru: 'выходной слой', short: 'Соңғы нәтиже', metaphor: 'Шаңырақ', moduleRef: 6 },
  { kk: 'жасырын қабат', en: 'hidden layer', ru: 'скрытый слой', short: 'Ортаңғы қабат', metaphor: 'Киіз үйдің іші', moduleRef: 6 },
  { kk: 'кіріс', en: 'input', ru: 'вход', short: 'Бастапқы деректер', metaphor: 'Есіктен кіру', moduleRef: 6 },
  { kk: 'шығыс', en: 'output', ru: 'выход', short: 'Соңғы нәтиже', metaphor: 'Шаңырақтан шығу', moduleRef: 6 },
  
  // Module 7: Көру
  { kk: 'көрермен', en: 'vision', ru: 'зрение', short: 'Суретті тану', metaphor: 'Шопанның көзі', moduleRef: 7 },
  { kk: 'свертка', en: 'convolution', ru: 'свёртка', short: 'Белгілерді іздеу', metaphor: 'Таңбаны іздеу', moduleRef: 7 },
  { kk: 'ядро', en: 'kernel', ru: 'ядро', short: 'Сүзгі матрицасы', metaphor: 'Тексеру жолағы', moduleRef: 7 },
  { kk: 'өлшемін азайту', en: 'pooling', ru: 'пулинг', short: 'Ақпаратты қысқарту', metaphor: 'Маңыздысын таңдау', moduleRef: 7 },
  { kk: 'канал', en: 'channel', ru: 'канал', short: 'Түс ақпараты', metaphor: 'Түсті көру', moduleRef: 7 },
  { kk: 'пиксел', en: 'pixel', ru: 'пиксель', short: 'Сурет нүктесі', metaphor: 'Кестенің ұяшығы', moduleRef: 7 },
  { kk: 'тұтас байланысты', en: 'fully connected', ru: 'полносвязный', short: 'Барлығымен байланыс', metaphor: 'Барлық мал бірге', moduleRef: 7 },
  { kk: 'тану дәлігі', en: 'recognition accuracy', ru: 'точность распознавания', short: 'Тану сапасы', metaphor: 'Малды тану дәлдігі', moduleRef: 7 },
  
  // General
  { kk: 'машиналық оқу', en: 'machine learning', ru: 'машинное обучение', short: 'Машиналарды үйрету', metaphor: 'Мал үйретуі' },
  { kk: 'жасанды интеллект', en: 'artificial intelligence', ru: 'искусственный интеллект', short: 'Машина ақыл-ойы', metaphor: 'Ақылды шопан' },
  { kk: 'алгоритм', en: 'algorithm', ru: 'алгоритм', short: 'Әрекеттер тізімі', metaphor: 'Жол сызбасы' },
  { kk: 'мәндер', en: 'values', ru: 'значения', short: 'Нақты сандар', metaphor: 'Өлшемдер' },
  { kk: 'деректер жиынтығы', en: 'dataset', ru: 'набор данных', short: 'Барлық деректер', metaphor: 'Бүкіл мал' },
  { kk: 'үнемдеу', en: 'saving', ru: 'сохранение', short: 'Жұмысты сақтау', metaphor: 'Есте сақтау' },
  { kk: 'жүктеу', en: 'loading', ru: 'загрузка', short: 'Сақталғанды қайтару', metaphor: 'Еске түсіру' },
]

export function searchGlossary(query: string): Term[] {
  const lowerQuery = query.toLowerCase()
  return glossary.filter((term) =>
    term.kk.toLowerCase().includes(lowerQuery) ||
    term.en.toLowerCase().includes(lowerQuery) ||
    term.ru.toLowerCase().includes(lowerQuery) ||
    term.short.toLowerCase().includes(lowerQuery) ||
    term.metaphor.toLowerCase().includes(lowerQuery)
  )
}

export function getTermsByModule(moduleId: number): Term[] {
  return glossary.filter((term) => term.moduleRef === moduleId)
}

export function getTermBySlug(slug: string): Term | undefined {
  return glossary.find((term) => term.kk === slug || term.en === slug)
}
