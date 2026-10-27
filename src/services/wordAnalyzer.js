// Сервис побуквенного разбора арабских слов и цветовой подсветки правил Таджвида
import { ALPHABET_DATA } from '../data/alphabet.js';
import { transcribeArabic } from './transcribe.js';

const FATHA = '\u064E';
const DAMMA = '\u064F';
const KASRA = '\u0650';
const FATHATAN = '\u064B';
const DAMMATAN = '\u064C';
const KASRATAN = '\u064D';
const SUKUN = '\u0652';
const SHADDA = '\u0651';
const DAGGER_ALIF = '\u0670';
const SUB_ALEF = '\u0656';
const INV_DAMMA = '\u0657';
const MADDAH = '\u0653';

const DIACRITICS = new Set([
  FATHA, DAMMA, KASRA,
  FATHATAN, DAMMATAN, KASRATAN,
  SUKUN, SHADDA, DAGGER_ALIF, SUB_ALEF, INV_DAMMA, MADDAH,
  '\u0654', '\u0655'
]);

// Буквы, которые НЕ соединяются со следующей буквой слева
const NON_CONNECTING_LEFT = new Set([
  'ا', 'أ', 'إ', 'آ', 'ٱ', 'ى',
  'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ء', 'ة'
]);

// Буквы, которые НЕ принимают соединение справа (от предыдущей буквы)
const NON_CONNECTING_RIGHT = new Set([
  'ء'
]);

// 5 букв Калькаля (ق ط ب ج د)
const QALQALAH_LETTERS = new Set(['ق', 'ط', 'ب', 'ج', 'د']);

// Цветовая схема правил Таджвида
export const TAJWEED_RULES_META = {
  madd: {
    id: 'madd',
    label: 'Мадд (удлинение гласной)',
    shortLabel: 'Мадд (2–4 счёта)',
    textClass: 'text-sky-600 dark:text-sky-400',
    bgClass: 'bg-sky-50 dark:bg-sky-950/60 border-sky-200 dark:border-sky-800',
    badgeClass: 'bg-sky-100 text-sky-800 dark:bg-sky-900/70 dark:text-sky-200',
    description: 'Долгий гласный звук (тянется на 2 счёта, а со знаком волны ٓ перед хамзой — на 4–5 счётов).'
  },
  tashdid: {
    id: 'tashdid',
    label: 'Ташдид (удвоение согласной)',
    shortLabel: 'Ташдид (ّ)',
    textClass: 'text-purple-600 dark:text-purple-400',
    bgClass: 'bg-purple-50 dark:bg-purple-950/60 border-purple-200 dark:border-purple-800',
    badgeClass: 'bg-purple-100 text-purple-800 dark:bg-purple-900/70 dark:text-purple-200',
    description: 'Буква со знаком шадда ( ّ ) произносится удвоенно с задержкой голоса (как две буквы: первая с сукуном, вторая с огласовкой).'
  },
  tanwin: {
    id: 'tanwin',
    label: 'Танвин (нунация -ан/-ин/-ун)',
    shortLabel: 'Танвин (ً ٍ ٌ)',
    textClass: 'text-amber-600 dark:text-amber-400',
    bgClass: 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900/70 dark:text-amber-200',
    description: 'Двойная огласовка на конце слова, добавляющая немой звук «н» (-ан, -ин, -ун).'
  },
  qalqalah: {
    id: 'qalqalah',
    label: 'Калькаля (сотрясение звука)',
    shortLabel: 'Калькаля (ق ط ب ج د)',
    textClass: 'text-rose-600 dark:text-rose-400',
    bgClass: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
    badgeClass: 'bg-rose-100 text-rose-800 dark:bg-rose-900/70 dark:text-rose-200',
    description: 'Буква из пятёрки «Кутб Джад» (ق ط ب ج د) с сукуном произносится с лёгким упругим отскоком (сотрясением).'
  },
  silent: {
    id: 'silent',
    label: 'Нечитаемая / ассимилируемая буква',
    shortLabel: 'Не читается',
    textClass: 'text-slate-400 dark:text-slate-500',
    bgClass: 'bg-slate-100 dark:bg-slate-800/80 border-slate-300 dark:border-slate-700',
    badgeClass: 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300',
    description: 'Эта буква пишется по правилам орфографии (или входит в солнечный артикль Аль), но сама вслух не произносится.'
  }
};

function findLetterMeta(baseChar) {
  const normalized =
    baseChar === 'أ' || baseChar === 'إ' || baseChar === 'آ' || baseChar === 'ٱ'
      ? 'ا'
      : baseChar === 'ى'
      ? 'ي'
      : baseChar === 'ه'
      ? 'هـ'
      : baseChar;

  const found = ALPHABET_DATA.find(
    l => l.arabic === normalized || l.arabic === baseChar || l.forms?.isolated === baseChar
  );
  if (found) return found;

  if (baseChar === 'ة') {
    return {
      name: 'Та-марбута',
      arabicName: 'تَاء مَرْبُوطَة',
      makhraj: 'Кончик языка (при огласовке = ت) / гортань (при остановке = ه)',
      soundType: 'мягкая'
    };
  }
  if (baseChar === 'ء' || baseChar === 'ؤ' || baseChar === 'ئ') {
    return {
      name: 'Хамза',
      arabicName: 'هَمْزَة',
      makhraj: 'Нижняя часть гортани (гортанная смычка)',
      soundType: 'мягкая'
    };
  }
  return {
    name: 'Буква',
    arabicName: baseChar,
    makhraj: 'По общему правилу махраджа',
    soundType: 'мягкая'
  };
}

// Разбивает слово (или словосочетание) на кластеры (базовая буква + огласовки)
export function splitIntoClusters(rawWord) {
  const clean = String(rawWord || '').replace(/[()=\u200D]/g, '').trim();
  const tokens = [];
  let pendingLeadingTatweel = false;

  for (const ch of clean) {
    if (ch === 'ـ') {
      if (tokens.length > 0) {
        tokens[tokens.length - 1].trailingTatweel = true;
      } else {
        pendingLeadingTatweel = true;
      }
      continue;
    }
    if (DIACRITICS.has(ch)) {
      if (tokens.length > 0) {
        tokens[tokens.length - 1].marks.push(ch);
      }
    } else {
      tokens.push({
        base: ch,
        marks: [],
        leadingTatweel: pendingLeadingTatweel,
        trailingTatweel: false
      });
      pendingLeadingTatweel = false;
    }
  }
  return tokens;
}

// Полный побуквенный разбор слова для учебной карточки и подсветки Таджвида
export function analyzeArabicWord(rawWord) {
  const cleanWord = String(rawWord || '').replace(/[()=]/g, '').trim();
  const tokens = splitIntoClusters(cleanWord).filter(t => t.base !== ' ');
  const total = tokens.length;

  const letters = tokens.map((tok, i) => {
    const prev = tokens[i - 1];
    const next = tokens[i + 1];
    const b = tok.base;
    const m = tok.marks;
    const rawCluster = b + m.join('');

    const hasFatha = m.includes(FATHA);
    const hasDamma = m.includes(DAMMA);
    const hasKasra = m.includes(KASRA);
    const hasFathatan = m.includes(FATHATAN);
    const hasDammatan = m.includes(DAMMATAN);
    const hasKasratan = m.includes(KASRATAN);
    const hasSukun = m.includes(SUKUN);
    const hasShadda = m.includes(SHADDA);
    const hasDaggerAlif = m.includes(DAGGER_ALIF);
    const hasSubAlef = m.includes(SUB_ALEF);
    const hasInvDamma = m.includes(INV_DAMMA);
    const hasMaddah = m.includes(MADDAH);
    const hasAnyVowel =
      hasFatha || hasDamma || hasKasra ||
      hasFathatan || hasDammatan || hasKasratan ||
      hasDaggerAlif || hasSubAlef || hasInvDamma;

    // Определяем соединение справа и слева для позиции в слове
    const connectsFromRight =
      !NON_CONNECTING_RIGHT.has(b) &&
      ((i > 0 && !NON_CONNECTING_LEFT.has(prev.base)) || (total === 1 && tok.leadingTatweel));
    const connectsToLeft =
      !NON_CONNECTING_LEFT.has(b) &&
      ((i < total - 1 && !NON_CONNECTING_RIGHT.has(next.base)) || (total === 1 && tok.trailingTatweel));

    let position = 'isolated';
    let positionLabel = 'Отдельно';
    let shortPositionLabel = 'отд.';
    let displayForm = rawCluster;

    if (!connectsFromRight && connectsToLeft) {
      position = 'initial';
      positionLabel = i === 0 ? 'В начале слова' : 'Начальная форма (после несоед.)';
      shortPositionLabel = 'в нач.';
      displayForm = `${rawCluster}ـ`;
    } else if (connectsFromRight && connectsToLeft) {
      position = 'medial';
      positionLabel = 'В середине слова';
      shortPositionLabel = 'в сер.';
      displayForm = `ـ${rawCluster}ـ`;
    } else if (connectsFromRight && !connectsToLeft) {
      position = 'final';
      positionLabel = i === total - 1 ? 'В конце слова' : 'Конечная форма (не соед. влево)';
      shortPositionLabel = 'в конце';
      displayForm = `ـ${rawCluster}`;
    } else {
      position = 'isolated';
      positionLabel = total === 1 ? 'Отдельно' : i === 0 ? 'В начале (не соед. влево)' : 'Обособленно в слове';
      shortPositionLabel = i === 0 && total > 1 ? 'в нач.' : i === total - 1 && total > 1 ? 'в конце' : 'отд.';
      displayForm = rawCluster;
    }

    // Кластер с Zero-Width Joiner (\u200D) по краям соединения, чтобы цветные <span> не рвали вязь в браузере
    const joinedCluster = `${connectsFromRight ? '\u200D' : ''}${rawCluster}${connectsToLeft ? '\u200D' : ''}`;

    // Описание огласовки
    const markDescriptions = [];
    if (hasShadda) markDescriptions.push('Ташдид ( ّ — удвоение)');
    if (hasMaddah) markDescriptions.push('Мадда ( ٓ — долгое протягивание)');
    if (hasFatha) markDescriptions.push('Фатха ( َ — звук «а»)');
    if (hasKasra) markDescriptions.push('Кясра ( ِ — звук «и»)');
    if (hasDamma) markDescriptions.push('Дамма ( ُ — звук «у»)');
    if (hasDaggerAlif) markDescriptions.push('Вертикальная фатха ( ٰ — долгий «а̄»)');
    if (hasSubAlef) markDescriptions.push('Вертикальная кясра ( ٖ — долгий «ӣ»)');
    if (hasInvDamma) markDescriptions.push('Перевёрнутая дамма ( ٗ — долгий «ӯ»)');
    if (hasFathatan) markDescriptions.push('Танвин фатха ( ً — окончание «-ан»)');
    if (hasKasratan) markDescriptions.push('Танвин кясра ( ٍ — окончание «-ин»)');
    if (hasDammatan) markDescriptions.push('Танвин дамма ( ٌ — окончание «-ун»)');
    if (hasSukun) markDescriptions.push('Сукун ( ْ — без гласной)');

    // Определяем правило Таджвида для этой буквы
    let tajweedRule = null;

    // 1. Нечитаемые буквы (подставка для танвина фатха, алиф после вава мн.ч., солнечный лям)
    const isTanwinAlifSupport = b === 'ا' && i > 0 && prev && prev.marks.includes(FATHATAN);
    const isSilentPluralAlif = b === 'ا' && i === total - 1 && prev && prev.base === 'و' && !hasAnyVowel && !hasSukun;
    const isSunLam =
      b === 'ل' &&
      i === 1 &&
      (tokens[0].base === 'ا' || tokens[0].base === 'ٱ') &&
      !hasAnyVowel &&
      !hasSukun &&
      next &&
      next.marks.includes(SHADDA);
    const isSilentWawUlu =
      b === 'و' && i === 1 && tokens[0].base === 'ا' && tokens[0].marks.includes(DAMMA) && !hasAnyVowel && !hasSukun && next && (next.base === 'ل');

    if (isTanwinAlifSupport || isSilentPluralAlif || isSunLam || isSilentWawUlu) {
      tajweedRule = 'silent';
      if (isSunLam) {
        markDescriptions.push('Солнечная ассимиляция (Идгам шамсийя — Лям не читается)');
      } else {
        markDescriptions.push('Пишется, но не читается');
      }
    } else if (hasShadda) {
      tajweedRule = 'tashdid';
    } else if (hasFathatan || hasKasratan || hasDammatan) {
      tajweedRule = 'tanwin';
    } else if (hasSukun && QALQALAH_LETTERS.has(b)) {
      tajweedRule = 'qalqalah';
    } else if (
      hasMaddah ||
      hasDaggerAlif ||
      hasSubAlef ||
      hasInvDamma ||
      (b === 'ا' && i > 0 && prev && prev.marks.includes(FATHA) && !hasAnyVowel && !hasSukun) ||
      (b === 'و' && i > 0 && prev && prev.marks.includes(DAMMA) && !hasAnyVowel && !hasSukun) ||
      ((b === 'ي' || b === 'ى') && i > 0 && prev && (prev.marks.includes(KASRA) || prev.marks.includes(FATHA)) && !hasAnyVowel && !hasSukun)
    ) {
      tajweedRule = 'madd';
      if (markDescriptions.length === 0) {
        markDescriptions.push('Буква продления Мадд (тянет предыдущую гласную на 2 счёта)');
      }
    }

    if (markDescriptions.length === 0) {
      markDescriptions.push('Без огласовки');
    }

    const meta = findLetterMeta(b);
    const singleSound = transcribeArabic(rawCluster);

    return {
      index: i,
      base: b,
      marks: m,
      rawCluster,
      joinedCluster,
      displayForm,
      position,
      positionLabel,
      shortPositionLabel,
      connectsFromRight,
      connectsToLeft,
      letterName: meta.name,
      arabicName: meta.arabicName,
      makhraj: meta.makhraj,
      soundType: meta.soundType,
      vowelLabel: markDescriptions.join(' + '),
      sound: singleSound,
      tajweedRule,
      tajweedMeta: tajweedRule ? TAJWEED_RULES_META[tajweedRule] : null
    };
  });

  // Собираем список всех сработавших правил таджвида в этом слове
  const activeRules = [];
  const seenRuleIds = new Set();
  for (const l of letters) {
    if (l.tajweedRule && !seenRuleIds.has(l.tajweedRule)) {
      seenRuleIds.add(l.tajweedRule);
      activeRules.push(TAJWEED_RULES_META[l.tajweedRule]);
    }
  }

  return {
    word: cleanWord,
    transcription: transcribeArabic(cleanWord),
    letters,
    activeRules
  };
}
