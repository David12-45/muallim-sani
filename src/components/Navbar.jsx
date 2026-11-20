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
      {/* Top Header Bar — adapted for iPhone 11 notch & rounded corners */}
      <header className="sticky top-0 z-40 safe-top-header bg-[#F6F3EA]/90 dark:bg-[#0A120E]/90 backdrop-blur-xl border-b border-ink-200/70 dark:border-ink-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
            {/* Logo & Brand — медальон-арка с буквой م */}
            <div
              onClick={() => setActiveTab('lessons')}
              className="flex items-center gap-2.5 cursor-pointer group min-w-0 select-none"
            >
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0">
                <div className="absolute inset-0 rounded-t-full rounded-b-[10px] bg-gradient-to-b from-emerald-700 via-emerald-800 to-emerald-950 shadow-md shadow-emerald-900/30 ring-1 ring-gold-400/50" />
                <span className="absolute inset-0 flex items-center justify-center font-arabic text-xl sm:text-2xl font-bold leading-none text-gold-200">
                  م
                </span>
              </div>
              <div className="min-w-0">
                <span className="font-display font-semibold text-sm sm:text-base text-ink-900 dark:text-ink-50 tracking-tight block truncate">
                  Му'аллим Сани
                </span>
                <span className="hidden sm:block text-[10px] font-bold uppercase tracking-kicker text-gold-600 dark:text-gold-400">
                  Учись читать с нуля
                </span>
              </div>
            </div>

            {/* Desktop Navigation Tabs */}
            <nav className="hidden md:flex items-center p-1 rounded-2xl bg-ink-100/80 dark:bg-ink-900/80 border border-ink-200/80 dark:border-ink-800">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 whitespace-nowrap active:scale-95 ${
                      isActive
                        ? 'bg-emerald-800 text-white shadow-sm shadow-emerald-900/30'
                        : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-gold-300' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Right Controls: Only essential Theme Toggle & Settings (KISS / Occam's Razor) */}
            <div className="flex items-center gap-2 shrink-0 relative">
              {xpPop && (
                <span className="absolute -bottom-8 right-12 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-xs font-black shadow-md animate-bounce pointer-events-none">
                  {xpPop}
                </span>
              )}

              {/* Dark / Light Mode Toggle — full pill with clear icon & text */}
              <button
                onClick={() => setDarkMode(!darkMode)}
                aria-label="Переключить тему"
                className="h-10 px-3 rounded-xl bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200 border border-ink-200/90 dark:border-ink-700 hover:border-gold-500 flex items-center justify-center gap-1.5 text-xs font-extrabold transition active:scale-95 shrink-0"
                title={darkMode ? 'Переключить на светлую тему' : 'Переключить на тёмную тему'}
              >
                {darkMode ? (
                  <>
                    <Sun className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>Светлая</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4 text-slate-700 shrink-0" />
                    <span>Тёмная</span>
                  </>
                )}
              </button>

              {/* Settings Button */}
              <button
                onClick={() => setIsSettingsOpen(true)}
                aria-label="Настройки шрифта"
                className="w-10 h-10 rounded-xl bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-200 border border-ink-200/90 dark:border-ink-700 hover:border-gold-500 flex items-center justify-center transition active:scale-95 shrink-0"
                title="Размер шрифта и настройки"
              >
                <Settings className="w-4 h-4" />
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

      {/* Mobile Bottom Navigation (< md) */}
      <nav className="md:hidden fixed safe-bottom-dock left-3 right-3 z-50 max-w-md mx-auto glass-dock rounded-2xl shadow-xl border border-ink-200/90 dark:border-ink-800 p-1.5">
        <div className="grid grid-cols-4 gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all active:scale-95 ${
                  isActive
                    ? 'bg-emerald-800 text-white shadow-sm font-black'
                    : 'text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white font-bold'
                }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-gold-300' : ''}`} />
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
