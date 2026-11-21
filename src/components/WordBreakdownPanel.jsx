import React, { useState } from 'react';
import { analyzeArabicWord } from '../services/wordAnalyzer';
import { audioService } from '../services/audio';
import { soundFx } from '../services/soundFx';
import { speechService } from '../services/speech';
import { stats } from '../services/storage';
import { Sparkles, X, Volume2, Mic, MicOff } from 'lucide-react';

export default function WordBreakdownPanel({ word, onClose }) {
  const [isListening, setIsListening] = useState(false);
  const [speechFeedback, setSpeechFeedback] = useState(null);

  if (!word) return null;

  const analysis = analyzeArabicWord(word);

  const handleVoiceCheck = () => {
    if (isListening) {
      speechService.stopListening();
      setIsListening(false);
      return;
    }
    setSpeechFeedback(null);
    speechService.startListening({
      targetText: analysis.word,
      onStart: () => setIsListening(true),
      onResult: (res) => {
        setIsListening(false);
        setSpeechFeedback(res);
        if (res.isMatch) {
          soundFx.playCorrect();
          stats.addXp(5);
        } else {
          soundFx.playWrong();
        }
      },
      onError: (err) => {
        setIsListening(false);
        setSpeechFeedback({ isMatch: false, error: err.message });
      },
      onEnd: () => setIsListening(false)
    });
  };

  return (
    <div className="mb-6 rounded-[2rem] bg-[#FFFDF8] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5 sm:p-6 shadow-apple-md animate-fadeIn">
      {/* Header Row: Selected Word & Transcription */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => audioService.speakArabic(analysis.word)}
            className="px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-apple-sm flex items-center justify-center gap-2.5 transition-all active:scale-95 group cursor-pointer"
            title="Послушать произношение всего слова"
          >
            <span className="font-arabic text-5xl sm:text-6xl font-bold leading-relaxed" dir="rtl">
              {analysis.word}
            </span>
            <Volume2 className="w-5 h-5 text-emerald-100 group-hover:scale-110 transition-transform shrink-0" />
          </button>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Побуквенный разбор слова
            </span>
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              Чтение: [{analysis.transcription}]
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal">
              Букв в слове: <strong>{analysis.letters.length}</strong> (нажмите на букву ниже для её реального звучания)
            </p>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <button
                onClick={handleVoiceCheck}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
                  isListening
                    ? 'bg-rose-500 text-white animate-pulse'
                    : speechFeedback?.isMatch
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/80 dark:border-emerald-700/80'
                    : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-750 border border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-apple-xs'
                }`}
                title="Проверить произношение слова через микрофон"
              >
                {isListening ? (
                  <MicOff className="w-3.5 h-3.5 animate-bounce" />
                ) : (
                  <Mic className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                )}
                <span>
                  {isListening
                    ? 'Слушаю... говорите'
                    : speechFeedback
                    ? speechFeedback.isMatch
                      ? `Верно (${Math.round(speechFeedback.ratio * 100)}%)`
                      : 'Не совпало, ещё раз'
                    : 'Сказать в микрофон'}
                </span>
              </button>
              {speechFeedback && !isListening && (
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                  {speechFeedback.transcript ? `Вы сказали: «${speechFeedback.transcript}»` : speechFeedback.error || ''}
                </span>
              )}
            </div>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Закрыть разбор"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Letter-by-Letter Cards (Right-to-Left) */}
      <div className="mt-5">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
          Состав слова по буквам (справа налево ←, нажмите на карточку буквы, чтобы услышать её студийную запись):
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3" dir="rtl">
          {analysis.letters.map((item, idx) => {
            const ruleMeta = item.tajweedMeta;
            return (
              <button
                key={idx}
                onClick={() => audioService.playLetter(item.base)}
                className={`p-3.5 rounded-2xl border text-right flex flex-col justify-between transition-all active:scale-95 shadow-apple-xs hover:shadow-apple-sm hover:-translate-y-0.5 ${
                  ruleMeta
                    ? ruleMeta.bgClass
                    : 'bg-slate-50 dark:bg-slate-850/70 border-slate-200/80 dark:border-slate-750 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                title={`Послушать студийную запись буквы ${item.letterName}`}
              >
                {/* Top row: Step number + Isolated letter badge */}
                <div className="flex items-center justify-between w-full mb-1" dir="ltr">
                  <span className="px-2 py-0.5 rounded-md bg-[#FFFDF8] dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                    Буква {idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    {item.letterName} ({item.base})
                    <Volume2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  </span>
                </div>

                {/* Center: Positional Form in Word */}
                <div className="my-2 flex items-center justify-center">
                  <span
                    className={`font-arabic text-5xl sm:text-6xl font-bold leading-relaxed ${
                      ruleMeta ? ruleMeta.textClass : 'text-slate-900 dark:text-white'
                    }`}
                  >
                    {item.displayForm}
                  </span>
                </div>

                {/* Bottom info: Position + Diacritics + Tajweed badge */}
                <div className="space-y-1 border-t border-slate-100 dark:border-slate-800 pt-2 text-left" dir="ltr">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500 dark:text-slate-400 font-medium">
                      {item.positionLabel}
                    </span>
                    {item.sound && (
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        [{item.sound}]
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-snug font-normal">
                    {item.vowelLabel}
                  </p>
                  {ruleMeta && (
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold ${ruleMeta.badgeClass}`}>
                      {ruleMeta.shortLabel}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Tajweed Rules Summary in this Word */}
      {analysis.activeRules.length > 0 && (
        <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
          {analysis.activeRules.map(rule => (
            <div
              key={rule.id}
              className={`px-3 py-2 rounded-xl border text-xs flex items-start gap-2 shadow-apple-xs ${rule.bgClass}`}
            >
              <Sparkles className={`w-4 h-4 shrink-0 mt-0.5 ${rule.textClass}`} />
              <div>
                <strong className={rule.textClass}>{rule.label}:</strong>{' '}
                <span className="text-slate-700 dark:text-slate-300">{rule.description}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
