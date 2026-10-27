import React, { useState, useEffect } from 'react';
import {
  GAME_LEVELS,
  getUserKnowledgeProgress,
  setUserGameLevel,
  setUserLearnedLettersCount
} from '../../data/gameLevels';
import { soundFx } from '../../services/soundFx';
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Award,
  Check,
  RotateCcw,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export default function LevelProgressBar({ onLevelChanged }) {
  const [progressData, setProgressData] = useState(() => getUserKnowledgeProgress());
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditingCount, setIsEditingCount] = useState(false);

  const refresh = () => {
    const updated = getUserKnowledgeProgress();
    setProgressData(updated);
    if (onLevelChanged) {
      onLevelChanged(updated.currentLevel);
    }
  };

  useEffect(() => {
    refresh();
    const handleUpdate = () => refresh();
    window.addEventListener('muallim-level-changed', handleUpdate);
    window.addEventListener('muallim-xp-updated', handleUpdate);
    return () => {
      window.removeEventListener('muallim-level-changed', handleUpdate);
      window.removeEventListener('muallim-xp-updated', handleUpdate);
    };
  }, []);

  const handleSelectLevel = (levelId) => {
    soundFx.playTap();
    setUserGameLevel(levelId);
    refresh();
  };

  const handleSetLetterCount = (count) => {
    soundFx.playTap();
    setUserLearnedLettersCount(count);
    refresh();
  };

  const {
    learnedLettersCount,
    totalLetters,
    percent,
    selectedLevelId,
    currentLevel,
    completedLessonsCount
  } = progressData;

  const alphabetLevels = GAME_LEVELS.filter(l => l.category === 'alphabet');
  const advancedLevels = GAME_LEVELS.filter(l => l.category === 'words');

  return (
    <div className="rounded-3xl bg-slate-900/90 border border-emerald-500/30 p-4 sm:p-5 shadow-xl space-y-3 text-white backdrop-blur-md">
      {/* Top Main Status Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* User Level Badge & Info */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shadow-emerald-500/25 shrink-0">
            {currentLevel.id}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {currentLevel.badge}
              </span>
              <span className="text-xs font-bold text-amber-300">
                Освоено: {learnedLettersCount} из {totalLetters} букв ({percent}%)
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-white mt-0.5 flex items-center gap-2">
              <span>{currentLevel.title}</span>
            </h2>
          </div>
        </div>

        {/* Right Action: Quick Controls & Expand Button */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Quick Adjust Letter Count Button */}
          <div className="inline-flex items-center gap-1 bg-slate-800 p-1 rounded-xl border border-slate-700">
            <span className="text-[10px] text-slate-400 font-bold px-1.5 hidden sm:inline">
              Букв:
            </span>
            <button
              onClick={() => handleSetLetterCount(Math.max(1, learnedLettersCount - 1))}
              className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-black text-sm flex items-center justify-center active:scale-95"
              title="Уменьшить пройденные буквы"
            >
              -
            </button>
            <span className="font-mono text-xs font-black text-emerald-400 px-2 min-w-[54px] text-center">
              {learnedLettersCount} / 28
            </span>
            <button
              onClick={() => handleSetLetterCount(Math.min(28, learnedLettersCount + 1))}
              className="w-7 h-7 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-black text-sm flex items-center justify-center active:scale-95"
              title="Увеличить пройденные буквы"
            >
              +
            </button>
          </div>

          {/* Toggle Level Picker */}
          <button
            onClick={() => {
              soundFx.playTap();
              setIsExpanded(!isExpanded);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center gap-1.5 transition-all active:scale-95 ${
              isExpanded
                ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-md'
                : 'bg-slate-800 text-slate-200 border-slate-700 hover:border-emerald-400'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{isExpanded ? 'Свернуть уровни' : 'Выбрать уровень (1–11)'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Progress Bar of Letters */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-[11px] text-slate-400">
          <span>Прогресс алфавита (Алифбы):</span>
          <span className="text-emerald-400 font-mono font-bold">{learnedLettersCount} / 28 букв ({percent}%)</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-amber-400 rounded-full transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Expanded Level Selector Deck */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-800 space-y-4 animate-fadeIn">
          {/* Section 1: Alphabet Knowledge Levels (1..7) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4" />
                Уровни алфавита (по числу пройденных букв):
              </span>
              <span className="text-[11px] text-slate-400">
                Задания будут генерироваться только из этих букв!
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {alphabetLevels.map((lvl) => {
                const isSelected = selectedLevelId === lvl.id;
                const isUserCurrent = learnedLettersCount >= lvl.maxLetters;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => handleSelectLevel(lvl.id)}
                    className={`p-2.5 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-600 text-white border-amber-300 shadow-lg scale-105 ring-2 ring-emerald-500/30'
                        : isUserCurrent
                        ? 'bg-slate-800/90 text-slate-200 border-emerald-500/40 hover:border-emerald-400'
                        : 'bg-slate-800/50 text-slate-400 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] font-mono font-black text-amber-300">
                        Ур. {lvl.id}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-amber-300" />}
                    </div>
                    <div className="text-xs font-black truncate">{lvl.shortTitle}</div>
                    <div className="text-[9px] text-slate-400 mt-0.5 truncate">{lvl.badge}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Words and Advanced Reading Levels (8..11) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4" />
                Уровни чтения слов и тем книги (Модули 2–4):
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {advancedLevels.map((lvl) => {
                const isSelected = selectedLevelId === lvl.id;
                return (
                  <button
                    key={lvl.id}
                    onClick={() => handleSelectLevel(lvl.id)}
                    className={`p-3 rounded-2xl border text-left transition-all active:scale-95 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-white shadow-lg scale-105'
                        : 'bg-slate-800/80 text-slate-200 border-slate-700 hover:border-amber-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className={`text-[10px] font-mono font-black ${isSelected ? 'text-slate-950' : 'text-amber-400'}`}>
                        Ур. {lvl.id}
                      </span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-slate-950 text-amber-300' : 'bg-slate-700 text-slate-300'}`}>
                        {lvl.badge}
                      </span>
                    </div>
                    <div className="text-xs font-black">{lvl.shortTitle}</div>
                    <div className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
                      {lvl.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
