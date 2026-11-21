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
      {/* Top Frosted Header Bar — safe-area aware for iPhone 11 notch */}
      <header className="sticky top-0 z-40 safe-top-header glass-header transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between min-h-[3.75rem] sm:min-h-[4.25rem] py-2 gap-3">
            {/* Brand Emblem & Title */}
            <button
              type="button"
              onClick={() => setActiveTab('lessons')}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0 select-none text-left focus-visible:outline-2 focus-visible:outline-emerald-600 rounded-xl"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl squircle bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 ring-1 ring-amber-300/40 shrink-0 transition-transform group-hover:scale-105">
                <span className="font-arabic text-xl sm:text-2xl font-bold leading-none">م</span>
              </div>
              <div className="min-w-0">
                <span className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight block truncate leading-tight">
                  Му'аллим Сани
                </span>
                <span className="hidden lg:block text-[11px] font-semibold text-emerald-700/80 dark:text-emerald-400/80 leading-tight">
                  Чтение Корана с нуля
                </span>
              </div>
            </button>

            {/* Desktop Segmented Navigation */}
            <nav
              aria-label="Основная навигация"
              className="hidden md:flex items-center p-1 rounded-2xl bg-stone-200/65 dark:bg-slate-900/90 border border-stone-300/60 dark:border-slate-800 shadow-inner"
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
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'bg-white dark:bg-slate-800 text-emerald-800 dark:text-emerald-300 shadow-sm ring-1 ring-slate-900/5 dark:ring-white/10'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-600 dark:text-amber-300' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Theme Toggle & Settings */}
            <div className="flex items-center gap-2 shrink-0 relative">
              {xpPop && (
                <span className="absolute -bottom-8 right-12 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black shadow-md pointer-events-none">
                  {xpPop}
                </span>
              )}

              <button
                type="button"
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
                className="min-h-10 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-100 border border-stone-200/90 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs flex items-center justify-center gap-1.5 text-xs font-extrabold transition active:scale-95 shrink-0 cursor-pointer"
                title={darkMode ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
                    <span>Светлая</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-emerald-700 shrink-0" aria-hidden="true" />
                    <span>Тёмная</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Настройки шрифта"
                className="min-h-10 min-w-10 p-2.5 rounded-xl bg-white/90 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-stone-200/90 dark:border-slate-700 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-xs flex items-center justify-center transition active:scale-95 shrink-0 cursor-pointer"
                title="Размер шрифта и настройки"
              >
                <Settings className="w-4 h-4" aria-hidden="true" />
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

      {/* Floating Mobile Bottom Dock (< md) */}
      <nav
        aria-label="Мобильная навигация"
        className="md:hidden fixed safe-bottom-dock left-3 right-3 z-50 max-w-md mx-auto glass-dock rounded-2xl p-1.5"
      >
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all active:scale-95 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-b from-emerald-600 to-emerald-700 text-white shadow-md shadow-emerald-900/20 font-black'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-bold'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-300' : ''}`} aria-hidden="true" />
                <span className="text-[11px] leading-tight">
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
