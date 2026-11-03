import React, { useState, useEffect } from 'react';
import { ALPHABET_DATA } from '../data/alphabet';
import { ALL_WORDS } from '../data/book';
import { storageService } from '../services/storage';
import { audioService } from '../services/audio';
import { soundFx } from '../services/soundFx';
import { transcribeArabic } from '../services/transcribe';
import { srs } from '../services/srs';
import confetti from 'canvas-confetti';
import {
  Flame,
  Volume2,
  CheckCircle2,
  X,
  Zap,
  RotateCcw,
  Star,
  Trophy,
  ArrowRight,
  Sparkles,
  Calendar
} from 'lucide-react';

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function DailyWorkoutModal({ isOpen, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [questStatus, setQuestStatus] = useState(() => storageService.getDailyQuestStatus());

  const generateDailyQuestions = () => {
    const list = [];

    // Приоритет буквам, требующим повторения по SRS
    const dueIds = srs.dueIds(ALPHABET_DATA.map(l => l.id));
    const srsCandidates = ALPHABET_DATA.filter(l => dueIds.includes(l.id));
    const pool = srsCandidates.length >= 3 ? srsCandidates : ALPHABET_DATA;

    // 1. Вопрос на слух: буква
    const l1 = pool[Math.floor(Math.random() * pool.length)];
    const distractors1 = shuffle(ALPHABET_DATA.filter(l => l.id !== l1.id)).slice(0, 3);
    list.push({
      type: 'audio-letter',
      title: 'Услышь букву',
      prompt: 'Послушайте аудио и выберите правильную букву:',
      audio: l1.arabic,
      displayArabic: null,
      correctAnswer: l1.arabic,
      options: shuffle([l1, ...distractors1]).map(l => ({ key: l.arabic, label: l.arabic, isArabic: true })),
      explanation: `Это буква «${l1.name}» (${l1.arabic}) — [${l1.transcription}].`
    });

    // 2. Вопрос на форму буквы
    const connPool = ALPHABET_DATA.filter(l => l.connectsLeft);
    const l2 = connPool[Math.floor(Math.random() * connPool.length)];
    const formTypes = [
      { key: 'initial', label: 'в начале слова' },
      { key: 'medial', label: 'в середине слова' },
      { key: 'final', label: 'в конце слова' }
    ];
    const formChoice = formTypes[Math.floor(Math.random() * formTypes.length)];
    const correctForm = l2.forms[formChoice.key];
    const distractors2 = shuffle(connPool.filter(l => l.id !== l2.id)).slice(0, 3).map(l => l.forms[formChoice.key]);
    list.push({
      type: 'form',
      title: 'Форма буквы',
      prompt: `Как пишется буква «${l2.name}» (${l2.arabic}) ${formChoice.label}?`,
      audio: l2.arabic,
      displayArabic: l2.arabic,
      correctAnswer: correctForm,
      options: shuffle([correctForm, ...distractors2]).map(f => ({ key: f, label: f, isArabic: true })),
      explanation: `Буква «${l2.name}» ${formChoice.label} пишется как «${correctForm}».`
    });

    // 3. Вопрос на слог с огласовкой
    const l3 = ALPHABET_DATA[Math.floor(Math.random() * ALPHABET_DATA.length)];
    const harakats = [
      { mark: '\u064E', name: 'фатха', sound: 'а' },
      { mark: '\u0650', name: 'кясра', sound: 'и' },
      { mark: '\u064F', name: 'дамма', sound: 'у' }
    ];
    const h = harakats[Math.floor(Math.random() * harakats.length)];
    const syllable = l3.arabic + h.mark;
    const cons = l3.transcription.split('/')[0].trim();
    const correctReading = cons + h.sound;
    const distractorReadings = harakats.filter(x => x.sound !== h.sound).map(x => cons + x.sound);
    const otherLetter = ALPHABET_DATA.find(l => l.id !== l3.id);
    distractorReadings.push(otherLetter.transcription.split('/')[0].trim() + h.sound);
    list.push({
      type: 'syllable',
      title: 'Чтение слога',
      prompt: 'Как правильно читается этот слог с огласовкой?',
      audio: syllable,
      displayArabic: syllable,
      correctAnswer: correctReading,
      options: shuffle([correctReading, ...distractorReadings.slice(0, 3)]).map(r => ({ key: r, label: `[${r}]`, isArabic: false })),
      explanation: `${syllable} читается как [${correctReading}]. Огласовка: ${h.name} (${h.sound}).`
    });

    // 4. Вопрос на махрадж или таджвид
    const l4 = pool[Math.floor(Math.random() * pool.length)];
    const isQalqala = ['ق', 'ط', 'ب', 'ج', 'د'].includes(l4.arabic);
    const isSun = ['ت', 'ث', 'د', 'ذ', 'ر', 'ز', 'س', 'ш', 'ص', 'ض', 'ط', 'ظ', 'л', 'ن'].includes(l4.arabic);
    list.push({
      type: 'tajweed',
      title: 'Махрадж и свойства',
      prompt: `Где находится махрадж (место образования) буквы «${l4.name}» (${l4.arabic})?`,
      audio: l4.arabic,
      displayArabic: l4.arabic,
      correctAnswer: l4.makhraj,
      options: shuffle([
        l4.makhraj,
        'Сомкнутые губы',
        'Середина горла',
        'Кончик языка у основания верхних резцов'
      ].filter((v, i, a) => a.indexOf(v) === i)).slice(0, 4).map(m => ({ key: m, label: m, isArabic: false })),
      explanation: `Махрадж буквы «${l4.name}» (${l4.arabic}): ${l4.makhraj}.`
    });

    // 5. Вопрос на чтение слова из книги
    const validWords = ALL_WORDS.filter(w => {
      const tr = transcribeArabic(w);
      return tr && tr.length >= 2 && w.length >= 3 && !w.includes(' ');
    });
    const targetWord = validWords[Math.floor(Math.random() * validWords.length)];
    const targetTr = transcribeArabic(targetWord);
    const distractors5 = [];
    let safety = 0;
    while (distractors5.length < 3 && safety < 40) {
      safety++;
      const rw = validWords[Math.floor(Math.random() * validWords.length)];
      const rtr = transcribeArabic(rw);
      if (rtr !== targetTr && !distractors5.includes(rtr)) {
        distractors5.push(rtr);
      }
    }
    list.push({
      type: 'word-reading',
      title: 'Чтение слова',
      prompt: 'Как читается это слово из учебника? (нажмите 🔊 чтобы послушать):',
      audio: targetWord,
      displayArabic: targetWord,
      correctAnswer: targetTr,
      options: shuffle([targetTr, ...distractors5]).map(t => ({ key: t, label: `[${t}]`, isArabic: false })),
      explanation: `Слово «${targetWord}» читается как [${targetTr}].`
    });

    return list;
  };

  const startNewWorkout = () => {
    const q = generateDailyQuestions();
    setQuestions(q);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setIsFinished(false);
    setQuestStatus(storageService.getDailyQuestStatus());
  };

  useEffect(() => {
    if (isOpen) {
      startNewWorkout();
    }
  }, [isOpen]);

  const currentQ = questions[currentIdx];

  // Авто-озвучка при открытии вопроса
  useEffect(() => {
    if (!isOpen || isFinished || !currentQ) return;
    if (currentQ.type === 'audio-letter' || currentQ.type === 'syllable') {
      const timer = setTimeout(() => {
        if (currentQ.audio) {
          audioService.speakArabic(currentQ.audio);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentIdx, isOpen, isFinished]);

  if (!isOpen) return null;

  const handleSelect = (opt) => {
    if (isAnswered) return;
    setSelectedOpt(opt.key);
    setIsAnswered(true);

    const isCorrect = opt.key === currentQ.correctAnswer;
    if (isCorrect) {
      soundFx.playSuccess();
      setScore(s => s + 1);
      // Сразу озвучиваем правильный ответ
      if (currentQ.audio) {
        audioService.speakArabic(currentQ.audio);
      }
    } else {
      soundFx.playError();
    }
  };

  const handleNext = () => {
    soundFx.playTap();
    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(i => i + 1);
      setSelectedOpt(null);
      setIsAnswered(false);
    } else {
      // Завершение тренировки дня!
      const finalScore = score + (selectedOpt === currentQ.correctAnswer ? 0 : 0);
      storageService.completeDailyWorkout(finalScore, questions.length);
      setIsFinished(true);
      setQuestStatus(storageService.getDailyQuestStatus());
      soundFx.playFanfare();
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 via-teal-50 to-amber-50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-md shadow-orange-500/20">
              <Flame className="w-5 h-5 fill-current animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
                  Тренировка дня
                </h3>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border border-orange-300/40">
                  🔥 {questStatus.streak} дн. подряд
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                Ежедневная 3-минутная разминка • +50 XP
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4">
          {!isFinished && currentQ ? (
            <>
              {/* Progress Bar & Counter */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400">
                  <span>Вопрос {currentIdx + 1} из {questions.length}</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">Верно: {score}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300"
                    style={{ width: `${((currentIdx + 1) / questions.length) * 100}%` }}
                  />
                </div>
              </div>

              {/* Question Badge & Title */}
              <div className="text-center pt-2">
                <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 mb-1.5 border border-emerald-300/30">
                  {currentQ.title}
                </span>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-800 dark:text-slate-100">
                  {currentQ.prompt}
                </h4>
              </div>

              {/* Display Box: Big Letter or Word or Audio Speaker Button */}
              <div className="relative p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center min-h-[120px]">
                {currentQ.displayArabic ? (
                  <div className="flex items-center gap-3">
                    <span className="font-arabic text-5xl sm:text-6xl font-bold text-slate-900 dark:text-white leading-normal" dir="rtl">
                      {currentQ.displayArabic}
                    </span>
                    {currentQ.audio && (
                      <button
                        onClick={() => audioService.speakArabic(currentQ.audio)}
                        className="p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 hover:scale-105 active:scale-95 transition-all shadow-xs"
                        title="Послушать аудио ещё раз"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => audioService.speakArabic(currentQ.audio)}
                    className="w-20 h-20 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 hover:scale-105 active:scale-95 transition-all group"
                    title="Нажмите, чтобы прослушать букву"
                  >
                    <Volume2 className="w-9 h-9 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </div>

              {/* Options Grid */}
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = selectedOpt === opt.key;
                  const isCorrect = opt.key === currentQ.correctAnswer;
                  let btnCls = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 hover:border-emerald-500';

                  if (isAnswered) {
                    if (isCorrect) {
                      btnCls = 'bg-emerald-100 dark:bg-emerald-950 border-emerald-500 text-emerald-900 dark:text-emerald-200 font-bold';
                    } else if (isSelected && !isCorrect) {
                      btnCls = 'bg-rose-100 dark:bg-rose-950 border-rose-500 text-rose-900 dark:text-rose-200';
                    } else {
                      btnCls += ' opacity-50';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleSelect(opt)}
                      disabled={isAnswered}
                      dir={opt.isArabic ? 'rtl' : 'ltr'}
                      className={`p-3.5 sm:p-4 rounded-2xl border-2 border-b-4 text-center transition-all active:scale-95 flex items-center justify-center ${
                        opt.isArabic
                          ? 'font-arabic text-3xl sm:text-4xl font-bold leading-relaxed'
                          : 'text-xs sm:text-sm font-extrabold'
                      } ${btnCls}`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>

              {/* Feedback & Next Button */}
              {isAnswered && (
                <div className={`p-4 rounded-2xl border animate-fadeIn ${
                  selectedOpt === currentQ.correctAnswer
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700'
                }`}>
                  <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
                    {currentQ.explanation}
                  </p>
                  <button
                    onClick={handleNext}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-md active:scale-95 flex items-center justify-center gap-2 transition-all"
                  >
                    <span>{currentIdx + 1 < questions.length ? 'Следующий вопрос' : 'Завершить разминку'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </>
          ) : (
            /* Completed Screen */
            <div className="py-4 text-center space-y-4">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-amber-600 text-white flex items-center justify-center mx-auto shadow-xl shadow-orange-500/25 animate-bounce">
                <Flame className="w-10 h-10 fill-current" />
              </div>

              <div>
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                  МашаАллах! Задание дня выполнено!
                </h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Ударный режим сохранён: <strong className="text-orange-500 font-extrabold">{questStatus.streak} дней подряд 🔥</strong>
                </p>
              </div>

              {/* XP Bonus Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-black text-sm border border-emerald-300/40">
                <Zap className="w-4 h-4 fill-current text-amber-500" />
                <span>+50 Бонусных XP начислено!</span>
              </div>

              {/* 7 Days Streak Calendar Tracker */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-left">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    Ваша неделя:
                  </span>
                  <span className="text-[11px] font-extrabold text-orange-500">
                    🔥 {questStatus.streak} дн.
                  </span>
                </div>

                <div className="grid grid-cols-7 gap-1.5 sm:gap-2 text-center">
                  {questStatus.weekDays.map((d, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl flex flex-col items-center justify-center border transition-all ${
                        d.isDone
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : d.isToday
                          ? 'bg-amber-100 dark:bg-amber-950/60 border-amber-400 text-amber-800 dark:text-amber-200 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <span className="text-[10px] font-bold">{d.dayName}</span>
                      <span className="text-xs font-black mt-0.5">
                        {d.isDone ? '✓' : d.dayNum}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  onClick={onClose}
                  className="flex-1 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                >
                  Отлично, продолжить курс!
                </button>
                <button
                  onClick={startNewWorkout}
                  className="px-4 py-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Ещё раз</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
