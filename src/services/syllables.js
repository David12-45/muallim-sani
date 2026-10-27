// Сервис разбивки арабских слов книги «Му'аллим Сани» на слоги для начинающих
// и формирования понятной слоговой русской транскрипции

import { splitIntoClusters } from './wordAnalyzer.js';
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

const VOWEL_MARKS = new Set([
  FATHA, DAMMA, KASRA,
  FATHATAN, DAMMATAN, KASRATAN,
  DAGGER_ALIF, SUB_ALEF, INV_DAMMA
]);

// Упрощение сложной академической транскрипции для начинающих учеников
export function simplifyForBeginner(text) {
  if (!text) return '';
  return text
    .replace(/[’‘]/g, '')
    .replace(/с̱/g, 'с')
    .replace(/х̣/g, 'х')
    .replace(/х̮/g, 'х')
    .replace(/з̱/g, 'з')
    .replace(/с̣/g, 'с')
    .replace(/д̣/g, 'д')
    .replace(/т̣/g, 'т')
    .replace(/з̣/g, 'з')
    .replace(/к̣/g, 'к')
    .replace(/һ/g, 'х')
    .replace(/а̄/g, 'а')
    .replace(/ӣ/g, 'и')
    .replace(/ӯ/g, 'у')
    .trim();
}

/**
 * Разбивает арабское слово на массив арабских слогов.
 * Пример: 'اَمَرَ' -> ['اَ', 'مَ', 'رَ']
 * Пример: 'مَرْمَرْ' -> ['مَرْ', 'مَرْ']
 * Пример: 'رَبِّ' -> ['رَبْ', 'بِ']
 */
export function splitArabicIntoSyllables(rawWord) {
  const cleanWord = String(rawWord || '').replace(/[()=ـ\u200D]/g, '').trim();
  if (!cleanWord) return [];

  const clusters = splitIntoClusters(cleanWord).filter(c => c.base !== ' ');
  if (clusters.length === 0) return [];
  if (clusters.length === 1) {
    return [clusters[0].base + clusters[0].marks.join('')];
  }

  const syllables = [];
  let current = [];

  for (let i = 0; i < clusters.length; i++) {
    const c = clusters[i];
    const hasShadda = c.marks.includes(SHADDA);
    const hasSukun = c.marks.includes(SUKUN);
    const hasVowel = c.marks.some(m => VOWEL_MARKS.has(m));
    const isMaddLetter = (c.base === 'ا' || c.base === 'و' || c.base === 'ي' || c.base === 'ى') && c.marks.length === 0;

    if (hasShadda) {
      // Ташдид (удвоение): первая согласная с сукуном закрывает текущий слог,
      // вторая согласная с гласной начинает следующий слог
      const part1 = { base: c.base, marks: [SUKUN] };
      const remainingMarks = c.marks.filter(m => m !== SHADDA);
      const part2 = { base: c.base, marks: remainingMarks };

      current.push(part1);
      syllables.push(current);
      current = [part2];
    } else if (hasSukun || isMaddLetter) {
      // Сукун или буква продления (мадд) примыкает к текущему слогу и закрывает его
      current.push(c);
      syllables.push(current);
      current = [];
    } else if (hasVowel) {
      if (current.length > 0) {
        // Если в текущем слоге уже есть огласованная буква, то новая огласовка открывает следующий слог
        const currentHasVowel = current.some(x => x.marks.some(m => VOWEL_MARKS.has(m)));
        if (currentHasVowel) {
          syllables.push(current);
          current = [c];
        } else {
          current.push(c);
        }
      } else {
        current.push(c);
      }
    } else {
      current.push(c);
    }
  }

  if (current.length > 0) {
    syllables.push(current);
  }

  return syllables.map(s => s.map(c => c.base + c.marks.join('')).join(''));
}

/**
 * Возвращает полный слоговой анализ слова для начинающего
 * {
 *   arabicSyllables: ['اَ', 'مَ', 'رَ'],
 *   arabicFormatted: 'اَ · مَ · رَ',
 *   russianSyllables: ['а', 'ма', 'ра'],
 *   russianFormatted: 'а · ма · ра',
 *   standardTranscription: 'амара'
 * }
 */
export function getWordReadingHelper(rawWord) {
  const cleanWord = String(rawWord || '').replace(/[()=ـ\u200D]/g, '').trim();
  if (!cleanWord) {
    return {
      arabicSyllables: [],
      arabicFormatted: '',
      russianSyllables: [],
      russianFormatted: '',
      standardTranscription: ''
    };
  }

  const arabicSyllables = splitArabicIntoSyllables(cleanWord);
  const standardTranscription = transcribeArabic(cleanWord);

  const russianSyllables = arabicSyllables.map(syl => {
    const rawSylTrans = transcribeArabic(syl);
    return simplifyForBeginner(rawSylTrans);
  });

  return {
    arabicSyllables,
    arabicFormatted: arabicSyllables.join(' · '),
    russianSyllables,
    russianFormatted: russianSyllables.join(' · '),
    standardTranscription
  };
}
