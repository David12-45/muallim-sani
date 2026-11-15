// Собирает все арабские тексты, которым нужна озвучка, в scripts/tts_texts.json
// Запуск: npm run tts:collect
import { writeFileSync, readFileSync } from 'node:fs';
import { ALL_LESSONS, ALL_WORDS } from '../src/data/book.js';
import { ALPHABET_DATA } from '../src/data/alphabet.js';
import { FATIHA_VERSES } from '../src/data/fatiha.js';
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

// 1. Все слова и слоги из уроков книги
ALL_WORDS.forEach(add);
ALL_LESSONS.forEach((l) => {
  (l.pairs || []).flat().forEach((p) => {
    add(p);
    String(p).split(/\s+/).forEach(add);
  });
  (l.headerForms || []).forEach((hf) => {
    String(hf).split(/\s+/).forEach(add);
  });
  (l.rows || []).forEach((row) => {
    String(row).split(/\s+/).forEach(add);
  });
});

// 2. Примеры из алфавита
ALPHABET_DATA.forEach((l) => (l.examples || []).forEach(add));

// 3. Все слова и аяты из суры Аль-Фатиха
FATIHA_VERSES.forEach((v) => {
  add(v.arabic);
  (v.words || []).forEach((w) => add(w.arabic));
});

// 4. Все слоги из игр
allSyllables().forEach(add);

// 5. Все наглядные примеры из LessonsView.jsx и RuleVisualGuide.jsx
const extraFiles = [
  new URL('../src/components/LessonsView.jsx', import.meta.url),
  new URL('../src/components/RuleVisualGuide.jsx', import.meta.url)
];
for (const fileUrl of extraFiles) {
  const src = readFileSync(fileUrl, 'utf8');
  const matches = src.matchAll(/(?:arabic|audio)\s*:\s*['"]([^'"]+)['"]/g);
  for (const m of matches) {
    add(m[1]);
  }
}

const items = [...texts].map((text) => ({ id: ttsId(text), text }));
const ids = new Set();
items.forEach((it) => {
  if (ids.has(it.id)) throw new Error(`Коллизия хэша: ${it.text}`);
  ids.add(it.id);
});

writeFileSync(new URL('./tts_texts.json', import.meta.url), JSON.stringify(items, null, 1), 'utf8');
console.log(`Собрано текстов: ${items.length}`);
