import React, { useState, useMemo, useRef } from 'react';
import { MODULES, ALL_LESSONS } from '../data/book';
import { storageService } from '../services/storage';
import { audioService } from '../services/audio';
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  Star,
  Play,
  Search,
  X,
  ArrowRight,
  Volume2,
  Sparkles
} from 'lucide-react';

const MODULE_SHORT_TITLES = {
  m1: '1. Алфавит',
  m2: '2. А, И, У и буквы',
  m3: '3. Мадд (тянем)',
  m4: '4. Ташдид и Танвин',
  m5: '5. Хамза и знаки',
  m6: '6. Таджвид',
  m7: '7. Аль-Фатиха'
};

// Метод «От простого к сложному» (Закон Галла + Каида Нурания + Му'аллим Сани):
// Вся система арабских знаков чтения, показанная на ОДНОЙ букве Б (ب)
const SEVEN_CORE_SIGNS = [
  {
    id: 'fatha',
    lessonId: 'alif',
    arabic: 'بَ',
    audio: 'بَ',
    sound: 'БА',
    name: 'Фатха',
    meaning: 'Чёрточка сверху = звук «А»',
    color: 'border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/30'
  },
  {
    id: 'kasra',
    lessonId: 'alif',
    arabic: 'بِ',
    audio: 'بِ',
    sound: 'БИ',
    name: 'Кясра',
    meaning: 'Чёрточка снизу = звук «И»',
    color: 'border-sky-300 dark:border-sky-800 bg-sky-50/70 dark:bg-sky-950/30'
  },
  {
    id: 'damma',
    lessonId: 'alif',
    arabic: 'بُ',
    audio: 'بُ',
    sound: 'БУ',
    name: 'Дамма',
    meaning: 'Запятая сверху = звук «У»',
    color: 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/30'
  },
  {
    id: 'sukun',
    lessonId: 'ra',
    arabic: 'اَبْ',
    audio: 'اَبْ',
    sound: 'АБ',
    name: 'Сукун ( ْ )',
    meaning: 'Кружок сверху = стоп (без гласной)',
    color: 'border-slate-300 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-800/60'
  },
  {
    id: 'madd',
    lessonId: 'madd-alif',
    arabic: 'بَا',
    audio: 'بَا',
    sound: 'БА-А',
    name: 'Мадд (тянем)',
    meaning: 'Пустая буква после гласной = тянем 2 счёта',
    color: 'border-purple-300 dark:border-purple-800 bg-purple-50/70 dark:bg-purple-950/30'
  },
  {
    id: 'tashdid',
    lessonId: 'tashdid',
    arabic: 'رَبَّ',
    audio: 'رَبَّ',
    sound: 'РАБ-БА',
    name: 'Ташдид ( ّ )',
    meaning: 'Значок «w» = двойная буква с нажимом',
    color: 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30'
  },
  {
    id: 'tanwin',
    lessonId: 'tanwin',
    arabic: 'بٌ',
    audio: 'بٌ',
    sound: 'БУН',
    name: 'Танвин ( ً ٍ ٌ )',
    meaning: 'Двойной значок = добавляем «+Н» в конце',
    color: 'border-teal-300 dark:border-teal-800 bg-teal-50/70 dark:bg-teal-950/30'
  }
];

export default function LessonsView({ onSelectLesson }) {
  const [selectedModuleId, setSelectedModuleId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheatSheet, setShowCheatSheet] = useState(true);
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

  const handleOpenRuleLesson = (lessonId) => {
    const target = ALL_LESSONS.find(l => l.id === lessonId);
    if (target) onSelectLesson(target);
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 pb-28 md:pb-12 space-y-5">
      {/* 1. Главный блок */}
      <div className="relative overflow-hidden rounded-3xl hero-mesh-gradient text-white px-5 py-6 sm:px-9 sm:py-9">
        <span
          aria-hidden="true"
          dir="rtl"
          className="font-arabic absolute right-3 -top-6 sm:right-10 sm:-top-10 text-[7rem] sm:text-[13rem] leading-none text-white/[0.07] pointer-events-none select-none"
        >
          اقرأ
        </span>

        <div className="relative z-10 grid grid-cols-[minmax(0,1fr)] md:grid-cols-[minmax(0,1fr)_auto] md:items-end gap-6 md:gap-10">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-4xl font-bold tracking-tight leading-[1.15]">
              Читайте по-арабски шаг за шагом
            </h1>
            <p className="mt-3 text-sm sm:text-base text-emerald-50/80 leading-relaxed pretty-copy">
              От первой буквы до суры «Аль-Фатиха»: слушайте студийную озвучку, нажимайте на слова и закрепляйте в играх.
            </p>

            <div className="mt-6 max-w-sm">
              <div className="flex items-baseline justify-between text-sm text-emerald-50/80 mb-2">
                <span>Пройдено {completedCount} из {totalLessons}</span>
                <span className="font-semibold text-amber-300 tabular-nums">{percent}%</span>
              </div>
              <div
                className="w-full h-1.5 bg-white/15 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Прогресс по урокам"
              >
                <div
                  className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
            </div>
          </div>

          {nextUnfinishedLesson && (
            <button
              onClick={() => onSelectLesson(nextUnfinishedLesson)}
              className="w-full md:w-72 inline-flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-left active:scale-[0.98] transition-all group cursor-pointer"
            >
              <span className="w-10 h-10 rounded-xl bg-emerald-950 text-amber-300 flex items-center justify-center shrink-0">
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-medium text-slate-800/80">
                  {completedCount === 0 ? 'Начать с первого урока' : 'Продолжить'}
                </span>
                <span className="block text-sm font-bold truncate">{nextUnfinishedLesson.title}</span>
              </span>
              <ArrowRight className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>

      {/* 2. GALL'S LAW / KISS CHEAT SHEET: ALL 7 ARABIC SIGNS ON ONE LETTER (ب) */}
      <div className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-tight">
                Шпаргалка: 7 знаков чтения на одной букве
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Нажмите на карточку, чтобы услышать, как знак меняет звучание буквы «Б» (ب)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCheatSheet(v => !v)}
            className="px-3 py-1.5 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 shrink-0 cursor-pointer"
          >
            {showCheatSheet ? 'Свернуть' : 'Показать'}
          </button>
        </div>

        {showCheatSheet && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5">
            {SEVEN_CORE_SIGNS.map((sign, index) => (
              <div
                key={sign.id}
                className={`rounded-2xl border p-3 flex flex-col justify-between transition-colors ${sign.color}`}
              >
                <button
                  type="button"
                  onClick={() => audioService.speakArabic(sign.audio)}
                  className="w-full text-center group cursor-pointer active:scale-95 transition-transform"
                  title="Нажмите, чтобы прослушать"
                >
                  <div className="flex items-center justify-between text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1">
                    <span>Шаг {index + 1}</span>
                    <Volume2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div className="py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/60 dark:border-slate-700 shadow-xs">
                    <span className="font-arabic text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-normal" dir="rtl">
                      {sign.arabic}
                    </span>
                  </div>

                  <div className="mt-2 text-xs font-black text-emerald-700 dark:text-emerald-300">
                    «{sign.sound}»
                  </div>
                  <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {sign.name}
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug mt-1">
                    {sign.meaning}
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => handleOpenRuleLesson(sign.lessonId)}
                  className="mt-2.5 w-full py-1 rounded-lg bg-white/80 dark:bg-slate-900/70 hover:bg-emerald-600 hover:text-white text-[10px] font-extrabold text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 transition-colors cursor-pointer"
                >
                  Открыть урок
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. SIMPLE CHAPTER SELECTOR & SEARCH */}
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
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-all active:scale-95 cursor-pointer ${
              selectedModuleId === 'all'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400'
            }`}
          >
            Все главы
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
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold whitespace-nowrap shrink-0 transition-all active:scale-95 cursor-pointer ${
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
            placeholder="Быстрый поиск темы: фатха, сукун, мадд, ташдид, танвин..."
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

      {/* 4. CLEAN CHAPTER-BY-CHAPTER LESSONS GRID (KISS & OCCAM'S RAZOR) */}
      {filteredModules.length === 0 ? (
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
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800"
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
                        Глава {module.number}. {module.title}
                      </h3>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                        {moduleCompleted} из {module.lessons.length}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-0.5">
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
                        className={`relative p-3.5 rounded-2xl border text-left flex flex-col justify-between transition-colors active:scale-[0.98] select-none cursor-pointer ${
                          isCurrentTarget
                            ? 'bg-amber-50 dark:bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/30'
                            : isDone
                            ? 'bg-emerald-50/60 dark:bg-emerald-950/25 border-emerald-200 dark:border-emerald-900 hover:border-emerald-500'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-emerald-500'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full mb-2">
                          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
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

                        <div className="my-1.5 flex items-center justify-center h-14 rounded-xl bg-slate-50 dark:bg-slate-950/60" dir="rtl">
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
                          {lesson.hint && (
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-tight">
                              {lesson.hint}
                            </p>
                          )}
                          <div className="mt-2 flex items-center justify-between">
                            {isCurrentTarget ? (
                              <span className="text-[10px] font-black text-amber-700 dark:text-amber-400 flex items-center gap-1">
                                <Play className="w-3 h-3 fill-current" />
                                Начать
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
