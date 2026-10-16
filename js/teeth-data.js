// База данных 20 молочных зубов малыша
// Нумерация по международной системе FDI:
// 51-55: верхний правый квадрант
// 61-65: верхний левый квадрант
// 71-75: нижний левый квадрант
// 81-85: нижний правый квадрант

const BABY_TEETH = [
  // --- ВЕРХНЯЯ ЧЕЛЮСТЬ (Справа налево с точки зрения ребенка, т.е. 55 -> 51 -> 61 -> 65) ---
  {
    id: '55',
    num: 5,
    name: 'Второй моляр',
    jaw: 'upper',
    side: 'right',
    sideTitle: 'Справа вверху',
    fullName: 'Верхний правый второй моляр',
    type: 'molar',
    normalAge: '23–31 мес.',
    avgAgeMonths: 27,
    order: 10,
    x: 12, // процент по дуге челюсти
    y: 80
  },
  {
    id: '54',
    num: 4,
    name: 'Первый моляр',
    jaw: 'upper',
    side: 'right',
    sideTitle: 'Справа вверху',
    fullName: 'Верхний правый первый моляр',
    type: 'molar',
    normalAge: '13–19 мес.',
    avgAgeMonths: 16,
    order: 7,
    x: 19,
    y: 54
  },
  {
    id: '53',
    num: 3,
    name: 'Клык',
    jaw: 'upper',
    side: 'right',
    sideTitle: 'Справа вверху',
    fullName: 'Верхний правый клык',
    type: 'canine',
    normalAge: '16–22 мес.',
    avgAgeMonths: 19,
    order: 8,
    x: 27,
    y: 33
  },
  {
    id: '52',
    num: 2,
    name: 'Боковой резец',
    jaw: 'upper',
    side: 'right',
    sideTitle: 'Справа вверху',
    fullName: 'Верхний правый боковой резец',
    type: 'incisor',
    normalAge: '9–13 мес.',
    avgAgeMonths: 11,
    order: 4,
    x: 36,
    y: 19
  },
  {
    id: '51',
    num: 1,
    name: 'Центральный резец',
    jaw: 'upper',
    side: 'right',
    sideTitle: 'Справа вверху',
    fullName: 'Верхний правый центральный резец',
    type: 'incisor',
    normalAge: '8–12 мес.',
    avgAgeMonths: 10,
    order: 2,
    x: 44, // Скорректировано для идеального расстояния от 61
    y: 13
  },
  {
    id: '61',
    num: 1,
    name: 'Центральный резец',
    jaw: 'upper',
    side: 'left',
    sideTitle: 'Слева вверху',
    fullName: 'Верхний левый центральный резец',
    type: 'incisor',
    normalAge: '8–12 мес.',
    avgAgeMonths: 10,
    order: 3,
    x: 56, // Скорректировано для идеального зазора
    y: 13
  },
  {
    id: '62',
    num: 2,
    name: 'Боковой резец',
    jaw: 'upper',
    side: 'left',
    sideTitle: 'Слева вверху',
    fullName: 'Верхний левый боковой резец',
    type: 'incisor',
    normalAge: '9–13 мес.',
    avgAgeMonths: 11,
    order: 5,
    x: 64,
    y: 19
  },
  {
    id: '63',
    num: 3,
    name: 'Клык',
    jaw: 'upper',
    side: 'left',
    sideTitle: 'Слева вверху',
    fullName: 'Верхний левый клык',
    type: 'canine',
    normalAge: '16–22 мес.',
    avgAgeMonths: 19,
    order: 9,
    x: 73,
    y: 33
  },
  {
    id: '64',
    num: 4,
    name: 'Первый моляр',
    jaw: 'upper',
    side: 'left',
    sideTitle: 'Слева вверху',
    fullName: 'Верхний левый первый моляр',
    type: 'molar',
    normalAge: '13–19 мес.',
    avgAgeMonths: 16,
    order: 6,
    x: 81,
    y: 54
  },
  {
    id: '65',
    num: 5,
    name: 'Второй моляр',
    jaw: 'upper',
    side: 'left',
    sideTitle: 'Слева вверху',
    fullName: 'Верхний левый второй моляр',
    type: 'molar',
    normalAge: '23–31 мес.',
    avgAgeMonths: 27,
    order: 10,
    x: 88,
    y: 80
  },

  // --- НИЖНЯЯ ЧЕЛЮСТЬ (85 -> 81 -> 71 -> 75) ---
  {
    id: '85',
    num: 5,
    name: 'Второй моляр',
    jaw: 'lower',
    side: 'right',
    sideTitle: 'Справа внизу',
    fullName: 'Нижний правый второй моляр',
    type: 'molar',
    normalAge: '23–31 мес.',
    avgAgeMonths: 27,
    order: 10,
    x: 12,
    y: 20
  },
  {
    id: '84',
    num: 4,
    name: 'Первый моляр',
    jaw: 'lower',
    side: 'right',
    sideTitle: 'Справа внизу',
    fullName: 'Нижний правый первый моляр',
    type: 'molar',
    normalAge: '14–18 мес.',
    avgAgeMonths: 16,
    order: 7,
    x: 19,
    y: 46
  },
  {
    id: '83',
    num: 3,
    name: 'Клык',
    jaw: 'lower',
    side: 'right',
    sideTitle: 'Справа внизу',
    fullName: 'Нижний правый клык',
    type: 'canine',
    normalAge: '17–23 мес.',
    avgAgeMonths: 20,
    order: 9,
    x: 27,
    y: 67
  },
  {
    id: '82',
    num: 2,
    name: 'Боковой резец',
    jaw: 'lower',
    side: 'right',
    sideTitle: 'Справа внизу',
    fullName: 'Нижний правый боковой резец',
    type: 'incisor',
    normalAge: '10–16 мес.',
    avgAgeMonths: 13,
    order: 4,
    x: 36,
    y: 81
  },
  {
    id: '81',
    num: 1,
    name: 'Центральный резец',
    jaw: 'lower',
    side: 'right',
    sideTitle: 'Справа внизу',
    fullName: 'Нижний правый центральный резец',
    type: 'incisor',
    normalAge: '6–10 мес.',
    avgAgeMonths: 8,
    order: 1,
    x: 44, // Скорректировано
    y: 87
  },
  {
    id: '71',
    num: 1,
    name: 'Центральный резец',
    jaw: 'lower',
    side: 'left',
    sideTitle: 'Слева внизу',
    fullName: 'Нижний левый центральный резец',
    type: 'incisor',
    normalAge: '6–10 мес.',
    avgAgeMonths: 8,
    order: 1,
    x: 56, // Скорректировано
    y: 87
  },
  {
    id: '72',
    num: 2,
    name: 'Боковой резец',
    jaw: 'lower',
    side: 'left',
    sideTitle: 'Слева внизу',
    fullName: 'Нижний левый боковой резец',
    type: 'incisor',
    normalAge: '10–16 мес.',
    avgAgeMonths: 13,
    order: 5,
    x: 64,
    y: 81
  },
  {
    id: '73',
    num: 3,
    name: 'Клык',
    jaw: 'lower',
    side: 'left',
    sideTitle: 'Слева внизу',
    fullName: 'Нижний левый клык',
    type: 'canine',
    normalAge: '17–23 мес.',
    avgAgeMonths: 20,
    order: 8,
    x: 73,
    y: 67
  },
  {
    id: '74',
    num: 4,
    name: 'Первый моляр',
    jaw: 'lower',
    side: 'left',
    sideTitle: 'Слева внизу',
    fullName: 'Нижний левый первый моляр',
    type: 'molar',
    normalAge: '14–18 мес.',
    avgAgeMonths: 16,
    order: 6,
    x: 81,
    y: 46
  },
  {
    id: '75',
    num: 5,
    name: 'Второй моляр',
    jaw: 'lower',
    side: 'left',
    sideTitle: 'Слева внизу',
    fullName: 'Нижний левый второй моляр',
    type: 'molar',
    normalAge: '23–31 мес.',
    avgAgeMonths: 27,
    order: 10,
    x: 88,
    y: 20
  }
];

// Симптомы при прорезывании
const TOOTH_SYMPTOMS = [
  { id: 'drool', label: 'Слюни рекой', icon: '💧' },
  { id: 'fever', label: 'Температура', icon: '🤒' },
  { id: 'whiny', label: 'Капризы / сон', icon: '🥺' },
  { id: 'chewing', label: 'Грызет всё подряд', icon: '🧸' },
  { id: 'swelling', label: 'Отек десны', icon: '⚡' },
  { id: 'gel', label: 'Мазали гелем', icon: '🧴' },
  { id: 'rosy', label: 'Красные щечки', icon: '🍎' }
];

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BABY_TEETH, TOOTH_SYMPTOMS };
}
