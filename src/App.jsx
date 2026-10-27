import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LessonsView from './components/LessonsView';
import LessonDetail from './components/LessonDetail';
import AlphabetView from './components/AlphabetView';
import FatihaView from './components/FatihaView';
import QuizView from './components/QuizView';
import { ALL_LESSONS } from './data/book';
import { storageService } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'alphabet' | 'trainer' | 'fatiha'
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [darkMode, setDarkMode] = useState(() => storageService.getTheme() === 'dark');
  const [progressPercent, setProgressPercent] = useState(0);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      storageService.setTheme('dark');
    } else {
      document.documentElement.classList.remove('dark');
      storageService.setTheme('light');
    }
  }, [darkMode]);

  // Sync Arabic font scale
  useEffect(() => {
    const applyScale = (scale) => {
      document.documentElement.classList.remove('scale-arabic-115', 'scale-arabic-130');
      if (scale === '115') document.documentElement.classList.add('scale-arabic-115');
      if (scale === '130') document.documentElement.classList.add('scale-arabic-130');
    };
    applyScale(storageService.getArabicScale());

    const onScaleUpdate = (e) => {
      applyScale(e.detail.scale);
    };
    window.addEventListener('muallim-scale-updated', onScaleUpdate);
    return () => window.removeEventListener('muallim-scale-updated', onScaleUpdate);
  }, []);

  // Update progress calculation
  const updateProgress = () => {
    const progress = storageService.getProgress();
    const total = ALL_LESSONS.length;
    let done = 0;
    ALL_LESSONS.forEach(l => {
      if (progress.completedLessons[l.id]) done++;
    });
    setProgressPercent(total ? Math.round((done / total) * 100) : 0);
  };

  useEffect(() => {
    updateProgress();
  }, [selectedLesson, activeTab]);

  const handleSelectLesson = (lesson) => {
    setSelectedLesson(lesson);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToLessons = () => {
    setSelectedLesson(null);
    updateProgress();
  };

  // Find prev / next lesson
  const currentLessonIndex = selectedLesson
    ? ALL_LESSONS.findIndex(l => l.id === selectedLesson.id)
    : -1;
  const hasPrev = currentLessonIndex > 0;
  const hasNext = currentLessonIndex !== -1 && currentLessonIndex + 1 < ALL_LESSONS.length;

  const handlePrevLesson = () => {
    if (hasPrev) {
      setSelectedLesson(ALL_LESSONS[currentLessonIndex - 1]);
      updateProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextLesson = () => {
    if (hasNext) {
      setSelectedLesson(ALL_LESSONS[currentLessonIndex + 1]);
      updateProgress();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#070D1F] transition-colors pb-24 md:pb-0 overflow-x-hidden">
      {/* Subtle Ambient Background Orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-400/10 dark:bg-emerald-500/5 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[450px] h-[450px] rounded-full bg-amber-400/10 dark:bg-amber-500/5 blur-3xl" />
      </div>

      {/* Top & Mobile Bottom Navigation */}
      <Navbar
        activeTab={selectedLesson ? 'lessons' : activeTab}
        setActiveTab={(tab) => {
          setSelectedLesson(null);
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        progressPercent={progressPercent}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex-1">
        {selectedLesson ? (
          <LessonDetail
            lesson={selectedLesson}
            onBack={handleBackToLessons}
            onPrevLesson={handlePrevLesson}
            onNextLesson={handleNextLesson}
            hasPrev={hasPrev}
            hasNext={hasNext}
          />
        ) : (
          <>
            {activeTab === 'lessons' && (
              <LessonsView
                onSelectLesson={handleSelectLesson}
                onOpenArcade={() => {
                  setActiveTab('trainer');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
            {activeTab === 'alphabet' && <AlphabetView />}
            {activeTab === 'trainer' && <QuizView />}
            {activeTab === 'fatiha' && <FatihaView />}
          </>
        )}
      </main>

      {/* Modern Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-4xl mx-auto px-4 space-y-2">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-arabic text-sm font-bold">
              م
            </div>
            <span className="font-extrabold text-sm text-slate-800 dark:text-slate-200">
              Му'аллим • Интерактивная платформа арабского чтения
            </span>
          </div>
          <p className="leading-relaxed max-w-2xl mx-auto">
            Обучение построено по проверенной классической методике «Му'аллим Сани» Ахмадхади Максуди в современном интерактивном формате.
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            41 интерактивный урок • Карта приключений • 4 игровых тренажёра • Студийные MP3 • Цветовой таджвид
          </p>
        </div>
      </footer>
    </div>
  );
}
