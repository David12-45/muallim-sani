// Интерактивный конструктор соединений арабских букв (Урок 2: 4 позиции и 6 несоединяющихся букв)
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, HelpCircle, Link2, Unlink, RotateCcw, Volume2 } from 'lucide-react';
import { ALPHABET_DATA } from '../../data/alphabet';
import { audioService } from '../../services/audio';
import { soundFx } from '../../services/soundFx';
import { stats } from '../../services/storage';

// 6 букв, которые НЕ соединяются со следующей буквой (влево):
const NON_CONNECTING = ['ا', 'د', 'ذ', 'ر', 'ز', 'و'];

// Слова для тренировки соединения с разбором
const CONNECTOR_WORDS = [
  {
    word: 'كَتَبَ',
    transcription: 'катаба',
    meaning: 'он написал',
    letters: [
      { char: 'ك', pos: 'initial', form: 'كـ', name: 'Каф' },
      { char: 'ت', pos: 'medial', form: 'ـتـ', name: 'Та' },
      { char: 'ب', pos: 'final', form: 'ـب', name: 'Ба' }
    ],
    ruleNote: 'Все 3 буквы соединяются с обеих сторон — образуется непрерывная линия.'
  },
  {
    word: 'دَرَسَ',
    transcription: 'дараса',
    meaning: 'он учился',
    letters: [
      { char: 'د', pos: 'isolated', form: 'د', name: 'Даль', nonConn: true },
      { char: 'ر', pos: 'isolated', form: 'ر', name: 'Ра', nonConn: true },
      { char: 'س', pos: 'isolated', form: 'س', name: 'Син' }
    ],
    ruleNote: '«Даль» и «Ра» не соединяются влево! Поэтому все три буквы пишутся раздельно (в изолированной форме).'
  },
  {
    word: 'بَابٌ',
    transcription: 'бабун',
    meaning: 'дверь',
    letters: [
      { char: 'ب', pos: 'initial', form: 'بـ', name: 'Ба' },
      { char: 'ا', pos: 'final', form: 'ـا', name: 'Алиф', nonConn: true },
      { char: 'ب', pos: 'isolated', form: 'ب', name: 'Ба' }
    ],
    ruleNote: '«Ба» соединяется с «Алифом», но «Алиф» не соединяется влево. Поэтому последняя «Ба» пишется отдельно.'
  },
  {
    word: 'نَزَلَ',
    transcription: 'назаля',
    meaning: 'он спустился',
    letters: [
      { char: 'ن', pos: 'initial', form: 'نـ', name: 'Нун' },
      { char: 'ز', pos: 'final', form: 'ـز', name: 'Зай', nonConn: true },
      { char: 'ل', pos: 'isolated', form: 'ل', name: 'Лям' }
    ],
    ruleNote: '«Зай» соединяется справа, но прерывает связь влево. «Лям» пишется в начальной/обособленной форме.'
  },
  {
    word: 'رَزَقَ',
    transcription: 'разака',
    meaning: 'он наделил',
    letters: [
      { char: 'ر', pos: 'isolated', form: 'ر', name: 'Ра', nonConn: true },
      { char: 'ز', pos: 'isolated', form: 'ز', name: 'Зай', nonConn: true },
      { char: 'ق', pos: 'isolated', form: 'ق', name: 'Каф' }
    ],
    ruleNote: 'И «Ра», и «Зай» входят в 6 несоединяющихся букв — линия письма разрывается дважды!'
  },
  {
    word: 'عَلِمَ',
    transcription: '‘алима',
    meaning: 'он узнал',
    letters: [
      { char: 'ع', pos: 'initial', form: 'عـ', name: '‘Айн' },
      { char: 'ل', pos: 'medial', form: 'ـلـ', name: 'Лям' },
      { char: 'م', pos: 'final', form: 'ـم', name: 'Мим' }
    ],
    ruleNote: 'Все буквы соединяются между собой в классическую цепочку слитного письма.'
  },
  {
    word: 'سَأَلَ',
    transcription: 'са’аля',
    meaning: 'он спросил',
    letters: [
      { char: 'س', pos: 'initial', form: 'سـ', name: 'Син' },
      { char: 'أ', pos: 'final', form: 'ـأ', name: 'Алиф с хамзой', nonConn: true },
      { char: 'ل', pos: 'isolated', form: 'ل', name: 'Лям' }
    ],
    ruleNote: 'Алиф с хамзой соединяется справа, но не соединяется влево. Следующая «Лям» пишется отдельно.'
  },
  {
    word: 'صَبَرَ',
    transcription: 'сабара',
    meaning: 'он терпел',
    letters: [
      { char: 'ص', pos: 'initial', form: 'صـ', name: 'Сад' },
      { char: 'ب', pos: 'medial', form: 'ـبـ', name: 'Ба' },
      { char: 'ر', pos: 'final', form: 'ـر', name: 'Ра', nonConn: true }
    ],
    ruleNote: '«Сад» соединяется с «Ба», «Ба» переходит в «Ра». Буква «Ра» замыкает слово.'
  }
];

export default function LetterConnectorGame({ level, onExit }) {
  const [wordIndex, setWordIndex] = useState(0);
  const [selectedForms, setSelectedForms] = useState({});
  const [completed, setCompleted] = useState(false);
  const [showRule, setShowRule] = useState(false);
  const [score, setScore] = useState(0);

  const current = CONNECTOR_WORDS[wordIndex % CONNECTOR_WORDS.length];

  // Для каждой буквы в слове находим полные данные из ALPHABET_DATA
  const letterDetails = current.letters.map((l) => {
    const data = ALPHABET_DATA.find((a) => a.arabic === l.char || a.name === l.name) || {
      name: l.name,
      arabic: l.char,
      forms: { isolated: l.char, initial: l.char + 'ـ', medial: 'ـ' + l.char + 'ـ', final: 'ـ' + l.char },
      connectsLeft: !NON_CONNECTING.includes(l.char)
    };
    return { ...l, ...data };
  });

  const handleSelectForm = (slotIndex, formKey) => {
    if (completed) return;
    soundFx.playTap();

    const newSelected = { ...selectedForms, [slotIndex]: formKey };
    setSelectedForms(newSelected);

    // Проверяем, все ли выбраны верно
    const allChosen = letterDetails.every((_, idx) => newSelected[idx] !== undefined);
    if (allChosen) {
      const allCorrect = letterDetails.every((l, idx) => {
        // Правильная форма
        const targetFormKey = l.pos; // 'initial' | 'medial' | 'final' | 'isolated'
        return newSelected[idx] === targetFormKey;
      });

      if (allCorrect) {
        soundFx.playCorrect();
        setCompleted(true);
        setScore((s) => s + 15);
        stats.addXp(15);
      } else {
        soundFx.playWrong();
      }
    }
  };

  const handleNextWord = () => {
    soundFx.playTap();
    setSelectedForms({});
    setCompleted(false);
    setShowRule(false);
    setWordIndex((i) => i + 1);
  };

  const handlePlayWord = () => {
    soundFx.playTap();
    audioService.playWordAudio(current.word);
  };

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад к играм
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRule(!showRule)}
            className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700/60 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
            6 несоединяющихся букв
          </button>
          <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-black text-amber-700 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> +{score} XP
          </div>
        </div>
      </div>

      {/* Памятка по 6 буквам */}
      {showRule && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 space-y-2 animate-fadeIn">
          <div className="flex items-center gap-2 text-sm font-black text-amber-900 dark:text-amber-200">
            <Unlink className="w-4 h-4 text-amber-600" />
            Золотое правило таджвида: 6 букв не соединяются влево
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
            Буквы <span className="font-arabic font-bold text-lg text-emerald-800 dark:text-emerald-300" dir="rtl">ا د ذ ر ز و</span> (Алиф, Даль, Заль, Ра, Зай, Вав) соединяются только с предшествующей буквой справа, но <strong className="underline">никогда не соединяются со следующей буквой влево</strong>. После них цепочка разрывается, и следующая буква пишется в начальной (или изолированной) форме.
          </p>
        </div>
      )}

      {/* Описание задания */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Мастер соединений букв
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Выберите правильную форму для каждой буквы: начальная, серединная, конечная или изолированная
        </p>
      </div>

      {/* Целевое слово */}
      <div className="p-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/60 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl text-center shadow-lg space-y-3">
        <div className="flex items-center justify-center gap-3">
          <span
            className="font-arabic text-6xl sm:text-7xl font-bold text-emerald-700 dark:text-emerald-400 select-none tracking-wide"
            dir="rtl"
          >
            {current.word}
          </span>
          <button
            onClick={handlePlayWord}
            className="w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md active:scale-95 transition-transform"
            title="Послушать слово"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
          [{current.transcription}] — «{current.meaning}»
        </div>
      </div>

      {/* Конструктор слотов букв (справа налево, как в арабском) */}
      <div className="space-y-4">
        <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-center">
          Соберите слово по буквам (справа налево):
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" dir="rtl">
          {letterDetails.map((letter, slotIdx) => {
            const chosenKey = selectedForms[slotIdx];
            const isTarget = chosenKey === letter.pos;
            const isNonConnecting = NON_CONNECTING.includes(letter.char);

            return (
              <div
                key={slotIdx}
                className={`p-4 rounded-2xl border-2 transition-all ${
                  chosenKey
                    ? isTarget
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-500 shadow-sm'
                      : 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-400'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                }`}
                dir="ltr"
              >
                {/* Заголовок слота */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700/60 pb-2 mb-3">
                  <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    {slotIdx + 1}-я буква: <span className="text-emerald-600 dark:text-emerald-400">{letter.name}</span> ({letter.char})
                  </div>
                  {isNonConnecting && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                      Не соед. влево
                    </span>
                  )}
                </div>

                {/* Выбор 4 форм буквы */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { key: 'isolated', label: 'Изолированная', val: letter.forms?.isolated || letter.char },
                    { key: 'initial', label: 'Начальная', val: letter.forms?.initial || (letter.char + 'ـ') },
                    { key: 'medial', label: 'Серединная', val: letter.forms?.medial || ('ـ' + letter.char + 'ـ') },
                    { key: 'final', label: 'Конечная', val: letter.forms?.final || ('ـ' + letter.char) }
                  ].map((form) => {
                    const isSelected = chosenKey === form.key;
                    const isCorrect = form.key === letter.pos;

                    return (
                      <button
                        key={form.key}
                        onClick={() => handleSelectForm(slotIdx, form.key)}
                        disabled={completed}
                        className={`p-2 rounded-xl text-center border transition-all active:scale-95 ${
                          isSelected
                            ? isCorrect
                              ? 'bg-emerald-500 text-white border-emerald-600 shadow-md'
                              : 'bg-rose-500 text-white border-rose-600'
                            : 'bg-slate-50 dark:bg-slate-700/60 hover:bg-slate-100 dark:hover:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        <div className="font-arabic text-2xl font-bold leading-normal" dir="rtl">
                          {form.val}
                        </div>
                        <div className={`text-[10px] font-medium mt-0.5 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`}>
                          {form.label}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Пояснение к правилу соединения после успеха */}
      {completed && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-start gap-3 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="font-black text-sm text-emerald-900 dark:text-emerald-200">
              Превосходно! Слово собрано правильно (+15 XP)
            </div>
            <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed">
              {current.ruleNote}
            </p>
          </div>
        </div>
      )}

      {/* Нижняя панель действий */}
      <div className="flex items-center justify-between gap-3 pt-2">
        <button
          onClick={() => { setSelectedForms({}); setCompleted(false); }}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Сбросить выбор
        </button>

        <button
          onClick={handleNextWord}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md active:scale-95 transition-all"
        >
          {completed ? 'Следующее слово →' : 'Пропустить слово'}
        </button>
      </div>
    </div>
  );
}
