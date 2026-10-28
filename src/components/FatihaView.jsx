import React, { useState } from 'react';
import { FATIHA_VERSES } from '../data/fatiha';
import { audioService } from '../services/audio';
import { Play, Pause, Sparkles, Info, Image as ImageIcon } from 'lucide-react';

export default function FatihaView({ embedded = false }) {
  const [playingAyah, setPlayingAyah] = useState(null);
  const [isPlayingFullSurah, setIsPlayingFullSurah] = useState(false);
  const [activeWord, setActiveWord] = useState(null);

  const handlePlayAyah = (verseNumber) => {
    if (playingAyah === verseNumber) {
      audioService.stopAll();
      setPlayingAyah(null);
      setIsPlayingFullSurah(false);
      return;
    }

    setPlayingAyah(verseNumber);
    audioService.playAyah(1, verseNumber, () => {
      setPlayingAyah(null);
    });
  };

  const handlePlayFullSurah = async () => {
    if (isPlayingFullSurah) {
      setIsPlayingFullSurah(false);
      setPlayingAyah(null);
      audioService.stopAll();
      return;
    }

    setIsPlayingFullSurah(true);

    const playNext = (index) => {
      if (index >= FATIHA_VERSES.length) {
        setIsPlayingFullSurah(false);
        setPlayingAyah(null);
        return;
      }

      const ayahNum = FATIHA_VERSES[index].verseNumber;
      setPlayingAyah(ayahNum);

      audioService.playAyah(1, ayahNum, () => {
        playNext(index + 1);
      });
    };

    playNext(0);
  };

  const handleWordClick = (word) => {
    setActiveWord(word);
  };

  return (
    <div className={embedded ? '' : 'max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-6 pb-28 md:pb-10'}>
      {/* Header Banner */}
      {!embedded && (
        <div className="text-center max-w-2xl mx-auto mb-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Финал курса • Практическое чтение Корана
          </span>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Сура «Аль-Фатиха» (سُورَةُ الْفَاتِحَةِ)
          </h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400 text-xs sm:text-base leading-relaxed">
            Главная сура Священного Корана («Открывающая Книгу»). Слушайте студийное чтение каждого аята, нажимайте на любое слово для транскрипции и правил таджвида.
          </p>
        </div>
      )}

      {/* Global Play Button */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
        <button
          onClick={handlePlayFullSurah}
          className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-lg transition-all ${
            isPlayingFullSurah
              ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 active:scale-95'
          }`}
        >
          {isPlayingFullSurah ? (
            <>
              <Pause className="w-5 h-5 fill-current" />
              <span>Остановить чтение суры</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Слушать чтение всей суры (шейх Аль-Афаси)</span>
            </>
          )}
        </button>
      </div>

      {/* Selected Word Details Card */}
      {activeWord && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between shadow-sm animate-fadeIn">
          <div className="flex items-center gap-4">
            <span className="font-arabic text-3xl font-bold text-emerald-800 dark:text-emerald-200" dir="rtl">
              {activeWord.arabic}
            </span>
            <div>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                [{activeWord.transcription}] — {activeWord.translation}
              </p>
              {activeWord.note && (
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">
                  <strong>Правило таджвида:</strong> {activeWord.note}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verses Container */}
      <div className="space-y-5">
        {FATIHA_VERSES.map((verse) => {
          const isAyahActive = playingAyah === verse.verseNumber;

          return (
            <div
              key={verse.verseNumber}
              className={`p-5 sm:p-7 rounded-3xl transition-all duration-300 border ${
                isAyahActive
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500/30'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:border-emerald-300'
              }`}
            >
              {/* Verse top bar */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center">
                    {verse.verseNumber}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Аят {verse.verseNumber}</span>
                </div>

                <button
                  onClick={() => handlePlayAyah(verse.verseNumber)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isAyahActive
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 hover:bg-emerald-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-emerald-700'
                  }`}
                >
                  {isAyahActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>Пауза</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Слушать аят</span>
                    </>
                  )}
                </button>
              </div>

              {/* Arabic text broken down by clickable words */}
              <div className="flex flex-wrap items-center justify-end gap-x-3 gap-y-2 py-2" dir="rtl">
                {verse.words.map((w) => {
                  const isWordActive = activeWord?.id === w.id;
                  return (
                    <span
                      key={w.id}
                      onClick={() => handleWordClick(w)}
                      className={`font-arabic text-4xl sm:text-5xl font-bold leading-[2.2] cursor-pointer px-2.5 py-1.5 rounded-xl transition-all select-none ${
                        isWordActive
                          ? 'bg-emerald-600 text-white scale-110 shadow-md'
                          : 'text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={`${w.transcription} — ${w.translation}`}
                    >
                      {w.arabic}
                    </span>
                  );
                })}
                <span className="font-arabic text-2xl text-emerald-600 dark:text-emerald-400 select-none">
                  ۝{verse.verseNumber}
                </span>
              </div>

              {/* Russian Transcription & Translation */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
                <p className="text-xs sm:text-sm font-mono text-emerald-800 dark:text-emerald-300 font-medium">
                  {verse.transcription}
                </p>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1">
                  {verse.translation}
                </p>
                <div className="mt-2 flex items-start gap-1.5 text-[11px] text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 p-2.5 rounded-xl border border-amber-200/50 dark:border-amber-900/30">
                  <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-600" />
                  <span><strong>Таджвид:</strong> {verse.tajweedNotes}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
