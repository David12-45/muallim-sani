import React, { useState } from 'react';
import { FATIHA_VERSES } from '../data/fatiha';
import { audioService } from '../services/audio';
import { Play, Pause, Sparkles, Info, Volume2 } from 'lucide-react';

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
    setPlayingAyah(null);
    setIsPlayingFullSurah(false);
    audioService.speakArabic(word.arabic);
  };

  return (
    <div className={embedded ? '' : 'max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 md:pb-12 space-y-6'}>
      {/* Flagship Surah Hero Banner */}
      {!embedded && (
        <section className="relative overflow-hidden rounded-[2rem] hero-mesh-gradient text-white p-6 sm:p-9 border border-gold-300/25 text-center shadow-apple-xl">
          <div className="absolute inset-0 hero-arabesque pointer-events-none opacity-[0.15]" aria-hidden="true" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-3.5">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-semibold bg-white/10 backdrop-blur-md border border-white/15 text-emerald-100 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
              Финал курса • Практическое чтение Корана
            </span>
            <h1 className="heading-fluid font-black text-white">
              Сура «Аль-Фатиха»
            </h1>
            <div className="font-arabic text-3xl sm:text-4xl text-amber-300 font-bold" dir="rtl">
              سُورَةُ الْفَاتِحَةِ
            </div>
            <p className="text-emerald-100/85 text-xs sm:text-sm leading-relaxed pretty-copy max-w-xl mx-auto font-normal">
              Слушайте чтение каждого аята шейхом Аль-Афаси или нажимайте на любое отдельное слово для его озвучки, транскрипции и правила таджвида.
            </p>

            <div className="pt-2 flex justify-center">
              <button
                type="button"
                onClick={handlePlayFullSurah}
                className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-apple-md hover:shadow-apple-lg hover:-translate-y-0.5 transition-all cursor-pointer active:scale-95 ${
                  isPlayingFullSurah
                    ? 'bg-rose-500 hover:bg-rose-600 text-white'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                {isPlayingFullSurah ? (
                  <>
                    <Pause className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Остановить чтение суры</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    <span>Слушать всю суру (шейх Аль-Афаси)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Embedded Play Button */}
      {embedded && (
        <div className="mb-5 flex justify-center">
          <button
            type="button"
            onClick={handlePlayFullSurah}
            className={`inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold shadow-apple-sm hover:shadow-apple-md active:scale-95 transition-all cursor-pointer ${
              isPlayingFullSurah
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlayingFullSurah ? (
              <>
                <Pause className="w-4 h-4 fill-current" />
                <span>Остановить чтение суры</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>Слушать чтение всей суры (шейх Аль-Афаси)</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Selected Word Details Spotlight */}
      {activeWord && (
        <div className="bg-[#FFFDF8] dark:bg-slate-900 rounded-3xl p-5 border border-emerald-500/60 dark:border-emerald-700/60 shadow-apple-md flex flex-wrap items-center justify-between gap-4 animate-fadeIn">
          <div className="flex items-center gap-4 min-w-0">
            <button
              type="button"
              onClick={() => audioService.speakArabic(activeWord.arabic)}
              className="px-4 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700 shadow-apple-xs flex items-center gap-2.5 cursor-pointer active:scale-95 transition-transform"
              title="Послушать слово ещё раз"
            >
              <span className="font-arabic text-3xl font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                {activeWord.arabic}
              </span>
              <Volume2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            </button>
            <div className="min-w-0">
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                [{activeWord.transcription}] — {activeWord.translation}
              </p>
              {activeWord.note && (
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 pretty-copy">
                  <strong className="text-emerald-600 dark:text-emerald-400">Правило таджвида:</strong> {activeWord.note}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verses Manuscript List */}
      <div className="space-y-4 sm:space-y-5">
        {FATIHA_VERSES.map((verse) => {
          const isAyahActive = playingAyah === verse.verseNumber;

          return (
            <article
              key={verse.verseNumber}
              className={`p-6 sm:p-7 rounded-3xl bg-[#FFFDF8] dark:bg-slate-900 border transition-all duration-300 ${
                isAyahActive
                  ? 'border-emerald-500/80 ring-2 ring-emerald-500/20 shadow-apple-md'
                  : 'border-slate-200/80 dark:border-slate-800 shadow-apple-xs hover:shadow-apple-sm'
              }`}
            >
              {/* Verse top bar */}
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 font-bold text-xs flex items-center justify-center tabular-nums">
                    {verse.verseNumber}
                  </span>
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Аят {verse.verseNumber}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handlePlayAyah(verse.verseNumber)}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer active:scale-95 ${
                    isAyahActive
                      ? 'bg-emerald-600 text-white shadow-apple-xs'
                      : 'bg-slate-100 hover:bg-slate-200/70 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700'
                  }`}
                >
                  {isAyahActive ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span>Пауза</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
                      <span>Слушать аят</span>
                    </>
                  )}
                </button>
              </div>

              {/* Arabic text broken down by clickable spoken words */}
              <div className="flex flex-wrap items-center justify-start gap-x-2.5 gap-y-2 py-2" dir="rtl">
                {verse.words.map((w) => {
                  const isWordActive = activeWord?.id === w.id;
                  return (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => handleWordClick(w)}
                      className={`font-arabic text-5xl sm:text-6xl font-bold leading-[2.1] cursor-pointer px-3.5 py-1.5 rounded-2xl transition-all select-none ${
                        isWordActive
                          ? 'bg-emerald-600 text-white shadow-apple-xs scale-[1.03]'
                          : 'text-slate-900 dark:text-slate-100 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      title={`Нажмите для озвучки: ${w.transcription} — ${w.translation}`}
                    >
                      {w.arabic}
                    </button>
                  );
                })}
                <span className="font-arabic text-2xl sm:text-3xl text-amber-600 dark:text-amber-400 select-none px-1">
                  ۝{verse.verseNumber}
                </span>
              </div>

              {/* Russian Transcription & Translation */}
              <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                <p className="text-xs sm:text-sm font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                  {verse.transcription}
                </p>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 pretty-copy font-normal">
                  {verse.translation}
                </p>
                <div className="flex items-start gap-2.5 text-[11px] sm:text-xs text-amber-900 dark:text-amber-200 bg-amber-50/70 dark:bg-amber-950/25 p-3.5 rounded-2xl border border-amber-200/60 dark:border-amber-900/40">
                  <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" aria-hidden="true" />
                  <span className="pretty-copy leading-relaxed"><strong>Таджвид:</strong> {verse.tajweedNotes}</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
