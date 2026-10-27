import React from 'react';
import { analyzeArabicWord } from '../services/wordAnalyzer';
import { audioService } from '../services/audio';
import { Sparkles, X, Volume2 } from 'lucide-react';

export default function WordBreakdownPanel({ word, onClose }) {
  if (!word) return null;

  const analysis = analyzeArabicWord(word);

  return (
    <div className="mb-6 rounded-3xl bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 dark:from-slate-800 dark:via-slate-800/95 dark:to-emerald-950/30 border-2 border-emerald-500/40 dark:border-emerald-600/40 p-5 sm:p-6 shadow-xl shadow-emerald-900/5 animate-fadeIn">
      {/* Header Row: Selected Word & Transcription */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-emerald-200/70 dark:border-slate-700">
        <div className="flex items-center gap-4">
          <div className="px-5 py-3 rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center">
            <span className="font-arabic text-4xl sm:text-5xl font-bold leading-relaxed" dir="rtl">
              {analysis.word}
            </span>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Побуквенный разбор слова
            </span>
            <p className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              Чтение: [{analysis.transcription}]
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Букв в слове: <strong>{analysis.letters.length}</strong> (нажмите на букву ниже для её реального звучания)
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                className={`p-3.5 rounded-2xl border text-right flex flex-col justify-between transition-all active:scale-95 hover:border-emerald-500 ${
                  ruleMeta
                    ? ruleMeta.bgClass
                    : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-700'
                }`}
                title={`Послушать студийную запись буквы ${item.letterName}`}
              >
                {/* Top row: Step number + Isolated letter badge */}
                <div className="flex items-center justify-between w-full mb-1" dir="ltr">
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    Буква {idx + 1}
                  </span>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    {item.letterName} ({item.base})
                    <Volume2 className="w-3 h-3 text-emerald-600" />
                  </span>
                </div>

                {/* Center: Positional Form in Word */}
                <div className="my-2 flex items-center justify-center">
                  <span
                    className={`font-arabic text-4xl font-bold leading-relaxed ${
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
                      <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        [{item.sound}]
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 leading-snug">
                    {item.vowelLabel}
                  </p>
                  {ruleMeta && (
                    <span className={`inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-bold ${ruleMeta.badgeClass}`}>
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
        <div className="mt-4 pt-3 border-t border-emerald-200/60 dark:border-slate-700/70 flex flex-wrap gap-2">
          {analysis.activeRules.map(rule => (
            <div
              key={rule.id}
              className={`px-3 py-2 rounded-xl border text-xs flex items-start gap-2 ${rule.bgClass}`}
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
