import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import SettingsModal from './SettingsModal';
import {
  Gamepad2,
  Moon,
  Sun,
  Sparkles,
  LayoutGrid,
  Flame,
  Star,
  Zap,
  Map,
  Settings
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, darkMode, setDarkMode, onOpenDailyWorkout }) {
  const [rankInfo, setRankInfo] = useState(() => storageService.getPlayerRankInfo());
  const [xpPop, setXpPop] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const refresh = (e) => {
      setRankInfo(storageService.getPlayerRankInfo());
      if (e?.detail?.added) {
        setXpPop(`+${e.detail.added} XP`);
        setTimeout(() => setXpPop(null), 1300);
      }
    };
    window.addEventListener('muallim-xp-updated', refresh);
    return () => window.removeEventListener('muallim-xp-updated', refresh);
  }, []);

  useEffect(() => {
    setRankInfo(storageService.getPlayerRankInfo());
  }, [activeTab]);

  const navItems = [
    { id: 'lessons', label: 'Уроки', shortLabel: 'Уроки', icon: Map },
    { id: 'alphabet', label: 'Алфавит', shortLabel: 'Алфавит', icon: LayoutGrid },
    { id: 'trainer', label: 'Игры', shortLabel: 'Игры', icon: Gamepad2 },
    { id: 'fatiha', label: 'Сура Аль-Фатиха', shortLabel: 'Фатиха', icon: Sparkles }
  ];

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#070D1F]/85 backdrop-blur-2xl border-b border-slate-200/70 dark:border-slate-800/80 transition-colors">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo & Brand */}
            <div
              onClick={() => setActiveTab('lessons')}
              className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0 select-none"
            >
              <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-emerald-700 via-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/25 ring-2 ring-amber-400/30 group-hover:scale-105 transition-all shrink-0">
                <span className="font-arabic text-xl sm:text-2xl font-bold leading-none drop-shadow-xs">م</span>
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-white dark:ring-[#070D1F]" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                    Му'аллим
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-emerald-500/15 to-teal-500/15 dark:from-emerald-500/20 dark:to-teal-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/25 shrink-0">
                    Ур. {rankInfo.currentRank.level} {rankInfo.currentRank.icon}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                  Обучение арабскому чтению
                </p>
              </div>
            </div>

            {/* Desktop Navigation Tabs (Segmented Control) */}
            <nav className="hidden md:flex items-center p-1.5 rounded-2xl bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 shadow-inner">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md shadow-emerald-600/25'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-300' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Game Stats & Controls Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 relative">
              {/* Unified Stats Pill for desktop */}
              <div
                className="hidden sm:flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs font-extrabold shadow-xs"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (onOpenDailyWorkout) onOpenDailyWorkout();
                    else window.dispatchEvent(new CustomEvent('muallim-open-daily-workout'));
                  }}
                  className="flex items-center gap-1 text-orange-500 hover:text-orange-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Задание дня и ударный режим"
                >
                  <Flame className="w-4 h-4 fill-current animate-pulse" />
                  <span>{rankInfo.streak}</span>
                </button>
                <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-1 text-amber-500 hover:text-amber-600 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Всего звёзд"
                >
                  <Star className="w-4 h-4 fill-current" />
                  <span>{rankInfo.totalStars}</span>
                </button>
                <span className="w-px h-3.5 bg-slate-200 dark:bg-slate-700" />
                <button
                  type="button"
                  onClick={() => setIsSettingsOpen(true)}
                  className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                  title="Ваш ранг и опыт (XP)"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>{rankInfo.xp} XP</span>
                </button>
              </div>

              {/* Mobile compact streak pill (keeps header uncluttered on iPhone 11) */}
              <button
                type="button"
                onClick={() => {
                  if (onOpenDailyWorkout) onOpenDailyWorkout();
                  else window.dispatchEvent(new CustomEvent('muallim-open-daily-workout'));
                }}
                className="flex sm:hidden items-center gap-1 text-xs font-black px-2.5 py-2 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-800/60 shadow-xs active:scale-95 shrink-0"
                title="Задание дня и ударный режим"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>{rankInfo.streak}</span>
              </button>

              {/* Floating +XP Animation */}
              {xpPop && (
                <span className="absolute -bottom-8 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-xs font-black shadow-lg shadow-emerald-500/30 animate-bounce pointer-events-none">
                  {xpPop}
                </span>
              )}

              {/* Dark Mode Toggle */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Переключить тему"
                className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100/90 dark:bg-slate-900 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 transition active:scale-90 shrink-0"
                title={darkMode ? 'Светлая тема' : 'Тёмная тема'}
              >
                {darkMode ? <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Moon className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>

              {/* Settings & Profile Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Настройки и профиль"
                className="p-2 sm:p-2.5 rounded-xl sm:rounded-2xl bg-slate-100/90 dark:bg-slate-900 text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-slate-100 border border-slate-200/80 dark:border-slate-800 hover:border-emerald-400 transition active:scale-90 shrink-0"
                title="Настройки шрифта и профиль"
              >
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Settings Modal */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      {/* Mobile Floating Bottom Dock Navigation (< md) */}
      <nav className="md:hidden fixed bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 right-3 z-50 max-w-md mx-auto glass-dock rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 p-1.5">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-2xl transition-all active:scale-95 ${
                  isActive
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-md shadow-emerald-600/25 font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-300' : ''}`} />
                <span className="text-[10px] leading-tight tracking-tight">
                  {item.shortLabel}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
