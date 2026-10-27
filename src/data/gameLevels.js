import { ALPHABET_DATA } from './alphabet';
import { ALL_WORDS } from './book';
import { srs } from '../services/srs';
import { storageService } from '../services/storage';
import { transcribeArabic } from '../services/transcribe';

export const GAME_LEVELS = [
  {
    id: 1,
    title: 'Уровень 1: Первые 4 буквы (ا، ب، ت، ث)',
    shortTitle: '4 буквы (ا-ث)',
    category: 'alphabet',
    letterIds: [1, 2, 3, 4],
    maxLetters: 4,
    badge: 'Лодочки ⛵',
    accentColor: 'from-emerald-600 to-teal-700',
    description: 'Начало пути: Алиф, Ба, Та, Са и их 4 формы написания в слове.'
  },
  {
    id: 2,
    title: 'Уровень 2: Первые 8 букв (ا до د)',
    shortTitle: '8 букв (ا-د)',
    category: 'alphabet',
    letterIds: [1, 2, 3, 4, 5, 6, 7, 8],
    maxLetters: 8,
    badge: 'Клювики 🐥',
    accentColor: 'from-teal-600 to-cyan-700',
    description: 'Добавляются буквы Джим, Ха, Ха и Даль (8 букв из 28).'
  },
  {
    id: 3,
    title: 'Уровень 3: Первые 11 букв (ا до ز)',
    shortTitle: '11 букв (ا-ز)',
    category: 'alphabet',
    letterIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    maxLetters: 11,
    badge: 'Уголки 📐',
    accentColor: 'from-cyan-600 to-blue-700',
    description: 'Буквы Заль, Ра и Зай. Отработка 6 несоединяемых букв.'
  },
  {
    id: 4,
    title: 'Уровень 4: Первые 15 букв (ا до ض)',
    shortTitle: '15 букв (ا-ض)',
    category: 'alphabet',
    letterIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    maxLetters: 15,
    badge: 'Зубчики 🌊',
    accentColor: 'from-blue-600 to-indigo-700',
    description: 'Син, Шин, Сад и Дад. Сравнение мягких и твёрдых свистящих.'
  },
  {
    id: 5,
    title: 'Уровень 5: Первые 19 букв (ا до غ)',
    shortTitle: '19 букв (ا-غ)',
    category: 'alphabet',
    letterIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19],
    maxLetters: 19,
    badge: 'Петли ➰',
    accentColor: 'from-indigo-600 to-purple-700',
    description: 'Буквы Та, За, Айн и Гайн. Гортанные и эмфатические звуки.'
  },
  {
    id: 6,
    title: 'Уровень 6: Первые 23 буквы (ا до ل)',
    shortTitle: '23 буквы (ا-ل)',
    category: 'alphabet',
    letterIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23],
    maxLetters: 23,
    badge: 'Кувшины 🏺',
    accentColor: 'from-purple-600 to-pink-700',
    description: 'Фа, Каф, Кяф и Лям. Соединение в длинные цепочки букв.'
  },
  {
    id: 7,
    title: 'Уровень 7: Весь алфавит (Все 28 букв)',
    shortTitle: 'Все 28 букв 📜',
    category: 'alphabet',
    letterIds: Array.from({ length: 28 }, (_, i) => i + 1),
    maxLetters: 28,
    badge: 'Полная Алифба 👑',
    accentColor: 'from-amber-600 to-orange-700',
    description: 'Все 28 букв арабского алфавита: Алифба полностью освоена!'
  },
  {
    id: 8,
    title: 'Уровень 8: Первые слова с фатхой (а)',
    shortTitle: 'Слова с Фатхой',
    category: 'words',
    filterType: 'fatha',
    badge: 'Фатха َ',
    accentColor: 'from-emerald-700 to-green-800',
    description: 'Чтение цельных 3-буквенных слов с огласовкой фатха (دَرَسَ, كَتَبَ, وَجَدَ).'
  },
  {
    id: 9,
    title: 'Уровень 9: Все 3 огласовки и сукун',
    shortTitle: 'Фатха, Кясра, Дамма',
    category: 'words',
    filterType: 'harakat_sukun',
    badge: 'Сукун ْ',
    accentColor: 'from-teal-700 to-emerald-900',
    description: 'Чтение слов с краткими гласными [а], [и], [у] и знаком отсутствия гласной (сукун).'
  },
  {
    id: 10,
    title: 'Уровень 10: Ташдид, танвин и мадд',
    shortTitle: 'Ташдид и Мадд',
    category: 'words',
    filterType: 'tashdid_madd',
    badge: 'Шадда ّ',
    accentColor: 'from-amber-700 to-yellow-800',
    description: 'Удвоенные согласные (шадда), окончания -ан/-ин/-ун (танвин) и долгие гласные.'
  },
  {
    id: 11,
    title: 'Уровень 11: Мастер таджвида и суры',
    shortTitle: 'Таджвид и Суры',
    category: 'words',
    filterType: 'tajweed_fatiha',
    badge: 'Коран 🕌',
    accentColor: 'from-rose-700 to-red-900',
    description: 'Продвинутый уровень: правила таджвида, калькаля, идгам и аяты суры Аль-Фатиха.'
  }
];

const PREFERRED_LEVEL_KEY = 'muallim_preferred_game_level';
const MANUAL_LETTERS_COUNT_KEY = 'muallim_manual_letters_count';

// Получить текущее состояние знаний пользователя
export function getUserKnowledgeProgress() {
  // 1. Проверяем SRS выученные буквы
  const srsLearned = ALPHABET_DATA.filter(l => srs.isLearned(l.id)).map(l => l.id);

  // 2. Проверяем ручную настройку если пользователь указал конкретно (например, "8 из 28")
  let manualCount = null;
  try {
    const rawManual = localStorage.getItem(MANUAL_LETTERS_COUNT_KEY);
    if (rawManual !== null) {
      manualCount = parseInt(rawManual, 10);
      if (isNaN(manualCount) || manualCount < 0) manualCount = null;
    }
  } catch {}

  const progress = storageService.getProgress();
  const completedLessonsCount = Object.keys(progress.completedLessons || {}).length;

  // Если ручная настройка задана — используем её, иначе берём максимум между SRS и завершенными уроками
  let learnedLettersCount = manualCount !== null
    ? manualCount
    : Math.max(srsLearned.length, progress.completedLessons['alphabet'] ? 28 : 0);

  // Если 0 букв, по умолчанию ставим 8 букв для демонстрации или минимум 4
  if (learnedLettersCount === 0 && completedLessonsCount > 0) {
    learnedLettersCount = Math.min(28, completedLessonsCount * 2);
  }

  // Ограничиваем 0..28
  learnedLettersCount = Math.max(1, Math.min(28, learnedLettersCount));

  // Определяем рекомендуемый уровень на основе числа букв и уроков
  let autoLevelId = 1;
  if (completedLessonsCount >= 30) {
    autoLevelId = 11;
  } else if (completedLessonsCount >= 18) {
    autoLevelId = 10;
  } else if (completedLessonsCount >= 6) {
    autoLevelId = 9;
  } else if (completedLessonsCount >= 2 || learnedLettersCount >= 28) {
    autoLevelId = 8;
  } else {
    // Внутри алфавита 1..7
    const matched = GAME_LEVELS.filter(gl => gl.category === 'alphabet' && learnedLettersCount >= gl.maxLetters);
    if (matched.length > 0) {
      autoLevelId = matched[matched.length - 1].id;
    } else {
      autoLevelId = 1;
    }
  }

  // Проверяем выбранный пользователем уровень
  let selectedLevelId = autoLevelId;
  try {
    const saved = localStorage.getItem(PREFERRED_LEVEL_KEY);
    if (saved) {
      const parsedId = parseInt(saved, 10);
      if (GAME_LEVELS.some(gl => gl.id === parsedId)) {
        selectedLevelId = parsedId;
      }
    }
  } catch {}

  const currentLevel = GAME_LEVELS.find(gl => gl.id === selectedLevelId) || GAME_LEVELS[0];

  return {
    learnedLettersCount,
    totalLetters: 28,
    percent: Math.round((learnedLettersCount / 28) * 100),
    autoLevelId,
    selectedLevelId,
    currentLevel,
    completedLessonsCount,
    totalLessons: 41
  };
}

// Установить активный уровень для всех игр
export function setUserGameLevel(levelId) {
  try {
    localStorage.setItem(PREFERRED_LEVEL_KEY, String(levelId));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('muallim-level-changed', { detail: { levelId } }));
    }
  } catch {}
}

// Задать количество освоенных букв (например, 8 из 28)
export function setUserLearnedLettersCount(count) {
  try {
    const clamped = Math.max(1, Math.min(28, Number(count) || 1));
    localStorage.setItem(MANUAL_LETTERS_COUNT_KEY, String(clamped));

    // Автоматически переключаем на подходящий уровень алфавита
    const matched = GAME_LEVELS.filter(gl => gl.category === 'alphabet' && clamped >= gl.maxLetters);
    const newLvl = matched.length > 0 ? matched[matched.length - 1].id : 1;
    setUserGameLevel(newLvl);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('muallim-level-changed', { detail: { levelId: newLvl, count: clamped } }));
    }
  } catch {}
}

// Получить буквы, входящие в выбранный уровень
export function getLettersForLevel(level) {
  if (!level) return ALPHABET_DATA.slice(0, 8);
  if (level.letterIds && level.letterIds.length > 0) {
    return ALPHABET_DATA.filter(l => level.letterIds.includes(l.id));
  }
  return ALPHABET_DATA;
}

// Получить слова, подходящие для выбранного уровня
export function getWordsForLevel(level) {
  const wordsWithTr = ALL_WORDS.filter(w => {
    const tr = transcribeArabic(w);
    return tr && tr.length >= 2 && w.length >= 3;
  });

  if (!level || level.category === 'alphabet') {
    // Для уровней алфавита берём только самые простые слова из изученных букв
    const letterIds = level?.letterIds || [1, 2, 3, 4, 5, 6, 7, 8];
    const allowedLetters = ALPHABET_DATA.filter(l => letterIds.includes(l.id)).map(l => l.arabic);
    const simple = wordsWithTr.filter(w => {
      const cleanChars = w.replace(/[\u064B-\u065F\u0670\u06D6-\u06ED()=ـ\s]/g, '').split('');
      return cleanChars.every(c => allowedLetters.includes(c));
    });
    return simple.length >= 6 ? simple : wordsWithTr.slice(0, 15);
  }

  if (level.filterType === 'fatha') {
    // Слова преимущественно с фатхой (без ташдида и танвина)
    const fathaWords = wordsWithTr.filter(w => !w.includes('\u0651') && !/[\u064B\u064C\u064D]/.test(w) && w.length <= 6);
    return fathaWords.length >= 10 ? fathaWords : wordsWithTr.slice(0, 20);
  }

  if (level.filterType === 'harakat_sukun') {
    // Слова с сукуном ( ْ )
    const sukunWords = wordsWithTr.filter(w => w.includes('\u0652') || (!w.includes('\u0651') && w.length <= 6));
    return sukunWords.length >= 10 ? sukunWords : wordsWithTr.slice(0, 20);
  }

  if (level.filterType === 'tashdid_madd') {
    // Слова с ташдидом ( ّ ) или танвином
    const tashdidWords = wordsWithTr.filter(w => w.includes('\u0651') || /[\u064B\u064C\u064D]/.test(w));
    return tashdidWords.length >= 10 ? tashdidWords : wordsWithTr.slice(0, 25);
  }

  return wordsWithTr;
}
