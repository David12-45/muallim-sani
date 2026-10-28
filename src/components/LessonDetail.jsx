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
      if (audioService.hasLetterAudio(clean)) {
        audioService.playLetter(clean);
      }
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
      if (clean && audioService.hasLetterAudio(clean)) {
        audioService.playLetter(clean);
      }
      rowTimerRef.current = setTimeout(() => {
        playStep(wIdx + 1);
      }, 1350);
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
      {/* 1. TOP BAR: Back Navigation + Module Info + Controls + Stars */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 hover:border-emerald-500 active:scale-95 transition-all shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>К карте курса</span>
          </button>

          {lesson.moduleTitle && (
            <span className="hidden md:inline-flex text-xs font-extrabold px-3 py-1.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
              Глава {lesson.moduleNumber}: {lesson.moduleTitle}
            </span>
          )}
        </div>

        {/* Right Controls & Stars */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Tajweed Toggle */}
          <button
            onClick={() => setHighlightTajweed(!highlightTajweed)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-extrabold border shrink-0 transition-all active:scale-95 ${
              highlightTajweed
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-800 dark:text-purple-200 border-purple-300 dark:border-purple-700 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Palette className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            <span>{highlightTajweed ? 'Таджвид: Вкл' : 'Таджвид: Выкл'}</span>
          </button>

          {/* Transcription Toggle */}
          <button
            onClick={() => setShowTranscription(!showTranscription)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-extrabold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0 transition-all active:scale-95 shadow-xs"
          >
            {showTranscription ? <EyeOff className="w-3.5 h-3.5 text-emerald-600" /> : <Eye className="w-3.5 h-3.5 text-emerald-600" />}
            <span>{showTranscription ? 'Скрыть подсказки' : 'Показать подсказки'}</span>
          </button>

          {/* Quick Font Size Toggle */}
          <button
            onClick={handleNextScale}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-extrabold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shrink-0 transition-all active:scale-95 shadow-xs hover:border-emerald-500"
            title="Переключить размер арабского шрифта"
          >
            <span className="font-serif font-black text-xs text-emerald-600 dark:text-emerald-400">A+</span>
            <span>Шрифт: {scaleLabels[scale] || 'Обычный'}</span>
          </button>

          {/* Stars Pill */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 shadow-xs">
            {[1, 2, 3].map(s => (
              <Star
                key={s}
                className={`w-3.5 h-3.5 transition-transform ${
                  s <= stars ? 'fill-amber-400 text-amber-500 scale-110' : 'text-slate-300 dark:text-slate-600'
                }`}
              />
            ))}
            <span className="text-xs font-black text-amber-800 dark:text-amber-300 ml-1">
              {stars}/3
            </span>
          </div>
        </div>
      </div>

      {/* 2. LESSON HERO SHOWCASE CARD */}
      <div className="relative overflow-hidden bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-7 border border-slate-200/90 dark:border-slate-800 premium-card space-y-4">
        {/* Top Accent Strip */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-amber-400" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              {lesson.letter && (
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 shrink-0">
                  <span className="font-arabic text-3xl font-bold leading-none">{lesson.letter}</span>
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
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
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-extrabold shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                  title="Послушать эталонное студийное произношение буквы"
                >
                  <Volume2 className="w-4 h-4 text-amber-300" />
                  <span>Звук буквы ({lesson.letter})</span>
                </button>
              )}
            </div>
          </div>

          {/* 3D Interactive Letter Forms Showcase */}
          {lesson.headerForms && lesson.headerForms.length <= 5 && (
            <div className="flex flex-col items-center lg:items-end gap-1.5 shrink-0">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Позиции в слове (нажмите для звука):
              </span>
              <div className="flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-950/70 p-2 rounded-2xl border border-slate-200/80 dark:border-slate-800" dir="rtl">
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
                        if (audioService.hasLetterAudio(cleanHf)) {
                          audioService.playLetter(cleanHf);
                        } else if (lesson.letter) {
                          audioService.playLetter(lesson.letter);
                        }
                      }}
                      className="px-3.5 py-2.5 rounded-xl flex flex-col items-center min-w-[80px] sm:min-w-[92px] bg-white dark:bg-slate-900 hover:bg-emerald-50/70 dark:hover:bg-emerald-950/40 border border-b-4 border-slate-200 dark:border-slate-700 hover:border-emerald-500 active:translate-y-0.5 transition-all shadow-xs group cursor-pointer"
                      title={`${posLabel}: нажмите, чтобы послушать звучание`}
                    >
                      <span className="font-arabic text-4xl sm:text-5xl font-bold leading-relaxed text-slate-900 dark:text-emerald-200 group-hover:scale-110 transition-transform">
                        {hf}
                      </span>
                      <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5" dir="ltr">
                        <span>[{transHf}]</span>
                        <Volume2 className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 text-emerald-600" />
                      </div>
                      {posLabel && (
                        <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 mt-0.5" dir="ltr">
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
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-slate-50 to-amber-50/40 dark:from-emerald-950/30 dark:via-slate-950/60 dark:to-slate-950/40 border border-emerald-200/60 dark:border-slate-800 flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-600/10 dark:bg-emerald-400/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-4 h-4" />
            </div>
            <div className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed pretty-copy flex-1">
              {lesson.hint}
              {letterInfo && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200/70 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-x-5 gap-y-1">
                  <span><strong className="text-slate-900 dark:text-slate-200">Буква:</strong> {letterInfo.name} ({letterInfo.arabicName})</span>
                  <span><strong className="text-slate-900 dark:text-slate-200">Место выхода (Махрадж):</strong> {letterInfo.makhraj}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 3. THREE STAGE INTERACTIVE TABS (Read / Puzzle / Exam) */}
      {lesson.type !== 'fatiha' && (
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-2xl bg-slate-200/70 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-inner">
          <button
            onClick={() => setLessonTab('read')}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              lessonTab === 'read'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="truncate">1. Чтение ⭐</span>
          </button>

          <button
            onClick={() => {
              stopRowPlayback();
              setLessonTab('puzzle');
            }}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              lessonTab === 'puzzle'
                ? 'bg-white dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Puzzle className="w-4 h-4 shrink-0" />
            <span className="truncate">2. Собери ⭐⭐</span>
          </button>

          <button
            onClick={() => {
              stopRowPlayback();
              setLessonTab('exam');
            }}
            className={`py-3 px-2 rounded-xl text-xs sm:text-sm font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
              lessonTab === 'exam'
                ? 'bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-md'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 shrink-0" />
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
              <div className="pb-3.5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Практика чтения слов (справа налево ←)
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 pretty-copy">
                    Нажмите на любое слово для живого аудиопроизношения и подробного побуквенного разбора (+2 XP).
                  </p>
                </div>
              </div>

              {/* Tajweed Legend */}
              {highlightTajweed && (
                <div className="p-3 rounded-2xl bg-slate-50/90 dark:bg-slate-950/60 border border-slate-200/70 dark:border-slate-800 flex flex-wrap items-center gap-1.5 text-[11px]">
                  <span className="font-extrabold text-slate-500 dark:text-slate-400 mr-1">Цвета таджвида:</span>
                  {Object.values(TAJWEED_RULES_META).map(rule => (
                    <span
                      key={rule.id}
                      className={`px-2.5 py-0.5 rounded-lg font-bold ${rule.badgeClass}`}
                    >
                      {rule.shortLabel}
                    </span>
                  ))}
                </div>
              )}

              {/* 1. Pairs Section */}
              {lesson.pairs && lesson.pairs.length > 0 && (
                <div className="space-y-2.5">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
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
                          className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-slate-950/70 border border-amber-200/70 dark:border-slate-800 flex items-center justify-around gap-2 shadow-xs"
                        >
                          <button
                            onClick={() => handleSelectWord(a, keyA)}
                            className={`px-3.5 py-2 rounded-xl flex flex-col items-center transition-all active:scale-95 cursor-pointer ${
                              isActA
                                ? 'bg-emerald-600 text-white scale-105 shadow-md'
                                : 'hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            <span className="font-arabic text-4xl sm:text-5xl font-bold leading-relaxed">
                              <TajweedWordText word={a} highlightTajweed={highlightTajweed} isActive={isActA} />
                            </span>
                            {showTranscription && (
                              <span className={`text-[11px] font-mono font-bold mt-0.5 ${isActA ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'}`} dir="ltr">
                                [{transcribeArabic(a)}]
                              </span>
                            )}
                          </button>

                          <span className="font-black text-base text-amber-600 dark:text-amber-400 select-none">
                            {sep}
                          </span>

                          <button
                            onClick={() => handleSelectWord(b, keyB)}
                            className={`px-3.5 py-2 rounded-xl flex flex-col items-center transition-all active:scale-95 cursor-pointer ${
                              isActB
                                ? 'bg-emerald-600 text-white scale-105 shadow-md'
                                : 'hover:bg-white dark:hover:bg-slate-800 text-slate-900 dark:text-slate-100'
                            }`}
                          >
                            <span className="font-arabic text-4xl sm:text-5xl font-bold leading-relaxed">
                              <TajweedWordText word={b} highlightTajweed={highlightTajweed} isActive={isActB} />
                            </span>
                            {showTranscription && (
                              <span className={`text-[11px] font-mono font-bold mt-0.5 ${isActB ? 'text-emerald-100' : 'text-emerald-700 dark:text-emerald-400'}`} dir="ltr">
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
                <div className="space-y-3.5">
                  {lesson.rows.map((rowStr, rIdx) => {
                    const words = rowStr.trim().split(/\s+/);
                    const isRowPlaying = playingRowIdx === rIdx;

                    return (
                      <div
                        key={rIdx}
                        className={`p-3.5 sm:p-5 rounded-3xl border transition-all flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3.5 ${
                          isRowPlaying
                            ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-400 dark:border-emerald-700 shadow-md'
                            : 'bg-gradient-to-b from-[#FCFBF7] to-[#F5F1E6] dark:from-slate-950/70 dark:to-slate-900/70 border-stone-200/90 dark:border-slate-800'
                        }`}
                        dir="rtl"
                      >
                        {/* Row Number & Sequential Play Button */}
                        <button
                          type="button"
                          onClick={() => handlePlayRow(words, rIdx)}
                          className={`px-2.5 py-2 rounded-2xl text-[11px] font-extrabold flex flex-col items-center justify-center gap-1 shrink-0 select-none transition-all active:scale-95 cursor-pointer border ${
                            isRowPlaying
                              ? 'bg-emerald-600 text-white border-emerald-700 shadow-md'
                              : 'bg-white/90 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-stone-200/90 dark:border-slate-700 hover:border-emerald-400 hover:text-emerald-600'
                          }`}
                          dir="ltr"
                          title={isRowPlaying ? 'Остановить прослушивание ряда' : `Прослушать весь ряд ${rIdx + 1}`}
                        >
                          <span className="font-mono font-black">#{rIdx + 1}</span>
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
                              className={`group relative p-3.5 sm:p-4 rounded-2xl border border-b-4 transition-all flex flex-col items-center justify-between min-w-[96px] sm:min-w-[110px] select-none ${
                                isActive
                                  ? 'bg-emerald-50 dark:bg-emerald-950/70 border-emerald-600 shadow-lg ring-2 ring-emerald-500/25 scale-105'
                                  : 'bg-white dark:bg-slate-900 border-stone-200/90 dark:border-slate-800 hover:border-emerald-400 dark:hover:border-emerald-600 hover:-translate-y-0.5 shadow-xs'
                              }`}
                            >
                              {/* Top mini row: word counter and quick sound */}
                              <div className="w-full flex items-center justify-between gap-1 mb-1" dir="ltr">
                                <span className="text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500">
                                  #{wIdx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleSelectWord(word, key, false);
                                  }}
                                  className="p-1 rounded-lg text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 active:scale-90 transition-all cursor-pointer"
                                  title="Послушать звучание этого слова"
                                >
                                  <Volume2 className="w-4 h-4" />
                                </button>
                              </div>

                              {/* Main Word Trigger (Click opens full breakdown panel) */}
                              <button
                                type="button"
                                onClick={() => handleSelectWord(word, key, true)}
                                className="w-full flex flex-col items-center justify-center focus:outline-none cursor-pointer py-1"
                                title="Нажмите для подробного побуквенного разбора"
                              >
                                {/* Full Arabic Word: Authentic Textbook Naskh with generous size */}
                                <span className="font-arabic text-4xl sm:text-5xl md:text-6xl font-bold leading-[2.1] tracking-wide my-1 select-text">
                                  <TajweedWordText word={word} highlightTajweed={highlightTajweed} isActive={isActive} />
                                </span>

                                {/* TRANSCRIPTION: Clean whole word reading */}
                                {showTranscription && trans && (
                                  <span
                                    className={`text-xs sm:text-sm font-mono font-bold mt-1 px-2.5 py-0.5 rounded-lg leading-tight transition-colors ${
                                      isActive
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
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
