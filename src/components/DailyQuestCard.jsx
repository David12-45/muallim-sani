import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import { soundFx } from '../services/soundFx';
import {
  Flame,
  CheckCircle2,
  Circle,
  Volume2,
  Zap,
  ArrowRight,
  Sparkles,
  Trophy,
  Calendar
} from 'lucide-react';

export default function DailyQuestCard({ onOpenWorkout }) {
  const [quest, setQuest] = useState(() => storageService.getDailyQuestStatus());

  useEffect(() => {
    const handleUpdate = () => {
      setQuest(storageService.getDailyQuestStatus());
    };
    window.addEventListener('muallim-daily-quest-completed', handleUpdate);
    window.addEventListener('muallim-daily-quest-updated', handleUpdate);
    window.addEventListener('muallim-xp-updated', handleUpdate);
    return () => {
      window.removeEventListener('muallim-daily-quest-completed', handleUpdate);
      window.removeEventListener('muallim-daily-quest-updated', handleUpdate);
      window.removeEventListener('muallim-xp-updated', handleUpdate);
    };
  }, []);

  const { isWorkoutCompleted, streak, wordsListenedToday, wordsTarget, isWordsGoalDone, weekDays } = quest;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 text-white p-5 sm:p-6 border border-emerald-500/30 shadow-xl shadow-emerald-950/20 mb-8">
      {/* Background Ambient Glow */}
      <div className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-44 h-44 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        {/* Left Col: Streak and Title */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-amber-300 border border-orange-400/40">
              <Flame className="w-4 h-4 fill-orange-500 text-orange-500 animate-pulse" />
              <span>{streak} {streak === 1 ? 'день' : streak < 5 ? 'дня' : 'дней'} ударного режима</span>
            </span>

            {isWorkoutCompleted && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>День закрыт!</span>
              </span>
            )}
          </div>

          <h3 className="text-xl sm:text-2xl font-black tracking-tight">
            Задание дня • Ежедневная практика
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
            3–5 минут регулярных повторений в день дают лучший результат в чтении Корана, чем редкие долгие уроки.
          </p>
        </div>

        {/* Right Col: Action Button / Workout Status */}
        <div className="shrink-0 w-full md:w-auto">
          {!isWorkoutCompleted ? (
            <button
              onClick={() => {
                soundFx.playTap();
                if (onOpenWorkout) onOpenWorkout();
              }}
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 hover:brightness-110 text-slate-950 font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2.5 active:scale-95 transition-all group cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-current text-slate-950 group-hover:scale-110 transition-transform" />
              <span>Начать тренировку (+50 XP)</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          ) : (
            <button
              onClick={() => {
                soundFx.playTap();
                if (onOpenWorkout) onOpenWorkout();
              }}
              className="w-full md:w-auto px-5 py-3 rounded-2xl bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200 border border-emerald-500/40 text-xs font-extrabold flex items-center justify-center gap-2 active:scale-95 transition-all"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Пройти разминку ещё раз</span>
            </button>
          )}
        </div>
      </div>

      {/* Micro-Goals Grid */}
      <div className="mt-5 pt-4 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Goal 1: 3-min Workout */}
        <div
          onClick={() => {
            if (!isWorkoutCompleted && onOpenWorkout) {
              soundFx.playTap();
              onOpenWorkout();
            }
          }}
          className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            isWorkoutCompleted
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-slate-900/80 border-slate-800 hover:border-amber-400/50 cursor-pointer text-slate-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {isWorkoutCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Circle className="w-5 h-5 text-slate-500 shrink-0" />
            )}
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">
                1. Ежедневный комплекс из 5 заданий
              </div>
              <div className="text-[11px] text-slate-400">
                {isWorkoutCompleted ? 'Завершено (+50 XP получено)' : 'Тренировка на слух, формы букв и слова'}
              </div>
            </div>
          </div>
          {!isWorkoutCompleted && (
            <span className="text-[10px] font-black px-2 py-1 rounded-lg bg-amber-400/20 text-amber-300 border border-amber-400/30 whitespace-nowrap">
              Пройти →
            </span>
          )}
        </div>

        {/* Goal 2: Listen to 5 words */}
        <div className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
          isWordsGoalDone
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : 'bg-slate-900/80 border-slate-800 text-slate-300'
        }`}>
          <div className="flex items-center gap-2.5">
            {isWordsGoalDone ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <Volume2 className="w-5 h-5 text-slate-500 shrink-0" />
            )}
            <div>
              <div className="text-xs sm:text-sm font-bold text-white">
                2. Прослушать 5 арабских слов в уроках
              </div>
              <div className="text-[11px] text-slate-400">
                Нажимайте на любые слова в уроках ({Math.min(wordsTarget, wordsListenedToday)} / {wordsTarget})
              </div>
            </div>
          </div>
          <span className={`text-xs font-mono font-black px-2 py-1 rounded-lg ${
            isWordsGoalDone
              ? 'bg-emerald-500/20 text-emerald-300'
              : 'bg-slate-800 text-slate-400'
          }`}>
            {Math.min(wordsTarget, wordsListenedToday)}/{wordsTarget}
          </span>
        </div>
      </div>

      {/* Week Day Dots Row */}
      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-emerald-400" />
          Ударная неделя:
        </span>
        <div className="flex items-center gap-1.5 sm:gap-2">
          {weekDays.map((d, i) => (
            <div
              key={i}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${
                d.isDone
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : d.isToday
                  ? 'bg-amber-400/20 text-amber-300 ring-2 ring-amber-400/50'
                  : 'bg-slate-800 text-slate-500'
              }`}
              title={`${d.dayName}: ${d.isDone ? 'Выполнено' : 'Не выполнено'}`}
            >
              {d.isDone ? '✓' : d.dayName}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
