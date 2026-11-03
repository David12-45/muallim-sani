// Голосовой тренажёр произношения арабских букв и слов с микрофоном
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, ArrowLeft, Sparkles, CheckCircle2, XCircle, RotateCcw, AlertCircle, HelpCircle } from 'lucide-react';
import { ALPHABET_DATA } from '../../data/alphabet';
import { ALL_WORDS } from '../../data/book';
import { audioService } from '../../services/audio';
import { soundFx } from '../../services/soundFx';
import { speechService } from '../../services/speech';
import { stats } from '../../services/storage';

export default function VoiceTrainerGame({ level, onExit }) {
  const [mode, setMode] = useState('letters'); // 'letters' | 'words'
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [result, setResult] = useState(null); // { isMatch, ratio, transcript, confidence }
  const [errorMsg, setErrorMsg] = useState(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  // Список заданий: буквы или слова
  const lettersList = ALPHABET_DATA;
  const wordsList = ALL_WORDS.filter((w) => w.arabic && w.arabic.length >= 2).slice(0, 60);

  const currentItem = mode === 'letters' ? lettersList[currentIndex % lettersList.length] : wordsList[currentIndex % wordsList.length];
  const targetArabic = mode === 'letters' ? currentItem.arabic : currentItem.arabic;
  const targetName = mode === 'letters' ? currentItem.name : currentItem.transcription || currentItem.translation;

  useEffect(() => {
    setIsSupported(speechService.isSupported());
    return () => {
      speechService.stopListening();
    };
  }, []);

  const handlePlaySample = () => {
    soundFx.playTap();
    if (mode === 'letters') {
      audioService.playLetter(currentItem.arabic);
    } else {
      audioService.playWordAudio(currentItem.arabic);
    }
  };

  const handleStartListening = () => {
    setErrorMsg(null);
    setResult(null);

    const started = speechService.startListening({
      targetText: targetArabic,
      onStart: () => {
        setIsListening(true);
        soundFx.playTap();
      },
      onResult: (res) => {
        setIsListening(false);
        setResult(res);
        if (res.isMatch) {
          soundFx.playCorrect();
          setScore((s) => s + 10);
          setStreak((st) => st + 1);
          stats.addXp(10);
        } else {
          soundFx.playWrong();
          setStreak(0);
        }
      },
      onError: (err) => {
        setIsListening(false);
        setErrorMsg(err.message || 'Ошибка распознавания');
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    if (!started) {
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    speechService.stopListening();
    setIsListening(false);
  };

  const handleNext = () => {
    speechService.stopListening();
    setIsListening(false);
    setResult(null);
    setErrorMsg(null);
    setCurrentIndex((i) => i + 1);
  };

  const handleSelfPass = () => {
    soundFx.playCorrect();
    setScore((s) => s + 5);
    stats.addXp(5);
    handleNext();
  };

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <button
          onClick={() => { speechService.stopListening(); onExit(); }}
          className="flex items-center gap-1.5 text-sm font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Назад к играм
        </button>

        <div className="flex items-center gap-3">
          {/* Переключатель режимов */}
          <div className="flex bg-slate-100 dark:bg-slate-700/60 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => { setMode('letters'); setCurrentIndex(0); setResult(null); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                mode === 'letters'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Буквы (28)
            </button>
            <button
              onClick={() => { setMode('words'); setCurrentIndex(0); setResult(null); }}
              className={`px-3 py-1 rounded-lg transition-all ${
                mode === 'words'
                  ? 'bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400'
              }`}
            >
              Слова
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-black text-amber-700 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" /> +{score} XP
          </div>
        </div>
      </div>

      {/* Описание */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
          Голосовой тренажёр арабского
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Послушайте эталонное чтение, нажмите на микрофон и произнесите вслух
        </p>
      </div>

      {/* Предупреждение о поддержке */}
      {!isSupported && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900 dark:text-amber-200">
            <p className="font-bold">Распознавание речи через микрофон лучше всего работает в Google Chrome, Edge и Яндекс.Браузере.</p>
            <p className="mt-1">Вы можете слушать эталонное аудио и оценивать себя самостоятельно кнопкой «Я сказал правильно».</p>
          </div>
        </div>
      )}

      {/* Карточка текущей буквы/слова */}
      <div className="relative bg-gradient-to-b from-slate-50 to-white dark:from-slate-800/80 dark:to-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 text-center shadow-lg">
        {/* Арабский текст */}
        <div className="py-4">
          <span
            className="font-arabic text-7xl sm:text-8xl font-black text-emerald-700 dark:text-emerald-400 select-none block leading-tight tracking-wide"
            dir="rtl"
          >
            {targetArabic}
          </span>
        </div>

        {/* Название / Транскрипция */}
        <div className="mt-2">
          <div className="text-lg font-bold text-slate-800 dark:text-slate-200">
            {targetName}
          </div>
          {mode === 'letters' && currentItem.transcription && (
            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Звук: [{currentItem.transcription}] {currentItem.makhraj ? `• ${currentItem.makhraj}` : ''}
            </div>
          )}
          {mode === 'words' && currentItem.translation && (
            <div className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
              Перевод: {currentItem.translation}
            </div>
          )}
        </div>

        {/* Кнопка эталонного звука */}
        <div className="mt-4 flex justify-center">
          <button
            onClick={handlePlaySample}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            <Volume2 className="w-4 h-4" /> Послушать эталон
          </button>
        </div>

        {/* Кнопка микрофона */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3">
          <button
            onClick={isListening ? handleStopListening : handleStartListening}
            className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-8 ring-rose-300/40 dark:ring-rose-900/40'
                : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:brightness-105 shadow-emerald-500/25 ring-4 ring-emerald-200/50 dark:ring-emerald-950/50'
            }`}
            aria-label={isListening ? 'Остановить запись' : 'Начать запись'}
          >
            {isListening ? (
              <MicOff className="w-10 h-10 animate-bounce" />
            ) : (
              <Mic className="w-10 h-10" />
            )}
          </button>

          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
            {isListening ? '🔴 Слушаю... Говорите вслух' : 'Нажмите и произнесите'}
          </span>
        </div>

        {/* Ошибка микрофона */}
        {errorMsg && (
          <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center justify-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Результат проверки */}
        {result && (
          <div
            className={`mt-6 p-4 rounded-2xl border text-left transition-all ${
              result.isMatch
                ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800'
                : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800'
            }`}
          >
            <div className="flex items-start gap-3">
              {result.isMatch ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-black text-sm text-slate-900 dark:text-white flex items-center justify-between">
                  <span>{result.isMatch ? 'Отличное произношение! Ма ша Аллах!' : 'Почти получилось! Попробуйте ещё раз'}</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800">
                    Точность: {Math.round(result.ratio * 100)}%
                  </span>
                </div>

                <div className="text-xs text-slate-600 dark:text-slate-300 mt-2 space-y-1">
                  <div>Распознано: <span className="font-arabic font-bold text-base text-emerald-700 dark:text-emerald-400" dir="rtl">{result.transcript || '—'}</span></div>
                  <div>Ожидалось: <span className="font-arabic font-bold text-base text-slate-800 dark:text-slate-200" dir="rtl">{targetArabic}</span></div>
                </div>

                {mode === 'letters' && currentItem.makhraj && !result.isMatch && (
                  <div className="text-xs text-amber-800 dark:text-amber-300 mt-2 pt-2 border-t border-amber-200 dark:border-amber-800">
                    💡 Подсказка махраджа: {currentItem.makhraj}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Нижняя панель действий */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handleNext}
          className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          Пропустить
        </button>

        <div className="flex items-center gap-2">
          {!isSupported && (
            <button
              onClick={handleSelfPass}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 dark:hover:bg-emerald-950/60 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all"
            >
              Я сказал верно (+5 XP)
            </button>
          )}

          <button
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md active:scale-95 transition-all"
          >
            Следующее задание →
          </button>
        </div>
      </div>
    </div>
  );
}
