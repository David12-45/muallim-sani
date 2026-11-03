// Собирает все арабские тексты, которым нужна озвучка, в scripts/tts_texts.json
// Запуск: npm run tts:collect
import { writeFileSync } from 'node:fs';
import { ALL_LESSONS, ALL_WORDS } from '../src/data/book.js';
import { ALPHABET_DATA } from '../src/data/alphabet.js';
import { allSyllables } from '../src/components/games/gameData.js';
import { ttsKey, ttsId } from '../src/services/audio.js';

const LETTER_ONLY = /^[\u0621-\u064A]$/;

const texts = new Set();
const add = (t) => {
  const k = ttsKey(t);
  if (!k || !/[\u0621-\u064A]/.test(k)) return;
  // одиночные буквы без огласовок уже озвучены студийными записями
  if (LETTER_ONLY.test(k)) return;
  texts.add(k);
};

ALL_WORDS.forEach(add);
ALL_LESSONS.forEach((l) => {
  (l.pairs || []).flat().forEach(add);
});
ALPHABET_DATA.forEach((l) => (l.examples || []).forEach(add));
allSyllables().forEach(add);

const items = [...texts].map((text) => ({ id: ttsId(text), text }));
const ids = new Set();
items.forEach((it) => {
  if (ids.has(it.id)) throw new Error(`Коллизия хэша: ${it.text}`);
  ids.add(it.id);
});

writeFileSync(new URL('./tts_texts.json', import.meta.url), JSON.stringify(items, null, 1), 'utf8');
console.log(`Собрано текстов: ${items.length}`);
