// Автоматическая фонетическая транскрипция огласованных слов книги «Му'аллим Сани» на русский язык

const CONSONANT_MAP = {
  'ء': '’',
  'أ': '',
  'إ': '',
  'ؤ': '’',
  'ئ': '’',
  'آ': 'а̄',
  'ا': '',
  'ٱ': '',
  'ب': 'б',
  'ت': 'т',
  'ة': 'т',
  'ث': 'с̱',
  'ج': 'дж',
  'ح': 'х̣',
  'خ': 'х̮',
  'د': 'д',
  'ذ': 'з̱',
  'ر': 'р',
  'ز': 'з',
  'س': 'с',
  'ش': 'ш',
  'ص': 'с̣',
  'ض': 'д̣',
  'ط': 'т̣',
  'ظ': 'з̣',
  'ع': '‘',
  'غ': 'г',
  'ف': 'ф',
  'ق': 'к̣',
  'ك': 'к',
  'ل': 'л',
  'م': 'м',
  'ن': 'н',
  'ه': 'һ',
  'و': 'в',
  'ي': 'й',
  'ى': 'й'
};

// Твёрдые согласные (влияют на оттенок гласных и не смягчают ل)
const EMPHATIC = new Set(['ص', 'ض', 'ط', 'ظ', 'ق', 'خ', 'غ', 'ر']);

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

// Справочник особых коранических слов из стр. 38–48
const SPECIAL_OVERRIDES = {
  'اِلٰهٌ': 'иля̄һун',
  'اِلَاهٌ': 'иля̄һун',
  'رَحْمٰنُ': 'рах̣ма̄ну',
  'قُرْاٰنْ': 'к̣ур’а̄н',
  'هٰذَا': 'һа̄з̱а̄',
  'هٰذِهٖ': 'һа̄з̱иһӣ',
  'ذٰلِكَ': 'з̱а̄лика',
  'هٰؤُلَاءِ': 'һа̄’уля̄’и',
  'هٰٓؤُلَآءِ': 'һа̄’уля̄’и',
  'لٰكِنْ': 'ля̄кин',
  'اٰمَنَ': 'а̄мана',
  'اٰدَمُ': 'а̄даму',
  'اٰمَنَّا': 'а̄манна̄',
  'اِبْرٰهِيمْ': 'ибра̄һӣм',
  'اِسْمٰعِيلْ': 'исма̄‘ӣль',
  'اِسْحٰقْ': 'исх̣а̄к̣',
  'بِهٖ': 'биһӣ',
  'بِهِى': 'биһӣ',
  'بِاَمْرِهٖ': 'би-амриһӣ',
  'بِحُكْمِهٖ': 'би-х̣укмиһӣ',
  'بِقُدْرَتِهٖ': 'би-к̣удратиһӣ',
  'لَهُ': 'ляһӯ',
  'لَهُو': 'ляһӯ',
  'اَمْرُهُ': 'амруһӯ',
  'حُكْمُهُ': 'х̣укмуһӯ',
  'قُدْرَتُهُ': 'к̣удратуһӯ',
  'مَالُهُ': 'ма̄люһӯ',
  'دَاوُدْ': 'да̄вӯд',
  'طَاوُسْ': 'т̣а̄вӯс',
  'رُؤُسْ': 'ру’ӯс',
  'يَقْرَؤُنَ': 'як̣ра’ӯна',
  'صَلٰوةْ': 'с̣аля̄т',
  'صَلَاةْ': 'с̣аля̄т',
  'زَكٰوةْ': 'закя̄т',
  'ذَكٰوةْ': 'з̱акя̄т',
  'حَيٰوةْ': 'х̣айа̄т',
  'غَدٰوةْ': 'гада̄т',
  'رِبٰوا': 'риба̄',
  'اُولُو': 'улӯ',
  'اُولِى': 'улӣ',
  'اُولَاتِ': 'уля̄ти',
  'اُولَاءِ': 'уля̄’и',
  'اُولٰٓئِكَ': 'уля̄’ика',
  'اَلْاُولَى': 'аль-ӯля̄',
  'اٰمَنُوا': 'а̄манӯ',
  'اٰمِنُوا': 'а̄минӯ',
  'قَالُوا': 'к̣а̄лю̄',
  'اِعْلَمُوا': 'и‘лямӯ',
  'اِعْمَلُوا': 'и‘малю̄',
  'اللّٰهِ': 'Лла̄һи',
  'لِلّٰهِ': 'лилля̄һи',
  'لا': 'ля̄'
};

export function transcribeArabic(rawText) {
  if (!rawText) return '';
  const trimmed = rawText.trim();
  if (SPECIAL_OVERRIDES[trimmed]) return SPECIAL_OVERRIDES[trimmed];

  // Если фраза из нескольких слов, транскрибируем пословно
  if (trimmed.includes(' ')) {
    return trimmed
      .split(/\s+/)
      .map(w => transcribeArabic(w))
      .join(' ');
  }

  // Разбиваем слово на токены: базовый символ + массив его диакритик
  const tokens = [];
  for (const ch of trimmed) {
    if (DIACRITICS.has(ch)) {
      if (tokens.length > 0) {
        tokens[tokens.length - 1].marks.push(ch);
      }
    } else {
      tokens.push({ base: ch, marks: [] });
    }
  }

  if (tokens.length === 0) return '';

  // Если это одиночная буква без огласовок
  if (tokens.length === 1 && tokens[0].marks.length === 0) {
    const b = tokens[0].base;
    return CONSONANT_MAP[b] || b;
  }

  let result = '';

  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i];
    const next = tokens[i + 1];
    const prev = tokens[i - 1];
    const b = tok.base;
    const m = tok.marks;

    const hasFatha = m.includes(FATHA);
    const hasDamma = m.includes(DAMMA) || m.includes(INV_DAMMA);
    const hasKasra = m.includes(KASRA) || m.includes(SUB_ALEF);
    const hasFathatan = m.includes(FATHATAN);
    const hasDammatan = m.includes(DAMMATAN);
    const hasKasratan = m.includes(KASRATAN);
    const hasSukun = m.includes(SUKUN);
    const hasShadda = m.includes(SHADDA);
    const hasDaggerAlif = m.includes(DAGGER_ALIF);
    const hasMaddah = m.includes(MADDAH);
    const hasAnyVowel = hasFatha || hasDamma || hasKasra || hasFathatan || hasDammatan || hasKasratan || hasDaggerAlif;

    // 1. Обработка артикля ال (солнечная ассимиляция)
    if (
      b === 'ل' &&
      i === 1 &&
      (tokens[0].base === 'ا' || tokens[0].base === 'ٱ') &&
      !hasAnyVowel &&
      !hasSukun &&
      next &&
      next.marks.includes(SHADDA)
    ) {
      // Лям перед солнечной буквой не читается, удваивается следующая
      continue;
    }

    // 2. Буква Алиф
    if (b === 'ا' || b === 'أ' || b === 'إ' || b === 'ٱ') {
      if (b === 'آ' || (hasMaddah && i === 0)) {
        result += 'а̄';
        continue;
      }
      if (i === 0) {
        // В начале слова
        if (hasFatha) result += 'а';
        else if (hasKasra) result += 'и';
        else if (hasDamma) result += 'у';
        else if (hasFathatan) result += 'ан';
        else if (hasKasratan) result += 'ин';
        else if (hasDammatan) result += 'ун';
        else if (next && next.base === 'ل') result += 'а';
        continue;
      }
      // Алиф после танвина фатха (например بًا) — просто подставка
      if (prev && prev.marks.includes(FATHATAN)) {
        continue;
      }
      // Нечитаемый алиф после вав мн. числа (قَالُوا)
      if (prev && prev.base === 'و' && !hasAnyVowel && i === tokens.length - 1) {
        continue;
      }
      // Если на алифе сукун или хамза с огласовкой внутри слова (رَاْيُ، قَرَاَ)
      if (hasSukun) {
        result += '’';
        continue;
      }
      if (hasFatha || hasDamma || hasKasra) {
        result += '’';
        if (hasFatha) result += 'а';
        else if (hasKasra) result += 'и';
        else if (hasDamma) result += 'у';
        continue;
      }
      if (hasFathatan) {
        result += '’ан';
        continue;
      }
      // Обычный мадд алиф после фатхи
      if (prev && prev.marks.includes(FATHA)) {
        // Заменяем последнюю 'а'/'я' на долгую 'а̄'/'я̄'
        if (result.endsWith('я')) {
          result = result.slice(0, -1) + 'я̄';
        } else if (result.endsWith('а')) {
          result = result.slice(0, -1) + 'а̄';
        } else {
          result += 'а̄';
        }
        continue;
      }
      continue;
    }

    // 3. Проверка на буквы мадд Вав (و) и Йа (ي / ى)
    if (b === 'و' && !hasShadda && (!hasAnyVowel && !hasSukun) && prev && prev.marks.includes(DAMMA)) {
      if (result.endsWith('у')) {
        result = result.slice(0, -1) + 'ӯ';
      } else if (result.endsWith('ю')) {
        result = result.slice(0, -1) + 'ю̄';
      } else {
        result += 'ӯ';
      }
      continue;
    }

    if ((b === 'ي' || b === 'ى') && !hasShadda && (!hasAnyVowel && !hasSukun)) {
      if (prev && (prev.marks.includes(KASRA) || prev.marks.includes(SUB_ALEF))) {
        if (result.endsWith('и')) {
          result = result.slice(0, -1) + 'ӣ';
        } else {
          result += 'ӣ';
        }
        continue;
      }
      // Алиф максура после фатхи (إِلَى، عَلَى، مُوسَى)
      if (prev && prev.marks.includes(FATHA)) {
        if (result.endsWith('а')) {
          result = result.slice(0, -1) + 'а̄';
        } else if (result.endsWith('я')) {
          result = result.slice(0, -1) + 'я̄';
        } else {
          result += 'а̄';
        }
        continue;
      }
    }

    // 4. Согласный звук
    let cons = CONSONANT_MAP[b] ?? '';

    // Та-марбута с сукуном (при вакфе) читается как 'һ'
    if (b === 'ة' && hasSukun) {
      cons = 'һ';
    }

    // Удвоение согласного при ташдиде
    if (hasShadda && cons) {
      result += cons + cons;
    } else {
      result += cons;
    }

    // 5. Гласный звук после согласного
    const isSoftLam = b === 'ل' && !hasFatha && !hasFathatan;
    if (hasFatha) {
      result += b === 'ل' ? 'ля' : (b === 'ي' ? 'я' : 'а');
      if (hasDaggerAlif) {
        result = result.slice(0, -1) + (b === 'ل' ? 'ля̄' : 'а̄');
      }
    } else if (hasDaggerAlif) {
      result += b === 'ل' ? 'ля̄' : 'а̄';
    } else if (hasKasra) {
      result += 'и';
    } else if (hasDamma) {
      result += b === 'ل' ? 'лю' : (b === 'ي' ? 'ю' : 'у');
    } else if (hasFathatan) {
      result += b === 'ل' ? 'лян' : 'ан';
    } else if (hasKasratan) {
      result += 'ин';
    } else if (hasDammatan) {
      result += b === 'ل' ? 'люн' : 'ун';
    } else if (hasSukun && b === 'ل' && i === tokens.length - 1) {
      result += 'ь';
    }
  }

  return result;
}
