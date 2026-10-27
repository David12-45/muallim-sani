import React, { useState } from 'react';
import { ALL_LESSONS } from '../data/book';
import { transcribeArabic } from '../services/transcribe';
import WordBreakdownPanel from './WordBreakdownPanel';
import TajweedWordText from './TajweedWordText';
import { ChevronLeft, ChevronRight, ExternalLink, Palette } from 'lucide-react';

export default function BookPagesView({ initialPage = 2, onSelectLesson }) {
  const [page, setPage] = useState(initialPage);
  const [activeWord, setActiveWord] = useState(null);
  const [highlightTajweed, setHighlightTajweed] = useState(true);

  const totalPages = 48;
  const pad = String(page).padStart(2, '0');

  const pageLessons = ALL_LESSONS.filter(l =>
    l.pagesList ? l.pagesList.includes(page) : l.page === page
  );

  const handleSelectWord = (word) => {
    const clean = String(word || '').replace(/[()=ـ]/g, '').trim();
    if (clean) {
      setActiveWord(clean);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-28 md:pb-10">
      {/* Top Page Controls */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-700 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setPage(p => Math.max(1, p - 1));
              setActiveWord(null);
            }}
            disabled={page <= 1}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 disabled:opacity-40 text-slate-700 dark:text-slate-200 transition-colors"
            title="Предыдущая страница"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center px-2">
            <span className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
              Страница {page} из {totalPages}
            </span>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Оригинал книги «Му'аллим Сани» (Москва 2024)
            </p>
          </div>

          <button
            onClick={() => {
              setPage(p => Math.min(totalPages, p + 1));
              setActiveWord(null);
            }}
            disabled={page >= totalPages}
            className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-emerald-100 disabled:opacity-40 text-slate-700 dark:text-slate-200 transition-colors"
            title="Следующая страница"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Page Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
          <button
            onClick={() => setHighlightTajweed(!highlightTajweed)}
            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold border mr-2 shrink-0 ${
              highlightTajweed
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700'
                : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-600" />
            <span>Цветной таджвид</span>
          </button>

          <span className="text-xs text-slate-400 mr-1 shrink-0">Быстрый переход:</span>
          {[1, 2, 3, 4, 5, 10, 15, 20, 27, 31, 35, 37, 41, 42, 45, 46, 48].map(pNum => (
            <button
              key={pNum}
              onClick={() => {
                setPage(pNum);
                setActiveWord(null);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono font-semibold transition-all shrink-0 ${
                page === pNum
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-emerald-50'
              }`}
            >
              {pNum}
            </button>
          ))}
          <select
            value={page}
            onChange={(e) => {
              setPage(Number(e.target.value));
              setActiveWord(null);
            }}
            className="ml-2 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-600"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <option key={n} value={n}>Стр. {n}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Split View: Left = Original Scan, Right = Interactive Words of this Page */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-5 bg-white dark:bg-slate-800 rounded-3xl p-4 border border-slate-200 dark:border-slate-700 shadow-lg sticky top-24">
          <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-700 bg-white">
            <img
              src={`/pages/p${pad}.jpg`}
              alt={`Страница ${page} книги Му'аллим Сани`}
              className="w-full h-auto object-contain mx-auto"
            />
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {activeWord && (
            <WordBreakdownPanel
              word={activeWord}
              onClose={() => setActiveWord(null)}
            />
          )}

          {page === 1 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 text-center">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                Титульный лист книги «Му'аллим Сани»
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
                Местная религиозная организация мусульман «Наследие Ислама», Москва, 2024.
              </p>
              <button
                onClick={() => setPage(2)}
                className="mt-6 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all"
              >
                Перейти к странице 2 (Алфавит) →
              </button>
            </div>
          ) : pageLessons.length === 0 ? (
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 border border-slate-200 dark:border-slate-700 text-center">
              <p className="text-slate-500">Выберите страницу для интерактивного чтения.</p>
            </div>
          ) : (
            pageLessons.map(les => (
              <div
                key={les.id}
                className="bg-white dark:bg-slate-800 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {les.title}
                    </h3>
                    {les.hint && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                        {les.hint}
                      </p>
                    )}
                  </div>

                  {onSelectLesson && (
                    <button
                      onClick={() => onSelectLesson(les)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold shrink-0 transition-colors"
                    >
                      <span>Открыть урок</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Header Forms if present */}
                {les.headerForms && les.headerForms.length <= 5 && (
                  <div className="flex items-center justify-center gap-4 mb-4 p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/60" dir="rtl">
                    {les.headerForms.map((hf, idx) => (
                      <span
                        key={idx}
                        className="px-4 py-1.5 rounded-xl font-arabic text-3xl font-bold text-emerald-900 dark:text-emerald-200"
                      >
                        {hf}
                      </span>
                    ))}
                  </div>
                )}

                {/* Pairs if present */}
                {les.pairs && les.pairs.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-4" dir="rtl">
                    {les.pairs.map(([a, b], idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-amber-50/60 dark:bg-slate-900/60 border border-amber-200/60 dark:border-slate-700 flex items-center justify-around"
                      >
                        <button
                          onClick={() => handleSelectWord(a)}
                          className="px-2.5 py-1 rounded-lg hover:bg-emerald-600 hover:text-white flex flex-col items-center transition-all"
                        >
                          <span className="font-arabic text-2xl font-bold">
                            <TajweedWordText word={a} highlightTajweed={highlightTajweed} />
                          </span>
                          <span className="text-[10px] font-mono opacity-80" dir="ltr">[{transcribeArabic(a)}]</span>
                        </button>
                        <span className="text-amber-600 font-bold">{les.type === 'pairs' ? '—' : '='}</span>
                        <button
                          onClick={() => handleSelectWord(b)}
                          className="px-2.5 py-1 rounded-lg hover:bg-emerald-600 hover:text-white flex flex-col items-center transition-all"
                        >
                          <span className="font-arabic text-2xl font-bold">
                            <TajweedWordText word={b} highlightTajweed={highlightTajweed} />
                          </span>
                          <span className="text-[10px] font-mono opacity-80" dir="ltr">[{transcribeArabic(b)}]</span>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Rows */}
                {les.rows && les.rows.length > 0 && (
                  <div className="space-y-2.5">
                    {les.rows.map((rStr, rIdx) => {
                      const words = rStr.trim().split(/\s+/);
                      return (
                        <div
                          key={rIdx}
                          className="p-3 rounded-2xl bg-[#FAF7F0] dark:bg-slate-900/60 border border-stone-200/80 dark:border-slate-700 flex flex-wrap items-center justify-center sm:justify-start gap-2"
                          dir="rtl"
                        >
                          {words.map((w, wIdx) => {
                            const isAct = activeWord === w;
                            const tr = transcribeArabic(w);
                            return (
                              <button
                                key={wIdx}
                                onClick={() => handleSelectWord(w)}
                                className={`px-3 py-1.5 rounded-xl border transition-all flex flex-col items-center min-w-[60px] ${
                                  isAct
                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md scale-105'
                                    : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-stone-200 dark:border-slate-700 hover:border-emerald-500'
                                }`}
                              >
                                <span className="font-arabic text-2xl sm:text-3xl font-bold leading-relaxed">
                                  <TajweedWordText word={w} highlightTajweed={highlightTajweed} isActive={isAct} />
                                </span>
                                {tr && (
                                  <span className={`text-[10px] font-mono ${isAct ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'}`} dir="ltr">
                                    [{tr}]
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
