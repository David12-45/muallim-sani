import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { transcribeArabic } from '../services/transcribe';
import { soundFx } from '../services/soundFx';
import { ALL_WORDS } from '../data/book';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  Award,
  ArrowRight,
  Star,
  Zap
} from 'lucide-react';

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function LessonMiniExam({ lesson, onPassExam, defaultOpen = false }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Собираем уникальные слова текущего урока
  const getLessonWords = () => {
    const raw = [];
    if (lesson.rows) {
      lesson.rows.forEach(r => {
        r.trim().split(/\s+/).forEach(w => {
          const clean = w.replace(/[()=]/g, '').trim();
          if (clean) raw.push(clean);
        });
      });
    }
    if (lesson.pairs) {
      lesson.pairs.forEach(([a, b]) => {
        if (a) raw.push(a.trim());
        if (b) raw.push(b.trim());
      });
    }
    return Array.from(new Set(raw)).filter(w => transcribeArabic(w).length > 0);
  };

  const buildExam = () => {
    const lessonPool = getLessonWords();
    if (lessonPool.length === 0) return;

    const totalQuestions = Math.min(5, Math.max(3, lessonPool.length));
    const chosenTargets = shuffle(lessonPool).slice(0, totalQuestions);

    // Дополнительный пул для дистракторов, если в уроке мало слов
    const fallbackPool = lessonPool.length >= 4
      ? lessonPool
      : Array.from(new Set([...lessonPool, 'رَ', 'رِ', 'رُ', 'زَ', 'مُرْ', 'اَمَرَ', ...ALL_WORDS.slice(0, 20)]));

    const generated = chosenTargets.map((targetWord, idx) => {
      const targetTrans = transcribeArabic(targetWord);
      const distractions = shuffle(
        fallbackPool.filter(w => w !== targetWord && transcribeArabic(w) !== targetTrans)
      ).slice(0, 3);

      const allWordsOptions = shuffle([targetWord, ...distractions]);
      const mode = idx % 2; // 0 = чтение арабского слова, 1 = найти слово по транскрипции

      if (mode === 0) {
        return {
          mode: 'read',
          promptLabel: 'Как правильно читается это слово из урока?',
          targetWord,
          targetTrans,
          options: allWordsOptions.map(w => ({
            value: w,
            label: `[${transcribeArabic(w)}]`,
            subLabel: w,
            isArabic: false
          }))
        };
      } else {
        return {
          mode: 'reverse',
          promptLabel: `Найдите арабское написание для чтения [${targetTrans}]:`,
          targetWord,
          targetTrans,
          options: allWordsOptions.map(w => ({
            value: w,
            label: w,
            subLabel: `[${transcribeArabic(w)}]`,
            isArabic: true
          }))
        };
      }
    });

    setQuestions(generated);
    setCurrentIdx(0);
    setSelectedOption(null);
    setScore(0);
    setFinished(false);
  };

  useEffect(() => {
    setIsOpen(defaultOpen);
    setFinished(false);
    if (defaultOpen) {
      buildExam();
    } else {
      setQuestions([]);
    }
  }, [lesson?.id, defaultOpen]);

  const handleStartExam = () => {
    setIsOpen(true);
    buildExam();
  };

  const currentQuestion = questions[currentIdx];

  const handleSelectOption = (optionValue) => {
    if (selectedOption !== null || !currentQuestion) return;
    setSelectedOption(optionValue);

    const isCorrect = optionValue === currentQuestion.targetWord;
    if (isCorrect) {
      soundFx.playSuccess();
      setScore(s => s + 1);
      storageService.addXp(10);
    } else {
      soundFx.playError();
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      soundFx.playTap();
      const nextIndex = currentIdx + 1;
      setCurrentIdx(nextIndex);
      setSelectedOption(null);
    } else {
      setFinished(true);
      if (score >= Math.ceil(questions.length * 0.6)) {
        soundFx.playFanfare();
        if (onPassExam) onPassExam();
      } else {
        soundFx.playError();
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-7 border-2 border-amber-400/40 dark:border-amber-500/30 shadow-lg mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Битва за 3 звезды ⭐ (Мини-экзамен)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              5 вопросов по словам со стр. {lesson.pagesList ? lesson.pagesList.join('–') : lesson.page} (+50 XP)
            </p>
          </div>
        </div>

        {!isOpen && (
          <button
            onClick={handleStartExam}
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 transition-all active:scale-95 shrink-0"
          >
            Начать испытание (5 вопросов) →
          </button>
        )}
      </div>

      {isOpen && currentQuestion && !finished && (
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700">
          {/* Progress Header */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-3">
            <span>Вопрос {currentIdx + 1} из {questions.length}</span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 fill-current" />
              Очки: {score} / {questions.length}
            </span>
          </div>

          {/* Progress Dots */}
          <div className="grid grid-cols-5 gap-1.5 mb-4">
            {questions.map((_, i) => (
              <div
                key={i}
                className={`h-2 rounded-full transition-all ${
                  i < currentIdx
                    ? 'bg-emerald-500'
                    : i === currentIdx
                    ? 'bg-amber-400'
                    : 'bg-slate-200 dark:bg-slate-700'
                }`}
              />
            ))}
          </div>

          {/* Question Box */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-700 text-center mb-4">
            <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 mb-3">
              {currentQuestion.promptLabel}
            </p>

            {currentQuestion.mode === 'read' ? (
              <span className="inline-block font-arabic text-4xl sm:text-5xl font-bold text-slate-900 dark:text-white leading-relaxed" dir="rtl">
                {currentQuestion.targetWord}
              </span>
            ) : (
              <span className="inline-block text-2xl sm:text-3xl font-mono font-extrabold text-emerald-700 dark:text-emerald-400">
                [{currentQuestion.targetTrans}]
              </span>
            )}
          </div>

          {/* Options Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {currentQuestion.options.map((opt, idx) => {
              const isChosen = selectedOption === opt.value;
              const isRight = opt.value === currentQuestion.targetWord;

              let btnStyle = 'bg-white dark:bg-slate-800 border-b-4 border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-900 dark:text-white';
              if (selectedOption !== null) {
                if (isRight) {
                  btnStyle = 'bg-emerald-50 dark:bg-emerald-950/70 border-b-4 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30';
                } else if (isChosen) {
                  btnStyle = 'bg-rose-50 dark:bg-rose-950/70 border-b-4 border-rose-500 text-rose-900 dark:text-rose-200';
                } else {
                  btnStyle = 'opacity-50 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800';
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelectOption(opt.value)}
                  disabled={selectedOption !== null}
                  className={`p-3.5 sm:p-4 rounded-2xl border text-center flex items-center justify-between gap-3 transition-all active:scale-95 ${btnStyle}`}
                >
                  <div className="flex items-center gap-3 mx-auto">
                    <span className={opt.isArabic ? 'font-arabic text-3xl font-bold leading-relaxed' : 'font-mono text-lg font-bold'}>
                      {opt.label}
                    </span>
                    {selectedOption !== null && opt.subLabel && (
                      <span className="text-xs text-slate-500 font-mono">
                        {opt.subLabel}
                      </span>
                    )}
                  </div>
                  {selectedOption !== null && isRight && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                  {selectedOption !== null && isChosen && !isRight && <XCircle className="w-5 h-5 text-rose-600 shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Next Button */}
          {selectedOption !== null && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleNext}
                className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm inline-flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <span>{currentIdx + 1 < questions.length ? 'Дальше' : 'Завершить испытание'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {isOpen && finished && (
        <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-700 text-center">
          <div className="flex justify-center gap-1.5 mb-2">
            {[1, 2, 3].map(s => (
              <Star
                key={s}
                className={`w-8 h-8 ${
                  s <= (score === questions.length ? 3 : score >= 3 ? 2 : 1)
                    ? 'fill-amber-400 text-amber-500 animate-bounce'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            ))}
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white">
            Результат: {score} из {questions.length}
          </h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            {score === questions.length
              ? 'МашаАллах! Вы заработали все 3 звезды ⭐ за этот урок!'
              : score >= Math.ceil(questions.length * 0.6)
              ? 'Отличный результат! Урок пройден!'
              : 'Попробуйте ещё раз, чтобы собрать все 3 звезды!'}
          </p>
          <div className="mt-4 flex justify-center">
            <button
              onClick={buildExam}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold inline-flex items-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Сыграть ещё раз</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
