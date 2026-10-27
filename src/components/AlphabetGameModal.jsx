import React, { useState, useEffect } from 'react';
import { ALPHABET_DATA, SPECIAL_LETTERS, LETTER_FAMILIES } from '../data/alphabet';
import { audioService } from '../services/audio';
import { soundFx } from '../services/soundFx';
import { storageService } from '../services/storage';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  Heart,
  Zap,
  Sparkles,
  Trophy,
  RotateCcw,
  CheckCircle2,
  Gamepad2,
  Headphones,
  Users,
  ListOrdered
} from 'lucide-react';

function shuffle(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function AlphabetGameModal({ onClose }) {
  const [subMode, setSubMode] = useState('audio'); // 'audio' | 'families' | 'order'
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [combo, setCombo] = useState(0);
  const [finished, setFinished] = useState(false);

  // Найти семейство буквы
  const getFamilyForLetter = (arabicChar) => {
    return LETTER_FAMILIES.find(f => f.letterSymbols.includes(arabicChar));
  };

  // 1. Генерация вопросов "Угадай на слух"
  const generateAudioQuestions = (count = 10) => {
    const pool = shuffle([...ALPHABET_DATA]);
    const list = [];

    for (let i = 0; i < Math.min(count, pool.length); i++) {
      const target = pool[i];
      const fam = getFamilyForLetter(target.arabic);

      // Дистракторы: сначала берём буквы из того же семейства (похожие по форме!), затем случайные
      const familyDistractors = fam
        ? fam.letterSymbols.filter(s => s !== target.arabic).map(s => ALPHABET_DATA.find(l => l.arabic === s)).filter(Boolean)
        : [];

      const remainingPool = shuffle(ALPHABET_DATA.filter(l => l.arabic !== target.arabic && !familyDistractors.some(fd => fd.arabic === l.arabic)));
      const distractors = [...familyDistractors, ...remainingPool].slice(0, 3);

      const options = shuffle([target, ...distractors]);

      list.push({
        type: 'audio',
        target,
        prompt: 'Послушайте студийный звук и выберите правильную букву:',
        correctAnswer: target.arabic,
        options: options.map(o => ({
          value: o.arabic,
          label: o.arabic,
          subLabel: o.name
        })),
        explanation: `Это буква «${target.name}» (${target.arabic}) — читается как [${target.transcription}].`
      });
    }
    return list;
  };

  // 2. Генерация вопросов "Найди пару / сестру по форме"
  const generateFamilyQuestions = (count = 10) => {
    const multiLetterFamilies = LETTER_FAMILIES.filter(f => f.letterSymbols.length >= 2 && !f.isSpecial);
    const list = [];

    for (let i = 0; i < count; i++) {
      const fam = multiLetterFamilies[i % multiLetterFamilies.length];
      const shuffledFam = shuffle([...fam.letterSymbols]);
      const targetChar = shuffledFam[0];
      const sisterChar = shuffledFam[1];

      const targetLetter = ALPHABET_DATA.find(l => l.arabic === targetChar) || { name: targetChar, arabic: targetChar };
      const sisterLetter = ALPHABET_DATA.find(l => l.arabic === sisterChar) || { name: sisterChar, arabic: sisterChar };

      // Дистракторы из других семейств
      const otherLetters = shuffle(ALPHABET_DATA.filter(l => !fam.letterSymbols.includes(l.arabic))).slice(0, 3);
      const options = shuffle([sisterLetter, ...otherLetters]);

      list.push({
        type: 'family',
        target: targetLetter,
        prompt: `Какая буква относится к одному семейству с «${targetLetter.name}» (${targetLetter.arabic})?`,
        promptBadge: fam.badge,
        displaySymbol: targetLetter.arabic,
        correctAnswer: sisterLetter.arabic,
        options: options.map(o => ({
          value: o.arabic,
          label: o.arabic,
          subLabel: o.name
        })),
        explanation: `Буквы «${targetLetter.name}» (${targetLetter.arabic}) и «${sisterLetter.name}» (${sisterLetter.arabic}) имеют одинаковый остов (${fam.name}).`
      });
    }
    return shuffle(list);
  };

  // 3. Генерация вопросов "Порядок букв (Пропущенная буква)"
  const generateOrderQuestions = (count = 10) => {
    const list = [];
    const maxStart = ALPHABET_DATA.length - 4;

    for (let i = 0; i < count; i++) {
      const startIdx = Math.floor(Math.random() * maxStart);
      const slice = ALPHABET_DATA.slice(startIdx, startIdx + 4);
      const missingPos = Math.floor(Math.random() * 2) + 1; // 1 или 2
      const target = slice[missingPos];

      const distractors = shuffle(ALPHABET_DATA.filter(l => !slice.some(s => s.id === l.id))).slice(0, 3);
      const options = shuffle([target, ...distractors]);

      const sequenceDisplay = slice.map((l, idx) => (idx === missingPos ? '❓' : l.arabic)).join(' ، ');

      list.push({
        type: 'order',
        target,
        prompt: 'Какая буква пропущена в алфавитном порядке?',
        sequenceDisplay,
        correctAnswer: target.arabic,
        options: options.map(o => ({
          value: o.arabic,
          label: o.arabic,
          subLabel: o.name
        })),
        explanation: `В алфавите буква «${target.name}» (${target.arabic}) идёт после «${slice[missingPos - 1].name}» (${slice[missingPos - 1].arabic}).`
      });
    }
    return list;
  };

  const startSession = (modeKey) => {
    let qList = [];
    if (modeKey === 'audio') qList = generateAudioQuestions(10);
    else if (modeKey === 'families') qList = generateFamilyQuestions(10);
    else if (modeKey === 'order') qList = generateOrderQuestions(10);

    setQuestions(qList);
    setCurrentIdx(0);
    setSelectedOpt(null);
    setIsAnswered(false);
    setScore(0);
    setHearts(3);
    setCombo(0);
    setFinished(false);

    if (qList.length > 0 && modeKey === 'audio') {
      setTimeout(() => {
        audioService.playLetter(qList[0].target.arabic);
      }, 350);
    }
  };

  useEffect(() => {
    startSession(subMode);
  }, [subMode]);

  const currentQ = questions[currentIdx];

  const handlePlayPromptAudio = () => {
    if (currentQ?.target?.arabic) {
      audioService.playLetter(currentQ.target.arabic);
      soundFx.playTap();
    }
  };

  const handleSelectOption = (optVal) => {
    if (isAnswered || !currentQ) return;
    setSelectedOpt(optVal);
    setIsAnswered(true);

    const isCorrect = optVal === currentQ.correctAnswer;
    if (isCorrect) {
      soundFx.playSuccess();
      setScore(s => s + 1);
      setCombo(c => c + 1);
      storageService.addXp(10);
    } else {
      soundFx.playError();
      setCombo(0);
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      if (nextHearts <= 0) {
        setTimeout(() => setFinished(true), 750);
        return;
      }
    }
  };

  const handleNext = () => {
    if (currentIdx + 1 < questions.length) {
      const nextIndex = currentIdx + 1;
      setCurrentIdx(nextIndex);
      setSelectedOpt(null);
      setIsAnswered(false);
      soundFx.playTap();

      if (subMode === 'audio' && questions[nextIndex]?.target?.arabic) {
        setTimeout(() => {
          audioService.playLetter(questions[nextIndex].target.arabic);
        }, 300);
      }
    } else {
      setFinished(true);
      storageService.addXp(35);
      soundFx.playFanfare();
      confetti({
        particleCount: 85,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Gamepad2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Игра «Знаток Алфавита»</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold">
                  +10 XP
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Тренировка звучания, похожих семейств и порядка букв
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

        {/* 3 Game Sub-Modes Switcher */}
        <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setSubMode('audio')}
            className={`py-2 px-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              subMode === 'audio'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Headphones className="w-3.5 h-3.5" />
            <span className="truncate">На слух 🎧</span>
          </button>

          <button
            onClick={() => setSubMode('families')}
            className={`py-2 px-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              subMode === 'families'
                ? 'bg-white dark:bg-slate-800 text-teal-700 dark:text-teal-400 shadow-sm border border-teal-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span className="truncate">Семейства 👯</span>
          </button>

          <button
            onClick={() => setSubMode('order')}
            className={`py-2 px-1.5 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all ${
              subMode === 'order'
                ? 'bg-white dark:bg-slate-800 text-amber-700 dark:text-amber-400 shadow-sm border border-amber-500/20'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span className="truncate">Порядок ⚡</span>
          </button>
        </div>

        {/* Game Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          {finished ? (
            <div className="py-8 text-center animate-fadeIn">
              <Trophy className="w-16 h-16 text-amber-400 mx-auto mb-3 animate-bounce" />
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                {hearts <= 0 ? 'Жизни закончились!' : 'МашаАллах! Отличная игра!'}
              </h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Правильных ответов: <strong className="text-emerald-600 text-xl">{score}</strong> из {questions.length}
              </p>
              <button
                onClick={() => startSession(subMode)}
                className="mt-6 px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm inline-flex items-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Сыграть ещё раунд</span>
              </button>
            </div>
          ) : currentQ ? (
            <div>
              {/* Status Row: Hearts, Combo, Score */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200/60 dark:border-rose-800/60">
                  {[1, 2, 3].map(h => (
                    <Heart
                      key={h}
                      className={`w-4 h-4 ${
                        h <= hearts ? 'fill-rose-500 text-rose-500' : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {combo >= 2 && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-xs font-black flex items-center gap-1 animate-bounce">
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      x{combo}
                    </span>
                  )}
                  <span className="text-xs font-bold text-slate-500">
                    Вопрос {currentIdx + 1} из {questions.length} • Очки: <strong className="text-emerald-600">{score}</strong>
                  </span>
                </div>
              </div>

              {/* Question Prompt */}
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 text-center mb-3">
                {currentQ.prompt}
              </p>

              {/* Center Display Card */}
              <div className="my-3 p-5 rounded-2xl bg-[#FAF7F0] dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center min-h-[120px]">
                {subMode === 'audio' && (
                  <button
                    onClick={handlePlayPromptAudio}
                    className="group px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 flex items-center gap-2.5 active:scale-95 transition-all"
                  >
                    <Volume2 className="w-6 h-6 animate-pulse" />
                    <span>Послушать звук буквы</span>
                  </button>
                )}

                {subMode === 'families' && (
                  <div className="text-center">
                    <span className="font-arabic text-6xl font-bold text-emerald-700 dark:text-emerald-400" dir="rtl">
                      {currentQ.displaySymbol}
                    </span>
                    {currentQ.promptBadge && (
                      <span className="block mt-2 text-[11px] font-bold text-slate-500 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                        {currentQ.promptBadge}
                      </span>
                    )}
                  </div>
                )}

                {subMode === 'order' && (
                  <div className="font-arabic text-3xl sm:text-4xl font-bold text-slate-800 dark:text-slate-100 tracking-wider" dir="rtl">
                    {currentQ.sequenceDisplay}
                  </div>
                )}
              </div>

              {/* 4 Options Grid */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-4" dir="rtl">
                {currentQ.options.map((opt, i) => {
                  const isSelected = selectedOpt === opt.value;
                  const isRight = opt.value === currentQ.correctAnswer;

                  let style = 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-900 dark:text-white';
                  if (isAnswered) {
                    if (isRight) {
                      style = 'bg-emerald-100 dark:bg-emerald-950/80 border-emerald-500 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/30';
                    } else if (isSelected) {
                      style = 'bg-rose-100 dark:bg-rose-950/80 border-rose-500 text-rose-900 dark:text-rose-200';
                    } else {
                      style = 'opacity-40 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800';
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleSelectOption(opt.value)}
                      disabled={isAnswered}
                      className={`p-3.5 sm:p-4 rounded-2xl border-b-4 flex flex-col items-center justify-center transition-all select-none active:scale-95 ${style}`}
                    >
                      <span className="font-arabic text-3xl sm:text-4xl font-bold leading-relaxed">
                        {opt.label}
                      </span>
                      {opt.subLabel && (
                        <span className="text-[11px] font-sans font-bold text-slate-500 dark:text-slate-400 mt-0.5" dir="ltr">
                          {opt.subLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Explanation & Next Button */}
              {isAnswered && (
                <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 animate-fadeIn">
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    <strong>Пояснение:</strong> {currentQ.explanation}
                  </p>

                  <button
                    onClick={handleNext}
                    className="mt-3 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md transition-all active:scale-95"
                  >
                    {currentIdx + 1 < questions.length ? 'Следующий вопрос →' : 'Завершить раунд (+35 XP)'}
                  </button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
