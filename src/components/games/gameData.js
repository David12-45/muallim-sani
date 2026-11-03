// Общие данные и помощники для обучающих игр «Му'аллим Сани»
import { ALPHABET_DATA, SPECIAL_LETTERS, BADGE_DEFINITIONS } from '../../data/alphabet';
import { srs } from '../../services/srs';

export function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const uniq = (arr) => Array.from(new Set(arr));

// Отдельная (изолированная) форма буквы без татвиля
export const iso = (l) => String(l?.forms?.isolated || l?.arabic || '').replace(/ـ/g, '');

// Справочник: символ → объект буквы
export const LETTER_BY_CHAR = {};
ALPHABET_DATA.forEach((l) => { LETTER_BY_CHAR[iso(l)] = l; });
SPECIAL_LETTERS.forEach((l) => {
  if (l.arabic === 'ء' || l.arabic === 'ة') LETTER_BY_CHAR[l.arabic] = l;
});

export const ALPHABET_CHARS = ALPHABET_DATA.map(iso);

// Буквы, похожие по начертанию (одинаковый остов, разные точки)
const LOOKALIKE_GROUPS = [
  ['ب', 'ت', 'ث', 'ن', 'ي'],
  ['ج', 'ح', 'خ'],
  ['د', 'ذ'],
  ['ر', 'ز'],
  ['د', 'ر'],
  ['س', 'ش'],
  ['ص', 'ض'],
  ['ط', 'ظ'],
  ['ع', 'غ'],
  ['ف', 'ق']
];

export function lookalikes(char) {
  return uniq(LOOKALIKE_GROUPS.filter((g) => g.includes(char)).flat()).filter((c) => c !== char);
}

// Пары букв, которые новички путают на слух, и подсказки, как их различать
export const SOUND_TIPS = [
  [['ح', 'ه'], 'ح — напряжённый «шершавый» выдох из середины горла; ه — лёгкий выдох из глубины горла, будто дышите на стекло.'],
  [['ح', 'خ'], 'ح — гладкий сильный выдох без хрипа; خ — хриплый звук с шорохом, как «х» в слове «Бах».'],
  [['خ', 'غ'], 'خ — глухой хрип; غ — звонкий, похож на картавое «р» при полоскании горла.'],
  [['س', 'ص'], 'س — тонкий свистящий [с]; ص — «толстый» [с̣]: спинка языка поднимается, звук глуше и тяжелее.'],
  [['س', 'ث'], 'س — кончик языка за зубами; ث — кончик языка между зубами (как английское th в «think»).'],
  [['ت', 'ط'], 'ت — лёгкий тонкий [т]; ط — твёрдый объёмный [т̣] с подъёмом спинки языка и калькалёй.'],
  [['د', 'ض'], 'د — обычный [д]; ض — твёрдый [д̣], произносится боковым краем языка.'],
  [['ذ', 'ز'], 'ذ — межзубный звонкий (как th в «this»); ز — обычный [з], язык за зубами.'],
  [['ذ', 'ظ'], 'ذ — тонкий межзубный; ظ — тот же межзубный, но твёрдый и «толстый».'],
  [['ز', 'ظ'], 'ز — обычный [з] за зубами; ظ — твёрдый межзубный звук.'],
  [['ك', 'ق'], 'ك — обычный [к] с придыханием; ق — глубокий [к̣] из самого основания языка, у язычка.'],
  [['ء', 'ع'], 'ء — короткая смычка (резкая остановка голоса); ع — напряжённый звонкий звук из середины горла.'],
  [['ه', 'خ'], 'ه — мягкий беззвучный выдох; خ — хриплый звук с шорохом.']
];

export function soundAlikes(char) {
  return uniq(SOUND_TIPS.filter(([pair]) => pair.includes(char)).map(([pair]) => pair).flat()).filter((c) => c !== char);
}

export function soundTip(a, b) {
  const found = SOUND_TIPS.find(([pair]) => pair.includes(a) && pair.includes(b));
  return found ? found[1] : null;
}

// Точки у букв: [количество, положение]
export const DOTS = {
  'ا': [0], 'ب': [1, 'below'], 'ت': [2, 'above'], 'ث': [3, 'above'],
  'ج': [1, 'below'], 'ح': [0], 'خ': [1, 'above'], 'د': [0], 'ذ': [1, 'above'],
  'ر': [0], 'ز': [1, 'above'], 'س': [0], 'ش': [3, 'above'], 'ص': [0],
  'ض': [1, 'above'], 'ط': [0], 'ظ': [1, 'above'], 'ع': [0], 'غ': [1, 'above'],
  'ف': [1, 'above'], 'ق': [2, 'above'], 'ك': [0], 'ل': [0], 'م': [0],
  'ن': [1, 'above'], 'ه': [0], 'و': [0], 'ي': [2, 'below']
};

export function dotsLabel(char) {
  const [n, pos] = DOTS[char] || [0];
  if (!n) return 'Без точек';
  const word = n === 1 ? 'точка' : 'точки';
  return `${n} ${word} ${pos === 'above' ? 'сверху' : 'снизу'}`;
}

export const ALL_DOT_LABELS = [
  'Без точек', '1 точка сверху', '1 точка снизу', '2 точки сверху', '2 точки снизу', '3 точки сверху'
];

// Остов буквы без точек (расм)
export const RASM = {
  'ب': 'ٮ', 'ت': 'ٮ', 'ث': 'ٮ', 'ن': 'ں', 'ي': 'ى',
  'ج': 'ح', 'ح': 'ح', 'خ': 'ح', 'د': 'د', 'ذ': 'د', 'ر': 'ر', 'ز': 'ر',
  'س': 'س', 'ش': 'س', 'ص': 'ص', 'ض': 'ص', 'ط': 'ط', 'ظ': 'ط',
  'ع': 'ع', 'غ': 'ع', 'ف': 'ڡ', 'ق': 'ٯ'
};

// Русская передача согласного (для чтения слогов)
export const CONS = {
  'ب': 'б', 'ت': 'т', 'ث': 'с̱', 'ج': 'дж', 'ح': 'х̣', 'خ': 'х', 'د': 'д', 'ذ': 'з̱',
  'ر': 'р', 'ز': 'з', 'س': 'с', 'ش': 'ш', 'ص': 'с̣', 'ض': 'д̣', 'ط': 'т̣', 'ظ': 'з̣',
  'ع': 'ʿ', 'غ': 'г', 'ف': 'ф', 'ق': 'к̣', 'ك': 'к', 'ل': 'л', 'م': 'м', 'ن': 'н',
  'ه': 'һ', 'و': 'в', 'ي': 'й'
};

// Огласовки (харакаты) и танвины
export const HARAKAT = [
  { id: 'fatha', mark: '\u064E', v: 'а', name: 'фатха (черта сверху)' },
  { id: 'kasra', mark: '\u0650', v: 'и', name: 'кясра (черта снизу)' },
  { id: 'damma', mark: '\u064F', v: 'у', name: 'дамма (запятая сверху)' }
];
export const TANWIN = [
  { mark: '\u064B', v: 'ан', name: 'танвин-фатха (две черты сверху)', alif: true },
  { mark: '\u064D', v: 'ин', name: 'танвин-кясра (две черты снизу)' },
  { mark: '\u064C', v: 'ун', name: 'танвин-дамма (две запятые сверху)' }
];

export const syllableBasic = (c, h) => c + h.mark;
export const syllableSukun = (c) => 'اَ' + c + '\u0652';
export const syllableTanwin = (c, t) => c + t.mark + (t.alif ? 'ا' : '');

// Все слоги, которые встречаются в игре «Прочитай слог» (для генерации озвучки)
export function allSyllables() {
  const out = [];
  Object.keys(CONS).forEach((c) => {
    HARAKAT.forEach((h) => out.push(syllableBasic(c, h)));
    TANWIN.forEach((t) => out.push(syllableTanwin(c, t)));
    out.push(syllableSukun(c));
  });
  return out;
}

// Списки правил из легенды алфавита
const badge = (id) => (BADGE_DEFINITIONS.find((b) => b.id === id)?.letters || []).map((c) => c.replace(/ـ/g, ''));
export const SUN_LETTERS = badge('sun');
export const HEAVY_LETTERS = badge('heavy');
export const QALQALA_LETTERS = badge('qalqala');
export const NON_CONNECTING = badge('non_connecting');
export const THROAT_LETTERS = ['ء', 'ه', 'ع', 'ح', 'غ', 'خ'];
export const LIP_LETTERS = ['ف', 'ب', 'م', 'و'];

// Выбор буквы с учётом интервального повторения:
// буквы, которые пора повторить или в которых были ошибки, выпадают чаще
export function pickWeighted(pool) {
  if (!pool.length) return null;
  const due = new Set(srs.dueIds(pool.map((l) => l.id)));
  const weights = pool.map((l) => {
    if (due.has(l.id)) return 5;
    const b = srs.box(l.id);
    if (b < 0) return 3;
    if (b <= 1) return 4;
    if (b <= 3) return 2;
    return 1;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

// Разбор слова на буквы (без огласовок)
const NORMALIZE = { 'أ': 'ا', 'إ': 'ا', 'آ': 'ا', 'ٱ': 'ا', 'ى': 'ي', 'ؤ': 'ء', 'ئ': 'ء' };

export function parseWord(word) {
  const clean = String(word || '').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED\u0640()=\s]/g, '');
  const chars = [];
  for (const ch of clean) {
    const c = NORMALIZE[ch] || ch;
    if (!LETTER_BY_CHAR[c]) return null;
    chars.push(c);
  }
  return chars;
}

export function recordAnswer(letter, correct) {
  if (letter && typeof letter.id === 'number' && letter.id <= 28) {
    srs.answer(letter.id, correct);
  }
}
