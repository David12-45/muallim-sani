import React, { useState, useEffect, useRef } from 'react';
import { audioService } from '../services/audio';
import { storageService } from '../services/storage';
import { transcribeArabic } from '../services/transcribe';
import { TAJWEED_RULES_META } from '../services/wordAnalyzer';
import { ALPHABET_DATA } from '../data/alphabet';
import FatihaView from './FatihaView';
import WordBreakdownPanel from './WordBreakdownPanel';
import WordBuilderGame from './WordBuilderGame';
import LessonMiniExam from './LessonMiniExam';
import TajweedWordText from './TajweedWordText';
import AlphabetCourse from './AlphabetCourse';
import RuleVisualGuide from './RuleVisualGuide';
import confetti from 'canvas-confetti';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  BookOpen,
  Eye,
  EyeOff,
  Info,
  Palette,
  Puzzle,
  Award,
  Star,
  Volume2,
  Play,
  Square
} from 'lucide-react';

export default function LessonDetail({ lesson, onBack, onPrevLesson, onNextLesson, hasPrev, hasNext }) {
  const [lessonTab, setLessonTab] = useState('read'); // 'read' | 'puzzle' | 'exam'
  const [activeWordKey, setActiveWordKey] = useState(null);
  const [selectedWordForAnalysis, setSelectedWordForAnalysis] = useState(null);
  const [showTranscription, setShowTranscription] = useState(true);
  const [highlightTajweed, setHighlightTajweed] = useState(true);
  const [stars, setStars] = useState(() => storageService.getLessonStars(lesson?.id));
  const [isCompleted, setIsCompleted] = useState(() => storageService.isLessonComplete(lesson?.id));
  const [scale, setScale] = useState(() => storageService.getArabicScale());
  const [playingRowIdx, setPlayingRowIdx] = useState(null);
  const rowTimerRef = useRef(null);

  const handleNextScale = () => {
    const scales = ['100', '115', '130', '150'];
    const currIdx = scales.indexOf(scale);
    const nextScale = scales[(currIdx + 1) % scales.length];
    setScale(nextScale);
    storageService.setArabicScale(nextScale);
  };

  const scaleLabels = {
    '100': 'Обычный',
    '115': 'Крупный',
    '130': 'Большой',
    '150': 'Огромный'
  };

  useEffect(() => {
    setLessonTab('read');
    setStars(storageService.getLessonStars(lesson?.id));
    setIsCompleted(storageService.isLessonComplete(lesson?.id));
    setActiveWordKey(null);
    setSelectedWordForAnalysis(null);
    stopRowPlayback();
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return () => stopRowPlayback();
  }, [lesson?.id]);

  const stopRowPlayback = () => {
    if (rowTimerRef.current) {
      clearTimeout(rowTimerRef.current);
      rowTimerRef.current = null;
    }
    setPlayingRowIdx(null);
  };

  if (!lesson) return null;

  // Если это Урок 1 (Алфавит) — открываем пошаговый интерактивный курс алфавита
  if (lesson.id === 'alphabet' || lesson.type === 'alphabet') {
    return (
      <AlphabetCourse
        onBack={onBack}
        onCompleted={(awardedStars) => handleAwardStars(awardedStars || 3)}
      />
    );
  }

  const letterInfo = lesson.letter
    ? ALPHABET_DATA.find(l => l.arabic === lesson.letter || l.arabic.startsWith(lesson.letter))
    : null;

  const handleSelectWord = (text, key, openBreakdown = true) => {
    stopRowPlayback();
    setActiveWordKey(key);
    const clean = String(text || '').replace(/[()=ـ]/g, '').trim();
    if (clean) {
      audioService.speakArabic(clean);
      storageService.incrementWordsListened();
      if (openBreakdown) {
        setSelectedWordForAnalysis(clean);
      }
    }
  };

  const handlePlayRow = (words, rIdx) => {
    if (playingRowIdx === rIdx) {
      stopRowPlayback();
      return;
    }
    stopRowPlayback();
    setPlayingRowIdx(rIdx);

    const playStep = (wIdx) => {
      if (wIdx >= words.length) {
        setPlayingRowIdx(null);
        return;
      }
      const word = words[wIdx];
      const key = `row-${rIdx}-${wIdx}`;
      setActiveWordKey(key);
      const clean = String(word || '').replace(/[()=ـ]/g, '').trim();
      const goNext = (delay) => {
        rowTimerRef.current = setTimeout(() => {
          playStep(wIdx + 1);
        }, delay);
      };
      // Ждём окончания озвучки слова, затем короткая пауза; без озвучки — прежний темп
      const started = clean && audioService.speakArabic(clean, () => goNext(350));
      if (!started) goNext(1350);
    };

    playStep(0);
  };

  const handleAwardStars = (awardedStars) => {
    storageService.setLessonStars(lesson.id, awardedStars);
    setStars(storageService.getLessonStars(lesson.id));
    setIsCompleted(true);
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.65 }
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-32 md:pb-24 space-y-5">
      {/* 1. TOP BAR: Back Navigation + Stars + Clean Minimalist Controls */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:border-slate-300 dark:hover:border-slate-700 active:scale-95 transition-all shadow-apple-xs cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
              <span>К урокам</span>
            </button>

            {lesson.moduleTitle && (
              <span className="hidden md:inline-flex text-xs font-medium px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-white/5">
                Глава {lesson.moduleNumber}: {lesson.moduleTitle}
              </span>
            )}
          </div>

          {/* Stars Pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/70 dark:border-amber-800/60 shadow-apple-xs shrink-0">
            {[1, 2, 3].map(s => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 transition-transform ${
                  s <= stars ? 'fill-amber-400 text-amber-500 scale-105' : 'text-slate-200 dark:text-slate-700'
                }`}
              />
            ))}
            <span className="text-xs font-bold text-amber-900 dark:text-amber-300 ml-1">
              {stars}/3
            </span>
          </div>
        </div>

        {/* Compact Reading Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handleNextScale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/5 shrink-0 transition-all active:scale-95 shadow-apple-xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
            title="Переключить размер арабского шрифта"
          >
            <span className="font-serif font-bold text-xs text-emerald-600 dark:text-emerald-400">A+</span>
            <span>Шрифт: {scaleLabels[scale] || 'Обычный'}</span>
          </button>

          <button
            onClick={() => setShowTranscription(!showTranscription)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/5 shrink-0 transition-all active:scale-95 shadow-apple-xs hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer"
          >
            {showTranscription ? <EyeOff className="w-3.5 h-3.5 text-slate-500" /> : <Eye className="w-3.5 h-3.5 text-slate-500" />}
            <span>{showTranscription ? 'Скрыть чтение' : 'Показать чтение'}</span>
          </button>

          <button
            onClick={() => setHighlightTajweed(!highlightTajweed)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border shrink-0 transition-all active:scale-95 cursor-pointer ${
              highlightTajweed
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 shadow-apple-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200/80 dark:border-white/5'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>{highlightTajweed ? 'Цвета правил' : 'Без цветов'}</span>
          </button>
        </div>
      </div>

      {/* 2. LESSON HERO SHOWCASE CARD */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-3xl p-5 sm:p-7 space-y-4 shadow-apple-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              {lesson.letter && (
                <div className="w-11 h-11 rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white flex items-center justify-center shadow-xs ring-1 ring-black/5 dark:ring-white/10 shrink-0">
                  <span className="font-arabic text-2xl font-bold leading-none">{lesson.letter}</span>
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                  {lesson.title}
                </h1>
                {lesson.titleNote && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Арабский термин: <strong className="font-arabic text-base text-emerald-700 dark:text-emerald-300 mx-1">{lesson.titleAr}</strong> — {lesson.titleNote}
                  </p>
                )}
              </div>

              {lesson.letter && (
                <button
                  onClick={() => audioService.playLetter(lesson.letter)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-xs active:scale-95 transition-all cursor-pointer"
                  title="Послушать эталонное студийное произношение буквы"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Звук буквы ({lesson.letter})</span>
                </button>
              )}
            </div>
          </div>

          {/* Letter Forms Showcase */}
          {lesson.headerForms && lesson.headerForms.length <= 5 && (
            <div className="flex flex-col items-center lg:items-end gap-1.5 shrink-0">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                Позиции в слове (нажмите для звука):
              </span>
              <div className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-2xl border border-slate-200/70 dark:border-white/5" dir="rtl">
                {lesson.headerForms.map((hf, idx) => {
                  const cleanHf = hf.replace(/[ـ\u200D]/g, '').trim();
                  const transHf = transcribeArabic(cleanHf);
                  const posLabels = ['в начале', 'в середине', 'в конце'];
                  const posLabel = posLabels[idx] || '';

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const played = audioService.speakArabic(cleanHf);
                        if (!played && lesson.letter) {
                          audioService.playLetter(lesson.letter);
                        }
                      }}
                      className="px-3 py-2 rounded-xl flex flex-col items-center min-w-[75px] sm:min-w-[85px] bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50 active:scale-95 transition-all shadow-apple-xs group cursor-pointer"
                      title={`${posLabel}: нажмите, чтобы послушать звучание`}
                    >
                      <span className="font-arabic text-4xl sm:text-5xl font-bold leading-relaxed text-slate-900 dark:text-slate-100 group-hover:scale-105 transition-transform">
                        {hf}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 mt-0.5" dir="ltr">
                        <span>[{transHf}]</span>
                        <Volume2 className="w-3 h-3 opacity-60 group-hover:opacity-100 text-emerald-600" />
                      </div>
                      {posLabel && (
                        <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500 mt-0.5" dir="ltr">
                          {posLabel}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Pedagogical Explanation & Makhraj Card */}
        {lesson.hint && (
          <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed flex-1">
              {lesson.hint}
              {letterInfo && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap gap-x-5 gap-y-1">
                  <span><strong className="text-slate-900 dark:text-slate-200">Буква:</strong> {letterInfo.name} ({letterInfo.arabicName})</span>
                  <span><strong className="text-slate-900 dark:text-slate-200">Махрадж:</strong> {letterInfo.makhraj}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. THREE STAGE SEGMENTED TABS (macOS Style) */}
      {lesson.type !== 'fatiha' && (
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-white/5">
          <button
            onClick={() => setLessonTab('read')}
            className={`py-2 px-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              lessonTab === 'read'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">1. Чтение ⭐</span>
          </button>

          <button
            onClick={() => {
              stopRowPlayback();
              setLessonTab('puzzle');
            }}
            className={`py-2 px-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              lessonTab === 'puzzle'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">2. Собери ⭐⭐</span>
          </button>

          <button
            onClick={() => {
              stopRowPlayback();
              setLessonTab('exam');
            }}
            className={`py-2 px-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              lessonTab === 'exam'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">3. Экзамен ⭐⭐⭐</span>
          </button>
        </div>
      )}

      {/* TAB 2: PUZZLE */}
      {lessonTab === 'puzzle' && lesson.type !== 'fatiha' && (
        <WordBuilderGame
          lesson={lesson}
          onCompleteGame={() => handleAwardStars(Math.max(stars, 2))}
        />
      )}

      {/* TAB 3: EXAM */}
      {lessonTab === 'exam' && lesson.type !== 'fatiha' && (
        <LessonMiniExam
          lesson={lesson}
          defaultOpen={true}
          onPassExam={() => handleAwardStars(3)}
        />
      )}

      {/* TAB 1: READ */}
      {lessonTab === 'read' && (
        <>
          {/* Visual Rule Cheat-Sheet for Beginners */}
          <RuleVisualGuide lessonId={lesson.id} />

          {/* Letter-by-Letter Breakdown Panel */}
          {selectedWordForAnalysis && (
            <WordBreakdownPanel
              word={selectedWordForAnalysis}
              onClose={() => setSelectedWordForAnalysis(null)}
            />
          )}

          {lesson.type === 'fatiha' ? (
            <FatihaView embedded />
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-7 border border-slate-200/90 dark:border-slate-800 premium-card space-y-5">
              {/* Header */}
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    Практика чтения слов (справа налево ←)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Нажмите на любое слово, чтобы услышать произношение и открыть разбор по буквам.
                  </p>
                </div>
              </div>

              {/* Tajweed Legend */}
              {highlightTajweed && lesson.moduleNumber >= 5 && (
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/70 dark:border-white/5 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-semibold text-slate-400 mr-1">Правила:</span>
                  {Object.values(TAJWEED_RULES_META).map(rule => (
                    <span
                      key={rule.id}
                      className={`px-2.5 py-0.5 rounded-md font-medium ${rule.badgeClass}`}
                    >
                      {rule.shortLabel}
                    </span>
                  ))}
                </div>
              )}

              {/* 1. Pairs Section */}
              {lesson.pairs && lesson.pairs.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {lesson.type === 'pairs' ? 'Пары слов для сравнения:' : 'Формула образования звука:'}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5" dir="rtl">
                    {lesson.pairs.map(([a, b], pIdx) => {
                      const keyA = `pair-${pIdx}-a`;
                      const keyB = `pair-${pIdx}-b`;
                      const isActA = activeWordKey === keyA;
                      const isActB = activeWordKey === keyB;
                      const sep = lesson.type === 'pairs' ? '—' : '=';

                      return (
                        <div
                          key={pIdx}
                          className="p-3 rounded-2xl bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 flex items-center justify-around gap-2 shadow-apple-xs"
                        >
                          <button
                            onClick={() => handleSelectWord(a, keyA)}
                            className={`px-3 py-1.5 rounded-xl flex flex-col items-center transition-all active:scale-95 cursor-pointer ${
                              isActA
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            <span className="font-arabic text-4xl sm:text-5xl font-bold leading-relaxed">
                              <TajweedWordText word={a} highlightTajweed={highlightTajweed} isActive={isActA} />
                            </span>
                            {showTranscription && (
                              <span className={`text-[11px] font-mono font-medium mt-0.5 ${isActA ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} dir="ltr">
                                [{transcribeArabic(a)}]
                              </span>
                            )}
                          </button>

                          <span className="font-bold text-sm text-slate-400 select-none">
                            {sep}
                          </span>

                          <button
                            onClick={() => handleSelectWord(b, keyB)}
                            className={`px-3 py-1.5 rounded-xl flex flex-col items-center transition-all active:scale-95 cursor-pointer ${
                              isActB
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            <span className="font-arabic text-4xl sm:text-5xl font-bold leading-relaxed">
                              <TajweedWordText word={b} highlightTajweed={highlightTajweed} isActive={isActB} />
                            </span>
                            {showTranscription && (
                              <span className={`text-[11px] font-mono font-medium mt-0.5 ${isActB ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} dir="ltr">
                                [{transcribeArabic(b)}]
                              </span>
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Rows of Words with Sequential Row Player */}
              {lesson.rows && lesson.rows.length > 0 && (
                <div className="space-y-3">
                  {lesson.rows.map((rowStr, rIdx) => {
                    const words = rowStr.trim().split(/\s+/);
                    const isRowPlaying = playingRowIdx === rIdx;

                    return (
                      <div
                        key={rIdx}
                        className={`p-3 sm:p-4 rounded-2xl border transition-all flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3 ${
                          isRowPlaying
                            ? 'bg-emerald-50/20 dark:bg-emerald-950/20 border-emerald-500/50 shadow-apple-sm'
                            : 'bg-slate-50/60 dark:bg-slate-950/50 border-slate-200/80 dark:border-white/5'
                        }`}
                        dir="rtl"
                      >
                        {/* Row Number & Sequential Play Button */}
                        <button
                          type="button"
                          onClick={() => handlePlayRow(words, rIdx)}
                          className={`px-2.5 py-2 rounded-xl text-[11px] font-semibold flex flex-col items-center justify-center gap-1 shrink-0 select-none transition-all active:scale-95 cursor-pointer border shadow-apple-xs ${
                            isRowPlaying
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-white/10 hover:border-emerald-500/50 hover:text-emerald-600'
                          }`}
                          dir="ltr"
                          title={isRowPlaying ? 'Остановить прослушивание ряда' : `Прослушать весь ряд ${rIdx + 1}`}
                        >
                          <span className="font-mono font-bold">#{rIdx + 1}</span>
                          {isRowPlaying ? (
                            <Square className="w-3 h-3 fill-current" />
                          ) : (
                            <Play className="w-3 h-3 fill-current ml-0.5" />
                          )}
                        </button>

                        {words.map((word, wIdx) => {
                          const key = `row-${rIdx}-${wIdx}`;
                          const isActive = activeWordKey === key;
                          const trans = transcribeArabic(word);

                          return (
                            <div
                              key={wIdx}
                              className={`group relative p-3 sm:p-4 rounded-xl border transition-all flex flex-col items-center justify-between min-w-[110px] sm:min-w-[130px] select-none ${
                                isActive
                                  ? 'bg-emerald-50/30 dark:bg-emerald-950/30 border-2 border-emerald-500 ring-4 ring-emerald-500/10 shadow-apple-md'
                                  : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-white/10 hover:border-slate-300 dark:hover:border-slate-700 shadow-apple-xs hover:shadow-apple-sm'
                              }`}
                            >
                              {/* Top mini row: word counter and quick sound */}
                              <div className="w-full flex items-center justify-between gap-1 mb-1" dir="ltr">
                                <span className="text-[10px] font-mono font-medium text-slate-400">
                                  #{wIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectWord(word, key, false);
                                  }}
                                  className="p-1 rounded-md text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 active:scale-90 transition-all cursor-pointer"
                                  title="Послушать звучание этого слова"
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Main Word Trigger */}
                              <button
                                type="button"
                                onClick={() => handleSelectWord(word, key, true)}
                                className="w-full flex flex-col items-center justify-center focus:outline-none cursor-pointer py-1"
                                title="Нажмите для подробного побуквенного разбора"
                              >
                                <span className="font-arabic text-4xl sm:text-5xl md:text-6xl font-bold leading-[1.8] my-1 select-text text-slate-900 dark:text-slate-100">
                                  <TajweedWordText word={word} highlightTajweed={highlightTajweed} isActive={isActive} />
                                </span>

                                {showTranscription && trans && (
                                  <span
                                    className={`text-xs font-mono font-medium mt-1 px-2 py-0.5 rounded-md leading-tight transition-colors ${
                                      isActive
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                    }`}
                                    dir="ltr"
                                  >
                                    [{trans}]
                                  </span>
                                )}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Quick CTA to jump to Stage 2 (Puzzle) */}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400">
                  Прочитали слова? Закрепите на практике в интерактивной сборке слов!
                </p>
                <button
                  onClick={() => {
                    stopRowPlayback();
                    setLessonTab('puzzle');
                    window.scrollTo({ top: 150, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                >
                  <Puzzle className="w-4 h-4 text-amber-300" />
                  <span>Этап 2: Собери слово ⭐⭐ →</span>
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 4. BOTTOM LESSON COMPLETION & PREV/NEXT BAR */}
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 premium-card flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-start">
          {hasPrev ? (
            <button
              onClick={onPrevLesson}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm font-extrabold flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Предыдущий</span>
            </button>
          ) : <div />}

          {!isCompleted ? (
            <button
              onClick={() => handleAwardStars(Math.max(stars, 1))}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs sm:text-sm font-black shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              <span>Завершить урок (+30 XP)</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 text-xs sm:text-sm font-black">
              <CheckCircle2 className="w-4 h-4" />
              <span>Пройдено ({stars} ⭐)</span>
            </span>
          )}
        </div>

        {hasNext && (
          <button
            onClick={onNextLesson}
            className="w-full sm:w-auto px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs sm:text-sm font-black flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <span>Следующий урок</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
