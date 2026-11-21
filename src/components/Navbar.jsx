import React, { useState, useEffect } from 'react';
import SettingsModal from './SettingsModal';
import {
  Gamepad2,
  Moon,
  Sun,
  Sparkles,
  LayoutGrid,
  BookOpen,
  Settings
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, darkMode, setDarkMode }) {
  const [xpPop, setXpPop] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    const refresh = (e) => {
      if (e?.detail?.added) {
        setXpPop(`+${e.detail.added} XP`);
        setTimeout(() => setXpPop(null), 1300);
      }
    };
    window.addEventListener('muallim-xp-updated', refresh);
    return () => window.removeEventListener('muallim-xp-updated', refresh);
  }, []);

  const navItems = [
    { id: 'lessons', label: 'Уроки', shortLabel: 'Уроки', icon: BookOpen },
    { id: 'alphabet', label: 'Алфавит', shortLabel: 'Алфавит', icon: LayoutGrid },
    { id: 'trainer', label: 'Игры', shortLabel: 'Игры', icon: Gamepad2 },
    { id: 'fatiha', label: 'Сура Аль-Фатиха', shortLabel: 'Фатиха', icon: Sparkles }
  ];

  return (
    <>
      {/* Top Manuscript Header Bar — safe-area aware for iPhone 11 notch */}
      <header className="sticky top-0 z-40 safe-top-header glass-header transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[3.75rem] sm:min-h-[4rem] py-2 gap-3">
            {/* Brand Emblem & Title */}
            <button
              type="button"
              onClick={() => setActiveTab('lessons')}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0 select-none text-left focus-visible:outline-2 focus-visible:outline-emerald-600 rounded-xl"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500 border-b-[3px] border-emerald-700 flex items-center justify-center text-white shadow-apple-xs shrink-0 transition-transform group-hover:scale-105 relative">
                <span className="font-arabic text-xl sm:text-2xl font-bold leading-none">م</span>
                <span className="absolute inset-0 rounded-xl ring-1 ring-inset ring-white/25 pointer-events-none" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <span className="font-brand font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight block truncate leading-tight">
                  Му'аллим Сани
                </span>
                <span className="hidden lg:block text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-tight">
                  Арабское чтение и Коран онлайн
                </span>
              </div>
            </button>

            {/* Desktop Segmented Navigation */}
            <nav
              aria-label="Основная навигация"
              className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/70"
            >
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-300 border border-emerald-200/90 dark:border-emerald-500/30 shadow-apple-xs'
                        : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Theme Toggle & Settings */}
            <div className="flex items-center gap-2 shrink-0 relative">
              {xpPop && (
                <span className="absolute -bottom-8 right-12 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-bold shadow-apple-md pointer-events-none animate-fadeIn border border-emerald-400/40">
                  {xpPop}
                </span>
              )}

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
                className="h-9 px-3 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 border-2 border-slate-200/90 dark:border-slate-700 border-b-[3px] border-b-slate-300 dark:border-b-slate-950 hover:border-emerald-400 dark:hover:border-emerald-500/60 flex items-center justify-center gap-1.5 text-xs font-bold transition-all active:border-b-2 active:translate-y-[1px] shrink-0 cursor-pointer"
                title={darkMode ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
              >
                {darkMode ? (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Светлая</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" aria-hidden="true" />
                    <span className="hidden sm:inline">Тёмная</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Настройки шрифта"
                className="h-9 w-9 p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 border-2 border-slate-200/90 dark:border-slate-700 border-b-[3px] border-b-slate-300 dark:border-b-slate-950 hover:border-emerald-400 dark:hover:border-emerald-500/60 flex items-center justify-center transition-all active:border-b-2 active:translate-y-[1px] shrink-0 cursor-pointer"
                title="Размер шрифта и настройки"
              >
                <Settings className="w-4 h-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
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

      {/* Floating Mobile Bottom Dock (< md) — High-Contrast Tactile Duolingo Style */}
      <nav
        aria-label="Мобильная навигация"
        className="md:hidden fixed safe-bottom-dock left-3 right-3 z-50 max-w-md mx-auto glass-dock rounded-2xl p-1.5 border border-slate-200/90 dark:border-slate-800 shadow-apple-lg"
      >
        <div className="grid grid-cols-4 gap-1.5">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all active:scale-95 cursor-pointer border-2 ${
                  isActive
                    ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold border-emerald-200/90 dark:border-emerald-500/40 border-b-[3px] border-b-emerald-300 dark:border-b-emerald-600/70 shadow-apple-xs'
                    : 'bg-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-semibold border-transparent'
                }`}
              >
                <Icon
                  className={`w-[18px] h-[18px] mb-0.5 transition-transform ${
                    isActive
                      ? 'text-emerald-600 dark:text-emerald-400 scale-105'
                      : 'text-slate-500 dark:text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="text-[11px] leading-tight tracking-tight">
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
