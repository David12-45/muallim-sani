// Шесть обучающих игр по методике «Му'аллим Сани»: каждая тренирует конкретный навык чтения
import React, { useState } from 'react';
import { Ear, CircleDot, BookOpen, Puzzle, Layers, ListOrdered, RefreshCw, Volume2, Mic, Link2 } from 'lucide-react';
import { ALPHABET_DATA } from '../../data/alphabet';
import { ALL_WORDS } from '../../data/book';
import { getLettersForLevel, getWordsForLevel } from '../../data/gameLevels';
import { audioService } from '../../services/audio';
import { soundFx } from '../../services/soundFx';
import { srs } from '../../services/srs';
import { RoundGame, SequenceGame } from './GameEngines';
import VoiceTrainerGame from './VoiceTrainerGame';
import LetterConnectorGame from './LetterConnectorGame';
import {
  shuffle, pick, uniq, iso, LETTER_BY_CHAR, ALPHABET_CHARS, lookalikes, soundAlikes, soundTip,
  DOTS, dotsLabel, ALL_DOT_LABELS, RASM, CONS, SUN_LETTERS, HEAVY_LETTERS, QALQALA_LETTERS,
  NON_CONNECTING, THROAT_LETTERS, LIP_LETTERS, pickWeighted, parseWord,
  HARAKAT, TANWIN, syllableBasic, syllableSukun, syllableTanwin
} from './gameData';

const BigLetter = ({ children, className = '' }) => (
  <span className={`font-arabic text-7xl sm:text-8xl font-bold text-emerald-700 dark:text-emerald-400 leading-normal ${className}`} dir="rtl">
    {children}
  </span>
);

const nameOf = (c) => LETTER_BY_CHAR[c]?.name || c;
const letterPool = (level, min = 6) => {
  const lv = getLettersForLevel(level);
  return lv.length >= min ? lv : ALPHABET_DATA;
};

// Добрать варианты до нужного количества: сначала «умные» дистракторы, потом случайные
function fillOptions(correct, smart, fallback, count = 4) {
  const res = [correct];
  for (const c of shuffle(uniq(smart))) {
    if (res.length >= count) break;
    if (!res.includes(c)) res.push(c);
  }
  for (const c of shuffle(fallback)) {
    if (res.length >= count) break;
    if (!res.includes(c)) res.push(c);
  }
  return shuffle(res);
}

const avoidRepeat = (pool, prev) => {
  const filtered = prev?.letter ? pool.filter((l) => l.id !== prev.letter.id) : pool;
  return filtered.length ? filtered : pool;
};

/* 1. УСЛЫШЬ И НАЙДИ — различение звуков на слух */
function AudioGame({ level, onExit }) {
  const makeRound = (prev) => {
    const pool = letterPool(level, 4);
    const target = pickWeighted(avoidRepeat(pool, prev));
    const c = iso(target);
    const smart = [...soundAlikes(c), ...lookalikes(c)];
    const options = fillOptions(c, smart, pool.map(iso).concat(ALPHABET_CHARS));
    const tips = {};
    options.forEach((o) => {
      if (o !== c) tips[o] = soundTip(c, o) || `Вы выбрали «${nameOf(o)}» [${LETTER_BY_CHAR[o]?.transcription}]. Сравните звучание: нажмите 🔊 ещё раз.`;
    });
    return {
      prompt: 'Послушайте звук и найдите эту букву',
      display: (
        <button
          onClick={() => audioService.playLetter(c)}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-lg active:scale-95"
        >
          <Volume2 className="w-12 h-12" />
        </button>
      ),
      audio: c,
      options: options.map((o) => ({ key: o, label: o, arabic: true })),
      correct: c,
      letter: target,
      tips,
      explanation: `Это «${target.name}» (${c}) — [${target.transcription}]. Махрадж: ${target.makhraj}.`
    };
  };
  return (
    <RoundGame
      title="Услышь и найди"
      skill="Различаем на слух похожие звуки: ح/ه, س/ص, ت/ط, ك/ق…"
      makeRound={makeRound}
      onExit={onExit}
    />
  );
}

/* 2. ТОЧКИ РЕШАЮТ — буквы с одинаковым остовом */
function DotsGame({ level, onExit }) {
  const makeRound = (prev) => {
    const lv = letterPool(level, 6).filter((l) => RASM[iso(l)]);
    const pool = lv.length >= 4 ? lv : ALPHABET_DATA.filter((l) => RASM[iso(l)]);
    const target = pickWeighted(avoidRepeat(pool, prev));
    const c = iso(target);
    const family = ALPHABET_CHARS.filter((x) => RASM[x] === RASM[c]);
    const type = family.length > 1 ? pick(['dots', 'build', 'name']) : 'dots';

    if (type === 'dots') {
      const correct = dotsLabel(c);
      const options = fillOptions(correct, family.map(dotsLabel), ALL_DOT_LABELS);
      return {
        prompt: `Сколько точек у буквы «${target.name}» и где они стоят?`,
        display: <BigLetter>{c}</BigLetter>,
        options: options.map((o) => ({ key: o, label: o })),
        correct,
        letter: target,
        explanation: `«${target.name}» (${c}): ${correct.toLowerCase()}. ${family.length > 1 ? `Тот же остов у: ${family.filter((x) => x !== c).map((x) => `${x} (${nameOf(x)}) — ${dotsLabel(x).toLowerCase()}`).join('; ')}.` : ''}`
      };
    }

    if (type === 'build') {
      const options = fillOptions(c, [...family, ...lookalikes(c)], ALPHABET_CHARS);
      return {
        prompt: `Добавьте к остову: ${dotsLabel(c).toLowerCase()}. Какая буква получится?`,
        display: (
          <div className="flex items-center gap-4" dir="ltr">
            <span className="font-arabic text-7xl font-bold text-slate-400 leading-normal">{RASM[c]}</span>
            <span className="text-2xl font-black text-amber-500">+ {DOTS[c][0] ? '•'.repeat(DOTS[c][0]) : '∅'}</span>
          </div>
        ),
        options: options.map((o) => ({ key: o, label: o, arabic: true })),
        correct: c,
        letter: target,
        explanation: `Остов ${RASM[c]} + ${dotsLabel(c).toLowerCase()} = ${c} «${target.name}».`
      };
    }

    const options = fillOptions(c, [...family, ...lookalikes(c)], ALPHABET_CHARS);
    return {
      prompt: `Найдите букву «${target.name}» среди похожих`,
      display: <span className="text-3xl font-black text-slate-800 dark:text-white">«{target.name}» [{target.transcription}]</span>,
      options: options.map((o) => ({ key: o, label: o, arabic: true })),
      correct: c,
      letter: target,
      audio: c,
      explanation: `«${target.name}» — ${c}: ${dotsLabel(c).toLowerCase()}. Главное отличие от похожих букв — точки.`
    };
  };
  return (
    <RoundGame
      title="Точки решают"
      skill="Буквы с одинаковым остовом отличаются только точками — учимся видеть разницу"
      makeRound={makeRound}
      onExit={onExit}
    />
  );
}

/* 3. ПРОЧИТАЙ СЛОГ — огласовки (харакаты) */
function HarakatGame({ level, onExit }) {
  const advanced = level && level.category && level.category !== 'alphabet';
  const makeRound = (prev) => {
    const pool = letterPool(level, 4).filter((l) => CONS[iso(l)]);
    const target = pickWeighted(avoidRepeat(pool, prev));
    const c = iso(target);
    const cons = CONS[c];
    const alike = lookalikes(c).concat(soundAlikes(c)).filter((x) => CONS[x]);
    const other = alike.length ? pick(alike) : pick(Object.keys(CONS).filter((x) => x !== c));
    const r = Math.random();
    const kind = r < (advanced ? 0.5 : 0.75) ? 'basic' : r < (advanced ? 0.75 : 0.88) ? 'sukun' : 'tanwin';

    let text; let correct; let smart; let explanation;
    if (kind === 'basic') {
      const h = pick(HARAKAT);
      text = syllableBasic(c, h);
      correct = cons + h.v;
      smart = [...HARAKAT.map((x) => cons + x.v), CONS[other] + h.v];
      explanation = `${c} + ${h.name} = [${correct}]. Фатха даёт звук «а», кясра — «и», дамма — «у».`;
    } else if (kind === 'sukun') {
      text = syllableSukun(c);
      correct = 'а' + cons;
      smart = [cons + 'а', 'а' + CONS[other], cons + 'у', 'а' + cons + 'а'];
      explanation = `Сукун (кружок ْ) означает, что у буквы нет гласного: ${text} читается [${correct}].`;
    } else {
      const t = pick(TANWIN);
      text = syllableTanwin(c, t);
      correct = cons + t.v;
      smart = [...TANWIN.map((x) => cons + x.v), cons + t.v[0]];
      explanation = `${t.name} добавляет звук «н» в конце: ${text} = [${correct}].${t.alif ? ' Алиф после танвин-фатхи не читается.' : ''}`;
    }

    const options = fillOptions(correct, smart.filter((x) => x !== correct), HARAKAT.map((x) => CONS[other] + x.v));
    return {
      prompt: 'Как читается этот слог?',
      display: <BigLetter>{text}</BigLetter>,
      options: options.map((o) => ({ key: o, label: `[${o}]` })),
      correct,
      letter: target,
      revealAudio: text,
      explanation
    };
  };
  return (
    <RoundGame
      title="Прочитай слог"
      skill="Огласовки: фатха, кясра, дамма, сукун и танвин — основа чтения Корана"
      makeRound={makeRound}
      onExit={onExit}
    />
  );
}

/* 4. РАЗБЕРИ СЛОВО — буквы внутри слитного написания */
function WordGame({ level, onExit }) {
  const build = (list) => uniq(list)
    .map((w) => ({ w, chars: parseWord(w) }))
    .filter((x) => x.chars && x.chars.length >= 2 && x.chars.length <= 5);
  let words = build(getWordsForLevel(level));
  if (words.length < 5) words = build(ALL_WORDS);

  const makeRound = (prev) => {
    const candidates = prev ? words.filter((x) => x.w !== prev.word) : words;
    const { w, chars } = pick(candidates.length ? candidates : words);
    const distractors = shuffle(uniq(chars.flatMap(lookalikes)).filter((c) => !chars.includes(c))).slice(0, 3);
    while (distractors.length < 2) {
      const r = pick(ALPHABET_CHARS);
      if (!chars.includes(r) && !distractors.includes(r)) distractors.push(r);
    }
    const pool = shuffle([...chars, ...distractors].map((ch, i) => ({ id: `${i}-${ch}`, char: ch })));
    return {
      word: w,
      prompt: 'Из каких букв состоит слово? Нажимайте по порядку — справа налево',
      display: <span className="font-arabic text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white leading-relaxed" dir="rtl">{w}</span>,
      target: chars,
      pool,
      doneAudio: w,
      letterOf: (c) => LETTER_BY_CHAR[c],
      explanation: `${w} = ${chars.map((c) => `${c} (${nameOf(c)})`).join(' → ')}. Внутри слова буквы меняют форму, но остов и точки остаются.`
    };
  };
  return (
    <SequenceGame
      title="Разбери слово"
      skill="Учимся узнавать буквы в слитном письме — главный навык чтения"
      makeRound={makeRound}
      onExit={onExit}
    />
  );
}

/* 5. СВОЙСТВА БУКВ — сортировка по правилам таджвида */
const SORT_MODES = {
  makhraj: {
    label: 'Махрадж',
    prompt: 'Откуда произносится эта буква?',
    exclude: ['ا'],
    buckets: [
      { key: 'throat', label: '🫁 Горло', test: (c) => THROAT_LETTERS.includes(c) },
      { key: 'tongue', label: '👅 Язык', test: (c) => !THROAT_LETTERS.includes(c) && !LIP_LETTERS.includes(c) },
      { key: 'lips', label: '👄 Губы', test: (c) => LIP_LETTERS.includes(c) }
    ],
    explain: (l, b) => `«${l.name}» — ${b.label.replace(/^\S+\s/, '').toLowerCase()}. ${l.makhraj}.`
  },
  sun: {
    label: 'Солнечные / Лунные',
    prompt: 'Солнечная или лунная буква? (как читать «اَلْ» перед ней)',
    exclude: [],
    buckets: [
      { key: 'sun', label: '☀ Солнечная', test: (c) => SUN_LETTERS.includes(c) },
      { key: 'moon', label: '☾ Лунная', test: (c) => !SUN_LETTERS.includes(c) }
    ],
    explain: (l, b) => b.key === 'sun'
      ? `«${l.name}» — солнечная: лям в «ال» не читается, буква удваивается (الشَّمْس — аш-шамс).`
      : `«${l.name}» — лунная: лям в «ال» читается чётко (الْقَمَر — аль-камар).`
  },
  heavy: {
    label: 'Твёрдые / Мягкие',
    prompt: 'Эта буква произносится твёрдо (толсто) или мягко (тонко)?',
    exclude: ['ا', 'ر', 'ل'],
    buckets: [
      { key: 'heavy', label: '🪨 Твёрдая', test: (c) => HEAVY_LETTERS.includes(c) },
      { key: 'light', label: '🪶 Мягкая', test: (c) => !HEAVY_LETTERS.includes(c) }
    ],
    explain: (l, b) => b.key === 'heavy'
      ? `«${l.name}» — одна из 7 твёрдых букв خُصَّ ضَغْطٍ قِظْ: спинка языка поднимается, звук «толстый».`
      : `«${l.name}» — мягкая (тонкая) буква. Твёрдых всего 7: خُصَّ ضَغْطٍ قِظْ.`
  },
  qalqala: {
    label: 'Калькаля',
    prompt: 'Есть ли у этой буквы калькаля (отскок звука при сукуне)?',
    exclude: [],
    buckets: [
      { key: 'yes', label: '💥 Калькаля', test: (c) => QALQALA_LETTERS.includes(c) },
      { key: 'no', label: 'Без калькаля', test: (c) => !QALQALA_LETTERS.includes(c) }
    ],
    explain: (l, b) => b.key === 'yes'
      ? `«${l.name}» — буква калькаля. Запомните 5 букв: قُطْبُ جَدٍّ (ق ط ب ج د).`
      : `«${l.name}» — без калькали. Калькаля только у 5 букв: قُطْبُ جَدٍّ.`
  },
  connect: {
    label: 'Соединение',
    prompt: 'Соединяется ли эта буква со следующей (влево)?',
    exclude: [],
    buckets: [
      { key: 'both', label: '↔ С обеих сторон', test: (c) => !NON_CONNECTING.includes(c) },
      { key: 'right', label: '⛔ Не соединяется влево', test: (c) => NON_CONNECTING.includes(c) }
    ],
    explain: (l, b) => b.key === 'right'
      ? `«${l.name}» — одна из 6 букв (ا د ذ ر ز و), после которых слово «разрывается».`
      : `«${l.name}» соединяется в обе стороны: ${l.forms.initial} ${l.forms.medial} ${l.forms.final}.`
  }
};

function SortGame({ onExit }) {
  const [mode, setMode] = useState(null);

  if (!mode) {
    return (
      <div className="space-y-3">
        <button onClick={onExit} className="text-xs font-bold text-slate-500 hover:text-emerald-600">← К играм</button>
        <h2 className="text-lg font-black text-slate-900 dark:text-white">Свойства букв</h2>
        <p className="text-xs text-slate-500">Выберите правило, которое хотите закрепить:</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {Object.entries(SORT_MODES).map(([id, m]) => (
            <button
              key={id}
              onClick={() => { soundFx.playTap(); setMode(id); }}
              className="p-4 rounded-2xl text-left border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-emerald-500 active:scale-95"
            >
              <div className="font-black text-slate-900 dark:text-white">{m.label}</div>
              <div className="text-xs text-slate-500 mt-0.5">{m.buckets.map((b) => b.label).join(' · ')}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const m = SORT_MODES[mode];
  const makeRound = (prev) => {
    const pool = ALPHABET_DATA.filter((l) => !m.exclude.includes(iso(l)));
    // сначала выбираем «корзину», чтобы ответы были сбалансированы
    const bucket = pick(m.buckets);
    const inBucket = avoidRepeat(pool.filter((l) => bucket.test(iso(l))), prev);
    const target = pickWeighted(inBucket);
    const c = iso(target);
    return {
      prompt: m.prompt,
      display: (
        <div className="flex flex-col items-center">
          <BigLetter>{c}</BigLetter>
          <span className="text-sm font-bold text-slate-500">{target.name}</span>
        </div>
      ),
      audio: c,
      options: m.buckets.map((b) => ({ key: b.key, label: b.label })),
      correct: bucket.key,
      letter: target,
      explanation: m.explain(target, bucket)
    };
  };
  return (
    <RoundGame
      key={mode}
      title={`Свойства букв: ${m.label}`}
      skill="Правила таджвида, которые нужны для правильного чтения Корана"
      makeRound={makeRound}
      onExit={() => setMode(null)}
    />
  );
}

/* 6. ПОРЯДОК АЛФАВИТА */
function OrderGame({ onExit }) {
  const makeRound = () => {
    let chars;
    if (Math.random() < 0.6) {
      const start = Math.floor(Math.random() * (ALPHABET_CHARS.length - 5));
      chars = ALPHABET_CHARS.slice(start, start + 5);
    } else {
      const idxs = shuffle(ALPHABET_CHARS.map((_, i) => i)).slice(0, 4).sort((a, b) => a - b);
      chars = idxs.map((i) => ALPHABET_CHARS[i]);
    }
    return {
      prompt: 'Расставьте буквы в порядке алфавита (от ا к ي)',
      display: <span className="text-xs text-slate-500">Подсказка: алфавит начинается с ا (Алиф) и заканчивается ي (Йа)</span>,
      target: chars,
      pool: shuffle(chars.map((ch, i) => ({ id: `${i}-${ch}`, char: ch }))),
      dir: 'ltr',
      slotHint: true,
      letterOf: (c) => LETTER_BY_CHAR[c],
      explanation: chars.map((c) => `${ALPHABET_CHARS.indexOf(c) + 1}. ${c} ${nameOf(c)}`).join('  ·  ')
    };
  };
  return (
    <SequenceGame
      title="Порядок алфавита"
      skill="Запоминаем последовательность 28 букв — пригодится для словарей и счёта (абджад)"
      makeRound={makeRound}
      onExit={onExit}
    />
  );
}

/* ХАБ ОБУЧАЮЩИХ ИГР */
const GAMES = [
  { id: 'voice', title: 'Тренажёр речи 🎙️', skill: 'Проверка произношения через микрофон', icon: Mic, color: 'from-violet-600 to-indigo-600', Comp: VoiceTrainerGame },
  { id: 'connector', title: 'Мастер соединений 🔗', skill: '4 позиции и 6 несоединяющихся букв', icon: Link2, color: 'from-amber-600 to-emerald-600', Comp: LetterConnectorGame },
  { id: 'audio', title: 'Услышь и найди', skill: 'Различать на слух похожие звуки', icon: Ear, color: 'from-emerald-500 to-teal-600', Comp: AudioGame },
  { id: 'dots', title: 'Точки решают', skill: 'Буквы с одинаковым остовом', icon: CircleDot, color: 'from-sky-500 to-indigo-600', Comp: DotsGame },
  { id: 'harakat', title: 'Прочитай слог', skill: 'Фатха, кясра, дамма, сукун, танвин', icon: BookOpen, color: 'from-amber-500 to-orange-600', Comp: HarakatGame },
  { id: 'word', title: 'Разбери слово', skill: 'Буквы в слитном письме', icon: Puzzle, color: 'from-rose-500 to-pink-600', Comp: WordGame },
  { id: 'sort', title: 'Свойства букв', skill: 'Махрадж, солнечные, твёрдые, калькаля', icon: Layers, color: 'from-purple-500 to-violet-700', Comp: SortGame },
  { id: 'order', title: 'Порядок алфавита', skill: 'Последовательность 28 букв', icon: ListOrdered, color: 'from-teal-600 to-cyan-700', Comp: OrderGame }
];

export default function LearningGamesHub({ level }) {
  const [active, setActive] = useState(null);
  const [, refresh] = useState(0);

  const dueCount = srs.dueIds(ALPHABET_DATA.map((l) => l.id)).length;
  const weak = ALPHABET_DATA.filter((l) => { const b = srs.box(l.id); return b >= 0 && b <= 1; });

  if (active) {
    const g = GAMES.find((x) => x.id === active);
    const Comp = g.Comp;
    return (
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-7 border border-slate-200 dark:border-slate-700 shadow-xl max-w-3xl mx-auto">
        <Comp level={level} onExit={() => { setActive(null); refresh((x) => x + 1); }} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(dueCount > 0 || weak.length > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <p className="text-sm font-black text-amber-900 dark:text-amber-200">
              🔁 {dueCount > 0 ? `${dueCount} букв ждут повторения` : 'Есть буквы, в которых вы ошибались'}
            </p>
            {weak.length > 0 && (
              <p className="text-xs text-amber-800 dark:text-amber-300 mt-1">
                Слабые места: <span className="font-arabic text-lg" dir="rtl">{weak.slice(0, 10).map(iso).join(' ')}</span>
              </p>
            )}
          </div>
          <button
            onClick={() => { soundFx.playTap(); setActive('audio'); }}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black inline-flex items-center gap-2 active:scale-95"
          >
            <RefreshCw className="w-4 h-4" /> Повторить
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {GAMES.map((g) => {
          const Icon = g.icon;
          return (
            <button
              key={g.id}
              onClick={() => { soundFx.playTap(); setActive(g.id); }}
              className="group p-4 rounded-3xl text-left bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:border-emerald-500 shadow-sm hover:shadow-lg transition-all active:scale-[0.98] flex items-center gap-4"
            >
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${g.color} text-white flex items-center justify-center shrink-0 shadow-md group-hover:scale-105 transition-transform`}>
                <Icon className="w-7 h-7" />
              </div>
              <div>
                <div className="font-black text-slate-900 dark:text-white">{g.title}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{g.skill}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
