import React, { useState, useMemo, useRef, useEffect } from 'react';
import { MODULES, ALL_LESSONS } from '../data/book';
import { storageService } from '../services/storage';
import { getUserKnowledgeProgress } from '../data/gameLevels';
import {
  BookOpen,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  LayoutGrid,
  Trophy,
  Star,
  Flame,
  Zap,
  Play,
  Gamepad2,
  List,
  Search,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  Compass
} from 'lucide-react';
import LessonsRoadmap from './LessonsRoadmap';

const MODULE_SHORT_TITLES = {
  m1: '1. Алфавит',
  m2: '2. Огласовки',
  m3: '3. Мадд',
  m4: '4. Ташдид',
  m5: '5. Хамза и буквы',
  m6: '6. Таджвид',
  m7: '7. Аль-Фатиха'
};

export default function LessonsView({ onSelectLesson, onOpenArcade }) {
  const [viewMode, setViewMode] = useState('roadmap'); // 'roadmap' | 'game' | 'list'
  const [selectedModuleId, setSelectedModuleId] = useState('all'); // 'all' | 'mod-1' | 'mod-2' | 'mod-3' | 'mod-4'
  const [searchQuery, setSearchQuery] = useState('');
  const [moduleLayout, setModuleLayout] = useState('scroll'); // 'scroll' | 'grid'
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const moduleScrollRef = useRef(null);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);

  const checkScrollLimits = () => {
    if (moduleScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = moduleScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    checkScrollLimits();
    const el = moduleScrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollLimits);
      window.addEventListener('resize', checkScrollLimits);
      return () => {
        el.removeEventListener('scroll', checkScrollLimits);
        window.removeEventListener('resize', checkScrollLimits);
      };
    }
  }, [moduleLayout]);

  const scrollModules = (direction) => {
    if (moduleScrollRef.current) {
      const scrollAmount = 240;
      moduleScrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(checkScrollLimits, 300);
    }
  };

  const handleModuleWheel = (e) => {
    if (moduleScrollRef.current) {
      if (Math.abs(e.deltaY) > 0) {
        moduleScrollRef.current.scrollLeft += e.deltaY;
        checkScrollLimits();
      }
    }
  };

  const handleMouseDown = (e) => {
    if (!moduleScrollRef.current) return;
    isDraggingRef.current = true;
    startXRef.current = e.pageX - moduleScrollRef.current.offsetLeft;
    scrollLeftRef.current = moduleScrollRef.current.scrollLeft;
  };

  const handleMouseLeave = () => {
    isDraggingRef.current = false;
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (!isDraggingRef.current || !moduleScrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - moduleScrollRef.current.offsetLeft;
    const walk = (x - startXRef.current) * 1.5;
    moduleScrollRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkScrollLimits();
  };

  const progress = storageService.getProgress();
  const rankInfo = storageService.getPlayerRankInfo();

  const totalLessons = ALL_LESSONS.length;
  const completedCount = ALL_LESSONS.filter(l => progress.completedLessons[l.id]).length;
  const percent = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0;

  // Следующий незавершённый урок для быстрого продолжения
  const nextUnfinishedLesson =
    ALL_LESSONS.find(l => !progress.completedLessons[l.id]) || ALL_LESSONS[0];

  // Фильтрация по модулям и поиску
  const filteredModules = useMemo(() => {
    let mods = MODULES;
    if (selectedModuleId !== 'all') {
      mods = mods.filter(m => m.id === selectedModuleId);
    }

    if (!searchQuery.trim()) {
      return mods;
    }

    const q = searchQuery.toLowerCase().trim();
    return mods.map(m => {
      const matchedLessons = m.lessons.filter(l => {
        const titleMatch = l.title?.toLowerCase().includes(q);
        const letterMatch = l.letter?.toLowerCase().includes(q);
        const titleArMatch = l.titleAr?.includes(q);
        const hintMatch = l.hint?.toLowerCase().includes(q);
        return titleMatch || letterMatch || titleArMatch || hintMatch;
      });
      return {
        ...m,
        lessons: matchedLessons
      };
    }).filter(m => m.lessons.length > 0);
  }, [selectedModuleId, searchQuery]);

  return (
    <div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-7 pb-28 md:pb-12 space-y-6">
      {/* 1. HERO RESUME & STATS CARD */}
      <div className="relative overflow-hidden rounded-3xl hero-mesh-gradient text-white p-5 sm:p-8 shadow-2xl shadow-emerald-950/25 border border-white/15">
        {/* Ambient Decorative Calligraphy Watermark */}
        <div className="absolute -right-8 -top-10 opacity-10 pointer-events-none select-none">
          <span className="font-arabic text-[180px] font-bold leading-none">اقرأ</span>
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          {/* Left Column: Course Intro + Next Lesson CTA */}
          <div className="space-y-3.5 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-200 text-xs font-extrabold border border-white/20 shadow-xs">
                <span>{rankInfo.currentRank.icon}</span>
                <span>Ранг {rankInfo.currentRank.level}: {rankInfo.currentRank.title}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/50 backdrop-blur-md text-emerald-200 text-xs font-bold border border-emerald-400/30">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" />
                <span>Алфавит: {getUserKnowledgeProgress().learnedLettersCount} из 28 букв</span>
              </span>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
                Академия арабского чтения и Таджвида
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/90 mt-1.5 leading-relaxed pretty-copy">
                7 глав, 41 интерактивный урок от первой буквы до чтения сур Корана. Студийная озвучка, пошаговый разбор каждого слова и 4 игровых тренажёра.
              </p>
            </div>

            {/* Quick Resume & Arcade Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {nextUnfinishedLesson && (
                <button
                  onClick={() => onSelectLesson(nextUnfinishedLesson)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/25 active:scale-95 transition-all group"
                >
                  <div className="w-7 h-7 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold text-slate-800 tracking-wider">
                      Продолжить обучение
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold truncate max-w-[230px]">
                      {nextUnfinishedLesson.title}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-950 shrink-0 ml-1 group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              {onOpenArcade && (
                <button
                  onClick={onOpenArcade}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-black text-xs sm:text-sm border border-white/25 backdrop-blur-md active:scale-95 transition-all"
                >
                  <Gamepad2 className="w-5 h-5 text-amber-300" />
                  <div className="text-left">
                    <div className="text-[10px] uppercase font-bold text-emerald-200 tracking-wider">
                      Аркадные режимы
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold">
                      🕹️ Игровая Аркада (4 игры)
                    </div>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Right Column: Key Stats & Progress Gauge */}
          <div className="lg:w-80 shrink-0 space-y-3 bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
            {/* 3 Stats Chips */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                <Flame className="w-4 h-4 text-orange-400 fill-orange-400 mx-auto mb-0.5" />
                <div className="text-base sm:text-lg font-black">{rankInfo.streak}</div>
                <div className="text-[10px] text-emerald-200">Дней streak</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                <Star className="w-4 h-4 text-amber-300 fill-amber-300 mx-auto mb-0.5" />
                <div className="text-base sm:text-lg font-black">{rankInfo.totalStars}</div>
                <div className="text-[10px] text-emerald-200">Звёзд из {totalLessons * 3}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-white/10 border border-white/10">
                <Zap className="w-4 h-4 text-emerald-300 fill-emerald-300 mx-auto mb-0.5" />
                <div className="text-base sm:text-lg font-black">{rankInfo.xp}</div>
                <div className="text-[10px] text-emerald-200">Опыт XP</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-200">
                <span className="flex items-center gap-1.5">
                  <Trophy className="w-3.5 h-3.5 text-amber-300" />
                  Пройдено: {completedCount} из {totalLessons}
                </span>
                <span className="text-amber-300">{percent}%</span>
              </div>
              <div className="w-full h-2.5 bg-emerald-950/80 rounded-full overflow-hidden border border-white/20">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-emerald-400 transition-all duration-500 rounded-full"
                  style={{ width: `${percent}%` }}
                />
              </div>
              {rankInfo.nextRank && (
                <div className="text-[10px] text-emerald-200/80 text-right">
                  До «{rankInfo.nextRank.title}»: {rankInfo.nextRank.minXp - rankInfo.xp} XP
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. MODULE FILTER TABS + SEARCH & VIEW TOGGLE */}
      <div className="space-y-3">
        {/* Module Bar Control Header */}
        <div className="flex items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300">
              Разделы курса <span className="text-slate-400 font-normal">({MODULES.length} модулей, {totalLessons} уроков)</span>:
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Scroll Navigation Arrows (in ribbon mode) */}
            {moduleLayout === 'scroll' && (
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => scrollModules('left')}
                  disabled={!canScrollLeft}
                  title="Прокрутить модули влево"
                  aria-label="Прокрутить влево"
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    canScrollLeft
                      ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 hover:bg-emerald-50 shadow-sm active:scale-95 cursor-pointer'
                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => scrollModules('right')}
                  disabled={!canScrollRight}
                  title="Прокрутить модули вправо (модуль 4 и далее)"
                  aria-label="Прокрутить вправо"
                  className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                    canScrollRight
                      ? 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-emerald-600 hover:bg-emerald-50 shadow-sm active:scale-95 cursor-pointer'
                      : 'text-slate-300 dark:text-slate-600 cursor-not-allowed'
                  }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Layout Toggle: Ribbon vs Grid */}
            <button
              type="button"
              onClick={() => setModuleLayout(prev => prev === 'scroll' ? 'grid' : 'scroll')}
              className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 text-slate-700 dark:text-slate-300 flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
              title={moduleLayout === 'scroll' ? 'Показать все модули сразу (сетка)' : 'Свернуть модули в прокручиваемую ленту'}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span className="hidden sm:inline">{moduleLayout === 'scroll' ? 'Все плиткой' : 'Лента'}</span>
              <span className="sm:hidden">{moduleLayout === 'scroll' ? 'Сетка' : 'Лента'}</span>
            </button>
          </div>
        </div>

        {/* Module Filter Pills */}
        {moduleLayout === 'grid' ? (
          /* GRID VIEW: All 8 module buttons always visible simultaneously */
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            <button
              onClick={() => setSelectedModuleId('all')}
              className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-between gap-1.5 transition-all active:scale-95 ${
                selectedModuleId === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-750'
              }`}
            >
              <span className="truncate">Все</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                selectedModuleId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}>
                {totalLessons}
              </span>
            </button>

            {MODULES.map((mod) => {
              const modDone = mod.lessons.filter(l => progress.completedLessons[l.id]).length;
              const isSelected = selectedModuleId === mod.id;

              return (
                <button
                  key={mod.id}
                  onClick={() => setSelectedModuleId(mod.id)}
                  title={`${mod.number}. ${mod.title}`}
                  className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center justify-between gap-1.5 transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-750'
                  }`}
                >
                  <span className="truncate">{MODULE_SHORT_TITLES[mod.id] || `${mod.number}. ${mod.title}`}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {modDone}/{mod.lessons.length}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* SCROLL RIBBON VIEW: Smooth horizontal scroll with CSS mask-image edge fade */
          <div className="relative">
            <div
              ref={moduleScrollRef}
              onWheel={handleModuleWheel}
              onMouseDown={handleMouseDown}
              onMouseLeave={handleMouseLeave}
              onMouseUp={handleMouseUp}
              onMouseMove={handleMouseMove}
              className={`flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth select-none cursor-grab active:cursor-grabbing no-scrollbar ${
                canScrollLeft && canScrollRight
                  ? 'mask-fade-x-both'
                  : canScrollLeft
                  ? 'mask-fade-x-left'
                  : canScrollRight
                  ? 'mask-fade-x-right'
                  : ''
              }`}
              style={{ scrollbarWidth: 'thin' }}
            >
              <button
                onClick={(e) => {
                  setSelectedModuleId('all');
                  e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                }}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                  selectedModuleId === 'all'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-750'
                }`}
              >
                <span>Все модули</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                  selectedModuleId === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}>
                  {totalLessons}
                </span>
              </button>

              {MODULES.map((mod) => {
                const modDone = mod.lessons.filter(l => progress.completedLessons[l.id]).length;
                const isSelected = selectedModuleId === mod.id;

                return (
                  <button
                    key={mod.id}
                    onClick={(e) => {
                      setSelectedModuleId(mod.id);
                      e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }}
                    title={`${mod.number}. ${mod.title}`}
                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 hover:bg-emerald-50/50 dark:hover:bg-slate-750'
                    }`}
                  >
                    <span>{MODULE_SHORT_TITLES[mod.id] || `${mod.number}. ${mod.title}`}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold shrink-0 ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                    }`}>
                      {modDone}/{mod.lessons.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Search & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Поиск по урокам: алфавит, фатха, танвин, сукун..."
              className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="inline-flex p-1 rounded-xl bg-slate-200/70 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shrink-0 self-end sm:self-auto">
            <button
              onClick={() => {
                setViewMode('roadmap');
                setSelectedModuleId('all');
                setSearchQuery('');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'roadmap'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Карта пути</span>
            </button>
            <button
              onClick={() => setViewMode('game')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'game'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Карточки</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Список</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. LESSONS CONTENT: ROADMAP vs MODULE SECTIONS */}
      {viewMode === 'roadmap' && !searchQuery.trim() && selectedModuleId === 'all' ? (
        <LessonsRoadmap onSelectLesson={onSelectLesson} onOpenArcade={onOpenArcade} />
      ) : filteredModules.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 text-center border border-slate-200 dark:border-slate-700">
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Уроков по запросу «{searchQuery}» не найдено.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedModuleId('all'); }}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
          >
            Сбросить фильтры
          </button>
        </div>
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {filteredModules.map((module) => {
            const moduleCompleted = module.lessons.filter(l => progress.completedLessons[l.id]).length;
            const isAllDone = moduleCompleted === module.lessons.length && module.lessons.length > 0;

            return (
              <section
                key={module.id}
                className="bg-white dark:bg-slate-800/90 rounded-3xl p-4 sm:p-6 border border-slate-200/90 dark:border-slate-700/80 shadow-sm"
              >
                {/* Module Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${
                      isAllDone
                        ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                        : 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    }`}>
                      {isAllDone ? <CheckCircle className="w-5 h-5" /> : module.number}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                          {module.title}
                        </h3>
                        <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {moduleCompleted}/{module.lessons.length} пройдено
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {module.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* GAME CARDS VIEW */}
                {viewMode === 'game' ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-3.5">
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
                              ? 'bg-gradient-to-b from-amber-50 to-white dark:from-amber-950/40 dark:to-slate-800 border-2 border-b-4 border-amber-400 shadow-lg shadow-amber-500/15 ring-2 ring-amber-400/30'
                              : isDone
                              ? 'bg-emerald-50/50 dark:bg-emerald-950/25 border border-b-4 border-emerald-300 dark:border-emerald-800 hover:border-emerald-500'
                              : 'bg-slate-50/80 dark:bg-slate-900/50 border border-b-4 border-slate-200 dark:border-slate-700 hover:border-emerald-400'
                          }`}
                        >
                          {/* Top Row: Lesson badge & Stars */}
                          <div className="flex items-center justify-between w-full mb-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                              Урок {lessonGlobalIndex}
                            </span>

                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3].map(s => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= stars
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-slate-300 dark:text-slate-600'
                                  }`}
                                />
                              ))}
                            </div>
                          </div>

                          {/* Center Arabic Letter or Word Forms */}
                          <div className="my-2 flex items-center justify-center h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700/80 shadow-inner" dir="rtl">
                            {lesson.headerForms && lesson.headerForms.length === 3 ? (
                              <div className="flex items-center gap-2 font-arabic text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                                {lesson.headerForms.map((hf, i) => (
                                  <span key={i}>{hf}</span>
                                ))}
                              </div>
                            ) : lesson.letter ? (
                              <span className="font-arabic text-3xl sm:text-4xl font-bold text-emerald-700 dark:text-emerald-300">
                                {lesson.letter}
                              </span>
                            ) : (
                              <span className="font-arabic text-base sm:text-lg font-bold text-emerald-700 dark:text-emerald-300 px-2 truncate">
                                {lesson.titleAr || 'قرآن'}
                              </span>
                            )}
                          </div>

                          {/* Bottom Title & Status */}
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
                                <span className="text-[10px] font-semibold text-slate-400">
                                  +50 XP
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  /* COMPACT LIST VIEW */
                  <div className="divide-y divide-slate-100 dark:divide-slate-700/40">
                    {module.lessons.map((lesson) => {
                      const isDone = !!progress.completedLessons[lesson.id];
                      const stars = storageService.getLessonStars(lesson.id);
                      const lessonGlobalIndex = ALL_LESSONS.findIndex(l => l.id === lesson.id) + 1;

                      return (
                        <div
                          key={lesson.id}
                          onClick={() => onSelectLesson(lesson)}
                          className="py-3 px-2 rounded-2xl flex items-center justify-between gap-3 group hover:bg-emerald-50/60 dark:hover:bg-slate-700/40 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                              isDone
                                ? 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'
                                : 'bg-slate-100 dark:bg-slate-700/80 text-slate-500'
                            }`}>
                              {lesson.letter ? (
                                <span className="font-arabic text-2xl font-bold leading-none">{lesson.letter}</span>
                              ) : (
                                <BookOpen className="w-4 h-4" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h4 className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 truncate">
                                Урок {lessonGlobalIndex}: {lesson.title.replace(/^Урок\s+\d+:\s*/, '')}
                              </h4>
                              <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="flex items-center gap-0.5">
                                  {[1, 2, 3].map(s => (
                                    <Star
                                      key={s}
                                      className={`w-3 h-3 ${s <= stars ? 'fill-amber-400 text-amber-500' : 'text-slate-300 dark:text-slate-600'}`}
                                    />
                                  ))}
                                </span>
                                <span>•</span>
                                <span>+50 XP</span>
                              </div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
