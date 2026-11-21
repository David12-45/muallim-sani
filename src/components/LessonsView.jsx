import React, { useState, useMemo, useRef } from 'react';
import { MODULES, ALL_LESSONS } from '../data/book';
import { storageService } from '../services/storage';
import { audioService } from '../services/audio';
import {
  Check,
  Star,
  Play,
  Search,
  X,
  ArrowRight,
  Volume2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Trophy,
  Flame
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

// Duolingo-style vibrant unit palettes
const UNIT_THEMES = {
  m1: {
    banner: 'bg-emerald-500 border-b-[5px] border-emerald-700 text-white',
    badge: 'bg-emerald-600/80 text-emerald-50',
    nodeActive: 'bg-emerald-500 border-b-[7px] border-emerald-700 text-white',
    nodeDone: 'bg-emerald-500 border-b-[7px] border-emerald-700 text-white',
    ring: 'ring-emerald-400/35',
    bubbleText: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-300 dark:bg-emerald-700/70'
  },
  m2: {
    banner: 'bg-sky-500 border-b-[5px] border-sky-700 text-white',
    badge: 'bg-sky-600/80 text-sky-50',
    nodeActive: 'bg-sky-500 border-b-[7px] border-sky-700 text-white',
    nodeDone: 'bg-sky-500 border-b-[7px] border-sky-700 text-white',
    ring: 'ring-sky-400/35',
    bubbleText: 'text-sky-600 dark:text-sky-400',
    dot: 'bg-sky-300 dark:bg-sky-700/70'
  },
  m3: {
    banner: 'bg-violet-500 border-b-[5px] border-violet-700 text-white',
    badge: 'bg-violet-600/80 text-violet-50',
    nodeActive: 'bg-violet-500 border-b-[7px] border-violet-700 text-white',
    nodeDone: 'bg-violet-500 border-b-[7px] border-violet-700 text-white',
    ring: 'ring-violet-400/35',
    bubbleText: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-300 dark:bg-violet-700/70'
  },
  m4: {
    banner: 'bg-amber-500 border-b-[5px] border-amber-700 text-white',
    badge: 'bg-amber-600/80 text-amber-50',
    nodeActive: 'bg-amber-500 border-b-[7px] border-amber-700 text-white',
    nodeDone: 'bg-amber-500 border-b-[7px] border-amber-700 text-white',
    ring: 'ring-amber-400/35',
    bubbleText: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-300 dark:bg-amber-700/70'
  },
  m5: {
    banner: 'bg-rose-500 border-b-[5px] border-rose-700 text-white',
    badge: 'bg-rose-600/80 text-rose-50',
    nodeActive: 'bg-rose-500 border-b-[7px] border-rose-700 text-white',
    nodeDone: 'bg-rose-500 border-b-[7px] border-rose-700 text-white',
    ring: 'ring-rose-400/35',
    bubbleText: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-300 dark:bg-rose-700/70'
  },
  m6: {
    banner: 'bg-teal-500 border-b-[5px] border-teal-700 text-white',
    badge: 'bg-teal-600/80 text-teal-50',
    nodeActive: 'bg-teal-500 border-b-[7px] border-teal-700 text-white',
    nodeDone: 'bg-teal-500 border-b-[7px] border-teal-700 text-white',
    ring: 'ring-teal-400/35',
    bubbleText: 'text-teal-600 dark:text-teal-400',
    dot: 'bg-teal-300 dark:bg-teal-700/70'
  },
  m7: {
    banner: 'bg-emerald-600 border-b-[5px] border-emerald-800 text-white',
    badge: 'bg-emerald-700/80 text-emerald-50',
    nodeActive: 'bg-emerald-600 border-b-[7px] border-emerald-800 text-white',
    nodeDone: 'bg-emerald-600 border-b-[7px] border-emerald-800 text-white',
    ring: 'ring-amber-400/40',
    bubbleText: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-300 dark:bg-emerald-700/70'
  }
};

// Sinusoidal S-curve horizontal offsets (px) for the Duolingo winding path
const PATH_OFFSETS = [0, 42, 64, 42, 0, -42, -64, -42];

function getLessonNodeSymbol(lesson) {
  if (lesson.letter) {
    return { text: lesson.letter, size: 'text-3xl sm:text-4xl' };
  }
  const map = {
    alphabet: { text: 'أ ب', size: 'text-2xl' },
    pairs: { text: 'ب ت', size: 'text-2xl' },
    'madd-syllables': { text: 'بَا', size: 'text-2xl' },
    'madd-mixed': { text: 'بُو', size: 'text-2xl' },
    'madd-alif': { text: 'اٰ', size: 'text-3xl' },
    'madd-waw': { text: 'وٗ', size: 'text-3xl' },
    'madd-ya': { text: 'يٖ', size: 'text-3xl' },
    tashdid: { text: 'بَّ', size: 'text-3xl' },
    'tashdid-words': { text: 'رَبَّ', size: 'text-2xl' },
    'tashdid-long': { text: 'بَّا', size: 'text-2xl' },
    tanwin: { text: 'بٌ', size: 'text-3xl' },
    'tanwin-words': { text: 'بً', size: 'text-3xl' },
    'tanwin-tashdid': { text: 'بٌّ', size: 'text-3xl' },
    hamza: { text: 'ء', size: 'text-3xl' },
    'ta-marbuta': { text: 'ة', size: 'text-3xl' },
    'alif-muqaddara': { text: 'ذٰ', size: 'text-3xl' },
    'ya-muqaddara': { text: 'بٖ', size: 'text-3xl' },
    'waw-muqaddara': { text: 'بٗ', size: 'text-3xl' },
    'ya-alifiyya': { text: 'ىٰ', size: 'text-3xl' },
    'waw-alifiyya': { text: 'وٰ', size: 'text-3xl' },
    silent: { text: 'اْ', size: 'text-3xl' },
    qamariyya: { text: 'الْـ', size: 'text-2xl' },
    shamsiyya: { text: 'الشَّ', size: 'text-xl' },
    phrases: { text: 'اقرأ', size: 'text-xl' },
    wasl: { text: 'ٱ', size: 'text-3xl' },
    waqf: { text: 'ط', size: 'text-3xl' },
    'madd-rule': { text: 'آ', size: 'text-3xl' },
    idgham: { text: 'نّ', size: 'text-3xl' },
    iqlab: { text: 'مۢ', size: 'text-3xl' },
    allah: { text: 'اللّٰه', size: 'text-xl' },
    fatiha: { text: 'الفاتحة', size: 'text-lg' }
  };
  return map[lesson.id] || { text: 'قرآن', size: 'text-xl' };
}

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
    meaning: 'Чёрточка сверху = «А»'
  },
  {
    id: 'kasra',
    lessonId: 'alif',
    arabic: 'بِ',
    audio: 'بِ',
    sound: 'БИ',
    name: 'Кясра',
    meaning: 'Чёрточка снизу = «И»'
  },
  {
    id: 'damma',
    lessonId: 'alif',
    arabic: 'بُ',
    audio: 'بُ',
    sound: 'БУ',
    name: 'Дамма',
    meaning: 'Запятая сверху = «У»'
  },
  {
    id: 'sukun',
    lessonId: 'ra',
    arabic: 'اَبْ',
    audio: 'اَبْ',
    sound: 'АБ',
    name: 'Сукун ( ْ )',
    meaning: 'Кружок = стоп, без гласной'
  },
  {
    id: 'madd',
    lessonId: 'madd-alif',
    arabic: 'بَا',
    audio: 'بَا',
    sound: 'БА-А',
    name: 'Мадд',
    meaning: 'Тянем гласную в 2 раза дольше'
  },
  {
    id: 'tashdid',
    lessonId: 'tashdid',
    arabic: 'رَبَّ',
    audio: 'رَبَّ',
    sound: 'РАБ-БА',
    name: 'Ташдид ( ّ )',
    meaning: 'Значок «w» = двойная буква'
  },
  {
    id: 'tanwin',
    lessonId: 'tanwin',
    arabic: 'بٌ',
    audio: 'بٌ',
    sound: 'БУН',
    name: 'Танвин',
    meaning: 'Двойной значок = «+Н» в конце'
  }
];

export default function LessonsView({ onSelectLesson }) {
  const [selectedModuleId, setSelectedModuleId] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCheatSheet, setShowCheatSheet] = useState(false);
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
    <div className="max-w-3xl mx-auto px-3 sm:px-6 py-4 sm:py-6 pb-28 md:pb-16 space-y-6">
      {/* 1. WELCOMING DUOLINGO-INSPIRED HERO BANNER */}
      <section className="relative overflow-hidden rounded-3xl hero-mesh-gradient text-white p-6 sm:p-7 border-b-[5px] border-emerald-950/70 shadow-apple-lg">
        <div className="absolute inset-0 hero-lattice pointer-events-none opacity-40" aria-hidden="true" />
        <div className="absolute -right-4 -bottom-8 opacity-[0.06] pointer-events-none select-none" aria-hidden="true">
          <span className="font-arabic text-[170px] sm:text-[210px] font-bold leading-none">اقرأ</span>
        </div>

        <div className="relative z-10 space-y-5">
          <div className="space-y-3">
            <div className="inline-flex flex-wrap items-center gap-2 text-xs font-bold">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-amber-200 font-arabic text-sm tracking-normal">
                السَّلَامُ عَلَيْكُمْ
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/25 text-emerald-200">
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" aria-hidden="true" />
                {totalLessons} уроков
              </span>
              <span className="text-emerald-300 text-[11px] font-semibold">• 100% озвучка MP3</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
              Ассаляму Алейкум!{' '}
              <span className="text-amber-300">Добро пожаловать</span>
            </h1>

            <p className="text-xs sm:text-sm text-slate-200/95 leading-relaxed max-w-[54ch]">
              Начните свой путь к уверенному чтению Священного Корана по методике «Му&apos;аллим Сани». Занимайтесь всего по 5 минут в день, слушайте живое произношение и шаг за шагом осваивайте правила таджвида.
            </p>
          </div>

          {/* Chunky Duolingo Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-200">
              <span>Пройдено {completedCount} из {totalLessons} уроков</span>
              <span className="text-amber-300 tabular-nums">{percent}%</span>
            </div>
            <div
              className="w-full h-3.5 bg-black/30 rounded-full overflow-hidden p-0.5 border border-white/10"
              role="progressbar"
              aria-valuenow={percent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Пройдено ${completedCount} из ${totalLessons} уроков`}
            >
              <div
                className="h-full bg-gradient-to-r from-amber-300 via-amber-400 to-emerald-400 transition-all duration-500 rounded-full relative"
                style={{ width: `${Math.max(percent, completedCount > 0 ? 5 : 2)}%` }}
              >
                <div className="absolute inset-x-1 top-0.5 h-1 rounded-full bg-white/35" />
              </div>
            </div>
          </div>

          {/* Tactile 3D Duolingo CTA */}
          {nextUnfinishedLesson && (
            <button
              type="button"
              onClick={() => onSelectLesson(nextUnfinishedLesson)}
              className="w-full inline-flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-sm border-2 border-slate-200 border-b-[5px] border-b-slate-300 active:border-b-2 active:translate-y-[3px] transition-all group cursor-pointer"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 border-b-[3px] border-emerald-700 text-white flex items-center justify-center shrink-0">
                  <Play className="w-4 h-4 fill-current ml-0.5" aria-hidden="true" />
                </div>
                <div className="text-left min-w-0">
                  <div className="text-[10px] uppercase font-extrabold text-emerald-700 tracking-wider">
                    {completedCount === 0 ? 'Начать 1-й урок' : 'Продолжить путь'}
                  </div>
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                    {nextUnfinishedLesson.title}
                  </div>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-emerald-600 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </button>
          )}
        </div>
      </section>

      {/* 2. COMPACT COLLAPSIBLE 7-SIGN CHEAT SHEET */}
      <section className="bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 border-b-4 rounded-3xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-2 border-amber-200 dark:border-amber-800/60 flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-extrabold text-slate-900 dark:text-white leading-snug">
                Шпаргалка: 7 знаков чтения
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                Вся система огласовок на одной букве «Б» (ب)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCheatSheet(v => !v)}
            aria-expanded={showCheatSheet}
            className="inline-flex items-center gap-1 px-3.5 py-2 rounded-xl text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-slate-700 border-2 border-slate-200 dark:border-slate-700 border-b-[3px] active:border-b-2 active:translate-y-[1px] shrink-0 cursor-pointer transition-all"
          >
            <span>{showCheatSheet ? 'Скрыть' : 'Открыть'}</span>
            {showCheatSheet ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showCheatSheet && (
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 animate-fadeIn">
            {SEVEN_CORE_SIGNS.map((sign, index) => {
              const isPlaying = activeSignId === sign.id;
              return (
                <div
                  key={sign.id}
                  className={`relative overflow-hidden rounded-2xl border-2 border-b-4 bg-slate-50/70 dark:bg-slate-950/60 p-3 flex flex-col justify-between transition-all ${
                    isPlaying
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                      : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => handlePlaySign(sign)}
                    className="w-full text-center group cursor-pointer focus-visible:outline-2 focus-visible:outline-emerald-600 rounded-xl"
                    title="Нажмите, чтобы прослушать"
                  >
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
                      <span>Шаг {index + 1}</span>
                      <Volume2
                        className={`w-3.5 h-3.5 transition-transform ${
                          isPlaying ? 'text-emerald-600 scale-110' : 'text-slate-400 group-hover:text-emerald-600 group-hover:scale-110'
                        }`}
                        aria-hidden="true"
                      />
                    </div>

                    <div className="py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-white/5">
                      <span className="font-arabic text-3xl font-bold text-slate-900 dark:text-white leading-normal" dir="rtl">
                        {sign.arabic}
                      </span>
                    </div>

                    <div className="mt-2 flex justify-center">
                      <span className="px-2 py-0.5 rounded-lg text-[11px] font-extrabold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200/70 dark:border-emerald-800/60">
                        «{sign.sound}»
                      </span>
                    </div>

                    <div className="text-xs font-extrabold text-slate-900 dark:text-white mt-1.5">
                      {sign.name}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug mt-0.5">
                      {sign.meaning}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenRuleLesson(sign.lessonId)}
                    className="mt-2.5 w-full py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-emerald-500 hover:text-white hover:border-emerald-600 text-[11px] font-bold text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                  >
                    К уроку →
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. CHAPTER PILLS & SEARCH */}
      <div className="space-y-3">
        <div
          ref={moduleScrollRef}
          className="flex items-center gap-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth no-scrollbar mask-fade-x-right pr-6"
        >
          <button
            type="button"
            onClick={(e) => {
              setSelectedModuleId('all');
              e.currentTarget.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer border-2 border-b-[3px] active:border-b-2 active:translate-y-[1px] ${
              selectedModuleId === 'all'
                ? 'bg-emerald-500 border-emerald-600 border-b-emerald-700 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 hover:border-slate-300'
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
                className={`px-3.5 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap shrink-0 transition-all cursor-pointer border-2 border-b-[3px] active:border-b-2 active:translate-y-[1px] ${
                  isSelected
                    ? 'bg-emerald-500 border-emerald-600 border-b-emerald-700 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 hover:border-slate-300'
                }`}
              >
                {MODULE_SHORT_TITLES[mod.id] || `${mod.number}. ${mod.title}`}
              </button>
            );
          })}
        </div>

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" aria-hidden="true" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Найти урок: фатха, нун, сукун, мадд, ташдид..."
            className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-900 border-2 border-slate-200/90 dark:border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-emerald-500 transition-colors"
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

      {/* 4. DUOLINGO-STYLE WINDING LEARNING PATH */}
      {filteredModules.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-800 rounded-3xl p-10 text-center">
          <p className="text-slate-600 dark:text-slate-400 text-sm font-medium">
            Уроков по запросу «{searchQuery}» не найдено.
          </p>
          <button
            type="button"
            onClick={() => { setSearchQuery(''); setSelectedModuleId('all'); }}
            className="mt-4 px-5 py-2.5 rounded-xl bg-emerald-500 border-b-4 border-emerald-700 active:border-b-0 active:translate-y-1 text-white text-xs font-extrabold hover:bg-emerald-600 cursor-pointer transition-all"
          >
            Показать все уроки
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {filteredModules.map((module) => {
            const theme = UNIT_THEMES[module.id] || UNIT_THEMES.m1;
            const moduleCompleted = module.lessons.filter(l => progress.completedLessons[l.id]).length;
            const isAllDone = moduleCompleted === module.lessons.length && module.lessons.length > 0;

            return (
              <section key={module.id} className="space-y-6">
                {/* Duolingo Unit Header Banner */}
                <div className={`rounded-3xl p-5 sm:p-6 shadow-apple-sm ${theme.banner}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="inline-flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-extrabold uppercase tracking-wider ${theme.badge}`}>
                          Глава {module.number}
                        </span>
                        {isAllDone && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-white/20 text-white text-[11px] font-bold">
                            <Check className="w-3 h-3 stroke-[3]" aria-hidden="true" />
                            Пройдено
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold tracking-tight leading-snug pt-0.5">
                        {module.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-white/90 leading-relaxed">
                        {module.description}
                      </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-end gap-1.5">
                      <div className="px-3 py-1.5 rounded-xl bg-black/15 border border-white/15 text-xs font-extrabold tabular-nums">
                        {moduleCompleted} / {module.lessons.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Winding S-Curve Path of 3D Lesson Nodes */}
                <div className="relative flex flex-col items-center py-3">
                  {module.lessons.map((lesson, idx) => {
                    const isDone = !!progress.completedLessons[lesson.id];
                    const stars = storageService.getLessonStars(lesson.id);
                    const isCurrentTarget = nextUnfinishedLesson?.id === lesson.id;
                    const lessonGlobalIndex = ALL_LESSONS.findIndex(l => l.id === lesson.id) + 1;
                    const offsetX = module.lessons.length === 1 ? 0 : PATH_OFFSETS[idx % PATH_OFFSETS.length];
                    const nextOffsetX =
                      idx < module.lessons.length - 1
                        ? PATH_OFFSETS[(idx + 1) % PATH_OFFSETS.length]
                        : 0;
                    const symbol = getLessonNodeSymbol(lesson);
                    const shortTitle = lesson.title.replace(/^Урок\s+\d+:\s*/, '');

                    return (
                      <React.Fragment key={lesson.id}>
                        <div
                          className="relative flex flex-col items-center z-10"
                          style={{ transform: `translateX(${offsetX}px)` }}
                        >
                          {/* Floating Duolingo "НАЧАТЬ / ПРОДОЛЖИТЬ" Speech Bubble */}
                          {isCurrentTarget && (
                            <div className="mb-2.5 animate-duo-float">
                              <div
                                className={`relative px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 shadow-apple-md text-[11px] font-extrabold uppercase tracking-wider ${theme.bubbleText}`}
                              >
                                {completedCount === 0 ? 'Начать' : 'Продолжить'}
                                <span
                                  className="absolute -bottom-[7px] left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-white dark:bg-slate-800 border-r-2 border-b-2 border-slate-200 dark:border-slate-700"
                                  aria-hidden="true"
                                />
                              </div>
                            </div>
                          )}

                          {/* Tactile 3D Circular Lesson Node */}
                          <div className="relative flex items-center justify-center">
                            {isCurrentTarget && (
                              <span
                                className={`absolute -inset-2.5 rounded-full border-[5px] border-current opacity-25 pointer-events-none ${theme.bubbleText}`}
                                aria-hidden="true"
                              />
                            )}

                            <button
                              type="button"
                              onClick={() => onSelectLesson(lesson)}
                              aria-label={`Урок ${lessonGlobalIndex}: ${shortTitle}`}
                              className={`group relative w-[82px] h-[82px] sm:w-[88px] sm:h-[88px] rounded-full flex items-center justify-center transition-all duration-150 select-none cursor-pointer active:translate-y-[5px] active:border-b-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-500 ${
                                isCurrentTarget
                                  ? `${theme.nodeActive} ring-8 ${theme.ring} shadow-apple-lg`
                                  : isDone
                                  ? `${theme.nodeDone} shadow-apple-md hover:brightness-105`
                                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 border-2 border-slate-200 dark:border-slate-700 border-b-[7px] border-b-slate-300 dark:border-b-slate-950 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-apple-sm'
                              }`}
                            >
                              {/* Subtle Duolingo top gloss crescent */}
                              <span
                                className={`pointer-events-none absolute top-2 inset-x-4 h-3 rounded-full ${
                                  isCurrentTarget || isDone ? 'bg-white/25' : 'bg-slate-100/80 dark:bg-white/5'
                                }`}
                                aria-hidden="true"
                              />

                              <span
                                className={`font-arabic font-bold leading-none select-none ${symbol.size}`}
                                dir="rtl"
                              >
                                {symbol.text}
                              </span>

                              {/* Completed checkmark badge */}
                              {isDone && (
                                <span className="absolute -top-1 -right-1 w-7 h-7 rounded-full bg-amber-400 border-2 border-white dark:border-slate-900 text-amber-950 flex items-center justify-center shadow-xs">
                                  <Check className="w-3.5 h-3.5 stroke-[3.5]" aria-hidden="true" />
                                </span>
                              )}
                            </button>
                          </div>

                          {/* Stars row for completed lessons */}
                          {isDone && (
                            <div
                              className="flex items-center justify-center gap-0.5 mt-1.5"
                              aria-label={`Звёзды: ${stars} из 3`}
                            >
                              {[1, 2, 3].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3.5 h-3.5 ${
                                    s <= stars
                                      ? 'fill-amber-400 text-amber-500'
                                      : 'text-slate-300 dark:text-slate-700'
                                  }`}
                                />
                              ))}
                            </div>
                          )}

                          {/* Compact Lesson Caption */}
                          <button
                            type="button"
                            onClick={() => onSelectLesson(lesson)}
                            className="mt-1.5 px-3 py-1 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-apple-xs hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors max-w-[175px] text-center cursor-pointer"
                          >
                            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                              Урок {lessonGlobalIndex}
                            </div>
                            <div className="text-[11.5px] font-bold text-slate-800 dark:text-slate-100 leading-tight line-clamp-2">
                              {shortTitle}
                            </div>
                          </button>
                        </div>

                        {/* Dotted Stepping-Stone Path Connector to Next Node */}
                        {idx < module.lessons.length - 1 && (
                          <div className="relative h-8 w-full flex flex-col items-center justify-center gap-1.5 pointer-events-none my-0.5" aria-hidden="true">
                            <span
                              className={`w-2 h-2 rounded-full ${isDone ? theme.dot : 'bg-slate-300/80 dark:bg-slate-700'}`}
                              style={{ transform: `translateX(${Math.round(offsetX + (nextOffsetX - offsetX) * 0.35)}px)` }}
                            />
                            <span
                              className={`w-2 h-2 rounded-full ${isDone ? theme.dot : 'bg-slate-300/80 dark:bg-slate-700'}`}
                              style={{ transform: `translateX(${Math.round(offsetX + (nextOffsetX - offsetX) * 0.7)}px)` }}
                            />
                          </div>
                        )}
                      </React.Fragment>
                    );
                  })}

                  {/* Unit Finish Trophy Milestone */}
                  <div className="mt-6 flex flex-col items-center">
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 border-b-[5px] transition-all ${
                        isAllDone
                          ? 'bg-amber-400 border-amber-500 border-b-amber-600 text-amber-950 shadow-apple-md'
                          : 'bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-800 border-b-slate-300 dark:border-b-slate-950 text-slate-400 dark:text-slate-600'
                      }`}
                    >
                      <Trophy className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <span className="mt-2 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      {isAllDone ? `Глава ${module.number} освоена!` : `Финиш главы ${module.number}`}
                    </span>
                  </div>
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
