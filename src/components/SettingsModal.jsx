import React, { useState, useRef } from 'react';
import {
  X,
  Settings,
  Volume2,
  VolumeX,
  Type,
  Download,
  Upload,
  Trophy,
  Star,
  Flame,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { storageService } from '../services/storage';
import { soundFx } from '../services/soundFx';

export default function SettingsModal({ onClose, darkMode, setDarkMode }) {
  const [sfxEnabled, setSfxEnabled] = useState(() => soundFx.isEnabled());
  const [arabicScale, setArabicScale] = useState(() => storageService.getArabicScale());
  const [exportNotice, setExportNotice] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // { success: boolean, msg: string }
  const fileInputRef = useRef(null);

  const rankInfo = storageService.getPlayerRankInfo();
  const progress = storageService.getProgress();

  const handleToggleSfx = () => {
    const next = !sfxEnabled;
    setSfxEnabled(next);
    soundFx.setEnabled(next);
    if (next) soundFx.playSuccess();
  };

  const handleScaleChange = (scale) => {
    setArabicScale(scale);
    storageService.setArabicScale(scale);
    soundFx.playTap();
  };

  const handleExport = () => {
    soundFx.playTap();
    const jsonStr = storageService.exportProgress();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `muallim-sani-progress-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        const ok = storageService.importProgress(content);
        if (ok) {
          soundFx.playSuccess();
          setImportStatus({ success: true, msg: 'Прогресс успешно восстановлен!' });
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          soundFx.playError();
          setImportStatus({ success: false, msg: 'Ошибка: неверный формат файла' });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                Настройки и профиль
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Управление шрифтом, звуком и сохранением
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Profile Overview Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-100 dark:from-emerald-950/40 dark:via-slate-800 dark:to-slate-900 border border-emerald-500/20">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{rankInfo.currentRank.icon}</span>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                  {rankInfo.currentRank.title}
                </h4>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                  Уровень {rankInfo.currentRank.level}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70">
                <div className="flex items-center justify-center gap-1 text-orange-500 text-xs font-bold">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>Ударный</span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {rankInfo.streak} дн.
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70">
                <div className="flex items-center justify-center gap-1 text-amber-500 text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>Звёзды</span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {rankInfo.totalStars}
                </div>
              </div>

              <div className="p-2 rounded-xl bg-white/70 dark:bg-slate-800/70">
                <div className="flex items-center justify-center gap-1 text-emerald-600 text-xs font-bold">
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Опыт</span>
                </div>
                <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">
                  {rankInfo.xp} XP
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Arabic Font Size */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1.5 mb-2.5">
              <Type className="w-4 h-4 text-emerald-600" />
              <span>Размер арабского текста</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '100', label: 'Обычный', sample: 'text-2xl', sub: '100%' },
                { id: '115', label: 'Крупный', sample: 'text-3xl', sub: '115%' },
                { id: '130', label: 'Максимум', sample: 'text-4xl', sub: '130%' }
              ].map(opt => (
                <button
                  key={opt.id}
                  onClick={() => handleScaleChange(opt.id)}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center transition-all ${
                    arabicScale === opt.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-extrabold ring-2 ring-emerald-500/20'
                      : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-400'
                  }`}
                >
                  <span className={`font-arabic font-bold ${opt.sample} leading-none mb-1`}>بَ</span>
                  <span className="text-xs font-bold">{opt.label}</span>
                  <span className="text-[10px] opacity-75">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Sound & Theme Controls */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              Звуки и тема
            </label>

            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 flex items-center justify-center">
                  {sfxEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Звуковые эффекты в играх
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Сигналы успеха, ошибок и победные фанфары
                  </div>
                </div>
              </div>

              <button
                onClick={handleToggleSfx}
                className={`w-12 h-6 rounded-full transition-colors relative p-0.5 ${
                  sfxEnabled ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform shadow-sm ${
                    sfxEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Section 3: Backup & Restore */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
              Резервная копия прогресса
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Сохраните прогресс в файл, чтобы перенести его на другой телефон или восстановить после очистки браузера.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleExport}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center justify-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 active:scale-95 transition-all"
              >
                <Download className="w-4 h-4 text-emerald-600" />
                <span>Скачать прогресс</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-500 flex items-center justify-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 active:scale-95 transition-all"
              >
                <Upload className="w-4 h-4 text-emerald-600" />
                <span>Восстановить</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            {exportNotice && (
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Файл резервной копии сохранён!</span>
              </div>
            )}

            {importStatus && (
              <div
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 animate-fadeIn ${
                  importStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200'
                    : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-200'
                }`}
              >
                {importStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertTriangle className="w-4 h-4 text-rose-600" />}
                <span>{importStatus.msg}</span>
              </div>
            )}
          </div>
          {/* Section 4: About Methodology */}
          <div className="p-3.5 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 space-y-1.5 text-xs text-amber-950 dark:text-amber-200">
            <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
              <BookOpen className="w-4 h-4" />
              <span>О методике обучения</span>
            </div>
            <p className="leading-relaxed opacity-90">
              Платформа основана на проверенной методике классического пособия <strong>«Му'аллим Сани»</strong> (Второй учитель) Ахмадхади Максуди. Методика выстроена по принципу от простого к сложному — от отдельных букв и огласовок до правил таджвида и беглого чтения Корана.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
