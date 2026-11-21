import React, { useState, useMemo, useRef } from 'react';
import { MODULES, ALL_LESSONS } from '../data/book';
import { storageService } from '../services/storage';
import { audioService } from '../services/audio';
import {
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Star,
  Play,
  Search,
  X,
  ArrowRight,
  Volume2,
  Sparkles,
  ChevronDown,
  ChevronUp
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
    meaning: 'Чёрточка сверху = «А»',
    accent: 'bg-emerald-500',
    badge: 'text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200/80 dark:border-emerald-800/70'
  },
  {
    id: 'kasra',
    lessonId: 'alif',
    arabic: 'بِ',
    audio: 'بِ',
    sound: 'БИ',
    name: 'Кясра',
    meaning: 'Чёрточка снизу = «И»',
    accent: 'bg-sky-500',
    badge: 'text-sky-800 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 border-sky-200/80 dark:border-sky-800/70'
  },
  {
    id: 'damma',
    lessonId: 'alif',
    arabic: 'بُ',
    audio: 'بُ',
    sound: 'БУ',
    name: 'Дамма',
    meaning: 'Запятая сверху = «У»',
    accent: 'bg-amber-500',
    badge: 'text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border-amber-200/80 dark:border-amber-800/70'
  },
  {
    id: 'sukun',
    lessonId: 'ra',
    arabic: 'اَبْ',
    audio: 'اَبْ',
    sound: 'АБ',
    name: 'Сукун ( ْ )',
    meaning: 'Кружок = стоп, без гласной',
    accent: 'bg-slate-500',
    badge: 'text-slate-700 dark:text-slate-300 bg-stone-100 dark:bg-slate-800 border-stone-200 dark:border-slate-700'
  },
  {
    id: 'madd',
    lessonId: 'madd-alif',
    arabic: 'بَا',
    audio: 'بَا',
    sound: 'БА-А',
    name: 'Мадд',
    meaning: 'Тянем гласную в 2 раза дольше',
    accent: 'bg-violet-500',
    badge: 'text-violet-800 dark:text-violet-300 bg-violet-50 dark:bg-violet-950/60 border-violet-200/80 dark:border-violet-800/70'
  },
  {
    id: 'tashdid',
    lessonId: 'tashdid',
    arabic: 'رَبَّ',
    audio: 'رَبَّ',
    sound: 'РАБ-БА',
    name: 'Ташдид ( ّ )',
    meaning: 'Значок «w» = двойная буква',
    accent: 'bg-rose-500',
    badge: 'text-rose-800 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border-rose-200/80 dark:border-rose-800/70'
  },
  {
    id: 'tanwin',
    lessonId: 'tanwin',
    arabic: 'بٌ',
    audio: 'بٌ',
    sound: 'БУН',
    name: 'Танвин',
    meaning: 'Двойной значок = «+Н» в конце',
    accent: 'bg-teal-500',
    badge: 'text-teal-800 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/60 border-teal-200/80 dark:border-teal-800/70'
  }
];

export default function LessonsView({ onSelectLesson }) {
  const [selectedModuleId, setSelectedModuleId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheatSheet, setShowCheatSheet] = useState(true);
  const [activeSignId, setActiveSignId] = useState(null);
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

  const handlePlaySign = (sign) => {
    setActiveSignId(sign.id);
    audioService.speakArabic(sign.audio, () => {
      setActiveSignId(prev => (prev === sign.id ? null : prev));
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-7 pb-28 md:pb-14 space-y-6">
      {/* 1. APPLE / NOTION STYLE MINIMALIST HERO */}
      <section className="relative overflow-hidden rounded-3xl hero-mesh-gradient text-white p-6 sm:p-8 border border-slate-800/80 dark:border-white/10 shadow-apple-lg">
        {/* Subtle Ambient Refraction */}
        <div className="absolute inset-0 hero-lattice pointer-events-none opacity-50" aria-hidden="true" />
        {/* Modern Minimalist Arabic Watermark */}
        <div className="absolute -right-4 -bottom-8 opacity-[0.05] pointer-events-none select-none" aria-hidden="true">
          <span className="font-arabic text-[180px] sm:text-[230px] font-bold leading-none">اقرأ</span>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3.5 max-w-xl">
            <div className="inline-flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-300">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
                Интерактивный самоучитель
              </span>
              <span className="text-slate-300">• 58 уроков</span>
              <span className="text-emerald-400">• 100% озвучка MP3</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-white leading-tight">
              Му'аллим Сани онлайн
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-[52ch]">
              Классическая методика чтения Корана с нуля. Слушайте произношение каждого слова, разбирайте буквы одним касанием и осваивайте таджвид шаг за шагом.
            </p>

            {/* Clean Progress Bar */}
            <div className="pt-1 space-y-2 max-w-md">
              <div className="flex items-center justify-between text-xs font-medium text-slate-300">
                <span>Пройдено {completedCount} из {totalLessons} уроков</span>
                <span className="text-white font-bold tabular-nums">{percent}%</span>
              </div>
              <div
                className="w-full h-2 bg-white/15 rounded-full overflow-hidden p-0.5"
                role="progressbar"
                aria-valuenow={percent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`Пройдено ${completedCount} из ${totalLessons} уроков`}
              >
                <div
                  className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.max(percent, completedCount > 0 ? 4 : 0)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Primary Minimalist CTA */}
          {nextUnfinishedLesson && (
            <button
              type="button"
              onClick={() => onSelectLesson(nextUnfinishedLesson)}
              className="w-full lg:w-auto shrink-0 inline-flex items-center justify-between lg:justify-center gap-4 px-6 py-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-sm shadow-apple-md transition-all active:scale-98 group cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">
                    {completedCount === 0 ? 'Начать с 1-го шага' : 'Продолжить урок'}
                  </div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[240px]">
                    {nextUnfinishedLesson.title}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      {/* 2. BEGINNER 7-SIGN CHEAT SHEET BENTO (Apple/Notion Style) */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-3xl p-5 sm:p-6 shadow-apple-sm">
        <div className="flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-800/60 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                Шпаргалка новичка: 7 знаков чтения за 30 секунд
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Нажмите на карточку для прослушивания. Вся система огласовок на одной букве «Б» (ب).
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCheatSheet(v => !v)}
            aria-expanded={showCheatSheet}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-700 border border-slate-200/80 dark:border-slate-700 shrink-0 cursor-pointer transition-colors"
          >
            <span>{showCheatSheet ? 'Свернуть' : 'Развернуть'}</span>
            {showCheatSheet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showCheatSheet && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-2.5 animate-fadeIn">
            {SEVEN_CORE_SIGNS.map((sign, index) => {
              const isPlaying = activeSignId === sign.id;
              return (
                <div
                  key={sign.id}
                  className={`relative overflow-hidden rounded-2xl border bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col justify-between transition-all ${
                    isPlaying
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-apple-sm'
                      : 'border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handlePlaySign(sign)}
                    className="w-full text-center group cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600 rounded-xl"
                    title="Нажмите, чтобы прослушать"
                  >
                    <div className="flex items-center justify-between text-[10px] font-semibold text-slate-400 mb-1.5">
                      <span>Шаг {index + 1}</span>
                      <Volume2
                        className={`w-3.5 h-3.5 transition-transform ${
                          isPlaying ? 'text-emerald-600 scale-110' : 'text-slate-400 group-hover:text-emerald-600 group-hover:scale-110'
                        }`}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-white/5 shadow-apple-xs">
                      <span className="font-arabic text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-normal" dir="rtl">
                        {sign.arabic}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-center">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/70 dark:border-white/5">
                        «{sign.sound}»
                      </span>
                    </div>

                    <div className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">
                      {sign.name}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      {sign.meaning}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenRuleLesson(sign.lessonId)}
                    className="mt-2.5 w-full py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 text-[11px] font-semibold text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-white/5 transition-colors cursor-pointer"
                  >
                    К уроку →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. CHAPTER PILLS & SPOTLIGHT SEARCH */}
      <div className="space-y-3">
        <div
          ref={moduleScrollRef}
          className="flex items-center gap-1.5 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth no-scrollbar mask-fade-x-right pr-6"
        >
          <button
            type="button"
            onClick={(e) => {
              setSelectedModuleId('all');
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 cursor-pointer ${
              selectedModuleId === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            Все главы ({totalLessons})
          </button>

          {MODULES.map((mod) => {
            const isSelected = selectedModuleId === mod.id;
            return (
              <button
                key={mod.id}
                type="button"
                onClick={(e) => {
                  setSelectedModuleId(mod.id);
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all active:scale-95 cursor-pointer ${
                  isSelected
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-xs'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                {MODULE_SHORT_TITLES[mod.id] || `${mod.number}. ${mod.title}`}
              </button>
            );
          })}
        </div>

        {/* Apple Spotlight Inspired Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по темам: фатха, сукун, мадд, ташдид, танвин..."
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 shadow-apple-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Очистить поиск"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* 4. EDITORIAL CHAPTER SECTIONS & TACTILE LESSON CARDS */}
      {filteredModules.length === 0 ? (
        <div className="surface-card rounded-3xl p-10 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm">
            Уроков по запросу «{searchQuery}» не найдено.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedModuleId('all'); }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-extrabold hover:bg-emerald-700 cursor-pointer"
          >
            Показать все уроки
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredModules.map((module) => {
            const moduleCompleted = module.lessons.filter(l => progress.completedLessons[l.id]).length;
            const modulePercent = module.lessons.length
              ? Math.round((moduleCompleted / module.lessons.length) * 100)
              : 0;
            const isAllDone = moduleCompleted === module.lessons.length && module.lessons.length > 0;

            return (
              <section
                key={module.id}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5 rounded-3xl p-5 sm:p-6 shadow-apple-sm"
              >
                {/* Chapter Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-start sm:items-center gap-3 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                      isAllDone
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-white/5'
                    }`}>
                      {isAllDone ? <CheckCircle2 className="w-4 h-4" /> : module.number}
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                          Глава {module.number}. {module.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {module.description}
                      </p>
                    </div>
                  </div>

                  {/* Mini Chapter Progress */}
                  <div className="flex items-center gap-2.5 shrink-0 pl-12 sm:pl-0">
                    <div className="w-20 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                        style={{ width: `${modulePercent}%` }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                      {moduleCompleted} / {module.lessons.length}
                    </span>
                  </div>
                </div>

                {/* Lesson Cards Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-3.5">
                  {module.lessons.map((lesson) => {
                    const isDone = !!progress.completedLessons[lesson.id];
                    const stars = storageService.getLessonStars(lesson.id);
                    const isCurrentTarget = nextUnfinishedLesson?.id === lesson.id;
                    const lessonGlobalIndex = ALL_LESSONS.findIndex(l => l.id === lesson.id) + 1;
                    const isSingleInModule = module.lessons.length === 1;
                    const arText = lesson.titleAr || 'قرآن';
                    const arSizeClass =
                      arText.length > 24
                        ? 'text-lg sm:text-xl leading-[1.85]'
                        : arText.length > 14
                        ? 'text-xl sm:text-2xl leading-[1.8]'
                        : 'text-2xl sm:text-[26px] leading-[1.7]';

                    return (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => onSelectLesson(lesson)}
                        className={`group relative min-w-0 w-full overflow-hidden p-3.5 sm:p-4 rounded-2xl text-left flex flex-col justify-between select-none cursor-pointer transition-all duration-200 hover:-translate-y-0.5 ${
                          isSingleInModule ? 'col-span-2 sm:col-span-3 md:col-span-4' : ''
                        } ${
                          isCurrentTarget
                            ? 'bg-gradient-to-b from-emerald-50/50 to-white dark:from-emerald-950/30 dark:to-slate-950/80 border-2 border-emerald-500 ring-4 ring-emerald-500/10 shadow-apple-md'
                            : isDone
                            ? 'bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 hover:border-emerald-500/40 shadow-apple-xs hover:shadow-apple-md'
                            : 'bg-white dark:bg-slate-950/60 border border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-slate-700 shadow-apple-xs hover:shadow-apple-md'
                        }`}
                      >
                        {/* Top row: Lesson # and Stars */}
                        <div className="flex items-center justify-between w-full mb-2.5 gap-1.5 min-w-0">
                          <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-lg border shrink-0 ${
                            isCurrentTarget
                              ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 border-emerald-500/20'
                              : 'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200/70 dark:border-white/5'
                          }`}>
                            Урок {lessonGlobalIndex}
                          </span>
                          <div className="flex items-center gap-0.5 shrink-0" aria-label={`Звёзды: ${stars} из 3`}>
                            {[1, 2, 3].map(s => (
                              <Star
                                key={s}
                                className={`w-3 h-3 ${
                                  s <= stars
                                    ? 'fill-amber-400 text-amber-500'
                                    : 'text-slate-200 dark:text-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {/* Crisp Minimalist Arabic Preview Tile */}
                        <div
                          className={`my-1 w-full min-w-0 overflow-hidden flex items-center justify-center rounded-xl bg-gradient-to-b from-slate-50/90 to-slate-100/50 dark:from-slate-900/90 dark:to-slate-950/80 border border-slate-200/70 dark:border-white/5 group-hover:border-emerald-500/35 group-hover:from-emerald-50/30 group-hover:to-white dark:group-hover:from-emerald-950/20 dark:group-hover:to-slate-900 transition-colors ${
                            isSingleInModule ? 'min-h-[5.5rem] px-4 py-3.5' : 'min-h-[4.75rem] px-2.5 py-2.5'
                          }`}
                          dir="rtl"
                        >
                          {lesson.headerForms && lesson.headerForms.length === 3 ? (
                            <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-arabic text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 leading-relaxed">
                              {lesson.headerForms.map((hf, i) => (
                                <span key={i}>{hf}</span>
                              ))}
                            </div>
                          ) : lesson.letter ? (
                            <span className="font-arabic text-4xl font-bold text-slate-900 dark:text-slate-100 leading-normal">
                              {lesson.letter}
                            </span>
                          ) : (
                            <span
                              className={`font-arabic font-bold text-slate-900 dark:text-slate-100 text-center break-words w-full ${
                                isSingleInModule ? 'text-2xl sm:text-3xl leading-[1.85]' : arSizeClass
                              }`}
                            >
                              {arText}
                            </span>
                          )}
                        </div>

                        {/* Title + 1-line hint + footer action */}
                        <div className="mt-2.5 flex-1 flex flex-col justify-between w-full min-w-0">
                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                              {lesson.title.replace(/^Урок\s+\d+:\s*/, '')}
                            </h4>
                            {lesson.hint && (
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-snug">
                                {lesson.hint}
                              </p>
                            )}
                          </div>

                          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between w-full">
                            {isCurrentTarget ? (
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <Play className="w-3 h-3 fill-current" aria-hidden="true" />
                                Начать
                              </span>
                            ) : isDone ? (
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
                                Пройдено
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1 group-hover:text-emerald-600 transition-colors">
                                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                                Открыть
                              </span>
                            )}
                            <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0" aria-hidden="true" />
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
