import React, { useState, useMemo, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  X,
  RotateCcw,
  Repeat,
  Lock,
  Volume2,
  Edit3,
  Sparkles,
  Trophy,
  Star,
  Zap,
  Play
} from 'lucide-react';
import { ALPHABET_DATA } from '../data/alphabet';
import { srs } from '../services/srs';
import { audioService } from '../services/audio';
import { soundFx } from '../services/soundFx';
import { storageService } from '../services/storage';
import { setUserLearnedLettersCount } from '../data/gameLevels';
import LetterCanvasModal from './LetterCanvasModal';

// 7 групп по сходству начертания — оптимальный порядок запоминания букв
const GROUPS = [
  { id: 1, title: 'Ба-семейство (Лодочки)', subtitle: 'ا، ب، ت، ث', ids: [1, 2, 3, 4] },
  { id: 2, title: 'Джим-семейство (Клювики)', subtitle: 'ج، ح، خ', ids: [5, 6, 7] },
  { id: 3, title: 'Даль и Ра (Уголки и серпики)', subtitle: 'د، ذ، ر، ز', ids: [8, 9, 10, 11] },
  { id: 4, title: 'Син и Сад (Зубчики и петли)', subtitle: 'س، ش، ص، ض', ids: [12, 13, 14, 15] },
  { id: 5, title: 'Та, За, Айн, Гайн', subtitle: 'ط، ظ، ع، غ', ids: [16, 17, 18, 19] },
  { id: 6, title: 'Фа, Каф, Кяф, Лям', subtitle: 'ف، ق، ك، ل', ids: [20, 21, 22, 23] },
  { id: 7, title: 'Мим, Нун, Ха, Вав, Йа', subtitle: 'م، ن، هـ، و، ي', ids: [24, 25, 26, 27, 28] }
];

const byId = Object.fromEntries(ALPHABET_DATA.map(l => [l.id, l]));
const shuffle = a => [...a].sort(() => Math.random() - 0.5);
const FORMS = [
  ['initial', 'в начале слова'],
  ['medial', 'в середине слова'],
  ['final', 'в конце слова']
];

function makeQuestions(ids, count = 10) {
  const pool = ALPHABET_DATA;
  const out = [];
  for (let i = 0; i < count; i++) {
    const t = byId[ids[i % ids.length]];
    const others = shuffle(pool.filter(l => l.id !== t.id)).slice(0, 3);
    const opts = shuffle([t, ...others]);
    const kind = i % 3;
    if (kind === 0) {
      out.push({
        id: t.id,
        big: t.arabic,
        speakLetter: true,
        prompt: 'Как называется эта буква?',
        answer: t.name,
        options: opts.map(o => o.name)
      });
    } else if (kind === 1) {
      out.push({
        id: t.id,
        big: t.name,
        bigClass: 'text-3xl font-extrabold',
        prompt: 'Найдите соответствующую арабскую букву:',
        answer: t.arabic,
        options: opts.map(o => o.arabic),
        arabicOptions: true
      });
    } else {
      const [f, label] = FORMS[Math.floor(Math.random() * FORMS.length)];
      const formGlyph = t.forms?.[f] || t.arabic;
      out.push({
        id: t.id,
        big: formGlyph,
        prompt: `Какая это буква (${label})?`,
        answer: t.name,
        options: opts.map(o => o.name)
      });
    }
  }
  return shuffle(out);
}

// Шаг изучения буквы в группе (LearnStep)
function LearnStep({ ids, onDone }) {
  const [i, setI] = useState(0);
  const [tracingLetter, setTracingLetter] = useState(null);
  const l = byId[ids[i]] || ALPHABET_DATA[0];

  useEffect(() => {
    audioService.playLetter(l.arabic);
    return () => audioService.stopAll();
  }, [l]);

  const handlePlay = (char) => {
    soundFx.playTap();
    audioService.playLetter(char || l.arabic);
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-3 px-1">
        <span>Буква {i + 1} из {ids.length}</span>
        <div className="flex gap-1">
          {ids.map((id, idx) => (
            <div
              key={id}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === i
                  ? 'bg-emerald-600 scale-125'
                  : idx < i
                  ? 'bg-emerald-400'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 text-center shadow-xl space-y-4">
        {/* Big Letter Button with Audio on Tap */}
        <button
          onClick={() => handlePlay(l.arabic)}
          className="font-arabic text-7xl sm:text-8xl font-bold text-emerald-600 dark:text-emerald-400 leading-tight hover:scale-105 active:scale-95 transition-transform cursor-pointer select-none"
          dir="rtl"
          title="Нажмите для прослушивания студийной аудиозаписи"
        >
          {l.arabic}
        </button>

        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white flex items-center justify-center gap-2">
            <span>{l.name}</span>
            <span className="font-arabic font-normal text-emerald-600 dark:text-emerald-400 text-lg">
              ({l.arabicName})
            </span>
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5">
            Звук: <b className="font-mono text-emerald-700 dark:text-emerald-300">[{l.transcription}]</b>
          </p>
        </div>

        {/* 4 Forms in Word */}
        {l.forms && (
          <div className="pt-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              4 формы написания в слове (← справа налево)
            </p>
            <div className="grid grid-cols-4 gap-1.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700" dir="rtl">
              <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-center shadow-xs">
                <span className="font-arabic text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {l.forms.initial}
                </span>
                <p className="text-[9px] text-slate-400 mt-1" dir="ltr">В начале</p>
              </div>
              <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-center shadow-xs">
                <span className="font-arabic text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {l.forms.medial}
                </span>
                <p className="text-[9px] text-slate-400 mt-1" dir="ltr">В середине</p>
              </div>
              <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-center shadow-xs">
                <span className="font-arabic text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {l.forms.final}
                </span>
                <p className="text-[9px] text-slate-400 mt-1" dir="ltr">В конце</p>
              </div>
              <div className="p-1.5 rounded-xl bg-white dark:bg-slate-800 text-center shadow-xs">
                <span className="font-arabic text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                  {l.forms.isolated}
                </span>
                <p className="text-[9px] text-slate-400 mt-1" dir="ltr">Отдельно</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions: Listen Audio & Finger Tracing */}
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            onClick={() => handlePlay(l.arabic)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-200 text-xs font-bold transition active:scale-95"
          >
            <Volume2 className="w-4 h-4" />
            <span>Слушать студийный MP3</span>
          </button>

          <button
            onClick={() => {
              soundFx.playTap();
              setTracingLetter(l);
            }}
            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/60 dark:hover:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs font-bold transition active:scale-95 border border-amber-200 dark:border-amber-800"
          >
            <Edit3 className="w-4 h-4" />
            <span>Пропись ✍️</span>
          </button>
        </div>

        {/* Connection Warning */}
        {!l.connectsLeft && (
          <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-200 text-xs font-bold border border-amber-200 dark:border-amber-800/60">
            ⚠️ Не соединяется со следующей буквой влево
          </div>
        )}

        {/* Makhraj */}
        <div className="text-left text-xs bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
          <span className="font-bold text-slate-700 dark:text-slate-300">Махрадж: </span>
          <span className="text-slate-600 dark:text-slate-400">{l.makhraj}</span>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center mt-5 gap-3">
        <button
          disabled={i === 0}
          onClick={() => {
            soundFx.playTap();
            setI(i - 1);
          }}
          className="px-4 py-3 min-h-[44px] rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs disabled:opacity-30 flex items-center gap-1.5 shadow-sm active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Назад</span>
        </button>

        {i < ids.length - 1 ? (
          <button
            onClick={() => {
              soundFx.playTap();
              setI(i + 1);
            }}
            className="flex-1 py-3 px-6 min-h-[44px] rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/25 active:scale-95 transition"
          >
            <span>Следующая буква</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={() => {
              soundFx.playTap();
              onDone();
            }}
            className="flex-1 py-3 px-6 min-h-[44px] rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 active:scale-95 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Перейти к практике!</span>
          </button>
        )}
      </div>

      {/* Tracing Modal */}
      {tracingLetter && (
        <LetterCanvasModal
          letter={tracingLetter}
          onClose={() => setTracingLetter(null)}
        />
      )}
    </div>
  );
}

// Шаг интерактивной практики и квиза (Practice)
function Practice({ ids, onFinish }) {
  const questions = useMemo(() => makeQuestions(ids), [ids]);
  const [n, setN] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const q = questions[n];
  const done = n >= questions.length;

  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <div className="max-w-md mx-auto text-center bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4">
        <div className="text-6xl mb-1">{pct >= 80 ? '🌟' : pct >= 50 ? '👍' : '💪'}</div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">
          {score} из {questions.length} верно
        </h2>
        <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
          {pct >= 80
            ? 'Превосходно! Группа букв успешно освоена и закреплена.'
            : 'Хорошая тренировка! Ошибки будут повторены в интервальном режиме.'}
        </p>

        <div className="flex items-center justify-center gap-2 pt-2">
          <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>+{score * 5} XP заработано</span>
          </div>
        </div>

        <div className="flex gap-2 justify-center pt-3">
          <button
            onClick={() => {
              soundFx.playTap();
              setN(0);
              setScore(0);
              setPicked(null);
            }}
            className="px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs flex items-center gap-1.5 active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Ещё раз</span>
          </button>

          <button
            onClick={() => {
              soundFx.playSuccess();
              onFinish(pct);
            }}
            className="flex-1 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm shadow-lg shadow-emerald-600/25 active:scale-95 transition"
          >
            Готово
          </button>
        </div>
      </div>
    );
  }

  const choose = (opt) => {
    if (picked !== null) return;
    const ok = opt === q.answer;
    setPicked(opt);
    srs.answer(q.id, ok);

    if (ok) {
      soundFx.playSuccess();
      setScore(s => s + 1);
      storageService.addXp(5);
    } else {
      soundFx.playError();
    }

    setTimeout(() => {
      setPicked(null);
      setN(x => {
        if (x + 1 >= questions.length) {
          soundFx.playFanfare();
          confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 } });
        }
        return x + 1;
      });
    }, 850);
  };

  return (
    <div className="max-w-md mx-auto">
      {/* Progress Bar */}
      <div className="h-2.5 rounded-full bg-slate-200 dark:bg-slate-700 mb-4 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
          style={{ width: `${(n / questions.length) * 100}%` }}
        />
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-6 text-center shadow-xl space-y-4">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
          Вопрос {n + 1} из {questions.length}
        </span>
        <h3 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-200">
          {q.prompt}
        </h3>

        {/* Audio helper button if applicable */}
        {q.speakLetter && (
          <button
            onClick={() => {
              soundFx.playTap();
              audioService.playLetter(byId[q.id]?.arabic);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold active:scale-95 transition"
          >
            <Volume2 className="w-4 h-4" />
            <span>Слушать произношение</span>
          </button>
        )}

        {/* Target display glyph */}
        <div
          className={`${q.bigClass || 'font-arabic text-8xl'} my-3 ${
            q.bigClass ? '' : 'text-emerald-600 dark:text-emerald-400'
          } select-none leading-none`}
          dir="rtl"
        >
          {q.big}
        </div>

        {/* 4 Answer options */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {q.options.map(o => {
            const isCorrect = o === q.answer;
            const isPicked = picked === o;
            let btnStyle = 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-emerald-400';

            if (picked !== null) {
              if (isCorrect) {
                btnStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-md ring-2 ring-emerald-500/30';
              } else if (isPicked) {
                btnStyle = 'bg-rose-500 text-white border-rose-600 shadow-md';
              } else {
                btnStyle = 'opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
              }
            }

            return (
              <button
                key={o}
                onClick={() => choose(o)}
                disabled={picked !== null}
                className={`py-3.5 px-2 rounded-2xl border-2 font-black active:scale-95 transition flex items-center justify-center gap-1.5 ${
                  q.arabicOptions ? 'font-arabic text-4xl' : 'text-xs sm:text-sm'
                } ${btnStyle}`}
              >
                <span>{o}</span>
                {picked !== null && isCorrect && <Check className="w-4 h-4 shrink-0" />}
                {picked === o && !isCorrect && <X className="w-4 h-4 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Главный компонент курса алфавита
export default function AlphabetCourse({ onBack: externalOnBack, onCompleted }) {
  const [view, setView] = useState({ mode: 'map' }); // 'map' | 'learn' | 'practice' | 'review'
  const [tick, setTick] = useState(0);
  const state = srs.all();
  void tick;

  const learnedCount = ALPHABET_DATA.filter(l => srs.isLearned(l.id)).length;
  const dueIds = srs.dueIds(ALPHABET_DATA.map(l => l.id));

  const back = () => {
    soundFx.playTap();
    setView({ mode: 'map' });
    setTick(t => t + 1);
  };

  const handleGroupFinish = (group, pct) => {
    back();
    const updatedLearned = ALPHABET_DATA.filter(l => srs.isLearned(l.id)).length;
    if (updatedLearned > 0) {
      setUserLearnedLettersCount(updatedLearned);
    }
    if (pct >= 80) {
      storageService.setLessonStars('alphabet', 3);
      if (onCompleted) onCompleted(3);
    }
  };

  if (view.mode === 'learn') {
    return (
      <Wrap title={view.group.title} onBack={back}>
        <LearnStep
          ids={view.group.ids}
          onDone={() => setView({ mode: 'practice', group: view.group })}
        />
      </Wrap>
    );
  }

  if (view.mode === 'practice') {
    return (
      <Wrap title={`Практика: ${view.group.title}`} onBack={back}>
        <Practice
          ids={view.group.ids}
          onFinish={(pct) => handleGroupFinish(view.group, pct)}
        />
      </Wrap>
    );
  }

  if (view.mode === 'review') {
    return (
      <Wrap title="Интервальное повторение" onBack={back}>
        <Practice
          ids={dueIds}
          onFinish={() => back()}
        />
      </Wrap>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 md:pb-10 space-y-6">
      {/* Top Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900 text-white p-6 sm:p-7 shadow-xl shadow-emerald-950/20">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            {externalOnBack && (
              <button
                onClick={externalOnBack}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-xs font-bold text-white mb-3 backdrop-blur-sm transition-colors active:scale-95"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Назад к урокам</span>
              </button>
            )}
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Урок 1: Изучение арабского алфавита
            </h1>
            <p className="text-emerald-100/90 text-xs sm:text-sm mt-1 leading-relaxed">
              28 согласных букв, разделенных на <strong>7 удобных групп</strong> по сходству основы.
            </p>
          </div>

          <div className="shrink-0 p-3 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15 text-center min-w-[90px]">
            <div className="text-2xl font-black text-amber-300">
              {learnedCount} / 28
            </div>
            <div className="text-[10px] text-emerald-200 font-bold">Букв освоено</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/15">
          <div className="flex justify-between text-[11px] font-bold text-emerald-200 mb-1.5">
            <span>Общий прогресс алфавита</span>
            <span>{Math.round((learnedCount / 28) * 100)}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-emerald-950/60 overflow-hidden border border-white/20">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500"
              style={{ width: `${(learnedCount / 28) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* SRS Spaced Repetition Button if letters are due */}
      {dueIds.length > 0 && (
        <button
          onClick={() => {
            soundFx.playTap();
            setView({ mode: 'review' });
          }}
          className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 text-slate-950 font-black text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-amber-500/20 active:scale-95 transition"
        >
          <Repeat className="w-5 h-5" />
          <span>Повторить буквы по системе Лейтнера ({dueIds.length})</span>
        </button>
      )}

      {/* 7 Groups Cards */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
          7 этапов освоения (от простых к сложным):
        </h2>

        {GROUPS.map((g, gi) => {
          const learned = g.ids.filter(id => srs.isLearned(id)).length;
          const started = g.ids.some(id => state[id]);
          const isComplete = learned === g.ids.length;

          return (
            <button
              key={gi}
              onClick={() => {
                soundFx.playTap();
                setView({ mode: 'learn', group: g });
              }}
              className={`w-full text-left p-4 sm:p-5 rounded-3xl border-2 transition-all flex items-center gap-4 active:scale-98 ${
                isComplete
                  ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-800 shadow-sm'
                  : started
                  ? 'bg-white dark:bg-slate-800 border-amber-300 dark:border-amber-800 shadow-md ring-1 ring-amber-400/20'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-400 shadow-sm'
              }`}
            >
              <div
                className={`w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm ${
                  isComplete
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
              >
                {isComplete ? <Check className="w-5 h-5" /> : gi + 1}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {g.title}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isComplete
                    ? '✓ Освоено 100%'
                    : started
                    ? `Выучено ${learned} из ${g.ids.length}`
                    : 'Нажмите, чтобы начать изучение'}
                </p>
              </div>

              {/* Arabic glyphs preview in RTL */}
              <div className="font-arabic text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 flex gap-2 shrink-0 select-none" dir="rtl">
                {g.ids.map(id => (
                  <span key={id}>{byId[id]?.arabic}</span>
                ))}
              </div>
            </button>
          );
        })}
      </div>

      <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 pt-2 flex items-center justify-center gap-1.5">
        <Lock className="w-3.5 h-3.5" />
        <span>Прогресс сохраняется в браузере вашего устройства</span>
      </p>
    </div>
  );
}

function Wrap({ title, onBack, children }) {
  return (
    <div className="max-w-xl mx-auto px-3 sm:px-4 py-4 sm:py-6 pb-28 md:pb-10">
      <div className="mb-4 flex items-center gap-2.5">
        <button
          onClick={onBack}
          className="p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-emerald-500 active:scale-95 transition"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-extrabold text-lg text-slate-900 dark:text-white truncate">
          {title}
        </h1>
      </div>
      {children}
    </div>
  );
}
