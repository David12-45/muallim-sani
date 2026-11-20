import React, { useState, useEffect } from 'react';
import { storageService } from '../services/storage';
import SettingsModal from './SettingsModal';
import {
  Gamepad2,
  Moon,
  Sun,
  Sparkles,
  LayoutGrid,
  Map,
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
    { id: 'lessons', label: 'Уроки', shortLabel: 'Уроки', icon: Map },
    { id: 'alphabet', label: 'Алфавит', shortLabel: 'Алфавит', icon: LayoutGrid },
    { id: 'trainer', label: 'Игры', shortLabel: 'Игры', icon: Gamepad2 },
    { id: 'fatiha', label: 'Сура Аль-Фатиха', shortLabel: 'Фатиха', icon: Sparkles }
  ];

  return (
    <>
      {/* Верхняя панель */}
      <header className="sticky top-0 z-40 safe-top-header bg-[#F5F7F6]/85 dark:bg-[#0B1110]/85 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-3">
            {/* Логотип */}
            <button
              type="button"
              onClick={() => setActiveTab('lessons')}
              className="flex items-center gap-2.5 min-w-0 select-none cursor-pointer"
              aria-label="На главную"
            >
              <div className="w-9 h-9 rounded-xl bg-emerald-800 flex items-center justify-center text-amber-300 shrink-0">
                <span className="font-arabic text-2xl font-bold leading-none pb-0.5">م</span>
              </div>
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight truncate">
                Му'аллим Сани
              </span>
            </button>

            {/* Навигация на компьютере: подчёркивание активного раздела */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`relative px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                      isActive
                        ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-600/10 dark:bg-emerald-400/10'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Тема и настройки */}
            <div className="flex items-center gap-1.5 shrink-0 relative">
              {xpPop && (
                <span className="absolute -bottom-8 right-12 px-2.5 py-0.5 rounded-full bg-emerald-700 text-white text-xs font-bold shadow-md animate-bounce pointer-events-none">
                  {xpPop}
                </span>
              )}

              <button
                onClick={() => setDarkMode(!darkMode)}
                aria-label={darkMode ? 'Включить светлую тему' : 'Включить тёмную тему'}
                title={darkMode ? 'Светлая тема' : 'Тёмная тема'}
                className="w-10 h-10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                {darkMode ? <Sun className="w-[18px] h-[18px] text-amber-400" /> : <Moon className="w-[18px] h-[18px]" />}
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Настройки"
                title="Размер шрифта и настройки"
                className="w-10 h-10 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 flex items-center justify-center transition-colors cursor-pointer"
              >
                <Settings className="w-[18px] h-[18px]" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Настройки */}
      {isSettingsOpen && (
        <SettingsModal
          onClose={() => setIsSettingsOpen(false)}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      {/* Нижняя навигация на телефоне */}
      <nav className="md:hidden fixed safe-bottom-dock left-3 right-3 z-50 max-w-md mx-auto glass-dock rounded-2xl shadow-lg shadow-slate-900/10 border border-slate-200/80 dark:border-slate-800 p-1">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-emerald-800 text-white font-semibold'
                    : 'text-slate-500 dark:text-slate-400 font-medium'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-amber-300' : ''}`} />
                <span className="text-[11px] leading-tight">{item.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
