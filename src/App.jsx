import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import LessonsView from './components/LessonsView';
import LessonDetail from './components/LessonDetail';
import AlphabetView from './components/AlphabetView';
import FatihaView from './components/FatihaView';
import QuizView from './components/QuizView';
import DailyWorkoutModal from './components/DailyWorkoutModal';
import { ALL_LESSONS } from './data/book';
import { storageService } from './services/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState('lessons'); // 'lessons' | 'alphabet' | 'trainer' | 'fatiha'
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [darkMode, setDarkMode] = useState(() => storageService.getTheme() === 'dark');
  const [progressPercent, setProgressPercent] = useState(0);
  const [isDailyWorkoutOpen, setIsDailyWorkoutOpen] = useState(false);

  useEffect(() => {
    const handleOpen = () => setIsDailyWorkoutOpen(true);
    window.addEventListener('muallim-open-daily-workout', handleOpen);
    return () => window.removeEventListener('muallim-open-daily-workout', handleOpen);
  }, []);

  // Sync dark mode class, color-scheme meta & mobile browser theme-color
  useEffect(() => {
    const schemeMeta = document.querySelector('meta[name="color-scheme"]');
    const themeMeta = document.querySelector('meta[name="theme-color"]');
    if (darkMode) {
      document.documentElement.classList.add('dark');
      storageService.setTheme('dark');
      if (schemeMeta) schemeMeta.setAttribute('content', 'dark');
      if (themeMeta) themeMeta.setAttribute('content', '#100F0A');
    } else {
      document.documentElement.classList.remove('dark');
      storageService.setTheme('light');
      if (schemeMeta) schemeMeta.setAttribute('content', 'light');
      if (themeMeta) themeMeta.setAttribute('content', '#F6F3EA');
    }
  }, [darkMode]);

  // Sync Arabic font scale
  useEffect(() => {
    const applyScale = (scale) => {
      document.documentElement.classList.remove('scale-arabic-115', 'scale-arabic-130', 'scale-arabic-150');
      if (scale === '115') document.documentElement.classList.add('scale-arabic-115');
      if (scale === '130') document.documentElement.classList.add('scale-arabic-130');
      if (scale === '150') document.documentElement.classList.add('scale-arabic-150');
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
    <div className="relative min-h-screen flex flex-col bg-transparent text-slate-900 dark:text-gold-50 transition-colors pb-24 md:pb-0 overflow-x-hidden">
      {/* Subtle Ambient Warm Diffusion */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-48 left-1/4 w-[560px] h-[560px] rounded-full bg-emerald-600/[0.06] dark:bg-emerald-500/[0.05] blur-3xl" />
        <div className="absolute top-1/3 -right-44 w-[480px] h-[480px] rounded-full bg-gold-400/[0.07] dark:bg-gold-400/[0.04] blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] rounded-full bg-slate-300/[0.10] dark:bg-emerald-600/[0.05] blur-3xl" />
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
        onOpenDailyWorkout={() => setIsDailyWorkoutOpen(true)}
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
                onOpenDailyWorkout={() => setIsDailyWorkoutOpen(true)}
              />
            )}
            {activeTab === 'alphabet' && <AlphabetView />}
            {activeTab === 'trainer' && <QuizView />}
            {activeTab === 'fatiha' && <FatihaView />}
          </>
        )}
      </main>

      {/* Daily Workout & Streak Modal */}
      <DailyWorkoutModal
        isOpen={isDailyWorkoutOpen}
        onClose={() => setIsDailyWorkoutOpen(false)}
      />

      {/* Manuscript Footer — тёмный изумруд с золотым орнаментом */}
      <footer className="relative z-10 mt-auto overflow-hidden bg-gradient-to-b from-emerald-900 to-emerald-950 dark:from-[#0C1712] dark:to-[#081009] text-emerald-50 py-10 shadow-apple-lg">
        <div className="absolute inset-0 hero-arabesque pointer-events-none opacity-[0.12]" aria-hidden="true" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/70 to-transparent" aria-hidden="true" />
        <div className="relative max-w-4xl mx-auto px-4 space-y-3">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-700 to-emerald-800 flex items-center justify-center text-white font-arabic text-lg font-bold shadow-apple-sm ring-1 ring-gold-300/50">
              م
            </div>
            <span className="font-brand font-bold text-sm text-white tracking-tight">
              Му'аллим Сани <span className="text-gold-grad">•</span> Платформа арабского чтения
            </span>
          </div>
          <div className="flex items-center justify-center gap-2" aria-hidden="true">
            <div className="ornament-line w-16" />
            <div className="diamond" />
            <div className="ornament-line w-16" />
          </div>
          <p className="leading-relaxed max-w-xl mx-auto pretty-copy text-emerald-100/70 text-xs">
            Классическая методика «Му'аллим Сани» Ахмадхади Максуди в современном интерактивном формате.
          </p>
          <p className="text-[11px] font-semibold text-gold-300/90">
            58 уроков • 1596 озвученных слов и слогов • Студийные MP3 • Цветовой таджвид
          </p>
        </div>
      </footer>
    </div>
  );
}
