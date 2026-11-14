import React, { useState, useMemo, useRef } from 'react';
import { MODULES, ALL_LESSONS } from '../data/book';
import { storageService } from '../services/storage';
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Star,
  Play,
  Search,
  X,
  ArrowRight
} from 'lucide-react';
import LessonsRoadmap from './LessonsRoadmap';

const MODULE_SHORT_TITLES = {
  m1: '1. Алфавит',
  m2: '2. Огласовки',
  m3: '3. Мадд (тянем)',
  m4: '4. Ташдид и Танвин',
  m5: '5. Хамза и буквы',
  m6: '6. Таджвид',
  m7: '7. Аль-Фатиха'
};

export default function LessonsView({ onSelectLesson, onOpenArcade, onOpenDailyWorkout }) {
  const [selectedModuleId, setSelectedModuleId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const moduleScrollRef = useRef(null);

  const progress = storageService.getProgress();
  const totalLessons = ALL_LESSONS.length;
  const completedCount = ALL_LESSONS.filter(l => progress.completedLessons[l.id]).length;
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  const nextUnfinishedLesson =
    ALL_LESSONS.find(l => !progress.completedLessons[l.id]) || ALL_LESSONS[0];

  const filteredModules = useMemo(() => {
    let mods = MODULES;
    if (selectedModuleId !== 'all') {
      mods = mods.filter(m => m.id === selectedModuleId);
    }

    if (!searchQuery.trim()) {
      return mods;
    }

    const q = searchQuery.toLowerCase().trim();
    return mods
      .map(m => ({
        ...m,
        lessons: m.lessons.filter(l => {
          return (
            l.title?.toLowerCase().includes(q) ||
            l.letter?.toLowerCase().includes(q) ||
            l.titleAr?.includes(q) ||
            l.hint?.toLowerCase().includes(q)
          );
        })
      }))
      .filter(m => m.lessons.length > 0);
  }, [selectedModuleId, searchQuery]);

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-12 space-y-5">
      {/* 1. CLEAN HERO CARD FOR BEGINNERS */}
      <div className="relative overflow-hidden rounded-3xl hero-mesh-gradient text-white p-5 sm:p-7 shadow-xl shadow-emerald-950/20 border border-white/15">
        <div className="absolute -right-6 -top-8 opacity-10 pointer-events-none select-none">
          <span className="font-arabic text-[150px] font-bold leading-none">اقرأ</span>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-3 max-w-xl">
            <h1 className="text-xl sm:text-3xl font-black tracking-tight leading-tight">
              Му'аллим Сани — шаг за шагом
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 leading-relaxed pretty-copy">
              От первой буквы до чтения Корана. Нажимайте на любой урок, слушайте озвучку и читайте слова справа налево.
            </p>

            {/* Progress bar */}
            <div className="pt-1 space-y-1.5 max-w-sm">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-100">
                <span>Ваш прогресс: {completedCount} из {totalLessons} уроков</span>
                <span className="text-amber-300 font-black">{percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-emerald-950/75 rounded-full overflow-hidden border border-white/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {/* Primary Action Button */}
          {nextUnfinishedLesson && (
            <button
              onClick={() => onSelectLesson(nextUnfinishedLesson)}
              className="w-full md:w-auto shrink-0 inline-flex items-center justify-between md:justify-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <Play className="w-4 h-4 fill-current ml-0.5" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-800 tracking-wider">
                    {completedCount === 0 ? 'Начать с первого шага' : 'Продолжить обучение'}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold truncate max-w-[220px]">
                    {nextUnfinishedLesson.title}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-950 shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* 2. SIMPLE CHAPTER SELECTOR & SEARCH */}
      <div className="space-y-2.5">
        <div
          ref={moduleScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scroll-smooth no-scrollbar"
        >
          <button
            onClick={(e) => {
              setSelectedModuleId('all');
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
              selectedModuleId === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            Все уроки
          </button>

          {MODULES.map((mod) => {
            const isSelected = selectedModuleId === mod.id;
            return (
              <button
                key={mod.id}
                onClick={(e) => {
                  setSelectedModuleId(mod.id);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                }`}
              >
                {MODULE_SHORT_TITLES[mod.id] || `${mod.number}. ${mod.title}`}
              </button>
            );
          })}
        </div>

        {/* Compact Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти тему: мадд, ташдид, танвин, сукун..."
            className="w-full pl-9 pr-8 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Очистить поиск"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 3. LESSONS CONTENT: ROADMAP (default) OR FILTERED CARDS */}
      {!searchQuery.trim() && selectedModuleId === 'all' ? (
        <LessonsRoadmap
          onSelectLesson={onSelectLesson}
          onOpenArcade={onOpenArcade}
          onOpenDailyWorkout={onOpenDailyWorkout}
        />
      ) : filteredModules.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Уроков по запросу «{searchQuery}» не найдено.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedModuleId('all'); }}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
          >
            Показать все уроки
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredModules.map((module) => {
            const moduleCompleted = module.lessons.filter(l => progress.completedLessons[l.id]).length;
            const isAllDone = moduleCompleted === module.lessons.length && module.lessons.length > 0;

            return (
              <section
                key={module.id}
                className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-sm"
              >
                {/* Module Header */}
                <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                    isAllDone
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  }`}>
                    {isAllDone ? <CheckCircle className="w-5 h-5" /> : module.number}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                        {module.title}
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {moduleCompleted}/{module.lessons.length}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {module.description}
                    </p>
                  </div>
                </div>

                {/* Clean Lesson Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {module.lessons.map((lesson) => {
                    const isDone = !!progress.completedLessons[lesson.id];
                    const stars = storageService.getLessonStars(lesson.id);
                    const isCurrentTarget = nextUnfinishedLesson?.id === lesson.id;
                    const lessonGlobalIndex = ALL_LESSONS.findIndex(l => l.id === lesson.id) + 1;

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => onSelectLesson(lesson)}
                        className={`relative p-3.5 rounded-2xl border-b-4 text-left flex flex-col justify-between transition-all active:scale-95 select-none ${
                          isCurrentTarget
                            ? 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-800 border-2 border-b-4 border-amber-400 shadow-lg ring-2 ring-amber-400/25'
                            : isDone
                            ? 'bg-emerald-50/50 dark:bg-emerald-950/25 border border-b-4 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500'
                            : 'bg-slate-50/80 dark:bg-slate-900/50 border border-b-4 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                            Урок {lessonGlobalIndex}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3].map(s => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= stars
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-slate-300 dark:text-slate-600'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        <div className="my-1.5 flex items-center justify-center h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-inner" dir="rtl">
                          {lesson.headerForms && lesson.headerForms.length === 3 ? (
                            <div className="flex items-center gap-2 font-arabic text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                              {lesson.headerForms.map((hf, i) => (
                                <span key={i}>{hf}</span>
                              ))}
                            </div>
                          ) : lesson.letter ? (
                            <span className="font-arabic text-4xl font-bold text-emerald-700 dark:text-emerald-300">
                              {lesson.letter}
                            </span>
                          ) : (
                            <span className="font-arabic text-xl font-bold text-emerald-700 dark:text-emerald-300 px-2 truncate">
                              {lesson.titleAr || 'قرآن'}
                            </span>
                          )}
                        </div>

                        <div className="mt-1">
                          <h4 className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
                            {lesson.title.replace(/^Урок\s+\d+:\s*/, '')}
                          </h4>
                          <div className="mt-2 flex items-center justify-between">
                            {isCurrentTarget ? (
                              <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                <Play className="w-3 h-3 fill-current" />
                                НАЧАТЬ
                              </span>
                            ) : isDone ? (
                              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                ✓ Пройдено
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> Открыть
                              </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
