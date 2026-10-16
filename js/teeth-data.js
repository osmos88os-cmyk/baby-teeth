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
    name: 'Второй моляр',
    jaw: 'upper',
    side: 'right',
    sideTitle: 'Справа вверху',
    fullName: 'Верхний правый второй моляр',
    type: 'molar',
    normalAge: '23–31 мес.',
    avgAgeMonths: 27,
    order: 10,
    x: 10, // процент по дуге
    y: 80
  },
  {
    id: '54',
    name: 'Первый моляр',
    jaw: 'upper',
    side: 'right',
    sideTitle: 'Справа вверху',
    fullName: 'Верхний правый первый моляр',
    type: 'molar',
    normalAge: '13–19 мес.',
    avgAgeMonths: 16,
    order: 7,
    x: 18,
    y: 54
  },
  {
    id: '53',
    name: 'Клык',
    jaw: 'upper',
    side: 'right',
    sideTitle: 'Справа вверху',
    fullName: 'Верхний правый клык',
    type: 'canine',
    normalAge: '16–22 мес.',
    avgAgeMonths: 19,
    order: 8,
    x: 28,
    y: 32
  },
  {
    id: '52',
    name: 'Боковой резец',
    jaw: 'upper',
    side: 'right',
    sideTitle: 'Справа вверху',
    fullName: 'Верхний правый боковой резец',
    type: 'incisor',
    normalAge: '9–13 мес.',
    avgAgeMonths: 11,
    order: 4,
    x: 39,
    y: 16
  },
  {
    id: '51',
    name: 'Центральный резец',
    jaw: 'upper',
    side: 'right',
    sideTitle: 'Справа вверху',
    fullName: 'Верхний правый центральный резец',
    type: 'incisor',
    normalAge: '8–12 мес.',
    avgAgeMonths: 10,
    order: 2,
    x: 47,
    y: 10
  },
  {
    id: '61',
    name: 'Центральный резец',
    jaw: 'upper',
    side: 'left',
    sideTitle: 'Слева вверху',
    fullName: 'Верхний левый центральный резец',
    type: 'incisor',
    normalAge: '8–12 мес.',
    avgAgeMonths: 10,
    order: 3,
    x: 53,
    y: 10
  },
  {
    id: '62',
    name: 'Боковой резец',
    jaw: 'upper',
    side: 'left',
    sideTitle: 'Слева вверху',
    fullName: 'Верхний левый боковой резец',
    type: 'incisor',
    normalAge: '9–13 мес.',
    avgAgeMonths: 11,
    order: 5,
    x: 61,
    y: 16
  },
  {
    id: '63',
    name: 'Клык',
    jaw: 'upper',
    side: 'left',
    sideTitle: 'Слева вверху',
    fullName: 'Верхний левый клык',
    type: 'canine',
    normalAge: '16–22 мес.',
    avgAgeMonths: 19,
    order: 9,
    x: 72,
    y: 32
  },
  {
    id: '64',
    name: 'Первый моляр',
    jaw: 'upper',
    side: 'left',
    sideTitle: 'Слева вверху',
    fullName: 'Верхний левый первый моляр',
    type: 'molar',
    normalAge: '13–19 мес.',
    avgAgeMonths: 16,
    order: 6,
    x: 82,
    y: 54
  },
  {
    id: '65',
    name: 'Второй моляр',
    jaw: 'upper',
    side: 'left',
    sideTitle: 'Слева вверху',
    fullName: 'Верхний левый второй моляр',
    type: 'molar',
    normalAge: '23–31 мес.',
    avgAgeMonths: 27,
    order: 10,
    x: 90,
    y: 80
  },

  // --- НИЖНЯЯ ЧЕЛЮСТЬ (85 -> 81 -> 71 -> 75) ---
  {
    id: '85',
    name: 'Второй моляр',
    jaw: 'lower',
    side: 'right',
    sideTitle: 'Справа внизу',
    fullName: 'Нижний правый второй моляр',
    type: 'molar',
    normalAge: '23–31 мес.',
    avgAgeMonths: 27,
    order: 10,
    x: 10,
    y: 20
  },
  {
    id: '84',
    name: 'Первый моляр',
    jaw: 'lower',
    side: 'right',
    sideTitle: 'Справа внизу',
    fullName: 'Нижний правый первый моляр',
    type: 'molar',
    normalAge: '14–18 мес.',
    avgAgeMonths: 16,
    order: 7,
    x: 18,
    y: 46
  },
  {
    id: '83',
    name: 'Клык',
    jaw: 'lower',
    side: 'right',
    sideTitle: 'Справа внизу',
    fullName: 'Нижний правый клык',
    type: 'canine',
    normalAge: '17–23 мес.',
    avgAgeMonths: 20,
    order: 9,
    x: 28,
    y: 68
  },
  {
    id: '82',
    name: 'Боковой резец',
    jaw: 'lower',
    side: 'right',
    sideTitle: 'Справа внизу',
    fullName: 'Нижний правый боковой резец',
    type: 'incisor',
    normalAge: '10–16 мес.',
    avgAgeMonths: 13,
    order: 4,
    x: 39,
    y: 84
  },
  {
    id: '81',
    name: 'Центральный резец',
    jaw: 'lower',
    side: 'right',
    sideTitle: 'Справа внизу',
    fullName: 'Нижний правый центральный резец',
    type: 'incisor',
    normalAge: '6–10 мес.',
    avgAgeMonths: 8,
    order: 1, // Самый первый обычно!
    x: 47,
    y: 90
  },
  {
    id: '71',
    name: 'Центральный резец',
    jaw: 'lower',
    side: 'left',
    sideTitle: 'Слева внизу',
    fullName: 'Нижний левый центральный резец',
    type: 'incisor',
    normalAge: '6–10 мес.',
    avgAgeMonths: 8,
    order: 1, // Тоже один из первых
    x: 53,
    y: 90
  },
  {
    id: '72',
    name: 'Боковой резец',
    jaw: 'lower',
    side: 'left',
    sideTitle: 'Слева внизу',
    fullName: 'Нижний левый боковой резец',
    type: 'incisor',
    normalAge: '10–16 мес.',
    avgAgeMonths: 13,
    order: 5,
    x: 61,
    y: 84
  },
  {
    id: '73',
    name: 'Клык',
    jaw: 'lower',
    side: 'left',
    sideTitle: 'Слева внизу',
    fullName: 'Нижний левый клык',
    type: 'canine',
    normalAge: '17–23 мес.',
    avgAgeMonths: 20,
    order: 8,
    x: 72,
    y: 68
  },
  {
    id: '74',
    name: 'Первый моляр',
    jaw: 'lower',
    side: 'left',
    sideTitle: 'Слева внизу',
    fullName: 'Нижний левый первый моляр',
    type: 'molar',
    normalAge: '14–18 мес.',
    avgAgeMonths: 16,
    order: 6,
    x: 82,
    y: 46
  },
  {
    id: '75',
    name: 'Второй моляр',
    jaw: 'lower',
    side: 'left',
    sideTitle: 'Слева внизу',
    fullName: 'Нижний левый второй моляр',
    type: 'molar',
    normalAge: '23–31 мес.',
    avgAgeMonths: 27,
    order: 10,
    x: 90,
    y: 20
  }
];

// Симптомы при прорезывании для быстрого выбора
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
