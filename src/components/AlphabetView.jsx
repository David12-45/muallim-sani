import React, { useState, useMemo } from 'react';
import {
  ALPHABET_DATA,
  SPECIAL_LETTERS,
  LETTER_FAMILIES,
  ALPHABET_GROUPS_10,
  SOUNDS_YOU_KNOW,
  BADGE_DEFINITIONS,
  LETTER_ENGLISH_NAMES,
  getLetterBadges
} from '../data/alphabet';
import { audioService } from '../services/audio';
import { soundFx } from '../services/soundFx';
import LetterCanvasModal from './LetterCanvasModal';
import AlphabetGameModal from './AlphabetGameModal';
import AlphabetCourse from './AlphabetCourse';
import {
  Volume2,
  Search,
  Sparkles,
  Edit3,
  Gamepad2,
  Layers,
  LayoutGrid,
  CheckCircle2,
  BookOpen,
  Filter,
  Check,
  X,
  GraduationCap,
  FileText,
  Mic,
  ArrowRight
} from 'lucide-react';

export default function AlphabetView() {
  // 4 Top Primary Tabs: 'course' | 'atlas' | 'rules' | 'sounds'
  const [mainTab, setMainTab] = useState('course');

  // Sub-view for Atlas tab: 'groups10' | 'families' | 'grid'
  const [atlasSubView, setAtlasSubView] = useState('groups10');
  const [activeBadgeFilter, setActiveBadgeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeLetter, setActiveLetter] = useState(ALPHABET_DATA[0]);
  const [tracingLetter, setTracingLetter] = useState(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  const [playingChar, setPlayingChar] = useState(null);

  // Helper to find letter object by symbol from ALPHABET_DATA or SPECIAL_LETTERS
  const findLetterObj = (symbol) => {
    const cleanSym = String(symbol || '').replace(/[\u064B-\u065F\u0670\u06D6-\u06ED()=ـ\s]/g, '').trim();
    return (
      ALPHABET_DATA.find(l => l.arabic === symbol || l.arabic === cleanSym) ||
      SPECIAL_LETTERS.find(l => l.arabic === symbol || l.arabic === cleanSym) ||
      (cleanSym === 'ه' && ALPHABET_DATA.find(l => l.arabic === 'هـ'))
    );
  };

  // Play audio with soundFx tap + animation highlight
  const handlePlayLetter = (arabicChar) => {
    soundFx.playTap();
    setPlayingChar(arabicChar);
    audioService.playLetter(arabicChar);
    setTimeout(() => {
      setPlayingChar(prev => prev === arabicChar ? null : prev);
    }, 1200);
  };

  // Filter letters for atlas view
  const isLetterMatchingFilters = (letter) => {
    if (!letter) return false;

    // Badge filter
    if (activeBadgeFilter !== 'all') {
      const badges = getLetterBadges(letter.arabic);
      const hasBadge = badges.some(b => b.id === activeBadgeFilter);
      if (!hasBadge) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const eng = (LETTER_ENGLISH_NAMES[letter.arabic] || '').toLowerCase();
      const name = (letter.name || '').toLowerCase();
      const arab = letter.arabic || '';
      const trans = (letter.transcription || '').toLowerCase();
      return name.includes(q) || arab.includes(q) || trans.includes(q) || eng.includes(q);
    }

    return true;
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8 pb-28 md:pb-12 space-y-7">
      {/* 1. TOP HERO HEADER */}
      <header className="relative overflow-hidden rounded-[2rem] hero-mesh-gradient text-white p-6 sm:p-9 border border-gold-300/25 shadow-apple-xl">
        <div className="absolute inset-0 hero-arabesque pointer-events-none opacity-[0.15]" aria-hidden="true" />
        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-emerald-100">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-1.5 shadow-sm">
                <BookOpen className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
                Метод «Му'аллим Сани»
              </span>
              <span className="text-emerald-200/90 font-medium">• 29 букв Алифбы</span>
              <span className="text-amber-300 font-medium">• Студийные MP3</span>
            </div>

            <h1 className="heading-fluid font-black tracking-tight leading-tight">
              Арабский алфавит <span className="font-arabic font-normal text-amber-300 text-3xl sm:text-4xl ml-2" dir="rtl">الحروف الهجائية</span>
            </h1>

            <p className="text-xs sm:text-sm text-emerald-100/85 leading-relaxed font-normal">
              Пошаговый курс, атлас всех 29 букв, 4 формы написания в слове, точные махраджи и тренировочные мини-игры.
            </p>
          </div>

          {/* Quick Launch Game CTA Button */}
          <div className="w-full lg:w-auto shrink-0 flex flex-col sm:flex-row lg:flex-col gap-2">
            <button
              onClick={() => {
                soundFx.playTap();
                setIsGameModalOpen(true);
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs sm:text-sm shadow-apple-md hover:shadow-apple-lg hover:-translate-y-0.5 flex items-center justify-center gap-2.5 transition-all active:scale-95 group"
            >
              <Gamepad2 className="w-5 h-5 fill-current group-hover:rotate-12 transition-transform" />
              <span>Игра: Знаток Алфавита 🎮</span>
            </button>
            <p className="text-[11px] text-center text-emerald-200/70 font-medium">
              3 режима: на слух, семейства и порядок
            </p>
          </div>
        </div>
      </header>

      {/* 2. PRIMARY NAVIGATION TABS (Apple segmented control) */}
      <div className="p-1 rounded-2xl bg-slate-200/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/80 dark:border-slate-700/60 inline-flex flex-wrap gap-1 shadow-apple-xs max-w-full">
        <button
          onClick={() => { soundFx.playTap(); setMainTab('course'); }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 ${
            mainTab === 'course'
              ? 'bg-[#FFFDF8] dark:bg-slate-900 text-slate-900 dark:text-white shadow-apple-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <GraduationCap className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>🎓 Обучение с нуля (7 групп)</span>
        </button>

        <button
          onClick={() => { soundFx.playTap(); setMainTab('atlas'); }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 ${
            mainTab === 'atlas'
              ? 'bg-[#FFFDF8] dark:bg-slate-900 text-slate-900 dark:text-white shadow-apple-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <BookOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>📚 Атлас 29 букв</span>
        </button>

        <button
          onClick={() => { soundFx.playTap(); setMainTab('rules'); }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 ${
            mainTab === 'rules'
              ? 'bg-[#FFFDF8] dark:bg-slate-900 text-slate-900 dark:text-white shadow-apple-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>💡 Правила письма (4 шага)</span>
        </button>

        <button
          onClick={() => { soundFx.playTap(); setMainTab('sounds'); }}
          className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all active:scale-95 ${
            mainTab === 'sounds'
              ? 'bg-[#FFFDF8] dark:bg-slate-900 text-slate-900 dark:text-white shadow-apple-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Mic className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>🗣️ Звуковые аналогии (15)</span>
        </button>
      </div>

      {/* 3. TAB CONTENT */}

      {/* ================= TAB 1: STEP-BY-STEP COURSE ================= */}
      {mainTab === 'course' && (
        <AlphabetCourse />
      )}

      {/* ================= TAB 2: ATLAS 29 LETTERS ================= */}
      {mainTab === 'atlas' && (
        <div className="space-y-6">
          {/* Controls Bar: Sub-views, Search, Tajweed Badges */}
          <div className="bg-[#FFFDF8] dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-apple-sm space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Sub-view switcher (iOS Segmented) */}
              <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 shrink-0">
                <button
                  onClick={() => { soundFx.playTap(); setAtlasSubView('groups10'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    atlasSubView === 'groups10'
                      ? 'bg-[#FFFDF8] dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-apple-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>10 Групп</span>
                </button>
                <button
                  onClick={() => { soundFx.playTap(); setAtlasSubView('families'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    atlasSubView === 'families'
                      ? 'bg-[#FFFDF8] dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-apple-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>По остову</span>
                </button>
                <button
                  onClick={() => { soundFx.playTap(); setAtlasSubView('grid'); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    atlasSubView === 'grid'
                      ? 'bg-[#FFFDF8] dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-apple-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Сетка 29</span>
                </button>
              </div>

              {/* Search input (Clean Apple Spotlight style) */}
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Поиск: Ба, ب, Alif, губная..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/70 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Badges Filter Bar */}
            <div className="flex flex-wrap items-center gap-1.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-[11px] font-semibold text-slate-400 mr-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Фильтр:
              </span>
              <button
                onClick={() => setActiveBadgeFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeBadgeFilter === 'all'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-apple-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200/70'
                }`}
              >
                Все
              </button>
              {BADGE_DEFINITIONS.map((badge) => (
                <button
                  key={badge.id}
                  onClick={() => setActiveBadgeFilter(badge.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all ${
                    activeBadgeFilter === badge.id
                      ? `${badge.colorClass} shadow-apple-xs ring-2 ring-emerald-500/20`
                      : 'bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700/60 hover:border-slate-300'
                  }`}
                >
                  {badge.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sub-view 1: 10 Groups */}
          {atlasSubView === 'groups10' && (
            <div className="space-y-8">
              {ALPHABET_GROUPS_10.map((group) => {
                const groupLetters = group.letterSymbols
                  .map(sym => findLetterObj(sym))
                  .filter(Boolean)
                  .filter(letter => isLetterMatchingFilters(letter));

                if (groupLetters.length === 0) return null;

                return (
                  <div key={group.id} className="space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 border-b border-slate-200 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-lg font-mono text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                          {group.number}
                        </span>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          {group.subtitle}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {group.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                      {groupLetters.map((letter) => {
                        const englishName = LETTER_ENGLISH_NAMES[letter.arabic] || letter.name;
                        const badges = getLetterBadges(letter.arabic);
                        const isPlaying = playingChar === letter.arabic;

                        return (
                          <div
                            key={letter.arabic}
                            className={`rounded-2xl border p-4 flex flex-col justify-between transition-all shadow-apple-xs hover:shadow-apple-md hover:-translate-y-0.5 ${
                              isPlaying
                                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 border-emerald-500/80 ring-2 ring-emerald-500/20'
                                : 'bg-[#FFFDF8] dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-center justify-between w-full mb-1">
                              <span className="text-[10px] font-mono font-semibold text-slate-400">
                                {letter.id < 10 ? `0${letter.id}` : letter.id}
                              </span>
                              <button
                                onClick={() => handlePlayLetter(letter.arabic)}
                                className={`p-1.5 rounded-lg transition-all active:scale-90 ${
                                  isPlaying
                                    ? 'bg-emerald-600 text-white shadow-apple-xs'
                                    : 'bg-slate-100 hover:bg-emerald-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                                }`}
                                title="Слушать студийное аудио"
                              >
                                <Volume2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <div className="text-center my-2">
                              <button
                                onClick={() => handlePlayLetter(letter.arabic)}
                                className="font-arabic text-5xl sm:text-6xl font-bold leading-none select-none text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors inline-block active:scale-95"
                                dir="rtl"
                              >
                                {letter.arabic}
                              </button>
                              <div className="mt-1.5">
                                <h4 className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-center gap-1">
                                  <span>{englishName}</span>
                                  <span className="text-xs font-normal text-slate-400">({letter.name})</span>
                                </h4>
                                <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-medium">
                                  [{letter.transcription}]
                                </p>
                              </div>
                            </div>

                            {/* 4 Forms */}
                            {letter.forms && (
                              <div className="w-full mt-2 pt-2 border-t border-slate-100 dark:border-slate-850">
                                <div className="grid grid-cols-4 gap-1 text-center bg-slate-50 dark:bg-slate-800/60 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700/60" dir="rtl">
                                  <div className="flex flex-col items-center">
                                    <span className="font-arabic text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{letter.forms.initial}</span>
                                    <span className="text-[9px] font-medium text-slate-400" dir="ltr">В нач.</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="font-arabic text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{letter.forms.medial}</span>
                                    <span className="text-[9px] font-medium text-slate-400" dir="ltr">В сер.</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="font-arabic text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{letter.forms.final}</span>
                                    <span className="text-[9px] font-medium text-slate-400" dir="ltr">В конце</span>
                                  </div>
                                  <div className="flex flex-col items-center">
                                    <span className="font-arabic text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400">{letter.forms.isolated}</span>
                                    <span className="text-[9px] font-medium text-slate-400" dir="ltr">Отдельн.</span>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Badges */}
                            <div className="flex flex-wrap gap-1 justify-center my-2">
                              {badges.map((b) => (
                                <span key={b.id} className={`text-[9px] px-1.5 py-0.5 rounded-full border font-semibold ${b.colorClass}`}>
                                  {b.label}
                                </span>
                              ))}
                              {!letter.connectsLeft && (
                                <span className="text-[9px] px-1.5 py-0.5 rounded-full border font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60">
                                  ⚠️ Не соед.
                                </span>
                              )}
                            </div>

                            {/* Action: Trace */}
                            <button
                              onClick={() => { soundFx.playTap(); setTracingLetter(letter); }}
                              className="w-full py-1.5 px-2 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 text-[11px] font-semibold transition-all flex items-center justify-center gap-1 active:scale-95 border border-slate-200/80 dark:border-slate-700/70"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Пропись пальцем ✍️</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Sub-view 2: Families */}
          {atlasSubView === 'families' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-4">
                {LETTER_FAMILIES.map((family) => {
                  const familyLetters = family.letterSymbols
                    .map(sym => findLetterObj(sym))
                    .filter(Boolean)
                    .filter(letter => isLetterMatchingFilters(letter));

                  if (familyLetters.length === 0) return null;

                  return (
                    <div
                      key={family.id}
                      className="p-5 rounded-3xl bg-[#FFFDF8] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-apple-xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <span className="font-arabic text-2xl font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                            {family.arabicShape}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                            {family.name}
                          </h3>
                        </div>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {family.badge}
                        </span>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                        {family.description}
                      </p>

                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2" dir="rtl">
                        {familyLetters.map((letter) => {
                          const isSelected = activeLetter?.arabic === letter.arabic;
                          return (
                            <button
                              key={letter.arabic}
                              onClick={() => {
                                setActiveLetter(letter);
                                handlePlayLetter(letter.arabic);
                              }}
                              className={`p-3 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 border text-center ${
                                isSelected
                                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-apple-sm -translate-y-0.5'
                                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-700/60 hover:border-emerald-500/50 hover:bg-white dark:hover:bg-slate-800'
                              }`}
                            >
                              <span className="font-arabic text-3xl font-bold my-0.5">
                                {letter.arabic}
                              </span>
                              <span className={`text-xs font-semibold truncate max-w-full ${
                                isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                              }`}>
                                {letter.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar detail for active letter */}
              <div className="lg:col-span-5 sticky top-24">
                {activeLetter && (
                  <div className="bg-[#FFFDF8] dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-apple-md space-y-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3.5">
                        <button
                          onClick={() => handlePlayLetter(activeLetter.arabic)}
                          className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-white shadow-apple-sm active:scale-95 transition-transform"
                        >
                          <span className="font-arabic text-4xl font-bold">{activeLetter.arabic}</span>
                        </button>
                        <div>
                          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            {activeLetter.name}
                            <span className="text-xs font-arabic text-emerald-600 dark:text-emerald-400">({activeLetter.arabicName})</span>
                          </h2>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            Звук: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">[{activeLetter.transcription}]</strong>
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handlePlayLetter(activeLetter.arabic)}
                        className="p-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-950/70 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 transition-colors"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                    </div>

                    {activeLetter.forms && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">4 формы в слове:</span>
                          <button
                            onClick={() => { soundFx.playTap(); setTracingLetter(activeLetter); }}
                            className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                          >
                            <Edit3 className="w-3.5 h-3.5" /> Пропись
                          </button>
                        </div>
                        <div className="grid grid-cols-4 gap-1.5 text-center" dir="rtl">
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                            <span className="font-arabic text-xl font-bold text-emerald-600 dark:text-emerald-400">{activeLetter.forms.initial}</span>
                            <p className="text-[9px] font-medium text-slate-400" dir="ltr">В нач.</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                            <span className="font-arabic text-xl font-bold text-emerald-600 dark:text-emerald-400">{activeLetter.forms.medial}</span>
                            <p className="text-[9px] font-medium text-slate-400" dir="ltr">В сер.</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                            <span className="font-arabic text-xl font-bold text-emerald-600 dark:text-emerald-400">{activeLetter.forms.final}</span>
                            <p className="text-[9px] font-medium text-slate-400" dir="ltr">В конце</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60">
                            <span className="font-arabic text-xl font-bold text-emerald-600 dark:text-emerald-400">{activeLetter.forms.isolated}</span>
                            <p className="text-[9px] font-medium text-slate-400" dir="ltr">Отдельн.</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
                      <p className="text-xs font-semibold text-amber-900 dark:text-amber-200">
                        Махрадж: {activeLetter.makhraj}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                        {activeLetter.description}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-view 3: Grid */}
          {atlasSubView === 'grid' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3" dir="rtl">
              {ALPHABET_DATA.filter(l => isLetterMatchingFilters(l)).map((letter) => {
                const isSelected = activeLetter?.id === letter.id;
                const isPlaying = playingChar === letter.arabic;

                return (
                  <button
                    key={letter.id}
                    onClick={() => {
                      setActiveLetter(letter);
                      handlePlayLetter(letter.arabic);
                    }}
                    className={`relative p-3.5 rounded-2xl flex flex-col items-center justify-center transition-all active:scale-95 border text-center shadow-apple-xs hover:shadow-apple-sm ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-emerald-600 -translate-y-0.5'
                        : isPlaying
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-400 ring-2 ring-emerald-500/20'
                        : 'bg-[#FFFDF8] dark:bg-slate-900 text-slate-800 dark:text-slate-100 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <span className="font-arabic text-3xl sm:text-4xl font-bold my-1">
                      {letter.arabic}
                    </span>
                    <span className={`text-xs font-semibold truncate max-w-full ${
                      isSelected ? 'text-white' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      {letter.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono" dir="ltr">
                      [{letter.transcription}]
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Special Ligatures & Letters */}
          <section className="pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Особые знаки и лигатуры</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                Важно для чтения
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {SPECIAL_LETTERS.map((spec) => {
                const isPlaying = playingChar === spec.arabic;
                return (
                  <button
                    key={spec.id}
                    onClick={() => handlePlayLetter(spec.arabic)}
                    className={`p-4 rounded-2xl border text-left transition-all active:scale-95 flex items-start gap-3.5 shadow-apple-xs hover:shadow-apple-sm ${
                      isPlaying
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/50 border-emerald-500/80 ring-2 ring-emerald-500/20'
                        : 'bg-[#FFFDF8] dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50 flex items-center justify-center font-arabic text-2xl font-bold shrink-0">
                      {spec.arabic}
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                        <span>{spec.name}</span>
                        <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">
                        {spec.description}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      )}

      {/* ================= TAB 3: WRITING RULES (4 STEPS) ================= */}
      {mainTab === 'rules' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="rounded-3xl p-6 bg-[#FFFDF8] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-apple-xs hover:shadow-apple-sm transition-all space-y-3.5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                  1
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Шаг 1 — Читаем и пишем справа налево
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
                <div className="text-3xl font-arabic font-bold text-emerald-600 dark:text-emerald-400 mb-1" dir="rtl">
                  بِسْمِ اللّٰهِ ←
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Начинаем с правого края</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Текст начинается справа и течёт влево. Взгляд должен сначала находить крайнюю правую букву, а затем последовательно двигаться влево.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-3xl p-6 bg-[#FFFDF8] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-apple-xs hover:shadow-apple-sm transition-all space-y-3.5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                  2
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Шаг 2 — 29 букв (Без заглавных)
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
                <div className="text-xl font-bold text-slate-900 dark:text-white">
                  29 согласных букв
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Гласные звуки обозначаются знаками (огласовками)</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Все буквы арабского алфавита — согласные. В арабском языке нет заглавных букв — все пишутся в едином регистре.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-3xl p-6 bg-[#FFFDF8] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-apple-xs hover:shadow-apple-sm transition-all space-y-3.5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold text-sm">
                  3
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Шаг 3 — 4 формы букв в слове
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-center">
                <div className="text-2xl font-arabic font-bold text-emerald-600 dark:text-emerald-400" dir="rtl">
                  ب ‹ بـ ‹ ـبـ ‹ ـب
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Буква «Ба» в 4 разных положениях</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Арабские буквы соединяются в единую связную вязь: отдельно, в начале, в середине и в конце слова.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-3xl p-6 bg-[#FFFDF8] dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-apple-xs hover:shadow-apple-sm transition-all space-y-3.5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold text-sm">
                  4
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Шаг 4 — 6 несоединяемых букв
                </h3>
              </div>
              <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 text-center">
                <div className="text-2xl font-arabic font-bold text-amber-700 dark:text-amber-300 tracking-wider" dir="rtl">
                  ا  د  ذ  ر  ز  و
                </div>
                <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">Никогда не соединяются влево!</p>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                Эти 6 букв разрывают связку влево. Следующая за ними буква пишется как начало нового слова.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 4: SOUND ANALOGIES ================= */}
      {mainTab === 'sounds' && (
        <div className="space-y-4">
          <div className="bg-[#FFFDF8] dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200/80 dark:border-slate-800 shadow-apple-xs">
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              15 звуковых аналогий для быстрого старта
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Нажимайте на любую карточку, чтобы услышать реальное студийное произношение:
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SOUNDS_YOU_KNOW.map((item) => {
              const isPlaying = playingChar === item.arabic;
              return (
                <button
                  key={item.arabic}
                  onClick={() => handlePlayLetter(item.arabic)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3.5 active:scale-95 shadow-apple-xs hover:shadow-apple-sm ${
                    isPlaying
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/70 border-emerald-500/80 ring-2 ring-emerald-500/20'
                      : 'bg-[#FFFDF8] dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-center shrink-0">
                    <span className="font-arabic text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                      {item.arabic}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {item.name} <span className="text-slate-400 font-normal">({item.englishName})</span>
                      </span>
                      <Volume2 className={`w-4 h-4 ${isPlaying ? 'text-emerald-600 animate-pulse' : 'text-slate-400'}`} />
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 flex items-center gap-1 font-medium">
                      <span>звучит как:</span>
                      <strong className="text-emerald-600 dark:text-emerald-400 font-bold">[{item.soundsLike}]</strong>
                      <span className="text-slate-400 text-[11px]">({item.soundWord})</span>
                    </div>

                    <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                      {item.tip}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tracing Modal */}
      {tracingLetter && (
        <LetterCanvasModal
          letter={tracingLetter}
          onClose={() => setTracingLetter(null)}
        />
      )}

      {/* Dedicated Alphabet Game Modal */}
      {isGameModalOpen && (
        <AlphabetGameModal
          onClose={() => setIsGameModalOpen(false)}
        />
      )}
    </div>
  );
}
