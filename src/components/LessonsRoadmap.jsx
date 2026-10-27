import React from 'react';
import { MODULES } from '../data/book';
import { storageService } from '../services/storage';
import {
  CheckCircle2,
  Play,
  Star,
  Trophy,
  Zap,
  Sparkles,
  Award,
  Crown
} from 'lucide-react';

const CHAPTER_THEMES = {
  1: {
    gradient: 'from-emerald-700 via-emerald-600 to-teal-600',
    accent: 'emerald',
    icon: Sparkles,
    badgeBg: 'bg-emerald-400/20 text-emerald-100 border-emerald-300/30',
    ringColor: 'ring-emerald-500/30'
  },
  2: {
    gradient: 'from-teal-700 via-teal-600 to-cyan-600',
    accent: 'teal',
    icon: Play,
    badgeBg: 'bg-teal-400/20 text-teal-100 border-teal-300/30',
    ringColor: 'ring-teal-500/30'
  },
  3: {
    gradient: 'from-sky-700 via-blue-600 to-indigo-600',
    accent: 'sky',
    icon: Zap,
    badgeBg: 'bg-sky-400/20 text-sky-100 border-sky-300/30',
    ringColor: 'ring-sky-500/30'
  },
  4: {
    gradient: 'from-violet-700 via-purple-600 to-indigo-700',
    accent: 'purple',
    icon: Award,
    badgeBg: 'bg-purple-400/20 text-purple-100 border-purple-300/30',
    ringColor: 'ring-purple-500/30'
  },
  5: {
    gradient: 'from-amber-600 via-orange-600 to-amber-700',
    accent: 'amber',
    icon: Crown,
    badgeBg: 'bg-amber-300/20 text-amber-100 border-amber-200/30',
    ringColor: 'ring-amber-500/30'
  },
  6: {
    gradient: 'from-rose-600 via-pink-600 to-rose-700',
    accent: 'rose',
    icon: Trophy,
    badgeBg: 'bg-rose-300/20 text-rose-100 border-rose-200/30',
    ringColor: 'ring-rose-500/30'
  },
  7: {
    gradient: 'from-amber-500 via-emerald-600 to-teal-800',
    accent: 'gold',
    icon: Sparkles,
    badgeBg: 'bg-amber-300/25 text-amber-100 border-amber-200/40',
    ringColor: 'ring-amber-400/40'
  }
};

export default function LessonsRoadmap({ onSelectLesson, onOpenArcade }) {
  const progress = storageService.getProgress();

  // Находим глобальный следующий незавершённый урок
  let currentTargetId = null;
  for (const mod of MODULES) {
    for (const l of mod.lessons) {
      if (!progress.completedLessons[l.id]) {
        currentTargetId = l.id;
        break;
      }
    }
    if (currentTargetId) break;
  }
  if (!currentTargetId && MODULES[0]?.lessons[0]) {
    currentTargetId = MODULES[0].lessons[0].id;
  }

  // Плавная синусоида смещения для квест-дорожки
  const getOffsetClass = (index) => {
    const cycle = index % 4;
    if (cycle === 1) return 'translate-x-7 sm:translate-x-14';
    if (cycle === 3) return '-translate-x-7 sm:-translate-x-14';
    return 'translate-x-0';
  };

  return (
    <div className="max-w-3xl mx-auto py-2 space-y-14">
      {MODULES.map((chapter) => {
        const theme = CHAPTER_THEMES[chapter.number] || CHAPTER_THEMES[1];
        const ChapterIcon = theme.icon;

        const totalInChapter = chapter.lessons.length;
        const completedInChapter = chapter.lessons.filter(l => progress.completedLessons[l.id]).length;
        const isChapterComplete = completedInChapter === totalInChapter && totalInChapter > 0;
        const chapterPercent = totalInChapter ? Math.round((completedInChapter / totalInChapter) * 100) : 0;

        // Параметры кругового индикатора SVG
        const radius = 22;
        const circumference = 2 * Math.PI * radius;
        const strokeDashoffset = circumference - (chapterPercent / 100) * circumference;

        return (
          <div key={chapter.id} className="relative">
            {/* 1. CHAPTER HEADER BANNER */}
            <div className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${theme.gradient} text-white p-5 sm:p-7 shadow-xl border border-white/20 mb-10`}>
              {/* Ambient Glow & Calligraphy Watermark */}
              <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
              <div className="absolute -right-4 -bottom-8 opacity-15 pointer-events-none select-none">
                <span className="font-arabic text-[130px] font-bold leading-none">
                  {chapter.lessons[0]?.letter || 'م'}
                </span>
              </div>

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="space-y-2 max-w-lg">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-black/25 backdrop-blur-md border border-white/20">
                      <ChapterIcon className="w-3.5 h-3.5 text-amber-300" />
                      <span>Глава {chapter.number}</span>
                    </span>
                    {chapter.badge && (
                      <span className={`text-[11px] font-extrabold px-3 py-1 rounded-full border backdrop-blur-md ${theme.badgeBg}`}>
                        {chapter.badge}
                      </span>
                    )}
                    {isChapterComplete && (
                      <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-400 text-slate-950 shadow-sm">
                        ✓ Завершено
                      </span>
                    )}
                  </div>

                  <h2 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
                    {chapter.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-white/90 leading-relaxed pretty-copy">
                    {chapter.description}
                  </p>
                </div>

                {/* Circular SVG Progress Gauge */}
                <div className="shrink-0 flex flex-col items-center justify-center bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/15">
                  <div className="relative w-14 h-14 flex items-center justify-center">
                    <svg className="w-14 h-14 -rotate-90 transform" viewBox="0 0 56 56">
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4.5"
                        fill="transparent"
                        className="text-white/20"
                      />
                      <circle
                        cx="28"
                        cy="28"
                        r={radius}
                        stroke="currentColor"
                        strokeWidth="4.5"
                        strokeDasharray={circumference}
                        strokeDashoffset={strokeDashoffset}
                        strokeLinecap="round"
                        fill="transparent"
                        className="text-amber-300 transition-all duration-700"
                      />
                    </svg>
                    <span className="absolute text-xs font-black text-white">
                      {chapterPercent}%
                    </span>
                  </div>
                  <span className="text-[10px] text-white/85 font-extrabold mt-1">
                    {completedInChapter} из {totalInChapter}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. WINDING QUEST PATH OF LESSON NODES */}
            <div className="relative flex flex-col items-center gap-8 py-3 pattern-dots rounded-3xl">
              {/* Central Spine Track */}
              <div className="absolute top-8 bottom-14 w-2 bg-gradient-to-b from-emerald-500/30 via-slate-200 to-slate-200 dark:from-emerald-500/30 dark:via-slate-800 dark:to-slate-800 rounded-full z-0" />

              {chapter.lessons.map((lesson, idx) => {
                const isDone = !!progress.completedLessons[lesson.id];
                const isCurrent = currentTargetId === lesson.id;
                const stars = storageService.getLessonStars(lesson.id);
                const offsetClass = getOffsetClass(idx);
                const cleanTitle = lesson.title.replace(/^Урок \d+:\s*/, '');
                const lessonNumMatch = lesson.title.match(/^Урок (\d+)/);
                const lessonNum = lessonNumMatch ? lessonNumMatch[1] : idx + 1;

                return (
                  <div
                    key={lesson.id}
                    className={`relative z-10 flex flex-col items-center transition-transform duration-300 ${offsetClass}`}
                  >
                    {/* Tooltip for Current Target Node */}
                    {isCurrent && (
                      <div className=" -top-11 absolute z-20 animate-bounce">
                        <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 font-black text-[11px] tracking-wide shadow-xl shadow-amber-500/40 border border-white/60 flex items-center gap-1.5 select-none whitespace-nowrap">
                          <Play className="w-3 h-3 fill-current" />
                          <span>СЛЕДУЮЩИЙ ШАГ</span>
                        </div>
                        <div className="w-2.5 h-2.5 bg-amber-400 rotate-45 mx-auto -mt-1.5" />
                      </div>
                    )}

                    {/* Circular 3D Tactile Node Button */}
                    <div className="relative flex items-center justify-center">
                      {isCurrent && (
                        <span className="absolute -inset-2.5 rounded-full bg-amber-400/30 animate-ping pointer-events-none" />
                      )}
                      <button
                        onClick={() => onSelectLesson(lesson)}
                        className={`relative w-20 h-20 sm:w-22 sm:h-22 rounded-full flex flex-col items-center justify-center select-none active:translate-y-1 transition-all cursor-pointer group ${
                          isCurrent
                            ? 'bg-gradient-to-b from-amber-300 via-amber-400 to-amber-500 border-b-[6px] border-amber-700 text-slate-950 shadow-2xl shadow-amber-500/40 ring-4 ring-amber-400/40 scale-110'
                            : isDone
                            ? 'bg-gradient-to-b from-emerald-400 via-emerald-500 to-emerald-600 border-b-[6px] border-emerald-800 text-white shadow-xl shadow-emerald-600/25 hover:scale-105'
                            : 'bg-white dark:bg-slate-800 border-2 border-b-[6px] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-400 dark:hover:border-emerald-500 hover:scale-105 shadow-lg'
                        }`}
                        title={lesson.title}
                      >
                        {/* Top Gloss Highlight */}
                        <span className="absolute top-1.5 inset-x-4 h-3 rounded-full bg-white/30 dark:bg-white/10 pointer-events-none" />

                        {/* Lesson Number Mini Pill */}
                        <span className={`absolute -top-2 -left-1 px-2 py-0.5 rounded-full text-[10px] font-black shadow-xs border ${
                          isCurrent
                            ? 'bg-slate-950 text-amber-300 border-amber-400/50'
                            : isDone
                            ? 'bg-emerald-900 text-emerald-100 border-emerald-400/40'
                            : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700'
                        }`}>
                          #{lessonNum}
                        </span>

                        {/* Node Center Icon / Arabic Letter */}
                        {lesson.letter ? (
                          <span className="font-arabic text-3xl sm:text-4xl font-bold leading-none my-auto group-hover:scale-110 transition-transform">
                            {lesson.letter}
                          </span>
                        ) : isDone ? (
                          <CheckCircle2 className="w-8 h-8 text-white stroke-[2.5]" />
                        ) : (
                          <Play className={`w-7 h-7 ml-0.5 ${isCurrent ? 'fill-current text-slate-950' : 'text-emerald-600 dark:text-emerald-400'}`} />
                        )}

                        {/* Stars Badge on Node Bottom */}
                        <div className="absolute -bottom-2.5 flex items-center gap-0.5 bg-slate-900/95 px-2.5 py-0.5 rounded-full border border-white/20 shadow-md">
                          {[1, 2, 3].map(s => (
                            <Star
                              key={s}
                              className={`w-3 h-3 ${
                                s <= stars ? 'fill-amber-400 text-amber-400' : 'text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </button>
                    </div>

                    {/* Floating Info Pill Below Node */}
                    <div
                      onClick={() => onSelectLesson(lesson)}
                      className={`mt-4 px-3.5 py-2 rounded-2xl border backdrop-blur-md text-center max-w-[210px] cursor-pointer select-none transition-all hover:scale-102 ${
                        isCurrent
                          ? 'bg-amber-50/95 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700/80 shadow-md'
                          : isDone
                          ? 'bg-white/90 dark:bg-slate-900/90 border-emerald-200/80 dark:border-emerald-900/60 shadow-xs'
                          : 'bg-white/80 dark:bg-slate-900/80 border-slate-200/80 dark:border-slate-800 shadow-xs'
                      }`}
                    >
                      <p className="text-xs sm:text-sm font-extrabold text-slate-800 dark:text-slate-100 line-clamp-2 leading-snug">
                        {cleanTitle}
                      </p>
                      <div className="flex items-center justify-center gap-1.5 mt-1">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                          isDone
                            ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                            : 'bg-amber-100/80 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                        }`}>
                          {isDone ? '✓ Пройдено' : '+30 XP'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* 3. CHAPTER BOSS / CHECKPOINT PEDESTAL */}
              <div className="relative z-10 flex flex-col items-center mt-4 select-none">
                <button
                  onClick={() => {
                    if (onOpenArcade) {
                      onOpenArcade();
                    } else if (chapter.lessons[0]) {
                      onSelectLesson(chapter.lessons[0]);
                    }
                  }}
                  className={`px-6 py-4 rounded-3xl flex items-center gap-3.5 transition-all cursor-pointer shadow-xl active:scale-95 ${
                    isChapterComplete
                      ? 'bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 text-slate-950 border-b-[5px] border-amber-700 shadow-amber-500/30'
                      : 'bg-white dark:bg-slate-800 border-2 border-b-[5px] border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:border-emerald-500'
                  }`}
                  title={`Испытание Главы ${chapter.number}`}
                >
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                    isChapterComplete ? 'bg-slate-950/15 text-slate-950' : 'bg-amber-500/10 text-amber-500'
                  }`}>
                    <Trophy className="w-7 h-7" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] font-black uppercase tracking-wider opacity-75">
                      {isChapterComplete ? 'Кубок главы получен!' : `Рубеж главы ${chapter.number}`}
                    </div>
                    <div className="text-sm font-black">
                      Испытание в Аркаде →
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
